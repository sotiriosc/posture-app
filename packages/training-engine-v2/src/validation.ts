import { ASSESSMENT_FEATURES, ASSESSMENT_SIGNAL_TYPES } from "./domain/assessment";
import type { AssessmentSignal } from "./domain/assessment";
import {
  TRUNK_FUNCTION_EVIDENCE_SOURCES,
  TRUNK_FUNCTION_LEVELS,
  TRUNK_MECHANICS_FUNCTIONS,
  type ExerciseDefinition,
  type TrunkMechanicsProfile,
} from "./domain/exercise";
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

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasValidTrunkFunctionProvenance(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (entry) =>
        isRecord(entry) &&
        typeof entry.sourceRef === "string" &&
        entry.sourceRef.trim().length > 0 &&
        Array.isArray(entry.evidenceBasis) &&
        entry.evidenceBasis.length > 0 &&
        entry.evidenceBasis.every(
          (evidence) => typeof evidence === "string" && evidence.trim().length > 0,
        ),
    )
  );
}

export function validateTrunkMechanicsProfile(
  profile: TrunkMechanicsProfile,
  targetId?: string,
): readonly ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const runtimeProfile = profile as unknown;

  if (!isRecord(runtimeProfile)) {
    return [
      finding(
        "error",
        "invalid_trunk_mechanics_profile",
        "Trunk mechanics profile must be a structured object.",
        targetId,
      ),
    ];
  }

  for (const functionName of TRUNK_MECHANICS_FUNCTIONS) {
    const annotation = runtimeProfile[functionName];
    if (!isRecord(annotation)) {
      findings.push(
        finding(
          "error",
          "missing_trunk_function_annotation",
          `Trunk mechanics profile requires a valid ${functionName} annotation.`,
          targetId,
        ),
      );
      continue;
    }

    const levelIsValid =
      typeof annotation.level === "string" &&
      TRUNK_FUNCTION_LEVELS.includes(
        annotation.level as (typeof TRUNK_FUNCTION_LEVELS)[number],
      );
    const reviewStatusIsValid =
      annotation.reviewStatus === "accepted" || annotation.reviewStatus === "needs_review";
    const sourceIsValid =
      typeof annotation.source === "string" &&
      TRUNK_FUNCTION_EVIDENCE_SOURCES.includes(
        annotation.source as (typeof TRUNK_FUNCTION_EVIDENCE_SOURCES)[number],
      );
    const provenanceIsEmpty =
      Array.isArray(annotation.provenance) && annotation.provenance.length === 0;
    const provenanceIsValid =
      provenanceIsEmpty || hasValidTrunkFunctionProvenance(annotation.provenance);
    const notesAreValid =
      typeof annotation.notes === "string" && annotation.notes.trim().length > 0;

    if (!levelIsValid) {
      findings.push(
        finding(
          "error",
          "invalid_trunk_function_level",
          `${functionName} has an invalid trunk-function level.`,
          targetId,
        ),
      );
    }
    if (!reviewStatusIsValid) {
      findings.push(
        finding(
          "error",
          "invalid_trunk_function_review_status",
          `${functionName} has an invalid review status.`,
          targetId,
        ),
      );
    }
    if (!sourceIsValid) {
      findings.push(
        finding(
          "error",
          "invalid_trunk_function_source",
          `${functionName} has an invalid evidence source.`,
          targetId,
        ),
      );
    }
    if (!provenanceIsValid) {
      findings.push(
        finding(
          "error",
          "invalid_trunk_function_provenance",
          `${functionName} provenance must contain structured source references and evidence.`,
          targetId,
        ),
      );
    }
    if (!notesAreValid) {
      findings.push(
        finding(
          "error",
          "invalid_trunk_function_notes",
          `${functionName} requires concise evidence notes.`,
          targetId,
        ),
      );
    }

    if (!levelIsValid || !reviewStatusIsValid || !sourceIsValid || !provenanceIsValid) {
      continue;
    }

    const hasReviewedBasis =
      annotation.source !== "unknown" &&
      hasValidTrunkFunctionProvenance(annotation.provenance);

    if (
      annotation.level === "unknown" &&
      annotation.reviewStatus === "accepted" &&
      !hasReviewedBasis
    ) {
      findings.push(
        finding(
          "error",
          "accepted_unknown_trunk_function_without_review_basis",
          `${functionName} cannot claim accepted unknown evidence without a structured reviewed basis.`,
          targetId,
        ),
      );
    }

    if (annotation.level !== "unknown" && !hasReviewedBasis) {
      findings.push(
        finding(
          "error",
          "missing_trunk_function_provenance",
          `${functionName} level ${annotation.level} requires an explicit evidence source and structured provenance.`,
          targetId,
        ),
      );
    }
  }

  return findings;
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

  if (exercise.mechanics?.trunkMechanics) {
    findings.push(...validateTrunkMechanicsProfile(exercise.mechanics.trunkMechanics, exercise.id));
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
  const findings: ValidationFinding[] = [];

  if (!ASSESSMENT_SIGNAL_TYPES.includes(signal.type)) {
    return [finding("error", "unknown_assessment_signal_type", `Unknown assessment type: ${signal.type}.`, signal.id)];
  }

  if (signal.confidence === "low" && signal.priority === "blocking") {
    findings.push(
      finding("warning", "low_confidence_blocking_signal", "Low-confidence signals should not block without review.", signal.id),
    );
  }

  for (const feature of signal.assessmentFeatures ?? []) {
    if (!ASSESSMENT_FEATURES.includes(feature)) {
      findings.push(
        finding("error", "unknown_assessment_feature", `Unknown assessment feature: ${feature}.`, signal.id),
      );
    }
  }

  return findings;
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
