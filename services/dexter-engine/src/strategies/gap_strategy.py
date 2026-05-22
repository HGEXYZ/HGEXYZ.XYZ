"""
Gap-based trading strategy, inspired by the Dexter Bot.
Scans for price gaps (overnight / intra-session) between consecutive
periods and generates signals when gaps align with support/resistance.
"""
from __future__ import annotations
from src.models.models import Direction, GapSignal, Level, AssetConfig


def compute_atr(highs: list[float], lows: list[float], closes: list[float], period: int = 14) -> float:
    if len(closes) < 2:
        return 0.0
    trs: list[float] = []
    for i in range(1, len(closes)):
        hl = highs[i] - lows[i]
        hc = abs(highs[i] - closes[i - 1])
        lc = abs(lows[i] - closes[i - 1])
        trs.append(max(hl, hc, lc))
    if not trs:
        return 0.0
    return sum(trs[-period:]) / min(period, len(trs))


def detect_gap(prev_close: float, current_open: float) -> tuple[float, Direction]:
    diff = current_open - prev_close
    if diff > 0:
        return diff, Direction.BUY
    elif diff < 0:
        return abs(diff), Direction.SELL
    return 0.0, Direction.HOLD


def evaluate_gap_signal(
    symbol: str,
    closes: list[float],
    highs: list[float],
    lows: list[float],
    levels: list[Level],
    config: AssetConfig,
) -> GapSignal | None:
    if len(closes) < 2:
        return None
    gap_size, gap_dir = detect_gap(closes[-2], closes[-1])
    if gap_size == 0 or gap_dir == Direction.HOLD:
        return None
    pip_size = _pip_factor(symbol)
    gap_pips = gap_size / pip_size
    if gap_pips < config.min_gap_pips:
        return None
    atr = compute_atr(highs, lows, closes)
    if atr == 0:
        return None
    price = closes[-1]
    near_levels = [lv for lv in levels if abs(lv.price - price) / price < 0.01]
    if not near_levels:
        return None
    sl_mult = config.atr_multiplier_sl
    tp1_mult = config.atr_multiplier_tp1
    tp2_mult = config.atr_multiplier_tp2
    tp3_mult = config.atr_multiplier_tp3
    if gap_dir == Direction.BUY:
        entry = price
        sl = price - (atr * sl_mult)
        tp1 = price + (atr * tp1_mult)
        tp2 = price + (atr * tp2_mult)
        tp3 = price + (atr * tp3_mult)
    else:
        entry = price
        sl = price + (atr * sl_mult)
        tp1 = price - (atr * tp1_mult)
        tp2 = price - (atr * tp2_mult)
        tp3 = price - (atr * tp3_mult)
    level_score = max(lv.strength for lv in near_levels)
    gap_score = min(1.0, gap_pips / 20.0)
    confidence = round((level_score * 0.5 + gap_score * 0.3 + 0.2), 2)
    confidence = min(max(confidence, 0.1), 0.95)
    return GapSignal(
        symbol=symbol,
        direction=gap_dir,
        gap_size_pips=round(gap_pips, 1),
        entry_price=round(entry, 2),
        stop_loss=round(sl, 2),
        take_profit_1=round(tp1, 2),
        take_profit_2=round(tp2, 2),
        take_profit_3=round(tp3, 2),
        confidence=confidence,
        strategy="gap_sr",
    )


def _pip_factor(symbol: str) -> float:
    forex_majors = {"EURUSD", "GBPUSD", "EURGBP"}
    forex_minors = {"USDJPY", "EURJPY", "GBPJPY"}
    if symbol in forex_majors:
        return 0.0001
    if symbol in forex_minors:
        return 0.01
    if symbol in {"XAUUSD", "GOLD"}:
        return 0.01
    if symbol in {"BTCUSD", "ETHUSD"}:
        return 0.1
    return 0.0001
