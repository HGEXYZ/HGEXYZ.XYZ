from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class BacktestRequest(BaseModel):
    name: str
    symbol: str
    asset_type: str
    timeframe: str = "1h"
    start_date: str
    end_date: str
    initial_capital: float = 10000.0
    strategy: str = Field(..., description="Strategy code or description")
    parameters: Optional[dict] = None

class BacktestResult(BaseModel):
    id: str
    name: str
    symbol: str
    status: str
    initial_capital: float
    final_capital: Optional[float]
    total_return: Optional[float]
    return_pct: Optional[float]
    win_rate: Optional[float]
    profit_factor: Optional[float]
    max_drawdown: Optional[float]
    sharpe_ratio: Optional[float]
    total_trades: int
    equity_curve: Optional[List[dict]] = None
    trades: Optional[List[Any]] = None

class BacktestExport(BaseModel):
    format: str = Field(..., pattern="^(csv|pdf)$")
