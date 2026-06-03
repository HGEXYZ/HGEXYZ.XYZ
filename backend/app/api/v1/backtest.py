from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_session
from app.models.user import User
from app.models.backtest import Backtest
from app.schemas.backtest import BacktestRequest, BacktestResult, BacktestExport
from app.core.deps import get_current_user
from app.services.backtest.service import backtest_service
from typing import List
import json

router = APIRouter(prefix="/backtest", tags=["backtest"])

@router.post("/run")
async def run_backtest(req: BacktestRequest, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await backtest_service.run(req, user.id, session)
    return result

@router.get("/history")
async def get_backtest_history(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Backtest).where(Backtest.user_id == user.id).order_by(desc(Backtest.created_at)))
    bt_list = result.scalars().all()
    return [BacktestResult(id=str(bt.id), name=bt.name, symbol=bt.symbol, status=bt.status.value, initial_capital=bt.initial_capital, final_capital=bt.final_capital, total_return=bt.total_return, return_pct=bt.return_pct, win_rate=bt.win_rate, profit_factor=bt.profit_factor, max_drawdown=bt.max_drawdown, sharpe_ratio=bt.sharpe_ratio, total_trades=bt.total_trades) for bt in bt_list]

@router.get("/{backtest_id}")
async def get_backtest(backtest_id: str, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Backtest).where(Backtest.id == backtest_id, Backtest.user_id == user.id))
    bt = result.scalar_one_or_none()
    if not bt:
        raise HTTPException(status_code=404, detail="Backtest not found")
    trades_list = [{"entry_time": t.entry_time.isoformat(), "exit_time": t.exit_time.isoformat(), "side": t.side, "entry_price": t.entry_price, "exit_price": t.exit_price, "pnl": t.pnl, "pnl_pct": t.pnl_pct} for t in bt.trades]
    return BacktestResult(id=str(bt.id), name=bt.name, symbol=bt.symbol, status=bt.status.value, initial_capital=bt.initial_capital, final_capital=bt.final_capital, total_return=bt.total_return, return_pct=bt.return_pct, win_rate=bt.win_rate, profit_factor=bt.profit_factor, max_drawdown=bt.max_drawdown, sharpe_ratio=bt.sharpe_ratio, total_trades=bt.total_trades, trades=trades_list)

@router.delete("/{backtest_id}")
async def delete_backtest(backtest_id: str, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Backtest).where(Backtest.id == backtest_id, Backtest.user_id == user.id))
    bt = result.scalar_one_or_none()
    if not bt:
        raise HTTPException(status_code=404, detail="Backtest not found")
    await session.delete(bt)
    await session.commit()
    return {"message": "Backtest deleted"}

@router.post("/{backtest_id}/export")
async def export_backtest(backtest_id: str, req: BacktestExport, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Backtest).where(Backtest.id == backtest_id, Backtest.user_id == user.id))
    bt = result.scalar_one_or_none()
    if not bt:
        raise HTTPException(status_code=404, detail="Backtest not found")
    csv_data = "Entry Time,Exit Time,Side,Entry Price,Exit Price,PnL,PnL%\n"
    for t in bt.trades:
        csv_data += f"{t.entry_time.isoformat()},{t.exit_time.isoformat()},{t.side},{t.entry_price},{t.exit_price},{t.pnl},{t.pnl_pct}\n"
    return StreamingResponse(iter([csv_data]), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=backtest_{bt.id}.csv"})
