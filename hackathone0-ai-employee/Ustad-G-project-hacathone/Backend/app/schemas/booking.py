"""
schemas/booking.py — Pydantic models for the /v1/book endpoint.

Skill pattern: Type everything, validate early with Field constraints.
"""

from pydantic import BaseModel, Field
import re


from typing import Optional
from datetime import datetime

class BookRequest(BaseModel):
    session_id: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Optional session ID from a prior /v1/chat call",
    )
    provider_id: str = Field(
        ...,
        min_length=1,
        description="Google Maps Place ID or Name of the selected provider",
    )
    user_name: str = Field(
        default="Guest",
        max_length=100,
        description="Display name of the user making the booking",
    )
    service: Optional[str] = Field(default="General", description="Service category")
    scheduled_at: Optional[datetime] = Field(default=None, description="Requested appointment time")


class BookResponse(BaseModel):
    confirmation_id: str = Field(
        ...,
        description="Unique booking ID in format UGK-YYYY-XXXX",
        examples=["UGK-2026-4821"],
    )
    status: str = Field(default="Confirmed")
    message: str = Field(
        ...,
        description="Bilingual confirmation message for the user",
    )
    provider_name: str = Field(
        ...,
        description="Name of the booked provider",
    )

from datetime import datetime
from typing import Optional

class BookingOut(BaseModel):
    id: int
    confirmation_id: str
    user_id: int
    provider_id: str
    service: Optional[str]
    scheduled_at: Optional[datetime]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
