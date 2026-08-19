import type { EquipmentCapabilityKey, MachineId } from "../domain/equipment";
import type { ExercisePrerequisite, ExercisePrerequisiteType } from "../domain/exercise";
import { REFERENCE_EXERCISES } from "../data/referenceExercises";
import {
  PRODUCT_GET_STRONGER_DEVELOP_FOUNDATION_KEYS,
  type ProductGetStrongerDevelopLoadingEvidence,
} from "../productGoalArchitecture/getStrongerDevelopWeeklyPolicyV1";
import { explicitIsoTime, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import {
  OWNER_CONFIRMATION_ANSWERS,
  OWNER_DELIVERY_CONTRACTS,
  buildOwnerProfileRevision,
  isOwnerAvailableTrainingDays,
  type OwnerConfirmationAnswer,
  type OwnerEquipmentAvailabilityConfirmation,
  type OwnerEquipmentLoadCeiling,
  type OwnerGetStrongerProfileRevision,
  type OwnerLoadUnit,
  type OwnerLoadingSuitabilityConfirmation,
  type OwnerPrerequisiteConfirmation,
  type OwnerRecordProvenance,
} from "./contracts";

export const OWNER_PROFILE_PREFLIGHT_MAX_QUESTIONS = 12 as const;

export const OWNER_PREFLIGHT_QUESTION_KINDS = Object.freeze([
  "movement_capability",
  "exercise_familiarity",
  "equipment_availability",
  "equipment_load_ceiling",
  "setup_support",
  "loading_suitability",
  "calibration",
] as const);

export type OwnerPreflightQuestionKind = (typeof OWNER_PREFLIGHT_QUESTION_KINDS)[number];

export interface OwnerProfilePreflightQuestion {
  readonly contract: typeof OWNER_DELIVERY_CONTRACTS.profilePreflight;
  readonly questionId: string;
  readonly questionRevisionId: string;
  readonly sourceRevision: string;
  readonly sourceProfileRevisionId: string;
  readonly kind: OwnerPreflightQuestionKind;
  readonly canonicalFactId: string;
  readonly responseType: "confirmation" | "load_ceiling";
  readonly allowedAnswers: readonly string[];
  readonly prompt: string;
  readonly why: string;
  readonly responsibilityKey: string;
  readonly responsibilityLabel: string;
  readonly requiredBeforePreview: boolean;
  readonly currentAnswer: string | null;
  readonly exerciseId: string | null;
  readonly prerequisiteId: string | null;
  readonly prerequisiteType: ExercisePrerequisiteType | null;
  readonly equipmentCapabilityId: EquipmentCapabilityKey | `machine:${MachineId}` | null;
  readonly equipmentId: "dumbbells" | "barbell" | null;
  readonly technicalRefs: readonly string[];
}

export interface OwnerProfilePreflight {
  readonly contract: typeof OWNER_DELIVERY_CONTRACTS.profilePreflight;
  readonly profileId: string;
  readonly sourceProfileRevisionId: string;
  readonly status: "ready" | "questions_required" | "blocked";
  readonly questions: readonly OwnerProfilePreflightQuestion[];
  readonly blockerCodes: readonly string[];
  readonly maximumQuestionCount: typeof OWNER_PROFILE_PREFLIGHT_MAX_QUESTIONS;
  readonly bounded: true;
  readonly preflightFingerprint: string;
}

export type OwnerProfilePreflightAnswerSubmission =
  | {
      readonly questionId: string;
      readonly questionRevisionId: string;
      readonly answer: OwnerConfirmationAnswer;
    }
  | {
      readonly questionId: string;
      readonly questionRevisionId: string;
      readonly answer: "provided" | "unavailable" | "not_sure" | "not_reviewed";
      readonly value?: number;
      readonly unit?: OwnerLoadUnit;
    };

export interface OwnerApplyPreflightAnswersResult {
  readonly status: "revised" | "rejected";
  readonly profile: OwnerGetStrongerProfileRevision | null;
  readonly reasonCodes: readonly string[];
}

const responsibilityLabels: Readonly<Record<string, string>> = Object.freeze({
  "foundation:knee_dominant_squat": "Knee-dominant squat strength",
  "foundation:hinge_hip_extension": "Hinge and hip-extension strength",
  "foundation:upper_push": "Upper-body pushing strength",
  "foundation:upper_pull": "Upper-body pulling strength",
});

export function ownerResponsibilityLabel(responsibilityKey: string): string {
  return responsibilityLabels[responsibilityKey] ?? "Required weekly strength work";
}

function questionId(kind: OwnerPreflightQuestionKind, canonicalFactId: string): string {
  return `owner-query:${kind.replaceAll("_", "-")}:${canonicalFactId}`;
}

function questionRevision(id: string, sourceRevision: string): string {
  return stableId("owner-preflight-question-revision", { questionId: id, sourceRevision });
}

function currentPrerequisiteAnswer(profile: OwnerGetStrongerProfileRevision, id: string,
  revision: string): string | null {
  const answer = profile.prerequisiteConfirmations?.find((entry) => entry.questionId === id);
  return answer?.questionRevisionId === revision ? answer.answer : null;
}

function currentEquipmentAvailabilityAnswer(profile: OwnerGetStrongerProfileRevision, id: string,
  revision: string): string | null {
  const answer = profile.equipmentCapabilitySnapshot.availabilityConfirmations
    ?.find((entry) => entry.questionId === id);
  return answer?.questionRevisionId === revision ? answer.answer : null;
}

function currentEquipmentCeilingAnswer(profile: OwnerGetStrongerProfileRevision, id: string,
  revision: string): string | null {
  const answer = profile.equipmentCapabilitySnapshot.loadCeilings?.find((entry) => entry.questionId === id);
  return answer?.questionRevisionId === revision ? answer.status : null;
}

function currentFamiliarityAnswer(profile: OwnerGetStrongerProfileRevision, id: string,
  revision: string): string | null {
  const answer = profile.familiarity.find((entry) => entry.questionId === id);
  return answer?.questionRevisionId === revision ? answer.answer ?? null : null;
}

function buildQuestion(profile: OwnerGetStrongerProfileRevision, input: Omit<OwnerProfilePreflightQuestion,
  "contract" | "questionId" | "questionRevisionId" | "sourceProfileRevisionId" | "currentAnswer"> & {
    readonly currentAnswer: (id: string, revision: string) => string | null;
  }): OwnerProfilePreflightQuestion {
  const id = questionId(input.kind, input.canonicalFactId);
  const revision = questionRevision(id, input.sourceRevision);
  return Object.freeze({ ...input, currentAnswer: input.currentAnswer(id, revision),
    contract: OWNER_DELIVERY_CONTRACTS.profilePreflight, questionId: id, questionRevisionId: revision,
    sourceProfileRevisionId: profile.revisionId });
}

export function buildOwnerPrerequisiteQuestion(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly prerequisite: ExercisePrerequisite;
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
  readonly responsibilityKey: string;
  readonly exerciseId: string;
}): OwnerProfilePreflightQuestion {
  const isSetup = input.prerequisite.type === "required_setup_skill";
  const kind: OwnerPreflightQuestionKind = isSetup ? "setup_support" : "movement_capability";
  const sourceRevision = stableId("owner-preflight-prerequisite-source", {
    engineVersion: input.engineVersion,
    sourceProductRevisionId: input.sourceProductRevisionId,
    prerequisite: input.prerequisite,
  });
  const prompt = input.prerequisite.id === "hinge-control"
    ? "Can you perform a hip hinge with a comfortable, controlled trunk position?"
    : isSetup
      ? `Can you confidently complete this setup: ${input.prerequisite.description}`
      : `Can you confidently meet this movement requirement: ${input.prerequisite.description}`;
  return buildQuestion(input.profile, {
    kind, canonicalFactId: input.prerequisite.id, sourceRevision, responseType: "confirmation",
    allowedAnswers: OWNER_CONFIRMATION_ANSWERS, prompt,
    why: `This is required before ${input.exerciseId} can be considered for the current responsibility.`,
    responsibilityKey: input.responsibilityKey,
    responsibilityLabel: ownerResponsibilityLabel(input.responsibilityKey), requiredBeforePreview: true,
    exerciseId: input.exerciseId, prerequisiteId: input.prerequisite.id,
    prerequisiteType: input.prerequisite.type, equipmentCapabilityId: null, equipmentId: null,
    technicalRefs: Object.freeze([input.prerequisite.id, input.prerequisite.type, input.exerciseId,
      input.sourceProductRevisionId]),
    currentAnswer: (id, revision) => currentPrerequisiteAnswer(input.profile, id, revision),
  });
}

