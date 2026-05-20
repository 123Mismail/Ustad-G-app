# Implementation Plan - Notification Alignment & Sync

This implementation plan outlines the steps to align the notification page list with the notification icon badge count. It ensures that booking confirmation notifications and departing reminders are mapped correctly, start in the proper read/unread states, and support persistent read/cleared states across app transitions and restarts.

## User Review Required

> [!IMPORTANT]
> **Unified State Management**: We are introducing persistent tracking of read and cleared notification IDs in `NotificationContext` (backed by `expo-secure-store`). Booking notifications will now start as **unread** (`isRead: false`) when created, and they will be marked as read when the user visits the Notifications screen (which resets the unread badge to 0).
> This aligns the top-level unread badge count perfectly with the visual unread highlights in the list.

## Proposed Changes

### Centralized Helpers

#### [NEW] [notificationHelpers.js](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/frontend/utils/notificationHelpers.js)
Define a unified `mapBookingsToNotifications` function that can be shared by both the `NotificationScreen` and the `ChatScreen` badge calculation to ensure 100% logic alignment.
* Set booking confirmation notifications to start as **unread** (`isRead: false`) instead of hardcoded to `true`.
* Map both **Confirmed** and **Departing/Reminder** booking alerts.

---

### Global Notification Context

#### [MODIFY] [App.js](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/frontend/App.js)
* Import `expo-secure-store` and `Platform`.
* Maintain `readIds` and `clearedIds` states loaded from persistent storage on mount.
* Provide helper methods `markAsRead`, `markAllAsRead`, `clearNotification`, and `clearAllNotifications` to components through `NotificationContext`.
* Reset / persist these arrays when notifications are cleared or marked as read.

---

### Home / Chat Screen Badge Calculation

#### [MODIFY] [ChatScreen.js](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/frontend/screens/ChatScreen.js)
* Centralize the badge unread count calculation.
* Fetch all bookings, map them to notifications using `mapBookingsToNotifications`, and filter out any cleared IDs.
* If bookings exist, count only unread dynamic booking alerts that are not in `readIds` (completely ignoring mock notifications, as they are not rendered on the notifications screen).
* If no bookings exist, count only unread mock notifications that are not in `readIds`.
* Re-run on screen focus and whenever `readIds` or `clearedIds` change.

---

### Notification Screen Rendering

#### [MODIFY] [NotificationScreen.js](file:///B:/hackathone0-ai-employee/Ustad-G-project-hacathone/frontend/screens/NotificationScreen.js)
* Consume `readIds`, `clearedIds`, `markAllAsRead`, `clearNotification`, and `clearAllNotifications` from `useGlobalNotification()`.
* Import the shared `mapBookingsToNotifications` helper.
* Filter out cleared notifications.
* Map notifications dynamically based on `readIds` membership to reflect actual unread state.
* On screen mount/focus, mark all rendered notification IDs as read (resets the badge count instantly).
* Wire individual clear and clear-all actions to the persistent global context.

---

## Verification Plan

### Manual Verification
1. **Empty Database State**:
   * With no bookings, ensure `MOCK_NOTIFICATIONS` are rendered in the list.
   * Verify that the unread badge count shows exactly the number of unread mock items (2).
   * Go to the notification screen: verify that all mock items are rendered, and they are marked as read (resets badge to 0).
2. **Booking Flow & Real-Time Sync**:
   * Create a booking in the AI Chat.
   * Verify that the in-app confirmation banner displays, and the unread badge count immediately increments by 1.
   * Go to the Notification Page: verify that the newly created booking notification appears in the list with an unread dot indicator.
   * Verify that opening this page marks the notification as read, and returning to the Chat Screen shows a badge count of 0.
   * Persist check: restart the application, verify that the notification remains visible in the list and is still marked as read (badge stays 0).
3. **Notification Dismissal**:
   * Tap "Clear" (X) on the booking notification.
   * Verify that it disappears from the list.
   * Go back and verify that it does not contribute to the badge count.
   * Restart the application and verify that the notification remains cleared.
