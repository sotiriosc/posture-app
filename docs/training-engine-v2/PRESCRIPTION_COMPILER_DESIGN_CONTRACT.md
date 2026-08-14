# Prescription Compiler Design Contract

Status: design-only. Production numeric Prescription generation is not implemented.

## Future Pure Input

The future compiler may consume:

- `SessionPrescriptionHandoff`;
- canonical `ExerciseDefinition`;
- `ExercisePrescriptionKnowledgeProfile`;
- session outcome goal;
- phase;
- assigned role and section;
- satisfied need IDs;
- current equipment;
- assessment;
- pain/response requirements;
- continuity and progression evidence;
- previous Prescription;
- completed performance/response history;
- reviewed Prescription policy;
- explicit evaluation time.

It must not consume prose as behavior, UI state, Week algorithm internals, hidden current time, or hidden exercise defaults.

## Future Output

The future compiler should produce one `ExercisePrescription` per assignment, one stable `sourceExposureEventId`, selected legal dose mode, structured dose, execution standard, timing prescription, provenance, rationale codes, unresolved requirements, and intended progression axes.

Missing policy returns `PRESCRIPTION_POLICY_REQUIRED`. Conflicting equal-authority policy returns `PRESCRIPTION_POLICY_CONFLICT`.

Design fixture status: `NON_PRODUCTION_PRESCRIPTION_FIXTURE`.

Fingerprint: `3281caade480eea9eab9a977b91608131b48f22b9c2a896cad512c69186eb053`.

## Full Compiler Design Lab

The new design lab adds typed source exposure events, revisions, ordered dose blocks, compiler input/output statuses, and policy traces. It remains design-only and exports no production `compilePrescription`.

Compiler input/output fingerprint: `e7522c01e2cfeb3ad34b3527d9952845b175463fa3c85d476e299db90609d6e2`.

## Prescription Policy V1 Owner Admission

The next Compiler may implement V1 only after separate authorization. It must preserve assignments, source events, duration unknowns, load evidence, and the no-automatic-progression boundary.

<!-- PRODUCTION_PRESCRIPTION_COMPILER_START -->

## PRESCRIPTION_COMPILER_DESIGN_CONTRACT production Compiler update
The explicit production Prescription Compiler kernel is `PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTED_NOT_ACTIVATED` with `PRESCRIPTION_POLICY_V1_STABLE_ADAPTIVE_CORE@1.0.0` available only by explicit injection. Gate 9 is `PRODUCTION_KERNEL_AUTHORITY`; Gate 10 remains `MIXED_HANDOFF_AUTHORITY`; Gate 11 remains `FOUNDATION_AUTHORITY`. Existing generators and apps are unchanged. See `PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTATION_READINESS.md`.

<!-- PRODUCTION_PRESCRIPTION_COMPILER_END -->
