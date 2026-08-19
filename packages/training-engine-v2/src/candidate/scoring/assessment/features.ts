import type {
  AssessmentFeature,
  AssessmentFeatureSource,
  AssessmentSignal,
} from "../../../domain/assessment";
import type {
  ExerciseDefinition,
  ExerciseDemandAnnotation,
  ExerciseMechanicsReviewStatus,
  ScapularMechanicsProfile,
} from "../../../domain/exercise";
import type {
  AssessmentFeatureMatch,
  AssessmentFeatureMatchTrace,
  AssessmentRelevanceLevel,
} from "../../../scoringContracts";
import { signalIsScapular } from "./classifySignal";

interface NormalizedAssessmentFeature {
  readonly feature: AssessmentFeature;
  readonly source: AssessmentFeatureSource;
  readonly evidence: string;
}

type ScapularFeatureField = keyof Pick<
  ScapularMechanicsProfile,
  | "serratusContribution"
  | "upwardRotationControl"
  | "retractionDemand"
  | "externalRotationContribution"
  | "loadedScapularControl"
>;

const SCAPULAR_FEATURE_FIELDS: Readonly<
  Record<
    AssessmentFeature,
    {
      readonly field: ScapularFeatureField;
      readonly label: string;
    }
  >
> = {
  serratus_or_protraction_control: {
    field: "serratusContribution",
    label: "scapularMechanics.serratusContribution",
  },
  upward_rotation_control: {
    field: "upwardRotationControl",
    label: "scapularMechanics.upwardRotationControl",
  },
  retraction_control: {
    field: "retractionDemand",
    label: "scapularMechanics.retractionDemand",
  },
  external_rotation_or_cuff_control: {
    field: "externalRotationContribution",
    label: "scapularMechanics.externalRotationContribution",
  },
  loaded_scapular_stability: {
    field: "loadedScapularControl",
    label: "scapularMechanics.loadedScapularControl",
  },
};

function unknownFeatureDemand(feature: AssessmentFeature): ExerciseDemandAnnotation {
  return {
    level: "unknown",
    source: "unknown",
    reviewStatus: "needs_review",
    notes: `No scapularMechanics annotation is available for ${feature}.`,
  };
}

function dedupeFeatures(
  features: readonly NormalizedAssessmentFeature[],
): readonly NormalizedAssessmentFeature[] {
  const byFeature = new Map<AssessmentFeature, NormalizedAssessmentFeature>();

  features.forEach((feature) => {
    const existing = byFeature.get(feature.feature);
    if (!existing || existing.source !== "explicit") {
      byFeature.set(feature.feature, feature);
    }
  });

  return [...byFeature.values()];
}

export function normalizeAssessmentFeatures(
  signal: AssessmentSignal,
): readonly NormalizedAssessmentFeature[] {
  const explicit = (signal.assessmentFeatures ?? []).map((feature) => ({
    feature,
    source: "explicit" as const,
    evidence: `${feature} was supplied explicitly on ${signal.id}.`,
  }));
  const derived: NormalizedAssessmentFeature[] = [];
  const scapularDomain =
    signalIsScapular(signal) || signal.movementRole === "scapular_control";

  if (scapularDomain && signal.muscleGroup === "serratus") {
    derived.push({
      feature: "serratus_or_protraction_control",
      source: "normalized_from_signal",
      evidence: `${signal.id} combines serratus with a scapular/shoulder signal.`,
    });
  }

  if (scapularDomain && signal.muscleGroup === "rotator_cuff") {
    derived.push({
      feature: "external_rotation_or_cuff_control",
      source: "normalized_from_signal",
      evidence: `${signal.id} combines rotator cuff with a scapular/shoulder signal.`,
    });
  }

  if (
    scapularDomain &&
    (signal.muscleGroup === "upper_back" || signal.muscleGroup === "rear_delts")
  ) {
    derived.push({
      feature: "retraction_control",
      source: "normalized_from_signal",
      evidence: `${signal.id} combines posterior shoulder/upper-back musculature with a scapular/shoulder signal.`,
    });
  }

  return dedupeFeatures([...explicit, ...derived]);
}

