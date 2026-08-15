import { stableId } from "@praxis/training-engine-v2";
import type { Program } from "../types";
import type { TrainingSnapshot } from "../trainingStateModel";
import { resolveActiveProgramFromList, stableTrainingStringify } from "../trainingStateModel";
import { PRODUCT_TRAINING_SNAPSHOT_SHADOW_SOURCE_REFERENCE, type ControlledProductShadowTrigger,
  type ProductSnapshotReference, type ProductTrainingSnapshotShadowSource } from "./contracts";

const OMITTED_KEYS = new Set(["notes", "feedbackNotes", "sessionFeedbackNotes", "title", "name", "cues",
  "rationale", "coachMessage", "summary", "updatedAt", "createdAt"]);

function semanticProductValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(semanticProductValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter(([key, entry]) => entry !== undefined && !OMITTED_KEYS.has(key))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => [key, semanticProductValue(entry)]));
}

export function deriveProductLegacyProgramRevision(program: Program): string {
  return stableId("product-legacy-program-revision", semanticProductValue({ id: program.id,
    templateVersion: program.templateVersion ?? null, questionnaireSignature: program.questionnaireSignature ?? null,
    goalTrack: program.goalTrack, daysPerWeek: program.daysPerWeek, phaseIndex: program.phaseIndex ?? null,
    weekIndex: program.weekIndex ?? null, cycleIndex: program.cycleIndex ?? null,
    week: [...program.week].sort((left, right) => left.dayIndex - right.dayIndex).map((day) => ({
      dayIndex: day.dayIndex, routine: day.routine.map((item) => semanticProductValue(item)),
    })) }));
}

function recordRevision(namespace: string, id: string, value: unknown, serverUpdatedAt?: string): string {
  return stableId(namespace, { id, value: semanticProductValue(value), serverUpdatedAt: serverUpdatedAt ?? null });
}

export function buildProductSnapshotReference(snapshot: TrainingSnapshot): ProductSnapshotReference {
  const programs = snapshot.programs ?? [];
  const active = resolveActiveProgramFromList(programs, undefined);
  const program = active.program;
  const progress = (snapshot.programProgress ?? []).find((entry) => entry.programId === active.programId) ?? null;
  const questionnaireRevisionId = snapshot.questionnaire === undefined ? null :
    stableId("product-questionnaire-revision", semanticProductValue(snapshot.questionnaire));
  const assessmentRevisionId = snapshot.assessment === undefined ? null :
    stableId("product-assessment-revision", semanticProductValue(snapshot.assessment));
  const preferenceRevisionId = snapshot.prefs === undefined ? null :
    stableId("product-preference-revision", semanticProductValue(snapshot.prefs));
  const activeProgramRevisionId = program ? deriveProductLegacyProgramRevision(program) : null;
  const programProgressRevisionId = progress ? recordRevision("product-program-progress-revision", progress.programId,
    progress, snapshot.meta?.programProgressUpdatedAtByProgramId?.[progress.programId]) : null;
  const sessionRevisionIds = (snapshot.sessions ?? []).map((entry) => recordRevision("product-session-revision",
    entry.id, entry, snapshot.meta?.sessionUpdatedAtById?.[entry.id])).sort();
  const exerciseLogRevisionIds = (snapshot.exerciseLogs ?? []).map((entry) => recordRevision(
    "product-exercise-log-revision", entry.id, entry, snapshot.meta?.exerciseLogUpdatedAtById?.[entry.id])).sort();
  const serverRevisionReferences = [snapshot.meta?.stateUpdatedAt ?? null,
    ...Object.entries(snapshot.meta?.programUpdatedAtById ?? {}).map(([id, time]) => `program:${id}:${time}`),
    ...Object.entries(snapshot.meta?.programProgressUpdatedAtByProgramId ?? {}).map(([id, time]) =>
      `progress:${id}:${time}`),
    ...Object.entries(snapshot.meta?.sessionUpdatedAtById ?? {}).map(([id, time]) => `session:${id}:${time}`),
    ...Object.entries(snapshot.meta?.exerciseLogUpdatedAtById ?? {}).map(([id, time]) => `log:${id}:${time}`)]
    .filter((value): value is string => Boolean(value)).sort();
  const productStateRevisionFingerprint = stableId("product-training-state-revision", {
    questionnaire: semanticProductValue(snapshot.questionnaire), assessment: semanticProductValue(snapshot.assessment),
    preferences: semanticProductValue(snapshot.prefs), activeProgramRevisionId, programProgressRevisionId,
    sessionRevisionIds, exerciseLogRevisionIds, deletedPrograms: programs.filter((entry) => entry.deletedAt)
      .map((entry) => entry.id).sort() });
  return Object.freeze({ productStateRevisionFingerprint, questionnaireRevisionId, assessmentRevisionId,
    preferenceRevisionId, activeProgramId: active.programId, activeProgramRevisionId,
    activeProgramResolution: active.source, staleActiveProgramId: active.staleActiveProgramId,
    programProgressRevisionId, sessionRevisionIds: Object.freeze(sessionRevisionIds),
    exerciseLogRevisionIds: Object.freeze(exerciseLogRevisionIds),
    serverRevisionReferences: Object.freeze(serverRevisionReferences) });
}

