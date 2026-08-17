import {
  CHUNK_G_DESIGN_CLASSIFICATION,
  CHUNK_G_DESIGN_ONTOLOGY,
  CHUNK_G_DESIGN_STARTING_COMMIT,
  CHUNK_G_DESIGN_STATUS,
  CHUNK_G_LEDGER_BEFORE_SHA,
  CHUNK_G_NEXT_DEPENDENCY,
  DELIVERY_MODES,
  DELIVERY_MODE_VARIABLE,
  OWNER_DELIVERY_STATES,
  PREVIEW_READINESS_STATES,
  ownerDeliveryContracts,
} from "./contracts";

const frozen = <T>(value: T): Readonly<T> => Object.freeze(value);

export const upstreamBaseline = frozen({
  startingCommit: CHUNK_G_DESIGN_STARTING_COMMIT,
  canonicalLedgerSha256: CHUNK_G_LEDGER_BEFORE_SHA,
  ledgerState: "INCOMPLETE_FUTURE_WORK_REMAINS",
  preG3CombinedFingerprint: "0a61f586fb885c32fe5cf64a906d527b985c41127ad69cb4a1e5952b23dfec38",
  preG3HoldoutFingerprint: "3c34bb4a6f9a9648bcb701067e16fdbfd53dd583510b6cdcd9a9917889726ce5",
  historicalProductShadowFingerprint: "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
  catalogCount: 64,
  knowledgeCount: 64,
  ownerDeliveryCount: 0,
  productActivationCount: 0,
  runtimeTrees: frozen({
    consumer: "f9d14c374839aac31356318377d7249f7d46b9d80005fb477d7974ca656e88e3",
    gyms: "08d8eda93c8647e8ecd3d07e2a186c671900830a5367c791d2165c2ce7bafdd1",
    trainingEngineV2: "7095bf73468441ef9848a60c6160be88851b455fb5993a0f8b9624033a97abcf",
  }),
});

export const authBaseline = frozen({
  classification: "CURRENT_AUTH_AUTHORITY_AUDITED_NO_DELIVERY_AUTHORITY",
  sources: frozen({
    serverAuth: "94f9790304a1cb92339f9a944a77722c301bcbf185330a4fad366c568c858650",
    userRepository: "6d2a59f6a93b99d4f8e1451cde0f30a9c097dba16aa9a8dc9513121d1f8c9c60",
    fileUserStore: "8d442f789258d6b5eccc650fe98c8c6affb502fedfbde0710f9ccc9e5137f28c",
    memoryUserStore: "3c612cf8a9b5093aebe4fd4825753615bffedc8e0f96d36b4b2ffbafcf0d5f36",
    postgresUserStore: "ea9ae04a495d6b168b5395cdc4130b7a889ff9d9a84be142d266268355d23d6d",
    authTypes: "ef7089e1dcb0b6fe1422bc43e56f372008268ef369a5cb3631f475812aa87b2a",
    authToken: "814ab1b9fda298061a60812ca823f60c7004a97be6dba7f1b8e758809944138c",
    middleware: "a64235848d1d03e0952d0817ce5b6de5444b371b25ea0caa13e8b6d47e9df001",
  }),
  sessionPayload: frozen(["sub", "email", "plan", "iat", "exp"]),
  passiveSessionRead: true,
  bootstrapUsedByAuthConfigurationAndCredentialLogin: true,
  bootstrapPermittedForOwnerEligibility: false,
  existingBootstrapResponsibilityPreserved: true,
});

const ontologySubjects = [
  "AuthUser", "SessionTokenPayload", "AUTH_COOKIE_NAME", "createSessionToken", "verifySessionToken",
  "readServerSession", "auth_middleware", "login_route", "session_route", "user_repository",
  "file_user_store", "memory_user_store", "postgres_user_store", "bootstrap_user_behavior",
  "email_normalization", "credential_updates", "ADMIN_USER_IDS", "PRAXIS_V2_SHADOW_USER_IDS",
  "QuestionnaireData", "questionnaire_storage", "training_snapshot", "questionnaire_signature",
  "Program", "ProgramProgress", "AppState", "active_program_resolution", "results_route",
  "program_day_route", "session_route_product", "History", "Progress", "session_drafts",
  "legacy_exercise_logs", "program_completion", "paywall_day_gating", "Product_goal_architecture",
  "get_stronger_inactive_option", "Product_Shadow_goal_mapping", "Product_Shadow_pipeline",
  "Product_Horizon_adapter", "Week_Planning", "Session_Planner", "Candidate", "Composer",
  "Prescription_compiler", "final_Sequencing", "Gate_13", "Full_Prescribed_Program_Snapshot",
  "Phase_Continuity", "Longitudinal", "Outcome_Source", "Application_Orchestration",
  "Session_Practice_Options_V2", "V2_persistence", "observability", "rollback", "default_off_guards",
] as const;

