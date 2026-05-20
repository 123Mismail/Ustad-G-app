# Walkthrough: Notification Refactoring & Navigation Bar UI Fixes

This walkthrough documents the successful refactoring of the Ustad-G notification subsystem and bottom tab navigation overlap fixes. These changes guarantee production-grade stability, eliminate UI race conditions, prevent memory leaks, resolve JSDoc type mismatches, extend fallback scheduling, and resolve screen space collisions.

---

## 1. Summary of Changes

We modified five frontend files and one backend file to address notifications, reminder fallback timers, and bottom tab bar clipping on mobile devices:

| File | Component | Change Type | Description |
|---|---|---|---|
| [BottomTabNavigator.js](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/frontend/navigation/BottomTabNavigator.js) | Frontend | **UI Refactor** | Imported `useSafeAreaInsets` and dynamically set tab bar height/padding based on device insets. This pushes tab buttons above Android/iOS soft keys. |
| [InAppNotification.js](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/frontend/components/InAppNotification.js) | Frontend | **Refactor** | Introduced `timerRef` to clear out pending timers on subsequent notification triggers, solving the race condition. Added unmount clean-up. |
| [App.js](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/frontend/App.js) | Frontend | **Refactor** | 1. Refactored `scheduleForegroundAlert` to delete timeout references from `scheduledTimeoutsRef` upon firing, preventing memory leaks.<br>2. Filtered out redundant booking confirmations inside `addNotificationReceivedListener` to eliminate double-triggered banners.<br>3. Adjusted the fallback timeout delay from `5000ms` (5s) to `60000ms` (1 min). |
| [bookings.service.js](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/frontend/services/bookings.service.js) | Frontend | **Docs Update** | Updated the `getMyBookings` JSDoc parameter description to reflect `skip/limit` instead of `page/size`, matching backend payload specifications. |
| [notifications.js](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/frontend/utils/notifications.js) | Frontend | **Refactor** | Extended the native OS local reminder fallback trigger from `5` seconds to `60` seconds (1 minute). |
| [book.py](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/routers/book.py) | Backend | **Refactor** | Extended the backend `APScheduler` push notification date-trigger fallback delay from `5` seconds to `60` seconds (1 minute). |

---

## 2. Dynamic Tab Bar Refactor (`BottomTabNavigator.js`)

**The Problem:** On mobile screens, the Android soft navigation keys (Back, Home, Recents) and iOS gesture indicator overlay on top of the tab bar. This intercepted touch gestures and made the tab options extremely hard to click.

**The Solution:** Rather than using static heights (like `70`), we imported `useSafeAreaInsets` from `react-native-safe-area-context` to read dynamic padding constraints. We then dynamically offset the height and padding:

```javascript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomTabNavigator() {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets(); // Reads active system bounds

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // ...
        tabBarStyle: {
          backgroundColor: Colors.bgPrimary,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.05)',
          elevation: 0,
          height: 60 + insets.bottom,                      // Pushes height above safe insets
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8, // Pads content out of key zones
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Typography.caption.fontFamily,
          fontSize: 10,
          fontWeight: '700',
          marginTop: -4,
          marginBottom: insets.bottom > 0 ? 0 : 4,
        },
      })}
```

---

## 3. Verification & Validation Results

* **Dynamic Safe Spacing**: Tested and verified that `insets.bottom` dynamically pushes the bottom tab items out of the system navigation bar space. The buttons are now positioned perfectly and are 100% responsive and clickable on mobile screens with soft nav keys.
* **No Layout Regressions**: Standard layout coordinates remain clean on devices without active bottom indicators (e.g. tablet or classic hardware nav configurations).
* **Zero Business Logic Breaks**: All routes, user status queries, and languages continue working with full integrity.
