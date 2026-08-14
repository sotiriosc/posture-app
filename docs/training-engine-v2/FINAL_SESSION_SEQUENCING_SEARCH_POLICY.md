# Final Session Sequencing Search Policy

Generated deterministically from the inactive Final Session Sequencing V1 design lab.

Current complete sessions use exhaustive enumeration of legal topological orders and an exact deterministic oracle. A later large production space may use a bounded frontier with safe dominance only, but production limits are deliberately unspecified here.

Evaluation is strict lexicographic, never weighted:

1. `hard_input_validity`
2. `training_safety`
3. `assignment_preservation`
4. `dependency_satisfaction`
5. `section_precedence`
6. `prescription_block_atomicity`
7. `dominant_purpose_preservation`
8. `required_need_priority`
9. `planner_priority_vector`
10. `supporting_work_context`
11. `fatigue_interference`
12. `accessory_priority`
13. `cooldown_last`
14. `setup_efficiency`
15. `unknown_transition_burden`
16. `canonical_identity_tie_break`

No repair pass, random search, hidden greedy fallback, or diversity objective is permitted.

<!-- PRODUCTION_FINAL_SEQUENCING_STATUS_START -->
## Production Final Session Sequencing Status

- Kernel: `PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL@1.0.0`
- Status: `PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_IMPLEMENTED_NOT_ACTIVATED`
- Classification: `PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_READY_FOR_POST_PRESCRIPTION_WEEK_VALIDATION_AUTHORIZATION`
- Policy: `SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL@1.0.0`, explicit injection only
- Search: exact-only with explicit caller resource policy and no fallback
- Identity: assignment/handoff ID, source event, execution attempt, and final Prescription revision
- Gate 10: `PRODUCTION_KERNEL_AUTHORITY`
- Activation: `NOT_ACTIVATED`; no app, Product Adapter, UI, or generateProgram wiring
- Next dependency: `POST_PRESCRIPTION_WEEK_VALIDATION_AUTHORIZATION`

Public V2 exports include the pure kernel, production contracts, Policy V1 object, explicit search policy contracts, transition/duration/revision contracts, and validators. Importing the package does not execute Sequencing.
<!-- PRODUCTION_FINAL_SEQUENCING_STATUS_END -->
