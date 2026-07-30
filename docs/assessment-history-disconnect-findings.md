# Assessment History Disconnect Findings

Investigation date: 2026-07-30

Scope: read-only sweep of the Praxis assessment/posture-analysis path in `@praxis/engine` and the results UI. No code or data changes were made during the investigation.

## Summary

The Knowledge and Analysis panel and the progress movement-quality trend are not guaranteed to describe the same persisted assessment signal today.

`forward_head` is a real engine finding, not a seed-only concept. It can be detected from `PoseAnalysis.metrics.headForwardOffset`, surfaced as a headline observation, and used as a pose-focus tag. The disconnect is persistence and presentation: the headline report is stored as top-level `app_user_state.assessment`, while the movement-quality trend reads per-program `program.assessmentHistory`. For the demo user, those were seeded separately, so the report can mention trunk, hip, and knee findings while the trend showcases `forward_head` improvement.

For real users, the deeper structural issue is that the live photo path writes an `AssessmentReport`, but no production writer was found that turns accepted live pose analysis into `Program.assessmentHistory` snapshots.

## Classification Key

- A: Demo-seed inconsistency. Seeded data was written separately and can be made internally consistent later.
- B: Real structural disconnect. A real user could see drift or missing behavior because systems are not wired together.
- C: Working as designed. Multiple findings/sources exist by design, though presentation may still need refinement.

## Findings

