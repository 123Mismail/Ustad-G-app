# TASK 3 & 4 — FastAPI Foundation & Mock Identity
> **Parent:** `PHASE1_TASKS.md` → Task 3 & 4
> **Goal:** Build the core FastAPI application structure, define data schemas, and implement the Mock User middleware to support the agentic workflow.
> **Status:** ✅ Complete

---

## 1. Overview
In this phase, we move from the tool-provider (MCP) to the actual API gateway. This gateway will handle user requests, manage session identities, and eventually orchestrate the agents.

**Key Deliverables:**
- `app/main.py`: Entry point with CORS and error handling.
- `app/schemas/`: Data models for Chat and Booking.
- `app/middleware/`: Mock identity injection.
- `app/routers/`: Initial API routes (stubs).

---

## 2. Completed Implementation

### 🏗️ Sub-Task 3.1 — FastAPI Scaffolding
**File:** `app/main.py`
- Initialized `FastAPI(title="UstadG Backend")`.
- Configured CORS (allowing all origins for development).
- Added global exception handler.
- Included routers for `/chat`, `/book`, `/health`, and `/trace`.

### 📦 Sub-Task 3.2 — Pydantic Schemas
**Files:** `app/schemas/chat.py`, `app/schemas/booking.py`
- `ChatRequest`: `message`, `session_id`, `language`.
- `ChatResponse`: `reply`, `session_id`, `providers` (list), `trace_id`.
- `BookRequest`: `provider_id`, `session_id`.

### 🆔 Sub-Task 4.1 — Mock Identity Middleware
**File:** `app/middleware/mock_user.py`
- Implemented a middleware that intercepts requests.
- Injects a `MockUser` object into `request.state.user`.
- **MockUser Attributes:**
    - `id`: `mock-user-123`
    - `name`: `Ismail Khan`
    - `location`: `Karachi, Pakistan`
    - `preferred_language`: `ur`

---

## 3. Status
Verified as complete. The structure exists and the `MockUser` injection is functional. The next step is Task 5 (Agent Swarm) to implement the actual logic inside the routers.
