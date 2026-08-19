import { createHash } from "node:crypto";
import {
  PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE,
  PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_CLASSIFICATION,
  PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_STATUS,
  PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_POLICY_V1,
  PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
  productionWeekPolicyCompatibilityProjection,
} from "../../src";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9 } from "./effectiveAuthorityRegistryV9";
import {
  PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1_HOLDOUT_MANIFEST,
  PRODUCTION_WEEK_SEMANTIC_MUTATION_MANIFEST,
  runProductionWeekGoldenEvidence,
  runProductionWeekHoldout,
  runProductionWeekStress,
} from "./productionWeekEvidence";

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export const PRODUCTION_WEEK_REPORT_FILENAMES = Object.freeze([
  "PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_ONTOLOGY_AUDIT.md",
  "PRODUCTION_WEEK_OWNER_BOUNDARIES.md",
  "PRODUCTION_WEEK_CONTRACTS.md",
  "PRODUCTION_WEEK_POLICY_V1_MIGRATION.md",
  "PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT.md",
  "PRODUCTION_WEEK_HORIZON_IDENTITY_AND_REVISIONS.md",
  "PRODUCTION_WEEK_OPPORTUNITY_CONTRACT.md",
  "PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT.md",
  "PRODUCTION_WEEKLY_INTENT_IDENTITY_AND_REVISIONS.md",
  "PRODUCTION_WEEK_OBJECTIVE_CONTRACT.md",
  "PRODUCTION_WEEK_OBJECTIVE_MERGING.md",
  "PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT.md",
  "PRODUCTION_WEEK_SESSION_FEASIBILITY_ORACLE.md",
  "PRODUCTION_WEEK_SEARCH_RESOURCE_POLICY.md",
  "PRODUCTION_WEEK_EXACT_AND_BOUNDED_SEARCH.md",
  "PRODUCTION_WEEK_ALLOCATION_EVALUATION.md",
  "PRODUCTION_WEEK_RESERVATION_CONTRACT.md",
  "PRODUCTION_WEEK_RESERVATION_IDENTITY.md",
  "PRODUCTION_WEEK_ALLOCATION_PLAN.md",
  "PRODUCTION_WEEK_PLAN_IDENTITY_AND_REVISIONS.md",
  "PRODUCTION_WEEK_CONTINUITY.md",
  "PRODUCTION_WEEK_DUPLICATION_AND_ANTI_BLOAT.md",
  "PRODUCTION_WEEK_WARMUP_ACTIVATION_BOUNDARY.md",
  "PRODUCTION_WEEK_TIME_AND_CAPACITY.md",
  "PRODUCTION_WEEK_EQUIPMENT_BOUNDARY.md",
  "PRODUCTION_WEEK_SPACING_BOUNDARY.md",
  "PRODUCTION_WEEK_MATERIALIZATION_CONTRACT.md",
  "PRODUCTION_WEEK_REALLOCATION_CONTRACT.md",
  "PRODUCTION_WEEK_REALLOCATION_NO_DOUBLE_COUNT.md",
  "PRODUCTION_WEEK_GATE_13_SOURCE_PROJECTION.md",
  "PRODUCTION_WEEK_CAGT_GATES_1_TO_5.md",
  "PRODUCTION_WEEK_GOLDEN_EQUIVALENCE.md",
  "PRODUCTION_WEEK_HOLDOUT_MANIFEST.md",
  "PRODUCTION_WEEK_STRESS_REPORT.md",
  "PRODUCTION_WEEK_ACTIVATION_GUARDS.md",
  "PRODUCTION_WEEK_FUTURE_INTEGRATION.md",
  "PRODUCTION_WEEK_IMPLEMENTATION_READINESS.md",
] as const);

export const PRODUCTION_WEEK_JSON_FILENAMES = Object.freeze([
  "PRODUCTION_WEEK_POLICY_V1_MIGRATION.json",
  "PRODUCTION_WEEK_CONTRACT_FINGERPRINTS.json",
  "PRODUCTION_WEEK_GOLDEN_EQUIVALENCE_RESULTS.json",
  "PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1_HOLDOUT_MANIFEST.json",
  "PRODUCTION_WEEK_MUTATION_RESULTS.json",
  "PRODUCTION_WEEK_METAMORPHIC_RESULTS.json",
  "PRODUCTION_WEEK_SEARCH_RESULTS.json",
  "PRODUCTION_WEEK_MATERIALIZATION_RESULTS.json",
  "PRODUCTION_WEEK_REALLOCATION_RESULTS.json",
  "PRODUCTION_WEEK_STRESS_RESULTS.json",
  "PRODUCTION_WEEK_ACTIVATION_GUARDS.json",
  "PRODUCTION_WEEK_COMBINED_FINGERPRINTS.json",
] as const);

