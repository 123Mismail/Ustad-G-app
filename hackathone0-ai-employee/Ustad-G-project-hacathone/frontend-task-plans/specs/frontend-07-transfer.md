# SPEC: Frontend-07 — Booking History & Transfers

**Feature Area:** Frontend — Booking Management  
**Sprint Day:** Day 6  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Build the "Transfer" tab to serve as the **Booking History** screen. In the context of UstadG (a service orchestrator, not a fintech app), "Transfer" is adapted to mean the movement of service requests through the pipeline — from request to completion. This screen shows all past and active bookings with their real-time statuses and allows filtering.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/screens/TransferScreen.js` | Main booking history layout with filters and booking list. |
| `frontend/components/BookingHistoryCard.js` | A detailed card showing one booking with status, provider info, and booking ID. |
| `frontend/components/StatusFilter.js` | Horizontal pill/chip filter for: All, Active, Completed, Cancelled. |
| `frontend/data/mockBookings.js` | Mock booking history data with different statuses. |

---

## 3. Design Integration

Adapted from `design.md` Section 2 (Recent Activity / Transactions):

- **Header:** "Booking History" title + total count badge.
- **Filter Bar:** Horizontal scrollable chips — `All | Active | Completed | Cancelled`. Active chip uses `Colors.accent` background.
- **Booking Cards:** Vertical scrollable list. Each card shows:
  - Booking ID (`UGK-YYYY-XXXX`) in monospace
  - Provider name + service type
  - Date and time
  - Status badge (color coded: green=Completed, yellow=Active, red=Cancelled)
  - Score summary (compact 40/40/20 bar)
- **Empty State:** Message shown when filter returns zero results.

---

## 4. Mock Data

| Booking ID | Provider | Service | Date | Status |
| :--- | :--- | :--- | :--- | :--- |
| UGK-2026-1234 | Ali Electrician | Wiring & Repair | Today, 2:00 PM | Active |
| UGK-2026-1189 | Usman Fixers | Pipe Leak Fix | Yesterday, 10 AM | Completed |
| UGK-2026-1102 | Ahmed AC Repair | AC Servicing | May 12, 3:00 PM | Completed |
| UGK-2026-1055 | Bilal Cleaning | Deep Clean | May 11, 9:00 AM | Cancelled |
| UGK-2026-0998 | Karachi Wiring | Full Rewiring | May 10, 11 AM | Completed |

---

## 5. Acceptance Criteria
- [ ] TransferScreen renders the booking history list with all mock entries.
- [ ] Filter chips toggle correctly and filter the list.
- [ ] Status badges are correctly color-coded.
- [ ] Booking ID is displayed in monospace font.
- [ ] Empty state message shows when filtering returns no results.
- [ ] Uses theme colors and typography.

---

## 6. Next Spec
➡️ **Frontend-08: Profile Screen** — User profile with personal info and settings.
