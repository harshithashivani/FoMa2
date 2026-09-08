import datetime

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Identity, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EquipmentMetric(Base):
    """
    Hypertable: high-frequency equipment sensor readings (vibration,
    temperature, flow rate, etc). Converted to a TimescaleDB hypertable
    by db/init_timescale.sql after table creation.

    Primary key is composite (id, time) because TimescaleDB requires the
    partitioning column ("time") to be part of any unique constraint.
    """

    __tablename__ = "equipment_metrics"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    time: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), primary_key=True, nullable=False
    )
    equipment_id: Mapped[int] = mapped_column(ForeignKey("equipment.id"), nullable=False)
    metric: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "vibration"
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False, default="")


class InventoryWastageReading(Base):
    """Hypertable: periodic wastage % snapshots per inventory item, used
    to drive the Analytics waste-trend charts over time."""

    __tablename__ = "inventory_wastage_readings"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    time: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), primary_key=True, nullable=False
    )
    inventory_item_id: Mapped[int] = mapped_column(
        ForeignKey("inventory_items.id"), nullable=False
    )
    wastage_pct: Mapped[float] = mapped_column(Float, nullable=False)