import { explicitIsoTime, uniqueSorted } from "../prescription/compiler/utilities";
import {
  ADHERENCE_STATES,
  EXTERNAL_TRAINING_ACTIVITY_TYPES,
  PERFORMANCE_COMPLETION_STATES,
  RECOVERY_READINESS_STATES,
  RESPONSE_TOLERANCE_STATES,
  type OutcomeSourceAuthority,
  type OutcomeSourceCategory,
  type OutcomeSourceFactType,
  type OutcomeSourceStructuredFact,
} from "./designContracts";
import {
  EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED,
  type ProductionOutcomeSourceAdapter,
  type ProductionOutcomeSourceAdapterOutput,
  type ProductionRawOutcomeSourceEnvelope,
} from "./productionContracts";

type StructuredPayload = Readonly<Record<string, unknown>>;
type Side = OutcomeSourceStructuredFact["side"];

export interface ProductionPerformanceBlockPayload {
  readonly plannedBlockId: string | null;
  readonly performedBlockId: string;
  readonly completionState: typeof PERFORMANCE_COMPLETION_STATES[number];
  readonly actualsIndependentlyObserved: boolean;
  readonly actualRepsBySet?: readonly number[];
  readonly actualSets?: number;
  readonly actualRounds?: number;
  readonly actualTrips?: number;
  readonly actualSteps?: number;
  readonly actualBreathCycles?: number;
  readonly actualLoad?: number;
  readonly loadUnit?: string;
  readonly actualEffort?: number;
  readonly actualDurationSeconds?: number;
  readonly actualRestSeconds?: number;
  readonly actualTempo?: string;
  readonly actualOrder?: number;
  readonly side?: Exclude<Side, null>;
  readonly supportKey?: string;
  readonly rangeKey?: string;
  readonly loadContextKey?: string;
}

export interface ProductionPerformancePayload extends StructuredPayload {
  readonly assignmentId: string;
  readonly originalExerciseId: string;
  readonly realizedExerciseId: string;
  readonly blocks: readonly ProductionPerformanceBlockPayload[];
  readonly substitutionLineage: readonly string[];
  readonly explicitUnknowns: readonly string[];
}

export interface ProductionSessionCompletionPayload extends StructuredPayload {
  readonly sessionId: string;
  readonly state: typeof ADHERENCE_STATES[number];
  readonly targetIds: readonly string[];
  readonly explicitUnknowns: readonly string[];
}

export interface ProductionSubstitutionPayload extends StructuredPayload {
  readonly originalExerciseId: string;
  readonly realizedExerciseId: string;
  readonly occurredBetweenBlockIds: readonly string[];
  readonly reasonCode: "equipment_unavailable" | "user_declined" | "response_limited" |
    "safety_restriction" | "coach_directed" | "unknown";
}

export interface ProductionResponsePayload extends StructuredPayload {
  readonly responseObservationId: string;
  readonly targetIds: readonly string[];
  readonly tolerance: typeof RESPONSE_TOLERANCE_STATES[number];
  readonly region: string | null;
  readonly side: Exclude<Side, null>;
  readonly symptomChange: "improved" | "unchanged" | "worsened" | "new" | "unknown";
  readonly onset: "during" | "immediate_after" | "delayed" | "unknown";
  readonly persistence: "resolved" | "transient" | "persisted" | "unknown";
  readonly consequence: "none" | "dose_limited" | "block_stopped" | "session_stopped" | "review_required" | "unknown";
  readonly supportKey: string | null;
  readonly rangeKey: string | null;
  readonly loadContextKey: string | null;
  readonly explicitUnknowns: readonly string[];
}

export interface ProductionRecoveryPayload extends StructuredPayload {
  readonly targetIds: readonly string[];
  readonly scope: "localized" | "systemic" | "session" | "exercise" | "unknown";
  readonly readiness: typeof RECOVERY_READINESS_STATES[number];
  readonly sleepReport: "restorative" | "disrupted" | "insufficient" | "unknown";
  readonly appliesThroughTime: string;
  readonly explicitUnknowns: readonly string[];
}

export interface ProductionSafetyPayload extends StructuredPayload {
  readonly targetIds: readonly string[];
  readonly restrictionType: "movement" | "load" | "range" | "support" | "activity" | "unknown";
  readonly restrictionValue: string;
  readonly permitted: boolean;
  readonly effectiveThroughTime: string | null;
  readonly explicitUnknowns: readonly string[];
}