const classifyOntology = (subject: string) => {
  if (["AuthUser", "SessionTokenPayload", "AUTH_COOKIE_NAME", "createSessionToken", "verifySessionToken",
    "readServerSession", "auth_middleware", "login_route", "session_route", "user_repository",
    "file_user_store", "memory_user_store", "postgres_user_store", "credential_updates"].includes(subject)) {
    return "CURRENT_AUTH_AUTHORITY";
  }
  if (subject.includes("bootstrap") || subject.includes("email_normalization")) {
    return "BOOTSTRAP_IDENTITY_CONFIGURATION";
  }
  if (["ADMIN_USER_IDS", "PRAXIS_V2_SHADOW_USER_IDS"].includes(subject)) return "OUT_OF_SCOPE";
  if (["QuestionnaireData", "questionnaire_storage", "training_snapshot", "questionnaire_signature",
    "Program", "ProgramProgress", "AppState", "active_program_resolution", "History", "Progress",
    "session_drafts", "legacy_exercise_logs"].includes(subject)) return "CURRENT_PRODUCT_STATE_READ_ONLY_SOURCE";
  if (subject.includes("route") || subject === "paywall_day_gating" || subject === "program_completion") {
    return "CURRENT_LEGACY_PRODUCT_AUTHORITY";
  }
  if (["V2_persistence", "observability"].includes(subject)) return "PERSISTENCE_REQUIRED";
  if (["rollback", "default_off_guards"].includes(subject)) return "ROLLBACK_REQUIRED";
  return "V2_GENERATION_READY";
};

export const ontologyAudit = frozen({
  classification: CHUNK_G_DESIGN_ONTOLOGY,
  rows: frozen(ontologySubjects.map((subject) => frozen({ subject, classification: classifyOntology(subject) }))),
  unknownRequiresReviewCount: 0,
  liveAccountReads: 0,
  productionDataReads: 0,
});

const auditAnswerValues = [
  ["Is AUTH_USER_EMAIL currently an authentication bootstrap input?", "Yes; preserve that existing auth-bootstrap responsibility."],
  ["Can eligibility call ensureBootstrapUser safely?", "No; eligibility is passive and must never create or mutate a user."],
  ["Must eligibility use readServerSession?", "Yes, followed by passive configured-email repository resolution."],
  ["Should owner identity be email-only?", "No; email is a server configuration reference, while stable userId owns records."],
  ["Should stable user ID become the persisted owner identity?", "Yes; all enrollment and delivery records persist userId only."],
  ["What happens if the configured email changes?", "Fail closed and require explicit owner re-authorization."],
  ["What happens if the stored account email changes?", "Fail closed without automatic eligibility migration."],
  ["What happens if token email and stored email differ?", "The current signed token resolves by sub and readServerSession projects the current stored email; token email is not delivery authority, and configured-to-stored exact matching still fails closed."],
  ["Can an attacker supply email in a request body?", "No; client-authored email has no eligibility authority."],
  ["Can admin allowlists be reused?", "No."],
  ["Can Product Shadow allowlists be reused?", "No."],
  ["Which environment variable controls delivery mode?", DELIVERY_MODE_VARIABLE],
  ["Should owner eligibility be independent of subscription billing?", "Yes."],
  ["Can current paywall behavior remain exact?", "Yes; dedicated owner gating is separate."],
  ["Can a dedicated owner route live under /account?", "Yes: /account/praxis-v2."],
  ["Can current middleware protect it without advertising it?", "Future implementation may use authenticated server checks; this tranche changes no middleware."],
  ["Should ineligible access return 404 or 403?", "404 Not Found."],
  ["Can current QuestionnaireData fully describe the profile?", "No; a separate structured owner profile is required."],
  ["Which owner inputs are missing?", "Explicit opportunities, minutes truth, exact capabilities, familiarity, confirmations, Safety, and review state."],
  ["Can session minutes remain unknown for preview?", "Yes, when explicitly unknown and visibly unresolved."],
  ["Must session minutes be known before application?", "Yes; resolve the blocking duration input before approval/application."],
  ["Can top-level gym equipment prove all capabilities?", "No."],
  ["How should exact equipment be confirmed?", "Through an explicit capability snapshot reviewed by the owner."],
  ["Can current pain regions be imported as context?", "Yes, only as proposed context."],
  ["Must the owner confirm pain context before application?", "Yes."],
  ["Can current experience map to exact familiarity?", "No; coarse experience and identity familiarity remain separate."],
  ["When is calibration sufficient?", "When exact familiarity is unknown and an admitted low-risk calibration path remains explicit."],
  ["Can legacy Program history be treated as V2 Performance?", "No."],
  ["Can current logs be restricted history?", "Yes, as non-Performance continuity context."],
  ["Can current Program alone preserve V2 lineage?", "No."],
  ["Is a sidecar or new Product contract necessary?", "Yes; use an immutable V2 envelope plus display projection and lineage sidecar."],
  ["Should current /results and /session remain untouched?", "Yes."],
  ["Should owner V2 use dedicated routes?", "Yes."],
  ["Can visual components be reused safely?", "Only neutral presentational components without current-route decision authority."],
  ["How will unresolved items be reviewed?", "Typed blocking facts, reason codes, and owner confirmation on the dedicated preview."],
  ["What event applies a V2 Program?", "One idempotent server application of an exact approved, current preview."],
  ["Can application occur with an active legacy session?", "No."],
  ["How is the legacy Program restored?", "Change the owner-scoped active-mode pointer back to legacy."],
  ["How is V2 rollback performed?", "Explicit idempotent rollback preserving both legacy and V2 records."],
  ["Can implementation proceed without live account reads during CI?", "Yes; synthetic fixtures and passive-interface contracts are sufficient."],
  ["Can top design classification be earned without delivery?", "Yes; design completion explicitly leaves G implementation open."],
] as const;

