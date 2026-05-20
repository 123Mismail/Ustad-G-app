from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings

settings = get_settings()
RAW_DATABASE_URL = settings.database_url

def get_sync_db_url(url: str) -> str:
    """Derive a synchronous database connection URL from an async one."""
    if url.startswith("sqlite+aiosqlite://"):
        return url.replace("sqlite+aiosqlite://", "sqlite://")
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql://")
    return url

def sanitize_async_db_url(url: str) -> str:
    """Sanitize connection URL for asyncpg (requires ssl=require instead of sslmode=require)."""
    if "postgresql+asyncpg://" in url:
        if "sslmode=" in url:
            return url.replace("sslmode=", "ssl=")
    return url

def sanitize_sync_db_url(url: str) -> str:
    """Sanitize connection URL for psycopg2 (requires sslmode=require instead of ssl=require)."""
    if url.startswith("postgresql://") or url.startswith("postgresql+psycopg2://"):
        if "ssl=" in url and "sslmode=" not in url:
            return url.replace("ssl=", "sslmode=")
    return url

# ── Async Engine Setup (For general FastAPI request handlers) ──
DATABASE_URL = sanitize_async_db_url(RAW_DATABASE_URL)
async_connect_args = {}
if DATABASE_URL.startswith("sqlite+aiosqlite://"):
    async_connect_args = {"check_same_thread": False}
    engine = create_async_engine(DATABASE_URL, echo=False, connect_args=async_connect_args)
else:
    engine = create_async_engine(DATABASE_URL, echo=False, connect_args=async_connect_args, pool_pre_ping=True, pool_recycle=300, pool_size=10, max_overflow=20)
    
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# ── Sync Engine Setup (For synchronous agents, local searches, and sessions) ──
SYNC_DATABASE_URL = sanitize_sync_db_url(get_sync_db_url(RAW_DATABASE_URL))
sync_connect_args = {}
if SYNC_DATABASE_URL.startswith("sqlite://"):
    sync_connect_args = {"check_same_thread": False}
    sync_engine = create_engine(SYNC_DATABASE_URL, echo=False, connect_args=sync_connect_args)
else:
    sync_engine = create_engine(SYNC_DATABASE_URL, echo=False, connect_args=sync_connect_args, pool_pre_ping=True, pool_recycle=300, pool_size=10, max_overflow=20)

SyncSessionLocal = sessionmaker(sync_engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
