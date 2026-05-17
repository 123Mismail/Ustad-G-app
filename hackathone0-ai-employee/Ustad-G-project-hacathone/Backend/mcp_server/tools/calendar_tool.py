import json
import asyncio
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from mcp_server.config import get_mcp_settings
from mcp_server.utils.error_handler import handle_google_api_error
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

class CalendarBookingInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    summary: str = Field(..., min_length=1, max_length=100, description="e.g., 'Plumber Appointment - Ali Services'")
    description: str = Field(..., min_length=1, description="Details of the booking")
    start_time: str = Field(..., description="ISO 8601 format datetime (e.g., '2026-05-16T10:00:00Z')")
    end_time: str = Field(..., description="ISO 8601 format datetime (e.g., '2026-05-16T11:00:00Z')")
    attendee_email: Optional[str] = Field(default=None, description="User's email (optional)")

def _create_calendar_event_sync(params: CalendarBookingInput) -> str:
    """Synchronous function to interact with Google Calendar API."""
    settings = get_mcp_settings()
    
    # In a real environment, you'd load actual credentials here
    if "your_" in settings.google_sheets_credentials or not settings.google_sheets_credentials:
        # Mock behavior for local testing if no real creds are provided
        return json.dumps({
            "success": True, 
            "message": f"MOCK: Created event '{params.summary}'",
            "event_link": "https://calendar.google.com/mock-event",
            "mocked": True
        })

    try:
        SCOPES = ["https://www.googleapis.com/auth/calendar.events"]
        # Support both raw JSON string (Cloud Run Secrets) and file path (Local)
        if settings.google_sheets_credentials.strip().startswith("{"):
            creds_info = json.loads(settings.google_sheets_credentials)
            creds = Credentials.from_service_account_info(creds_info, scopes=SCOPES)
        else:
            creds = Credentials.from_service_account_file(settings.google_sheets_credentials, scopes=SCOPES)
            
        service = build("calendar", "v3", credentials=creds)

        event = {
            'summary': params.summary,
            'description': params.description,
            'start': {
                'dateTime': params.start_time,
            },
            'end': {
                'dateTime': params.end_time,
            },
        }

        if params.attendee_email:
            event['attendees'] = [{'email': params.attendee_email}]

        # Create the event
        created_event = service.events().insert(
            calendarId=settings.google_calendar_id, 
            body=event
        ).execute()

        return json.dumps({
            "success": True,
            "event_id": created_event.get("id"),
            "event_link": created_event.get("htmlLink")
        }, indent=2)
    except Exception as e:
        raise e

async def google_calendar_create_appointment(params: CalendarBookingInput) -> str:
    """Create an appointment/reminder in Google Calendar."""
    try:
        # Run the synchronous Google API call in a thread pool
        result = await asyncio.to_thread(_create_calendar_event_sync, params)
        return result
    except Exception as e:
        return handle_google_api_error(e)
