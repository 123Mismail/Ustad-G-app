# TASK 1 — Project Scaffolding & Configuration
> **Parent:** `PHASE1_TASKS.md` → Task 1  
> **Goal:** Set up the complete skeleton of the `Backend/` folder so every subsequent task has a clean, consistent place to write code.  
> **Status:** ⬜ Not Started

---

## 1. Overview

This task lays the **foundation** for the entire Phase 1 backend. No business logic is written here — only structure, dependencies, environment configuration, and app wiring. When this task is complete, a developer should be able to:

1. Clone the repo, copy `.env.example` → `.env`, fill in keys.
2. Run `pip install -r requirements.txt`.
3. Run `uvicorn app.main:app --reload` and hit `GET /v1/health` and receive a valid JSON response.

---

## 2. Final Folder Structure After This Task

```
Backend/
│
├── app/                          ← FastAPI application package
│   ├── __init__.py
│   ├── main.py                   ← App entry point, router mounts, CORS
│   ├── config.py                 ← All env vars loaded via pydantic-settings
│   │
│   ├── routers/                  ← One file per API endpoint group
│   │   ├── __init__.py
│   │   ├── chat.py               ← POST /v1/chat        (stub)
│   │   ├── book.py               ← POST /v1/book        (stub)
│   │   ├── providers.py          ← GET  /v1/providers   (stub)
│   │   ├── trace.py              ← GET  /v1/trace/{id}  (stub)
│   │   └── health.py             ← GET  /v1/health      (LIVE - tested in Task 1)
│   │
│   ├── agents/                   ← Agent definitions (populated in Task 5)
│   │   └── __init__.py
│   │
│   ├── tools/                    ← MCP client wrapper (populated in Task 7)
│   │   └── __init__.py
│   │
│   ├── middleware/               ← Request middleware (populated in Task 4)
│   │   └── __init__.py
│   │
│   └── schemas/                  ← All Pydantic request/response models
│       ├── __init__.py
│       ├── chat.py
│       ├── booking.py
│       └── trace.py
│
├── mcp_server/                   ← FastMCP server (populated in Task 2)
│   ├── __init__.py
│   └── tools/
│       └── __init__.py
│
├── plans/                        ← This folder — task-level implementation plans
│   └── TASK1_PROJECT_SCAFFOLDING.md
│
├── .env.example                  ← Template for required environment variables
├── .gitignore                    ← Exclude .env, __pycache__, venv/
├── requirements.txt              ← All Python dependencies
├── PHASE1_TASKS.md               ← Master task list
└── README.md                     ← Setup and run instructions
```

---

## 3. Sub-Task Breakdown

### ✅ Sub-Task 1.1 — Create Folder Structure

Create all directories with `__init__.py` files so Python treats them as packages.

**Folders to create:**
```
Backend/app/
Backend/app/routers/
Backend/app/agents/
Backend/app/tools/
Backend/app/middleware/
Backend/app/schemas/
Backend/mcp_server/
Backend/mcp_server/tools/
```

**Action:** Create `__init__.py` in each of the above.

---

### ✅ Sub-Task 1.2 — Create `requirements.txt`

**File:** `Backend/requirements.txt`

```txt
# Web Framework
fastapi==0.111.0
uvicorn[standard]==0.29.0

# Environment & Config
python-dotenv==1.0.1
pydantic-settings==2.2.1
pydantic==2.7.1

# OpenAI Agents SDK (used for all agent orchestration)
openai==1.30.1

# MCP Server
fastmcp==0.1.0

# HTTP Client (for calling MCP server from FastAPI)
httpx==0.27.0

# Google APIs (Maps + Sheets via MCP tools)
google-api-python-client==2.127.0
google-auth==2.29.0
google-auth-httplib2==0.2.0

# Utilities
python-dateutil==2.9.0
```

**Note on versions:** Pin exact versions to prevent environment drift between team members.

---

### ✅ Sub-Task 1.3 — Create `.env.example`

**File:** `Backend/.env.example`

