# PostgreSQL Production Readiness Roadmap

> **Status:** ✅ Implemented
> **Goal:** Transition the UstadG backend from raw SQLite (`sqlite3` module) connections to standard, dialect-agnostic SQLAlchemy connections for dynamic SQLite/PostgreSQL switching via environment variables.
> **Trigger:** To be executed after all local manual testing is complete.

---

## Why This Matters for Production

Currently, SQLite is used for local development, which is great because it has zero setup. However, for a production-ready system:
1. **Concurrency:** SQLite locks the entire database file during writes, which causes latency and errors under high concurrent traffic.
2. **Persistence:** Production servers (like Docker containers or serverless cloud instances) have ephemeral filesystems. Any SQLite database file would be deleted when the container restarts.
3. **Pivoting to Postgres:** Switching to PostgreSQL (via Supabase, RDS, or Neon) handles high concurrency, automatic backups, and persistence natively.

By replacing hardcoded `sqlite3` connects with standard SQLAlchemy synchronous sessions, our code becomes **100% database-agnostic**.

---

## Planned Code Changes

Here are the exact changes ready to be copy-pasted when you decide to implement this:

### 1. Update Config (`app/config.py`)

Add the `database_url` field to settings inside `app/config.py`:

```python
class Settings(BaseSettings):
    # ... other settings ...
    
    # ── Database Url ──────────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./ustadg.db"
```

---

### 2. Update Database Scaffolding (`app/db/database.py`)

Expose a synchronous engine alongside the asynchronous engine. Replace the database connection setup:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings

settings = get_settings()
DATABASE_URL = settings.database_url

def get_sync_db_url(url: str) -> str:
    """Derive a synchronous database connection URL from an async one."""
    if url.startswith("sqlite+aiosqlite://"):
        return url.replace("sqlite+aiosqlite://", "sqlite://")
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql://")
    return url

