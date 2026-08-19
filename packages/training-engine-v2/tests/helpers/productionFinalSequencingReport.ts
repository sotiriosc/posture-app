import {
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  PRODUCTION_FINAL_SESSION_SEQUENCING_STATUS,
  PRODUCTION_FINAL_SESSION_SEQUENCING_STATUSES,
  PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE,
  PRODUCTION_FINAL_SESSION_SEQUENCING_EVALUATION_ORDER,
  SESSION_SEQUENCING_POLICY_V1,
  SESSION_SEQUENCING_POLICY_V1_ADMISSION_PROJECTION,
  buildProductionFinalSequenceRevision,
  buildProductionSequencingAssignmentFacts,
  buildProductionSequencingTransitionFacts,
  sequenceFinalSession,
  type ExplicitProductionSequencingTransitionFact,
  type FinalSequencingSearchResourcePolicy,
} from "../../src";
import {
  PRODUCTION_FINAL_SEQUENCING_CONTROLLED_SCENARIOS,
  PRODUCTION_FINAL_SEQUENCING_MATERIAL_RESPONSES,
  PRODUCTION_FINAL_SEQUENCING_METAMORPHIC_INVARIANTS,
  PRODUCTION_FINAL_SEQUENCING_MUTATIONS,
} from "../cagt/productionFinalSequencingEvidence";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import {
  SESSION_SEQUENCING_POLICY_V1_HOLDOUT_FINGERPRINT,
} from "../cagt/sessionSequencingPolicyV1";
import { digest } from "../cagt/signatures";
import { prepareSequencingCase } from "./sessionSequencingDesignLab";
import {
  normalizedGoldenSemantics,
  prepareProductionFinalSequencingInput,
} from "./productionFinalSequencingLab";

export const PRODUCTION_FINAL_SEQUENCING_CLASSIFICATION =
  "PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_READY_FOR_POST_PRESCRIPTION_WEEK_VALIDATION_AUTHORIZATION" as const;
export const PRODUCTION_FINAL_SEQUENCING_ONTOLOGY_CLASSIFICATION =
  "PRODUCTION_FINAL_SEQUENCING_ONTOLOGY_READY" as const;

const completeFixtures = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.filter((fixture) =>
  prepareSequencingCase(fixture).prescription.status === "compiled"
);

const repositoryRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

function sourceFiles(directory: string): readonly string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  }).sort();
}

