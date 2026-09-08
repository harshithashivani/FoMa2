from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.alerts import DismissedNotification
from app.schemas.notifications import NotificationOut
from app.services.notifications import compute_notifications

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
async def get_notifications(db: AsyncSession = Depends(get_db)):
    return await compute_notifications(db)


@router.post("/{key}/dismiss", status_code=204)
async def dismiss_notification(key: str, db: AsyncSession = Depends(get_db)):
    stmt = pg_insert(DismissedNotification).values(notification_key=key)
    stmt = stmt.on_conflict_do_nothing(index_elements=["notification_key"])
    await db.execute(stmt)
    await db.commit()


@router.post("/clear-all", status_code=204)
async def clear_all_notifications(db: AsyncSession = Depends(get_db)):
    notifications = await compute_notifications(db)
    for n in notifications:
        stmt = pg_insert(DismissedNotification).values(notification_key=n.key)
        stmt = stmt.on_conflict_do_nothing(index_elements=["notification_key"])
        await db.execute(stmt)
    await db.commit()


@router.post("/reset-dismissed", status_code=204)
async def reset_dismissed(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(DismissedNotification))
    await db.commit()