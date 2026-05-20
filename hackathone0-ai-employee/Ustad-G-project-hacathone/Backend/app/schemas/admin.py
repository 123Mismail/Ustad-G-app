from pydantic import BaseModel
from typing import List
from datetime import datetime

class ServiceBreakdown(BaseModel):
    service: str
    count: int

class AdminStats(BaseModel):
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    active_providers: int
    total_providers: int
    estimated_revenue_pkr: int         # Sum of provider.price for each confirmed booking
    top_services: List[ServiceBreakdown]  # Top 5 service types by booking count

class AdminBookingItem(BaseModel):
    id: int
    confirmation_id: str
    user_id: int
    provider_id: str
    service: str | None
    status: str
    scheduled_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True

class ProviderBookingStats(BaseModel):
    id: int
    name: str
    service_type: str
    area: str
    rating: float
    price: int
    is_active: bool
    booking_count: int       # Total bookings referencing this provider's ID