```env
# ── LLM Gateway ─────────────────────────────────────────────────
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Model names (OpenRouter model IDs)
PRIMARY_MODEL=google/gemini-pro-1.5        # Negotiation & Booking Agent
FAST_MODEL=google/gemini-flash-1.5         # Triage Agent (low latency)
FALLBACK_MODEL=anthropic/claude-3.5-sonnet # Fallback if primary fails

# ── Google Services ──────────────────────────────────────────────
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
GOOGLE_SHEETS_CREDENTIALS=path/to/service_account.json
GOOGLE_SHEETS_BOOKING_ID=your_google_sheet_id_here

# ── MCP Server ───────────────────────────────────────────────────
MCP_SERVER_URL=http://localhost:8001

# ── App Config ───────────────────────────────────────────────────
APP_ENV=development           # development | production
APP_VERSION=1.0.0
CORS_ORIGINS=http://localhost:3000,http://localhost:19006
```

---

### ✅ Sub-Task 1.4 — Create `app/config.py`

**File:** `Backend/app/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # LLM Gateway
    openrouter_api_key: str
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    primary_model: str = "google/gemini-pro-1.5"
    fast_model: str = "google/gemini-flash-1.5"
    fallback_model: str = "anthropic/claude-3.5-sonnet"

    # Google Services
    google_maps_api_key: str
    google_sheets_credentials: str
    google_sheets_booking_id: str

    # MCP Server
    mcp_server_url: str = "http://localhost:8001"

    # App Config
    app_env: str = "development"
    app_version: str = "1.0.0"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Returns a cached Settings instance.
    Use FastAPI Depends(get_settings) to inject into routes.
    """
    return Settings()
```

**Why `lru_cache`?**  
Settings are read once and cached — avoids re-reading the `.env` file on every request.

---

### ✅ Sub-Task 1.5 — Create `app/schemas/`

**File:** `Backend/app/schemas/chat.py`
```python
from pydantic import BaseModel, Field
from typing import Optional, List


class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique session identifier")
    message: str = Field(..., description="User message in Urdu or English")
    language: str = Field(default="ur", description="'ur' for Urdu, 'en' for English")


class ProviderResult(BaseModel):
    rank: int
    name: str
    address: str
    rating: float
    distance_km: float
    munasib_price_estimate: str
    justification_ur: str
    justification_en: str


class TraceStep(BaseModel):
    agent_name: str
    summary: str   # Short human-readable thought for frontend display


class ChatResponse(BaseModel):
    session_id: str
    reply: str                          # Main message to user
    providers: Optional[List[ProviderResult]] = None
    trace_steps: Optional[List[TraceStep]] = None
```

**File:** `Backend/app/schemas/booking.py`
```python
from pydantic import BaseModel, Field


class BookRequest(BaseModel):
    session_id: str = Field(..., description="Session from /v1/chat")
    provider_id: str = Field(..., description="Place ID of the selected provider")
    user_name: str = Field(default="Test User")


class BookResponse(BaseModel):
    confirmation_id: str    # Format: UGK-YYYY-XXXX
    status: str             # "Confirmed"
    message: str            # Bilingual confirmation message
```

**File:** `Backend/app/schemas/trace.py`
```python
from pydantic import BaseModel
from typing import Optional


class TraceLog(BaseModel):
    timestamp: str
    agent_name: str
    input: str
    output: str
    reasoning: Optional[str] = None
```

---

### ✅ Sub-Task 1.6 — Create `app/routers/health.py` (LIVE endpoint)

**File:** `Backend/app/routers/health.py`

```python
from fastapi import APIRouter, Depends
from app.config import Settings, get_settings
import httpx
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health", tags=["System"])
async def health_check(settings: Settings = Depends(get_settings)):
    """
    Checks connectivity to OpenRouter and the MCP server.
    Returns 200 if all critical services are reachable.
    """
    results = {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.app_version,
        "environment": settings.app_env,
        "services": {}
    }

    # Check OpenRouter
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(
                f"{settings.openrouter_base_url}/models",
                headers={"Authorization": f"Bearer {settings.openrouter_api_key}"}
            )
            results["services"]["openrouter"] = "ok" if r.status_code == 200 else f"error:{r.status_code}"
    except Exception as e:
        results["services"]["openrouter"] = f"unreachable: {str(e)}"
        results["status"] = "degraded"

    # Check MCP Server
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{settings.mcp_server_url}/health")
            results["services"]["mcp_server"] = "ok" if r.status_code == 200 else f"error:{r.status_code}"
    except Exception:
        results["services"]["mcp_server"] = "unreachable (not yet started)"
        # Not fatal in Task 1 — MCP server built in Task 2

    return results
```

