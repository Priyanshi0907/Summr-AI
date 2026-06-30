from sqlalchemy import Column, String, Integer, Float, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    clerk_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=True)
    plan = Column(String, default="free")  # free | pro | team
    summaries_this_month = Column(Integer, default=0)
    total_summaries = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    summaries = relationship("Summary", back_populates="user", cascade="all, delete-orphan")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=True)
    original_text = Column(Text, nullable=False)
    summary_short = Column(Text, nullable=True)
    summary_medium = Column(Text, nullable=True)
    summary_detailed = Column(Text, nullable=True)
    bullets = Column(JSON, nullable=True)
    takeaways = Column(JSON, nullable=True)
    actions = Column(JSON, nullable=True)
    names = Column(JSON, nullable=True)
    dates = Column(JSON, nullable=True)
    sentiment = Column(String, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    sentiment_note = Column(Text, nullable=True)
    reading_time = Column(Integer, nullable=True)
    word_count = Column(Integer, nullable=True)
    compression = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    content_type = Column(String, default="text")  # text | email | article | pdf
    model_used = Column(String, nullable=True)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="summaries")
