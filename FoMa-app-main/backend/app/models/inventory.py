import datetime
import enum

from sqlalchemy import Boolean, Date, DateTime, Enum, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ExpiryTone(str, enum.Enum):
    good = "good"
    urgent = "urgent"


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    material: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    unit: Mapped[str] = mapped_column(String(20), nullable=False, default="kg")
    expiry_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    expiry_tone: Mapped[ExpiryTone] = mapped_column(
        Enum(ExpiryTone, name="expiry_tone"), nullable=False, default=ExpiryTone.good
    )
    wastage_pct: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    auto_order: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )