import redis.asyncio as redis
from fastapi import Request, HTTPException, status
from app.core.config import settings

redis_client = None

async def get_redis():
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client

async def rate_limit(request: Request, limit: int = None):
    if limit is None:
        limit = settings.RATE_LIMIT_PER_MINUTE
    client_ip = request.client.host if request.client else "unknown"
    r = await get_redis()
    key = f"rate_limit:{client_ip}:{request.url.path}"
    current = await r.incr(key)
    if current == 1:
        await r.expire(key, 60)
    if current > limit:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
