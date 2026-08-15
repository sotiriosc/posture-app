# Weekly Ledger Boundary

Status: `DESIGN_READY` boundary proposal. Planned Prescription and completed response ledgers are deferred.

Three ledgers are required because allocation, prescription, and performance answer different questions.

## Allocation Ledger

Owned by the Week Allocation Composer. An entry names weekly objective, reservation IDs, allocated opportunity count, allocation satisfaction state, and literal `doseCredit: 0`. It may answer where responsibility was reserved. It cannot answer what exercise or dose was prescribed, performed, tolerated, or adapted to.

## Planned Prescription Ledger

Owned by future Prescription/post-Prescription evaluation. An entry is keyed by one source exposure event and records reservation, exercise, Prescription, role/section, muscle-contribution relationships, prescribed dose, realized stress estimate, and recovery burden. One source event must not be counted again merely because it contributes to movement, action, capacity, and muscle views.

Muscle contribution remains a relationship (`direct`, meaningful secondary, stabilizing, or other reviewed ontology), never an unreviewed fractional set coefficient. Set-equivalence semantics are explicitly absent.

## Completed Response Ledger

Owned by completed-performance collection and Longitudinal Adaptation. An entry records source exposure, performance, adherence, execution quality, symptom response, recovery response, progression response, and re-exposure evidence. Only this layer may establish actual completed exposure and observed response.

## Boundary Rules

- Allocation count is not dose.
- Prescribed dose is not completed performance.
- Completed performance is not adaptation by itself.
- Expected future recovery burden is not observed readiness.
- Weekly frequency allocation can be validated before dose only as an allocation fact.
- Prescribed weekly validation is blocked until Prescription defines source-event and aggregation semantics.

## Evidence Amendment (2026-08-12)

The evidence review reinforces this boundary: participation guidance is not objective frequency, frequency is not set dose, volume is not opportunity count, and indirect contribution evidence is not a Praxis coefficient. The Product horizon ledger adds factual availability/revision history only; completed opportunities and prescriptions remain immutable.

<!-- POST_PRESCRIPTION_WEEK_VALIDATION_V1:START -->
## Post-Prescription Week Validation V1

Design admission: `POST_PRESCRIPTION_WEEK_VALIDATION_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION`. Gate 13 authority is `POST_PRESCRIPTION_WEEK_VALIDATION_DESIGN_EVIDENCE`; Gates 14-15 remain `NOT_IMPLEMENTED` and Gate 16 remains `FOUNDATION_ONLY`. The three-ledger invariant, source-event uniqueness, final Prescription/Sequence revisions, objective provenance, contribution truth, dose-lane separation, planned stress/duration/spacing, and no-downstream-rescue behavior are admitted as design evidence only. No production validator, Week activation, app wiring, Performance ingestion, or Longitudinal behavior exists. Combined design fingerprint: `6beea85cca5cfb73343c1ae7b6705ba6a9be4a6b82c737d09945357f6563fb82`.
<!-- POST_PRESCRIPTION_WEEK_VALIDATION_V1:END -->

<!-- PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL:START -->
## Production Post-Prescription Week Validator Kernel

Classification: `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_READY_FOR_FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORIZATION`. Status: `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_IMPLEMENTED_NOT_ACTIVATED`. The public pure kernel consumes `PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT@1.0.0` with explicit policy injection and owns production Gate 13 authority. Golden evidence is `128/128` common-semantic matches with `0` unexplained differences and `860/860/860` expected/observed/unique events. Gate 14 and Gate 15 remain `NOT_IMPLEMENTED`; Gate 16 remains `FOUNDATION_ONLY / NOT_IMPLEMENTED`. There is no app, generateProgram, Product Horizon, Performance, Longitudinal, UI, implicit policy, or runtime design-adapter wiring. Combined production fingerprint: `c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951`.
<!-- PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL:END -->

<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:START -->
## Production Week Planner And Allocation V1

PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_IMPLEMENTED_NOT_ACTIVATED. The pure Planner, allocation Composer, materializer, reallocation proposal kernel,
canonical Week Policy V1, Gate 13 projection, and CAGT Registry V9 are implemented and exported but inactive.
No Product Horizon call, calendar read, persistence write, plan application, deload construction, or Product behavior is active.
Exact next dependency: `ADAPTATION_APPLICATION_ORCHESTRATION_V1_AUTHORIZATION`.

Combined fingerprint: `4f3fd80ed3fee29cb12c88ef6dea38b6e5f70777ac4718391daa8e7548527387`.
<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:END -->
