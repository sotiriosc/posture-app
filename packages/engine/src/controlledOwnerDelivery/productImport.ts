import { stableId, uniqueSorted, type ProposedOwnerImportFact } from "@praxis/training-engine-v2";
import type { TrainingSnapshot } from "../trainingStateModel";
import type { OwnerProductImportAdapter } from "./contracts";

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? Object.freeze(uniqueSorted(value.filter((entry): entry is string => typeof entry === "string")))
    : Object.freeze([]);
}

function assessmentObservationIds(value: unknown): readonly string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return Object.freeze([]);
  const observations = (value as Record<string, unknown>).observations;
  if (!Array.isArray(observations)) return Object.freeze([]);
  return Object.freeze(uniqueSorted(observations.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const id = (entry as Record<string, unknown>).id;
    return typeof id === "string" && id.trim() ? [id.trim()] : [];
  })));
}

export function proposeOwnerImportsFromTrainingSnapshot(input: {
  readonly snapshot: TrainingSnapshot;
  readonly sourceRevision: string;
}): readonly ProposedOwnerImportFact[] {
  const questionnaire = input.snapshot.questionnaire ?? {};
  const assessment = input.snapshot.assessment ?? {};
  const facts: ProposedOwnerImportFact[] = [];
  const add = (field: ProposedOwnerImportFact["field"], structuredValue: ProposedOwnerImportFact["structuredValue"],
    status: ProposedOwnerImportFact["status"] = "requires_confirmation") => {
    facts.push(Object.freeze({
      factId: stableId("owner-product-import", { field, structuredValue, sourceRevision: input.sourceRevision }),
      field,
      status,
      structuredValue,
      sourceRevision: input.sourceRevision,
    }));
  };
  const days = questionnaire.daysPerWeek;
  add("days", typeof days === "number" && Number.isInteger(days) ? days : null,
    typeof days === "number" ? "requires_confirmation" : "unknown");
  const equipment = stringArray(questionnaire.equipment);
  add("top_level_equipment", equipment, equipment.length ? "requires_confirmation" : "unknown");
  const painRegions = stringArray(questionnaire.painAreas ?? questionnaire.painRegions);
  painRegions.forEach((region) => add("pain_region", region));
  add("experience", typeof questionnaire.experience === "string" ? questionnaire.experience : null,
    typeof questionnaire.experience === "string" ? "requires_confirmation" : "unknown");
  assessmentObservationIds(assessment).forEach((observationId) =>
    add("assessment_reference", `assessment:observation:${observationId}`));
  const continuity = Object.keys(input.snapshot.meta?.sessionUpdatedAtById ?? {}).sort();
  continuity.forEach((sessionId) => add("continuity_reference", `legacy-session:${sessionId}`));
  return Object.freeze(facts);
}

export function createOwnerProductImportAdapter(input: {
  readonly loadSnapshot: (userId: string) => Promise<TrainingSnapshot>;
  readonly sourceRevision: (snapshot: TrainingSnapshot) => string;
}): OwnerProductImportAdapter {
  const adapter: OwnerProductImportAdapter = {
    loadProposedFacts: async (userId) => {
      const snapshot = await input.loadSnapshot(userId);
      return proposeOwnerImportsFromTrainingSnapshot({ snapshot, sourceRevision: input.sourceRevision(snapshot) });
    },
  };
  return Object.freeze(adapter);
}
