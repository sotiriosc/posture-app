# Product Week Horizon Adapter Design

Status: `DESIGN_READY`; private and non-production.

The pure Product Adapter converts structured current-week facts into `WeekPlanningHorizon` truth. It resolves availability, optional time windows, confirmation, location/equipment references, immutable revisions, and unresolved seams. It does not allocate responsibilities, create objectives, select a split or exercise, generate dose, invent spacing, or compensate for missed sessions.

`ProductWeekHorizonSourceInput` is serializable and contains typed sources with IDs, source types, provenance, `recordedAt`, confirmation and truth states, and revision references. Output contains the horizon or null plus source-resolution, tentative, conflict, profile-default, equipment-resolution, unresolved-context, revision, and decision traces.

Statuses are `horizon_ready`, `horizon_ready_with_tentative_opportunities`, `user_confirmation_required`, `horizon_source_conflict`, `current_week_availability_required`, `equipment_resolution_required`, `unsupported_context`, and `blocked_by_training_readiness`.

The test lab covers 23 user scenarios and a same-profile cohort. Different current facts produce different factual horizons; identical current facts converge. No application, connector, database, calendar SDK, or public package export is included.
