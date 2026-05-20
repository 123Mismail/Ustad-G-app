import asyncio
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# Set environment
DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_cdntoJB9bwD1@ep-lively-math-apuqqevk-pooler.c-7.us-east-1.aws.neon.tech/neondb?ssl=require"

async def main():
    from app.models.booking import Booking
    from app.models.user import User

    engine = create_async_engine(DATABASE_URL)
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        # Fetch all users
        users_result = await db.execute(select(User))
        users = users_result.scalars().all()
        print(f"--- USERS ({len(users)}) ---")
        for u in users:
            print(f"ID: {u.id}, Name: {u.name}, Phone: {u.phone}, Device Token: {getattr(u, 'device_token', None)}")

        # Fetch all bookings
        bookings_result = await db.execute(select(Booking).order_by(Booking.created_at.desc()))
        bookings = bookings_result.scalars().all()
        print(f"\n--- BOOKINGS ({len(bookings)}) ---")
        for b in bookings[:20]:
            print(f"ID: {b.id}, Confirmation ID: {b.confirmation_id}, User ID: {b.user_id}, Provider: {b.provider_id}, Service: {b.service}, Status: {b.status}, Created At: {b.created_at}")

if __name__ == "__main__":
    asyncio.run(main())
