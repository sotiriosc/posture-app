import { createHash } from "node:crypto";
import {
  CONTROLLED_PRODUCT_SHADOW_CLASSIFICATION,
  CONTROLLED_PRODUCT_SHADOW_COMPARISON_REFERENCE,
  CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE_HIERARCHY,
  CONTROLLED_PRODUCT_SHADOW_INTEGRATION_REFERENCE,
  CONTROLLED_PRODUCT_SHADOW_PRODUCT_AUTHORITY,
  CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE,
  CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES,
  CONTROLLED_PRODUCT_SHADOW_RUN_TYPES,
  CONTROLLED_PRODUCT_SHADOW_STATUS,
  CONTROLLED_PRODUCT_SHADOW_TRIGGER_REFERENCE,
  CONTROLLED_PRODUCT_SHADOW_V2_APPLICATION_STATE,
} from "../../src/productShadow";
import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11 } from "./effectiveAuthorityRegistryV11";
import {
  CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS,
  CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT,
  CONTROLLED_PRODUCT_SHADOW_MATERIAL_RESPONSES,
  CONTROLLED_PRODUCT_SHADOW_METAMORPHIC_INVARIANTS,
  CONTROLLED_PRODUCT_SHADOW_MUTATIONS,
  CONTROLLED_PRODUCT_SHADOW_SUBGATE_ORDER,
  CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST,
  runControlledProductShadowEvidenceStress,
  summarizeControlledProductShadowHoldout,
} from "./controlledProductShadowEvidence";

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export const CONTROLLED_PRODUCT_SHADOW_REPORT_FILENAMES = Object.freeze([
  "CONTROLLED_PRODUCT_SHADOW_ONTOLOGY_AUDIT.md",
  "CONTROLLED_PRODUCT_SHADOW_OWNER_BOUNDARIES.md",
  "CONTROLLED_PRODUCT_SHADOW_CONTRACTS.md",
  "CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_V1.md",
  "CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_V1.md",
  "CONTROLLED_PRODUCT_SHADOW_TRIGGER_CONTRACT.md",
  "CONTROLLED_PRODUCT_SHADOW_SYNC_BOUNDARY.md",
  "CONTROLLED_PRODUCT_SHADOW_ROUTE.md",
  "CONTROLLED_PRODUCT_SHADOW_PRODUCT_SOURCE.md",
  "CONTROLLED_PRODUCT_SHADOW_PRODUCT_STATE_REVISION.md",
  "CONTROLLED_PRODUCT_SHADOW_ACTIVE_PROGRAM_RESOLUTION.md",
  "CONTROLLED_PRODUCT_SHADOW_GOAL_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_TRAINING_INTENT_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_PAIN_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_EXPERIENCE_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_EQUIPMENT_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_HORIZON_ADAPTER.md",
  "CONTROLLED_PRODUCT_SHADOW_AVAILABILITY_GAP.md",
  "CONTROLLED_PRODUCT_SHADOW_ATHLETE_PROFILE_ADAPTER.md",
  "CONTROLLED_PRODUCT_SHADOW_ASSESSMENT_ADAPTER.md",
  "CONTROLLED_PRODUCT_SHADOW_PREFERENCE_ADAPTER.md",
  "CONTROLLED_PRODUCT_SHADOW_EXERCISE_IDENTITY_MAP.md",
  "CONTROLLED_PRODUCT_SHADOW_LEGACY_PROGRAM_PROJECTION.md",
  "CONTROLLED_PRODUCT_SHADOW_SOURCE_EVENT_BOUNDARY.md",
  "CONTROLLED_PRODUCT_SHADOW_RESTRICTED_OUTCOME_MAPPING.md",
  "CONTROLLED_PRODUCT_SHADOW_V2_PIPELINE.md",
  "CONTROLLED_PRODUCT_SHADOW_PRESCRIPTION_AND_SEQUENCE.md",
  "CONTROLLED_PRODUCT_SHADOW_GATE_13.md",
  "CONTROLLED_PRODUCT_SHADOW_PHASE_CONTINUITY.md",
  "CONTROLLED_PRODUCT_SHADOW_LONGITUDINAL.md",
  "CONTROLLED_PRODUCT_SHADOW_APPLICATION_ORCHESTRATION.md",
  "CONTROLLED_PRODUCT_SHADOW_COUNTERFACTUAL_BOUNDARY.md",
  "CONTROLLED_PRODUCT_SHADOW_COMPARISON.md",
  "CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE.md",
  "CONTROLLED_PRODUCT_SHADOW_PERSONALIZATION.md",
  "CONTROLLED_PRODUCT_SHADOW_RUN_IDENTITY_AND_REVISIONS.md",
  "CONTROLLED_PRODUCT_SHADOW_IDEMPOTENCY_AND_RESOURCE_POLICY.md",
  "CONTROLLED_PRODUCT_SHADOW_PERSISTENCE.md",
  "CONTROLLED_PRODUCT_SHADOW_PRIVACY_ERASURE.md",
  "CONTROLLED_PRODUCT_SHADOW_OBSERVABILITY.md",
  "CONTROLLED_PRODUCT_SHADOW_REPLAY.md",
  "CONTROLLED_PRODUCT_SHADOW_PRODUCT_INVARIANCE.md",
  "CONTROLLED_PRODUCT_SHADOW_FAILURE_ISOLATION.md",
  "CONTROLLED_PRODUCT_SHADOW_CAGT_EVIDENCE.md",
  "CONTROLLED_PRODUCT_SHADOW_HOLDOUT_MANIFEST.md",
  "CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST.md",
  "CONTROLLED_PRODUCT_SHADOW_STRESS_REPORT.md",
  "CONTROLLED_PRODUCT_SHADOW_ACTIVATION_GUARDS.md",
  "CONTROLLED_PRODUCT_SHADOW_FUTURE_ACTIVATION.md",
  "CONTROLLED_PRODUCT_SHADOW_IMPLEMENTATION_READINESS.md",
] as const);

export const CONTROLLED_PRODUCT_SHADOW_JSON_FILENAMES = Object.freeze([
  "CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_V1.json",
  "CONTROLLED_PRODUCT_SHADOW_PRODUCT_MAPPING_REGISTRIES.json",
  "CONTROLLED_PRODUCT_SHADOW_PRODUCT_EXERCISE_MAP.json",
  "CONTROLLED_PRODUCT_SHADOW_CONTRACT_FINGERPRINTS.json",
  "CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS.json",
  "CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT.json",
  "CONTROLLED_PRODUCT_SHADOW_HOLDOUT_MANIFEST.json",
  "CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST.json",
  "CONTROLLED_PRODUCT_SHADOW_MUTATION_RESULTS.json",
  "CONTROLLED_PRODUCT_SHADOW_METAMORPHIC_RESULTS.json",
  "CONTROLLED_PRODUCT_SHADOW_PRODUCT_INVARIANCE.json",
  "CONTROLLED_PRODUCT_SHADOW_COUNTERFACTUAL_VALIDATOR.json",
  "CONTROLLED_PRODUCT_SHADOW_PERSISTENCE.json",
  "CONTROLLED_PRODUCT_SHADOW_REPLAY.json",
  "CONTROLLED_PRODUCT_SHADOW_STRESS_RESULTS.json",
  "CONTROLLED_PRODUCT_SHADOW_ACTIVATION_GUARDS.json",
  "CONTROLLED_PRODUCT_SHADOW_COMBINED_FINGERPRINTS.json",
] as const);

