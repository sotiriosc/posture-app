# Voice & Coherence Decisions (Phase 6a)

Standing rule **SR-6a** (see `bloom-plan.md` § Phase 6a): the app must speak as a
coach — specifically a Motion Care coach — not as the engine. Every user-facing
string must pass the test *"would I say this to a 55-year-old client after their
Wednesday session?"* Engineering vocabulary (rung, ladder, focus tag, corrective
consistency, pattern proficiency, gate locked, adaptive weakpoint, …) never
appears in user-facing copy. A screen that leaks engine vocabulary violates
SR-6a even if it is factually correct.

This log tracks the decisions surfaced while executing Phase 6a.

---

## Commit 1 — Plan-state coherence (SHIP-CRITICAL)

**Symptom.** A Pro user could see, on one screen, the "Pro" chip (top-right),
a "Plan: Free" pill (header), "Praxis Pro active" (account panel), and an
"Upgrade to Pro" upsell card — four surfaces disagreeing at once.

**Root cause.** Plan status was read from four independent sources: three client
`GET /api/auth/session` fetches (`AuthControls`, `useResultsBootstrap`, the
program-day page) plus a **server-side** `readServerSession()` read in
`app/results/page.tsx`. The client fetches agreed (they were racing the same
endpoint); the server render was the odd one out, so its "Plan: …" pill and the
upgrade prompt could contradict the client chips.

**Fix.** One source of truth:

- `packages/engine/src/planState.ts` — `derivePlanState(payload, { demoMode })`
  is the single pure function that turns a session payload into
  `{ plan, authEnabled, authenticated, isPro, isFreePlan }`. Both apps import it,
  so the free/pro/locked semantics are byte-identical across consumer and gyms.
  Unit-tested in `tests/unit/planStateCoherence.test.ts`.
- `apps/*/src/hooks/useUserPlan.ts` — a client hook that fetches the session
  **once** (memoised at module scope) and derives state via `derivePlanState`.
  Every plan-dependent surface reads from this hook, so they cannot disagree.
  The gyms hook is buyer-demo aware (demo ⇒ no auth, no chrome, nothing locked).
- `app/results/page.tsx` (both apps) no longer reads plan server-side. The
  "Plan: …" pill and the upsell block moved into client components
  (`PlanBadge`, `PlanUpsell`) that read `useUserPlan`. `AuthControls`,
  `useResultsBootstrap`, and the program-day page all read the same hook.

**Gyms operator-view guard.** `AuthControls` is mounted globally via `AppMenu`.
On operator routes (`/pilot`, `/enterprise`, `/gym-demo`, `/gym-admin`,
`/settings`, `/admin`) the consumer plan chip (Pro/Free) is suppressed so
consumer-plan chrome never leaks into an operator view; the log-out control
stays.

**Lint note.** Moving the async session fetch into `useUserPlan` made the
program-day component analyzable by the React Compiler, which then surfaced two
**pre-existing** `react-hooks/set-state-in-effect` findings (`setHistoryIndex`,
`setDayIndex`). Those effects are unchanged by Phase 6a; rewriting them is out of
scope for a copy/coherence pass, so they carry a scoped
`eslint-disable-next-line` with this justification rather than a behavior change.