export interface ProductionEquipmentEnvironmentPayload extends StructuredPayload {
  readonly targetIds: readonly string[];
  readonly capabilities: readonly {
    readonly capabilityId: string;
    readonly state: "available" | "unavailable" | "constrained" | "unknown";
    readonly increment?: number;
    readonly unit?: string;
  }[];
  readonly locationId: string | null;
  readonly effectiveThroughTime: string;
  readonly explicitUnknowns: readonly string[];
}

export interface ProductionExternalLoadPayload extends StructuredPayload {
  readonly targetIds: readonly string[];
  readonly activityType: typeof EXTERNAL_TRAINING_ACTIVITY_TYPES[number];
  readonly durationMinutes: number | null;
  readonly intensityDescriptor: "low" | "moderate" | "high" | "maximal" | "unknown";
  readonly explicitRegions: readonly string[];
  readonly explicitUnknowns: readonly string[];
}

export interface ProductionReviewedReportPayload extends StructuredPayload {
  readonly targetIds: readonly string[];
  readonly confirmed: boolean;
  readonly explicitUnknowns: readonly string[];
}

function strings(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string" && entry.trim().length > 0);
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function requiredString(payload: StructuredPayload, key: string, reasons: string[]): void {
  if (typeof payload[key] !== "string" || !(payload[key] as string).trim()) reasons.push(`PAYLOAD_FIELD_REQUIRED:${key}`);
}

function targetIds(payload: StructuredPayload, reasons: string[]): void {
  if (!strings(payload.targetIds)) reasons.push("PAYLOAD_TARGET_IDS_REQUIRED");
}

function fact(
  factType: OutcomeSourceFactType,
  value: OutcomeSourceStructuredFact["value"],
  options: Partial<Omit<OutcomeSourceStructuredFact, "factType" | "value">> = {},
): OutcomeSourceStructuredFact {
  return Object.freeze({ factType, value, unit: options.unit ?? null, blockId: options.blockId ?? null,
    side: options.side ?? null, supportKey: options.supportKey ?? null, rangeKey: options.rangeKey ?? null,
    loadContextKey: options.loadContextKey ?? null, independentlyObserved: options.independentlyObserved ?? false });
}

function output(input: {
  owner: string;
  authority: OutcomeSourceAuthority;
  targetIds: readonly string[];
  facts: readonly OutcomeSourceStructuredFact[];
  unknowns?: readonly string[];
  appliesThroughTime?: string | null;
  provenance: string;
}): ProductionOutcomeSourceAdapterOutput {
  return Object.freeze({ sourceOwner: input.owner, sourceAuthority: input.authority,
    targetIds: Object.freeze([...new Set(input.targetIds)].sort()), structuredFacts: Object.freeze([...input.facts]),
    explicitUnknowns: Object.freeze([...new Set(input.unknowns ?? [])].sort()),
    appliesThroughTime: input.appliesThroughTime ?? null, reviewState: input.authority === "imported_legacy_record" ?
      "pending" : "validated", provenance: Object.freeze([input.provenance]) });
}

function adapter(input: Omit<ProductionOutcomeSourceAdapter, "normalizedSchemaId" | "freeTextPolicy" |
"decisionUseDefault" | "provenance">): ProductionOutcomeSourceAdapter {
  return Object.freeze({ ...input, normalizedSchemaId: "NORMALIZED_OUTCOME_SOURCE_RECORD",
    freeTextPolicy: "reject", decisionUseDefault: "pending",
    provenance: Object.freeze([`production-adapter:${input.adapterId}@${input.adapterVersion}`]) });
}

function validatePerformance(payload: StructuredPayload): readonly string[] {
  const reasons: string[] = [];
  requiredString(payload, "assignmentId", reasons);
  requiredString(payload, "originalExerciseId", reasons);
  requiredString(payload, "realizedExerciseId", reasons);
  if (!Array.isArray(payload.blocks) || payload.blocks.length === 0) reasons.push("PERFORMANCE_BLOCKS_REQUIRED");
  const blockIds = new Set<string>();
  for (const raw of Array.isArray(payload.blocks) ? payload.blocks : []) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) { reasons.push("PERFORMANCE_BLOCK_INVALID"); continue; }
    const block = raw as Record<string, unknown>;
    requiredString(block, "performedBlockId", reasons);
    if (typeof block.performedBlockId === "string" && blockIds.has(block.performedBlockId)) {
      reasons.push("PERFORMANCE_BLOCK_ID_DUPLICATE");
    }
    if (typeof block.performedBlockId === "string") blockIds.add(block.performedBlockId);
    if (!PERFORMANCE_COMPLETION_STATES.includes(block.completionState as never)) {
      reasons.push("PERFORMANCE_COMPLETION_STATE_INVALID");
    }
    const actualKeys = ["actualRepsBySet", "actualSets", "actualRounds", "actualTrips", "actualSteps",
      "actualBreathCycles", "actualLoad", "actualEffort", "actualDurationSeconds", "actualRestSeconds",
      "actualTempo", "actualOrder"];
    if (actualKeys.some((key) => block[key] !== undefined) && block.actualsIndependentlyObserved !== true) {
      reasons.push("PLANNED_VALUE_CANNOT_BECOME_ACTUAL");
    }
    if (block.actualRepsBySet !== undefined &&
        (!Array.isArray(block.actualRepsBySet) || !block.actualRepsBySet.every(finite))) {
      reasons.push("PERFORMANCE_ACTUAL_REPS_INVALID");
    }
  }
  if (!strings(payload.substitutionLineage)) reasons.push("PERFORMANCE_SUBSTITUTION_LINEAGE_REQUIRED");
  if (!Array.isArray(payload.explicitUnknowns)) reasons.push("PERFORMANCE_EXPLICIT_UNKNOWNS_REQUIRED");
  return uniqueSorted(reasons);
}

