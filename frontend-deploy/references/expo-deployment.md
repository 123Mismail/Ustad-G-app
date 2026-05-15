# Expo/EAS Deployment Guide

This guide covers the procedural steps for deploying React Native apps using Expo Application Services (EAS).

## Prerequisites
1. `eas-cli` installed: `npm install -g eas-cli`
2. Expo account: [expo.dev](https://expo.dev)
3. Authenticated: `npx eas login`

## APK Build Workflow (Android)

### 1. Configuration Check
Ensure `app.json` contains:
- `expo.slug`: A unique URL-friendly name.
- `expo.android.package`: A unique Java-style package name (e.g., `com.company.app`).
- `expo.ios.bundleIdentifier`: A unique iOS bundle ID.

### 2. EAS Initialization
Run `npx eas build:configure` to generate `eas.json`.

### 3. Build Command
For a downloadable APK (Preview), use:
`npx eas build -p android --profile preview`

### 4. Monitoring
The command will provide a link to the Expo dashboard where logs and the final download link can be accessed.
