"""
Risk management module inspired by the Dexter Bot methodology.
Handles position sizing, stop-loss/take-profit placement,
max-drawdown limits, and daily loss limits.
"""
from __future__ import annotations
from dataclasses import dataclass
from datetime import date, datetime
from src.models.models import GapSignal, RiskCheck, AssetConfig


@dataclass
class AccountState:
    balance: float = 10000.0
    equity: float = 10000.0
    open_trades: int = 0
    daily_pnl: float = 0.0
    max_drawdown_pct: float = 0.0
    peak_balance: float = 10000.0
    today_date: date = date.today()
    trades_today: int = 0


class RiskManager:
    def __init__(
        self,
        global_risk_per_trade_pct: float = 1.0,
        max_daily_loss_pct: float = 5.0,
        max_open_trades: int = 5,
        max_drawdown_pct: float = 20.0,
    ):
        self.global_risk_per_trade_pct = global_risk_per_trade_pct
        self.max_daily_loss_pct = max_daily_loss_pct
        self.max_open_trades = max_open_trades
        self.max_drawdown_pct = max_drawdown_pct
        self.state = AccountState()

    def reset_daily_if_needed(self) -> None:
        today = date.today()
        if self.state.today_date != today:
            self.state.today_date = today
            self.state.daily_pnl = 0.0
            self.state.trades_today = 0

    def check_daily_loss_limit(self) -> bool:
        self.reset_daily_if_needed()
        daily_loss_pct = abs(self.state.daily_pnl) / self.state.balance * 100
        return daily_loss_pct < self.max_daily_loss_pct

    def check_drawdown(self) -> bool:
        if self.state.balance > self.state.peak_balance:
            self.state.peak_balance = self.state.balance
        dd_pct = (
            (self.state.peak_balance - self.state.balance)
            / self.state.peak_balance
            * 100
        )
        return dd_pct < self.max_drawdown_pct

    def compute_position_size(
        self, signal: GapSignal, config: AssetConfig
    ) -> float:
        stop_distance = abs(signal.entry_price - signal.stop_loss)
        if stop_distance == 0:
            return 0.0
        max_loss_per_trade = self.state.balance * (
            self.global_risk_per_trade_pct / 100
        )
        position_size = max_loss_per_trade / stop_distance
        max_pos = config.max_position_size
        return min(position_size, max_pos)

    def approve_trade(self, signal: GapSignal, config: AssetConfig) -> RiskCheck:
        self.reset_daily_if_needed()
        reasons: list[str] = []
        if not self.check_daily_loss_limit():
            reasons.append(f"Daily loss limit ({self.max_daily_loss_pct}%) reached")
        if not self.check_drawdown():
            reasons.append(f"Max drawdown ({self.max_drawdown_pct}%) exceeded")
        if self.state.open_trades >= self.max_open_trades:
            reasons.append(f"Max open trades ({self.max_open_trades}) reached")
        if signal.confidence < 0.3:
            reasons.append(f"Confidence {signal.confidence} below 0.3 threshold")
        if reasons:
            return RiskCheck(approved=False, reason="; ".join(reasons))
        pos_size = self.compute_position_size(signal, config)
        max_loss = pos_size * abs(signal.entry_price - signal.stop_loss)
        risk_pct = round(max_loss / self.state.balance * 100, 2)
        return RiskCheck(
            approved=True,
            reason="All checks passed",
            position_size=round(pos_size, 4),
            max_loss=round(max_loss, 2),
            account_risk_pct=risk_pct,
        )

    def record_trade_result(self, pnl: float) -> None:
        self.state.balance += pnl
        self.state.daily_pnl += pnl
        self.state.open_trades = max(0, self.state.open_trades - 1)
        self.state.trades_today += 1
        if self.state.balance > self.state.peak_balance:
            self.state.peak_balance = self.state.balance
