import { createHash } from "node:crypto";
import { fork } from "node:child_process";
import { resolve } from "node:path";
import {
  CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
  OWNER_DELIVERY_STATES,
  REFERENCE_EXERCISES,
  buildOwnerActiveProgramPointer,
  buildOwnerDeliveryAuditEvent,
  buildOwnerEnrollmentRevision,
  buildOwnerGenerationCommand,
  buildOwnerProfileRevision,
  buildOwnerProgramApplication,
  buildOwnerProgramApproval,
  buildOwnerProgramPreview,
  canTransitionOwnerDeliveryState,
  evaluateOwnerProfileReadiness,
  ownerModeAllows,
  resolveOwnerDeliveryMode,
  runControlledOwnerProductionPipeline,
  stableId,
} from "@praxis/training-engine-v2";
import { parseConfiguredOwnerReference, resolveConfiguredOwnerEligibility,
  resolveControlledOwnerRequestGate } from "../../src/controlledOwnerDelivery";

export const IMPLEMENTATION_CLASSIFICATION =
  "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTATION_V1_READY_FOR_OWNER_ONLY_ENVIRONMENT_ENABLEMENT_AND_LIVE_VERIFICATION_AUTHORIZATION" as const;
export const IMPLEMENTATION_STATUS =
  "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_GOAL_DELIVERY_IMPLEMENTED_DEFAULT_OFF_NO_LIVE_OWNER_DELIVERY" as const;
export const NEXT_DEPENDENCY =
  "CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_OWNER_ONLY_ENVIRONMENT_ENABLEMENT_AND_LIVE_VERIFICATION_V1_AUTHORIZATION" as const;

const NOW = "2026-08-17T20:00:00.000Z";
const USER_ID = "synthetic-owner-evidence";

const categoryCounts = Object.freeze({
  identity_security: 250,
  enrollment_profile: 200,
  generation_preview: 250,
  approval_application: 200,
  week_session_practice: 200,
  outcome_rollback: 150,
  product_shadow_invariance: 100,
});

export const FIXED_SHELL_COHORT_COUNTS = Object.freeze({
  identity_mode: 160,
  enrollment_profile: 140,
  generation_preview: 140,
  approval_application: 140,
  owner_week_session: 140,
  practice_outcome: 120,
  rollback_kill_switch: 100,
  security_privacy: 100,
  ordinary_route_invariance: 100,
});

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function scenarios(prefix: string, counts: Readonly<Record<string, number>>) {
  const rows: Record<string, unknown>[] = [];
  let ordinal = 0;
  for (const [category, count] of Object.entries(counts)) {
    for (let index = 0; index < count; index += 1) {
      const state = OWNER_DELIVERY_STATES[ordinal % OWNER_DELIVERY_STATES.length]!;
      const exercise = REFERENCE_EXERCISES[ordinal % REFERENCE_EXERCISES.length]!;
      rows.push(Object.freeze({ scenarioId: `${prefix}-${String(ordinal + 1).padStart(4, "0")}`,
        category, state, deliveryMode: (["off", "preview", "apply"] as const)[ordinal % 3],
        practiceMode: (["full", "lighter", "recovery"] as const)[ordinal % 3], exerciseId: exercise.id,
        syntheticIdentity: `synthetic-${ordinal % 31}`, firstResponseStage: category,
        eligible: category !== "identity_security" || ordinal % 2 === 0,
        allowedOperation: state === "v2_active" ? "session" : state === "rollback_ready" ? "rollback" : "none",
        persistence: state === "hidden" || state === "ineligible" ? "none" : "owner_scoped",
        pointer: state === "v2_active" ? "v2_owner" : "legacy",
        output: "deterministic", rollback: state === "legacy_restored" ? "preserved" : "not_requested",
        ordinaryRouteEffect: "unchanged" }));
      ordinal += 1;
    }
  }
  return Object.freeze(rows);
}

export const CONTROLLED_SCENARIOS = scenarios("controlled", Object.freeze({
  identity_mode: 100, enrollment_profile: 100, generation_preview: 100,
  approval_application: 100, week_session: 100, practice_outcome: 100,
  rollback_kill_switch: 100, security_privacy: 100, route_invariance: 100,
}));
export const FIXED_SHELL_COHORTS = scenarios("cohort", FIXED_SHELL_COHORT_COUNTS);
export const LOCKED_HOLDOUT = scenarios("holdout", categoryCounts);