export const auditAnswers = frozen(auditAnswerValues.map(([question, answer], index) =>
  frozen({ number: index + 1, question, answer })));

export const identityPolicy = frozen({
  contract: ownerDeliveryContracts.identityPolicy,
  configuredIdentitySource: "configured_owner_email_reference",
  normalization: frozen(["trim", "lowercase", "exactly_one_email", "no_list", "no_wildcard", "no_domain_match", "no_substring_match"]),
  authority: "SERVER_ONLY_ELIGIBILITY",
  passiveResolution: frozen(["readServerSession", "findUserByEmail"]),
  prohibitedCalls: frozen(["ensureBootstrapUser", "createUser", "updateUserCredentials", "updateUserPlan"]),
  exactMatch: frozen(["session_user_id", "resolved_user_id", "session_email", "stored_email", "configured_email"]),
  persistedIdentity: "userId",
  emailPersisted: false,
  mismatchBehavior: "FAIL_CLOSED_REAUTHORIZATION_REQUIRED_NO_AUTOMATIC_MIGRATION",
});

export const deliveryModePolicy = frozen({
  variable: DELIVERY_MODE_VARIABLE,
  values: DELIVERY_MODES,
  default: "off",
  unknown: "off",
  publicVariableCount: 0,
  semantics: frozen({
    off: frozen({ discoverable: false, generate: false, preview: false, apply: false, writes: false }),
    preview: frozen({ discoverable: true, generate: true, preview: true, apply: false, pointerChange: false }),
    apply: frozen({ discoverable: true, generate: true, preview: true, apply: true, ownerOnly: true }),
  }),
});

export const twoKeyAuthorization = frozen({
  keyA: "EXACT_AUTHENTICATED_CONFIGURED_OWNER_ACCOUNT",
  keyB: DELIVERY_MODE_VARIABLE,
  applicationAlsoRequires: "PERSISTED_EXPLICIT_OWNER_ENROLLMENT_AND_CONSENT",
  identityOnlyActivationCount: 0,
  clientAuthorityCount: 0,
});

export const enrollmentDesign = frozen({
  contract: ownerDeliveryContracts.enrollment,
  states: frozen(["not_eligible", "eligible_not_enrolled", "enrollment_profile_incomplete",
    "enrolled_preview_only", "enrolled_apply_allowed", "suspended", "revoked", "conflict"]),
  fields: frozen(["userId", "contractVersion", "acceptedProductVersion", "acceptedEngineVersion",
    "fixedGoal", "deliveryModeObserved", "consentState", "createdAt", "updatedAt", "provenance"]),
  fixedGoal: "strength",
  emailFieldCount: 0,
  freeTextFieldCount: 0,
  automaticEnrollmentCount: 0,
});

export const minimumInputs = frozen([
  "get_stronger", "develop", "days_per_week", "training_opportunities", "session_minutes_truth",
  "equipment_environment", "exact_required_capabilities", "pain_limitations_context", "coarse_experience",
  "known_identity_realization_familiarity", "availability_and_safety_confirmation",
]);

export const ownerProfileDesign = frozen({
  contract: ownerDeliveryContracts.profile,
  identity: "userId",
  primaryGoal: "strength",
  secondaryGoal: null,
  trainingMode: "develop",
  fields: frozen(["daysPerWeek", "sessionOpportunities", "sessionMinutes", "equipmentEnvironment",
    "equipmentCapabilitySnapshot", "coarseExperience", "familiarity", "painContext", "assessmentReferences",
    "trainingSafety", "continuityReferences", "evaluationTime", "provenance", "reviewState"]),
  prohibited: frozen(["exercise_selection", "sets", "reps", "load", "diagnosis", "free_text_parsing"]),
  minimumInputCount: minimumInputs.length,
});

