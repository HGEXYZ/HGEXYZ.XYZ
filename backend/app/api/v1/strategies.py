from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.strategy import StrategyRequest, StrategyResponse, ChartAnalysisRequest, ChartAnalysisResponse
from app.services.strategy.service import strategy_service

router = APIRouter(prefix="/strategies", tags=["strategies"])

@router.post("/generate")
async def generate_strategy(req: StrategyRequest, user: User = Depends(get_current_user)):
    return await strategy_service.generate(req)

@router.post("/analyze-chart")
async def analyze_chart(req: ChartAnalysisRequest, user: User = Depends(get_current_user)):
    return await strategy_service.analyze_chart(req)

@router.post("/analyze-chart/upload")
async def analyze_chart_upload(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    import base64
    contents = await file.read()
    b64 = base64.b64encode(contents).decode("utf-8")
    req = ChartAnalysisRequest(image_base64=b64)
    return await strategy_service.analyze_chart(req)
