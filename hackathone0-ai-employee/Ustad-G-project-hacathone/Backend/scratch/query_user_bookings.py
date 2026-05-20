import asyncio
import os
import sys

# Set database env
os.environ["DATABASE_URL"] = "postgresql+asyncpg://neondb_owner:npg_cdntoJB9bwD1@ep-lively-math-apuqqevk-pooler.c-7.us-east-1.aws.neon.tech/neondb?ssl=require"

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.models.booking import Booking
from app.routers.bookings import get_bookings

async def main():
    async with AsyncSessionLocal() as db:
        # Find user 15
        user_res = await db.execute(select(User).where(User.id == 15))
        user = user_res.scalars().first()
        if not user:
            print("User ID 15 not found!")
            return

        print(f"User: {user.name}, Phone: {user.phone}")

        # Call get_bookings
        print("\nCalling get_bookings API for User 15...")
        bookings = await get_bookings(skip=0, limit=10, db=db, current_user=user)
        print(f"Result count from get_bookings: {len(bookings)}")
        for b in bookings:
            print(f"Booking: UGK={b.confirmation_id}, Status={b.status}, Service={b.service}, Provider={b.provider_id}, CreatedAt={b.created_at}")

if __name__ == "__main__":
    asyncio.run(main())
