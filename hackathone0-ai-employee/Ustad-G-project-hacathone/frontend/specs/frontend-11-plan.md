# Plan: Frontend-11 — Role-Based Navigation
**Spec Reference:** `specs/frontend-11-roles.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [MODIFY] `frontend/App.js`
- Add `userRole` (default 'user') to `LanguageContext` (rename to `AppContext` or just add to it).
- Export `useApp` hook.

### [MODIFY] `frontend/navigation/BottomTabNavigator.js`
- Consume `userRole` from context.
- Filter the `Tab.Screen` components to only include "Trace" if `userRole === 'admin'`.

### [MODIFY] `frontend/screens/ProfileScreen.js`
- Add a new section "Developer Settings".
- Add a `SettingsRow` with a `Switch` (from react-native) to toggle between 'user' and 'admin'.

### [MODIFY] `frontend/utils/i18n.js`
- Add strings: `developer_mode`, `dev_settings`.

---

## 2. Execution Order

```text
[1] Update i18n.js with Dev/Role strings.
[2] Update App.js to include userRole state.
[3] Update BottomTabNavigator.js to filter tabs.
[4] Update ProfileScreen.js to add the toggle.
[5] Verify in browser.
```
