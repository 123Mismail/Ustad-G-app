# Plan: Frontend-04 — Booking Confirmation UI
**Spec Reference:** `specs/frontend-04-confirmation-ui.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [MODIFY] `frontend/screens/ConfirmationScreen.js`
- Remove placeholder text.
- Build the Success Header (`Feather` check-circle icon + bold text).
- Build the Booking ID card component (dark background, accent text).
- Build the Service Summary list using existing typography tokens.
- Build the "Return to Home" button.
- Modify navigation so going back is either disabled or correctly resets the stack to avoid re-submitting the booking.

### [MODIFY] `frontend/utils/i18n.js`
- Add strings for `booking_confirmed`, `booking_id`, `provider`, `service`, `date_time`, `location`, and `return_home`.

---

## 2. Execution Order

```text
[1] Update utils/i18n.js with confirmation strings.
[2] Assemble ConfirmationScreen.js with mock booking details.
[3] Wire the "Return to Home" button to `navigation.navigate('Dashboard')`.
[4] Verify navigation and layout in browser.
```
