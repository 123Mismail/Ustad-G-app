# Plan: Frontend-10 — Notifications Center
**Spec Reference:** `specs/frontend-10-notifications.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [NEW] `frontend/data/mockNotifications.js`
- Create an array of notification objects with `id`, `title`, `body`, `type`, `time`, and `isRead`.

### [NEW] `frontend/components/NotificationItem.js`
- Create a row component that displays an icon based on `type`.
- Show `title`, `body`, and `time`.
- Highlight unread items with a subtle background or a dot.

### [NEW] `frontend/screens/NotificationScreen.js`
- A `SafeAreaView` with a header ("Notifications" + "Clear All").
- A `FlatList` to render `NotificationItem`s.
- Back navigation using `navigation.goBack()`.

### [MODIFY] `frontend/navigation/AppNavigator.js`
- Add `NotificationScreen` to the stack.

### [MODIFY] `frontend/screens/ChatScreen.js`
- Update the bell icon `TouchableOpacity` to navigate to `Notifications`.

### [MODIFY] `frontend/utils/i18n.js`
- Add strings: `notifications_title`, `clear_all`, `today`, `yesterday`.

---

## 2. Execution Order

```text
[1] Add notification strings to i18n.js.
[2] Create mockNotifications.js.
[3] Build NotificationItem.js.
[4] Create NotificationScreen.js.
[5] Update AppNavigator.js with the new screen.
[6] Wire bell icon in ChatScreen.js.
[7] Verify in browser.
```
