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
