# Production Post-Prescription Week Ontology Audit

Generated deterministically from the inactive production Post-Prescription Week Validator kernel.

Classification: `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_READY_FOR_FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORIZATION`.

Status: `PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL_IMPLEMENTED_NOT_ACTIVATED`. Activation: `NOT_ACTIVATED`.

| Concept | Classification | Finding |
| --- | --- | --- |
| Post-Prescription Week design contracts | DESIGN_INPUT_ONLY | Historical admission remains private and frozen |
| WeekPlanningHorizon | COMPATIBILITY_INPUT | Mapped explicitly into the normalized source snapshot |
| WeeklyIntent | COMPATIBILITY_INPUT | Identity and objective facts are read-only source truth |
| WeeklyDevelopmentObjective | COMPATIBILITY_INPUT | Normalized without changing purpose, priority, or target |
| WeeklyFrequencyIntent | PRODUCTION_READY_UNCHANGED | Allocation and prescribed frequency remain separate |
| WeekAllocationPlan | COMPATIBILITY_INPUT | Stable plan identity is supplied, never recomputed as allocation |
| SessionAllocationReservation | COMPATIBILITY_INPUT | Normalized reservation/opportunity responsibility |
| SessionAllocationDirective | COMPATIBILITY_INPUT | Optional typed source link; never parsed from prose |
| AllocationLedgerEntry | PRODUCTION_READY_UNCHANGED | Allocation establishes responsibility and zero dose credit |
| PlannedPrescriptionLedgerEntry | DUPLICATE_FACT | Canonical production source-event ledger is richer |
| WeekObjectiveSatisfactionState | DESIGN_INPUT_ONLY | Production derives prescribed realization status |
| SessionIntent | PRODUCTION_READY_UNCHANGED | Planner authority remains upstream |
| SessionNeed planner provenance | PRODUCTION_READY_UNCHANGED | Typed objective IDs carry ownership |
| SessionSkeleton | PRODUCTION_READY_UNCHANGED | Composer authority remains upstream |
| SessionExerciseAssignment | PRODUCTION_READY_UNCHANGED | Assignment/handoff identity owns source mapping |
| Production Prescription compilation | PRODUCTION_READY_UNCHANGED | Supported contract is validated explicitly |
| Production Exercise Prescription Plan | PRODUCTION_READY_UNCHANGED | Final dose blocks and revisions are immutable input |
| SourceExposureEventIdentity | PRODUCTION_READY_UNCHANGED | Exactly one canonical Week ledger row per event |
| Prescription revision ledger | PRODUCTION_READY_UNCHANGED | Exactly one final revision is required |
| Prescription dose blocks | PRODUCTION_READY_UNCHANGED | Purpose and contribution classification are canonical |
| Production Final Session Sequence Plan | PRODUCTION_READY_UNCHANGED | Final plan and duration interval are consumed |
| Sequence identity and revision ledger | PRODUCTION_READY_UNCHANGED | Final immutable sequence truth |
| Canonical exercise ontology | PRODUCTION_READY_UNCHANGED | Validates explicit mapping but cannot create it |
| Movement roles and action functions | PRODUCTION_READY_UNCHANGED | Separate typed relationship views |
| Muscle relationships | PRODUCTION_READY_UNCHANGED | Relationship lanes stay separate with no coefficients |
| Stress annotations | PRODUCTION_READY_UNCHANGED | Categorical planned potential only |
| Performance and completed response | WRONG_OWNER | Absent; Performance remains the future owner |
| Longitudinal Adaptation | WRONG_OWNER | Absent; no adaptation or progression decision |
| Direct production Week source | FUTURE_PRODUCTION_ADAPTER_REQUIRED | Future Planner/Composer may emit the same source contract |
| Production validation identity/revision | MISSING_VERSIONED_CONTRACT | Corrected by the new versioned production contracts |