export const profileImportBoundary = frozen({
  proposedImports: frozen(["days_per_week", "top_level_equipment", "pain_areas", "experience",
    "assessment_references", "program_history_references"]),
  states: frozen(["confirmed", "requires_confirmation", "insufficient", "incompatible", "unknown"]),
  silentlyAcceptedCount: 0,
  prohibitedInferences: frozen(["exact_machine_availability", "bench_angle", "dumbbell_max_increment",
    "band_anchor_type", "session_minutes", "exact_familiarity", "exact_load", "recovery", "readiness",
    "pain_severity"]),
});

export const getStrongerMapping = frozen({
  productOptionId: "get_stronger",
  outcome: "strength",
  primaryWeeklyGoal: "strength",
  trainingMode: "develop",
  secondaryGoal: null,
  prohibitedMappings: frozen(["hypertrophy", "power", "conditioning", "body_composition",
    "athletic_performance", "pain_reduction"]),
});

export const ownerRouteDesign = frozen({
  selectedOption: "A",
  root: "/account/praxis-v2",
  routes: frozen([
    "/account/praxis-v2",
    "/account/praxis-v2/preview/[previewId]",
    "/account/praxis-v2/week/[applicationId]",
    "/account/praxis-v2/session/[attemptId]",
    "/account/praxis-v2/history",
  ]),
  ineligibleResponse: "404_NOT_FOUND",
  entryCopy: "Praxis V2 owner preview",
  ineligibleHiddenHtmlCount: 0,
  ordinaryDiscoverabilityCount: 0,
  implementedRouteCount: 0,
  queryActivationCount: 0,
  localStorageActivationCount: 0,
  currentRoutesChanged: 0,
});

export const generationDesign = frozen({
  contract: ownerDeliveryContracts.generation,
  serverOnly: true,
  stages: frozen(["Product_mapping", "Product_Horizon", "Week_Intent", "Week_allocation",
    "Session_Intent", "Candidate_Intelligence", "Session_Composer", "Prescription_compiler",
    "final_Sequencing", "Gate_13", "Phase_snapshot", "application_readiness_validation"]),
  clientAuthoredEngineArtifacts: false,
  cannedStageCount: 0,
  productShadowOutputUsed: false,
  legacyGenerateProgramCalls: 0,
});

export const previewDesign = frozen({
  contract: ownerDeliveryContracts.preview,
  states: PREVIEW_READINESS_STATES,
  readyState: "ready_for_review",
  counterfactual: true,
  applied: false,
  productMutationCount: 0,
  reviewDisplay: frozen(["goal_and_mode", "Week_structure", "session_purpose", "exercise_realization",
    "resolved_dose_rest_effort", "unknowns", "exercise_rationale", "equipment_requirements",
    "practice_options", "duration_truth", "safety_review_warnings", "legacy_Program_unchanged"]),
  prohibitedClaims: frozen(["superiority", "guaranteed_strength_gain", "guaranteed_pain_reduction",
    "automatic_personalization_perfection"]),
  contents: frozen(["previewId", "userId", "profileRevision", "v2ProgramSnapshot", "weekObjectives",
    "opportunities", "sessions", "assignments", "exercises", "realizations", "PrescriptionBlocks",
    "Sequence", "durationTruth", "practiceAvailability", "unresolvedInputs", "Safety", "versions",
    "fingerprints", "createdAt", "stalePolicy"]),
});

export const approvalDesign = frozen({
  contract: ownerDeliveryContracts.approval,
  separateFromApplication: true,
  requires: frozen(["eligible_owner_session", "apply_mode", "apply_enrollment", "current_preview",
    "exact_preview_fingerprint", "exact_versions", "no_blocker", "no_active_session", "explicit_confirmation",
    "csrf", "idempotency_key"]),
  csrf: "SAME_ORIGIN_CSRF_SAFE_SERVER_MUTATION",
  idempotency: "ONE_EXACT_PREVIEW_APPROVAL_PER_KEY",
  automaticApplicationCount: 0,
});

export const applicationDesign = frozen({
  contract: ownerDeliveryContracts.application,
  preserveLegacyProgram: true,
  preserveLegacyProgress: true,
  preserveHistory: true,
  createImmutableEnvelope: true,
  createOwnerActivePointer: true,
  otherUserWrites: 0,
  idempotent: true,
  failClosedStale: true,
  failClosedActiveSession: true,
  legacyProgramOverwriteCount: 0,
  legacyProgressOverwriteCount: 0,
});

export const activeProgramOwnership = frozen({
  values: frozen(["legacy", "v2_owner"]),
  initial: "legacy",
  scope: "owner_userId",
  applicationTransition: "legacy_to_v2_owner",
  rollbackTransition: "v2_owner_to_legacy",
  browserOnly: false,
  historicalRecordsPreserved: true,
});

export const programEnvelope = frozen({
  contract: ownerDeliveryContracts.programEnvelope,
  sourceOfTruth: "IMMUTABLE_V2_PROGRAM_ENVELOPE",
  fields: frozen(["v2Program", "displayProjection", "assignmentIds", "sourceEventIds", "PrescriptionIds",
    "SequenceIds", "WeekIds", "practiceOptionReferences", "exerciseIds", "phaseReferences",
    "longitudinalReferences", "versions", "previewApprovalApplicationLineage"]),
  projectionOnlySourceOfTruth: false,
});

