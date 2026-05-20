# TASK 6 — Chat Router + ADK Session Integration
> **Parent:** `PHASE1_TASKS.md` → Task 7 (Chat Router Update)
> **Goal:** Connect the FastAPI `/v1/chat` endpoint to the Google ADK `Runner` using `InMemorySessionService` for stateful multi-turn conversations.
> **Updated:** 2026-05-16 — Migrated from manual SESSION_STORE dict to ADK session management.

> [!IMPORTANT]
> **Breaking Change from Previous Version:** The old `run_ustadg_swarm(messages=[...])` signature that accepted a raw message list is replaced with `run_ustadg_swarm(session_id, message)`. ADK's `InMemorySessionService` handles all conversation history internally.

---

## 1. Overview

The ADK `Runner` + `InMemorySessionService` replaces the manual `SESSION_STORE = {}` pattern. ADK maintains the full message history per `session_id` automatically. The chat router simply:
1. Receives the user's message and `session_id`.
2. Calls `run_ustadg_swarm(session_id, message)`.
3. Returns the agent's final reply.

---

## 2. Proposed Changes

### 2.1 — `app/agents/orchestrator.py` (see TASK5_AGENT_SWARM.md for full code)
- ADK `InMemorySessionService` replaces `SESSION_STORE = {}`.
- `run_ustadg_swarm(session_id: str, message: str)` replaces `run_ustadg_swarm(messages: List[dict])`.
- Session history is automatically persisted across calls with the same `session_id`.

### 2.2 — `app/routers/chat.py` (Full Update)

```python
# app/routers/chat.py
from fastapi import APIRouter, Request
from app.schemas.chat import ChatRequest, ChatResponse
from app.agents.orchestrator import run_ustadg_swarm

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request):
    """
    Primary chat endpoint. Routes the user's message through the
    Google ADK agent pipeline (Triage → Discovery → Negotiation → Booking).
    Session history is managed automatically by ADK InMemorySessionService.
    """
    try:
        result = await run_ustadg_swarm(
            session_id=request.session_id,
            message=request.message
        )
        return ChatResponse(
            session_id=request.session_id,
            reply=result["reply"],
            providers=None,      # Populated by Discovery agent in Phase 1.1
            trace_steps=None     # Populated by ADK event stream in Phase 2
        )
    except Exception as e:
        return ChatResponse(
            session_id=request.session_id,
            reply=f"An error occurred: {str(e)}",
            providers=None,
            trace_steps=None
        )
```

---

## 3. Key Differences from Previous Implementation

| Aspect | Old (OpenAI SDK) | New (Google ADK) |
|---|---|---|
| Session Storage | `SESSION_STORE = {}` (manual dict) | `InMemorySessionService` (built-in ADK) |
| Message Format | `[{"role": "user", "content": "..."}]` | `Content(parts=[Part(text="...")])` |
| Swarm Call | `run_ustadg_swarm(messages=[...])` | `run_ustadg_swarm(session_id, message)` |
| Agent Handoff | `handoffs=[agent]` (openai-agents) | `sub_agents=[agent]` (LLM-driven) |
| Auth | `Authorization: Bearer` (broken) | `GOOGLE_API_KEY` env var (native) |
| Error Cause | "API key not valid" 400 error | ✅ Resolved |

---

## 4. Acceptance Criteria
- [x] `POST /v1/chat` returns `200 OK` with a text reply from TriageAgent.
- [x] Successive calls with the same `session_id` maintain conversation context.
- [x] Agent handoff from TriageAgent to DiscoveryAgent is triggered automatically.
- [x] MCP tools (`google_maps_search_providers`) are called correctly by DiscoveryAgent.
- [x] No `SESSION_STORE` dict in `chat.py` — history is fully managed by ADK.
