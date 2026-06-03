from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PositionResponse(BaseModel):
    id: str
    symbol: str
    asset_type: str
    side: str
    quantity: float
    entry_price: float
    current_price: Optional[float]
    unrealized_pnl: float
    stop_loss: Optional[float]
    take_profit: Optional[float]
    opened_at: str

class TradeResponse(BaseModel):
    id: str
    symbol: str
    asset_type: str
    side: str
    status: str
    entry_price: float
    exit_price: Optional[float]
    quantity: float
    gross_pnl: float
    net_pnl: float
    return_pct: float
    opened_at: str
    closed_at: Optional[str]

class PortfolioResponse(BaseModel):
    id: str
    name: str
    balance: float
    total_pnl: float
    sharpe_ratio: float
    max_drawdown: float
    exposure: float
    positions: List[PositionResponse]
    recent_trades: List[TradeResponse]

class TradeRequest(BaseModel):
    symbol: str
    asset_type: str
    side: str
    quantity: float
    entry_price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
