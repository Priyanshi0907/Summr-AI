import re
import math
from typing import Optional


def word_count(text: str) -> int:
    return len(text.split())


def reading_time_minutes(text: str, wpm: int = 200) -> int:
    return max(1, math.ceil(word_count(text) / wpm))


def compression_ratio(original: str, summary: str) -> float:
    orig_wc = word_count(original)
    summ_wc = word_count(summary)
    if orig_wc == 0:
        return 0.0
    return max(0.0, 1 - summ_wc / orig_wc)


def compression_percent(original: str, summary: str) -> str:
    ratio = compression_ratio(original, summary)
    return f"{round(ratio * 100)}%"


def truncate_text(text: str, max_words: int = 800) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words])


def extract_sentences(text: str, min_length: int = 20) -> list[str]:
    return [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) >= min_length]


def sanitize_input(text: str) -> str:
    """Basic sanitization — strip null bytes, excessive whitespace."""
    text = text.replace('\x00', '')
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    text = re.sub(r' {3,}', ' ', text)
    return text.strip()


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')[:80]
