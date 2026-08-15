import type { ProgressionAxis } from "../domain/progression";
import { stableId, uniqueSorted } from "../prescription/compiler/utilities";
import type {
  ProductionLongitudinalActionCandidate,
  ProductionLongitudinalAdaptationTarget,
  ProductionLongitudinalEvidenceTrajectory,
} from "./contracts";
import type {
  ProductionLongitudinalAction,
  ProductionLongitudinalActionOwner,
  ProductionLongitudinalAdaptationPolicy,
} from "./policies/policyContracts";

export function productionLongitudinalApplicationOwner(
  action: ProductionLongitudinalAction,
): ProductionLongitudinalActionOwner {
  if (["progress_prescription_axis", "regress_prescription_axis", "prescription_modification_review"]
    .includes(action)) return "prescription";
  if (["reopen_candidate_selection_for_replacement", "reopen_candidate_selection_for_bounded_rotation"]
    .includes(action)) return "candidate_intelligence_and_composer";
  if (["week_reallocation_review", "deload_review"].includes(action)) return "week";
  if (action === "phase_review") return "phase_continuity";
  if (action === "external_safety_review") return "training_safety";
  if (["owner_review_required", "no_action_insufficient_evidence"].includes(action)) return "human_owner_review";
  return "product_application";
}

export function legalProductionLongitudinalProgressionAxisCandidates(input: {
  readonly target: ProductionLongitudinalAdaptationTarget;
  readonly policy: ProductionLongitudinalAdaptationPolicy;
}): readonly ProgressionAxis[] {
  if (!input.target.doseMode) return Object.freeze([]);
  const modeAxes = new Set(input.policy.legalAxesByDoseMode[input.target.doseMode]);
  return Object.freeze([...new Set(input.target.legalProgressionAxes.filter((axis) => modeAxes.has(axis) &&
    input.target.supportedProgressionAxes.includes(axis) && input.target.availableProgressionAxes.includes(axis) &&
    (axis !== "sets" || input.target.requiredFuturePolicyReferences.some((ref) =>
      ref.includes("WEEK") || ref.includes("PRESCRIPTION"))) &&
    (axis !== "tempo" || input.target.requiredFuturePolicyReferences.some((ref) => ref.includes("TEMPO")))))]
    .sort());
}

export function selectProductionLongitudinalProgressionAxis(input: {
  readonly target: ProductionLongitudinalAdaptationTarget;
  readonly policy: ProductionLongitudinalAdaptationPolicy;
}): { readonly axis: ProgressionAxis | null; readonly conflict: boolean;
  readonly candidates: readonly ProgressionAxis[] } {
  const candidates = legalProductionLongitudinalProgressionAxisCandidates(input);
  if (!candidates.length) return Object.freeze({ axis: null, conflict: false, candidates });
  if (candidates.length === 1) return Object.freeze({ axis: candidates[0], conflict: false, candidates });
  const preferred = candidates.filter((axis) => input.target.phasePreferredProgressionAxes.includes(axis));
  if (preferred.length === 1) return Object.freeze({ axis: preferred[0], conflict: false, candidates });
  return Object.freeze({ axis: null, conflict: true, candidates });
}

function candidate(input: {
  readonly target: ProductionLongitudinalAdaptationTarget;
  readonly action: ProductionLongitudinalAction;
  readonly eligible: boolean;
  readonly axis?: ProgressionAxis | null;
  readonly required: readonly string[];
  readonly missing?: readonly string[];
  readonly conflicts?: readonly string[];
  readonly reasons: readonly string[];
}): ProductionLongitudinalActionCandidate {
  const owner = productionLongitudinalApplicationOwner(input.action);
  const burden = owner === "prescription" ? "local_prescription" as const :
    owner === "candidate_intelligence_and_composer" ? "candidate_reopen" as const :
    ["week", "phase_continuity", "training_safety", "human_owner_review"].includes(owner) ?
      "owner_review" as const : "none" as const;
  return Object.freeze({ candidateId: stableId("production-longitudinal-action-candidate", {
    targetId: input.target.targetId, action: input.action, axis: input.axis ?? null,
  }), action: input.action, targetId: input.target.targetId, targetScope: input.target.targetScope,
  eligible: input.eligible, selectedAxis: input.axis ?? null, requiredEvidence: Object.freeze([...input.required]),
  missingEvidence: Object.freeze([...(input.missing ?? [])]), actionOwner: "longitudinal_adaptation",
  applicationOwner: owner, continuityCost: burden === "local_prescription" ? "local" :
    burden === "candidate_reopen" || burden === "owner_review" ? "review_only" : "none",
  applicationBurden: burden, conflicts: Object.freeze([...(input.conflicts ?? [])]),
  reasonCodes: Object.freeze(uniqueSorted(input.reasons)),
  provenance: Object.freeze(["production-longitudinal:structured-action-candidate"]) });
}