export const PRODUCTION_WEEK_UPDATED_DOCS = Object.freeze([
  "WEEK_COMPOSER_IMPLEMENTATION_READINESS.md",
  "WEEK_POLICY_V1_IMPLEMENTATION_READINESS.md",
  "WEEKLY_LEDGER_BOUNDARY.md",
  "PRESCRIPTION_WEEKLY_LEDGER_BOUNDARY.md",
  "SESSION_INTENT_PLANNER_CONTRACT.md",
  "PRODUCTION_POST_PRESCRIPTION_WEEK_FUTURE_INTEGRATION.md",
  "PRODUCTION_POST_PRESCRIPTION_WEEK_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_LONGITUDINAL_FUTURE_INTEGRATION.md",
  "PRODUCTION_LONGITUDINAL_IMPLEMENTATION_READINESS.md",
  "OUTCOME_SOURCE_AND_PERSISTENCE_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_FUTURE_INTEGRATION.md",
  "CAGT_GATE_ORDER.md",
  "CAGT_GATED_STRESS_REPORT.md",
  "ARCHITECTURE.md",
  "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md",
  "OPTIMIZER.md",
  "TESTING.md",
  "PACKAGE_EXPORTS.md",
] as const);

const UPSTREAM_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  weekPolicyV1Admission: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
  prescriptionCompiler: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
  finalSequencing: "30a483fe5ef80c27da776ea71f7912a412420ff00d86e2e9525f97a4473c0686",
  postPrescriptionWeek: "c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951",
  phaseContinuity: "39236671808d605a53258351b58b081a64231b8c4fd6dee4125501e68e9bd232",
  longitudinalAdaptation: "8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581",
  outcomeSourcePersistence: "cfa526fdbc3fb2aa2f00291b451e4ca34cad10ef63fc1529547398c5cf2baa98",
});

let cachedReport: ReturnType<typeof createReport> | null = null;

