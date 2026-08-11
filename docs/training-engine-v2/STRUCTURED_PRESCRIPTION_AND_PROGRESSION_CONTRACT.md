# Structured Prescription and Same-Exercise Progression Contract

`ENGINE_V2_BLUEPRINT.md` is authoritative. This contract implements type, validation, observability, and synthetic fixture evidence only. It does not generate user prescriptions, choose production sets/reps/loads, choose progression thresholds, add exercises, or start Session Composer.

## Owner Doctrine

The enduring reasoning chain is:

```text
task-appropriate alignment
-> repeatable form
-> appropriate dose
-> observed response
-> earned progression
-> adaptation
```

Alignment means organizing the body appropriately for the intended task. It is not cosmetic posture, diagnosis, perfect symmetry, or a reason to withhold all training until a photo looks ideal.

Form means repeatable execution that preserves the intended purpose of the exercise for this athlete. It is represented through traceable execution-quality criteria, not a vague "good form" string.

Dose means the actual planned exposure: sets, reps, time, breaths, distance, trips, steps, load, side, lever, support, range, tempo, effort, and rest.

Progression is earned through evidence. It is not merely more weight, a harder-looking exercise, less support, a phase change, elapsed time, or exercise novelty.

Same-exercise progression changes the prescription while preserving exercise identity. Exercise replacement is a separate transition decision and still has no automatic selection effect.

One prescription is one source exposure event. A carry can express gait, bracing, anti-lateral flexion, grip, and load transfer without becoming several cloned full-dose events.

## Current-Contract Inventory

| Concept | Current type before this contract | Current fields | Current consumers | Current behavior | Current trace | Duplication | Gap | Proposed authority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ExercisePrescription | `prescriptionProgression.ts` interface | `exerciseId`, `phaseId`, optional `sets`, `reps`, `timeSeconds`, `effortTarget`, `tempo`, `rangeInstruction`, `supportInstruction`, `restSeconds`, `rationale` | `DecisionTrace` optional type only; no production compiler | No production prescription generation | Optional `DecisionTrace.prescriptionDecision` | Free-text and scalar fields mixed dose, effort, support, range, and rationale | No stable identity, no source exposure event, no discriminated dose, no explicit created time, no execution standard | `prescription/prescription.ts` canonical `ExercisePrescription`; legacy adapter is explicit only |
| `sets` | Optional number | Number | None meaningful | No behavior | None | Duplicates future count targets | No integer/range/unknown distinction | `CountTarget` inside discriminated dose |
| `reps` | Optional string | Free text | None meaningful | No behavior | None | String can hide exact/range/unknown | Would require parsing | `CountTarget` repetitions |
| `timeSeconds` | Optional number | Number | None meaningful | No behavior | None | Collapses holds, carries, and marches | No mode or unit semantics | `TimeTarget` in timed hold, timed carry, or step march |
| `effortTarget` | Optional string | Free text | None meaningful | No behavior | None | May blur RIR, RPE, quality limit, and phase effort | Would require parsing | `EffortTarget` |
| `tempo` | Optional string | Free text | None meaningful | No behavior | None | Behavioral timing hidden in prose | No structured eccentric/pause/intent | `TempoPrescription` |
| `rangeInstruction` | Optional string | Free text | None meaningful | No behavior | None | Range semantics hidden in prose | Cannot distinguish full, partial, reviewed, unknown | `RangePrescription` |
| `supportInstruction` | Optional string | Free text | None meaningful | No behavior | None | Support level, surface, and side hidden in prose | Cannot represent wall side vs load side | `SupportPrescription` and `PrescriptionSideBehavior` |
| `restSeconds` | Optional number | Number | None meaningful | No behavior | None | No exact/range/unknown distinction | Zero/omitted ambiguity | `RestTarget` |
| `rationale` | String | Free text | None meaningful | No behavior | Optional trace only | Prose could become accidental authority | No provenance | `rationale[]` plus `EvidenceProvenance` |
| ExerciseProgressionAxis | `domain/exercise.ts` union | Existing 9 axes | Exercise metadata and `progression_value` | Same-exercise runway scoring | Candidate score component | Duplicate with prescription axis union | Missing carry, hold, lever, breath, rest axes | `domain/progression.ts` `ProgressionAxis` |
| ProgressionAxis | `prescriptionProgression.ts` union | Existing 9 axes | `ProgressionDecision.axis` type only | No implementation | Optional progression decision | Duplicate authority | Missing dose-mode axes | Re-export canonical `ProgressionAxis` |
| PhaseProgressionIntent.preferredProgressionAxes | Inline union | Existing 9-axis subset | Phase metadata and scoring | Existing behavior unchanged | Phase trace through scoring | Third duplicate axis vocabulary | Cannot mention future prescription axes safely | Imports canonical `ProgressionAxis`; values unchanged |
| ProgressionDecision | `prescriptionProgression.ts` interface | `exerciseId`, `action`, optional `axis`, `keepsExerciseStable`, `reason`, `requiresHumanReview` | `DecisionTrace` optional type only | No implementation | Optional trace only | Axis type duplicated | `progress_prescription` and `replace_exercise` not input-grounded | `progressionEvidence.ts` with canonical axis and explicit same-exercise boundary |
| ExerciseHistoryEvent | `domain/history.ts` | `id`, `exerciseId`, `type`, optional `occurredAt`, optional `movementRole`, `notes` | Candidate continuity/scoring | Current behavior unchanged | Candidate traces | History has no prescription/performance link | Cannot refer back to one source prescription | Future-facing progression model input accepts structured history plus records |
| ProgressionState | `domain/history.ts` | ready/hold/stalled exercise IDs and successful movement roles | Candidate `progression_value` and continuity | Current behavior unchanged | Score reasons | State is exercise-ID level only | No dose or quality evidence | `ProgressionEvidence` and `ProgressionReadinessTrace` |
| PrescriptionCompilerContract | `prescriptionProgression.ts` | selection plus optional prior prescription | No production implementation | None | None | Old contract could use hidden time | No explicit evaluation time | Requires explicit `evaluationContext.asOf` |
| ProgressionModelContract | `prescriptionProgression.ts` | prescription plus `recentHistoryEventIds` | No production implementation | None | None | Too little evidence | Could not inspect dose, performance, quality, pain, recovery, axes, phase | Refactored input in `progressionEvidence.ts` |

