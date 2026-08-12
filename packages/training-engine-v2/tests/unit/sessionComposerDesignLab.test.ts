import { describe, expect, it } from "vitest";
import {
  SESSION_COMPOSER_BOUNDARY_CONTRACT,
  runSessionCompositionLab,
  runSessionSequencingLab,
  sessionNeed,
  type SessionCompositionLabInput,
} from "../../src";
import {
  SESSION_COMPOSER_DESIGN_CLASSIFICATION,
  SESSION_COMPOSER_NEXT_DEPENDENCY,
  WHOLE_SESSION_LAB_SCENARIOS,
  buildSessionComposerDesignLabData,
  canonicalExercise,
} from "../helpers/sessionComposerDesignLab";

describe("Session Composer design and whole-session lab", () => {
  it("keeps owner boundaries explicit and excludes production behavior", () => {
    expect(SESSION_COMPOSER_BOUNDARY_CONTRACT.sessionCompositionOwns).toContain(
      "smallest coherent covering exercise set",
    );
    expect(SESSION_COMPOSER_BOUNDARY_CONTRACT.prescriptionOwns).toContain(
      "sets, reps, load, range, support, tempo, effort, rest, and side",
    );
    expect(SESSION_COMPOSER_BOUNDARY_CONTRACT.forbiddenCompositionBehaviors).toEqual(
      expect.arrayContaining([
        "creating or widening a candidate pool",
        "requiring one exercise per display section",
        "choosing dose, progression, replacement, or phase advancement",
      ]),
    );
  });

  it("selects the smallest legal need cover instead of filling section slots", () => {
    const scenario = WHOLE_SESSION_LAB_SCENARIOS.find(
      (candidate) => candidate.id === "time-constrained-general",
    );
    expect(scenario).toBeDefined();
    const result = runSessionCompositionLab(scenario!.input);
    expect(result.status).toBe("composed");
    if (result.status !== "composed") return;
    expect(result.selections.map((selection) => selection.exerciseId)).toEqual([
      "goblet-squat",
      "machine-row",
      "push-up",
    ]);
    expect(result.coveredRequiredNeedIds).toEqual(["squat", "push", "pull", "trunk"]);
    expect(result.coveredOptionalNeedIds).toEqual([]);
    expect(result.metrics.selectedExerciseCount).toBe(3);
    expect(result.selections.find((selection) => selection.exerciseId === "push-up")?.coveredNeedIds).toEqual([
      "push",
      "trunk",
    ]);
  });

  it("makes every selected exercise indispensable to at least one required need", () => {
    for (const scenario of WHOLE_SESSION_LAB_SCENARIOS) {
      const result = runSessionCompositionLab(scenario.input);
      expect(result.status).toBe("composed");
      if (result.status !== "composed") continue;
      expect(result.selections.every(
        (selection) => selection.indispensableForRequiredNeedIds.length > 0,
      )).toBe(true);
    }
  });

  it("preserves productive continuity when equal-size legal covers remain", () => {
    const scenario = WHOLE_SESSION_LAB_SCENARIOS.find(
      (candidate) => candidate.id === "strength-continuity",
    )!;
    const result = runSessionCompositionLab(scenario.input);
    expect(result.status).toBe("composed");
    if (result.status !== "composed") return;
    expect(result.selections.map((selection) => selection.exerciseId)).toEqual([
      "dead-bug",
      "goblet-squat",
      "machine-chest-press",
      "machine-row",
    ]);
    expect(result.metrics.productiveContinuityCount).toBe(4);
  });

  it("keeps all scenario coverage grounded in canonical movement-role truth", () => {
    for (const scenario of WHOLE_SESSION_LAB_SCENARIOS) {
      for (const [needId, role] of Object.entries(scenario.expectedMovementRoleByNeed)) {
        for (const candidate of scenario.input.candidateIntelligence.legalCandidatesByNeed[needId]) {
          expect(canonicalExercise(candidate.exerciseId)?.movementRoles).toContain(role);
        }
      }
    }
  });

  it("sequences only after composition and honors explicit preparation dependencies", () => {
    const scenario = WHOLE_SESSION_LAB_SCENARIOS.find(
      (candidate) => candidate.id === "pain-aware-return",
    )!;
    const composition = runSessionCompositionLab(scenario.input);
    expect(composition.status).toBe("composed");
    if (composition.status !== "composed") return;
    const sequence = runSessionSequencingLab(scenario.input, composition);
    expect(sequence.status).toBe("sequenced");
    if (sequence.status !== "sequenced") return;
    expect(sequence.orderedExerciseIds.indexOf("ninety-ninety-breathing")).toBeLessThan(
      sequence.orderedExerciseIds.indexOf("dead-bug"),
    );
    expect(sequence.orderedExerciseIds.indexOf("wall-ankle-dorsiflexion-rock")).toBeLessThan(
      sequence.orderedExerciseIds.indexOf("single-leg-balance-rehearsal"),
    );
    expect(sequence.setupTransitionCount).toBe(2);
  });

  it("reports infeasibility instead of fabricating coverage or exceeding constraints", () => {
    const input: SessionCompositionLabInput = {
      intent: {
        id: "infeasible",
        athleteId: "athlete-infeasible",
        needs: [sessionNeed({ id: "push", kind: "training_stimulus", priority: "required", rationale: "Required push." })],
        constraints: { maxExercises: 1, maxDurationUnits: 1 },
      },
      candidateIntelligence: {
        trainingAvailability: "available",
        requestIdsByNeed: { push: "candidate-request-push" },
        exercises: [{ exerciseId: "machine-chest-press", durationUnits: 2, fatigueCost: 1, setupKey: "machine", redundancyKeys: [], continuity: "neutral" }],
        legalCandidatesByNeed: { push: [{ exerciseId: "machine-chest-press", candidateRank: 1, candidateValue: 9, compositionAvailability: "available" }] },
      },
    };
    expect(runSessionCompositionLab(input)).toEqual(expect.objectContaining({
      status: "infeasible",
      uncoveredRequiredNeedIds: [],
    }));
  });

  it("honors Candidate Intelligence review deferral without selecting an exercise", () => {
    const base = WHOLE_SESSION_LAB_SCENARIOS[0].input;
    const result = runSessionCompositionLab({
      ...base,
      candidateIntelligence: {
        ...base.candidateIntelligence,
        trainingAvailability: "deferred_for_review",
      },
    });
    expect(result).toEqual(expect.objectContaining({
      status: "infeasible",
      trace: [expect.objectContaining({ code: "session_training_deferred_for_review" })],
    }));
  });

  it("detects cyclic sequencing intent without changing the selected set", () => {
    const base = WHOLE_SESSION_LAB_SCENARIOS.find(
      (candidate) => candidate.id === "time-constrained-general",
    )!.input;
    const cyclic: SessionCompositionLabInput = {
      ...base,
      intent: {
        ...base.intent,
        needs: base.intent.needs.map((need) => {
          if (need.id === "squat") return { ...need, sequenceBeforeNeedIds: ["push"] };
          if (need.id === "push") return { ...need, sequenceBeforeNeedIds: ["squat"] };
          return need;
        }),
      },
    };
    const composition = runSessionCompositionLab(cyclic);
    expect(composition.status).toBe("composed");
    if (composition.status !== "composed") return;
    expect(runSessionSequencingLab(cyclic, composition).status).toBe("infeasible");
  });

  it("proves materially different structures while allowing justified overlap", () => {
    const data = buildSessionComposerDesignLabData();
    const selectedSets = data.scenarios.map((scenario) =>
      scenario.composition.status === "composed"
        ? scenario.composition.selections.map((selection) => selection.exerciseId)
        : [],
    );
    expect(selectedSets.map((set) => set.length)).toEqual([4, 5, 3]);
    expect(new Set(selectedSets.map((set) => set.join("|"))).size).toBe(3);
    expect(selectedSets[0]).toContain("dead-bug");
    expect(selectedSets[1]).toContain("dead-bug");
  });

  it("freezes all four authorized production behavior fingerprints", () => {
    const data = buildSessionComposerDesignLabData();
    expect(data.productionFingerprints).toEqual({
      ranking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
      comprehensiveBehavior: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
      catalog: "bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91",
      knowledgeCompatibility: "e31f864adaa0707a22bfb92d172fc596476acc923fe023cedf3abfd3ece8ac73",
    });
    expect(data.classification).toBe(SESSION_COMPOSER_DESIGN_CLASSIFICATION);
    expect(data.nextDependency).toBe(SESSION_COMPOSER_NEXT_DEPENDENCY);
    expect(data.compositionFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });
});
