from typing import List, Optional, Dict, Any
import yfinance as yf
import ccxt.async_support as ccxt
import pandas as pd
import numpy as np
from datetime import datetime, timezone

class MarketService:
    def __init__(self):
        self.exchanges = {"binance": ccxt.binance(), "coinbase": ccxt.coinbase()}
        self.forex_pairs = ["EURUSD=X", "GBPUSD=X", "USDJPY=X", "AUDUSD=X", "USDCAD=X", "NZDUSD=X", "USDCHF=X"]
        self.crypto_symbols = ["BTC", "ETH", "SOL", "XRP", "ADA", "DOT", "LINK", "AVAX", "MATIC", "UNI"]
        self.indices = {"SPY": "S&P 500", "QQQ": "Nasdaq", "DIA": "Dow Jones", "IWM": "Russell 2000"}
        self.commodities = {"GLD": "Gold", "SLV": "Silver", "USO": "Crude Oil", "UNG": "Natural Gas"}

    async def get_quote(self, symbol: str) -> Dict[str, Any]:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info if hasattr(ticker, "info") else {}
            hist = ticker.history(period="2d")
            if len(hist) >= 2:
                prev_close = hist["Close"].iloc[-2]
                current = hist["Close"].iloc[-1]
                change = current - prev_close
                change_pct = (change / prev_close) * 100
            else:
                current = hist["Close"].iloc[-1] if len(hist) > 0 else 0
                change = 0
                change_pct = 0
            return {"symbol": symbol.upper(), "price": round(float(current), 2), "change": round(float(change), 2), "change_pct": round(float(change_pct), 2), "volume": int(hist["Volume"].iloc[-1]) if len(hist) > 0 else 0, "high_24h": round(float(hist["High"].iloc[-1]), 2) if len(hist) > 0 else None, "low_24h": round(float(hist["Low"].iloc[-1]), 2) if len(hist) > 0 else None, "timestamp": datetime.now(timezone.utc).isoformat()}
        except Exception as e:
            return {"symbol": symbol, "price": 0, "change": 0, "change_pct": 0, "error": str(e)}

    async def get_history(self, symbol: str, interval: str = "1h", limit: int = 200) -> List[Dict]:
        try:
            period_map = {"1m": "1d", "5m": "5d", "15m": "5d", "30m": "1mo", "1h": "1mo", "4h": "3mo", "1d": "1y", "1w": "5y"}
            period = period_map.get(interval, "1mo")
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval if interval in ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h"] else "1h")
            data = []
            for idx, row in hist.iterrows():
                data.append({"timestamp": idx.isoformat() if hasattr(idx, "isoformat") else str(idx), "open": round(float(row["Open"]), 2), "high": round(float(row["High"]), 2), "low": round(float(row["Low"]), 2), "close": round(float(row["Close"]), 2), "volume": int(row["Volume"])})
            return data[-limit:]
        except Exception as e:
            return {"error": str(e)}

    async def get_movers(self) -> Dict[str, Any]:
        gainers = []
        losers = []
        for s in self.forex_pairs[:5] + self.crypto_symbols[:5] + list(self.indices.keys())[:3]:
            quote = await self.get_quote(s)
            if quote.get("change_pct", 0) > 0:
                gainers.append(quote)
            else:
                losers.append(quote)
        gainers.sort(key=lambda x: x["change_pct"], reverse=True)
        losers.sort(key=lambda x: x["change_pct"])
        return {"gainers": gainers[:10], "losers": losers[:10]}

    async def search(self, query: str, asset_type: Optional[str] = None) -> List[Dict]:
        results = []
        all_assets = self.forex_pairs + self.crypto_symbols + list(self.indices.keys()) + list(self.commodities.keys())
        for s in all_assets:
            if query.upper() in s.upper():
                results.append({"symbol": s, "asset_type": asset_type or "unknown", "name": s})
        return results[:20]

    async def get_indices(self) -> List[Dict]:
        results = []
        for symbol, name in self.indices.items():
            quote = await self.get_quote(symbol)
            quote["name"] = name
            results.append(quote)
        return results

market_service = MarketService()
