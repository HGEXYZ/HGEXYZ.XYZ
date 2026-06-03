from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.db.session import get_session
from app.models.user import User
from app.models.portfolio import Portfolio, Position, Trade, TradeSide, TradeStatus
from app.schemas.portfolio import PortfolioResponse, PositionResponse, TradeResponse, TradeRequest
from app.core.deps import get_current_user

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

@router.get("/")
async def get_portfolio(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Portfolio).where(Portfolio.user_id == user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        portfolio = Portfolio(user_id=user.id)
        session.add(portfolio)
        await session.commit()
        await session.refresh(portfolio)
    positions_result = await session.execute(select(Position).where(Position.portfolio_id == portfolio.id))
    positions = [PositionResponse(id=str(p.id), symbol=p.symbol, asset_type=p.asset_type, side=p.side.value, quantity=p.quantity, entry_price=p.entry_price, current_price=p.current_price, unrealized_pnl=p.unrealized_pnl, stop_loss=p.stop_loss, take_profit=p.take_profit, opened_at=p.opened_at.isoformat()) for p in positions_result.scalars().all()]
    trades_result = await session.execute(select(Trade).where(Trade.portfolio_id == portfolio.id).order_by(desc(Trade.opened_at)).limit(20))
    trades = [TradeResponse(id=str(t.id), symbol=t.symbol, asset_type=t.asset_type, side=t.side.value, status=t.status.value, entry_price=t.entry_price, exit_price=t.exit_price, quantity=t.quantity, gross_pnl=t.gross_pnl, net_pnl=t.net_pnl, return_pct=t.return_pct, opened_at=t.opened_at.isoformat(), closed_at=t.closed_at.isoformat() if t.closed_at else None) for t in trades_result.scalars().all()]
    total_pnl = sum(t.net_pnl for t in trades_result.scalars().all())
    exposure = sum(p.quantity * (p.current_price or p.entry_price) for p in positions_result.scalars().all())
    return PortfolioResponse(id=str(portfolio.id), name=portfolio.name, balance=portfolio.balance, total_pnl=total_pnl, sharpe_ratio=1.5, max_drawdown=0.15, exposure=exposure, positions=positions, recent_trades=trades)

@router.post("/trades")
async def add_trade(req: TradeRequest, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Portfolio).where(Portfolio.user_id == user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        portfolio = Portfolio(user_id=user.id)
        session.add(portfolio)
        await session.flush()
    trade = Trade(portfolio_id=portfolio.id, symbol=req.symbol.upper(), asset_type=req.asset_type, side=TradeSide(req.side), quantity=req.quantity, entry_price=req.entry_price, status=TradeStatus.OPEN)
    if req.stop_loss:
        trade.stop_loss = req.stop_loss
    if req.take_profit:
        trade.take_profit = req.take_profit
    session.add(trade)
    await session.commit()
    return {"message": "Trade added", "trade_id": str(trade.id)}

@router.put("/trades/{trade_id}/close")
async def close_trade(trade_id: str, exit_price: float, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Trade).join(Portfolio).where(Trade.id == trade_id, Portfolio.user_id == user.id))
    trade = result.scalar_one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    trade.exit_price = exit_price
    trade.status = TradeStatus.CLOSED
    trade.gross_pnl = (exit_price - trade.entry_price) * trade.quantity if trade.side == TradeSide.LONG else (trade.entry_price - exit_price) * trade.quantity
    trade.net_pnl = trade.gross_pnl - trade.entry_fee - trade.exit_fee
    trade.return_pct = (trade.net_pnl / (trade.entry_price * trade.quantity)) * 100
    from datetime import datetime, timezone
    trade.closed_at = datetime.now(timezone.utc)
    await session.commit()
    return {"message": "Trade closed", "pnl": trade.net_pnl, "pnl_pct": trade.return_pct}
