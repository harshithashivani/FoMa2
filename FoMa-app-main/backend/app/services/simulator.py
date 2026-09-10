"""
Telemetry simulator.

Stands in for the physical edge gateway (which will eventually read PLC/
sensor data on-site and publish it over MQTT). This background task
generates plausible equipment metrics and occasional status/production
changes, writes them to the DB, and publishes them on the internal
event bus so connected WebSocket clients see live updates.

To replace with real ingestion later: implement an MQTT subscriber that
calls the same `record_equipment_metric` / `update_equipment_status`
helpers used here, and disable SIMULATOR_ENABLED.
"""

import asyncio
import logging
import random
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.events import event_bus
from app.models.equipment import Equipment, EquipmentStatus
from app.models.inventory import InventoryItem
from app.models.production import BatchStatus, ProductionBatch
from app.models.telemetry import EquipmentMetric, InventoryWastageReading

logger = logging.getLogger("foma.simulator")

METRIC_RANGES = {
    "vibration": (0.1, 4.5, "mm/s"),
    "temperature": (60, 220, "°C"),
    "flow_rate": (10, 120, "L/min"),
}

# Keeps the description text consistent with whatever status a piece of
# equipment just flipped to, instead of leaving stale seed-data text
# ("vibration above threshold") sitting under an unrelated status badge.
STATUS_DETAILS = {
    EquipmentStatus.operational: [
        "Running normally · all sensors nominal",
        "Operating within normal parameters",
        "Nominal output · no issues detected",
    ],
    EquipmentStatus.warning: [
        "Vibration above threshold · service recommended",
        "Reading trending outside normal range",
        "Minor anomaly detected · monitoring closely",
    ],
    EquipmentStatus.offline: [
        "Manual stop engaged · awaiting maintenance",
        "Unit offline · service required",
        "Shutdown triggered · inspection needed",
    ],
}


async def _tick() -> None:
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)

        # --- Equipment metrics -------------------------------------------------
        equipment_result = await db.execute(select(Equipment))
        equipment_list = equipment_result.scalars().all()

        for eq in equipment_list:
            metric_name = random.choice(list(METRIC_RANGES.keys()))
            low, high, unit = METRIC_RANGES[metric_name]
            value = round(random.uniform(low, high), 2)

            reading = EquipmentMetric(
                time=now, equipment_id=eq.id, metric=metric_name, value=value, unit=unit
            )
            db.add(reading)

            # Small chance of a status flip, biased toward staying operational.
            if random.random() < 0.03:
                eq.status = random.choices(
                    [EquipmentStatus.operational, EquipmentStatus.warning, EquipmentStatus.offline],
                    weights=[0.7, 0.22, 0.08],
                )[0]
                eq.detail = random.choice(STATUS_DETAILS[eq.status])

            await event_bus.publish(
                "equipment_metric",
                {
                    "equipment_id": eq.id,
                    "equipment_name": eq.name,
                    "metric": metric_name,
                    "value": value,
                    "unit": unit,
                    "status": eq.status.value,
                    "detail": eq.detail,
                    "time": now.isoformat(),
                },
            )

        # --- Production batch progress -----------------------------------------
        batches_result = await db.execute(
            select(ProductionBatch).where(ProductionBatch.status == BatchStatus.running)
        )
        for batch in batches_result.scalars().all():
            if batch.progress < 100:
                batch.progress = min(100, batch.progress + random.randint(1, 4))
                if batch.progress >= 100:
                    batch.status = BatchStatus.completed
                await event_bus.publish(
                    "production_update",
                    {"batch_id": batch.id, "progress": batch.progress, "status": batch.status.value},
                )

        # --- Inventory wastage drift ---------------------------------------------
        inventory_result = await db.execute(select(InventoryItem))
        for item in inventory_result.scalars().all():
            drift = round(random.uniform(-0.15, 0.2), 2)
            item.wastage_pct = max(0.0, round(item.wastage_pct + drift, 2))
            db.add(
                InventoryWastageReading(time=now, inventory_item_id=item.id, wastage_pct=item.wastage_pct)
            )

        await db.commit()


async def run_simulator() -> None:
    if not settings.SIMULATOR_ENABLED:
        logger.info("Simulator disabled (SIMULATOR_ENABLED=false)")
        return

    logger.info("Telemetry simulator started (interval=%ss)", settings.SIMULATOR_INTERVAL_SECONDS)
    while True:
        try:
            await _tick()
        except Exception:
            logger.exception("Simulator tick failed")
        await asyncio.sleep(settings.SIMULATOR_INTERVAL_SECONDS)