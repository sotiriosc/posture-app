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
- `/settings` — admin-only backup/restore + telemetry + reset
- `/admin/access` — admin unlock page (not linked in UI)

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

Recommended DB-free local `.env.local`:
```
USER_STORE_DRIVER=memory
TRAINING_STORE_DRIVER=disabled
DATABASE_URL=
APP_URL=http://localhost:3000
# Optional, defaults off. Leave unset unless explicitly testing future adaptive generation.
ADAPTIVE_PROGRAMMING_ENABLED=
```
This mode keeps auth users in process memory and leaves training sync in browser
storage, so `npm run dev` does not consume Neon/Postgres quota. Use it for
ordinary UI and program-generator work.

Optional local Postgres mode:
```
USER_STORE_DRIVER=db
TRAINING_STORE_DRIVER=db
DATABASE_URL=postgresql://localhost:5432/posture_app_dev
APP_URL=http://localhost:3000
```
Use a local or disposable development database here. Do not point local
development at the production Neon database.

Admin gate:
```
ADMIN_ACCESS_KEY=your-secret-key
```
Set this in your environment before running. Use `/admin/access` to unlock admin cookie, then `/settings` becomes available.

Auth + subscription gate:
```
AUTH_SECRET=your-long-random-secret
AUTH_USER_EMAIL=you@example.com
AUTH_USER_PASSWORD=your-password
AUTH_USER_PLAN=free
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
APP_URL=http://localhost:3000
```
- `/auth/login` handles sign-in.
- Protected routes: `/results`, `/session`, `/program`, `/progress`.
- Entitlement rule: `free` can execute only Day 1 workouts; `pro` unlocks all days.
- Users are stored server-side in `data/users.json` with salted+hashed passwords.
- `AUTH_USER_*` values act as bootstrap credentials: first run seeds the initial user in storage.
- `USER_STORE_DRIVER` controls auth user storage (`file` default, `memory` for DB-free local dev, `db` for Postgres).
- `TRAINING_STORE_DRIVER` controls server-side training sync (`disabled` for DB-free local dev, `db` for Postgres).
- With `USER_STORE_DRIVER=db`, users are stored in Postgres table `app_users` (auto-created on first use).
- With `TRAINING_STORE_DRIVER=db`, training state is stored in Postgres tables
  `app_user_state`, `app_user_programs`, `app_user_program_progress`,
  `app_user_sessions`, and `app_user_exercise_logs` (auto-created on first use).
- Stripe endpoints:
  - `POST /api/billing/checkout-session`
  - `POST /api/billing/portal-session`
  - `POST /api/billing/webhook`
- Security:
  - rotate Stripe/API secrets before production
  - never use `sk_live_...` in local/dev environments

## Coaching Feedback Safety
- Session feedback, adaptation previews, next-session recommendations, and manual session modes are advisory/current-session UX only.
- Saved generated programs are not rewritten by these feedback layers.
- `ADAPTIVE_PROGRAMMING_ENABLED` defaults off; adaptive intent helpers may derive inert future-generation intent, but no generator scoring, repair, progression, or substitution behavior is enabled by default.

## Development Reports
Generated persona review artifacts live in `docs/dev-reports/`. They are debug/merge-readiness evidence, not product documentation. Keep regenerated review files out of the repository root.

## Build
```
npm run build
```

## Vercel Deployment
- Use `Preview` as staging and keep Stripe in test mode there.
- Use `Production` for live traffic with live Stripe keys.
- Full setup guide: `docs/vercel-deployment.md`.

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
