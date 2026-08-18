import { OWNER_GET_STRONGER_RESPONSIBILITY_KEYS } from "@praxis/training-engine-v2";

type OwnerStrengthResponsibility = (typeof OWNER_GET_STRONGER_RESPONSIBILITY_KEYS)[number];

const WEEK_OBJECTIVE_PREFIX = "week-v1_1:objective:owner-strength-responsibility:";

const RESPONSIBILITY_LABELS: Readonly<Record<OwnerStrengthResponsibility, string>> = Object.freeze({
  knee_dominant_lower_body: "Knee-dominant lower body",
  hinge_lower_body: "Hinge lower body",
  upper_body_push: "Upper-body push",
  upper_body_pull: "Upper-body pull",
});

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
  preview_only_unknown_duration: "Preview only - duration unknown",
  blocked: "Preview needs review",
});

export interface OwnerWeekObjectivePresentation {
  readonly canonicalId: string;
  readonly label: string;
  readonly recognized: boolean;
  readonly order: number;
}

export function presentOwnerWeekObjective(canonicalId: string): OwnerWeekObjectivePresentation {
  for (const [order, responsibility] of OWNER_GET_STRONGER_RESPONSIBILITY_KEYS.entries()) {
    const recognizedPrefix = `${WEEK_OBJECTIVE_PREFIX}${responsibility}:`;
    if (canonicalId.startsWith(recognizedPrefix) && canonicalId.length > recognizedPrefix.length) {
      return Object.freeze({ canonicalId, label: RESPONSIBILITY_LABELS[responsibility], recognized: true, order });
    }
  }
  return Object.freeze({ canonicalId, label: canonicalId, recognized: false,
    order: OWNER_GET_STRONGER_RESPONSIBILITY_KEYS.length });
}

export function presentOwnerWeekObjectives(
  canonicalIds: readonly string[],
): readonly OwnerWeekObjectivePresentation[] {
  return Object.freeze(canonicalIds.map((canonicalId, sourceOrder) => ({
    ...presentOwnerWeekObjective(canonicalId), sourceOrder,
  })).sort((left, right) => left.order - right.order || left.sourceOrder - right.sourceOrder)
    .map((entry) => Object.freeze({ canonicalId: entry.canonicalId, label: entry.label,
      recognized: entry.recognized, order: entry.order })));
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
