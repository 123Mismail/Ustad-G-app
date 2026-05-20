# Provider Registration Flow Implementation Plan (Admin Only)

This plan details how we will enable **administrators** to register service providers in the UstadG system directly from the app.

## Proposed Changes

### Backend Changes

- **None required.** The existing `POST /v1/providers` endpoint already handles provider creation, geocoding, and requires the `x-admin-key`.

---

### Frontend Changes

- Create a new admin-only screen where admins can fill in provider details.
- Add an entry point to this screen from the Profile settings, visible only to admins.

#### [NEW] [AdminProviderRegistrationScreen.js](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Frontend/screens/AdminProviderRegistrationScreen.js)
- A new screen with a beautiful form to capture: Name, Phone, Email, Service Type, City, Area, Address, and Price.
- It will validate inputs and handle loading states.

#### [MODIFY] [ProfileScreen.js](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Frontend/screens/ProfileScreen.js)
- Under the `isAdmin && ...` Developer Settings section, add a new `SettingsRow` labeled "Register New Provider" that navigates to the new screen.

#### [MODIFY] [admin.service.js](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Frontend/services/admin.service.js)
- Add a `createProvider(data)` function to call the `POST /v1/providers` backend endpoint, attaching the `X-Admin-Key` header.

#### [MODIFY] [AppNavigator.js](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Frontend/navigation/AppNavigator.js)
- Register `AdminProviderRegistration` into the Stack Navigator.

## Verification Plan

### Manual Verification
- Log in as an admin account.
- Go to Profile -> "Register New Provider" (under Admin Tools).
- Fill out the form with test provider details.
- Ensure a success message is shown, the backend successfully geocodes the address, and the new provider appears on the map/results.
