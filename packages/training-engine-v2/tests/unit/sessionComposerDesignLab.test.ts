import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REFERENCE_EXERCISES, SESSION_SECTIONS } from "../../src";
import type { SessionCompositionInput } from "../../src/sessionComposer/designContracts";
import {
  AVAILABILITY_LAB,
  CONTROLLED_SESSION_SCENARIOS,
  CURRENT_SEAM_AUDIT,
  DESIGN_AREA_CLASSIFICATIONS,
  FIXED_SHELL_SESSION_COHORT,
  GREEDY_FAILURE_MATRIX,
  OPTIMIZER_CONSEQUENCE_COMPARISON,
  SESSION_COMPOSER_EXACT_NEXT_DEPENDENCY,
  SESSION_COMPOSER_OVERALL_CLASSIFICATION,
  buildSessionComposerDesignLabData,
  renderRequiredSessionComposerArtifacts,
  runGreedyBaseline,
  runSessionComposerDesignLab,
} from "../helpers/sessionComposerDesignLab";

function scenario(id: string) {
  const definition = CONTROLLED_SESSION_SCENARIOS.find((entry) => entry.id === id);
  if (!definition) throw new Error(`Missing scenario ${id}.`);
  return definition;
}

function compositionInput(id: string): SessionCompositionInput {
  const definition = scenario(id);
  return {
    intent: definition.intent,
    candidateEvidenceByNeed: definition.candidates,
    exerciseFacts: definition.facts,
    evaluationAsOf: "2026-08-12T12:00:00-04:00",
    trainingReadiness: definition.readiness ?? {
      status: "TRAINING_ALLOWED",
      downstreamTrainingAllowed: true,
      reviewRequiredFirst: false,
      urgentExternalReviewRequired: false,
      unresolvedSignalIds: [],
      externallyResolvedSignalIds: [],
      evidence: [],
      reason: "Fixture allows training.",
    },
    continuityResponseTraceIds: [],
    searchPolicy: {
      strategy: "exhaustive_controlled_lab",
      evaluation: "strict_lexicographic",
      optionalAdmission: "positive_unique_marginal_value_only",
      tieBreak: "canonical_exercise_id",
      randomization: false,
      repairLoop: false,
      productionBeamWidth: null,
    },
  };
}

function canonical(id: string) {
  const row = REFERENCE_EXERCISES.find((entry) => entry.id === id);
  if (!row) throw new Error(`Missing exercise ${id}.`);
  return row;
}