function performanceFacts(payload: ProductionPerformancePayload): readonly OutcomeSourceStructuredFact[] {
  const facts: OutcomeSourceStructuredFact[] = [];
  for (const block of payload.blocks) {
    const context = { blockId: block.performedBlockId, side: block.side ?? null,
      supportKey: block.supportKey ?? null, rangeKey: block.rangeKey ?? null,
      loadContextKey: block.loadContextKey ?? null, independentlyObserved: block.actualsIndependentlyObserved };
    const completion: OutcomeSourceFactType = block.completionState === "completed" ? "block_completed" :
      block.completionState === "partially_completed" ? "block_partially_completed" :
        block.completionState === "omitted" ? "block_omitted" :
          block.completionState === "additional_unplanned" ? "unplanned_block_completed" :
            block.completionState === "not_performed" ? "not_performed" : "exercise_started";
    facts.push(fact(completion, block.completionState, context));
    const values: readonly [OutcomeSourceFactType, unknown, string | null][] = [
      ["actual_reps", block.actualRepsBySet, "repetitions"], ["actual_sets", block.actualSets, "sets"],
      ["actual_rounds", block.actualRounds, "rounds"], ["actual_trips", block.actualTrips, "trips"],
      ["actual_steps", block.actualSteps, "steps"], ["actual_breath_cycles", block.actualBreathCycles, "breaths"],
      ["actual_load", block.actualLoad, block.loadUnit ?? null], ["actual_effort", block.actualEffort, "rpe"],
      ["actual_duration", block.actualDurationSeconds, "seconds"], ["actual_rest", block.actualRestSeconds, "seconds"],
      ["actual_tempo", block.actualTempo, null], ["actual_order", block.actualOrder, "ordinal"],
    ];
    values.forEach(([type, value, unit]) => {
      if (value !== undefined) facts.push(fact(type, value as OutcomeSourceStructuredFact["value"], { ...context, unit }));
    });
  }
  if (payload.originalExerciseId !== payload.realizedExerciseId) {
    facts.push(fact("substitution", Object.freeze([payload.originalExerciseId, payload.realizedExerciseId])));
  }
  return Object.freeze(facts);
}

function createPerformanceAdapter(sourceCategory: "exercise_performance" | "block_performance") {
  return adapter({ adapterId: `production-${sourceCategory.replace(/_/g, "-")}`,
    adapterVersion: "1.0.0", sourceCategory, payloadSchemaId: "production-performance-payload",
    payloadSchemaVersion: "1.0.0", sourceAuthorityEligible: Object.freeze(["independently_observed_performance"]),
    requiredLineage: Object.freeze(["sourceExposureEventId", "sessionId", "prescriptionId",
      "prescriptionRevisionId", "sequencePlanId", "sequenceRevisionId"]), validatePayload: validatePerformance,
    normalizePayload: (raw) => {
      const payload = raw as ProductionPerformancePayload;
      return output({ owner: "exercise_performance", authority: "independently_observed_performance",
        targetIds: [payload.assignmentId, payload.originalExerciseId, payload.realizedExerciseId],
        facts: performanceFacts(payload), unknowns: payload.explicitUnknowns,
        provenance: "normalizer:production-performance-v1" });
    } });
}

