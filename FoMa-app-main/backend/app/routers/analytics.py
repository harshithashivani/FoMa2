from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class WasteTrendPoint(BaseModel):
    week_start: str
    avg_wastage_pct: float


@router.get("/waste-trends", response_model=list[WasteTrendPoint])
async def waste_trends(db: AsyncSession = Depends(get_db)):
    """Weekly average wastage % across all inventory items, using
    TimescaleDB's time_bucket() over the raw sensor-derived readings."""
    result = await db.execute(
        text(
            """
            SELECT
                time_bucket('7 days', time) AS week_start,
                avg(wastage_pct) AS avg_wastage_pct
            FROM inventory_wastage_readings
            GROUP BY week_start
            ORDER BY week_start DESC
            LIMIT 12
            """
        )
    )
    rows = result.all()
    return [
        WasteTrendPoint(week_start=row.week_start.date().isoformat(), avg_wastage_pct=round(row.avg_wastage_pct, 2))
        for row in rows
    ]


@router.get("/equipment-health")
async def equipment_health(db: AsyncSession = Depends(get_db)):
    """Recent average metric values per equipment/metric, last 24h."""
    result = await db.execute(
        text(
            """
            SELECT
                e.name AS equipment_name,
                em.metric,
                avg(em.value) AS avg_value,
                max(em.unit) AS unit
            FROM equipment_metrics em
            JOIN equipment e ON e.id = em.equipment_id
            WHERE em.time > now() - interval '24 hours'
            GROUP BY e.name, em.metric
            ORDER BY e.name, em.metric
            """
        )
    )
    return [
        {
            "equipment_name": row.equipment_name,
            "metric": row.metric,
            "avg_value": round(row.avg_value, 2),
            "unit": row.unit,
        }
        for row in result.all()
    ]