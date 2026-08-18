import { describe, expect, it } from "vitest";
import {
  GENERATED_EXERCISE_COACHING_FALLBACKS,
} from "../../src/data/generatedExerciseCoachingFallbacks";
import {
  PREPARATION_KNOWLEDGE_PROFILES,
  REFERENCE_EXERCISES,
  getPreparationKnowledgeProfile,
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

  it("publishes explicit selection, fatigue, equipment, and timing boundaries", () => {
    expect(PREPARATION_KNOWLEDGE_PROFILES.length).toBeGreaterThanOrEqual(13);
    for (const profile of PREPARATION_KNOWLEDGE_PROFILES) {
      expect(REFERENCE_EXERCISES.some((exercise) => exercise.id === profile.exerciseId)).toBe(true);
      expect(profile.compatibleDemandIds.length).toBeGreaterThan(0);
      expect(profile.equipmentRequirementIds.length).toBeGreaterThan(0);
      expect(profile.evidenceRefs.length).toBeGreaterThan(0);
      expect(profile.explanation.length).toBeGreaterThan(20);
    }
    const staticRange = getPreparationKnowledgeProfile("half-kneeling-hip-flexor-stretch")!;
    expect(staticRange.dosage).toMatchObject({ doseMode: "static_hold", maximum: 45, unit: "seconds" });
    expect(staticRange.timingConstraints.join(" ")).toContain("followed by dynamic or task-specific preparation");
    expect(getPreparationKnowledgeProfile("serratus-wall-slide")?.incompatibleConditionIds)
      .toContain("wall_unavailable");
    expect(getPreparationKnowledgeProfile("scapular-push-up")?.mechanicalStressTags)
      .toContain("wrist_extension_loading");
  });
});
