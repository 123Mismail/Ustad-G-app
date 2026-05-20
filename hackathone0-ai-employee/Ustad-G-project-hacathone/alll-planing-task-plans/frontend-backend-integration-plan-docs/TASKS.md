# UstadG — Frontend ↔ Backend Integration: Task Breakdown

> **Goal:** Wire the React Native (Expo) frontend to the FastAPI backend, replacing all mock data with real API calls.
> **Status:** 🔲 Not Started  
> **Updated:** 2026-05-18

---

## 🗂️ Task Summary Table

| Task | Title | Priority | Effort | Status |
|------|-------|----------|--------|--------|
| T1 | API Client Layer Setup | 🔴 Critical | 2h | [x] |
| T2 | Auth Flow — Register + Login + Token Storage | 🔴 Critical | 3h | [x] |
| T3 | Chat Screen → Real AI Agent | 🔴 Critical | 3h | [x] |
| T4 | Results Screen → Real Provider Data | 🔴 Critical | 2h | [x] |
| T5 | Confirmation Screen → Real Booking API | 🔴 Critical | 2h | [x] |
| T6 | Booking History → Real DB | 🟡 High | 2h | [x] |
| T7 | Analytics Screen → Real Admin Stats | 🟡 High | 2h | [x] |
| T8 | Push Notifications → FCM Device Token | 🟡 High | 2h | 🔲 |
| T9 | Profile Screen → Auth State + Logout | 🟢 Medium | 1h | [x] |
| T10 | Error Handling & Loading States | 🟢 Medium | 2h | 🔲 |
| T11 | Local Dev Environment Setup | 🔴 Critical | 1h | [x] |
| T12 | Production Config & Deployment Wiring | 🟡 High | 2h | 🔲 |

---

## T1 — API Client Layer Setup
> Create `frontend/services/api.js` — the single source of truth for all HTTP requests.

- [x] **T1.1** Install `axios` in the frontend: `npm install axios`
- [x] **T1.2** Create `frontend/services/api.js`:
  - Base URL config (`LOCAL_API_URL` vs `PROD_API_URL`)
  - Axios instance with default headers
  - Request interceptor: attach `Authorization: Bearer <token>` from storage
  - Response interceptor: handle `401` → clear token → redirect to Login
- [x] **T1.3** Create `frontend/services/auth.service.js` — thin wrappers for auth API calls
- [x] **T1.4** Create `frontend/services/providers.service.js` — provider CRUD calls
- [x] **T1.5** Create `frontend/services/bookings.service.js` — booking create/list/cancel calls
- [x] **T1.6** Create `frontend/services/chat.service.js` — chat/agent calls
- [x] **T1.7** Create `frontend/services/admin.service.js` — admin analytics calls

---

## T2 — Auth Flow — Register + Login + Token Storage
> Replace mock identity with real JWT auth. Add Login + Register screens.

- [x] **T2.1** Install `expo-secure-store`: `npx expo install expo-secure-store`
- [x] **T2.2** Create `frontend/utils/tokenStorage.js` — `saveToken`, `getToken`, `clearToken` using `SecureStore`
- [x] **T2.3** Create `frontend/context/AuthContext.js`:
  - `AuthProvider` with state: `{ user, token, isLoading }`
  - `login(phone, password)` → calls `POST /v1/auth/login` → saves token
  - `register(data)` → calls `POST /v1/auth/register`
  - `logout()` → clears token, resets navigation
- [x] **T2.4** Create `frontend/screens/LoginScreen.js` — phone + password form
- [x] **T2.5** Create `frontend/screens/RegisterScreen.js` — register form
- [x] **T2.6** Add `AuthNavigator.js` — shows Login/Register when not authenticated
- [x] **T2.7** Update `AppNavigator.js` — gated: show `AuthNavigator` or `BottomTabNavigator` based on `AuthContext`
- [x] **T2.8** Update `ProfileScreen.js` — show real user name/phone from `AuthContext`, wire Logout button

---

## T3 — Chat Screen → Real AI Agent
> Send the chat input to `POST /v1/chat` and display the AI agent response.

- [x] **T3.1** Create `frontend/hooks/useChat.js` — manages message state + API call to `POST /v1/chat`
  - Fields: `session_id` (uuid, persisted per app session), `message`
  - Returns: `{ messages, sendMessage, isLoading }`
- [x] **T3.2** Update `AIChatCard` component:
  - On submit → call `sendMessage(text)` from `useChat`
  - Show loading spinner while waiting for AI response
  - Display AI reply in a "bubble" below the input
- [x] **T3.3** Parse AI response: if reply mentions providers → extract and navigate to `Results` screen passing the provider list
- [x] **T3.4** Wire Category Grid selections → pre-fill chat and auto-send on tap

---

## T4 — Results Screen → Real Provider Data
> Replace `MOCK_PROVIDERS` with real data from `GET /v1/providers`.

- [x] **T4.1** Accept `{ providers, query }` as navigation params from `ChatScreen`
- [x] **T4.2** If no params → fetch `GET /v1/providers?service_type=&city=Karachi` on mount
- [x] **T4.3** Map backend `ProviderOut` shape → frontend card shape:
  - `id`, `name`, `service_type` → `serviceKey`
  - `rating`, `lat`, `lng`, `area`
  - Calculate `distanceVal` from user coords (Haversine or passed from agent)
- [x] **T4.4** Display real rating and area on `ProviderCard`
- [x] **T4.5** Pass selected provider's real `id` to `ConfirmationScreen`

---

## T5 — Confirmation Screen → Real Booking API
> Wire "Book Now" to `POST /v1/book` and display the real `UGK-XXXX` confirmation ID.

