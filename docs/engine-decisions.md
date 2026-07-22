# Engine Decisions Log

Engine-behavior decisions live here. Catalog decisions (ladder, exercise metadata)
live in `docs/ladder-decisions.md`.

---

## Phase 2c — Red to Green (2026-07-12)

### ED-2c.1 — Slot Degradation Contract

**Decision:** When equipment + pain filtering empties any main slot during Back+Chest
3-day generation, the engine must degrade in strict order instead of silently dropping
the slot.

**Four stages (order is mandatory):**

| Stage | Name | Action |
|-------|------|--------|
| (a) | Tier-cap relax | Retry the same slot kind with the tier cap removed; accept any compound exercise of the same pattern that the user can access (experience-gated) |
| (b) | Ladder-aware substitution | Accept any exercise from the same movement pattern at any rung the user can access |
| (c) | Corrective fallback | Pull in a `scap_health` / `hip_health` / `knee_health` / `core_health` exercise; the slot is relabeled corrective |
| (d) | Traced drop | Remove the slot from the routine, write a `degradationReason: "dropped"` trace entry, AND append a user-visible sentence to `ProgramDay.coachNotes` |

**Zero silent drops.** Every slot must be filled, degraded-with-trace, or dropped-with-trace.

**Implementation files:**
- `src/lib/types.ts` — added `ProgramDay.coachNotes?: string[]` and `ProgramSelectionDecisionTrace.degradationReason`
- `src/lib/program.ts` — Unique ID Guard (`repairedMainIdsWithUniqueIdGuard`): replaced the `nextIds[slotIndex] = null` silent drop with stages (a)→(b/c)→(d). Extra Slot Governor (`repairedMainIdsWithExtraSlotRules`): added `selectedExerciseIdCounts` guard to `emergencyReplacement` and `anchorFallback` to prevent creating duplicates that the Unique ID Guard would have to null out.

**Root cause of `programFuzz` i=29 failure (Advanced / 3-day / Back+Chest / dumbbells+none / upper-back+shoulders+knees / phaseIndex=1):**
The tier ceiling resolved to 1 due to high pain severity. The extra slot governor's `emergencyReplacement` lacked a duplicate guard, selecting `prone-elbow-row` (already at slot 3), creating a duplicate. The Unique ID Guard caught the duplicate but found no valid replacement (all tier-1 pull exercises already assigned), and silently set `nextIds[4] = null`. Fix: duplicate guard in extra slot governor prevents the cascade entirely.

**Determinism guarantee:** All fallback sorts include a seeded tiebreaker via `seededUniqueGuardScore(slotIndex, exerciseId)` keyed on `context.selectionSeed`.

---

### ED-2c.2 — programFuzz Contract Assertion Update

**Decision:** `tests/unit/programFuzz.test.ts` now asserts the degradation contract:

- Fewer mains than expected → require `day.coachNotes.length >= shortfall` (traced drop)
- Exactly expected → pass
- More than expected → fail (would mean phantom extras)

**New test:** `tests/unit/slotDegradationContract.test.ts` covers all four degradation stages plus the exact i=29 fuzz persona as a named regression guard.

---

### ED-2c.3 — Contraindication Audit: "shoulders" vs Row-Family (report only)

**Status:** Report for Sotirios's ruling — NO TAG CHANGES in this phase.

**Summary:** User-reported "shoulders" pain excludes the majority of horizontal-pull main exercises. All 8 exercises that remain *available* under "shoulders" pain are band-track or bodyweight-elbow-drive exercises. The question is whether several excluded exercises are over-broad.

**Excluded by `"shoulders"` pain — arguably safe entries:**

