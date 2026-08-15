# Product Week Horizon Revision Contract

Status: design-only `DESIGN_READY`.

A horizon revision is immutable and records horizon ID, revision ID, `basedOnRevisionId`, creation/evaluation times, source-event references, changed and unchanged opportunity IDs, completed opportunity IDs, invalidated reservation IDs, and whether reallocation is required. A schedule change creates a revision; it never rewrites prior truth.

Completed opportunities and prescriptions remain immutable history. An opportunity retains identity when the intended window/responsibility remains and only non-identity metadata changes. A materially replaced window, identity-relevant location/equipment change, or cancel-and-recreate event receives a new stable ID. Calendar titles are never canonical IDs.

Cancellation, movement, confirmation, completion, and missed-state scenarios emit explicit revision traces. Reservation invalidation is reported for the future Week receiver; the Product Adapter performs no reallocation.

<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:START -->
## Controlled Product Shadow Integration V1

- Status: `CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_IMPLEMENTED_DEFAULT_OFF`.
- Classification: `CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_READY_FOR_SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION`.
- Product decision/output authority: `LEGACY_PRODUCT_OUTPUT_ONLY`.
- V2 application state: `NOT_ACTIVATED`.
- Runtime shape: one shared successful-sync notification, two thin authenticated routes, one server service.
- Rollout: default off, dedicated internal allowlist only, no all-user/percentage/random/anonymous mode.
- Evidence: 280 controlled, 80 fixed-shell, 520 frozen holdout; fingerprint `ab127575cf878d72e5e73154936ce5991dadf148b5be847b05f5a1a94ab4226e`.
- Persistence: explicit forward-only migration plan, 9 append-only tables, no legacy Product table changes, no automatic or production migration.
- Safety: zero Product mutation, application, delivery, rendering, performed credit, or counterfactual outcome attribution.
- Remaining dependency: `SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION`.
<!-- CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1:END -->
