import {
  ADAPTATION_APPLICATION_AUDIT_ROLLBACK_SEAM,
  ADAPTATION_APPLICATION_OWNERS,
  ADAPTATION_APPLICATION_STATES,
  ADAPTATION_PERSISTENCE_ENTITY_TYPES,
  ADAPTATION_PERSISTENCE_TRANSACTION_BOUNDARIES,
} from "../../src/adaptationPersistence/designContracts";
import {
  ADHERENCE_SOURCE_ADAPTER_CONTRACT,
  ADHERENCE_STATES,
  CLINICIAN_RESTRICTION_SOURCE_ADAPTER_CONTRACT,
  EQUIPMENT_ENVIRONMENT_SOURCE_ADAPTER_CONTRACT,
  EXERCISE_PERFORMANCE_SOURCE_ADAPTER_CONTRACT,
  EXTERNAL_TRAINING_ACTIVITY_TYPES,
  EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT,
  NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE,
  OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT,
  OUTCOME_SOURCE_AUTHORITIES,
  OUTCOME_SOURCE_AUTHORIZATION_STATES,
  OUTCOME_SOURCE_CATEGORIES,
  OUTCOME_SOURCE_FACT_TYPES,
  OUTCOME_SOURCE_GATE_11_SUBGATES,
  OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
  OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_STATUS,
  OUTCOME_SOURCE_REPLAY_CONTRACT,
  OUTCOME_SOURCE_REVISION_STATES,
  PERFORMANCE_COMPLETION_STATES,
  PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE,
  RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT_REFERENCE,
  RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT,
  RECOVERY_READINESS_STATES,
  RESPONSE_TOLERANCE_STATES,
  TRAINING_RESPONSE_SOURCE_ADAPTER_CONTRACT,
  TRAINING_SAFETY_SOURCE_ADAPTER_CONTRACT,
} from "../../src/outcomeSources/designContracts";
import {
  outcomeSourceActivationGuards,
  outcomeSourceFoundationFingerprints,
  runOutcomeSourceControlledScenarios,
  runOutcomeSourceFixedShell,
  runOutcomeSourceGoldenEquivalence,
  runOutcomeSourceHoldout,
  runOutcomeSourceMetamorphicChecks,
  runOutcomeSourceMutationChecks,
  runOutcomeSourceStress,
} from "../helpers/outcomeSourceDesignLab";
import { runAdaptationApplicationHandoffCases } from "../helpers/adaptationPersistenceDesignLab";
import { runOutcomeSourceReplayEvidence } from "./outcomeSourceReplay";
import {
  CURRENT_PERSISTENCE_STACK_FINDING,
  CURRENT_PRODUCT_SOURCE_COUNTS,
  CURRENT_PRODUCT_SOURCE_INVENTORY,
  OUTCOME_SOURCE_EXACT_NEXT_DEPENDENCY,
  OUTCOME_SOURCE_FOUNDATION_CLASSIFICATION,
  OUTCOME_SOURCE_ONTOLOGY_AUDIT_CLASSIFICATION,
  OUTCOME_SOURCE_OWNER_BOUNDARIES,
  OUTCOME_SOURCE_RUNTIME_ACTIVATION_STATUS,
} from "./outcomeSourceContracts";
import { OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_MANIFEST } from "./outcomeSourceCohorts";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7, CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_REFERENCE } from
  "./effectiveAuthorityRegistryV7";
import { LONGITUDINAL_UPSTREAM_FINGERPRINTS } from "./longitudinalAdaptationReport";
import { digest } from "./signatures";

export const OUTCOME_SOURCE_REPORT_FILENAMES = Object.freeze([
  "OUTCOME_SOURCE_AND_PERSISTENCE_ONTOLOGY_AUDIT.md",
  "OUTCOME_SOURCE_AND_PERSISTENCE_OWNER_BOUNDARIES.md",
  "OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT.md",
  "OUTCOME_SOURCE_CATEGORY_VOCABULARY.md",
  "RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT.md",
  "NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT.md",
  "OUTCOME_SOURCE_IDENTITY_AND_REVISIONS.md",
  "OUTCOME_SOURCE_ACTIVE_REVISION_SELECTION.md",
  "OUTCOME_SOURCE_IDEMPOTENCY_AND_DEDUPLICATION.md",
  "OUTCOME_SOURCE_CORRECTION_SUPERSESSION_WITHDRAWAL.md",
  "OUTCOME_SOURCE_TIME_SEMANTICS.md",
  "OUTCOME_SOURCE_AUTHORITY.md",
  "OUTCOME_SOURCE_DECISION_USE_AUTHORIZATION.md",
  "OUTCOME_SOURCE_PRIVACY_AND_DATA_MINIMIZATION.md",
  "OUTCOME_SOURCE_FREE_TEXT_BOUNDARY.md",
  "PERFORMANCE_SOURCE_ADAPTER_CONTRACT.md",
  "RESPONSE_SOURCE_ADAPTER_CONTRACT.md",
  "ADHERENCE_SOURCE_ADAPTER_CONTRACT.md",
  "RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT.md",
  "SAFETY_AND_CLINICIAN_SOURCE_CONTRACT.md",
  "EQUIPMENT_ENVIRONMENT_SOURCE_CONTRACT.md",
  "EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT.md",
  "PRODUCTION_OUTCOME_SOURCE_SNAPSHOT.md",
  "OUTCOME_SOURCE_SNAPSHOT_BUILDER.md",
  "OUTCOME_SOURCE_DETERMINISTIC_REPLAY.md",
  "OUTCOME_SOURCE_PERSISTENCE_MODEL.md",
  "OUTCOME_SOURCE_TRANSACTION_BOUNDARIES.md",
  "ADAPTATION_DECISION_AND_DIRECTIVE_PERSISTENCE.md",
  "ADAPTATION_APPLICATION_HANDOFF_SEAM.md",
  "ADAPTATION_APPLICATION_OWNER_ROUTING.md",
  "ADAPTATION_APPLICATION_PRECONDITIONS.md",
  "ADAPTATION_APPLICATION_STATE_MODEL.md",
  "ADAPTATION_APPLICATION_AUDIT_ROLLBACK_SEAM.md",
  "OUTCOME_SOURCE_CAGT_GATE_11.md",
  "OUTCOME_SOURCE_GOLDEN_EQUIVALENCE.md",
  "OUTCOME_SOURCE_HOLDOUT_MANIFEST.md",
  "OUTCOME_SOURCE_HOLDOUT_MANIFEST.json",
  "OUTCOME_SOURCE_CAGT_ADMISSION_REPORT.md",
  "OUTCOME_SOURCE_CAGT_ADMISSION_REPORT.json",
  "OUTCOME_SOURCE_STRESS_REPORT.md",
  "OUTCOME_SOURCE_AND_PERSISTENCE_IMPLEMENTATION_READINESS.md",
] as const);