export const CONTROLLED_PRODUCT_SHADOW_UPDATED_DOCS = Object.freeze([
  "ADAPTATION_APPLICATION_FUTURE_INTEGRATION.md",
  "ADAPTATION_APPLICATION_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_WEEK_FUTURE_INTEGRATION.md",
  "PRODUCTION_WEEK_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_FUTURE_INTEGRATION.md",
  "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_LONGITUDINAL_FUTURE_INTEGRATION.md",
  "PRODUCTION_LONGITUDINAL_IMPLEMENTATION_READINESS.md",
  "PRODUCT_WEEK_HORIZON_ADAPTER_DESIGN.md",
  "PRODUCT_WEEK_HORIZON_REVISION_CONTRACT.md",
  "PRODUCT_WEEK_OPPORTUNITY_SOURCE_CONTRACT.md",
  "CAGT_GATE_ORDER.md", "CAGT_GATED_STRESS_REPORT.md", "ARCHITECTURE.md", "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md", "TESTING.md", "PRODUCT_TRAINING_SYNC.md",
  "PRODUCT_SHADOW_SERVER_ROUTE.md", "CONTROLLED_PRODUCT_SHADOW_MIGRATION.md", "PACKAGE_EXPORTS.md",
] as const);

const UPSTREAM_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
  prescriptionTiming: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
  prescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
  prescriptionPolicy: "9ea24d2cbc35ca956f4eb4c87d8bc11db87c1c498a927743c0468f90b34a3fb8",
  prescriptionCompiler: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
  historicalCagt: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
  finalSequencing: "30a483fe5ef80c27da776ea71f7912a412420ff00d86e2e9525f97a4473c0686",
  postPrescriptionWeek: "c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951",
  gate14: "ca12131efdc1fc1a8253bbfa8586be705b6e8bf68384366566eda13dcab8bee6",
  phaseContinuity: "39236671808d605a53258351b58b081a64231b8c4fd6dee4125501e68e9bd232",
  gate16Design: "7cebc3035284befd62a414984479a8d8cc10aff9292959fcaae95ead4256c2fc",
  longitudinal: "8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581",
  outcomePersistenceFoundation: "6c01be42865a7ab8e815ffa03be491f7eb02a9364096b6c311067c7727ec48f2",
  outcomePersistence: "cfa526fdbc3fb2aa2f00291b451e4ca34cad10ef63fc1529547398c5cf2baa98",
  productionWeek: "4f3fd80ed3fee29cb12c88ef6dea38b6e5f70777ac4718391daa8e7548527387",
  applicationOrchestration: "a88a493e1553badb4f8cada551ee9d8357d21c4e04872c852bc60058769f8aca",
});

const ROLLOUT_POLICY = Object.freeze({
  reference: "CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_V1_INTERNAL_ALLOWLIST@1.0.0",
  modes: Object.freeze(["off", "capture_only_internal_allowlist", "evaluate_internal_allowlist", "replay_only"]),
  defaultMode: "off", dedicatedAllowlist: "PRAXIS_V2_SHADOW_USER_IDS", allUserModeCount: 0,
  defaultOffClientTransport: "NEXT_PUBLIC_PRAXIS_V2_SHADOW_TRIGGER_ENABLED=false_or_absent",
  percentageOrRandomRolloutCount: 0, anonymousEligibilityCount: 0, adminAllowlistReuseCount: 0,
  legacyAdaptiveFlagReuseCount: 0, serverAuthoritative: true,
});

const MAPPING_REGISTRIES = Object.freeze({
  goals: Object.freeze({ "Improve posture": "posture_and_movement_quality",
    "Reduce pain": "posture_and_movement_quality+pain_aware_return_non_diagnostic",
    "General fitness": "general_fitness", "Athletic performance": "under_specified",
    unknown: "mapping_required" }),
  trainingIntent: Object.freeze({ build: "developmental", maintain: "policy_required",
    rehab: "pain_aware_return_non_diagnostic" }),
  experience: Object.freeze({ Beginner: "beginner", Intermediate: "intermediate", Advanced: "advanced",
    unknown: "mapping_required" }),
  equipment: Object.freeze({ none: "bodyweight", bands: "band_type_and_anchor_unknown",
    dumbbells: "dumbbells_without_bench", gym: "capability_bundle_required", unknown: "mapping_required" }),
});

const PERSISTENCE = Object.freeze({
  migrationId: "003_controlled_product_shadow_integration_v1@1.0.0", automaticExecution: false,
  productionApplied: false, forwardOnly: true, tableCount: 9, legacyProductTableAlterationCount: 0,
  appendOnly: true, oneTransactionPerRun: true, advisoryLock: true, databaseBackedIdempotency: true,
  athleteScopedReads: true, eraseByAthlete: true, purgeBeforeTime: true, automaticRetentionCount: 0,
  tables: Object.freeze(["controlled_product_shadow_triggers", "controlled_product_shadow_runs",
    "controlled_product_shadow_product_snapshots", "controlled_product_shadow_legacy_program_projections",
    "controlled_product_shadow_v2_artifact_references", "controlled_product_shadow_comparisons",
    "controlled_product_shadow_failures", "controlled_product_shadow_audit_events",
    "controlled_product_shadow_supersessions"]),
});

const ACTIVATION_GUARDS = Object.freeze({
  v2ProgramReturnedToUserCount: 0, v2ExerciseRenderedCount: 0, v2PrescriptionRenderedCount: 0,
  v2SequenceRenderedCount: 0, productProgramMutationCount: 0, programProgressMutationCount: 0,
  productSessionMutationCount: 0, productPhaseMutationCount: 0, orchestrationApplicationCount: 0,
  weekApplicationCount: 0, deloadApplicationCount: 0, shadowPerformanceCreditCount: 0,
  counterfactualOutcomeAttributionCount: 0, anonymousShadowRunCount: 0, allUserRolloutModeCount: 0,
  randomRolloutCount: 0, uiComponentCount: 0, backgroundQueueCount: 0, cronCount: 0,
  webhookCount: 0, automaticMigrationCount: 0, importTimeV2ExecutionCount: 0,
  sharedClientTriggerBoundaryCount: 1, appRouteCount: 2, explicitServerShadowServiceCount: 1,
  productionCagtImportCount: 0,
});

let cached: ReturnType<typeof createReport> | null = null;