---

### ✅ Sub-Task 1.7 — Create Stub Routers

All other routers return `{"status": "not_implemented"}` in Task 1 — they will be filled in Tasks 5 & 6.

**File:** `Backend/app/routers/chat.py`
```python
from fastapi import APIRouter
router = APIRouter()

@router.post("/chat", tags=["Agent"])
async def chat():
    return {"status": "not_implemented", "task": "Implemented in Task 6.1"}
```

*(Same pattern for `book.py`, `providers.py`, `trace.py`)*

---

### ✅ Sub-Task 1.8 — Create `app/main.py`

**File:** `Backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import health, chat, book, providers, trace

settings = get_settings()

app = FastAPI(
    title="UstadG Backend API",
    description="Agentic AI backend for the UstadG service booking platform",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────
API_PREFIX = "/v1"

app.include_router(health.router, prefix=API_PREFIX)
app.include_router(chat.router,   prefix=API_PREFIX)
app.include_router(book.router,   prefix=API_PREFIX)
app.include_router(providers.router, prefix=API_PREFIX)
app.include_router(trace.router,  prefix=API_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "project": "UstadG",
        "phase": "Phase 1 — Steel Thread",
        "docs": "/docs",
        "health": "/v1/health",
    }
```

---

### ✅ Sub-Task 1.9 — Create `.gitignore`

**File:** `Backend/.gitignore`

```gitignore
# Python
__pycache__/
*.py[cod]
*.pyo
.env
venv/
.venv/
*.egg-info/
dist/
build/

# Secrets
*.json
!requirements*.txt

# IDE
.vscode/
.idea/

# Logs
*.log
```

---

### ✅ Sub-Task 1.10 — Create `README.md`

**File:** `Backend/README.md`

```markdown
# UstadG Backend — Phase 1

## Prerequisites
- Python 3.10+
- pip

## Setup

```bash
# 1. Navigate to Backend folder
cd Backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env
# Fill in your API keys in .env

# 5. Run the server
uvicorn app.main:app --reload --port 8000
```

## Verify Setup
Open browser → http://localhost:8000/docs  
Test health endpoint → GET http://localhost:8000/v1/health

## Folder Structure
See `PHASE1_TASKS.md` for the full project structure.
```

---

## 4. Acceptance Criteria

Before marking Task 1 as **complete**, verify ALL of the following:

| # | Check | How to Verify |
|---|-------|---------------|
| ✅ | All folders exist with `__init__.py` | `ls Backend/app/` |
| ✅ | `pip install -r requirements.txt` runs without errors | Terminal output |
| ✅ | `.env` filled from `.env.example` | File exists with keys |
| ✅ | `uvicorn app.main:app --reload` starts with no import errors | Terminal output |
| ✅ | `GET /` returns project info JSON | Browser or curl |
| ✅ | `GET /v1/health` returns JSON with `status` field | Browser or curl |
| ✅ | `GET /docs` shows Swagger UI with all 5 routes listed | Browser |
| ✅ | `POST /v1/chat` returns `{"status": "not_implemented"}` | curl or Swagger |

---

## 5. Dependencies & Blockers

| Depends On | Status |
|-----------|--------|
| PRD §8.1 reviewed | ✅ Done |
| API keys obtained (OpenRouter, Google Maps, Sheets) | ⚠️ Required before Task 1.3 |
| Python 3.10+ installed on dev machine | ⚠️ Verify |

---

## 6. Estimated Effort

| Sub-Task | Time Estimate |
|----------|--------------|
| 1.1 Folder structure | 10 min |
| 1.2 requirements.txt | 10 min |
| 1.3 .env.example | 5 min |
| 1.4 config.py | 15 min |
| 1.5 Schemas | 20 min |
| 1.6 health.py (live) | 20 min |
| 1.7 Stub routers | 10 min |
| 1.8 main.py | 15 min |
| 1.9 .gitignore + README | 10 min |
| **Total** | **~2 hours** |

---

## 7. Next Task

➡️ After Task 1 is complete, proceed to:  
**[TASK 2 — Google Services MCP Server](./TASK2_MCP_SERVER.md)**

---

*Plan Version: 1.0 | Task: 1 of 8 | Project: UstadG Phase 1*
