from __future__ import annotations
import uuid
import logging
from datetime import datetime, timezone
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class TradePosition:
    trade_id: str
    symbol: str
    direction: str
    entry_price: float
    stop_loss: float
    targets: list[float]
    position_size: float
    open_time: str
    current_price: float = 0.0

    @property
    def unrealized_pnl(self) -> float:
        if self.current_price == 0:
            return 0.0
        diff = self.current_price - self.entry_price if self.direction == "BUY" else self.entry_price - self.current_price
        return round(diff * self.position_size, 2)


@dataclass
class ClosedTrade:
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


@dataclass
class PortfolioSummary:
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


class PaperTrader:
    def __init__(self, initial_balance: float = 10000.0):
        self.balance = initial_balance
        self.peak_balance = initial_balance
        self.daily_pnl = 0.0
        self.trades_today = 0
        self._today = datetime.now(timezone.utc).date()
        self._positions: dict[str, TradePosition] = {}
        self._closed_trades: list[ClosedTrade] = []
        self._winning = 0
        self._losing = 0

    def _reset_daily_if_needed(self) -> None:
        today = datetime.now(timezone.utc).date()
        if self._today != today:
            self._today = today
            self.daily_pnl = 0.0
            self.trades_today = 0

    def open_trade(
        self,
        symbol: str,
        direction: str,
        entry_price: float,
        stop_loss: float,
        targets: list[float],
        position_size: float,
    ) -> TradePosition:
        self._reset_daily_if_needed()
        trade_id = str(uuid.uuid4())
        pos = TradePosition(
            trade_id=trade_id,
            symbol=symbol.upper(),
            direction=direction,
            entry_price=entry_price,
            stop_loss=stop_loss,
            targets=targets,
            position_size=position_size,
            open_time=datetime.now(timezone.utc).isoformat(),
            current_price=entry_price,
        )
        self._positions[trade_id] = pos
        logger.info("Opened paper trade %s: %s %s @ %.2f size=%.4f", trade_id[:8], symbol, direction, entry_price, position_size)
        return pos

    def close_trade(self, trade_id: str, close_price: float, exit_reason: str = "manual") -> ClosedTrade | None:
        pos = self._positions.pop(trade_id, None)
        if pos is None:
            return None
        self._reset_daily_if_needed()
        diff = close_price - pos.entry_price if pos.direction == "BUY" else pos.entry_price - close_price
        realized_pnl = round(diff * pos.position_size, 2)
        self.balance += realized_pnl
        self.daily_pnl += realized_pnl
        self.trades_today += 1
        if self.balance > self.peak_balance:
            self.peak_balance = self.balance
        if realized_pnl > 0:
            self._winning += 1
        else:
            self._losing += 1
        closed = ClosedTrade(
            trade_id=pos.trade_id,
            symbol=pos.symbol,
            direction=pos.direction,
            entry_price=pos.entry_price,
            close_price=close_price,
            stop_loss=pos.stop_loss,
            targets=pos.targets,
            position_size=pos.position_size,
            open_time=pos.open_time,
            close_time=datetime.now(timezone.utc).isoformat(),
            realized_pnl=realized_pnl,
            exit_reason=exit_reason,
        )
        self._closed_trades.append(closed)
        logger.info("Closed paper trade %s: PnL=%.2f reason=%s", trade_id[:8], realized_pnl, exit_reason)
        return closed

    def update_prices(self, prices: dict[str, float]) -> None:
        for sym, price in prices.items():
            for pos in self._positions.values():
                if pos.symbol == sym:
                    pos.current_price = price

    def get_position(self, trade_id: str) -> TradePosition | None:
        return self._positions.get(trade_id)

    def get_positions(self) -> list[TradePosition]:
        return list(self._positions.values())

    def get_trade_history(self) -> list[ClosedTrade]:
        return list(self._closed_trades)

    def get_summary(self) -> PortfolioSummary:
        self._reset_daily_if_needed()
        unrealized = sum(p.unrealized_pnl for p in self._positions.values())
        total_trades = self._winning + self._losing
        equity = self.balance + unrealized
        dd_pct = ((self.peak_balance - self.balance) / self.peak_balance * 100) if self.peak_balance > 0 else 0.0
        win_rate = (self._winning / total_trades * 100) if total_trades > 0 else 0.0
        return PortfolioSummary(
            balance=round(self.balance, 2),
            equity=round(equity, 2),
            open_positions=len(self._positions),
            total_trades=total_trades,
            winning_trades=self._winning,
            losing_trades=self._losing,
            unrealized_pnl=round(unrealized, 2),
            daily_pnl=round(self.daily_pnl, 2),
            peak_balance=round(self.peak_balance, 2),
            max_drawdown_pct=round(dd_pct, 2),
            trades_today=self.trades_today,
            win_rate=round(win_rate, 1),
        )