| Exercise | Equipment | Tier | Why arguably safe | Current tag |
|----------|-----------|------|-------------------|-------------|
| `dumbbell-chest-supported-row` | dumbbells + bench | 2 | Chest support eliminates shoulder stabilization demand; commonly prescribed in shoulder rehab | `["shoulders", "elbows", "neck"]` |
| `face-pull` / `band-face-pull-high-anchor` / `cable-face-pull` / `suspension-face-pull` | bands / cables | 1–n/a | Face pulls are a shoulder health exercise; prescribed for rotator cuff rehab | `["shoulders", "elbows", "neck"]` |
| `back-widow` | none | n/a | Supine gravity-unloaded scapular retraction; no shoulder impingement risk | `["shoulders", "elbows", "neck"]` |
| `prone-swimmer` | none | n/a | Prone, no overhead or impingement position | `["shoulders", "elbows", "neck"]` |
| `reverse-snow-angel` | none | n/a | Prone, scapular control only | `["shoulders", "elbows", "neck"]` |
| `suspension-row-incline` | pullup_bar + bands | 1 | Upright body angle reduces shoulder demand; used in shoulder rehab | `["shoulders", "elbows", "neck"]` |
| `machine-seated-row` | machines | 1 | Seated back support, neutral grip; often safe for non-acute shoulder issues | `["shoulders", "elbows", "neck"]` |
| `banded-rows-seated` | bands | 1 | Similar profile to machine seated row | `["shoulders", "elbows", "neck"]` |

**Excluded and clearly appropriate:**

| Exercise | Rationale |
|----------|-----------|
| `dumbbell-rows` / `single-arm-dumbbell-row` / `dumbbell-row-iso-hold` | Unsupported, shoulder stabilization required under load |
| `barbell-bent-over-row` / `pendlay-row` | High shoulder and low-back demand |
| `suspension-archer-row` / `suspension-one-arm-row-assisted` / `suspension-row-parallel` / `suspension-row-feet-elevated` | Horizontal load against bodyweight, elevated shoulder demand |
| `machine-rear-delt-row` / `machine-reverse-pec-deck` / `dumbbell-rear-delt-fly` / `cable-rear-delt-fly` | External rotation/fly under shoulder pain = appropriate restriction |
| `prone-y-raise` | Overhead component at end range |
| `cable-external-rotation*` / `band-external-rotation` | These are scap_health; shoulder pain = appropriate restriction for external rotation under load |

**Currently available under "shoulders" pain:**

| Exercise | Equipment | Family |
|----------|-----------|--------|
| `split-stance-row` / `band-row` / `single-arm-band-row` / `band-row-iso-hold` | bands | band_row |
| `suspension-row-upright` | pullup_bar + bands | — |
| `cable-seated-row` | cables | cable_row |
| `supine-elbow-drive-row` | none | none_row |
| `prone-elbow-row` | none | none_row |

**Recommended next action for Sotirios:**

> For each "arguably safe" entry, should we downgrade from `"shoulders"` → `"acute shoulders"` (making it available for non-acute shoulder pain)?
>
> The highest-value change would be `dumbbell-chest-supported-row` and `face-pull` family: both are actively used in shoulder rehab and their current exclusion is clinically over-broad for "general shoulder pain."
> `back-widow` / `prone-swimmer` / `reverse-snow-angel` are also good candidates as they involve no shoulder joint loading.

---

### ED-2c.4 — April Test Verdicts

**Test: `tests/unit/resultsOperationalReadiness.test.ts`**
- First-failing commit: `67a8c45`
- Verdict: **Stale test (fixed)**
- Root cause: `canAdvancePhase` uses `new Date().toISOString()` as its `nowIso` default. Without freezing the system clock, the live date made `daysSincePhaseStart` >> `minDays` (30), causing the days-gate to pass and the UI to show "Ready to advance" instead of "Gate locked."
- Fix: Added `vi.useFakeTimers({ toFake: ["Date"] })` + `vi.setSystemTime(new Date("2026-04-12T12:00:00.000Z"))` scoped to the "backfills phase workout progress" test, restoring clocks in `finally`.

