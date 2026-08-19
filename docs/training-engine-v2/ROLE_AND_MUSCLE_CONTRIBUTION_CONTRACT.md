# Role, Action, and Muscle Contribution Contract

Status: accepted production contract, 2026-08-12. Scope: Candidate Intelligence and the existing 37-row reference catalog only.

## Selection Semantics

- `MovementRole` is a broad, truthful selection purpose. `accessory` is the broad role for local isolation work; `knee_dominant` means knee-dominant lower-body training and does not assert a squat pattern.
- `actionFunctions` is the exact action receiver. An action entry contains review status, structured provenance, and notes. When `CandidateNeed.targetActionFunctions` is absent it has no ranking or legality effect; when present, at least one reviewed candidate action must overlap.
- `muscleContributions` is the sole catalog source for anatomy. Its legal relationships are `primary_target`, `key_secondary_target`, `incidental_contributor`, `stabilizer_or_contextual_contributor`, and `unknown`.
- `primaryMuscles` and `secondaryMuscles` are compatibility projections generated from primary and key-secondary relationships. Catalog authors cannot set them.

## Need Semantics

`CandidateNeed.muscleRequirement` accepts three modes. Missing legacy values adapt to `any_meaningful_contributor`.

| Requirement | Hard eligibility | Existing muscle score |
| --- | --- | --- |
| `any_meaningful_contributor` | primary or key secondary | equal bounded meaningful-match credit |
| `primary_preferred` | primary or key secondary | bounded preference for primary, using the existing component |
| `primary_required` | primary only | primary score only |

Incidental, stabilizer/contextual, and unknown relationships never satisfy a target-muscle requirement.

## Production Migration

The owner-authorized corrections are: curl no horizontal pull plus elbow flexion; pressdown no horizontal push plus elbow extension; lateral raise no vertical push plus shoulder abduction; leg curl no hinge plus knee flexion; chest fly no horizontal push plus horizontal adduction; reverse pec deck no horizontal pull, retains scapular control, plus horizontal abduction and scapular retraction; face pull no horizontal pull, retains scapular control, plus scapular retraction and external rotation; glute bridge no hinge plus hip extension; wall slide no vertical push, retains scapular control, plus upward rotation.

The knee review is exact: Goblet Squat and Bodyweight Box Squat are `squat` plus `knee_dominant`; Leg Press is `knee_dominant` and not `squat`; Split Squat and Step-Up are `single_leg` plus `knee_dominant` and do not prove the bilateral squat pattern.

All 37 production rows have reviewed canonical muscle contributions. Equipment, phase, pain/stress, safety/response metadata, progression metadata, IDs, and row count are unchanged by this migration.
