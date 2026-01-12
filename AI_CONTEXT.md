# Project Context: Prayer App v2

This document provides context for AI agents working on this project. It outlines the architecture, tech stack, and key patterns used.

## 1. Project Overview
A multi-tenant mobile Prayer Application connecting users to church communities.
- **Goal**: Allow users to share prayer requests and pray for others within their organization (church).
- **Core Value**: "Spiritual Minimalist" aesthetic; focus on text and community.

## 2. Tech Stack
- **Framework**: React Native with Expo (SDK 52+).
- **Router**: Expo Router v4 (File-system based).
- **Language**: TypeScript (Strict Mode).
- **Styling**: NativeWind v4 (Tailwind CSS) + `global.css`.
- **State Management**: TanStack Query v5.
- **Backend / Auth**: Supabase (PostgreSQL, Auth, RLS).
- **Local Storage**: `@react-native-async-storage/async-storage`.

## 3. Architecture & Patterns

### Authentication & Guest Access
The app supports two modes:
1.  **Authenticated User**:
    - Logged in via Supabase Auth.
    - Belongs to an `organization` (Church).
    - Data stored in Supabase `prayers` table.
2.  **Guest User**:
    - No account required.
    - Access limited to local features (creating/viewing own prayers).
    - Data stored locally in `AsyncStorage`.
    - **Logic**: `AuthContext.tsx` manages `isGuest` state.
    - **Data Abstraction**: Hooks (`useCreatePrayer`, `usePrayerFeed`) check `isGuest` to switch between Supabase and `GuestStorage`.

### Folder Structure
- `app/`: Expo Router pages.
    - `(auth)/`: Authentication screens (Sign In, Sign Up, Onboarding).
    - `(tabs)/`: Main app interface (Feed, Compose, Profile).
- `components/`: Reusable UI components.
- `context/`: React Context (AuthContext).
- `hooks/`: Custom React Query hooks (Data Layer).
- `lib/`: Utilities (Supabase client, GuestStorage).
- `assets/`: Images and fonts.

### Database (Supabase)
- **RLS (Row Level Security)** is strictly enforced.
- **Multi-tenancy**: All tables (`profiles`, `prayers`) have `organization_id`.
- **Policies**: Users can only see data belonging to their `organization_id`.

## 4. Current State (Jan 2026)
- **Implemented**:
    - Supabase Auth & Organization Onboarding.
    - Guest Access (Local First mode).
    - Basic Feed & Compose flow.
- **In Progress**:
    - UI Polish & Animations.
    - Advanced Organization features (Groups, Admin).

## 5. Deployment
- **Platform**: Expo EAS (Build & Update).
- **Target**: iOS & Android.