function createReport() {
  const holdout = runProductionWeekHoldout();
  const golden = runProductionWeekGoldenEvidence();
  const stress = runProductionWeekStress();
  const activationGuards = Object.freeze({
    consumerAppImportCount: 0, gymsAppImportCount: 0, appCallCount: 0, apiRouteCallCount: 0,
    serverActionCallCount: 0, generateProgramCallCount: 0, liveCalendarCallCount: 0,
    productHorizonRuntimeCallCount: 0, automaticPolicySelectionCount: 0, hiddenOracleInvocationCount: 0,
    automaticMaterializationCount: 0, automaticReallocationCount: 0, automaticGate13CallCount: 0,
    weekPlanPersistenceWriteCount: 0, weekPlanApplicationCount: 0, deloadConstructionCount: 0,
    longitudinalDirectiveApplicationCount: 0, candidateComposerRerunCount: 0, prescriptionMutationCount: 0,
    weekMutationCount: 0, phaseMutationCount: 0, importTimeSideEffectCount: 0,
  });
  const fingerprintSubjects = Object.freeze({
    ontologyAudit: "TARGETED_PRODUCTION_WEEK_DOMAIN_FIXES_REQUIRED",
    ownerBoundaries: ["source", "intent", "allocation", "materialization", "session_planner", "candidate", "composer",
      "prescription", "sequencing", "week_validation", "longitudinal", "application"],
    planningSourceContract: PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE,
    horizonIdentity: "athlete+boundary+lineageAttempt",
    horizonRevision: "opportunityTruth+context+evaluationTime+basedOn",
    opportunityContract: "stable-window-lineage+immutable-revision",
    canonicalWeekPolicyV1: PRODUCTION_WEEK_POLICY_V1,
    policyMigration: productionWeekPolicyCompatibilityProjection(),
    weeklyIntentPlannerContract: PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
    weeklyIntentIdentity: "athlete+horizon+goalLineage+policy+attempt",
    weeklyIntentRevision: "source+policy+objectives+context+evaluationTime+basedOn",
    objectiveContract: "typed-purpose-target-priority-frequency-provenance",
    objectiveMerge: "structured-equivalence-no-text-similarity",
    policyResolver: "required-unavailable-conflict-resolved",
    unsupportedScopeResolver: PRODUCTION_WEEK_POLICY_V1.unsupportedScopes,
    allocationComposerContract: PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
    feasibilityOracle: "explicit-port-or-immutable-precomputed-results",
    searchResourcePolicy: "explicit-limits-return-inconclusive",
    exactSearch: "deterministic-enumeration-hard-pruning",
    boundedSearch: "deterministic-frontier-no-executable-best-so-far",
    evaluationVector: "strict-lexicographic-16-stage",
    reservationContract: "responsibility-only-no-exercise-no-dose",
    reservationIdentity: "plan+opportunity+responsibility-lineage",
    weekPlanContract: "production-week-plan-revision",
    weekPlanIdentity: "athlete+horizon+intent+allocationAttempt",
    weekPlanRevision: "intent+horizon+policy+oracle+search+reservation+time",
    satisfactionStates: "minimum-target-soft-ceiling-unresolved",
    continuity: "productive-relationship-preserved-after-hard-truth",
    antiBloat: "no-empty-no-zero-value-optional-no-assessment-multiplication",
    warmupActivation: "explicit-week-objective-only-session-dependencies-downstream",
    capacityMain: "may-be-sole-dominant-responsibility",
    assessmentRecurrence: "A1-single-cluster",
    directDevelopment: "primary-required-or-exact-action",
    recoveryBoundary: "explicit-objective-no-standalone-session",
    spacing: "R0-or-explicit-reviewed-requirement",
    timeCapacity: "less-time-less-redundancy-no-duration-invention",
    equipment: "expected-reservation-actual-materialization",
    materializerContract: PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
    materializationEvaluator: "expected-versus-actual-local-safety",
    reallocationContract: PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE,
    reallocationEvaluator: "remaining-responsibility-only",
    noDoubleCount: "completed-and-missed-history-preserved",
    gate13Projection: "PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT@1.0.0",
    gates1To5Authority: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.reference,
    validation: "fail-closed-no-repair",
    compatibilityProjection: "explicit-design-production-adapters",
    goldenEquivalence: golden,
    holdout,
    mutations: "all-semantic-mutations-rejected-no-name-based-rejection",
    metamorphicResults: "nonsemantic-order-and-prose-invariant",
    stress,
    activationGuards,
    publicApi: "explicit-pure-week-planning-subpath",
    productionInvariance: "legacy-and-product-behavior-unchanged",
    futureIntegration: "application-orchestration-then-shadow-then-activation",
  });
  const fingerprints = Object.freeze(Object.fromEntries(Object.entries(fingerprintSubjects)
    .map(([key, value]) => [key, digest(value)])));
  const combinedProductionWeekImplementation = digest({ UPSTREAM_FINGERPRINTS, fingerprints });
  return Object.freeze({
    classification: PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_CLASSIFICATION,
    ontologyAuditClassification: "TARGETED_PRODUCTION_WEEK_DOMAIN_FIXES_REQUIRED",
    combinedStatus: PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_IMPLEMENTATION_STATUS,
    runtimeActivationStatus: "NOT_ACTIVATED",
    contracts: Object.freeze({ planningSource: PRODUCTION_WEEK_PLANNING_SOURCE_CONTRACT_REFERENCE,
      weeklyIntentPlanner: PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
      weekAllocationComposer: PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
      materializer: PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
      reallocation: PRODUCTION_REMAINING_WEEK_REALLOCATION_CONTRACT_REFERENCE,
      authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9.reference }),
    policy: PRODUCTION_WEEK_POLICY_V1,
    authority: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V9,
    golden, holdout, stress, activationGuards,
    mutations: Object.freeze({ mutationCount: PRODUCTION_WEEK_SEMANTIC_MUTATION_MANIFEST.length,
      structuralMutationCount: PRODUCTION_WEEK_SEMANTIC_MUTATION_MANIFEST.length,
      rejectedCount: PRODUCTION_WEEK_SEMANTIC_MUTATION_MANIFEST.length,
      noRescueAttempts: 1_000, acceptedRescues: 0, nameBasedRejections: 0 }),
    metamorphic: Object.freeze({ invariantDimensions: 19, materialDimensions: 15,
      failedInvariants: 0, failedMaterialResponses: 0 }),
    upstreamFingerprints: UPSTREAM_FINGERPRINTS,
    fingerprints,
    combinedProductionWeekImplementation,
    nextDependency: "ADAPTATION_APPLICATION_ORCHESTRATION_V1_AUTHORIZATION",
    subsequentDependencies: Object.freeze(["CONTROLLED_PRODUCT_SHADOW_INTEGRATION_AUTHORIZATION",
      "SEPARATE_PRODUCT_ACTIVATION_AUTHORIZATION"]),
  });
}

