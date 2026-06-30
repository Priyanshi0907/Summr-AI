from pydantic import BaseModel, Field, validator
from typing import Optional, List
from enum import Enum


class SummaryLength(str, Enum):
    short = "short"
    medium = "medium"
    detailed = "detailed"


class SummaryOption(str, Enum):
    bullets = "bullets"
    takeaways = "takeaways"
    actions = "actions"
    names = "names"
    sentiment = "sentiment"
    questions = "questions"
    mindmap = "mindmap"
    tldr = "tldr"
    concepts = "concepts"
    highlights = "highlights"


class ModelChoice(str, Enum):
    bart = "bart"
    distilbart = "distilbart"
    t5 = "t5"
    claude = "claude"


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=50000)
    length: SummaryLength = SummaryLength.short
    options: List[SummaryOption] = []
    model: ModelChoice = ModelChoice.bart
    content_type: str = "text"

    @validator("text")
    def text_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Text cannot be empty")
        return v.strip()


class SummaryOutput(BaseModel):
    summary: Optional[str] = None
    bullets: Optional[List[str]] = None
    takeaways: Optional[List[str]] = None
    actions: Optional[List[str]] = None
    names: Optional[List[str]] = None
    dates: Optional[List[str]] = None
    sentiment: Optional[str] = None
    sentimentNote: Optional[str] = None
    readingTime: Optional[int] = None
    summaryTime: Optional[int] = None
    wordCount: Optional[int] = None
    compression: Optional[str] = None
    difficulty: Optional[str] = None
    questions: Optional[List[str]] = None
    mindmap: Optional[str] = None
    tldr: Optional[str] = None
    concepts: Optional[List[dict]] = None
    highlights: Optional[List[dict]] = None


class RepurposeFormat(str, Enum):
    tweet = "tweet"
    linkedin = "linkedin"
    tldr = "tldr"
    executive = "executive"
    blog = "blog"
    meeting = "meeting"


class RepurposeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=50000)
    format: RepurposeFormat


class ReplyTone(str, Enum):
    professional = "professional"
    casual = "casual"
    followup = "followup"


class ReplyRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=20000)
    tone: ReplyTone = ReplyTone.professional


class EmailAnalysis(BaseModel):
    greeting: Optional[str] = None
    body: Optional[str] = None
    conclusion: Optional[str] = None
    sender: Optional[str] = None
    keyPoints: List[str] = []
    actionItems: List[str] = []
    urgency: str = "medium"
    reply: Optional[str] = None


class HistoryItem(BaseModel):
    id: str
    title: Optional[str]
    preview: Optional[str]
    content_type: str
    word_count: Optional[int]
    compression: Optional[str]
    created_at: str
    is_favorite: bool

    class Config:
        from_attributes = True


class AnalyticsResponse(BaseModel):
    total_summaries: int
    total_words: int
    avg_compression: Optional[float]
    time_saved_minutes: int
    summaries_by_day: List[dict]
    content_type_breakdown: List[dict]
