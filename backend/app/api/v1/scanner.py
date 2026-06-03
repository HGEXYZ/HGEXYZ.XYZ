from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import get_current_user
from app.models.user import User
from app.services.scanner.service import scanner_service
from app.services.smc.service import smc_service
from app.schemas.market import ScannerFilter, ScannerResult, SMCResult

router = APIRouter(prefix="/scanner", tags=["scanner"])

@router.post("/scan")
async def scan_markets(filters: ScannerFilter, user: User = Depends(get_current_user)):
    return await scanner_service.scan(filters)

@router.get("/smc/{symbol}")
async def get_smc_analysis(symbol: str, timeframe: str = "1h", user: User = Depends(get_current_user)):
    return await smc_service.analyze(symbol, timeframe)
