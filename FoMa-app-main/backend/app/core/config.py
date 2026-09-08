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

    # --- Auth -----------------------------------------------------------
    # CHANGE THIS in production — anyone with this value can forge tokens.
    # Set a real random value via the SECRET_KEY environment variable.
    SECRET_KEY: str = "dev-only-change-this-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()