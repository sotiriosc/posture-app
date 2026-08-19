# Product Week Horizon Adapter Design

Status: `DESIGN_READY`; private and non-production.

The pure Product Adapter converts structured current-week facts into `WeekPlanningHorizon` truth. It resolves availability, optional time windows, confirmation, location/equipment references, immutable revisions, and unresolved seams. It does not allocate responsibilities, create objectives, select a split or exercise, generate dose, invent spacing, or compensate for missed sessions.

`ProductWeekHorizonSourceInput` is serializable and contains typed sources with IDs, source types, provenance, `recordedAt`, confirmation and truth states, and revision references. Output contains the horizon or null plus source-resolution, tentative, conflict, profile-default, equipment-resolution, unresolved-context, revision, and decision traces.

Statuses are `horizon_ready`, `horizon_ready_with_tentative_opportunities`, `user_confirmation_required`, `horizon_source_conflict`, `current_week_availability_required`, `equipment_resolution_required`, `unsupported_context`, and `blocked_by_training_readiness`.

The test lab covers 23 user scenarios and a same-profile cohort. Different current facts produce different factual horizons; identical current facts converge. No application, connector, database, calendar SDK, or public package export is included.

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
