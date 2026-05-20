import asyncio
import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.models.booking import Booking
from app.utils.auth import create_access_token
from app.routers.bookings import get_bookings

async def main():
    async with AsyncSessionLocal() as db:
        # Find user 12
        user_res = await db.execute(select(User).where(User.id == 12))
        user = user_res.scalars().first()
        if not user:
            print("User ID 12 not found!")
            return

        # Generate JWT access token
        token_data = {"sub": str(user.id), "role": user.role}
        access_token = create_access_token(token_data)
        print(f"JWT Token for User 12: {access_token}")

        # Call get_bookings
        print("\nCalling get_bookings API for User 12...")
        bookings = await get_bookings(skip=0, limit=10, db=db, current_user=user)
        print(f"Result count: {len(bookings)}")
        for b in bookings:
            print(f"Booking: UGK={b.confirmation_id}, Status={b.status}, Service={b.service}, Provider={b.provider_id}")

        # Also query the total number of bookings in the DB for this user directly
        direct_res = await db.execute(select(Booking).where(Booking.user_id == 12))
        direct_bookings = direct_res.scalars().all()
        print(f"\nDirect query count in DB for User 12: {len(direct_bookings)}")

if __name__ == "__main__":
    asyncio.run(main())
