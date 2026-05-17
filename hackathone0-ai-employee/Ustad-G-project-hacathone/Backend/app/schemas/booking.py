"""
schemas/booking.py — Pydantic models for the /v1/book endpoint.

Skill pattern: Type everything, validate early with Field constraints.
"""

from pydantic import BaseModel, Field
import re


class BookRequest(BaseModel):
    session_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Session ID from a prior /v1/chat call",
        examples=["sess-abc123"],
    )
    provider_id: str = Field(
        ...,
        min_length=1,
        description="Google Maps Place ID of the selected provider",
        examples=["ChIJN1t_tDeuEmsRUsoyG83frY4"],
    )
    user_name: str = Field(
        default="Guest",
        max_length=100,
        description="Display name of the user making the booking",
    )


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
