from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.equipment import Equipment
from app.models.telemetry import EquipmentMetric
from app.schemas.equipment import EquipmentMetricOut, EquipmentOut

router = APIRouter(prefix="/api/equipment", tags=["equipment"])


@router.get("", response_model=list[EquipmentOut])
async def list_equipment(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Equipment).order_by(Equipment.name))
    return result.scalars().all()


@router.get("/{equipment_id}/metrics", response_model=list[EquipmentMetricOut])
async def equipment_metrics(equipment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EquipmentMetric)
        .where(EquipmentMetric.equipment_id == equipment_id)
        .order_by(EquipmentMetric.time.desc())
        .limit(200)
    )
    return result.scalars().all()