export function buildOwnerFamiliarityQuestion(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly exerciseId: string;
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
  readonly responsibilityKey: string;
}): OwnerProfilePreflightQuestion {
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === input.exerciseId);
  if (!exercise) throw new Error(`OWNER_PREFLIGHT_EXERCISE_UNKNOWN:${input.exerciseId}`);
  const sourceRevision = stableId("owner-preflight-familiarity-source", {
    engineVersion: input.engineVersion, sourceProductRevisionId: input.sourceProductRevisionId,
    exerciseId: exercise.id, exerciseName: exercise.name,
  });
  return buildQuestion(input.profile, {
    kind: "exercise_familiarity", canonicalFactId: exercise.id, sourceRevision,
    responseType: "confirmation", allowedAnswers: OWNER_CONFIRMATION_ANSWERS,
    prompt: `Have you performed the ${exercise.name.toLowerCase()} with confident setup and control?`,
    why: "Exact exercise familiarity helps preserve setup truth without claiming load, tolerance, or progression history.",
    responsibilityKey: input.responsibilityKey,
    responsibilityLabel: ownerResponsibilityLabel(input.responsibilityKey), requiredBeforePreview: true,
    exerciseId: exercise.id, prerequisiteId: null, prerequisiteType: null,
    equipmentCapabilityId: null, equipmentId: null,
    technicalRefs: Object.freeze([`exercise:${exercise.id}`, input.sourceProductRevisionId]),
    currentAnswer: (id, revision) => currentFamiliarityAnswer(input.profile, id, revision),
  });
}

