import re
import logging
import json
from app.schemas.schemas import EmailAnalysis
from app.services.llm_service import generate_with_llm

logger = logging.getLogger(__name__)


def _detect_urgency(text: str) -> str:
    high_words = {"urgent", "asap", "immediately", "critical", "emergency", "deadline", "required", "action required"}
    medium_words = {"soon", "please", "when possible", "follow up", "update", "review"}
    lower = text.lower()
    if any(w in lower for w in high_words):
        return "high"
    if any(w in lower for w in medium_words):
        return "medium"
    return "low"


def _extract_sender(text: str) -> str | None:
    patterns = [
        r"from:\s*(.+?)(?:\n|<)",
        r"regards,?\s*\n(.+?)$",
        r"sincerely,?\s*\n(.+?)$",
        r"best,?\s*\n(.+?)$",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE | re.MULTILINE)
        if m:
            return m.group(1).strip()
    return None


def _extract_greeting(text: str) -> str | None:
    lines = text.strip().split("\n")
    for line in lines[:5]:
        line = line.strip()
        if re.match(r"^(hi|hello|dear|hey|good morning|good afternoon)", line, re.IGNORECASE):
            return line
    return None


def _extract_conclusion(text: str) -> str | None:
    lines = [l.strip() for l in text.strip().split("\n") if l.strip()]
    for line in reversed(lines[-6:]):
        if re.match(r"^(best|regards|sincerely|thanks|thank you|warm regards|cheers|yours)", line, re.IGNORECASE):
            return line
    return None


def _extract_action_items(text: str) -> list:
    items = []
    patterns = [
        r'[-•*]\s+(.{10,100})',
        r'\d+\.\s+(.{10,100})',
        r'(?:please|action:|todo:)\s+(.{10,100})',
    ]
    for p in patterns:
        matches = re.findall(p, text, re.IGNORECASE)
        items.extend(m.strip() for m in matches)
    return list(dict.fromkeys(items))[:5]


def _generate_reply(text: str, tone: str, key_points: list) -> str:
    """Generate a simple rule-based reply template."""
    greeting_map = {
        "professional": "Thank you for reaching out.",
        "casual": "Hey, thanks for the message!",
        "followup": "Following up on your previous email —",
    }
    closing_map = {
        "professional": "Please let me know if you need any additional information.\n\nBest regards,",
        "casual": "Let me know what you think!\n\nCheers,",
        "followup": "Looking forward to your response.\n\nBest,",
    }
    points_text = ""
    if key_points:
        points_text = f" I've reviewed your message and noted the key points: {'; '.join(key_points[:2])}."
    return f"{greeting_map.get(tone, 'Thank you for your email.')}{points_text} I'll review this and get back to you shortly. {closing_map.get(tone, 'Best regards,')}"


async def analyze_email(text: str, tone: str) -> EmailAnalysis:
    """Analyze email structure and generate a contextual reply."""
    try:
        # Attempt LLM generation first
        llm_prompt = f"""You are an AI Email Assistant.
Please analyze the following email text and extract structured metadata and generate a contextual response.

EMAIL TEXT:
\"\"\"
{text}
\"\"\"

REQUESTED REPLY TONE: {tone} (professional, casual, or followup)

INSTRUCTIONS:
1. Extract the greeting (e.g. "Dear John", "Hi all") if present.
2. Extract the closing conclusion (e.g. "Best regards, Alice") if present.
3. Extract the sender's name if identified.
4. Determine the urgency (must be one of: 'low', 'medium', 'high').
5. Identify all action items or tasks requested in the email as a list.
6. Extract 3-4 key points discussed in the email.
7. Write a summary of the email body (2-3 sentences).
8. Write a contextual reply to the email matching the requested tone '{tone}'.

You must respond with a JSON object matching this schema:
{{
  "greeting": "greeting or null",
  "body": "short body summary",
  "conclusion": "closing conclusion or null",
  "sender": "sender name or null",
  "keyPoints": ["point 1", "point 2"],
  "actionItems": ["action 1", "action 2"],
  "urgency": "low/medium/high",
  "reply": "contextual reply body text"
}}
Respond ONLY with this raw JSON object. Do not include markdown formatting codeblocks.
"""

        llm_response = await generate_with_llm(llm_prompt, json_mode=True)
        if llm_response is not None:
            try:
                cleaned_response = llm_response.strip()
                if cleaned_response.startswith("```"):
                    cleaned_response = re.sub(r"^```(?:json)?\n", "", cleaned_response)
                    cleaned_response = re.sub(r"\n```$", "", cleaned_response)
                    cleaned_response = cleaned_response.strip()
                data = json.loads(cleaned_response)
                return EmailAnalysis(
                    greeting=data.get("greeting"),
                    body=data.get("body") or "",
                    conclusion=data.get("conclusion"),
                    sender=data.get("sender"),
                    keyPoints=data.get("keyPoints") or [],
                    actionItems=data.get("actionItems") or [],
                    urgency=data.get("urgency") or "low",
                    reply=data.get("reply") or ""
                )
            except Exception as e:
                logger.error(f"Failed to parse LLM email response: {e}. Falling back to default heuristics. Response was: {llm_response}")

        # Fallback to heuristics
        lines = [l for l in text.split("\n") if l.strip()]
        body_text = " ".join(lines)

        greeting = _extract_greeting(text)
        conclusion = _extract_conclusion(text)
        sender = _extract_sender(text)
        urgency = _detect_urgency(text)
        action_items = _extract_action_items(text)

        sentences = [s.strip() for s in re.split(r'[.!?]', body_text) if len(s.strip()) > 30]
        key_points = sentences[:4]
        body = " ".join(sentences[:2]) if sentences else body_text[:200]
        reply = _generate_reply(text, tone, key_points)

        return EmailAnalysis(
            greeting=greeting,
            body=body,
            conclusion=conclusion,
            sender=sender,
            keyPoints=key_points,
            actionItems=action_items,
            urgency=urgency,
            reply=reply,
        )
    except Exception as e:
        logger.error(f"Email analysis error: {e}")
        raise
