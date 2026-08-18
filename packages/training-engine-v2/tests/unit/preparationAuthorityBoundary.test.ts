import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  REFERENCE_EXERCISES,
  isLowFatigueActivationCandidate,
} from "../../src";

const repositoryRoot = resolve(import.meta.dirname, "../../../..");
const engineSourceRoot = resolve(repositoryRoot, "packages/training-engine-v2/src");

function typeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return typeScriptFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  }).sort();
}

function source(path: string): string {
  return readFileSync(resolve(engineSourceRoot, path), "utf8");
}

function exercise(exerciseId: string) {
  const match = REFERENCE_EXERCISES.find((entry) => entry.id === exerciseId);
  if (!match) throw new Error(`Missing canonical exercise ${exerciseId}.`);
  return match;
}

describe("preparation authority boundaries", () => {
  it("has no production PreparationKnowledgeProfile or replacement preparation registry", () => {
    const productionFiles = typeScriptFiles(engineSourceRoot);
    const violations = productionFiles.filter((file) =>
      /PreparationKnowledgeProfile|PREPARATION_KNOWLEDGE_PROFILES|getPreparationKnowledgeProfile/.test(
        readFileSync(file, "utf8"),
      ));

    expect(existsSync(resolve(engineSourceRoot, "preparation/profiles.ts"))).toBe(false);
    expect(violations.map((file) => file.slice(repositoryRoot.length + 1))).toEqual([]);
  });

  it("keeps selection, safety, dose, and order with their canonical owners", () => {
    const derivation = source("sessionPlanner/derivePreparationNeeds.ts");
    const ownerPipeline = source("ownerDelivery/pipeline.ts");
    const candidateSource = source("candidate/scoring/components/loadStimulusCostEquipment.ts");

    expect(derivation).not.toMatch(/REFERENCE_EXERCISES|scapular-push-up|serratus-wall-slide|dead-bug/);
    expect(ownerPipeline).toContain("input.candidates[needId]?.rankedCandidates");
    expect(ownerPipeline).toContain("buildControlledOwnerPainAndInjuryState");
    expect(ownerPipeline).toContain("compileSessionPrescription");
    expect(ownerPipeline).toContain("sequenceFinalSession");
    expect(ownerPipeline).not.toMatch(/fatigueCost|dosage|timingConstraints|painConsiderations/);
    expect(candidateSource).toContain("exercise.loading.localFatigue");
    expect(candidateSource).toContain("exercise.loading.systemicFatigue");
  });

  it("derives activation fatigue suitability from canonical Candidate loading facts", () => {
    for (const exerciseId of [
      "serratus-wall-slide",
      "scapular-push-up",
      "dead-bug",
      "bird-dog",
      "bodyweight-squat-rehearsal",
      "bodyweight-hip-hinge-rehearsal",
      "single-leg-balance-rehearsal",
    ]) {
      expect(isLowFatigueActivationCandidate(exercise(exerciseId)), exerciseId).toBe(true);
    }

    expect(isLowFatigueActivationCandidate(exercise("pallof-press"))).toBe(false);
    expect(isLowFatigueActivationCandidate(exercise("side-lying-dumbbell-external-rotation"))).toBe(false);
    expect(isLowFatigueActivationCandidate(exercise("wall-supported-suitcase-march"))).toBe(false);
  });

  it("keeps Knowledge explanatory and Product Shadow isolated", () => {
    const candidateAndPlannerFiles = [
      ...typeScriptFiles(resolve(engineSourceRoot, "candidate")),
      ...typeScriptFiles(resolve(engineSourceRoot, "sessionPlanner")),
    ];
    const knowledgeSelectors = candidateAndPlannerFiles.filter((file) =>
      /praxis-knowledge-core|PREPARATION_FOUNDATION_KNOWLEDGE_ENTRIES/.test(readFileSync(file, "utf8")));
    const productShadowFiles = [
      ...typeScriptFiles(resolve(engineSourceRoot, "productShadow")),
      ...typeScriptFiles(resolve(engineSourceRoot, "productShadowGoalRealization")),
    ];
    const shadowPreparationDependencies = productShadowFiles.filter((file) =>
      /PreparationKnowledgeProfile|preparation\/profiles/.test(readFileSync(file, "utf8")));

    expect(knowledgeSelectors).toEqual([]);
    expect(shadowPreparationDependencies).toEqual([]);
  });
});
