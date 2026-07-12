# Ladder Decisions Log

Every decision that alters or contradicts the Phase 2 catalog draft.  
Format: `[date] [pattern] — [what changed] — [why]`  
Falsifications are preserved. Nothing disappears silently.

---

## Standing Rule (2026-07-12)

**Any reclassification that would remove an existing strictly-monotonic chain from ladder participation must be flagged for review, never executed silently.**  
Chains are the asset being built. Dissolving a clean chain into a ladder-exempt bucket is the exact opposite of Phase 2's purpose. Established after the suspension-trio case (see core_stability entry below).

---

## horizontal_pull (2026-07-11)

1. **scap_health toolbox** — 14 exercises reclassified from `horizontal_pull` ladder to `subPattern: "scap_health"` (face-pull, rear-delt, external rotation, prone-ytw, pull-apart variants, etc.). Rationale: these are correctives and assessment-driven accessories, not strength ladder rungs. They retain `difficulty` for selection but carry no `progressionOf`/`regressionOf` links.

2. **I6 cut: supine-elbow-drive-row → dead-bug** — removed. `supine-elbow-drive-row` is `horizontal_pull`; `dead-bug` is `core_stability`. Cross-pattern link preserved a pre-existing error; cut for pattern purity.

3. **single-arm chain** — `dumbbell-rows` (d3, bilateral) → `single-arm-dumbbell-row` (d4, unilateral). Rationale: bilateral before unilateral; anti-rotation demand of single-arm is the progression, not a swap.

4. **band-pull-aparts merge deferred** — `band-pull-aparts` (plural) is embedded in `program.ts` and `routine.ts` with 15+ references. Merging into `band-pull-apart` would shift anchors. Deferred to a dedicated refactor pass; logged here as open debt.

---

## hinge (2026-07-11)

1. **hip_health toolbox** — 6 exercises reclassified to `subPattern: "hip_health"`: `glute-bridges`, `assisted-hip-hinge`, `assisted-good-morning`, `assisted-back-extension-hold`, `single-leg-glute-bridge-hold`, `back-extension-hold`. Rationale: pelvic stability and recruitment drills; not strength progression rungs.

2. **Force-production ladder** — `bodyweight-good-morning(2) → db-rdl(3) → barbell-romanian-deadlift(4) → assisted-nordic-eccentric(5)`. `db-rdl` re-rated d4→d3. `dumbbell-sumo-rdl` delisted as rung, becomes swap of `db-rdl`.

3. **Unilateral path** — `assisted-single-leg-rdl(3) → single-leg-rdl` with `assisted-nordic-eccentric` as `swapOptions` (not a rung; d3→d5 jump intentional as stretch goal).

4. **Hip-drive path** — `assisted-hip-thrust(2) → assisted-single-leg-hip-thrust(3) → barbell-hip-thrust(4)`. `machine-glute-drive` reclassified as `swapOptions` of `barbell-hip-thrust` (same-difficulty swap, not a rung).

5. **Hip_health orphan fold (2026-07-12)** — 5 dangling hinge accessories added to `hip_health`: `band-rdl(2)`, `single-leg-hip-thrust(3)`, `machine-seated-hamstring-curl(2)`, `assisted-hamstring-curl(3)`, `back-extension(3)`. Rationale: kept them selectable as valid corrective options rather than floating in the catalog.

---

## knee_dominant (2026-07-11)

1. **knee_health toolbox** — `band-front-squat` and `heels-elevated-squat` reclassified to `subPattern: "knee_health"` at d2. Rationale: mobility and admission drills; not bilateral squat ladder rungs.

2. **Bilateral squat ladder (5-rung smooth)** — `bodyweight-squat(1) → machine-leg-press(2) → goblet-squat(3) → machine-hack-squat(4) → barbell-back-squat(5)`. Decision: "linear demand, no gaps" philosophy applied; machine entries fill d2 and d4 rather than leaving jumps.

3. **Unilateral ladder** — `split-squat(2) → dumbbell-reverse-lunge(3) → dumbbell-bulgarian-split-squat(4) → shrimp-squat(5)`. `dumbbell-step-up-loaded` delisted as rung (d3 tie with reverse-lunge), becomes swap.