Finding: there is no meaningful production prescription compiler. The clean migration path is valid. `prescriptionProgression.ts` is now a thin re-export/compatibility boundary.

## Module Architecture

Primary source modules:

| Module | Owner question |
| --- | --- |
| `domain/progression.ts` | What is the canonical same-exercise progression-axis vocabulary? |
| `prescription/dose.ts` | What planned work is prescribed? |
| `prescription/load.ts` | What load form, unit, application, and side truth is prescribed? |
| `prescription/executionStandard.ts` | What alignment/form criteria must be preserved? |
| `prescription/prescription.ts` | What stable source prescription was planned? |
| `prescription/performanceOutcome.ts` | What actually happened? |
| `prescription/progressionEvidence.ts` | What evidence exists for or against same-exercise progression? |
| `prescription/trace.ts` | What readiness classification is inspectable without selecting progression? |
| `prescription/validation.ts` | Is the prescription context executable? |
| `prescriptionProgression.ts` | Public compatibility re-export boundary |

No production code infers dose, form, load, side, support, or progression from exercise ID, name, summary, coaching prose, tags, or fixture identity.

## Canonical Progression Axes

The canonical vocabulary is:

`load`, `reps`, `sets`, `range`, `tempo`, `support_reduction`, `stability`, `coordination`, `complexity`, `duration`, `distance`, `trips`, `steps`, `lever`, `effort`, `rest_reduction`, `breath_cycles`.

Not axes: alignment, form, pain tolerance, symptom tolerance, safety, exercise replacement, novelty, or phase change.

Current production exercise progression-axis arrays and current phase preferred-axis arrays are unchanged.

Future axis-selection order:

1. Is progression evidence sufficient?
2. Which progression axes are legal for this exercise?
3. Which axes fit the phase and goal?
4. Which axis least disrupts established form and pain tolerance?
5. Is one axis sufficient?
6. Should the prescription instead be held?
7. Is there a real replacement reason?

## Structured Dose Modes

The contract supports six discriminated modes:

| Mode | Required structured truth |
| --- | --- |
| `repetition_sets` | set count, repetition target/range, optional per-side semantics, load, range, tempo, effort, rest |
| `timed_hold` | set count, duration target, side where relevant, load where relevant, lever, support, effort, rest |
| `breath_cycles` | rounds, breath-cycle target, optional breathing standard, rest if relevant |
| `distance_carry` | trips, distance per trip, load, laterality/side, rest, gait-control standard |
| `timed_carry` | trips, duration per trip, load, laterality/side, rest, gait-control standard |
| `step_march` | stationary truth, steps or time, load side, support side, alternation, support level, march-control standard, rest |

