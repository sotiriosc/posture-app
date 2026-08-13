# Product Week Horizon Revision Contract

Status: design-only `DESIGN_READY`.

A horizon revision is immutable and records horizon ID, revision ID, `basedOnRevisionId`, creation/evaluation times, source-event references, changed and unchanged opportunity IDs, completed opportunity IDs, invalidated reservation IDs, and whether reallocation is required. A schedule change creates a revision; it never rewrites prior truth.

Completed opportunities and prescriptions remain immutable history. An opportunity retains identity when the intended window/responsibility remains and only non-identity metadata changes. A materially replaced window, identity-relevant location/equipment change, or cancel-and-recreate event receives a new stable ID. Calendar titles are never canonical IDs.

Cancellation, movement, confirmation, completion, and missed-state scenarios emit explicit revision traces. Reservation invalidation is reported for the future Week receiver; the Product Adapter performs no reallocation.