4. **calves isolation family** — `band-calf-raise(2)`, `standing-calf-raise(2)`, `db-calf-raise(3)`, `single-leg-calf-raise(3)` assigned `pattern: "calves"` and added to `ISOLATION_PATTERNS`. Rationale: plantarflexion is not knee-dominant; separate pattern enables independent pain-flag disable.

---

## core_stability (2026-07-12)

1. **carry_load isolation family** — `farmers-carry(3)`, `suitcase-carry(3)`, `suitcase-hold-march(2)`, `dumbbell-suitcase-hold-march(3)`, `band-suitcase-march(1)`, `band-offset-march-hold(1)` reclassified to `pattern: "carry_load"` and added to `ISOLATION_PATTERNS`. Rationale: load-bearing stability under external load is separable from segmental motor control; carry_load can be fully disabled by a low-back contraindication flag without removing core training access.

2. **Classification criterion for carries vs. marches** — decided by external load, not name. Unloaded bracing marches (`standing-brace-march`, `wall-supported-carry-march`, `wall-braced-single-leg-march`, `contralateral-reach-march`) remain prescribable under a low-back flag and therefore must not live in the pattern that gets disabled.

3. **Suspension trio preserved** — `suspension-body-saw(3) → suspension-fallout(4) → suspension-stir-the-pot(5)` retained in `core_stability` with chain intact. This was the first application of the standing rule: dissolving this clean monotonic chain into `carry_load` would have been the exact error the standing rule prevents. Anti-extension under instability; no external load; no gait; nothing carry about it.

4. **Ladder A (anti-rotation)** — `pallof-press(2) → cable-woodchop-standing(3)`. `cable-pallof-press(2)` and `band-woodchop(2)` = swaps of `pallof-press`. `suspension-anti-rotation-hold(2)` = swap of `pallof-press`.

5. **Ladder B (spinal/flexion resistance)** — `dead-bug(1) → plank(2) → hollow-body-hold(4) → barbell-rollout(5)`. `marching-brace-hold(1)` = swap of `dead-bug`. `machine-ab-crunch(2)` = swap of `plank` (collapsed the pre-existing d1→d5 crunch jump).

6. **Hanging track (branch-at-root, familyKey: hanging_core)** — root: `hanging-knee-raise(2)` (swap: `hanging-tuck-hold`). Flexion branch: `→ hanging-hollow-hold(3) → hanging-leg-raise(4)`. Rotation branch: `→ hanging-oblique-knee-raise(3) → hanging-windshield-wiper-regression(4)`. Zero re-rates, no invented entries; both branches strictly monotonic.

7. **core_health toolbox** — `bird-dog`, `standing-brace-march`, `wall-supported-carry-march`, `wall-braced-single-leg-march`, `contralateral-reach-march` assigned `subPattern: "core_health"`. Unloaded motor-control drills; remain selectable under a low-back flag.

8. **Side-plank mini-track** — `side-plank(3) → side-plank-star(4)` formalized as a two-rung anti-lateral-flexion track within `core_stability`.

---

## horizontal_push (2026-07-12)

1. **Machine-to-barbell chain** — `band-chest-press(2) → machine-chest-press(3) → dumbbell-bench-press(4) → barbell-bench-press-paused(5)`. `dumbbell-bench-press` re-rated d3→d4 and added to the chain as the rung. Decision: flat→flat transfer is more direct than incline→flat for the progression to paused barbell bench.

2. **dumbbell-incline-press reclassified** — removed from ladder (was d4 rung), becomes `swapOptions: ["dumbbell-bench-press"]`. Same difficulty, different angle emphasis; canonical swap per R-B.

3. **barbell-floor-press, dumbbell-floor-press reclassified** — both become swaps (`barbell-floor-press → swapOptions: ["barbell-bench-press-paused"]`, `dumbbell-floor-press → swapOptions: ["dumbbell-bench-press"]`). Floor press limits ROM and is a valid variation, not a distinct rung.

