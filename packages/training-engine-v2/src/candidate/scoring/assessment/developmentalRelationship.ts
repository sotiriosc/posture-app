import type { AssessmentInfluence } from "../../../alignment";
import type { AssessmentSignal } from "../../../domain/assessment";
import type { ExerciseDefinition } from "../../../domain/exercise";
import type { BodyRegion, JointStressTag, MovementRole } from "../../../domain/primitives";
import type { FatigueSignal } from "../../request";
import type {
  AssessmentCandidateRelationship,
  AssessmentDemandCapabilityTrace,
  DemandReductionContextTrace,
} from "../../../scoringContracts";
import type { CandidateRequest } from "../../request";
import type { ReasonCode } from "../../../reasonCodes";

function unique<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function hasOverlap<T>(left: readonly T[], right: readonly T[]): boolean {
  return left.some((value) => right.includes(value));
}

function exerciseStressTags(exercise: ExerciseDefinition): readonly JointStressTag[] {
  return unique([
    ...exercise.loading.jointStressTags,
    ...exercise.cautionStressTags,
    ...exercise.contraindicatedStressTags,
  ]);
}

function movementRolesForStressTag(stressTag: JointStressTag): readonly MovementRole[] {
  switch (stressTag) {
    case "deep_knee_flexion":
    case "loaded_knee_flexion":
    case "high_impact":
      return ["squat", "single_leg"];
    case "loaded_hinge":
    case "loaded_spinal_flexion":
    case "loaded_spinal_extension":
    case "heavy_axial_loading":
      return ["hinge", "anti_extension_core", "anti_rotation_core"];
    case "overhead_pressing":
    case "shoulder_abduction_external_rotation":
      return ["vertical_push", "scapular_control"];
    case "horizontal_pressing":
    case "wrist_extension_loading":
      return ["horizontal_push"];
    case "grip_intensive":
      return ["horizontal_pull", "vertical_pull", "carry"];
    case "long_lever_core":
      return ["anti_extension_core", "anti_rotation_core"];
  }
}

function movementRolesForStressTags(stressTags: readonly JointStressTag[]): readonly MovementRole[] {
  return unique(stressTags.flatMap((stressTag) => movementRolesForStressTag(stressTag)));
}

function contextualBodyRegions(input: {
  readonly signal: AssessmentSignal;
  readonly exercise: ExerciseDefinition;
  readonly request: CandidateRequest;
}): readonly BodyRegion[] {
  return unique([
    ...(input.signal.region ? [input.signal.region] : []),
    ...input.exercise.bodyRegions,
    ...input.request.need.targetBodyRegions,
  ]);
}

function contextualMovementRoles(input: {
  readonly signal: AssessmentSignal;
  readonly exercise: ExerciseDefinition;
  readonly request: CandidateRequest;
}): readonly MovementRole[] {
  return unique([
    ...(input.signal.movementRole ? [input.signal.movementRole] : []),
    ...input.exercise.movementRoles,
    ...input.request.need.targetMovementRoles,
    ...movementRolesForStressTags(exerciseStressTags(input.exercise)),
  ]);
}

function concernMatchesContext(input: {
  readonly region: BodyRegion;
  readonly stressTags: readonly JointStressTag[];
  readonly signal: AssessmentSignal;
  readonly exercise: ExerciseDefinition;
  readonly request: CandidateRequest;
}): boolean {
  const bodyRegions = contextualBodyRegions(input);
  const movementRoles = contextualMovementRoles(input);
  const stressTags = exerciseStressTags(input.exercise);

  return (
    bodyRegions.includes(input.region) ||
    hasOverlap(input.stressTags, stressTags) ||
    hasOverlap(movementRolesForStressTags(input.stressTags), movementRoles)
  );
}

function fatigueSignalAllowsMovementRoleMatch(signal: FatigueSignal): boolean {
  return signal === "local_fatigue" || signal === "joint_stress_accumulated";
}