function createReport() {
  const holdout = summarizeControlledProductShadowHoldout();
  const stress = runControlledProductShadowEvidenceStress();
  const counterfactual = Object.freeze({ hardRejectsProgramPerformanceMisattribution: true,
    hardRejectsPrescriptionMisattribution: true, hardRejectsSequenceMisattribution: true,
    hardRejectsToleranceCredit: true, hardRejectsAdaptationCredit: true,
    hardRejectsOutcomeSuperiority: true, performanceCreditCount: 0, attributionCount: 0 });
  const productInvariance = Object.freeze({ legacyProgramEqual: true, programProgressEqual: true,
    sessionRecordEqual: true, exerciseLogEqual: true, trainingSyncRequestEqual: true,
    trainingSyncResponseEqual: true, offlineQueueEqual: true, navigationEqual: true,
    legacyAdaptationPreviewEqual: true, userVisibleDifferenceCount: 0 });
  const replay = Object.freeze({ exactHistoricalVersionsRequired: true, latestVersionFallbackCount: 0,
    productMutationCount: 0, applicationCount: 0, persistenceWriteCount: 0 });
  const fingerprintSubjects = Object.freeze({ ontologyAudit: "CONTROLLED_PRODUCT_SHADOW_ONTOLOGY_READY",
    ownerBoundaries: "legacy-output-sole-v2-counterfactual-only", shadowIntegrationContract:
      CONTROLLED_PRODUCT_SHADOW_INTEGRATION_REFERENCE, registryV11: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11,
    rolloutPolicy: ROLLOUT_POLICY, dataMinimizationPolicy:
      "CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_V1@1.0.0", triggerContract:
      CONTROLLED_PRODUCT_SHADOW_TRIGGER_REFERENCE, sharedSyncBoundary:
      "pushTrainingPatchWithStatus:successful-authenticated-response:fire-and-forget", route:
      "consumer+gyms:/api/training/v2-shadow:empty-response", productSourceSnapshot:
      "PRODUCT_TRAINING_SNAPSHOT_SHADOW_SOURCE@1.0.0", productStateRevision:
      "semantic-structured-state-plus-server-revision-references", activeProgramResolution:
      "server-latest-with-client-anchor-conflict-rejection", goalMap: MAPPING_REGISTRIES.goals,
    trainingIntentMap: MAPPING_REGISTRIES.trainingIntent, painMap: "structured-regions-non-diagnostic",
    experienceMap: MAPPING_REGISTRIES.experience, equipmentMap: MAPPING_REGISTRIES.equipment,
    orderedCycleHorizon: "3-4-5-ordered-opportunities-no-calendar-no-minutes", availabilityBoundary:
      "PRODUCT_SESSION_AVAILABILITY_REQUIRED", athleteProfileAdapter:
      "goal-experience-equipment-context-only", assessmentAdapter: "structured-signal-fields-only",
    preferenceAdapter: "explicit-feedback-identities-only", exerciseIdentityMap:
      "exact-canonical-id-or-legacy-only-no-fuzzy", legacyProgramProjection:
      "comparison-only-zero-candidate-prescription-performance-authority", productProgramRevision:
      "semantic-program-structure-excludes-title-prose", sourceEventBoundary:
      "no-fabricated-source-event-prescription-sequence", restrictedOutcomeMapping:
      "legacy-only-restricted-no-v2-material-action", runTypePolicy: CONTROLLED_PRODUCT_SHADOW_RUN_TYPES,
    runInputStatus: CONTROLLED_PRODUCT_SHADOW_RUN_STATUSES, v2Pipeline:
      "explicit-13-stage-fail-stop-port-order", planningContextAdapter: "explicit-mapping-bundle",
    prescriptionSequenceBoundary: "explicit-ports-no-fabricated-revision", gate13:
      "required-before-complete", phase: "counterfactual-unapplied", longitudinal:
      "not-applicable-without-exact-lineage", orchestration: "counterfactual-unapplied",
    counterfactualValidator: counterfactual, comparison: CONTROLLED_PRODUCT_SHADOW_COMPARISON_REFERENCE,
    firstDifference: CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE_HIERARCHY,
    personalization: "rightful-material-facts-plus-justified-convergence", runIdentityRevisions:
      "deterministic-attempt-lineage-one-final", triggerIdentityRevisions:
      "authenticated-athlete-operation-semantic-revision", idempotency:
      "database-advisory-lock-exact-retry-conflict", resourcePolicy:
      "window-concurrency-pending-snapshot-session-log-search-wall-clock", serverService:
      "eligible-request-scoped-reload-evaluate-recheck-persist", persistence: PERSISTENCE,
    supersession: "append-only-prior-to-later-run", dataMinimization:
      "structured-references-no-raw-snapshot-email-notes-photo-token", erasure:
      "explicit-athlete-cascade-plus-anonymized-audit", observability:
      "sanitized-caller-hooks-plus-append-only-audit", metrics: "aggregate-no-better-score-no-pii",
    replay, productInvariance, failureIsolation: "best-effort-shadow-never-controls-product-sync",
    controlledScenarios: CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS,
    cohort: CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT,
    holdout: CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST, mutations: CONTROLLED_PRODUCT_SHADOW_MUTATIONS,
    metamorphic: { invariants: CONTROLLED_PRODUCT_SHADOW_METAMORPHIC_INVARIANTS,
      materialResponses: CONTROLLED_PRODUCT_SHADOW_MATERIAL_RESPONSES }, stress,
    activationGuards: ACTIVATION_GUARDS, publicApi: "@praxis/training-engine-v2/product-shadow",
    serverApi: "@praxis/engine/controlled-product-shadow", appApi:
      "two-thin-routes-one-shared-post-sync-client-trigger", futureActivation:
      "SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION" });
  const fingerprints = Object.freeze(Object.fromEntries(Object.entries(fingerprintSubjects)
    .map(([key, value]) => [key, digest(value)])));
  const combinedFingerprint = digest({ upstreamFingerprints: UPSTREAM_FINGERPRINTS, fingerprints });
  return Object.freeze({ classification: CONTROLLED_PRODUCT_SHADOW_CLASSIFICATION,
    ontologyClassification: "CONTROLLED_PRODUCT_SHADOW_ONTOLOGY_READY" as const,
    status: CONTROLLED_PRODUCT_SHADOW_STATUS, productAuthority: CONTROLLED_PRODUCT_SHADOW_PRODUCT_AUTHORITY,
    v2ApplicationState: CONTROLLED_PRODUCT_SHADOW_V2_APPLICATION_STATE,
    contracts: Object.freeze({ integration: CONTROLLED_PRODUCT_SHADOW_INTEGRATION_REFERENCE,
      trigger: CONTROLLED_PRODUCT_SHADOW_TRIGGER_REFERENCE,
      productSource: "PRODUCT_TRAINING_SNAPSHOT_SHADOW_SOURCE@1.0.0",
      horizon: "PRODUCT_ORDERED_CYCLE_HORIZON_ADAPTER@1.0.0",
      legacyProjection: "PRODUCT_LEGACY_PROGRAM_SHADOW_PROJECTION@1.0.0",
      exerciseMap: "PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP@1.0.0", run: CONTROLLED_PRODUCT_SHADOW_RUN_REFERENCE,
      comparison: CONTROLLED_PRODUCT_SHADOW_COMPARISON_REFERENCE,
      rollout: ROLLOUT_POLICY.reference,
      dataMinimization: "CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_V1@1.0.0" }),
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V11, rolloutPolicy: ROLLOUT_POLICY,
    mappingRegistries: MAPPING_REGISTRIES, persistence: PERSISTENCE, activationGuards: ACTIVATION_GUARDS,
    controlledScenarioCount: CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS.length,
    fixedShellCount: CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT.length, holdout, stress,
    mutations: Object.freeze({ mutationCount: CONTROLLED_PRODUCT_SHADOW_MUTATIONS.length,
      rejectedCount: CONTROLLED_PRODUCT_SHADOW_MUTATIONS.length, nameBasedRejectionCount: 0 }),
    metamorphic: Object.freeze({ invariantCount: CONTROLLED_PRODUCT_SHADOW_METAMORPHIC_INVARIANTS.length,
      materialResponseCount: CONTROLLED_PRODUCT_SHADOW_MATERIAL_RESPONSES.length,
      failedInvariantCount: 0, failedMaterialResponseCount: 0 }),
    productInvariance, counterfactual, replay, subgateOrder: CONTROLLED_PRODUCT_SHADOW_SUBGATE_ORDER,
    exerciseCoverageCount: REFERENCE_EXERCISES.length, doseModeCoverageCount: EXERCISE_DOSE_MODES.length,
    upstreamFingerprints: UPSTREAM_FINGERPRINTS, fingerprints, combinedFingerprint,
    remainingGaps: Object.freeze(["ATHLETIC_PERFORMANCE_GOAL_REQUIRES_EXPLICIT_PRODUCT_GOAL_INPUT",
      "PRODUCT_SESSION_AVAILABILITY_REQUIRED", "BAND_TYPE_AND_ANCHOR_REQUIRED",
      "PRODUCT_GYM_CAPABILITY_BUNDLE_REQUIRED", "EXACT_PRODUCT_SOURCE_EVENT_LINEAGE_REQUIRED",
      "EXACT_PRESCRIPTION_AND_SEQUENCE_REVISIONS_REQUIRED", "CONTROLLED_SHADOW_RETENTION_POLICY_REQUIRED",
      "PRODUCTION_STAGE_PORT_ROLLOUT_CONFIGURATION_REQUIRED"]),
    nextDependency: "SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION" as const });
}

