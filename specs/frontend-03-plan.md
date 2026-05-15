# Plan: Frontend-03 — Provider Discovery & Results UI
**Spec Reference:** `specs/frontend-03-results-ui.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [NEW] `frontend/components/ProviderCard.js`
- Create a touchable rounded square (`width: 140, height: 140`).
- Props: `provider`, `isSelected`, `onPress`.
- UI: Show avatar/icon, Name, and overall Score.
- Active state: Add `borderWidth: 2, borderColor: Colors.textDark`.

### [NEW] `frontend/components/ScoreBreakdown.js`
- Vertical list component, borrowing styling from `RecentActivity.js`.
- Props: `provider`.
- UI: Show Distance score (out of 40), Rating score (out of 40), and Availability score (out of 20).

### [MODIFY] `frontend/screens/ResultsScreen.js`
- Remove placeholder text.
- Build custom top bar (Back arrow + Title).
- Add mock data for 3 ranked providers.
- Manage `selectedProviderId` state.
- Render `ProviderCard` in a horizontal `FlatList`.
- Render `ScoreBreakdown` below it for the selected provider.
- Render a fixed bottom button: "Book [Name]".

### [MODIFY] `frontend/components/AIChatCard.js`
- Temporarily link the "Send" button to navigate to the `ResultsScreen` using `useNavigation` so we can test the UI flow.

### [MODIFY] `frontend/utils/i18n.js`
- Add strings for `select_provider`, `distance_score`, `rating_score`, `availability_score`, and `book_now`.

---

## 2. Execution Order

```text
[1] Update utils/i18n.js with new strings.
[2] Build ProviderCard.js.
[3] Build ScoreBreakdown.js.
[4] Assemble ResultsScreen.js with mock data.
[5] Update AIChatCard.js to wire up navigation to ResultsScreen.
[6] Verify in browser/emulator.
```