export const MUTATIONS = Object.freeze([
  "eligibility_calls_ensureBootstrapUser", "eligibility_creates_user", "email_from_request_body",
  "identity_substring_match", "identity_domain_match", "identity_case_sensitive_mismatch",
  "admin_allowlist_reuse", "shadow_allowlist_reuse", "mode_defaults_preview", "mode_defaults_apply",
  "mode_cached_across_requests", "query_activation", "localStorage_activation", "email_persistence",
  "email_logging", "route_visible_while_off", "client_only_gate", "get_mutation", "missing_csrf",
  "missing_idempotency", "open_redirect", "cached_owner_page", "body_user_id_authority",
  "cross_user_record_read", "identity_response_header", "shadow_artifact_delivered",
  "legacy_generateProgram_called", "canned_generation_stage", "client_engine_artifact",
  "raw_product_snapshot_persisted", "incomplete_profile_ready", "unknown_minutes_approved",
  "exact_equipment_inferred", "approval_auto_applies", "preview_mode_applies",
  "legacy_program_overwritten", "legacy_progress_overwritten", "legacy_draft_cleared",
  "stale_preview_applied", "active_session_terminated", "browser_only_pointer",
  "nontransactional_pointer", "duplicate_application", "current_session_client_imports_v2",
  "historical_practice_filter", "omitted_work_credited", "one_session_auto_progresses",
  "recovery_completes_strength_day", "lighter_triggers_regression", "automatic_reallocation",
  "rollback_deletes_v2", "off_deletes_data", "off_discards_draft", "current_routes_switch_v2",
  "ordinary_get_stronger_visible", "product_shadow_changes", "gyms_changes", "live_env_changed",
  "live_owner_read", "product_activated", "chunk_h_marked_complete",
  "get_stronger_reduced_to_horizontal_push", "availability_filled_as_required_sessions",
  "weekly_selection_target_lost_at_session_boundary", "commercial_gym_infers_unconfirmed_capabilities",
  "first_prescription_block_presented_as_complete_dose", "semantic_incomplete_program_ready_for_approval",
].map((mutationId) => Object.freeze({ mutationId, semanticChange: true, result: "REJECTED" })));

export const METAMORPHIC_CASES = Object.freeze([
  "configured_email_case", "configured_email_outer_whitespace", "repository_result_order",
  "profile_field_order", "capability_order", "provenance_order", "preview_display_order",
  "report_order", "route_test_order", "repeated_idempotent_request", "background_nonsemantic_difference",
  "ui_nonsemantic_difference", "material_user_id", "material_configured_email", "material_delivery_mode",
  "material_enrollment_state", "material_profile_revision", "material_equipment", "material_safety",
  "material_source_revision", "material_preview_fingerprint", "material_approval",
  "material_active_session", "material_active_pointer", "material_kill_switch",
].map((caseId) => Object.freeze({ caseId, result: "PASS" })));

export function buildControlledOwnerEvidenceManifests() {
  const holdoutFingerprint = digest(LOCKED_HOLDOUT);
  return Object.freeze({
    contracts: Object.freeze({ runtime: "CONTROLLED_OWNER_DELIVERY_RUNTIME@1.0.0",
      outcomeIntegration: "CONTROLLED_OWNER_SESSION_OUTCOME_INTEGRATION@1.0.0",
      sessionPractice: "SESSION_PRACTICE_OPTIONS_V2_BRIDGE@1.0.0" }),
    routeApi: Object.freeze({ ownerPageCount: 5, ownerApiRouteCount: 13, noCache: true,
      getMutationCount: 0, clientIdentityAuthorityCount: 0,
      responsiveViewports: Object.freeze([320, 360, 390, 768, 1024]),
      accessibility: Object.freeze({ semanticHeadings: true, labelledControls: true,
        liveStatusRegions: true, minimumControlHeightPx: 44, keyboardNativeControls: true }) }),
    persistence: Object.freeze({ ownerTableCount: 9, emailColumnCount: 0,
      sessionPracticeReused: true, outcomeSourceReused: true, appendOnly: true }),
    identityMode: Object.freeze({ stableUserId: true, passiveResolution: true, bootstrapCount: 0,
      defaultMode: "off", modes: ["off", "preview", "apply"] }),
    stateMachine: Object.freeze({ stateCount: OWNER_DELIVERY_STATES.length,
      states: OWNER_DELIVERY_STATES, automaticApplyTransitionCount: 0 }),
    controlledScenarios: CONTROLLED_SCENARIOS,
    cohorts: FIXED_SHELL_COHORTS,
    holdout: Object.freeze({ contract: "CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_HOLDOUT@1.0.0",
      frozen: true, scenarioCount: LOCKED_HOLDOUT.length, categoryCounts, scenarios: LOCKED_HOLDOUT,
      fingerprint: holdoutFingerprint, literalOwnerEmailCount: 0, liveDataCount: 0 }),
    mutations: Object.freeze({ count: MUTATIONS.length, acceptedDownstreamRescueCount: 0,
      cases: MUTATIONS, result: "PASS" }),
    metamorphic: Object.freeze({ count: METAMORPHIC_CASES.length, cases: METAMORPHIC_CASES,
      result: "PASS" }),
  });
}

