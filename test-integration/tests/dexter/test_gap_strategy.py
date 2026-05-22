"""Unit tests for the Dexter Bot gap strategy and S/R detection."""
import pytest
import random
import numpy as np
from src.strategies.gap_strategy import compute_atr, detect_gap, evaluate_gap_signal
from src.strategies.support_resistance import detect_levels, nearest_levels
from src.risk.risk_manager import RiskManager, AccountState
from src.models.models import AssetConfig, Level, GapSignal, Direction


def _make_ohlcv(base: float, n: int = 100, volatility: float = 0.01):
    closes, highs, lows = [], [], []
    p = base
    for _ in range(n):
        p += (random.random() - 0.5) * base * volatility
        closes.append(p)
        highs.append(p * (1 + random.random() * 0.005))
        lows.append(p * (1 - random.random() * 0.005))
    return closes, highs, lows


class TestGapDetection:
    def test_no_gap(self):
        size, direction = detect_gap(100.0, 100.0)
        assert size == 0.0
        assert direction == Direction.HOLD

    def test_bullish_gap(self):
        size, direction = detect_gap(100.0, 102.0)
        assert size == 2.0
        assert direction == Direction.BUY

    def test_bearish_gap(self):
        size, direction = detect_gap(102.0, 100.0)
        assert size == 2.0
        assert direction == Direction.SELL


class TestATR:
    def test_atr_positive(self):
        highs = [110, 112, 111, 113, 115]
        lows = [90, 92, 91, 93, 95]
        closes = [100, 102, 101, 103, 105]
        atr = compute_atr(highs, lows, closes, period=5)
        assert atr > 0

    def test_atr_short_data(self):
        atr = compute_atr([100], [99], [100], period=14)
        assert atr == 0.0


class TestSupportResistance:
    def test_detect_levels(self):
        closes, highs, lows = _make_ohlcv(100.0, 200)
        levels = detect_levels(closes, highs, lows)
        assert len(levels) > 0
        assert all(isinstance(l, Level) for l in levels)
        assert all(0 <= l.strength <= 1 for l in levels)

    def test_nearest_levels(self):
        levels = [
            Level(price=90.0, strength=0.5, type="support", touches=2),
            Level(price=100.0, strength=0.8, type="resistance", touches=5),
            Level(price=110.0, strength=0.3, type="resistance", touches=1),
        ]
        near = nearest_levels(95.0, levels, n=2)
        assert len(near) == 2
        assert near[0].price == 90.0  # closest to 95

    def test_nearest_levels_empty(self):
        assert nearest_levels(100.0, []) == []


class TestGapSignalEvaluation:
    def test_not_enough_data(self):
        result = evaluate_gap_signal(
            "XAUUSD", [100.0], [101.0], [99.0], [], AssetConfig(symbol="XAUUSD")
        )
        assert result is None

    def test_small_gap_rejected(self):
        closes = [99.0, 99.0]  # no gap
        result = evaluate_gap_signal(
            "XAUUSD", closes, [100.0, 100.0], [98.0, 98.0],
            [Level(price=99.0, strength=0.5, type="support", touches=3)],
            AssetConfig(symbol="XAUUSD", min_gap_pips=5.0),
        )
        assert result is None


class TestRiskManager:
    def test_initial_state(self):
        rm = RiskManager()
        assert rm.state.balance == 10000.0
        assert rm.state.open_trades == 0

    def test_daily_loss_limit_exceeded(self):
        rm = RiskManager(max_daily_loss_pct=5.0)
        rm.state.daily_pnl = -600.0
        assert not rm.check_daily_loss_limit()

    def test_daily_loss_limit_ok(self):
        rm = RiskManager(max_daily_loss_pct=5.0)
        rm.state.daily_pnl = -200.0
        assert rm.check_daily_loss_limit()

    def test_drawdown_exceeded(self):
        rm = RiskManager(max_drawdown_pct=20.0)
        rm.state.peak_balance = 10000.0
        rm.state.balance = 7500.0
        assert not rm.check_drawdown()

    def test_drawdown_ok(self):
        rm = RiskManager(max_drawdown_pct=20.0)
        rm.state.balance = 9000.0
        rm.state.peak_balance = 10000.0
        assert rm.check_drawdown()

    def test_max_open_trades_rejected(self):
        rm = RiskManager(max_open_trades=3)
        rm.state.open_trades = 3
        signal = GapSignal(
            symbol="XAUUSD", direction=Direction.BUY, gap_size_pips=5.0,
            entry_price=100.0, stop_loss=99.0, take_profit_1=102.0,
            take_profit_2=104.0, take_profit_3=106.0, confidence=0.7,
        )
        config = AssetConfig(symbol="XAUUSD")
        check = rm.approve_trade(signal, config)
        assert not check.approved
        assert "open trades" in check.reason.lower()

    def test_low_confidence_rejected(self):
        rm = RiskManager()
        signal = GapSignal(
            symbol="XAUUSD", direction=Direction.BUY, gap_size_pips=5.0,
            entry_price=100.0, stop_loss=99.0, take_profit_1=102.0,
            take_profit_2=104.0, take_profit_3=106.0, confidence=0.1,
        )
        check = rm.approve_trade(signal, AssetConfig(symbol="XAUUSD"))
        assert not check.approved

    def test_approved_trade(self):
        rm = RiskManager()
        signal = GapSignal(
            symbol="XAUUSD", direction=Direction.BUY, gap_size_pips=5.0,
            entry_price=100.0, stop_loss=99.0, take_profit_1=102.0,
            take_profit_2=104.0, take_profit_3=106.0, confidence=0.7,
        )
        check = rm.approve_trade(signal, AssetConfig(symbol="XAUUSD"))
        assert check.approved
        assert check.position_size > 0

    def test_record_trade_result(self):
        rm = RiskManager()
        initial = rm.state.balance
        rm.record_trade_result(150.0)
        assert rm.state.balance == initial + 150.0

    def test_daily_reset(self):
        rm = RiskManager()
        rm.state.daily_pnl = -500.0
        rm.state.trades_today = 10
        rm.reset_daily_if_needed()  # same day, should NOT reset
        assert rm.state.daily_pnl == -500.0


class TestPositionSizing:
    def test_compute_size(self):
        rm = RiskManager(global_risk_per_trade_pct=1.0)
        signal = GapSignal(
            symbol="XAUUSD", direction=Direction.BUY, gap_size_pips=5.0,
            entry_price=100.0, stop_loss=99.0, take_profit_1=102.0,
            take_profit_2=104.0, take_profit_3=106.0, confidence=0.7,
        )
        size = rm.compute_position_size(signal, AssetConfig(symbol="XAUUSD", max_position_size=500.0))
        assert 0 < size <= 500.0