Breaths are not repetitions. Stationary marches cannot claim distance or carry-distance credit. Distance carries require distance truth. Timed carries require duration truth.

## Load Contract

`LoadTarget` distinguishes:

- bodyweight;
- exact or ranged external load with explicit `kg` or `lb`;
- machine stack or machine setting;
- cable stack;
- band tension;
- user-selected load governed by effort;
- unknown;
- not prescribed.

Applications include total, per hand, single implement, unilateral side, machine stack, and cable stack. One-sided external load requires side truth. Farmer-carry fixtures express per-hand load without unilateral side. Suitcase fixtures express one unilateral implement with side truth. Machine settings and band tension are not converted to kilograms.

## Laterality, Support, Lever, Range, Tempo, Effort, And Rest

Prescription laterality distinguishes bilateral, single left/right, each side, and alternating. `PrescriptionSideBehavior` can expose movement side, load side, support side, starting side, side relationship, and alternation.

Support distinguishes full, partial, light-touch, none, and unknown, with surface and side where applicable.

Lever distinguishes shortened/regressed, standard, lengthened/extended, and unknown. A stable variant reference can identify a same-exercise variant where generic lever language is insufficient.

Range distinguishes full available, intentionally partial, custom reviewed, and unknown. Tempo carries structured eccentric duration, pause duration, concentric intent, and end-range pause where applicable.

Effort supports RIR range, RPE range, phase qualitative band, quality-limited effort, self-selected reviewed standard, and unknown. RIR and RPE are not automatically converted.

Rest is an explicit positive seconds target or range, not a universal progression axis.

## Execution Standard

`ExecutionStandard` references:

- `alignmentPriorityIds`;
- normalized `assessmentPriorityIds`;
- `painResponseRequirementIds`;
- exercise mechanics intent;
- traceable `ExecutionQualityCriterion` rows.

Criterion dimensions include position control, movement control, range control, tempo control, breathing/pressure control, support control, side or symmetry control, gait/load-transfer control, and exercise-intent preservation.

Importance values are required for progression, preferred, and observational. Required criteria need unique IDs and provenance. Criterion descriptions explain human meaning and are not parsed for behavior.

## Planned Versus Completed Exposure

Planned work is `ExercisePrescription`. Completed work is `ExercisePerformanceRecord`.

Performance records expose performance ID, prescription ID, exercise ID, explicit occurrence time, completion status, actual completed dose, quality observations by criterion ID, unresolved pain-response evidence IDs, recovery evidence/status, substitutions, notes, and provenance.

Completion status distinguishes completed as planned, partially completed, target not met, not performed, substituted, and unknown.

Quality observations distinguish met, partially met, not met, and not observed. Not observed is not met. Required criteria are not averaged into a generic form score.

## Progression Evidence

`ProgressionEvidence` keeps separate categories for:

- dose evidence;
- execution-quality evidence;
- pain/response evidence;
- recovery evidence;
- continuity/runway evidence;
- repeated-evidence status.

Unknown evidence does not become readiness. One failed required criterion remains visible even if several other criteria are met. Pain response, recovery concern, failed progression, and replacement consideration remain explicit blockers.

## Progression Readiness

`ProgressionReadinessTrace` can classify:

- `READY_FOR_PROGRESSION_REVIEW`;
- `HOLD_CURRENT_PRESCRIPTION`;
- `REGRESSION_OR_REVIEW_REQUIRED`;
- `INSUFFICIENT_EVIDENCE`.

Ready means only that structured evidence does not currently block a human or policy progression review. It does not select an axis, increase load, add volume, reduce support, replace the exercise, or advance phase. The trace always has `selectedAxis=null`, `selectedTransition=null`, and `automaticProgressionDecision=false`.

## Same-Exercise Progression Versus Transition

Same-exercise progression modifies prescription and preserves exercise identity.

Exercise transition changes exercise identity and requires separate replacement evidence. Current transition relationships still have `automaticSelectionEffect=none`.

No universal ladders are created, including Dead Bug to Forearm Plank, Dead Bug to Rollout, Pallof Press to Cable Chop, or Side Plank to Suitcase Carry.

## Synthetic Trunk/Carry Fixtures

The tests include artificial contract fixtures only:

