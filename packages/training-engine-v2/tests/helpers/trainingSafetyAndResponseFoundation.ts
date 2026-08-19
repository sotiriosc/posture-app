import { createHash } from "node:crypto";
import {
  REPORTED_SYMPTOM_CHANGES,
  TRAINING_RESPONSE_CONSEQUENCES,
  TRAINING_RESPONSE_ONSETS,
  TRAINING_RESPONSE_PERSISTENCE,
  TRAINING_TOLERANCE_RESULTS,
  buildTrainingReadinessTrace,
  buildTrainingResponseLedger,
  type TrainingResponseObservation,
  type TrainingSafetySignal,
} from "../../src";
import {
  buildPhasePolicyContinuityDisruptions,
  buildPhaseSuitabilityCalibrationData,
} from "./phaseSuitabilityCalibrationLab";

export const TRAINING_SAFETY_AND_RESPONSE_FIXED_AS_OF =
  "2026-08-12T23:00:00.000Z";

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function signal(input: {
  readonly id: string;
  readonly level: TrainingSafetySignal["requestedReviewLevel"];
  readonly resolved?: boolean;
}): TrainingSafetySignal {
  return {
    signalId: input.id,
    requestedReviewLevel: input.level,
    authority: {
      source: "clinician",
      sourceRef: `fixture:${input.id}`,
      evidenceBasis: ["Explicit synthetic authority for deterministic contract review."],
      reportedBy: "contract-reviewer",
      reportedAt: "2026-08-12T12:00:00.000Z",
    },
    resolution: input.resolved
      ? {
          state: "externally_resolved",
          resolvedAt: "2026-08-11T12:00:00.000Z",
          resolvedBy: "contract-reviewer",
          sourceRef: `fixture:${input.id}:resolution`,
          evidenceBasis: ["Explicit synthetic external resolution."],
        }
      : { state: "unresolved" },
    notes: [],
  };
}

function observation(input: {
  readonly id: string;
  readonly prescriptionId: string;
  readonly occurredAt: string;
  readonly tolerance: TrainingResponseObservation["tolerance"];
  readonly symptomChange: TrainingResponseObservation["symptomChange"];
  readonly exerciseId?: string;
}): TrainingResponseObservation {
  return {
    observationId: input.id,
    occurredAt: input.occurredAt,
    exposure: {
      realizationStatus: "linked_to_prescription_only",
      exerciseId: input.exerciseId ?? "dumbbell-romanian-deadlift",
      prescriptionId: input.prescriptionId,
      sourceExposureEventId: `exposure:${input.prescriptionId}`,
      realizedStressExposureIds: [`stress:${input.id}`],
    },
    tolerance: input.tolerance,
    symptomChange: input.symptomChange,
    onset: input.tolerance === "tolerated" ? "not_applicable" : "during_exposure",
    persistence:
      input.tolerance === "tolerated"
        ? "not_applicable"
        : "resolved_before_next_relevant_exposure",
    consequence: input.tolerance === "tolerated" ? "completed" : "modified",
    reportedLocations: [{ region: "lumbar_spine", side: "unknown" }],
    provenance: {
      source: "athlete_report",
      sourceRef: `fixture:${input.id}`,
      evidenceBasis: ["Synthetic structured response for deterministic contract review."],
      reportedBy: "athlete-fixture",
      recordedAt: input.occurredAt,
    },
    notes: [],
  };
}

const PHASE_POLICY_IDS = [
  "A_CURRENT",
  "B_ANNOTATION_ONLY",
  "C_NO_PHASE_COMPONENT",
  "D_WEIGHT_05",
  "E_GENTLE_GAP",
  "E_MODERATE_GAP",
] as const;

export interface PhaseCalibrationConsequenceRow {
  readonly policyId: string;
  readonly categorySpacing: string;
  readonly phaseFamilyWeight: string;
  readonly winnerChanges: number;
  readonly closeOrderChanges: number;
  readonly continuityDisruptions: number;
  readonly unknownEvidenceBehavior: string;
  readonly acceptedPoorBehavior: string;
  readonly representativePhaseEffects: string;
}

