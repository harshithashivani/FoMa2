from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central app configuration, sourced from environment variables / .env.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "FoMa Ops API"

    # Async URL used by the app (asyncpg driver)
    DATABASE_URL: str = "postgresql+asyncpg://foma:foma_dev_password@localhost:5432/foma"

    # Sync URL used for one-off DDL (e.g. TimescaleDB hypertable creation)
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://foma:foma_dev_password@localhost:5432/foma"

    CORS_ORIGINS: str = "http://localhost:5173"

    # Toggles the in-process telemetry simulator that stands in for the
    # edge gateway until real MQTT/Kafka ingestion is wired up.
    SIMULATOR_ENABLED: bool = True
    SIMULATOR_INTERVAL_SECONDS: float = 5.0

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()