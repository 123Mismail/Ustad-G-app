"""
routers/chat.py — POST /v1/chat

Connects the FastAPI chat endpoint to the Google ADK agent pipeline.
Session history is managed automatically by ADK InMemorySessionService.
"""

from fastapi import APIRouter, Depends
from app.schemas.chat import ChatRequest, ChatResponse
from app.config import Settings, get_settings
from app.agents.orchestrator import run_ustadg_swarm

router = APIRouter(tags=["Agent"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message to the UstadG agent pipeline",
    description=(
        "Primary entry point. Runs Triage → Discovery → Negotiation → Booking agents. "
        "Session history is automatically maintained per session_id by Google ADK."
    ),
)
async def chat(
    request: ChatRequest,
    settings: Settings = Depends(get_settings),
) -> ChatResponse:
    """
    Runs the Google ADK agent swarm for a given user message and session.
    ADK InMemorySessionService handles conversation history — no SESSION_STORE needed.
    """
    try:
        result = await run_ustadg_swarm(
            session_id=request.session_id,
            message=request.message,
            user_phone=request.user_phone,
        )

        return ChatResponse(
            session_id=request.session_id,
            reply=result.get("reply", "I'm sorry, I couldn't process that."),
            providers=result.get("providers"),  # Now populated from tool calls
            trace_steps=None,  # Populated in Phase 2 from ADK event stream
        )

    except Exception as e:
        error_msg = str(e)
        print(f"[CHAT_ROUTER] Error: {error_msg}")
        
        # Gracefully handle Gemini Free Tier Rate Limits (429)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            friendly_reply = (
                "معذرت، اس وقت سسٹم پر بہت زیادہ بوجھ ہے۔ براہ کرم 30 سیکنڈ بعد دوبارہ کوشش کریں۔\n\n"
                "(The system is currently experiencing high traffic. Please try again in 30 seconds.)"
            )
            return ChatResponse(
                session_id=request.session_id,
                reply=friendly_reply,
                providers=None,
                trace_steps=None,
            )
            
        return ChatResponse(
            session_id=request.session_id,
            reply=f"An error occurred: {error_msg}",
            providers=None,
            trace_steps=None,
        )
