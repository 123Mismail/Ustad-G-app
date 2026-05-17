# TASK 2 — Google Services MCP Server
> **Parent:** `PHASE1_TASKS.md` → Task 2
> **Goal:** Build a production-quality `FastMCP` server that exposes Google Maps and Google Sheets as MCP tools callable by all UstadG agents.
> **Status:** ⬜ Not Started

---

## 1. Overview

The MCP Server is the **execution hub** for all external Google interactions. Agents never call Google APIs directly — they call MCP tools, which keeps Google credentials centralized and makes the agent pipeline testable with mock tools.

This plan follows the **mcp-builder skill** 4-phase process:
1. Deep Research & Planning
2. Implementation
3. Review & Test
4. Evaluations

**Transport choice:** `streamable HTTP` on port `8001` — the FastAPI app (port 8000) calls it over HTTP, so we need a network-accessible server. This also allows the MCP server to scale independently.

**Server name (MCP convention):** `google_services_mcp`

---

## 2. Final File Structure After This Task

```
Backend/
└── mcp_server/
    ├── __init__.py
    ├── server.py                  ← FastMCP entry point, tool registration, lifespan
    ├── config.py                  ← Env vars for MCP server (re-uses app/config.py patterns)
    ├── tools/
    │   ├── __init__.py
    │   ├── maps_tool.py           ← google_maps_search_providers
    │   ├── sheets_tool.py         ← google_sheets_record_booking
    │   └── calendar_tool.py       ← google_calendar_create_appointment
    └── utils/
        ├── __init__.py
        ├── http_client.py         ← Shared async httpx client for Google APIs
        └── error_handler.py       ← Shared actionable error formatting
```

---

## 3. Tool Design (MCP Skill: Tool Naming & Annotations)

Following MCP best practices — service prefix, action-oriented, clear annotations:

### Tool 1: `google_maps_search_providers`

| Property | Value |
|----------|-------|
| **Name** | `google_maps_search_providers` |
| **Purpose** | Find service providers near a location using Google Maps Places API |
| **readOnlyHint** | `true` — only reads from Google Maps, no mutations |
| **destructiveHint** | `false` |
| **idempotentHint** | `true` — same query returns same results |
| **openWorldHint** | `true` — calls external Google API |

**Input schema (`MapsSearchInput`):**
```python
service: str          # e.g. "plumber", "electrician"
location: str         # e.g. "Gulshan-e-Iqbal, Karachi"
radius_km: int = 10   # Search radius (1–50 km)
max_results: int = 10 # Max providers to return (1–20)
response_format: ResponseFormat = "json"  # "json" | "markdown"
```

**Output schema (per provider):**
```json
{
  "place_id": "ChIJ...",
  "name": "Ali Plumber Services",
  "address": "Block 5, Gulshan, Karachi",
  "rating": 4.3,
  "total_ratings": 87,
  "distance_km": 2.1,
  "phone": "+92-21-...",
  "open_now": true
}
```

---

### Tool 2: `google_sheets_record_booking`

| Property | Value |
|----------|-------|
| **Name** | `google_sheets_record_booking` |
| **Purpose** | Append a confirmed booking as a new row in the Google Sheet |
| **readOnlyHint** | `false` — writes to Google Sheet |
| **destructiveHint** | `false` — append only, no overwriting |
| **idempotentHint** | `false` — each call creates a new row |
| **openWorldHint** | `true` — calls external Google Sheets API |

**Input schema (`SheetsBookingInput`):**
```python
confirmation_id: str  # Format: UGK-YYYY-XXXX (validated by regex)
user_name: str        # Booking user's display name
service: str          # e.g. "Plumber"
provider_name: str    # Name of the selected provider
provider_address: str # Address of the provider
status: str = "Confirmed"  # "Confirmed" | "Pending" | "Cancelled"
```

**Output:** Success JSON with the row index appended, or actionable error string.

---

### Tool 3: `google_calendar_create_appointment`

| Property | Value |
|----------|-------|
| **Name** | `google_calendar_create_appointment` |
| **Purpose** | Create an appointment/reminder in Google Calendar |
| **readOnlyHint** | `false` — writes to Google Calendar |
| **destructiveHint** | `false` |
| **idempotentHint** | `false` |
| **openWorldHint** | `true` — calls external API |

**Input schema (`CalendarBookingInput`):**
```python
summary: str          # e.g., "Plumber Appointment - Ali Services"
description: str      # Details of the booking
start_time: str       # ISO 8601 datetime
end_time: str         # ISO 8601 datetime
attendee_email: str   # User's email (optional)
```

**Output:** Success JSON with event link, or actionable error.

---

## 4. Sub-Task Breakdown

### ✅ Sub-Task 2.1 — MCP Server Config

