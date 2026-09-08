from pydantic import BaseModel, ConfigDict

from app.models.production import BatchStatus


class ProductionBatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product: str
    status: BatchStatus
    start_time: str
    end_time: str
    progress: int


class ProductionBatchUpdate(BaseModel):
    status: BatchStatus | None = None
    progress: int | None = None