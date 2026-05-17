"""
config.py — Centralized settings using pydantic-settings.

All environment variables are loaded once via @lru_cache,
so .env is read exactly once per process lifetime.

Usage in FastAPI:
    from app.config import get_settings
    settings: Settings = Depends(get_settings)
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Force .env to override system environment variables
load_dotenv(override=True)

class Settings(BaseSettings):
    # ── LLM Gateway ──────────────────────────────────────────────
    gemini_api_key: str = "your_gemini_api_key_here"
    openai_api_key: str = "your_openai_api_key_here"  # Added for OpenAI dashboard tracing
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # Skill pattern: use specific model IDs per agent role
    primary_model: str      # Negotiation + Booking agents
    fast_model: str         # Triage agent (low latency)
    fallback_model: str     # Resilience fallback

    # ── Google Services ──────────────────────────────────────────
    google_maps_api_key: str
    google_sheets_credentials: str
    google_sheets_booking_id: str

    # ── MCP Server ───────────────────────────────────────────────
    mcp_server_url: str = "http://localhost:8001"

    # ── App Config ───────────────────────────────────────────────
    app_env: str = "development"
    app_version: str = "1.0.0"
    cors_origins: str = "http://localhost:3000,http://localhost:19006"
    admin_key: str = "ustadg-admin-secret"  # Override in .env as ADMIN_KEY

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        # Allow extra fields so future env vars don't break the app
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Returns a cached Settings singleton.
    lru_cache ensures .env is read only once per process.
    Inject with: Depends(get_settings)
    """
    settings = Settings()
    
    # ── CRITICAL FIX for Google ADK / GenAI ─────────────────────────
    # We must overwrite the stale system GOOGLE_API_KEY before any 
    # ADK modules import the client.
    import os
    if settings.gemini_api_key and "your_" not in settings.gemini_api_key:
        os.environ["GOOGLE_API_KEY"] = settings.gemini_api_key.strip()
        os.environ["GEMINI_API_KEY"] = settings.gemini_api_key.strip()
        
    return settings
