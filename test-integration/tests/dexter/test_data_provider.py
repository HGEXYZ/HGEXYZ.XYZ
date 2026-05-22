"""Tests for MarketDataProvider implementations."""
import pytest
from src.data.market_data import MockDataProvider, YahooFinanceDataProvider, create_data_provider, BASE_PRICES


class TestMockDataProvider:
    def test_fetch_ohlcv_returns_correct_length(self):
        provider = MockDataProvider()
        closes, highs, lows = provider.fetch_ohlcv("XAUUSD", lookback=50)
        assert len(closes) == 50
        assert len(highs) == 50
        assert len(lows) == 50

    def test_fetch_ohlcv_highs_above_closes(self):
        provider = MockDataProvider()
        closes, highs, lows = provider.fetch_ohlcv("BTCUSD", lookback=20)
        for i in range(len(closes)):
            assert highs[i] >= closes[i]
            assert lows[i] <= closes[i]

    def test_current_price_returns_positive(self):
        provider = MockDataProvider()
        price = provider.current_price("EURUSD")
        assert price > 0

    def test_unknown_symbol_fallback(self):
        provider = MockDataProvider()
        closes, _, _ = provider.fetch_ohlcv("UNKNOWN", lookback=10)
        assert len(closes) == 10


class TestYahooFinanceProvider:
    def test_yahoo_fallback_on_bad_symbol(self):
        provider = YahooFinanceDataProvider()
        closes, highs, lows = provider.fetch_ohlcv("NONEXISTENT", lookback=10)
        assert len(closes) == 10  # falls back to mock

    def test_yahoo_current_price_fallback(self):
        provider = YahooFinanceDataProvider()
        price = provider.current_price("FAKE_SYM")
        assert isinstance(price, float)
        assert price > 0


class TestProviderFactory:
    def test_create_mock_provider_default(self):
        provider = create_data_provider()
        from src.data.market_data import MockDataProvider
        assert isinstance(provider, MockDataProvider)
