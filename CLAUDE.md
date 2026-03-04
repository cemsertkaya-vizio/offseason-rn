# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Offseason is a React Native fitness/personal training app (TypeScript) targeting iOS and Android. It includes a companion Vite+React admin web dashboard for studio management. All code lives under `OffseasonApp/`.

## Commands

All commands run from `OffseasonApp/`:

```bash
# Dev server
npm start

# Run on platform
npm run ios
npm run android

# iOS native deps (first time or after native dep changes)
bundle install && bundle exec pod install

# Lint & test
npm run lint        # ESLint
npm test            # Jest (preset: react-native)
```

Admin panel (from `OffseasonApp/admin/`):
```bash
npm run dev         # Vite dev server
npm run build       # tsc && vite build
```

## Architecture

### Entrypoint & Provider Nesting

`index.js` → `App.tsx` wraps in providers in this order:
`SafeAreaProvider > AuthProvider > ProfileProvider > WorkoutProvider > ChatProvider > RegistrationProvider > NavigationContainer > RootNavigator`

`AppLoadingScreen` checks auth + onboarding progress on startup, then `navigation.replace()` to the correct initial screen.

### Navigation

- Single root `NativeStackNavigator` in `src/navigation/RootNavigator.tsx` with ~50 screens
- `TabNavigator.tsx` provides 5-tab bottom nav: Workouts, Goals, Center (AI Chat), Analytics, Profile
- All navigation types defined in `src/types/navigation.ts`

### State Management

React Context API only (no Redux/Zustand). Five contexts in `src/contexts/`:
- **AuthContext** — Supabase session, user, sign-out. Persists user ID in AsyncStorage.
- **ProfileContext** — User profile from Supabase `profiles` table
- **WorkoutContext** — Season/workout data with mutation methods (`updateDay`, `toggleRestDay`, `updateExercises`, `addExercise`, `removeExercise`, `swapDays`). All mutations call `workoutService.saveSeason()` which writes to Supabase.
- **RegistrationContext** — Accumulates multi-step onboarding form data
- **ChatContext** — In-memory AI chat messages and typing state

### Service Layer (`src/services/`)

Services are plain objects with async methods (no classes). Two backends:
1. **Supabase** (direct client via `src/config/supabase.ts`) — auth, profiles, seasons, studios, storage
2. **External REST API** at `https://offseason.onrender.com` — AI workout generation (`/build_workout_season`, `/load_existing_season`), chat (`/chat`), profile summary (`/profile_summary`)

### Data Model

`Season` contains `Cycle[]`, each with `Week[]`, each with `days: Record<dayName, DayWorkout>`. `DayWorkout` has `exercises: WorkoutExercise[]` and `rest_day` flag.

### Supabase Tables & Storage

Tables: `profiles` (with `onboarding_step` tracking), `seasons` (stores full `workout_season` JSON blob), `studios`, `exercise_media`

Storage buckets: `profile-images`, `exercise-videos`, `exercise-images`, `studio-images`

### Onboarding Flow

Multi-step registration: CoreProfile → PhysicalInfo → Location → Preferences → Schedule → PreferredDays → (activity-specific screens) → Goals → (goal-specific screens) → SummaryReview. Progress persisted in `profiles.onboarding_step` for resume on re-launch.

## Conventions

- **Environment variables**: `.env` loaded via `react-native-dotenv` babel plugin, imported from `@env`
- **Styling**: `StyleSheet.create()` at bottom of file; colors from `src/constants/colors.ts` — never hardcode colors
- **Logging**: Always prefix with component/service name: `console.log('ComponentName - event description')`
- **Components**: One per file, PascalCase `.tsx`, exported from `index.ts` barrels
- **TypeScript**: Strict mode, avoid `any`, define interfaces for all props/data
- **Prettier**: `singleQuote: true`, `trailingComma: 'all'`, `arrowParens: 'avoid'`
- **Babel plugins**: `react-native-dotenv` + `react-native-reanimated/plugin` (Reanimated plugin must be listed last)
- **No emoji in comments or code**
- Avoid major architectural changes to working features without explicit instruction
- Never change UI/UX without asking first
