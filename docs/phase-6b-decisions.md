# Phase 6b — Ship-Critical Polish decisions

Guiding principle logged as **SR-6b**: every item closes a specific real-user
failure mode observed in QA, not a decorative change.

## Commit 1 — Session persistence across Stripe (SHIP-CRITICAL)

### Investigation (hypotheses from the spec, in order)

1. **Auth cookie `sameSite: "strict"` dropped on cross-origin redirect** —
   **falsified.** `serializeSessionCookie` (`packages/engine/src/serverAuth.ts`)
   already sets `sameSite: "lax"`, `httpOnly: true`, `secure` in production, and
   has since the monorepo move (`bac1508`). The cookie name (`bac_user`) matches
   between the Edge middleware and the server auth module. A `lax` cookie *is*
   sent on the top-level GET navigation back from `checkout.stripe.com`, so this
   was not the cause.

2. **Success URL hits a route that doesn't re-establish the session** — partially
   true, and the thread that led to the real cause (below). The old
   `success_url` was `${APP_URL}/results?billing=success`, i.e. straight at the
   auth-gated dashboard with no session re-issue step.

3. **`derivePlanState()` fanout over-invalidating the session** — **falsified.**
   `useUserPlan` → `/api/auth/session` only reads and refreshes; there is no
   `signOut`/cookie-clear side effect anywhere in the plan-refresh path. The
   Stripe webhook updates the user in place by stable id, so the token's `sub`
   keeps resolving.

### Root cause (found via the Playwright repro)

Two real defects, both presenting as "logged out / still shows Free" after the
Stripe return:

- **Stale plan in the token.** The session token encodes the plan at issue time.
  After an upgrade the middleware still reads `plan: "free"` from the token until
  something calls `/api/auth/session`, so a just-upgraded user can be paywalled.
- **Host-normalised redirect drops the host-scoped cookie.** An absolute redirect
  built from the request URL/host can resolve to a *different* host than the
  browser used (e.g. `localhost` vs `127.0.0.1` locally; canonical-host / proxy
  normalisation in production). The auth cookie is host-scoped, so the browser
  does not send it to the new host → the dashboard renders signed-out. This was
  reproduced deterministically in the Playwright spec (session endpoint on
  `127.0.0.1` reported authenticated Pro while the navigated page sat on
  `localhost` with no cookie).

### Fix

- New Node route `GET /api/billing/return` in **both** apps. It re-reads the
  session from the DB (fresh plan), re-issues the cookie with the current plan
  and a fresh expiry, then redirects to `/results?billing=success` using a
  **relative** `Location` (status 303) so the browser resolves it against the
  exact host it already holds the cookie for.
- `packages/engine/src/stripeServer.ts`: `success_url` now points at
  `${APP_URL}/api/billing/return?billing=success` (shared by both apps).

### Acceptance test

`apps/consumer/tests/e2e/stripeSessionPersistence.spec.ts` — logs in a
file-backed user as `free`, flips the stored plan to `pro` (simulating the
webhook), follows the Stripe return, and asserts the user is still authenticated
and the re-issued cookie token decodes to `pro`. **Fails against current main**
(no return route → the navigation 404s / stays signed-out); **passes after the
fix.** Verified both directions locally.

## Commit 4 — Session options: 5 → 3 (properly)

This closes **DEC-6a-1**, the item deferred out of the Phase 6a copy pass because
it required an engine change rather than a rename.

### Problem

The session start screen offered five practice options — `full`, `steady`,
`reduced`, `simplified`, `recovery`. In QA they read as redundant: `full` vs
`steady` were indistinguishable to a user, and `reduced` vs `simplified` both
"do less" with no clear rule for which. Five choices for "how hard is today?" is
decision paralysis, not control.

### Decision

Collapse to a canonical three, each with a distinct, honest meaning:

- **Full** — the session exactly as programmed (absorbs old `full` + `steady`).
- **Lighter** — *same movement patterns*, less work. Each main slot drops one
  working set (min 1). Warmup/corrective prep is preserved (absorbs old
  `reduced` + `simplified`).
- **Recovery** — no main heavy work; warmup, corrective, mobility and cooldown
  only (unchanged in spirit).

`SessionPracticeOption["mode"]` in `packages/engine/src/types.ts` is now the
three-member union. `sessionPracticeOptions.ts` derives exactly these three and
`selectSessionPracticeItems` implements the new "lighter" set-trimming.

### Migration on read

