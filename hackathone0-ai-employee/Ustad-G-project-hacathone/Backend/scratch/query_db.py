import asyncio
import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.booking import Booking
from app.models.user import User

async def main():
    async with AsyncSessionLocal() as db:
        # Check users
        print("=== USERS ===")
        user_res = await db.execute(select(User))
        users = user_res.scalars().all()
        for u in users:
            print(f"ID: {u.id}, Phone: {u.phone}, Name: {u.name}, Token: {getattr(u, 'device_token', '')}")

        # Check bookings
        print("\n=== BOOKINGS ===")
        booking_res = await db.execute(select(Booking))
        bookings = booking_res.scalars().all()
        if not bookings:
            print("No bookings found in database!")
        for b in bookings:
            print(f"ID: {b.id}, UGK: {b.confirmation_id}, UserID: {b.user_id}, Service: {b.service}, Status: {b.status}, CreatedAt: {b.created_at}")

if __name__ == "__main__":
    asyncio.run(main())
