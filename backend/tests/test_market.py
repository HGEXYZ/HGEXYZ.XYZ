import pytest
from app.services.market.service import MarketService

@pytest.mark.asyncio
async def test_market_service_init():
    service = MarketService()
    assert service.forex_pairs is not None
    assert len(service.forex_pairs) > 0

@pytest.mark.asyncio
async def test_market_search():
    service = MarketService()
    results = await service.search("EUR")
    assert len(results) > 0
    assert any("EUR" in r["symbol"] for r in results)
