from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.database import get_db
from app.models.summary import Summary
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("")
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(Summary).order_by(Summary.created_at.desc()).offset(offset).limit(limit)
    )
    items = result.scalars().all()
    return {
        "items": [
            {
                "id": s.id,
                "title": s.title,
                "preview": (s.summary_short or "")[:200],
                "content_type": s.content_type,
                "word_count": s.word_count,
                "compression": s.compression,
                "created_at": str(s.created_at),
                "is_favorite": s.is_favorite,
            }
            for s in items
        ],
        "page": page,
        "limit": limit,
    }


@router.delete("/{summary_id}")
async def delete_summary(summary_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Summary).where(Summary.id == summary_id))
    return {"deleted": True}


@router.patch("/{summary_id}/favorite")
async def toggle_favorite(summary_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Summary).where(Summary.id == summary_id))
    summary = result.scalar_one_or_none()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    summary.is_favorite = not summary.is_favorite
    return {"is_favorite": summary.is_favorite}
