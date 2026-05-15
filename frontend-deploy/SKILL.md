---
name: frontend-deploy
description: Automates deployment of frontend applications, including Expo/EAS builds for mobile and web hosting setup. Use when a user wants to build an APK, publish an app, or configure deployment settings.
---

# Frontend Deployment Skill

This skill provides automated workflows for deploying frontend applications, with a focus on Expo/React Native and web platforms.

## Expo / EAS Deployment (Mobile)

Use this workflow to generate installable APKs or iOS builds.

### 1. Preparation
Check `app.json` for mandatory fields:
- `slug`
- `android.package`
- `ios.bundleIdentifier`

If missing, propose a unique identifier based on the project name (e.g., `com.username.projectname`).

### 2. EAS Setup
If `eas.json` is missing, copy the template from `assets/eas-apk.json` to the project root.

### 3. Execution
1. Ensure the user is logged in: `npx eas login`
2. Run the build: `npx eas build -p android --profile preview`

Refer to [expo-deployment.md](references/expo-deployment.md) for detailed steps and troubleshooting.

## Web Deployment

For web-based frontend projects:
- **GitHub Pages**: Configure `.github/workflows/deploy.yml` for automated deployment.
- **Vercel/Netlify**: Provide instructions for linking the repository.

## Safety & Best Practices
- Never include secrets or `.env` files in the deployment package.
- Ensure all dependencies are installed (`npm install`) before building.
- Always provide the user with the build/deployment URL upon completion.
