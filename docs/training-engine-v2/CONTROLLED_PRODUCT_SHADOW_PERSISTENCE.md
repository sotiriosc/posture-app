# Controlled Product Shadow Persistence

Status: `CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_IMPLEMENTED_DEFAULT_OFF`
Classification: `CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_READY_FOR_SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION`
Product authority: `LEGACY_PRODUCT_OUTPUT_ONLY`
V2 application: `NOT_ACTIVATED`

## Boundary

Migration 003 adds nine append-only shadow tables. One run transaction stores source reference, mappings, run, projection, artifacts, comparison/failure, resource trace, audit, and optional supersession after current-state rechecks.

## Evidence

Controlled / fixed shell / holdout: 280/80/520. Stress failures: 0. Accepted rescues: 0.

Combined fingerprint: `fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c`.

No V2 artifact is returned, rendered, delivered, marked performed, or applied. Separate Product activation remains required.
