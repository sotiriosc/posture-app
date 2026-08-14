import type { ExerciseDoseMode } from "../../src/prescription/dose";
import type { ProgressionAxis } from "../../src/domain/progression";
import type {
  LongitudinalAction,
  LongitudinalActionCandidate,
  LongitudinalAdaptationTarget,
  LongitudinalDetailedClassification,
  LongitudinalEvidenceTrajectory,
  LongitudinalOutcomeSourceSnapshot,
} from "../../src/longitudinalAdaptation/designContracts";
import { digest } from "./signatures";

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return Object.freeze([...new Set(values)].sort());
}

const axes = (...values: ProgressionAxis[]): readonly ProgressionAxis[] => Object.freeze(values);

const MODE_AXES: Readonly<Record<ExerciseDoseMode, readonly ProgressionAxis[]>> = Object.freeze({
  repetition_sets: axes("load", "reps", "sets", "range", "tempo", "support_reduction", "lever",
    "effort", "rest_reduction", "stability", "coordination", "complexity"),
  timed_hold: axes("duration", "sets", "load", "range", "support_reduction", "lever", "effort"),
  breath_cycles: axes("breath_cycles", "sets", "range", "support_reduction", "coordination"),
  distance_carry: axes("distance", "trips", "load", "effort", "rest_reduction"),
  timed_carry: axes("duration", "trips", "load", "effort", "rest_reduction"),
  step_march: axes("steps", "duration", "sets", "load", "coordination", "stability"),
  step_sets: axes("steps", "sets", "load", "range", "support_reduction", "coordination"),
});

export function legalProgressionAxisCandidates(target: LongitudinalAdaptationTarget): readonly ProgressionAxis[] {
  if (!target.doseMode) return Object.freeze([]);
  const modeAxes = new Set(MODE_AXES[target.doseMode]);
  return unique(target.legalProgressionAxes.filter((axis) => modeAxes.has(axis) &&
    target.supportedProgressionAxes.includes(axis) && target.availableProgressionAxes.includes(axis) &&
    (axis !== "sets" || target.requiredFuturePolicyRefs.some((ref) => ref.includes("WEEK") ||
      ref.includes("PRESCRIPTION"))) &&
    (axis !== "tempo" || target.requiredFuturePolicyRefs.some((ref) => ref.includes("TEMPO")))));
}

export function selectProgressionAxis(target: LongitudinalAdaptationTarget): {
  readonly axis: ProgressionAxis | null; readonly conflict: boolean; readonly candidates: readonly ProgressionAxis[];
} {
  const candidates = legalProgressionAxisCandidates(target);
  if (candidates.length === 0) return Object.freeze({ axis: null, conflict: false, candidates });
  if (candidates.length === 1) return Object.freeze({ axis: candidates[0], conflict: false, candidates });
  const preferred = candidates.filter((axis) => target.phasePreferredProgressionAxes.includes(axis));
  if (preferred.length === 1) return Object.freeze({ axis: preferred[0], conflict: false, candidates });
  return Object.freeze({ axis: null, conflict: true, candidates });
}

function signalSet(trajectory: LongitudinalEvidenceTrajectory): ReadonlySet<string> {
  return new Set(trajectory.responseTrajectory);
}

function applicationOwner(action: LongitudinalAction): LongitudinalActionCandidate["applicationOwner"] {
  if (["progress_prescription_axis", "regress_prescription_axis", "prescription_modification_review"]
    .includes(action)) return "prescription_compiler";
  if (["reopen_candidate_selection_for_replacement", "reopen_candidate_selection_for_bounded_rotation"]
    .includes(action)) return "candidate_intelligence_and_composer";
  if (["week_reallocation_review", "deload_review"].includes(action)) return "week_owner";
  if (action === "phase_review") return "phase_continuity_owner";
  if (action === "external_safety_review") return "training_safety_owner";
  if (["owner_review_required", "no_action_insufficient_evidence"].includes(action)) return "human_owner_review";
  return "product_application";
}

function candidate(input: {
  readonly action: LongitudinalAction; readonly target: LongitudinalAdaptationTarget;
  readonly eligible: boolean; readonly axis?: ProgressionAxis | null; readonly required: readonly string[];
  readonly missing?: readonly string[]; readonly conflicts?: readonly string[]; readonly reasons: readonly string[];
}): LongitudinalActionCandidate {
  const burden = ["progress_prescription_axis", "regress_prescription_axis", "prescription_modification_review"]
    .includes(input.action) ? "local_prescription" as const :
    ["reopen_candidate_selection_for_replacement", "reopen_candidate_selection_for_bounded_rotation"]
      .includes(input.action) ? "candidate_reopen" as const :
      ["week_reallocation_review", "deload_review", "phase_review", "external_safety_review",
        "owner_review_required"].includes(input.action) ? "owner_review" as const : "none" as const;
  const continuityCost = burden === "local_prescription" ? "local" as const :
    burden === "candidate_reopen" || burden === "owner_review" ? "review_only" as const : "none" as const;
  return Object.freeze({ candidateId: digest({ action: input.action, targetId: input.target.targetId,
    axis: input.axis ?? null }), action: input.action, targetId: input.target.targetId,
    targetScope: input.target.targetScope, eligible: input.eligible, selectedAxis: input.axis ?? null,
    requiredEvidence: Object.freeze([...input.required]), missingEvidence: Object.freeze([...(input.missing ?? [])]),
    actionOwner: "longitudinal_adaptation_owner", applicationOwner: applicationOwner(input.action),
    continuityCost, applicationBurden: burden, conflicts: Object.freeze([...(input.conflicts ?? [])]),
    reasonCodes: unique(input.reasons), provenance: Object.freeze(["Gate16:structured-action-candidate"]) });
}

