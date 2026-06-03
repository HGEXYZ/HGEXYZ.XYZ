import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import get_session
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.db.base import Base

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_register_validation(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={"email": "invalid", "password": "short", "name": ""})
    assert response.status_code == 422
