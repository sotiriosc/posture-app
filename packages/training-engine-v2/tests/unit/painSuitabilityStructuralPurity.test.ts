import { describe, expect, it } from "vitest";
import {
  FULL_GYM_EQUIPMENT,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  deriveAlignmentPriorities,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  type CandidateRequest,
  type ExerciseDefinition,
  type PainAndInjuryState,
} from "../../src";

function scenario(id: string): CandidateRequest {
  const found = getControlledCandidateScenario(id);
  if (!found) {
    throw new Error(`Missing scenario ${id}`);
  }

  return {
    ...found.request,
    id: `${found.request.id}-pain-structural-purity`,
    evaluationContext: {
      asOf: "2026-08-10T00:00:00.000Z",
    },
    equipment: FULL_GYM_EQUIPMENT,
  };
}

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing exercise ${id}`);
  }

  return found;
}

function lowBackDiscomfort(): PainAndInjuryState {
  return {
    ...NO_PAIN_OR_INJURY,
    currentDiscomforts: [
      {
        kind: "current_discomfort",
        id: "synthetic-low-back-discomfort",
        region: "lumbar_spine",
        severity0To10: 2,
        stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
        effect: "prefer_support",
        description: "Synthetic low-back discomfort for structural pain scoring tests.",
      },
    ],
  };
}

function requestWithPool(candidatePool: readonly ExerciseDefinition[]): CandidateRequest {
  const base = scenario("horizontal-pull-gym-neutral");

  return {
    ...base,
    id: `${base.id}-synthetic-pain-pool`,
    assessment: {
      signals: [],
      historicalWeaknesses: [],
    },
    alignmentPriorities: deriveAlignmentPriorities({
      signals: [],
      historicalWeaknesses: [],
    }).priorities,
    painAndInjury: lowBackDiscomfort(),
    candidatePool,
  };
}

function withIdentity(base: ExerciseDefinition, id: string, name: string): ExerciseDefinition {
  return {
    ...base,
    id,
    name,
    summary: `${name} summary deliberately mentions chest support and lumbar comfort.`,
    coachingFocus: [
      "Keep the chest supported",
      "Use a low-back-friendly position",
    ],
  };
}

function withStressTags(
  base: ExerciseDefinition,
  id: string,
  jointStressTags: ExerciseDefinition["loading"]["jointStressTags"],
): ExerciseDefinition {
  return {
    ...base,
    id,
    loading: {
      ...base.loading,
      jointStressTags,
    },
  };
}

function withSupport(
  base: ExerciseDefinition,
  id: string,
  supportContacts: NonNullable<ExerciseDefinition["mechanics"]>["support"]["supportContacts"],
): ExerciseDefinition {
  if (!base.mechanics) {
    throw new Error(`${base.id} needs mechanics for support test.`);
  }

  return {
    ...base,
    id,
    mechanics: {
      ...base.mechanics,
      support: {
        ...base.mechanics.support,
        supportContacts,
      },
      demands: {
        ...base.mechanics.demands,
        trunk_control: {
          ...base.mechanics.demands.trunk_control,
          level: "low",
        },
      },
    },
  };
}

function painSuitability(request: CandidateRequest, exerciseId: string): number {
  const result = runCandidateRankingLab(request);
  const candidate = result.rankedCandidates.find((ranked) => ranked.exercise.id === exerciseId);
  const component = candidate?.components.find((scoreComponent) => scoreComponent.id === "pain_suitability");

  if (!component) {
    throw new Error(`Missing pain_suitability for ${exerciseId}.`);
  }

  return component.value;
}

describe("pain suitability structural purity", () => {
  it("scores otherwise equivalent exercises identically regardless of ID, name, summary, or coaching text", () => {
    const base = exercise("machine-row");
    const neutral = withIdentity(base, "foo", "Plain Synthetic Row");
    const chestNamed = withIdentity(base, "chest-supported-magic-row", "Chest Supported Magic Row");
    const request = requestWithPool([neutral, chestNamed]);

    expect(painSuitability(request, chestNamed.id)).toBe(painSuitability(request, neutral.id));
  });

  it("changes pain suitability when structured pain stress tags change", () => {
    const base = exercise("machine-row");
    const noOverlap = withStressTags(base, "row-without-lumbar-stress", []);
    const withOverlap = withStressTags(base, "row-with-lumbar-stress", ["loaded_hinge"]);
    const request = requestWithPool([noOverlap, withOverlap]);

    expect(painSuitability(request, withOverlap.id)).toBeLessThan(
      painSuitability(request, noOverlap.id),
    );
  });

  it("does not reward chest-supported body support when pain stress tags are identical", () => {
    const base = exercise("machine-row");
    const chestSupported = withSupport(base, "structured-chest-supported-row", [
      { bodyRegion: "chest", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
    ]);
    const seatedSupported = withSupport(base, "structured-seated-supported-row", [
      { bodyRegion: "seat", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
    ]);
    const request = requestWithPool([chestSupported, seatedSupported]);

    expect(painSuitability(request, chestSupported.id)).toBe(
      painSuitability(request, seatedSupported.id),
    );
  });
});
