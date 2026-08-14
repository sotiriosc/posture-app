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
