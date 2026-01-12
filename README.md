# Prayer App v2

A high-fidelity, mobile-first prayer application for church communities. Built with Expo, React Native, and Supabase.

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- [Expo Go](https://expo.dev/client) app on your mobile device (iOS/Android).

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    - Copy `.env.example` to `.env` (if available) or ensure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set.

### Running the App
Start the development server:

```bash
npm start
```

- **Scan the QR code** with your phone (Camera on iOS, Expo Go app on Android).
- Or press `i` to run in **iOS Simulator** (requires Xcode).
- Or press `a` to run in **Android Emulator** (requires Android Studio).

### Troubleshooting
If you encounter caching issues or unexpected errors, try clearing the bundler cache:

```bash
npx expo start --clear
```

## 🏗 Architecture

- **Frontend**: React Native + Expo Router
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Supabase
- **State**: TanStack Query

## ✨ Key Features

- **Guest Access**: Use the app offline without an account.
- **Organization Support**: Join your church via invite code.
- **Real-time Feed**: See prayer requests from your community.

## 🧪 Testing

Currently, the project relies on manual verification.
- **Guest Mode**: Tap "Continue as Guest" on Sign In.
- **Authenticated**: Sign up/in to sync with Supabase.
