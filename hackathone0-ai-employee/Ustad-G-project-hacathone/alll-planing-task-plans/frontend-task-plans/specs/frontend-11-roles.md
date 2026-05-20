# SPEC: Frontend-11 — Role-Based Navigation (User vs. Admin)

**Feature Area:** Frontend — Navigation & UX  
**Sprint Day:** Day 7  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Implement a role-based navigation system to differentiate between a "Regular User" (Consumer) and an "Admin/Developer". This ensures the technical "Agent Trace" logs are hidden from consumers while remaining accessible for debugging.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/App.js` | Add `userRole` to the global context (`user` or `admin`). |
| `frontend/navigation/BottomTabNavigator.js` | Conditionally render tabs based on `userRole`. |
| `frontend/screens/ProfileScreen.js` | Add a "Developer Mode" toggle in settings to switch between roles. |

---

## 3. Role Definitions

### 👤 Regular User
- **Focus:** Discovery, Booking, and Tracking.
- **Visible Tabs:** 
  1. Home (Chat)
  2. Nearby (Map)
  3. Bookings (History)
  4. Account (Profile)
- **Hidden:** Agent Trace.

### 🛠️ Admin / Developer
- **Focus:** System health, Agent logic validation.
- **Visible Tabs:** 
  1. Home
  2. Nearby
  3. Bookings
  4. **Trace** (Agent Reasoning)
  5. Account

---

## 4. Implementation Details

- **Global State:** The `userRole` will be stored in the same context as `language`.
- **UI Toggle:** In the **Account** screen, under a new "Developer" section, a switch titled "Developer Mode" will update the `userRole`.
- **Dynamic Navigation:** The `BottomTabNavigator` will automatically re-render and remove/add the "Trace" tab when the role changes.

---

## 5. Acceptance Criteria
- [ ] App defaults to `user` role.
- [ ] In `user` role, the "Trace" tab is completely hidden.
- [ ] Account screen contains a "Developer Mode" toggle.
- [ ] Switching "Developer Mode" ON instantly shows the "Trace" tab.
- [ ] Switching "Developer Mode" OFF instantly hides the "Trace" tab.
