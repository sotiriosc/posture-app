# Production Final Sequencing Setup Relationships

Generated deterministically from the inactive production Final Session Sequencing kernel.

Relationships are `same_setup`, `compatible_setup`, `setup_change_required`, `equipment_change_required`, `support_change_required`, `location_change_required`, and `unknown`. Equipment comparison uses the realized requested/available capability trace, not assignment-scoped realization IDs or the whole room inventory.

Setup is a late semantic preference only. Relationship never becomes seconds. In particular, same/compatible setup without reviewed timing retains `SETUP_DURATION_NOT_EXPLICIT` and a null final upper bound.
