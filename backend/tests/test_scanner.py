import pytest
from app.services.scanner.service import ScannerService

@pytest.mark.asyncio
async def test_scanner_rsi_calculation():
    import pandas as pd
    import numpy as np
    service = ScannerService()
    prices = pd.Series(np.random.randn(100) + 100)
    rsi = service.compute_rsi(prices)
    assert 0 <= rsi <= 100
