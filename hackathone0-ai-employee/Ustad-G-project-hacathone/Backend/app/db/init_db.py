import asyncio
from app.db.database import engine, Base, AsyncSessionLocal
from app.models.provider import Provider
from app.models.user import User
from app.models.booking import Booking  # noqa: F401 — ensures table is created
from app.models.session import ChatSession  # noqa: F401 — ensures table is created

# 10 mock providers across Karachi services & areas
MOCK_PROVIDERS = [
    {
        "name": "Ali Plumber Services",
        "service_type": "plumber",
        "city": "Karachi",
        "area": "Gulshan-e-Iqbal",
        "address": "Block 13-D, Gulshan-e-Iqbal, Karachi",
        "lat": 24.9215,
        "lng": 67.0927,
        "rating": 4.8,
        "price": 800,
        "email": "ali.plumber@ustadg.com"
    },
    {
        "name": "Karachi Plumbing Pros",
        "service_type": "plumber",
        "city": "Karachi",
        "area": "DHA Phase 6",
        "address": "Khayaban-e-Shahbaz, DHA Phase 6, Karachi",
        "lat": 24.8141,
        "lng": 67.0782,
        "rating": 4.5,
        "price": 1200,
        "email": "pros.plumbing@ustadg.com"
    },
    {
        "name": "Ahmed Electrician",
        "service_type": "electrician",
        "city": "Karachi",
        "area": "Gulshan-e-Iqbal",
        "address": "Block 5, Gulshan-e-Iqbal, Karachi",
        "lat": 24.9230,
        "lng": 67.0910,
        "rating": 4.7,
        "price": 1000,
        "email": "ahmed.electric@ustadg.com"
    },
    {
        "name": "Fast Fix Electric",
        "service_type": "electrician",
        "city": "Karachi",
        "area": "North Nazimabad",
        "address": "Block H, North Nazimabad, Karachi",
        "lat": 24.9480,
        "lng": 67.0320,
        "rating": 4.3,
        "price": 900,
        "email": "fastfix.electric@ustadg.com"
    },
    {
        "name": "Master Carpenter Bashir",
        "service_type": "carpenter",
        "city": "Karachi",
        "area": "Clifton",
        "address": "Block 2, Clifton, Karachi",
        "lat": 24.8100,
        "lng": 67.0250,
        "rating": 4.6,
        "price": 1500,
        "email": "bashir.woodwork@ustadg.com"
    },
    {
        "name": "Karachi Woodwork Studio",
        "service_type": "carpenter",
        "city": "Karachi",
        "area": "DHA Phase 4",
        "address": "Commercial Avenue, DHA Phase 4, Karachi",
        "lat": 24.8223,
        "lng": 67.0650,
        "rating": 4.4,
        "price": 1800,
        "email": "studio.woodwork@ustadg.com"
    },
    {
        "name": "SparkClean Home Services",
        "service_type": "cleaner",
        "city": "Karachi",
        "area": "Gulshan-e-Iqbal",
        "address": "Block 10-A, Gulshan-e-Iqbal, Karachi",
        "lat": 24.9200,
        "lng": 67.0880,
        "rating": 4.9,
        "price": 1000,
        "email": "clean.home@ustadg.com"
    },
    {
        "name": "ProPaint Karachi",
        "service_type": "painter",
        "city": "Karachi",
        "area": "PECHS",
        "address": "Block 2, PECHS, Karachi",
        "lat": 24.8650,
        "lng": 67.0600,
        "rating": 4.2,
        "price": 2500,
        "email": "propaint.khi@ustadg.com"
    },
    {
        "name": "Hassan AC Repair",
        "service_type": "ac_repair",
        "city": "Karachi",
        "area": "Nazimabad",
        "address": "Nazimabad No. 1, Karachi",
        "lat": 24.9380,
        "lng": 67.0250,
        "rating": 4.5,
        "price": 1500,
        "email": "hassan.ac@ustadg.com"
    },
    {
        "name": "Karachi AC Solutions",
        "service_type": "ac_repair",
        "city": "Karachi",
        "area": "Gulshan-e-Iqbal",
        "address": "Block 4, Gulshan-e-Iqbal, Karachi",
        "lat": 24.9240,
        "lng": 67.0935,
        "rating": 4.8,
        "price": 2000,
        "email": "solutions.ac@ustadg.com"
    }
]

async def init_db():
    print("[INIT_DB] Initializing database tables...")
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.create_all)
    
    print("[INIT_DB] Checking for existing mock providers...")
    async with AsyncSessionLocal() as session:
        # Check if we already have providers
        from sqlalchemy import select
        result = await session.execute(select(Provider).limit(1))
        first_provider = result.scalars().first()
        
        if first_provider is None:
            print("[INIT_DB] No providers found. Seeding 10 mock providers...")
            for p_data in MOCK_PROVIDERS:
                new_provider = Provider(**p_data)
                session.add(new_provider)
            await session.commit()
            print("[INIT_DB] Mock providers seeded successfully.")
        else:
            print("[INIT_DB] Providers already exist. Skipping seed.")

        # Check if we already have users
        user_result = await session.execute(select(User).limit(1))
        first_user = user_result.scalars().first()
        if first_user is None:
            print("[INIT_DB] No users found. Seeding mock user Osman...")
            mock_user = User(
                name="Osman",
                phone="03001234567",
                email="osman@gmail.com",
                city="Karachi",
                area="Gulshan-e-Iqbal"
            )
            session.add(mock_user)
            await session.commit()
            print("[INIT_DB] Mock user Osman seeded successfully.")
        else:
            print("[INIT_DB] Users already exist. Skipping seed.")

if __name__ == "__main__":
    asyncio.run(init_db())