function validateSession(payload: StructuredPayload): readonly string[] {
  const reasons: string[] = [];
  requiredString(payload, "sessionId", reasons);
  targetIds(payload, reasons);
  if (!ADHERENCE_STATES.includes(payload.state as never)) reasons.push("ADHERENCE_STATE_INVALID");
  if (!Array.isArray(payload.explicitUnknowns)) reasons.push("ADHERENCE_EXPLICIT_UNKNOWNS_REQUIRED");
  return uniqueSorted(reasons);
}

function sessionAdapter(sourceCategory: "session_completion" | "adherence") {
  return adapter({ adapterId: `production-${sourceCategory.replace(/_/g, "-")}`, adapterVersion: "1.0.0",
    sourceCategory, payloadSchemaId: "production-adherence-payload", payloadSchemaVersion: "1.0.0",
    sourceAuthorityEligible: Object.freeze(["authenticated_product_event", "athlete_explicit_report"]),
    requiredLineage: Object.freeze(["sessionId"]), validatePayload: validateSession,
    normalizePayload: (raw) => {
      const payload = raw as ProductionSessionCompletionPayload;
      return output({ owner: sourceCategory, authority: "authenticated_product_event",
        targetIds: payload.targetIds, facts: [fact("adherence_state", payload.state)],
        unknowns: payload.explicitUnknowns, provenance: `normalizer:production-${sourceCategory}-v1` });
    } });
}

const substitutionAdapter = adapter({ adapterId: "production-exercise-substitution", adapterVersion: "1.0.0",
  sourceCategory: "exercise_substitution", payloadSchemaId: "production-substitution-payload",
  payloadSchemaVersion: "1.0.0", sourceAuthorityEligible: Object.freeze(["authenticated_product_event"]),
  requiredLineage: Object.freeze(["sourceExposureEventId", "sessionId", "prescriptionRevisionId", "sequenceRevisionId"]),
  validatePayload: (payload) => {
    const reasons: string[] = [];
    requiredString(payload, "originalExerciseId", reasons); requiredString(payload, "realizedExerciseId", reasons);
    if (!Array.isArray(payload.occurredBetweenBlockIds)) reasons.push("SUBSTITUTION_BLOCK_LINEAGE_REQUIRED");
    if (!["equipment_unavailable", "user_declined", "response_limited", "safety_restriction",
      "coach_directed", "unknown"].includes(String(payload.reasonCode))) reasons.push("SUBSTITUTION_REASON_INVALID");
    return uniqueSorted(reasons);
  },
  normalizePayload: (raw) => {
    const payload = raw as ProductionSubstitutionPayload;
    return output({ owner: "exercise_substitution", authority: "authenticated_product_event",
      targetIds: [payload.originalExerciseId, payload.realizedExerciseId],
      facts: [fact("substitution", Object.freeze([payload.originalExerciseId, payload.realizedExerciseId])),
        fact("review_confirmation", payload.reasonCode)], provenance: "normalizer:production-substitution-v1" });
  } });

function validateResponse(payload: StructuredPayload): readonly string[] {
  const reasons: string[] = [];
  requiredString(payload, "responseObservationId", reasons); targetIds(payload, reasons);
  if (!RESPONSE_TOLERANCE_STATES.includes(payload.tolerance as never)) reasons.push("RESPONSE_TOLERANCE_INVALID");
  if (!["improved", "unchanged", "worsened", "new", "unknown"].includes(String(payload.symptomChange))) {
    reasons.push("RESPONSE_SYMPTOM_CHANGE_INVALID");
  }
  if (!["during", "immediate_after", "delayed", "unknown"].includes(String(payload.onset))) reasons.push("RESPONSE_ONSET_INVALID");
  if (!["resolved", "transient", "persisted", "unknown"].includes(String(payload.persistence))) {
    reasons.push("RESPONSE_PERSISTENCE_INVALID");
  }
  if (!Array.isArray(payload.explicitUnknowns)) reasons.push("RESPONSE_EXPLICIT_UNKNOWNS_REQUIRED");
  return uniqueSorted(reasons);
}

