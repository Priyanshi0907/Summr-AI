from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SummrAI"
    DEBUG: bool = False
    API_VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/summrai"

    # Auth (Clerk)
    CLERK_SECRET_KEY: str = ""
    CLERK_PUBLISHABLE_KEY: str = ""
    CLERK_JWKS_URL: str = ""

    # LLM APIs
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # HuggingFace
    HF_MODEL_BART: str = "facebook/bart-large-cnn"
    HF_MODEL_DISTILBART: str = "sshleifer/distilbart-cnn-12-6"
    HF_MODEL_T5: str = "t5-base"
    HF_CACHE_DIR: str = "./models_cache"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_BUCKET: str = "summrai-uploads"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 20
    MAX_TEXT_LENGTH: int = 50000

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://summr-ai-delta.vercel.app",
    ]
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