- [x] **T5.1** Accept `{ provider, service, scheduledAt }` as navigation params
- [x] **T5.2** On "Confirm Booking" press → call `POST /v1/book`:
  - Body: `{ provider_id, service, scheduled_at }`
  - Header: `Authorization: Bearer <token>`
- [x] **T5.3** Show loading spinner during API call
- [x] **T5.4** On success → display real `confirmation_id` (e.g., `UGK-2026-7423`) from response
- [x] **T5.5** On error → show `Alert` with error message, keep user on screen

---

## T6 — Booking History → Real DB
> Replace `mockBookings.js` with real `GET /v1/bookings` data.

- [x] **T6.1** Identify which screen shows bookings (or create a `BookingsScreen.js`)
- [x] **T6.2** On screen focus → fetch `GET /v1/bookings` (paginated, auth required)
- [x] **T6.3** Display real booking list: `confirmation_id`, `service`, `status`, `scheduled_at`
- [x] **T6.4** Wire "Cancel" button → `PATCH /v1/bookings/{id}/cancel`
- [x] **T6.5** Refresh list after cancel

---

## T7 — Analytics Screen → Real Admin Stats
> Replace `MOCK_REVENUE_DATA` with real `GET /v1/admin/stats`.

- [x] **T7.1** Detect `userRole === 'admin'` from `AuthContext`
- [x] **T7.2** On screen focus → fetch `GET /v1/admin/stats` with `X-Admin-Key` header
- [x] **T7.3** Replace hardcoded stat values with: `total_bookings`, `active_providers`, `estimated_revenue_pkr`
- [x] **T7.4** Replace `MOCK_REVENUE_DATA` chart with top services data from `top_services[]`
- [x] **T7.5** Hide Analytics tab for non-admin users

---

## T8 — Push Notifications → FCM Device Token
> Register the device for Firebase Cloud Messaging push notifications.

- [x] **T8.1** Install `expo-notifications` + `expo-device`: `npx expo install expo-notifications expo-device`
- [x] **T8.2** Create `frontend/utils/notifications.js`:
  - Request permission
  - Get Expo push token (or raw FCM token for production)
  - Register token with backend via `PATCH /v1/users/me/token`
- [x] **T8.3** Call `notifications.registerPushToken()` after successful login
- [x] **T8.4** Handle incoming notifications when app is in foreground (display banner)
- [x] **T8.5** Handle notification tap → navigate to relevant booking screen

---

## T9 — Profile Screen → Auth State + Logout
> Show real user data and wire the logout button properly.

- [x] **T9.1** Pull `{ user }` from `AuthContext`
- [x] **T9.2** Display `user.name`, `user.phone`, `user.city`, `user.area` in `ProfileHeader`
- [x] **T9.3** Wire "Log Out" → call `logout()` from `AuthContext`
- [x] **T9.4** On logout → clear token, navigate to `LoginScreen`

---

## T10 — Error Handling & Loading States
> Global error handling and UX polish for all network calls.

- [x] **T10.1** Create `frontend/components/LoadingOverlay.js` — full screen spinner
- [x] **T10.2** Create `frontend/components/ErrorBanner.js` — toast/snackbar for errors
- [x] **T10.3** Handle `401 Unauthorized` globally → logout + redirect to Login
- [x] **T10.4** Handle `503 / network error` → show "No internet connection" banner
- [x] **T10.5** Add retry logic for transient errors in `useChat`

---

## T11 — Local Dev Environment Setup
> Ensure frontend can talk to the local FastAPI backend during development.

- [x] **T11.1** Backend runs on: `http://localhost:8002` (already running on port 8002)
- [x] **T11.2** For Android emulator: use `http://10.0.2.2:8002` (emulator localhost alias)
- [x] **T11.3** For physical device on same WiFi: use machine's local IP (e.g., `http://192.168.x.x:8002`)
- [x] **T11.4** Create `frontend/config/env.js`:
  ```js
  export const API_BASE_URL = __DEV__
    ? 'http://10.0.2.2:8002'       // Android emulator
    : 'https://ustadg-api.run.app'; // Production Cloud Run URL
  ```
- [x] **T11.5** Verify CORS is open for all origins in backend `.env` (`CORS_ORIGINS=*` ✅ already set)
- [x] **T11.6** Test connectivity: `curl http://localhost:8002/v1/health` from backend machine

---

## T12 — Production Config & Deployment Wiring
> Configure the frontend to point to the production Cloud Run backend.

- [x] **T12.1** Deploy backend to Google Cloud Run (if not already):
  - Build Docker image, push to GCR, deploy to Cloud Run
  - Get production URL: e.g., `https://ustadg-api-XXXXX.run.app`
- [x] **T12.2** Update `frontend/config/env.js` with production URL
- [x] **T12.3** Set `CORS_ORIGINS` in backend production `.env` to the Expo/app domain
- [x] **T12.4** Build Expo app for production: `expo build:android` or `eas build`
- [x] **T12.5** Configure Firebase for production FCM:
  - Add `google-services.json` (Android) / `GoogleService-Info.plist` (iOS) to Expo project
  - Set `FIREBASE_CREDENTIALS_PATH` in Cloud Run environment variables
- [x] **T12.6** Set production environment variables in Cloud Run:
  - `DATABASE_URL`, `GEMINI_API_KEY`, `ADMIN_KEY`, `JWT_SECRET`, `FIREBASE_CREDENTIALS_PATH`
- [x] **T12.7** Test production endpoint: `curl https://ustadg-api-XXXXX.run.app/v1/health`

---

*Version: 1.0 | Project: UstadG | Created: 2026-05-18*
