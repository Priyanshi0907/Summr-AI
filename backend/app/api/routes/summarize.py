from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.schemas import SummarizeRequest, SummaryOutput, RepurposeRequest
from app.services.ai_service import summarize_text
from app.services.repurpose_service import repurpose_content
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=SummaryOutput)
async def summarize(
    request: SummarizeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Summarize text using selected AI model."""
    try:
        result = await summarize_text(request)
        return result
    except Exception as e:
        logger.error(f"Summarize error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/repurpose")
async def repurpose(
    request: RepurposeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Transform text into different content formats."""
    try:
        result = await repurpose_content(request.text, request.format.value)
        return result
    except Exception as e:
        logger.error(f"Repurpose error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
