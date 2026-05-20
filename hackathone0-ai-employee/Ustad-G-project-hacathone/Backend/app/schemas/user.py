from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UserOut(BaseModel):
    id: int
    name: str
    phone: str
    email: str | None = None
    city: str
    area: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the user")
    phone: str = Field(..., min_length=5, max_length=20, description="Unique phone number")
    email: str | None = Field(default=None, max_length=100, description="Optional email address")
    city: str = Field(default="Karachi", max_length=100, description="City of residence")
    area: str = Field(..., min_length=2, max_length=100, description="Area/neighborhood (e.g. Gulshan-e-Iqbal)")

class UserRegister(BaseModel):
    """Schema for auth registration (includes password)."""
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=5, max_length=20)
    email: str | None = None
    city: str = "Karachi"
    area: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, description="Minimum 6 characters")

class TokenOut(BaseModel):
    """Schema for the JWT response."""
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LoginRequest(BaseModel):
    """Schema for login via phone + password."""
    phone: str
    password: str

class UserProfileUpdate(BaseModel):
    """Schema for PATCH /v1/users/me — all fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    area: Optional[str] = Field(None, min_length=2, max_length=100)
