from sqlalchemy import Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class FacilityState(Base):
    """Single-row table (id is always 1) holding facility-wide operational
    state shared across every connected client."""

    __tablename__ = "facility_state"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    emergency_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)