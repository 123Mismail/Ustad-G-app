# Plan: Frontend-02 — Dashboard & AI Chat UI
**Spec Reference:** `specs/frontend-02-chat-ui.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [NEW] `frontend/navigation/BottomTabNavigator.js`
- Create a `createBottomTabNavigator`.
- Map 5 tabs: Home (maps to `ChatScreen`), Map, Transfer, Settings, Profile.
- Style the tab bar (white background, no border, standard heights).

### [MODIFY] `frontend/navigation/AppNavigator.js`
- Replace `ChatScreen` in the stack with `BottomTabNavigator`.
- Hide the Stack header for the `BottomTabNavigator` screen (since the Dashboard has its own custom header).

### [NEW] `frontend/components/AIChatCard.js`
- Create the dark interactive card component.
- Props: `value`, `onChangeText`, `onSubmit`.

### [NEW] `frontend/components/ServiceSlider.js`
- Create the horizontal scrolling list using `FlatList`.
- Mock data: Electrician, Plumber, AC Repair, Cleaning.

### [NEW] `frontend/components/RecentActivity.js`
- Create the vertical list using `map` or `FlatList`.
- Mock data: Recent bookings.

### [MODIFY] `frontend/screens/ChatScreen.js`
- Remove placeholder text.
- Import and render:
  - Custom Header (Greeting + Bell Icon).
  - `<AIChatCard />`
  - `<ServiceSlider />`
  - `<RecentActivity />`
- Use `ScrollView` to wrap the screen content so it scrolls behind the tab bar if necessary.

---

## 2. Execution Order

```text
[1] Install @react-navigation/bottom-tabs.
[2] Update utils/i18n.js with new strings (chat_hint, popular_services, recent_activity).
[3] Create BottomTabNavigator.js and integrate it into AppNavigator.js.
[4] Build AIChatCard.js component.
[5] Build ServiceSlider.js component.
[6] Build RecentActivity.js component.
[7] Assemble ChatScreen.js.
[8] Verify UI in browser/emulator.
```