4. **Bodyweight chain extended** — `pushup(3) → feet-elevated-pushup(4) [NEW ENTRY] → archer-pushup(5)`. `archer-pushup` re-rated d3→d5. `pseudo-planche-pushup` reclassified as swap of `archer-pushup` (same ceiling difficulty, different skill expression). `close-grip-pushup` and `tempo-pushup` reclassified as swaps of `pushup` (same difficulty, technique variants per R-B).

---

## vertical_push (2026-07-12)

1. **Barbell order flipped — strict before push-press** — chain becomes `machine-shoulder-press(3) → barbell-strict-press(4) → barbell-push-press(5)`. `barbell-strict-press` re-rated d5→d4; `barbell-push-press` re-rated d4→d5. Rationale: strict press is the base competency (no leg drive, full overhead control). Push press adds a ballistic dip-drive and supramaximal loading on top of that skill — teaching it first inverts the dependency. For a posture-first product the strict pattern is doubly foundational.

2. **dumbbell-shoulder-press and dumbbell-arnold-press reclassified as swaps** — `dumbbell-shoulder-press(3)` = swap of `machine-shoulder-press`; `dumbbell-arnold-press(4)` = swap of `barbell-strict-press`. Same rungs, different implement/rotation emphasis.

---

## vertical_pull (2026-07-12)

1. **Plain overhand pull-up added as new entry** — `pullup(4)` inserted between `neutral-grip-pullup(3)` and `chest-to-bar-pullup(5)`. Omission was an oversight, not intentional; the catalog previously jumped from neutral-grip to chin-up while skipping the canonical standard-grip pull-up.

2. **chinup-strict reclassified as swap** — removed from the ladder (was rung d4), becomes `swapOptions: ["pullup"]`. Biceps-supination assist makes it the friendlier d4 variation; exactly what a swap is for. Chain is now: `scap-pullup(1) → band-assisted-pullup(2) → neutral-grip-pullup(3) → pullup(4) → chest-to-bar-pullup(5)`, with `weighted-pullup(5)` as a ceiling-tie extension.

---

## Isolation families (2026-07-12)

1. **lateral_raise, elbow_flexion, elbow_extension added to ISOLATION_PATTERNS** — same treatment as `calves` and `carry_load`. These families progress by load/reps in place; no chain links authored. Difficulty ratings assigned: `lateral_raise` d1–d2; `elbow_flexion` d1–d2; `elbow_extension` d1–d2. `painContraindications` added to all 19 entries.

2. **cable-upright-row deprecated from selectable pool** — removed `regressionOf: "cable-lateral-raise"` link; kept in catalog with full shoulder/neck/wrist/elbow contraindications. Rationale: classic impingement offender; wrong exercise for a product whose assessment flags scapular control. **Formal `deprecated` field is P3 tech debt** — the type system doesn't yet support it; the broad contraindication set is the practical exclusion mechanism until then.

---

## Phase 2b — Tie calls & institutionalization (2026-07-12)

### Standing rules ratified by Sotirios (2026-07-12)

SR-1  **Band variants are the low-equipment lane and designated pain/deload swaps** — surfaced by equipment gating and `simplify_pattern`, never progression links. Band entries with matching cable/free-weight counterparts are registered as `swapOptions` only; no `progressionOf`/`regressionOf` links cross equipment tracks.

SR-2  **Suspension content is retained, equipment-gated, and rated to honor instability** — the suspension family is not removed. All suspension exercises carry `equipment: ["pullup_bar", "bands"]` and have difficulty ratings +1 relative to their ground-based counterparts to reflect the instability demand. Advanced suspension press patterns carry `experienceMin: "advanced"`.

SR-3  **carry_load receives no dedicated warmup prep block** (Sotirios, 2026-07-12) — carry_load isolation exercises do not appear in the PRIME block of the warmup system. Unloaded bracing marches (`standing-brace-march`, `wall-supported-carry-march`) remain in `core_health` and serve as core primers, not carry primers.

### Tie calls (2026-07-12)

