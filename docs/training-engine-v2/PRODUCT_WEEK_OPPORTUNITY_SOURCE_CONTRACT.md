# Product Week Opportunity Source Contract

Status: design-only `DESIGN_READY`.

Legal sources include explicit user or coach availability, product schedule, observed calendar windows, profile defaults, travel/location plans, equipment overrides, prior revisions, and completed/missed state. Each source carries stable ID, typed provenance, recording time, confirmation, truth state, and update reference. Arbitrary notes are never parsed for behavior.

Factual precedence is explicit current user, explicit coach/current product facts, live calendar state, product-planned expected availability, profile default, then unknown. A higher factual source may replace expected fact but cannot change weekly programming priority. Equal-authority incompatible current facts return `HORIZON_SOURCE_CONFLICT`; timestamps and prose do not choose a winner.

Calendar free time is only observed availability, not training consent, location, equipment, or readiness. Profile defaults produce tentative/suggested opportunities requiring confirmation. Optional windows preserve `startAt`, `endAt`, timezone, source, and confirmation. Order-only input remains order-only and cannot yield elapsed recovery time.

Equipment is an explicit snapshot, a reference resolved through a typed versioned capability record, or unknown. Environment labels and location names manufacture no capabilities.

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