**Test: `tests/unit/sessionFeedbackInfluence.test.ts` — "failed exercise gets deprioritized"**
- First-failing commit: `6f367b0`
- Verdict: **Code bug — quarantined (Phase 1 scope)**
- Root cause: The feedback penalty is correctly applied at selection-scoring time, but the Back+Chest repair pipeline (`repairBackChestMainIntelligence`) reinserts the penalized exercise as an anchor when no other candidate is found, overriding the feedback-aware selection. The repair helpers (`selectBackChestAnchorExercise` et al.) do not receive `feedbackSummaryByExercise`.
- Unquarantine condition: Repair pipeline propagates `feedbackSummaryByExercise` into all `selectBackChest*` helpers so a penalized exercise cannot be chosen as a repair anchor.

**Test: `tests/unit/sessionFeedbackSubstitution.test.ts` — "next week uses recent logs..."**
- First-failing commit: `86f7da7`
- Verdict: **Code bug — quarantined (Phase 1 scope)**
- Root cause: Same as `sessionFeedbackInfluence`. `recentLogs` / pain signals from session logs are not propagated into the repair pipeline, so the repair loop reinstates the penalized exercise.
- Unquarantine condition: Same as above.

---

## Standing Rules (engine)

- **SE-1:** The slot degradation contract is permanent. Zero silent drops is a hard invariant. Any future generation path that can produce an empty slot must implement the four-stage cascade.
- **SE-2:** All fallback sorts within the Unique ID Guard must include a seeded tiebreaker (keyed on `context.selectionSeed`) to guarantee determinism under repeated calls.
- **SE-3:** `ProgramDay.coachNotes` is the user-visible surface for traced drops. Keep messages jargon-free.

---

## Phase 3.0 — Feedback Propagation Fix (2026-07-21)

### ED-3.0.1 — feedbackSummaryByExercise Hard-Block Audit

**Context:** Two quarantined tests (`sessionFeedbackInfluence`, `sessionFeedbackSubstitution`)
failed because the engine was selecting exercises with `pain === "severe"` OR
`difficulty === "failed"` despite feedback data being present. Root-cause bisection showed
that multiple candidate-iteration paths bypassed `feedbackSummaryByExercise` entirely.

**Threshold ratified by Sotirios (2026-07-21):** An exercise is *hard-blocked* from
selection when its OWN entry in `feedbackSummaryByExercise` has `pain === "severe"` OR
`difficulty === "failed"`. Related exercises (swap options, history neighbours) are NOT
hard-blocked; they receive existing score penalties via `getFeedbackSelectionScoreBonus`
and `shouldAvoidFeedbackRiskCandidate`.

---

#### FIX-NOW sites (applied in this commit)

| Function | File | Line (approx) | Why it mattered |
|---|---|---|---|
| `pickFirstEligibleId` | `program.ts` | ~28096 | Main initial-selection gateway — introduced `isDirectlyFeedbackBlocked` filter |
| `findBestMainCandidateForRequiredPattern` | `program.ts` | ~4368 | Contract-repair candidate picker used by `repairDayToMeetSpec` |
| `findReplacementExerciseForRule` | `program.ts` | ~2887 | `contract_repair` replacement, iterates ALL exercises with `rankSubstitutionCandidates` |
| `ensureDayHasDumbbellMain` | `program.ts` | ~4895 | `day_intelligence_repair` — guarantees ≥1 dumbbell main; prefers `dumbbell-rows` for pull lane |
| `findFinalRoleLegalityReplacement` | `program.ts` | ~19685 | `legality_repair` — integrity-pass replacement when an exercise's slot is illegal |
| `pickFirstBackChestCandidateByIds` | `program.ts` | ~9721 | Back+Chest anchor / fallback selection; added `decisionTrace` param for caller-level skip tracing |
| `repairBackChestMainIntelligence` | `program.ts` | ~12540 | Pre-populates `usedIds` + `feedbackRepairTrace` (→ `degradationNotes`) for all Back+Chest calls |
| `pickDistinctReplacement` | `program.ts` | ~1952 | Uniqueness-swap path; has "last-resort relaxed pool" that previously ignored feedback |
| `pickPaddingMain` (inside `applyFinalCountCompatibility`) | `program.ts` | ~2092 | Count-compatibility padding; could pad with a penalized exercise |

