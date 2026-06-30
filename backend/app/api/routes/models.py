from fastapi import APIRouter
router = APIRouter()

@router.get("")
async def list_models():
    return {
        "models": [
            {"id": "bart", "name": "BART Large CNN", "description": "Best for news and articles", "speed": "medium"},
            {"id": "distilbart", "name": "DistilBART", "description": "Faster, lighter BART variant", "speed": "fast"},
            {"id": "t5", "name": "T5 Base", "description": "Versatile text-to-text model", "speed": "fast"},
        ]
    }
