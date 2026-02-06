# Body Alignment Coach

Local-first posture and strength coaching app. Users complete an assessment and questionnaire, receive a multi-day program, run guided sessions, and review history with progression cues. All data is stored on-device (no login required).

## Overview
- Assessment: optional posture scan + questionnaire
- Program: weekly split with day preview, coaching cues, and progression
- Session: guided workout with dual-mode timer, feedback, and substitution
- History: coach-grade logs, last sessions, next-time targets
- Local-first: IndexedDB + localStorage; no cloud required

## Core Features
- Program generation with equipment-aware filtering
- Phased programming (Restore & Control → Strength & Capacity → Performance)
- Guided sessions with timer, logging, and feedback
- Progression engine for next-time recommendations
- Exercise library with cues and video placeholders
- Resume where you left off (session drafts)
- Backup/restore + Reset app data (danger zone)

## Project Structure
```
src/
  app/                 Next.js app routes
  components/          UI + layout components
  lib/                 Core logic, storage, generators, progression
  tests/               Unit + e2e tests
```

### Key Modules
- `src/lib/program.ts` — weekly program generator
- `src/lib/phases.ts` — phase selection + next-week plan
- `src/lib/progression.ts` — next-time recommendations
- `src/lib/assessmentEngine.ts` — structured observations
- `src/lib/logStore.ts` — IndexedDB logs/programs/prefs
- `src/lib/sessionDraftStore.ts` — resume-in-progress sessions
- `src/lib/appState.ts` — last route / active session tracking

## Routes
- `/` — landing
- `/assessment` — photo upload + posture scan
- `/questionnaire` — user inputs
- `/results` — program dashboard
- `/session` — guided session
- `/program/[programId]/day/[dayIndex]` — day details + history
- `/exercise/[id]` — exercise detail
- `/progress` — progress overview
- `/settings` — backup/restore + reset

## Data Storage
LocalStorage
- `posture_questionnaire`
- `posture_photo_meta`
- `app_state_v1`
- legacy keys for migration (logs/session/prefs)

IndexedDB
- `bodycoach-logs` (sessions, logs, programs, prefs, progress)
- `bodycoach-drafts` (session drafts)

## Running Locally
```
npm install
npm run dev
```
Open `http://localhost:3000`.

## Build
```
npm run build
```

## Tests
```
npm test
npm run test:e2e
```
Note: Playwright uses a web server on port 3000 in config; update if needed.

## Reset App Data
Settings → Danger zone → Reset app data.
This clears localStorage + IndexedDB and reloads the app as a fresh install.

## Future Plans (Roadmap)
1. Cloud sync + login (optional): cross-device restore
2. Wearable integration: HR/sleep insights to adjust weekly plan
3. Adaptive periodization: auto-adjust phase based on readiness
4. Movement scoring: real-time camera feedback in session (browser-only)
5. Expanded exercise library: progression ladders and alternatives
6. Coach review mode: shared links for remote feedback
7. Notifications: weekly prompts and missed-session nudges
8. Localization: multi-language support

## Design Principles
- Mobile-first, high-contrast UI over a background image
- Local-first storage (privacy by default)
- Progressive disclosure: keep screens clean, show details on demand

## Contributing
Keep changes scoped, avoid heavy dependencies, and preserve local-first behavior.
