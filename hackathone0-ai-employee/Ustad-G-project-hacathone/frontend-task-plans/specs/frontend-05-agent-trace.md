# SPEC: Frontend-05 — Agent Trace Screen

**Feature Area:** Frontend — Developer Tools  
**Sprint Day:** Day 6  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Build the `AgentTraceScreen` — a developer-facing screen that shows the timestamped "thinking" process of each AI agent in the 5-step pipeline. This fulfills the PRD's mandatory **traceability** requirement and the `rules.md` directive: "For every task, generate an Agent Trace Artifact."

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/screens/AgentTraceScreen.js` | The full trace log viewer. |
| `frontend/components/TraceStep.js` | A collapsible card showing one agent step (input, thinking, output). |

---

## 3. Design Integration

The PRD defines a 5-Step Agent Reasoning Pipeline. Each step gets its own trace card:

| Step | Agent Name | What it logs |
| :--- | :--- | :--- |
| 1 | Intent Agent | Raw input → extracted Service, Location, Time |
| 2 | Discovery Agent | Location → providers found within 10km |
| 3 | Ranking Agent | Providers → scored list (40/40/20) |
| 4 | Booking Agent | Selected provider → Booking ID generated |
| 5 | Follow-up Agent | Booking → reminder scheduled |

**Visual style:**
- Each `TraceStep` is a collapsible card (tap to expand).
- Collapsed: Shows agent name, status icon (✓ or spinner), and timestamp.
- Expanded: Shows `Input`, `Thinking` (chain-of-thought), and `Output` in monospace font.
- Color coding: Step number badge uses `Colors.accent` background.

---

## 4. Acceptance Criteria
- [ ] AgentTraceScreen is accessible from the bottom tab or via navigation.
- [ ] All 5 agent steps are rendered with mock trace data.
- [ ] Each step is collapsible/expandable on tap.
- [ ] Timestamps are displayed for each step.
- [ ] Monospace font is used for the trace details.
- [ ] Uses theme colors and typography consistently.

---

## 5. Next Spec
➡️ **Backend specs** — FastAPI setup, Intent Agent endpoint, Discovery Agent, etc.
