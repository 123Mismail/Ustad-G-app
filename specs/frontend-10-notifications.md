# SPEC: Frontend-10 — Notifications Center

**Feature Area:** Frontend — User Alerts  
**Sprint Day:** Day 7  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Build a dedicated Notifications Center to keep users informed about their booking statuses, agent updates, and system alerts. This screen will be accessible via the bell icon on the Dashboard.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/screens/NotificationScreen.js` | Main list of notifications. |
| `frontend/components/NotificationItem.js` | Individual notification row with icons and status colors. |
| `frontend/data/mockNotifications.js` | [NEW] Mock notification history. |

---

## 3. Design Integration

- **Trigger:** Tapping the bell icon in `ChatScreen.js` header.
- **Visuals:**
  - Categorized by time (Today, Yesterday, Older).
  - Icon-based types: 
    - ✅ **Success** (Green): Booking confirmed.
    - ⚠️ **Warning** (Yellow): Reminder (e.g., service in 1 hour).
    - ℹ️ **Info** (Blue): Agent update (e.g., "Finding providers...").
  - Unread indicators (small dot on the left).
- **Navigation:** Back button to return to Dashboard.

---

## 4. Mock Data Structure

| Title | Body | Type | Time |
| :--- | :--- | :--- | :--- |
| Booking Confirmed | Ali Electrician will arrive today at 2 PM. | success | 5m ago |
| Agent Alert | I found a better-rated plumber for your request. | info | 1h ago |
| Reminder | Your AC service is scheduled for tomorrow at 10 AM. | warning | 3h ago |
| Update | Welcome to UstadG! Try asking for a "cleaner". | info | Yesterday |

---

## 5. Acceptance Criteria
- [ ] Notification screen displays all mock alerts.
- [ ] Bell icon on ChatScreen correctly navigates to the Notification screen.
- [ ] Items are color-coded by type (Success, Warning, Info).
- [ ] Includes a "Clear All" button in the header.
- [ ] Uses theme colors and typography.
