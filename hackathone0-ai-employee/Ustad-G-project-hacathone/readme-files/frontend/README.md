# UstadG Frontend — Mobile & Web

> **Framework:** React Native (Expo SDK 54) · Expo Router · Axios · NativeWind/Theme-based Styling

---

## 🚀 Live Access
- **Web App**: `https://ustadg-frontend-603056402651.us-central1.run.app`
- **Mobile APK (Android)**: [Download Build](https://expo.dev/accounts/m-ismail/projects/ustadg-app/builds/e1ed934b-443b-42a7-a5a6-59a55b9befd7)

---

## 🛠️ Key Features
- **Cross-Platform**: Single codebase for Android, iOS, and Web.
- **AI Chat Interface**: Interactive agentic chat for booking service providers.
- **Booking Management**: View history, track status, and receive real-time notifications.
- **Multi-language Support**: Context-based language switching (English/Urdu).
- **Secure Auth**: Persistent login sessions using `expo-secure-store`.

---

## 📦 Deployment Strategies

### 🤖 Mobile APK (Android Preview)
Generated using **EAS (Expo Application Services)**. This build is a standalone binary that connects directly to the production backend.
```bash
# From the frontend folder
npx eas-cli build --platform android --profile preview
```

### 🌐 Web Deployment (Google Cloud Run)
The web version is exported as a static bundle and served via Nginx in a container.
```bash
# 1. Export bundle
npx expo export --platform web

# 2. Build & Push
gcloud builds submit --tag gcr.io/vertical-shore-471312-a5/ustadg-frontend .

# 3. Deploy
gcloud run deploy ustadg-frontend --image gcr.io/vertical-shore-471312-a5/ustadg-frontend --port 80
```

---

## ⚙️ Configuration (`config/env.js`)
To point the frontend to the correct backend, ensure `PRODUCTION_URL` is updated:
```javascript
const PRODUCTION_URL = 'https://ustadg-backend-603056402651.us-central1.run.app';
export const API_BASE_URL = __DEV__ ? PRODUCTION_URL : PRODUCTION_URL;
```

---

## 🧪 Getting Started (Local)
1. `npm install`
2. `npx expo start -c` (Use `-c` to ensure the latest backend URL is picked up from cache)
3. Scan QR code with **Expo Go**.

*Version: 1.1 | Framework: Expo 54 | Created: 2026-05-20*