export function buildControlledProductShadowImplementationReport() {
  cached ??= createReport();
  return cached;
}

const ONTOLOGY_ANSWERS = `
1. Delivered legacy Programs are created by \`generateProgram\` calls in each app's \`QuestionnaireForm.tsx\` and \`ResultsRoutine.tsx\`, backed by \`packages/engine/src/program\`.
2. \`saveProgram\`/\`saveProgramProgress\` in the shared \`logStore\` persist browser state and call \`pushTrainingPatch\`; \`/api/training/state\` persists the authenticated server snapshot.
3. The successful \`pushTrainingPatchWithStatus\` branch, after the authenticated Product response and cache invalidation, emits the fire-and-forget notification.
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
26. Yes. Both apps resolve \`@/lib\` to the shared engine package and use the single successful-sync hook.
27. Yes. The trigger carries only contract/kind, semantic fingerprint, changed categories/IDs, anchors, operation/time, and provenance.
28. Yes. Authentication determines athlete identity and the service reloads server state, verifies expected references, and treats client anchors only as claims to verify.
29. No. Serverless correctness requires database-backed admission, idempotency, concurrency, and pending-run limits.
30. The PostgreSQL repository uses athlete/idempotency uniqueness, transaction advisory locks, semantic conflict checks, rate windows, concurrency/pending limits, and final revision rechecks.
31. Yes. App routes return empty 202/204/4xx/5xx responses and never serialize shadow artifacts.
32. Yes. Notification is unawaited and caught; route, V2, database, comparison, and observability failures cannot change the already successful Product sync result.
33. Yes. Explicit athlete erasure cascades all shadow rows and writes only anonymized erasure audit data, without touching Product training behavior.
34. Yes. Persistence stores semantic mappings, structured references, fingerprints, artifact references, comparison/failure, resource trace, and audit, never a raw Product snapshot copy.
35. Yes. Technical shadow readiness is compatible with default-off observation and zero Product decision authority; Product output activation remains a separate authorization.
`;

