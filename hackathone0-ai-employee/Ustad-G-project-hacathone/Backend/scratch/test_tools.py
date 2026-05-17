import asyncio
import json
from mcp_server.tools.maps_tool import google_maps_search_providers, MapsSearchInput
from mcp_server.tools.sheets_tool import google_sheets_record_booking, SheetsBookingInput
from mcp_server.tools.calendar_tool import google_calendar_create_appointment, CalendarBookingInput

async def test_tools():
    print("--- Testing Maps Tool (Mock/Real) ---")
    try:
        maps_params = MapsSearchInput(
            service="plumber",
            location="Karachi",
            max_results=2
        )
        maps_res = await google_maps_search_providers(maps_params)
        print(f"Maps Result: {maps_res}")
    except Exception as e:
        print(f"Maps Error: {e}")

    print("\n--- Testing Sheets Tool (Mock) ---")
    try:
        sheets_params = SheetsBookingInput(
            confirmation_id="UGK-2026-1234",
            user_name="Test User",
            service="Plumbing",
            provider_name="Ali Plumbers",
            provider_address="Block 5, Karachi"
        )
        sheets_res = await google_sheets_record_booking(sheets_params)
        print(f"Sheets Result: {sheets_res}")
    except Exception as e:
        print(f"Sheets Error: {e}")

    print("\n--- Testing Calendar Tool (Mock) ---")
    try:
        cal_params = CalendarBookingInput(
            summary="Plumber Appointment",
            description="Fixing leak",
            start_time="2026-05-16T10:00:00Z",
            end_time="2026-05-16T11:00:00Z"
        )
        cal_res = await google_calendar_create_appointment(cal_params)
        print(f"Calendar Result: {cal_res}")
    except Exception as e:
        print(f"Calendar Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_tools())