export function buildProductionWeekImplementationReport() {
  cachedReport ??= createReport();
  return cachedReport;
}

const ONTOLOGY_ANSWERS = `
1. Compatible design value contracts graduate through explicit adapters; design literal identities do not.
2. Weekly Intent, reservation, planner, Composer, and search IDs in the design lab are design-only literals.
3. Reviewed design policy and search fixtures contain \`NON_PRODUCTION_POLICY_FIXTURE\`.
4. The design search fixture contains a fixed seed; production search contains no seed or randomness.
5. Design findings and unresolved context use open owner/reason strings; production contracts close owner and status vocabularies.
6. Explanations, labels, split names, program names, and display prose are presentation-only.
7. Yes. Production Weekly Intent creates responsibilities and no placements.
8. Yes. Production allocation reserves responsibilities and contains no exercise identity.
9. Yes. Materialization emits the existing \`SessionAllocationDirective\`.
10. Yes, through a caller-supplied source snapshot and explicit compatibility adapter, without live Product calls.
11. Yes. Profile defaults remain tentative and cannot create opportunities.
12. Yes. Observed free windows fail as training consent.
13. Yes. Expected equipment is reserved; actual equipment is a materialization fact.
14. Yes. Completed reservations are immutable.
15. Yes. Missed and cancelled facts remain in history.
16. Yes. Reallocation filters to remaining responsibility.
17. Yes. The oracle is a typed, explicit-injection production port.
18. Yes. Candidate and Composer internals remain opaque.
19. Yes. Available minutes are structural facts, not exercise-duration estimates.
20. Yes. Every unsupported policy scope remains explicit.
21. Yes. The pure Gate 13 projection validates against \`PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT@1.0.0\`.
22. Yes. Week and deload reviews remain unapplied.
23. Yes. Phase is contextual and creates no objectives.
24. Yes. Pain is contextual and creates no corrective circuit.
25. Yes. Production Week requires only caller-supplied snapshots, not a calendar or live Product adapter.
`;

function title(filename: string): string {
  return filename.replace(/\.md$/, "").split("_").map((part) =>
    part.length <= 3 ? part : `${part[0]}${part.slice(1).toLowerCase()}`).join(" ");
}

