"""
API integration tests for SummrAI.
Run with: pytest tests/ -v
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_health_check():
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_root():
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["service"] == "SummrAI API"


@pytest.mark.asyncio
async def test_models_list():
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/models")
    assert res.status_code == 200
    data = res.json()
    assert "models" in data
    assert len(data["models"]) >= 3


@pytest.mark.asyncio
async def test_summarize_valid_text():
    from main import app
    mock_output = {
        "summary": "Test summary output.",
        "bullets": ["Point 1", "Point 2"],
        "wordCount": 50,
        "readingTime": 1,
        "compression": "60%",
        "difficulty": "intermediate",
    }

    with patch("app.api.routes.summarize.summarize_text", new_callable=AsyncMock, return_value=type('obj', (object,), mock_output)()):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post("/summarize", json={
                "text": "This is a test article about artificial intelligence and its applications in modern society.",
                "length": "short",
                "options": ["bullets"],
                "model": "bart",
            })
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_summarize_text_too_short():
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/summarize", json={
            "text": "Hi",
            "length": "short",
            "options": [],
        })
    assert res.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_reply_endpoint():
    from main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/reply", json={
            "text": "Dear John, I am writing to inform you about the upcoming meeting scheduled for next Monday at 10 AM. Please confirm your attendance.",
            "tone": "professional",
        })
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert "keyPoints" in data
    assert "urgency" in data