export const OUTCOME_SOURCE_UPDATED_DOCS = Object.freeze([
  "PRODUCTION_LONGITUDINAL_FUTURE_INTEGRATION.md",
  "PRODUCTION_LONGITUDINAL_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_LONGITUDINAL_LIVE_SOURCE_BOUNDARY.md",
  "PRODUCTION_COMPLETED_EXPOSURE_OUTCOME_LEDGER.md",
  "PRODUCTION_LONGITUDINAL_ACTION_DIRECTIVE.md",
  "PRODUCTION_LONGITUDINAL_APPLICATION_VALIDATION.md",
  "CAGT_GATE_ORDER.md", "CAGT_GATED_STRESS_REPORT.md", "ARCHITECTURE.md", "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md", "TESTING.md",
] as const);

const fingerprintTopics = Object.freeze([
  "repositoryOntologyAudit", "ownerBoundaries", "foundationContract", "registryV7", "sourceCategories",
  "rawEnvelope", "normalizedRecord", "sourceIdentity", "revisionLedger", "activeRevisionSelection",
  "idempotency", "deduplication", "correctionSupersessionWithdrawal", "timeSemantics", "sourceAuthority",
  "decisionUseBoundary", "privacyDataMinimization", "freeTextBoundary", "performanceAdapter",
  "responseAdapter", "adherenceAdapter", "recoveryReadinessAdapter", "safetyClinicianAdapter",
  "equipmentEnvironmentAdapter", "externalLoadAdapter", "sourceSnapshot", "snapshotBuilder", "replay",
  "persistenceModel", "transactionBoundaries", "decisionDirectivePersistence", "applicationHandoff",
  "ownerRouting", "applicationPreconditions", "applicationStates", "auditRollbackSeam", "gate11Order",
  "goldenEquivalence", "controlledScenarios", "cohort", "holdoutManifest", "holdoutResults", "mutations",
  "metamorphicResults", "stress", "activationGuards", "readiness",
] as const);