TC-1  **split-stance-row ✂ dumbbell-rows** (cross-track: band→free) — delinked. `dumbbell-rows` removed from `split-stance-row`'s progression chain. `dumbbell-rows` = swap at the free d3 row rung (`swapOptions`). Band variants (`band-row`, `split-stance-row`) are designated as the low-equipment lane per SR-1; they are pain/deload swaps of their free-track counterparts via `swapOptions`, not progression rungs.

TC-2  **countertop-pushup ✂ suspension-pushup-upright** (cross-track: ground→suspension) — delinked; mutual `swapOptions` established. Suspension family retained (SR-2). Draft +1 difficulty re-rate applied across the suspension push-up chain for Sotirios's PR review:
  - `suspension-pushup-upright`: d2 → **d3** (was tied with countertop-pushup at d2; +1 honors instability)
  - `suspension-pushup-incline`: d3 → **d4**
  - `suspension-pushup-parallel`: d4 → **d5**
  - `suspension-pushup-feet-elevated`: stays d5 (ceiling cap; I5a d5-tie with parallel)
  - `suspension-chest-fly`: d4 → **d5** (consequential re-rate: was tied with newly re-rated incline at d4; suspension fly at full extension is a legitimate d5 ceiling entry)
  ⚠️ REVIEW: Confirm the +1 shift is correct before merging. If upright at d3 leaves a gap below the suspension entry point, consider a d2 bodyweight regression anchor or accept the gap.

TC-3  **suspension-pike-press-incline ✂ wall-handstand-hold** (cross-track: suspension→handstand) — delinked. Handstand mini-track formalized: `wall-handstand-hold(3) → wall-handstand-negative(4) → wall-assisted-handstand-pushup(5)`; `pike-pushup(3)` = swap of hold. Suspension-pike-press chain retains its own vertical-push ladder (`upright(2) → incline(3) → deep(4)`) and receives `experienceMin: "advanced"` on all three entries (SR-2).

TC-4  **band-row ✂ machine-seated-row** (cross-track: band→machine) — delinked. `machine-seated-row` roots the gym-track d2 horizontal-pull rung. `band-row` = designated low-equipment / pain swap (SR-1); `swapOptions` link maintained. Band-track audit passed: all 34 `band-*` entries carry `equipment: ["bands"]` (or `["pullup_bar", "bands"]` for band-assisted-pullup).

TC-5  **cable-seated-row = canonical d3 row rung** — `dumbbell-chest-supported-row`, `single-arm-dumbbell-row`, and `dumbbell-rows` = its `swapOptions`. `barbell-bent-over-row(4)` chains from `cable-seated-row`. True tie (same track, same difficulty) resolved by designating cable-seated-row as the canonical ladder rung per equipment availability hierarchy.

TC-6  **band-assisted-pullup ✂ machine-assisted-pullup** (cross-track) — delinked; mutual `swapOptions`. Per SR-1, band variant = designated pain/deload swap of the machine version.

TC-7  **band-straight-arm-pulldown ✂ cable-straight-arm-pulldown** (equipment variant) — delinked; mutual `swapOptions`. Band variant = designated light-resistance/pain option (SR-1); carries `supportOnly: true` and `painContraindications: ["shoulders", "low back"]`. Bidirectional `swapOptions` added to both entries.

TC-8  **dumbbell-pullover ✂ cable-lat-pulldown** (different movement animal) — delinked. `dumbbell-pullover` = swap of `cable-lat-pulldown`; it stays selectable as a lat-extension variation but is not a progression rung.

TC-9  **dumbbell-side-lying-external-rotation ← cable-external-rotation** (scap_health stragglers missed in toolbox sweep) — entire external-rotation chain delinked from ladder membership. `dumbbell-side-lying-external-rotation`, `cable-external-rotation`, `band-external-rotation`, and `machine-shoulder-external-rotation` all reclassified to `subPattern: "scap_health"`. No `progressionOf`/`regressionOf` links remain. Carries `primes: ["horizontal_pull"]` and `mobilizes: ["shoulders", "scapulae"]` for the warmup system.

### Warmup/activation annotation pass (2026-07-12)

