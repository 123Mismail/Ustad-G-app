# Plan: Frontend-09 — Popular Services Enhancement
**Spec Reference:** `specs/frontend-09-popular-services.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [NEW] `frontend/data/popularServices.js`
- Create an array of service objects including `id`, `title`, `icon`, `price`, and `prompt`.

### [MODIFY] `frontend/components/ServiceSlider.js`
- Import data from `popularServices.js`.
- Add `onServiceSelect` prop.
- Update `renderItem` to include the price and call `onServiceSelect(item.prompt)` on press.
- Improve styling with unique icon background colors.

### [MODIFY] `frontend/screens/ChatScreen.js`
- Create a ref or a state-update mechanism to pass the selected service prompt into the `AIChatCard`.
- Pass the callback to `ServiceSlider`.

### [MODIFY] `frontend/components/AIChatCard.js`
- Add a prop `initialValue` or a way to update the text from the parent.

---

## 2. Execution Order

```text
[1] Create popularServices.js data file.
[2] Update AIChatCard.js to accept an external text update.
[3] Update ServiceSlider.js with new styles and interactivity.
[4] Update ChatScreen.js to coordinate the interaction.
[5] Verify in browser.
```