export function buildOutcomeSourceAdmissionReport() {
  const controlled = runOutcomeSourceControlledScenarios();
  const shell = runOutcomeSourceFixedShell();
  const holdout = runOutcomeSourceHoldout();
  const replay = runOutcomeSourceReplayEvidence();
  const golden = runOutcomeSourceGoldenEquivalence();
  const mutations = runOutcomeSourceMutationChecks();
  const metamorphic = runOutcomeSourceMetamorphicChecks();
  const stress = runOutcomeSourceStress();
  const activation = outcomeSourceActivationGuards();
  const handoff = runAdaptationApplicationHandoffCases();
  const evidenceFingerprints = outcomeSourceFoundationFingerprints();
  const fingerprintPayload = Object.freeze({ evidenceFingerprints,
    registryV7: digest(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7), controlled: controlled.fingerprint,
    shell: shell.fingerprint, holdoutManifest: holdout.manifestFingerprint, holdout: holdout.fingerprint,
    replay: replay.fingerprint, golden: golden.fingerprint, mutations: mutations.fingerprint,
    metamorphic: metamorphic.fingerprint, stress: stress.fingerprint, activation: activation.fingerprint });
  const fingerprintSubjects: Readonly<Record<typeof fingerprintTopics[number], unknown>> = Object.freeze({
    repositoryOntologyAudit: Object.freeze({ inventory: CURRENT_PRODUCT_SOURCE_INVENTORY,
      counts: CURRENT_PRODUCT_SOURCE_COUNTS, stack: CURRENT_PERSISTENCE_STACK_FINDING,
      classification: OUTCOME_SOURCE_ONTOLOGY_AUDIT_CLASSIFICATION }),
    ownerBoundaries: OUTCOME_SOURCE_OWNER_BOUNDARIES,
    foundationContract: Object.freeze({ reference: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
      status: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_STATUS }),
    registryV7: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7,
    sourceCategories: OUTCOME_SOURCE_CATEGORIES,
    rawEnvelope: Object.freeze({ reference: RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT_REFERENCE,
      requiredSemantics: ["native_identity", "athlete_principal", "event_ingestion_time", "checksum_idempotency",
        "authorization", "raw_reference_only"] }),
    normalizedRecord: Object.freeze({ reference: NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE,
      facts: OUTCOME_SOURCE_FACT_TYPES }),
    sourceIdentity: Object.freeze(["semantic_lineage", "clock_independent", "random_independent",
      "note_independent", "decision_independent", "active_revision_independent"]),
    revisionLedger: OUTCOME_SOURCE_REVISION_STATES,
    activeRevisionSelection: Object.freeze(["schema", "lineage", "authorization", "correction", "authority",
      "review", "event_applicability", "canonical_tie", OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT]),
    idempotency: Object.freeze(["exact_retry_prior_result", "same_key_payload_conflict", "no_duplicate_revision"]),
    deduplication: Object.freeze(["source_specific", "distinct_event_preserved", "side_support_preserved",
      "planned_actual_preserved", "performance_response_preserved"]),
    correctionSupersessionWithdrawal: Object.freeze(["append_correction", "explicit_supersession",
      "source_withdrawal", "authorization_withdrawal", "invalidation", "product_policy_pending"]),
    timeSemantics: Object.freeze(["event_time", "event_timezone", "ingestion_time", "correction_time",
      "evaluation_time", "late_rebuild_only", "future_invalid"]),
    sourceAuthority: OUTCOME_SOURCE_AUTHORITIES,
    decisionUseBoundary: OUTCOME_SOURCE_AUTHORIZATION_STATES,
    privacyDataMinimization: Object.freeze(["stable_athlete_id", "no_raw_medical_documents", "least_privilege",
      "no_diagnosis", "no_analytics_authority", "product_policy_required"]),
    freeTextBoundary: Object.freeze(["display", "audit", "support", "behavior_inert"]),
    performanceAdapter: Object.freeze({ contract: EXERCISE_PERFORMANCE_SOURCE_ADAPTER_CONTRACT,
      completionStates: PERFORMANCE_COMPLETION_STATES }),
    responseAdapter: Object.freeze({ contract: TRAINING_RESPONSE_SOURCE_ADAPTER_CONTRACT,
      toleranceStates: RESPONSE_TOLERANCE_STATES }),
    adherenceAdapter: Object.freeze({ contract: ADHERENCE_SOURCE_ADAPTER_CONTRACT, states: ADHERENCE_STATES }),
    recoveryReadinessAdapter: Object.freeze({ contract: RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT,
      states: RECOVERY_READINESS_STATES }),
    safetyClinicianAdapter: Object.freeze({ safety: TRAINING_SAFETY_SOURCE_ADAPTER_CONTRACT,
      clinician: CLINICIAN_RESTRICTION_SOURCE_ADAPTER_CONTRACT }),
    equipmentEnvironmentAdapter: EQUIPMENT_ENVIRONMENT_SOURCE_ADAPTER_CONTRACT,
    externalLoadAdapter: Object.freeze({ contract: EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT,
      activityTypes: EXTERNAL_TRAINING_ACTIVITY_TYPES }),
    sourceSnapshot: PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE,
    snapshotBuilder: Object.freeze(["pure", "fail_closed", "canonical_order", "audit", "fingerprint",
      "no_kernel", "no_store", "no_inference"]),
    replay: Object.freeze({ contract: OUTCOME_SOURCE_REPLAY_CONTRACT, evidence: replay.fingerprint }),
    persistenceModel: ADAPTATION_PERSISTENCE_ENTITY_TYPES,
    transactionBoundaries: ADAPTATION_PERSISTENCE_TRANSACTION_BOUNDARIES,
    decisionDirectivePersistence: Object.freeze(["immutable_state_revision", "immutable_decision_revision",
      "immutable_directive_revision", "correction_creates_new_decision"]),
    applicationHandoff: handoff.rows,
    ownerRouting: ADAPTATION_APPLICATION_OWNERS,
    applicationPreconditions: Object.freeze(["directive", "target", "program", "prescription", "phase", "week",
      "source_conflict", "safety", "confirmation", "owner", "idempotency"]),
    applicationStates: ADAPTATION_APPLICATION_STATES,
    auditRollbackSeam: ADAPTATION_APPLICATION_AUDIT_ROLLBACK_SEAM,
    gate11Order: OUTCOME_SOURCE_GATE_11_SUBGATES,
    goldenEquivalence: golden.fingerprint,
    controlledScenarios: controlled.fingerprint,
    cohort: shell.fingerprint,
    holdoutManifest: holdout.manifestFingerprint,
    holdoutResults: holdout.fingerprint,
    mutations: mutations.fingerprint,
    metamorphicResults: metamorphic.fingerprint,
    stress: stress.fingerprint,
    activationGuards: activation.fingerprint,
    readiness: Object.freeze({ classification: OUTCOME_SOURCE_FOUNDATION_CLASSIFICATION,
      nextDependency: OUTCOME_SOURCE_EXACT_NEXT_DEPENDENCY }),
  });
  const foundationFingerprints = Object.freeze(Object.fromEntries(fingerprintTopics.map((topic) =>
    [topic, digest({ topic, subject: fingerprintSubjects[topic], evidence: fingerprintPayload })])));
  return Object.freeze({ classification: OUTCOME_SOURCE_FOUNDATION_CLASSIFICATION,
    ontologyAuditClassification: OUTCOME_SOURCE_ONTOLOGY_AUDIT_CLASSIFICATION,
    designStatus: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_STATUS,
    activationStatus: OUTCOME_SOURCE_RUNTIME_ACTIVATION_STATUS,
    foundationContract: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V7_REFERENCE,
    currentPersistenceStack: CURRENT_PERSISTENCE_STACK_FINDING,
    currentProductSourceInventory: CURRENT_PRODUCT_SOURCE_INVENTORY,
    currentProductSourceCounts: CURRENT_PRODUCT_SOURCE_COUNTS,
    ownerBoundaries: OUTCOME_SOURCE_OWNER_BOUNDARIES,
    controlled: Object.freeze({ scenarioCount: controlled.scenarioCount, failureCount: controlled.failureCount,
      fingerprint: controlled.fingerprint }),
    fixedShell: Object.freeze({ cohortCount: shell.cohortCount, failureCount: shell.failureCount,
      fingerprint: shell.fingerprint }),
    holdout: Object.freeze({ total: holdout.total, completeReplay: holdout.completeReplay,
      performance: holdout.performance, response: holdout.response, adherence: holdout.adherence,
      recovery: holdout.recovery, safetyClinician: holdout.safetyClinician,
      equipmentEnvironment: holdout.equipmentEnvironment, externalLoad: holdout.externalLoad,
      correction: holdout.correction, authorizationPrivacy: holdout.authorizationPrivacy,
      application: holdout.application, exerciseIdentities: holdout.exerciseIdentities,
      doseModes: holdout.doseModes, sections: holdout.sections, actionClasses: holdout.actionClasses,
      manifestFingerprint: holdout.manifestFingerprint, failureCount: holdout.failureCount,
      fingerprint: holdout.fingerprint }),
    replay: Object.freeze({ replayHistoryCount: replay.replayHistoryCount,
      duplicateDecisionCount: replay.duplicateDecisionCount, applicationCount: replay.applicationCount,
      failureCount: replay.failureCount, fingerprint: replay.fingerprint }),
    golden: Object.freeze({ comparisonCount: golden.comparisonCount, controlledCount: golden.controlledCount,
      fixedShellCount: golden.fixedShellCount, holdoutCount: golden.holdoutCount,
      semanticMismatchCount: golden.semanticMismatchCount, result: golden.result,
      fingerprint: golden.fingerprint }),
    mutations: Object.freeze({ mutationCount: mutations.mutationCount,
      acceptedMutationCount: mutations.acceptedMutationCount, fingerprint: mutations.fingerprint }),
    metamorphic: Object.freeze({ invariantCaseCount: metamorphic.invariantCaseCount,
      materialResponseCaseCount: metamorphic.materialResponseCaseCount,
      failureCount: metamorphic.failureCount, fingerprint: metamorphic.fingerprint }),
    applicationHandoff: Object.freeze({ caseCount: handoff.caseCount, appliedStateCount: handoff.appliedStateCount,
      failureCount: handoff.failureCount }),
    stress, activation,
    upstreamFingerprints: Object.freeze({ ...LONGITUDINAL_UPSTREAM_FINGERPRINTS,
      productionLongitudinalKernel: "8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581" }),
    foundationFingerprints: Object.freeze({ ...foundationFingerprints,
      combinedSourcePersistenceFoundation: digest(foundationFingerprints) }),
    nextDependency: OUTCOME_SOURCE_EXACT_NEXT_DEPENDENCY,
  });
}

