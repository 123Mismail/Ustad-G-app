"""
routers/health.py — GET /v1/health

Skill pattern: async-first, Depends() for settings injection, HTTPException for failures.
Checks connectivity to OpenRouter and MCP server — the two critical external services.
"""

from fastapi import APIRouter, Depends
from app.config import Settings, get_settings
import httpx
from datetime import datetime, timezone

router = APIRouter(tags=["System"])


@router.get(
    "/health",
    summary="Health Check",
    description="Checks connectivity to Gemini API and the MCP server. "
                "Returns 'ok' when all services are reachable, 'degraded' otherwise.",
)
async def health_check(settings: Settings = Depends(get_settings)) -> dict:
    """
    Live endpoint — verifies all external service connections.
    This is the only LIVE endpoint in Task 1 (all others are stubs).
    """
    result: dict = {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.app_version,
        "environment": settings.app_env,
        "services": {},
    }

    # ── Check Gemini API ──────────────────────────────────────────
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # We check the models list endpoint for health
            response = await client.get(
                f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.gemini_api_key}"
            )
            if response.status_code == 200:
                result["services"]["gemini"] = "ok"
            else:
                result["services"]["gemini"] = f"error:{response.status_code}"
                result["status"] = "degraded"
    except httpx.TimeoutException:
        result["services"]["gemini"] = "timeout"
        result["status"] = "degraded"
    except Exception as e:
        result["services"]["gemini"] = f"unreachable: {type(e).__name__}"
        result["status"] = "degraded"

    # ── Check MCP Server ─────────────────────────────────────────
    # Not fatal in Task 1 — MCP server is built in Task 2
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"{settings.mcp_server_url}/health")
            if response.status_code == 200:
                result["services"]["mcp_server"] = "ok"
            else:
                result["services"]["mcp_server"] = f"error:{response.status_code}"
    except Exception:
        result["services"]["mcp_server"] = "not_started (Task 2)"

    return result
