"""
WebSocket endpoint that pushes live events (equipment metrics, status
changes, production progress, new alerts) to connected frontend clients.

Today the only publisher is the in-process simulator via app.core.events.
When Kafka/MQTT are introduced, a Kafka consumer can publish to the same
event_bus and this endpoint doesn't need to change.
"""

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.events import event_bus

logger = logging.getLogger("foma.ws")

router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.active: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, message: dict) -> None:
        payload = event_bus.to_json(message)
        stale: list[WebSocket] = []
        for connection in self.active:
            try:
                await connection.send_text(payload)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)


manager = ConnectionManager()


async def _on_event(message: dict) -> None:
    await manager.broadcast(message)


# Registered once at import time; main.py imports this module before startup.
event_bus.subscribe(_on_event)


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect inbound messages right now, but keep the
            # receive loop alive to detect disconnects promptly.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)