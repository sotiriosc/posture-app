import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildProductionSequencingAssignmentFacts,
  buildProductionSequencingDependencyGraph,
  buildProductionSequencingTransitionFacts,
  EXERCISE_DOSE_MODES,
  REFERENCE_EXERCISES,
  searchExactFinalSessionSequence,
  sequenceFinalSession,
} from "../../src";
import { CAGT_GATE_AUTHORITY, CAGT_GATE_ORDER } from "../cagt/contracts";
import {
  EXPECTED_POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT,
  POST_PRESCRIPTION_WEEK_CONTROLLED_SCENARIOS,
  POST_PRESCRIPTION_WEEK_FIXED_SHELL_COHORT,
  POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST,
  POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT,
  POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES,
  POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS,
  POST_PRESCRIPTION_WEEK_MUTATIONS,
  POST_PRESCRIPTION_WEEK_VALIDATION_V1_AUTHORITY,
  POST_PRESCRIPTION_WEEK_VALIDATION_V1_CLASSIFICATION,
  POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY,
  buildPostPrescriptionWeekHoldoutInput,
  buildRealPostPrescriptionSessionLibrary,
  runPostPrescriptionH1H2CompiledSublab,
  runPostPrescriptionWeekDeterministicStress,
  runPostPrescriptionWeekHoldout,
  runPostPrescriptionWeekMutationSuite,
} from "../cagt/postPrescriptionWeekValidationV1";
import { digest } from "../cagt/signatures";
import {
  prepareCatalogProductionFinalSequencingInput,
  PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY,
} from "../helpers/productionFinalSequencingLab";
import { validatePostPrescriptionWeekDesign } from "../helpers/postPrescriptionWeekValidationLab";

function normalizedResult(result: ReturnType<typeof validatePostPrescriptionWeekDesign>) {
  return {
    status: result.status,
    ledger: result.sourceExposureLedger,
    objectives: result.objectiveRealizationTraces,
    integrity: result.sourceEventIntegrityTrace,
    duration: result.weeklyDurationView,
    spacing: result.spacingTraces,
    gates: result.gate13Trace,
  };
}

function sourceText(root: string): string {
  return readdirSync(root).flatMap((name) => {
    const path = resolve(root, name);
    if (statSync(path).isDirectory()) return sourceText(path);
    return /\.(?:ts|tsx|js|jsx)$/.test(name) ? [readFileSync(path, "utf8")] : [];
  }).join("\n");
}