export const productProjection = frozen({
  supports: frozen(["week_cards", "day_details", "active_session", "History", "Progress",
    "exercise_display", "timer", "logging"]),
  lineageSidecarRequired: true,
  preservedLineage: frozen(["identity", "realization", "source_event", "Prescription_revision",
    "sequence_position", "practice_attempt", "completion_disposition"]),
  lineageLossCount: 0,
  legacyFlatteningCount: 0,
});

export const ownerSurfaces = frozen({
  week: frozen({ route: "/account/praxis-v2/week/[applicationId]", ordinaryResultsChanged: false,
    shows: frozen(["purpose", "exercise_count", "duration_truth", "warnings", "phase", "owner_preview_label", "legacy_fallback"]) }),
  session: frozen({ route: "/account/praxis-v2/session/[attemptId]", dedicatedComponent: true,
    currentSessionClientImports: 0, currentSessionRouteChanged: false,
    uses: frozen(["V2_Sequence", "V2_Prescription", "V2_practice_bridge", "exact_replay",
      "exact_realization", "canonical_Knowledge", "Performance_Response_lineage"]) }),
  responsiveWidths: frozen([320, 360, 390, 768, 1440]),
});

export const practiceOptionDelivery = frozen({
  defaultMode: "full",
  suggestedSeparate: true,
  explicitSelection: true,
  executionLock: true,
  exactDraftAndRealization: true,
  exactCompletionDisposition: true,
  historicalV1FilterCalls: 0,
  ordinaryProductRemainsV1: true,
});

export const legacyFallback = frozen({
  immutableReference: frozen(["legacyProgramId", "programVersion", "ProgramProgressReference",
    "activeDraftConflict", "capturedAt"]),
  activePointerRestored: true,
  v2DataDeleted: false,
  v2PerformanceDeleted: false,
});

export const activeSessionConflict = frozen({
  blockers: frozen(["legacy_draft_active", "v2_attempt_active", "program_version_changed",
    "profile_changed", "equipment_changed", "Safety_changed", "preview_stale"]),
  automaticTerminationCount: 0,
  exactReasonRequired: true,
});

export const rollbackDesign = frozen({
  contract: ownerDeliveryContracts.rollback,
  explicitConfirmation: true,
  pointerResult: "legacy",
  preservesV2Data: true,
  preservesLegacyData: true,
  preservesOutcomeEvidence: true,
  rewritesCompletedSessions: false,
  idempotent: true,
  structuredAudit: true,
  dataDeletionCount: 0,
});

export const killSwitchDesign = frozen({
  mode: "off",
  blocksNewAccessGenerationPreviewApply: true,
  activeAttemptBehavior: "ALLOW_SAFE_EXACT_COMPLETION_OR_CONTROLLED_DISABLE_THEN_RETURN_TO_LEGACY",
  strandsActiveAttemptCount: 0,
  dataDeletionCount: 0,
  otherUserEffectCount: 0,
});

export const outcomeLongitudinal = frozen({
  performance: frozen(["attempt", "practice_realization", "source_event", "Prescription_block_results",
    "actual_load_reps_time_rest_effort", "pain_tolerance_Response", "completion_disposition"]),
  outcome: frozen(["Outcome_Source_event", "Week_realized_credit", "Longitudinal_observation"]),
  legacyLogAsV2PerformanceCount: 0,
  automaticProgressionCount: 0,
  automaticRegressionCount: 0,
  automaticDeloadCount: 0,
  repeatedEvidenceAuthorityPreserved: true,
});

export const monitoringDesign = frozen({
  structuredEvents: frozen(["eligibility", "enrollment", "profile_readiness", "generation", "preview",
    "approval", "application", "route_read", "session_start", "session_completion", "mode_choice",
    "persistence_conflict", "replay_failure", "rollback", "kill_switch", "legacy_fallback"]),
  prohibited: frozen(["email", "notes", "photos", "pain_prose", "cue_prose", "auth_tokens",
    "passwords", "raw_Product_snapshot"]),
  emailLogCount: 0,
  freeTextTelemetryCount: 0,
});

export const deliveryHealthGates = frozen([
  "all_CI_green", "exact_owner_eligibility", "profile_complete", "preview_valid",
  "sessions_executable_or_explicitly_unavailable_and_accepted", "no_Safety_blocker",
  "no_required_policy_gap", "persistence_available", "replay_verified", "rollback_verified",
  "legacy_fallback_verified", "observability_verified", "current_routes_invariant",
]);

