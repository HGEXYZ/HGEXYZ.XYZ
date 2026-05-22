"""
Signal generation engine for the Dexter Bot.
Fuses gap detection, support/resistance levels, and risk management
into actionable trading signals.
"""
from __future__ import annotations
import logging
from datetime import datetime, timezone
from src.models.models import (
    AssetConfig,
    Direction,
    GapSignal,
    Level,
    SignalOut,
)
from src.strategies.gap_strategy import evaluate_gap_signal
from src.strategies.support_resistance import detect_levels, nearest_levels
from src.risk.risk_manager import RiskManager
from src.data.market_data import MarketDataProvider, MockDataProvider

logger = logging.getLogger(__name__)

SUPPORTED_ASSETS = [
    "XAUUSD", "BTCUSD", "ETHUSD", "NASDAQ",
    "DXY", "CRUDE", "EURUSD", "GBPUSD",
]

DEFAULT_ASSET_CONFIGS: dict[str, AssetConfig] = {
    "XAUUSD": AssetConfig(symbol="XAUUSD", max_position_size=500.0, min_gap_pips=3.0, atr_multiplier_sl=1.5, atr_multiplier_tp1=2.0, atr_multiplier_tp2=3.0, atr_multiplier_tp3=4.5),
    "BTCUSD": AssetConfig(symbol="BTCUSD", max_position_size=0.5, min_gap_pips=10.0, atr_multiplier_sl=1.5, atr_multiplier_tp1=2.0, atr_multiplier_tp2=3.0, atr_multiplier_tp3=4.5),
    "ETHUSD": AssetConfig(symbol="ETHUSD", max_position_size=5.0, min_gap_pips=8.0, atr_multiplier_sl=1.5, atr_multiplier_tp1=2.0, atr_multiplier_tp2=3.0, atr_multiplier_tp3=4.5),
    "NASDAQ": AssetConfig(symbol="NASDAQ", max_position_size=100.0, min_gap_pips=5.0, atr_multiplier_sl=1.2, atr_multiplier_tp1=1.8, atr_multiplier_tp2=2.5, atr_multiplier_tp3=3.5),
    "DXY": AssetConfig(symbol="DXY", max_position_size=500.0, min_gap_pips=2.0, atr_multiplier_sl=1.5, atr_multiplier_tp1=2.0, atr_multiplier_tp2=3.0, atr_multiplier_tp3=4.0),
    "CRUDE": AssetConfig(symbol="CRUDE", max_position_size=500.0, min_gap_pips=5.0, atr_multiplier_sl=1.5, atr_multiplier_tp1=2.0, atr_multiplier_tp2=3.0, atr_multiplier_tp3=4.0),
    "EURUSD": AssetConfig(symbol="EURUSD", max_position_size=10000.0, min_gap_pips=3.0, atr_multiplier_sl=1.5, atr_multiplier_tp1=2.0, atr_multiplier_tp2=3.0, atr_multiplier_tp3=4.0),
    "GBPUSD": AssetConfig(symbol="GBPUSD", max_position_size=10000.0, min_gap_pips=3.0, atr_multiplier_sl=1.5, atr_multiplier_tp1=2.0, atr_multiplier_tp2=3.0, atr_multiplier_tp3=4.0),
}


class DexterSignalGenerator:
    def __init__(self, risk_manager: RiskManager | None = None, data_provider: MarketDataProvider | None = None):
        self.risk_manager = risk_manager or RiskManager()
        self.asset_configs = dict(DEFAULT_ASSET_CONFIGS)
        self.data_provider = data_provider or MockDataProvider()

    async def generate_signal(self, symbol: str) -> SignalOut | None:
        symbol = symbol.upper()
        config = self.asset_configs.get(symbol)
        if not config or not config.enabled:
            return None
        closes, highs, lows = self.data_provider.fetch_ohlcv(symbol)
        levels = detect_levels(closes, highs, lows)
        gap_signal = evaluate_gap_signal(symbol, closes, highs, lows, levels, config)
        if gap_signal is None:
            return None
        risk_check = self.risk_manager.approve_trade(gap_signal, config)
        near_lv = nearest_levels(gap_signal.entry_price, levels)
        if not risk_check.approved:
            logger.info("Signal rejected for %s: %s", symbol, risk_check.reason)
            return None
        rr1 = abs(gap_signal.take_profit_1 - gap_signal.entry_price) / abs(gap_signal.stop_loss - gap_signal.entry_price)
        level_str = "; ".join(f"{lv.type} at {lv.price} (strength: {lv.strength})" for lv in near_lv[:2])
        reasoning = (
            f"{gap_signal.direction.value} signal via gap-SR strategy. "
            f"Gap: {gap_signal.gap_size_pips}pips. "
            f"Near levels: {level_str}. "
            f"Confidence: {gap_signal.confidence:.0%}. "
            f"Risk: {risk_check.account_risk_pct:.1f}% of account. "
            f"Position: {risk_check.position_size:.2f} units."
        )
        return SignalOut(
            asset=symbol,
            direction=gap_signal.direction,
            confidence=round(gap_signal.confidence * 100, 1),
            entry_price=gap_signal.entry_price,
            stop_loss=gap_signal.stop_loss,
            targets=[gap_signal.take_profit_1, gap_signal.take_profit_2, gap_signal.take_profit_3],
            risk_reward=round(rr1, 2),
            reasoning=reasoning,
            strategy="gap_sr",
            levels_near=near_lv,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    async def scan_all(self) -> list[SignalOut]:
        signals: list[SignalOut] = []
        for sym in SUPPORTED_ASSETS:
            sig = await self.generate_signal(sym)
            if sig:
                signals.append(sig)
        return signals
