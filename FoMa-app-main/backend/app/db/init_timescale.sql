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
SELECT add_retention_policy('equipment_metrics', INTERVAL '90 days', if_not_exists => TRUE);
SELECT add_retention_policy('inventory_wastage_readings', INTERVAL '90 days', if_not_exists => TRUE);