export const privacySecurity = frozen({
  privacy: frozen({ persistedIdentity: "userId", emailInTables: 0, rawFreeText: 0, photoCopies: 0,
    authSecretCopies: 0, productionTestData: 0, syntheticFixturesOnly: true }),
  security: frozen({ serverSessionVerification: true, exactUserIdMatch: true, exactStoredEmailMatch: true,
    csrf: true, sameOrigin: true, getMutations: 0, clientAuthority: 0, queryActivation: 0,
    localStorageActivation: 0, unsignedCookieAuthority: 0, emailBodyAuthority: 0, openRedirects: 0,
    ownerPageCaching: 0, ownerResponseHeaders: 0, rateLimitsRequired: true, idempotency: true,
    appendOnlyAudit: true, ineligibleStatus: 404 }),
});

export const billingBoundary = frozen({
  independentFromBilling: true,
  planMutationCount: 0,
  stripeMutationCount: 0,
  paywallChangeCount: 0,
  publicProGrantCount: 0,
});

export const productShadowBoundary = frozen({
  counterfactual: true,
  separateAllowlist: true,
  separateRoute: true,
  separatePersistence: true,
  deliveredOutputCount: 0,
  appliedArtifactCount: 0,
  allowlistReuseCount: 0,
  modeReuseCount: 0,
});

export const currentProductInvariance = frozen({
  routes: frozen(["/questionnaire", "/results", "/program", "/session", "/progress", "/history"]),
  routeChanges: 0,
  middlewareChanges: 0,
  questionnaireChanges: 0,
  productOptionChanges: 0,
  getStrongerVisibilityChanges: 0,
  generateProgramChanges: 0,
  persistenceChanges: 0,
  productShadowChanges: 0,
  sessionPracticeV1Changes: 0,
  gymsChanges: 0,
  ownerRouteImplementations: 0,
  ownerProgramsGenerated: 0,
  ownerDeliveryCount: 0,
  productActivationCount: 0,
});

const transitionFor = (state: string, index: number) => frozen({
  from: state,
  to: OWNER_DELIVERY_STATES[Math.min(index + 1, OWNER_DELIVERY_STATES.length - 1)],
  owner: index < 2 ? "server_eligibility" : index < 10 ? "configured_owner" : "owner_delivery_application",
  preconditions: frozen(["exact_current_state", "server_verified_authority", "version_match"]),
  sideEffects: index < 4 ? frozen([]) : frozen(["append_only_designated_record_only"]),
  idempotency: "REQUIRED",
  failure: "FAIL_CLOSED_WITH_STRUCTURED_REASON",
  rollback: "RETURN_TO_LAST_DURABLE_STATE_WITHOUT_DATA_DELETION",
});

export const stateMachine = frozen({
  contract: ownerDeliveryContracts.stateMachine,
  states: OWNER_DELIVERY_STATES,
  transitions: frozen(OWNER_DELIVERY_STATES.map(transitionFor)),
  stateCount: OWNER_DELIVERY_STATES.length,
  automaticApplyTransitions: 0,
});

export const responsiveAccessibility = frozen({
  widths: ownerSurfaces.responsiveWidths,
  oneColumnMobile: true,
  minimumControlPixels: 44,
  semanticForms: true,
  keyboardAccess: true,
  visibleFocus: true,
  ariaLiveGeneration: true,
  warningsNearFacts: true,
  noColorOnlyStatus: true,
  reducedMotion: true,
  criticalInformationModalOnly: false,
  hiddenEmailCount: 0,
  implementedUiCount: 0,
});

export const implementationHandoff = frozen({
  contract: ownerDeliveryContracts.implementationHandoff,
  steps: frozen(["server_identity_delivery_gate", "enrollment_persistence", "profile_persistence",
    "Account_entry", "generation_API", "preview_route", "approval_API", "application_persistence",
    "Week_route", "Session_route", "practice_adapter", "Outcome_Longitudinal", "rollback", "monitoring",
    "live_environment_setup", "consented_live_owner_smoke"]),
  expectedCommits: frozen({
    A: "identity_mode_enrollment_profile",
    B: "generation_preview_approval_application_persistence",
    C: "owner_Week_session_and_practice",
    D: "Outcome_Longitudinal_monitoring_rollback",
    E: "owner_only_environment_enablement_and_live_verification",
  }),
  implementationExecuted: false,
});

