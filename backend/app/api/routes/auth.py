from fastapi import APIRouter, HTTPException
router = APIRouter()

@router.get("/me")
async def me():
    return {"status": "authenticated"}