export function generateLongitudinalActionCandidates(input: {
  readonly target: LongitudinalAdaptationTarget;
  readonly trajectory: LongitudinalEvidenceTrajectory;
  readonly outcomeSnapshot: LongitudinalOutcomeSourceSnapshot;
}): readonly LongitudinalActionCandidate[] {
  const signals = signalSet(input.trajectory);
  const axes = selectProgressionAxis(input.target);
  const repeated = signals.has("repeated_success") || signals.has("repeated_target_failure") ||
    signals.has("repeated_adverse_response");
  const safe = !signals.has("safety_block") && !signals.has("external_review_required");
  const active = input.target.active && input.target.activeNeedIds.length > 0;
  const legal = input.target.exerciseLegal;
  const progressEvidence = ["progression_ready", "target_met", "quality_met", "tolerated_response",
    "recovery_adequate", "repeated_success"].every((signal) => signals.has(signal));
  const regressionAxis = input.target.legalRegressionAxes.find((axis) =>
    input.target.supportedRegressionAxes.includes(axis)) ?? null;
  const modification = safe && active && legal && input.target.implicatedPrescriptionDimensions.length > 0 &&
    (signals.has("limited_response") || signals.has("adverse_response")) &&
    !signals.has("successful_reexposure");
  const replacement = safe && active && (!legal || signals.has("repeated_adverse_response")) &&
    signals.has("replacement_consideration") &&
    (signals.has("prescription_review_attempted") || signals.has("prescription_review_exhausted") || !legal) &&
    !signals.has("successful_reexposure");
  const rotation = safe && active && legal && input.target.rotationEligible && !input.target.productiveAnchor &&
    input.target.equivalentCandidatePoolAvailable &&
    (signals.has("rotation_preference") || signals.has("plateau")) && !signals.has("adverse_response") &&
    !signals.has("repeated_adverse_response");
  const rows: LongitudinalActionCandidate[] = [
    candidate({ action: "keep_current", target: input.target,
      eligible: safe && active && legal && ["productive_continuity", "stable_appropriate_challenge",
        "successful_reexposure"].includes(input.trajectory.currentState),
      required: ["productive completed evidence", "no blocker"], reasons: ["CONTINUITY_BY_DEFAULT"] }),
    candidate({ action: "repeat_for_confirmation", target: input.target,
      eligible: safe && active && legal && ["first_or_isolated_success", "insufficient_evidence"]
        .includes(input.trajectory.currentState),
      required: ["first or isolated completed evidence"], reasons: ["REPEAT_BEFORE_MATERIAL_CHANGE"] }),
    candidate({ action: "hold_current_prescription", target: input.target,
      eligible: safe && active && legal && ["target_partially_met", "mixed_or_conflicting", "recovery_concern"]
        .includes(input.trajectory.currentState),
      required: ["legal current Prescription", "unresolved mixed or partial evidence"],
      reasons: ["UNKNOWN_OR_CONFLICT_MEANS_HOLD"] }),
    candidate({ action: "prescription_modification_review", target: input.target, eligible: modification,
      required: ["structured implicated dimension", "legal exercise", "active need"],
      missing: modification ? [] : ["supported local modification dimension"],
      reasons: ["PRESCRIPTION_REVIEW_BEFORE_REPLACEMENT"] }),
    candidate({ action: "progress_prescription_axis", target: input.target,
      eligible: safe && active && legal && progressEvidence && repeated && axes.axis !== null && !axes.conflict,
      axis: axes.axis, required: ["repeated target met", "quality", "tolerance", "recovery", "readiness",
        "legal axis"], missing: axes.axis ? [] : ["single policy-resolved legal progression axis"],
      conflicts: axes.conflict ? ["LONGITUDINAL_ACTION_CONFLICT"] : [],
      reasons: ["ONE_PRIMARY_PROGRESSION_AXIS", "EXACT_FUTURE_DOSE_DEFERRED"] }),
    candidate({ action: "regress_prescription_axis", target: input.target,
      eligible: safe && active && legal && repeated && regressionAxis !== null &&
        (signals.has("repeated_target_failure") || signals.has("repeated_adverse_response")), axis: regressionAxis,
      required: ["repeated local failure/adverse evidence", "legal regression axis"],
      missing: regressionAxis ? [] : ["specific legal regression axis"], reasons: ["LOCAL_REGRESSION_ONLY"] }),
    candidate({ action: "reopen_candidate_selection_for_replacement", target: input.target,
      eligible: replacement, required: ["repeated materially different adverse evidence",
        "Prescription review attempted/exhausted", "Response Receiver consideration"],
      reasons: ["CANDIDATE_SELECTION_REOPENED_IDENTITY_NOT_SELECTED"] }),
    candidate({ action: "reopen_candidate_selection_for_bounded_rotation", target: input.target,
      eligible: rotation, required: ["rotation eligible non-anchor", "explicit preference/plateau", "candidate pool"],
      reasons: ["NO_NOVELTY_QUOTA", "BOUNDED_ROTATION_REVIEW_ONLY"] }),
    candidate({ action: "week_reallocation_review", target: input.target,
      eligible: safe && signals.has("week_reallocation_aggregate"),
      required: ["reviewed completed Week distribution aggregate"], reasons: ["WEEK_OWNER_REQUIRED"] }),
    candidate({ action: "deload_review", target: input.target,
      eligible: safe && signals.has("deload_review_aggregate"),
      required: ["reviewed multi-session recovery/adherence/performance aggregate"],
      reasons: ["LONGITUDINAL_DELOAD_POLICY_OR_SOURCE_REQUIRED", "WEEK_OWNER_REQUIRED"] }),
    candidate({ action: "phase_review", target: input.target,
      eligible: safe && signals.has("phase_review_requested"), required: ["typed longitudinal phase-review evidence"],
      reasons: ["GATE_15_REEVALUATION_REQUIRED"] }),
    candidate({ action: "external_safety_review", target: input.target,
      eligible: !safe, required: ["TrainingSafety external-review authority"],
      reasons: ["TRAINING_SAFETY_PRECEDES_ADAPTATION"] }),
    candidate({ action: "owner_review_required", target: input.target, eligible: axes.conflict,
      required: ["owner resolution"], conflicts: axes.conflict ? ["LONGITUDINAL_ACTION_CONFLICT"] : [],
      reasons: ["EQUAL_AXIS_SUPPORT_REQUIRES_OWNER"] }),
    candidate({ action: "no_action_insufficient_evidence", target: input.target,
      eligible: input.trajectory.currentState === "unknown", required: ["applicable completed evidence"],
      reasons: ["INSUFFICIENT_EVIDENCE"] }),
  ];
  return Object.freeze(rows);
}

