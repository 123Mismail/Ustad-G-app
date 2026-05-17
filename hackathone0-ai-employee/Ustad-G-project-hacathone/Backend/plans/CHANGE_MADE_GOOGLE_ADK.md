# CHANGE MADE — Migrated to Google ADK
> **Supersedes:** `CHANGE_MADE_LITELLM_AGENTS_SDK.md` (abandoned — LiteLLM had Windows Long Path install failures; OpenAI Agents SDK had Bearer token auth incompatibility with Gemini API keys)
> **Date:** 2026-05-16
> **Status:** ✅ Planned | Implementation in progress

---

## 1. What Changed & Why

### Root Cause of Previous Failures
After deep debugging (adding `httpx` event hooks to log raw requests), we identified the exact auth failure:

| Endpoint | Required Auth | Result |
|---|---|---|
| `v1beta/models/.../generateContent` | `x-goog-api-key: AIzaSy...` | ✅ Works (proven by curl) |
| `v1beta/openai/chat/completions` | `Authorization: Bearer <OAuth_token>` | ❌ Fails — Gemini API keys are NOT OAuth Bearer tokens |

The OpenAI Agents SDK (and `AsyncOpenAI` client) always sends `Authorization: Bearer <api_key>` — this is correct for OpenAI but **broken** for the Gemini OpenAI compatibility shim.

**LiteLLM** was attempted next but failed with a Windows Long Path error during installation (file paths inside the `litellm` package exceeded Windows' 260-character limit).

### Decision: Google ADK
Google ADK (`google-adk`) is the correct, official solution because:
- It uses the **native Gemini Python client** internally → `x-goog-api-key` auth, just like the working `curl` command.
- First-class multi-agent support via `LlmAgent` + `sub_agents` (replaces `handoffs`).
- Built-in session management (`InMemorySessionService`).
- No Windows path issues.
- `adk web` UI for agent debugging.

---

## 2. Architecture Change Summary

```
BEFORE (broken):
  AsyncOpenAI(base_url="...googleapis.com/v1beta/openai/", api_key=GEMINI_KEY)
      → openai-agents SDK
          → sends Authorization: Bearer GEMINI_KEY  ← REJECTED by Google

AFTER (working):
  os.environ["GOOGLE_API_KEY"] = GEMINI_KEY
      → google-adk LlmAgent(model="gemini-2.5-flash")
          → uses native google-generativeai client internally
          → sends x-goog-api-key: GEMINI_KEY  ← ACCEPTED by Google ✅
```

---

## 3. Files Modified

| File | Change |
|---|---|
| `requirements.txt` | Remove `openai-agents`. Add `google-adk>=1.0.0` |
| `app/agents/orchestrator.py` | Full rewrite — `LlmAgent`, `Runner`, `InMemorySessionService` |
| `app/agents/triage.py` | Instructions-only (no class definitions) |
| `app/agents/discovery.py` | Instructions-only |
| `app/agents/negotiation.py` | Instructions-only |
| `app/agents/booking.py` | Instructions-only |
| `app/routers/chat.py` | Remove `SESSION_STORE`, call `run_ustadg_swarm(session_id, message)` |
| `BACKEND_ARCHITECTURE_PRD.md` | Updated to v2.0 with full ADK architecture |
| `PHASE1_TASKS.md` | Updated to v2.0 with ADK task list |

---

## 4. Acceptance Criteria
- [ ] `google-adk` installs cleanly in `.venv`
- [ ] `test_adk_basic.py` confirms Gemini API key connects via ADK
- [ ] `POST /v1/chat` returns a Urdu/English greeting from TriageAgent
- [ ] Agent handoff chain (Triage → Discovery → Negotiation → Booking) works end-to-end
- [ ] No "API key not valid" or "Connection error" errors
