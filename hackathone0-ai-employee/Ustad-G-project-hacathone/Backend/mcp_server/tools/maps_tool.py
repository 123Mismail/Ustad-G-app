import json
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from mcp_server.config import get_mcp_settings
from mcp_server.utils.http_client import make_google_request
from mcp_server.utils.error_handler import handle_google_api_error

class ResponseFormat(str, Enum):
    JSON = "json"
    MARKDOWN = "markdown"

class MapsSearchInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    service: str = Field(..., min_length=2, max_length=100,
        description="Type of service to search (e.g., 'plumber', 'electrician', 'پلمبر')")
    location: str = Field(..., min_length=3, max_length=200,
        description="Location to search near (e.g., 'Gulshan-e-Iqbal, Karachi')")
    radius_km: int = Field(default=10, ge=1, le=50,
        description="Search radius in kilometers")
    max_results: int = Field(default=10, ge=1, le=20,
        description="Maximum number of providers to return")
    response_format: ResponseFormat = Field(
        default=ResponseFormat.JSON,
        description="'json' for agent processing, 'markdown' for human display")

async def google_maps_search_providers(params: MapsSearchInput) -> str:
    """Find service providers near a location using Google Maps Places API."""
    settings = get_mcp_settings()
    try:
        # 1. Text Search API
        query = f"{params.service} near {params.location}"
        search_params = {
            "query": query,
            "radius": params.radius_km * 1000,
            "key": settings.google_maps_api_key,
        }
        search_data = await make_google_request("place/textsearch/json", search_params, settings)
        
        results = search_data.get("results", [])[:params.max_results]
        if not results:
            return f"No {params.service} providers found near {params.location}."

        providers = []
        for place in results:
            place_id = place.get("place_id")
            
            # 2. Details API for phone and more info (omitting here for brevity/rate-limits, 
            # but usually you'd do a secondary call or use fields if supported by text search)
            # In a real impl, you might call /place/details/json
            
            # We'll just map the text search results
            provider = {
                "place_id": place_id,
                "name": place.get("name"),
                "address": place.get("formatted_address"),
                "rating": place.get("rating", 0.0),
                "total_ratings": place.get("user_ratings_total", 0),
                "open_now": place.get("opening_hours", {}).get("open_now", False)
            }
            providers.append(provider)

        if params.response_format == ResponseFormat.MARKDOWN:
            lines = [f"# Service Providers: {params.service.capitalize()} near {params.location}", ""]
            for p in providers:
                lines.append(f"## {p['name']} (★ {p['rating']} from {p['total_ratings']} reviews)")
                lines.append(f"- **Address**: {p['address']}")
                status = "Open Now" if p["open_now"] else "Closed/Unknown"
                lines.append(f"- **Status**: {status}")
                lines.append("")
            return "\n".join(lines)

        return json.dumps({"providers": providers}, indent=2)

    except Exception as e:
        return handle_google_api_error(e)
