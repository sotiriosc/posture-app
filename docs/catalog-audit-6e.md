# Catalog audit — Phase 6e

Report-only findings from Phase 6e, Commits 3 and 4. No engine logic or
catalog data is changed in this PR — Sotirios reviews and rules on any
follow-up in a separate commit/PR.

## Commit 3 — Hip abduction/adduction catalog check

**Finding: the catalog has no dedicated frontal-plane hip abduction or
adduction exercise.** This is a real gap, not a false alarm — the
assessment engine already recommends a corrective drill that does not
exist anywhere in `exercises.ts`.

### What's actually in the catalog today

Grepped `packages/engine/src/exercises.ts` for anything touching hip
abduction/adduction: `movementPattern`, `subPattern`, `muscleGroups`, and
`tags` fields, plus a scan of every distinct `movementPattern`/`subPattern`
value used across the whole file.

- No exercise has `abduction` or `adduction` anywhere in its
  `movementPattern`. The full set of movement patterns in use is entirely
  sagittal/other-plane (`squat`, `hinge`, `single-leg`, `core`,
  `anti-rotation`, `mobility`, etc.) — there's no frontal-plane hip
  abduction/adduction pattern at all.
- 29 exercises reference "hip" or "glute" in some field, but every one of
  them is either:
  - A **hip-extension** exercise (glute bridges, back extensions, hip
    thrusts, hamstring curls, band RDLs) tagged `subPattern: "hip_health"`
    — the existing "hip health" bucket is entirely hinge-pattern
    corrective work, not frontal-plane ab/adduction.
  - A **squat/lunge-pattern** exercise (Bulgarian split squat, cossack
    squat, sumo RDL, barbell back squat, etc.) that lists `adductors` as a
    *secondary* muscle group of a compound sagittal-plane lift — not a
    dedicated adduction isolation movement.
  - `side-plank-star`, which lists `glute med` as a secondary mover of an
    anti-rotation core exercise — again, not a dedicated abduction
    movement.
- Currently-present abduction exercises (banded clamshells, side-lying leg
  raises, standing cable abduction): **none.**
- Currently-present adduction exercises (copenhagen plank, cable
  adduction, side-lying adductor raise): **none.**

### Which patterns this is assigned to

`hip_health` (verified) — but as shown above, that toolbox is hip
*extension* work, not abduction/adduction. There is no separate toolbox
for frontal-plane hip stability.

### The gap is already visible to users, not just theoretical

`assessmentEngine.ts` generates two findings that explicitly recommend a
frontal-plane hip abduction drill as the corrective intervention:

```172:176:packages/engine/src/assessmentEngine.ts
          {
            type: "activation",
            target: "glute med",
            suggestion: "side-lying hip abduction",
          },
```

```280:292:packages/engine/src/assessmentEngine.ts
      primaryFocusTags: [
        ...
          : area === "Hips"
          ? "hip_extension"
        ...
          : area === "Hips"
          ? "glute_medius"
```

Both findings tag `glute_medius` as a focus tag. `program.ts`'s
`POSE_FOCUS_TAG_ALIASES` maps `hip_stability` → `["hip_stability",
"glute_medius", "hip_extension", "stability", "balance",
"core_stability"]`, and exercise-selection bias
(`focusOverlapScore`) matches against each exercise's `tags` array.

No exercise in the catalog carries the literal tokens `glute_medius`,
`hip_extension`, or `hip_stability` as a `tag`. The bias can still land on
*something* because a handful of exercises (single-leg hip thrust, side
plank/side plank star, a few other core/hinge moves) happen to carry the
generic `stability` or `balance` tags — but that's a coincidental partial
match, not the engine actually placing the recommended "side-lying hip
abduction" drill (or anything like it) into a program. A user with a
hip-shift or glute-med finding never actually sees the exercise the
assessment told them they need.

### Does it surface in generated programs for relevant personas?

No — it can't, because the exercise the finding recommends isn't in the
catalog to begin with. The closest the engine can get is a hinge-pattern
`hip_health` substitute (e.g., glute bridges) or a coincidental
`stability`/`balance`-tagged exercise, neither of which trains the hip in
the frontal plane the way the finding's own suggestion text says it
should.

### Recommendation (not actioned in this PR)

Author 2–4 catalog entries — at minimum a banded clamshell and a
side-lying hip abduction (bodyweight/band progressions, matching the
assessment's own suggested corrective) for abduction, and a copenhagen
plank or side-lying adductor raise for adduction — tagged with a new
`hip_health` sibling or an explicit `abduction`/`adduction` movement
pattern, and with `tags` including `glute_medius`/`hip_stability` so the
existing `POSE_FOCUS_TAG_ALIASES` bias actually finds them. Sotirios
rules on additions in a follow-up.
