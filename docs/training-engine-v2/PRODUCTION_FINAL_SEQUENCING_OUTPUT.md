# Production Final Sequencing Output

Generated deterministically from the inactive production Final Session Sequencing kernel.

Statuses:

- `sequenced_exact_optimal`
- `blocked_by_training_readiness`
- `incomplete_due_to_unresolved_prescription`
- `sequencing_policy_required`
- `sequencing_policy_unavailable`
- `sequencing_policy_conflict`
- `sequencing_search_policy_required`
- `sequencing_search_policy_unavailable`
- `search_inconclusive`
- `ordering_infeasible`
- `invalid_session_input`
- `invalid_session_handoff`
- `unsupported_sequencing_contract_version`
- `unsupported_prescription_compiler_contract_version`
- `transition_fact_conflict`
- `invalid_sequence_revision_context`

An exact plan includes contract and policy references, stable plan/revision IDs, atomic assignment steps, section boundaries, consecutive transition facts and instructions, source/Prescription/revision references, derived integrity, purpose/support/interference/setup traces, unresolved facts, duration, exact-search proof, 22-part decision trace, compatibility projection, and provenance. Non-exact outcomes never expose an executable plan.