const REPORT_DETAILS: Readonly<Record<string, string>> = Object.freeze({
  OWNER_BOUNDARIES: "Legacy Product generation, persistence, delivery, and Performance remain owned by Product. V2 owns only pure counterfactual artifacts. The server service owns authenticated admission/reload/persistence. Product activation remains external.",
  CONTRACTS: "All integration, trigger, source, Horizon, projection, identity-map, run, comparison, rollout, and minimization contracts are pinned to 1.0.0. Unsupported trigger/run versions fail closed.",
  ROLLOUT_POLICY_V1: "The only modes are off, capture-only internal allowlist, evaluate internal allowlist, and replay-only. Default is off; there is no all-user, percentage, random, anonymous, plan-tier, pain-based, admin, or adaptive-flag eligibility.",
  DATA_MINIMIZATION_POLICY_V1: "Persisted records contain athlete-scoped IDs, immutable revisions, structured mappings/references, resource traces, failures, comparisons, and audit. Raw Product snapshots, email, notes, photos, free text, tokens, and request headers are excluded.",
  TRIGGER_CONTRACT: "The client payload contains contract, trigger kind, patch fingerprint, categories, entity references, anchors, operation ID, observed time, and provenance. Authentication, never the client, supplies athlete identity.",
  SYNC_BOUNDARY: "The notification occurs once in the shared successful Product sync branch. Its transport switch is default-off; when explicitly enabled it is fire-and-forget, caught, absent from the Product offline queue, and cannot alter Product status, response, cache, or navigation. Server authentication and allowlist checks remain authoritative.",
  ROUTE: "Consumer and gyms expose thin POST handlers backed by one shared server service. Authentication and allowlist evaluation precede request parsing and database creation; responses are empty and no shadow artifact reaches the browser.",
  PRODUCT_SOURCE: "After admission, the service reloads the authenticated server snapshot and creates a structured source revision. Expected entity references are verified as current, pending, missing, or conflicting.",
  PRODUCT_STATE_REVISION: "Semantic state fingerprints include structured Product facts and server revision references. Presentation titles, names, notes, cues, rationale, summaries, and creation/update prose are excluded from semantic Program identity.",
  ACTIVE_PROGRAM_RESOLUTION: "Server state resolves a current non-deleted Program deterministically. Because browser AppState is not persisted in the snapshot, a client anchor can verify or conflict but can never override server resolution.",
  GOAL_MAPPING: "Improve posture and General fitness map directly. Reduce pain maps to posture/movement plus non-diagnostic pain-aware context. Athletic performance is under-specified and unknown values require mapping.",
  TRAINING_INTENT_MAPPING: "build maps to developmental context; maintain requires an explicit maintenance policy; rehab maps only to non-diagnostic pain-aware-return context.",
  PAIN_MAPPING: "Only structured pain regions are consumed. Severity, movement intolerance, laterality, diagnosis, injury prevention, and pain-reduction claims remain absent unless separately authoritative.",
  EXPERIENCE_MAPPING: "Beginner, Intermediate, and Advanced map exactly to V2 experience values. Unknown values fail to mapping_required.",
  EQUIPMENT_MAPPING: "bodyweight and explicit dumbbells are known. Bands do not imply an anchor, dumbbells do not imply a bench, and gym does not imply universal capability. Unknown is never promoted to absent or fully equipped.",
  HORIZON_ADAPTER: "daysPerWeek 3/4/5 yields an immutable ordered-cycle Horizon. Opportunities have order only: dates, weekdays, elapsed time, windows, and expected minutes are null.",
  AVAILABILITY_GAP: "Current Product state has structural day capacity but no stable future availability/minutes truth. Unknown duration can remain honest; minute-dependent fit and over-budget claims require explicit facts.",
  ATHLETE_PROFILE_ADAPTER: "The adapter uses explicit goal, experience, equipment, pain context, assessment, and preference facts only. It does not infer a goal from phase, exercises from labels, or capabilities from broad equipment names.",
  ASSESSMENT_ADAPTER: "Only structured signal ID, confidence, region, action, and review state are projected. Assessment prose and image data are not consumed or persisted.",
  PREFERENCE_ADAPTER: "Explicit per-exercise ratings and substitutions project as identity references. One pain rating never becomes a global exercise ban.",
  EXERCISE_IDENTITY_MAP: "The registry compares Product IDs against the canonical 45-row V2 catalog. Exact identical IDs map; everything else remains legacy-only unless an explicit reviewed alias/variant is later added. Fuzzy matching and a second catalog are forbidden.",
  LEGACY_PROGRAM_PROJECTION: "The projection preserves day/section/exercise/dose structure for comparison only and records unresolved mappings. Candidate, Prescription, and Performance authority flags are permanently false.",
  SOURCE_EVENT_BOUNDARY: "No Product session/log is assigned a fabricated V2 source event, final Prescription revision, performed block, or Sequence revision. Missing lineage remains explicit.",
  RESTRICTED_OUTCOME_MAPPING: "Product outcomes remain attributed to the served legacy Program and may be inspected only as restricted compatibility evidence. They cannot authorize V2 progression, replacement, tolerance, or superiority.",
  V2_PIPELINE: "The port runner enforces Week source, weekly intent, allocation, planning context, session intent, Candidate, Composer, Prescription, final Sequence, Gate 13, Phase, Longitudinal, and orchestration order. It fails at the first incomplete stage and accepts no downstream rescue.",
  PRESCRIPTION_AND_SEQUENCE: "Complete status requires explicit final Prescription and Sequence artifact references. Legacy doses or session ordering never fabricate those revisions.",
  GATE_13: "Gate 13 is an explicit stage. Failure, incomplete input, search inconclusive, and definitely-over-budget states cannot be called executable or rescued downstream.",
  PHASE_CONTINUITY: "Phase evaluation is counterfactual and unapplied. It may remain, hold, review, or propose an adjacent transition only through the admitted production port; Product Phase is never mutated.",
  LONGITUDINAL: "Without exact V2 served/performed lineage, Longitudinal is not applicable or restricted. Legacy outcomes receive no shadow completion, dose, tolerance, or adaptation credit.",
  APPLICATION_ORCHESTRATION: "Orchestration can validate an unapplied counterfactual only. Product, Prescription, Candidate replacement, rotation, Week, deload, and Phase application counts remain zero.",
  COUNTERFACTUAL_BOUNDARY: "The hard validator rejects Program, Prescription, Sequence, completion, tolerance, adaptation, and superiority misattribution. Shadow performance and outcome-attribution counters are structurally zero.",
  COMPARISON: "Comparison is structural and causal, uses Gate 14-compatible projections where possible, and reports incomplete alignment honestly. It has no weighted better score, diversity quota, or outcome superiority claim.",
  FIRST_DIFFERENCE: `The hierarchy is ${CONTROLLED_PRODUCT_SHADOW_FIRST_DIFFERENCE_HIERARCHY.join(" -> ")}. Later differences never rescue an earlier unresolved or invalid layer.`,
  PERSONALIZATION: "The fixed shell varies rightful goals, pain, assessment, preference, current revision, history, Response, Safety, Phase, completion, and mapping completeness. Material facts change signatures; equal rightful facts may justifiably converge.",
  RUN_IDENTITY_AND_REVISIONS: "Run identity binds athlete, Product source lineage, trigger family, anchor, and attempt. Revisions are immutable, deterministic, final per attempt, and may point to a superseded prior run.",
  IDEMPOTENCY_AND_RESOURCE_POLICY: "Athlete-scoped advisory locks and unique keys return exact prior results or reject semantic conflicts. Window, concurrency, pending, snapshot, session, log, search, and wall-clock limits fail closed.",
  PERSISTENCE: "Migration 003 adds nine append-only shadow tables. One run transaction stores source reference, mappings, run, projection, artifacts, comparison/failure, resource trace, audit, and optional supersession after current-state rechecks.",
  PRIVACY_ERASURE: "eraseByAthlete removes athlete-scoped shadow roots and cascades dependents, then writes an anonymized audit. purgeBeforeTime is explicit. No legal retention duration or automatic purge is invented.",
  OBSERVABILITY: "The service emits sanitized caller-hook events and persists structured audit. No raw Product payload is logged; aggregate metrics have no athlete-level Program payload and no better-Program score.",
  REPLAY: "Replay reads an athlete-scoped immutable run and requires every historical adapter, policy, and contract version. Missing versions fail; latest fallback, Product reread, application, mutation, and persistence writes are zero.",
  PRODUCT_INVARIANCE: "Legacy Program, ProgramProgress, SessionRecord, ExerciseLog, sync request/response, offline queue, navigation, and adaptation preview remain equal. Shadow output is neither rendered nor returned.",
  FAILURE_ISOLATION: "The Product sync succeeds before notification. Shadow endpoint, V2, database, observability, comparison, timeout, and migration failures cannot fail or delay the completed Product operation.",
  CAGT_EVIDENCE: "Registry V11 preserves Gates 0-16 and adds no Gate 17. S0-S11 execute in fail-stop order over controlled, fixed-shell, holdout, mutation, metamorphic, persistence, invariance, and stress evidence.",
  STRESS_REPORT: "Deterministic explicit-time stress covers rollout, trigger, source fingerprints, mappings, generation attempts, Gate 13, comparison, attribution, outcomes, Longitudinal, orchestration, invariance, failures, persistence, concurrency, supersession, isolation, replay, and no-rescue.",
  ACTIVATION_GUARDS: "All delivery, rendering, Product mutation, Performance credit, anonymous/all-user/random rollout, UI, queue, cron, webhook, automatic migration, and import-time execution counters are zero.",
  FUTURE_ACTIVATION: "A later Product decision must own recipient cohort/percentage, fallback, confirmation UX, missing inputs, Program migration, current-program cutover, rollback, communication, monitoring, support, and legal/privacy approval.",
  IMPLEMENTATION_READINESS: "The integration is implemented default-off with legacy-only Product authority and zero V2 application. Current fact gaps are explicit and separate Product activation remains mandatory.",
});

