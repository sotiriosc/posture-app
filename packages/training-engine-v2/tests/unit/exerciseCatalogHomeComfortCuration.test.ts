import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CURATION_REFERENCE,
  DISPOSITIONS,
  HOME_COMFORT_PROFILE_REFERENCE,
  HOME_COMFORT_SELECTION_POLICY_REFERENCE,
  LEDGER_BEFORE_SHA,
  REFERENCE_CATALOG_SOURCE_SHA,
  fingerprint,
} from "../exerciseCatalogHomeComfort/contracts";
import {
  activationGuards,
  allCandidateConcepts,
  causalPairs,
  closureProjection,
  commonStrengthCandidates,
  controlledScenarios,
  coverageExperienceAndFamiliarityStates,
  coverageMatrix,
  coveragePurposes,
  currentCatalogInventory,
  deferredCategories,
  environments,
  expectedCanonicalIds,
  firstSessionCohort,
  historicalP1Candidates,
  holdoutManifest,
  homeCandidates,
  homeComfortProfileSchema,
  homeComfortSelectionPolicy,
  homeCoverageMatrix,
  legacyProductCatalogComparison,
  ontologyAnswers,
  ontologyClassification,
  ownerQuestions,
  packages,
  practiceOptionsReminder,
  readiness,
  realizationAudit,
  sourceFreezeManifest,
  upstreamFingerprints,
} from "../exerciseCatalogHomeComfort/evidence";
import {
  curationFingerprints,
  curationJsonReports,
  curationMarkdownReports,
  reportCorpusFingerprint,
} from "../exerciseCatalogHomeComfort/reports";
import {
  antiBloatResult,
  metamorphicResults,
  mutationResults,
  validateGuardModel,
  validationSummary,
} from "../exerciseCatalogHomeComfort/validation";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const sha256 = (path: string) => createHash("sha256").update(readFileSync(resolve(workspaceRoot, path))).digest("hex");

