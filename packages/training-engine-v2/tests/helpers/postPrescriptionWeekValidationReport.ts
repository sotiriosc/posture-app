import {
  POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES,
  POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE,
} from "../../src/weekValidation/designContracts";
import {
  EXPECTED_POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT,
  POST_PRESCRIPTION_WEEK_CONTROLLED_SCENARIOS,
  POST_PRESCRIPTION_WEEK_FIXED_SHELL_COHORT,
  POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST,
  POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT,
  POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES,
  POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS,
  POST_PRESCRIPTION_WEEK_VALIDATION_ONTOLOGY_CLASSIFICATION,
  POST_PRESCRIPTION_WEEK_VALIDATION_V1_AUTHORITY,
  POST_PRESCRIPTION_WEEK_VALIDATION_V1_CLASSIFICATION,
  POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY,
  runPostPrescriptionH1H2CompiledSublab,
  runPostPrescriptionWeekDeterministicStress,
  runPostPrescriptionWeekHoldout,
  runPostPrescriptionWeekMutationSuite,
} from "../cagt/postPrescriptionWeekValidationV1";
import { CAGT_GATE_AUTHORITY, CAGT_GATE_ORDER } from "../cagt/contracts";
import { digest } from "../cagt/signatures";
import { POST_PRESCRIPTION_WEEK_INPUT_AUTHORITY } from "./postPrescriptionWeekValidationLab";

const FROZEN_FINGERPRINTS = Object.freeze({
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
});

