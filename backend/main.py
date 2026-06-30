from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.api.routes import summarize, history, auth, export, analytics, models, upload, reply
from app.core.database import create_tables

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting SummrAI API...")
    pass  # await create_tables()
    yield
    logger.info("Shutting down SummrAI API...")


app = FastAPI(
    title="SummrAI API",
    description="AI-powered email and article summarization API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(summarize.router, prefix="/summarize", tags=["summarize"])
app.include_router(history.router, prefix="/history", tags=["history"])
app.include_router(export.router, prefix="/export", tags=["export"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(models.router, prefix="/models", tags=["models"])
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(reply.router, prefix="/reply", tags=["reply"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "SummrAI API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
