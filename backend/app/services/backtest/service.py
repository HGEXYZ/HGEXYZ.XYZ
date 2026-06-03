from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.backtest import BacktestRequest
from app.models.backtest import Backtest, BacktestTrade, BacktestStatus
from app.services.market.service import market_service
import pandas as pd
import numpy as np
from datetime import datetime, timezone

class BacktestService:
    async def run(self, req: BacktestRequest, user_id: str, session: AsyncSession) -> Dict[str, Any]:
        bt = Backtest(user_id=user_id, name=req.name, symbol=req.symbol, asset_type=req.asset_type, timeframe=req.timeframe, start_date=datetime.fromisoformat(req.start_date), end_date=datetime.fromisoformat(req.end_date), strategy=req.strategy, initial_capital=req.initial_capital, status=BacktestStatus.RUNNING)
        session.add(bt)
        await session.commit()
        await session.refresh(bt)
        try:
            history = await market_service.get_history(req.symbol, req.timeframe, 500)
            if isinstance(history, dict) and "error" in history:
                bt.status = BacktestStatus.FAILED
                await session.commit()
                return {"error": history["error"]}
            df = pd.DataFrame(history)
            df["sma20"] = df["close"].rolling(20).mean()
            df["sma50"] = df["close"].rolling(50).mean()
            df["rsi"] = self._rsi(df["close"])
            capital = req.initial_capital
            position = 0
            entry_price = 0
            trades = []
            equity_curve = []
            for i in range(50, len(df)):
                row = df.iloc[i]
                prev = df.iloc[i - 1]
                if position == 0 and row["sma20"] > row["sma50"] and prev["sma20"] <= prev["sma50"]:
                    position = capital * 0.95 / row["close"]
                    entry_price = row["close"]
                    capital *= 0.05
                elif position > 0 and (row["sma20"] < row["sma50"] or row["rsi"] > 70):
                    exit_price = row["close"]
                    pnl = position * (exit_price - entry_price)
                    capital += position * exit_price
                    trades.append({"entry_time": df.iloc[i - 1]["timestamp"], "exit_time": row["timestamp"], "side": "long", "entry_price": round(float(entry_price), 2), "exit_price": round(float(exit_price), 2), "quantity": round(float(position), 6), "pnl": round(float(pnl), 2), "pnl_pct": round(float(pnl / (position * entry_price) * 100), 2), "reason": "sma_cross"})
                    position = 0
                equity_curve.append({"timestamp": row["timestamp"], "equity": round(float(capital + position * row["close"]), 2)})
            if position > 0:
                capital += position * df.iloc[-1]["close"]
            if trades:
                winning = [t for t in trades if t["pnl"] > 0]
                losing = [t for t in trades if t["pnl"] <= 0]
                total_pnl = sum(t["pnl"] for t in trades)
                gross_profit = sum(t["pnl"] for t in winning)
                gross_loss = abs(sum(t["pnl"] for t in losing))
                bt.status = BacktestStatus.COMPLETED
                bt.final_capital = round(float(capital), 2)
                bt.total_return = round(float(total_pnl), 2)
                bt.return_pct = round(float((capital - req.initial_capital) / req.initial_capital * 100), 2)
                bt.win_rate = round(float(len(winning) / len(trades) * 100), 2)
                bt.profit_factor = round(float(gross_profit / gross_loss if gross_loss > 0 else 999), 2)
                bt.max_drawdown = self._calculate_max_drawdown(equity_curve)
                bt.sharpe_ratio = round(float(self._calculate_sharpe(equity_curve)), 2)
                bt.total_trades = len(trades)
                bt.winning_trades = len(winning)
                bt.losing_trades = len(losing)
                for trade_data in trades:
                    btt = BacktestTrade(backtest_id=bt.id, **trade_data)
                    session.add(btt)
            else:
                bt.status = BacktestStatus.COMPLETED
                bt.final_capital = round(float(capital), 2)
                bt.total_return = 0
                bt.return_pct = 0
                bt.total_trades = 0
            await session.commit()
            return {"id": str(bt.id), "name": bt.name, "symbol": bt.symbol, "status": "completed", "initial_capital": bt.initial_capital, "final_capital": bt.final_capital, "total_return": bt.total_return, "return_pct": bt.return_pct, "win_rate": bt.win_rate, "profit_factor": bt.profit_factor, "max_drawdown": bt.max_drawdown, "sharpe_ratio": bt.sharpe_ratio, "total_trades": bt.total_trades, "winning_trades": bt.winning_trades, "losing_trades": bt.losing_trades, "equity_curve": equity_curve, "trades": trades}
        except Exception as e:
            bt.status = BacktestStatus.FAILED
            await session.commit()
            return {"error": str(e)}

    def _rsi(self, prices, period=14):
        delta = prices.diff()
        gain = delta.where(delta > 0, 0).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))

    def _calculate_max_drawdown(self, equity_curve):
        if not equity_curve:
            return 0
        values = [e["equity"] for e in equity_curve]
        peak = values[0]
        max_dd = 0
        for v in values:
            if v > peak:
                peak = v
            dd = (peak - v) / peak * 100
            max_dd = max(max_dd, dd)
        return round(float(max_dd), 2)

    def _calculate_sharpe(self, equity_curve):
        if len(equity_curve) < 2:
            return 0
        values = [e["equity"] for e in equity_curve]
        returns = pd.Series(values).pct_change().dropna()
        if returns.std() == 0:
            return 0
        return (returns.mean() / returns.std()) * np.sqrt(252)

backtest_service = BacktestService()
