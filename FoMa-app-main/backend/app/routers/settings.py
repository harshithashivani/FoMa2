from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.schemas.settings import NotificationSettingsOut, NotificationSettingsUpdate
from app.services.notifications import get_or_create_settings

router = APIRouter(prefix="/api/settings", tags=["settings"], dependencies=[Depends(get_current_user)])


@router.get("/notifications", response_model=NotificationSettingsOut)
async def get_notification_settings(db: AsyncSession = Depends(get_db)):
    return await get_or_create_settings(db)


@router.put("/notifications", response_model=NotificationSettingsOut)
async def update_notification_settings(
    payload: NotificationSettingsUpdate, db: AsyncSession = Depends(get_db)
):
    settings_row = await get_or_create_settings(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings_row, field, value)
    await db.commit()
    await db.refresh(settings_row)
    return settings_row