export function demandReductionContextFor(input: {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
  readonly signal: AssessmentSignal;
}): DemandReductionContextTrace {
  const matchedCurrentDiscomforts = input.request.painAndInjury.currentDiscomforts.filter(
    (pain) =>
      pain.effect !== "monitor" &&
      concernMatchesContext({
        region: pain.region,
        stressTags: pain.stressTags,
        signal: input.signal,
        exercise: input.exercise,
        request: input.request,
      }),
  );
  const matchedModeratePain = input.request.painAndInjury.moderatePain.filter((pain) =>
    concernMatchesContext({
      region: pain.region,
      stressTags: pain.stressTags,
      signal: input.signal,
      exercise: input.exercise,
      request: input.request,
    }),
  );
  const matchedHistoricalSensitivities = input.request.painAndInjury.historicalSensitivities.filter(
    (sensitivity) =>
      (sensitivity.preferredModification === "increase_support" ||
        sensitivity.preferredModification === "reduce_load" ||
        sensitivity.preferredModification === "reduce_range") &&
      concernMatchesContext({
        region: sensitivity.region,
        stressTags: sensitivity.stressTags,
        signal: input.signal,
        exercise: input.exercise,
        request: input.request,
      }),
  );
  const movementRoles = contextualMovementRoles(input);
  const fatigueSignals = input.request.fatigueSignals;
  const matchedFatigueMovementRoles = unique(
    Object.entries(input.request.history.fatigueState.byMovementRole)
      .filter(
        ([movementRole, fatigueLevel]) =>
          movementRoles.includes(movementRole as MovementRole) &&
          (fatigueLevel === "moderate" || fatigueLevel === "high") &&
          fatigueSignals.some(fatigueSignalAllowsMovementRoleMatch),
      )
      .map(([movementRole]) => movementRole as MovementRole),
  );
  const systemicFatigueUsed =
    fatigueSignals.includes("systemic_fatigue") &&
    (input.request.history.fatigueState.overall === "moderate" ||
      input.request.history.fatigueState.overall === "high");
  const matchedPainConcernIds = [
    ...matchedCurrentDiscomforts.map((pain) => pain.id),
    ...matchedModeratePain.map((pain) => pain.id),
  ];
  const hasPainOrSensitivityMatch =
    matchedPainConcernIds.length > 0 || matchedHistoricalSensitivities.length > 0;
  const globalPainAwareGoalUsed = input.request.goal === "pain_aware_return" && hasPainOrSensitivityMatch;
  const evidence = [
    ...matchedCurrentDiscomforts.map(
      (pain) => `${pain.id} current discomfort matches this signal/candidate context.`,
    ),
    ...matchedModeratePain.map(
      (pain) => `${pain.id} moderate pain matches this signal/candidate context.`,
    ),
    ...matchedHistoricalSensitivities.map(
      (sensitivity) =>
        `${sensitivity.id} historical sensitivity requests ${sensitivity.preferredModification} in this signal/candidate context.`,
    ),
    ...matchedFatigueMovementRoles.map(
      (movementRole) => `${movementRole} fatigue matches the signal/candidate movement context.`,
    ),
    ...(systemicFatigueUsed
      ? [`Systemic fatigue is ${input.request.history.fatigueState.overall} and explicitly signaled.`]
      : []),
    ...(globalPainAwareGoalUsed
      ? ["Pain-aware return goal reinforces the matched pain/sensitivity context."]
      : []),
  ];

  if (evidence.length === 0) {
    evidence.push(
      "No scoped pain, sensitivity, or fatigue context matched this signal, candidate, and requested need.",
    );
  }

  return {
    relevant:
      hasPainOrSensitivityMatch || matchedFatigueMovementRoles.length > 0 || systemicFatigueUsed,
    matchedPainConcernIds,
    matchedHistoricalSensitivityIds: matchedHistoricalSensitivities.map(
      (sensitivity) => sensitivity.id,
    ),
    matchedFatigueMovementRoles,
    systemicFatigueUsed,
    globalPainAwareGoalUsed,
    evidence,
  };
}

function isPreparationContext(request: CandidateRequest): boolean {
  return (
    request.need.requestedSection === "activation" ||
    request.need.requestedSection === "warmup" ||
    request.need.requestedRole === "activation" ||
    request.need.requestedRole === "preparation" ||
    request.need.requestedRole === "recovery"
  );
}