function candidateFeatureReviewStatus(input: {
  readonly annotation: ExerciseDemandAnnotation;
  readonly profileReviewStatus: ExerciseMechanicsReviewStatus | "not_applicable";
}): ExerciseMechanicsReviewStatus {
  return input.annotation.reviewStatus === "needs_review" ||
    input.profileReviewStatus === "needs_review"
    ? "needs_review"
    : "accepted";
}

function matchForAnnotation(input: {
  readonly annotation: ExerciseDemandAnnotation;
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
}): AssessmentFeatureMatch {
  if (input.annotation.level === "unknown" || input.annotation.source === "unknown") {
    return "unknown";
  }

  if (input.annotation.level === "low") {
    return "low_expression";
  }

  if (input.annotation.level === "moderate") {
    return input.reviewStatus === "needs_review" ? "weak" : "moderate";
  }

  return input.reviewStatus === "needs_review" ? "moderate" : "strong";
}

export function relevanceFromFeatureMatch(
  match: AssessmentFeatureMatch,
): AssessmentRelevanceLevel {
  switch (match) {
    case "strong":
      return "high";
    case "moderate":
      return "moderate";
    case "weak":
      return "low";
    case "low_expression":
    case "conflict":
    case "unknown":
      return "none";
  }
}

function matchRank(match: AssessmentFeatureMatch): number {
  switch (match) {
    case "strong":
      return 4;
    case "moderate":
      return 3;
    case "weak":
      return 2;
    case "low_expression":
      return 1;
    case "conflict":
      return 0;
    case "unknown":
      return 0;
  }
}

export function bestFeatureRelevance(
  matches: readonly AssessmentFeatureMatchTrace[],
): AssessmentRelevanceLevel {
  return matches.reduce<AssessmentRelevanceLevel>((best, match) => {
    const next = relevanceFromFeatureMatch(match.featureMatch);
    const order: readonly AssessmentRelevanceLevel[] = ["none", "low", "moderate", "high"];
    return order.indexOf(next) > order.indexOf(best) ? next : best;
  }, "none");
}

export function bestFeatureMatch(
  matches: readonly AssessmentFeatureMatchTrace[],
): AssessmentFeatureMatchTrace | undefined {
  return [...matches].sort(
    (left, right) => matchRank(right.featureMatch) - matchRank(left.featureMatch),
  )[0];
}

export function matchScapularAssessmentFeatures(input: {
  readonly signal: AssessmentSignal;
  readonly exercise: ExerciseDefinition;
}): readonly AssessmentFeatureMatchTrace[] {
  return normalizeAssessmentFeatures(input.signal).map((feature) => {
    const field = SCAPULAR_FEATURE_FIELDS[feature.feature];
    const profile = input.exercise.mechanics?.scapularMechanics;
    const annotation = profile?.[field.field] ?? unknownFeatureDemand(feature.feature);
    const profileReviewStatus = profile?.reviewStatus ?? "not_applicable";
    const reviewStatus = candidateFeatureReviewStatus({
      annotation,
      profileReviewStatus,
    });
    const featureMatch = matchForAnnotation({ annotation, reviewStatus });

    return {
      assessmentFeature: feature.feature,
      assessmentFeatureSource: feature.source,
      candidateFeature: field.label,
      candidateFeatureLevel: annotation.level,
      candidateFeatureReviewStatus: reviewStatus,
      candidateFeatureProfileReviewStatus: profileReviewStatus,
      featureMatch,
      featureReason: [
        feature.evidence,
        `${input.exercise.id} ${field.label} expresses the feature at ${annotation.level} level (${reviewStatus}).`,
        annotation.notes,
      ].join(" "),
    };
  });
}
