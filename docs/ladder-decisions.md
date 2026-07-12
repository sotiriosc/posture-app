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

## Validator extensions (cumulative)

| Date | Addition | Reason |
|---|---|---|
| 2026-07-11 | `calves` → ISOLATION_PATTERNS | New plantarflexion family |
| 2026-07-12 | `carry_load` → ISOLATION_PATTERNS | Load-bearing stability family |
| 2026-07-12 | `lateral_raise` → ISOLATION_PATTERNS | Shoulder isolation family |
| 2026-07-12 | `elbow_flexion` → ISOLATION_PATTERNS | Biceps isolation family |
| 2026-07-12 | `elbow_extension` → ISOLATION_PATTERNS | Triceps isolation family |
