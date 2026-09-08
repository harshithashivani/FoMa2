from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.events import event_bus
from app.models.production import ProductionBatch
from app.schemas.production import ProductionBatchOut, ProductionBatchUpdate

router = APIRouter(prefix="/api/production", tags=["production"])


@router.get("", response_model=list[ProductionBatchOut])
async def list_batches(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductionBatch).order_by(ProductionBatch.start_time))
    return result.scalars().all()


@router.patch("/{batch_id}", response_model=ProductionBatchOut)
async def update_batch(batch_id: int, payload: ProductionBatchUpdate, db: AsyncSession = Depends(get_db)):
    batch = await db.get(ProductionBatch, batch_id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(batch, field, value)

    await db.commit()
    await db.refresh(batch)
    await event_bus.publish(
        "production_update", {"batch_id": batch.id, "progress": batch.progress, "status": batch.status.value}
    )
    return batch