import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.events import event_bus
from app.models.inventory import ExpiryTone, InventoryItem
from app.models.telemetry import InventoryWastageReading
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemOut,
    InventoryItemUpdate,
    WastageReadingOut,
)

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


def _derive_expiry_tone(expiry_date: datetime.date) -> ExpiryTone:
    days_left = (expiry_date - datetime.date.today()).days
    return ExpiryTone.urgent if days_left <= 21 else ExpiryTone.good


@router.get("", response_model=list[InventoryItemOut])
async def list_inventory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InventoryItem).order_by(InventoryItem.material))
    return result.scalars().all()


@router.post("", response_model=InventoryItemOut, status_code=201)
async def create_inventory_item(payload: InventoryItemCreate, db: AsyncSession = Depends(get_db)):
    item = InventoryItem(
        **payload.model_dump(),
        expiry_tone=_derive_expiry_tone(payload.expiry_date),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    await event_bus.publish("inventory_created", {"id": item.id, "material": item.material})
    return item


@router.patch("/{item_id}", response_model=InventoryItemOut)
async def update_inventory_item(
    item_id: int, payload: InventoryItemUpdate, db: AsyncSession = Depends(get_db)
):
    item = await db.get(InventoryItem, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(item, field, value)
    if "expiry_date" in updates:
        item.expiry_tone = _derive_expiry_tone(item.expiry_date)

    await db.commit()
    await db.refresh(item)
    await event_bus.publish(
        "inventory_updated", {"id": item.id, "auto_order": item.auto_order}
    )
    return item


@router.get("/{item_id}/wastage-history", response_model=list[WastageReadingOut])
async def wastage_history(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(InventoryWastageReading)
        .where(InventoryWastageReading.inventory_item_id == item_id)
        .order_by(InventoryWastageReading.time.desc())
        .limit(500)
    )
    return result.scalars().all()