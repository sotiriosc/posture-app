# Praxis — monorepo

One engine, two products, one repository.

```
praxis/  (this repo)
├── packages/
│   └── engine/          @praxis/engine — canonical shared engine (TypeScript source)
│                         Program generation · Exercise catalog · Session feedback
│                         Phase gating · Assessment · Auth · Stripe · DB stores
│
├── apps/
│   ├── consumer/        @praxis/consumer — Praxis consumer app (posture + strength coaching)
│   │                     Next.js 16 · App Router · Tailwind · Vercel
│   └── gyms/            @praxis/gyms — Praxis for Gyms (B2B SaaS)
│                         Next.js 16 · Gym operator dashboard · Member tracking
│
├── docs/
│   ├── engine-api.md         Public API surface of @praxis/engine
│   ├── phase1-move-purity.md Move-purity proof (Phase 1 transport)
│   ├── engine-decisions.md   Engine-behavior decision log
│   ├── ladder-decisions.md   Catalog/ladder decision log
│   └── deploy.md             Two-Vercel-project setup
│
└── scripts/
    ├── codemod-engine-imports.ts   Auditable import-path transformer
    └── verify-move-purity.ts       Move-purity verification script
```

## Engine is canonical

`packages/engine` is the single source of truth for all shared logic. Neither app
contains a copy of the engine. The gyms engine copy was deleted in Phase 1 (see
`docs/phase1-move-purity.md` — 214 files verified identical to the pre-monorepo tag).

Import paths use `@/lib/*` tsconfig aliases (→ `packages/engine/src/*`) during the
current transport phase. The barrel `packages/engine/src/index.ts` defines the
intended public API surface; barrel-only enforcement (R1) is a post-Phase-3 task
after the Edge Runtime import graph is fully audited.

## Two products

| | Consumer | Gyms |
|---|---|---|
| Package | `@praxis/consumer` | `@praxis/gyms` |
| Audience | Individual users | Gym operators + members |
| Auth | Email/password + Stripe | Demo + operator gating |
| Unique code | `apps/consumer/src/` | `apps/gyms/src/lib/gymSaas/` |

## Boundary rules (enforced in CI)

| Rule | Description | Status |
|------|-------------|--------|
| R2 | Engine must not import from `apps/*` | ✅ Active |
| R3 | Engine must not value-import `next/*` or `react` | ✅ Active (3 legacy exceptions documented) |
| R4 | No cross-app imports (consumer ↔ gyms) | ✅ Active |
| R1 | Apps import engine only via `@praxis/engine` barrel | 🎫 Post-Phase-3 ticket |

## Dev quick-start

```bash
npm install                                 # installs all workspaces
npm run dev                                 # consumer app on :3000
npm run dev --workspace=apps/gyms           # gyms app
npx vitest --run --config packages/engine/vitest.config.ts  # engine tests
```

## Consumer app

> Formerly **Body Alignment Coach** — the `bac_` cookie/storage prefix is a legacy
> from that name.

Posture and strength coaching. Users sign in, complete an assessment and
questionnaire, receive a multi-day program, run guided sessions, and review history
with progression cues.

- **Auth + subscription**: email/password login, `free`/`pro` entitlement via Stripe
- **Assessment**: optional posture scan + questionnaire
- **Program**: weekly split with day preview, coaching cues, and progression
- **Session**: guided workout with timer, feedback, substitution, and degradation notes
- **History**: coach-grade logs, next-time targets, phase progress
- **Storage**: IndexedDB + localStorage (offline-capable) with optional Postgres cloud sync

## Gyms app

B2B SaaS for gym operators. Operator dashboard, member tracking, program handoff,
buyer demo flow, and trainer-facing signal aggregation.

## Architecture notes

- Single root `package.json` / `package-lock.json` — npm workspaces
- `tsconfig.base.json` — shared compiler options; apps and engine extend it
- CI gate (every PR): boundary lint → engine anchor suite → both `next build`
- CI nightly: full engine suite (86 files / 468 tests) + gyms suite
- Pre-monorepo tags: `pre-monorepo` (posture-app) · `pre-monorepo` (praxis-gyms remote)
- Deploy: two Vercel projects off this repo — see `docs/deploy.md`
