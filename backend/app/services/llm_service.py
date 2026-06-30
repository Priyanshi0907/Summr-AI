import httpx
import logging
import json
from app.core.config import settings

logger = logging.getLogger(__name__)

async def call_gemini(prompt: str, api_key: str, json_mode: bool = False) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    if json_mode:
        payload["generationConfig"] = {
            "responseMimeType": "application/json"
        }
        
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload, timeout=60.0)
        response.raise_for_status()
        data = response.json()
        
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to parse Gemini API response: {data}. Error: {e}")
            raise ValueError("Invalid response structure from Gemini API")

async def call_openai(prompt: str, api_key: str, json_mode: bool = False) -> str:
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
    }
    
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
        
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload, timeout=60.0)
        response.raise_for_status()
        data = response.json()
        
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to parse OpenAI API response: {data}. Error: {e}")
            raise ValueError("Invalid response structure from OpenAI API")

async def generate_with_llm(prompt: str, json_mode: bool = False) -> str | None:
    """
    Generate content using Gemini or OpenAI based on available keys.
    Returns None if no keys are configured, signaling fallback to heuristics.
    """
    try:
        if settings.GEMINI_API_KEY:
            logger.info("Using Gemini API for LLM generation.")
            return await call_gemini(prompt, settings.GEMINI_API_KEY, json_mode)
            
        if settings.OPENAI_API_KEY:
            logger.info("Using OpenAI API for LLM generation.")
            return await call_openai(prompt, settings.OPENAI_API_KEY, json_mode)
            
        logger.warning("No LLM API keys configured (GEMINI_API_KEY or OPENAI_API_KEY). Using fallback local heuristics.")
        return None
    except Exception as e:
        logger.error(f"LLM API call failed: {e}. Falling back to heuristics.")
        return None
