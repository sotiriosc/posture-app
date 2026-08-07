# Program Quality V2 — Phase 7 Gate Inventory

## Mode contracts (canonical owners)

| Mechanism | Owner | When | Modes | Prod-capable? | Hard failures | Warnings / deferred | Machine-readable |
|-----------|-------|------|-------|---------------|---------------|---------------------|------------------|
| Gym contract | `program/gymProgramContract.ts` `validateGymProgramContract` | Audits/tests | gym | No (audit-only today) | `GYM_*` codes | `collectDeferredExperienceGaps` | Yes |
| Dumbbell contract | `program/dumbbellProgramContract.ts` | Audits/tests | dumbbells | No | `DUMBBELL_*` | deferred demo/cues/progression | Yes |
| Band contract | `program/bandProgramContract.ts` | Audits/tests | bands | No | `BAND_*` | deferred + anchor_safety | Yes |
| Bodyweight contract | `program/bodyweightProgramContract.ts` | Audits/tests | bodyweight | No | `BODYWEIGHT_*` | deferred + capability_limitation | Yes |
| Mixed-home contract | `program/mixedHomeProgramContract.ts` | Audits/tests | mixedHome | No | `MIXED_HOME_*` | deferred + capability_limitation | Yes |
| Coaching completeness | `coaching/validateExerciseCoaching.ts` | `audit:exercise-coaching` | all | Partial (resolver in prod UI) | `MISSING_*` / refs | planned demos | Yes |

## Matrix / coverage

| Mechanism | Owner | Notes |
|-----------|-------|-------|
| Coverage matrix | `__debug__/coverageContractAudit.ts` | Day specs, weekly calves/push/pull, intelligence (upper-day hinge) |
| Phase matrix | `__debug__/phaseMatrixProgramPrint.ts` | Profiles × days × equipment × phase → coverage |
| Program contract print | `__debug__/programContractAudit.ts` | Lane counts summary (not mode hard-fail) |

## Generation pipeline

| Stage | Owner | Quality role |
|-------|-------|--------------|
| `runWeeklyGenerationPipeline` | `postGenerationPipeline.ts` | normalize / substitute / repair / warnings |
| Authorship + coverage repairs | `program.ts` | mode templates, weekly coverage |
| `finalizeWeeklyProgramResult` | `programFinalization.ts` | coaching metadata → `assembleProgram` |
| Persist | apps `saveProgram` | Only after engine returns approved `Program` |

Overlaps: mode contracts vs coverage intelligence (upper hinge); deferred coaching gaps vs Phase 6 written completeness; structural scores vs hard failures (scores must not override).

Conflicts: none intentional; Phase 7 unifies severity mapping.

## Phase 7 production gate

| Mechanism | Owner | Notes |
|-----------|-------|-------|
| Unified evaluator | `program/qualityGate/evaluateProgramQuality.ts` | Composes mode contracts + deferred + week coaching + signatures |
| Severity policy | `programQualityPolicy.ts` | hardFailure / warning / capabilityLimitation / deferredContent |
| Recovery + fallback | `recoverProgramQuality.ts` + `modeQualityFallback.ts` | ≤2 seed-offset retries, then mode-template seed fallback |
| Structured failure | `ProgramQualityGateError` + engine `quality_failed` | Apps must not persist invalid plans |
| Boundary | after `finalizeWeeklyProgramResult`, before return | `skipQualityGate` for audit/recovery re-entry |

## Fallbacks

Mode-identity-preserving canonical seeds re-enter existing template authorship (not a second generator). Fallback must pass the same evaluator.

## Baselines (resolved in Phase 7)

- `BASELINE_GYM_5D_PAIN_GROWTH_CALVES_ACCESSORY` — fixed via calves accessory planning/coverage
- `BASELINE_GYM_5D_PAIN_GROWTH_UPPER_HINGE_INTELLIGENCE` — fixed via upper-day hinge eligibility
