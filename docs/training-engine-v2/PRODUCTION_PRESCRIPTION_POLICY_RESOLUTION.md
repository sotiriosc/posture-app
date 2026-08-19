# Production Prescription Policy Resolution

Generated deterministically from the production Prescription Compiler kernel.

Policy injection is explicit. Missing policy returns `prescription_policy_required`; unknown identity returns `prescription_policy_unavailable`; unresolved equal-applicability or declared equal-authority conflicts return `prescription_policy_conflict`.

Specificity order:

1. `training_safety_authority`
2. `hard_contraindication_and_explicit_restriction`
3. `exercise_knowledge_legality`
4. `unresolved_pain_or_response_requirement`
5. `assignment_section_and_role`
6. `selected_dose_mode`
7. `explicit_session_goal`
8. `current_equipment_realization`
9. `continuity_or_prior_prescription`
10. `experience_and_familiarity`
11. `structural_capacity`
12. `phase_applicability`
13. `broad_v1_default`

There is no singleton, default policy, environment selection, app adapter, weighted blend, or implicit conflict merge.
