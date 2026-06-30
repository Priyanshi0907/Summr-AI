import httpx
import logging
from fastapi import Request, HTTPException
from jose import jwt, JWTError

from app.core.config import settings

logger = logging.getLogger(__name__)

_jwks_cache: dict | None = None


async def get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    async with httpx.AsyncClient() as client:
        res = await client.get(settings.CLERK_JWKS_URL)
        _jwks_cache = res.json()
    return _jwks_cache


async def verify_clerk_token(request: Request) -> dict | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1]
    try:
        jwks = await get_jwks()
        header = jwt.get_unverified_header(token)
        key = next((k for k in jwks["keys"] if k["kid"] == header["kid"]), None)
        if not key:
            return None
        payload = jwt.decode(token, key, algorithms=["RS256"])
        return payload
    except (JWTError, Exception) as e:
        logger.warning(f"Token verification failed: {e}")
        return None


async def get_optional_user(request: Request) -> dict | None:
    return await verify_clerk_token(request)


async def get_required_user(request: Request) -> dict:
    user = await verify_clerk_token(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user
