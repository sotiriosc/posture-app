# Program Quality V2 — Phase 6 Coaching Audit

## Summary

- Catalog (all): **225**
- Active catalog: **224**
- Release-critical: **170**
- Complete release-critical: **170** (100%)
- Catalog-only / deferred: **54**
- Deprecated: cable-upright-row
- Demo status counts: available 0, planned 125, notRequired 45
- Required-demo video blockers (Phase 6 Owner Decision): **0** — missing videos are queued, not failed

## Canonical locations

- Registry: `packages/engine/src/coaching/exerciseCoachingRegistry.ts`
- Resolver/view-model: `packages/engine/src/coaching/resolveExerciseCoaching.ts`
- Contract: `packages/engine/src/coaching/exerciseCoachingContract.ts`

## Failure buckets

- none

## Catalog-only deferred sample

- `assisted-back-extension-hold`
- `assisted-box-squat`
- `assisted-cossack-squat`
- `assisted-good-morning`
- `assisted-hamstring-curl`
- `assisted-hip-hinge`
- `assisted-pistol-squat`
- `assisted-reverse-lunge`
- `assisted-shrimp-squat`
- `assisted-skater-squat`
- `assisted-split-squat`
- `assisted-step-up`
- `band-calf-raise`
- `band-chest-press-iso-hold`
- `band-external-rotation`
- `band-lateral-raise`
- `banded-lat-stretch`
- `cable-external-rotation-pressout`
- `cable-pallof-press`
- `dumbbell-side-lying-external-rotation`
- `dumbbell-suitcase-hold-march`
- `hanging-hollow-hold`
- `hanging-knee-raise`
- `hanging-leg-raise`
- `hanging-oblique-knee-raise`
- `hanging-tuck-hold`
- `hanging-windshield-wiper-regression`
- `machine-ab-crunch`
- `machine-shoulder-external-rotation`
- `prone-t-raise`
- `prone-y-raise`
- `pullup-isometric-top-hold`
- `self-resisted-triceps-extension`
- `side-lying-open-book`
- `suspension-anti-rotation-hold`
- `suspension-archer-pushup`
- `suspension-archer-row`
- `suspension-body-saw`
- `suspension-chest-fly`
- `suspension-face-pull`

## Consumer/gym content parity sample

Both apps resolve the same engine view model. Sample:

- `ankle-mobility` cue="Drive the knee forward while the heel stays down and the arch doesn’t collapse" demo=notRequired href=/exercise/ankle-mobility
- `archer-pushup` cue="Shift weight with control" demo=planned href=/exercise/archer-pushup
- `assisted-hip-thrust` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-hip-thrust
- `assisted-nordic-eccentric` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-nordic-eccentric
- `assisted-single-leg-hip-thrust` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-single-leg-hip-thrust
- `assisted-single-leg-rdl` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/assisted-single-leg-rdl
- `back-extension` cue="Lift chest with neutral spine" demo=planned href=/exercise/back-extension
- `back-extension-hold` cue="Brace and keep ribs stacked" demo=notRequired href=/exercise/back-extension-hold
- `back-widow` cue="Drive elbows into floor" demo=planned href=/exercise/back-widow
- `band-assisted-pullup` cue="Move with controlled tempo and stacked posture" demo=planned href=/exercise/band-assisted-pullup
- `band-biceps-curl` cue="Keep wrists neutral" demo=planned href=/exercise/band-biceps-curl
- `band-chest-fly` cue="Keep a soft bend in elbows and sweep hands together with control" demo=planned href=/exercise/band-chest-fly

## Hip abduction/adduction gap

Catalog hip abduction/adduction gap retained as follow-up — not auto-expanded in Phase 6; not treated as a new exercise redesign.
