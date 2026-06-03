from fastapi import APIRouter, Depends, Query
from app.core.deps import get_current_user
from app.models.user import User
from app.services.market.service import market_service
from app.schemas.market import MarketQuote, OHLCV
from typing import List, Optional

router = APIRouter(prefix="/markets", tags=["markets"])

@router.get("/quote/{symbol}")
async def get_quote(symbol: str, user: User = Depends(get_current_user)):
    return await market_service.get_quote(symbol)

@router.get("/history/{symbol}")
async def get_history(symbol: str, interval: str = Query("1h"), limit: int = Query(200), user: User = Depends(get_current_user)):
    return await market_service.get_history(symbol, interval, limit)

@router.get("/movers")
async def get_movers(user: User = Depends(get_current_user)):
    return await market_service.get_movers()

@router.get("/search")
async def search_markets(q: str = Query(...), asset_type: Optional[str] = Query(None), user: User = Depends(get_current_user)):
    return await market_service.search(q, asset_type)

@router.get("/indices")
async def get_indices(user: User = Depends(get_current_user)):
    return await market_service.get_indices()