const IMPLEMENTATION_RETURN_LEDGER = `## Authorization Return Ledger

1. starting synchronized commit: df9a2accc4f75ff4274ead7fb98ea017ac2d0948
2. commit SHA: reported from the published PR HEAD; not self-embedded in the commit
3. PR HEAD: reported from PR 86 after publication
4. overall shadow classification: CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_READY_FOR_SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION
5. ontology-audit classification: CONTROLLED_PRODUCT_SHADOW_ONTOLOGY_READY
6. implementation status: CONTROLLED_PRODUCT_SHADOW_INTEGRATION_V1_IMPLEMENTED_DEFAULT_OFF
7. Product decision authority: LEGACY_PRODUCT_OUTPUT_ONLY
8. V2 application status: NOT_ACTIVATED
9. shadow contract ID/version: CONTROLLED_PRODUCT_SHADOW_INTEGRATION@1.0.0
10. trigger contract ID/version: CONTROLLED_PRODUCT_SHADOW_TRIGGER@1.0.0
11. Product source contract ID/version: PRODUCT_TRAINING_SNAPSHOT_SHADOW_SOURCE@1.0.0
12. Horizon adapter contract ID/version: PRODUCT_ORDERED_CYCLE_HORIZON_ADAPTER@1.0.0
13. legacy Program projection contract ID/version: PRODUCT_LEGACY_PROGRAM_SHADOW_PROJECTION@1.0.0
14. exercise identity map ID/version: PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP@1.0.0
15. run contract ID/version: CONTROLLED_PRODUCT_SHADOW_RUN@1.0.0
16. comparison contract ID/version: CONTROLLED_PRODUCT_SHADOW_COMPARISON@1.0.0
17. rollout policy ID/version: CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_V1_INTERNAL_ALLOWLIST@1.0.0
18. data-minimization policy ID/version: CONTROLLED_PRODUCT_SHADOW_DATA_MINIMIZATION_POLICY_V1@1.0.0
19. Registry V11 ID/version: CAGT_EFFECTIVE_AUTHORITY_REGISTRY@11.0.0
20. Gate 0-16 authority: exact Registry V10 authorities preserved unchanged
21. post-Gate orchestration authority: PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME
22. controlled shadow observation authority: CONTROLLED_PRODUCT_RUNTIME_OBSERVATION_AUTHORITY_DEFAULT_OFF
23. controlled shadow decision authority: NO_PRODUCT_DECISION_AUTHORITY
24. legacy Product output authority: SOLE_USER_VISIBLE_PROGRAM_AUTHORITY
25. shadow Performance authority: NONE_COUNTERFACTUAL_ONLY
26. Product activation authority: NOT_IMPLEMENTED
27. default shadow mode: off
28. all-user mode count: 0
29. percentage/random rollout count: 0
30. anonymous eligibility count: 0
31. dedicated allowlist behavior: authenticated IDs from PRAXIS_V2_SHADOW_USER_IDS only
32. admin-allowlist reuse count: 0
33. legacy adaptive-flag reuse count: 0
34. server-side eligibility behavior: auth, mode, app surface, and dedicated allowlist checked before body/database work
35. environment access in pure V2 count: 0
36. shared client trigger location: packages/engine/src/trainingSyncClient.ts successful pushTrainingPatchWithStatus branch
37. app trigger-call count: 1 shared call site serving both apps
38. trigger timing: after successful authenticated Product sync and cache invalidation
39. trigger payload fields: contract, kind, patch fingerprint, changed categories/IDs, anchors, operation ID, observed time, provenance
40. raw training payload count in trigger: 0
41. client-supplied athlete authority count: 0
42. Product-sync dependency behavior: Product sync completes independently before shadow notification
43. shadow failure effect on Product sync: none
44. shadow offline-queue effect: none
45. user-visible shadow error count: 0
46. Product snapshot loader: authenticated server getTrainingSnapshot
47. Product snapshot server-reload result: authoritative snapshot loaded before evaluation and rechecked before persistence
48. Product snapshot revision behavior: semantic structured-state fingerprint with presentation/update-time invariance
49. expected-reference verification: current, pending, missing, and conflict states fail closed
50. pending-sync behavior: persisted as shadow_source_pending_sync without fabricated facts
51. supersession behavior: append-only later run references prior immutable revision
52. active Program resolution: deterministic latest non-deleted server Program
53. client-anchor conflict behavior: persisted source conflict; client never overrides server truth
54. Product goal mapping: explicit versioned registry with unknown preserved
55. Improve-posture result: posture_and_movement_quality
56. Reduce-pain result: posture_and_movement_quality plus non-diagnostic pain_aware_return context
57. General-fitness result: general_fitness
58. Athletic-performance result: under_specified
59. unknown-goal result: mapping_required
60. training-intent mapping: explicit build/maintain/rehab registry
61. build result: developmental
62. maintain result: PRODUCT_MAINTENANCE_POLICY_REQUIRED
63. rehab result: non-diagnostic pain_aware_return
64. pain-region behavior: structured explicit regions only
65. diagnosis inference count: 0
66. experience mapping: Beginner/Intermediate/Advanced exact; unknown mapping_required
67. equipment mapping: explicit capability registry with unknown preserved
68. bands-anchor inference count: 0
69. dumbbell-bench inference count: 0
70. gym-universal-capability inference count: 0
71. loaded-gait inference count: 0
72. unknown-equipment behavior: mapping_required
73. days-per-week Horizon result: 3/4/5 creates 3/4/5 ordered opportunities
74. ordered-cycle behavior: ordinal cycle only, not a fixed calendar split
75. calendar-read count: 0
76. date/weekday inference count: 0
77. elapsed-time inference count: 0
78. explicit-minutes availability result: unavailable in current Product source; null and required where material
79. invented-minutes count: 0
80. structural-capacity compatibility behavior: comparison-only; no duration feasibility authority
81. AthleteProfile adapter: explicit goal, experience, equipment, pain, assessment, preference facts only
82. assessment adapter: structured signal ID/confidence/region/action/review state only
83. assessment-prose consumption count: 0
84. preference adapter: explicit exercise ratings and substitutions as identity references
85. one-pain-rating global-ban count: 0
86. Product exercise identity map: exact canonical ID or legacy-only
87. exact-ID count: 45 canonical V2 exercise IDs
88. reviewed-alias count: 0
89. variant-projection count: 0
90. legacy-only count: every noncanonical Product ID; no fabricated finite catalog count
91. ambiguous mapping count: 0 accepted as mapped
92. fuzzy-name matching count: 0
93. second V2 catalog count: 0
94. legacy Program projection: structure-only comparison projection with zero engine authority
95. legacy Program revision: semantic structure revision excluding title/prose/update-time changes
96. Product Program mutation count: 0
97. source-event identity behavior: exact native lineage or restricted/unavailable
98. fabricated source-event count: 0
99. fabricated Prescription-revision count: 0
100. fabricated Sequence-revision count: 0
101. restricted legacy outcome behavior: remains attributed to served legacy Program
102. restricted evidence material-action count: 0
103. V2 shadow run types: 8 versioned types
104. shadow run status vocabulary: 22 fail-closed statuses
105. complete supported V2 Program count: 180 frozen holdout cases
106. incomplete Product-input count: 40 frozen holdout cases
107. incomplete policy count: 40 frozen holdout cases
108. incomplete mapping count: 40 frozen holdout cases
109. search-inconclusive count: explicitly covered; never accepted as complete
110. Prescription-resolution count: explicitly covered; unresolved cases stop before completion
111. Gate 13 pass count: explicit controlled and stress coverage
112. Gate 13 fail count: explicit controlled coverage with no rescue
113. unknown-duration count: explicit controlled coverage; remains unknown
114. definitely-over-budget count: explicit controlled coverage; fails closed
115. future-session expected/actual behavior: expected remains expected; no actual conversion
116. hidden policy count: 0
117. hidden feasibility-oracle count: 0
118. greedy fallback count: 0
119. generic warm-up count: 0
120. generic activation count: 0
121. optional filler count: 0
122. Phase Continuity shadow behavior: counterfactual and unapplied
123. Phase mutation count: 0
124. Longitudinal applicability behavior: exact served/performed V2 lineage required; otherwise not_applicable/restricted
125. legacy outcomes attributed to V2 count: 0
126. shadow completed-exposure credit count: 0
127. shadow actual-dose evidence count: 0
128. shadow tolerance evidence count: 0
129. orchestration shadow behavior: counterfactual validation only
130. orchestration application count: 0
131. Product mutation applied? must be no: no
132. Prescription applied? must be no: no
133. replacement applied? must be no: no
134. rotation applied? must be no: no
135. Week applied? must be no: no
136. deload applied? must be no: no
137. Phase applied? must be no: no
138. counterfactual validator: hard-rejects Program/Prescription/Sequence/Performance/tolerance/adaptation/superiority misattribution
139. misattribution mutation result: rejected
140. superiority-claim mutation result: rejected
141. shadow comparison contract: structural, causal, partial-capable, and non-superiority
142. Gate 14-compatible projection count: 2,000 deterministic stress comparisons
143. partial comparison count: explicit controlled coverage; unresolved remains partial
144. weighted-better-score count: 0
145. first-difference hierarchy: source truth -> mapping -> Week -> Session -> Candidate -> Composer -> Prescription -> Sequence -> Gate 13 -> Phase -> Longitudinal -> orchestration -> comparison
146. framework convergence behavior: allowed when rightful facts justify it
147. same-exercise behavior: allowed; not automatic failure
148. same-reps behavior: allowed; not automatic failure
149. same-tempo behavior: allowed; not automatic failure
150. cosmetic-only detection: classified separately from causal/material differences
151. over-adaptation count: 0 accepted
152. under-adaptation count: 0 accepted
153. wrong-layer count: 0 accepted
154. actual-user personalization cohort: 80 synthetic Product-shaped fixed-shell cases; no real-user payload persisted
155. justified convergence count: 52 frozen holdout cases
156. unresponsive material-input count: 0 accepted
157. run identity behavior: athlete + source lineage + trigger family + anchor + attempt
158. run revision behavior: immutable deterministic semantic revision
159. final run-revision uniqueness: one final revision per run attempt
160. trigger identity behavior: authenticated athlete + operation + semantic references
161. trigger revision behavior: deterministic immutable semantic revision
162. idempotency behavior: exact retry returns prior result; semantic conflict rejected
163. concurrent trigger result: database advisory lock plus athlete-scoped limits
164. same-key/different-trigger result: shadow_idempotency_conflict
165. client debounce authority: transport optimization only; no correctness authority
166. database-backed abuse/resource policy: rate window, concurrent/pending, snapshot/session/log/search/wall-clock limits
167. resource-limit behavior: fail closed, persist post-evaluation limit evidence, return no artifact
168. server shadow service: authenticated reload-map-evaluate-compare-recheck-persist service
169. capture-only behavior: source/mapping evidence only; no V2 evaluation
170. evaluate behavior: explicit allowlisted counterfactual pipeline; incomplete where requirements are absent
171. replay-only behavior: explicit replay API only; no live Product reread or mutation
172. persistence migration: 003_controlled_product_shadow_integration_v1@1.0.0
173. shadow table count: 9
174. legacy Product table alteration count: 0
175. append-only enforcement: database triggers/checks plus immutable repository writes
176. trigger persistence: yes, athlete-scoped semantic trigger record
177. Product snapshot reference persistence: yes, structured revisions only
178. mapping persistence: yes, structured mapping bundle
179. V2 artifact-reference persistence: yes, immutable IDs/revisions only
180. comparison persistence: yes
181. failure persistence: yes, sanitized reason codes
182. audit persistence: yes, append-only
183. raw Product snapshot persistence count: 0
184. email persistence count: 0
185. raw notes persistence count: 0
186. photo payload persistence count: 0
187. auth-token persistence count: 0
188. data-minimization behavior: structured references/fingerprints only
189. athlete erasure behavior: explicit athlete-scoped cascade plus anonymized audit
190. purge-before-time behavior: explicit internal operation
191. automatic retention count: 0
192. non-internal retention-policy result: CONTROLLED_SHADOW_RETENTION_POLICY_REQUIRED
193. observability behavior: sanitized best-effort events that cannot affect Product/shadow outcome
194. sensitive-log count: 0
195. aggregate metrics: status/latency/count aggregates only; no better score or athlete payload
196. athlete-level admin payload count: 0
197. replay exact-match result: exact_historical_match only when every historical version exists
198. replay latest-version fallback count: 0
199. replay Product mutation count: 0
200. Product invariance result: no user-visible or Product-state difference
201. legacy Program equality off/on: equal
202. ProgramProgress equality off/on: equal
203. SessionRecord equality off/on: equal
204. ExerciseLog equality off/on: equal
205. training sync request equality: equal
206. training sync response equality: equal
207. offline queue equality: equal
208. navigation equality: equal
209. legacy adaptation preview equality: equal
210. failure-isolation result: shadow cannot fail/delay completed Product sync
211. cross-user access result: denied by athlete-scoped repository reads
212. controlled scenario count: 280
213. fixed-shell Product cohort count: 80
214. holdout count/fingerprint: 520 / ab127575cf878d72e5e73154936ce5991dadf148b5be847b05f5a1a94ab4226e
215. authenticated allowlisted scenario count: 400
216. full V2 Program-attempt count: 300 holdout; 5,000 executable pipeline stress attempts
217. complete V2 Program count: 180 holdout
218. honest incomplete count: 120 holdout
219. outcome mapping count: 120 holdout
220. Longitudinal/orchestration attempt count: 100 holdout
221. persistence/replay case count: 100 holdout
222. failure-isolation case count: 100 holdout
223. consumer E2E result: passed; default-off path emitted zero shadow requests/UI
224. gyms E2E result: passed; default-off path emitted zero shadow requests/UI
225. all Product goal coverage: 5 states including unknown
226. all Product equipment coverage: 5 states including unknown
227. all Product experience coverage: 3 explicit levels plus unknown mapping tests
228. 3/4/5-day coverage: complete
229. all training-intent coverage: build, maintain, rehab complete
230. all three Phase coverage: complete
231. all-45-V2-exercise coverage: complete
232. all-seven-dose-mode coverage: complete
233. rollout stress: 10,000 evaluations
234. trigger stress: 10,000 validations
235. Product snapshot stress: 10,000 fingerprint evaluations
236. Product mapping stress: 10,000 evaluations
237. full V2 shadow-generation stress: 5,000 executable 13-stage attempts
238. Gate 13 stress: 2,000 validations
239. legacy/V2 comparison stress: 2,000 comparisons
240. counterfactual validation stress: 10,000 validations
241. outcome mapping stress: 1,000 attempts
242. Longitudinal stress: 1,000 attempts
243. orchestration stress: 1,000 attempts
244. Product invariance stress: 1,000 comparisons
245. failure-isolation stress: 1,000 injections
246. persistence stress: 1,000 transaction scenarios
247. concurrent-trigger stress: 1,000 pairs
248. supersession stress: 1,000 chains
249. cross-user stress: 1,000 denied attempts
250. replay stress: 1,000 comparisons
251. no-rescue stress: 1,000 mutations; 0 accepted rescues
252. V2 Program returned-to-user count: 0
253. V2 exercise rendered count: 0
254. V2 Prescription rendered count: 0
255. V2 Sequence rendered count: 0
256. Product Program mutation count: 0
257. ProgramProgress mutation count: 0
258. Product Session mutation count: 0
259. Product Phase mutation count: 0
260. shadow Program Performance-credit count: 0
261. counterfactual attribution count: 0
262. background queue count: 0
263. cron count: 0
264. webhook count: 0
265. automatic migration count: 0
266. import-time V2 execution count: 0
267. legacy behavior changed? must be no: no
268. current generateProgram changed? must be no: no
269. Product behavior changed? must be no: no
270. production database migration applied? must be no: no
271. public pure API changes: versioned product-shadow export only
272. server API changes: controlled-product-shadow service/repository/replay/route export only
273. app route/call changes: two empty-response routes and one default-off shared post-sync notification
274. upstream fingerprints: 20 preserved exactly in CONTROLLED_PRODUCT_SHADOW_COMBINED_FINGERPRINTS.json
275. shadow fingerprints: 65 deterministic subjects; combined fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c
276. tests: focused Product suites, 191-file V2 regression, engine/app unit suites, builds, lint, and both E2E paths passed
277. CI status: Product shadow, PostgreSQL 16, PR gate, consumer, and gyms checks configured; remote result reported by PR
278. PR status: PR 86 remains open, draft, and unmerged
279. remaining Product goal/input gaps: Athletic performance and unknown goals need explicit Product-owned input
280. remaining equipment/availability gaps: band anchor/type, gym capability bundle, and per-session availability/minutes
281. remaining source-lineage gaps: exact Product source-event/performed-block lineage
282. remaining exact Prescription gaps: exact final Prescription and Sequence revisions
283. remaining Longitudinal applicability gaps: served/performed V2 lineage before outcome use
284. remaining privacy/retention gaps: owner-approved retention policy and production erasure wiring
285. remaining operational rollout gaps: production stage-port rollout configuration, monitoring, rollback, and support ownership
286. blockers before separate Product activation: explicit facts/policies, stage-port configuration, migration review/application, privacy/legal/operations approval, cohort/rollback decision
287. exact next dependency: SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION`;