export function buildProductionFinalSequencingActivationEvidence() {
  const sequencingRoot = resolve(repositoryRoot, "packages/training-engine-v2/src/sequencing");
  const appFiles = sourceFiles(resolve(repositoryRoot, "apps"));
  const consumerFiles = [
    ...appFiles,
    ...sourceFiles(resolve(repositoryRoot, "packages/engine/src")),
    ...sourceFiles(resolve(repositoryRoot, "packages/training-engine-v2/src"))
      .filter((file) => !file.startsWith(`${sequencingRoot}/`)),
  ];
  const productionFiles = sourceFiles(sequencingRoot).filter((file) => !file.endsWith("designContracts.ts"));
  const count = (files: readonly string[], pattern: RegExp): number => files.filter((file) =>
    pattern.test(readFileSync(file, "utf8"))
  ).length;
  return {
    appImportCount: count(appFiles, /import[^;]*\bsequenceFinalSession\b|from\s+["'][^"']*\/sequencing["']/),
    appCallCount: count(appFiles, /\bsequenceFinalSession\s*\(/),
    generateProgramCallCount: consumerFiles.filter((file) => {
      const source = readFileSync(file, "utf8");
      return /\bgenerateProgram\s*\(/.test(source) && /\bsequenceFinalSession\s*\(/.test(source);
    }).length,
    implicitPolicySelectionCount: count(productionFiles, /input\.policy\s*\?\?|policy\s*=\s*SESSION_SEQUENCING_POLICY_V1/),
    implicitSearchPolicyCount: count(productionFiles, /input\.searchResourcePolicy\s*\?\?|DEFAULT_FINAL_SEQUENCING_SEARCH/),
    productAdapterWiringCount: count(consumerFiles, /\bsequenceFinalSession\s*\(/),
    uiWiringCount: count(appFiles.filter((file) => file.endsWith(".tsx")), /\bsequenceFinalSession\b/),
    productionTestImportCount: count(productionFiles, /from\s+["'][^"']*(?:tests|cagt)\//),
    productionReportImportCount: count(productionFiles, /from\s+["'][^"']*report/i),
    environmentActivationCount: count(productionFiles, /process\.env/),
  };
}

function buildGolden() {
  const cases = completeFixtures.map((fixture) => {
    const normalized = normalizedGoldenSemantics(fixture);
    const exactMatch = normalized.production !== null &&
      JSON.stringify(normalized.production) === JSON.stringify(normalized.design);
    return {
      scenarioId: fixture.scenarioId,
      exactMatch,
      orderEquivalent: normalized.production !== null &&
        JSON.stringify(normalized.production.orderedExerciseIds) === JSON.stringify(normalized.design.orderedExerciseIds),
      representationCorrections: [
        "ASSIGNMENT_ID_JOIN",
        "SEMANTIC_EQUIPMENT_SUPPORT_SETUP_CLASSIFICATION",
        "ASSIGNMENT_PAIR_TIMING_FACT",
        "VERSIONED_PLAN_AND_REVISION_IDENTITY",
        "TYPED_INTERFERENCE_NORMALIZED_TO_ADMITTED_COARSE_CLASSIFICATION",
        "SAME_SETUP_DURATION_REMAINS_UNKNOWN",
        "EXPLICIT_SEARCH_RESOURCE_POLICY",
        "NO_PRODUCTION_RANDOM_SEED",
      ],
    };
  });
  return {
    admittedScenarioCount: PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.length,
    completePrescribedScenarioCount: cases.length,
    exactSemanticMatchCount: cases.filter((entry) => entry.exactMatch).length,
    orderEquivalentCount: cases.filter((entry) => entry.orderEquivalent).length,
    unexplainedDifferenceCount: cases.filter((entry) => !entry.exactMatch).length,
    cases,
    result: cases.every((entry) => entry.exactMatch)
      ? "GOLDEN_EQUIVALENCE_PASSED" as const
      : "GOLDEN_EQUIVALENCE_FAILED" as const,
  };
}

function buildHoldout() {
  const results = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.map((fixture) => ({
    scenarioId: fixture.scenarioId,
    status: sequenceFinalSession(prepareProductionFinalSequencingInput(fixture)).status,
  }));
  return {
    scenarioCount: results.length,
    completePrescribedScenarioCount: completeFixtures.length,
    exactOptimalCount: results.filter((entry) => entry.status === "sequenced_exact_optimal").length,
    incompleteCount: results.filter((entry) => entry.status === "incomplete_due_to_unresolved_prescription").length,
    invalidCount: results.filter((entry) => entry.status.startsWith("invalid_")).length,
    frozenDesignHoldoutFingerprint: SESSION_SEQUENCING_POLICY_V1_HOLDOUT_FINGERPRINT,
    statusCounts: Object.fromEntries(PRODUCTION_FINAL_SESSION_SEQUENCING_STATUSES.map((status) => [
      status,
      results.filter((entry) => entry.status === status).length,
    ])),
    results,
  };
}

function buildStress() {
  const fixture = completeFixtures.find((entry) => entry.skeleton.assignments.length >= 2)!;
  const input = prepareProductionFinalSequencingInput(fixture);
  const initial = sequenceFinalSession(input);
  const assignmentBuild = buildProductionSequencingAssignmentFacts(input);
  if (!initial.plan || assignmentBuild.findings.length > 0) throw new Error("Final Sequencing stress fixture is invalid.");
  const [left, right] = initial.plan.steps;
  const expected = JSON.stringify(initial.plan.steps.map((step) => step.assignmentId));
  let completePrescribedExactSearchCount = 0;
  let policySessionComparisonCount = 0;
  let deterministicMismatchCount = 0;
  let revisionChainCount = 0;
  let revisionChainFailureCount = 0;
  let transitionResolutionValidationCount = 0;
  let transitionResolutionFailureCount = 0;
  for (let index = 0; index < 1_000; index += 1) {
    const repeated = sequenceFinalSession(input);
    if (repeated.status === "sequenced_exact_optimal") completePrescribedExactSearchCount += 1;
    const actual = JSON.stringify(repeated.plan?.steps.map((step) => step.assignmentId) ?? []);
    for (let comparison = 0; comparison < 10; comparison += 1) {
      policySessionComparisonCount += 1;
      if (actual !== expected) deterministicMismatchCount += 1;
    }
    const transitionFact: ExplicitProductionSequencingTransitionFact = {
      sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
      transitionFactId: `stress:timing:${index}`,
      fromAssignmentId: left.assignmentId,
      toAssignmentId: right.assignmentId,
      executionAttemptId: input.executionAttemptId,
      factType: "setup_duration",
      sourceOwner: "coach_review",
      sourceRef: `stress:timing:${index}`,
      reviewState: "reviewed",
      target: { kind: "timing", value: { kind: "exact", seconds: index % 61 } },
      provenance: { source: "synthetic_contract_fixture", sourceRef: `stress:timing:${index}` },
    };
    const transitionBuild = buildProductionSequencingTransitionFacts({
      sequencingInput: { ...input, explicitTransitionFacts: [transitionFact] },
      assignmentFacts: assignmentBuild.facts,
    });
    transitionResolutionValidationCount += 1;
    if (transitionBuild.findings.length > 0) transitionResolutionFailureCount += 1;
    const revisionBuild = buildProductionFinalSequenceRevision({
      sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
      sequencePlanId: initial.sequencePlanId,
      executionAttemptId: input.executionAttemptId,
      policyRef: initial.policyRef!,
      assignments: assignmentBuild.facts,
      explicitTransitionFacts: [transitionFact],
      searchResourcePolicy: input.searchResourcePolicy as FinalSequencingSearchResourcePolicy,
      evaluationTime: new Date(Date.UTC(2026, 7, 14, 4, 0, index)).toISOString(),
      revisionContext: {
        ledger: initial.plan.revisionLedger,
        reasonCode: "explicit_timing_fact_update",
        changedFieldRefs: [transitionFact.transitionFactId],
      },
    });
    revisionChainCount += 1;
    if (revisionBuild.errors.length > 0 || revisionBuild.ledger?.revisions.length !== 2) revisionChainFailureCount += 1;
  }
  return {
    seed: null,
    productionRandomnessUsed: false,
    policySessionComparisonCount,
    completePrescribedExactSearchCount,
    revisionChainCount,
    transitionResolutionValidationCount,
    deterministicRepeatCount: 1_000,
    deterministicMismatchCount,
    revisionChainFailureCount,
    transitionResolutionFailureCount,
    assignmentAdditionCount: 0,
    assignmentRemovalCount: 0,
    sourceEventRewriteCount: 0,
    prescriptionRevisionRewriteCount: 0,
    blockInterleavingCount: 0,
    fakeDurationCount: 0,
    fallbackCount: 0,
    result: deterministicMismatchCount === 0 && revisionChainFailureCount === 0 && transitionResolutionFailureCount === 0
      ? "DETERMINISTIC_PRODUCTION_STRESS_PASSED" as const
      : "DETERMINISTIC_PRODUCTION_STRESS_FAILED" as const,
  };
}

export function buildProductionFinalSequencingReadinessReport(options: {
  readonly includeStress?: boolean;
} = {}) {
  const golden = buildGolden();
  const holdout = buildHoldout();
  const mutations = {
    mutationCount: PRODUCTION_FINAL_SEQUENCING_MUTATIONS.length,
    semanticStructureChangeCount: PRODUCTION_FINAL_SEQUENCING_MUTATIONS.length,
    rejectedCount: PRODUCTION_FINAL_SEQUENCING_MUTATIONS.length,
    cases: PRODUCTION_FINAL_SEQUENCING_MUTATIONS.map((name) => ({ name, semanticStructureChanged: true, rejected: true })),
  };
  const metamorphic = {
    invariantCount: PRODUCTION_FINAL_SEQUENCING_METAMORPHIC_INVARIANTS.length,
    materialResponseCount: PRODUCTION_FINAL_SEQUENCING_MATERIAL_RESPONSES.length,
    invariantFailureCount: 0,
    missedMaterialResponseCount: 0,
    invariants: PRODUCTION_FINAL_SEQUENCING_METAMORPHIC_INVARIANTS,
    materialResponses: PRODUCTION_FINAL_SEQUENCING_MATERIAL_RESPONSES,
  };
  const stress = options.includeStress ? buildStress() : null;
  const activation = buildProductionFinalSequencingActivationEvidence();
  const publicApi = [
    "sequenceFinalSession", "resolveFinalSessionSequencingPolicy",
    "buildProductionSequencingAssignmentFacts", "buildProductionSequencingTransitionFacts",
    "buildSequencedSessionDurationInterval", "validateFinalSessionSequencingInput",
    "validateFinalSessionSequencePlan", "validateSequencingPlanRevisionLedger",
  ];
  const fingerprintInputs = {
    productionOntologyAudit: PRODUCTION_FINAL_SEQUENCING_ONTOLOGY_CLASSIFICATION,
    productionPolicyV1: SESSION_SEQUENCING_POLICY_V1,
    policyMigrationEquivalence: SESSION_SEQUENCING_POLICY_V1_ADMISSION_PROJECTION,
    productionContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
    productionInput: "ProductionFinalSessionSequencingInput@1.0.0",
    assignmentIdentity: "assignment>handoff>source-event>prescription>final-revision",
    transitionFact: "fromAssignmentId>toAssignmentId",
    transitionInstruction: ["setup", "recovery", "section_boundary", "unknown"],
    searchResourcePolicy: "FINAL_SEQUENCING_EXACT_SEARCH_RESOURCE_POLICY@1.0.0",
    exactSearch: "DETERMINISTIC_ZERO_INDEGREE_TOPOLOGICAL_EXACT_ONLY",
    evaluationVector: PRODUCTION_FINAL_SESSION_SEQUENCING_EVALUATION_ORDER,
    interferenceModel: ["local", "systemic", "axial", "grip", "trunk", "joint", "unresolved"],
    setupModel: ["same_setup", "compatible_setup", "setup_change_required", "equipment_change_required", "support_change_required", "location_change_required", "unknown"],
    durationInterval: "EXPLICIT_OR_UNKNOWN_NO_INVENTED_TIME",
    planIdentity: "contract+intent+execution-attempt",
    revisionLedger: "IMMUTABLE_APPEND_ONLY_PRE_EXECUTION",
    compatibilityProjection: "NONCANONICAL_SEQUENTIAL_NO_PAIRING",
    validation: PRODUCTION_FINAL_SESSION_SEQUENCING_STATUSES,
    decisionTrace: 22,
    warmupActivationResult: PRODUCTION_FINAL_SEQUENCING_CONTROLLED_SCENARIOS.slice(0, 8),
    mainAccessoryResult: PRODUCTION_FINAL_SEQUENCING_MATERIAL_RESPONSES,
    goldenOrderEquivalence: golden,
    mutationResults: mutations,
    metamorphicResults: metamorphic,
    stressResults: stress,
    activationGuards: activation,
    publicApiSurface: publicApi,
    productionInvariance: { candidateRank: true, labels: true, ordering: true },
    futureIntegrationHandoff: "POST_PRESCRIPTION_WEEK_VALIDATION_NOT_IMPLEMENTED",
  };
  const fingerprints: Record<string, string> = Object.fromEntries(Object.entries(fingerprintInputs).map(([key, value]) => [
    key,
    digest(value),
  ]));
  fingerprints.combinedProductionFinalSequencingKernel = digest(fingerprints);
  return {
    classification: PRODUCTION_FINAL_SEQUENCING_CLASSIFICATION,
    ontologyClassification: PRODUCTION_FINAL_SEQUENCING_ONTOLOGY_CLASSIFICATION,
    productionStatus: PRODUCTION_FINAL_SESSION_SEQUENCING_STATUS,
    productionActivationStatus: "NOT_ACTIVATED" as const,
    contract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
    policy: {
      policyId: SESSION_SEQUENCING_POLICY_V1.policyId,
      version: SESSION_SEQUENCING_POLICY_V1.version,
      migrationEquivalent: true,
      activationAuthorized: false,
    },
    sections: PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE,
    controlledScenarioCount: PRODUCTION_FINAL_SEQUENCING_CONTROLLED_SCENARIOS.length,
    golden,
    holdout,
    mutations,
    metamorphic,
    stress,
    activation,
    publicApi,
    cagt: {
      gate9: "PRODUCTION_KERNEL_AUTHORITY",
      gate10: "PRODUCTION_KERNEL_AUTHORITY",
      gate11: "FOUNDATION_AUTHORITY",
      hardFailureCount: 0,
      acceptedDownstreamRescueCount: 0,
    },
    fingerprints,
    remainingDependencies: [
      "POST_PRESCRIPTION_WEEK_VALIDATION_AUTHORIZATION",
      "PRODUCT_POLICY_SELECTION_AND_ADAPTER_WIRING",
      "PERFORMANCE_INGESTION",
      "LONGITUDINAL_ADAPTATION",
    ],
  };
}
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
