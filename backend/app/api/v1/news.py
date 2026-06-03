from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.news import NewsArticle, EconomicEvent
from app.schemas.news import NewsResponse, EconomicEventResponse
from typing import Optional, List

router = APIRouter(prefix="/news", tags=["news"])

@router.get("/")
async def get_news(limit: int = Query(20), symbol: Optional[str] = None, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    query = select(NewsArticle).order_by(desc(NewsArticle.published_at)).limit(limit)
    if symbol:
        query = query.where(NewsArticle.symbols.ilike(f"%{symbol}%"))
    result = await session.execute(query)
    articles = result.scalars().all()
    return [NewsResponse(id=str(a.id), title=a.title, source=a.source, url=a.url, summary=a.summary, sentiment=a.sentiment.value if a.sentiment else None, sentiment_score=a.sentiment_score, impact=a.impact.value if a.impact else None, symbols=a.symbols, published_at=a.published_at.isoformat()) for a in articles]

@router.get("/economic-calendar")
async def get_economic_calendar(limit: int = Query(50), user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(EconomicEvent).order_by(EconomicEvent.date).limit(limit))
    events = result.scalars().all()
    return [EconomicEventResponse(id=str(e.id), title=e.title, country=e.country, date=e.date.isoformat(), impact=e.impact.value, previous=e.previous, forecast=e.forecast, actual=e.actual, category=e.category) for e in events]
