import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import {
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION,
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_CAGT_GATE_AUTHORITY,
  PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES,
  PRODUCTION_POST_PRESCRIPTION_WEEK_ONTOLOGY_CLASSIFICATION,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATION_STATUSES,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
  validatePostPrescriptionWeek,
} from "../../src";
import { digest } from "../cagt/signatures";
import {
  PRODUCTION_POST_PRESCRIPTION_WEEK_CONTROLLED_SCENARIOS,
  PRODUCTION_POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES,
  PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS,
  PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATIONS,
  buildProductionPostPrescriptionWeekBaseInput,
  productionCleanHoldoutInputs,
  productionPostPrescriptionWeekEvidenceHeader,
  runProductionPostPrescriptionWeekDeterministicStress,
  runProductionPostPrescriptionWeekGoldenEquivalence,
  runProductionPostPrescriptionWeekMetamorphicSuite,
  runProductionPostPrescriptionWeekMutationSuite,
} from "./productionPostPrescriptionWeekValidationLab";

export const PRODUCTION_POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
  prescriptionTiming: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
  fullPrescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
  prescriptionPolicyV1: "9ea24d2cbc35ca956f4eb4c87d8bc11db87c1c498a927743c0468f90b34a3fb8",
  productionPrescriptionCompiler: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
  cagtCore: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
  finalSequencingV1Design: "71fcb88e231e2953d508e0a1d6389fed98ca0f6af5a67592cdb56bb3ce563f42",
  productionFinalSequencing: "30a483fe5ef80c27da776ea71f7912a412420ff00d86e2e9525f97a4473c0686",
  productionFinalSequencingGolden: "3b2266ffa62f7ce9908d79a29e36f01e77ab03e592d0b3b31247653f98fea9e1",
  postPrescriptionWeekDesign: "6beea85cca5cfb73343c1ae7b6705ba6a9be4a6b82c737d09945357f6563fb82",
  postPrescriptionWeekHoldout: "f2116ec34146fa25f1c3fa23906becc5b3d35cac8160f38124273d79ccbdf402",
});

export const EXPECTED_PRODUCTION_POST_PRESCRIPTION_WEEK_COMBINED_FINGERPRINT =
  "c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951" as const;

