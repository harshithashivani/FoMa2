import datetime

from pydantic import BaseModel, ConfigDict

from app.models.equipment import EquipmentStatus


class EquipmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    status: EquipmentStatus
    detail: str
    updated_at: datetime.datetime


class EquipmentMetricOut(BaseModel):
    time: datetime.datetime
    metric: str
    value: float
    unit: str