function isDevelopmentalLoadingContext(request: CandidateRequest): boolean {
  return (
    request.need.requestedSection === "main" ||
    request.need.requestedRole === "primary_strength" ||
    request.need.requestedRole === "secondary_strength" ||
    request.need.requestedRole === "hypertrophy_accessory"
  );
}

export function relationshipFromDemand(input: {
  readonly influence: AssessmentInfluence;
  readonly demandCapability: AssessmentDemandCapabilityTrace;
  readonly request: CandidateRequest;
  readonly demandReductionContext: DemandReductionContextTrace;
}): AssessmentCandidateRelationship {
  if (input.influence.direction === "neutral" || input.demandCapability.match === "not_applicable") {
    return "neutral";
  }

  if (input.influence.direction === "conflicts") {
    return "conflicts_with_priority";
  }

  switch (input.demandCapability.match) {
    case "exceeds_current_capability":
      return "exceeds_current_capability";
    case "appropriate_challenge":
      return isDevelopmentalLoadingContext(input.request)
        ? "develops_priority"
        : "provides_appropriate_exposure";
    case "matches_current_capability":
      return "provides_appropriate_exposure";
    case "below_current_capability":
      if (input.demandReductionContext.relevant) {
        return "reduces_excess_demand";
      }

      if (isPreparationContext(input.request)) {
        return "supports_control";
      }

      if (isDevelopmentalLoadingContext(input.request)) {
        return "under_challenges_development";
      }

      return "neutral";
  }
}

export function relationshipScalar(relationship: AssessmentCandidateRelationship): number {
  switch (relationship) {
    case "supports_control":
      return 0.8;
    case "reduces_excess_demand":
      return 0.45;
    case "provides_appropriate_exposure":
      return 1;
    case "develops_priority":
      return 0.9;
    case "under_challenges_development":
      return -0.35;
    case "neutral":
      return 0;
    case "conflicts_with_priority":
      return -0.75;
    case "exceeds_current_capability":
      return -0.85;
  }
}

export function relationshipReasonCode(relationship: AssessmentCandidateRelationship): ReasonCode {
  switch (relationship) {
    case "supports_control":
      return "ASSESSMENT_SUPPORTS_CONTROL";
    case "reduces_excess_demand":
      return "ASSESSMENT_REDUCES_EXCESS_DEMAND";
    case "provides_appropriate_exposure":
      return "ASSESSMENT_APPROPRIATE_EXPOSURE";
    case "develops_priority":
      return "ASSESSMENT_DEVELOPS_PRIORITY";
    case "under_challenges_development":
      return "ASSESSMENT_UNDER_CHALLENGES_DEVELOPMENT";
    case "conflicts_with_priority":
      return "ASSESSMENT_PRIORITY_CONFLICT";
    case "exceeds_current_capability":
      return "ASSESSMENT_EXCEEDS_CAPABILITY";
    case "neutral":
      return "ASSESSMENT_NEUTRAL_RELATIONSHIP";
  }
}

export function relationshipReason(
  relationship: AssessmentCandidateRelationship,
  trace: AssessmentDemandCapabilityTrace,
  demandReductionContext: DemandReductionContextTrace,
): string {
  switch (relationship) {
    case "supports_control":
      return `${trace.dimension} demand is below current capability and fits a preparation/control context.`;
    case "reduces_excess_demand":
      return `${trace.dimension} demand is below current capability and scoped demand-reduction context applies: ${demandReductionContext.evidence.join(" ")}`;
    case "provides_appropriate_exposure":
      return `${trace.dimension} demand matches current capability or is an appropriate exposure.`;
    case "develops_priority":
      return `${trace.dimension} demand can develop the priority within the requested training role.`;
    case "under_challenges_development":
      return `${trace.dimension} demand is below current capability without a demand-reduction reason for this training role.`;
    case "conflicts_with_priority":
      return `${trace.dimension} relationship conflicts with a blocking assessment priority.`;
    case "exceeds_current_capability":
      return `${trace.dimension} demand exceeds estimated current capability for this finding.`;
    case "neutral":
      return `${trace.dimension} relationship is neutral for this candidate and request.`;
  }
}