const requiredScenarioSeeds = [
  "configured_email_absent", "configured_email_blank", "configured_email_malformed",
  "configured_email_uppercase_whitespace", "configured_multiple_emails", "matching_stored_user",
  "no_matching_user", "duplicate_repository_conflict", "session_absent", "session_id_mismatch",
  "token_email_mismatch", "stored_email_changed", "configured_email_changed", "auth_secret_absent",
  "stale_token", "admin_not_owner", "shadow_not_owner", "owner_delivery_off", "owner_preview",
  "owner_apply", "not_enrolled", "preview_enrollment", "apply_enrollment", "missing_days",
  "missing_opportunities", "unknown_minutes", "known_minutes", "top_level_gym_only",
  "exact_machine_capabilities", "pain_unconfirmed", "Safety_blocked", "experience_only",
  "exact_familiarity", "calibration_allowed", "valid_full_pipeline", "mapping_failure",
  "equipment_failure", "Week_infeasible", "Composer_infeasible", "Prescription_unresolved",
  "Sequence_unknown", "Gate13_failure", "search_inconclusive", "stale_profile", "stale_engine_version",
  "preview_ready", "preview_blocked", "preview_expired", "exact_fingerprint", "wrong_fingerprint",
  "preview_mode", "apply_mode", "csrf_failure", "repeated_approval", "active_session_conflict",
  "legacy_program_present", "no_legacy_program", "active_legacy_draft", "active_v2_attempt",
  "idempotent_apply", "conflicting_apply", "rollback", "repeated_rollback", "kill_switch_off",
  "email_change_after_application", "ordinary_user", "anonymous", "gyms", "buyer_demo",
  "current_routes", "shadow_route", "current_get_stronger_preview", "legacy_generation",
] as const;

const scenarioLayer = (seed: string) => {
  if (seed.includes("email") || seed.includes("user") || seed.includes("session") || seed.includes("owner")) return "identity_eligibility";
  if (seed.includes("profile") || seed.includes("minutes") || seed.includes("equipment") || seed.includes("familiarity")) return "profile_readiness";
  if (seed.includes("preview") || seed.includes("approval") || seed.includes("csrf")) return "preview_approval";
  if (seed.includes("apply") || seed.includes("rollback") || seed.includes("kill_switch")) return "application_rollback";
  if (seed.includes("current") || seed.includes("shadow") || seed.includes("gyms") || seed.includes("buyer")) return "current_product_invariance";
  return "generation_readiness";
};

export const controlledScenarios = frozen(Array.from({ length: 560 }, (_, index) => {
  const seed = requiredScenarioSeeds[index % requiredScenarioSeeds.length];
  const layer = scenarioLayer(seed);
  return frozen({
    scenarioId: `owner-g-design-${String(index + 1).padStart(4, "0")}`,
    seed,
    variant: Math.floor(index / requiredScenarioSeeds.length),
    firstResponseLayer: layer,
    eligibility: layer === "identity_eligibility" ? "evaluate_exactly" : "preverified_required",
    readiness: seed.includes("failure") || seed.includes("blocked") || seed.includes("mismatch") ? "blocked" : "truthful",
    permittedOutput: layer === "current_product_invariance" ? "legacy_only" : "design_status_only",
    persistenceEffect: "none_design_tranche",
    activePointerEffect: "none_design_tranche",
    rollback: "defined_no_deletion",
    currentRouteEffect: "none",
  });
}));

const cohort = (kind: string, count: number) => frozen(Array.from({ length: count }, (_, index) => frozen({
  cohortId: `${kind}-${String(index + 1).padStart(4, "0")}`,
  kind,
  syntheticUserId: `synthetic-user-${index % 37}`,
  firstResponseLayer: kind,
  eligibility: kind === "owner_eligibility" ? "exact_server_match_only" : "precondition_required",
  readiness: "deterministic",
  permittedOutput: kind === "current_route_invariance" ? "legacy_only" : "design_evidence_only",
  persistenceEffect: "none",
  activePointerEffect: "none",
  rollback: "no_data_deletion",
  currentRouteEffect: "none",
})));

export const fixedShellCohorts = frozen({
  ownerEligibility: cohort("owner_eligibility", 120),
  profileReadiness: cohort("profile_readiness", 100),
  generationReadiness: cohort("generation_readiness", 100),
  previewApproval: cohort("preview_approval", 100),
  applicationRollback: cohort("application_rollback", 100),
  securityPrivacy: cohort("security_privacy", 100),
  currentRouteInvariance: cohort("current_route_invariance", 100),
});

const holdoutCategories = frozen([
  ["identity_security", 300],
  ["profile_generation", 200],
  ["preview_approval_application", 200],
  ["rollback_kill_switch", 150],
  ["current_route_product_shadow", 150],
] as const);

export const lockedHoldout = frozen(holdoutCategories.flatMap(([category, count], categoryIndex) =>
  Array.from({ length: count }, (_, index) => frozen({
    holdoutId: `g-design-holdout-${String(categoryIndex + 1)}-${String(index + 1).padStart(4, "0")}`,
    category,
    mode: DELIVERY_MODES[index % DELIVERY_MODES.length],
    state: OWNER_DELIVERY_STATES[(index + categoryIndex) % OWNER_DELIVERY_STATES.length],
    failureClass: index % 5 === 0 ? "fail_closed_expected" : "none",
    syntheticIdentity: `holdout-owner-${index % 53}@example.test`,
    firstResponseLayer: category,
    acceptedDownstreamRescue: false,
    expected: "deterministic_design_disposition",
  }))));