const equipmentLabels: Readonly<Partial<Record<EquipmentCapabilityKey, string>>> = Object.freeze({
  bodyweight: "bodyweight training",
  floor_space: "clear floor space",
  stable_loaded_standing_space: "stable standing space for loaded work",
  loaded_gait_space: "a clear path for loaded carries",
  wall: "a clear wall",
  stable_support_surface: "a stable support surface",
  flat_bench: "a stable flat bench",
  adjustable_bench: "a stable adjustable bench",
  box: "a stable box",
  dumbbells: "dumbbells",
  dumbbell_pair: "a matching dumbbell pair",
  barbell: "a barbell",
  squat_rack: "a rack with safeties",
  cable_stack: "a cable stack",
  cable_anchor_low: "a low cable anchor",
  cable_anchor_mid: "a mid-height cable anchor",
  cable_anchor_high: "a high cable anchor",
  selectorized_machine: "a selectorized machine",
  loop_band: "a loop band",
  tube_band: "a tube band with handles",
  band_anchor_low: "a stable low band anchor",
  band_anchor_mid: "a stable mid-height band anchor",
  band_anchor_high: "a stable high band anchor",
  pull_up_bar: "a vertical-pull station or pull-up bar",
});

export function buildOwnerEquipmentAvailabilityQuestion(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly capabilityId: EquipmentCapabilityKey | `machine:${MachineId}`;
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
  readonly responsibilityKey: string;
  readonly exerciseId: string;
}): OwnerProfilePreflightQuestion {
  const label = input.capabilityId.startsWith("machine:")
    ? `the exact ${input.capabilityId.slice("machine:".length).replaceAll("_", " ")} machine`
    : equipmentLabels[input.capabilityId as EquipmentCapabilityKey] ?? input.capabilityId.replaceAll("_", " ");
  const sourceRevision = stableId("owner-preflight-equipment-source", {
    contract: OWNER_DELIVERY_CONTRACTS.profilePreflightAnswer,
    capabilityId: input.capabilityId,
    environment: input.profile.equipmentCapabilitySnapshot.environment,
  });
  return buildQuestion(input.profile, {
    kind: "equipment_availability", canonicalFactId: input.capabilityId, sourceRevision,
    responseType: "confirmation", allowedAnswers: OWNER_CONFIRMATION_ANSWERS,
    prompt: `Is ${label} available in the setup you will use?`,
    why: `This equipment is relevant to ${input.exerciseId}; the environment label alone does not confirm it.`,
    responsibilityKey: input.responsibilityKey,
    responsibilityLabel: ownerResponsibilityLabel(input.responsibilityKey), requiredBeforePreview: true,
    exerciseId: input.exerciseId, prerequisiteId: null, prerequisiteType: null,
    equipmentCapabilityId: input.capabilityId, equipmentId: null,
    technicalRefs: Object.freeze([`equipment:${input.capabilityId}`, `exercise:${input.exerciseId}`,
      input.sourceProductRevisionId]),
    currentAnswer: (id, revision) => currentEquipmentAvailabilityAnswer(input.profile, id, revision),
  });
}

