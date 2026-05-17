from datetime import datetime
from pydantic import BaseModel, Field

class UserOut(BaseModel):
    id: int
    name: str
    phone: str
    email: str | None = None
    city: str
    area: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the user")
    phone: str = Field(..., min_length=5, max_length=20, description="Unique phone number")
    email: str | None = Field(default=None, max_length=100, description="Optional email address")
    city: str = Field(default="Karachi", max_length=100, description="City of residence")
    area: str = Field(..., min_length=2, max_length=100, description="Area/neighborhood (e.g. Gulshan-e-Iqbal)")
