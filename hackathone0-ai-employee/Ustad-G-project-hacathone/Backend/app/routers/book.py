import re
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.booking import BookRequest, BookResponse
from app.config import Settings, get_settings
from app.agents.orchestrator import run_ustadg_swarm

router = APIRouter(tags=["Booking"])


@router.post(
    "/book",
    response_model=BookResponse,
    summary="Confirm a booking for a selected provider",
    description="Triggers the Booking Agent to generate a UGK-YYYY-XXXX confirmation ID "
                "and record the booking to Google Sheets and Google Calendar.",
)
async def book(
    request: BookRequest,
    settings: Settings = Depends(get_settings),
) -> BookResponse:
    """
    Runs the agent swarm with a direct booking confirmation instruction.
    Extracts the UGK confirmation ID and provider name from the agent's response
    and returns a structured BookResponse.
    """
    try:
        # Construct a direct instruction to force the booking flow
        booking_instruction = (
            f"I want to book the provider '{request.provider_id}' directly. "
            f"My name is '{request.user_name}'. Please confirm the booking for tomorrow at 10:00 AM. "
            f"Generate a unique UGK ID (e.g. UGK-2026-1234), call both google_sheets_record_booking "
            f"and google_calendar_create_appointment tools, and provide the confirmation."
        )

        result = await run_ustadg_swarm(
            session_id=request.session_id,
            message=booking_instruction,
        )

        reply = result.get("reply", "")

        # Extract UGK ID using regex (e.g., UGK-2026-4821)
        ugk_match = re.search(r"UGK-\d{4}-\d{4}", reply)
        confirmation_id = ugk_match.group(0) if ugk_match else "UGK-2026-0000"

        # Try to extract the provider name from the reply
        provider_name = "Selected Provider"
        provider_match = re.search(r"Provider:\s*([^\n\r]+)", reply, re.IGNORECASE)
        if provider_match:
            provider_name = provider_match.group(1).strip()
        else:
            # Fallback: if provider_id looks like a name instead of ChIJ... Place ID, use it
            if not request.provider_id.startswith("ChI"):
                provider_name = request.provider_id

        return BookResponse(
            confirmation_id=confirmation_id,
            status="Confirmed",
            message=reply,
            provider_name=provider_name
        )

    except Exception as e:
        error_msg = str(e)
        print(f"[BOOK_ROUTER] Error: {error_msg}")
        
        # Gracefully handle Gemini Free Tier Rate Limits (429)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            friendly_reply = (
                "معذرت، اس وقت سسٹم پر بہت زیادہ بوجھ ہے۔ براہ کرم 30 سیکنڈ بعد دوبارہ کوشش کریں۔\n\n"
                "(The system is currently experiencing high traffic. Please try again in 30 seconds.)"
            )
            return BookResponse(
                confirmation_id="UGK-2026-0000",
                status="Degraded",
                message=friendly_reply,
                provider_name="System"
            )
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during booking: {error_msg}"
        )

