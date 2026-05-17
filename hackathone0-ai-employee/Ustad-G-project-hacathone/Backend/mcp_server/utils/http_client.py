import httpx
from mcp_server.config import MCPSettings

async def make_google_request(
    endpoint: str,
    params: dict,
    settings: MCPSettings,
) -> dict:
    """Reusable async function for all Google API calls."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{settings.google_maps_base_url}/{endpoint}",
            params=params
        )
        response.raise_for_status()
        return response.json()
