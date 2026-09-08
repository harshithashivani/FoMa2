import datetime

from pydantic import BaseModel, ConfigDict

from app.models.alerts import AlertSeverity


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    severity: AlertSeverity
    message: str
    source: str
    created_at: datetime.datetime