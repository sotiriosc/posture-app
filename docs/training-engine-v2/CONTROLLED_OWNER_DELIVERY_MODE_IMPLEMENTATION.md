# Controlled Owner Delivery Mode Implementation

Contract: `CONTROLLED_OWNER_DELIVERY_MODE_POLICY@1.0.0`.

`PRAXIS_V2_OWNER_DELIVERY_MODE` has closed values `off`, `preview`, and `apply`. Missing or unknown input resolves to `off`. Resolution is request-scoped and server-only. Off short-circuits before session or repository access; preview cannot approve/apply; apply remains subject to every identity, state, CSRF, idempotency, and ownership precondition.

No deployment environment value is created or changed by this implementation.

