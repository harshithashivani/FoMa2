from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alerts import DismissedNotification
from app.models.inventory import ExpiryTone, InventoryItem
from app.models.settings import NotificationSettings
from app.schemas.notifications import NotificationOut


async def get_or_create_settings(db: AsyncSession) -> NotificationSettings:
    result = await db.execute(select(NotificationSettings).where(NotificationSettings.id == 1))
    settings_row = result.scalar_one_or_none()
    if settings_row is None:
        settings_row = NotificationSettings(id=1)
        db.add(settings_row)
        await db.commit()
        await db.refresh(settings_row)
    return settings_row


async def compute_notifications(db: AsyncSession) -> list[NotificationOut]:
    settings_row = await get_or_create_settings(db)
    dismissed_result = await db.execute(select(DismissedNotification.notification_key))
    dismissed_keys = {row[0] for row in dismissed_result.all()}

    items_result = await db.execute(select(InventoryItem))
    items = items_result.scalars().all()

    notifications: list[NotificationOut] = []

    for item in items:
        if settings_row.expiry_warnings and item.expiry_tone == ExpiryTone.urgent:
            key = f"expiry:{item.id}"
            if key not in dismissed_keys:
                notifications.append(
                    NotificationOut(
                        key=key,
                        title=f"{item.material} expiring soon",
                        detail=f"Expiry date approaching: {item.expiry_date.isoformat()}",
                        tone="urgent",
                        time="just now",
                    )
                )

        if settings_row.wastage_alerts and item.wastage_pct >= 5:
            key = f"wastage:{item.id}"
            if key not in dismissed_keys:
                notifications.append(
                    NotificationOut(
                        key=key,
                        title=f"High wastage: {item.material}",
                        detail=f"Wastage rate at {item.wastage_pct:.1f}% — above 5% threshold",
                        tone="warning",
                        time="just now",
                    )
                )

        if (
            settings_row.auto_order_reminders
            and not item.auto_order
            and item.expiry_tone == ExpiryTone.urgent
        ):
            key = f"autoorder:{item.id}"
            if key not in dismissed_keys:
                notifications.append(
                    NotificationOut(
                        key=key,
                        title=f"Auto-order disabled for {item.material}",
                        detail="Stock is low and auto-order is off",
                        tone="warning",
                        time="just now",
                    )
                )

    return notifications