Ratified joint map (Sotirios, 2026-07-12):
- hinge → hips, hamstrings, lower back
- knee_dominant → knees, hips, ankles
- horizontal_push → shoulders, elbows, wrists
- vertical_push → shoulders, thoracic spine, elbows, wrists
- horizontal_pull → shoulders, scapulae, elbows
- vertical_pull → shoulders, scapulae, elbows (lats/grip noted in Phase-3W contract)
- core_stability → spine, hips

Applied to all warmup/activation/cooldown entries. Flagged-annotation rulings applied (2026-07-12):
- `ankle-mobility`: mobilizes `["ankles"]` — confirmed exercise-specific; full knee_dominant map scope not appropriate for a pure ankle drill.
- `hip-flexor-stretch`: "hip flexors" normalized → `["hips"]` (folded under hips per normalization rule).
- `chin-tucks`: mobilizes `["neck"]` — confirmed overlay-only; neck is exempt from pattern-map matching.
- `doorway-pec-stretch`: "chest" normalized → `["shoulders"]` (chest = anterior shoulder region per normalization rule).
- `banded-lat-stretch`: "lats" retained as exercise-specific vocabulary; "upper_back" normalized → "thoracic spine". Final: `["lats", "thoracic spine"]`.
- `scapular-pushups`: "serratus" normalized → "scapulae" per normalization rule. Final: `["shoulders", "scapulae", "thoracic spine"]`.
- `band-offset-march-hold`: mobilizes `["spine", "hips"]` only — confirmed no primes (carry_load receives no warmup prep per SR-3).
- `wall-supported-carry-march`: `carry_load` removed from primes per SR-3 — confirmed `primes: ["core_stability"]` only.

### Vocabulary closure (2026-07-12)

Normalized terms — these forms are no longer accepted in the catalog:
| Deprecated form | Normalized form | Rule |
|---|---|---|
| `"upper_back"` | `"thoracic spine"` | separator-style + anatomical precision |
| `"serratus"` | `"scapulae"` | serratus is an origin; scapulae is the region |
| `"hip flexors"` | `"hips"` | folded under broader joint region |
| `"chest"` | `"shoulders"` | anterior shoulder region for mobilize context |

Closed vocabulary encoded in `VALID_PRIMES` and `VALID_MOBILIZES` in `catalogLadderInvariants.test.ts`. Any new term outside the set fails CI.

Inventory gaps flagged for Sotirios (no new exercises authored without sign-off):
- **knees** — zero mobilizer exercises currently in catalog
- **elbows** — zero mobilizer exercises currently in catalog
- **wrists** — zero mobilizer exercises currently in catalog
- **grip/lats** — only one entry (`banded-lat-stretch`); grip has zero

### One-directional link audit (2026-07-12)

11 asymmetric links identified. Resolution applied:

1. **band-straight-arm-pulldown → band-lat-pulldown** — `progressionOf` removed. SR-1 violation: band variants are pain/deload swaps, not progression rungs. `swapOptions: ["cable-straight-arm-pulldown"]` retained.

2–11. The remaining 10 links are confirmed **explicit branch children** (alternate progressions from a shared parent). Each is listed in `KNOWN_BRANCH_CHILDREN` in `catalogLadderInvariants.test.ts`, which enforces that no silent third state can be introduced. If a new asymmetric link appears in future it will fail I4 unless added to the set:

| Branch child | Parent | Canonical sibling |
|---|---|---|
| `incline-pushup` | `wall-pushup` | `countertop-pushup` |
| `suspension-archer-row` | `suspension-row-parallel` | `suspension-row-feet-elevated` |
| `suspension-rear-delt-row` | `suspension-row-incline` | `suspension-row-parallel` |
| `suspension-face-pull` | `suspension-row-upright` | `suspension-row-incline` |
| `pullup-isometric-top-hold` | `band-assisted-pullup` | `neutral-grip-pullup` |
| `suspension-archer-pushup` | `suspension-pushup-parallel` | `suspension-pushup-feet-elevated` |
| `suspension-chest-fly` | `suspension-pushup-incline` | `suspension-pushup-parallel` |
| `hanging-oblique-knee-raise` | `hanging-knee-raise` | `hanging-hollow-hold` |
| `machine-chest-press` | `band-chest-press` | `machine-pec-deck-press` |
| `seated-lat-sweep-pulse` | `prone-lat-sweep` | `kneeling-prayer-lat-pulldown` |

