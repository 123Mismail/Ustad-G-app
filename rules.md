# Workspace Rules: UstadG Orchestrator
# Project: #AISeekho2026 Hackathon (Challenge 2)

These rules are persistent instructions for the Antigravity Agent Manager. They ensure every line of code and every agent decision complies with the hackathon's technical and regional requirements.

---

## 1. CORE ARCHITECTURAL RULES
* **Backend:** Use **FastAPI (Python)**. Organize code into routers (intent, discovery, booking).
* **Frontend:** Use **React Native (Expo)**. Focus on a clean, high-performance mobile UI.
* **Model:** Exclusively use **Gemini 3 Pro** for all reasoning, NLP, and agentic tasks.
* **Storage:** * Use a local SQLite or JSON database for the mock provider dataset.
    * Use the **Google Sheets MCP** for all booking persistence (Action Simulation).

---

## 2. LINGUISTIC & REGIONAL RULES
* **Multilingual Input:** The agent must handle **English, Urdu (Jameel Noori Nastaliq preferred for UI), and Roman Urdu** (e.g., "Muje bijli wala chahiye").
* **Output Tone:** Use "Awaami" (common/simple) language. Avoid formal/bookish terms like "Tarseel."
* **Location Context:** All coordinates and address parsing must be centered on **Karachi** and other major Pakistani cities.

---

## 3. AGENTIC EXECUTION RULES
* **Traceability (Mandatory):** For every task, generate an **Agent Trace Artifact**. Show the "Thinking" process, the tools used, and the final output.
* **Tool-First Approach:** Always prefer using an MCP tool (Maps, Sheets, Terminal) over writing manual scripts.
* **Ranking Logic:** Providers must be ranked using the **40/40/20 formula**:
    * 40% Distance (Proximity to user)
    * 40% Rating (Mock historical performance)
    * 20% Availability (Current status)

---

## 4. DEPLOYMENT & SECURITY RULES
* **Deployment:** All backend services must be containerized and ready for **Google Cloud Run**.
* **API Keys:** Use environment variables for all keys (Gemini, Maps). **Never hardcode.**
* **PII Protection:** Use masked identifiers for service providers in the UI to simulate privacy protection.

---

## 5. PROMPT ENGINEERING STANDARDS
* **Chain-of-Thought:** When performing complex discovery, the agent must explain *why* a specific provider was selected.
* **Error Handling:** If an API call fails, the agent must attempt a fallback (e.g., use cached mock data) and log the failure.

---
**Status:** ACTIVE | **Version:** 1.1 | **Target IDE:** Google Antigravity
