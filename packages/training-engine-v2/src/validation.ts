import { ASSESSMENT_SIGNAL_TYPES } from "./domain/assessment";
import type { AssessmentSignal } from "./domain/assessment";
import type { ExerciseDefinition } from "./domain/exercise";
import { THREE_PHASE_FOUNDATION } from "./domain/phase";
import { MOVEMENT_ROLES, MUSCLE_GROUPS } from "./domain/primitives";
import { SESSION_SECTIONS } from "./domain/session";
import type { TrainingEngineInput } from "./domain/athlete";

export interface ValidationFinding {
  readonly severity: "info" | "warning" | "error";
  readonly code: string;
  readonly message: string;
  readonly targetId?: string;
}

function finding(
  severity: ValidationFinding["severity"],
  code: string,
  message: string,
  targetId?: string,
): ValidationFinding {
  return { severity, code, message, targetId };
}

export function validateExerciseDefinition(exercise: ExerciseDefinition): readonly ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(exercise.id)) {
    findings.push(finding("error", "invalid_id", "Exercise id must be kebab-case.", exercise.id));
  }

  if (exercise.movementRoles.length === 0) {
    findings.push(finding("error", "missing_movement_role", "Exercise needs at least one movement role.", exercise.id));
  }

  if (exercise.primaryMuscles.length === 0) {
    findings.push(finding("error", "missing_primary_muscle", "Exercise needs a primary muscle target.", exercise.id));
  }

  for (const role of exercise.movementRoles) {
    if (!MOVEMENT_ROLES.includes(role)) {
      findings.push(finding("error", "unknown_movement_role", `Unknown movement role: ${role}.`, exercise.id));
    }
  }

  for (const muscle of [...exercise.primaryMuscles, ...exercise.secondaryMuscles]) {
    if (!MUSCLE_GROUPS.includes(muscle)) {
      findings.push(finding("error", "unknown_muscle", `Unknown muscle group: ${muscle}.`, exercise.id));
    }
  }

  if (exercise.trainingRoles.length === 0) {
    findings.push(finding("error", "missing_training_role", "Exercise needs at least one training role.", exercise.id));
  }

  if (Object.keys(exercise.sectionSuitability).length === 0) {
    findings.push(finding("error", "missing_section_suitability", "Exercise needs section suitability.", exercise.id));
  }

  for (const section of Object.keys(exercise.sectionSuitability)) {
    if (!SESSION_SECTIONS.includes(section as (typeof SESSION_SECTIONS)[number])) {
      findings.push(finding("error", "unknown_section", `Unknown section: ${section}.`, exercise.id));
    }
  }

  if (Object.keys(exercise.phaseSuitability).length === 0) {
    findings.push(finding("warning", "missing_phase_suitability", "Exercise should document phase suitability.", exercise.id));
  }

  return findings;
}

export function validateExerciseCatalog(exercises: readonly ExerciseDefinition[]): readonly ValidationFinding[] {
  const ids = new Set<string>();
  const findings: ValidationFinding[] = [];

  for (const exercise of exercises) {
    if (ids.has(exercise.id)) {
      findings.push(finding("error", "duplicate_exercise_id", "Duplicate exercise id.", exercise.id));
    }
    ids.add(exercise.id);
    findings.push(...validateExerciseDefinition(exercise));
  }

  return findings;
}

export function validateAssessmentSignal(signal: AssessmentSignal): readonly ValidationFinding[] {
  if (!ASSESSMENT_SIGNAL_TYPES.includes(signal.type)) {
    return [finding("error", "unknown_assessment_signal_type", `Unknown assessment type: ${signal.type}.`, signal.id)];
  }

  if (signal.confidence === "low" && signal.priority === "blocking") {
    return [
      finding("warning", "low_confidence_blocking_signal", "Low-confidence signals should not block without review.", signal.id),
    ];
  }

  return [];
}

export function validateTrainingInput(input: TrainingEngineInput): readonly ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  if (input.athlete.availability.daysPerWeek < 1 || input.athlete.availability.daysPerWeek > 7) {
    findings.push(finding("error", "invalid_frequency", "Training days must be 1-7.", input.athlete.id));
  }

  if (!THREE_PHASE_FOUNDATION.some((phase) => phase.id === input.currentState.phase.currentPhaseId)) {
    findings.push(finding("error", "invalid_phase", "Current phase must exist in the foundation model.", input.athlete.id));
  }

  findings.push(...input.assessment.signals.flatMap(validateAssessmentSignal));

  return findings;
}
