from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
import json

router = APIRouter()

@router.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str = "global"):
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            await manager.broadcast({"type": "message", "data": msg, "channel": channel}, channel)
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
    except Exception:
        manager.disconnect(websocket, channel)