**Trace mechanism:** The `repairBackChestMainIntelligence` function emits strings of the
form `"skipped anchor candidate <id>: severe pain flag"` or `"skipped anchor candidate <id>:
failure flag"` into `ProgramDay.degradationNotes` via the `feedbackRepairTrace` array.
The `pickFirstBackChestCandidateByIds` function accepts an optional `decisionTrace` array
and appends to it when a candidate is hard-blocked.

---

#### TICKET-FOR-LATER sites (logged, not fixed in this commit)

| Function | File | Risk level | Reason deferred |
|---|---|---|---|
| `getBackChestEligibleAnchorCandidates` | `program.ts` | LOW | Returns raw candidates; callers filter by `usedIds` which is pre-populated with penalized exercises in `repairBackChestMainIntelligence`. Effectively guarded. Ticket: add direct guard in Phase 3W. |
| `hasUnusedTrueHingeReplacementMemo` / `hasUnusedStrongPullReplacementMemo` / `hasUnusedTrueVerticalPushReplacementMemo` | `program.ts` | NONE | Boolean availability probes only — no exercise is selected, no entry is written to routine. |
| `exercises.some()` calls in `hasEligibleFeedbackAlternative` | `program.ts` | NONE | Probe function — determines whether a penalty should apply, never selects an exercise. |
| `lowerSlotPurityRescueIds` hardcoded arrays | `program.ts` | LOW | Only contains specific lower-body exercises (squat/hinge families); none are horizontal-pull penalized candidates. |
| `applyFinalCountCompatibility` dedup inline `exercises.find` | `program.ts` | LOW | Fires only when a slot already contains a duplicate; with hard-blocks applied upstream the dedup path is unlikely to encounter a penalized exercise. Phase 3W. |


---

## Phase 3.0-refinement — Deferred Guard (2026-07-21)

### ED-3.0.2 — Replace Pain/Difficulty Hard-Block with Deferred Flag

**Context:** PR #14 delivered nine hard-block paths that silently prevented exercises with
`pain === "severe"` OR `difficulty === "failed"` from being selected or repair-inserted.
While architecturally correct, this semantic is wrong for the product philosophy: silent
skips train users toward easy work and remove the coaching moment.

**Decision ratified by Sotirios (2026-07-21):** Replace the hard-block condition with
`deferred === true`.

**Semantics:**
- `deferred: true` is set **exclusively** by user response to the Phase 3.2
  Sacrifice/Test/Modify next-session prompt.  The engine never sets it automatically.
- At **initial selection** (`pickFirstEligibleId`): hard-block is removed entirely.
  Feedback-flagged exercises are re-scored with the existing heavy penalty
  (`getFeedbackSelectionScoreBonus`, `shouldAvoidFeedbackRiskCandidate`) but remain in
  the pool.  They will not win selection unless no penalised alternatives exist.
- At **repair-insertion paths** (eight functions): hard-block condition changes from
  `pain === "severe" || difficulty === "failed"` to `deferred === true`.  A deferred
  exercise cannot be silently re-inserted by any repair pass.

**Type change:** `ExerciseFeedbackSummary.deferred?: boolean` added to `logStore.ts`.

**Until Phase 3.2 ships:** Tests that must assert "penalised exercise doesn't come back"
set `deferred: true` explicitly in their fixtures.  Real user sessions without a Phase 3.2
response will not have `deferred` set; those exercises are score-penalised at initial
selection but not hard-blocked from repair paths.  This is intentional — the engine offers
the exercise again so the user has the opportunity to engage with the Phase 3.2 prompt.

**Phase 3.2 preview (Sacrifice / Test / Modify):**
- **Sacrifice** — user explicitly ends the exercise for this phase; tags it for
  phase-transition retest; sets `deferred: true`; feeds Phase 3.5 gating signals.
- **Test** — keeps the exercise in but auto-sacrifices on second flag.
- **Modify** — regresses one rung on the exercise's ladder.

**Eight repair paths changed** (guard: `deferred === true` instead of `pain/difficulty`):

