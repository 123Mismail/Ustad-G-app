from datetime import datetime
from pydantic import BaseModel, Field

class ProviderOut(BaseModel):
    id: int
    name: str
    phone: str | None = None
    email: str | None = None
    service_type: str
    city: str
    area: str
    address: str
    lat: float | None = None
    lng: float | None = None
    rating: float
    price: int
    is_active: bool
    created_at: datetime

class ProviderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=20)
    email: str | None = Field(default=None, max_length=100)
    service_type: str = Field(..., min_length=2, max_length=100)
    city: str = Field(..., min_length=2, max_length=100)
    area: str = Field(..., min_length=2, max_length=100)
    address: str = Field(..., min_length=5, max_length=500)
    lat: float | None = None
    lng: float | None = None
    rating: float = Field(default=4.0, ge=0.0, le=5.0)
    price: int = Field(default=1000, ge=0)

class ProviderUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=20)
    email: str | None = Field(default=None, max_length=100)
    area: str | None = Field(default=None, min_length=2, max_length=100)
    address: str | None = Field(default=None, min_length=5, max_length=500)
    rating: float | None = Field(default=None, ge=0.0, le=5.0)
    price: int | None = Field(default=None, ge=0)
    is_active: bool | None = None
