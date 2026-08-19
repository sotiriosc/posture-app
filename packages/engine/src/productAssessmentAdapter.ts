import type {
  AssessmentConfidence,
  AssessmentPriority,
  AssessmentSignal,
  AssessmentSignalType,
  AssessmentSource,
  AssessmentState,
  BodyRegion,
  MovementRole,
} from "@praxis/training-engine-v2";

type ProductObservationRule = {
  readonly signalType: AssessmentSignalType;
  readonly source: AssessmentSource;
  readonly region: BodyRegion;
  readonly movementRole?: MovementRole;
};

const PRODUCT_OBSERVATION_RULES: Readonly<Record<string, ProductObservationRule>> = Object.freeze({
  "pose-shoulder-asymmetry": Object.freeze({
    signalType: "asymmetry_finding",
    source: "photo_assessment",
    region: "shoulder",
    movementRole: "scapular_control",
  }),
  "pose-forward-head": Object.freeze({
    signalType: "control_finding",
    source: "photo_assessment",
    region: "neck",
  }),
  "pose-hip-shift": Object.freeze({
    signalType: "asymmetry_finding",
    source: "photo_assessment",
    region: "hip",
    movementRole: "single_leg",
  }),
  "pose-knee-alignment": Object.freeze({
    signalType: "control_finding",
    source: "photo_assessment",
    region: "knee",
    movementRole: "knee_dominant",
  }),
  "pose-trunk-bias": Object.freeze({
    signalType: "control_finding",
    source: "photo_assessment",
    region: "lumbar_spine",
    movementRole: "anti_extension_core",
  }),
});

export type ProductAssessmentMappingStatus =
  | "mapped"
  | "mapped_with_unresolved_observations"
  | "absent"
  | "unsupported_shape";

export interface ProductAssessmentUnresolvedObservation {
  readonly sourceObservationId: string | null;
  readonly reason:
    | "malformed_observation"
    | "unsupported_observation_id"
    | "pain_owned_by_pain_state"
    | "goal_or_notes_not_assessment_truth"
    | "baseline_not_specific_enough";
  readonly sourceRef: string;
}

export interface ProductAssessmentMappingTrace {
  readonly sourceObservationId: string;
  readonly signalId: string;
  readonly mappingRuleId: string;
  readonly sourceRef: string;
  readonly opaqueTextConsumed: false;
}

export interface ProductAssessmentMappingResult {
  readonly status: ProductAssessmentMappingStatus;
  readonly assessment: AssessmentState;
  readonly mappingTrace: readonly ProductAssessmentMappingTrace[];
  readonly unresolvedObservations: readonly ProductAssessmentUnresolvedObservation[];
  readonly proseConsumptionCount: 0;
  readonly diagnosticInferenceCount: 0;
}

