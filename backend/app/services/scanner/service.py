from typing import List, Optional, Dict, Any
import yfinance as yf
import pandas as pd
import numpy as np
from app.schemas.market import ScannerFilter, ScannerResult

class ScannerService:
    def __init__(self):
        self.forex_pairs = ["EURUSD=X", "GBPUSD=X", "USDJPY=X", "AUDUSD=X", "USDCAD=X", "NZDUSD=X", "USDCHF=X"]
        self.crypto_pairs = ["BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "ADA-USD", "DOT-USD", "LINK-USD", "AVAX-USD", "MATIC-USD", "UNI-USD"]
        self.stock_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "WMT"]

    def compute_rsi(self, prices: pd.Series, period: int = 14) -> float:
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.iloc[-1] if not rsi.empty else 50.0

    def compute_macd(self, prices: pd.Series) -> tuple:
        ema12 = prices.ewm(span=12).mean()
        ema26 = prices.ewm(span=26).mean()
        macd_line = ema12 - ema26
        signal = macd_line.ewm(span=9).mean()
        return macd_line.iloc[-1], signal.iloc[-1]

    async def scan_symbol(self, symbol: str, asset_type: str) -> Optional[Dict[str, Any]]:
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="3mo")
            if hist.empty or len(hist) < 30:
                return None
            close = hist["Close"]
            volume = hist["Volume"]
            rsi = self.compute_rsi(close)
            macd, signal = self.compute_macd(close)
            volatility = close.pct_change().std() * np.sqrt(252) * 100
            sma20 = close.rolling(20).mean().iloc[-1]
            sma50 = close.rolling(50).mean().iloc[-1]
            if close.iloc[-1] > sma20 > sma50:
                trend = "bullish"
            elif close.iloc[-1] < sma20 < sma50:
                trend = "bearish"
            else:
                trend = "neutral"
            signals = []
            if rsi > 70: signals.append("overbought")
            elif rsi < 30: signals.append("oversold")
            if macd > signal: signals.append("macd_bullish")
            else: signals.append("macd_bearish")
            if volume.iloc[-1] > volume.iloc[-20:].mean() * 1.5: signals.append("high_volume")
            return {"symbol": symbol.replace("=X", "").replace("-USD", ""), "asset_type": asset_type, "price": round(float(close.iloc[-1]), 4), "change_pct": round(float(close.pct_change().iloc[-1] * 100), 2), "volume": int(volume.iloc[-1]), "rsi": round(float(rsi), 2), "macd": round(float(macd), 4), "macd_signal_line": round(float(signal), 4), "volatility": round(float(volatility), 2), "trend": trend, "signals": signals}
        except Exception:
            return None

    async def scan(self, filters: ScannerFilter) -> List[Dict[str, Any]]:
        symbols = []
        if not filters.asset_type or filters.asset_type == "forex":
            symbols.extend([(s, "forex") for s in self.forex_pairs])
        if not filters.asset_type or filters.asset_type == "crypto":
            symbols.extend([(s, "crypto") for s in self.crypto_pairs])
        if not filters.asset_type or filters.asset_type == "stocks":
            symbols.extend([(s, "stock") for s in self.stock_symbols])
        results = []
        for symbol, atype in symbols:
            result = await self.scan_symbol(symbol, atype)
            if result:
                results.append(result)
        results.sort(key=lambda x: abs(x["change_pct"]), reverse=True)
        return results[:filters.limit]

scanner_service = ScannerService()
