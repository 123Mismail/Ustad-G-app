# Phase 2 — TASK 12: Discovery Agent → Own DB First, Google Maps Fallback
> **Parent:** `PHASE2_TASKS.md` → Task 12
> **Status:** 🔲 Not Started
> **Depends On:** Task 10 (Provider DB ✅), Task 11 (CRUD API ✅)

---

## Goal

Teach the `DiscoveryAgent` to query our **own local SQLite database** as the primary provider source. Google Maps (`google_maps_search_providers` MCP tool) is demoted to a **fallback-only** role — used only when our database returns **zero results** for a given service+area.

---

## The Architecture Shift

**Before (Phase 1):**
```
DiscoveryAgent → google_maps_search_providers (MCP) → Google Maps API → Results
```

**After (Task 12):**
```
DiscoveryAgent → search_local_providers (Python FunctionTool)
                       │
            ┌──────────▼──────────┐
            │ DB has results?     │
            └──────────┬──────────┘
              YES ─────┤──── Return top 5 local providers (sorted by distance)
                       │
              NO ──────┴──── google_maps_search_providers (MCP Fallback)
```

### Key Design Decisions
1. **`search_local_providers` is a native Python `FunctionTool`**, NOT another MCP server. The local SQLite DB is a local file — the cloud-hosted MCP server cannot touch it. This runs inside the FastAPI process directly.
2. **Distance is calculated offline** using the Haversine formula on stored `lat`/`lng` coordinates — zero API calls.
3. **Google Maps remains connected** in the toolset but the Agent's instructions and logic ensure it's called only when local returns 0 results.
4. **User location** is passed in from the existing `chat` endpoint's `location` parameter and injected into the `message` context.

---

## Files to Create / Modify

### [NEW] `app/tools/local_search.py`
The core native Python `FunctionTool` that the `DiscoveryAgent` will call.

```python
async def search_local_providers(service_type: str, area: str, city: str = "Karachi", limit: int = 5) -> str:
    """
    Search our own SQLite provider database.
    Returns top providers sorted by distance from user's area (Haversine).
    Returns empty list JSON if no results found.
    """
    # 1. Query DB: service_type + city filter (case-insensitive area search)
    # 2. Geocode the user's area (once per request) to get user lat/lng
    # 3. For each provider with lat/lng, calculate Haversine distance
    # 4. Sort by distance ascending
    # 5. Return top `limit` providers as JSON string
```

**Return format (JSON string for agent to parse):**
```json
{
  "source": "local_db",
  "count": 3,
  "providers": [
    {
      "id": 3,
      "name": "Ahmed Electrician",
      "service_type": "electrician",
      "area": "Gulshan-e-Iqbal",
      "address": "Block 5, Gulshan-e-Iqbal, Karachi",
      "phone": "03001234567",
      "rating": 4.7,
      "distance_km": 0.8
    }
  ]
}
```

### Haversine Formula (offline distance):
```python
import math

def haversine_km(lat1, lng1, lat2, lng2) -> float:
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))
```

### [MODIFY] `app/agents/discovery.py`
Update the discovery agent's instructions to:
1. **Always call `search_local_providers` first** with the extracted service + area.
2. **If it returns results** → present them to the user.
3. **If it returns 0 results** → call `google_maps_search_providers` as a fallback and mention to the user that results are from Google Maps.

```python
discovery_instructions = """
...
TOOLS AND PRIORITY ORDER:
1. ALWAYS call `search_local_providers` first.
   - If it returns 1+ providers → present those results and do NOT call Google Maps.
   - If it returns 0 providers → fall back to `google_maps_search_providers`.
2. When presenting local results, show: Name, Service, Area, Rating, Distance (km), Phone.
3. When presenting Google Maps fallback results, say "Hamare paas is area mein koi registered ustad nahi mila, yeh Google se mili results hain."
...
"""
```

### [MODIFY] `app/agents/orchestrator.py`
Wire the new `search_local_providers` native tool into the `DiscoveryAgent`:

```python
from google.adk.tools import FunctionTool
from app.tools.local_search import search_local_providers

local_search_tool = FunctionTool(search_local_providers)

discovery_agent = LlmAgent(
    ...
    tools=[local_search_tool, maps_toolset],  # Local DB FIRST, Maps MCP SECOND
    ...
)
```

Also update the event capture in `run_ustadg_swarm` to capture results from `search_local_providers` in addition to `google_maps_search_providers`.

---

## Acceptance Criteria

- [ ] `search_local_providers("plumber", "Gulshan-e-Iqbal")` returns 2 providers from DB with distance_km
- [ ] `search_local_providers("plumber", "Gulshan-e-Iqbal")` returns `source: "local_db"` in JSON
- [ ] `search_local_providers("chef", "Karachi")` returns 0 results (no chef in DB)
- [ ] Agent uses Google Maps fallback ONLY when local returns 0 results
- [ ] Chat: "mujhe electrician chahiye Gulshan mein" → returns Ahmed Electrician + Ahmed AC Solutions from our own DB
- [ ] `providers` array in chat response is populated from local DB results
- [ ] Orchestrator captures results from `search_local_providers` tool call

---

## Notes

- `search_local_providers` takes `area` as text (e.g., `"Gulshan-e-Iqbal"`) and geocodes it internally to compute distances.
- Providers without `lat/lng` stored in DB are still returned, but their `distance_km` field will be `null`.
- The `FunctionTool` wrapper is the correct ADK pattern for registering any async Python function as an agent tool.
- The existing `maps_toolset` stays connected — the agent's **prompt instructions** enforce the fallback logic, not code-level blocking.
