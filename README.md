# Praxis (consumer app)

> Formerly **Body Alignment Coach** — the `bac_` cookie/storage prefix is legacy from
> that name (see [Branding & legacy naming](#branding--legacy-naming)).

Posture and strength coaching app. Users sign in, complete an assessment and
questionnaire, receive a multi-day program, run guided sessions, and review history
with progression cues. The app has a local-first heritage (browser storage still
backs an offline-capable DB-free dev mode), but the shipped product is **auth-gated
with a Stripe subscription** and **optional server-side cloud sync** for cross-device
continuity.

## Overview
- Auth + subscription: email/password login, `free`/`pro` entitlement via Stripe
- Assessment: optional posture scan + questionnaire
- Program: weekly split with day preview, coaching cues, and progression
- Session: guided workout with dual-mode timer, feedback, and substitution
- History: coach-grade logs, last sessions, next-time targets
- Storage: browser IndexedDB + localStorage, with optional Postgres-backed cloud sync

## Core Features
- Program generation with equipment-aware filtering
- Phased programming (Restore & Control → Strength & Capacity → Performance)
- Guided sessions with timer, logging, and feedback
- Progression engine for next-time recommendations
- Exercise library with cues and video placeholders
- Resume where you left off (session drafts)
- Backup/restore + Reset app data (danger zone)
- Auth-gated access with Stripe subscription entitlement (`free` vs `pro`)
- Optional cloud sync (Postgres) for cross-device continuity

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

Cookies (server-set, httpOnly)
- `bac_user` — session JWT (HMAC-signed, timing-safe verified)
- `bac_admin` — admin unlock hash

Postgres (optional, cloud sync)
- `app_users`, plus `app_user_state`, `app_user_programs`,
  `app_user_program_progress`, `app_user_sessions`, `app_user_exercise_logs`
- Auto-created on first use when the DB drivers are enabled (see below).

## Branding & legacy naming
The product is now **Praxis**; it was originally **Body Alignment Coach**. Several
identifiers still carry the old `bac_`/`bodycoach-` prefixes (cookies, IndexedDB
databases). These are intentionally left as legacy names for now: renaming the
cookies would invalidate every existing session and admin unlock, and renaming the
IndexedDB stores would strand on-device data without a migration path. A rename, if
done, should be a deliberate dual-read migration — not a silent flip. **Cookie-name
migration decision is deferred to merge time (Sotirios's call);** until then the
legacy names stay and this note keeps the tradeoff honest.

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
1. Wearable integration: HR/sleep insights to adjust weekly plan
2. Adaptive periodization: auto-adjust phase based on readiness
3. Movement scoring: real-time camera feedback in session (browser-only)
4. Expanded exercise library: progression ladders and alternatives
5. Coach review mode: shared links for remote feedback
6. Notifications: weekly prompts and missed-session nudges
7. Localization: multi-language support

Delivered since the original roadmap: login + optional cloud sync (cross-device
restore) and Stripe subscription entitlement are now in the shipped product.

## Design Principles
- Mobile-first, high-contrast UI over a background image
- Local-first heritage: browser storage backs a DB-free dev/offline mode; cloud
  sync is opt-in on top, not a replacement
- Progressive disclosure: keep screens clean, show details on demand

## Contributing
Keep changes scoped, avoid heavy dependencies, and preserve the DB-free local mode.