| Fixture | Dose mode | Key semantics |
| --- | --- | --- |
| Forearm Plank | `timed_hold` | sets, duration, lever, support, quality-limited effort, required position criterion |
| Forearm Side Plank | `timed_hold` | each-side hold, lever/support regression, lateral-position criterion |
| Machine Abdominal Crunch | `repetition_sets` | machine load/setting, range, tempo, RIR, controlled-flexion criterion |
| Half-Kneeling High-to-Low Cable Chop | `repetition_sets` | per-side cable work, high-to-low path, range, tempo, RPE, rotation and pelvis criteria |
| Farmer Carry | `distance_carry` | trips, metres, per-hand load, bilateral truth, gait and bracing criteria |
| Suitcase Carry | `timed_carry` | timed trips, unilateral load side, each-side behavior, gait and lateral-control criteria |
| Wall-Supported Suitcase March | `step_march` | stationary steps, load side, support side, opposite-side relationship, no distance truth |

These are validation fixtures, not recommended prescriptions.

## Validation Boundary

`validateStructuredPrescriptionContext` accepts exercise definition, equipment capabilities, equipment validation findings through existing validation, and structured prescription.

It distinguishes:

- `VALID_PRESCRIPTION_CONTEXT`;
- `INVALID_EQUIPMENT_INPUT`;
- `MISSING_REQUIRED_EQUIPMENT`;
- `INVALID_DOSE`;
- `UNRESOLVED_EXECUTION_REQUIREMENT`.

Invalid `EquipmentCapabilities` cannot become executable prescription truth. `loaded_gait_space=true` still cannot bypass the existing inconsistent-input finding when stable loaded standing is false.

Validation proves:

- all dose modes are discriminated;
- mode-required fields are present;
- mode-incompatible fields are rejected;
- counts are positive integers;
- ranges are ordered;
- time, distance, rest, and load are finite and positive where prescribed;
- stationary marches cannot claim distance;
- distance carries require distance truth;
- timed carries require duration truth;
- unilateral load requires side truth;
- farmer per-hand load can remain bilateral;
- per-side repetition work requires each-side semantics;
- support side and load side are separately representable;
- unknown is not converted to zero;
- RPE and RIR ranges are bounded and not converted;
- required form criteria have unique IDs and provenance;
- quality-limited effort references valid required criteria;
- failed required quality prevents readiness;
- unresolved pain response prevents readiness;
- recovery concern prevents readiness;
- insufficient observation remains insufficient evidence;
- readiness never selects an exercise transition.

## Counterfactual Invariants

Tests prove:

- changing prescription-only data does not alter hard eligibility or ranking;
- changing execution-standard prose does not change structured behavior;
- adding alignment criterion data does not legalize a wrong-role exercise;
- adding axes to the domain vocabulary does not add them to current exercises;
- progression evidence cannot activate transition relationships;
- one failed form criterion cannot be hidden by several met criteria;
- one carry prescription remains one source event;
- unknown load/dose is explicit, not zero;
- production prescription code does not infer behavior from exercise IDs, names, summaries, cues, or tags.

## Current-Behavior Invariance

Required fingerprints remain unchanged:

| Artifact | Fingerprint |
| --- | --- |
| 22-scenario ranking | `d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782` |
| Comprehensive behavior | `216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9` |
| Reference catalog | `e3f77e85e70e8e3d27d6845dd46c253f61b38629aba08580cfa757d4943fe73c` |
| Current equipment legality | `50881bd4cd735954dae1d9a8574165d5a6bff40d8af990c8324a21ba8436b8e6` |
| Expanded equipment fixtures | `98f672133e3498b84f47e81751f1fbf443faae556029835fec5b30b90d884117` |

## Unresolved Scientific And Policy Questions

- Final prescription targets, thresholds, and progression increments.
- Required number of successful exposures before progression.
- Axis order for individual exercises and phases.
- Final pain/stress vocabulary for trunk/carry work.
- Seven-exercise owner curation and production metadata.
- Role/section-scoped phase evidence and final phase coefficients.
- Weekly Development Ledger exposure targets and credit policy.
- Future normalized trunk assessment features.

## Readiness Classification

**STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT_READY**

Do not call prescription calibrated. Do not call progression implemented.

Next dependency:

**TRUNK / CARRY PAIN-STRESS VOCABULARY AND RECEIVER REVIEW**

Then:

exact seven-exercise owner curation and production metadata.
