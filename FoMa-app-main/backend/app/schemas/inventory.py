import datetime

from pydantic import BaseModel, ConfigDict

from app.models.inventory import ExpiryTone


class InventoryItemBase(BaseModel):
    material: str
    quantity: float
    unit: str = "kg"
    expiry_date: datetime.date
    wastage_pct: float = 0
    auto_order: bool = False


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    material: str | None = None
    quantity: float | None = None
    unit: str | None = None
    expiry_date: datetime.date | None = None
    wastage_pct: float | None = None
    auto_order: bool | None = None


class InventoryItemOut(InventoryItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    expiry_tone: ExpiryTone
    created_at: datetime.datetime
    updated_at: datetime.datetime


class WastageReadingOut(BaseModel):
    time: datetime.datetime
    wastage_pct: float