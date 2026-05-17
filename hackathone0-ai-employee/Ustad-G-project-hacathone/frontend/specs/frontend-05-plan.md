# Plan: Frontend-05 — Agent Trace Screen
**Spec Reference:** `specs/frontend-05-agent-trace.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [NEW] `frontend/components/TraceStep.js`
- Collapsible card component.
- Props: `step` (object with `name`, `status`, `timestamp`, `input`, `thinking`, `output`).
- State: `isExpanded` (toggle on press).
- Collapsed view: Step badge number, agent name, status icon, timestamp.
- Expanded view: Three sections (Input, Thinking, Output) with monospace text.

### [MODIFY] `frontend/screens/AgentTraceScreen.js`
- Remove placeholder.
- Add mock trace data for all 5 pipeline steps.
- Render a `ScrollView` of `TraceStep` cards.
- Add a custom header with the screen title.

### [MODIFY] `frontend/utils/i18n.js`
- Add strings: `agent_trace_title`, `input_label`, `thinking_label`, `output_label`.

### [MODIFY] `frontend/navigation/BottomTabNavigator.js`
- Optionally add a 6th "debug" tab or wire it via a gear icon in the Settings tab for easy access during demos.

---

## 2. Execution Order

```text
[1] Update utils/i18n.js with trace strings.
[2] Build TraceStep.js component.
[3] Assemble AgentTraceScreen.js with mock data.
[4] Wire access from navigation.
[5] Verify in browser.
```
