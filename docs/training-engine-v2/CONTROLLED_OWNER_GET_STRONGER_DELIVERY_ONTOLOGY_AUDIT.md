# Controlled Owner Get Stronger Delivery Ontology Audit

Classification: `CONTROLLED_OWNER_GET_STRONGER_DELIVERY_ONTOLOGY_READY`. Live-account reads: `0`.

## Ownership audit

| Subject | Classification |
| --- | --- |
| AuthUser | `CURRENT_AUTH_AUTHORITY` |
| SessionTokenPayload | `CURRENT_AUTH_AUTHORITY` |
| AUTH_COOKIE_NAME | `CURRENT_AUTH_AUTHORITY` |
| createSessionToken | `CURRENT_AUTH_AUTHORITY` |
| verifySessionToken | `CURRENT_AUTH_AUTHORITY` |
| readServerSession | `CURRENT_AUTH_AUTHORITY` |
| auth_middleware | `CURRENT_AUTH_AUTHORITY` |
| login_route | `CURRENT_AUTH_AUTHORITY` |
| session_route | `CURRENT_AUTH_AUTHORITY` |
| user_repository | `CURRENT_AUTH_AUTHORITY` |
| file_user_store | `CURRENT_AUTH_AUTHORITY` |
| memory_user_store | `CURRENT_AUTH_AUTHORITY` |
| postgres_user_store | `CURRENT_AUTH_AUTHORITY` |
| bootstrap_user_behavior | `BOOTSTRAP_IDENTITY_CONFIGURATION` |
| email_normalization | `BOOTSTRAP_IDENTITY_CONFIGURATION` |
| credential_updates | `CURRENT_AUTH_AUTHORITY` |
| ADMIN_USER_IDS | `OUT_OF_SCOPE` |
| PRAXIS_V2_SHADOW_USER_IDS | `OUT_OF_SCOPE` |
| QuestionnaireData | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| questionnaire_storage | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| training_snapshot | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| questionnaire_signature | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| Program | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| ProgramProgress | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| AppState | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| active_program_resolution | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| results_route | `CURRENT_LEGACY_PRODUCT_AUTHORITY` |
| program_day_route | `CURRENT_LEGACY_PRODUCT_AUTHORITY` |
| session_route_product | `CURRENT_LEGACY_PRODUCT_AUTHORITY` |
| History | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| Progress | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| session_drafts | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| legacy_exercise_logs | `CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE` |
| program_completion | `CURRENT_LEGACY_PRODUCT_AUTHORITY` |
| paywall_day_gating | `CURRENT_LEGACY_PRODUCT_AUTHORITY` |
| Product_goal_architecture | `V2_GENERATION_READY` |
| get_stronger_inactive_option | `V2_GENERATION_READY` |
| Product_Shadow_goal_mapping | `V2_GENERATION_READY` |
| Product_Shadow_pipeline | `V2_GENERATION_READY` |
| Product_Horizon_adapter | `V2_GENERATION_READY` |
| Week_Planning | `V2_GENERATION_READY` |
| Session_Planner | `V2_GENERATION_READY` |
| Candidate | `V2_GENERATION_READY` |
| Composer | `V2_GENERATION_READY` |
| Prescription_compiler | `V2_GENERATION_READY` |
| final_Sequencing | `V2_GENERATION_READY` |
| Gate_13 | `V2_GENERATION_READY` |
| Full_Prescribed_Program_Snapshot | `V2_GENERATION_READY` |
| Phase_Continuity | `V2_GENERATION_READY` |
| Longitudinal | `V2_GENERATION_READY` |
| Outcome_Source | `V2_GENERATION_READY` |
| Application_Orchestration | `V2_GENERATION_READY` |
| Session_Practice_Options_V2 | `V2_GENERATION_READY` |
| V2_persistence | `PERSISTENCE_REQUIRED` |
| observability | `PERSISTENCE_REQUIRED` |
| rollback | `ROLLBACK_REQUIRED` |
| default_off_guards | `ROLLBACK_REQUIRED` |

