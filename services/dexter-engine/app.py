"""
DEXTER Bot — AI Trading Engine
Inspired by the Dexter Bot methodology (Reda Saloh / Dexter Software Solutions).
Gap-based strategy + support/resistance detection + adaptive risk management.
"""
from __future__ import annotations
import os
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from src.models.models import (
    AssetConfig, Direction, HealthResponse, ConfigResponse, SignalOut,
    TradeRequest, TradePositionOut, ClosedTradeOut, PortfolioSummaryOut,
)
from src.signals.signal_generator import (
    DexterSignalGenerator, SUPPORTED_ASSETS, DEFAULT_ASSET_CONFIGS,
)
from src.signals.redis_client import DexterRedisClient
from src.risk.risk_manager import RiskManager
from src.data.market_data import create_data_provider
from src.trading.paper_trader import PaperTrader

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s %(message)s")
logger = logging.getLogger("dexter")

START_TIME = time.time()
generator: DexterSignalGenerator | None = None
redis_client: DexterRedisClient | None = None
paper_trader: PaperTrader | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global generator, redis_client, paper_trader
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = DexterRedisClient(redis_url)
    await redis_client.connect()
    risk_mgr = RiskManager(
        global_risk_per_trade_pct=float(os.getenv("DEXTER_RISK_PER_TRADE", "1.0")),
        max_daily_loss_pct=float(os.getenv("DEXTER_MAX_DAILY_LOSS", "5.0")),
        max_open_trades=int(os.getenv("DEXTER_MAX_OPEN_TRADES", "5")),
    )
    data_provider = create_data_provider()
    generator = DexterSignalGenerator(risk_manager=risk_mgr, data_provider=data_provider)
    paper_trader = PaperTrader(initial_balance=float(os.getenv("DEXTER_INITIAL_BALANCE", "10000.0")))
    logger.info("DEXTER engine initialized. Managing %d assets", len(SUPPORTED_ASSETS))
    yield
    if redis_client:
        await redis_client.disconnect()


app = FastAPI(title="DEXTER Bot Engine", version="1.0.0", lifespan=lifespan)


@app.get("/api/v1/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        uptime=time.time() - START_TIME,
        managed_assets=list(SUPPORTED_ASSETS),
        active_strategies=["gap_sr"],
    )


@app.get("/api/v1/dexter/config", response_model=ConfigResponse)
async def get_config():
    if generator is None:
        raise HTTPException(503, "Engine not initialized")
    return ConfigResponse(
        assets=list(generator.asset_configs.values()),
        global_risk_per_trade_pct=generator.risk_manager.global_risk_per_trade_pct,
        max_daily_loss_pct=generator.risk_manager.max_daily_loss_pct,
        max_open_trades=generator.risk_manager.max_open_trades,
        redis_enabled=redis_client.connected if redis_client else False,
    )


@app.get("/api/v1/dexter/signal/{symbol}")
async def get_signal(symbol: str):
    if generator is None:
        raise HTTPException(503, "Engine not initialized")
    sig = await generator.generate_signal(symbol.upper())
    if sig is None:
        raise HTTPException(404, f"No signal generated for {symbol.upper()}")
    if redis_client:
        await redis_client.publish_signal_alert(sig.model_dump())
    return {"data": sig.model_dump()}


@app.get("/api/v1/dexter/scan")
async def scan_all():
    if generator is None:
        raise HTTPException(503, "Engine not initialized")
    signals = await generator.scan_all()
    if redis_client:
        for sig in signals:
            await redis_client.publish_signal_alert(sig.model_dump())
    return {"data": [s.model_dump() for s in signals], "total": len(signals)}


@app.post("/api/v1/dexter/trade", response_model=dict)
async def open_trade(req: TradeRequest):
    if generator is None or paper_trader is None:
        raise HTTPException(503, "Engine not initialized")
    symbol = req.symbol.upper()
    sym_config = generator.asset_configs.get(symbol)
    if not sym_config or not sym_config.enabled:
        raise HTTPException(400, f"Symbol {symbol} not supported or disabled")
    entry = req.entry_price
    sl = req.stop_loss
    targets = req.targets
    direction = req.direction
    if req.generate_signal or entry is None:
        sig = await generator.generate_signal(symbol)
        if sig is None:
            raise HTTPException(400, f"Could not generate signal for {symbol}")
        entry = sig.entry_price
        sl = sig.stop_loss
        targets = sig.targets
        direction = sig.direction
    pos_size = req.position_size
    if pos_size is None:
        pos_size = sym_config.max_position_size * 0.1
    pos = paper_trader.open_trade(
        symbol=symbol,
        direction=direction.value if isinstance(direction, Direction) else direction,
        entry_price=entry,
        stop_loss=sl,
        targets=targets or [],
        position_size=pos_size,
    )
    if redis_client:
        await redis_client.publish_trade({
            "action": "OPEN",
            "trade_id": pos.trade_id,
            "symbol": pos.symbol,
            "direction": pos.direction,
            "entry_price": pos.entry_price,
            "position_size": pos.position_size,
        })
    return {"data": TradePositionOut(**pos.__dict__, unrealized_pnl=pos.unrealized_pnl).model_dump()}


@app.post("/api/v1/dexter/trade/{trade_id}/close")
async def close_trade(trade_id: str, close_price: float | None = None):
    if paper_trader is None:
        raise HTTPException(503, "Engine not initialized")
    pos = paper_trader.get_position(trade_id)
    if pos is None:
        raise HTTPException(404, f"Trade {trade_id} not found")
    price = close_price if close_price is not None else pos.current_price
    closed = paper_trader.close_trade(trade_id, price, exit_reason="manual")
    if redis_client:
        await redis_client.publish_trade({
            "action": "CLOSE",
            "trade_id": closed.trade_id,
            "symbol": closed.symbol,
            "realized_pnl": closed.realized_pnl,
            "exit_reason": closed.exit_reason,
        })
    return {"data": ClosedTradeOut(**closed.__dict__).model_dump()}


@app.get("/api/v1/dexter/positions")
async def list_positions():
    if paper_trader is None:
        raise HTTPException(503, "Engine not initialized")
    positions = paper_trader.get_positions()
    return {"data": [TradePositionOut(**p.__dict__, unrealized_pnl=p.unrealized_pnl).model_dump() for p in positions], "total": len(positions)}


@app.get("/api/v1/dexter/trades")
async def trade_history():
    if paper_trader is None:
        raise HTTPException(503, "Engine not initialized")
    trades = paper_trader.get_trade_history()
    return {"data": [ClosedTradeOut(**t.__dict__).model_dump() for t in trades], "total": len(trades)}


@app.get("/api/v1/dexter/portfolio", response_model=dict)
async def portfolio():
    if generator is None or paper_trader is None:
        raise HTTPException(503, "Engine not initialized")
    rm = generator.risk_manager
    s = rm.state
    ps = paper_trader.get_summary()
    return {
        "data": {
            "balance": round(s.balance, 2),
            "equity": round(s.equity, 2),
            "open_trades": s.open_trades,
            "daily_pnl": round(s.daily_pnl, 2),
            "peak_balance": round(s.peak_balance, 2),
            "max_drawdown_pct": round(
                ((s.peak_balance - s.balance) / s.peak_balance * 100)
                if s.peak_balance > 0 else 0, 2
            ),
            "trades_today": s.trades_today,
            "open_positions": ps.open_positions,
            "total_trades_history": ps.total_trades,
            "unrealized_pnl": ps.unrealized_pnl,
            "win_rate": ps.win_rate,
        }
    }
