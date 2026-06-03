from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1 import auth, chat, markets, scanner, backtest, portfolio, news, strategies, admin, subscriptions
from app.core.rate_limit import rate_limit

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, docs_url="/docs" if settings.DEBUG else None, redoc_url="/redoc" if settings.DEBUG else None)

app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS.split(","), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

if settings.SENTRY_DSN:
    import sentry_sdk
    sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith(settings.API_PREFIX):
        try:
            await rate_limit(request)
        except:
            pass
    return await call_next(request)

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(chat.router, prefix=settings.API_PREFIX)
app.include_router(markets.router, prefix=settings.API_PREFIX)
app.include_router(scanner.router, prefix=settings.API_PREFIX)
app.include_router(backtest.router, prefix=settings.API_PREFIX)
app.include_router(portfolio.router, prefix=settings.API_PREFIX)
app.include_router(news.router, prefix=settings.API_PREFIX)
app.include_router(strategies.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(subscriptions.router, prefix=settings.API_PREFIX)

@app.get("/health")
async def health():
    return {"status": "healthy", "version": settings.VERSION}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
