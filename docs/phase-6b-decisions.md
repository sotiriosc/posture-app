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