export function verifyControlledProductShadowTriggerReferences(input: {
  readonly trigger: ControlledProductShadowTrigger;
  readonly snapshot: TrainingSnapshot;
  readonly reference: ProductSnapshotReference;
}): "product_snapshot_current" | "product_snapshot_pending_sync" | "product_snapshot_reference_missing" |
  "product_snapshot_conflict" | "product_snapshot_unavailable" {
  const ids = new Set([...(input.snapshot.programs ?? []).map((entry) => entry.id),
    ...(input.snapshot.programProgress ?? []).map((entry) => entry.programId),
    ...(input.snapshot.sessions ?? []).map((entry) => entry.id),
    ...(input.snapshot.exerciseLogs ?? []).map((entry) => entry.id)]);
  if (!input.snapshot.meta) return "product_snapshot_unavailable";
  if (input.trigger.anchorProgramId && input.reference.activeProgramId &&
      input.trigger.anchorProgramId !== input.reference.activeProgramId) return "product_snapshot_conflict";
  const missing = input.trigger.changedEntityIds.filter((id) => !ids.has(id));
  if (missing.length && input.trigger.changedEntityCategories.some((category) =>
    category === "session" || category === "exercise_log")) return "product_snapshot_pending_sync";
  if (missing.length) return "product_snapshot_reference_missing";
  return "product_snapshot_current";
}

export function buildProductTrainingSnapshotShadowSource(input: {
  readonly athleteId: string;
  readonly trigger: ControlledProductShadowTrigger;
  readonly snapshot: TrainingSnapshot;
  readonly reference: ProductSnapshotReference;
  readonly evaluationTime: string;
  readonly unresolvedMappings: readonly string[];
}): ProductTrainingSnapshotShadowSource {
  const sourceSnapshotId = stableId("product-training-shadow-source", { athleteId: input.athleteId,
    triggerFamily: input.trigger.triggerKind });
  const included = [input.reference.questionnaireRevisionId, input.reference.assessmentRevisionId,
    input.reference.preferenceRevisionId, input.reference.activeProgramRevisionId,
    input.reference.programProgressRevisionId, ...input.reference.sessionRevisionIds,
    ...input.reference.exerciseLogRevisionIds].filter((value): value is string => Boolean(value)).sort();
  const sourceSnapshotRevisionId = stableId("product-training-shadow-source-revision", { sourceSnapshotId,
    productStateRevisionFingerprint: input.reference.productStateRevisionFingerprint,
    triggerRevisionId: input.trigger.triggerRevisionId, included, evaluationTime: input.evaluationTime });
  return Object.freeze({ sourceContract: PRODUCT_TRAINING_SNAPSHOT_SHADOW_SOURCE_REFERENCE, sourceSnapshotId,
    sourceSnapshotRevisionId, athleteId: input.athleteId, authenticatedProductUserReference: input.athleteId,
    productStateRevisionFingerprint: input.reference.productStateRevisionFingerprint,
    questionnaireSourceRevision: input.reference.questionnaireRevisionId,
    assessmentSourceRevision: input.reference.assessmentRevisionId,
    preferenceSourceRevision: input.reference.preferenceRevisionId,
    activeProgramIdentity: input.reference.activeProgramId,
    activeProgramRevision: input.reference.activeProgramRevisionId,
    programProgressIdentity: input.reference.activeProgramId,
    programProgressRevision: input.reference.programProgressRevisionId,
    relevantSessionRevisions: input.reference.sessionRevisionIds,
    relevantExerciseLogRevisions: input.reference.exerciseLogRevisionIds,
    triggerIdentity: input.trigger.triggerId, triggerRevision: input.trigger.triggerRevisionId,
    evaluationTime: input.evaluationTime, includedSourceReferences: Object.freeze(included),
    excludedSourceReferences: Object.freeze(["raw_product_snapshot", "free_text", "email", "photos", "auth_token"]),
    unresolvedMappings: Object.freeze([...input.unresolvedMappings].sort()),
    provenance: Object.freeze(["product-shadow-source:authenticated-server-reload",
      `snapshot-size-fingerprint:${stableTrainingStringify(input.reference).length}`]) });
}
