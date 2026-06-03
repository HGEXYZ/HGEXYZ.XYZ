import pytest
from app.services.backtest.service import BacktestService

@pytest.mark.asyncio
async def test_backtest_drawdown():
    service = BacktestService()
    equity = [{"equity": 10000}, {"equity": 11000}, {"equity": 10500}, {"equity": 9500}, {"equity": 10200}]
    dd = service._calculate_max_drawdown(equity)
    assert dd > 0
    assert dd < 100
