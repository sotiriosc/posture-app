# Praxis for Gyms

Praxis for Gyms is a gym SaaS pilot/demo platform that uses the Praxis coaching engine to support member onboarding, guided training, personal training pathways, and standardized coaching education.

This repository is a standalone product copied from the consumer Praxis app. It is not intended to merge back into the consumer app. The current priority is to establish a clear B2B product boundary while preserving the proven member coaching engine.

## Product Positioning

Praxis for Gyms helps clubs turn unsure members into supported members. The platform demonstrates how a gym can connect assessments, first-week training plans, guided sessions, member feedback, trainer consult pathways, and coaching education into one structured member support layer.

The app currently includes a buyer-facing landing page, a gym demo shell, and the existing Praxis member-flow engine.

## Primary Routes

- `/enterprise` - B2B landing page for Praxis for Gyms.
- `/gym-demo` - demo hub for buyers, operators, and stakeholders.
- `/gym-demo/member` - buyer-facing walkthrough of the member journey.
- `/gym-demo/admin` - mock gym/operator dashboard for pilot metrics and trainer handoff signals.

## Member Coaching Engine Routes

These routes remain available as the actual demo flow powered by the existing Praxis engine:

- `/assessment` - optional movement and posture photo baseline.
- `/questionnaire` - member movement profile and training inputs.
- `/results` - generated plan dashboard.
- `/session` - guided training session with timer, logging, and feedback.
- `/program/[programId]/day/[dayIndex]` - day details and exercise history.
- `/exercise/[id]` - exercise detail page.
- `/progress` - member progress overview.

## Engine Boundary

The Praxis coaching engine remains intact and powers the demo:

- `src/lib/program.ts` - weekly program generator entry point.
- `src/lib/phases.ts` - phase definitions and phase movement.
- `src/lib/progression.ts` - next-time recommendations.
- `src/lib/assessmentEngine.ts` - structured assessment observations.
- `src/lib/logStore.ts` - local training logs, programs, preferences, and progress.
- `src/lib/sessionDraftStore.ts` - in-progress session resume support.
- `src/lib/appState.ts` - active route, program, and session state.

Do not change generator, progression, phase gating, auth, Stripe, database, storage, session behavior, questionnaire behavior, assessment behavior, or program logic for product-boundary work.

## Storage Names

Some storage keys and database names still use legacy consumer-app names. This is intentional for now because renaming them can orphan local demo data or break migration assumptions.

Legacy names currently include:

- `posture_questionnaire`
- `posture_photo_meta`
- `bodycoach-logs`
- `bodycoach-drafts`
- `bodycoach-photos`
- `bac_user`
- `bac_admin`

Do not rename localStorage keys, IndexedDB names, cookies, or server storage tables casually. Treat storage renaming as a separate migration project.

## Project Structure

```text
src/
  app/                 Next.js app routes, including B2B demo routes
  components/          UI, layout, dashboard, results, session, and shared controls
  lib/                 Praxis coaching engine, storage, auth, billing, and server utilities
  tests/               Unit and e2e tests
docs/
  dev-reports/         Engine review artifacts and historical quality evidence
```

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Recommended DB-free local `.env.local`:

```bash
USER_STORE_DRIVER=memory
TRAINING_STORE_DRIVER=disabled
DATABASE_URL=
APP_URL=http://localhost:3000
ADAPTIVE_PROGRAMMING_ENABLED=
```

This keeps local development focused on UI and demo flow work without consuming a hosted database.

Optional auth, admin, Stripe, and Postgres settings still exist from the copied Praxis app. Keep those systems stable unless the work explicitly targets them.

## Deployment Notes

- `/enterprise` and `/gym-demo` routes are the product-facing surfaces.
- `/assessment`, `/questionnaire`, `/results`, and `/session` are the member demo engine.
- Billing and auth routes remain present but should not define the gym SaaS business model until intentionally redesigned.
- Use `docs/vercel-deployment.md` for environment setup details.

## Test Commands

```bash
npm run lint
npm test
npm run build
```

If WSL cannot resolve the local Node install, use the local Node fallback that works in your environment.

## Product Boundary Rules

- Keep product identity and B2B demo work separate from engine behavior.
- Preserve the member flow as a demo of what a gym member experiences.
- Add gym SaaS surfaces around the engine before changing the engine itself.
- Do not delete consumer/member-flow routes until replacement gym flows are fully specified.
- Keep storage names stable until a migration plan exists.
