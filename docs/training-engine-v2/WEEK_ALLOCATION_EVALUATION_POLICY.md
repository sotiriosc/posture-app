# Week Allocation Evaluation Policy

Status: `DESIGN_READY` for ordering semantics; numeric production thresholds remain `OWNER_POLICY_REQUIRED`.

The recommended evaluator compares complete week allocations using strict lexicographic precedence. No weighted total is produced.

## Evaluation Order

1. Hard validity and global training-safety permission.
2. Opportunity legality and immutable completion history.
3. Approved required minimum allocation satisfaction.
4. Required recovery-spacing constraints.
5. Feasible structural continuity relationships.
6. Opaque session-feasibility statuses.
7. Required- and priority-frequency vectors.
8. Lower stress-concentration burden.
9. Equipment/capacity coherence.
10. Preferred target allocation.
11. Optional unique marginal value.
12. Lower unnecessary-duplication burden.
13. Canonical deterministic tie-break.

Vectors remain objective-ordered so one priority cannot silently compensate for another. The evaluator may report `above_soft_ceiling_review`, but a soft ceiling is not silently transformed into a hard exclusion.

## Satisfaction States

The closed design states are `allocated_minimum_opportunities`, `allocated_target_opportunities`, `below_minimum_unresolved`, `above_soft_ceiling_review`, `allocated_requires_session_feasibility`, `allocated_requires_prescription_validation`, `optional_not_allocated`, `blocked_by_availability`, `blocked_by_training_readiness`, `requires_week_reallocation`, and `frequency_policy_required`.

These are allocation-ledger states only. They grant no movement, action, capacity, muscle, set, volume, completion, or adaptation credit.

## Marginal Value

An added reservation/objective must satisfy an unmet higher-order responsibility, improve a reviewed target, resolve a unique context, or preserve a justified productive relationship without increasing a higher-priority burden. Repeating assessment, activation, direct accessory, or optional work merely because an opportunity remains empty has no unique marginal value.

## Deferred Evaluation

Prescription owns source-exposure events, dose and realized stress. Post-Prescription Week evaluation may later aggregate planned dose without double-counting source events. Longitudinal Adaptation owns response-based target changes. None of those values participate in this allocation evaluator today.
