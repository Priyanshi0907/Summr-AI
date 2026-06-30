"""
AI Summarization Service
Supports: BART Large CNN, DistilBART, T5, and fallback pipeline
"""
import re
import math
import logging
import json
from typing import Optional, List
from functools import lru_cache

from app.core.config import settings
from app.schemas.schemas import SummarizeRequest, SummaryOutput, SummaryOption
from app.services.llm_service import generate_with_llm

logger = logging.getLogger(__name__)

# Lazy-loaded model registry
_models: dict = {}


def _get_model(model_name: str):
    """Lazy-load and cache HuggingFace models."""
    if model_name not in _models:
        try:
            from transformers import pipeline
            logger.info(f"Loading model: {model_name}")

            model_map = {
                "bart": settings.HF_MODEL_BART,
                "distilbart": settings.HF_MODEL_DISTILBART,
                "t5": settings.HF_MODEL_T5,
            }
            hf_model = model_map.get(model_name, settings.HF_MODEL_BART)

            if model_name == "t5":
                _models[model_name] = pipeline(
                    "text2text-generation",
                    model=hf_model,
                    cache_dir=settings.HF_CACHE_DIR,
                )
            else:
                _models[model_name] = pipeline(
                    "summarization",
                    model=hf_model,
                    cache_dir=settings.HF_CACHE_DIR,
                )
            logger.info(f"Model {model_name} loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            raise RuntimeError(f"Model {model_name} could not be loaded: {e}")
    return _models[model_name]


def _word_count(text: str) -> int:
    return len(text.split())


def _reading_time(words: int) -> int:
    """Average adult reads ~200 wpm."""
    return max(1, math.ceil(words / 200))


def _estimate_difficulty(text: str) -> str:
    words = text.split()
    avg_word_len = sum(len(w) for w in words) / max(len(words), 1)
    sentences = re.split(r'[.!?]+', text)
    avg_sent_len = len(words) / max(len([s for s in sentences if s.strip()]), 1)
    score = avg_word_len * 0.4 + avg_sent_len * 0.06
    if score < 5:
        return "beginner"
    elif score < 8:
        return "intermediate"
    return "advanced"


def _chunk_text(text: str, max_tokens: int = 1024) -> List[str]:
    """Split long text into chunks for models with token limits."""
    words = text.split()
    chunks, chunk = [], []
    for word in words:
        chunk.append(word)
        if len(chunk) >= max_tokens:
            chunks.append(" ".join(chunk))
            chunk = []
    if chunk:
        chunks.append(" ".join(chunk))
    return chunks


def _hf_summarize(text: str, model_name: str, max_length: int, min_length: int) -> str:
    """Run HuggingFace summarization pipeline with chunking for long texts."""
    pipe = _get_model(model_name)
    chunks = _chunk_text(text, max_tokens=800)

    summaries = []
    for chunk in chunks[:4]:  # Cap at 4 chunks to prevent timeouts
        try:
            if model_name == "t5":
                result = pipe(f"summarize: {chunk}", max_length=max_length, min_length=min_length, do_sample=False)
                summaries.append(result[0]["generated_text"])
            else:
                result = pipe(chunk, max_length=max_length, min_length=min_length, do_sample=False)
                summaries.append(result[0]["summary_text"])
        except Exception as e:
            logger.warning(f"Chunk summarization failed: {e}")

    return " ".join(summaries) if summaries else text[:500]


def _extract_bullets(text: str) -> List[str]:
    """Extract key points from text using simple heuristics."""
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 30]
    # Score sentences by position and length
    scored = [(i, s, len(s)) for i, s in enumerate(sentences)]
    scored.sort(key=lambda x: -x[2])
    top = sorted(scored[:5], key=lambda x: x[0])
    return [s[1] for s in top]


def _simple_sentiment(text: str) -> tuple:
    """Rule-based sentiment detection as fallback."""
    positive_words = {"excellent", "great", "amazing", "good", "success", "improve", "benefit", "opportunity", "innovative", "positive"}
    negative_words = {"problem", "issue", "fail", "concern", "risk", "crisis", "bad", "poor", "decline", "threat", "loss"}
    lower = text.lower()
    pos = sum(1 for w in positive_words if w in lower)
    neg = sum(1 for w in negative_words if w in lower)
    if pos > neg + 2:
        return "positive", "The text has an overall positive tone."
    elif neg > pos + 2:
        return "negative", "The text expresses concerns or negative sentiment."
    return "neutral", "The text maintains a balanced, neutral tone."


