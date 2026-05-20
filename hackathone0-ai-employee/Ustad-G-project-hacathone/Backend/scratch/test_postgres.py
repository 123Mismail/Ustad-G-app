import asyncio
import os
import sys
from dotenv import load_dotenv

# Reconfigure stdout/stderr to use UTF-8 if supported
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

# Force load latest .env
load_dotenv(override=True)

from app.config import get_settings
from app.db.database import engine, Base, AsyncSessionLocal
from app.models.provider import Provider

async def test_postgres_connection():
    settings = get_settings()
    db_url = settings.database_url
    
    print("\n--- DATABASE ENV VAR DUMP ---")
    for key, val in os.environ.items():
        if "DB" in key.upper() or "POSTGRES" in key.upper() or "URL" in key.upper():
            masked_val = val
            if "@" in val:
                prefix, suffix = val.split("@", 1)
                masked_val = f"***@{suffix}"
            print(f"Env key: {key} = {masked_val}")

    print("\n--- DATABASE URL CHECK ---")
    if "@" in db_url:
        prefix, suffix = db_url.split("@", 1)
        masked_url = f"***@{suffix}"
    else:
        masked_url = db_url
    print(f"Configured settings.database_url: {masked_url}")

    print("\n--- 1. TESTING TABLE CREATION ---")
    try:
        async with engine.begin() as conn:
            print("Connecting and creating tables...")
            await conn.run_sync(Base.metadata.create_all)
        print("Success: Tables created/verified successfully!")
    except Exception as e:
        print(f"Fail: Failed to create tables: {e}")
        return

    print("\n--- 2. TESTING SEED / INSERT DATA ---")
    async with AsyncSessionLocal() as session:
        try:
            # Query existing providers
            from sqlalchemy import select
            result = await session.execute(select(Provider).limit(1))
            first_provider = result.scalars().first()
            
            if first_provider is None:
                print("No providers found. Inserting a test provider...")
                test_p = Provider(
                    name="Test Postgres Plumber",
                    service_type="plumber",
                    city="Karachi",
                    area="Clifton",
                    address="Block 5, Clifton, Karachi",
                    lat=24.8100,
                    lng=67.0250,
                    rating=4.5,
                    price=1200,
                    email="test.postgres@ustadg.com"
                )
                session.add(test_p)
                await session.commit()
                print("Success: Successfully inserted test provider!")
            else:
                print(f"Success: Found existing provider in database: {first_provider.name} ({first_provider.service_type})")
        except Exception as e:
            await session.rollback()
            print(f"Fail: Database insert/query test failed: {e}")

    print("\n--- 3. TESTING MOCK SEEDING FLOW ---")
    try:
        from app.db.init_db import init_db
        print("Invoking init_db()...")
        await init_db()
        print("Success: init_db() executed successfully!")
    except Exception as e:
        print(f"Fail: init_db() failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_postgres_connection())