export function generateProductionLongitudinalActionCandidates(input: {
  readonly target: ProductionLongitudinalAdaptationTarget;
  readonly trajectory: ProductionLongitudinalEvidenceTrajectory;
  readonly policy: ProductionLongitudinalAdaptationPolicy;
  readonly safetyAllowed: boolean;
  readonly progressionReviewReady: boolean;
}): readonly ProductionLongitudinalActionCandidate[] {
  const signals = new Set(input.trajectory.responseTrajectory);
  const axes = selectProductionLongitudinalProgressionAxis({ target: input.target, policy: input.policy });
  const repeated = signals.has("repeated_success") || signals.has("repeated_target_failure") ||
    signals.has("repeated_adverse_response");
  const safe = input.safetyAllowed && !signals.has("safety_block") && !signals.has("external_review_required");
  const active = input.target.active && input.target.activeNeedIds.length > 0;
  const legal = input.target.exerciseLegal;
  const progressionSignals = ["progression_ready", "target_met", "quality_met", "tolerated_response",
    "recovery_adequate", "repeated_success"] as const;
  const progressEvidence = input.progressionReviewReady && progressionSignals.every((signal) => signals.has(signal));
  const regressionAxes = input.target.legalRegressionAxes.filter((axis) =>
    input.target.supportedRegressionAxes.includes(axis));
  const regressionAxis = regressionAxes.length === 1 ? regressionAxes[0] : null;
  const modification = safe && active && legal && input.target.implicatedPrescriptionDimensions.length > 0 &&
    (signals.has("limited_response") || signals.has("adverse_response")) && !signals.has("successful_reexposure");
  const replacement = safe && active && (!legal || signals.has("repeated_adverse_response")) &&
    signals.has("replacement_consideration") && (signals.has("prescription_review_attempted") ||
      signals.has("prescription_review_exhausted") || !legal) && !signals.has("successful_reexposure");
  const rotation = safe && active && legal && input.target.rotationEligible && !input.target.productiveAnchor &&
    input.target.equivalentCandidatePoolAvailable && (signals.has("rotation_preference") || signals.has("plateau")) &&
    !signals.has("adverse_response") && !signals.has("repeated_adverse_response");
  return Object.freeze([
    candidate({ target: input.target, action: "keep_current", eligible: safe && active && legal &&
      ["productive_continuity", "stable_appropriate_challenge", "successful_reexposure"]
        .includes(input.trajectory.currentState), required: ["productive_completed_evidence", "no_blocker"],
      reasons: ["CONTINUITY_BY_DEFAULT"] }),
    candidate({ target: input.target, action: "repeat_for_confirmation", eligible: safe && active && legal &&
      ["first_or_isolated_success", "insufficient_evidence"].includes(input.trajectory.currentState),
      required: ["first_or_isolated_completed_evidence"], reasons: ["REPEAT_BEFORE_MATERIAL_CHANGE"] }),
    candidate({ target: input.target, action: "hold_current_prescription", eligible: safe && active && legal &&
      ["target_partially_met", "mixed_or_conflicting", "recovery_concern"].includes(input.trajectory.currentState),
      required: ["legal_current_prescription", "unresolved_evidence"], reasons: ["UNKNOWN_OR_CONFLICT_MEANS_HOLD"] }),
    candidate({ target: input.target, action: "prescription_modification_review", eligible: modification,
      required: ["structured_implicated_dimension", "legal_exercise", "active_need"],
      missing: modification ? [] : ["supported_local_modification_dimension"],
      reasons: ["PRESCRIPTION_REVIEW_BEFORE_REPLACEMENT"] }),
    candidate({ target: input.target, action: "progress_prescription_axis",
      eligible: safe && active && legal && progressEvidence && repeated && axes.axis !== null && !axes.conflict,
      axis: axes.axis, required: ["repeated_target_met", "quality", "tolerance", "recovery", "readiness", "legal_axis"],
      missing: axes.axis ? [] : ["single_policy_resolved_legal_progression_axis"],
      conflicts: axes.conflict ? ["LONGITUDINAL_ACTION_CONFLICT"] : [],
      reasons: ["ONE_PRIMARY_PROGRESSION_AXIS", "EXACT_FUTURE_DOSE_DEFERRED"] }),
    candidate({ target: input.target, action: "regress_prescription_axis",
      eligible: safe && active && legal && repeated && regressionAxis !== null &&
        (signals.has("repeated_target_failure") || signals.has("repeated_adverse_response")),
      axis: regressionAxis, required: ["repeated_local_failure_or_adverse_evidence", "legal_regression_axis"],
      missing: regressionAxis ? [] : ["single_legal_regression_axis"], reasons: ["LOCAL_REGRESSION_ONLY"] }),
    candidate({ target: input.target, action: "reopen_candidate_selection_for_replacement", eligible: replacement,
      required: ["repeated_materially_different_adverse_evidence", "prescription_review", "receiver_consideration"],
      reasons: ["CANDIDATE_SELECTION_REOPENED_IDENTITY_NOT_SELECTED"] }),
    candidate({ target: input.target, action: "reopen_candidate_selection_for_bounded_rotation", eligible: rotation,
      required: ["rotation_eligible_non_anchor", "explicit_preference_or_plateau", "candidate_pool"],
      reasons: ["NO_NOVELTY_QUOTA", "BOUNDED_ROTATION_REVIEW_ONLY"] }),
    candidate({ target: input.target, action: "week_reallocation_review",
      eligible: safe && signals.has("week_reallocation_aggregate"), required: ["reviewed_completed_week_aggregate"],
      reasons: ["WEEK_OWNER_REQUIRED"] }),
    candidate({ target: input.target, action: "deload_review", eligible: safe && signals.has("deload_review_aggregate"),
      required: ["reviewed_multi_session_aggregate"], reasons: ["WEEK_OWNER_REQUIRED"] }),
    candidate({ target: input.target, action: "phase_review", eligible: safe && signals.has("phase_review_requested"),
      required: ["typed_phase_review_evidence"], reasons: ["GATE_15_REEVALUATION_REQUIRED"] }),
    candidate({ target: input.target, action: "external_safety_review", eligible: !safe,
      required: ["training_safety_external_review_authority"], reasons: ["TRAINING_SAFETY_PRECEDES_ADAPTATION"] }),
    candidate({ target: input.target, action: "owner_review_required",
      eligible: axes.conflict || regressionAxes.length > 1, required: ["owner_resolution"],
      conflicts: axes.conflict || regressionAxes.length > 1 ? ["LONGITUDINAL_ACTION_CONFLICT"] : [],
      reasons: ["EQUAL_AXIS_SUPPORT_REQUIRES_OWNER"] }),
    candidate({ target: input.target, action: "no_action_insufficient_evidence",
      eligible: input.trajectory.currentState === "unknown" || !active,
      required: ["applicable_completed_evidence"], reasons: ["INSUFFICIENT_EVIDENCE"] }),
  ]);
}

export function selectPrimaryProductionLongitudinalAction(input: {
  readonly candidates: readonly ProductionLongitudinalActionCandidate[];
  readonly policy: ProductionLongitudinalAdaptationPolicy;
}): ProductionLongitudinalActionCandidate | null {
  const eligible = input.candidates.filter((candidate) => candidate.eligible);
  for (const action of input.policy.actionPriority) {
    const selected = eligible.find((candidate) => candidate.action === action);
    if (selected) return selected;
  }
  return null;
}
