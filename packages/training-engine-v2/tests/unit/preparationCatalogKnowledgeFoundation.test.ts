import { describe, expect, it } from "vitest";
import {
  GENERATED_EXERCISE_COACHING_FALLBACKS,
} from "../../src/data/generatedExerciseCoachingFallbacks";
import {
  REFERENCE_EXERCISES,
} from "../../src";
import {
  PREPARATION_FOUNDATION_KNOWLEDGE_ENTRIES,
} from "../../../praxis-knowledge-core/src/entries/preparationFoundation";
import {
  PRODUCTION_69_KNOWLEDGE_CORE,
  PRODUCTION_69_KNOWLEDGE_ENTRIES,
} from "../../../praxis-knowledge-core/src/registry";
import { validateKnowledgeCore } from "../../../praxis-knowledge-core/src/validation";
import { PREPARATION_FOUNDATION_ADMITTED_IDS } from "../preparationIntelligence/candidateAudit";

const admitted = new Set(PREPARATION_FOUNDATION_ADMITTED_IDS);

describe("preparation catalog and Knowledge foundation", () => {
  it("admits five unique canonical identities into a 69-row production catalog", () => {
    expect(REFERENCE_EXERCISES).toHaveLength(69);
    expect(new Set(REFERENCE_EXERCISES.map((entry) => entry.id)).size).toBe(69);
    expect(REFERENCE_EXERCISES.filter((entry) => admitted.has(entry.id)).map((entry) => entry.id))
      .toEqual(PREPARATION_FOUNDATION_ADMITTED_IDS);
  });

  it("preserves exact identity boundaries and typed mechanics", () => {
    const byId = new Map(REFERENCE_EXERCISES.map((entry) => [entry.id, entry]));
    expect(byId.get("moving-ninety-ninety-hip-switch")?.actionFunctions.map((entry) => entry.action))
      .toEqual(["hip_internal_rotation", "hip_external_rotation"]);
    expect(byId.get("quadruped-hip-rock-back")?.actionFunctions.map((entry) => entry.action))
      .toEqual(["hip_flexion"]);
    expect(byId.get("scapular-push-up")?.actionFunctions.map((entry) => entry.action))
      .toEqual(["scapular_protraction"]);
    expect(byId.get("bodyweight-squat-rehearsal")?.equipmentRequirements.map((entry) => entry.id))
      .toEqual(["bodyweight-standing-space"]);
    expect(byId.get("half-kneeling-hip-flexor-stretch")?.prescriptionKnowledge.timingModel)
      .toBe("isometric_hold");
    expect(byId.has("wall-slide")).toBe(false);
    expect(byId.has("couch-stretch")).toBe(false);
  });

  it("provides complete canonical Knowledge for every admitted identity", () => {
    expect(PREPARATION_FOUNDATION_KNOWLEDGE_ENTRIES).toHaveLength(5);
    expect(PREPARATION_FOUNDATION_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId))
      .toEqual(PREPARATION_FOUNDATION_ADMITTED_IDS);
    expect(PREPARATION_FOUNDATION_KNOWLEDGE_ENTRIES.every((entry) =>
      entry.presentation.setup.length > 0 &&
      entry.presentation.during.length > 0 &&
      entry.presentation.watchFor.length > 0 &&
      entry.provenance.length > 0 &&
      entry.facts.every((fact) => fact.provenance.length > 0)))
      .toBe(true);
    expect(PRODUCTION_69_KNOWLEDGE_ENTRIES).toHaveLength(69);
    expect(new Set(PRODUCTION_69_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId)).size).toBe(69);
    expect(validateKnowledgeCore(PRODUCTION_69_KNOWLEDGE_CORE)).toEqual([]);
  });

  it("keeps generated compact fallbacks traceable to canonical Knowledge facts", () => {
    for (const exerciseId of PREPARATION_FOUNDATION_ADMITTED_IDS) {
      const fallback = GENERATED_EXERCISE_COACHING_FALLBACKS[exerciseId];
      expect(fallback).toBeDefined();
      expect(fallback.sourceFactIds.length).toBeGreaterThanOrEqual(2);
      expect(fallback.sourceFactIds.every((factId) => factId.startsWith(`${exerciseId}.`))).toBe(true);
    }
  });

  it("keeps exercise, Candidate, Prescription, and Safety facts canonical", () => {
    const byId = new Map(REFERENCE_EXERCISES.map((exercise) => [exercise.id, exercise]));
    expect(byId.get("serratus-wall-slide")?.equipmentRequirements.map((entry) => entry.id))
      .toEqual(["wall-support"]);
    expect(byId.get("serratus-wall-slide")?.cautionStressTags).toContain("overhead_pressing");
    expect(byId.get("scapular-push-up")?.loading.jointStressTags)
      .toContain("wrist_extension_loading");
    expect(byId.get("half-kneeling-hip-flexor-stretch")?.prescriptionKnowledge)
      .toMatchObject({ timingModel: "isometric_hold", primaryDoseMode: "timed_hold" });
    expect(byId.get("dead-bug")?.loading).toMatchObject({
      loadingPotential: "low",
      localFatigue: "low",
      systemicFatigue: "low",
    });
  });
});