function createResponseAdapter(sourceCategory: "training_response" | "pain_or_discomfort_report") {
  return adapter({ adapterId: `production-${sourceCategory.replace(/_/g, "-")}`, adapterVersion: "1.0.0",
    sourceCategory, payloadSchemaId: "production-response-payload", payloadSchemaVersion: "1.0.0",
    sourceAuthorityEligible: Object.freeze(["athlete_explicit_report", "independently_observed_performance"]),
    requiredLineage: Object.freeze(["sourceExposureEventId"]), validatePayload: validateResponse,
    normalizePayload: (raw) => {
      const payload = raw as ProductionResponsePayload;
      const context = { side: payload.side, supportKey: payload.supportKey,
        rangeKey: payload.rangeKey, loadContextKey: payload.loadContextKey };
      return output({ owner: "training_response_receiver", authority: "athlete_explicit_report",
        targetIds: [payload.responseObservationId, ...payload.targetIds], facts: [
          fact("response_tolerance", payload.tolerance, context), fact("body_region", payload.region, context),
          fact("symptom_change", payload.symptomChange, context), fact("symptom_onset", payload.onset, context),
          fact("symptom_persistence", payload.persistence, context),
          fact("training_consequence", payload.consequence, context),
        ], unknowns: payload.explicitUnknowns, provenance: `normalizer:production-${sourceCategory}-v1` });
    } });
}

const recoveryAdapter = adapter({ adapterId: "production-recovery-readiness", adapterVersion: "1.0.0",
  sourceCategory: "recovery_readiness", payloadSchemaId: "production-recovery-readiness-payload",
  payloadSchemaVersion: "1.0.0", sourceAuthorityEligible: Object.freeze(["athlete_explicit_report", "coach_reviewed"]),
  requiredLineage: Object.freeze([]), validatePayload: (payload) => {
    const reasons: string[] = []; targetIds(payload, reasons);
    if (!RECOVERY_READINESS_STATES.includes(payload.readiness as never)) reasons.push("RECOVERY_READINESS_STATE_INVALID");
    if (!explicitIsoTime(String(payload.appliesThroughTime ?? ""))) reasons.push("RECOVERY_APPLIES_THROUGH_TIME_INVALID");
    if (!Array.isArray(payload.explicitUnknowns)) reasons.push("RECOVERY_EXPLICIT_UNKNOWNS_REQUIRED");
    return uniqueSorted(reasons);
  }, normalizePayload: (raw) => {
    const payload = raw as ProductionRecoveryPayload;
    const facts = [fact("readiness_report", payload.readiness), fact("review_confirmation", payload.sleepReport)];
    if (payload.scope === "localized") facts.push(fact("localized_recovery_concern", payload.readiness));
    if (payload.scope === "systemic") facts.push(fact("systemic_recovery_concern", payload.readiness));
    return output({ owner: "recovery_summary", authority: "athlete_explicit_report", targetIds: payload.targetIds,
      facts, unknowns: payload.explicitUnknowns, appliesThroughTime: payload.appliesThroughTime,
      provenance: "normalizer:production-recovery-readiness-v1" });
  } });

function validateSafety(payload: StructuredPayload): readonly string[] {
  const reasons: string[] = []; targetIds(payload, reasons); requiredString(payload, "restrictionValue", reasons);
  if (!["movement", "load", "range", "support", "activity", "unknown"].includes(String(payload.restrictionType))) {
    reasons.push("SAFETY_RESTRICTION_TYPE_INVALID");
  }
  if (typeof payload.permitted !== "boolean") reasons.push("SAFETY_PERMISSION_STATE_REQUIRED");
  if (payload.effectiveThroughTime !== null && !explicitIsoTime(String(payload.effectiveThroughTime ?? ""))) {
    reasons.push("SAFETY_EFFECTIVE_TIME_INVALID");
  }
  if (!Array.isArray(payload.explicitUnknowns)) reasons.push("SAFETY_EXPLICIT_UNKNOWNS_REQUIRED");
  return uniqueSorted(reasons);
}

