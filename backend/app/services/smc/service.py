from typing import Dict, Any, List
import yfinance as yf
import pandas as pd
import numpy as np

class SMCService:
    async def analyze(self, symbol: str, timeframe: str = "1h") -> Dict[str, Any]:
        try:
            period_map = {"1h": "1mo", "4h": "3mo", "1d": "6mo"}
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period_map.get(timeframe, "1mo"), interval=timeframe if timeframe in ["1m", "5m", "15m", "30m", "1h", "4h", "1d"] else "1h")
            if hist.empty:
                return {"symbol": symbol, "timeframe": timeframe, "liquidity_sweeps": [], "fair_value_gaps": [], "order_blocks": [], "break_of_structure": [], "change_of_character": []}
            data = hist.copy()
            data["SwingHigh"] = (data["High"] == data["High"].rolling(5, center=True).max()) & (data["High"].shift(1) < data["High"]) & (data["High"].shift(-1) < data["High"])
            data["SwingLow"] = (data["Low"] == data["Low"].rolling(5, center=True).min()) & (data["Low"].shift(1) > data["Low"]) & (data["Low"].shift(-1) > data["Low"])
            liquidity_sweeps = []
            swing_highs = data[data["SwingHigh"]].index.tolist()
            for i in range(1, len(swing_highs)):
                prev = swing_highs[i - 1]
                curr = swing_highs[i]
                segment = data.loc[prev:curr]
                if segment["High"].iloc[0] > 0 and segment["High"].iloc[-1] > segment["High"].iloc[0]:
                    if any(data.loc[prev:curr]["Low"] < data.loc[prev]["Low"]):
                        liquidity_sweeps.append({"type": "bullish", "start": prev.isoformat(), "end": curr.isoformat(), "level": round(float(data.loc[curr]["High"]), 2)})
            fair_value_gaps = []
            for i in range(1, len(data) - 1):
                if data["Low"].iloc[i + 1] > data["High"].iloc[i - 1]:
                    fair_value_gaps.append({"type": "bullish", "start": data.index[i - 1].isoformat(), "gap_high": round(float(data["High"].iloc[i - 1]), 2), "gap_low": round(float(data["Low"].iloc[i + 1]), 2), "filled": data["Close"].iloc[-1] < data["High"].iloc[i - 1] and data["Close"].iloc[-1] > data["Low"].iloc[i + 1]})
                elif data["High"].iloc[i + 1] < data["Low"].iloc[i - 1]:
                    fair_value_gaps.append({"type": "bearish", "start": data.index[i - 1].isoformat(), "gap_high": round(float(data["Low"].iloc[i - 1]), 2), "gap_low": round(float(data["High"].iloc[i + 1]), 2), "filled": data["Close"].iloc[-1] > data["Low"].iloc[i - 1] and data["Close"].iloc[-1] < data["High"].iloc[i + 1]})
            order_blocks = []
            for i in range(1, len(data)):
                if data["Close"].iloc[i] > data["Open"].iloc[i] and data["Close"].iloc[i - 1] < data["Open"].iloc[i - 1]:
                    order_blocks.append({"type": "bullish", "time": data.index[i].isoformat(), "high": round(float(data["High"].iloc[i]), 2), "low": round(float(data["Low"].iloc[i]), 2)})
            break_of_structure = []
            for i in range(3, len(data)):
                if data["High"].iloc[i] > data["High"].iloc[i - 2] and data["Low"].iloc[i] < data["Low"].iloc[i - 2]:
                    break_of_structure.append({"type": "market_structure_shift", "time": data.index[i].isoformat(), "high": round(float(data["High"].iloc[i]), 2), "low": round(float(data["Low"].iloc[i]), 2)})
            change_of_character = []
            for i in range(5, len(data)):
                recent = data.iloc[i - 5:i]
                if recent["Close"].iloc[-1] > recent["Close"].iloc[0] and data["Close"].iloc[i] < data["Open"].iloc[i]:
                    change_of_character.append({"type": "bullish_to_bearish", "time": data.index[i].isoformat(), "price": round(float(data["Close"].iloc[i]), 2)})
            return {"symbol": symbol, "timeframe": timeframe, "liquidity_sweeps": liquidity_sweeps[:10], "fair_value_gaps": fair_value_gaps[:10], "order_blocks": order_blocks[:10], "break_of_structure": break_of_structure[:10], "change_of_character": change_of_character[:10]}
        except Exception as e:
            return {"symbol": symbol, "timeframe": timeframe, "error": str(e), "liquidity_sweeps": [], "fair_value_gaps": [], "order_blocks": [], "break_of_structure": [], "change_of_character": []}

smc_service = SMCService()
