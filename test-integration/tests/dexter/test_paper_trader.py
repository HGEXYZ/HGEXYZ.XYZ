"""Tests for the PaperTrader module."""
import pytest
from src.trading.paper_trader import PaperTrader


class TestPaperTrader:
    def test_initial_state(self):
        pt = PaperTrader(initial_balance=50000.0)
        s = pt.get_summary()
        assert s.balance == 50000.0
        assert s.open_positions == 0
        assert s.total_trades == 0
        assert s.win_rate == 0.0

    def test_open_trade_creates_position(self):
        pt = PaperTrader()
        pos = pt.open_trade("XAUUSD", "BUY", 2350.0, 2330.0, [2380.0, 2410.0], 1.0)
        assert pos.trade_id is not None
        assert pos.symbol == "XAUUSD"
        assert pos.direction == "BUY"
        assert pos.entry_price == 2350.0
        assert pos.position_size == 1.0
        assert len(pt.get_positions()) == 1

    def test_open_trade_upcase_symbol(self):
        pt = PaperTrader()
        pos = pt.open_trade("eurusd", "SELL", 1.0850, 1.0900, [1.0800], 10000.0)
        assert pos.symbol == "EURUSD"

    def test_close_trade_profit(self):
        pt = PaperTrader(initial_balance=10000.0)
        pt.open_trade("BTCUSD", "BUY", 50000.0, 49000.0, [52000.0], 0.1)
        trade_id = pt.get_positions()[0].trade_id
        closed = pt.close_trade(trade_id, close_price=52000.0, exit_reason="tp1")
        assert closed.realized_pnl == 200.0  # (52000 - 50000) * 0.1
        assert closed.exit_reason == "tp1"
        assert pt.balance == 10200.0
        assert len(pt.get_positions()) == 0

    def test_close_trade_loss(self):
        pt = PaperTrader(initial_balance=10000.0)
        pt.open_trade("ETHUSD", "SELL", 3500.0, 3600.0, [3400.0], 2.0)
        trade_id = pt.get_positions()[0].trade_id
        closed = pt.close_trade(trade_id, close_price=3600.0, exit_reason="sl")
        assert closed.realized_pnl == -200.0  # (3500 - 3600) * 2.0
        assert pt.balance == 9800.0

    def test_close_nonexistent_trade(self):
        pt = PaperTrader()
        assert pt.close_trade("does-not-exist", 100.0) is None

    def test_get_position(self):
        pt = PaperTrader()
        pos = pt.open_trade("XAUUSD", "BUY", 2350.0, 2330.0, [2380.0], 1.0)
        assert pt.get_position(pos.trade_id) is not None
        assert pt.get_position("fake") is None

    def test_win_rate_tracking(self):
        pt = PaperTrader()
        pt.open_trade("A", "BUY", 100, 90, [110], 1)
        tid1 = pt.get_positions()[0].trade_id
        pt.close_trade(tid1, 110, "tp1")
        pt.open_trade("B", "BUY", 100, 90, [110], 1)
        tid2 = pt.get_positions()[0].trade_id
        pt.close_trade(tid2, 90, "sl")
        s = pt.get_summary()
        assert s.total_trades == 2
        assert s.winning_trades == 1
        assert s.losing_trades == 1
        assert s.win_rate == 50.0

    def test_trade_history(self):
        pt = PaperTrader()
        pt.open_trade("XAUUSD", "BUY", 2350.0, 2330.0, [2380.0], 1.0)
        tid = pt.get_positions()[0].trade_id
        pt.close_trade(tid, 2380.0, "tp1")
        history = pt.get_trade_history()
        assert len(history) == 1
        assert history[0].realized_pnl == 30.0

    def test_update_prices(self):
        pt = PaperTrader()
        pt.open_trade("XAUUSD", "BUY", 2350.0, 2330.0, [2380.0], 1.0)
        pt.open_trade("BTCUSD", "SELL", 50000.0, 51000.0, [48000.0], 0.1)
        pt.update_prices({"XAUUSD": 2370.0, "BTCUSD": 49500.0})
        positions = pt.get_positions()
        for p in positions:
            if p.symbol == "XAUUSD":
                assert p.current_price == 2370.0
                assert p.unrealized_pnl == 20.0
            elif p.symbol == "BTCUSD":
                assert p.current_price == 49500.0
                assert p.unrealized_pnl == 50.0  # (50000-49500)*0.1

    def test_unrealized_pnl_no_price(self):
        pt = PaperTrader()
        pos = pt.open_trade("XAUUSD", "BUY", 2350.0, 2330.0, [2380.0], 1.0)
        assert pos.unrealized_pnl == 0.0

    def test_daily_reset(self):
        pt = PaperTrader()
        pt.daily_pnl = -500.0
        pt.trades_today = 5
        pt._reset_daily_if_needed()  # same day, should NOT reset
        assert pt.daily_pnl == -500.0

    def test_peak_balance_tracking(self):
        pt = PaperTrader(initial_balance=10000.0)
        pt.open_trade("XAUUSD", "BUY", 2350.0, 2330.0, [2380.0], 1.0)
        tid = pt.get_positions()[0].trade_id
        pt.close_trade(tid, 2380.0, "tp1")
        assert pt.peak_balance == 10030.0
