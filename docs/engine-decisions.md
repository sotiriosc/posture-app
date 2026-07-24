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

## Phase 6e — Ship-Critical Fixes (2026-07-24)

### ED-6e.1 — Photo isolation: "Option A refined" (ratified by Sotirios)

**Decision:** Photos remain device-local, namespaced by `userId` in
`bodycoach-photos` IndexedDB. Namespacing IS the isolation mechanism — there
is no automatic wipe of photos on logout or account switch. Photos persist
on the device until an explicit "Erase all local data," even across
login/logout cycles for the same account.

**How this differs from the bloom-plan spec's "Option A":** the spec text
said photos are "wiped on explicit logout." Sotirios refined this: photos
should behave like any other durable, account-owned asset — surviving
logout the way they'd survive closing the browser — rather than being
destroyed by the everyday act of signing out. Everything else local
(session logs, program state, phase gating) is still fully cleared on
login/logout/account-switch, since that state is genuinely transient and
its leakage across accounts was the reported bug.

**Rationale:** A user who logs out and back in on their own device
shouldn't lose their posture photos — that would be a data-loss surprise,
not a privacy win. Namespacing already fully closes the cross-account leak
(account B can never read account A's photos on a shared device); deleting
on top of that would only punish the common case (same person, same
device, re-authenticating) to guard against a rare one (a truly shared
device where the previous account never explicitly signed out AND never
wanted their photos to persist).

**Privacy copy:** `/privacy` updated to: "Photos are stored on your device,
locked to your account, and never sent to our servers." Plus a line
clarifying that a different account on the same device cannot see them, and
that they persist until the explicit "Erase all local data" action.

**Implementation:** `packages/engine/src/photoStore.ts` namespaces every
IndexedDB record by `${userId}:${slot}` (default namespace `"guest"` for
signed-out/no-auth use) and filters `list()` to the active namespace only.
`packages/engine/src/accountIsolation.ts` (`syncLocalOwner`) sets the active
namespace on every app load and account transition, and separately drives
`clearAllLocalStateExceptPhotos()` (same enumeration as `eraseAllLocalData`,
minus the `bodycoach-photos` database) whenever the locally-remembered
owner doesn't match the server session. The photo IndexedDB schema bumped
to v2; the one-time migration drops pre-6e unnamespaced photo records
(there is no safe way to attribute them to one account).

## Phase 6f — Post-6e Follow-Up (2026-07-24)

### SR-6f-brand — Motion Care / Praxis brand boundary

**Standing rule:** Motion Care is Sotirios's practice. Praxis is the
product. The app must NEVER mix the two names in user-facing copy. Any
future feature that integrates Motion Care as a business (e.g., "book a
trainer") must be specced in its own phase with explicit brand-boundary
rules; there is no automatic name-bleed into Praxis's core coaching
voice. (This corrects earlier drafting in this file and in `bloom-plan.md`
that referred to "Motion Care clients" where "Praxis clients" was meant —
see Phase 6e's edit to `bloom-plan.md`.)

### SR-6f-nutrition — Nutrition stays read-only content, not a tracked feature

**Standing rule:** Praxis is a movement and posture app. Nutrition
features live in read-only content pages, not as calculators or trackers
integrated into the authenticated app experience. Praxis does not compete
with MyFitnessPal or Macrofactor. If Sotirios's Motion Care clients ask
for nutrition tools, revisit — but real demand justifies real complexity;
speculation does not.

**Amendment (SR-6f-nutrition-amendment, Phase 6f Commit 9):** the public
`/tools/macro-calculator` marketing page is consistent with this rule
because it is explicitly NOT an app feature — it's an unauthenticated,
public marketing/SEO page, not linked from the authenticated experience,
and it creates no user-tracked nutrition data. It exists to acquire
organic search traffic and funnel into `/assessment`, not to start a
nutrition-tracking product surface. This page must never become a wedge
for a full nutrition tracker without a separate, explicit phase revisiting
SR-6f-nutrition.

### SR-6f-catalog — Consecutive same-pattern mains with identical coach notes

**Standing rule:** When two consecutive main-slot exercises in a
generated day are the same movement pattern with identical coach-note
text, flag it as a bug in the catalog audit log. Observed case: Machine
Chest Press + Dumbbell Bench Press both selected as mains on a Beginner /
Build Muscle / Gym persona's day, when Chest Fly should have been the
second main (same pattern repeated with no variation the coach notes
themselves acknowledge). Investigation deferred to Phase 7 or a dedicated
catalog pass — no engine change in Phase 6f.

### ED-6f.2 — Offline mode (Commit 2): reused the existing full-program
cache instead of a narrower "current + next day" cache

**Decision:** Commit 2's spec calls for caching "CURRENT program's active
day + next scheduled day locally... replace-not-accumulate." Investigation
found training already stores the ENTIRE active program (every day, not
just two) in IndexedDB, keyed by program id, with `appState.activeProgramId`
as the single pointer that moves when a plan is regenerated — this already
satisfies "replace-not-accumulate" at the level that actually matters (what
resolves as "today's session"), and is a strict superset of a 2-day cache.
Building a separate, narrower cache alongside it would add a second source
of truth for the same data with no user-facing benefit, and would actually
regress days 3–7 of the current week (no longer independently navigable
offline). No new caching layer was added; Commit 2's actual gap — writes
made offline never syncing back once the connection returned — was in the
*sync* path, not the *cache* path (see ED-6f.3).

### ED-6f.3 — Offline mode (Commit 2): sync retry queue wraps
`pushTrainingPatch`, not each call site

**Decision:** Every local save (`logStore.ts`'s `saveTrainingRecordIfChanged`
and `savePrefs`) already fires a best-effort `pushTrainingPatch(...)` after
every successful local write — local writes (and therefore training itself)
already worked fully offline; only the fire-and-forget server mirror had no
retry. Rather than touching every call site, the retry queue
(`localStorage`-backed, ordered, exponential backoff, capped at 50 entries)
was added inside `pushTrainingPatch` itself in `trainingSyncClient.ts`: a
patch that fails for a connectivity/server reason (anything except a 401,
which will never succeed regardless of connectivity) is queued and retried
on the `online` event and on a backoff timer, in order, until it lands.
Every existing caller keeps its exact same call signature and behavior when
online; nothing else changed.

### ED-6f.4 — Subscription status persistence (Commit 3, amended): client-side
fallback only, not a middleware bypass

**Decision:** The status-model local cache (`subscriptionStore.ts`,
`useUserPlan.ts` in both apps) only changes what happens when the CLIENT's
own `/api/auth/session` + `/api/billing/status` fetches fail — it lets
`isPro`/`isFreePlan` (the Pro chip, the upgrade prompt, client-side day-lock
rendering) fall back to the last-confirmed local status instead of
collapsing to "signed out." It deliberately does NOT touch
`middleware.ts`'s JWT-cookie paywall redirect, which runs server-side on
every request. Investigation (mirroring Phase 6f Commit 2's finding) showed
this is the only coherent scope: the service worker's navigation fallback
(`sw.js`, network-first → generic `/offline` page) means a genuinely offline
device can't reach a NEW server-rendered route at all, so there is no
"unlock a paywalled day while offline" case to build for — offline access
only matters for a page already loaded before the connection dropped, which
is exactly the client-side surface this commit fixes.

### ED-6f.5 — Daily coach note (Commit 4): reused the existing computed
"Next best action" text instead of a new generator, and locked the
never-nag decision per calendar day rather than per note-content

**Decision:** `coachAction` (one of the three "coach notes" —
Biggest win / Biggest risk / Next best action) was already being computed,
unconditionally, from real state on every dashboard render — it just never
reached the user because it was bundled into the Insights panel behind the
full-week unlock. So Commit 4 doesn't add a new note generator; it reuses
`coachAction` exactly as already computed and only adds the "never repeat
identically two days in a row" rule (`packages/engine/src/coachNoteStore.ts`).
That rule locks its decision (`shown: true/false`) into `localStorage` the
first time it's evaluated on a given calendar day, and replays that exact
decision for any further evaluation that same day — deliberately not
recomputing "is this identical to the last thing I stored?" on every call,
because two evaluations in the same render pass (e.g. React Strict Mode's
dev-only double-invoke of effects) would otherwise see the just-written
"today" record on the second call and incorrectly conclude "already shown
today" and flip a freshly-suppressed note back to visible. Locking per
calendar day, not per note text, is what keeps the decision stable
regardless of how many times it's evaluated.

### ED-6f.6 — Language cleanups (Commit 5): dedupe by tag not by whole string,
"cycle" renamed everywhere it's user-facing (not in dev-only diagnostics),
and prompt suppression scoped to one specific, non-safety reason

**Decision (5.a, tag dedupe):** The "This week we're focused on..." bug
wasn't two components disagreeing — it was one `priorities` array mixing two
shapes: an already-"•"-joined multi-tag string from the engine
(`coachingPrompts[0]`) and a separate single bare tag
(`focusAreas[1]`) that can duplicate one of the tags inside that joined
string, just title-cased. Comparing whole strings case-insensitively (the
original dedupe) can never catch a duplicate tag buried inside a joined
list. Fixed by splitting every entry on "•" into individual tags before
deduping (`packages/engine/src/focusSentence.ts`, extracted out of the two
previously-duplicated `DailyInsightCard.tsx` copies so the fix and its tests
have one home).

**Decision (5.b, "cycle" rename):** Audited every user-facing string
containing "cycle" (hero chip, `phaseObjective.phaseFocus`, and three
progression-decision messages surfaced via `setAdvanceMessage`) and renamed
all of them to plain "week" language — `getCycleLadder`'s `cycleIndex` is,
in this engine, literally a running per-week counter whose `(n-1) % 4`
determines the Base/Build/Push/Deload stage, so "Cycle: N" was never a
distinct higher-level concept from "week" to begin with; "Week X of 4" says
exactly what the number means. Left the `SHOW_TECHNICAL_PROGRAM_REFERENCE`
dev-only diagnostic dumps (`process.env.NODE_ENV !== "production"`) saying
"Cycle Index: N" untouched — those never render in production and are
genuinely engine-internal instrumentation, not user-facing copy.

**Decision (5.c, prompt tone + suppression):** No code contained the literal
string "Did you skip this exercise?" — the closest real analog is the
pre-session feedback contract's `reason: "incomplete"` prompt
(`SessionClient.tsx`), which fires when the most recent log for one of
today's exercises has `setsCompleted < setsPlanned`. Reworded only that one
reason's copy to curious-not-judgmental phrasing; the other three reasons
(severe pain, consecutive moderate pain, failed difficulty) are safety- or
effort-relevant, not "maybe you just forgot to log it," and keep their
direct phrasing. The self-adapting suppression
(`incompleteContractPromptFireCount` / `suppressIncompleteContractPrompts`
in `LogPrefs`) is scoped to that one reason only and is never applied to
pain or failed-difficulty triggers — a user muting "did you forget to log
this" should never be able to accidentally mute a pain-escalation prompt by
the same click. Extracted the prompt-copy and suppression-filtering logic
into pure functions in `packages/engine/src/program/feedbackContract.ts`
(`buildContractPrompt`, `shouldOfferIncompletePromptSuppression`,
`filterSuppressedContractTriggers`) so this logic is unit-testable without
driving the full session UI; the suppress-and-re-enable round trip itself is
covered end-to-end via IndexedDB-seeded Playwright specs.

### ED-6f.7 — Interface visibility section (Commit 8): ported from the
admin-only Settings route; gyms documented as not-applicable rather than
given fake toggles

**Decision:** The Phase 6.3 per-section visibility feature
(`<VisibilityGate>`, `useSectionVisibility`, `SECTION_REGISTRY`) never lost
its Settings UI — that UI only ever lived on `apps/consumer/src/app/
settings/page.tsx`, which is admin-gated (`middleware.ts` requires a
`bac_admin` cookie). Regular users were never able to reach it, which is
functionally identical to "lost." Commit 8 ports that same block (same
`sectionsForScreen`/`isSectionVisible`/`resetSectionVisibilityToDefaults`
API, same defaults, no new state shape) onto the regular-user
`apps/consumer/src/app/account/settings/page.tsx`, rather than inventing a
second implementation. The admin page's own copy is left as-is — it's still
useful there for QA/support impersonation.

`apps/gyms` has zero `<VisibilityGate>` / `useSectionVisiblePref` call
sites anywhere in its source — there is nothing there for an Interface
toggle list to control. Per SR-6 (a Settings toggle that controls nothing
is cosmetic-only, out of contract), gyms gets no Interface section in this
commit rather than a set of toggles wired to nothing. If gym-operator UI
grows its own progressive-disclosure needs later, that's a new phase that
defines its own section registry for the operator screens — it should not
borrow the consumer athlete-facing registry (`results.*`/`session.*`/
`day.*`) which doesn't describe anything in the operator UI.

### ED-6f.8 — Test suite scoping (Commit 6): a fixed `@critical` file list,
not `vitest related`, because the engine's own barrel/types files make
"related" resolve to ~65% of the suite

**Decision:** The spec's "specific test files touching modified code paths"
clause was prototyped literally first, with `vitest related <changed files>`
against this PR's actual changed engine files. Result: because
`packages/engine/src/types.ts` (global types, imported nearly everywhere)
and `packages/engine/src/program.ts` (a 29 000+ line re-export barrel that
most app code and many tests import from) were both in the changed set,
`vitest related` resolved to **75 of this package's 116 test files** (565
tests, ~107 s) — i.e., touching either of those two nearly-universal files
makes "related" degrade to "almost the whole suite," which is exactly the
outcome a fast PR-gate filter exists to avoid. This isn't a one-off fluke of
this PR: any future PR that adds a new engine export (touches `program.ts`)
or a new `LogPrefs`/`Program` field (touches `types.ts`) — both extremely
common, low-risk changes — would trigger the same near-total-suite blowup.

Went with a **fixed, curated `@critical` file list** instead (`test:critical`
in `package.json`, run via `npm run test:critical` in the PR gate): the
pre-existing 8 golden/identity/determinism/invariant anchor files, plus every
feedback-contract, ladder-criteria, and phase/progression-invariant test
file, plus the specific new test files this phase's commits actually added
or modified (`accountIsolation`, `coachNoteStore`, `focusSentence`,
`offlineSyncQueue`, `subscriptionStore`, `stripeWebhookVerification`,
`programProgressionTransition`). 26 files, 278 tests, ~7–8 s locally — this
concretely satisfies "the specific test files touching modified code paths"
for every commit in this phase, without a mechanism that silently stops
being a filter the moment someone touches a barrel file. `test:full` /
`test:full:gyms` remain the complete, uncategorized suite, run nightly,
unchanged in scope. Every test file that existed before this commit still
runs somewhere (nightly, at minimum) — this is a categorization pass, not a
reduction pass, per the phase spec.

**Playwright in the PR gate:** first-run happy path and per-account
isolation, for both apps, are now a blocking PR-gate step (previously
Playwright didn't run in CI at all — see the Phase 6d note that this had "no
CI impact" at the time, which stops being true here). Implemented as
`npm run test:e2e:smoke:consumer` / `...:gyms`, each a plain `cd apps/<app>
&& playwright test <two spec files>` — deliberately *not* invoked as
`playwright test --config=apps/<app>/playwright.config.ts <files>` from the
repo root, because `apps/*/e2e/fixtures.ts`'s test-only user store resolves
its JSON file via `path.join(process.cwd(), "data", "users.json")`: run from
the repo root, the Playwright *test* process (which calls `upsertE2eUser`)
and the Next dev server it spawns (whose `webServer.cwd` defaults to the
config file's own directory, i.e. `apps/<app>`) would resolve two different
files, so a seeded user would silently write to a path the server-side login
route never reads from and every `POST /api/auth/login` in the isolation
spec would 401. `cd`-ing into the app directory first makes both sides agree
on `process.cwd()`. The gyms smoke script also pins
`PLAYWRIGHT_PORT=3100` (consumer keeps the default 3000) purely so the two
smoke steps can never contend for the same port if a runner is slow to
release it between steps — belt-and-suspenders, not a fix for an observed
CI failure.

### ED-6f.9 — Macro calculator (Commit 9): plain per-bodyweight protein
target instead of a %-of-calories split, and a new consumer-app test layer
that didn't exist before

**Decision:** The ratified macro ratio is "moderate fat / high carb / high
protein," but implementing all three as fixed percentages of total calories
has a real failure mode: a %-of-calories protein target quietly under-feeds
protein for anyone in a large calorie deficit (the "lose" goal), which is
exactly the situation where protein retention matters most. Implemented
instead as: protein = 1.8 g per kg bodyweight (set directly, not from
calories — solidly inside the 1.6–2.2 g/kg range supported for
resistance-trained lifters), fat = a flat 25% of total calories
("moderate"), carbs = whatever calories remain. For a resistance-training
population at typical training calorie levels this reliably makes carbs the
largest macro by both grams and percentage without hand-tuning a carb
percentage directly — "high carb" falls out of the other two choices rather
than being a fourth independent knob. `MINIMUM_CALORIES = 1200` floors the
output for small-bodyweight + "lose" combinations; this is a public
marketing calculator, not a clinical tool, and must never recommend an
unsafe number. All of this lives in `apps/consumer/src/tools/
macroCalculator.ts`, deliberately NOT under the `@/lib/*` alias — that alias
resolves to the `packages/engine` source tree for every app in this
monorepo (see `apps/consumer/tsconfig.json`), and this calculator is
consumer-app-only, page-specific logic with no relationship to the training
engine.

**New test infrastructure this commit adds:** `apps/consumer` had zero unit
tests and no `vitest.config.ts` before this commit (unlike `apps/gyms`,
which already had both). Added `apps/consumer/vitest.config.ts` (mirroring
`apps/gyms/vitest.config.ts`) and `apps/consumer/tests/unit/
macroCalculator.test.ts`, wired into CI as `npm run test:full:consumer`
(nightly, alongside the existing `test:full:gyms`) — this is new coverage
for new code, not a retrofit of the rest of the consumer app, so it wasn't
worth adding to the Commit 6 `@critical` PR-gate list.

**Route/middleware:** `/tools/macro-calculator` needed no middleware
change — `middleware.ts`'s matcher (`/settings`, `/results`, `/session`,
`/program`, `/progress`, `/account`) never runs on `/tools/*` at all, so the
page is public by simply existing outside that matcher, consistent with
SR-6f-nutrition-amendment's requirement that it not be gated or linked into
the authenticated app experience. No existing in-app nav (`AppMenuClient`,
dashboard, settings) links to it — the only links are the page's own
internal "Try the assessment" CTA (outbound, to `/assessment`) and the new
`sitemap.ts` entry.

**Sitemap:** no `sitemap.ts` existed anywhere in the monorepo before this
commit. Added `apps/consumer/src/app/sitemap.ts` covering the full existing
set of public, indexable pages (home, assessment, macro calculator, FAQ,
privacy, terms, refunds) rather than only the new page — a sitemap with a
single URL would be an odd first version to ship. Authenticated-only routes
and transactional auth routes are intentionally excluded. `robots.ts` was
considered but not added: bloom-plan's SEO-essentials list for this commit
names only "sitemap entry," and introducing a site-wide crawl policy is a
broader decision than one marketing page warrants.

### ED-6f.10 — Full-gate Playwright validation: a pre-existing login
rate-limit collision when running the entire consumer suite in one long
serialized process, not a Phase 6f regression

**Finding:** Running the complete `apps/consumer` Playwright suite (51
tests) in a single invocation intermittently fails a handful of
login-driven specs with `expect(login.ok()).toBeTruthy()` returning false —
e.g. `navRoutesReachable`, `sessionStartRedundancy`,
`navMenuLogoutAndOrdering`, `perAccountStateIsolation`, `staleDeviceCleanup`,
`stripeSessionPersistence`. None of these are Phase 6f code paths, and every
single one of them passes cleanly and repeatably when run in isolation or in
a smaller batch. Root cause: `/api/auth/login`'s rate limiter
(`packages/engine/src/rateLimit.ts`) keys its bucket on the caller's IP,
which for every local/CI Playwright request is the literal string
`"unknown"` (no `x-forwarded-for` header) — so the ~15+ login-calling specs
in the full suite all share one 10-requests-per-60-seconds bucket for the
entire run, and cluster past it. This is a real characteristic of the login
route, but not a functional bug: production traffic has real, distinct
client IPs, and the actual PR-gate/CI Playwright surface (Commit 6's two
smoke specs per app) is nowhere near this threshold. Left the rate limiter
unchanged — it's outside all nine commits' declared scope, and a bypass
would be a security-relevant decision that deserves its own explicit
ratification, not a side effect of a test-suite-scoping commit. Confirmed
clean via: full engine suite (869/869), full gyms suite (17/17), full
consumer suite (13/13), full gyms Playwright suite (18/19 — the sole
failure is `betaRisk.spec.ts`'s "reset current progress preserves completed
history," already confirmed pre-existing/flaky on `main` earlier in this
same phase), and every consumer Playwright spec passing when run without
this one shared-process artifact.

Separately, while running the full suite this surfaced one genuine flake in
this phase's own new `macroCalculatorPage.spec.ts`: interacting with the
calculator's `<select>` before the client bundle finished hydrating changed
the native DOM value without firing React's `onChange`, and hydration then
silently reset it back — fixed by waiting for `networkidle` before the
first interaction (see the spec file).

