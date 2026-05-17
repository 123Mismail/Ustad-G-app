"""
routers/trace.py — GET /v1/trace/{session_id}

STUB — Task 1 only. Full implementation in Task 6.4.
Streams agent "thought" steps to the frontend via SSE for visual impact.
In Phase 1: returns in-memory trace logs as JSON.
In Phase 2: persisted to Supabase PostgreSQL.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.trace import TraceResponse
from app.config import Settings, get_settings

router = APIRouter(tags=["Trace"])


@router.get(
    "/trace/{session_id}",
    response_model=TraceResponse,
    summary="Retrieve agent decision trace for a session",
    description="Returns all agent reasoning steps for the given session. "
                "Used by the frontend to display a live 'agent thinking' view. "
                "**Stub in Task 1 — implemented in Task 6.4.**",
)
async def get_trace(
    session_id: str,
    settings: Settings = Depends(get_settings),
) -> TraceResponse:
    """Stub endpoint — raises 501 until Task 6.4."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "message": "Trace endpoint is a stub. Implemented in Task 6.4.",
            "session_id": session_id,
        },
    )
