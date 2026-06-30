import re
import logging
import json
from typing import Any
from app.services.llm_service import generate_with_llm

logger = logging.getLogger(__name__)


def _split_sentences(text: str) -> list:
    return [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 20]


async def repurpose_content(text: str, fmt: str) -> Any:
    """Transform text into requested content format using LLM or extraction heuristics."""
    try:
        # Construct dynamic prompt based on requested format
        llm_prompt = f"""You are an expert Content Creator.
Please repurpose the following text into the '{fmt}' format.

ORIGINAL TEXT:
\"\"\"
{text}
\"\"\"

FORMAT INSTRUCTIONS:
"""
        if fmt == "tweet":
            llm_prompt += """
Generate a 5-tweet thread summarizing the text accurately. Each tweet should be engaging, coherent, and fit within the character limit.
You must respond with a JSON object matching this schema:
{
  "tweets": ["Tweet 1 text", "Tweet 2 text", "Tweet 3 text", "Tweet 4 text", "Tweet 5 text"],
  "hashtags": ["hashtag1", "hashtag2"]
}
"""
        elif fmt == "linkedin":
            llm_prompt += """
Generate an engaging, professional LinkedIn post summarizing the key takeaways of the text, with bullets and call-to-actions.
You must respond with a JSON object matching this schema:
{
  "post": "LinkedIn post content text with formatting",
  "hashtags": ["hashtag1", "hashtag2"]
}
"""
        elif fmt == "tldr":
            llm_prompt += """
Generate a concise TL;DR (Too Long; Didn't Read) summary of the text (2-3 sentences max).
You must respond with a JSON object matching this schema:
{
  "tldr": "TL;DR summary text"
}
"""
        elif fmt == "executive":
            llm_prompt += """
Generate an executive summary of the text along with 3-4 professional recommendations.
You must respond with a JSON object matching this schema:
{
  "summary": "Executive summary text (1-2 paragraphs)",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}
"""
        elif fmt == "blog":
            llm_prompt += """
Repurpose the text into a detailed blog post outline with an engaging title and 3-5 sections (each section having a heading and 2-3 key points).
You must respond with a JSON object matching this schema:
{
  "title": "Blog post title",
  "sections": [
    {
      "heading": "Section Heading",
      "points": ["Key point 1", "Key point 2"]
    }
  ]
}
"""
        elif fmt == "meeting":
            llm_prompt += """
Repurpose the text into structured meeting notes, extracting key decisions, action items, and next steps.
You must respond with a JSON object matching this schema:
{
  "title": "Meeting Notes",
  "decisions": ["Decision 1", "Decision 2"],
  "actionItems": ["Action item 1", "Action item 2"],
  "nextSteps": ["Next step 1", "Next step 2"]
}
"""
        
        llm_prompt += "\nRespond ONLY with this raw JSON object. Do not include markdown formatting codeblocks."

        llm_response = await generate_with_llm(llm_prompt, json_mode=True)
        if llm_response is not None:
            try:
                cleaned_response = llm_response.strip()
                if cleaned_response.startswith("```"):
                    cleaned_response = re.sub(r"^```(?:json)?\n", "", cleaned_response)
                    cleaned_response = re.sub(r"\n```$", "", cleaned_response)
                    cleaned_response = cleaned_response.strip()
                return json.loads(cleaned_response)
            except Exception as e:
                logger.error(f"Failed to parse LLM repurpose response: {e}. Falling back to default heuristics. Response was: {llm_response}")
    except Exception as e:
        logger.error(f"Error in LLM repurpose content: {e}")

    # Fallback to heuristics
    sentences = _split_sentences(text)
    words = text.split()

    if fmt == "tweet":
        key = sentences[:5] if len(sentences) >= 5 else (sentences + [sentences[-1]] * (5 - len(sentences)))
        tweets = [
            f"1/ {key[0]}" if key else "1/ Key insight from this content",
            f"2/ {key[1]}" if len(key) > 1 else "2/ More details inside...",
            f"3/ {key[2]}" if len(key) > 2 else "3/ The implications are significant.",
            f"4/ {key[3]}" if len(key) > 3 else "4/ What this means for you:",
            f"5/ {key[4]} 🧵" if len(key) > 4 else "5/ Follow for more insights 🧵",
        ]
        return {"tweets": tweets, "hashtags": ["AI", "Productivity", "Summary"]}

    elif fmt == "linkedin":
        opening = sentences[0] if sentences else "Key insights from this content."
        body = ". ".join(sentences[1:4]) if len(sentences) > 1 else "There are several important takeaways here."
        post = f"💡 {opening}\n\n{body}\n\nHere's what stood out to me:\n\n• {sentences[2] if len(sentences) > 2 else 'Important insight 1'}\n• {sentences[3] if len(sentences) > 3 else 'Important insight 2'}\n• {sentences[4] if len(sentences) > 4 else 'Important insight 3'}\n\nWhat are your thoughts on this? Drop a comment below 👇"
        return {"post": post, "hashtags": ["Innovation", "Insights", "Leadership"]}

    elif fmt == "tldr":
        tldr = ". ".join(sentences[:2]) + "." if sentences else text[:200]
        return {"tldr": tldr}

    elif fmt == "executive":
        summary = ". ".join(sentences[:4]) + "." if sentences else text[:400]
        recs = [
            f"Consider the implications of: {sentences[2][:80]}" if len(sentences) > 2 else "Review the full document for context",
            "Engage relevant stakeholders on the key points raised",
            "Establish a follow-up timeline to address action items",
        ]
        return {"summary": summary, "recommendations": recs}

    elif fmt == "blog":
        title = sentences[0][:80] if sentences else "Key Insights and Analysis"
        sections = []
        chunks = [sentences[i:i+3] for i in range(0, min(len(sentences), 15), 3)]
        section_titles = ["Introduction", "Key Findings", "Deep Dive", "Implications", "Conclusion"]
        for i, chunk in enumerate(chunks[:5]):
            sections.append({
                "heading": section_titles[i] if i < len(section_titles) else f"Section {i+1}",
                "points": [s[:120] for s in chunk[:2]]
            })
        return {"title": title, "sections": sections}

    elif fmt == "meeting":
        action_items = re.findall(r'[-•*]\s+(.+)', text)[:4]
        decisions = [s[:100] for s in sentences[:3] if len(s) > 30]
        next_steps = [
            "Review and distribute meeting notes",
            "Follow up on identified action items",
            "Schedule next check-in",
        ]
        return {
            "title": "Meeting Notes",
            "decisions": decisions,
            "actionItems": action_items or ["Review the key points", "Assign owners to tasks"],
            "nextSteps": next_steps
        }

    raise ValueError(f"Unknown format: {fmt}")