export function currentOwnerEquipmentAvailabilityAnswer(
  profile: OwnerGetStrongerProfileRevision,
  capabilityId: EquipmentCapabilityKey | `machine:${MachineId}`,
): OwnerConfirmationAnswer | null {
  const id = questionId("equipment_availability", capabilityId);
  const sourceRevision = stableId("owner-preflight-equipment-source", {
    contract: OWNER_DELIVERY_CONTRACTS.profilePreflightAnswer,
    capabilityId,
    environment: profile.equipmentCapabilitySnapshot.environment,
  });
  const record = profile.equipmentCapabilitySnapshot.availabilityConfirmations
    ?.find((entry) => entry.capabilityId === capabilityId);
  return record?.questionId === id && record.sourceRevision === sourceRevision &&
    record.questionRevisionId === questionRevision(id, sourceRevision) ? record.answer : null;
}

export function buildOwnerEquipmentCeilingQuestion(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly equipmentId: "dumbbells" | "barbell";
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
  readonly responsibilityKey: string;
  readonly exerciseId: string;
}): OwnerProfilePreflightQuestion {
  const sourceRevision = stableId("owner-preflight-equipment-ceiling-source", {
    equipmentId: input.equipmentId,
    environment: input.profile.equipmentCapabilitySnapshot.environment,
    capabilityIds: input.profile.equipmentCapabilitySnapshot.capabilityIds,
    availabilityConfirmations: input.profile.equipmentCapabilitySnapshot.availabilityConfirmations ?? [],
  });
  const prompt = input.equipmentId === "dumbbells"
    ? "What is the weight of each dumbbell in the heaviest matching pair available?"
    : "What is the maximum barbell load available with the confirmed rack and safeties?";
  return buildQuestion(input.profile, {
    kind: "equipment_load_ceiling", canonicalFactId: input.equipmentId, sourceRevision,
    responseType: "load_ceiling", allowedAnswers: Object.freeze(["provided", "unavailable", "not_sure",
      "not_reviewed"]), prompt,
    why: "The equipment ceiling is availability truth, not an estimate of your working weight.",
    responsibilityKey: input.responsibilityKey,
    responsibilityLabel: ownerResponsibilityLabel(input.responsibilityKey), requiredBeforePreview: true,
    exerciseId: input.exerciseId, prerequisiteId: null, prerequisiteType: null,
    equipmentCapabilityId: null, equipmentId: input.equipmentId,
    technicalRefs: Object.freeze([`equipment-ceiling:${input.equipmentId}`, input.sourceProductRevisionId]),
    currentAnswer: (id, revision) => currentEquipmentCeilingAnswer(input.profile, id, revision),
  });
}

export function currentOwnerEquipmentLoadCeiling(profile: OwnerGetStrongerProfileRevision,
  equipmentId: "dumbbells" | "barbell"): OwnerEquipmentLoadCeiling | null {
  const id = questionId("equipment_load_ceiling", equipmentId);
  const sourceRevision = stableId("owner-preflight-equipment-ceiling-source", {
    equipmentId,
    environment: profile.equipmentCapabilitySnapshot.environment,
    capabilityIds: profile.equipmentCapabilitySnapshot.capabilityIds,
    availabilityConfirmations: profile.equipmentCapabilitySnapshot.availabilityConfirmations ?? [],
  });
  const record = profile.equipmentCapabilitySnapshot.loadCeilings?.find((entry) => entry.equipmentId === equipmentId);
  if (record?.questionId === id && record.sourceRevision === sourceRevision &&
      record.questionRevisionId === questionRevision(id, sourceRevision)) return record;
  return null;
}

