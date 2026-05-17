# UstadG Backend — Phase 1 Task List (v2.0)
> **Goal:** "Steel Thread" MVP — Process a user request → Negotiate a deal → Record a booking.
> **Stack:** FastAPI · **Google ADK** · Gemini 2.5 Flash (native) · FastMCP · Google Maps API · Google Sheets API
> **Updated:** 2026-05-16 — Migrated from OpenAI Agents SDK to Google ADK (see `BACKEND_ARCHITECTURE_PRD.md` v2.0)

---

## ✅ TASK 1 — Project Scaffolding & Configuration
- [x] **1.1** Create the `Backend/` folder structure
- [x] **1.2** Create `requirements.txt` with Phase 1 dependencies
- [x] **1.3** Create `.env.example` with all required keys
- [x] **1.4** Create `app/config.py` — load env vars using `pydantic-settings`
- [x] **1.5** Create `Backend/README.md` — setup and run instructions
- [x] **Status:** ✅ Complete

---

## ✅ TASK 2 — Google Services MCP Server
> File: `mcp_server/`

- [x] **2.1** Initialize `FastMCP` server in `mcp_server/server.py`, running on port `8001`
- [x] **2.2** Implement `google_maps_search_providers` tool
- [x] **2.3** Implement `google_sheets_record_booking` tool
- [x] **2.4** Implement `google_calendar_create_appointment` tool
- [x] **2.5** Register all tools on the `FastMCP` server
- [x] **2.6** Deploy to Google Cloud Run (SSE Transport)
- [x] **Status:** ✅ Complete

---

## ✅ TASK 3 — FastAPI App Scaffolding
> File: `app/main.py`

- [x] **3.1** Create `app/main.py` with CORS and router registration
- [x] **3.2** Create `app/schemas/` Pydantic models (`ChatRequest`, `ChatResponse`, `BookRequest`, etc.)
- [x] **3.3** Create all routers (`chat`, `book`, `providers`, `trace`, `health`)
- [x] **Status:** ✅ Complete

---

## ✅ TASK 4 — Mock Identity Middleware
> File: `app/middleware/mock_user.py`

- [x] **4.1** Create `MockUser` dataclass
- [x] **4.2** Create FastAPI middleware that injects `MockUser` context
- [x] **Status:** ✅ Complete

---

## ✅ TASK 5 — Agent Definitions (Google ADK)
> Files: `app/agents/`
> **Framework Change:** Replaced `openai-agents` `Agent` class with Google ADK `LlmAgent`.

### 5.1 — Install Google ADK
- [x] **5.1.1** Install `google-adk` into the virtual environment:
  ```bash
  .\.venv\Scripts\python.exe -m pip install google-adk
  ```
- [x] **5.1.2** Update `requirements.txt` — replace `openai-agents` with `google-adk>=1.0.0`
- [x] **5.1.3** Set `GOOGLE_API_KEY` from `GEMINI_API_KEY` in `app/config.py`

### 5.2 — Refactor Triage Agent (`app/agents/triage.py`)
- [x] **5.2.1** Import `LlmAgent` from `google.adk.agents`
- [x] **5.2.2** Define `triage_instructions` (Urdu/English greeting, intent extraction)
- [x] **5.2.3** Keep file as instructions-only (agent object defined in orchestrator)

### 5.3 — Refactor Discovery Agent (`app/agents/discovery.py`)
- [x] **5.3.1** Define `discovery_instructions` (Google Maps search, present top results)
- [x] **5.3.2** Keep file as instructions-only

### 5.4 — Refactor Negotiation Agent — "Munasib" ⭐ (`app/agents/negotiation.py`)
- [x] **5.4.1** Define `negotiation_instructions` with Munasib price estimation logic
- [x] **5.4.2** Instructions must handle iterative re-negotiation (*"Aur sasta dhoondo"*)
- [x] **5.4.3** Output format: Top 3 providers with `munasib_price_estimate`, `justification_ur`, `justification_en`

### 5.5 — Refactor Booking Agent (`app/agents/booking.py`)
- [x] **5.5.1** Define `booking_instructions` (confirm details, call tools, output UGK ID)

- [x] **Status:** ✅ Complete

---

## ✅ TASK 6 — Orchestrator (Google ADK Runner)
> File: `app/agents/orchestrator.py`
> **Full Rewrite:** From manual OpenAI API loop → ADK `Runner` + `InMemorySessionService`

- [x] **6.1** Set `os.environ["GOOGLE_API_KEY"]` from `settings.gemini_api_key` at startup
- [x] **6.2** Define all agents using `LlmAgent` with correct `model`, `description`, `instruction`, `tools`
- [x] **6.3** Wire agent hierarchy using `sub_agents=[]`:
  ```
  triage_agent
      └── discovery_agent
              └── negotiation_agent
                      └── booking_agent
  ```