describe("Exercise Catalog Coverage and Home Comfort Curation V1", () => {
  it("keeps all contracts design-only and the required ledger baseline explicit", () => {
    expect(CURATION_REFERENCE).toEqual({
      contractId: "EXERCISE_CATALOG_COVERAGE_AND_HOME_COMFORT_CURATION_V1",
      contractVersion: "1.0.0",
      authority: "read_only_not_production_catalog_expansion",
    });
    expect(HOME_COMFORT_PROFILE_REFERENCE.activation).toBe("design_only");
    expect(HOME_COMFORT_SELECTION_POLICY_REFERENCE.activation).toBe("not_active");
    expect(LEDGER_BEFORE_SHA).toBe("9265f70a7c0707ff88314a6673e954c54326956a187a50aa834793541982b562");
    expect(upstreamFingerprints.canonicalLedgerBefore).toBe(LEDGER_BEFORE_SHA);
  });

  it("preserves the exact 45-row historical inventory and source fingerprint", () => {
    expect(currentCatalogInventory.rowCount).toBe(45);
    expect(currentCatalogInventory.uniqueIdCount).toBe(45);
    expect(currentCatalogInventory.rows.map((row) => row.id)).toEqual(expectedCanonicalIds);
    expect(currentCatalogInventory.changes).toEqual({ additions: 0, modifications: 0, deletions: 0 });
    expect(upstreamFingerprints.referenceCatalogSource).toBe(REFERENCE_CATALOG_SOURCE_SHA);
  });

  it("models comfort separately from experience, difficulty, Safety, and ranking", () => {
    expect(homeComfortProfileSchema.dimensions).toHaveLength(18);
    expect(homeComfortProfileSchema.separateFrom).toEqual(expect.arrayContaining([
      "exercise_difficulty", "experience_level", "Safety", "exercise_score", "Product_preference",
    ]));
    expect(homeComfortProfileSchema.weightedScore).toBeNull();
    expect(homeComfortProfileSchema.rankingAuthority).toBe("none");
    expect(homeComfortSelectionPolicy.precedence.slice(0, 5)).toEqual([
      "Safety_and_explicit_contraindication",
      "exact_equipment_legality",
      "required_purpose_and_coverage",
      "pain_restriction_and_response",
      "exact_familiarity_and_productive_continuity",
    ]);
  });

  it("records same-identity realizations without resolving owner identity questions silently", () => {
    expect(realizationAudit.filter((entry) => entry.decision === "same_identity")).toHaveLength(9);
    expect(realizationAudit.filter((entry) => entry.decision === "unresolved")).toHaveLength(3);
    expect(realizationAudit.find((entry) => entry.identity === "push-up")?.decision).toBe("same_identity");
    expect(realizationAudit.find((entry) => entry.identity === "split-squat_vs_reverse-lunge")?.decision).toBe("unresolved");
    expect(realizationAudit.find((entry) => entry.identity === "bodyweight-box-squat_vs_bodyweight-squat")?.decision).toBe("unresolved");
  });

  it("covers every environment/pattern and preserves truthful pulling limitations", () => {
    expect(environments).toHaveLength(10);
    expect(coverageMatrix).toHaveLength(250);
    expect(new Set(coverageMatrix.map((entry) => entry.environment))).toEqual(new Set(environments.map((entry) => entry.id)));
    expect(new Set(coverageMatrix.flatMap((entry) => entry.experienceAndFamiliarityStates))).toEqual(new Set(coverageExperienceAndFamiliarityStates));
    expect(new Set(coverageMatrix.flatMap((entry) => entry.applicablePurposes))).toEqual(new Set(coveragePurposes));
    expect(homeCoverageMatrix.filter((entry) => entry.pattern === "vertical_pull" && entry.status === "impossible_without_equipment").length).toBeGreaterThan(0);
    expect(coverageMatrix.some((entry) => entry.candidateIds.includes("band-pull-apart") && entry.pattern === "horizontal_pull")).toBe(false);
    expect(coverageMatrix.some((entry) => entry.currentIds.includes("dumbbell-pullover"))).toBe(false);
  });

  it("re-audits home, historical P1, common-strength, and deferred candidates", () => {
    expect(homeCandidates).toHaveLength(13);
    expect(historicalP1Candidates).toHaveLength(9);
    expect(commonStrengthCandidates).toHaveLength(8);
    expect(allCandidateConcepts).toHaveLength(30);
    expect(deferredCategories).toHaveLength(13);
    expect(allCandidateConcepts.every((entry) => DISPOSITIONS.includes(entry.disposition))).toBe(true);
    expect(homeCandidates.find((entry) => entry.id === "dumbbell-floor-press")?.disposition).toBe("ready_for_owner_selection");
    expect(homeCandidates.find((entry) => entry.id === "foot-anchored-seated-band-row")?.disposition).toBe("home_comfort_rejected");
    expect(historicalP1Candidates.find((entry) => entry.id === "incline-dumbbell-bench-press")?.disposition).toBe("same_identity_realization");
  });

  it("uses screenshot-visible legacy Product vocabulary as context without promoting it", () => {
    expect(legacyProductCatalogComparison.currentRowCount).toBe(225);
    expect(legacyProductCatalogComparison.currentUniqueIdCount).toBe(225);
    expect(legacyProductCatalogComparison.rows).toHaveLength(9);
    expect(legacyProductCatalogComparison.rows.every((entry) => entry.screenshotObserved)).toBe(true);
    expect(legacyProductCatalogComparison.rows.find((entry) => entry.legacyId === "band-pull-aparts")?.finding)
      .toContain("cannot promote pull-apart to a full horizontal-pull receiver");
    expect(legacyProductCatalogComparison.rows.find((entry) => entry.legacyId === "band-biceps-curl")?.disposition)
      .toBe("ready_after_targeted_metadata_curation");
    expect(legacyProductCatalogComparison.authority).toBe("legacy_product_context_only_not_v2_identity_or_equipment_authority");
  });

  it("compares three packages without selecting or recommending one", () => {
    expect(packages.map((entry) => entry.id)).toEqual(["H", "G", "M"]);
    expect(packages.every((entry) => entry.candidateIds.length === entry.newRowCount)).toBe(true);
    expect(readiness.packageSelected).toBe(false);
    expect(readiness.recommendedPackage).toBeNull();
    expect(ownerQuestions).toHaveLength(15);
  });

  it("predeclares first-session and causal evidence with no production selection", () => {
    expect(firstSessionCohort).toHaveLength(22);
    expect(firstSessionCohort.every((entry) => !entry.productionSelectionApplied)).toBe(true);
    expect(causalPairs).toHaveLength(10);
    expect(causalPairs.map((entry) => entry.left)).toEqual(expect.arrayContaining([
      "unknown_home_familiarity", "bench_absent", "band_anchor_absent", "relevant_pain_absent",
    ]));
  });

  it("covers the 240-scenario minimum and every current/candidate identity", () => {
    expect(controlledScenarios.length).toBeGreaterThanOrEqual(240);
    const subjects = new Set(controlledScenarios.map((entry) => entry.subject));
    for (const id of expectedCanonicalIds) expect(subjects.has(id)).toBe(true);
    for (const entry of allCandidateConcepts) expect(subjects.has(entry.id)).toBe(true);
    expect(controlledScenarios.every((entry) => !entry.productionSelectionApplied)).toBe(true);
  });

  it("freezes a 400-case holdout across identities, candidates, environments, and comfort dimensions", () => {
    expect(holdoutManifest.length).toBeGreaterThanOrEqual(400);
    const subjects = new Set(holdoutManifest.map((entry) => entry.subject));
    const holdoutEnvironments = new Set(holdoutManifest.map((entry) => entry.environment));
    const dimensions = new Set(holdoutManifest.map((entry) => entry.comfortDimension));
    for (const id of expectedCanonicalIds) expect(subjects.has(id)).toBe(true);
    for (const entry of allCandidateConcepts) expect(subjects.has(entry.id)).toBe(true);
    for (const environment of environments) expect(holdoutEnvironments.has(environment.id)).toBe(true);
    for (const dimension of homeComfortProfileSchema.dimensions) expect(dimensions.has(dimension)).toBe(true);
  });

  it("rejects every semantic mutation and passes all metamorphic relations", () => {
    expect(validateGuardModel(activationGuards)).toEqual([]);
    expect(mutationResults).toHaveLength(32);
    expect(mutationResults.every((entry) => entry.semanticStructureChanged && entry.rejected && entry.errors.length > 0)).toBe(true);
    expect(metamorphicResults.invariants).toHaveLength(10);
    expect(metamorphicResults.materialResponses).toHaveLength(11);
    expect(metamorphicResults.invariants.every((entry) => entry.passed)).toBe(true);
    expect(metamorphicResults.materialResponses.every((entry) => entry.passed && entry.baseline !== entry.changed)).toBe(true);
  });

  it("keeps anti-bloat, Product, engine, delivery, and activation guards at zero", () => {
    expect(antiBloatResult).toMatchObject({
      catalogSizeTarget: null,
      candidateWithoutReceiverCount: 0,
      duplicateIdentityCount: 0,
      genericWarmupCount: 0,
      genericActivationCount: 0,
      productHomeProgramGrowthCount: 0,
      noveltyQuota: 0,
      varietyQuota: 0,
      productionSelectionApplied: false,
    });
    expect(Object.entries(activationGuards).filter(([key]) =>
      key.endsWith("Count") || key.endsWith("Changes") || key.startsWith("productionRow") || key.endsWith("Quota")
    ).every(([, value]) => value === 0)).toBe(true);
    expect(activationGuards.ledgerCompleted).toBe(false);
    expect(activationGuards.gCompleted).toBe(false);
  });

  it("proves protected production and Product source files are byte-identical", () => {
    const packageRAuthorizedSources = new Set([
      "packages/training-engine-v2/src/data/referenceExercises.ts",
      "packages/training-engine-v2/src/candidate/ranking/rankCandidates.ts",
      "packages/training-engine-v2/src/sessionComposer/candidatePools.ts",
    ]);
    for (const [path, expected] of Object.entries(sourceFreezeManifest)) {
      if (packageRAuthorizedSources.has(path)) continue;
      expect(sha256(path), path).toBe(expected);
    }
  });

  it("keeps Full/Lighter/Recovery design-only and outside Longitudinal failure", () => {
    expect(practiceOptionsReminder.status).toBe("future_separate_authorization");
    expect(practiceOptionsReminder.implementationCount).toBe(0);
    expect(practiceOptionsReminder.lighter.prohibitedDefinition).toBe("minus_one_set_everywhere");
    expect(practiceOptionsReminder.longitudinalFailureSignalFromOneChoice).toBe(false);
  });

  it("answers all ontology questions and earns the top read-only classification", () => {
    expect(ontologyAnswers).toHaveLength(31);
    expect(ontologyClassification).toBe("EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_ONTOLOGY_READY");
    expect(readiness.classification).toBe("EXERCISE_CATALOG_COVERAGE_AND_HOME_COMFORT_CURATION_V1_READY_FOR_OWNER_SELECTION_OF_PRODUCTION_EXPANSION_TRANCHE");
    expect(closureProjection).toMatchObject({
      preG1: "completed_and_proven_read_only",
      preG2: "open_owner_approved_production_expansion",
      preG3: "open_practice_options_bridge",
      g: "open_controlled_owner_account_delivery",
      h: "open_broader_activation",
      finalState: "INCOMPLETE_FUTURE_WORK_REMAINS",
      nextDependency: "OWNER_SELECTION_OF_EXERCISE_CATALOG_EXPANSION_TRANCHE_V1",
    });
  });

  it("renders deterministic required reports and fingerprints", () => {
    expect(Object.keys(curationMarkdownReports)).toEqual(expect.arrayContaining([
      "EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_ONTOLOGY_AUDIT.md",
      "EXERCISE_HOME_COMFORT_PROFILE.md",
      "HOME_EXERCISE_COMFORT_SELECTION_POLICY_V1.md",
      "EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_CURATION_V1_HOLDOUT_MANIFEST.md",
      "EXERCISE_CATALOG_COVERAGE_HOME_COMFORT_CURATION_READINESS.md",
    ]));
    expect(Object.keys(curationMarkdownReports)).toHaveLength(25);
    expect(Object.keys(curationJsonReports)).toHaveLength(19);
    for (const content of Object.values(curationJsonReports)) expect(() => JSON.parse(content)).not.toThrow();
    expect(curationFingerprints.upstream.chunkF).toBe("1665c6b780ab2638d377f09bac48de61480ab76ea346faf1304b799f1bbc9404");
    expect(curationFingerprints.combinedCuration).toHaveLength(64);
    expect(reportCorpusFingerprint).toBe(fingerprint({ markdown: curationMarkdownReports, json: curationJsonReports }));
    expect(validationSummary.guardErrors).toEqual([]);
  });
});
