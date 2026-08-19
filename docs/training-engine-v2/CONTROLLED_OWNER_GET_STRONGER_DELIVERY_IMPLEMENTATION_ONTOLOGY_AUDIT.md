# Controlled Owner Get Stronger Delivery Implementation Ontology Audit

Classification: `CONTROLLED_OWNER_GET_STRONGER_DELIVERY_IMPLEMENTATION_ONTOLOGY_READY`.

The canonical ledger and completed G design are authoritative. Authentication, delivery eligibility, delivery mode, enrollment, profile, generation, preview, approval, application, active Program ownership, session execution, Outcome evidence, rollback, and broader Product activation remain separate typed facts.

## Integration seams

| Seam | Classification | Result |
| --- | --- | --- |
| `readServerSession()` | `REUSE_SERVER_AUTHORITY` | Passive stored-user session projection; unchanged. |
| `getUserRepository().findUserByEmail()` | `REUSE_SERVER_AUTHORITY` | Passive exact configured-owner lookup only. |
| `ensureBootstrapUser()` | `OUT_OF_SCOPE` | Authentication bootstrap remains intact and is prohibited in eligibility. |
| Current middleware | `REUSE_EXACT` | Existing `/account/*` authentication applies; route-level owner gate supplies mode and identity 404. |
| Current Account settings page | `REUSE_PRESENTATION_ONLY` | Legacy client state is untouched; a server layout owns the conditional entry. |
| Current training snapshot | `LEGACY_STATE_READ_ONLY` | Restricted proposed facts only after eligibility and mode checks. |
| Current Program, Progress, draft, history | `LEGACY_STATE_PROTECTED` | Never overwritten, cleared, or reclassified as V2 lineage. |
| Training Engine V2 contracts and kernels | `REUSE_EXACT` | Pure owner domain composes explicit production kernels without CAGT or Shadow imports. |
| Owner delivery contracts | `NEW_OWNER_DELIVERY_DOMAIN` | `packages/training-engine-v2/src/ownerDelivery`. |
| Owner server authority | `NEW_OWNER_DELIVERY_PERSISTENCE` | `packages/engine/src/controlledOwnerDelivery`. |
| Owner pages and APIs | `NEW_OWNER_ROUTE` / `NEW_OWNER_API` | Dedicated Consumer namespace only. |
| Owner active Program | `NEW_OWNER_ACTIVE_POINTER` | Server-owned pointer, effective legacy when absent or off. |
| Session Practice V2 revisions | `REUSE_EXACT` | Existing athlete-scoped append-only attempt persistence remains the attempt owner. |
| Product Shadow | `PRODUCT_SHADOW_PROHIBITED` | No service, rollout, persistence, eligibility, or artifact reuse. |
| Live environment/account | `LIVE_ENVIRONMENT_PROHIBITED` | No mutation, read, Program generation, application, or smoke in this tranche. |
| Ordinary Product routes | `CURRENT_ROUTE_FROZEN` | Questionnaire, Results, Program, Session, Progress, and History remain legacy. |

## Required answers

1. Pure owner-delivery contracts belong to `@praxis/training-engine-v2/ownerDelivery`.
2. Server eligibility and persistence belong to `@praxis/engine/controlled-owner-delivery`.
3. Consumer App Router owns thin route handlers and owner-only page composition.
4. Current `readServerSession()` is reused without change and performs a passive stored-user lookup.
5. Existing middleware protects `/account/praxis-v2`; no middleware change is required.
6. The conditional Account entry belongs in a server layout around `/account/settings`.
7. No current Account page source change is required.
8. Neutral shells, buttons, layout, headings, and disclosure presentation may be reused.
9. Current Results, Program, SessionClient, Progress, History, log-store, and draft-owning components must not be reused as state owners.
10. The authenticated training snapshot may be read after both gates and must remain unmodified.
11. Safe proposed imports are days, top-level equipment labels, pain regions, coarse experience, assessment references, and continuity references.
12. Owner generation calls the explicit production owner pipeline composed from Week V1.1, Session Planner, Candidate Intelligence, Composer, Prescription, Sequencing, Gate 13, and Phase kernels.
13. Existing adaptation application orchestration is not initial Program application authority; owner application uses its own transaction and may later emit exact downstream evidence.
14. No Product Shadow service function is safely reusable as owner-delivery authority.
15. New tables are enrollments, profiles, previews, approvals, envelopes, applications, active pointers, audit events, and idempotency.
16. Existing Outcome Source and Session Practice V2 tables are reused only for their rightful evidence and attempt records.
17. Existing Session Practice persistence truthfully owns V2 attempt revisions.
18. The owner envelope contains the complete production Program artifact lineage and a display-only projection.
19. Active owner V2 state resolves from a server-owned user pointer and exact application/envelope records.
20. Rollback changes only the owner pointer to legacy; current routes never switch authority.
21. When mode is off, the entry and routes are absent, APIs disclose nothing, mutations stop, and stored records remain.
22. Off mode returns 404 before session or database access.
23. Preview/apply differences are enforced on every server request by a non-cached environment resolution.
24. State changes require same-origin validation and an HMAC owner CSRF token.
25. Deterministic action/source fingerprints plus persisted idempotency records provide exact retries and conflict detection.
26. Existing server rate limiting is adapted to stable `userId` plus action; email is never a key.
27. Owner pages are force-dynamic with zero revalidation; APIs and pages emit no-store policy.
28. Live environment setup remains completely outside this tranche.
29. Top implementation classification can be earned with synthetic fixtures and remote CI without a live account read.
30. The configured owner email remains absent from tracked artifacts; only the environment-variable name and redacted reference appear.

Owner delivery remains default-off. Live owner delivery and Product activation counts remain `0`.

