"""
Seeds the database with the same demo data the original React app had
hardcoded in data.ts, so the API returns something meaningful on first
run. Only inserts if the tables are empty - safe to call on every startup.
"""

import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.alerts import Alert, AlertSeverity
from app.models.equipment import Equipment, EquipmentStatus
from app.models.inventory import ExpiryTone, InventoryItem
from app.models.production import BatchStatus, ProductionBatch
from app.models.user import User


async def seed_if_empty(db: AsyncSession) -> None:
    count = (await db.execute(select(func.count()).select_from(InventoryItem))).scalar_one()
    if count > 0:
        return  # already seeded

    today = datetime.date.today()

    db.add_all(
        [
            InventoryItem(
                material="Industrial Flour Type A", quantity=14500, unit="kg",
                expiry_date=today + datetime.timedelta(days=180), expiry_tone=ExpiryTone.good,
                wastage_pct=2.4, auto_order=True,
            ),
            InventoryItem(
                material="Granulated Sugar", quantity=8200, unit="kg",
                expiry_date=today + datetime.timedelta(days=365), expiry_tone=ExpiryTone.good,
                wastage_pct=1.1, auto_order=True,
            ),
            InventoryItem(
                material="Palm Oil Blend", quantity=1200, unit="L",
                expiry_date=today + datetime.timedelta(days=14), expiry_tone=ExpiryTone.urgent,
                wastage_pct=8.5, auto_order=False,
            ),
            InventoryItem(
                material="Cocoa Powder", quantity=4500, unit="kg",
                expiry_date=today + datetime.timedelta(days=240), expiry_tone=ExpiryTone.good,
                wastage_pct=3.2, auto_order=True,
            ),
            InventoryItem(
                material="Salt (Bulk)", quantity=2100, unit="kg",
                expiry_date=today + datetime.timedelta(days=730), expiry_tone=ExpiryTone.good,
                wastage_pct=0.5, auto_order=False,
            ),
        ]
    )

    db.add_all(
        [
            Equipment(name="Mixer Unit A-12", status=EquipmentStatus.operational,
                      detail="Running normally · 142h since last service"),
            Equipment(name="Conveyor Belt 3", status=EquipmentStatus.warning,
                      detail="Vibration above threshold · service due in 48h"),
            Equipment(name="Oven Section B", status=EquipmentStatus.operational,
                      detail="Temperature stable · all sensors nominal"),
            Equipment(name="Packaging Line 2", status=EquipmentStatus.offline,
                      detail="Manual stop engaged · awaiting maintenance"),
            Equipment(name="Cooling Tower C", status=EquipmentStatus.operational,
                      detail="Flow rate optimal · 88% efficiency"),
        ]
    )

    db.add_all(
        [
            ProductionBatch(product="Artisan Bread Loaf 500g", status=BatchStatus.running,
                             start_time="06:00", end_time="14:00", progress=65),
            ProductionBatch(product="Chocolate Cookies 200g", status=BatchStatus.scheduled,
                             start_time="14:00", end_time="20:00", progress=0),
            ProductionBatch(product="Whole Wheat Rolls 100g", status=BatchStatus.completed,
                             start_time="22:00", end_time="06:00", progress=100),
            ProductionBatch(product="Premium Cake Mix 1kg", status=BatchStatus.delayed,
                             start_time="08:00", end_time="12:00", progress=30),
            ProductionBatch(product="Sugar-Free Biscuits 150g", status=BatchStatus.scheduled,
                             start_time="20:00", end_time="02:00", progress=0),
        ]
    )

    db.add_all(
        [
            Alert(severity=AlertSeverity.critical,
                  message="Palm Oil Blend stock critically low — 2 weeks to expiry",
                  source="Inventory Monitor"),
            Alert(severity=AlertSeverity.warning,
                  message="Conveyor Belt 3 vibration above safe threshold",
                  source="Equipment Sensor"),
            Alert(severity=AlertSeverity.warning,
                  message="Premium Cake Mix batch running 2h behind schedule",
                  source="Production Planner"),
            Alert(severity=AlertSeverity.info,
                  message="Daily waste report generated — Week 4 down 40%",
                  source="Analytics Engine"),
        ]
    )

    db.add(
        User(
            email="manager@foma.example",
            hashed_password=hash_password("foma-demo-123"),
            name="Alex Rivera",
            role="Plant Manager",
        )
    )

    await db.commit()