function safetyAdapter(sourceCategory: "training_safety" | "clinician_restriction") {
  const clinician = sourceCategory === "clinician_restriction";
  return adapter({ adapterId: `production-${sourceCategory.replace(/_/g, "-")}`, adapterVersion: "1.0.0",
    sourceCategory, payloadSchemaId: "production-safety-restriction-payload", payloadSchemaVersion: "1.0.0",
    sourceAuthorityEligible: Object.freeze([clinician ? "clinician_explicit_restriction" : "production_engine_trace"]),
    requiredLineage: Object.freeze([]), validatePayload: validateSafety, normalizePayload: (raw) => {
      const payload = raw as ProductionSafetyPayload;
      return output({ owner: clinician ? "clinician_restriction" : "training_safety",
        authority: clinician ? "clinician_explicit_restriction" : "production_engine_trace",
        targetIds: payload.targetIds, facts: [fact(payload.permitted ? "clinician_permission" :
          clinician ? "clinician_prohibition" : "safety_block", payload.restrictionValue),
          fact("review_confirmation", payload.restrictionType)], unknowns: payload.explicitUnknowns,
        appliesThroughTime: payload.effectiveThroughTime,
        provenance: `normalizer:production-${sourceCategory}-v1` });
    } });
}

function validateEquipment(payload: StructuredPayload): readonly string[] {
  const reasons: string[] = []; targetIds(payload, reasons);
  if (!Array.isArray(payload.capabilities) || payload.capabilities.length === 0) reasons.push("EQUIPMENT_CAPABILITIES_REQUIRED");
  for (const raw of Array.isArray(payload.capabilities) ? payload.capabilities : []) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) { reasons.push("EQUIPMENT_CAPABILITY_INVALID"); continue; }
    requiredString(raw as StructuredPayload, "capabilityId", reasons);
    if (!["available", "unavailable", "constrained", "unknown"].includes(String((raw as StructuredPayload).state))) {
      reasons.push("EQUIPMENT_CAPABILITY_STATE_INVALID");
    }
  }
  if (!explicitIsoTime(String(payload.effectiveThroughTime ?? ""))) reasons.push("EQUIPMENT_EFFECTIVE_TIME_INVALID");
  return uniqueSorted(reasons);
}

function equipmentAdapter(sourceCategory: "equipment_snapshot" | "environment_constraint") {
  return adapter({ adapterId: `production-${sourceCategory.replace(/_/g, "-")}`, adapterVersion: "1.0.0",
    sourceCategory, payloadSchemaId: "production-equipment-environment-payload", payloadSchemaVersion: "1.0.0",
    sourceAuthorityEligible: Object.freeze(["authenticated_product_event", "athlete_explicit_report"]),
    requiredLineage: Object.freeze([]), validatePayload: validateEquipment, normalizePayload: (raw) => {
      const payload = raw as ProductionEquipmentEnvironmentPayload;
      const facts = payload.capabilities.flatMap((capability) => [
        fact(sourceCategory === "equipment_snapshot" ? "equipment_available" : "environment_constraint",
          Object.freeze([capability.capabilityId, capability.state])),
        ...(capability.increment === undefined ? [] : [fact("equipment_increment", capability.increment,
          { unit: capability.unit ?? null })]),
      ]);
      if (payload.locationId) facts.push(fact("training_location", payload.locationId));
      return output({ owner: sourceCategory, authority: "authenticated_product_event", targetIds: payload.targetIds,
        facts, unknowns: payload.explicitUnknowns, appliesThroughTime: payload.effectiveThroughTime,
        provenance: `normalizer:production-${sourceCategory}-v1` });
    } });
}

const externalLoadAdapter = adapter({ adapterId: "production-external-training-load", adapterVersion: "1.0.0",
  sourceCategory: "external_training_load", payloadSchemaId: "production-external-load-payload",
  payloadSchemaVersion: "1.0.0", sourceAuthorityEligible: Object.freeze(["athlete_explicit_report"]),
  requiredLineage: Object.freeze([]), validatePayload: (payload) => {
    const reasons: string[] = []; targetIds(payload, reasons);
    if (!EXTERNAL_TRAINING_ACTIVITY_TYPES.includes(payload.activityType as never)) reasons.push("EXTERNAL_ACTIVITY_TYPE_INVALID");
    if (payload.durationMinutes !== null && (!finite(payload.durationMinutes) || payload.durationMinutes < 0)) {
      reasons.push("EXTERNAL_ACTIVITY_DURATION_INVALID");
    }
    if (!["low", "moderate", "high", "maximal", "unknown"].includes(String(payload.intensityDescriptor))) {
      reasons.push("EXTERNAL_ACTIVITY_INTENSITY_INVALID");
    }
    return uniqueSorted(reasons);
  }, normalizePayload: (raw) => {
    const payload = raw as ProductionExternalLoadPayload;
    const facts = [fact("external_activity_type", payload.activityType),
      fact("external_activity_intensity_descriptor", payload.intensityDescriptor),
      fact("review_confirmation", EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED)];
    if (payload.durationMinutes !== null) facts.push(fact("external_activity_duration", payload.durationMinutes,
      { unit: "minutes" }));
    return output({ owner: "external_training_load", authority: "athlete_explicit_report",
      targetIds: payload.targetIds, facts, unknowns: payload.explicitUnknowns,
      provenance: "normalizer:production-external-load-v1" });
  } });

