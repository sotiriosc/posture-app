import { ASSESSMENT_FEATURES, ASSESSMENT_SIGNAL_TYPES } from "./domain/assessment";
import type { AssessmentSignal } from "./domain/assessment";
import {
  MACHINE_IDS,
  type EquipmentCapabilities,
  type MachineId,
} from "./domain/equipment";
import {
  EXERCISE_ACTION_FUNCTIONS,
  MUSCLE_CONTRIBUTION_RELATIONSHIPS,
  TRUNK_FUNCTION_EVIDENCE_SOURCES,
  TRUNK_FUNCTION_LEVELS,
  TRUNK_MECHANICS_FUNCTIONS,
  type ExerciseDefinition,
  type ExerciseSupportProfile,
  type TrunkMechanicsProfile,
} from "./domain/exercise";
import type { ExercisePrescriptionKnowledgeProfile } from "./domain/exercisePrescriptionKnowledge";
import { validateExercisePhaseAnnotation } from "./phaseSuitability";
import { THREE_PHASE_FOUNDATION } from "./domain/phase";
import { isProgressionAxis } from "./domain/progression";
import { MOVEMENT_ROLES, MUSCLE_GROUPS } from "./domain/primitives";
import { SESSION_SECTIONS } from "./domain/session";
import type { TrainingEngineInput } from "./domain/athlete";
import { validateTrainingSafetyState } from "./domain/trainingSafety";
import { validateTrainingResponseHistory } from "./domain/trainingResponse";
import { EXERCISE_DOSE_MODES } from "./prescription/dose";

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

function isSyntheticContractExerciseId(value: string): boolean {
  return value.startsWith("synthetic-");
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

const SUPPORT_BASE_POSITIONS = new Set([
  "standing", "half_kneeling", "tall_kneeling", "prone", "side_support",
  "supine", "seated", "quadruped", "hanging", "unknown",
]);
const SUPPORT_STANCES = new Set([
  "bilateral", "single_leg", "split", "half_kneeling_lead_side", "staggered", "stacked_feet",
  "bent_knee_side_support", "alternating_march", "unknown",
]);
const SUPPORT_ORIENTATIONS = new Set([
  "upright", "prone", "supine", "lateral", "diagonal", "suspended", "unknown",
]);
const SUPPORT_AMOUNTS = new Set([
  "none", "light_touch", "partial", "substantial", "prescription_modifiable", "unknown",
]);
const SUPPORT_RELATIONSHIPS = new Set([
  "same_side_load", "opposite_side_load", "bilateral", "side_neutral", "alternating", "unknown",
]);
const SUPPORT_CONTACT_BODY_REGIONS = new Set([
  "forearm", "hand", "foot", "knee", "chest", "back", "pelvis", "seat", "unknown",
]);
const SUPPORT_CONTACT_SOURCES = new Set([
  "floor", "wall", "bench", "machine", "box", "stable_support_surface", "unknown",
]);
const SUPPORT_CONTACT_MODES = new Set([
  "weight_bearing", "balance_assist", "positioning", "unknown",
]);
const SUPPORT_CONTACT_SIDES = new Set([
  "left", "right", "prescription_side", "bilateral", "alternating", "side_neutral", "unknown",
]);
const SUPPORT_CONTACT_TASK_ROLES = new Set(["primary", "secondary", "unknown"]);

export function validateExerciseSupportProfile(
  profile: ExerciseSupportProfile,
  targetId?: string,
): readonly ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const check = (valid: boolean, code: string, message: string): void => {
    if (!valid) findings.push(finding("error", code, message, targetId));
  };
  const runtimeProfile = profile as unknown;

  if (!isRecord(runtimeProfile)) {
    return [
      finding(
        "error",
        "invalid_support_profile",
        "Support profile must be a structured object.",
        targetId,
      ),
    ];
  }

  check(SUPPORT_BASE_POSITIONS.has(runtimeProfile.basePosition as string), "invalid_support_base_position", "Support basePosition is invalid.");
  check(SUPPORT_STANCES.has(runtimeProfile.stance as string), "invalid_support_stance", "Support stance is invalid.");
  check(SUPPORT_ORIENTATIONS.has(runtimeProfile.orientation as string), "invalid_support_orientation", "Support orientation is invalid.");
  check(SUPPORT_AMOUNTS.has(runtimeProfile.supportAmount as string), "invalid_support_amount", "Support amount is invalid.");
  check(SUPPORT_RELATIONSHIPS.has(runtimeProfile.supportRelationship as string), "invalid_support_relationship", "Support relationship is invalid.");
  check(runtimeProfile.reviewStatus === "accepted" || runtimeProfile.reviewStatus === "needs_review", "invalid_support_review_status", "Support reviewStatus is invalid.");
  check(typeof runtimeProfile.notes === "string" && runtimeProfile.notes.trim().length > 0, "invalid_support_notes", "Support notes are required.");

  const contacts = runtimeProfile.supportContacts;
  check(Array.isArray(contacts), "invalid_support_contacts", "Support contacts must be an array.");

  if (!Array.isArray(contacts)) return findings;
  contacts.forEach((contact, index) => {
    const prefix = `Support contact ${index}`;
    if (!isRecord(contact)) {
      check(false, "invalid_support_contact", `${prefix} must be a structured object.`);
      return;
    }
    check(SUPPORT_CONTACT_BODY_REGIONS.has(contact.bodyRegion as string), "invalid_support_contact_body_region", `${prefix} bodyRegion is invalid.`);
    check(SUPPORT_CONTACT_SOURCES.has(contact.source as string), "invalid_support_contact_source", `${prefix} source is invalid.`);
    check(SUPPORT_CONTACT_MODES.has(contact.mode as string), "invalid_support_contact_mode", `${prefix} mode is invalid.`);
    check(SUPPORT_CONTACT_SIDES.has(contact.side as string), "invalid_support_contact_side", `${prefix} side is invalid.`);
    check(SUPPORT_CONTACT_TASK_ROLES.has(contact.taskRole as string), "invalid_support_contact_task_role", `${prefix} taskRole is invalid.`);
  });

  return findings;
}

