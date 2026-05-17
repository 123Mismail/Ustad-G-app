# TASK 7 — Switched to LiteLLM & OpenAI Agents SDK
> **Parent:** `PHASE1_TASKS.md` → Task 7  
> **Goal:** Use LiteLLM for robust LLM connectivity and OpenAI Agents SDK for multi-agent orchestration.

## 1. Overview
The previous manual orchestration using the OpenAI SDK directly with Gemini's shim was unstable and prone to "Invalid API Key" or "Model Not Found" errors. This task switches the infrastructure to:
1.  **LiteLLM**: A universal LLM wrapper that provides a consistent OpenAI-format interface for Gemini.
2.  **OpenAI Agents SDK**: The official framework for building agentic workflows with built-in support for handoffs and tool execution.

## 2. Technical Architecture

### 2.1 — LLM Connectivity (LiteLLM)
- LiteLLM will be used as the primary provider.
- It automatically handles the `x-goog-api-key` headers and the specific formatting required for Gemini models.
- Model IDs will follow the `gemini/gemini-2.5-flash` format.

### 2.2 — Orchestration (OpenAI Agents SDK)
- **Agents**: Defined using the `agents.Agent` class.
- **Handoffs**: Defined via the `handoffs` list in the Agent constructor.
- **Execution**: Managed by `agents.Runner`, which handles the thought-action loop and tool calls.

## 3. Implementation Steps

### Step 1: Initialize LiteLLM Client
```python
import litellm
from agents import set_default_openai_client
from openai import AsyncOpenAI

# Point OpenAI SDK to LiteLLM's internal handler or use it as a proxy
# Alternatively, use litellm.acompletion directly if supported by the SDK
```

### Step 2: Define Agents with Handoffs
```python
from agents import Agent

triage_agent = Agent(
    name="TriageAgent",
    instructions=triage_instructions,
    handoffs=[discovery_agent]
)
```

### Step 3: Update Chat Router
- The `/v1/chat` endpoint will now call `Runner.run()` and handle the stream/response.

## 4. Acceptance Criteria
- [ ] Triage agent successfully responds to "hi" using LiteLLM.
- [ ] Agent handoff from Triage to Discovery works via the SDK's built-in tools.
- [ ] No "Invalid API Key" errors when calling Gemini.
- [ ] Trace steps are captured by the SDK for future observability.