interface ProductAssessmentShadowSignal {
  readonly signalId: string;
  readonly confidence: number | null;
  readonly region: string | null;
  readonly action: string | null;
  readonly reviewState: string | null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function confidence(value: unknown): AssessmentConfidence | null {
  return value === "low" || value === "medium" || value === "high" ? value : null;
}

function priorityFor(
  observationId: string,
  priorities: readonly string[],
): AssessmentPriority {
  const index = priorities.indexOf(observationId);
  return index === 0 ? "primary" : index === 1 ? "secondary" : "context";
}

function unresolvedReason(observationId: string): ProductAssessmentUnresolvedObservation["reason"] {
  if (observationId.startsWith("pain-")) return "pain_owned_by_pain_state";
  if (observationId === "goal-posture-control" || observationId === "notes-considerations") {
    return "goal_or_notes_not_assessment_truth";
  }
  if (observationId.startsWith("baseline-")) return "baseline_not_specific_enough";
  return "unsupported_observation_id";
}

export function mapProductAssessmentReportToV2(input: {
  readonly assessment: Record<string, unknown> | null;
  readonly sourceRevision: string;
}): ProductAssessmentMappingResult {
  const emptyAssessment = Object.freeze({ signals: Object.freeze([]), historicalWeaknesses: Object.freeze([]) });
  if (!input.assessment) {
    return Object.freeze({ status: "absent", assessment: emptyAssessment,
      mappingTrace: Object.freeze([]), unresolvedObservations: Object.freeze([]),
      proseConsumptionCount: 0, diagnosticInferenceCount: 0 });
  }
  if (!Array.isArray(input.assessment.observations) || !Array.isArray(input.assessment.priorities)) {
    return Object.freeze({ status: "unsupported_shape", assessment: emptyAssessment,
      mappingTrace: Object.freeze([]), unresolvedObservations: Object.freeze([]),
      proseConsumptionCount: 0, diagnosticInferenceCount: 0 });
  }

  const priorities = input.assessment.priorities.filter(
    (entry): entry is string => typeof entry === "string",
  );
  const signals: AssessmentSignal[] = [];
  const mappingTrace: ProductAssessmentMappingTrace[] = [];
  const unresolved: ProductAssessmentUnresolvedObservation[] = [];
  input.assessment.observations.forEach((rawObservation, index) => {
    const observation = record(rawObservation);
    const observationId = typeof observation?.id === "string" && observation.id
      ? observation.id
      : null;
    if (!observation || !observationId || !confidence(observation.confidence)) {
      unresolved.push(Object.freeze({ sourceObservationId: observationId,
        reason: "malformed_observation", sourceRef: `${input.sourceRevision}:observation:${index + 1}` }));
      return;
    }
    const rule = PRODUCT_OBSERVATION_RULES[observationId];
    if (!rule) {
      unresolved.push(Object.freeze({ sourceObservationId: observationId,
        reason: unresolvedReason(observationId),
        sourceRef: `${input.sourceRevision}:observation:${observationId}` }));
      return;
    }
    const mappingRuleId = `product-assessment-report-v1:${observationId}`;
    const sourceRef = `${input.sourceRevision}:observation:${observationId}`;
    const signalId = `product-assessment:${observationId}`;
    signals.push(Object.freeze({
      id: signalId,
      type: rule.signalType,
      source: rule.source,
      confidence: confidence(observation.confidence)!,
      priority: priorityFor(observationId, priorities),
      region: rule.region,
      ...(rule.movementRole ? { movementRole: rule.movementRole } : {}),
      description: `Structured Product assessment observation ${observationId}.`,
      provenance: Object.freeze({
        sourceSystem: "product_assessment_report" as const,
        sourceObservationId: observationId,
        sourceRevision: input.sourceRevision,
        mappingRuleId,
        evidenceRefs: Object.freeze([sourceRef]),
        opaqueTextConsumed: false as const,
      }),
    }));
    mappingTrace.push(Object.freeze({ sourceObservationId: observationId, signalId,
      mappingRuleId, sourceRef, opaqueTextConsumed: false }));
  });
  signals.sort((left, right) => left.id.localeCompare(right.id));
  mappingTrace.sort((left, right) => left.signalId.localeCompare(right.signalId));
  unresolved.sort((left, right) => (left.sourceObservationId ?? "").localeCompare(
    right.sourceObservationId ?? "",
  ));
  return Object.freeze({
    status: unresolved.length ? "mapped_with_unresolved_observations" : "mapped",
    assessment: Object.freeze({ signals: Object.freeze(signals), historicalWeaknesses: Object.freeze([]) }),
    mappingTrace: Object.freeze(mappingTrace),
    unresolvedObservations: Object.freeze(unresolved),
    proseConsumptionCount: 0,
    diagnosticInferenceCount: 0,
  });
}

const numericConfidence: Readonly<Record<AssessmentConfidence, number>> = Object.freeze({
  low: 0.25,
  medium: 0.5,
  high: 0.75,
});

export function projectProductAssessmentReportForShadow(input: {
  readonly assessment: Record<string, unknown> | null;
  readonly sourceRevision: string;
}): readonly ProductAssessmentShadowSignal[] {
  const mapped = mapProductAssessmentReportToV2(input);
  return Object.freeze(mapped.assessment.signals.map((signal) => Object.freeze({
    signalId: signal.id,
    confidence: numericConfidence[signal.confidence],
    region: signal.region ?? null,
    action: signal.actionFunctions?.[0] ?? signal.movementRole ?? null,
    reviewState: signal.provenance?.mappingRuleId ?? null,
  })));
}
