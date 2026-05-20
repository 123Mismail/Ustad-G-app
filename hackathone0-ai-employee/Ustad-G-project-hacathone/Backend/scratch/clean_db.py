import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import SyncSessionLocal
from sqlalchemy import text

def clean_db():
    print("Connecting to database...")
    session = SyncSessionLocal()
    try:
        print("Cleaning up old test data...")
        # Delete specific test users
        session.execute(text("DELETE FROM users WHERE phone IN ('03007777777', '03009999991')"))
        
        # Clean providers to force re-seeding
        session.execute(text("DELETE FROM providers"))
        
        session.commit()
        print("Database tables cleaned successfully. Providers table truncated.")
    except Exception as e:
        session.rollback()
        print(f"Error cleaning DB: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    clean_db()
