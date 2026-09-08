from typing import Literal

from pydantic import BaseModel


class NotificationOut(BaseModel):
    key: str
    title: str
    detail: str
    tone: Literal["urgent", "warning", "info"]
    time: str