- [x] **6.4** Create `InMemorySessionService` and `Runner` instances
- [x] **6.5** Implement `run_ustadg_swarm(session_id, user_message)` using `runner.run_async()`
- [x] **6.6** Extract `final_output` from ADK events and return structured response
- [x] **Status:** ✅ Complete

```python
# Target pattern:
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()
runner = Runner(agent=triage_agent, session_service=session_service, app_name="ustadg")

async def run_ustadg_swarm(session_id: str, message: str) -> dict:
    content = Content(parts=[Part(text=message)], role="user")
    async for event in runner.run_async(session_id=session_id, user_id="mock", new_message=content):
        if event.is_final_response():
            return {"reply": event.text, "agent": event.author}
```

---

## ✅ TASK 7 — Update Chat Router
> File: `app/routers/chat.py`
> **Update:** Switch from `run_ustadg_swarm(messages=[...])` → `run_ustadg_swarm(session_id, message)`

- [x] **7.1** Remove manual `SESSION_STORE` dict (ADK `InMemorySessionService` handles this)
- [x] **7.2** Update `chat()` endpoint to pass `session_id` and `request.message` directly
- [x] **7.3** Handle ADK response and map to `ChatResponse` schema
- [x] **7.4** Add proper error handling for ADK `RunError` exceptions
- [x] **Status:** ✅ Complete

---

## ✅ TASK 8 — Gemini API Configuration (ADK)
> File: `app/config.py` + `app/agents/orchestrator.py`

- [x] **8.1** In `orchestrator.py`, set `os.environ["GOOGLE_API_KEY"] = settings.gemini_api_key` before agent init
- [x] **8.2** Verify `FAST_MODEL=gemini-2.5-flash` is used for all agents
- [x] **8.3** Remove all `AsyncOpenAI`, `OpenAIChatCompletionsModel`, `set_tracing_disabled` imports
- [x] **8.4** Remove `openai` and `openai-agents` from `requirements.txt` (keep `openai` only if needed for other things)
- [x] **Status:** ✅ Complete

---

## ✅ TASK 9 — Testing & Validation
> File: `Backend/test_phase1.py`

- [x] **9.1** Write `test_adk_basic.py` — verify `google-adk` connects to Gemini with the API key
- [x] **9.2** Write end-to-end test: POST `/v1/chat` with Urdu message *"مجھے کراچی میں ایک پلمبر چاہیے"*
  - Assert reply is in Urdu/English
  - Assert handoff to `DiscoveryAgent` occurs
- [x] **9.3** POST `/v1/book` with `provider_id` — assert `UGK-YYYY-XXXX` confirmation ID
- [x] **9.4** GET `/v1/health` — verify Gemini and MCP connectivity
- [x] **9.5** Test re-negotiation: send *"Aur sasta dhoondo"* in same session
- [x] **Status:** ✅ Complete

---

## 📊 Phase 1 Completion Checklist

| Area | Old Stack | New Stack | Status |
|------|-----------|-----------|--------|
| Project Scaffolding | ✅ FastAPI | ✅ FastAPI | ✅ Done |
| MCP Server (Maps + Sheets + Calendar) | ✅ FastMCP | ✅ FastMCP | ✅ Done |
| FastAPI App & Schemas | ✅ | ✅ | ✅ Done |
| Mock Identity Middleware | ✅ | ✅ | ✅ Done |
| Install Google ADK | — | `google-adk` | ✅ Done |
| Triage Agent | `Agent` (openai-agents) | `LlmAgent` (ADK) | ✅ Done |
| Discovery Agent | `Agent` (openai-agents) | `LlmAgent` (ADK) | ✅ Done |
| Negotiation "Munasib" Agent | `Agent` (openai-agents) | `LlmAgent` (ADK) | ✅ Done |
| Booking Agent | `Agent` (openai-agents) | `LlmAgent` (ADK) | ✅ Done |
| Orchestrator | Manual OpenAI loop | ADK `Runner` + `InMemorySessionService` | ✅ Done |
| Chat Router | `run_ustadg_swarm(messages)` | `runner.run_async(session_id, message)` | ✅ Done |
| End-to-End Testing | — | `test_adk_basic.py` + `test_phase1.py` | ✅ Done |

---

*Generated from: `BACKEND_ARCHITECTURE_PRD.md` v2.0 — Phase 1 "Steel Thread"*
*Version: 2.0 | Project: UstadG | Updated: 2026-05-16 — Google ADK Migration*
