# Controlled Owner Security And Privacy Implementation

Identity is server-session-only and resolved against one exact configured stored user. All owner mutations require
same-origin JSON POST, session-bound HMAC CSRF, user/action rate limiting, and persisted idempotency where required.
Every repository read is user-scoped and SQL is parameterized. Pages and APIs are private no-store and ineligible
requests return 404 without owner identity headers.

Tracked configured-owner literal count: `0`. Owner email columns/log fields: `0`. Raw Product snapshots,
free-text telemetry, photo copies, auth tokens/passwords, live-account reads, and production fixtures: `0`.