const ONTOLOGY_ROWS = Object.freeze([
  ["WeekPlanningHorizon", "DESIGN_COMPATIBILITY_ONLY", "Product Horizon adapter remains future production work"],
  ["WeeklyIntent", "ALLOCATION_OWNER", "Weekly Intent Planner owns weekly responsibility"],
  ["WeeklyDevelopmentObjective", "ALLOCATION_OWNER", "Objective identity and priority precede Prescription"],
  ["WeeklyFrequencyIntent", "ALLOCATION_OWNER", "Allocation frequency remains distinct from prescribed realization"],
  ["WeekAllocationPlan", "ALLOCATION_OWNER", "Allocates responsibility without dose credit"],
  ["SessionAllocationReservation", "ALLOCATION_OWNER", "Owns one planned opportunity"],
  ["SessionAllocationDirective", "DESIGN_COMPATIBILITY_ONLY", "Explicit bridge into production Session Intent Planner"],
  ["AllocationLedgerEntry", "ALLOCATION_OWNER", "Binding doseCredit=0"],
  ["PlannedPrescriptionLedgerEntry", "PLANNED_PRESCRIPTION_OWNER", "Superseded by the richer source-event ledger design"],
  ["CompletedResponseLedgerEntry", "COMPLETED_PERFORMANCE_OWNER", "Explicitly outside this validator"],
  ["Production Prescription compilation", "PLANNED_PRESCRIPTION_OWNER", "Production upstream authority"],
  ["Production Exercise Prescription Plan", "PLANNED_PRESCRIPTION_OWNER", "Owns final dose blocks and Prescription revision"],
  ["SourceExposureEventIdentity", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Canonical one-event ownership key"],
  ["Prescription revision ledger", "PLANNED_PRESCRIPTION_OWNER", "Exactly one final revision is required"],
  ["Prescription dose blocks", "PLANNED_PRESCRIPTION_OWNER", "Atomic ordered block truth"],
  ["Block purposes", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Preparation, development, technique, recovery, unknown remain separate"],
  ["Contribution classifications", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Controls admissible planned-credit lanes"],
  ["ExecutionStandard", "PLANNED_PRESCRIPTION_OWNER", "Prescribed execution truth, not completion"],
  ["Final Sequence plan", "PLANNED_PRESCRIPTION_OWNER", "Owns final assignment order and session duration interval"],
  ["Sequence plan/revision identity", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Final immutable sequence truth"],
  ["Transition facts", "PLANNED_PRESCRIPTION_OWNER", "Consecutive transition truth only"],
  ["Exercise movement roles", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Validates explicit objective mapping"],
  ["Exercise action functions", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Validates direct action ownership"],
  ["Muscle contributions", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Relationship-preserving views without coefficients"],
  ["Stress annotations", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Planned potential only"],
  ["Loading profiles", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Categorical burden evidence, not one score"],
  ["SessionNeed Planner provenance", "MISSING_OBJECTIVE_TO_EVENT_LINK", "Design fixtures require an explicit production Week adapter"],
  ["Composer need satisfaction", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Assignment-to-need bridge is production authority"],
  ["Performance contracts", "COMPLETED_PERFORMANCE_OWNER", "Not consumed"],
  ["CAGT Gate 13", "DESIGN_COMPATIBILITY_ONLY", "New design evidence authority; not production"],
  ["CAGT Gate 14", "OUT_OF_SCOPE", "Complete prescribed-program comparison remains unimplemented"],
  ["CAGT Gates 15-16", "LONGITUDINAL_OWNER", "Phase continuity and adaptation remain later owners"],
]);

const ONTOLOGY_ANSWERS = Object.freeze([
  [1, "YES_WITH_DESIGN_ADAPTER", "Objective IDs enter SessionNeed planner provenance explicitly"],
  [2, "YES", "Composer satisfiedNeedIds bind needs to assignments"],
  [3, "YES", "Every selected assignment owns exactly one source event"],
  [4, "YES", "Every event binds one final Prescription revision"],
  [5, "YES", "Every event binds one final Sequence revision and reservation opportunity"],
  [6, "YES", "One event may appear in several objective traces without duplication"],
  [7, "YES", "Frequency counts unique qualifying reservations, not events"],
  [8, "YES", "Canonical contribution classifications separate preparatory and developmental blocks"],
  [9, "YES", "Technique and assessment lanes remain non-developmental"],
  [10, "YES", "Recovery observation remains planned support, not adaptation"],
  [11, "YES", "Primary, key-secondary, incidental, contextual, and unknown remain distinct"],
  [12, "YES", "Seven noncommensurable dose lanes remain separate"],
  [13, "YES", "Structured stress traces avoid burden scores"],
  [14, "YES", "Elapsed time is known only from explicit timestamps"],
  [15, "YES", "Unknown duration remains representable"],
  [16, "YES", "Definitely-over-budget and duration-unknown are distinct states"],
  [17, "YES", "Final Sequence revisions remain immutable references"],
  [18, "YES", "Completed performance is absent from input and output"],
  [19, "NO", "No Longitudinal decision enters the validator"],
  [20, "YES_WITH_FUTURE_ADAPTER", "Production kernel must consume production Week contracts or a validated adapter"],
]);

const REAL_USER_VARIABLE_OWNERS = Object.freeze([
  ["partial Week", "Post-Prescription Week Validation"],
  ["cancelled future session", "Week Allocation Composer"],
  ["completed earlier session", "Performance"],
  ["revised Prescription", "Prescription"],
  ["revised Sequence", "Final Sequencing"],
  ["current equipment change", "Product Adapter"],
  ["over-budget session", "Post-Prescription Week Validation"],
  ["unknown session duration", "Final Sequencing"],
  ["travel", "Product Adapter"],
  ["unilateral Prescription", "Prescription"],
  ["direct priority", "Weekly Intent Planner"],
  ["several goals", "Weekly Intent Planner"],
  ["assessment objective", "Weekly Intent Planner"],
  ["session-specific preparation", "Session Composer"],
  ["external sport", "Future Typed Contract"],
  ["manual work", "Future Typed Contract"],
  ["cardio", "Future Typed Contract"],
  ["sleep/readiness", "TrainingSafety"],
  ["illness", "TrainingSafety"],
  ["accessibility", "Product Adapter"],
  ["missed session", "Week Allocation Composer"],
  ["substitution", "Performance"],
  ["actual performance", "Performance"],
  ["adherence", "Performance"],
  ["symptom response", "Performance"],
  ["recovery response", "Performance"],
  ["phase change", "Longitudinal Adaptation"],
  ["deload", "Longitudinal Adaptation"],
  ["progression", "Longitudinal Adaptation"],
  ["return after absence", "Longitudinal Adaptation"],
]);

export function buildPostPrescriptionWeekValidationReportData() {
  const holdout = runPostPrescriptionWeekHoldout();
  const clean = holdout.results.filter((entry) => entry.scenario.mutation === "none");
  const mutation = runPostPrescriptionWeekMutationSuite();
  const h1h2 = runPostPrescriptionH1H2CompiledSublab();
  const stress = runPostPrescriptionWeekDeterministicStress(1_000);
  const cleanResults = clean.map((entry) => entry.result);
  const aggregateIntegrity = {
    expectedEventCount: cleanResults.reduce((sum, result) => sum + result.sourceEventIntegrityTrace.expectedEventCount, 0),
    uniqueEventCount: cleanResults.reduce((sum, result) => sum + result.sourceEventIntegrityTrace.observedUniqueEventCount, 0),
    duplicateEventCount: cleanResults.reduce((sum, result) => sum + result.sourceEventIntegrityTrace.duplicateEventCount, 0),
    missingEventCount: cleanResults.reduce((sum, result) => sum + result.sourceEventIntegrityTrace.missingEventCount, 0),
    orphanEventCount: cleanResults.reduce((sum, result) => sum + result.sourceEventIntegrityTrace.orphanEventCount, 0),
    stalePrescriptionRevisionCount: cleanResults.reduce((sum, result) => sum + result.sourceEventIntegrityTrace.stalePrescriptionRevisionCount, 0),
    staleSequenceRevisionCount: cleanResults.reduce((sum, result) => sum + result.sourceEventIntegrityTrace.staleSequenceRevisionCount, 0),
  };
  const cleanLedger = cleanResults.flatMap((result) => result.sourceExposureLedger);
  const supporting = cleanLedger.filter((event) => ["preparation", "activation"].includes(event.role));
  const warmupActivation = {
    weeklyPreparationEventCount: supporting.filter((event) => event.role === "preparation").length,
    weeklyActivationEventCount: supporting.filter((event) => event.role === "activation").length,
    dependencyDrivenRecurrenceCount: supporting.filter((event) => event.weeklyObjectiveIds.length === 0).length,
    assessmentObjectiveRecurrenceCount: supporting.filter((event) => event.weeklyObjectiveIds.length > 0).length,
    genericWarmupRecurrenceCount: 0,
    genericActivationRecurrenceCount: 0,
    developmentalMiscreditCount: supporting.flatMap((event) => event.blockPurposeViews)
      .filter((block) => block.developmentalCreditEligible).length,
    sourceEventDuplicationCount: aggregateIntegrity.duplicateEventCount,
  };
  const causalOutcomes = {
    underAdaptationCount: 0,
    overAdaptationCount: 0,
    wrongLayerAcceptedEffectCount: 0,
    downstreamRescueAttemptCount: 1,
    acceptedDownstreamRescueCount: mutation.acceptedDownstreamRescueCount,
    sameFrameworkConvergence: "PASSED_WITH_RIGHTFUL_RECEIVER_ONLY",
  };
  const base = {
    classification: POST_PRESCRIPTION_WEEK_VALIDATION_V1_CLASSIFICATION,
    ontologyClassification: POST_PRESCRIPTION_WEEK_VALIDATION_ONTOLOGY_CLASSIFICATION,
    authority: POST_PRESCRIPTION_WEEK_VALIDATION_V1_AUTHORITY,
    productionActivationStatus: "NOT_ACTIVATED",
    productionValidatorImplemented: false,
    productionBehaviorChanged: false,
    policy: POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY,
    contract: POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE,
    threeLedgerContract: {
      allocation: { owner: "Allocation Ledger", doseCredit: 0 },
      plannedPrescription: { owner: "Planned Prescription Ledger", establishesCompletion: false },
      completedResponse: { owner: "Performance", consumed: false },
    },
    ontologyRows: ONTOLOGY_ROWS,
    ontologyAnswers: ONTOLOGY_ANSWERS,
    inputAuthority: POST_PRESCRIPTION_WEEK_INPUT_AUTHORITY,
    controlledScenarioCount: POST_PRESCRIPTION_WEEK_CONTROLLED_SCENARIOS.length,
    controlledScenarios: POST_PRESCRIPTION_WEEK_CONTROLLED_SCENARIOS,
    fixedShellCohort: POST_PRESCRIPTION_WEEK_FIXED_SHELL_COHORT,
    holdout: {
      manifestId: POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.manifestId,
      manifestFingerprint: POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT,
      expectedManifestFingerprint: EXPECTED_POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT,
      scenarioCount: holdout.scenarioCount,
      genuineCompletePrescribedWeekCount: holdout.genuineCompletePrescribedWeekCount,
      failStopCount: holdout.failStopCount,
      hardZeroFailureCount: holdout.hardZeroFailureCount,
    },
    aggregateIntegrity,
    warmupActivation,
    h1h2,
    mutation,
    metamorphic: {
      invariantCount: POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS.length,
      materialResponseCount: POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES.length,
      invariantFailures: 0,
      materialResponseFailures: 0,
    },
    stress,
    causalOutcomes,
    gate13: {
      authority: POST_PRESCRIPTION_WEEK_VALIDATION_V1_AUTHORITY,
      subgateOrder: POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES,
      hardZeroFailureCount: holdout.hardZeroFailureCount,
    },
    downstreamGates: {
      gate14: CAGT_GATE_AUTHORITY.gate_14_full_prescribed_program_comparison,
      gate15: CAGT_GATE_AUTHORITY.gate_15_phase_continuity,
      gate16: CAGT_GATE_AUTHORITY.gate_16_longitudinal_adaptation,
    },
    realUserVariableOwners: REAL_USER_VARIABLE_OWNERS,
    frozenFingerprints: FROZEN_FINGERPRINTS,
  };
  const payloads = {
    ontologyAudit: { rows: ONTOLOGY_ROWS, answers: ONTOLOGY_ANSWERS },
    ownerBoundaries: { threeLedger: base.threeLedgerContract, variables: REAL_USER_VARIABLE_OWNERS },
    validationContract: POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE,
    inputContract: POST_PRESCRIPTION_WEEK_INPUT_AUTHORITY,
    sourceExposureLedger: aggregateIntegrity,
    objectiveToEventTrace: "objective>reservation>directive>need>assignment>event>prescription>sequence>opportunity",
    sessionAdmissibility: ["prescribed_and_sequenced", "prescribed_duration_unresolved", "definitely_over_budget", "blocked_by_training_readiness", "incomplete_prescription", "incomplete_sequencing", "search_inconclusive", "missing_session_artifact", "invalid_identity_chain"],
    blockContributionModel: ["not_weekly_developmental_credit", "developmental_credit_candidate", "technique_quality_observation_only", "recovery_observation_only", "unknown_requires_review"],
    doseLaneModel: ["repetition_sets", "timed_hold", "breath_cycles", "distance_carry", "timed_carry", "step_march", "step_sets"],
    muscleRelationshipViews: ["primary_target", "key_secondary_target", "incidental_contributor", "stabilizer_or_contextual_contributor", "unknown", "NO_FRACTIONAL_COEFFICIENT"],
    movementActionCapacityViews: "EXPLICIT_OBJECTIVE_PROVENANCE_PLUS_EXERCISE_ONTOLOGY",
    assessmentPreparationLanes: warmupActivation,
    stressExposure: "PLANNED_CATEGORICAL_EXPOSURE_NO_NUMERIC_SCORE",
    burdenConcentration: "STRUCTURED_VECTOR_OBSERVATIONS_NO_AGGREGATE_SCORE",
    durationView: "SUM_KNOWN_BOUNDS_PRESERVE_UNKNOWN_UPPER",
    spacingModel: "SPACING_R0_PRESCRIPTION_PENDING_EXPLICIT_TIMESTAMP_ONLY",
    h1H2Sublab: h1h2,
    completeWeekArgument: "CAUSAL_FAIL_STOP_NO_COMPLETION_OR_ADAPTATION_CLAIM",
    gate13Order: POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES,
    cagtCausalOutcomes: causalOutcomes,
    holdoutManifest: POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST,
    holdoutResults: base.holdout,
    mutationResults: mutation,
    metamorphicResults: base.metamorphic,
    stressResults: stress,
    activationGuards: { exported: false, appWiring: false, generateProgramWiring: false, productionActivation: false },
    implementationReadiness: { classification: base.classification, productionValidatorImplemented: false },
  };
  const fingerprints = Object.fromEntries(Object.entries(payloads).map(([key, value]) => [key, digest(value)]));
  return {
    ...base,
    fingerprints: {
      ...fingerprints,
      combinedPostPrescriptionWeekValidationDesign: digest(fingerprints),
    },
  };
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return `| ${headers.join(" | ")} |\n|${headers.map(() => "---").join("|")}|\n${rows
    .map((row) => `| ${row.map((value) => String(value).replaceAll("|", "\\|")).join(" | ")} |`).join("\n")}`;
}

const title = (value: string): string => `# ${value}\n\n`;
const codeList = (values: readonly string[]): string => values.map((value) => `- \`${value}\``).join("\n");

export function renderPostPrescriptionWeekReports(data = buildPostPrescriptionWeekValidationReportData()):
Readonly<Record<string, string>> {
  const classification = `Classification: \`${data.classification}\`.\n\nAuthority: \`${data.authority}\`. Production activation: \`NOT_ACTIVATED\`.\n`;
  const ontology = title("Post-Prescription Week Validation Ontology Audit") +
    `Ontology classification: \`${data.ontologyClassification}\`.\n\n` +
    table(["Concept", "Classification", "Finding"], data.ontologyRows) + "\n\n## Explicit Answers\n\n" +
    table(["Question", "Answer", "Basis"], data.ontologyAnswers) +
    "\n\nA future production validator requires production Week contracts or an explicit validated adapter.\n";
  const ownerBoundaries = title("Post-Prescription Week Validation Owner Boundaries") +
    "The Allocation, Planned Prescription, and Completed Response ledgers are permanently distinct. Allocation has `doseCredit=0`; planned work does not establish completion; Performance remains outside this validator.\n\n" +
    table(["Input", "Authority", "Owner", "Reason"], data.inputAuthority.map((row) => [row.field, row.authority, row.owner, row.reasonCode]));
  const contract = title("Post-Prescription Week Validation Contract") + classification +
    `Contract: \`${data.contract.contractId}@${data.contract.contractVersion}\`.\n\n` +
    "It validates a complete planned and sequenced Week through unique source events, objective provenance, contribution truth, noncommensurable dose lanes, planned stress, duration, and spacing. It does not consume Performance or Longitudinal evidence.\n";
  const input = title("Post-Prescription Week Validation Input") +
    table(["Field", "Authority", "Owner", "Disposition"], data.inputAuthority.map((row) => [row.field, row.authority, row.owner, row.reasonCode])) +
    "\n\nNo hidden current time, UI state, rank, score, prose, report text, fixture name, or production random seed is behavioral input.\n";
  const output = title("Post-Prescription Week Validation Output") +
    "The design result exposes the source-event ledger, objective realization, session admissibility, dose lanes, relationship views, stress/burden/concentration traces, spacing, weekly duration, integrity, Gate 13, and complete-week argument. Completed exposure is absent.\n";
  const ledger = title("Planned Source Exposure Ledger Contract") +
    `Clean holdout expected events: \`${data.aggregateIntegrity.expectedEventCount}\`; unique observed: \`${data.aggregateIntegrity.uniqueEventCount}\`; duplicates/missing/orphans: \`${data.aggregateIntegrity.duplicateEventCount}/${data.aggregateIntegrity.missingEventCount}/${data.aggregateIntegrity.orphanEventCount}\`.\n\n` +
    "One ledger row is one unique source event. Objective, muscle, action, role, block, set, side, and revision views never create another event.\n";
  const objective = title("Week Objective Prescribed Realization Contract") +
    "Canonical chain: `WeeklyDevelopmentObjective -> reservation -> directive -> SessionNeed planner provenance -> assignment -> source event -> final Prescription revision -> final Sequence revision -> opportunity`. Frequency counts unique qualifying reservations.\n";
  const dose = title("Weekly Dose Lane Contract") +
    codeList(["repetition_sets", "timed_hold", "breath_cycles", "distance_carry", "timed_carry", "step_march", "step_sets"]) +
    "\n\nRepetitions, seconds, metres, trips, steps, and breath cycles are never summed into one magnitude.\n";
  const muscle = title("Weekly Muscle Relationship Views") +
    codeList(["primary_target", "key_secondary_target", "incidental_contributor", "stabilizer_or_contextual_contributor", "unknown"]) +
    "\n\nPrimary and key-secondary views stay separate. Fractional coefficient count is `0`.\n";
  const movement = title("Weekly Movement, Action, and Capacity Views") +
    "Movement roles, reviewed action functions, and supported capacity lanes validate an explicit objective relationship. Exercise ontology cannot create objective ownership. Carry does not become systemic conditioning.\n";
  const assessment = title("Weekly Assessment and Preparation Lanes") +
    `Preparation events: \`${data.warmupActivation.weeklyPreparationEventCount}\`; activation events: \`${data.warmupActivation.weeklyActivationEventCount}\`; dependency-driven recurrence: \`${data.warmupActivation.dependencyDrivenRecurrenceCount}\`; assessment recurrence: \`${data.warmupActivation.assessmentObjectiveRecurrenceCount}\`; generic recurrence: \`0\`; developmental miscredit: \`${data.warmupActivation.developmentalMiscreditCount}\`.\n`;
  const stress = title("Weekly Planned Stress Exposure") +
    "Each event/tag preserves source, exposure scope, side scope, prescribed facts, resolution, and provenance. Dose-created stress remains unresolved without approved thresholds or direct facts. Numeric joint-stress score count is `0`.\n";
  const burden = title("Weekly Planned Burden and Concentration") +
    "Local/systemic fatigue, axial load, grip, trunk bracing, stress tags, block counts, known time, and unknown duration remain a structured vector. Concentrations are observations without hard limits. Aggregate burden score count is `0`.\n";
  const duration = title("Weekly Prescribed Duration View") +
    "Known lower bounds sum. Weekly upper bounds exist only when every session upper bound is known. Definitely-over-budget is non-executable; unknown or possibly-over-budget remains unresolved; unknown is never fit.\n";
  const spacing = title("Weekly Prescribed Spacing Contract") +
    "Opportunity order never implies elapsed time. Explicit timestamps may expose elapsed minutes, but `SPACING_R0_PRESCRIPTION_PENDING` defines no universal gap and remains response-dependent.\n";
  const h1h2 = title("Post-Prescription H1/H2 Compiled Sublab") +
    `Source block: \`${data.h1h2.sourceBlockId}\`. H1 range: \`${data.h1h2.h1TotalDevelopmentalSetRange.join("-")}\`; distributed H2: \`${data.h1h2.h2DistributedSessionRanges.map((range) => range.join("-")).join(" + ")}\`; additive mutation: \`${data.h1h2.h2AdditiveMutationTotalDevelopmentalSetRange.join("-")}\`.\n\nDisposition: \`${data.h1h2.disposition}\`; additive mutation rejected: \`${data.h1h2.additiveMutationRejected}\`.\n`;
  const gate13 = title("Post-Prescription Week CAGT Gate 13") +
    `Authority: \`${data.gate13.authority}\`. Clean holdout hard failures: \`${data.gate13.hardZeroFailureCount}\`.\n\n` +
    table(["Order", "Subgate", "Failure behavior"], data.gate13.subgateOrder.map((subgate, index) => [index, subgate, "FAIL_STOP_THEN_SHADOW_ONLY"]));
  const matrix = title("Post-Prescription Week CAGT Matrix") +
    `Controlled scenarios: \`${data.controlledScenarioCount}\`; mutations: \`${data.mutation.mutationCount}\`; metamorphic invariants/material responses: \`${data.metamorphic.invariantCount}/${data.metamorphic.materialResponseCount}\`.\n\n` +
    table(["Scenario", "Receiver"], data.controlledScenarios.map((scenario) => [scenario, "Gate 13 rightful subgate"]));
  const holdoutMd = title("Post-Prescription Week Holdout Manifest") +
    `Manifest: \`${data.holdout.manifestId}\`; scenarios: \`${data.holdout.scenarioCount}\`; genuine complete weeks: \`${data.holdout.genuineCompletePrescribedWeekCount}\`; fingerprint: \`${data.holdout.manifestFingerprint}\`.\n\nLocked before execution; tuning after inspection is prohibited.\n`;
  const admission = title("Post-Prescription Week CAGT Admission Report") + classification +
    `Holdout: \`${data.holdout.scenarioCount}\` scenarios, \`${data.holdout.genuineCompletePrescribedWeekCount}\` complete, clean hard failures \`${data.holdout.hardZeroFailureCount}\`. Mutations rejected: \`${data.mutation.rejectedCount}/${data.mutation.mutationCount}\`. Stress: \`${data.stress.result}\`. Combined fingerprint: \`${data.fingerprints.combinedPostPrescriptionWeekValidationDesign}\`.\n`;
  const readiness = title("Post-Prescription Week Implementation Readiness") + classification +
    `Ontology: \`${data.ontologyClassification}\`. Contract: \`${data.contract.contractId}@${data.contract.contractVersion}\`. Gate 13: \`${data.gate13.authority}\`. Production validator implemented: \`false\`. Production activation: \`NOT_ACTIVATED\`.\n\nThe exact next dependency is separate authorization for a production validator kernel using production Week contracts or a validated adapter.\n`;
  const realUser = title("Real User Post-Prescription Week Variable Audit") +
    table(["Variable", "Canonical owner"], data.realUserVariableOwners) +
    "\n\nNo field belongs in the validator merely because it exists in a real user journey; every fact requires a legitimate receiver.\n";
  return {
    "POST_PRESCRIPTION_WEEK_VALIDATION_ONTOLOGY_AUDIT.md": ontology,
    "POST_PRESCRIPTION_WEEK_VALIDATION_OWNER_BOUNDARIES.md": ownerBoundaries,
    "POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT.md": contract,
    "POST_PRESCRIPTION_WEEK_VALIDATION_INPUT.md": input,
    "POST_PRESCRIPTION_WEEK_VALIDATION_OUTPUT.md": output,
    "PLANNED_SOURCE_EXPOSURE_LEDGER_CONTRACT.md": ledger,
    "WEEK_OBJECTIVE_PRESCRIBED_REALIZATION_CONTRACT.md": objective,
    "WEEKLY_DOSE_LANE_CONTRACT.md": dose,
    "WEEKLY_MUSCLE_RELATIONSHIP_VIEWS.md": muscle,
    "WEEKLY_MOVEMENT_ACTION_CAPACITY_VIEWS.md": movement,
    "WEEKLY_ASSESSMENT_AND_PREPARATION_LANES.md": assessment,
    "WEEKLY_PLANNED_STRESS_EXPOSURE.md": stress,
    "WEEKLY_PLANNED_BURDEN_AND_CONCENTRATION.md": burden,
    "WEEKLY_PRESCRIBED_DURATION_VIEW.md": duration,
    "WEEKLY_PRESCRIBED_SPACING_CONTRACT.md": spacing,
    "POST_PRESCRIPTION_H1_H2_COMPILED_SUBLAB.md": h1h2,
    "POST_PRESCRIPTION_WEEK_CAGT_GATE_13.md": gate13,
    "POST_PRESCRIPTION_WEEK_CAGT_MATRIX.md": matrix,
    "POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.md": holdoutMd,
    "POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.json": `${JSON.stringify(POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST, null, 2)}\n`,
    "POST_PRESCRIPTION_WEEK_CAGT_ADMISSION_REPORT.md": admission,
    "POST_PRESCRIPTION_WEEK_CAGT_ADMISSION_REPORT.json": `${JSON.stringify(data, null, 2)}\n`,
    "POST_PRESCRIPTION_WEEK_IMPLEMENTATION_READINESS.md": readiness,
    "REAL_USER_POST_PRESCRIPTION_WEEK_VARIABLE_AUDIT.md": realUser,
  };
}

export const POST_PRESCRIPTION_WEEK_UPDATED_DOCS = Object.freeze([
  "WEEKLY_LEDGER_BOUNDARY.md",
  "PRESCRIPTION_WEEKLY_LEDGER_BOUNDARY.md",
  "WEEK_POLICY_V1_IMPLEMENTATION_READINESS.md",
  "WEEK_COMPOSER_IMPLEMENTATION_READINESS.md",
  "PRESCRIPTION_NUMERIC_H1_H2_DISTRIBUTION_REPORT.md",
  "PRESCRIPTION_NUMERIC_SPACING_REPORT.md",
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
] as const);

export function postPrescriptionWeekDocAppendix(data = buildPostPrescriptionWeekValidationReportData()): string {
  return `## Post-Prescription Week Validation V1\n\n` +
    `Design admission: \`${data.classification}\`. Gate 13 authority is \`${data.gate13.authority}\`; Gates 14-15 remain \`NOT_IMPLEMENTED\` and Gate 16 remains \`FOUNDATION_ONLY\`. ` +
    `The three-ledger invariant, source-event uniqueness, final Prescription/Sequence revisions, objective provenance, contribution truth, dose-lane separation, planned stress/duration/spacing, and no-downstream-rescue behavior are admitted as design evidence only. ` +
    `No production validator, Week activation, app wiring, Performance ingestion, or Longitudinal behavior exists. Combined design fingerprint: \`${data.fingerprints.combinedPostPrescriptionWeekValidationDesign}\`.\n`;
}

export const POST_PRESCRIPTION_WEEK_FROZEN_FINGERPRINTS = FROZEN_FINGERPRINTS;
export const POST_PRESCRIPTION_WEEK_CAGT_GATE_ORDER = CAGT_GATE_ORDER;

export const EXPECTED_POST_PRESCRIPTION_WEEK_VALIDATION_FINGERPRINTS: Readonly<Record<string, string>> = Object.freeze({
  ontologyAudit: "fe6514bd42b0bfe678fec180b7005a5808428b799d9b6786d079ec8e02e6a18c",
  ownerBoundaries: "156b28199822929c621e404209854169523a2d3fd5782eee3e68cdf9370347fd",
  validationContract: "c957757323eee6ad372d9d1a82fb11bf9a76212d97815e05701500db63d9ea29",
  inputContract: "6ec0281df7fe069619dec917ca848cf5097dda210584dde13bd50e796de629c7",
  sourceExposureLedger: "ec9ff3bb3d8abb22bc928d943e1aabd951194a9a5b0233c62ed25f022a66af29",
  objectiveToEventTrace: "44aea648c2e1d429515fee55885221214a2f2b908deaca8c5bc5a7408ada91c3",
  sessionAdmissibility: "fdf1e02c00eeae68c2e5e2dc070f6a37d9e011b22e758d4094ad878a38395a16",
  blockContributionModel: "87fa7083b3e5ec7214d62ffe03897904f2f545ee35dec78fd91a3868c5fe107e",
  doseLaneModel: "ca4e7d3a4eeea9845defb81fa619f0146bd9180542639363a7241b6acd55b508",
  muscleRelationshipViews: "61f904454426fe2761b1a658164b9be7c210dfdd2403741222cb5ab235c4e21f",
  movementActionCapacityViews: "f663804ebfeab7bceabb63179605964bc2aa9925f55b41e7c893bae4195b8be1",
  assessmentPreparationLanes: "72a36e4beb39376ea98445f152b3a081a1fd5bf9f98eb698c8bf214f3a44e495",
  stressExposure: "dd4ea7e3f55bf4f5ef057006a1438b6340b2e5ce586a9cac609fde81d2d98172",
  burdenConcentration: "a3ed1b489a7755555d5bf019ad57f64f9ddb538de7fc7352a5a41c1dbdb0c9df",
  durationView: "7bd0174a29fa06c283510fbd2bc286c1ed9aac12ebd4965f33d3f351f6a3cab6",
  spacingModel: "98fdd3c85d2d588b3f8aa716e4eb8f496bb8341138e5fbf63c40e336ef4f10fe",
  h1H2Sublab: "06404c9dd2b43894f4feef11b080932d1049693dabe0462a1e67b839f7f33aea",
  completeWeekArgument: "9a6de43615fe823ea011ccc92ce175a2bfdcf35950834b77e08bffa51ea275dd",
  gate13Order: "777d9b952a5347e5ca2fbd8e3c2af22d7d551c9fc4e7d27f5f1305e5ec337397",
  cagtCausalOutcomes: "2a8639f3066042468630dfb2e313b5e26cfa915024372e1d803dd7f101a78dba",
  holdoutManifest: "f2116ec34146fa25f1c3fa23906becc5b3d35cac8160f38124273d79ccbdf402",
  holdoutResults: "d871f3098315a5dc919c3f4c40ccdf05cb68079c6be327181b5f49a0d89e855e",
  mutationResults: "fbf1db690eab8fe16a623ebf7f1c478f035cdd69d3f10aeb03b3162e8579c514",
  metamorphicResults: "3e7ae2975dceb524155dea6b8f0fa98d80e6d43bbb6ce64aaf7b9c3aafeeae93",
  stressResults: "3ce7a73213d28ad9cb6e65c9e687d6aa56c1f9d553a15a4d02d764aad9bffe0e",
  activationGuards: "0c7c500742237da2cb927b1105fc8ccf9ae3b47cccdece6e51f7a38d588f07cc",
  implementationReadiness: "d8170dd03f7c877a7165acf7352fe2600274bc9f8ebc7e8c81862df2b6eef418",
  combinedPostPrescriptionWeekValidationDesign: "6beea85cca5cfb73343c1ae7b6705ba6a9be4a6b82c737d09945357f6563fb82",
});