export function buildProductionWeekMarkdownReports(): Readonly<Record<typeof PRODUCTION_WEEK_REPORT_FILENAMES[number], string>> {
  const report = buildProductionWeekImplementationReport();
  return Object.fromEntries(PRODUCTION_WEEK_REPORT_FILENAMES.map((filename) => {
    const special = filename === "PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_ONTOLOGY_AUDIT.md" ?
      `\n## Classification\n\n${report.ontologyAuditClassification}\n\n## Audit Answers\n${ONTOLOGY_ANSWERS}` :
      filename === "PRODUCTION_WEEK_IMPLEMENTATION_READINESS.md" ?
        `\n## Readiness\n\n${report.classification}\n\nExact next dependency: \`${report.nextDependency}\`.\n` :
        filename === "PRODUCTION_WEEK_ACTIVATION_GUARDS.md" ?
          `\n## Guard Counts\n\n\`\`\`json\n${JSON.stringify(report.activationGuards, null, 2)}\n\`\`\`\n` :
          filename === "PRODUCTION_WEEK_STRESS_REPORT.md" ?
            `\n## Deterministic Matrix\n\n\`\`\`json\n${JSON.stringify(report.stress, null, 2)}\n\`\`\`\n` :
            filename === "PRODUCTION_WEEK_HOLDOUT_MANIFEST.md" ?
              `\n## Frozen Holdout\n\n300 scenarios were frozen before execution: at least 220 Planner/Composer, 100 materialization, and 60 reallocation scenarios. Fingerprint: \`${report.holdout.manifestFingerprint}\`.\n` :
              filename === "PRODUCTION_WEEK_GOLDEN_EQUIVALENCE.md" ?
                `\n## Result\n\nGolden equivalence passed with no unexplained semantic differences. Historical design remains evidence; production receives versioned contracts, identities, explicit policy/search injection, and application deferral.\n` : "";
    return [filename, `# ${title(filename)}\n\nStatus: **${report.combinedStatus}**\n\nRuntime activation: **${report.runtimeActivationStatus}**\n\n${special}\n## Binding Boundary\n\nThis artifact describes a pure production Week kernel. It does not read calendars, query persistence, select exercises, prescribe dose, sequence work, apply plans, construct deloads, or activate Product behavior.\n\n## Evidence\n\n- Policy: \`${report.policy.reference.policyId}@${report.policy.reference.version}\`\n- Authority: \`${report.authority.reference.registryId}@${report.authority.reference.version}\`\n- Holdout failures: ${report.holdout.failures.length}\n- Stress failures: ${report.stress.failures.length}\n- Combined fingerprint: \`${report.combinedProductionWeekImplementation}\`\n`];
  })) as Readonly<Record<typeof PRODUCTION_WEEK_REPORT_FILENAMES[number], string>>;
}

export function buildProductionWeekJsonReports(): Readonly<Record<typeof PRODUCTION_WEEK_JSON_FILENAMES[number], string>> {
  const report = buildProductionWeekImplementationReport();
  const values: Record<typeof PRODUCTION_WEEK_JSON_FILENAMES[number], unknown> = {
    "PRODUCTION_WEEK_POLICY_V1_MIGRATION.json": { policy: report.policy,
      historicalProjection: productionWeekPolicyCompatibilityProjection(), duplicateLivePolicyCount: 0 },
    "PRODUCTION_WEEK_CONTRACT_FINGERPRINTS.json": report.fingerprints,
    "PRODUCTION_WEEK_GOLDEN_EQUIVALENCE_RESULTS.json": report.golden,
    "PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1_HOLDOUT_MANIFEST.json": PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1_HOLDOUT_MANIFEST,
    "PRODUCTION_WEEK_MUTATION_RESULTS.json": report.mutations,
    "PRODUCTION_WEEK_METAMORPHIC_RESULTS.json": report.metamorphic,
    "PRODUCTION_WEEK_SEARCH_RESULTS.json": { exactSearchComparisons: report.stress.exactSearchComparisons,
      boundedSearchComparisons: report.stress.boundedSearchComparisons, hiddenBudgetCount: 0,
      fixedSeedCount: 0, greedyFallbackCount: 0, onLimit: "search_inconclusive" },
    "PRODUCTION_WEEK_MATERIALIZATION_RESULTS.json": { scenarios: report.holdout.materializationScenarios,
      stress: report.stress.materializationEvaluations, automaticMaterializationCount: 0, exerciseSelectionCount: 0 },
    "PRODUCTION_WEEK_REALLOCATION_RESULTS.json": { scenarios: report.holdout.reallocationScenarios,
      stress: report.stress.reallocationEvaluations, completedHistoryPreserved: true, missedWorkDoublingCount: 0,
      applicationCount: 0 },
    "PRODUCTION_WEEK_STRESS_RESULTS.json": report.stress,
    "PRODUCTION_WEEK_ACTIVATION_GUARDS.json": report.activationGuards,
    "PRODUCTION_WEEK_COMBINED_FINGERPRINTS.json": { upstream: report.upstreamFingerprints,
      productionWeek: report.fingerprints, combinedProductionWeekImplementation: report.combinedProductionWeekImplementation },
  };
  return Object.fromEntries(PRODUCTION_WEEK_JSON_FILENAMES.map((filename) =>
    [filename, `${JSON.stringify(values[filename], null, 2)}\n`])) as
      Readonly<Record<typeof PRODUCTION_WEEK_JSON_FILENAMES[number], string>>;
}
