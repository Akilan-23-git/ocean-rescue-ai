from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    twilio_webhook_base_url: str = "http://localhost:8000"
    twilio_validate_signature: bool = True

    msar_cors_origins: str = "http://localhost:5173,http://localhost:5174"
    msar_data_dir: str = "./data"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.msar_cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