const list = (values: readonly string[]) => values.map((value) => `- \`${value}\``).join("\n");
const table = (rows: readonly (readonly string[])[]) => ["| " + rows[0].join(" | ") + " |",
  `|${rows[0].map(() => "---").join("|")}|`, ...rows.slice(1).map((row) => `| ${row.join(" | ")} |`)].join("\n");

function common(report: ReturnType<typeof buildOutcomeSourceAdmissionReport>) {
  return `**Classification:** \`${report.classification}\`\n\n` +
    `**Design status:** \`${report.designStatus}\`; runtime \`${report.activationStatus}\`.\n\n` +
    "This is ontology, contract, and CAGT evidence only. It creates no live adapter, migration, persistence write, " +
    "event consumer, queue, directive application, Product behavior, or program mutation.\n";
}

function document(title: string, body: string, report: ReturnType<typeof buildOutcomeSourceAdmissionReport>) {
  return `# ${title}\n\n${common(report)}\n${body.trim()}\n`;
}

function markdownBodies(report: ReturnType<typeof buildOutcomeSourceAdmissionReport>): Record<string, string> {
  const inventoryRows = [["Record", "Classification", "Finding"], ...CURRENT_PRODUCT_SOURCE_INVENTORY.map((row) =>
    [row.record, row.classification, row.finding])];
  const counts = CURRENT_PRODUCT_SOURCE_COUNTS;
  const evidence = `Controlled: \`${report.controlled.scenarioCount}\`; fixed shell: ` +
    `\`${report.fixedShell.cohortCount}\`; holdout: \`${report.holdout.total}\`; replay: ` +
    `\`${report.replay.replayHistoryCount}\`; golden comparisons: \`${report.golden.comparisonCount}\`.`;
  return {
    "OUTCOME_SOURCE_AND_PERSISTENCE_ONTOLOGY_AUDIT.md": `## Current repository finding\n\n${table(inventoryRows)}\n\n` +
      `PostgreSQL is accessed directly through \`pg\`/\`DATABASE_URL\`. Training tables are created at runtime and ` +
      "store mutable JSONB snapshots with `ON CONFLICT DO UPDATE`; browser state uses IndexedDB/localStorage and an " +
      "ordered offline retry queue. The queue is transport resilience, not source idempotency.\n\n" +
      `Current counts: planned/actual mixing \`${counts.plannedActualMixing}\`, multi-block flattening candidates ` +
      `\`${counts.multiBlockFlattening}\`, stable source-event linkage \`${counts.stableSourceEventLinkage}\`, ` +
      `Prescription revision linkage \`${counts.prescriptionRevisionLinkage}\`, Sequence revision linkage ` +
      `\`${counts.sequenceRevisionLinkage}\`, explicit event-time record types \`${counts.explicitEventTime}\`, ` +
      `explicit ingestion-time record types \`${counts.explicitIngestionTime}\`, semantic idempotency ` +
      `\`${counts.semanticIdempotency}\`, immutable revision history \`${counts.immutableRevisionHistory}\`.\n\n` +
      `**Ontology classification:** \`${report.ontologyAuditClassification}\`. ExerciseLog and SessionRecord can become ` +
      "raw adapter inputs, not normalized authority unchanged. Notes remain unknown/inert. The future implementation " +
      "should retain PostgreSQL and add owner-authorized append-only entities rather than selecting a new stack.\n\n" +
      "## Required audit answers\n\n" +
      "1. No current Product record becomes normalized source authority unchanged; ExerciseLog, SessionRecord, and structured feedback are raw candidates only.\n" +
      "2. ExerciseLog, SessionRecord, questionnaire, feedback/preferences, and sync snapshots lack production source-exposure lineage.\n" +
      "3. All current Product outcome candidates lack final Prescription and Sequence revision linkage.\n" +
      "4. ExerciseLog is one aggregate record and cannot preserve several planned/performed blocks independently.\n" +
      "5. ExerciseLog mixes `setsPlanned` with completed/repetition/load/timing fields.\n" +
      "6. Session/exercise feedback notes, coach notes, and questionnaire free text are prose-only for this boundary.\n" +
      "7. Product records can be edited/upserted today, but that is replacement in place rather than an auditable correction.\n" +
      "8. Training state, programs, progress, sessions, and logs are JSONB-upserted by key and rewritten in place.\n" +
      "9. No source record has a semantic idempotency key; request-signature and offline retry dedupe are transport-only.\n" +
      "10. No candidate distinguishes event time from explicit ingestion time; database `updated_at` is storage mutation time.\n" +
      "11. Current feedback preserves some explicit user selections but downstream legacy inference is not source authority here.\n" +
      "12. Product records do not carry a closed user/coach/clinician authority and review model.\n" +
      "13. Stable IDs, authenticated athlete identity, explicit structured selections, and explicit timestamps may be normalized with adapter validation.\n" +
      "14. Missing block actuals, source event/revisions, authority, recovery, diagnosis, and note-derived meanings remain unknown.\n" +
      "15. A future implementation should use the audited PostgreSQL/`pg` stack, explicit migrations, transactions, and append-only tables.\n" +
      "16. Current mutable snapshots alone cannot reproduce deterministic historical source selection after corrections.\n" +
      "17. No: a correction currently overwrites payload truth; the proposed ledger preserves original revisions.\n" +
      "18. No engine contract currently excludes revoked categories from future decisions while preserving policy-governed audit history.\n" +
      "19. No: several current fields are co-located in mutable records; the design keeps every source category independent.\n" +
      "20. Yes: Product notes remain referenced display/audit context and are not parsed.\n" +
      "21. Yes in design evidence: 530 admitted histories rebuild through the snapshot bridge with zero kernel semantic differences.\n" +
      "22. Week reallocation, deload, and production Product/human application have no fully implemented orchestration owner.\n" +
      "23. Week/deload must wait for a production Week Planner/allocation composer and cannot be routed to an invented owner.\n" +
      "24. Future owner-authorized migrations are required for the 20 conceptual append-only entities and their indexes/constraints.\n" +
      "25. Privacy/retention, adapter authentication, external-load receiver policy, Week ownership, and application orchestration each require separate owner decisions.",
    "OUTCOME_SOURCE_AND_PERSISTENCE_OWNER_BOUNDARIES.md": "Product captures/authenticates inputs; adapters validate and normalize; source persistence owns immutable lineage; " +
      "TrainingSafety, the Response Receiver, Longitudinal, Candidate/Composer, Prescription, Week, Phase Continuity, " +
      "application orchestration, and privacy/retention retain separate authority. Week/deload has no production owner " +
      "today, so routing returns `APPLICATION_OWNER_UNAVAILABLE`.",
    "OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT.md": `Contract \`${report.foundationContract.contractId}@` +
      `${report.foundationContract.contractVersion}\` fails unsupported versions with ` +
      "`UNSUPPORTED_OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_VERSION`; there is no fallback or default selection.",
    "OUTCOME_SOURCE_CATEGORY_VOCABULARY.md": `Closed categories:\n\n${list(OUTCOME_SOURCE_CATEGORIES)}\n\nNotes cannot create a category.`,
    "RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT.md": `Contract \`${RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT_REFERENCE.contractId}@` +
      `${RAW_OUTCOME_SOURCE_ENVELOPE_CONTRACT_REFERENCE.contractVersion}\` preserves source-native identity/revision, ` +
      "athlete and authenticated principal, optional device and execution lineage, event/timezone and ingestion time, " +
      "schema, checksum, idempotency, authorization, correction reference, raw payload reference, and provenance. " +
      "The referenced payload is never engine authority.",
    "NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT.md": `Contract \`${NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE.contractId}@` +
      `${NORMALIZED_OUTCOME_SOURCE_RECORD_CONTRACT_REFERENCE.contractVersion}\` contains closed structured facts and ` +
      "explicit unknowns, stable lineage, authority, timing, review/revision/authorization state, and provenance. " +
      "Unrestricted text is absent from behavioral facts.",
    "OUTCOME_SOURCE_IDENTITY_AND_REVISIONS.md": `A sourceRecordId names one semantic source lineage and is independent ` +
      `of clock, randomness, note text, decisions, actions, and active revision. Revisions are immutable and use states:\n\n` +
      `${list(OUTCOME_SOURCE_REVISION_STATES)}\n\nCorrections append content-addressed revisions and preserve based-on lineage.`,
    "OUTCOME_SOURCE_ACTIVE_REVISION_SELECTION.md": "Selection is fail-closed and deterministic: contract/schema, lineage, authorization, correction/supersession, " +
      "categorical authority, review, event applicability, then canonical identity. Equal-authority semantic conflict " +
      "returns `OUTCOME_SOURCE_ACTIVE_REVISION_CONFLICT`; array order is irrelevant.",
    "OUTCOME_SOURCE_IDEMPOTENCY_AND_DEDUPLICATION.md": "Exact retry returns the prior result and creates no revision. The same key with another checksum conflicts. " +
      "Dedup uses source-native and semantic identity; separate events with identical values remain distinct, as do " +
      "left/right, supported/unsupported, planned/actual, Product/clinician, and Performance/Response records.",
    "OUTCOME_SOURCE_CORRECTION_SUPERSESSION_WITHDRAWAL.md": "Correction appends and identifies changed structured paths, owner, reason, time, and provenance. Supersession names " +
      "the replaced record. Source withdrawal, authorization withdrawal, invalidation, deletion/anonymization requests, " +
      "and pending legal/audit policy remain distinct; this design invents no retention rule.",
    "OUTCOME_SOURCE_TIME_SEMANTICS.md": "Event time, timezone, ingestion time, correction time, applies-through time, and evaluation time are separate facts. " +
      "Late evidence permits a deterministic rebuild only; it does not apply a decision. Future evidence is invalid, " +
      "and opportunity order is not a timestamp.",
    "OUTCOME_SOURCE_AUTHORITY.md": `Categorical authorities:\n\n${list(OUTCOME_SOURCE_AUTHORITIES)}\n\n` +
      "No numeric confidence is invented. Weaker evidence cannot silently override stronger conflict; unknown authority " +
      "cannot authorize material change.",
    "OUTCOME_SOURCE_DECISION_USE_AUTHORIZATION.md": `States:\n\n${list(OUTCOME_SOURCE_AUTHORIZATION_STATES)}\n\n` +
      "Authorization is a Product-agnostic engine decision-use boundary, not a legal determination. Revoked/restricted/" +
      "pending/unknown records are excluded from future decision snapshots while audit retention awaits Product policy.",
    "OUTCOME_SOURCE_PRIVACY_AND_DATA_MINIMIZATION.md": "The engine uses stable athlete IDs, not display names. Raw medical documents/images, diagnoses, imaging/pathology " +
      "interpretation, and unrestricted notes stay outside. Structured restrictions require an explicit adapter; raw " +
      "and normalized access are separate and least-privilege. Export, deletion, retention, and legal/privacy review " +
      "remain Product activation blockers. No legal-compliance claim is made.",
    "OUTCOME_SOURCE_FREE_TEXT_BOUNDARY.md": "User/coach/support notes may remain display or audit context. Text cannot create pain classification, owner, axis, " +
      "Safety/clinician/adherence/recovery/equipment/external-load state, or adaptation action. Structured confirmation " +
      "is mandatory.",
    "PERFORMANCE_SOURCE_ADAPTER_CONTRACT.md": "Design-only `ExercisePerformanceSourceAdapterContract` preserves source event, final Prescription/Sequence revisions, " +
      "planned and performed block IDs, partial/omitted/unplanned blocks, substitution, and independent actuals. Planned " +
      "dose/timing never becomes actual; multi-block results stay block-level.",
    "RESPONSE_SOURCE_ADAPTER_CONTRACT.md": "Design-only Response normalization keeps event/block linkage, body region/side, tolerance, symptom change/onset/" +
      "persistence, consequence, realization context, explicit unknowns, authority, time, and provenance. It diagnoses " +
      "nothing; pain region alone creates neither intolerance nor Safety block.",
    "ADHERENCE_SOURCE_ADAPTER_CONTRACT.md": "Design-only adherence preserves completed/partial/not-started/abandoned, exercise/block skip, schedule/time/equipment " +
      "constraint, explicit decline, and unknown. It does not diagnose motivation, and one miss creates no regression " +
      "or deload.",
    "RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT.md": "Design-only recovery/readiness accepts explicit subjective/readiness/sleep and localized/systemic concern with scope " +
      "and applicability. It infers nothing from planned spacing/rest, silence, no pain report, or calendar time and has " +
      "no universal threshold.",
    "SAFETY_AND_CLINICIAN_SOURCE_CONTRACT.md": "TrainingSafety consumes explicit Safety authority. Clinician sources accept structured prohibited/permitted action, " +
      "load/range/support, effective interval, identity, and review state. Diagnosis and document/note inference remain " +
      "outside; athlete conflict cannot silently override clinician restriction.",
    "EQUIPMENT_ENVIRONMENT_SOURCE_CONTRACT.md": "Design-only facts include exact implements/increments, support surface, cable/machine realization, location, unavailable " +
      "equipment, constraint, effective interval, and provenance. They can constrain realization but create no goal, " +
      "progression, or Week objective.",
    "EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT.md": "Occurrence, duration where known, explicit type/regions/intensity descriptor, authority, and unknowns are preserved. " +
      "No score is invented and no Week/Longitudinal change is permitted. State: `EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED`.",
    "PRODUCTION_OUTCOME_SOURCE_SNAPSHOT.md": `Contract \`${PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE.contractId}@` +
      `${PRODUCTION_OUTCOME_SOURCE_SNAPSHOT_CONTRACT_REFERENCE.contractVersion}\` records active revisions, exclusions, ` +
      "conflicts, unresolved categories, authorization states, source lineage, evaluation time, trace, and fingerprint. " +
      "It is the future kernel's sole source object; the kernel never queries persistence.",
    "OUTCOME_SOURCE_SNAPSHOT_BUILDER.md": "The pure builder validates contract, authorization, lineage, active revisions, and event applicability; rejects " +
      "conflicts; preserves unknowns; canonicalizes ordering; and emits audit/fingerprint. It calls no kernel, store, " +
      "inference, or application.",
    "OUTCOME_SOURCE_DETERMINISTIC_REPLAY.md": `${report.replay.replayHistoryCount} immutable histories rebuild active ` +
      `revisions, snapshots, kernel decisions, and directives byte-equivalently. Failure count: ` +
      `\`${report.replay.failureCount}\`; duplicate decisions: \`${report.replay.duplicateDecisionCount}\`; applications: ` +
      `\`${report.replay.applicationCount}\`. Policy/time are explicit and replay never reapplies.`,
    "OUTCOME_SOURCE_PERSISTENCE_MODEL.md": "Current mutable JSONB/IndexedDB snapshots cannot preserve source corrections or decision lineage. The future " +
      `PostgreSQL append-only model proposes ${ADAPTATION_PERSISTENCE_ENTITY_TYPES.length} conceptual entities:\n\n` +
      `${list(ADAPTATION_PERSISTENCE_ENTITY_TYPES)}\n\nNo table, migration, write, ORM, or alternate infrastructure is implemented.`,
    "OUTCOME_SOURCE_TRANSACTION_BOUNDARIES.md": "Future transaction designs group raw+normalized+idempotency+audit ingestion; active set+snapshot+audit; " +
      "ledger+state+decision+directive+audit; and, later, precondition+attempt+rightful-owner mutation+result+audit. " +
      `Design reference: \`${digest(ADAPTATION_PERSISTENCE_TRANSACTION_BOUNDARIES)}\`.`,
    "ADAPTATION_DECISION_AND_DIRECTIVE_PERSISTENCE.md": "State, decision, and directive revisions retain policy, source snapshot, program snapshot, owner, blockers, and " +
      "unapplied state. A source correction creates a new decision revision and never rewrites an old decision.",
    "ADAPTATION_APPLICATION_HANDOFF_SEAM.md": "`AdaptationDirectiveApplicationRequest` carries deterministic request/directive identity, athlete/target/action, " +
      "rightful owner, expected entity revisions, dimensions, confirmation, policies, idempotency, time, and provenance. " +
      `All ${report.applicationHandoff.caseCount} cases remain unapplied.`,
    "ADAPTATION_APPLICATION_OWNER_ROUTING.md": "Prescription owns axes/local review; Candidate/Composer owns replacement/rotation reruns; Week owns reallocation/" +
      "deload but is unavailable; Phase Continuity owns phase review; TrainingSafety owns external Safety; Product/human " +
      "owns confirmation/conflict/unsupported approval. No action is rerouted to a convenient owner.",
    "ADAPTATION_APPLICATION_PRECONDITIONS.md": "Final active directive, active target, matching Program/Prescription/Phase/Week revisions, no newer source conflict, " +
      "no Safety block, confirmation, owner availability, and unused idempotency are required. Stale input blocks; no " +
      "silent rebase exists.",
    "ADAPTATION_APPLICATION_STATE_MODEL.md": `Closed states:\n\n${list(ADAPTATION_APPLICATION_STATES)}\n\n` +
      `Applied-state count in this tranche: \`${report.applicationHandoff.appliedStateCount}\`.`,
    "ADAPTATION_APPLICATION_AUDIT_ROLLBACK_SEAM.md": "The design records attempt identity, directive revision, preconditions, owner, changed references, before/after " +
      "revisions, optional rollback reference, result, and audit. Rollback is not implemented; externally owned or " +
      "irreversible actions require explicit review.",
    "OUTCOME_SOURCE_CAGT_GATE_11.md": `Registry \`${report.authorityRegistry.registryId}@` +
      `${report.authorityRegistry.version}\` gives Gate 11 ` +
      `\`OUTCOME_SOURCE_AND_PERSISTENCE_DESIGN_EVIDENCE\`. Subgates fail-stop in order:\n\n` +
      `${list(OUTCOME_SOURCE_GATE_11_SUBGATES)}\n\nAfter failure, later diagnostics are shadow-only and cannot rescue.`,
    "OUTCOME_SOURCE_GOLDEN_EQUIVALENCE.md": `${report.golden.comparisonCount} admitted Production Longitudinal cases ` +
      `(${report.golden.controlledCount} controlled, ${report.golden.fixedShellCount} shell, ` +
      `${report.golden.holdoutCount} holdout) passed through envelope/revision/snapshot fixture adapters and the existing ` +
      `kernel. Semantic mismatch count: \`${report.golden.semanticMismatchCount}\`; result: \`${report.golden.result}\`.`,
    "OUTCOME_SOURCE_HOLDOUT_MANIFEST.md": `Frozen-before-execution manifest \`` +
      `${report.holdout.manifestFingerprint}\`. Histories: ${report.holdout.total}; replay ${report.holdout.completeReplay}; ` +
      `Performance ${report.holdout.performance}; Response ${report.holdout.response}; adherence ` +
      `${report.holdout.adherence}; recovery ${report.holdout.recovery}; Safety/clinician ` +
      `${report.holdout.safetyClinician}; equipment/environment ${report.holdout.equipmentEnvironment}; external ` +
      `load ${report.holdout.externalLoad}; correction ${report.holdout.correction}; authorization/privacy ` +
      `${report.holdout.authorizationPrivacy}; application ${report.holdout.application}. All 45 exercises, seven dose ` +
      `modes, five sections, 14 actions, and exact/related/identity applicability are represented.`,
    "OUTCOME_SOURCE_CAGT_ADMISSION_REPORT.md": `${evidence}\n\nAll controlled, cohort, holdout, replay, golden, ` +
      `mutation, metamorphic, stress, and activation failure counts are zero. Registry V7 is explicit test/developer ` +
      "evidence; production source and persistence code imports no CAGT.",
    "OUTCOME_SOURCE_STRESS_REPORT.md": `Result: \`${report.stress.result}\`. Counts: ingestion ` +
      `${report.stress.ingestionValidationCount}; idempotency ${report.stress.idempotencyComparisonCount}; dedup ` +
      `${report.stress.dedupComparisonCount}; active revision ${report.stress.activeRevisionSelectionCount}; snapshot ` +
      `${report.stress.snapshotBuildCount}; replay ${report.stress.deterministicReplayCount}; correction/revocation/` +
      `multi-block/golden/handoff/stale/no-rescue each at least 1,000. Hidden clock/random/failures: ` +
      `\`${report.stress.hiddenClockReadCount}/${report.stress.randomOutputCount}/${report.stress.failureCount}\`.`,
    "OUTCOME_SOURCE_AND_PERSISTENCE_IMPLEMENTATION_READINESS.md": `The design foundation is complete and inactive. ` +
      `Remaining work requires Product legal/privacy/retention rulings, adapter ownership and authentication mappings, ` +
      `an append-only PostgreSQL migration/transaction plan, operational replay/backfill/monitoring policy, and an ` +
      `implemented Week owner before application.\n\nExact next dependency: \`${report.nextDependency}\`.\n\nAfter that: ` +
      "`PRODUCTION_WEEK_PLANNER_AND_WEEK_ALLOCATION_COMPOSER_AUTHORIZATION`, then " +
      "`ADAPTATION_APPLICATION_ORCHESTRATION_V1_AUTHORIZATION`.",
  };
}