export function validateExercisePrescriptionKnowledgeProfile(
  profile: ExercisePrescriptionKnowledgeProfile,
  exerciseId: string,
): readonly ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const runtimeProfile = profile as unknown;
  const check = (valid: boolean, code: string, message: string): void => {
    if (!valid) findings.push(finding("error", code, message, exerciseId));
  };

  if (!isRecord(runtimeProfile)) {
    return [
      finding(
        "error",
        "invalid_prescription_knowledge_profile",
        "Prescription knowledge profile must be a structured object.",
        exerciseId,
      ),
    ];
  }

  check(runtimeProfile.exerciseId === exerciseId, "prescription_knowledge_exercise_mismatch", "Prescription knowledge exerciseId must match the ExerciseDefinition id.");
  check(runtimeProfile.version === "exercise_prescription_knowledge_v1", "invalid_prescription_knowledge_version", "Prescription knowledge profile version is invalid.");
  check(typeof runtimeProfile.profileId === "string" && runtimeProfile.profileId.trim().length > 0, "missing_prescription_knowledge_profile_id", "Prescription knowledge profile requires a profileId.");
  check(EXERCISE_DOSE_MODES.includes(runtimeProfile.primaryDoseMode as never), "invalid_primary_dose_mode", "Primary dose mode must use the canonical dose-mode vocabulary.");
  check(Array.isArray(runtimeProfile.doseModeAnnotations), "invalid_dose_mode_annotations", "Prescription knowledge requires dose-mode annotations.");
  check(Array.isArray(runtimeProfile.legalAlternateDoseModes), "invalid_legal_alternate_dose_modes", "Prescription knowledge requires a legal alternate dose-mode array.");
  check(typeof runtimeProfile.timingModel === "string" && runtimeProfile.timingModel.trim().length > 0, "missing_timing_model", "Prescription knowledge requires an explicit timing model.");
  check(Array.isArray(runtimeProfile.provenance) && runtimeProfile.provenance.length > 0, "missing_prescription_knowledge_provenance", "Prescription knowledge requires provenance.");
  check(Array.isArray(runtimeProfile.unknowns), "invalid_prescription_knowledge_unknowns", "Prescription knowledge unknowns must be explicit as an array.");
  check(typeof runtimeProfile.identityBoundary === "string" && runtimeProfile.identityBoundary.trim().length > 0, "missing_prescription_identity_boundary", "Prescription knowledge requires an identity boundary statement.");
  check(Array.isArray(runtimeProfile.responseSensitiveTimingModifications), "invalid_response_sensitive_timing_modifications", "Response-sensitive timing modifications must be an array.");

  if (Array.isArray(runtimeProfile.provenance)) {
    for (const provenance of runtimeProfile.provenance) {
      if (
        !isRecord(provenance) ||
        typeof provenance.sourceRef !== "string" ||
        provenance.sourceRef.trim().length === 0 ||
        !Array.isArray(provenance.evidenceBasis) ||
        provenance.evidenceBasis.length === 0
      ) {
        findings.push(
          finding(
            "error",
            "invalid_prescription_knowledge_provenance",
            "Prescription knowledge provenance requires sourceRef and evidenceBasis.",
            exerciseId,
          ),
        );
      }
    }
  }

  if (Array.isArray(runtimeProfile.doseModeAnnotations)) {
    const primaryAnnotations = runtimeProfile.doseModeAnnotations.filter((annotation) =>
      isRecord(annotation) && annotation.status === "primary");
    check(primaryAnnotations.length === 1, "invalid_primary_dose_mode_annotation_count", "Exactly one primary dose-mode annotation is required.");
    const annotatedModes = new Set<string>();
    for (const annotation of runtimeProfile.doseModeAnnotations) {
      if (!isRecord(annotation)) {
        findings.push(finding("error", "invalid_dose_mode_annotation", "Dose-mode annotation must be structured.", exerciseId));
        continue;
      }
      check(EXERCISE_DOSE_MODES.includes(annotation.mode as never), "invalid_dose_mode_annotation_mode", "Dose-mode annotation mode must use the canonical vocabulary.");
      check(typeof annotation.identityPreservation === "string" && annotation.identityPreservation.trim().length > 0, "missing_dose_mode_identity_preservation", "Dose-mode annotation requires identity-preservation text.");
      check(Array.isArray(annotation.provenance) && annotation.provenance.length > 0, "missing_dose_mode_provenance", "Dose-mode annotation requires provenance.");
      if (typeof annotation.mode === "string") annotatedModes.add(annotation.mode);
    }
    check(annotatedModes.has(runtimeProfile.primaryDoseMode as string), "primary_dose_mode_missing_annotation", "Primary dose mode must be represented by an annotation.");
    for (const alternate of Array.isArray(runtimeProfile.legalAlternateDoseModes)
      ? runtimeProfile.legalAlternateDoseModes
      : []) {
      check(annotatedModes.has(alternate as string), "alternate_dose_mode_missing_annotation", "Legal alternate dose modes must be represented by annotations.");
    }
  }

  for (const axis of Array.isArray(runtimeProfile.legalTimingProgressionAxes)
    ? runtimeProfile.legalTimingProgressionAxes
    : []) {
    if (!isProgressionAxis(axis)) {
      findings.push(
        finding(
          "error",
          "invalid_legal_timing_progression_axis",
          `Unknown timing progression axis: ${axis}.`,
          exerciseId,
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

  if (exercise.muscleContributions.length === 0) {
    findings.push(finding("error", "missing_muscle_contributions", "Canonical muscle contributions are required.", exercise.id));
  }
  const contributionMuscles = new Set<string>();
  for (const contribution of exercise.muscleContributions) {
    if (contributionMuscles.has(contribution.muscle)) {
      findings.push(finding("error", "duplicate_muscle_contribution", `Duplicate contribution for ${contribution.muscle}.`, exercise.id));
    }
    contributionMuscles.add(contribution.muscle);
    if (!MUSCLE_GROUPS.includes(contribution.muscle)) {
      findings.push(finding("error", "invalid_contribution_muscle", `Unknown contribution muscle ${contribution.muscle}.`, exercise.id));
    }
    if (!MUSCLE_CONTRIBUTION_RELATIONSHIPS.includes(contribution.relationship)) {
      findings.push(finding("error", "invalid_muscle_relationship", `Invalid relationship for ${contribution.muscle}.`, exercise.id));
    }
    if (contribution.reviewStatus !== "accepted" && contribution.reviewStatus !== "needs_review") {
      findings.push(finding("error", "invalid_muscle_contribution_review_status", `Contribution ${contribution.muscle} has an invalid review status.`, exercise.id));
    }
    if (contribution.notes.trim().length === 0 || contribution.provenance.length === 0 || contribution.provenance.some((entry) =>
      entry.sourceRef.trim().length === 0 || entry.evidenceBasis.length === 0 || entry.evidenceBasis.some((basis) => basis.trim().length === 0)
    )) {
      findings.push(finding("error", "incomplete_muscle_contribution_review", `Contribution ${contribution.muscle} requires notes and provenance.`, exercise.id));
    }
  }
  const projectedPrimary = exercise.muscleContributions
    .filter((entry) => entry.relationship === "primary_target")
    .map((entry) => entry.muscle);
  const projectedSecondary = exercise.muscleContributions
    .filter((entry) => entry.relationship === "key_secondary_target")
    .map((entry) => entry.muscle);
  if (JSON.stringify(exercise.primaryMuscles) !== JSON.stringify(projectedPrimary) ||
      JSON.stringify(exercise.secondaryMuscles) !== JSON.stringify(projectedSecondary)) {
    findings.push(finding("error", "muscle_projection_drift", "Primary/secondary projections must be derived from canonical contributions.", exercise.id));
  }
  const actionFunctions = new Set<string>();
  for (const annotation of exercise.actionFunctions) {
    if (actionFunctions.has(annotation.action)) {
      findings.push(finding("error", "duplicate_action_function", `Duplicate action/function ${annotation.action}.`, exercise.id));
    }
    actionFunctions.add(annotation.action);
    if (!EXERCISE_ACTION_FUNCTIONS.includes(annotation.action)) {
      findings.push(finding("error", "invalid_action_function", `Invalid action/function ${annotation.action}.`, exercise.id));
    }
    if (annotation.reviewStatus !== "accepted" && annotation.reviewStatus !== "needs_review") {
      findings.push(finding("error", "invalid_action_function_review_status", `Action ${annotation.action} has an invalid review status.`, exercise.id));
    }
    if (annotation.notes.trim().length === 0 || annotation.provenance.length === 0 || annotation.provenance.some((entry) =>
      entry.sourceRef.trim().length === 0 || entry.evidenceBasis.length === 0 || entry.evidenceBasis.some((basis) => basis.trim().length === 0)
    )) {
      findings.push(finding("error", "incomplete_action_function_review", `Action ${annotation.action} requires notes and provenance.`, exercise.id));
    }
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

  const annotationIds = new Set<string>();
  for (const annotation of exercise.phaseSuitabilityAnnotations ?? []) {
    if (annotationIds.has(annotation.annotationId)) {
      findings.push(
        finding(
          "error",
          "duplicate_phase_annotation_id",
          "Contextual phase annotation ids must be unique within an exercise.",
          exercise.id,
        ),
      );
    }
    annotationIds.add(annotation.annotationId);
    findings.push(
      ...validateExercisePhaseAnnotation(annotation, exercise).map((candidate) =>
        finding(candidate.severity, candidate.code, candidate.message, exercise.id),
      ),
    );
  }

  if (exercise.mechanics?.support) {
    findings.push(...validateExerciseSupportProfile(exercise.mechanics.support, exercise.id));
  }

  if (exercise.mechanics?.trunkMechanics) {
    findings.push(...validateTrunkMechanicsProfile(exercise.mechanics.trunkMechanics, exercise.id));
  }

  const exerciseId = exercise.id;
  if (!isSyntheticContractExerciseId(exerciseId)) {
    findings.push(
      ...validateExercisePrescriptionKnowledgeProfile(
        exercise.prescriptionKnowledge,
        exercise.id,
      ),
    );
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

export function validateEquipmentCapabilities(
  equipment: EquipmentCapabilities,
  targetId?: string,
): readonly ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  if (
    equipment.trainingSpace.loadedGait.available &&
    !equipment.trainingSpace.stableLoadedStandingSpace
  ) {
    findings.push(
      finding(
        "error",
        "loaded_gait_requires_stable_loaded_standing_space",
        "Loaded-gait availability is inconsistent when stable loaded standing space is unavailable.",
        targetId,
      ),
    );
  }

  const straightLineMeters =
    equipment.trainingSpace.loadedGait.straightLineMeters;
  if (
    straightLineMeters !== undefined &&
    (!Number.isFinite(straightLineMeters) || straightLineMeters <= 0)
  ) {
    findings.push(
      finding(
        "error",
        "invalid_loaded_gait_straight_line_distance",
        "Known loaded-gait straight-line distance must be a positive finite number.",
        targetId,
      ),
    );
  }

  if (equipment.dumbbells.pairAvailable && !equipment.dumbbells.available) {
    findings.push(
      finding(
        "error",
        "dumbbell_pair_requires_dumbbell_availability",
        "Dumbbell-pair availability is inconsistent when generic dumbbell availability is false.",
        targetId,
      ),
    );
  }

  if (
    equipment.dumbbells.maxPairWeightKg !== undefined &&
    !equipment.dumbbells.pairAvailable
  ) {
    findings.push(
      finding(
        "error",
        "dumbbell_pair_load_requires_pair_availability",
        "A maximum pair weight cannot be supplied when no usable dumbbell pair is available.",
        targetId,
      ),
    );
  }

  if (
    equipment.cables.availableHeights.length > 0 &&
    !equipment.cables.available
  ) {
    findings.push(
      finding(
        "error",
        "cable_heights_require_cable_availability",
        "Cable attachment heights cannot be available when the cable stack is unavailable.",
        targetId,
      ),
    );
  }

  for (const machineId of equipment.machines.availableMachineIds) {
    if (!MACHINE_IDS.includes(machineId as MachineId)) {
      findings.push(
        finding(
          "error",
          "unknown_machine_id",
          `Unknown machine identity: ${machineId}.`,
          targetId,
        ),
      );
    }
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
  findings.push(...validateEquipmentCapabilities(input.equipment, input.athlete.id));
  if (input.trainingSafety) {
    findings.push(
      ...validateTrainingSafetyState(input.trainingSafety).map((candidate) =>
        finding(candidate.severity, candidate.code, candidate.message, candidate.signalId),
      ),
    );
  }
  if (input.history.trainingResponseHistory) {
    findings.push(
      ...validateTrainingResponseHistory(input.history.trainingResponseHistory).map(
        (candidate) =>
          finding(
            candidate.severity,
            candidate.code,
            candidate.message,
            candidate.observationId,
          ),
      ),
    );
  }

  return findings;
}
