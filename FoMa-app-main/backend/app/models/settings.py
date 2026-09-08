from sqlalchemy import Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class NotificationSettings(Base):
    """Single-row table (id is always 1) holding the org's notification
    preferences. Swap to per-user rows once auth/multi-tenancy exists."""

    __tablename__ = "notification_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    expiry_warnings: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    wastage_alerts: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    auto_order_reminders: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    equipment_warnings: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    production_delays: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)