import type { AlignmentPriority } from "../alignment";
import type { AssessmentState } from "../domain/assessment";
import type { AthleteProfile } from "../domain/athlete";
import type { EquipmentCapabilities } from "../domain/equipment";
import type { ExerciseDefinition } from "../domain/exercise";
import type { TrainingHistory } from "../domain/history";
import type { PainAndInjuryState } from "../domain/painInjury";
import type { PhaseIntent } from "../domain/phase";
import type {
  BodyRegion,
  MovementRole,
  MuscleGroup,
  TrainingGoal,
} from "../domain/primitives";
import type { SessionIntent, SessionSection, TrainingRole } from "../domain/session";
import type { TrainingSafetyState } from "../domain/trainingSafety";

export type FatigueSignal = "fresh" | "local_fatigue" | "systemic_fatigue" | "joint_stress_accumulated";

export interface ContinuityContext {
  readonly currentExerciseId?: string;
  readonly previousExerciseId?: string;
  readonly productiveExerciseIds: readonly string[];
  readonly plateauedExerciseIds: readonly string[];
  readonly failedProgressionExerciseIds: readonly string[];
  readonly painResponseExerciseIds: readonly string[];
}

export interface CandidateNeed {
  readonly id: string;
  readonly whyNeeded: string;
  readonly requestedRole: TrainingRole;
  readonly requestedSection?: SessionSection;
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly targetBodyRegions: readonly BodyRegion[];
  readonly goal: TrainingGoal;
}

export interface CandidateEvaluationContext {
  readonly asOf?: string;
}

export interface CandidateRequest {
  readonly id: string;
  readonly evaluationContext?: CandidateEvaluationContext;
  readonly athlete: AthleteProfile;
  readonly goal: TrainingGoal;
  readonly phase: PhaseIntent;
  readonly need: CandidateNeed;
  readonly sessionIntent?: SessionIntent;
  readonly assessment: AssessmentState;
  readonly alignmentPriorities: readonly AlignmentPriority[];
  readonly painAndInjury: PainAndInjuryState;
  readonly trainingSafety?: TrainingSafetyState;
  readonly equipment: EquipmentCapabilities;
  readonly history: TrainingHistory;
  readonly continuity: ContinuityContext;
  readonly candidatePool: readonly ExerciseDefinition[];
  readonly satisfiedPrerequisiteIds: readonly string[];
  readonly fatigueSignals: readonly FatigueSignal[];
  readonly notes?: readonly string[];
}

export interface InterpretedCandidateContext {
  readonly requestId: string;
  readonly evaluationAsOf?: string;
  readonly athleteId: string;
  readonly goal: TrainingGoal;
  readonly phaseId: PhaseIntent["id"];
  readonly requestedRole: TrainingRole;
  readonly requestedSection?: SessionSection;
  readonly targetMovementRoles: readonly MovementRole[];
  readonly targetMuscles: readonly MuscleGroup[];
  readonly alignmentPriorityIds: readonly string[];
  readonly relevantPainIds: readonly string[];
  readonly continuityExerciseIds: readonly string[];
  readonly fatigueSignals: readonly FatigueSignal[];
}

export function interpretCandidateRequest(
  request: CandidateRequest,
): InterpretedCandidateContext {
  return {
    requestId: request.id,
    evaluationAsOf: request.evaluationContext?.asOf,
    athleteId: request.athlete.id,
    goal: request.goal,
    phaseId: request.phase.id,
    requestedRole: request.need.requestedRole,
    requestedSection: request.need.requestedSection,
    targetMovementRoles: request.need.targetMovementRoles,
    targetMuscles: request.need.targetMuscles,
    alignmentPriorityIds: request.alignmentPriorities.map((priority) => priority.id),
    relevantPainIds: [
      ...request.painAndInjury.currentDiscomforts.map((pain) => pain.id),
      ...request.painAndInjury.moderatePain.map((pain) => pain.id),
      ...request.painAndInjury.acuteSeverePain.map((pain) => pain.id),
      ...request.painAndInjury.hardContraindications.map((pain) => pain.id),
    ],
    continuityExerciseIds: [
      ...request.continuity.productiveExerciseIds,
      ...(request.continuity.currentExerciseId ? [request.continuity.currentExerciseId] : []),
      ...(request.continuity.previousExerciseId ? [request.continuity.previousExerciseId] : []),
    ],
    fatigueSignals: request.fatigueSignals,
  };
}
