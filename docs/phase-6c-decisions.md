# Phase 6c — Mobile Audit + Deploy Fix + Layout Bugs decisions

Guiding principle logged as **SR-6c**: Praxis is phone-first for consumer users;
every consumer-facing surface must work well on phone before being called done.
Gyms operator UI stays desktop-first and does not get the same mobile treatment.

## Commit 1 — Turbopack build fix (SHIP-BLOCKING)

### The spec's suggested fix was tried and falsified

The spec proposed replacing the deep import with the package's public
`createDetector` API:

```ts
const poseDetection = await import("@tensorflow-models/pose-detection");
const detector = await poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING, enableSmoothing: true }
);
```

This matches the library's documented public usage exactly (confirmed against
`dist/index.d.ts` for the pinned `2.1.3`: `createDetector`, `SupportedModels`,
and `movenet.modelType.SINGLEPOSE_LIGHTNING` are all real, exported symbols).
**It was applied and verified against a real `next build` — and it broke the
build worse than the original bug:**

```
The export Pose was not found in module
[project]/node_modules/@mediapipe/pose/pose.js [app-ssr] (ecmascript).
The module has no exports at all.
```

Root cause: `dist/create_detector.js` unconditionally `require()`s **all four**
backend modules at module load time, regardless of which model you ask for:

```js
var detector_1 = require("./blazepose_mediapipe/detector"); // → @mediapipe/pose
var detector_2 = require("./blazepose_tfjs/detector");
var detector_3 = require("./movenet/detector");
var detector_4 = require("./posenet/detector");
```

`@mediapipe/pose`'s installed browser bundle (`0.5.1675469404`) is a
self-executing script with no real ES module exports — any bundler that
statically analyzes `createDetector`'s import graph (Turbopack does, for both
the client chunk and the SSR reference during the server component graph walk)
hits this dead end. This is true for **any** call to `createDetector`,
irrespective of the model requested — MoveNet-only usage still pulls in the
broken BlazePose/mediapipe backend as a side effect of the package's structure.
Falsified; reverted.

### Actual fix

`dist/movenet/detector.js` (the module the original deep import already
targeted) has **zero** dependency on `@mediapipe/pose` — only
`@tensorflow/tfjs-{core,converter}` and internal calculator/shared modules
(verified by grepping its `require()` calls). The original deep import was not
"an accident" so much as the only currently-available way to load MoveNet
without the mediapipe backend, given how `create_detector.js` is structured.

The fix keeps that same scoped import but adds the explicit `.js` extension:

```ts
const movenet = await import(
  "@tensorflow-models/pose-detection/dist/movenet/detector.js"
);
```

This targets the specific root cause named in the spec ("Turbopack enforces
exports strictly; Webpack was lenient") without reintroducing the
`@mediapipe/pose` breakage: Turbopack's ESM-style resolver requires
subpath imports into packages with no `"exports"` map to be **fully
specified** (explicit extension); Webpack's legacy CJS-style extension-probing
resolved the extensionless path leniently. Behavior is otherwise byte-for-byte
identical — same target file, same `modelType`, same config.

### Honest caveat

Locally (npm-flat install, `2.1.3` exactly as pinned in `package-lock.json`),
the **original, unmodified, extensionless** deep import also built successfully
under `next build` for both apps with a cold `.next` cache — the exact reported
Vercel error did not reproduce in this environment. Given this repo's history of
Vercel-specific module-resolution failures that don't reproduce locally (three
prior fixes this project: Root Directory, missing `next` in per-app
`package.json`s, missing `pg`/tfjs deps in `packages/engine/package.json`), the
most likely explanation is a monorepo-install/hoisting difference between local
npm and Vercel's build sandbox, not a local misconfiguration on this machine.
The extension fix is applied as a real, defensible hardening regardless — it
addresses the literal root-cause mechanism described in the spec — but Sotirios
should confirm the next Vercel deploy of `apps/gyms` succeeds, since this
exact failure mode couldn't be reproduced here to prove the fix beyond local
`next build` passing for both apps.

Verified: `npm run build --workspace=apps/consumer` and
`--workspace=apps/gyms` both succeed from a cold `.next` cache. No other line
in `poseAnalyzer.ts` was touched.

## Commit 2 — Card-open background jump

### Audit

Grepped both apps for every open/close animation candidate named in the spec:

