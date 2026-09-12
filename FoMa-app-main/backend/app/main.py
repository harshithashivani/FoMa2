import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text

from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.db.seed import seed_if_empty
from app.routers import alerts, analytics, auth, equipment, facility, inventory, notifications, production, settings as settings_router, ws
from app.services.simulator import run_simulator

# Import all models so they're registered on Base.metadata before create_all.
from app.models import alerts as _alerts_models  # noqa: F401
from app.models import equipment as _equipment_models  # noqa: F401
from app.models import facility as _facility_models  # noqa: F401
from app.models import inventory as _inventory_models  # noqa: F401
from app.models import production as _production_models  # noqa: F401
from app.models import settings as _settings_models  # noqa: F401
from app.models import telemetry as _telemetry_models  # noqa: F401
from app.models import user as _user_models  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("foma.main")

_simulator_task: asyncio.Task | None = None


def _run_timescale_init() -> None:
    """Runs init_timescale.sql with a sync engine (simpler for raw DDL).

    Each statement runs in its own transaction and failures are logged
    rather than raised. This matters because some managed Postgres hosts
    (e.g. Render) only ship the Apache-2 edition of TimescaleDB, which
    doesn't include retention-policy functions (a paid "Community"
    feature) - without this, one unsupported statement would abort the
    whole startup even though hypertable creation itself works fine.
    """
    import pathlib

    sql_path = pathlib.Path(__file__).parent / "db" / "init_timescale.sql"
    sql = sql_path.read_text()

    sync_engine = create_engine(settings.SYNC_DATABASE_URL)
    for statement in sql.split(";"):
        statement = statement.strip()
        if not statement:
            continue
        try:
            with sync_engine.begin() as conn:
                conn.execute(text(statement))
        except Exception as exc:
            logger.warning(
                "Skipping a TimescaleDB init statement (likely an unsupported "
                "feature on this Postgres host, e.g. Community-only retention "
                "policies on managed Postgres). Statement: %.80s... | %s",
                statement,
                exc,
            )
    sync_engine.dispose()


# Lightweight safety net for schema drift: Base.metadata.create_all only
# creates missing TABLES, never adds columns to a table that already
# exists. Rather than requiring a full DB wipe (`docker compose down -v`)
# every time a model gains a new column, list "add this column if it's
# missing" statements here — safe to run on every startup, no-ops once
# the column exists. For anything beyond simple additive columns (renames,
# type changes, dropped columns), a real migration tool (Alembic) is the
# right call instead.
_ADDITIVE_COLUMN_MIGRATIONS = [
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_data TEXT',
]


def _run_safety_migrations() -> None:
    sync_engine = create_engine(settings.SYNC_DATABASE_URL)
    with sync_engine.begin() as conn:
        for statement in _ADDITIVE_COLUMN_MIGRATIONS:
            conn.execute(text(statement))
    sync_engine.dispose()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _simulator_task

    # Create relational tables (dev-friendly; swap for Alembic migrations
    # once the schema stabilizes).
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Patch in any additive columns added to models since the tables were
    # first created (see _ADDITIVE_COLUMN_MIGRATIONS above).
    _run_safety_migrations()

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

app.include_router(auth.router)
app.include_router(facility.router)
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