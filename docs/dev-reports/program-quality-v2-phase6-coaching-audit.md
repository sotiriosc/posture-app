# Program Quality V2 — Phase 6 Coaching Audit

## Summary

- Catalog (all): **225**
- Active catalog: **224**
- Release-critical: **202**
- Complete release-critical: **202** (100%)
- Catalog-only / deferred: **22**
- Deprecated: cable-upright-row
- Demo status counts: available 0, planned 152, notRequired 50
- Required-demo video blockers (Phase 6 Owner Decision): **0** — missing videos are queued, not failed

## Canonical locations

- Registry: `packages/engine/src/coaching/exerciseCoachingRegistry.ts`
- Resolver/view-model: `packages/engine/src/coaching/resolveExerciseCoaching.ts`
- Contract: `packages/engine/src/coaching/exerciseCoachingContract.ts`

## Failure buckets

- none

## Catalog-only deferred sample

- `assisted-back-extension-hold`
- `assisted-cossack-squat`
- `assisted-good-morning`
- `assisted-hamstring-curl`
- `assisted-hip-hinge`
- `assisted-shrimp-squat`
- `banded-lat-stretch`
- `cable-pallof-press`
- `dumbbell-suitcase-hold-march`
- `hanging-hollow-hold`
- `hanging-knee-raise`
- `hanging-leg-raise`
- `hanging-oblique-knee-raise`
- `hanging-tuck-hold`
- `hanging-windshield-wiper-regression`
- `pullup-isometric-top-hold`
- `side-lying-open-book`
- `suspension-anti-rotation-hold`
- `suspension-archer-pushup`
- `suspension-body-saw`
- `suspension-fallout`
- `suspension-stir-the-pot`

## Consumer/gym content parity sample

Both apps resolve the same engine view model. Sample:

- `ankle-mobility` cue="Drive the knee forward while the heel stays down and the arch doesn’t collapse" demo=notRequired href=/exercise/ankle-mobility
- `archer-pushup` cue="Shift weight with control" demo=planned href=/exercise/archer-pushup
- `assisted-box-squat` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-box-squat
- `assisted-hip-thrust` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-hip-thrust
- `assisted-nordic-eccentric` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-nordic-eccentric
- `assisted-pistol-squat` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-pistol-squat
- `assisted-reverse-lunge` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-reverse-lunge
- `assisted-single-leg-hip-thrust` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-single-leg-hip-thrust
- `assisted-single-leg-rdl` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-single-leg-rdl
- `assisted-skater-squat` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-skater-squat
- `assisted-split-squat` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-split-squat
- `assisted-step-up` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-step-up

## Hip abduction/adduction gap

Catalog hip abduction/adduction gap retained as follow-up — not auto-expanded in Phase 6; not treated as a new exercise redesign.
