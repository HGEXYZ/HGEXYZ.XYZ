"""
Redis pub/sub client for emitting Dexter trading signals
to the rest of the platform (gateway, websocket service, etc).
"""
from __future__ import annotations
import json
import logging
from typing import Any
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


class DexterRedisClient:
    def __init__(self, redis_url: str | None = None):
        self.redis_url = redis_url or "redis://localhost:6379"
        self._client: aioredis.Redis | None = None
        self._pubsub: aioredis.Redis | None = None

    async def connect(self) -> None:
        try:
            self._client = aioredis.from_url(
                self.redis_url, decode_responses=True
            )
            await self._client.ping()
            self._pubsub = self._client
            logger.info("DexterRedisClient connected to %s", self.redis_url)
        except Exception as e:
            logger.warning("Redis not available: %s — signals will not be published", e)
            self._client = None

    async def disconnect(self) -> None:
        if self._client:
            await self._client.close()

    async def publish_signal(self, channel: str, data: dict[str, Any]) -> bool:
        if not self._client:
            logger.debug("Redis unavailable, skipping signal publish")
            return False
        try:
            payload = json.dumps(data, default=str)
            await self._client.publish(channel, payload)
            logger.info("Published signal to %s: %s", channel, data.get("asset", "unknown"))
            return True
        except Exception as e:
            logger.error("Failed to publish signal: %s", e)
            return False

    async def publish_trade(self, data: dict[str, Any]) -> bool:
        return await self.publish_signal("dexter:trades", data)

    async def publish_signal_alert(self, data: dict[str, Any]) -> bool:
        return await self.publish_signal("dexter:signals", data)

    @property
    def connected(self) -> bool:
        return self._client is not None
