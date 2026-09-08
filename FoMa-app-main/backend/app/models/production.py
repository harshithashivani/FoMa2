import enum

from sqlalchemy import Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BatchStatus(str, enum.Enum):
    scheduled = "scheduled"
    running = "running"
    completed = "completed"
    delayed = "delayed"


class ProductionBatch(Base):
    __tablename__ = "production_batches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[BatchStatus] = mapped_column(
        Enum(BatchStatus, name="batch_status"), nullable=False, default=BatchStatus.scheduled
    )
    start_time: Mapped[str] = mapped_column(String(10), nullable=False)  # "06:00"
    end_time: Mapped[str] = mapped_column(String(10), nullable=False)
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)