export function ownerLoadingQuestionSource(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
  readonly responsibilityKey: string;
  readonly exerciseId: string;
}): string {
  return stableId("owner-preflight-loading-source", {
    engineVersion: input.engineVersion,
    sourceProductRevisionId: input.sourceProductRevisionId,
    responsibilityKey: input.responsibilityKey,
    exerciseId: input.exerciseId,
    equipmentSourceRevision: input.profile.equipmentCapabilitySnapshot.sourceRevision,
    prerequisiteConfirmations: input.profile.prerequisiteConfirmations ?? [],
  });
}

export function currentOwnerLoadingSuitabilityConfirmation(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
  readonly responsibilityKey: string;
  readonly exerciseId: string;
}): OwnerLoadingSuitabilityConfirmation | null {
  const sourceRevision = ownerLoadingQuestionSource(input);
  const id = questionId("loading_suitability", input.responsibilityKey);
  const record = input.profile.loadingSuitabilityConfirmations?.find((entry) =>
    entry.responsibilityKey === input.responsibilityKey && entry.exerciseId === input.exerciseId);
  return record?.sourceRevision === sourceRevision && record.questionId === id &&
    record.questionRevisionId === questionRevision(id, sourceRevision) ? record : null;
}

export function buildOwnerLoadingSuitabilityQuestion(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
  readonly responsibilityKey: string;
  readonly exerciseId: string;
}): OwnerProfilePreflightQuestion {
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === input.exerciseId);
  if (!exercise) throw new Error(`OWNER_PREFLIGHT_EXERCISE_UNKNOWN:${input.exerciseId}`);
  const sourceRevision = ownerLoadingQuestionSource(input);
  return buildQuestion(input.profile, {
    kind: "loading_suitability", canonicalFactId: input.responsibilityKey, sourceRevision,
    responseType: "confirmation", allowedAnswers: OWNER_CONFIRMATION_ANSWERS,
    prompt: `Can the confirmed ${exercise.name.toLowerCase()} setup provide an appropriate strength challenge?`,
    why: "A Yes permits effort-guided initial calibration. It does not record or guess a working load.",
    responsibilityKey: input.responsibilityKey,
    responsibilityLabel: ownerResponsibilityLabel(input.responsibilityKey), requiredBeforePreview: true,
    exerciseId: exercise.id, prerequisiteId: null, prerequisiteType: null,
    equipmentCapabilityId: null, equipmentId: null,
    technicalRefs: Object.freeze([`responsibility:${input.responsibilityKey}`, `exercise:${exercise.id}`,
      input.profile.equipmentCapabilitySnapshot.sourceRevision]),
    currentAnswer: () => currentOwnerLoadingSuitabilityConfirmation(input)?.answer ?? null,
  });
}

export function buildOwnerProfilePreflight(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly questions: readonly OwnerProfilePreflightQuestion[];
  readonly blockerCodes: readonly string[];
}): OwnerProfilePreflight {
  const byId = new Map<string, OwnerProfilePreflightQuestion>();
  for (const question of input.questions) {
    if (!byId.has(question.questionId)) byId.set(question.questionId, question);
  }
  const boundedQuestions = [...byId.values()]
    .sort((left, right) => left.questionId.localeCompare(right.questionId))
    .slice(0, OWNER_PROFILE_PREFLIGHT_MAX_QUESTIONS);
  const overflow = byId.size > OWNER_PROFILE_PREFLIGHT_MAX_QUESTIONS
    ? ["OWNER_PROFILE_PREFLIGHT_QUESTION_BOUND_EXCEEDED"] : [];
  const blockers = uniqueSorted([...input.blockerCodes, ...overflow]);
  const status = overflow.length || blockers.length && boundedQuestions.length === 0
    ? "blocked" as const : boundedQuestions.length ? "questions_required" as const : "ready" as const;
  const semantic = Object.freeze({ contract: OWNER_DELIVERY_CONTRACTS.profilePreflight,
    profileId: input.profile.profileId, sourceProfileRevisionId: input.profile.revisionId, status,
    questions: Object.freeze(boundedQuestions), blockerCodes: Object.freeze(blockers),
    maximumQuestionCount: OWNER_PROFILE_PREFLIGHT_MAX_QUESTIONS, bounded: true as const });
  return Object.freeze({ ...semantic, preflightFingerprint: stableId("owner-profile-preflight", semantic) });
}

