import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, Float, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
import enum

class Sentiment(str, enum.Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"

class Impact(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500))
    source: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(2000), unique=True)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=True)
    sentiment: Mapped[Sentiment] = mapped_column(SAEnum(Sentiment), nullable=True)
    sentiment_score: Mapped[float] = mapped_column(Float, nullable=True)
    impact: Mapped[Impact] = mapped_column(SAEnum(Impact), nullable=True)
    symbols: Mapped[str] = mapped_column(String(500), nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class EconomicEvent(Base):
    __tablename__ = "economic_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500))
    country: Mapped[str] = mapped_column(String(100))
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    impact: Mapped[Impact] = mapped_column(SAEnum(Impact))
    previous: Mapped[float] = mapped_column(Float, nullable=True)
    forecast: Mapped[float] = mapped_column(Float, nullable=True)
    actual: Mapped[float] = mapped_column(Float, nullable=True)
    category: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text, nullable=True)
