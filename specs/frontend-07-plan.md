# Plan: Frontend-07 — Booking History & Transfers
**Spec Reference:** `specs/frontend-07-transfer.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [NEW] `frontend/data/mockBookings.js`
- 5 mock bookings with IDs in `UGK-YYYY-XXXX` format, varied statuses (Active, Completed, Cancelled).

### [NEW] `frontend/components/StatusFilter.js`
- Horizontal `FlatList` of pill/chip buttons.
- Props: `activeFilter`, `onFilterChange`.
- Chips: All, Active, Completed, Cancelled.
- Active chip: `Colors.accent` bg + dark text. Inactive: `Colors.bgSecondary` bg + muted text.

### [NEW] `frontend/components/BookingHistoryCard.js`
- Card showing booking ID (monospace), provider name, service, date, and a color-coded status badge.
- Status colors: Green (`#4CAF50`) for Completed, Amber (`#FFC107`) for Active, Red (`#F44336`) for Cancelled.

### [NEW] `frontend/screens/TransferScreen.js`
- Header with title and count badge.
- `StatusFilter` component.
- `FlatList` of `BookingHistoryCard` components filtered by active status.
- Empty state view when no bookings match the filter.

### [MODIFY] `frontend/navigation/BottomTabNavigator.js`
- Replace Transfer placeholder with real `TransferScreen`.

### [MODIFY] `frontend/utils/i18n.js`
- Add strings: `booking_history`, `all`, `active`, `completed`, `cancelled`, `no_bookings`.

---

## 2. Execution Order

```text
[1] Create mockBookings.js data file.
[2] Update i18n.js with new strings.
[3] Build StatusFilter.js chip component.
[4] Build BookingHistoryCard.js.
[5] Assemble TransferScreen.js.
[6] Wire into BottomTabNavigator.
[7] Verify in browser.
```