export function ownerSatisfiedPrerequisiteIds(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
}): readonly string[] {
  const prerequisites = new Map(REFERENCE_EXERCISES.flatMap((exercise) =>
    exercise.prerequisites.map((prerequisite) => [prerequisite.id, prerequisite] as const)));
  return uniqueSorted((input.profile.prerequisiteConfirmations ?? []).flatMap((entry) => {
    const prerequisite = prerequisites.get(entry.prerequisiteId);
    if (!prerequisite || entry.answer !== "yes" || entry.prerequisiteType !== prerequisite.type) return [];
    const expectedSource = stableId("owner-preflight-prerequisite-source", {
      engineVersion: input.engineVersion, sourceProductRevisionId: input.sourceProductRevisionId, prerequisite,
    });
    const expectedQuestionId = questionId(prerequisite.type === "required_setup_skill" ? "setup_support" :
      "movement_capability", prerequisite.id);
    return entry.sourceRevision === expectedSource && entry.questionId === expectedQuestionId &&
      entry.questionRevisionId === questionRevision(expectedQuestionId, expectedSource) ? [entry.prerequisiteId] : [];
  }));
}

export function buildOwnerLoadingEvidence(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly sourceProductRevisionId: string;
  readonly engineVersion: string;
  readonly confirmedCalibrationResponsibilityIds?: readonly string[];
  readonly calibrationEvidenceRevisionIds?: readonly string[];
}): readonly ProductGetStrongerDevelopLoadingEvidence[] {
  return PRODUCT_GET_STRONGER_DEVELOP_FOUNDATION_KEYS.map((foundationKey) => {
    const responsibilityKey = `foundation:${foundationKey}`;
    const records = (input.profile.loadingSuitabilityConfirmations ?? []).filter((entry) =>
      entry.responsibilityKey === responsibilityKey).map((entry) => ({ entry,
        valid: currentOwnerLoadingSuitabilityConfirmation({ ...input, responsibilityKey,
          exerciseId: entry.exerciseId }) !== null }));
    const record = records.find(({ entry, valid }) => valid && entry.answer === "yes")?.entry ??
      records.find(({ valid }) => valid)?.entry;
    const confirmedByCalibration = input.confirmedCalibrationResponsibilityIds?.includes(responsibilityKey) ?? false;
    const sourceFactIds = [input.profile.revisionId,
      ...(confirmedByCalibration ? input.calibrationEvidenceRevisionIds ?? [] : [])];
    let valid = false;
    if (record) {
      valid = currentOwnerLoadingSuitabilityConfirmation({ ...input, responsibilityKey,
        exerciseId: record.exerciseId }) !== null;
      if (valid) sourceFactIds.push(stableId("owner-loading-suitability-fact", record));
    }
    const state = confirmedByCalibration ? "confirmed" as const :
      valid && record?.answer === "yes" ? "bounded_initial_calibration" as const :
      "unresolved" as const;
    return Object.freeze({ evidenceId: stableId("owner-loading-evidence", {
      responsibilityKey, state, sourceFactIds }), responsibilityKey, state,
    sourceFactIds: Object.freeze(sourceFactIds),
    ...(state === "unresolved" ? {
      unresolvedCapabilityRef: questionId("loading_suitability", responsibilityKey),
    } : {}) });
  });
}

function upsert<T>(values: readonly T[], value: T, same: (left: T, right: T) => boolean): readonly T[] {
  return Object.freeze([...values.filter((entry) => !same(entry, value)), value]);
}

