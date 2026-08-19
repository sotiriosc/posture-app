# Controlled Owner Delivery Mode Policy

Server-only variable: `PRAXIS_V2_OWNER_DELIVERY_MODE`. Closed values: `off`, `preview`, `apply`. Absent or unknown defaults to `off`. No public variable exists. Preview cannot apply; apply remains exact-owner-only; off performs no writes or discovery.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