**File:** `mcp_server/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class MCPSettings(BaseSettings):
    google_maps_api_key: str
    google_sheets_credentials: str    # Path to service_account.json
    google_sheets_booking_id: str     # Sheet ID
    google_calendar_id: str = "primary" # Calendar ID for appointments
    mcp_host: str = "127.0.0.1"
    mcp_port: int = 8001
    google_maps_base_url: str = "https://maps.googleapis.com/maps/api"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

@lru_cache()
def get_mcp_settings() -> MCPSettings:
    return MCPSettings()
```

---

### ✅ Sub-Task 2.2 — Shared HTTP Client

**File:** `mcp_server/utils/http_client.py`

- Single async `httpx.AsyncClient` reused across all Google API calls
- 30-second timeout
- Auto `raise_for_status()` before parsing JSON
- Base URL injected from settings — no hardcoded URLs in tool files

```python
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
```

---

### ✅ Sub-Task 2.3 — Shared Error Handler

**File:** `mcp_server/utils/error_handler.py`

Follows MCP skill pattern — actionable, educational errors:

```python
def handle_google_api_error(e: Exception) -> str:
    if isinstance(e, httpx.HTTPStatusError):
        if e.response.status_code == 403:
            return "Error: Google API key is invalid or missing permissions. Check GOOGLE_MAPS_API_KEY."
        if e.response.status_code == 429:
            return "Error: Google API quota exceeded. Wait before retrying or upgrade the API plan."
        return f"Error: Google API returned status {e.response.status_code}."
    if isinstance(e, httpx.TimeoutException):
        return "Error: Google API request timed out (30s). Check network or try again."
    return f"Error: Unexpected error — {type(e).__name__}: {str(e)}"
```

---

### ✅ Sub-Task 2.4 — Google Maps Tool

**File:** `mcp_server/tools/maps_tool.py`

**Key implementation details:**

1. Call Google Maps **Places Text Search API**:
   ```
   GET /textsearch/json
     ?query={service} near {location}
     &radius={radius_m}
     &key={api_key}
   ```

2. For each result, call **Place Details API** to get phone number:
   ```
   GET /details/json?place_id={id}&fields=name,formatted_address,rating,user_ratings_total,formatted_phone_number,opening_hours&key={api_key}
   ```

3. Calculate `distance_km` using the **Haversine formula** (lat/lng from Places response vs. geocoded user location).

4. Sort by distance ascending, return top `max_results`.

5. Support **Markdown and JSON** response formats.

**Pydantic Input Model:**
```python
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
```

---

### ✅ Sub-Task 2.5 — Google Sheets Tool

**File:** `mcp_server/tools/sheets_tool.py`

**Key implementation details:**

1. Authenticate using **Google Service Account** credentials JSON:
   ```python
   from google.oauth2.service_account import Credentials
   from googleapiclient.discovery import build
   
   SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
   creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
   service = build("sheets", "v4", credentials=creds)
   ```

2. Append row to target sheet (schema from PRD §6.1):
   ```python
   values = [[
       str(uuid4().int)[:8],      # Auto ID
       datetime.utcnow().isoformat(),
       params.user_name,
       params.service,
       params.provider_name,
       params.status,
       params.confirmation_id,    # UGK-YYYY-XXXX
   ]]
   service.spreadsheets().values().append(
       spreadsheetId=sheet_id,
       range="Sheet1!A:G",
       valueInputOption="RAW",
       body={"values": values}
   ).execute()
   ```

3. Run Google Sheets calls in a **thread pool** (`asyncio.to_thread`) since the `googleapiclient` library is synchronous.

**Confirmation ID Validator:**
```python
@field_validator("confirmation_id")
@classmethod
def validate_confirmation_id(cls, v: str) -> str:
    if not re.match(r"^UGK-\d{4}-\d{4}$", v):
        raise ValueError("confirmation_id must match format UGK-YYYY-XXXX (e.g. UGK-2026-4821)")
    return v
```

**Pydantic Input Model:**
```python
class SheetsBookingInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    confirmation_id: str = Field(...,
        description="Unique booking ID in format UGK-YYYY-XXXX",
        examples=["UGK-2026-4821"])
    user_name: str = Field(..., min_length=1, max_length=100)
    service: str = Field(..., min_length=2, max_length=100,
        description="Service type (e.g., 'Plumber', 'Electrician')")
    provider_name: str = Field(..., min_length=1, max_length=200)
    provider_address: str = Field(..., min_length=5, max_length=500)
    status: BookingStatus = Field(default=BookingStatus.CONFIRMED)
```

---

### ✅ Sub-Task 2.6 — Google Calendar Tool

**File:** `mcp_server/tools/calendar_tool.py`

**Key implementation details:**

1. Use Google Calendar API to create an event using service account.
2. Wrap `googleapiclient` calls in `asyncio.to_thread`.
3. Handle datetime conversions safely.

**Pydantic Input Model:**
```python
class CalendarBookingInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    summary: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    start_time: str = Field(..., description="ISO 8601 format")
    end_time: str = Field(..., description="ISO 8601 format")
    attendee_email: Optional[str] = Field(default=None)
```

---

### ✅ Sub-Task 2.7 — FastMCP Server Entry Point