| Function | Change |
|---|---|
| `pickFirstEligibleId` | **Hard-block removed** — score-based avoidance only |
| `pickDistinctReplacement` (`isDeferredForSection`) | `deferred === true` |
| `pickPaddingMain` | `deferred === true` |
| `findReplacementExerciseForRule` | `deferred === true` |
| `findBestMainCandidateForRequiredPattern` | `deferred === true` |
| `ensureDayHasDumbbellMain` | `deferred === true` |
| `pickFirstBackChestCandidateByIds` | `deferred === true`; trace: "deferred by user" |
| `repairBackChestMainIntelligence` | `deferred === true`; trace: "deferred by user" |
| `findFinalRoleLegalityReplacement` | `deferred === true` |

---

## Phase 5 — Undeniable Results Screen (2026-07-22)

### ED-5.0 — Import Type Safety Rule

**Decision:** Add `@typescript-eslint/no-import-type-side-effects` and
`@typescript-eslint/consistent-type-imports` to `eslint.config.mjs` as hard errors.

**Rationale:** Phase 4 introduced a `ReferenceError: shouldPromptRetest is not defined`
regression because a runtime function was placed inside an `import type { ... }` block
in `ResultsRoutine.tsx`. TypeScript completely erases `import type` at emit; any runtime
value in that block becomes `undefined` at runtime. The bug passed type-checking because
TypeScript does not warn when a value is inadvertently put in `import type` unless
`verbatimModuleSyntax: true` is enabled. Adding `verbatimModuleSyntax` to the root
`tsconfig.base.json` conflicted with `"module": "esnext"` + `moduleResolution: "bundler"`.

**Resolution:** ESLint rules are the correct enforcement layer here:
- `@typescript-eslint/no-import-type-side-effects` — prevents side-effectful imports
  from being marked type-only.
- `@typescript-eslint/consistent-type-imports` — enforces that every type-only import
  carries the `type` modifier and every value import does not.

Together these create a two-sided fence: a misclassified value in `import type` triggers
the `consistent-type-imports` rule before reaching the test suite.

**Deferred:** MoveNet Thunder upgrade (flagged in Phase 4 spec). The confidence gate
improvement alone is meaningful. Thunder upgrade deferred to Phase 6 when deliberate
single-capture flow is more stable. Log: `~2x accuracy, ~4x latency (50ms → 200ms),
burst-of-frames averaging (3 frames). Trade-off acceptable for single-capture context.`

### ED-6.8 — Analytics: Plausible (Path A, ratified 2026-07-22)

**Decision:** Install Plausible as the product analytics layer for both apps,
via `next-plausible`. Path A (privacy-respecting, cookieless) was ratified by
Sotirios over Path B (self-hosted PostHog) and Path C (no analytics at launch).

**Rationale:**
- Cookieless by design — sidesteps the EU/UK cookie-consent banner for this
  component (no consent gate required for aggregate, non-identifying counts).
- EU-hosted, aggregate-only. No personal tracking, no cross-site profiles, no
  third-party ad networks. This is honest to the disclosure already written in
  both privacy policies (§6.2).
- Lightweight script, no runtime cost to the engine, zero engine coupling.

**Implementation:**
- `next-plausible@^4` added to root `dependencies` (npm workspaces, hoisted).
- `apps/{consumer,gyms}/src/components/Analytics.tsx` — server-safe wrapper that
  renders `PlausibleProvider` only when `NEXT_PUBLIC_PLAUSIBLE_SRC` (the
  site-specific script URL from the Plausible dashboard) is set. Both root
  layouts wrap their body content in `<Analytics>`.
- Guarded on two fronts so nothing loads outside production with a real site:
  (1) no `src` env → no script at all (dev, test, preview stay clean);
  (2) next-plausible's `enabled` default restricts injection to production.
  `init.captureOnLocalhost` is left false.

**Sotirios's remaining step (infra, out of code scope):** create the Plausible
site, then set `NEXT_PUBLIC_PLAUSIBLE_SRC` in the Vercel env for each project.
No code change is needed to turn analytics on.

