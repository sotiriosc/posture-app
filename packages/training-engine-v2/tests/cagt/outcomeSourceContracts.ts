import {
  ADHERENCE_SOURCE_ADAPTER_CONTRACT,
  CLINICIAN_RESTRICTION_SOURCE_ADAPTER_CONTRACT,
  EQUIPMENT_ENVIRONMENT_SOURCE_ADAPTER_CONTRACT,
  EXERCISE_PERFORMANCE_SOURCE_ADAPTER_CONTRACT,
  EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT,
  OUTCOME_SOURCE_CATEGORIES,
  OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
  OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_STATUS,
  RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT,
  TRAINING_RESPONSE_SOURCE_ADAPTER_CONTRACT,
  TRAINING_SAFETY_SOURCE_ADAPTER_CONTRACT,
} from "../../src/outcomeSources/designContracts";

export const OUTCOME_SOURCE_FOUNDATION_CLASSIFICATION =
  "OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_V1_READY_FOR_PRODUCTION_IMPLEMENTATION_AUTHORIZATION" as const;
export const OUTCOME_SOURCE_ONTOLOGY_AUDIT_CLASSIFICATION =
  "TARGETED_OUTCOME_SOURCE_AND_PERSISTENCE_DOMAIN_FIXES_REQUIRED" as const;
export const OUTCOME_SOURCE_RUNTIME_ACTIVATION_STATUS = "NOT_ACTIVATED" as const;
export const OUTCOME_SOURCE_EXACT_NEXT_DEPENDENCY =
  "OWNER_AUTHORIZATION_FOR_PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTATION" as const;

export const CURRENT_PRODUCT_SOURCE_INVENTORY = Object.freeze([
  Object.freeze({ record: "ExerciseLog", classification: "RAW_PRODUCT_INPUT_ONLY",
    finding: "Mutable aggregate mixes planned and actual fields and has no block/source/revision lineage." }),
  Object.freeze({ record: "SessionRecord", classification: "RAW_PRODUCT_INPUT_ONLY",
    finding: "Completion and response fields are mutable Product truth, not normalized source authority." }),
  Object.freeze({ record: "SessionFeedback", classification: "RAW_PRODUCT_INPUT_ONLY",
    finding: "Structured selections may be adapted later; note fields remain inert." }),
  Object.freeze({ record: "LogPrefs", classification: "RAW_PRODUCT_INPUT_ONLY",
    finding: "Substitution and feedback preferences require an authenticated adapter." }),
  Object.freeze({ record: "Questionnaire", classification: "RAW_PRODUCT_INPUT_ONLY",
    finding: "Equipment/readiness inputs require effective-time and authorization semantics." }),
  Object.freeze({ record: "TrainingSnapshot cloud patch", classification: "TRANSPORT_ONLY",
    finding: "Offline retry and four-second request dedupe are not semantic source idempotency." }),
  Object.freeze({ record: "analytics/telemetry event", classification: "ANALYTICS_ONLY",
    finding: "Never Performance, health, Safety, or adaptation authority." }),
  Object.freeze({ record: "coach/user/free-text notes", classification: "FREE_TEXT_ONLY",
    finding: "Display/audit context only; behavior requires structured confirmation." }),
]);

export const CURRENT_PRODUCT_SOURCE_COUNTS = Object.freeze({
  plannedActualMixing: 1,
  multiBlockFlattening: 1,
  stableSourceEventLinkage: 0,
  prescriptionRevisionLinkage: 0,
  sequenceRevisionLinkage: 0,
  explicitEventTime: 2,
  explicitIngestionTime: 0,
  semanticIdempotency: 0,
  immutableRevisionHistory: 0,
});

export const CURRENT_PERSISTENCE_STACK_FINDING = Object.freeze({
  database: "PostgreSQL via pg and DATABASE_URL",
  serverModel: "runtime CREATE TABLE IF NOT EXISTS plus JSONB ON CONFLICT DO UPDATE snapshots",
  clientModel: "IndexedDB/localStorage with authenticated cloud snapshot sync",
  retryModel: "browser localStorage queue with ordered backoff; transport-only",
  migrationFramework: "none found for training snapshots",
  futureDirection: "retain PostgreSQL; add owner-authorized append-only schema and explicit transactions later",
});

export const OUTCOME_SOURCE_OWNER_BOUNDARIES = Object.freeze({
  productInput: Object.freeze(["capture", "authentication", "display", "raw retention reference"]),
  sourceAdapter: Object.freeze(["schema validation", "closed normalization", "identity", "provenance"]),
  sourcePersistence: Object.freeze(["immutable revisions", "idempotency", "active pointers", "audit"]),
  trainingSafety: Object.freeze(["explicit safety authority"]),
  responseReceiver: Object.freeze(["response applicability", "tolerance", "symptom course"]),
  longitudinal: Object.freeze(["snapshot consumption", "decision", "unapplied directive"]),
  candidateComposer: Object.freeze(["replacement/rotation candidate rerun after authorization"]),
  prescription: Object.freeze(["authorized local prescription realization"]),
  week: Object.freeze(["future reallocation/deload realization"]),
  phaseContinuity: Object.freeze(["phase review"]),
  applicationOrchestration: Object.freeze(["future preconditioned rightful-owner mutation"]),
  privacyRetention: Object.freeze(["permission", "retention", "deletion/anonymization", "export", "access"]),
});

export const OUTCOME_SOURCE_ADAPTER_CONTRACTS = Object.freeze({
  performance: EXERCISE_PERFORMANCE_SOURCE_ADAPTER_CONTRACT,
  response: TRAINING_RESPONSE_SOURCE_ADAPTER_CONTRACT,
  adherence: ADHERENCE_SOURCE_ADAPTER_CONTRACT,
  recoveryReadiness: RECOVERY_READINESS_SOURCE_ADAPTER_CONTRACT,
  safety: TRAINING_SAFETY_SOURCE_ADAPTER_CONTRACT,
  clinician: CLINICIAN_RESTRICTION_SOURCE_ADAPTER_CONTRACT,
  equipmentEnvironment: EQUIPMENT_ENVIRONMENT_SOURCE_ADAPTER_CONTRACT,
  externalLoad: EXTERNAL_TRAINING_LOAD_SOURCE_CONTRACT,
});

export const OUTCOME_SOURCE_FOUNDATION_CONTRACT = Object.freeze({
  reference: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_CONTRACT_REFERENCE,
  status: OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_STATUS,
  categories: OUTCOME_SOURCE_CATEGORIES,
  runtimeAdapters: 0,
  migrations: 0,
  persistenceWrites: 0,
  applications: 0,
});
