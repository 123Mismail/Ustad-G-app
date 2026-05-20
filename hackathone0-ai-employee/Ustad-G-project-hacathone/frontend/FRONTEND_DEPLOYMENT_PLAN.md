# Expo React Native Frontend Deployment Strategy: Apple App Store & Google Play

This plan outlines the comprehensive step-by-step procedure to build, sign, optimize, and deploy the UstadG React Native frontend (built using **Expo SDK 54**) for production.

---

## 🎯 Objective
Create standalone, production-signed, and optimized application binaries (`.ipa` for iOS and `.aab` for Android) and deploy them to their respective app stores utilizing **EAS (Expo Application Services)**.

---

## 🔑 Prerequisites
Before initiating the build process, ensure you have set up the following accounts and credentials:

1. **Expo Developer Account:** Create one at [expo.dev](https://expo.dev) if you haven't already.
2. **EAS CLI Installed:** Globally installed on your local machine.
3. **Apple Developer Account ($99/year):** Required if you are publishing to the iOS App Store.
4. **Google Play Console Account ($25 one-time):** Required if you are publishing to the Google Play Store.

---

## 🛠️ Step-by-Step Deployment Walkthrough

### Step 1: Finalize Production Configurations

To ensure the production build points to the live backend environment and is correctly branded, update the following files in the `frontend` folder:

#### A. Configure Production API and Secrets
Open `config/env.js` and verify that the environment variables are optimized for production.

```javascript
// 📍 config/env.js

// 1. Ensure the production API URL points to the live Google Cloud Run Backend:
const PRODUCTION_URL = 'https://ustadg-backend-603056402651.us-central1.run.app';

// 2. Double check that ADMIN_KEY matches your backend environment variable for production:
export const ADMIN_KEY = __DEV__ ? 'ustadg-admin-2026' : 'YOUR_LIVE_PRODUCTION_ADMIN_KEY';

// 3. Selection export
export const API_BASE_URL = __DEV__ ? PRODUCTION_URL : PRODUCTION_URL; 
```

#### B. Update `app.json` Metadata
We need to specify unique package/bundle identifiers, icons, and permissions in the main `app.json` file.

Open `app.json` and expand the metadata fields:

```json
{
  "expo": {
    "name": "UstadG",
    "slug": "ustadg-frontend",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E3A8A"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ustadg.app",
      "infoPlist": {
        "NSCameraUsageDescription": "UstadG requires access to your camera to let you upload profile pictures and receipt verification files."
      }
    },
    "android": {
      "package": "com.ustadg.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1E3A8A"
      },
      "edgeToEdgeEnabled": true,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-font"
    ]
  }
}
```

---

### Step 2: Install and Log In to EAS CLI

Expo Application Services handles code compiling and binary signing in the cloud, removing the absolute requirement for macOS to compile iOS builds.

1. **Install EAS CLI globally:**
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to your Expo account:**
   ```bash
   eas login
   ```

3. **Link your local project to your Expo account:**
   From the root of your `frontend` directory, run:
   ```bash
   eas project:init
   ```
   Select your Expo user/organization account and set the slug.

---

### Step 3: Configure EAS Build Profiles (`eas.json`)

To customize how EAS builds the binaries, generate the configuration file:

```bash
eas build:configure
```

This command automatically creates a production-ready `eas.json` file in the `frontend` folder. Make sure your `eas.json` resembles this structure:

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

> [!NOTE]
> * **Android AAB (`app-bundle`):** Optimizes download size for users when listed on the Google Play Store.
> * **iOS Production (`simulator: false`):** Prepares the application for running on real devices and distribution to TestFlight or App Store.

---

### Step 4: Run Production Builds

Submit the build task to Expo's cloud compiler. 

#### 🤖 Build for Android (Google Play Store)
Run the following command in the `frontend` directory:
```bash
eas build --platform android --profile production
```
*During execution, EAS will ask if you want it to generate a new **keystore (Android signing key)** for you. Select **Yes (Recommended)**. Expo will store this key safely in their secure database.*

Once complete, EAS will output a link to download the `.aab` (Android App Bundle) file.

#### 🍎 Build for iOS (Apple App Store)
Run the following command:
```bash
eas build --platform ios --profile production
```
*You will be prompted to log in to your Apple Developer Account. EAS will generate your production provisioning profile, signing certificates, and bundle identifiers automatically.*

Once complete, EAS will output a link to download the `.ipa` binary file.

---

### Step 5: Automate Submission to App Stores

EAS can automatically submit your completed build files directly to Apple App Store Connect and Google Play Console.

1. **Verify your credentials:** Make sure your developer accounts are fully configured and billing is active.
2. **Submit automatically:**
   * **For Android:**
     ```bash
     eas submit --platform android
     ```
   * **For iOS:**
     ```bash
     eas submit --platform ios
     ```

Alternatively, you can build and submit in a single continuous pipeline command:
```bash
eas build --platform all --profile production --auto-submit
```

---

### Step 6: Configure Over-The-Air (OTA) Updates (Optional but Highly Recommended)

One of Expo's strongest features is the ability to push minor bug fixes and UI updates directly to your users' devices *instantly* without resubmitting a new application version to the Google Play Store or Apple App Store.

1. **Configure EAS Update:**
   ```bash
   eas update:configure
   ```

2. **Publish an instant update to production:**
   Whenever you make a javascript or asset change, push it to users by executing:
   ```bash
   eas update --branch production --message "Fix profile picture upload and update endpoint keys"
   ```

---

## 📈 Testing in Production (Beta Testing)

Before rolling out to the general public, it is best practice to run structured beta releases:

*   **iOS (TestFlight):** Upload your production build to App Store Connect. Add internal and external tester emails in the **TestFlight** tab. Testers will download the official TestFlight app from Apple and try your app.
*   **Android (Google Play Closed Testing):** Upload your `.aab` to the **Closed Testing** track in Google Play Console. Define a group of testers by email address to download and test the app securely.

---

*Version: 1.0 | Feature: Mobile Production Build & App Store Distribution | Framework: Expo SDK 54 | Created: 2026-05-20*
