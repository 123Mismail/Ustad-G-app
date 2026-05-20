# Plan: Frontend-08 — User Profile & Settings
**Spec Reference:** `specs/frontend-08-profile.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [NEW] `frontend/components/ProfileHeader.js`
- Displays a mock avatar (initials "UG" or a Feather icon), "UstadG User", and "+92 300 1234567".

### [NEW] `frontend/components/SettingsRow.js`
- Props: `icon`, `title`, `color` (optional, for destructive actions), `rightWidget` (optional, for toggles or values).
- Renders an icon on the left, title in the middle, and a chevron or custom widget on the right.

### [NEW] `frontend/screens/ProfileScreen.js`
- ScrollView containing:
  - `ProfileHeader`
  - Group 1 (Account): Saved Addresses, Payment Methods
  - Group 2 (Preferences): Language (with interactive toggle buttons for en/ur/roman_ur), Notifications
  - Group 3 (Support): Help Center
  - Log Out button
- Implement a simple state to manage the active language globally (or pass it down if using Context, but for a demo, a simple state toggle combined with a re-render of the screen is sufficient). *Note: We will upgrade `i18n.js` or `App.js` to handle global language state if time permits, otherwise a simple local state that demonstrates the toggle.*

### [MODIFY] `frontend/utils/i18n.js`
- Add profile-specific strings: `saved_addresses`, `payment_methods`, `language`, `notifications`, `help_center`, `log_out`.

### [MODIFY] `frontend/navigation/BottomTabNavigator.js`
- Replace the "Profile" placeholder with `ProfileScreen`.

---

## 2. Execution Order

```text
[1] Update i18n.js with profile strings.
[2] Build ProfileHeader.js.
[3] Build SettingsRow.js.
[4] Assemble ProfileScreen.js.
[5] Wire into BottomTabNavigator.
[6] Verify in browser.
```