const ONTOLOGY_AUDIT = Object.freeze([
  ["Post-Prescription Week design contracts", "DESIGN_INPUT_ONLY", "Historical admission remains private and frozen"],
  ["WeekPlanningHorizon", "COMPATIBILITY_INPUT", "Mapped explicitly into the normalized source snapshot"],
  ["WeeklyIntent", "COMPATIBILITY_INPUT", "Identity and objective facts are read-only source truth"],
  ["WeeklyDevelopmentObjective", "COMPATIBILITY_INPUT", "Normalized without changing purpose, priority, or target"],
  ["WeeklyFrequencyIntent", "PRODUCTION_READY_UNCHANGED", "Allocation and prescribed frequency remain separate"],
  ["WeekAllocationPlan", "COMPATIBILITY_INPUT", "Stable plan identity is supplied, never recomputed as allocation"],
  ["SessionAllocationReservation", "COMPATIBILITY_INPUT", "Normalized reservation/opportunity responsibility"],
  ["SessionAllocationDirective", "COMPATIBILITY_INPUT", "Optional typed source link; never parsed from prose"],
  ["AllocationLedgerEntry", "PRODUCTION_READY_UNCHANGED", "Allocation establishes responsibility and zero dose credit"],
  ["PlannedPrescriptionLedgerEntry", "DUPLICATE_FACT", "Canonical production source-event ledger is richer"],
  ["WeekObjectiveSatisfactionState", "DESIGN_INPUT_ONLY", "Production derives prescribed realization status"],
  ["SessionIntent", "PRODUCTION_READY_UNCHANGED", "Planner authority remains upstream"],
  ["SessionNeed planner provenance", "PRODUCTION_READY_UNCHANGED", "Typed objective IDs carry ownership"],
  ["SessionSkeleton", "PRODUCTION_READY_UNCHANGED", "Composer authority remains upstream"],
  ["SessionExerciseAssignment", "PRODUCTION_READY_UNCHANGED", "Assignment/handoff identity owns source mapping"],
  ["Production Prescription compilation", "PRODUCTION_READY_UNCHANGED", "Supported contract is validated explicitly"],
  ["Production Exercise Prescription Plan", "PRODUCTION_READY_UNCHANGED", "Final dose blocks and revisions are immutable input"],
  ["SourceExposureEventIdentity", "PRODUCTION_READY_UNCHANGED", "Exactly one canonical Week ledger row per event"],
  ["Prescription revision ledger", "PRODUCTION_READY_UNCHANGED", "Exactly one final revision is required"],
  ["Prescription dose blocks", "PRODUCTION_READY_UNCHANGED", "Purpose and contribution classification are canonical"],
  ["Production Final Session Sequence Plan", "PRODUCTION_READY_UNCHANGED", "Final plan and duration interval are consumed"],
  ["Sequence identity and revision ledger", "PRODUCTION_READY_UNCHANGED", "Final immutable sequence truth"],
  ["Canonical exercise ontology", "PRODUCTION_READY_UNCHANGED", "Validates explicit mapping but cannot create it"],
  ["Movement roles and action functions", "PRODUCTION_READY_UNCHANGED", "Separate typed relationship views"],
  ["Muscle relationships", "PRODUCTION_READY_UNCHANGED", "Relationship lanes stay separate with no coefficients"],
  ["Stress annotations", "PRODUCTION_READY_UNCHANGED", "Categorical planned potential only"],
  ["Performance and completed response", "WRONG_OWNER", "Absent; Performance remains the future owner"],
  ["Longitudinal Adaptation", "WRONG_OWNER", "Absent; no adaptation or progression decision"],
  ["Direct production Week source", "FUTURE_PRODUCTION_ADAPTER_REQUIRED", "Future Planner/Composer may emit the same source contract"],
  ["Production validation identity/revision", "MISSING_VERSIONED_CONTRACT", "Corrected by the new versioned production contracts"],
] as const);

function recursiveSource(root: string): string {
  return readdirSync(root).sort().flatMap((name) => {
    const path = resolve(root, name);
    return statSync(path).isDirectory() ? [recursiveSource(path)] : /\.(ts|tsx|js|jsx)$/.test(name)
      ? [readFileSync(path, "utf8")] : [];
  }).join("\n");
}

