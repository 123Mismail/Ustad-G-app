from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class MCPSettings(BaseSettings):
    google_maps_api_key: str
    google_sheets_credentials: str    # Path to service_account.json OR raw JSON string
    google_sheets_booking_id: str     # Sheet ID
    google_calendar_id: str = "primary" # Calendar ID for appointments
    mcp_host: str = "0.0.0.0"
    port: int = 8080
    google_maps_base_url: str = "https://maps.googleapis.com/maps/api"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

@lru_cache()
def get_mcp_settings() -> MCPSettings:
    return MCPSettings()
