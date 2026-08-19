# Prescription Compiler Design Lab

The lab is deterministic and non-production only. It lives in `packages/training-engine-v2/tests/helpers/prescriptionCompilerDesignLab.ts`.

It consumes:

- real `SessionPrescriptionAssignmentHandoff`
- canonical `ExerciseDefinition`
- canonical `ExercisePrescriptionKnowledgeProfile`
- outcome goal, context, phase, role, section and satisfied needs
- explicit equipment and availability refs
- assessment, pain/response and continuity refs
- prior revision and performance refs
- `ReviewedPrescriptionPolicy`
- explicit evaluation time

It does not consume Week search internals, UI state, arbitrary prose, hidden clock, hidden catalog defaults, or production random seed.

Result statuses:

- `compiled_non_production_fixture`
- `prescription_policy_required`
- `prescription_policy_conflict`
- `unresolved_execution_requirement`
- `unsupported_dose_mode`
- `invalid_source_exposure_context`
- `contradictory_prescription_requirements`
- `insufficient_progression_evidence`
- `blocked_by_training_readiness`

Compilation order follows the 15-step pure order in `PRESCRIPTION_COMPILATION_ORDER`; no repair loop and no silent substitution.

Compiler input/output fingerprint: `e7522c01e2cfeb3ad34b3527d9952845b175463fa3c85d476e299db90609d6e2`. Compilation order fingerprint: `81fd0a7f1e0fc59f3c8757b2665f29059610bf9e11f3003a4e5fbd414f2a78d8`.

## Numeric Tournament Fixture Compiler

`packages/training-engine-v2/tests/cagt/prescriptionPolicyTournament.ts` adds an executable, test-only numeric fixture compiler that reuses the design lab contracts and validates every compiled fixture through source exposure, revision, dose-block, plan and performance linkage validators.

It produces concrete non-production `ExercisePrescriptionPlan` fixtures from the frozen numeric candidate lattice:

- sets, reps, breath cycles, steps, metres, trips and seconds are structured numeric targets
- effort uses reviewed qualitative/RIR/self-selected targets
- rest and duration remain explicit, partial or unknown rather than inferred
- block purpose distinguishes preparatory, developmental, technique and recovery work
- one source exposure event and one final revision are retained per assignment

Numeric tournament classification: `PRESCRIPTION_NUMERIC_POLICY_FRONTIER_READY_FOR_OWNER_SELECTION`.

Numeric tournament fingerprint: `9d7366c054dd01d01de132d7c358b18d4cc506aaaea962dd48d869ea68e5ac07`.