function confirmationTime(answer: string, answeredAt: string): string | null {
  return answer === "yes" || answer === "no" || answer === "provided" || answer === "unavailable"
    ? answeredAt : null;
}

function provenance(question: OwnerProfilePreflightQuestion): OwnerRecordProvenance {
  return Object.freeze({ source: "owner_confirmation" as const,
    sourceRefs: Object.freeze([question.questionId, question.questionRevisionId, question.sourceRevision]) });
}

function normalizedKilograms(value: number, unit: OwnerLoadUnit): number {
  return unit === "kg" ? value : value * 0.45359237;
}

export function applyOwnerProfilePreflightAnswers(input: {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly preflight: OwnerProfilePreflight;
  readonly answers: readonly OwnerProfilePreflightAnswerSubmission[];
  readonly answeredAt: string;
}): OwnerApplyPreflightAnswersResult {
  const reasons: string[] = [];
  if (input.preflight.sourceProfileRevisionId !== input.profile.revisionId) {
    reasons.push("OWNER_PROFILE_PREFLIGHT_SOURCE_REVISION_STALE");
  }
  if (!explicitIsoTime(input.answeredAt) || input.answers.length === 0 ||
      input.answers.length > OWNER_PROFILE_PREFLIGHT_MAX_QUESTIONS) {
    reasons.push("OWNER_PROFILE_PREFLIGHT_ANSWER_SET_INVALID");
  }
  if (new Set(input.answers.map((entry) => entry.questionId)).size !== input.answers.length) {
    reasons.push("OWNER_PROFILE_PREFLIGHT_ANSWER_DUPLICATE");
  }
  const questions = new Map(input.preflight.questions.map((question) => [question.questionId, question]));
  for (const answer of input.answers) {
    const question = questions.get(answer.questionId);
    if (!question || question.questionRevisionId !== answer.questionRevisionId ||
        !question.allowedAnswers.includes(answer.answer)) {
      reasons.push(`OWNER_PROFILE_PREFLIGHT_ANSWER_STALE_OR_INVALID:${answer.questionId}`);
    }
    if (question?.responseType === "load_ceiling" && answer.answer === "provided" &&
        (!("value" in answer) || !("unit" in answer) || typeof answer.value !== "number" ||
          !Number.isFinite(answer.value) || answer.value <= 0 || !["kg", "lb"].includes(String(answer.unit)))) {
      reasons.push(`OWNER_PROFILE_PREFLIGHT_LOAD_CEILING_INVALID:${answer.questionId}`);
    }
  }
  if (reasons.length || !isOwnerAvailableTrainingDays(input.profile.daysPerWeek)) {
    return Object.freeze({ status: "rejected", profile: null,
      reasonCodes: Object.freeze(uniqueSorted([...reasons,
        ...(!isOwnerAvailableTrainingDays(input.profile.daysPerWeek) ?
          ["OWNER_PROFILE_AVAILABILITY_RECONFIRMATION_REQUIRED"] : [])])) });
  }

  let prerequisites = input.profile.prerequisiteConfirmations ?? [];
  let familiarity = input.profile.familiarity;
  let equipmentAvailability = input.profile.equipmentCapabilitySnapshot.availabilityConfirmations ?? [];
  let loadCeilings = input.profile.equipmentCapabilitySnapshot.loadCeilings ?? [];
  let loadingSuitability = input.profile.loadingSuitabilityConfirmations ?? [];
  const capabilityIds = input.profile.equipmentCapabilitySnapshot.capabilityIds;
  let equipmentChanged = false;

  for (const answer of input.answers) {
    const question = questions.get(answer.questionId)!;
    const base = { questionId: question.questionId, questionRevisionId: question.questionRevisionId,
      sourceRevision: question.sourceRevision, confirmationTime: confirmationTime(answer.answer, input.answeredAt),
      provenance: provenance(question) };
    if (question.kind === "movement_capability" || question.kind === "setup_support") {
      prerequisites = upsert(prerequisites, Object.freeze({ ...base,
        prerequisiteId: question.prerequisiteId!, prerequisiteType: question.prerequisiteType!,
        answer: answer.answer as OwnerConfirmationAnswer }) satisfies OwnerPrerequisiteConfirmation,
      (left, right) => left.prerequisiteId === right.prerequisiteId);
    } else if (question.kind === "exercise_familiarity") {
      const response = answer.answer as OwnerConfirmationAnswer;
      familiarity = upsert(familiarity, Object.freeze({ exerciseId: question.exerciseId!, realizationId: null,
        status: response === "yes" ? "known" as const : response === "no" ? "unknown" as const :
          "calibration_required" as const, answer: response, ...base }),
      (left, right) => left.exerciseId === right.exerciseId && left.realizationId === right.realizationId);
    } else if (question.kind === "equipment_availability") {
      const response = answer.answer as OwnerConfirmationAnswer;
      const capabilityId = question.equipmentCapabilityId!;
      equipmentAvailability = upsert(equipmentAvailability, Object.freeze({ ...base, capabilityId,
        answer: response }) satisfies OwnerEquipmentAvailabilityConfirmation,
      (left, right) => left.capabilityId === right.capabilityId);
      equipmentChanged = true;
    } else if (question.kind === "equipment_load_ceiling") {
      const provided = answer.answer === "provided";
      const value = provided && "value" in answer ? answer.value! : null;
      const unit = provided && "unit" in answer ? answer.unit! : null;
      loadCeilings = upsert(loadCeilings, Object.freeze({ ...base, equipmentId: question.equipmentId!,
        status: answer.answer as OwnerEquipmentLoadCeiling["status"], enteredValue: value,
        enteredUnit: unit, normalizedKilograms: value !== null && unit ? normalizedKilograms(value, unit) : null,
      }) satisfies OwnerEquipmentLoadCeiling, (left, right) => left.equipmentId === right.equipmentId);
      equipmentChanged = true;
    } else if (question.kind === "loading_suitability" || question.kind === "calibration") {
      loadingSuitability = upsert(loadingSuitability, Object.freeze({ ...base,
        responsibilityKey: question.responsibilityKey, exerciseId: question.exerciseId!,
        answer: answer.answer as OwnerConfirmationAnswer }) satisfies OwnerLoadingSuitabilityConfirmation,
      (left, right) => left.responsibilityKey === right.responsibilityKey &&
        left.exerciseId === right.exerciseId);
    }
  }

  const equipmentSourceRevision = equipmentChanged ? stableId("owner-equipment", {
    basedOn: input.profile.equipmentCapabilitySnapshot.sourceRevision, capabilityIds,
    availabilityConfirmations: equipmentAvailability, loadCeilings,
  }) : input.profile.equipmentCapabilitySnapshot.sourceRevision;
  const profile = buildOwnerProfileRevision({ profileId: input.profile.profileId,
    userId: input.profile.userId, basedOnRevisionId: input.profile.revisionId,
    primaryGoal: input.profile.primaryGoal, trainingMode: input.profile.trainingMode,
    secondaryGoal: input.profile.secondaryGoal, daysPerWeek: input.profile.daysPerWeek,
    sessionOpportunities: input.profile.sessionOpportunities, sessionMinutes: input.profile.sessionMinutes,
    equipmentCapabilitySnapshot: { ...input.profile.equipmentCapabilitySnapshot, capabilityIds,
      sourceRevision: equipmentSourceRevision, availabilityConfirmations: equipmentAvailability, loadCeilings },
    coarseExperience: input.profile.coarseExperience, familiarity,
    prerequisiteConfirmations: prerequisites, loadingSuitabilityConfirmations: loadingSuitability,
    painContext: input.profile.painContext, assessmentReferences: input.profile.assessmentReferences,
    trainingSafety: input.profile.trainingSafety, continuityReferences: input.profile.continuityReferences,
    evaluationTime: input.answeredAt, provenance: { source: "owner_confirmation",
      sourceRefs: uniqueSorted([input.profile.revisionId,
        ...input.answers.map((entry) => entry.questionRevisionId)]) },
    reviewState: input.profile.reviewState, createdAt: input.answeredAt });
  return Object.freeze({ status: "revised", profile, reasonCodes: Object.freeze([]) });
}