describe("Session Composer design laboratory", () => {
  it("covers all sixteen required controlled scenarios deterministically", () => {
    expect(CONTROLLED_SESSION_SCENARIOS).toHaveLength(16);
    const data = buildSessionComposerDesignLabData();
    for (const entry of data.scenarios) {
      expect(entry.result.status).toBe(entry.expectedStatus);
      expect(entry.result.assignments.map((assignment) => assignment.exerciseId).sort()).toEqual(
        [...entry.expectedSelectedIds].sort(),
      );
      expect(runSessionComposerDesignLab(compositionInput(entry.id))).toEqual(entry.result);
    }
  });

  it("uses needs first and classifies current slots as legacy placeholders", () => {
    expect(CURRENT_SEAM_AUDIT).toContainEqual(["SessionIntent.slots", "LEGACY_PLACEHOLDER"]);
    expect(CURRENT_SEAM_AUDIT).toContainEqual(["TrainingSlot.id", "LEGACY_PLACEHOLDER"]);
    expect(CURRENT_SEAM_AUDIT).toContainEqual(["PlannedExercise.slotId", "DOMAIN_CHANGE_REQUIRED"]);
    expect(CURRENT_SEAM_AUDIT).toContainEqual(["CandidateNeed.requestedRole", "KEEP_AS_AUTHORITATIVE_INPUT"]);
    expect(CURRENT_SEAM_AUDIT).toContainEqual(["CandidateNeed.targetMovementRoles", "KEEP_AS_AUTHORITATIVE_INPUT"]);
    expect(CURRENT_SEAM_AUDIT).toContainEqual(["CandidateNeed.whyNeeded", "TRACE_ONLY"]);
  });

  it("keeps all design code outside the package public API", () => {
    const packageRoot = process.cwd().endsWith("training-engine-v2")
      ? process.cwd()
      : join(process.cwd(), "packages/training-engine-v2");
    const publicIndex = readFileSync(join(packageRoot, "src/index.ts"), "utf8");
    expect(publicIndex).not.toContain("sessionComposer");
    expect(publicIndex).not.toContain("composeSession");
    const designSource = readFileSync(
      join(packageRoot, "src/sessionComposer/designContracts.ts"),
      "utf8",
    );
    expect(designSource).toContain("Design-only Session Composer contracts");
    expect(designSource).not.toContain("export function composeSession");
  });

  it("models required, preferred, and optional needs with canonical CandidateNeed truth", () => {
    const needs = scenario("full-gym-upper-hypertrophy").intent.needs;
    expect(needs.map((entry) => entry.priority)).toEqual([
      "required", "required", "preferred", "preferred", "optional",
    ]);
    for (const entry of needs) {
      expect(entry.sourceEvidence.length).toBeGreaterThan(0);
      expect(entry.candidateNeed.id).toBe(entry.id);
      expect(entry.reasonCode).toBeTruthy();
      expect(entry.explanation).toContain("no behavioral authority");
    }
  });

  it("emits a five-section skeleton while allowing every non-needed section to remain empty", () => {
    const result = runSessionComposerDesignLab(compositionInput("no-cooldown-need"));
    expect(result.sections.map((entry) => entry.section)).toEqual(SESSION_SECTIONS);
    expect(result.sections.find((entry) => entry.section === "cooldown")).toEqual({
      section: "cooldown",
      assignmentExerciseIds: [],
      emptyReasonCode: "no_meaningful_cooldown_need",
    });
    expect(result.assignments).toHaveLength(2);
  });

  it("assigns every selected identity to a canonical legal section and role-backed need", () => {
    for (const definition of CONTROLLED_SESSION_SCENARIOS) {
      const input = compositionInput(definition.id);
      const result = runSessionComposerDesignLab(input);
      for (const assignment of result.assignments) {
        const facts = input.exerciseFacts.find((entry) => entry.exerciseId === assignment.exerciseId)!;
        expect(facts.legalSections).toContain(assignment.section);
        expect(assignment.satisfiedNeedIds.length).toBeGreaterThan(0);
        for (const needId of assignment.satisfiedNeedIds) {
          const need = input.intent.needs.find((entry) => entry.id === needId)!;
          expect(facts.legalTrainingRoles).toContain(need.candidateNeed.requestedRole);
        }
      }
    }
  });

  it("requires productive main work for every ordinary valid skeleton", () => {
    const data = buildSessionComposerDesignLabData();
    for (const entry of data.scenarios.filter((item) => [
      "valid_session_skeleton", "session_requires_prescription_resolution",
    ].includes(item.result.status))) {
      expect(entry.result.assignments.some((assignment) => assignment.section === "main")).toBe(true);
      expect(entry.result.evaluation.dominantPurposeCoverage).toBeGreaterThan(0);
    }
  });

  it("keeps preparation need-based, traceable, and before dependent work", () => {
    const result = runSessionComposerDesignLab(compositionInput("posture-movement-quality"));
    expect(result.preparationDependencyIds).toEqual(["scapular-prepares-push"]);
    expect(result.orderingConstraints).toEqual([{
      beforeExerciseId: "serratus-wall-slide",
      afterExerciseId: "machine-chest-press",
      dependencyIds: ["scapular-prepares-push"],
    }]);
    expect(result.assignments.filter((entry) => ["warmup", "activation"].includes(entry.section))).toHaveLength(1);
  });

  it("does not turn assessment or pain context into an automatic corrective section", () => {
    const posture = scenario("posture-movement-quality");
    expect(posture.intent.assessmentContextIds).toEqual(["scapular-control-priority"]);
    expect(posture.intent.needs.filter((entry) => entry.sourceEvidence.some((source) => source.sourceKind === "assessment_priority"))).toHaveLength(1);
    const shoulder = runSessionComposerDesignLab(compositionInput("shoulder-discomfort"));
    expect(shoulder.assignments.map((entry) => entry.exerciseId)).toEqual([
      "machine-chest-press", "machine-row",
    ]);
    expect(shoulder.sections.some((entry) => entry.section === "activation" && entry.assignmentExerciseIds.length > 0)).toBe(false);
  });

  it("honors TrainingSafety without reranking or returning executable assignments", () => {
    const input = compositionInput("training-safety-blocked");
    const before = input.candidateEvidenceByNeed;
    const result = runSessionComposerDesignLab(input);
    expect(result.status).toBe("session_blocked_by_training_readiness");
    expect(result.assignments).toEqual([]);
    expect(result.infeasibility?.safetyBlockerSignalIds).toEqual(["safety-review-first"]);
    expect(input.candidateEvidenceByNeed).toBe(before);
  });

  it("consumes all pain-readiness consequences without numeric preference invention", () => {
    const lowBack = runSessionComposerDesignLab(compositionInput("low-back-sensitivity"));
    expect(lowBack.assignments.map((entry) => entry.exerciseId).sort()).toEqual([
      "cable-pull-through", "chest-supported-dumbbell-row",
    ]);
    const shoulder = runSessionComposerDesignLab(compositionInput("shoulder-discomfort"));
    expect(shoulder.status).toBe("session_requires_prescription_resolution");
    expect(shoulder.unresolvedPrescriptionRequirementIds).toHaveLength(1);

    const substitutionInput = compositionInput("no-cooldown-need");
    const substitution: SessionCompositionInput = {
      ...substitutionInput,
      candidateEvidenceByNeed: {
        ...substitutionInput.candidateEvidenceByNeed,
        "main-push": substitutionInput.candidateEvidenceByNeed["main-push"].map((entry) => ({
          ...entry,
          painExecutionReadiness: "REQUIRES_SESSION_ROLE_SUBSTITUTION",
          compositionAvailability: "session_role_substitution_required",
          unresolvedRequirementIds: ["push-role-substitution"],
        })),
      },
    };
    const infeasible = runSessionComposerDesignLab(substitution);
    expect(infeasible.status).toBe("session_intent_infeasible");
    expect(infeasible.infeasibility?.sessionRoleSubstitutionBlockerIds).toEqual([
      "push-role-substitution",
    ]);
  });

  it("merges one identity across multiple truthful needs into one future source event", () => {
    const strength = runSessionComposerDesignLab(compositionInput("full-gym-upper-strength"));
    const bench = strength.assignments.find((entry) => entry.exerciseId === "dumbbell-bench-press")!;
    expect(bench.satisfiedNeedIds).toEqual(["main-push", "direct-chest"]);
    expect(bench.futureSourceExposureCount).toBe(1);
    expect(strength.assignments.filter((entry) => entry.exerciseId === "dumbbell-bench-press")).toHaveLength(1);
    expect(strength.needSatisfaction.filter((entry) => entry.status === "covered_by_shared_exercise")).toHaveLength(2);
  });

  it("preserves primary-required truth for multi-need coverage", () => {
    expect(canonical("dumbbell-bench-press").primaryMuscles).toContain("chest");
    expect(canonical("dumbbell-bench-press").primaryMuscles).not.toContain("triceps");
    expect(canonical("machine-row").primaryMuscles).toEqual(expect.arrayContaining(["mid_back", "lats"]));
    expect(canonical("dumbbell-curl").movementRoles).not.toContain("horizontal_pull");
    expect(canonical("lying-leg-curl").movementRoles).not.toContain("hinge");
    expect(canonical("leg-press").movementRoles).not.toContain("squat");
    expect(canonical("suitcase-carry").movementRoles).toEqual(expect.arrayContaining(["carry", "loaded_bracing"]));
  });

  it("prohibits duplicate identity and optional zero-value inclusion across every valid result", () => {
    const data = buildSessionComposerDesignLabData();
    for (const entry of data.scenarios) {
      const ids = entry.result.assignments.map((assignment) => assignment.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
      expect(entry.result.assignments.every((assignment) => assignment.satisfiedNeedIds.length > 0)).toBe(true);
      expect(entry.result.marginalValue.filter((trace) => trace.verdict === "include_positive_marginal_value").every((trace) => trace.newlyCoveredNeedIds.length > 0)).toBe(true);
    }
  });

  it("admits exactly one matching P0 row and no P0 corrective circuit", () => {
    const result = runSessionComposerDesignLab(compositionInput("p0-direct-need"));
    const p0Ids = new Set([
      "standing-calf-raise", "side-lying-hip-adduction", "loop-band-lateral-walk",
      "side-lying-dumbbell-external-rotation", "supine-hamstring-walkout",
      "wall-ankle-dorsiflexion-rock", "bodyweight-hip-hinge-rehearsal",
      "single-leg-balance-rehearsal",
    ]);
    expect(result.assignments.filter((entry) => p0Ids.has(entry.exerciseId)).map((entry) => entry.exerciseId)).toEqual([
      "standing-calf-raise",
    ]);
  });

  it("retains productive legal anchors before close local-rank alternatives", () => {
    const input = compositionInput("productive-continuity");
    const result = runSessionComposerDesignLab(input);
    expect(result.assignments.map((entry) => entry.exerciseId)).toEqual([
      "machine-chest-press", "machine-row",
    ]);
    expect(result.assignments.every((entry) => entry.continuityClassification === "anchor")).toBe(true);
    expect(result.trace.excludedHighRankedCandidates).toEqual(expect.arrayContaining([
      "main-push:dumbbell-bench-press", "main-pull:chest-supported-dumbbell-row",
    ]));
  });

  it("proves phase, preference, and plateau do not automatically replace anchors", () => {
    const base = compositionInput("productive-continuity");
    const baseResult = runSessionComposerDesignLab(base);
    const phaseChanged = { ...base, intent: { ...base.intent, phaseId: "phase_2" as const } };
    const preferenceTraceOnly = { ...base, intent: { ...base.intent, sourceTrace: { ...base.intent.sourceTrace, sourceRefs: ["preference-for-variety"] } } };
    const plateauTraceOnly = { ...base, intent: { ...base.intent, continuity: { ...base.intent.continuity, plateauedExerciseIds: ["machine-row"] } } };
    expect(runSessionComposerDesignLab(phaseChanged).assignments).toEqual(baseResult.assignments);
    expect(runSessionComposerDesignLab(preferenceTraceOnly).assignments).toEqual(baseResult.assignments);
    expect(runSessionComposerDesignLab(plateauTraceOnly).assignments).toEqual(baseResult.assignments);
  });

  it("routes one adverse realization to prescription review before replacement", () => {
    const result = runSessionComposerDesignLab(compositionInput("adverse-response"));
    expect(result.status).toBe("session_requires_prescription_resolution");
    expect(result.assignments.map((entry) => entry.exerciseId)).toContain("machine-chest-press");
    expect(result.assignments.find((entry) => entry.exerciseId === "machine-chest-press")?.continuityReasonCodes).toContain(
      "prescription_review_before_replacement",
    );
  });

  it("allows equipment loss or explicit block to remove an anchor without calling it bad", () => {
    const base = compositionInput("productive-continuity");
    const withoutMachine: SessionCompositionInput = {
      ...base,
      candidateEvidenceByNeed: {
        "main-push": base.candidateEvidenceByNeed["main-push"].filter((entry) => entry.exerciseId !== "machine-chest-press"),
        "main-pull": base.candidateEvidenceByNeed["main-pull"].filter((entry) => entry.exerciseId !== "machine-row"),
      },
      exerciseFacts: base.exerciseFacts.filter((entry) => !["machine-chest-press", "machine-row"].includes(entry.exerciseId)),
    };
    expect(runSessionComposerDesignLab(withoutMachine).assignments.map((entry) => entry.exerciseId).sort()).toEqual([
      "chest-supported-dumbbell-row", "dumbbell-bench-press",
    ]);
  });

  it("makes an old anchor irrelevant when the session need changes", () => {
    const lower = runSessionComposerDesignLab(compositionInput("lower-strength"));
    expect(lower.assignments.map((entry) => entry.exerciseId)).not.toContain("machine-row");
    expect(lower.trace.sessionReasonCodes).not.toContain("machine_row_bad");
  });

  it("reports identity-level potential concentration without dose claims", () => {
    const result = runSessionComposerDesignLab(compositionInput("lower-strength"));
    expect(result.potentialConcentration.every((entry) => entry.state === "potential_concentration")).toBe(true);
    expect(JSON.stringify(result)).not.toContain("sets");
    expect(JSON.stringify(result)).not.toContain("reps");
    expect(JSON.stringify(result)).not.toContain("loadKg");
  });

  it("uses structured setup transitions without inventing time constants", () => {
    const result = runSessionComposerDesignLab(compositionInput("full-gym-upper-hypertrophy"));
    expect(result.setupTransitions.exactTimeKnown).toBe(false);
    expect(result.setupTransitions.transitionCount).toBeGreaterThan(0);
    expect(result.structuralTimeFeasibility).toBe("prescription_duration_required");
  });

  it("consumes 25, 45, and 70 minute availability structurally without changing exercise truth", () => {
    expect(AVAILABILITY_LAB.map((entry) => entry.minutes)).toEqual([25, 45, 70]);
    expect(AVAILABILITY_LAB.map((entry) => entry.result.assignments.length)).toEqual([2, 3, 4]);
    expect(AVAILABILITY_LAB[0].result.assignments.map((entry) => entry.exerciseId)).toEqual([
      "machine-chest-press", "machine-row",
    ]);
    expect(AVAILABILITY_LAB.every((entry) => entry.result.structuralTimeFeasibility !== "estimated_with_explicit_prescription")).toBe(true);
    expect(AVAILABILITY_LAB.every((entry) => entry.input.exerciseFacts === AVAILABILITY_LAB[0].input.exerciseFacts)).toBe(true);
  });

  it("demonstrates all nine required greedy failure categories", () => {
    expect(GREEDY_FAILURE_MATRIX).toHaveLength(9);
    expect(GREEDY_FAILURE_MATRIX.every((entry) => entry.result === "WHOLE_SESSION_MODEL_BETTER")).toBe(true);
    const strengthInput = compositionInput("full-gym-upper-strength");
    const greedy = runGreedyBaseline(strengthInput);
    expect(greedy.filter((id) => id === "dumbbell-bench-press")).toHaveLength(2);
    expect(runSessionComposerDesignLab(strengthInput).assignments.filter((entry) => entry.exerciseId === "dumbbell-bench-press")).toHaveLength(1);
  });

  it("compares all four optimizer approaches without approving numeric policy", () => {
    expect(OPTIMIZER_CONSEQUENCE_COMPARISON.map((entry) => entry.approach)).toEqual([
      "strict_lexicographic",
      "pareto_non_dominated",
      "bounded_weighted",
      "greedy_per_need",
    ]);
    expect(OPTIMIZER_CONSEQUENCE_COMPARISON.find((entry) => entry.approach === "bounded_weighted")?.designDisposition).toBe(
      "CONTRAST_ONLY_NOT_APPROVED",
    );
    expect(OPTIMIZER_CONSEQUENCE_COMPARISON.find((entry) => entry.approach === "greedy_per_need")?.designDisposition).toBe(
      "REJECTED_AS_COMPOSER_ARCHITECTURE",
    );
  });

  it("builds an eleven-user fixed-shell cohort with no material-input failure", () => {
    expect(FIXED_SHELL_SESSION_COHORT).toHaveLength(11);
    const data = buildSessionComposerDesignLabData();
    expect(data.counts.fixedShellUsers).toBe(11);
    expect(data.counts.materialSessionDifferences).toBe(3);
    expect(data.counts.sameAnchorPersonalized).toBe(3);
    expect(data.counts.justifiedConvergence).toBe(2);
    expect(data.counts.unresponsiveMaterialInputFailures).toBe(0);
    expect(data.cohort.every((entry) => entry.signaturesCompared.length === 11)).toBe(true);
  });

  it("returns a truthful infeasibility trace without fallback or repair", () => {
    const base = compositionInput("home-equipment");
    const impossible: SessionCompositionInput = {
      ...base,
      intent: {
        ...base.intent,
        needs: base.intent.needs.map((entry) => entry.id === "vertical-pull" ? { ...entry, priority: "required" as const } : entry),
      },
    };
    const result = runSessionComposerDesignLab(impossible);
    expect(result.status).toBe("session_intent_infeasible");
    expect(result.infeasibility?.unsatisfiedRequiredNeedIds).toContain("vertical-pull");
    expect(result.infeasibility?.candidatePoolExerciseIdsByNeed["vertical-pull"]).toEqual([]);
    expect(result.trace.prunedBranchReasonCodes).toContain("no_fallback_or_repair");
  });

  it("produces every required design fingerprint and preserves production behavior", () => {
    const data = buildSessionComposerDesignLabData();
    expect(Object.keys(data.fingerprints)).toHaveLength(17);
    expect(Object.values(data.fingerprints).every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
    expect(data.productionFingerprints).toEqual({
      ranking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
      comprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
      catalog: "bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91",
      knowledgeCompatibility: "e31f864adaa0707a22bfb92d172fc596476acc923fe023cedf3abfd3ece8ac73",
    });
  });

  it("classifies design areas with evidence and stops before production", () => {
    expect(SESSION_COMPOSER_OVERALL_CLASSIFICATION).toBe("TARGETED_DESIGN_DECISIONS_REQUIRED");
    expect(SESSION_COMPOSER_EXACT_NEXT_DEPENDENCY).toBe(
      "PROJECT_OWNER_APPROVAL_OF_SESSION_COMPOSER_DESIGN_AND_TARGETED_OPTIMIZER_POLICIES",
    );
    expect(DESIGN_AREA_CLASSIFICATIONS).toEqual(expect.arrayContaining([
      ["production optimizer choice", "OWNER_POLICY_REQUIRED"],
      ["authoritative domain migration", "DOMAIN_CHANGE_REQUIRED"],
      ["exact within-section order", "DEFER_TO_SEQUENCE"],
      ["dose and duration", "DEFER_TO_PRESCRIPTION"],
    ]));
  });

  it("renders exactly the seven required owner-facing artifacts", () => {
    const artifacts = renderRequiredSessionComposerArtifacts();
    expect(Object.keys(artifacts).sort()).toEqual([
      "SESSION_COMPOSER_CURRENT_SEAM_AUDIT.md",
      "SESSION_COMPOSER_DESIGN_CONTRACT.md",
      "SESSION_COMPOSER_IMPLEMENTATION_READINESS.md",
      "SESSION_COMPOSER_PERSONALIZATION_MATRIX.md",
      "SESSION_COMPOSER_SEARCH_LAB.md",
      "SESSION_COMPOSITION_EVALUATION_POLICY.md",
      "SESSION_NEED_AND_DEPENDENCY_MODEL.md",
    ]);
    expect(Object.values(artifacts).every((contents) => contents.length > 500)).toBe(true);
  });
});
