import re
import json
import asyncio
from uuid import uuid4
from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, field_validator
from mcp_server.config import get_mcp_settings
from mcp_server.utils.error_handler import handle_google_api_error
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

class BookingStatus(str, Enum):
    CONFIRMED = "Confirmed"
    PENDING = "Pending"
    CANCELLED = "Cancelled"

class SheetsBookingInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    confirmation_id: str = Field(...,
        description="Unique booking ID in format UGK-YYYY-XXXX",
        examples=["UGK-2026-4821"])
    user_name: str = Field(..., min_length=1, max_length=100)
    service: str = Field(..., min_length=2, max_length=100,
        description="Service type (e.g., 'Plumber', 'Electrician')")
    provider_name: str = Field(..., min_length=1, max_length=200)
    provider_address: str = Field(..., min_length=5, max_length=500)
    status: BookingStatus = Field(default=BookingStatus.CONFIRMED)

    @field_validator("confirmation_id")
    @classmethod
    def validate_confirmation_id(cls, v: str) -> str:
        if not re.match(r"^UGK-\d{4}-\d{4}$", v):
            raise ValueError("confirmation_id must match format UGK-YYYY-XXXX (e.g. UGK-2026-4821)")
        return v

def _append_to_sheet_sync(params: SheetsBookingInput) -> str:
    """Synchronous function to interact with Google Sheets API."""
    settings = get_mcp_settings()
    
    # In a real environment, you'd load actual credentials here
    if "your_" in settings.google_sheets_credentials or not settings.google_sheets_credentials:
        # Mock behavior for local testing if no real creds are provided
        return json.dumps({
            "success": True, 
            "message": f"MOCK: Appended booking {params.confirmation_id} to sheet",
            "mocked": True
        })

    try:
        SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
        
        # Support both raw JSON string (Cloud Run Secrets) and file path (Local)
        if settings.google_sheets_credentials.strip().startswith("{"):
            creds_info = json.loads(settings.google_sheets_credentials)
            creds = Credentials.from_service_account_info(creds_info, scopes=SCOPES)
        else:
            creds = Credentials.from_service_account_file(settings.google_sheets_credentials, scopes=SCOPES)
            
        service = build("sheets", "v4", credentials=creds)

        values = [[
            str(uuid4().int)[:8],      # Auto ID
            datetime.now(timezone.utc).isoformat(),
            params.user_name,
            params.service,
            params.provider_name,
            params.status,
            params.confirmation_id,    # UGK-YYYY-XXXX
        ]]
        
        result = service.spreadsheets().values().append(
            spreadsheetId=settings.google_sheets_booking_id,
            range="Sheet1!A:G",
            valueInputOption="RAW",
            body={"values": values}
        ).execute()
        
        return json.dumps({
            "success": True,
            "updates": result.get("updates", {})
        }, indent=2)
    except Exception as e:
        raise e

async def google_sheets_record_booking(params: SheetsBookingInput) -> str:
    """Append a confirmed booking as a new row in the Google Sheet."""
    try:
        # Run the synchronous Google API call in a thread pool
        result = await asyncio.to_thread(_append_to_sheet_sync, params)
        return result
    except Exception as e:
        return handle_google_api_error(e)
