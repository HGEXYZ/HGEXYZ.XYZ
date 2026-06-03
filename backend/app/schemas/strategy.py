from pydantic import BaseModel
from typing import Optional, List

class StrategyRequest(BaseModel):
    description: str
    target_language: str = "pine_script"
    additional_context: Optional[str] = None

class StrategyResponse(BaseModel):
    code: str
    language: str
    documentation: str
    explanation: str

class ChartAnalysisRequest(BaseModel):
    image_base64: str
    symbol: Optional[str] = None
    timeframe: Optional[str] = None

class ChartAnalysisResponse(BaseModel):
    patterns: List[str]
    support_resistance: dict
    trend: str
    setup_quality: str
    score: int
    analysis: str