- `apps/consumer/src/components/dashboard/ExpandableSection.tsx` (the
  results-dashboard card sections, e.g. "System adjustments", "How this
  works") — **not the bug**. It already measures `scrollHeight` via a
  `ResizeObserver` and animates `max-height` to that measured value (not
  `height: auto`, not an unbounded ceiling). This is a legitimate animated
  expand and was left alone.
- The session-options card on session start (`SessionClient.tsx`, "Today's
  options") — **not a collapsible**. All three practice-mode buttons are
  always rendered; there's nothing to expand/collapse. No CLS bug here to fix.
- Settings — **no collapsibles exist there yet.** The per-section-group
  collapse behavior described in Commit 4 (Interface/Notifications/Data/
  Account) hasn't been built. Nothing to fix in Commit 2; tracked as new
  work in Commit 4.
- **Found the real bug**: three native `<details>`/`<summary>` elements,
  which insert/remove their content in a single frame with zero transition —
  the browser has no animated equivalent for native disclosure open/close.
  - `RoutineItemCoachingDetails.tsx` (consumer + gyms) — "Coach notes",
    rendered once per exercise, so this fires repeatedly down a routine list.
  - `ResultsRoutine.tsx` (consumer + gyms) — "View details: Day N plan
    reasoning".
  - `results-view/ResultsView.tsx` (consumer only; gyms has no equivalent
    view) — "N advancements logged" per ladder rung card.

### Fix

Built one shared `AnimatedDisclosure` component (`components/ui/`, mirrored
in both apps per this repo's existing per-app UI-component convention) and
swapped it in at all five call sites (2 consumer + 2 gyms + 1 consumer-only).
It uses the `grid-template-rows: 0fr -> 1fr` technique named in the spec
rather than `max-height`: the browser's own layout of the content drives the
animated row-track size, so — unlike `ExpandableSection`'s approach — it
needs no `ResizeObserver`/JS measurement and can't rely on a wrong or stale
`scrollHeight` for arbitrary content. `aria-expanded`/`aria-controls` replace
native `<details>` semantics for the same accessibility contract. The summary
prop accepts a render function `(open: boolean) => ReactNode` so callers can
still swap a `+`/`-` glyph exactly like the old `group-open:` Tailwind variant
did.

### Verification

- `packages/engine/tests/unit/routineItemCoachingDetails.test.ts` updated:
  the removed native-`<details>` assertion (`hasAttribute("open")`) is
  replaced with the equivalent `aria-expanded` check.
- New `apps/consumer/tests/e2e/cardOpenNoLayoutShift.spec.ts`: seeds the
  climber persona via `/dev-seed` (no auth needed), opens the "N
  advancements logged" disclosure, and samples its rendered height across
  animation frames immediately after the click.
  - Chrome's real Layout Instability API score for this specific panel
    turns out to be near-zero regardless of animation — the shifted region
    is small relative to the test viewport, so `impact fraction * distance
    fraction` stays under 0.1 even for an un-animated instant jump. It can't
    discriminate a fix from a regression on this element and was dropped as
    the primary assertion after confirming this empirically.
  - Instead the test asserts the disclosure's height on its first animation
    frame is well below its final height (proxy for "opens gradually, not
    in one jump") — confirmed this correctly **fails** against the
    pre-fix native `<details>` (no `aria-controls`, so the very first
    assertion in the new test throws) before being confirmed to **pass**
    against the fix.
- Full `next build` reverified for both apps after all Commit 2 changes.
- Full engine unit suite: 819/819 passing. Lint clean on both apps (two
  pre-existing unrelated warnings in `apps/consumer`, not touched by this
  commit).

## Commit 3 — Missing routes on deployed site

### Investigation

- `grep`'d both apps for `/faq` and `/settings`: **no FAQ route exists at
  all**, gated or otherwise — real, unambiguous gap.
- `/settings` **is** a real route and **does** have working content (the
  admin Danger Zone / movement-profile-edit panel from Phase 6b). It is
  intentionally admin-gated in `middleware.ts` (`ADMIN_ACCESS_KEY` +
  `bac_admin` cookie) — redirects to `/` for everyone else. That's by
  design, not a bug.
- The user-facing settings page users actually want
  (`/account/settings` — export data, reset progress, erase local data)
  **did** have a nav entry already — but labeled **"Data Settings,"** not
  "Settings." That's the likely cause of "no visible way to reach
  Settings": it doesn't read as "Settings" to someone looking for it.
- No `robots.ts`/`sitemap.ts` exists in either app, so nothing there is
  blocking crawlers or routes.

### Fix

- Renamed the `/account/settings` nav entry from "Data Settings" to
  "Settings" in both apps (`AppMenuClient.tsx`). No collision with the
  admin entry, which is separately and clearly labeled "Admin Settings"
  and only ever shown to admins.
- Built a real `/faq` page in both apps (`app/faq/page.tsx`, styled to match
  each app's existing static pages like `/privacy`/`/terms`) that
  consolidates the existing per-page onboarding guides
  (`onboardingConfig.ts` — the single source of truth for "how this screen
  works") into one page. No new copy was invented; this only makes
  existing guide content reachable without visiting every screen first, per
  the spec's suggested fallback ("If FAQ was never built and is instead
  handled by guide cards, add copy to the menu that ... opens the
  appropriate guide card"). A dedicated static page was chosen over
  wiring a nav click to reopen a specific page's `OnboardingInfoButton`
  modal, since the guide content is inherently page-scoped and there's no
  single "current page" context from a global nav menu.
  - Added `{ href: "/faq", label: "Help & FAQ" }` to the nav in both apps
    (including gyms' buyer-demo-mode nav variant), unconditionally — no
    login required, matching that it's pre-signup-relevant content. Not
    added to either app's `middleware.ts` auth matcher, so it isn't gated.

### Verification

- New `apps/consumer/tests/e2e/navRoutesReachable.spec.ts` (2 tests) and
  `apps/gyms/tests/e2e/navRoutesReachable.spec.ts` (1 test): open the menu,
  assert "Settings" (not "Admin Settings") links to `/account/settings`,
  assert "Help & FAQ" links to and renders `/faq`, and (consumer) confirm
  FAQ is reachable while logged out.
- `next build` clean for both apps with the new `/faq` route present in the
  build manifest.
- Lint clean on both apps (same two pre-existing warnings as Commit 2, still
  untouched).