export function buildOutcomeSourceReports(): Readonly<Record<string, string>> {
  const report = buildOutcomeSourceAdmissionReport();
  const bodies = markdownBodies(report);
  const markdown = Object.fromEntries(OUTCOME_SOURCE_REPORT_FILENAMES.filter((name) => name.endsWith(".md"))
    .map((name) => [name, document(name.replace(/\.md$/, "").replaceAll("_", " "), bodies[name] ?? "", report)]));
  const json = {
    "OUTCOME_SOURCE_HOLDOUT_MANIFEST.json": OUTCOME_SOURCE_FOUNDATION_V1_HOLDOUT_MANIFEST,
    "OUTCOME_SOURCE_CAGT_ADMISSION_REPORT.json": report,
  };
  return Object.freeze({ ...markdown, ...Object.fromEntries(Object.entries(json).map(([name, value]) =>
    [name, `${JSON.stringify(value, null, 2)}\n`])) });
}

export function outcomeSourceDocumentationMarker(report = buildOutcomeSourceAdmissionReport()): string {
  return ["<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:START -->",
    "## Outcome Source and Adaptation Persistence Foundation V1", "",
    `- Status: \`${report.designStatus}\``, `- Classification: \`${report.classification}\``,
    `- Ontology audit: \`${report.ontologyAuditClassification}\``,
    `- Runtime activation: \`${report.activationStatus}\``,
    `- Contract: \`${report.foundationContract.contractId}@${report.foundationContract.contractVersion}\``,
    `- Registry: \`${report.authorityRegistry.registryId}@${report.authorityRegistry.version}\`; Gate 11 is design evidence.`,
    `- Evidence: ${report.controlled.scenarioCount} controlled, ${report.fixedShell.cohortCount} shell, ` +
      `${report.holdout.total} holdout, ${report.replay.replayHistoryCount} replay, and ` +
      `${report.golden.comparisonCount} golden-equivalence histories.`,
    `- Stress: \`${report.stress.result}\`; activation guard failures: \`${report.activation.failureCount}\`.`,
    "- Live adapters, migrations, writes, queues, applications, and Product/program mutations remain zero.",
    `- Exact next dependency: \`${report.nextDependency}\`.`,
    "<!-- OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:END -->"].join("\n");
}