### deprecated: true — formal mechanism implemented (2026-07-12)

`cable-upright-row` carries `deprecated: true`. The type field and filter were implemented in the 2b.3+2b.4 commit:
- `exercises` export filters `allExercises` to exclude deprecated entries (selection cannot pick them)
- `exerciseCatalog.ts` builds `allIds` from `allExercises`; validator warns on deprecated entries
- `exerciseById` still searches `allExercises` (legacy log entries still resolve)

Previous log note (P2 isolation entry): "Formal `deprecated` field is P3 tech debt" — **resolved in Phase 2b**.

---

## Phase 2b — Rebase onto main (2026-07-12)

**Branch:** `phase-2b-institutionalize` → PR #9.

The branch was originally cut from `c7b9ed2`. After PR #7 (Phase 0 security) and PR #8 (Phase 2 catalog) landed on `main`, the branch was rebased using `git rebase --onto origin/main 7c89515 phase-2b-institutionalize` — replaying only the 4 Phase 2b commits on top of `7404481`. The two local P2 commits (d68014b, 7c89515) were explicitly excluded to avoid conflicts with the squashed PR #8.

**PR #8 squash — standing-rule violation (logged for the record):**  
PR #8 ("Phase 2 catalog") was merged using a **squash merge**, collapsing 6 per-item commits into one. This violates SR standing rule: **merge commits are required in this repo; squash is never acceptable.** Logged here so it is not repeated. Future catalog PRs must use `--no-ff` merge commits.

**Pre-existing test failures (identified on rebased tree, 2026-07-12):**  
These 4 tests fail on `main` before any Phase 2b changes; they are NOT regressions introduced here.

| Test | First-failing commit on main |
|---|---|
| `programFuzz > randomized questionnaire combinations preserve structural safety` | `7404481` "Phase 2 catalog (#8)" — Phase 2 catalog restructuring reduced the eligible exercise pool for a specific fuzz configuration |
| `sessionFeedbackSubstitution > next week uses recent logs + guidance...` | `86f7da7` "Add feedback-driven substitution and in-session pain swap flow" |
| `sessionFeedbackInfluence > failed exercise gets deprioritized` | `6f367b0` "Use session feedback to influence exercise selection..." |
| `resultsOperationalReadiness > backfills phase workout progress...` | `67a8c45` "Operational polish pass" |

Note: `sessionFeedbackSubstitution/Influence` and `resultsOperationalReadiness` — the commits listed are the earliest point where each test file exists on main and fails; a full git-bisect is required to pinpoint the exact commit where the expectation first broke. `programFuzz` is precisely identified: it passes on `c7b9ed2` (pre-Phase-2 base) and fails on `7404481` (after Phase 2 catalog squash).

---

## Validator extensions (cumulative)

| Date | Addition | Reason |
|---|---|---|
| 2026-07-11 | `calves` → ISOLATION_PATTERNS | New plantarflexion family |
| 2026-07-12 | `carry_load` → ISOLATION_PATTERNS | Load-bearing stability family |
| 2026-07-12 | `lateral_raise` → ISOLATION_PATTERNS | Shoulder isolation family |
| 2026-07-12 | `elbow_flexion` → ISOLATION_PATTERNS | Biceps isolation family |
| 2026-07-12 | `elbow_extension` → ISOLATION_PATTERNS | Triceps isolation family |
| 2026-07-12 | I4/I5/I6/I7 + ISO-delinked + deprecated-exclusion | catalogLadderInvariants.test.ts green (Phase 2b) |
| 2026-07-12 | `deprecated?: boolean` on Exercise type | cable-upright-row excluded from selection |
| 2026-07-12 | KNOWN_BRANCH_CHILDREN explicit allowlist | no silent third state for asymmetric links |
| 2026-07-12 | VALID_PRIMES + VALID_MOBILIZES closed vocab | vocabulary normalized + CI-enforced |
