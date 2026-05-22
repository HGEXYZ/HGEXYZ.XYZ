from __future__ import annotations
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field


class Direction(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


class AssetConfig(BaseModel):
    symbol: str
    enabled: bool = True
    max_position_size: float = 1000.0
    min_gap_pips: float = 5.0
    atr_multiplier_sl: float = 1.5
    atr_multiplier_tp1: float = 2.0
    atr_multiplier_tp2: float = 3.0
    atr_multiplier_tp3: float = 4.0
    risk_per_trade_pct: float = 1.0


class Level(BaseModel):
    price: float
    strength: float = Field(ge=0, le=1)
    type: str  # support | resistance
    touches: int = 0


class GapSignal(BaseModel):
    symbol: str
    direction: Direction
    gap_size_pips: float
    entry_price: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: float
    take_profit_3: float
    confidence: float = Field(ge=0, le=1)
    strategy: str = "gap_sr"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class RiskCheck(BaseModel):
    approved: bool
    reason: str
    position_size: float = 0.0
    max_loss: float = 0.0
    account_risk_pct: float = 0.0


class SignalOut(BaseModel):
    asset: str
    direction: Direction
    confidence: float
    entry_price: float
    stop_loss: float
    targets: list[float]
    risk_reward: float
    reasoning: str
    strategy: str
    levels_near: list[Level]
    timestamp: str


class TradeRequest(BaseModel):
    symbol: str
    direction: Direction = Direction.BUY
    entry_price: float | None = None
    stop_loss: float | None = None
    targets: list[float] | None = None
    position_size: float | None = None
    generate_signal: bool = True


class TradePositionOut(BaseModel):
    trade_id: str
    symbol: str
    direction: str
    entry_price: float
    stop_loss: float
    targets: list[float]
    position_size: float
    open_time: str
    current_price: float
    unrealized_pnl: float


class ClosedTradeOut(BaseModel):
    trade_id: str
    symbol: str
    direction: str
    entry_price: float
    close_price: float
    stop_loss: float
    targets: list[float]
    position_size: float
    open_time: str
    close_time: str
    realized_pnl: float
    exit_reason: str


class PortfolioSummaryOut(BaseModel):
    balance: float
    equity: float
    open_positions: int
    total_trades: int
    winning_trades: int
    losing_trades: int
    unrealized_pnl: float
    daily_pnl: float
    peak_balance: float
    max_drawdown_pct: float
    trades_today: int
    win_rate: float


class HealthResponse(BaseModel):
    status: str
    version: str
    uptime: float
    managed_assets: list[str]
    active_strategies: list[str]


class ConfigResponse(BaseModel):
    assets: list[AssetConfig]
    global_risk_per_trade_pct: float
    max_daily_loss_pct: float
    max_open_trades: int
    redis_enabled: bool
