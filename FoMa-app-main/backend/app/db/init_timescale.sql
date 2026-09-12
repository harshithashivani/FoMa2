-- Converts the two telemetry tables into TimescaleDB hypertables.
-- Safe to run multiple times (if_not_exists => true).

CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable(
    'equipment_metrics', 'time',
    if_not_exists => TRUE,
    migrate_data => TRUE
);

SELECT create_hypertable(
    'inventory_wastage_readings', 'time',
    if_not_exists => TRUE,
    migrate_data => TRUE
);

-- Helpful indexes for common query patterns.
CREATE INDEX IF NOT EXISTS idx_equipment_metrics_equipment_time
    ON equipment_metrics (equipment_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_wastage_readings_item_time
    ON inventory_wastage_readings (inventory_item_id, time DESC);

-- Optional: drop raw readings older than 90 days automatically.
-- NOTE: add_retention_policy is a TimescaleDB "Community" (paid-license)
-- feature, unavailable on some managed Postgres hosts (e.g. Render only
-- ships the free Apache-2 edition). main.py runs each statement in this
-- file independently and logs+skips any that fail, so on hosts where this
-- isn't supported, hypertables still get created fine - you just won't
-- get automatic old-data cleanup. Delete old rows manually or via a cron
-- job on those hosts if that matters to you.
SELECT add_retention_policy('equipment_metrics', INTERVAL '90 days', if_not_exists => TRUE);
SELECT add_retention_policy('inventory_wastage_readings', INTERVAL '90 days', if_not_exists => TRUE);