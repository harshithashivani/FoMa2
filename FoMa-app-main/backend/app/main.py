import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text

from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.db.seed import seed_if_empty
from app.routers import alerts, analytics, equipment, inventory, notifications, production, settings as settings_router, ws
from app.services.simulator import run_simulator

# Import all models so they're registered on Base.metadata before create_all.
from app.models import alerts as _alerts_models  # noqa: F401
from app.models import equipment as _equipment_models  # noqa: F401
from app.models import inventory as _inventory_models  # noqa: F401
from app.models import production as _production_models  # noqa: F401
from app.models import settings as _settings_models  # noqa: F401
from app.models import telemetry as _telemetry_models  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("foma.main")

_simulator_task: asyncio.Task | None = None


def _run_timescale_init() -> None:
    """Runs init_timescale.sql with a sync engine (simpler for raw DDL)."""
    import pathlib

    sql_path = pathlib.Path(__file__).parent / "db" / "init_timescale.sql"
    sql = sql_path.read_text()

    sync_engine = create_engine(settings.SYNC_DATABASE_URL)
    with sync_engine.begin() as conn:
        for statement in sql.split(";"):
            statement = statement.strip()
            if statement:
                conn.execute(text(statement))
    sync_engine.dispose()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _simulator_task

    # Create relational tables (dev-friendly; swap for Alembic migrations
    # once the schema stabilizes).
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Convert telemetry tables into TimescaleDB hypertables.
    _run_timescale_init()

    async with AsyncSessionLocal() as db:
        await seed_if_empty(db)

    _simulator_task = asyncio.create_task(run_simulator())
    logger.info("FoMa backend ready")

    yield

    if _simulator_task:
        _simulator_task.cancel()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory.router)
app.include_router(equipment.router)
app.include_router(production.router)
app.include_router(alerts.router)
app.include_router(notifications.router)
app.include_router(settings_router.router)
app.include_router(analytics.router)
app.include_router(ws.router)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}