function phaseConsequenceRows(): readonly PhaseCalibrationConsequenceRow[] {
  const data = buildPhaseSuitabilityCalibrationData();
  const continuityDisruptions = buildPhasePolicyContinuityDisruptions();
  return PHASE_POLICY_IDS.map((policyId) => {
    const policy = data.policies.find((candidate) => candidate.id === policyId);
    const summary = data.policySummaries.find((candidate) => candidate.policyId === policyId);
    if (!policy || !summary) throw new Error(`Missing phase policy ${policyId}.`);
    const changes = data.winnerChanges.filter((candidate) => candidate.policyId === policyId);
    const representativePhaseEffects = changes.length === 0
      ? "No winner changes from current control."
      : (["phase_1", "phase_2", "phase_3"] as const)
          .map((phaseId) => {
            const phaseChanges = changes.filter((candidate) => candidate.phaseId === phaseId);
            return phaseChanges.length === 0
              ? `${phaseId}: none`
              : `${phaseId}: ${phaseChanges
                  .slice(0, 3)
                  .map((candidate) => `${candidate.currentWinner}->${candidate.experimentalWinner}`)
                  .join(", ")}`;
          })
          .join("; ");
    const unspecified = policy.categoryMap?.unspecified;
    const fallback = unspecified === undefined
      ? "phase component omitted"
      : `legacy lab fallback=${unspecified}`;
    return {
      policyId,
      categorySpacing: policy.categoryMap
        ? `${policy.categoryMap.excellent}/${policy.categoryMap.good}/${policy.categoryMap.possible}/${policy.categoryMap.unspecified}`
        : "none",
      phaseFamilyWeight: policy.phaseWeight === null ? "omitted" : String(policy.phaseWeight),
      winnerChanges: summary.winnerChanges,
      closeOrderChanges: summary.rankChanges,
      continuityDisruptions: continuityDisruptions[policyId] ?? 0,
      unknownEvidenceBehavior: `${fallback}; implemented contextual unknown/no-match remains neutral and unscored`,
      acceptedPoorBehavior: `${fallback}; accepted contextual poor remains distinct but production policy is pending`,
      representativePhaseEffects,
    };
  });
}

export function buildTrainingSafetyAndResponseFoundationData() {
  const safetyCases = {
    none: buildTrainingReadinessTrace({}),
    review: buildTrainingReadinessTrace({
      trainingSafety: {
        signals: [signal({ id: "review", level: "review_required_before_ordinary_training" })],
      },
    }),
    urgent: buildTrainingReadinessTrace({
      trainingSafety: {
        signals: [signal({ id: "urgent", level: "urgent_external_review_required" })],
      },
    }),
    resolved: buildTrainingReadinessTrace({
      trainingSafety: {
        signals: [signal({ id: "resolved", level: "review_required_before_ordinary_training", resolved: true })],
      },
    }),
    legacyExplicitUrgent: buildTrainingReadinessTrace({
      acuteSeverePain: [{
        kind: "acute_severe_pain",
        id: "legacy-explicit-urgent",
        region: "lumbar_spine",
        severity0To10: 7,
        stressTags: [],
        invalidatesTrainingRoles: [],
        urgentReviewRecommended: true,
        description: "Non-executable fixture prose.",
      }],
    }),
  };
  const responseHistory = {
    observations: [
      observation({
        id: "rdl-limited-first",
        prescriptionId: "rdl-prescription-1",
        occurredAt: "2026-08-01T12:00:00.000Z",
        tolerance: "limited",
        symptomChange: "worsened",
      }),
      observation({
        id: "rdl-tolerated-later",
        prescriptionId: "rdl-prescription-2",
        occurredAt: "2026-08-10T12:00:00.000Z",
        tolerance: "tolerated",
        symptomChange: "unchanged",
      }),
    ],
  };
  const responseLedger = buildTrainingResponseLedger({
    history: responseHistory,
    asOf: TRAINING_SAFETY_AND_RESPONSE_FIXED_AS_OF,
    exerciseId: "dumbbell-romanian-deadlift",
  });
  const phaseCalibrationConsequences = phaseConsequenceRows();
  const safetyFingerprint = hash(safetyCases);
  const responseFingerprint = hash({
    vocabulary: {
      tolerance: TRAINING_TOLERANCE_RESULTS,
      symptomChange: REPORTED_SYMPTOM_CHANGES,
      onset: TRAINING_RESPONSE_ONSETS,
      persistence: TRAINING_RESPONSE_PERSISTENCE,
      consequence: TRAINING_RESPONSE_CONSEQUENCES,
    },
    responseLedger,
  });

  return {
    fixedAsOf: TRAINING_SAFETY_AND_RESPONSE_FIXED_AS_OF,
    classification: "TRAINING_SAFETY_AND_RESPONSE_FOUNDATION_IMPLEMENTED" as const,
    safetyCases,
    responseLedger,
    phaseCalibrationConsequences,
    safetyFingerprint,
    responseFingerprint,
    combinedFingerprint: hash({ safetyFingerprint, responseFingerprint }),
  };
}
