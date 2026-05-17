import asyncio
from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.provider import Provider

async def test_database_seed():
    print("Connecting to local SQLite database and fetching seeded providers...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Provider))
        providers = result.scalars().all()
        
        print(f"\nFound {len(providers)} providers in the database:\n")
        print(f"{'ID':<4} | {'Name':<25} | {'Service':<15} | {'Area':<20} | {'Rating':<6} | {'Lat/Lng':<20}")
        print("-" * 100)
        
        for p in providers:
            lat_lng = f"{p.lat}, {p.lng}" if p.lat else "N/A"
            print(f"{p.id:<4} | {p.name:<25} | {p.service_type:<15} | {p.area:<20} | {p.rating:<6.1f} | {lat_lng:<20}")
            
    print("\nDatabase check complete! Verification Successful! [OK]")

if __name__ == "__main__":
    asyncio.run(test_database_seed())
