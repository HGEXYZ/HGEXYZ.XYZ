from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NewsResponse(BaseModel):
    id: str
    title: str
    source: str
    url: str
    summary: Optional[str]
    sentiment: Optional[str]
    sentiment_score: Optional[float]
    impact: Optional[str]
    symbols: Optional[str]
    published_at: str

class EconomicEventResponse(BaseModel):
    id: str
    title: str
    country: str
    date: str
    impact: str
    previous: Optional[float]
    forecast: Optional[float]
    actual: Optional[float]
    category: str