# Async Engine (For general FastAPI request handlers)
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# Sync Engine (For synchronous agents, local searches, and sessions)
SYNC_DATABASE_URL = get_sync_db_url(DATABASE_URL)
sync_engine = create_engine(SYNC_DATABASE_URL, echo=False)
SyncSessionLocal = sessionmaker(sync_engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
```

---

### 3. Update ADK Session Persistence (`app/db/session_service.py`)

Replace all direct `sqlite3` connects with dynamic `SyncSessionLocal` merges:

```python
import json
from typing import Optional, Any
from google.adk.sessions import InMemorySessionService, Session
from app.db.database import SyncSessionLocal
from app.models.session import ChatSession

class PersistentSessionService(InMemorySessionService):
    def save_session_sync(self, session: Session) -> None:
        """Synchronously persist a Session using SQLAlchemy (db-agnostic)."""
        session_json = session.model_dump_json()
        db_session = SyncSessionLocal()
        try:
            # session.merge inserts or updates based on primary key
            chat_session = ChatSession(
                id=session.id,
                app_name=session.app_name,
                user_id=session.user_id,
                session_data=session_json
            )
            db_session.merge(chat_session)
            db_session.commit()
            print(f"[SESSION_DB] Saved session {session.id} using SQLAlchemy.")
        except Exception as e:
            db_session.rollback()
            print(f"[SESSION_DB] Error saving session {session.id}: {e}")
        finally:
            db_session.close()

    def _load_session_sync(self, app_name: str, user_id: str, session_id: str) -> Optional[dict]:
        """Synchronously load a Session state dict using SQLAlchemy."""
        db_session = SyncSessionLocal()
        try:
            row = db_session.query(ChatSession).filter_by(
                id=session_id, app_name=app_name, user_id=user_id
            ).first()
            if row:
                return json.loads(row.session_data)
        except Exception as e:
            print(f"[SESSION_DB] Error loading session {session_id}: {e}")
        finally:
            db_session.close()
        return None

    async def create_session(self, *, app_name: str, user_id: str, state: Optional[dict[str, Any]] = None, session_id: Optional[str] = None) -> Session:
        session = await super().create_session(app_name=app_name, user_id=user_id, state=state, session_id=session_id)
        self.save_session_sync(session)
        return session

    async def get_session(self, *, app_name: str, user_id: str, session_id: str, config: Optional[Any] = None) -> Optional[Session]:
        session = await super().get_session(app_name=app_name, user_id=user_id, session_id=session_id, config=config)
        if session:
            return session

        session_data = self._load_session_sync(app_name, user_id, session_id)
        if session_data:
            print(f"[SESSION_DB] Restored session {session_id} using SQLAlchemy.")
            session = Session.model_validate(session_data)
            self._sessions[(app_name, user_id, session_id)] = session
            return session

        return None
```

---

### 4. Update Local Provider Search Tool (`app/tools/local_search.py`)

Modify `search_local_providers` to use synchronous SQLAlchemy:

```python
import json
import math
import requests
from app.config import get_settings
from app.db.database import SyncSessionLocal
from app.models.provider import Provider

# ... haversine_km helper ...

def search_local_providers(service_type: str, area: str, city: str = "Karachi", limit: int = 5) -> str:
    """
    Search our own local provider database using SQLAlchemy (db-agnostic).
    """
    print(f"[LOCAL SEARCH] Searching for {service_type} in {area}, {city}...")
    
    db_session = SyncSessionLocal()
    try:
        results = db_session.query(Provider).filter_by(
            is_active=True,
            service_type=service_type.lower()
        ).all()
        
        providers = []
        for p in results:
            providers.append({
                "id": p.id,
                "name": p.name,
                "service_type": p.service_type,
                "area": p.area,
                "address": p.address,
                "phone": p.phone or "N/A",
                "email": p.email or "N/A",
                "lat": p.lat,
                "lng": p.lng,
                "rating": p.rating,
                "price": p.price
            })
    except Exception as e:
        print(f"[LOCAL SEARCH] Database query failed: {e}")
        providers = []
    finally:
        db_session.close()

    if not providers:
        print(f"[LOCAL SEARCH] No '{service_type}' found in database.")
        return json.dumps({"source": "local_db", "count": 0, "providers": []})

    # ... User Geocoding Logic ...
    # ... Haversine distance calculations & Sorting (remains identical) ...
```

---

### 5. Update Agent Personalization Context (`app/agents/orchestrator.py`)

Modify the saved user location injection to query via SQLAlchemy:

```python
        # ── User Recognition & Minimal System Context Injection ────────────────
        user_context = ""
        if user_phone:
            from app.db.database import SyncSessionLocal
            from app.models.user import User
            
            db_session = SyncSessionLocal()
            try:
                user_row = db_session.query(User).filter_by(phone=user_phone).first()
                if user_row:
                    session = await _session_service.get_session(
                        app_name=APP_NAME,
                        user_id=user_id,
                        session_id=session_id
                    )
                    if session and len(session.events) == 0:
                        user_context = f"[Saved Location: {user_row.area}, {user_row.city} | User Name: {user_row.name}]\n"
                        print(f"[ORCHESTRATOR] Injected system context: {user_context.strip()}")
            except Exception as e:
                print(f"[ORCHESTRATOR] Personalization error: {e}")
            finally:
                db_session.close()
```

---

## Toggling to PostgreSQL in Production

When this roadmap is implemented, deploying to production with a real Postgres DB requires **zero code changes**:

1. **Install database drivers:**
   Add `psycopg2-binary` (sync) and `asyncpg` (async) to `requirements.txt`.
2. **Update `.env`:**
   Change the connection URL in production to point to your live database instance:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:your-secure-password@your-database-host:5432/ustadg
   ```

*Version: 1.0 | Feature: Production Readiness | Project: UstadG | Created: 2026-05-18*
