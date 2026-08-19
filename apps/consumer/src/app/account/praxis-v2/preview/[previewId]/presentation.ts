const LEGACY_WEEK_OBJECTIVE_PREFIX = "week-v1_1:objective:owner-strength-responsibility:";

const RESPONSIBILITY_LABELS: Readonly<Record<string, string>> = Object.freeze({
  knee_dominant_squat: "Knee-dominant lower body",
  hinge_hip_extension: "Hinge lower body",
  upper_push: "Upper-body push",
  upper_pull: "Upper-body pull",
  // Immutable previews created before the canonical Product policy keep their original IDs.
  knee_dominant_lower_body: "Knee-dominant lower body",
  hinge_lower_body: "Hinge lower body",
  upper_body_push: "Upper-body push",
  upper_body_pull: "Upper-body pull",
});

const RESPONSIBILITY_CLASSIFICATIONS = new Set([
  "conditional_required", "preferred", "optional",
]);

const SESSION_PURPOSE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  strength_development: "Strength development",
});

const BLOCK_PURPOSE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  preparatory_acclimation: "Lift acclimation",
  developmental_work: "Main work",
  technique_quality_work: "Preparation practice",
  recovery_or_downregulation: "Cooldown / downshift",
});

const PRACTICE_MODE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  full: "Full",
  lighter: "Lighter",
  recovery: "Recovery",
});

const READINESS_LABELS: Readonly<Record<string, string>> = Object.freeze({
  ready_for_approval: "Ready for approval",
  ready_for_initial_calibration_approval: "Ready for initial calibration approval",
  blocked_pending_preflight_facts: "Blocked - profile facts required",
  blocked_pending_safety_review: "Blocked - Safety review required",
  blocked_pending_duration: "Blocked - session duration required",
  calibration_evidence_incomplete: "Calibration evidence incomplete",
  calibration_complete_pending_review: "Calibration complete - review required",
  preview_only_unknown_duration: "Preview only - duration unknown",
  blocked: "Preview needs review",
});

export interface OwnerWeekObjectivePresentation {
  readonly canonicalId: string;
  readonly label: string;
  readonly recognized: boolean;
  readonly order: number;
}

interface OwnerPresentationStageArtifact {
  readonly stage: string;
  readonly payload: unknown;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ?
    value as Record<string, unknown> : null;
}

function responsibilityLabel(responsibilityKey: string): string | null {
  const [classification, responsibility, plane, ...remainder] = responsibilityKey.split(":");
  if (classification === "foundation" && responsibility && remainder.length === 0 &&
      RESPONSIBILITY_LABELS[responsibility] &&
      (!plane || plane === "horizontal" || plane === "vertical")) {
    return `${plane ? `${presentDiagnosticIdentity(plane)} ` : ""}${RESPONSIBILITY_LABELS[responsibility]}`;
  }
  if (classification && RESPONSIBILITY_CLASSIFICATIONS.has(classification) && responsibility) {
    return presentDiagnosticIdentity(responsibility);
  }
  return null;
}

// Current objective IDs are opaque; their persisted Product-to-Week lineage owns presentation semantics.
function responsibilityKeysByObjectiveId(
  artifacts: readonly OwnerPresentationStageArtifact[],
): ReadonlyMap<string, readonly string[]> {
  const mapping = record(artifacts.find((artifact) => artifact.stage === "product_mapping")?.payload);
  const policy = record(mapping?.weeklyResponsibilityPolicy);
  const traces = Array.isArray(policy?.responsibilityTraces) ? policy.responsibilityTraces : [];
  const responsibilityByPriorityId = new Map<string, string>();
  for (const value of traces) {
    const trace = record(value);
    if (typeof trace?.priorityId === "string" && typeof trace.responsibilityKey === "string") {
      responsibilityByPriorityId.set(trace.priorityId, trace.responsibilityKey);
    }
  }
  const planning = record(artifacts.find((artifact) => artifact.stage === "week_intent")?.payload);
  const intent = record(planning?.weeklyIntent);
  const objectives = Array.isArray(intent?.objectives) ? intent.objectives : [];
  const result = new Map<string, readonly string[]>();
  for (const value of objectives) {
    const objective = record(value);
    if (typeof objective?.objectiveId !== "string" || !Array.isArray(objective.sourcePriorityIds)) continue;
    const keys = [...new Set(objective.sourcePriorityIds.flatMap((priorityId) => {
      const key = typeof priorityId === "string" ? responsibilityByPriorityId.get(priorityId) : undefined;
      return key ? [key] : [];
    }))];
    if (keys.length > 0) result.set(objective.objectiveId, Object.freeze(keys));
  }
  return result;
}

