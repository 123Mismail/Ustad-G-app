# SPEC: Frontend-08 — User Profile & Settings

**Feature Area:** Frontend — User Profile  
**Sprint Day:** Day 6  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Build the `ProfileScreen` to serve as the user's account hub. This screen will display basic user information, allow them to toggle app languages (English/Urdu/Roman Urdu), and provide access to account settings, saved addresses, and payment methods.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/screens/ProfileScreen.js` | The main profile layout. |
| `frontend/components/ProfileHeader.js` | Component displaying user avatar, name, and phone number. |
| `frontend/components/SettingsRow.js` | Reusable row component for settings options (icon, title, trailing arrow/widget). |

---

## 3. Design Integration

- **Header:** Clean `ProfileHeader` with a circular avatar placeholder, bold name, and muted contact info.
- **Settings List:** Grouped rows using `SettingsRow`.
  - Account Group: Saved Addresses, Payment Methods.
  - Preferences Group: Language Selector (crucial for UstadG demo), Notifications.
  - Support Group: Help Center, Privacy Policy.
- **Action:** A destructive (red) "Log Out" button at the bottom.
- **Language Toggle:** A segmented control or simple buttons to switch between `en`, `ur`, and `roman_ur` to immediately reflect i18n capabilities.

---

## 4. Acceptance Criteria
- [ ] ProfileScreen is accessible via the Profile tab.
- [ ] Displays mock user information.
- [ ] Renders grouped settings rows correctly.
- [ ] Includes a functional language toggle that updates the UI language in real-time.
- [ ] Includes a "Log Out" button at the bottom.
- [ ] Replaces the final placeholder in the bottom navigation.