const ACTION_PRIORITY: readonly LongitudinalAction[] = Object.freeze([
  "external_safety_review", "owner_review_required", "reopen_candidate_selection_for_replacement",
  "prescription_modification_review", "regress_prescription_axis", "progress_prescription_axis",
  "reopen_candidate_selection_for_bounded_rotation", "deload_review", "week_reallocation_review",
  "phase_review", "hold_current_prescription", "repeat_for_confirmation", "keep_current",
  "no_action_insufficient_evidence",
]);

export function selectPrimaryLongitudinalAction(
  candidates: readonly LongitudinalActionCandidate[],
): LongitudinalActionCandidate | null {
  const eligible = candidates.filter((entry) => entry.eligible);
  for (const action of ACTION_PRIORITY) {
    const selected = eligible.find((entry) => entry.action === action);
    if (selected) return selected;
  }
  return null;
}

export function classificationForAction(action: LongitudinalAction | null): LongitudinalDetailedClassification {
  const values: Record<LongitudinalAction, LongitudinalDetailedClassification> = {
    keep_current: "LONGITUDINAL_PRODUCTIVE_CONTINUITY_KEEP",
    repeat_for_confirmation: "LONGITUDINAL_REPEAT_FOR_CONFIRMATION",
    hold_current_prescription: "LONGITUDINAL_HOLD_MIXED_EVIDENCE",
    prescription_modification_review: "LONGITUDINAL_PRESCRIPTION_MODIFICATION_REVIEW",
    progress_prescription_axis: "LONGITUDINAL_PROGRESSION_AXIS_AUTHORIZED",
    regress_prescription_axis: "LONGITUDINAL_REGRESSION_AXIS_AUTHORIZED",
    reopen_candidate_selection_for_replacement: "LONGITUDINAL_REPLACEMENT_REVIEW_AUTHORIZED",
    reopen_candidate_selection_for_bounded_rotation: "LONGITUDINAL_ROTATION_REVIEW_AUTHORIZED",
    week_reallocation_review: "LONGITUDINAL_WEEK_REALLOCATION_REVIEW",
    deload_review: "LONGITUDINAL_DELOAD_REVIEW",
    phase_review: "LONGITUDINAL_PHASE_REVIEW",
    external_safety_review: "LONGITUDINAL_EXTERNAL_SAFETY_REVIEW",
    owner_review_required: "LONGITUDINAL_ACTION_CONFLICT",
    no_action_insufficient_evidence: "LONGITUDINAL_HOLD_INSUFFICIENT_EVIDENCE",
  };
  return action ? values[action] : "LONGITUDINAL_OWNER_REQUIRED";
}
