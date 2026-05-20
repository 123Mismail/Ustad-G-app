import asyncio
import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.provider import Provider

async def main():
    async with AsyncSessionLocal() as db:
        print("=== PROVIDERS IN NEON DB ===")
        res = await db.execute(select(Provider))
        providers = res.scalars().all()
        print(f"Total providers found: {len(providers)}")
        for p in providers:
            print(f"ID: {p.id}, Name: {p.name}, Service: {p.service_type}, Area: {p.area}, Location: ({p.lat}, {p.lng}), Rating: {p.rating}, BasePrice: {p.price} PKR")

if __name__ == "__main__":
    asyncio.run(main())