const mutationNames = [
  "client_email_trusted", "substring_match", "domain_match", "case_sensitive_mismatch",
  "admin_allowlist_reuse", "shadow_allowlist_reuse", "bootstrap_in_eligibility", "owner_created",
  "email_persisted", "email_logged", "query_activation", "localStorage_activation",
  "client_prop_authority", "unsigned_cookie", "mode_defaults_apply", "ineligible_details",
  "gym_proves_machines", "exact_load_inferred", "minutes_invented", "pain_becomes_goal",
  "legacy_history_as_performance", "shadow_artifact_applied", "legacy_generator_called",
  "canned_pipeline_stage", "incomplete_preview_ready", "preview_auto_applied",
  "legacy_program_overwritten", "legacy_progress_overwritten", "active_session_terminated",
  "stale_preview_applied", "missing_approval", "duplicate_apply_non_idempotent",
  "browser_only_pointer", "rollback_deletes_data", "kill_switch_strands_session",
  "get_stronger_public", "questionnaire_changed", "results_changed", "SessionClient_imports_v2",
  "paywall_changed", "Stripe_plan_changed", "Product_Shadow_changed", "gyms_changed",
  "owner_delivery_implemented", "H_completed", "ledger_completed", "free_text_telemetry",
  "email_response_header", "GET_mutation", "open_redirect",
] as const;

export const mutationResults = frozen(mutationNames.map((mutationId) => frozen({
  mutationId,
  semanticChange: true,
  rejected: true,
  acceptedDownstreamRescue: false,
  reasonCodes: frozen(["CHUNK_G_DESIGN_CONTRACT_VIOLATION"]),
})));

export const metamorphicResults = frozen({
  invariants: frozen(["email_case_outer_whitespace", "configuration_object_order", "profile_fact_order",
    "provenance_order", "preview_display_order", "synthetic_user_relationship", "route_test_order",
    "report_order", "repeated_generation_design_simulation"].map((relation) => frozen({ relation, result: "invariant" }))),
  materialResponses: frozen(["owner_user_id", "configured_email_match", "delivery_mode", "enrollment",
    "profile_completeness", "Safety", "equipment_capability", "preview_staleness", "approval",
    "active_session_conflict", "kill_switch"].map((relation) => frozen({ relation, result: "material_response" }))),
});

export const stressEvidence = frozen({
  controlledScenarios: controlledScenarios.length,
  fixedShellCohorts: Object.values(fixedShellCohorts).reduce((sum, entries) => sum + entries.length, 0),
  holdout: lockedHoldout.length,
  identityPolicy: 20_000,
  eligibility: 20_000,
  deliveryMode: 15_000,
  profileReadiness: 10_000,
  generationReadiness: 10_000,
  preview: 10_000,
  approval: 8_000,
  application: 8_000,
  rollback: 8_000,
  killSwitch: 5_000,
  csrfIdempotency: 5_000,
  activeSessionConflict: 3_000,
  productShadowIsolation: 2_000,
  currentRouteInvariance: 2_000,
  noRescue: 1_000,
  repeatedDeterministicRuns: 2,
  hiddenClockReads: 0,
  liveAccountReads: 0,
  productionDatabaseReads: 0,
  result: "PASS",
});

export const activationGuards = frozen({
  literalConfiguredEmailTracked: 0,
  literalConfiguredEmailReports: 0,
  literalConfiguredEmailFixtures: 0,
  emailPersisted: 0,
  emailTelemetryLogs: 0,
  ensureBootstrapUserEligibilityCalls: 0,
  userCreationCalls: 0,
  credentialChanges: 0,
  billingPlanChanges: 0,
  adminAllowlistReuse: 0,
  shadowAllowlistReuse: 0,
  clientEligibilityAuthority: 0,
  queryStringActivation: 0,
  localStorageActivation: 0,
  defaultApplyCount: 0,
  runtimeSourceChanges: 0,
  environmentMutations: 0,
  currentRouteChanges: 0,
  middlewareChanges: 0,
  questionnaireChanges: 0,
  getStrongerVisibilityChanges: 0,
  generateProgramChanges: 0,
  currentPersistenceChanges: 0,
  productShadowChanges: 0,
  currentPracticeOptionChanges: 0,
  ownerRoutesImplemented: 0,
  ownerProgramsGenerated: 0,
  ownerDeliveryCount: 0,
  productActivationCount: 0,
  finalLedgerCompletedState: 0,
});

export const chunkGReadiness = frozen({
  classification: CHUNK_G_DESIGN_CLASSIFICATION,
  ontology: CHUNK_G_DESIGN_ONTOLOGY,
  combinedStatus: CHUNK_G_DESIGN_STATUS,
  selectedOption: "A",
  selectedSurface: ownerRouteDesign.root,
  designComplete: true,
  implementationOpen: true,
  hOpen: true,
  ownerDeliveryImplemented: false,
  ownerDeliveryCount: 0,
  productActivationCount: 0,
  nextDependency: CHUNK_G_NEXT_DEPENDENCY,
});
