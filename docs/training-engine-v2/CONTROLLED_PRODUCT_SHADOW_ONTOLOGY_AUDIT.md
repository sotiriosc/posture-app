# Controlled Product Shadow Ontology Audit

Status: `CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_IMPLEMENTED_DEFAULT_OFF`
Classification: `CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_READY_FOR_SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION`
Product authority: `LEGACY_PRODUCT_OUTPUT_ONLY`
V2 application: `NOT_ACTIVATED`

## Classification

CONTROLLED_PRODUCT_SHADOW_ONTOLOGY_READY

## Explicit Audit Answers

1. Delivered legacy Programs are created by `generateProgram` calls in each app's `QuestionnaireForm.tsx` and `ResultsRoutine.tsx`, backed by `packages/engine/src/program`.
2. `saveProgram`/`saveProgramProgress` in the shared `logStore` persist browser state and call `pushTrainingPatch`; `/api/training/state` persists the authenticated server snapshot.
3. The successful `pushTrainingPatchWithStatus` branch, after the authenticated Product response and cache invalidation, emits the fire-and-forget notification.
4. The server reload contains questionnaire, assessment, preferences, Programs, ProgramProgress, SessionRecords, ExerciseLogs, and server revision metadata.
5. Browser AppState, including its active Program pointer and transient navigation/UI state, is not server truth.
6. Programs, ProgramProgress references, sessions, logs, exercises, and relevant assessment signals have stable native IDs.
7. The adapter derives semantic revisions for Product state, questionnaire, assessment, preferences, active Program structure, progress, sessions, and logs.
8. Improve posture maps to posture_and_movement_quality; General fitness maps to general_fitness; Reduce pain maps to posture_and_movement_quality plus a non-diagnostic pain-aware context.
9. Athletic performance and unknown goal strings remain under-specified or mapping-required.
10. rehab adds pain_aware_return programming context only; it creates neither a diagnosis nor an outcome goal.
11. maintain is represented as PRODUCT_MAINTENANCE_POLICY_REQUIRED and never invents an outcome goal.
12. none maps to bodyweight and dumbbells maps only to dumbbell capability.
13. Band type/anchor, bench availability, gym capability bundle, wall/support, loaded gait, and exact increments remain unknown unless explicit.
14. Yes. Product daysPerWeek 3/4/5 creates an ordered cycle with ordinal opportunities and no calendar facts.
15. No stable explicit per-session minute availability exists in the current Product snapshot.
16. Mapping, structural comparison, identity validation, policy discovery, and bounded generation stages that do not require minutes remain possible; duration fit remains unknown.
17. Yes. Current Program shape is comparison/compatibility context only and cannot establish future availability.
18. Product exercise IDs present in the canonical 45-row V2 catalog map exactly by identical ID.
19. Aliases and variants require explicit owner-reviewed entries; V1 adds none implicitly.
20. Legacy-only, unsupported, collided, or ambiguous identities remain unmapped.
21. Yes. The legacy projection explicitly has zero Candidate, Prescription, and Performance authority.
22. Not as exact V2 material authority. They remain legacy outcome evidence tied to the served legacy Program.
23. Records lacking source-event, performed-block, final Prescription revision, or final Sequence revision remain restricted.
24. Supported stage ports can build a counterfactual V2 artifact when all required Product facts and policies exist; current Product cohorts often stop honestly on availability, mapping, or policy gaps.
25. Athletic/unknown goals, maintain intent, unknown experience, bands/gym/unknown equipment, missing 3/4/5 days, missing expected entities, and incomplete lineage produce explicit incomplete states.
26. Yes. Both apps resolve `@/lib` to the shared engine package and use the single successful-sync hook.
27. Yes. The trigger carries only contract/kind, semantic fingerprint, changed categories/IDs, anchors, operation/time, and provenance.
28. Yes. Authentication determines athlete identity and the service reloads server state, verifies expected references, and treats client anchors only as claims to verify.
29. No. Serverless correctness requires database-backed admission, idempotency, concurrency, and pending-run limits.
30. The PostgreSQL repository uses athlete/idempotency uniqueness, transaction advisory locks, semantic conflict checks, rate windows, concurrency/pending limits, and final revision rechecks.
31. Yes. App routes return empty 202/204/4xx/5xx responses and never serialize shadow artifacts.
32. Yes. Notification is unawaited and caught; route, V2, database, comparison, and observability failures cannot change the already successful Product sync result.
33. Yes. Explicit athlete erasure cascades all shadow rows and writes only anonymized erasure audit data, without touching Product training behavior.
34. Yes. Persistence stores semantic mappings, structured references, fingerprints, artifact references, comparison/failure, resource trace, and audit, never a raw Product snapshot copy.
35. Yes. Technical shadow readiness is compatible with default-off observation and zero Product decision authority; Product output activation remains a separate authorization.


## Evidence

Controlled / fixed shell / holdout: 280/80/520. Stress failures: 0. Accepted rescues: 0.

Combined fingerprint: `fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c`.

No V2 artifact is returned, rendered, delivered, marked performed, or applied. Separate Product activation remains required.
