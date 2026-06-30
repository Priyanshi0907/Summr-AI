from fastapi import APIRouter
router = APIRouter()

@router.get("")
async def get_analytics():
    return {
        "total_summaries": 0,
        "total_words": 0,
        "avg_compression": None,
        "time_saved_minutes": 0,
        "summaries_by_day": [],
        "content_type_breakdown": []
    }