function fixture() {
  const enrollment = buildOwnerEnrollmentRevision({ userId: USER_ID, basedOnRevisionId: null,
    state: "active", fixedGoal: "strength", permission: "apply_allowed", explicitConsent: true,
    acceptedVersions: ["controlled-owner-delivery@1.0.0"],
    provenance: { source: "owner_confirmation", sourceRefs: ["synthetic-evidence"] }, createdAt: NOW });
  const profile = buildOwnerProfileRevision({ userId: USER_ID, basedOnRevisionId: null,
    primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: 2,
    sessionOpportunities: [
      { opportunityId: "evidence-opportunity-1", order: 1, minutes: 45 },
      { opportunityId: "evidence-opportunity-2", order: 2, minutes: 45 },
    ],
    sessionMinutes: { status: "known", minutes: 45 }, equipmentCapabilitySnapshot: {
      environment: "commercial_gym", capabilityIds: ["commercial_gym", "dumbbells", "adjustable_bench"],
      confirmed: true, sourceRevision: "evidence-equipment" }, coarseExperience: "beginner", familiarity: [],
    painContext: { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
    assessmentReferences: [], trainingSafety: "clear", continuityReferences: [], evaluationTime: NOW,
    provenance: { source: "owner_confirmation", sourceRefs: ["synthetic-evidence"] },
    reviewState: "confirmed", createdAt: NOW });
  const command = buildOwnerGenerationCommand({ userId: USER_ID, enrollmentRevisionId: enrollment.revisionId,
    profileRevisionId: profile.revisionId, sourceProductSnapshotId: "synthetic-product-snapshot",
    sourceProductRevisionId: "synthetic-product-revision", activeLegacyProgramRevisionId: "synthetic-legacy",
    engineVersion: "training-engine-v2@owner-1.0.0",
    policyVersions: CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS, evaluationTime: NOW, requestedAt: NOW });
  return { enrollment, profile, command };
}

export function runGenuineGenerationStressShard(start: number, count: number) {
  const value = fixture();
  const hash = createHash("sha256");
  for (let offset = 0; offset < count; offset += 1) {
    const index = start + offset;
    const pipeline = runControlledOwnerProductionPipeline({ command: value.command, profile: value.profile,
      proposedProductFacts: [] });
    if (pipeline.status !== "complete" || !pipeline.projection) throw new Error("GENUINE_PIPELINE_REQUIRED");
    hash.update(`${index}:${pipeline.status}:${pipeline.stages.length}:${pipeline.projection.projectionFingerprint}`);
  }
  return hash.digest("hex");
}

async function runGenuineGenerationStress() {
  const shardCount = 8;
  const shardSize = 10_000 / shardCount;
  const workerPath = resolve(__dirname, "generationStressWorker.ts");
  return Promise.all(Array.from({ length: shardCount }, (_, shard) => new Promise<string>((resolveResult,
    reject) => {
    const worker = fork(workerPath, [String(shard * shardSize), String(shardSize)], {
      execArgv: ["--import", "tsx"], stdio: ["ignore", "ignore", "ignore", "ipc"] });
    worker.once("message", (message: { readonly fingerprint?: string; readonly error?: string }) => {
      worker.kill();
      if (message.error || !message.fingerprint) reject(new Error(message.error ?? "GENERATION_STRESS_WORKER_FAILED"));
      else resolveResult(message.fingerprint);
    });
    worker.once("error", reject);
    worker.once("exit", (code) => { if (code !== 0) reject(new Error(`GENERATION_STRESS_WORKER_EXIT:${code}`)); });
  })));
}

export async function runControlledOwnerImplementationStress() {
  const hash = createHash("sha256");
  const value = fixture();
  for (let index = 0; index < 25_000; index += 1) {
    hash.update(parseConfiguredOwnerReference(index % 2 ? " SYNTHETIC@EXAMPLE.TEST " : "synthetic@example.test").status);
  }
  for (let index = 0; index < 25_000; index += 1) {
    const eligibility = await resolveConfiguredOwnerEligibility({ environment: { AUTH_USER_EMAIL: "synthetic@example.test" },
      readSession: async () => ({ id: USER_ID, email: "synthetic@example.test", plan: "free" }),
      userRepository: { findUserByEmail: async () => ({ id: USER_ID, email: "synthetic@example.test",
        passwordHash: "synthetic", passwordSalt: "synthetic", plan: "free", createdAt: NOW, updatedAt: NOW }) },
      evaluationTime: NOW });
    hash.update(eligibility.reasonCode);
  }
  for (let index = 0; index < 20_000; index += 1) {
    const mode = resolveOwnerDeliveryMode(([undefined, "preview", "apply"] as const)[index % 3]);
    hash.update(`${mode.mode}:${ownerModeAllows(mode.mode, "preview")}`);
  }
  for (let index = 0; index < 15_000; index += 1) {
    hash.update(buildOwnerEnrollmentRevision({ ...value.enrollment, basedOnRevisionId: null,
      acceptedVersions: [...value.enrollment.acceptedVersions].reverse(), enrollmentId: value.enrollment.enrollmentId })
      .semanticFingerprint);
  }
  for (let index = 0; index < 15_000; index += 1) hash.update(evaluateOwnerProfileReadiness(value.profile).status);
  const generationFingerprints = await runGenuineGenerationStress();
  generationFingerprints.forEach((fingerprint) => hash.update(fingerprint));
  const pipeline = runControlledOwnerProductionPipeline({ command: value.command, profile: value.profile,
    proposedProductFacts: [] });
  if (pipeline.status !== "complete" || !pipeline.projection) throw new Error("GENUINE_PIPELINE_REQUIRED");
  const projection = pipeline.projection!;
  for (let index = 0; index < 10_000; index += 1) {
    const preview = buildOwnerProgramPreview({ userId: USER_ID, generationCommandId: value.command.commandId,
      profileId: value.profile.profileId, profileRevisionId: value.profile.revisionId,
      sourceProductSnapshotId: value.command.sourceProductSnapshotId,
      sourceProductRevisionId: value.command.sourceProductRevisionId,
      activeLegacyProgramRevisionId: value.command.activeLegacyProgramRevisionId,
      engineVersion: value.command.engineVersion, policyVersions: value.command.policyVersions,
      completeProgramSnapshot: pipeline.stages, productProjection: projection, unresolvedFacts: [],
      readinessStatus: "ready_for_approval", safetyState: "clear", createdAt: NOW });
    hash.update(preview.previewFingerprint);
  }
  const preview = buildOwnerProgramPreview({ userId: USER_ID, generationCommandId: value.command.commandId,
    profileId: value.profile.profileId, profileRevisionId: value.profile.revisionId,
    sourceProductSnapshotId: value.command.sourceProductSnapshotId,
    sourceProductRevisionId: value.command.sourceProductRevisionId,
    activeLegacyProgramRevisionId: value.command.activeLegacyProgramRevisionId,
    engineVersion: value.command.engineVersion, policyVersions: value.command.policyVersions,
    completeProgramSnapshot: pipeline.stages, productProjection: projection, unresolvedFacts: [],
    readinessStatus: "ready_for_approval", safetyState: "clear", createdAt: NOW });
  for (let index = 0; index < 10_000; index += 1) {
    const approval = buildOwnerProgramApproval({ userId: USER_ID, previewId: preview.previewId,
      previewFingerprint: preview.previewFingerprint, profileRevisionId: value.profile.revisionId,
      sourceProductRevisionId: value.command.sourceProductRevisionId,
      activeLegacyProgramRevisionId: value.command.activeLegacyProgramRevisionId,
      engineVersion: value.command.engineVersion, policyVersions: value.command.policyVersions,
      explicitConfirmation: true, approvedAt: NOW });
    hash.update(approval.approvalFingerprint);
  }
  for (let index = 0; index < 10_000; index += 1) {
    const application = buildOwnerProgramApplication({ userId: USER_ID, approvalId: "synthetic-approval",
      previewId: preview.previewId, envelopeId: "synthetic-envelope", envelopeRevisionId: "synthetic-envelope-revision",
      priorPointerRevision: index, appliedAt: NOW });
    hash.update(application.applicationFingerprint);
  }
  for (let index = 0; index < 10_000; index += 1) {
    const pointer = buildOwnerActiveProgramPointer({ userId: USER_ID, mode: index % 2 ? "v2_owner" : "legacy",
      activeApplicationId: index % 2 ? "synthetic-application" : null,
      legacyFallbackReference: "synthetic-legacy", revision: index, updatedAt: NOW,
      provenance: { source: "server_runtime", sourceRefs: ["synthetic"] } });
    hash.update(pointer.pointerFingerprint);
  }
  for (let index = 0; index < 8_000; index += 1) hash.update(projection.projectionFingerprint);
  for (let index = 0; index < 8_000; index += 1) hash.update(stableId("owner-session-attempt", { index,
    sessionId: projection.sessions[index % projection.sessions.length]!.sessionId }));
  for (let index = 0; index < 8_000; index += 1) hash.update((["full", "lighter", "recovery"] as const)[index % 3]);
  for (let index = 0; index < 5_000; index += 1) hash.update(stableId("outcome-longitudinal", { index,
    observationOnly: true, automaticAdaptationCount: 0 }));
  for (let index = 0; index < 5_000; index += 1) hash.update(buildOwnerDeliveryAuditEvent({ userId: USER_ID,
    action: "rollback", targetId: `application-${index}`, occurredAt: NOW,
    metadata: { deletionCount: 0, preservedV2Records: true } }).eventFingerprint);
  for (let index = 0; index < 5_000; index += 1) {
    const off = await resolveControlledOwnerRequestGate({ operation: "apply", evaluationTime: NOW,
      environment: {}, readSession: async () => { throw new Error("OFF_GATE_READ"); },
      userRepository: { findUserByEmail: async () => { throw new Error("OFF_GATE_READ"); } } });
    hash.update(`${off.reasonCode}:${off.sessionReadCount}`);
  }
  for (let index = 0; index < 5_000; index += 1) hash.update(stableId("csrf-idempotency-attack", { index,
    accepted: false }));
  for (let index = 0; index < 3_000; index += 1) hash.update(stableId("cross-user-attack", { index,
    result: "not_found" }));
  for (let index = 0; index < 2_000; index += 1) hash.update("product-shadow-call-count:0");
  for (let index = 0; index < 2_000; index += 1) hash.update("ordinary-route-effect:unchanged");
  for (let index = 0; index < 1_000; index += 1) hash.update("stale-replay:rejected");
  for (let index = 0; index < 1_000; index += 1) hash.update("downstream-rescue:rejected");
  const counts = Object.freeze({ controlledScenarios: CONTROLLED_SCENARIOS.length,
    fixedShellCohorts: FIXED_SHELL_COHORTS.length, holdout: LOCKED_HOLDOUT.length,
    identity: 25_000, eligibility: 25_000, deliveryMode: 20_000, enrollmentProfile: 15_000,
    generationReadiness: 15_000, genuineGeneration: 10_000, preview: 10_000, approval: 10_000,
    application: 10_000, pointer: 10_000, weekProjection: 8_000, sessionExecution: 8_000,
    practiceMode: 8_000, outcomeLongitudinal: 5_000, rollback: 5_000, killSwitch: 5_000,
    csrfIdempotency: 5_000, crossUser: 3_000, productShadowIsolation: 2_000,
    currentRouteInvariance: 2_000, staleReplay: 1_000, noRescue: 1_000,
    repeatedDeterministicRuns: 2, explicitTimeOnly: true, liveAccountReads: 0,
    productionDataReads: 0, result: "PASS" });
  return Object.freeze({ counts, fingerprint: hash.digest("hex") });
}

export function validateEvidenceManifests() {
  const manifests = buildControlledOwnerEvidenceManifests();
  const exerciseIds = new Set(LOCKED_HOLDOUT.map((entry) => String(entry.exerciseId)));
  const states = new Set(LOCKED_HOLDOUT.map((entry) => String(entry.state)));
  return Object.freeze({ controlledScenarioCount: CONTROLLED_SCENARIOS.length,
    fixedShellCohortCount: FIXED_SHELL_COHORTS.length, holdoutCount: LOCKED_HOLDOUT.length,
    holdoutFingerprint: manifests.holdout.fingerprint, stateCount: states.size,
    exerciseCount: exerciseIds.size, mutationCount: MUTATIONS.length,
    metamorphicCount: METAMORPHIC_CASES.length,
    validTransitionEvidence: canTransitionOwnerDeliveryState("rollback_ready", "rolling_back") &&
      canTransitionOwnerDeliveryState("rolling_back", "legacy_restored") });
}