| Area | File/line | Finding | Class |
| --- | --- | --- | --- |
| Pose metric source | `packages/engine/src/poseAnalyzer.ts:128` | `computeMetrics` produces the shared metric shape, including `headForwardOffset`, `torsoLeanAngle`, `hipToShoulderAlignment`, `hipShift`, and `kneeAlignmentDelta`. | C |
| Pose observations | `packages/engine/src/poseAnalyzer.ts:247` | `generateObservations` thresholds those metrics and emits observation strings. `headForwardOffset > 0.08` emits a forward-head observation. | C |
| Assessment report builder | `packages/engine/src/assessmentEngine.ts:56` | `buildPoseObservations` maps pose observation strings into headline report observations. It supports `pose-forward-head`, `pose-hip-shift`, `pose-knee-alignment`, and `pose-trunk-bias`. | C |
| Report shape | `packages/engine/src/assessmentEngine.ts:23` | `AssessmentReport` stores observations, priorities, summary, and disclaimers only. It does not include raw `poseAnalysis` metrics. | B |
| Report persistence | `packages/engine/src/trainingStoreDb.ts:46` | `app_user_state.assessment` is the top-level JSONB slot for the current assessment report. | C |
| Report write path | `apps/consumer/src/components/results/usePoseAssessment.ts:149` | The live consumer photo path builds an `AssessmentReport` and writes only `{ assessment: report }` through `pushTrainingPatch`. | C |
| Gyms report write path | `apps/gyms/src/components/results/usePoseAssessment.ts:142` | The gyms path mirrors the consumer behavior and writes only `{ assessment: report }`. | C |
| Report load path | `apps/consumer/src/components/results/useResultsBootstrap.ts:40` | Results loads `snapshot.assessment` into `remoteAssessment`, then `usePoseAssessment` displays that saved report when no fresh photo analysis is available. | C |
| Knowledge and Analysis copy | `apps/consumer/src/components/results/programDashboardSelectors.ts:66` | The "Movement patterns" list is derived from generated program focus fields and exercise tags, not directly from the assessment report. | C |
| Assessment-derived copy | `apps/consumer/src/components/results/programDashboardSelectors.ts:83` | Stability/control and compensation rows filter the current `AssessmentReport.observations` by regex. These rows can describe different findings than the movement-pattern list. | C |
| Movement-quality trend source | `apps/consumer/src/components/results/progressMetrics.ts:62` | `calculateAssessmentMovementQualityPercent` reads `program.assessmentHistory`, compares baseline/latest observations by `focusTag`, and scores measured-value improvement against threshold. | C |
| Program assessment history type | `packages/engine/src/types.ts:622` | `AssessmentSnapshot` is intended to persist accepted/retested assessment events with `focusTag`, `measuredValue`, `threshold`, and confidence. | C |
| Missing production snapshot writer | `packages/engine/src/types.ts:622` plus repo search | The type comment says snapshots are written when a new pose analysis is accepted, but no production builder/writer was found. Search found only tests/debug seed creating `AssessmentSnapshot` records. | B |
| Program assembly pass-through | `packages/engine/src/program.ts:33851` | `generateWeeklyProgram` can persist `assessmentHistory` only when callers provide it in options. It does not append a new live snapshot itself. | B |
| Engine adapter omission | `packages/engine/src/engine/engine.ts:513` | Normal engine generation passes `poseAnalysis` and `assessmentReport`, but not `assessmentHistory` or `focusTagLifecycle`, so production generation does not create the progress trend history. | B |
| Demo forward-head history | `packages/engine/src/__debug__/seedDemoUser4WeekHistory.ts:168` | The demo seed creates five `forward_head` snapshots with measured values trending down around `0.31 -> 0.12`; this is separate from `app_user_state.assessment`. | A |
| Demo program payload | `packages/engine/src/__debug__/seedDemoUser4WeekHistory.ts:322` | The demo seed attaches `assessmentHistory` and `focusTagLifecycle` directly to the seeded program payload. | A |
| Forward-head detection as headline | `packages/engine/src/assessmentEngine.ts:123` | If a pose observation string contains "forward head", the report builder emits `pose-forward-head` with neck/upper-back focus tags. | C |
| Forward-head detection as program focus | `packages/engine/src/engine/poseFocus.ts:73` | `derivePoseFocus` emits the `forward_head` focus tag from `headForwardOffset > 0.08` when confidence passes the floor. | C |
| Saved-report raw pose fallback | `packages/engine/src/program.ts:433` | `resolvePoseAnalysisFromSources` tries to recover `assessmentReport.poseAnalysis`, but normal `AssessmentReport` does not contain that field. After reload, a saved report alone cannot recover raw pose focus metrics. | B |
| Program movement profile gap | `packages/engine/src/movementProfile.ts:94` and `packages/engine/src/program/programAssembly.ts:116` | `buildMovementProfile` accepts an assessment report and can score asymmetry from pose observations, but program assembly was not passing the report into it. This means generated programs could ignore assessment findings in movement-profile metrics. | B |
| Retest cadence staleness | `apps/consumer/src/components/ResultsRoutine.tsx:1115` | Retest prompt logic derives `lastRetestSessionCount` from `assessmentHistory.length`, not real session count, despite `RETEST_SESSION_CADENCE = 28`. Deferred. | B |
| Retired-tag session count gap | `packages/engine/src/results/resultsProjection.ts:206` | Retired focus tags use `retiredAtSessionCount: 0` because session count is not stored in lifecycle state. Deferred. | B |

## Answer To The Source-Of-Truth Question

For a live first-run user with fresh photos, the report and generated program can originate from the same in-memory `PoseAnalysis`: `ResultsRoutine` passes `poseState.analysis` and `poseState.report` into engine signals before initial generation.

After persistence/reload, they are not one durable source of truth. The saved current assessment report is top-level `app_user_state.assessment`, while progress trend history is per-program `program.assessmentHistory`. Since production code does not create `AssessmentSnapshot` records from accepted pose analysis, real users will usually have no assessment-history trend unless another path supplies it. If a future or seed path supplies `assessmentHistory`, it can disagree with the current report unless the systems are explicitly reconciled.

## Deferred Work

- Build the production writer that converts accepted live `PoseAnalysis` into `Program.assessmentHistory` snapshots and updates `focusTagLifecycle`.
- Reconcile or explain the relationship between top-level `app_user_state.assessment` and per-program `program.assessmentHistory`.
- Fix retest cadence to use real session counts rather than snapshot count.
- Decide whether Knowledge and Analysis should visually separate program focus areas from assessment observations more clearly.
