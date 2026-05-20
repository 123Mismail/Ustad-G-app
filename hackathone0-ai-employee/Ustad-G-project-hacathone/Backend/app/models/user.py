from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    phone      = Column(String(20), unique=True, index=True, nullable=False)
    email      = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(256), nullable=True)
    role       = Column(String(20), default="user")
    city       = Column(String(100), default="Karachi", nullable=False)
    area       = Column(String(100), nullable=False, index=True)  # Saved location (e.g. "Gulshan-e-Iqbal")
    device_token = Column(String(500), nullable=True)  # Firebase FCM registration token
    created_at = Column(DateTime(timezone=True), server_default=func.now())
