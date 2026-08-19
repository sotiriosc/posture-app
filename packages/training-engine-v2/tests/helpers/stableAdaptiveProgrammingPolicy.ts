import { createHash } from "node:crypto";
import {
  CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY,
  buildTrainingResponseReceiverTrace,
  type ExercisePrescription,
  type TrainingResponseHistory,
  type TrainingResponseObservation,
} from "../../src";
import { buildContextualPhaseProductionCurationData } from "./contextualPhaseProductionCuration";
import { buildLowBackRelevantRowStressCurationData } from "./lowBackRelevantRowStressCuration";

export const STABLE_ADAPTIVE_DOCTRINE = [
  "SELECT_STRONG_BASE",
  "RETAIN_WHAT_IS_WORKING",
  "PROGRESS_PRESCRIPTION",
  "MAKE_SMALL_PURPOSEFUL_ADJUSTMENTS",
  "REPLACE_ONLY_WHEN_JUSTIFIED",
] as const;

export const FUTURE_CONTINUITY_HIERARCHY = [
  "KEEP_PRODUCTIVE_LEGAL_EXERCISE",
  "PROGRESS_OR_MODIFY_PRESCRIPTION",
  "TEMPORARILY_MODIFY_REALIZATION",
  "PURPOSEFUL_TEMPORARY_SUBSTITUTION",
  "REPLACE_WHEN_MEANINGFUL_EVIDENCE_JUSTIFIES_RECONSIDERATION",
] as const;

export const ANTI_CHURN_INVARIANTS = [
  "MORE_EXERCISE_KNOWLEDGE_IMPROVES_SELECTION_NOT_EXERCISE_COUNT",
  "CLOSE_SCORE_DOES_NOT_DISPLACE_PRODUCTIVE_ANCHOR",
  "LESS_TIME_REMOVES_REDUNDANCY_BEFORE_ANCHORS",
  "NEW_PHASE_DOES_NOT_REPLACE_EVERY_EXERCISE",
  "RESPONSE_OBSERVATION_NEVER_AUTOMATICALLY_REPLACES_EXERCISE",
] as const;

const AS_OF = "2026-08-12T23:00:00.000Z";

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function prescription(input: {
  readonly id: string;
  readonly load: number;
  readonly support: "none" | "partial";
  readonly range: "full_available" | "partial";
}): ExercisePrescription {
  return {
    prescriptionId: input.id,
    sourceExposureEventId: `exposure-${input.id}`,
    exerciseId: "dumbbell-romanian-deadlift",
    phaseId: "phase_2",
    createdAt: "2026-08-01T10:00:00.000Z",
    dose: {
      mode: "repetition_sets",
      sets: { kind: "exact", value: 3, unit: "count" },
      repetitions: { kind: "exact", value: 8, unit: "count" },
      load: {
        kind: "external_load",
        target: { kind: "exact", value: input.load, unit: "kg" },
        application: "total",
      },
      range: input.range === "full_available"
        ? { kind: "full_available" }
        : { kind: "intentionally_partial", description: "Reduced range fixture." },
      support: input.support === "none"
        ? { level: "none" }
        : { level: "partial", surface: "bench" },
    },
    executionStandard: {
      alignmentPriorityIds: [],
      assessmentPriorityIds: [],
      criteria: [],
      exerciseMechanicsIntent: "Stable-adaptive response receiver fixture.",
      painResponseRequirementIds: [],
      provenance: { source: "synthetic_contract_fixture", sourceRef: `fixture:${input.id}` },
    },
    rationale: [],
    intendedProgressionAxes: ["load", "range"],
    provenance: { source: "synthetic_contract_fixture", sourceRef: `fixture:${input.id}` },
  };
}

function observation(input: {
  readonly id: string;
  readonly occurredAt: string;
  readonly prescription: ExercisePrescription;
  readonly tolerance: TrainingResponseObservation["tolerance"];
  readonly symptomChange: TrainingResponseObservation["symptomChange"];
  readonly notes?: readonly string[];
}): TrainingResponseObservation {
  const adverse = input.tolerance !== "tolerated" || input.symptomChange === "worsened";
  return {
    observationId: input.id,
    occurredAt: input.occurredAt,
    exposure: {
      realizationStatus: "linked_to_prescription_only",
      exerciseId: input.prescription.exerciseId,
      prescriptionId: input.prescription.prescriptionId,
      sourceExposureEventId: input.prescription.sourceExposureEventId,
      realizedStressExposureIds: [`stress-${input.id}`],
    },
    tolerance: input.tolerance,
    symptomChange: input.symptomChange,
    onset: adverse ? "during_exposure" : "not_applicable",
    persistence: adverse
      ? "resolved_before_next_relevant_exposure"
      : "not_applicable",
    consequence: input.tolerance === "not_tolerated"
      ? "stopped_exercise"
      : input.tolerance === "limited"
        ? "modified"
        : "completed",
    reportedLocations: [{ region: "lumbar_spine", side: "unknown" }],
    provenance: {
      source: "athlete_report",
      sourceRef: `athlete-report:${input.id}`,
      evidenceBasis: ["Structured factual response for deterministic policy fixture."],
      reportedBy: "athlete-fixture",
      recordedAt: input.occurredAt,
    },
    notes: input.notes ?? [],
  };
}

