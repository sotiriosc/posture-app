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
