import type {
  ProgressionEvidence,
  ProgressionReadinessTrace,
} from "./progressionEvidence";
import type { TrainingResponseReceiverTrace } from "../trainingResponseReceiver";

export function buildProgressionReadinessTrace(
  evidence: ProgressionEvidence,
  trainingResponseReceiver?: TrainingResponseReceiverTrace,
): ProgressionReadinessTrace {
  const blockers = progressionReadinessBlockers(evidence, trainingResponseReceiver);
  const classification = classifyProgressionReadiness(evidence, blockers);

  return {
    prescriptionId: evidence.prescriptionId,
    exerciseId: evidence.exerciseId,
    classification,
    blockers,
    evidence,
    ...(trainingResponseReceiver ? { trainingResponseReceiver } : {}),
    selectedAxis: null,
    selectedTransition: null,
    automaticProgressionDecision: false,
  };
}

function progressionReadinessBlockers(
  evidence: ProgressionEvidence,
  trainingResponseReceiver?: TrainingResponseReceiverTrace,
): readonly string[] {
  const blockers: string[] = [];

  if (evidence.doseEvidence === "target_not_met") {
    blockers.push("dose_target_not_met");
  } else if (evidence.doseEvidence === "target_partially_met") {
    blockers.push("dose_target_partially_met");
  } else if (evidence.doseEvidence === "unknown") {
    blockers.push("dose_evidence_unknown");
  }

  if (
    evidence.executionQualityEvidence ===
    "one_or_more_required_criteria_not_met"
  ) {
    blockers.push("required_execution_quality_not_met");
  } else if (
    evidence.executionQualityEvidence === "criteria_not_sufficiently_observed"
  ) {
    blockers.push("execution_quality_not_sufficiently_observed");
  }

  const currentResponseOwnsPrescriptionRequirement = Boolean(
    trainingResponseReceiver &&
      (trainingResponseReceiver.classifications.includes(
        "PROGRESSION_REVIEW_PERMITTED",
      ) ||
        trainingResponseReceiver.classifications.includes(
          "PRESCRIPTION_MODIFICATION_REVIEW_REQUIRED",
        )),
  );
  if (
    evidence.painResponseEvidence !== "no_unresolved_response_requirement" &&
    !(
      evidence.painResponseEvidence === "prescription_response_unresolved" &&
      currentResponseOwnsPrescriptionRequirement
    )
  ) {
    blockers.push(`pain_response_${evidence.painResponseEvidence}`);
  }

  if (trainingResponseReceiver) {
    if (
      trainingResponseReceiver.classifications.includes(
        "PRESCRIPTION_MODIFICATION_REVIEW_REQUIRED",
      )
    ) {
      const aggravated = trainingResponseReceiver.latestExactResponse &&
        (trainingResponseReceiver.latestExactResponse.observation.tolerance ===
          "not_tolerated" ||
          trainingResponseReceiver.latestExactResponse.observation.symptomChange ===
            "worsened" ||
          trainingResponseReceiver.latestExactResponse.observation.consequence ===
            "stopped_exercise" ||
          trainingResponseReceiver.latestExactResponse.observation.consequence ===
            "stopped_session");
      blockers.push(
        aggravated
          ? "training_response_regression_or_review_required"
          : "training_response_hold_monitor_current_prescription",
      );
    } else if (
      trainingResponseReceiver.classifications.includes(
        "INSUFFICIENT_OR_MIXED_EVIDENCE",
      )
    ) {
      blockers.push("training_response_insufficient_or_mixed_evidence");
    } else if (
      trainingResponseReceiver.classifications.includes(
        "NO_APPLICABLE_RESPONSE_EVIDENCE",
      )
    ) {
      blockers.push("training_response_no_applicable_evidence");
    }
  }

  if (evidence.recoveryEvidence === "recovery_concern") {
    blockers.push("recovery_concern");
  } else if (
    evidence.recoveryEvidence === "insufficient_observation" ||
    evidence.recoveryEvidence === "unknown"
  ) {
    blockers.push(`recovery_${evidence.recoveryEvidence}`);
  }

  if (
    evidence.continuityRunwayEvidence.includes("failed_progression_evidence")
  ) {
    blockers.push("failed_progression_evidence");
  }
  if (
    evidence.continuityRunwayEvidence.includes(
      "replacement_consideration_evidence",
    )
  ) {
    blockers.push("replacement_consideration_evidence");
  }
  if (evidence.continuityRunwayEvidence.includes("plateau_evidence")) {
    blockers.push("plateau_evidence");
  }
  if (evidence.continuityRunwayEvidence.includes("unknown")) {
    blockers.push("continuity_runway_unknown");
  }
  if (
    !evidence.continuityRunwayEvidence.includes(
      "same_exercise_remains_productive",
    )
  ) {
    blockers.push("same_exercise_productivity_evidence_missing");
  }
  if (
    !evidence.continuityRunwayEvidence.includes(
      "progression_axes_remain_available",
    )
  ) {
    blockers.push("progression_axes_runway_evidence_missing");
  }

  if (evidence.repeatedEvidence !== "repeated_success") {
    blockers.push(`repeated_evidence_${evidence.repeatedEvidence}`);
  }

  return blockers;
}

function classifyProgressionReadiness(
  evidence: ProgressionEvidence,
  blockers: readonly string[],
): ProgressionReadinessTrace["classification"] {
  if (
    blockers.some((blocker) =>
      [
        "required_execution_quality_not_met",
        "pain_response_candidate_review_required",
        "pain_response_prescription_response_unresolved",
        "pain_response_role_substitution_unresolved",
        "pain_response_urgent_external_review_signal",
        "recovery_concern",
        "failed_progression_evidence",
        "replacement_consideration_evidence",
        "training_response_regression_or_review_required",
      ].includes(blocker),
    )
  ) {
    return "REGRESSION_OR_REVIEW_REQUIRED";
  }

  if (
    blockers.some((blocker) =>
      [
        "dose_evidence_unknown",
        "execution_quality_not_sufficiently_observed",
        "pain_response_unknown",
        "recovery_insufficient_observation",
        "recovery_unknown",
        "continuity_runway_unknown",
        "same_exercise_productivity_evidence_missing",
        "progression_axes_runway_evidence_missing",
        "repeated_evidence_isolated_success",
        "repeated_evidence_insufficient_history",
        "repeated_evidence_mixed_response",
        "training_response_insufficient_or_mixed_evidence",
        "training_response_no_applicable_evidence",
      ].includes(blocker),
    )
  ) {
    return "INSUFFICIENT_EVIDENCE";
  }

  if (blockers.length > 0) {
    return "HOLD_CURRENT_PRESCRIPTION";
  }

  if (
    evidence.doseEvidence === "target_met" &&
    evidence.executionQualityEvidence === "all_required_criteria_met" &&
    (evidence.painResponseEvidence === "no_unresolved_response_requirement" ||
      !blockers.some((blocker) => blocker.startsWith("pain_response_"))) &&
    evidence.recoveryEvidence === "recovered_as_expected" &&
    evidence.continuityRunwayEvidence.includes(
      "same_exercise_remains_productive",
    ) &&
    evidence.continuityRunwayEvidence.includes(
      "progression_axes_remain_available",
    ) &&
    evidence.repeatedEvidence === "repeated_success"
  ) {
    return "READY_FOR_PROGRESSION_REVIEW";
  }

  return "INSUFFICIENT_EVIDENCE";
}
