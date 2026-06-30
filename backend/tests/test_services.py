"""
Unit tests for SummrAI backend services.
Run with: pytest tests/ -v
"""
import pytest
from unittest.mock import patch, AsyncMock
from app.utils.text_utils import (
    word_count, reading_time_minutes, compression_percent,
    sanitize_input, extract_sentences
)
from app.utils.export_utils import export_as_txt, export_as_markdown


# ── Text utilities ────────────────────────────────────────────

def test_word_count_basic():
    assert word_count("Hello world") == 2

def test_word_count_empty():
    assert word_count("") == 0

def test_word_count_multiple_spaces():
    assert word_count("hello   world") == 2

def test_reading_time_short():
    text = " ".join(["word"] * 100)
    assert reading_time_minutes(text) == 1

def test_reading_time_long():
    text = " ".join(["word"] * 400)
    assert reading_time_minutes(text) == 2

def test_compression_percent():
    original = " ".join(["word"] * 100)
    summary = " ".join(["word"] * 20)
    result = compression_percent(original, summary)
    assert result == "80%"

def test_sanitize_removes_null_bytes():
    assert sanitize_input("hello\x00world") == "helloworld"

def test_sanitize_collapses_whitespace():
    result = sanitize_input("hello    world")
    assert "   " not in result

def test_extract_sentences():
    text = "This is the first sentence. This is the second. And a third one here."
    sentences = extract_sentences(text)
    assert len(sentences) >= 2
    assert all(len(s) >= 20 for s in sentences)


# ── Export utilities ──────────────────────────────────────────

def test_export_txt_contains_summary():
    data = {"summary": "This is a test summary.", "bullets": ["Point A", "Point B"]}
    output = export_as_txt(data).decode("utf-8")
    assert "This is a test summary." in output
    assert "Point A" in output

def test_export_txt_contains_metadata():
    data = {"summary": "Summary text.", "wordCount": 250, "compression": "74%"}
    output = export_as_txt(data).decode("utf-8")
    assert "250" in output
    assert "74%" in output

def test_export_markdown_has_headers():
    data = {"summary": "The summary.", "bullets": ["Bullet 1"], "title": "Test Doc"}
    output = export_as_markdown(data).decode("utf-8")
    assert "# Test Doc" in output
    assert "## Summary" in output
    assert "## Key Points" in output
    assert "- Bullet 1" in output

def test_export_markdown_action_items():
    data = {"summary": "Summary.", "actions": ["Do this", "Do that"]}
    output = export_as_markdown(data).decode("utf-8")
    assert "## Action Items" in output
    assert "- [ ] Do this" in output


# ── AI Service (mocked) ───────────────────────────────────────

@pytest.mark.asyncio
async def test_summarize_returns_output():
    from app.schemas.schemas import SummarizeRequest, SummaryLength, ModelChoice
    from app.services.ai_service import summarize_text

    req = SummarizeRequest(
        text="Artificial intelligence is transforming industries worldwide. Machine learning models can now perform tasks that previously required human expertise. This technological shift has significant economic and social implications.",
        length=SummaryLength.short,
        options=[],
        model=ModelChoice.bart,
    )

    with patch("app.services.ai_service._hf_summarize", return_value="AI is transforming industries with machine learning."):
        result = await summarize_text(req)

    assert result.summary is not None
    assert result.wordCount is not None
    assert result.wordCount > 0
    assert result.readingTime is not None

@pytest.mark.asyncio
async def test_summarize_extracts_bullets():
    from app.schemas.schemas import SummarizeRequest, SummaryLength, ModelChoice, SummaryOption
    from app.services.ai_service import summarize_text

    req = SummarizeRequest(
        text="The quick brown fox jumps over the lazy dog. This is an important sentence. Another key point is made here. One more critical detail follows. The final observation concludes the text.",
        length=SummaryLength.short,
        options=[SummaryOption.bullets],
        model=ModelChoice.bart,
    )

    with patch("app.services.ai_service._hf_summarize", return_value="The fox jumps over the dog."):
        result = await summarize_text(req)

    assert result.bullets is not None
    assert isinstance(result.bullets, list)

@pytest.mark.asyncio
async def test_summarize_sentiment():
    from app.schemas.schemas import SummarizeRequest, SummaryLength, ModelChoice, SummaryOption
    from app.services.ai_service import summarize_text

    req = SummarizeRequest(
        text="This is an excellent achievement! The results are amazing and the team did a great job. Success was inevitable given the strong foundation.",
        length=SummaryLength.short,
        options=[SummaryOption.sentiment],
        model=ModelChoice.bart,
    )

    with patch("app.services.ai_service._hf_summarize", return_value="Excellent results achieved."):
        result = await summarize_text(req)

    assert result.sentiment in ("positive", "negative", "neutral")
    assert result.sentimentNote is not None
