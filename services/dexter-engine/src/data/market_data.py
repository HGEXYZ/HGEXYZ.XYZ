from __future__ import annotations
import os
import random
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


YAHOO_SYMBOL_MAP = {
    "XAUUSD": "GC=F",
    "BTCUSD": "BTC-USD",
    "ETHUSD": "ETH-USD",
    "NASDAQ": "^IXIC",
    "DXY": "DX-Y.NYB",
    "CRUDE": "CL=F",
    "EURUSD": "EURUSD=X",
    "GBPUSD": "GBPUSD=X",
}

BASE_PRICES = {
    "XAUUSD": 2350.0, "BTCUSD": 67250.0, "ETHUSD": 3520.0,
    "NASDAQ": 18542.0, "DXY": 104.5, "CRUDE": 78.4,
    "EURUSD": 1.085, "GBPUSD": 1.265,
}


class MarketDataProvider(ABC):
    @abstractmethod
    def fetch_ohlcv(self, symbol: str, lookback: int = 100) -> tuple[list[float], list[float], list[float]]:
        ...

    @abstractmethod
    def current_price(self, symbol: str) -> float:
        ...


class MockDataProvider(MarketDataProvider):
    def fetch_ohlcv(self, symbol: str, lookback: int = 100) -> tuple[list[float], list[float], list[float]]:
        base = BASE_PRICES.get(symbol, 100.0)
        closes: list[float] = []
        highs: list[float] = []
        lows: list[float] = []
        price = base
        for _ in range(lookback):
            change = (random.random() - 0.5) * base * 0.02
            price += change
            closes.append(price)
            highs.append(price * (1 + random.random() * 0.01))
            lows.append(price * (1 - random.random() * 0.01))
        return closes, highs, lows

    def current_price(self, symbol: str) -> float:
        closes, _, _ = self.fetch_ohlcv(symbol, lookback=5)
        return closes[-1]


class YahooFinanceDataProvider(MarketDataProvider):
    def __init__(self):
        self._cache: dict[str, tuple[list[float], list[float], list[float]]] = {}

    def fetch_ohlcv(self, symbol: str, lookback: int = 100) -> tuple[list[float], list[float], list[float]]:
        yahoo_sym = YAHOO_SYMBOL_MAP.get(symbol)
        if not yahoo_sym:
            logger.warning("No Yahoo Finance mapping for %s, falling back to mock", symbol)
            return MockDataProvider().fetch_ohlcv(symbol, lookback)
        try:
            import yfinance as yf
            ticker = yf.Ticker(yahoo_sym)
            df = ticker.history(period=f"{lookback}d")
            if df.empty or len(df) < 2:
                logger.warning("Yahoo returned empty data for %s (%s), falling back to mock", symbol, yahoo_sym)
                return MockDataProvider().fetch_ohlcv(symbol, lookback)
            closes = df["Close"].tolist()[-lookback:]
            highs = df["High"].tolist()[-lookback:]
            lows = df["Low"].tolist()[-lookback:]
            result = (closes, highs, lows)
            self._cache[symbol] = result
            logger.info("Fetched %d bars for %s from Yahoo Finance", len(closes), symbol)
            return result
        except ImportError:
            logger.error("yfinance not installed. Install with: pip install yfinance")
            return MockDataProvider().fetch_ohlcv(symbol, lookback)
        except Exception as e:
            logger.error("Yahoo Finance error for %s: %s", symbol, e)
            return MockDataProvider().fetch_ohlcv(symbol, lookback)

    def current_price(self, symbol: str) -> float:
        closes, _, _ = self.fetch_ohlcv(symbol, lookback=3)
        return closes[-1] if closes else BASE_PRICES.get(symbol, 100.0)


def create_data_provider() -> MarketDataProvider:
    provider_name = os.getenv("MARKET_DATA_PROVIDER", "mock").lower()
    if provider_name == "yahoo":
        logger.info("Using YahooFinanceDataProvider for live market data")
        return YahooFinanceDataProvider()
    logger.info("Using MockDataProvider (set MARKET_DATA_PROVIDER=yahoo for live data)")
    return MockDataProvider()
