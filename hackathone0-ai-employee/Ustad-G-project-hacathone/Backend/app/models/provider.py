from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Provider(Base):
    __tablename__ = "providers"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(200), nullable=False)
    phone         = Column(String(20), nullable=True)
    email         = Column(String(100), nullable=True, index=True)
    service_type  = Column(String(100), nullable=False, index=True)  # "plumber", "electrician"
    city          = Column(String(100), nullable=False, index=True)  # "Karachi"
    area          = Column(String(100), nullable=False, index=True)  # "Gulshan-e-Iqbal"
    address       = Column(String(500), nullable=False)
    lat           = Column(Float, nullable=True)   # from Google Geocoding (one-time at registration)
    lng           = Column(Float, nullable=True)
    rating        = Column(Float, default=4.0)
    price         = Column(Integer, nullable=False, default=1000) # Base fee in PKR
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