export function buildStableAdaptiveResponseFixture(): {
  readonly unsupportedHighDose: ExercisePrescription;
  readonly supportedReducedDose: ExercisePrescription;
  readonly adverse: TrainingResponseObservation;
  readonly supportedTolerated: TrainingResponseObservation;
  readonly laterUnsupportedTolerated: TrainingResponseObservation;
  readonly history: TrainingResponseHistory;
} {
  const unsupportedHighDose = prescription({
    id: "rdl-unsupported-high",
    load: 40,
    support: "none",
    range: "full_available",
  });
  const supportedReducedDose = prescription({
    id: "rdl-supported-reduced",
    load: 20,
    support: "partial",
    range: "partial",
  });
  const adverse = observation({
    id: "rdl-adverse-high",
    occurredAt: "2026-08-01T12:00:00.000Z",
    prescription: unsupportedHighDose,
    tolerance: "not_tolerated",
    symptomChange: "worsened",
  });
  const supportedTolerated = observation({
    id: "rdl-supported-tolerated",
    occurredAt: "2026-08-05T12:00:00.000Z",
    prescription: supportedReducedDose,
    tolerance: "tolerated",
    symptomChange: "unchanged",
  });
  const laterUnsupportedTolerated = observation({
    id: "rdl-later-unsupported-tolerated",
    occurredAt: "2026-08-10T12:00:00.000Z",
    prescription: unsupportedHighDose,
    tolerance: "tolerated",
    symptomChange: "unchanged",
  });
  return {
    unsupportedHighDose,
    supportedReducedDose,
    adverse,
    supportedTolerated,
    laterUnsupportedTolerated,
    history: { observations: [adverse, supportedTolerated, laterUnsupportedTolerated] },
  };
}

export interface StableAdaptiveProgrammingPolicyData {
  readonly doctrine: typeof STABLE_ADAPTIVE_DOCTRINE;
  readonly continuityHierarchy: typeof FUTURE_CONTINUITY_HIERARCHY;
  readonly antiChurnInvariants: typeof ANTI_CHURN_INVARIANTS;
  readonly responseReceiverFingerprint: string;
  readonly policyFingerprint: string;
  readonly stressFingerprint: string;
  readonly combinedFingerprint: string;
}

export function buildStableAdaptiveProgrammingPolicyData(): StableAdaptiveProgrammingPolicyData {
  const fixture = buildStableAdaptiveResponseFixture();
  const prescriptions = [fixture.unsupportedHighDose, fixture.supportedReducedDose];
  const adverseTrace = buildTrainingResponseReceiverTrace({
    history: { observations: [fixture.adverse] },
    asOf: AS_OF,
    currentPrescription: fixture.unsupportedHighDose,
    prescriptions,
  });
  const supportedTrace = buildTrainingResponseReceiverTrace({
    history: { observations: [fixture.adverse, fixture.supportedTolerated] },
    asOf: AS_OF,
    currentPrescription: fixture.supportedReducedDose,
    prescriptions,
  });
  const reExposureTrace = buildTrainingResponseReceiverTrace({
    history: fixture.history,
    asOf: AS_OF,
    currentPrescription: fixture.unsupportedHighDose,
    prescriptions,
  });
  const phaseCuration = buildContextualPhaseProductionCurationData();
  const stressCuration = buildLowBackRelevantRowStressCurationData();
  const responseReceiverFingerprint = hash({ adverseTrace, supportedTrace, reExposureTrace });
  const policyFingerprint = hash({
    doctrine: STABLE_ADAPTIVE_DOCTRINE,
    continuityHierarchy: FUTURE_CONTINUITY_HIERARCHY,
    antiChurnInvariants: ANTI_CHURN_INVARIANTS,
    phasePolicy: CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY,
    phaseCurationFingerprint: phaseCuration.fingerprint,
  });
  const stressFingerprint = stressCuration.fingerprint;
  const combinedFingerprint = hash({
    responseReceiverFingerprint,
    policyFingerprint,
    stressFingerprint,
  });
  return {
    doctrine: STABLE_ADAPTIVE_DOCTRINE,
    continuityHierarchy: FUTURE_CONTINUITY_HIERARCHY,
    antiChurnInvariants: ANTI_CHURN_INVARIANTS,
    responseReceiverFingerprint,
    policyFingerprint,
    stressFingerprint,
    combinedFingerprint,
  };
}
