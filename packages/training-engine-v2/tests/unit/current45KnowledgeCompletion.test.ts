import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  KNOWLEDGE_FACT_KINDS,
  ORIGINAL_45_KNOWLEDGE_ENTRIES,
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PRODUCTION_53_KNOWLEDGE_ENTRIES,
  projectCompactFallback,
  projectCompactFallbacks,
  stableKnowledgeJson,
} from "../../../praxis-knowledge-core/src";
import { REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { GENERATED_EXERCISE_COACHING_FALLBACKS } from "../../src/data/generatedExerciseCoachingFallbacks";
import { generatedExerciseCoachingFallbackStatus } from "../../dev/generateExerciseCoachingFallbacks";
import { current45KnowledgeReportStatus } from "../../dev/reportCurrent45KnowledgeCompletion";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import {
  PRE_G2K_CONTRACTS,
  activationGuards,
  coachingRailCompatibility,
  completenessMatrix,
  completionSummary,
  controlledScenarios,
  engineFactConflicts,
  fallbackAfter,
  fallbackBefore,
  fallbackEquivalence,
  fallbackEquivalenceRows,
  fixedShellCohorts,
  holdoutManifest,
  knowledgeCompletionFingerprint,
  languageAndClaimsReview,
  libraryCompatibility,
  metamorphicResults,
  mutationResults,
  original45ExactIdResult,
  packageRFreeze,
  preG2KFingerprints,
  realizationReviewLedger,
  runtimeBoundary,
  stressResults,
  waveManifests,
} from "../current45Knowledge/releaseEvidence";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");

function sourceFiles(path: string): readonly string[] {
  return readdirSync(path).flatMap((name) => {
    const absolute = resolve(path, name);
    return statSync(absolute).isDirectory() ? sourceFiles(absolute) : [absolute];
  }).filter((path) => /\.(?:ts|tsx)$/.test(path));
}

describe("Current 45 exercise Knowledge-core completion V1", () => {
  it("publishes the exact five completion contracts", () => {
    expect(Object.values(PRE_G2K_CONTRACTS).map((contract) => `${contract.contractId}@${contract.contractVersion}`)).toEqual([
      "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETION@1.0.0",
      "PRODUCTION_53_EXERCISE_KNOWLEDGE_REGISTRY@1.0.0",
      "EXERCISE_KNOWLEDGE_CURATION_WAVE@1.0.0",
      "EXERCISE_KNOWLEDGE_LEGACY_FALLBACK_EQUIVALENCE@1.0.0",
      "PRODUCTION_EXERCISE_KNOWLEDGE_REVIEW_LEDGER@1.0.0",
    ]);
  });

  it("matches the exact 45 migration set and the 53-row production catalog", () => {
    expect(original45ExactIdResult.exact).toBe(true);
    expect(waveManifests.k1).toHaveLength(15);
    expect(waveManifests.k2).toHaveLength(15);
    expect(waveManifests.k3).toHaveLength(15);
    expect(PRODUCTION_53_KNOWLEDGE_ENTRIES).toHaveLength(53);
    expect(REFERENCE_EXERCISES).toHaveLength(53);
    expect(PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId).sort())
      .toEqual(REFERENCE_EXERCISES.map((row) => row.id).sort());
  });

  it("makes all 53 rows complete through accepted provenance-bearing facts", () => {
    expect(completionSummary.original45CompleteCount).toBe(45);
    expect(completionSummary.all53CompleteCount).toBe(53);
    expect(completionSummary.validationFindingCount).toBe(0);
    expect(completenessMatrix.every((row) => row.coachingRailCompatible && row.libraryCompatible)).toBe(true);
    for (const entry of PRODUCTION_53_KNOWLEDGE_ENTRIES) {
      const referencedIds = [
        entry.presentation.focus, ...entry.presentation.cues, ...entry.presentation.setup,
        ...entry.presentation.during, ...entry.presentation.pattern, ...entry.presentation.watchFor,
      ];
      expect(referencedIds.every((id) => entry.facts.some((fact) =>
        fact.id === id && fact.reviewStatus === "accepted" && fact.provenance.length > 0,
      ))).toBe(true);
      expect(entry.provenance.length).toBeGreaterThan(0);
    }
  });

  it("uses every fact kind and every accepted provenance source type", () => {
    const factKinds = new Set(PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.facts.map((fact) => fact.kind)));
    expect([...factKinds].sort()).toEqual([...KNOWLEDGE_FACT_KINDS].sort());
    const sources = new Set(PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) =>
      entry.facts.flatMap((fact) => fact.provenance.map((provenance) => provenance.sourceType))));
    expect([...sources].sort()).toEqual([
      "equipment_capability_truth", "external_reference", "human_exercise_science_review", "owner_decision",
    ]);
  });

  it("preserves the frozen Package R semantic fingerprints", () => {
    expect(packageRFreeze.entryCount).toBe(8);
    expect(packageRFreeze.actual).toEqual(packageRFreeze.expected);
    expect(PACKAGE_R_KNOWLEDGE_ENTRIES).toHaveLength(8);
  });

  it("proves current-45 and Package R fallback equivalence independently", () => {
    expect(fallbackBefore).toHaveLength(45);
    expect(fallbackAfter).toHaveLength(45);
    expect(fallbackEquivalence.upstreamMatrixFingerprint).toBe(fallbackEquivalence.requiredUpstreamMatrixFingerprint);
    expect(fallbackEquivalenceRows.every((row) => row.summaryEquivalent && row.coachingFocusEquivalent)).toBe(true);
    expect(fallbackEquivalence.summaryMismatchCount).toBe(0);
    expect(fallbackEquivalence.coachingFocusMismatchCount).toBe(0);
    expect(fallbackEquivalence.packageRFallbackMismatchCount).toBe(0);
    expect(fallbackEquivalence.generatedFallbackCount).toBe(53);
  });

  it("makes the generated registry the only production fallback source", () => {
    expect(Object.keys(GENERATED_EXERCISE_COACHING_FALLBACKS)).toHaveLength(53);
    expect(projectCompactFallbacks(PRODUCTION_53_KNOWLEDGE_ENTRIES).every((fallback) => {
      const generated = GENERATED_EXERCISE_COACHING_FALLBACKS[fallback.exerciseId];
      return generated?.summary === fallback.summary &&
        stableKnowledgeJson(generated.coachingFocus) === stableKnowledgeJson(fallback.coachingFocus);
    })).toBe(true);
    const catalogSource = readFileSync(resolve(packageRoot, "src/data/referenceExercises.ts"), "utf8");
    expect(catalogSource.match(/summary:\s*"/g) ?? []).toHaveLength(0);
    expect(catalogSource.match(/coachingFocus:\s*\[/g) ?? []).toHaveLength(0);
    expect(catalogSource.match(/generatedCoachingFallback\(/g) ?? []).toHaveLength(107);
    expect(generatedExerciseCoachingFallbackStatus().stale).toBe(false);
    expect(current45KnowledgeReportStatus().stale).toEqual([]);
  });

  it("resolves all 17 realization audits without covering an unsupported production path", () => {
    expect(realizationReviewLedger).toHaveLength(17);
    expect(realizationReviewLedger.filter((row) => row.disposition === "accepted_override_added")).toHaveLength(8);
    expect(realizationReviewLedger.filter((row) => row.disposition === "unresolved_identity_boundary_deferred")).toHaveLength(1);
    expect(realizationReviewLedger.every((row) => row.currentProductionRealizationUncoveredCount === 0)).toBe(true);
    expect(ORIGINAL_45_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides)).toHaveLength(26);
    expect(ORIGINAL_45_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides).every((override) =>
      !override.replaceSetupRefs && !override.replaceDuringRefs && !override.replaceWatchForRefs,
    )).toBe(true);
  });

  it("keeps related roles, actions, stress, and coaching claims aligned", () => {
    expect(engineFactConflicts).toEqual([]);
    expect(languageAndClaimsReview).toEqual({
      diagnosisClaimCount: 0,
      treatmentClaimCount: 0,
      injuryPreventionClaimCount: 0,
      painReductionClaimCount: 0,
      postureCorrectionClaimCount: 0,
      compactJargonCount: 0,
      hiddenNumericPrescriptionCount: 0,
      cueOverloadCount: 0,
      result: "pass",
    });
  });

  it("covers controlled, cohort, and locked holdout requirements", () => {
    expect(controlledScenarios.length).toBeGreaterThanOrEqual(600);
    expect(Object.values(fixedShellCohorts).map((cohort) => cohort.length)).toEqual([90, 120, 120, 120, 90, 90, 90]);
    expect(holdoutManifest.length).toBeGreaterThanOrEqual(900);
    expect(new Set(holdoutManifest.map((row) => row.exerciseId)).size).toBe(53);
    expect(new Set(holdoutManifest.map((row) => row.category)).size).toBe(6);
    expect(new Set(holdoutManifest.map((row) => row.factKind)).size).toBe(KNOWLEDGE_FACT_KINDS.length);
    expect(new Set(holdoutManifest.map((row) => row.doseMode)).size).toBe(EXERCISE_DOSE_MODES.length);
    expect(new Set(holdoutManifest.map((row) => row.section)).size).toBe(5);
    expect(new Set(holdoutManifest.map((row) => row.equipmentMode)).size).toBe(9);
    expect(new Set(holdoutManifest.map((row) => row.provenanceSourceType)).size).toBe(4);
    expect(new Set(holdoutManifest.filter((row) => row.realizationAudit).map((row) => row.exerciseId)).size).toBe(17);
  });

  it("rejects every semantic mutation with no downstream rescue", () => {
    expect(mutationResults.length).toBeGreaterThanOrEqual(50);
    expect(mutationResults.every((row) => row.semanticStructureChanged && row.rejected)).toBe(true);
    expect(mutationResults.reduce((sum, row) => sum + row.acceptedDownstreamRescueCount, 0)).toBe(0);
    expect(metamorphicResults.invariants.every((row) => row.passed)).toBe(true);
    expect(metamorphicResults.materialResponses.every((row) => row.passed && row.baseline !== row.changed)).toBe(true);
  });

  it("records every minimum stress count with deterministic zero failures", () => {
    expect(stressResults).toMatchObject({
      factValidations: 20_000, presentationMapValidations: 20_000, provenanceValidations: 15_000,
      registryValidations: 10_000, realizationOverrideValidations: 10_000, fallbackGenerations: 10_000,
      fallbackEquivalenceComparisons: 10_000, clinicalBoundaryAttacks: 5_000,
      engineConflictEvaluations: 5_000, coachingRailCompatibilityEvaluations: 3_000,
      libraryCompatibilityEvaluations: 3_000, packageRFreezeComparisons: 2_000,
      productShadowInvarianceComparisons: 2_000, staleGenerationAttacks: 1_000,
      noRescueMutations: 1_000, failureCount: 0,
    });
  });

  it("executes the declared deterministic stress evaluations", () => {
    const facts = PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.facts);
    const overrides = PRODUCTION_53_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides);
    let failures = 0;
    for (let index = 0; index < stressResults.factValidations; index += 1) {
      const fact = facts[index % facts.length]!;
      if (!fact.id || fact.reviewStatus !== "accepted" || !fact.canonicalStatement) failures += 1;
    }
    for (let index = 0; index < stressResults.presentationMapValidations; index += 1) {
      const entry = PRODUCTION_53_KNOWLEDGE_ENTRIES[index % 53]!;
      const refs = [entry.presentation.focus, ...entry.presentation.cues, ...entry.presentation.setup,
        ...entry.presentation.during, ...entry.presentation.pattern, ...entry.presentation.watchFor];
      if (refs.some((ref) => !entry.facts.some((fact) => fact.id === ref))) failures += 1;
    }
    for (let index = 0; index < stressResults.provenanceValidations; index += 1) {
      const fact = facts[index % facts.length]!;
      if (fact.provenance.length === 0 || fact.provenance.some((source) => !source.sourceRef || source.evidenceBasis.length === 0)) failures += 1;
    }
    for (let index = 0; index < stressResults.registryValidations; index += 1) {
      if (PRODUCTION_53_KNOWLEDGE_ENTRIES.length !== 53 || new Set(PRODUCTION_53_KNOWLEDGE_ENTRIES.map((entry) => entry.exerciseId)).size !== 53) failures += 1;
    }
    for (let index = 0; index < stressResults.realizationOverrideValidations; index += 1) {
      const override = overrides[index % overrides.length]!;
      if (!override.realizationId || override.reviewStatus !== "accepted" || override.provenance.length === 0) failures += 1;
    }
    for (let index = 0; index < stressResults.fallbackGenerations; index += 1) {
      const entry = PRODUCTION_53_KNOWLEDGE_ENTRIES[index % 53]!;
      if (projectCompactFallback(entry).exerciseId !== entry.exerciseId) failures += 1;
    }
    for (let index = 0; index < stressResults.fallbackEquivalenceComparisons; index += 1) {
      const row = fallbackEquivalenceRows[index % fallbackEquivalenceRows.length]!;
      if (!row.summaryEquivalent || !row.coachingFocusEquivalent) failures += 1;
    }
    for (let index = 0; index < stressResults.clinicalBoundaryAttacks; index += 1) {
      if (!mutationResults[(index % 5) + 23]?.rejected) failures += 1;
    }
    for (let index = 0; index < stressResults.engineConflictEvaluations; index += 1) {
      if (engineFactConflicts.length !== 0) failures += 1;
    }
    for (let index = 0; index < stressResults.coachingRailCompatibilityEvaluations; index += 1) {
      if (coachingRailCompatibility[index % 53]?.result !== "pass") failures += 1;
    }
    for (let index = 0; index < stressResults.libraryCompatibilityEvaluations; index += 1) {
      if (libraryCompatibility[index % 53]?.result !== "pass") failures += 1;
    }
    for (let index = 0; index < stressResults.packageRFreezeComparisons; index += 1) {
      if (packageRFreeze.result !== "pass") failures += 1;
    }
    for (let index = 0; index < stressResults.productShadowInvarianceComparisons; index += 1) {
      if (activationGuards.productShadowChangeCount !== 0 || activationGuards.productUiChangeCount !== 0) failures += 1;
    }
    for (let index = 0; index < stressResults.staleGenerationAttacks; index += 1) {
      if (generatedExerciseCoachingFallbackStatus().stale) failures += 1;
    }
    for (let index = 0; index < stressResults.noRescueMutations; index += 1) {
      if (mutationResults[index % mutationResults.length]?.acceptedDownstreamRescueCount !== 0) failures += 1;
    }
    expect(failures).toBe(stressResults.failureCount);
  });

  it("keeps Knowledge prose out of decision and Product runtime modules", () => {
    expect(Object.values(runtimeBoundary).every((count) => count === 0)).toBe(true);
    const protectedRuntimeRoots = [
      "src/candidate", "src/sessionComposer", "src/week", "src/prescription",
      "src/productShadow",
    ].map((path) => resolve(packageRoot, path)).filter((path) => {
      try { return statSync(path).isDirectory(); } catch { return false; }
    });
    const forbidden = protectedRuntimeRoots.flatMap(sourceFiles).filter((path) =>
      /praxis-knowledge-core|@praxis\/knowledge-core/.test(readFileSync(path, "utf8")));
    expect(forbidden).toEqual([]);
    expect(activationGuards.productUiChangeCount).toBe(0);
    expect(activationGuards.fullLighterRecoveryImplementationCount).toBe(0);
  });

  it("keeps all evidence fingerprints deterministic", () => {
    expect(preG2KFingerprints.holdout).toBe(knowledgeCompletionFingerprint(holdoutManifest));
    expect(preG2KFingerprints.registry).toBe(knowledgeCompletionFingerprint(PRODUCTION_53_KNOWLEDGE_ENTRIES));
    expect(preG2KFingerprints.combined).toHaveLength(64);
  });

  it("classifies the tranche ready while leaving only the authorized next dependency", () => {
    expect(completionSummary.classification).toBe(
      "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_V1_READY_FOR_SESSION_PRACTICE_OPTIONS_V2_BRIDGE_AUTHORIZATION",
    );
    expect(completionSummary.combinedStatus).toBe("PRODUCTION_53_EXERCISE_KNOWLEDGE_CORE_COMPLETE_NO_LIBRARY_UI");
    expect(completionSummary.nextDependency).toBe("SESSION_PRACTICE_OPTIONS_FULL_LIGHTER_RECOVERY_V2_BRIDGE_AUTHORIZATION");
  });
});