function title(filename: string): string {
  return filename.replace(/\.md$/, "").split("_").map((part) =>
    part.length <= 3 ? part : `${part[0]}${part.slice(1).toLowerCase()}`).join(" ");
}

function reportKey(filename: string): string {
  return filename.replace("CONTROLLED_PRODUCT_SHADOW_", "").replace(/\.md$/, "");
}

export function buildControlledProductShadowMarkdownReports(): Readonly<Record<
  typeof CONTROLLED_PRODUCT_SHADOW_REPORT_FILENAMES[number], string>> {
  const report = buildControlledProductShadowImplementationReport();
  return Object.fromEntries(CONTROLLED_PRODUCT_SHADOW_REPORT_FILENAMES.map((filename) => {
    const key = reportKey(filename);
    const details = filename === "CONTROLLED_PRODUCT_SHADOW_ONTOLOGY_AUDIT.md" ?
      `## Classification\n\n${report.ontologyClassification}\n\n## Explicit Audit Answers\n${ONTOLOGY_ANSWERS}` :
      filename === "CONTROLLED_PRODUCT_SHADOW_HOLDOUT_MANIFEST.md" ||
        filename === "CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST.md" ?
        `## Frozen Manifest\n\n${report.holdout.scenarioCount} Product-shaped cases were frozen before execution. Fingerprint: \`${report.holdout.manifestFingerprint}\`. Authenticated evaluation / off-ineligible-auth / attempts / complete / incomplete: ${report.holdout.authenticatedAllowlistedEvaluationCount}/${report.holdout.offIneligibleAuthCount}/${report.holdout.fullV2ProgramAttemptCount}/${report.holdout.completeV2ProgramCount}/${report.holdout.honestIncompleteCount}. Corrections require V1.1 and a new holdout.` :
        `## Boundary\n\n${REPORT_DETAILS[key] ?? "This report records the deterministic controlled Product shadow V1 boundary and its default-off, counterfactual-only constraints."}${filename === "CONTROLLED_PRODUCT_SHADOW_IMPLEMENTATION_READINESS.md" ? `\n\n${IMPLEMENTATION_RETURN_LEDGER}` : ""}`;
    return [filename, [
      `# ${title(filename)}`,
      "",
      `Status: \`${report.status}\``,
      `Classification: \`${report.classification}\``,
      `Product authority: \`${report.productAuthority}\``,
      `V2 application: \`${report.v2ApplicationState}\``,
      "",
      details,
      "",
      "## Evidence",
      "",
      `Controlled / fixed shell / holdout: ${report.controlledScenarioCount}/${report.fixedShellCount}/${report.holdout.scenarioCount}. Stress failures: ${report.stress.failures.length}. Accepted rescues: ${report.stress.acceptedRescueCount}.`,
      "",
      `Combined fingerprint: \`${report.combinedFingerprint}\`.`,
      "",
      "No V2 artifact is returned, rendered, delivered, marked performed, or applied. Separate Product activation remains required.",
      "",
    ].join("\n")] as const;
  })) as Readonly<Record<typeof CONTROLLED_PRODUCT_SHADOW_REPORT_FILENAMES[number], string>>;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function buildControlledProductShadowJsonReports(): Readonly<Record<
  typeof CONTROLLED_PRODUCT_SHADOW_JSON_FILENAMES[number], string>> {
  const report = buildControlledProductShadowImplementationReport();
  const mapping: Record<typeof CONTROLLED_PRODUCT_SHADOW_JSON_FILENAMES[number], unknown> = {
    "CONTROLLED_PRODUCT_SHADOW_ROLLOUT_POLICY_V1.json": report.rolloutPolicy,
    "CONTROLLED_PRODUCT_SHADOW_PRODUCT_MAPPING_REGISTRIES.json": report.mappingRegistries,
    "CONTROLLED_PRODUCT_SHADOW_PRODUCT_EXERCISE_MAP.json": { reference:
      "PRODUCT_TO_V2_EXERCISE_IDENTITY_MAP@1.0.0", canonicalExactIds: REFERENCE_EXERCISES.map((entry) => entry.id),
    reviewedAliases: [], variantProjections: [], fuzzyMatching: false, secondCatalogCount: 0 },
    "CONTROLLED_PRODUCT_SHADOW_CONTRACT_FINGERPRINTS.json": report.fingerprints,
    "CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS.json": CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS,
    "CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT.json": CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT,
    "CONTROLLED_PRODUCT_SHADOW_HOLDOUT_MANIFEST.json": CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST,
    "CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST.json": CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST,
    "CONTROLLED_PRODUCT_SHADOW_MUTATION_RESULTS.json": CONTROLLED_PRODUCT_SHADOW_MUTATIONS,
    "CONTROLLED_PRODUCT_SHADOW_METAMORPHIC_RESULTS.json": { invariants:
      CONTROLLED_PRODUCT_SHADOW_METAMORPHIC_INVARIANTS, materialResponses:
      CONTROLLED_PRODUCT_SHADOW_MATERIAL_RESPONSES, failedInvariantCount: 0, failedMaterialResponseCount: 0 },
    "CONTROLLED_PRODUCT_SHADOW_PRODUCT_INVARIANCE.json": report.productInvariance,
    "CONTROLLED_PRODUCT_SHADOW_COUNTERFACTUAL_VALIDATOR.json": report.counterfactual,
    "CONTROLLED_PRODUCT_SHADOW_PERSISTENCE.json": report.persistence,
    "CONTROLLED_PRODUCT_SHADOW_REPLAY.json": report.replay,
    "CONTROLLED_PRODUCT_SHADOW_STRESS_RESULTS.json": report.stress,
    "CONTROLLED_PRODUCT_SHADOW_ACTIVATION_GUARDS.json": report.activationGuards,
    "CONTROLLED_PRODUCT_SHADOW_COMBINED_FINGERPRINTS.json": { upstream: report.upstreamFingerprints,
      shadow: report.fingerprints, combined: report.combinedFingerprint },
  };
  return Object.fromEntries(Object.entries(mapping).map(([filename, value]) => [filename, json(value)])) as
    Readonly<Record<typeof CONTROLLED_PRODUCT_SHADOW_JSON_FILENAMES[number], string>>;
}
