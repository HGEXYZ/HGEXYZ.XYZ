from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class MarketQuote(BaseModel):
    symbol: str
    price: float
    change: float
    change_pct: float
    volume: Optional[float] = None
    high_24h: Optional[float] = None
    low_24h: Optional[float] = None
    timestamp: str

class OHLCV(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class MarketMovers(BaseModel):
    gainers: List[MarketQuote]
    losers: List[MarketQuote]

class ScannerFilter(BaseModel):
    trend: Optional[str] = None
    min_volume: Optional[float] = None
    min_volatility: Optional[float] = None
    rsi_min: Optional[float] = None
    rsi_max: Optional[float] = None
    macd_signal: Optional[str] = None
    breakout: Optional[bool] = None
    asset_type: Optional[str] = None
    limit: int = 50

class ScannerResult(BaseModel):
    symbol: str
    asset_type: str
    price: float
    change_pct: float
    volume: float
    rsi: float
    macd: float
    macd_signal_line: float
    volatility: float
    trend: str
    signals: List[str]

class SMCResult(BaseModel):
    symbol: str
    timeframe: str
    liquidity_sweeps: List[Dict[str, Any]]
    fair_value_gaps: List[Dict[str, Any]]
    order_blocks: List[Dict[str, Any]]
    break_of_structure: List[Dict[str, Any]]
    change_of_character: List[Dict[str, Any]]
