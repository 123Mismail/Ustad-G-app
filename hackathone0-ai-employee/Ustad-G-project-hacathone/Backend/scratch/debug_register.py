import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.schemas.user import UserRegister
from app.routers.auth import register

async def test_register():
    async with AsyncSessionLocal() as db:
        body = UserRegister(
            name="Test Local",
            phone="03008888888",
            email="local@example.com",
            city="Karachi",
            area="Clifton",
            password="password123"
        )
        try:
            user = await register(body, db)
            print("Success:", user.id)
        except Exception as e:
            print("ERROR CAUGHT:", e.__class__.__name__, e)
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_register())