function reviewedReportAdapter(sourceCategory: "coach_review" | "athlete_report") {
  return adapter({ adapterId: `production-${sourceCategory.replace(/_/g, "-")}`, adapterVersion: "1.0.0",
    sourceCategory, payloadSchemaId: "production-reviewed-report-payload", payloadSchemaVersion: "1.0.0",
    sourceAuthorityEligible: Object.freeze([sourceCategory === "coach_review" ? "coach_reviewed" :
      "athlete_explicit_report"]), requiredLineage: Object.freeze([]), validatePayload: (payload) => {
      const reasons: string[] = []; targetIds(payload, reasons);
      if (typeof payload.confirmed !== "boolean") reasons.push("REVIEW_CONFIRMATION_REQUIRED");
      if (!Array.isArray(payload.explicitUnknowns)) reasons.push("REVIEW_EXPLICIT_UNKNOWNS_REQUIRED");
      return uniqueSorted(reasons);
    }, normalizePayload: (raw) => {
      const payload = raw as ProductionReviewedReportPayload;
      return output({ owner: sourceCategory, authority: sourceCategory === "coach_review" ? "coach_reviewed" :
        "athlete_explicit_report", targetIds: payload.targetIds,
        facts: [fact("review_confirmation", payload.confirmed)], unknowns: payload.explicitUnknowns,
        provenance: `normalizer:production-${sourceCategory}-v1` });
    } });
}

export const PRODUCTION_OUTCOME_SOURCE_ADAPTERS = Object.freeze([
  createPerformanceAdapter("exercise_performance"),
  createPerformanceAdapter("block_performance"),
  sessionAdapter("session_completion"),
  substitutionAdapter,
  createResponseAdapter("training_response"),
  createResponseAdapter("pain_or_discomfort_report"),
  recoveryAdapter,
  sessionAdapter("adherence"),
  safetyAdapter("training_safety"),
  safetyAdapter("clinician_restriction"),
  reviewedReportAdapter("coach_review"),
  equipmentAdapter("equipment_snapshot"),
  equipmentAdapter("environment_constraint"),
  externalLoadAdapter,
  reviewedReportAdapter("athlete_report"),
] satisfies readonly ProductionOutcomeSourceAdapter[]);

export const PRODUCTION_OUTCOME_SOURCE_ADAPTER_COUNT = PRODUCTION_OUTCOME_SOURCE_ADAPTERS.length;
export const PRODUCTION_OUTCOME_SOURCE_LIVE_APP_ADAPTER_COUNT = 0 as const;

export function adapterForCategory(
  adapters: readonly ProductionOutcomeSourceAdapter[],
  sourceCategory: OutcomeSourceCategory,
): ProductionOutcomeSourceAdapter | null {
  const matches = adapters.filter((entry) => entry.sourceCategory === sourceCategory);
  return matches.length === 1 ? matches[0]! : null;
}

export function buildStructuredEnvelopePayload<T extends StructuredPayload>(payload: T): T {
  return Object.freeze(payload);
}

export function adapterSupportsAuthority(
  adapterContract: ProductionOutcomeSourceAdapter,
  authority: OutcomeSourceAuthority,
): boolean {
  return adapterContract.sourceAuthorityEligible.includes(authority);
}

export function validateAdapterEnvelopeLineage(
  adapterContract: ProductionOutcomeSourceAdapter,
  envelope: ProductionRawOutcomeSourceEnvelope,
): readonly string[] {
  return Object.freeze(adapterContract.requiredLineage.filter((key) => !envelope.lineage[key])
    .map((key) => `OUTCOME_SOURCE_LINEAGE_REQUIRED:${key}`).sort());
}
