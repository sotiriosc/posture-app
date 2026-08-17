# Controlled Owner Delivery Runtime Contract

Contract: `CONTROLLED_OWNER_DELIVERY_RUNTIME@1.0.0`.

The server resolves `off|preview|apply` before identity or persistence access. An eligible stable user ID,
active immutable enrollment, and confirmed immutable profile are required before generation. Preview runs
the production V2 kernels with an explicit evaluation time and stores a counterfactual immutable artifact.
Approval and application are separate server transactions. Application writes only owner V2 records and
preserves the legacy Program, progress, drafts, history, and fallback reference.

Unknown or absent mode is `off`. No browser state is authority. Exact IDs and revisions never fall back to
latest. Product Shadow and legacy `generateProgram` are not dependencies of this runtime.