async def summarize_text(request: SummarizeRequest) -> SummaryOutput:
    """Main summarization entry point."""
    text = request.text
    wc = _word_count(text)
    rt = _reading_time(wc)
    difficulty = _estimate_difficulty(text)
    model = request.model.value if hasattr(request.model, 'value') else str(request.model)
    opts = set(o.value if hasattr(o, 'value') else o for o in request.options)

    # Attempt LLM generation first if key is configured
    length_str = request.length.value if hasattr(request.length, 'value') else str(request.length)
    
    # Construct instructions dynamically based on active options
    instructions = [
        f"1. Generate a summary of length '{length_str}' (short: 2-3 sentences, medium: 1-2 paragraphs, detailed: 3-4 paragraphs)."
    ]
    if "bullets" in opts:
        instructions.append("2. Extract 3-5 key bullet points of the main ideas.")
    if "takeaways" in opts:
        instructions.append("3. Extract 3-5 high-level key takeaways.")
    if "actions" in opts:
        instructions.append("4. Extract any action items or tasks from the text.")
    if "names" in opts:
        instructions.append("5. Extract key names of people or organizations and key dates or deadlines mentioned in the text.")
    if "sentiment" in opts:
        instructions.append("6. Analyze the tone and sentiment (must be one of: 'positive', 'negative', 'neutral') and provide a short note explaining why.")
    if "questions" in opts:
        instructions.append("7. Generate 3-5 student-friendly questions (including a mix of Quiz questions, Interview Questions, Flashcard-style Qs, MCQs, or FAQs) with brief answers.")
    if "mindmap" in opts:
        instructions.append("8. Generate a hierarchal text-based mind map of the topic using standard tree lines (e.g. ├──, └──) starting from a root topic name.")
    if "tldr" in opts:
        instructions.append("9. Generate a one-sentence TLDR of the text, ideally in 20 words or less.")
    if "concepts" in opts:
        instructions.append("10. Identify 2-4 complex, specialized, or technical terms from the text (e.g., 'Transformer', 'Regression', etc.) and provide a simple, layman-friendly explanation for each.")
    if "highlights" in opts:
        instructions.append("11. Select 3-6 key sentences directly from the text and categorize them by importance: 'high' (Very Important), 'medium' (Moderately Important), or 'low' (Less Important).")

    instructions_str = "\n".join(instructions)

    llm_prompt = f"""You are an expert AI summarizing assistant.
Please analyze the following text and generate an accurate, coherent summary and extract metadata as requested.

TEXT TO SUMMARIZE:
\"\"\"
{text}
\"\"\"

INSTRUCTIONS:
{instructions_str}

You must respond with a JSON object matching this schema:
{{
  "summary": "The generated summary text",
  "bullets": ["bullet 1", "bullet 2"] or null,
  "takeaways": ["takeaway 1", "takeaway 2"] or null,
  "actions": ["action 1", "action 2"] or null,
  "names": ["name 1", "name 2"] or null,
  "dates": ["date 1", "date 2"] or null,
  "sentiment": "positive/negative/neutral" or null,
  "sentimentNote": "short note explaining sentiment" or null,
  "questions": ["Q1: Question? A1: Answer", "Q2: Question? A2: Answer"] or null,
  "mindmap": "Root\\n├── Topic A\\n│   └── Subtopic\\n└── Topic B" or null,
  "tldr": "One sentence TLDR" or null,
  "concepts": [{{"word": "term", "explanation": "definition"}}] or null,
  "highlights": [{{"text": "sentence from text", "importance": "high/medium/low"}}] or null
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
            summary = data.get("summary") or ""
            summary_wc = _word_count(summary)
            comp_pct = max(0, round((1 - summary_wc / max(wc, 1)) * 100))
            
            return SummaryOutput(
                summary=summary,
                wordCount=wc,
                readingTime=rt,
                summaryTime=max(1, math.ceil(summary_wc / 200)),
                compression=f"{comp_pct}%",
                difficulty=difficulty,
                bullets=data.get("bullets") if "bullets" in opts else None,
                takeaways=data.get("takeaways") if "takeaways" in opts else None,
                actions=data.get("actions") if "actions" in opts else None,
                names=data.get("names") if "names" in opts else None,
                dates=data.get("dates") if "names" in opts else None,
                sentiment=data.get("sentiment") if "sentiment" in opts else None,
                sentimentNote=data.get("sentimentNote") if "sentiment" in opts else None,
                questions=data.get("questions") if "questions" in opts else None,
                mindmap=data.get("mindmap") if "mindmap" in opts else None,
                tldr=data.get("tldr") if "tldr" in opts else None,
                concepts=data.get("concepts") if "concepts" in opts else None,
                highlights=data.get("highlights") if "highlights" in opts else None
            )
        except Exception as e:
            logger.error(f"Failed to parse LLM response: {e}. Falling back to default heuristics. Response was: {llm_response}")

    # Length config
    length_config = {
        "short": {"max_length": 80, "min_length": 30},
        "medium": {"max_length": 180, "min_length": 80},
        "detailed": {"max_length": 350, "min_length": 150},
    }
    cfg = length_config.get(request.length.value if hasattr(request.length, 'value') else request.length, length_config["short"])

    # Generate summary
    try:
        if model in ("bart", "distilbart", "t5"):
            summary = _hf_summarize(text, model, cfg["max_length"], cfg["min_length"])
        else:
            # Fallback: extract first N sentences
            sentences = re.split(r'(?<=[.!?])\s+', text)
            n = {"short": 3, "medium": 6, "detailed": 10}.get(request.length, 3)
            summary = " ".join(sentences[:n])
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        sentences = re.split(r'(?<=[.!?])\s+', text)
        summary = " ".join(sentences[:3])

    # Compression
    summary_wc = _word_count(summary)
    comp_pct = max(0, round((1 - summary_wc / max(wc, 1)) * 100))

    result = SummaryOutput(
        summary=summary,
        wordCount=wc,
        readingTime=rt,
        summaryTime=max(1, math.ceil(summary_wc / 200)),
        compression=f"{comp_pct}%",
        difficulty=difficulty,
    )

    if "bullets" in opts:
        result.bullets = _extract_bullets(summary or text)[:5]

    if "takeaways" in opts:
        sentences = [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 40]
        result.takeaways = sentences[:4] if sentences else []

    if "actions" in opts:
        action_patterns = [r'\b(please|must|should|need to|action required|follow up|send|review|confirm|schedule|complete|submit)\b.*?[.!]']
        actions = []
        for pattern in action_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            actions.extend(matches[:3])
        list_items = re.findall(r'[-•*]\s+(.+)', text)
        result.actions = (actions + list_items)[:5]

    if "names" in opts:
        names = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b', text)
        orgs = re.findall(r'\b[A-Z]{2,}\b', text)
        unique_names = list(dict.fromkeys(names + [o for o in orgs if len(o) > 1]))[:8]
        dates = re.findall(r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', text)
        result.names = unique_names
        result.dates = dates[:5]

    if "sentiment" in opts:
        sentiment, note = _simple_sentiment(text)
        result.sentiment = sentiment
        result.sentimentNote = note

    if "questions" in opts:
        ref_pts = result.bullets or [summary]
        result.questions = [
            f"Q1: What is the primary focus of this text? A1: The core focus is on: {ref_pts[0][:80]}." if ref_pts else "Q1: What is the primary focus? A1: Reviewing the detailed specifications.",
            "Q2: What is a key takeaway from the analysis? A2: A central point is the necessity to review and act on the main details.",
            "Q3: Who or what does this document affect? A3: It directly impacts the operations, deliverables, and schedules outlined."
        ]

    if "mindmap" in opts:
        lines = [f"{result.difficulty or 'Topic'} Overview", "├── Summary Line"]
        lines.append(f"│   └── {summary[:60]}...")
        if result.bullets:
            lines.append("└── Key Concepts")
            for b in result.bullets[:3]:
                lines.append(f"    ├── {b[:50]}...")
        result.mindmap = "\n".join(lines)

    if "tldr" in opts:
        sentences = re.split(r'[.!?]', summary or text)
        first_sentence = sentences[0].strip() if sentences else "Document overview."
        words = first_sentence.split()
        result.tldr = " ".join(words[:20]) + ("..." if len(words) > 20 else "")

    if "concepts" in opts:
        found_terms = []
        glossary = {
            "eda": "Exploratory Data Analysis - analyzing datasets to summarize their main characteristics.",
            "jupyter": "An open-source web application that allows you to create and share documents containing live code.",
            "transformer": "A deep learning model architecture that adopts the mechanism of self-attention.",
            "plotly": "An interactive, open-source plotting library for Python.",
            "nav": "Net Asset Value - the value of an entity's assets minus the value of its liabilities.",
            "aum": "Assets Under Management - the total market value of the investments that a person or entity manages.",
            "crm": "Customer Relationship Management - technology for managing all your company's relationships.",
            "salesforce": "A cloud-based software company that provides customer relationship management services.",
            "budget": "An estimation of revenue and expenses over a specified future period of time."
        }
        for term, explanation in glossary.items():
            if re.search(r'\b' + term + r'\b', text.lower()):
                found_terms.append({"word": term.upper(), "explanation": explanation})
        if not found_terms:
            found_terms = [
                {"word": "Deliverables", "explanation": "The products or outputs that must be completed and delivered for a project."},
                {"word": "Analysis", "explanation": "Detailed examination of the elements or structure of something."}
            ]
        result.concepts = found_terms[:3]

    if "highlights" in opts:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 10]
        highlights = []
        for i, s in enumerate(sentences[:4]):
            importance = "high" if i == 0 else "medium" if i <= 2 else "low"
            highlights.append({"text": s, "importance": importance})
        result.highlights = highlights

    return result