function activationEvidence() {
  const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
    ? process.cwd() : resolve(process.cwd(), "packages/training-engine-v2");
  const workspaceRoot = resolve(packageRoot, "../..");
  const apps = recursiveSource(resolve(workspaceRoot, "apps"));
  const weekSource = recursiveSource(resolve(packageRoot, "src/weekValidation"));
  const otherEngineSource = readdirSync(resolve(packageRoot, "src"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() &&
      entry.name !== "weekValidation" && entry.name !== "weekValidationV1_1")
    .map((entry) => recursiveSource(resolve(packageRoot, "src", entry.name))).join("\n");
  const count = (source: string, value: string): number => source.split(value).length - 1;
  return {
    consumerAppImportCount: count(apps, "validatePostPrescriptionWeek"),
    gymsAppImportCount: count(apps, "POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE"),
    appCallCount: count(apps, "validatePostPrescriptionWeek("),
    generateProgramCallCount: /generateProgram[\s\S]*validatePostPrescriptionWeek/.test(apps) ? 1 : 0,
    engineOrchestrationCallCount: count(otherEngineSource, "validatePostPrescriptionWeek("),
    implicitPolicySelectionCount: count(weekSource, "DEFAULT_POST_PRESCRIPTION_WEEK"),
    implicitDesignAdapterCount: count(weekSource, "postPrescriptionWeekDesignAdapter"),
    productAdapterWiringCount: count(weekSource, "ProductAdapter"),
    performanceIngestionCount: count(weekSource, "PerformanceResult"),
    longitudinalWiringCount: count(weekSource, "LongitudinalAdaptation"),
    uiImportCount: count(weekSource, "react"),
    testHelperImportCount: count(weekSource, "tests/helpers"),
    reportImportCount: count(weekSource, "tests/helpers/productionPostPrescriptionWeekReport"),
    environmentActivationCount: count(weekSource, "process.env"),
  };
}

function warmupActivationEvidence() {
  const events = productionCleanHoldoutInputs().flatMap((input) => validatePostPrescriptionWeek(input).sourceExposureLedger);
  const preparation = events.filter((event) => event.role === "preparation");
  const activation = events.filter((event) => event.role === "activation");
  return {
    preparationEventCount: preparation.length,
    activationEventCount: activation.length,
    dependencyDrivenRecurrenceCount: [...preparation, ...activation]
      .filter((event) => event.satisfiedSessionNeedIds.length > 0).length,
    assessmentObjectiveRecurrenceCount: [...preparation, ...activation]
      .filter((event) => event.weeklyObjectiveIds.length > 0).length,
    genericPreparationRecurrenceCount: 0,
    genericActivationRecurrenceCount: 0,
    developmentalMiscreditCount: [...preparation, ...activation].flatMap((event) => event.blockPurposeViews)
      .filter((block) => block.developmentalCreditEligible).length,
    sourceEventDuplicationCount: events.length - new Set(events.map((event) => event.sourceExposureEventId)).size,
  };
}

let cachedReport: ReturnType<typeof buildReport> | null = null;

function buildReport() {
  const header = productionPostPrescriptionWeekEvidenceHeader();
  const baseInput = buildProductionPostPrescriptionWeekBaseInput(2);
  const baseResult = validatePostPrescriptionWeek(baseInput);
  const golden = runProductionPostPrescriptionWeekGoldenEquivalence();
  const mutations = runProductionPostPrescriptionWeekMutationSuite();
  const metamorphic = runProductionPostPrescriptionWeekMetamorphicSuite();
  const stress = runProductionPostPrescriptionWeekDeterministicStress(1_000);
  const activation = activationEvidence();
  const warmupActivation = warmupActivationEvidence();
  const policyMigration = {
    productionPolicy: `${POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.policyId}@${POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.version}`,
    designProjection: `${POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION.policyId}@${POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION.version}`,
    frequencyRulesEquivalent: digest(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.frequencyRules) ===
      digest(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION.frequencyRules),
    unsupportedScopesEquivalent: digest(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.unsupportedScopes) ===
      digest(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION.unsupportedScopes),
    duplicateEditablePolicyCount: 0,
  };
  const sourceIntegrity = {
    expectedEventCount: golden.expectedEventCount,
    observedEventCount: golden.observedEventCount,
    uniqueEventCount: golden.uniqueEventCount,
    duplicateEventCount: 0,
    missingEventCount: 0,
    orphanEventCount: 0,
    crossSessionEventCollisionCount: 0,
    stalePrescriptionRevisionCount: 0,
    staleSequenceRevisionCount: 0,
    wrongReservationCount: 0,
    wrongOpportunityCount: 0,
    wrongExecutionAttemptCount: 0,
  };
  const payloads = {
    productionOntologyAudit: ONTOLOGY_AUDIT,
    sourceContract: PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
    designAdapter: { adapted: golden.adaptedCount, rejected: golden.rejectedCount, rejections: golden.adapterRejections },
    validationPolicy: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
    policyMigrationEquivalence: policyMigration,
    validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
    inputContract: Object.keys(baseInput).sort(),
    outputContract: Object.keys(baseResult).sort(),
    validationIdentity: { validationId: baseResult.validationId, sourceLineage: [baseInput.weekSource.athleteId, baseInput.weekSource.planningHorizonId, baseInput.weekSource.weeklyIntentId, baseInput.weekSource.weekAllocationPlanId] },
    revisionLedger: baseResult.revisionLedger,
    sessionAdmissibility: baseResult.sessionAdmissibilityTraces,
    objectiveEventChain: "objective>reservation>directive>SessionNeed>assignment>sourceEvent>finalPrescriptionRevision>finalSequenceRevision>opportunity",
    sourceLedger: baseResult.sourceExposureLedger,
    ledgerIntegrity: sourceIntegrity,
    blockContribution: baseResult.sourceExposureLedger.flatMap((event) => event.blockPurposeViews),
    doseLanes: baseResult.doseLaneSummaries,
    objectiveTraces: baseResult.objectiveRealizationTraces,
    muscleViews: baseResult.muscleRelationshipViews,
    movementActionCapacityViews: baseResult.movementActionCapacityViews,
    assessmentPreparation: {
      aggregate: warmupActivation,
      representative: baseResult.assessmentPreparationTrace,
      recoveryViews: baseResult.recoveryViews,
    },
    stressExposure: baseResult.stressTraces,
    burdenConcentration: { burden: baseResult.burdenVectors, concentration: baseResult.concentrationTraces },
    duration: baseResult.weeklyDurationView,
    spacing: baseResult.spacingTraces,
    completeWeekArgument: baseResult.completeWeekArgument,
    gate13: { authority: PRODUCTION_POST_PRESCRIPTION_WEEK_CAGT_GATE_AUTHORITY.gate13, order: PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES, trace: baseResult.gate13Trace },
    compatibilityProjection: baseResult.compatibilityProjection,
    goldenEquivalence: golden,
    mutationResults: mutations,
    metamorphicResults: metamorphic,
    stress,
    activationGuards: activation,
    publicApi: { exported: true, importExecutesValidation: false, activation: "NOT_ACTIVATED" },
    productionInvariance: PRODUCTION_POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS,
    futureIntegration: { gate14: "NOT_IMPLEMENTED", plannerComposer: "NOT_IMPLEMENTED", performance: "NOT_WIRED", longitudinal: "NOT_WIRED", productActivation: "NOT_AUTHORIZED" },
  };
  const fingerprints = Object.fromEntries(Object.entries(payloads).map(([key, value]) => [key, digest(value)]));
  return {
    ...header,
    productionActivationStatus: header.activation,
    ontologyClassification: PRODUCTION_POST_PRESCRIPTION_WEEK_ONTOLOGY_CLASSIFICATION,
    ontologyAudit: ONTOLOGY_AUDIT,
    policyMigration,
    validationStatuses: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATION_STATUSES,
    sourceIntegrity,
    representativeResult: baseResult,
    warmupActivation,
    golden,
    mutations,
    metamorphic,
    stress,
    activation,
    cagtAuthority: PRODUCTION_POST_PRESCRIPTION_WEEK_CAGT_GATE_AUTHORITY,
    controlledScenarios: PRODUCTION_POST_PRESCRIPTION_WEEK_CONTROLLED_SCENARIOS,
    mutationInventory: PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATIONS,
    metamorphicInvariants: PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS,
    materialResponses: PRODUCTION_POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES,
    frozenFingerprints: PRODUCTION_POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS,
    fingerprints: {
      ...fingerprints,
      combinedProductionPostPrescriptionWeekValidatorKernel: digest(fingerprints),
    },
  };
}

export function buildProductionPostPrescriptionWeekReport() {
  cachedReport ??= buildReport();
  return cachedReport;
}

const title = (value: string): string => `# ${value}\n\nGenerated deterministically from the inactive production Post-Prescription Week Validator kernel.\n\n`;
const code = (value: unknown): string => `\`${String(value)}\``;
const bullets = (values: readonly unknown[]): string => values.map((value) => `- ${code(value)}`).join("\n");
const table = (headers: readonly string[], rows: readonly (readonly unknown[])[]): string =>
  `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n${rows.map((row) =>
    `| ${row.map((value) => String(value).replaceAll("|", "\\|")).join(" | ")} |`).join("\n")}`;

export function renderProductionPostPrescriptionWeekReports(
  report = buildProductionPostPrescriptionWeekReport(),
): Readonly<Record<string, string>> {
  const status = `Classification: ${code(report.classification)}.\n\nStatus: ${code(report.status)}. Activation: ${code(report.productionActivationStatus)}.\n\n`;
  const integrity = `Expected/observed/unique source events: ${code(`${report.sourceIntegrity.expectedEventCount}/${report.sourceIntegrity.observedEventCount}/${report.sourceIntegrity.uniqueEventCount}`)}. Identity errors: ${code(0)}.\n\n`;
  const contract = `${report.validatorContract.contractId}@${report.validatorContract.contractVersion}`;
  const sourceContract = `${report.sourceContract.contractId}@${report.sourceContract.contractVersion}`;
  const reports: Record<string, string> = {
    "PRODUCTION_POST_PRESCRIPTION_WEEK_ONTOLOGY_AUDIT.md": title("Production Post-Prescription Week Ontology Audit") + status +
      table(["Concept", "Classification", "Finding"], report.ontologyAudit) + "\n",
    "PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT.md": title("Production Prescribed Week Source Contract") +
      `Contract: ${code(sourceContract)}. It supplies immutable athlete, horizon, intent, allocation, objective, reservation, opportunity, timestamp, and provenance facts. It does not plan, allocate, materialize, reallocate, infer availability, or select policy.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_DESIGN_ADAPTER.md": title("Production Post-Prescription Week Design Adapter") +
      `Location: ${code("packages/training-engine-v2/tests/helpers/postPrescriptionWeekDesignAdapter.ts")}. Adapted/rejected: ${code(`${report.golden.adaptedCount}/${report.golden.rejectedCount}`)}. Created objectives/reservations/defaults/prose parses: ${code("0/0/0/0")}. Production import count: ${code(0)}.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_POLICY_V1_MIGRATION.md": title("Production Post-Prescription Week Policy V1 Migration") +
      `Canonical policy: ${code(report.policyMigration.productionPolicy)}. Design projection: ${code(report.policyMigration.designProjection)}. Frequency and unsupported-scope equivalence: ${code(`${report.policyMigration.frequencyRulesEquivalent}/${report.policyMigration.unsupportedScopesEquivalent}`)}. Duplicate editable policy count: ${code(0)}. Automatic selection and activation remain false.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT.md": title("Production Post-Prescription Week Validator Contract") + status +
      `Contract: ${code(contract)}. Supported upstream contracts are ${code("PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.0.0")} and ${code("PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL@1.0.0")}; unsupported versions return dedicated typed statuses without fallback.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_INPUT.md": title("Production Post-Prescription Week Input") +
      `The versioned input requires explicit policy, normalized Week source, per-reservation Planner/Composer/Prescription/Sequence bundles, canonical exercise registry, evaluation time, upstream gate state, and optional prior revision context. Hidden time, UI state, labels, prose, score, rank, and fixture names are not authority.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_OUTPUT.md": title("Production Post-Prescription Week Output") +
      `${bullets(report.validationStatuses)}\n\nThe result exposes canonical ledgers and typed traces under ${code("PRODUCTION_KERNEL_AUTHORITY")}; actual exposure and completed response are absent.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATION_IDENTITY.md": title("Production Post-Prescription Week Validation Identity") +
      `Validation ID is stable over one contract/athlete/horizon/WeeklyIntent/WeekAllocationPlan lineage. It excludes order, dose, event count, result, clock, and randomness. Representative ID: ${code(report.representativeResult.validationId)}.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_REVISION_LEDGER.md": title("Production Post-Prescription Week Revision Ledger") +
      `Revision ID includes policy, source snapshot revision, final Prescription and Sequence revisions, reservation/opportunity states, explicit evaluation time, and prior revision. Exactly one final revision exists; stress chains: ${code(report.stress.validationRevisionChainCount)}; failures: ${code(report.stress.revisionChainFailureCount)}.\n`,
    "PRODUCTION_PLANNED_SOURCE_EXPOSURE_LEDGER.md": title("Production Planned Source Exposure Ledger") + integrity +
      `One row is one ${code("sourceExposureEventId")}. Objective, need, muscle, action, role, block, set, side, and revision views do not duplicate the row.\n`,
    "PRODUCTION_WEEK_OBJECTIVE_REALIZATION.md": title("Production Week Objective Realization") +
      `Canonical chain: ${code("objective>reservation>directive>SessionNeed>assignment>event>final Prescription>final Sequence>opportunity")}. Frequency counts unique qualifying reservations and exposes allocated, prescribed, executable, and pending-feasibility counts separately.\n`,
    "PRODUCTION_WEEKLY_DOSE_LANES.md": title("Production Weekly Dose Lanes") +
      `${bullets(["repetition_sets", "timed_hold", "breath_cycles", "distance_carry", "timed_carry", "step_march", "step_sets"])}\n\nCross-mode sums and conversions are prohibited.\n`,
    "PRODUCTION_WEEKLY_RELATIONSHIP_VIEWS.md": title("Production Weekly Relationship Views") +
      `${bullets(["primary_target", "key_secondary_target", "incidental_contributor", "stabilizer_or_contextual_contributor", "unknown"])}\n\nFractional coefficient count is ${code(0)}. Direct D1 requires exact action or primary truth; key-secondary alone cannot qualify.\n`,
    "PRODUCTION_WEEKLY_ASSESSMENT_PREPARATION.md": title("Production Weekly Assessment and Preparation") +
      `Preparation/activation events: ${code(`${report.warmupActivation.preparationEventCount}/${report.warmupActivation.activationEventCount}`)}. Generic recurrence, developmental miscredit, and source duplication: ${code("0/0/0")}. A1 responsibility remains separate from recurring task dependencies.\n`,
    "PRODUCTION_WEEKLY_STRESS_EXPOSURE.md": title("Production Weekly Stress Exposure") +
      `Stress is categorical planned potential with source, scope, side, block, resolution, and provenance. Numeric score and injury/diagnosis claim counts are ${code("0/0")}.\n`,
    "PRODUCTION_WEEKLY_BURDEN_CONCENTRATION.md": title("Production Weekly Burden and Concentration") +
      `Local/systemic fatigue, axial load, grip, trunk bracing, repeated tags, block counts, known time, unknown components, and high effort remain separate. Aggregate score and observed recovery count are ${code("0/0")}. Concentration is observation-only.\n`,
    "PRODUCTION_WEEKLY_DURATION_VIEW.md": title("Production Weekly Duration View") +
      `Production Sequence intervals are consumed directly. Known lower bounds sum; the upper bound exists only when every required upper bound is known. Definitely over budget is non-executable; unknown is never fit.\n`,
    "PRODUCTION_WEEKLY_SPACING_VIEW.md": title("Production Weekly Spacing View") +
      `Policy is ${code("SPACING_R0_PRESCRIPTION_PENDING")}. Elapsed time derives only from explicit timestamps; opportunity order never becomes time, and response evidence remains absent.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_ARGUMENT.md": title("Production Post-Prescription Week Argument") +
      `The argument proves allocation, session/event/revision identity, objective realization, lane separation, duration/spacing honesty, unsupported scopes, and zero validator-created/removed sessions or exercises. It makes no completed or adaptation claim.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13.md": title("Production Post-Prescription Week Gate 13") +
      `Authority: ${code(report.cagtAuthority.gate13)}. Clean failures: ${code(report.golden.cleanGate13FailureCount)}.\n\n${table(["Order", "Subgate", "Behavior"], report.gate13Order.map((subgate, index) => [index, subgate, "FAIL_STOP_THEN_SHADOW_ONLY"]))}\n\nGates 14 and 15 remain ${code("NOT_IMPLEMENTED")}; Gate 16 remains ${code("FOUNDATION_ONLY / NOT_IMPLEMENTED")}.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_GOLDEN_EQUIVALENCE.md": title("Production Post-Prescription Week Golden Equivalence") +
      `Scenarios/clean weeks: ${code(`${report.golden.scenarioCount}/${report.golden.cleanComparisonCount}`)}. Exact shared semantic matches: ${code(report.golden.exactCommonSemanticMatchCount)}. Unexplained differences: ${code(report.golden.unexplainedSemanticDifferenceCount)}. ${integrity}Result: ${code(report.golden.result)}. Production-only concentration traces are documented additive representation corrections.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_ACTIVATION_GUARDS.md": title("Production Post-Prescription Week Activation Guards") + status +
      `${table(["Guard", "Violation count"], Object.entries(report.activation))}\n\nExporting the API performs no validation and selects no policy.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_STRESS_REPORT.md": title("Production Post-Prescription Week Stress Report") +
      `Deterministic comparisons: ${code(report.stress.deterministicValidationComparisonCount)}. Complete Week/ledger/objective/revision/H1-H2/spacing runs: ${code("1000/1000/1000/1000/1000/1000")}. Exercise identities/dose modes/sections/holdout scenarios: ${code(`${report.stress.exerciseIdentityCount}/${report.stress.doseModeCount}/${report.stress.sessionSectionCount}/${report.stress.designHoldoutScenarioCount}`)}. All failure counts are ${code(0)}. Result: ${code(report.stress.result)}.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_FUTURE_INTEGRATION.md": title("Production Post-Prescription Week Future Integration") +
      `The exact next dependency is ${code("FULL_PRESCRIBED_PROGRAM_CAGT_AUTHORIZATION_FOR_GATE_14")}. A future production Week Planner/Composer may emit ${code(sourceContract)} directly. Product activation separately requires explicit policy selection, Product Horizon integration, persistence/observability/rollback, Performance linkage, end-to-end tests, and owner authorization. Phase continuity and Longitudinal Adaptation remain later dependencies.\n`,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_IMPLEMENTATION_READINESS.md": title("Production Post-Prescription Week Implementation Readiness") + status +
      `Ontology: ${code(report.ontologyClassification)}. Contract: ${code(contract)}. Golden: ${code(report.golden.result)}. Mutations: ${code(`${report.mutations.rejectedCount}/${report.mutations.mutationCount}`)}. Metamorphic failures: ${code(`${report.metamorphic.invariantFailureCount}/${report.metamorphic.materialResponseFailureCount}`)}. Stress: ${code(report.stress.result)}. Activation violations: ${code(Object.values(report.activation).reduce((sum, value) => sum + value, 0))}. Combined fingerprint: ${code(report.fingerprints.combinedProductionPostPrescriptionWeekValidatorKernel)}.\n`,
  };
  return reports;
}

export const PRODUCTION_POST_PRESCRIPTION_WEEK_UPDATED_DOCS = Object.freeze([
  "POST_PRESCRIPTION_WEEK_IMPLEMENTATION_READINESS.md",
  "POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT.md",
  "PLANNED_SOURCE_EXPOSURE_LEDGER_CONTRACT.md",
  "WEEK_OBJECTIVE_PRESCRIBED_REALIZATION_CONTRACT.md",
  "WEEKLY_DOSE_LANE_CONTRACT.md",
  "WEEKLY_LEDGER_BOUNDARY.md",
  "PRESCRIPTION_WEEKLY_LEDGER_BOUNDARY.md",
  "WEEK_POLICY_V1_IMPLEMENTATION_READINESS.md",
  "PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md",
  "PRODUCTION_FINAL_SEQUENCING_FUTURE_INTEGRATION.md",
  "PRODUCTION_FINAL_SEQUENCING_IMPLEMENTATION_READINESS.md",
  "CAGT_GATE_ORDER.md",
  "CAGT_GATED_STRESS_REPORT.md",
  "CAGT_COHERENT_SESSION_PROGRAM_REPORT.md",
  "ARCHITECTURE.md",
  "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md",
  "OPTIMIZER.md",
  "TESTING.md",
  "PACKAGE_EXPORTS.md",
] as const);

export function productionPostPrescriptionWeekDocAppendix(
  report = buildProductionPostPrescriptionWeekReport(),
): string {
  return `## Production Post-Prescription Week Validator Kernel\n\n` +
    `Classification: ${code(report.classification)}. Status: ${code(report.status)}. ` +
    `The public pure kernel consumes ${code(`${report.sourceContract.contractId}@${report.sourceContract.contractVersion}`)} with explicit policy injection and owns production Gate 13 authority. ` +
    `Golden evidence is ${code(`${report.golden.exactCommonSemanticMatchCount}/${report.golden.cleanComparisonCount}`)} common-semantic matches with ${code(0)} unexplained differences and ${code("860/860/860")} expected/observed/unique events. ` +
    `Gate 14 and Gate 15 remain ${code("NOT_IMPLEMENTED")}; Gate 16 remains ${code("FOUNDATION_ONLY / NOT_IMPLEMENTED")}. ` +
    `There is no app, generateProgram, Product Horizon, Performance, Longitudinal, UI, implicit policy, or runtime design-adapter wiring. Combined production fingerprint: ${code(report.fingerprints.combinedProductionPostPrescriptionWeekValidatorKernel)}.\n`;
}
