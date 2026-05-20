"""
main.py — UstadG FastAPI application entry point.

Skill patterns applied:
  - async-first startup/shutdown lifecycle hooks
  - Dependency injection via Depends(get_settings)
  - CORS middleware with    origin list from config
  - All routers mounted under /v1 prefix
  - Fail-fast: startup validates critical env vars are present
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, chat, book, providers, trace, users, bookings, admin, auth
from app.utils.tracing import setup_tracing
from app.utils.scheduler import scheduler

settings = get_settings()


# ── Lifespan (startup / shutdown) ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Async context manager for startup and shutdown events.
    Preferred over @app.on_event (deprecated in FastAPI 0.93+).
    """
    # ── Startup ──────────────────────────────────────────────────
    setup_tracing()
    
    scheduler.start()
    print("[STARTUP] APScheduler started.")

    print(f"\n[STARTUP] UstadG Backend v{settings.app_version} starting up...")
    print(f"   Environment : {settings.app_env}")
    print(f"   Primary LLM : {settings.primary_model}")
    print(f"   Fast LLM    : {settings.fast_model}")
    print(f"   MCP Server  : {settings.mcp_server_url}")
    print(f"   Docs        : http://localhost:8000/docs\n")

    # Fail fast — validate critical keys are not placeholders
    if "your_" in settings.gemini_api_key:
        print("[WARNING] GEMINI_API_KEY is still a placeholder.")

    # Warm-start the ADK Runner in the background to prevent blocking server boot
    async def warm_start():
        try:
            from app.agents.orchestrator import _init_runner
            await _init_runner()
            print("[STARTUP] ADK Runner + MCP tools ready.")
        except Exception as e:
            print(f"[STARTUP] ADK Runner init failed: {e} — server will still start.")

    import asyncio
    asyncio.create_task(warm_start())

    # Initialize and seed database
    try:
        from app.db.init_db import init_db
        await init_db()
        print("[STARTUP] Database initialized and seeded.")
    except Exception as e:
        print(f"[STARTUP] Database init failed: {e}")

    yield  # ← Application runs here

    # ── Shutdown ─────────────────────────────────────────────────
    from app.agents.orchestrator import close_ustadg_swarm
    await close_ustadg_swarm()
    
    scheduler.shutdown(wait=False)
    print("[SHUTDOWN] APScheduler stopped.")
    print("\n[SHUTDOWN] UstadG Backend shutting down...")


# ── App Instance ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="UstadG Backend API",
    description=(
        "**UstadG** — Agentic AI Service Booking Platform\n\n"
        "Phase 1 'Steel Thread': Request → Munasib Negotiation → Booking\n\n"
        "Built with FastAPI · OpenAI Agents SDK · OpenRouter · FastMCP"
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/v1"

app.include_router(health.router,    prefix=API_PREFIX)
app.include_router(chat.router,      prefix=API_PREFIX)
app.include_router(book.router,      prefix=API_PREFIX)
app.include_router(bookings.router,  prefix=API_PREFIX)
app.include_router(providers.router, prefix=API_PREFIX)
app.include_router(trace.router,     prefix=API_PREFIX)
app.include_router(users.router,     prefix=API_PREFIX)
app.include_router(admin.router,     prefix=API_PREFIX)
app.include_router(auth.router,      prefix=API_PREFIX)


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"], summary="API Root")
async def root() -> dict:
    """Returns basic project info and links to docs."""
    return {
        "project": "UstadG",
        "phase": "Phase 1 — Steel Thread (MVP)",
        "version": settings.app_version,
        "environment": settings.app_env,
        "links": {
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/v1/health",
        },
    }
