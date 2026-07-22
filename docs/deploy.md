# Deploy — two Vercel projects from one repo

Phase 1 migrates to a monorepo. Vercel supports this natively via the
"Root Directory" project setting. Each app gets its own Vercel project.

## Project setup

### Consumer app — `praxis-consumer`

| Setting | Value |
|---------|-------|
| Repository | `sotiriosc/posture-app` (this repo) |
| Root Directory | `apps/consumer` |
| Framework | Next.js (auto-detected) |
| Build Command | `cd ../.. && npm ci && npm run build --workspace=apps/consumer` |
| Output Directory | `.next` (default) |
| Node version | 20 |

**Environment variables** (set in Vercel project dashboard, not committed):

```
DATABASE_URL=...
NEXTAUTH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_PRO=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

### Gyms app — `praxis-gyms`

| Setting | Value |
|---------|-------|
| Repository | `sotiriosc/posture-app` (this repo) |
| Root Directory | `apps/gyms` |
| Framework | Next.js (auto-detected) |
| Build Command | `cd ../.. && npm ci && npm run build --workspace=apps/gyms` |
| Output Directory | `.next` (default) |
| Node version | 20 |

**Environment variables** (gyms-specific; set separately in Vercel):

```
DATABASE_URL=...          (may share or be a separate DB schema)
NEXTAUTH_SECRET=...       (separate secret from consumer)
STRIPE_SECRET_KEY=...     (if gyms has its own billing)
```

## Why two projects

- Each product has its own domain, env vars, and deploy pipeline.
- A consumer deploy must not block a gyms hotfix and vice versa.
- Vercel's Root Directory setting tells the build system where `next.config.ts`
  lives; it handles the monorepo layout without any additional configuration.

## Pre-merge checklist (Phase 1 migration)

- [ ] Create `praxis-consumer` Vercel project pointing at `apps/consumer`
- [ ] Set all consumer env vars in the new project
- [ ] Trigger a preview deploy from `phase-1-monorepo-day3` branch — confirm build green
- [ ] Create `praxis-gyms` Vercel project pointing at `apps/gyms`
- [ ] Set gyms env vars
- [ ] Trigger a preview deploy from `phase-1-monorepo-day3` branch — confirm build green
- [ ] After both previews green, merge the Phase 1 PR to main
- [ ] Verify production deploys complete for both projects
- [ ] Archive the old `praxis-gyms` standalone repo on GitHub with a pointer README

## Notes

- The root `package.json` `build` script currently builds consumer only
  (`npm run build --workspace=apps/consumer`). CI builds both explicitly.
- Vercel's monorepo detection may auto-detect the workspace structure;
  if it does, confirm the Root Directory override takes precedence.
- Both apps share the root `node_modules` via npm workspaces hoisting.
  The Vercel build command installs from the repo root (`cd ../..`) to
  ensure hoisted deps are available.
