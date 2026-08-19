# Full Prescription Ontology Audit

Classification: `FULL_PRESCRIPTION_DESIGN_READY_FOR_NUMERIC_POLICY_TOURNAMENT_NOT_PRODUCTION`.

This audit extends the timing foundation without rebuilding it. Current `ExercisePrescription` is valid as a legacy single-dose compatibility surface, but it is not sufficient as the complete future Prescription plan because it cannot truthfully represent ramp-up, primary work, backoff work, technique work, different rest targets, substitutions, or block-level performance.

## Findings

| Concept | Classification | Decision |
|---|---|---|
| `ExercisePrescription` | `OVERLOADED_CONCEPT` | Keep as compatibility projection; future plan requires revisions and blocks. |
| `ExerciseDose` | `CORRECT_SINGLE_PURPOSE_CONCEPT` | One dose object remains one dose realization. |
| Seven dose modes | `CORRECT_SINGLE_PURPOSE_CONCEPT` | `repetition_sets`, `timed_hold`, `breath_cycles`, `distance_carry`, `timed_carry`, `step_march`, `step_sets`. |
| `DoseBase` | `OVERLOADED_CONCEPT` | Shared fields are legal, but rest/load/effort owners differ by policy. |
| Load, effort, rest | `POLICY_OWNER` | Numeric or qualitative values require reviewed policy. |
| Range, support, lever, side | `COMPILER_OWNER` | Compiler resolves only from structured requirements and reviewed policy. |
| Tempo V2 and cadence | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Existing timing foundation is consumed, not redesigned. |
| `ExecutionStandard` | `OVERLOADED_CONCEPT` | Requires policy trace for future compiler output. |
| `ExercisePerformanceRecord` | `MISSING_BLOCK_STRUCTURE` | Future performance needs block-level linkage. |
| `ProgressionEvidence` | `LONGITUDINAL_OWNER` | No automatic progression. |
| `TrainingResponseReceiver` | `LONGITUDINAL_OWNER` | Receives evidence; does not rewrite Prescription history. |
| `SessionPrescriptionHandoff` | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Handoff-only authority remains intact. |
| Duration handoff | `MISSING_SOURCE_EXPOSURE_SEMANTICS` | Needs explicit Prescription and Sequencing facts before total duration. |
| Sequencing handoff | `OUT_OF_SCOPE` | Final order and transitions remain future Sequencing. |
| `ExercisePrescriptionKnowledgeProfile` | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Owns legal mechanical/timing possibilities, not numeric policy. |
| All 45 exercise rows | `CORRECT_SINGLE_PURPOSE_CONCEPT` | Catalog identity unchanged. |
| Legacy adapters | `LEGACY_COMPATIBILITY_ONLY` | May project a single block; must not become authority. |

## One-Dose Audit

Result: `OPTION_B_ORDERED_DOSE_BLOCKS_WITH_OPTION_D_LEGACY_COMPATIBILITY_PROJECTION`.

One uniform `dose` cannot truthfully encode main-exercise ramp-up sets, primary work, backoff work, different loads, different rep targets, different rest, substitutions, or planned-versus-actual block truth. Separate Prescriptions for preparatory and working work would create duplicate source exposure. The selected architecture is one plan with one event and one or more ordered blocks.

Fingerprint: `26a1305a7054d0c8e817d367b64aba07663c6ad7e1ad843e6d9c6a98f2750cee`.
