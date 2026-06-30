from fastapi import APIRouter, HTTPException
from app.schemas.schemas import ReplyRequest, EmailAnalysis
from app.services.email_service import analyze_email
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=EmailAnalysis)
async def reply(request: ReplyRequest):
    """Analyze email and generate a reply."""
    try:
        return await analyze_email(request.text, request.tone.value)
    except Exception as e:
        logger.error(f"Reply error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