describe("post-Prescription Week validation V1 design admission", () => {
  it("keeps Gate order fixed while admitting Gate 13 as design evidence only", () => {
    expect(CAGT_GATE_ORDER[13]).toBe("gate_13_post_prescription_weekly_validation");
    expect(CAGT_GATE_AUTHORITY.gate_13_post_prescription_weekly_validation).toBe("NOT_IMPLEMENTED");
    expect(CAGT_GATE_AUTHORITY.gate_14_full_prescribed_program_comparison).toBe("NOT_IMPLEMENTED");
    expect(CAGT_GATE_AUTHORITY.gate_15_phase_continuity).toBe("NOT_IMPLEMENTED");
    expect(CAGT_GATE_AUTHORITY.gate_16_longitudinal_adaptation).toBe("FOUNDATION_ONLY");
    expect(POST_PRESCRIPTION_WEEK_VALIDATION_V1_AUTHORITY)
      .toBe("POST_PRESCRIPTION_WEEK_VALIDATION_DESIGN_EVIDENCE");
    expect(POST_PRESCRIPTION_WEEK_VALIDATION_V1_CLASSIFICATION)
      .toBe("POST_PRESCRIPTION_WEEK_VALIDATION_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION");
  });

  it("builds one canonical event per assignment with final Prescription and Sequence revisions", () => {
    const scenario = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios[3];
    const result = validatePostPrescriptionWeekDesign(buildPostPrescriptionWeekHoldoutInput(scenario));
    expect(result.sourceEventIntegrityTrace).toMatchObject({
      expectedEventCount: result.sourceExposureLedger.length,
      observedEventCount: result.sourceExposureLedger.length,
      observedUniqueEventCount: result.sourceExposureLedger.length,
      duplicateEventCount: 0,
      missingEventCount: 0,
      orphanEventCount: 0,
      stalePrescriptionRevisionCount: 0,
      staleSequenceRevisionCount: 0,
    });
    expect(result.sourceExposureLedger.every((entry) => entry.sequenceRevisionId.length > 0 &&
      entry.finalPrescriptionRevisionId.length > 0 && entry.weeklyObjectiveIds.length <= entry.satisfiedSessionNeedIds.length)).toBe(true);
    expect(result.completeWeekArgument).toMatchObject({
      validationAddedExerciseCount: 0,
      validationRemovedExerciseCount: 0,
      plannedFactsCalledCompletedCount: 0,
      noncommensurableDoseModesSeparate: true,
    });
  });

  it("keeps allocation, planned Prescription, and completed response ownership separate", () => {
    const scenario = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios[9];
    const input = buildPostPrescriptionWeekHoldoutInput(scenario);
    const result = validatePostPrescriptionWeekDesign(input);
    expect(input.weekAllocationPlan.objectiveSatisfactionStates).not.toEqual({});
    expect(result.sourceExposureLedger.length).toBeGreaterThan(0);
    expect(result.decisionTrace.completedPerformanceConsumed).toBe(false);
    expect(result.decisionTrace.longitudinalDecisionConsumed).toBe(false);
    expect(result.burdenVectors.every((vector) => vector.observedRecoveryCost === null && vector.aggregateScore === null)).toBe(true);
    expect(result.muscleRelationshipViews.every((view) => view.fractionalCoefficient === null)).toBe(true);
  });

  it("keeps preparation and activation separate from developmental and A1 credit", () => {
    const scenario = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios.find((entry) =>
      entry.mutation === "none" && entry.cohortTags.includes("preparation") && !entry.cohortTags.includes("assessment"))!;
    const result = validatePostPrescriptionWeekDesign(buildPostPrescriptionWeekHoldoutInput(scenario));
    const supporting = result.sourceExposureLedger.filter((entry) => ["preparation", "activation"].includes(entry.role));
    expect(supporting.every((entry) => entry.blockPurposeViews.every((block) => !block.developmentalCreditEligible))).toBe(true);
    expect(supporting.every((entry) => entry.weeklyObjectiveIds.length === 0)).toBe(true);
    expect(result.objectiveRealizationTraces.filter((trace) => trace.purpose === "assessment_priority_development")).toHaveLength(0);
  });

  it("preserves all seven dose lanes and never constructs a mixed-unit total", () => {
    const library = buildRealPostPrescriptionSessionLibrary(107);
    const observed = new Set([
      ...library.flatMap((entry) => entry.prescriptionCompilation.plans)
        .flatMap((plan) => plan.doseBlocks.map((block) => block.dose.mode)),
      ...REFERENCE_EXERCISES.flatMap((exercise) => prepareCatalogProductionFinalSequencingInput(exercise)
        .prescriptionSession.plans.flatMap((plan) => plan.doseBlocks.map((block) => block.dose.mode))),
    ]);
    expect([...observed].sort()).toEqual([...EXERCISE_DOSE_MODES].sort());
    const result = validatePostPrescriptionWeekDesign(
      buildPostPrescriptionWeekHoldoutInput(POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios[5]),
    );
    expect(result.doseLaneSummaries.every((lane) => lane.commensurableWithinModeOnly)).toBe(true);
    expect(result.weeklyDurationView.physiologicalDoseMetric).toBe(false);
  });

  it("keeps H1 and H2 distribution evidence response-dependent and rejects additive duplication", () => {
    const result = runPostPrescriptionH1H2CompiledSublab();
    expect(result).toMatchObject({
      equalTotalDistribution: true,
      additiveMutationRejected: true,
      disposition: "DISTRIBUTION_FEASIBILITY_EVIDENCE_ONLY_RESPONSE_DEPENDENT",
      completedResponseClaimed: false,
      hypertrophySuperiorityClaimed: false,
    });
    expect(result.h2DistributedTotalDevelopmentalSetRange).toEqual(result.h1TotalDevelopmentalSetRange);
    expect(result.h2AdditiveMutationTotalDevelopmentalSetRange).not.toEqual(result.h1TotalDevelopmentalSetRange);
  });

  it("fails at the earliest Gate 13 subgate and permits no downstream rescue", () => {
    const scenario = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios.find((entry) =>
      entry.mutation === "missing_session_artifact")!;
    const result = validatePostPrescriptionWeekDesign(buildPostPrescriptionWeekHoldoutInput(scenario));
    const failureIndex = result.gate13Trace.findIndex((gate) => gate.state === "FAIL_STOP");
    expect(result.gate13Trace[failureIndex].subgate).toBe("13.1_session_completeness");
    expect(result.gate13Trace.slice(failureIndex + 1).every((gate) =>
      gate.state === "SHADOW_DIAGNOSTIC_ONLY" && !gate.scored)).toBe(true);
    expect(result.decisionTrace.noDownstreamRescueTrace).toContain("EARLIEST_GATE_FAILURE_RETAINED");
  });

  it("rejects every mutation from changed semantic structure rather than mutation labels", () => {
    const suite = runPostPrescriptionWeekMutationSuite();
    expect(suite.mutationCount).toBe(POST_PRESCRIPTION_WEEK_MUTATIONS.length);
    expect(suite.semanticStructureChangeCount).toBe(suite.mutationCount);
    expect(suite.rejectedCount).toBe(suite.mutationCount);
    expect(suite.acceptedDownstreamRescueCount).toBe(0);
    expect(new Set(suite.results.map((result) => result.changedSemanticField)).size).toBeGreaterThan(25);
  });

  it("is invariant to input ordering and responds to material revision and policy changes", () => {
    const baselineScenario = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios[11];
    const baselineInput = buildPostPrescriptionWeekHoldoutInput(baselineScenario);
    const reordered = {
      ...baselineInput,
      sessionArtifacts: [...baselineInput.sessionArtifacts].reverse(),
      exerciseRegistry: [...baselineInput.exerciseRegistry].reverse(),
    };
    const baseline = validatePostPrescriptionWeekDesign(baselineInput);
    const equivalent = validatePostPrescriptionWeekDesign(reordered);
    expect(digest(normalizedResult(equivalent))).toBe(digest(normalizedResult(baseline)));
    const staleScenario = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios.find((entry) =>
      entry.mutation === "stale_sequence_revision")!;
    const stale = validatePostPrescriptionWeekDesign(buildPostPrescriptionWeekHoldoutInput(staleScenario));
    expect(stale.sourceEventIntegrityTrace.staleSequenceRevisionCount).toBeGreaterThan(0);
    expect(stale.status).toBe("invalid_source_exposure_ledger");
    expect(POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS).toHaveLength(16);
    expect(POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES).toHaveLength(12);
  });

  it("locks the holdout before execution and admits at least 120 genuine complete weeks", () => {
    expect(POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT)
      .toBe(EXPECTED_POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT);
    const holdout = runPostPrescriptionWeekHoldout();
    expect(holdout.scenarioCount).toBeGreaterThanOrEqual(150);
    expect(holdout.genuineCompletePrescribedWeekCount).toBeGreaterThanOrEqual(120);
    expect(holdout.hardZeroFailureCount).toBe(0);
    expect(new Set(holdout.results.map((entry) => entry.scenario.opportunityCount))).toEqual(new Set([1, 2, 3, 4, 5, 6]));
    expect(POST_PRESCRIPTION_WEEK_CONTROLLED_SCENARIOS).toHaveLength(60);
    expect(POST_PRESCRIPTION_WEEK_FIXED_SHELL_COHORT).toHaveLength(20);
  });

  it("covers all 45 exercise identities through real compiler and sequencing artifacts", () => {
    expect(REFERENCE_EXERCISES).toHaveLength(45);
    const results = REFERENCE_EXERCISES.map((exercise) => {
      const input = prepareCatalogProductionFinalSequencingInput(exercise);
      return sequenceFinalSession(input);
    });
    expect(results.every((result) => [
      "sequenced_exact_optimal", "incomplete_due_to_unresolved_prescription", "invalid_session_input",
    ].includes(result.status))).toBe(true);
    const searchedExerciseIds: string[] = [];
    for (const exercise of REFERENCE_EXERCISES) {
      const input = prepareCatalogProductionFinalSequencingInput(exercise);
      const assignmentBuild = buildProductionSequencingAssignmentFacts(input);
      expect(assignmentBuild.findings).toEqual([]);
      const search = searchExactFinalSessionSequence({
        facts: assignmentBuild.facts,
        graph: buildProductionSequencingDependencyGraph(assignmentBuild.facts),
        possibleTransitions: buildProductionSequencingTransitionFacts({
          sequencingInput: input,
          assignmentFacts: assignmentBuild.facts,
        }).facts,
        resourcePolicy: PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY,
      });
      expect(search.status).toBe("exact_optimal");
      searchedExerciseIds.push(search.order![0].exerciseId);
    }
    expect(new Set(searchedExerciseIds).size).toBe(45);
  });

  it("passes deterministic complete-week, ledger, objective, H1/H2, and spacing stress", () => {
    const stress = runPostPrescriptionWeekDeterministicStress(1_000);
    expect(stress).toMatchObject({
      weekEventObjectiveComparisonCount: 10_000,
      completePrescribedWeekValidationCount: 1_000,
      sourceEventLedgerIntegrityRunCount: 1_000,
      objectiveRealizationComparisonCount: 1_000,
      h1H2DistributionComparisonCount: 1_000,
      spacingValidationCount: 1_000,
      validationFailures: 0,
      ledgerFailures: 0,
      objectiveFailures: 0,
      spacingFailures: 0,
      deterministicMismatches: 0,
      result: "DETERMINISTIC_POST_PRESCRIPTION_WEEK_STRESS_PASSED",
    });
  }, 90_000);

  it("keeps historical design contracts private after production-kernel graduation", () => {
    const rootIndex = readFileSync(resolve(process.cwd(), "src/index.ts"), "utf8");
    const weekValidationIndex = readFileSync(resolve(process.cwd(), "src/weekValidation/index.ts"), "utf8");
    const designContracts = readFileSync(resolve(process.cwd(), "src/weekValidation/designContracts.ts"), "utf8");
    const appSources = sourceText(resolve(process.cwd(), "../../apps"));
    const productionSources = sourceText(resolve(process.cwd(), "src"));
    expect(rootIndex).toContain('export * from "./weekValidation"');
    expect(weekValidationIndex).not.toContain("designContracts");
    expect(designContracts).toContain("intentionally absent from the package index");
    expect(designContracts).not.toContain("generateProgram");
    expect(appSources).not.toContain("validatePostPrescriptionWeekDesign");
    expect(appSources).not.toContain("validatePostPrescriptionWeek");
    expect(appSources).not.toContain("POST_PRESCRIPTION_WEEK_VALIDATION_V1_CAUSAL_LEDGER_POLICY");
    expect(productionSources).not.toContain("tests/helpers");
    expect(productionSources).not.toContain("tests/cagt");
    expect(POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY).toMatchObject({
      automaticSelection: false,
      productionActivation: false,
    });
  });
});