## Required answers

1. **Is AUTH_USER_EMAIL currently an authentication bootstrap input?** Yes; preserve that existing auth-bootstrap responsibility.
2. **Can eligibility call ensureBootstrapUser safely?** No; eligibility is passive and must never create or mutate a user.
3. **Must eligibility use readServerSession?** Yes, followed by passive configured-email repository resolution.
4. **Should owner identity be email-only?** No; email is a server configuration reference, while stable userId owns records.
5. **Should stable user ID become the persisted owner identity?** Yes; all enrollment and delivery records persist userId only.
6. **What happens if the configured email changes?** Fail closed and require explicit owner re-authorization.
7. **What happens if the stored account email changes?** Fail closed without automatic eligibility migration.
8. **What happens if token email and stored email differ?** The current signed token resolves by sub and readServerSession projects the current stored email; token email is not delivery authority, and configured-to-stored exact matching still fails closed.
9. **Can an attacker supply email in a request body?** No; client-authored email has no eligibility authority.
10. **Can admin allowlists be reused?** No.
11. **Can Product Shadow allowlists be reused?** No.
12. **Which environment variable controls delivery mode?** PRAXIS_V2_OWNER_DELIVERY_MODE
13. **Should owner eligibility be independent of subscription billing?** Yes.
14. **Can current paywall behavior remain exact?** Yes; dedicated owner gating is separate.
15. **Can a dedicated owner route live under /account?** Yes: /account/praxis-v2.
16. **Can current middleware protect it without advertising it?** Future implementation may use authenticated server checks; this tranche changes no middleware.
17. **Should ineligible access return 404 or 403?** 404 Not Found.
18. **Can current QuestionnaireData fully describe the profile?** No; a separate structured owner profile is required.
19. **Which owner inputs are missing?** Explicit opportunities, minutes truth, exact capabilities, familiarity, confirmations, Safety, and review state.
20. **Can session minutes remain unknown for preview?** Yes, when explicitly unknown and visibly unresolved.
21. **Must session minutes be known before application?** Yes; resolve the blocking duration input before approval/application.
22. **Can top-level gym equipment prove all capabilities?** No.
23. **How should exact equipment be confirmed?** Through an explicit capability snapshot reviewed by the owner.
24. **Can current pain regions be imported as context?** Yes, only as proposed context.
25. **Must the owner confirm pain context before application?** Yes.
26. **Can current experience map to exact familiarity?** No; coarse experience and identity familiarity remain separate.
27. **When is calibration sufficient?** When exact familiarity is unknown and an admitted low-risk calibration path remains explicit.
28. **Can legacy Program history be treated as V2 Performance?** No.
29. **Can current logs be restricted history?** Yes, as non-Performance continuity context.
30. **Can current Program alone preserve V2 lineage?** No.
31. **Is a sidecar or new Product contract necessary?** Yes; use an immutable V2 envelope plus display projection and lineage sidecar.
32. **Should current /results and /session remain untouched?** Yes.
33. **Should owner V2 use dedicated routes?** Yes.
34. **Can visual components be reused safely?** Only neutral presentational components without current-route decision authority.
35. **How will unresolved items be reviewed?** Typed blocking facts, reason codes, and owner confirmation on the dedicated preview.
36. **What event applies a V2 Program?** One idempotent server application of an exact approved, current preview.
37. **Can application occur with an active legacy session?** No.
38. **How is the legacy Program restored?** Change the owner-scoped active-mode pointer back to legacy.
39. **How is V2 rollback performed?** Explicit idempotent rollback preserving both legacy and V2 records.
40. **Can implementation proceed without live account reads during CI?** Yes; synthetic fixtures and passive-interface contracts are sufficient.
41. **Can top design classification be earned without delivery?** Yes; design completion explicitly leaves G implementation open.

Design-only. Owner delivery and Product activation counts remain `0`. Exact next dependency: `CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_AUTHORIZATION`.
