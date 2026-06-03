from fastapi import WebSocket
from typing import Set, Dict
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str = "global"):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str = "global"):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)

    async def broadcast(self, message: dict, channel: str = "global"):
        if channel not in self.active_connections:
            return
        dead = set()
        for ws in self.active_connections[channel]:
            try:
                await ws.send_json(message)
            except:
                dead.add(ws)
        self.active_connections[channel] -= dead

manager = ConnectionManager()
