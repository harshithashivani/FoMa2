from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.core.events import event_bus
from app.models.facility import FacilityState
from app.schemas.facility import FacilityStateOut

router = APIRouter(prefix="/api/facility", tags=["facility"], dependencies=[Depends(get_current_user)])


async def _get_or_create_state(db: AsyncSession) -> FacilityState:
    result = await db.execute(select(FacilityState).where(FacilityState.id == 1))
    state = result.scalar_one_or_none()
    if state is None:
        state = FacilityState(id=1, emergency_active=False)
        db.add(state)
        await db.commit()
        await db.refresh(state)
    return state


@router.get("/state", response_model=FacilityStateOut)
async def get_state(db: AsyncSession = Depends(get_db)):
    return await _get_or_create_state(db)


@router.post(
    "/emergency-stop",
    response_model=FacilityStateOut,
    dependencies=[Depends(require_role("Plant Manager"))],
)
async def emergency_stop(db: AsyncSession = Depends(get_db)):
    state = await _get_or_create_state(db)
    state.emergency_active = True
    await db.commit()
    await db.refresh(state)
    await event_bus.publish("facility_state", {"emergency_active": True})
    return state


@router.post(
    "/resume",
    response_model=FacilityStateOut,
    dependencies=[Depends(require_role("Plant Manager"))],
)
async def resume_operations(db: AsyncSession = Depends(get_db)):
    state = await _get_or_create_state(db)
    state.emergency_active = False
    await db.commit()
    await db.refresh(state)
    await event_bus.publish("facility_state", {"emergency_active": False})
    return state