Historical `SessionRecord`s persist `selectedPracticeMode` as one of the old
five. Rather than a destructive data migration, we normalise on read:
`normalizePracticeMode()` maps `steady → full`, `reduced|simplified → lighter`,
and passes `full|lighter|recovery` through (default `full`). Every engine read
path (`selectSessionPracticeItems`, `formatPracticeModeSessionNote`) runs values
through it, so old logs resolve cleanly and analytics stay coherent. The
`SessionClient` UI state is already the three-member union and coerces any
non-matching selection back to `full`, so no legacy value reaches the UI.

### Anchor coverage

`packages/engine/tests/unit/sessionPracticeOptions.test.ts`:
- exactly three options offered, in `[full, lighter, recovery]` order;
- **`lighter` is demonstrably lighter** — on both a synthetic day and a *real
  generated persona program*, total main-slot work volume under `lighter` is
  strictly less than under `full`, while the set of main movement patterns is
  identical (proves "same patterns, less work", not "fewer exercises");
- `recovery` excludes main heavy work;
- legacy `steady/reduced/simplified` values migrate to `full/lighter/lighter`
  and resolve to the same selected items as their canonical mode.

All 818 engine unit tests remain green; golden anchors unchanged (program
generation was not touched — only per-session option derivation).

## Commit 5 — Telemetry panel move to /dev-qa

The "Telemetry dashboard (local)" panel was internal-facing — the same category
as the Real-device QA panel relocated in PR #25. It has no place in user
Settings. Extracted verbatim into `components/dev/TelemetryPanel.tsx` in both
apps and rendered on the existing `/dev-qa` route (gated `NODE_ENV ===
"development"`, `notFound()` in production), alongside `DeviceQaPanel`. Removed
the panel, its `dropoffEvents` state, its loader effect and its summary from
`app/settings/page.tsx` in both apps.

No functional change. One lint nuance: the extracted component is small enough
that the React Compiler no longer bails out of it, so `react-hooks/purity`
correctly flags `Date.now()` in a `useMemo` render path (it was silently
tolerated inside the large Settings component). Fixed properly rather than
suppressed: the summary is now a pure `computeTelemetrySummary(events, now)`
called from the refresh handler / mount effect and stored in state, so no
impure call happens during render.

## Commit 6 — Seed hygiene and honest reset

### 6.a — dev-seed fully wipes on every persona load

Root cause of the QA leak (false "ready for next phase"): the reset used by
dev-seed (`resetAllAppData`) trusted a hard-coded allowlist of localStorage keys
and IndexedDB database names, and its `deleteDatabase` resolved on `onblocked`
without actually deleting when a connection was open. Seeding persona B could
therefore leave persona A's data behind.

Fix: a new `eraseAllLocalData()` engine util that (1) closes the cached
IndexedDB connection first (new `closeDb()` in `logStore`) so deletes never
block, (2) enumerates **every** database in the origin via
`indexedDB.databases()` (falling back to the known names) and deletes them all,
and (3) clears all of localStorage/sessionStorage. It logs a dev-console line
(`[praxis] erase-all-local-data: …`) so QA can confirm the wipe and spot leaks.
Both apps' dev-seed now call `eraseAllLocalData()` before writing any persona
and log `[dev-seed] wiping all local state before seeding "<id>"`.

`resetAllAppData` is deliberately left intact (the surgical "Reset app data"
path and its many internal callers only want to clear the active plan).

### 6.b — "Erase all local data" in Settings

A second, more severe Danger-zone option below "Reset app data". Exact copy per
spec, gated by a confirmation input that must equal `ERASE` (matching-text
comparison; the button is disabled otherwise). On confirm it runs the same
`eraseAllLocalData()` full wipe, then returns home. Added to both apps.

### Playwright coverage

- `apps/consumer/tests/e2e/devSeedWipesState.spec.ts` — seeds the climber (A),
  asserts a program exists in IndexedDB, seeds the empty persona (B), asserts
  A's program and app-state key are gone.
- `apps/consumer/tests/e2e/eraseAllLocalDataConfirmation.spec.ts` — seeds data,
  opens `/settings` (admin cookie set), asserts the confirm button stays
  disabled until `ERASE` is typed exactly, confirms, and asserts the device is
  empty afterward.

`/settings` is admin-gated, so the Playwright webServer now runs with
`ADMIN_ACCESS_KEY` and the erase spec sets the matching `bac_admin` cookie. Also
added an engine unit test proving `eraseAllLocalData` deletes an
enumeration-only database the old allowlist would have missed.
