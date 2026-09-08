"""
Internal event bus.

Every place in this codebase that needs to "publish" something (a new
sensor reading, an equipment status change, a new alert) goes through
this module instead of talking to WebSockets or a broker directly.

Today it's an in-process pub/sub used to push updates to connected
WebSocket clients. When Kafka/MQTT are introduced, this is the module
that gets swapped: publish() starts producing to a Kafka topic (and/or
consuming from MQTT bridges), while the rest of the app - routers,
services, simulator - doesn't need to change at all.
"""

import asyncio
import json
from collections.abc import Callable, Coroutine
from typing import Any

Listener = Callable[[dict[str, Any]], Coroutine[Any, Any, None]]


class EventBus:
    def __init__(self) -> None:
        self._listeners: list[Listener] = []

    def subscribe(self, listener: Listener) -> None:
        self._listeners.append(listener)

    def unsubscribe(self, listener: Listener) -> None:
        if listener in self._listeners:
            self._listeners.remove(listener)

    async def publish(self, event_type: str, payload: dict[str, Any]) -> None:
        message = {"type": event_type, "data": payload}
        # Fan out to all subscribers (e.g. WebSocket connection managers).
        # TODO(kafka): also produce `message` to the relevant Kafka topic here,
        # e.g. topic=f"foma.{event_type}", value=json.dumps(message).
        await asyncio.gather(
            *(listener(message) for listener in self._listeners),
            return_exceptions=True,
        )

    def to_json(self, message: dict[str, Any]) -> str:
        return json.dumps(message, default=str)


event_bus = EventBus()