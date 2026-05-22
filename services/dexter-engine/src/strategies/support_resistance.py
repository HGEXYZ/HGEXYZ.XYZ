"""
Support & Resistance detection module.
Identifies key price levels from OHLCV data using swing highs/lows
and clustering, matching the Dexter Bot methodology.
"""
from __future__ import annotations
import numpy as np
from src.models.models import Level


def _swing_highs_lows(
    closes: np.ndarray, highs: np.ndarray, lows: np.ndarray, window: int = 5
) -> tuple[list[tuple[int, float]], list[tuple[int, float]]]:
    highs_list: list[tuple[int, float]] = []
    lows_list: list[tuple[int, float]] = []
    for i in range(window, len(highs) - window):
        if highs[i] == max(highs[i - window : i + window + 1]):
            highs_list.append((i, highs[i]))
        if lows[i] == min(lows[i - window : i + window + 1]):
            lows_list.append((i, lows[i]))
    return highs_list, lows_list


def _cluster_levels(
    points: list[tuple[int, float]], eps: float
) -> list[Level]:
    if not points:
        return []
    sorted_points = sorted(points, key=lambda x: x[1])
    clusters: list[list[float]] = [[sorted_points[0][1]]]
    for _, price in sorted_points[1:]:
        if abs(price - np.mean(clusters[-1])) <= eps:
            clusters[-1].append(price)
        else:
            clusters.append([price])
    result: list[Level] = []
    for c in clusters:
        avg = float(np.mean(c))
        strength = min(1.0, len(c) / 5.0)
        result.append(Level(price=round(avg, 2), strength=round(strength, 2), type="support" if result and avg < (result[-1].price if result else avg) else "resistance", touches=len(c)))
    return result


def detect_levels(
    closes: list[float],
    highs: list[float],
    lows: list[float],
    window: int = 5,
    cluster_eps_pct: float = 0.002,
) -> list[Level]:
    arr_c = np.array(closes, dtype=float)
    arr_h = np.array(highs, dtype=float)
    arr_l = np.array(lows, dtype=float)
    eps = arr_c.mean() * cluster_eps_pct
    sh, sl = _swing_highs_lows(arr_c, arr_h, arr_l, window)
    levels = _cluster_levels(sh + sl, eps)
    for lv in levels:
        if lv.price > arr_c[-1]:
            lv.type = "resistance"
        else:
            lv.type = "support"
    levels.sort(key=lambda x: x.strength, reverse=True)
    return levels[:10]


def nearest_levels(
    price: float, levels: list[Level], n: int = 3
) -> list[Level]:
    sorted_lv = sorted(levels, key=lambda x: abs(x.price - price))
    return sorted_lv[:n]