export function presentOwnerWeekObjective(
  canonicalId: string,
  responsibilityKeys: readonly string[] = [],
): OwnerWeekObjectivePresentation {
  const canonicalLabels = responsibilityKeys.map(responsibilityLabel);
  if (canonicalLabels.length > 0 && canonicalLabels.every((label): label is string => label !== null)) {
    return Object.freeze({ canonicalId, label: canonicalLabels.join(" / "), recognized: true, order: 0 });
  }
  if (canonicalId.startsWith(LEGACY_WEEK_OBJECTIVE_PREFIX)) {
    const legacyIdentity = canonicalId.slice(LEGACY_WEEK_OBJECTIVE_PREFIX.length);
    for (const [responsibility, label] of Object.entries(RESPONSIBILITY_LABELS)) {
      if (legacyIdentity.startsWith(`${responsibility}:`)) {
        return Object.freeze({ canonicalId, label, recognized: true, order: 0 });
      }
    }
  }
  return Object.freeze({ canonicalId, label: canonicalId, recognized: false, order: 0 });
}

export function presentOwnerWeekObjectives(
  canonicalIds: readonly string[],
  artifacts: readonly OwnerPresentationStageArtifact[] = [],
): readonly OwnerWeekObjectivePresentation[] {
  const responsibilityKeys = responsibilityKeysByObjectiveId(artifacts);
  return Object.freeze(canonicalIds.map((canonicalId, order) => Object.freeze({
    ...presentOwnerWeekObjective(canonicalId, responsibilityKeys.get(canonicalId)), order,
  })));
}

export function presentSessionPurpose(value: string): string {
  return SESSION_PURPOSE_LABELS[value] ?? value;
}

export function presentBlockPurpose(value: string): string {
  return BLOCK_PURPOSE_LABELS[value] ?? value;
}

export function presentPracticeMode(value: string): string {
  return PRACTICE_MODE_LABELS[value] ?? value;
}

export function presentReadiness(value: string, unresolvedFacts: readonly string[] = []): string {
  if (unresolvedFacts.some((fact) => fact.startsWith("OWNER_TRAINING_SAFETY_REVIEW_REQUIRED") ||
    fact.startsWith("OWNER_PAIN_FACT_"))) {
    return "Pain or safety information needs review";
  }
  return READINESS_LABELS[value] ?? value;
}

export function presentUnresolvedFact(value: string): string {
  return value.startsWith("OWNER_TRAINING_SAFETY_REVIEW_REQUIRED") || value.startsWith("OWNER_PAIN_FACT_")
    ? "Pain or safety information needs review"
    : presentDiagnosticIdentity(value);
}

export function presentExerciseIdentity(value: string): string {
  const words = value.split("-").filter(Boolean).join(" ");
  return words ? `${words[0]!.toUpperCase()}${words.slice(1)}` : value;
}

export function presentDiagnosticIdentity(value: string): string {
  const words = value.split("_").filter(Boolean).join(" ").toLowerCase();
  return words ? `${words[0]!.toUpperCase()}${words.slice(1)}` : value;
}

export function presentPreparationCategory(value: string): string {
  const labels: Readonly<Record<string, string>> = Object.freeze({
    general_readiness: "General readiness",
    breathing_position: "Breathing / position",
    dynamic_mobility: "Dynamic mobility",
    range_access: "Range access",
    activation_control: "Activation / control",
    movement_rehearsal: "Movement rehearsal",
    exercise_acclimation: "Lift acclimation",
    cooldown_downshift: "Cooldown / downshift",
  });
  return labels[value] ?? presentDiagnosticIdentity(value);
}