**File:** `mcp_server/server.py`

```python
from contextlib import asynccontextmanager
from mcp.server.fastmcp import FastMCP
from mcp_server.tools.maps_tool import google_maps_search_providers
from mcp_server.tools.sheets_tool import google_sheets_record_booking
from mcp_server.tools.calendar_tool import google_calendar_create_appointment
from mcp_server.config import get_mcp_settings

settings = get_mcp_settings()

@asynccontextmanager
async def lifespan():
    print(f"🔌 google_services_mcp starting on port {settings.mcp_port}...")
    yield
    print("🔌 google_services_mcp shutting down...")

mcp = FastMCP("google_services_mcp", lifespan=lifespan)

# Register tools
mcp.add_tool(google_maps_search_providers)
mcp.add_tool(google_sheets_record_booking)
mcp.add_tool(google_calendar_create_appointment)

if __name__ == "__main__":
    mcp.run(
        transport="streamable-http",
        host=settings.mcp_host,
        port=settings.mcp_port,
    )
```

---

### ✅ Sub-Task 2.7 — Health Endpoint for MCP Server

Add a `/health` route so the FastAPI `health.py` router can ping it:

```python
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse

async def health(request):
    return JSONResponse({"status": "ok", "server": "google_services_mcp"})
```

Mount on the same Starlette app that FastMCP uses.

---

### ✅ Sub-Task 2.8 — Syntax Verification

Per MCP Builder skill Phase 3:
```bash
python -m py_compile mcp_server/server.py
python -m py_compile mcp_server/tools/maps_tool.py
python -m py_compile mcp_server/tools/sheets_tool.py
```

Then start the server and confirm it lists tools:
```bash
uv run python mcp_server/server.py
```

---

## 5. MCP Quality Checklist (from mcp-builder skill)

### Strategic Design
- [ ] Tools enable complete workflows (search → negotiate → book), not just raw API wrappers
- [ ] Tool names include service prefix (`google_maps_*`, `google_sheets_*`)
- [ ] Markdown + JSON dual format supported for all read tools
- [ ] Error messages guide agents toward correct next action

### Implementation Quality
- [ ] All tools have descriptive `name` and `annotations` in `@mcp.tool()`
- [ ] All tools use `Pydantic BaseModel` with `Field()` for input validation
- [ ] All Pydantic fields have `description` and constraints
- [ ] All tools have comprehensive docstrings including input/output schema
- [ ] All network operations use `async/await` + `httpx.AsyncClient`
- [ ] Sync Google Sheets library wrapped in `asyncio.to_thread`
- [ ] Common error handling extracted to `utils/error_handler.py`
- [ ] Shared HTTP client in `utils/http_client.py` (no duplication)
- [ ] Confirmation ID validated by regex in Pydantic `@field_validator`

### Tool Configuration
- [ ] `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint` set on each tool
- [ ] `extra="forbid"` on all Pydantic input models

### Transport
- [ ] `streamable-http` transport on port `8001`
- [ ] `/health` route available for FastAPI pings

---

## 6. Acceptance Criteria

| # | Check | How to Verify |
|---|-------|--------------|
| ✅ | Server starts without import errors | `uv run python mcp_server/server.py` |
| ✅ | Syntax clean on all tool files | `python -m py_compile` |
| ✅ | `GET /v1/health` on main app shows `mcp_server: "ok"` | curl |
| ✅ | `google_maps_search_providers` returns ≥1 provider for "plumber, Karachi" | Direct tool call |
| ✅ | `google_sheets_record_booking` appends row to Sheet | Check Google Sheet |
| ✅ | Invalid `confirmation_id` is rejected by Pydantic (not format UGK-YYYY-XXXX) | Unit test |
| ✅ | 403 from Google Maps returns actionable error message | Simulated test |

---

## 7. Dependencies

| Depends On | Status |
|-----------|--------|
| Task 1 (Project Scaffolding) | ✅ Complete |
| Google Maps API key obtained | ⚠️ Required |
| Google Sheets Service Account JSON | ⚠️ Required |
| Google Sheet ID configured in `.env` | ⚠️ Required |

---

## 8. Estimated Effort

| Sub-Task | Estimate |
|----------|---------|
| 2.1 MCP Config | 10 min |
| 2.2 Shared HTTP client | 15 min |
| 2.3 Error handler | 10 min |
| 2.4 Maps tool | 45 min |
| 2.5 Sheets tool | 45 min |
| 2.6 Server entry point | 20 min |
| 2.7 Health endpoint | 10 min |
| 2.8 Verification | 20 min |
| **Total** | **~2.5 hours** |

---

## 9. Next Task

➡️ After Task 2 is complete, proceed to:
**[TASK 5 — Agent Swarm Definitions](./TASK5_AGENT_SWARM.md)**
*(Tasks 3 & 4 were completed as part of Task 1)*

---

*Plan Version: 1.0 | Task: 2 of 8 | Skill: mcp-builder + python-backend | Project: UstadG Phase 1*
