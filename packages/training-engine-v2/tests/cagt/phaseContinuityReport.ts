import {
  PHASE_1_TO_2_CRITERIA,
  PHASE_2_TO_3_CRITERIA,
  PHASE_CONTINUITY_CONTRACT_REFERENCE,
  PHASE_CONTINUITY_GATE_15_STATUS,
  PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
  PHASE_EVIDENCE_SOURCE_TYPES,
  PHASE_TRANSITION_GRAPH,
} from "../../src/phaseContinuity/designContracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3,
  projectEffectiveAuthorityRegistryV3ToLegacy,
} from "./effectiveAuthorityRegistryV3";
import {
  PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST,
  PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT,
  PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS,
} from "./phaseContinuityCohorts";
import {
  PHASE_CONTINUITY_DETAILED_CLASSIFICATIONS,
  PHASE_CONTINUITY_GATE_15_SUBGATES,
  PHASE_CONTINUITY_STATUSES,
  PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS,
} from "./phaseContinuityContracts";
import {
  FULL_PROGRAM_UPSTREAM_FINGERPRINTS,
  EXPECTED_FULL_PRESCRIBED_PROGRAM_CAGT_COMBINED_FINGERPRINT,
} from "./fullProgramReport";
import { digest } from "./signatures";
import {
  phaseContinuityActivationGuards,
  phaseContinuityCoverageEvidence,
  runPhaseContinuityControlledCases,
  runPhaseContinuityDeterministicStress,
  runPhaseContinuityFixedShellCohort,
  runPhaseContinuityHoldout,
  runPhaseContinuityMetamorphicSuite,
  runPhaseContinuityMultiHorizonCohorts,
  runPhaseContinuityMutationSuite,
} from "../helpers/phaseContinuityDesignLab";

export const PHASE_CONTINUITY_GATE_15_CLASSIFICATION =
  "PHASE_CONTINUITY_GATE_15_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION" as const;
export const PHASE_CONTINUITY_ONTOLOGY_CLASSIFICATION =
  "PHASE_CONTINUITY_ONTOLOGY_READY" as const;
export const EXPECTED_PHASE_CONTINUITY_GATE_15_COMBINED_FINGERPRINT =
  "9b5602fbbfe5f9f32537bff8c07b434e8cb7528f62513a97d6c823d0cba3f3fc" as const;

const ONTOLOGY_AUDIT_ROWS = Object.freeze([
  ["PhaseId", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Closed phase_1/phase_2/phase_3 identity vocabulary."],
  ["PhaseIntent", "CONTEXTUAL_ONLY", "Development context; it cannot own athlete outcome or create work."],
  ["PhaseCapabilityExpectation", "CONTEXTUAL_ONLY", "Candidate demand context, never a transition prerequisite by itself."],
  ["PhaseProgressionIntent", "CONTEXTUAL_ONLY", "Reviewed policy preference; no dose-selection authority."],
  ["PhaseAdvancementCriterion", "PROSE_ONLY_NOT_AUTHORITY", "Legacy strings retained for compatibility; typed V1 definitions supersede authority."],
  ["PhaseState", "LEGACY_COMPATIBILITY_ONLY", "Current phase observation without stable cycle/state/revision identity."],
  ["THREE_PHASE_FOUNDATION", "CONTEXTUAL_ONLY", "Stable contextual phase definitions; not templates."],
  ["PhaseIntent.primaryGoal", "LEGACY_COMPATIBILITY_ONLY", "Compatibility metadata; athlete/session outcome goal remains explicit owner truth."],
  ["PhaseIntent.developedQualities", "DISPLAY_ONLY", "Explanatory text; never parsed."],
  ["PhaseIntent.priorityMuscles", "CONTEXTUAL_ONLY", "Cannot become WeeklyObjectives or SessionNeeds."],
  ["PhaseProgressionIntent.loading/effort", "PRESCRIPTION_POLICY_OWNER", "Contextual applicability only; Prescription owns realized dose."],
  ["preferredProgressionAxes", "LONGITUDINAL_OWNER", "Available-axis context; Gate 16 later selects progression."],
  ["exerciseContinuityDefault", "CONTEXTUAL_ONLY", "Preserve/review hint; automatic replacement remains none."],
  ["evidenceSignals/blockingSignals", "MISSING_TYPED_CRITERION", "Strings cannot authorize a transition."],
  ["weekInPhase", "OBSERVATIONAL_ONLY", "Display/window context with automaticAdvancementAuthority=false."],
  ["metCriterionIds/blockedCriterionIds", "MISSING_EVIDENCE_AUTHORITY", "IDs are untrusted without typed records and source authority."],
  ["contextual phase annotations", "CANDIDATE_OWNER", "Role/section-scoped candidate context for active needs."],
  ["phase-suitability scorer", "CANDIDATE_OWNER", "Low-churn contextual vote; automaticReplacementEffect=none."],
  ["phase provenance", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Accepted provenance is required for contextual scoring."],
  ["Session Intent Planner phase behavior", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Phase fields are explicitly context-only and create no needs."],
  ["Candidate Intelligence phase behavior", "CANDIDATE_OWNER", "Ranks legal candidates for existing needs."],
  ["Prescription Policy phase applicability", "PRESCRIPTION_POLICY_OWNER", "May select reviewed policy, never automatic progression."],
  ["Week Policy phase boundary", "WEEK_POLICY_OWNER", "Objectives, schedule and allocation remain Week-owned."],
  ["ProgramHistory completed IDs", "OBSERVATIONAL_ONLY", "Historical references do not prove execution, tolerance, recovery or adaptation."],
  ["Progression Readiness", "LONGITUDINAL_OWNER", "Supports review readiness while selectedAxis/selectedTransition remain null."],
  ["Training Response Receiver", "RESPONSE_OWNER", "Tolerance, re-exposure, prescription-first review and replacement consideration."],
  ["TrainingSafety", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Independent explicit veto/review authority."],
  ["Gate 13", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Planned Week coherence and realization only."],
  ["Gate 14", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Planned cross-program comparison only; no completion/adaptation inference."],
  ["PhaseCycleIdentity", "PHASE_STATE_OWNER", "New typed design identity required and now admitted."],
  ["PhaseStateRevision", "PHASE_STATE_OWNER", "New immutable final-for-attempt revision semantics admitted."],
  ["cross-horizon alignment", "PHASE_TRANSITION_OWNER", "New stable lineage/mapping/semantic responsibility contract admitted."],
  ["current app phase assumptions", "OUT_OF_SCOPE", "Legacy product has its own phaseIndex/gates; no V2 Gate 15 import or wiring exists."],
] as const);

const ONTOLOGY_ANSWERS = Object.freeze([
  [1, "Yes", "primaryGoal remains compatibility/context metadata and never replaces explicit outcomeGoal."],
  [2, "Yes", "priorityMuscles cannot create objectives or SessionNeeds."],
  [3, "Yes", "developedQualities remains inert explanatory presentation."],
  [4, "No", "string evidenceSignals/blockingSignals never authorize."],
  [5, "Yes", "weekInPhase is observational with no advancement authority."],
  [6, "No", "metCriterionIds require typed provenance-bearing evidence records."],
  [7, "No", "completed phase IDs are history references only."],
  [8, "No", "Gate 13/14 planned success proves planned coherence, not completion/adaptation."],
  [9, "Required", "Completed active assignments, actual execution criteria, dose/order and adherence from a future production source."],
  [10, "Relevant", "Tolerance, worsening, successful re-exposure, hold/review and prescription-first replacement consideration."],
  [11, "Relevant", "Readiness class, blockers, repeated evidence and continuity runway; never selected progression."],
  [12, "Missing", "Production recovery/adherence ingestion remains absent; explicit design fixtures are not runtime proof."],
  [13, "Only on reopened selection", "Phase suitability cannot displace a productive selected anchor."],
  [14, "Yes", "Progression intent may select reviewed applicability but cannot change dose."],
  [15, "Yes", "Phase 3 routes to cycle-completion owner review without Phase 4."],
  [16, "Yes", "Regression remains review-only in V1."],
  [17, "Yes", "The same complete program is legal across a phase when active truth remains valid."],
  [18, "Yes", "Insufficient evidence may hold a phase indefinitely."],
  [19, "Yes", "Warm-up/activation remain dependency-owned."],
  [20, "Yes", "Gate 15 can validate continuity while every longitudinal action stays deferred."],
] as const);

export const PHASE_CONTINUITY_UPSTREAM_FINGERPRINTS = Object.freeze({
  ...FULL_PROGRAM_UPSTREAM_FINGERPRINTS,
  fullPrescribedProgramGate14: EXPECTED_FULL_PRESCRIBED_PROGRAM_CAGT_COMBINED_FINGERPRINT,
});

function averageMetric(
  results: ReturnType<typeof runPhaseContinuityHoldout>["results"],
  field: keyof (typeof results)[number]["result"]["metrics"],
): number {
  return Number((results.reduce((sum, entry) => sum + entry.result.metrics[field], 0) /
    results.length).toFixed(6));
}

let reportCache: ReturnType<typeof buildReport> | null = null;

function buildReport() {
  const controlled = runPhaseContinuityControlledCases();
  const fixedShell = runPhaseContinuityFixedShellCohort();
  const multiHorizon = runPhaseContinuityMultiHorizonCohorts();
  const holdout = runPhaseContinuityHoldout();
  const mutations = runPhaseContinuityMutationSuite();
  const metamorphic = runPhaseContinuityMetamorphicSuite();
  const stress = runPhaseContinuityDeterministicStress(10_000);
  const activationGuards = phaseContinuityActivationGuards();
  const coverage = phaseContinuityCoverageEvidence();
  const observedMetrics = Object.freeze({
    frameworkRetentionRate: averageMetric(holdout.results, "frameworkRetentionRate"),
    objectiveRetentionRate: averageMetric(holdout.results, "objectiveRetentionRate"),
    sessionPurposeRetentionRate: averageMetric(holdout.results, "sessionPurposeRetentionRate"),
    anchorRetentionRate: averageMetric(holdout.results, "anchorRetentionRate"),
    exerciseIdentityRetentionRate: averageMetric(holdout.results, "exerciseIdentityRetentionRate"),
    samePrescriptionRate: averageMetric(holdout.results, "samePrescriptionRate"),
    sameRepRate: averageMetric(holdout.results, "sameRepRate"),
    sameTempoRate: averageMetric(holdout.results, "sameTempoRate"),
    sameSequenceRate: averageMetric(holdout.results, "sameSequenceRate"),
    warmupRetentionRate: averageMetric(holdout.results, "warmupRetentionRate"),
    activationRetentionRate: averageMetric(holdout.results, "activationRetentionRate"),
  });
  const readinessFailures = controlled.validationFailureCount + holdout.expectationMismatchCount +
    holdout.resultValidationFailureCount + holdout.acceptedDownstreamRescueCount + mutations.failureCount +
    metamorphic.invariantFailureCount + stress.deterministicMismatchCount + stress.resultValidationFailureCount +
    stress.acceptedDownstreamRescueCount + activationGuards.failureCount +
    coverage.phaseContinuityCoverageFailureCount + multiHorizon.failureCount;
  const payloads = {
    ontologyAudit: { rows: ONTOLOGY_AUDIT_ROWS, answers: ONTOLOGY_ANSWERS,
      classification: PHASE_CONTINUITY_ONTOLOGY_CLASSIFICATION },
    authorityRegistryV3: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3,
    ownerBoundaries: "EXPLICIT_INTENT/PHASE/CANDIDATE/PRESCRIPTION/SEQUENCING/PERFORMANCE/RESPONSE/GATE15/GATE16",
    phaseContinuityPolicyV1: PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
    phaseCycleIdentity: "stable-athlete-cycle-lineage-explicit-time-owner-provenance",
    phaseStateIdentity: "stable-cycle-athlete-state-lineage",
    phaseStateRevision: "immutable-based-on-explicit-time-one-final-per-attempt",
    transitionGraph: PHASE_TRANSITION_GRAPH,
    criterionDefinitions: { phase1To2: PHASE_1_TO_2_CRITERIA, phase2To3: PHASE_2_TO_3_CRITERIA },
    criterionEvidence: "typed-source-record-quality-repetition-interval-support-conflict-provenance",
    evidenceSourceAuthority: PHASE_EVIDENCE_SOURCE_TYPES,
    transitionProposal: "proposal-not-decision-explicit-state-evidence-program-time-owner",
    inputContract: "explicit-contract-registry-policy-state-programs-evidence-traces-time",
    outputContract: "status-criteria-alignment-continuity-subgates-traces-deferral",
    crossHorizonAlignment: controlled.results.slice(78).map((entry) => entry.result.crossHorizonAlignment.status),
    continuityClassification: PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS,
    stableBaseInvariant: "KEEP_THEN_PRESERVE_THEN_LOCAL_REVIEWED_DEVELOPMENT_THEN_RIGHTFUL_REPLACEMENT",
    anchorContinuity: observedMetrics.anchorRetentionRate,
    prescriptionContinuity: observedMetrics.samePrescriptionRate,
    frameworkContinuity: observedMetrics.frameworkRetentionRate,
    objectiveNeedContinuity: observedMetrics.objectiveRetentionRate,
    warmupActivationContinuity: { warmup: observedMetrics.warmupRetentionRate,
      activation: observedMetrics.activationRetentionRate },
    replacementBoundary: "rightful-reason-plus-prescription-review-first-no-selection",
    rotationBoundary: "observational-only-gate16-owner",
    phaseSuitabilityBoundary: "CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN:automaticReplacementEffect=none",
    progressionBoundary: "review-readiness-only-selectedAxis=null-selectedTransition=null",
    subgateOrder: PHASE_CONTINUITY_GATE_15_SUBGATES,
    controlledCases: controlled.results.map((entry) => ({ caseName: entry.caseName, status: entry.status,
      classifications: entry.classifications, firstFailingSubgate: entry.firstFailingSubgate })),
    fixedShellCohort: fixedShell,
    holdoutManifest: PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST,
    holdoutResults: holdout.results.map((entry) => ({ pairId: entry.pairId, category: entry.category,
      status: entry.observedStatus, matched: entry.matchedExpectation })),
    mutations,
    metamorphicResults: metamorphic,
    stress,
    activationGuards,
    readiness: { classification: PHASE_CONTINUITY_GATE_15_CLASSIFICATION, readinessFailures,
      runtimeStatus: PHASE_CONTINUITY_GATE_15_STATUS },
  };
  const fingerprints = Object.fromEntries(Object.entries(payloads).map(([key, value]) => [key, digest(value)]));
  return Object.freeze({
    classification: readinessFailures === 0 ? PHASE_CONTINUITY_GATE_15_CLASSIFICATION :
      "TARGETED_PHASE_CONTINUITY_GATE_15_V1_FIXES_REQUIRED" as const,
    ontologyClassification: PHASE_CONTINUITY_ONTOLOGY_CLASSIFICATION,
    runtimeStatus: PHASE_CONTINUITY_GATE_15_STATUS,
    contractReference: PHASE_CONTINUITY_CONTRACT_REFERENCE,
    policy: PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3,
    legacyAuthorityProjection: projectEffectiveAuthorityRegistryV3ToLegacy(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V3),
    ontologyRows: ONTOLOGY_AUDIT_ROWS,
    ontologyAnswers: ONTOLOGY_ANSWERS,
    statusVocabulary: PHASE_CONTINUITY_STATUSES,
    detailedClassifications: PHASE_CONTINUITY_DETAILED_CLASSIFICATIONS,
    continuityClassifications: PHASE_PROGRAM_CONTINUITY_CLASSIFICATIONS,
    controlled,
    fixedShell,
    multiHorizon,
    holdout,
    mutations,
    metamorphic,
    stress,
    activationGuards,
    coverage,
    observedMetrics,
    readinessFailures,
    upstreamFingerprints: PHASE_CONTINUITY_UPSTREAM_FINGERPRINTS,
    fingerprints: Object.freeze({ ...fingerprints, combinedGate15Design: digest(fingerprints) }),
  });
}

export function buildPhaseContinuityCagtReport() {
  reportCache ??= buildReport();
  return reportCache;
}

const title = (value: string) => `# ${value}\n\nGenerated deterministically from explicit Authority Registry V3 and test/developer-only Gate 15 tooling.\n\n`;
const code = (value: unknown) => `\`${String(value)}\``;
const bullets = (values: readonly unknown[]) => values.map((value) => `- ${code(value)}`).join("\n");
const table = (headers: readonly string[], rows: readonly (readonly unknown[])[]) => [
  `| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`,
  ...rows.map((row) => `| ${row.map(String).join(" | ")} |`),
].join("\n");

function evidenceReview(): string {
  return title("Phase Continuity Evidence Review") +
    "The evidence supports progressive, individualized resistance training and criteria-aware review. It does not identify a universal phase clock or authorize automatic program replacement. Praxis therefore treats the literature as policy context, not as a transition decision.\n\n" +
    "## Source Records\n\n" +
    "1. [ACSM 2026 resistance-training position stand](https://pubmed.ncbi.nlm.nih.gov/41843416/). Population/training: healthy adults across reviews, interventions at least six weeks. Intervention: resistance-training prescription variables. Phase/block: no Praxis-like three-phase ontology. Transition criteria: no universal phase-transition rule. Comparator/outcome: alternative/no training; muscle function, size and performance. Certainty: overview of reviews/official position stand. Praxis applicability: supports progressive, goal- and capacity-aware training. Does not establish fixed phase lengths, calendar advancement, automatic rotation, or an individual readiness decision.\n\n" +
    "2. [Volume-equated periodization meta-analysis](https://pubmed.ncbi.nlm.nih.gov/35044672/). Population/training: trained and untrained resistance-training participants. Intervention: periodized versus non-periodized and linear versus undulating programs. Phase/block: planned volume/intensity variation, not evidence-gated individual phases. Transition criteria: protocol schedule. Comparator/outcome: 1RM and hypertrophy. Certainty: systematic review/meta-analysis. Praxis applicability: periodization may matter more for trained maximal-strength outcomes than hypertrophy. Does not establish a superior universal model, phase duration, or automatic transition criterion.\n\n" +
    "3. [Exercise-variation systematic review](https://pubmed.ncbi.nlm.nih.gov/35438660/). Population/training: 241 young men across eight studies. Intervention: varied versus more fixed exercise selection. Phase/block: exercise variation schedules. Transition criteria: study protocols, not readiness. Comparator/outcome: strength and regional hypertrophy. Certainty: small systematic evidence base. Praxis applicability: systematic variation may be useful while excessive random rotation may impair gains. Does not authorize novelty quotas, phase-triggered replacement, or abandoning productive anchors.\n\n" +
    "4. [Motor-learning contextual-interference meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC11237090/). Population/training: motor-learning participants across laboratory and field tasks. Intervention: blocked/low versus random/high contextual interference. Phase/block: practice schedule, not resistance-training phases. Transition criteria: assigned schedule. Comparator/outcome: retention. Certainty: systematic review/meta-analysis with task/population heterogeneity. Praxis applicability: variability and continuity interact and must be task-specific. Does not prove that exercise rotation is universally beneficial or that random variation should replace stable practice.\n\n" +
    "5. [Autoregulated resistance-training network meta-analysis](https://pubmed.ncbi.nlm.nih.gov/40791980/). Population/training: resistance-training interventions with APRE, RPE and velocity approaches. Intervention: autoregulated load/intensity methods. Phase/block: no fixed three-phase transition. Transition criteria: method-specific performance/perception feedback. Comparator/outcome: maximal strength. Certainty: systematic review/network meta-analysis. Praxis applicability: supports explicit observed readiness evidence over calendar-only changes. Does not let Gate 15 choose load, reps, sets or a progression axis.\n\n" +
    "6. [Autoregulation terminology review](https://pubmed.ncbi.nlm.nih.gov/32813181/). Population/training: resistance-training research. Intervention: broad autoregulation methods. Phase/block: conceptual frameworks. Transition criteria: performance/perceived capability measures vary. Comparator/outcome: terminology and implementation evidence. Certainty: narrative/conceptual review. Praxis applicability: reinforces typed definitions for readiness, fatigue, response and adaptation. Does not establish a single readiness threshold or justify parsing prose.\n\n" +
    "7. [International deloading Delphi consensus](https://pubmed.ncbi.nlm.nih.gov/37730925/). Population/training: 34 invited strength/physique coaches initially, 21 completing round three. Intervention: expert consensus on deload design. Phase/block: deload periods in strength/physique programs. Transition criteria: practice-derived consensus. Comparator/outcome: no efficacy comparator; design principles. Certainty: expert consensus in an under-researched area. Praxis applicability: deload is a distinct future policy decision. Does not establish efficacy, universal timing, or automatic deload authority for Gate 15.\n\n" +
    "8. [Detraining and muscle-size meta-analysis in older adults](https://pubmed.ncbi.nlm.nih.gov/36360927/). Population/training: older adults after 9-24 week resistance interventions. Intervention: 12-52 weeks cessation. Phase/block: training then detraining. Transition criteria: study schedule. Comparator/outcome: muscle size before/after cessation. Certainty: six studies, fair/good quality. Praxis applicability: interruption effects depend on population and duration. Does not establish a universal regression rule after a missed week or a Phase 3 reset.\n\n" +
    "9. [Human training-detraining-retraining study](https://pubmed.ncbi.nlm.nih.gov/30991013/). Population/training: healthy older men in a controlled resistance-training sequence. Intervention: training, detraining and retraining. Phase/block: protocol-defined periods. Transition criteria: study schedule. Comparator/outcome: strength, hypertrophy and cellular measures. Certainty: small experimental study. Praxis applicability: supports preserving history and avoiding assumptions that one interruption erases capacity. Does not define a product transition rule or generalize to every population.\n\n" +
    "10. [Bern shoulder return-to-sport consensus](https://pubmed.ncbi.nlm.nih.gov/34972489/). Population/training: athletes across participation levels; expert Delphi panel. Intervention: principle-based prevention, rehabilitation and return decisions. Phase/block: return continuum, not generic training phases. Transition criteria: multidimensional load/risk/clinical context. Comparator/outcome: consensus guidance. Certainty: expert consensus. Praxis applicability: supports explicit external authority, tolerance and criteria-aware review. Does not permit pain region alone to diagnose, regress a phase, or generate corrective work.\n\n" +
    "11. [Panther ACL return-to-sport consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC7328222/). Population/training: ACL-injured athletes and multidisciplinary experts. Intervention: return-to-participation/sport/performance continuum. Phase/block: rehabilitation return continuum. Transition criteria: criteria-based risk assessment rather than one date. Comparator/outcome: consensus decision framework. Certainty: consensus statement. Praxis applicability: supports review states, explicit evidence and owner decisions. Does not transfer sport-specific tests into universal resistance-training phase thresholds.\n\n" +
    "12. [Resistance training to failure and acute fatigue meta-analysis](https://pubmed.ncbi.nlm.nih.gov/34881412/). Population/training: resistance-training studies with varied status and prescriptions. Intervention: failure versus non-failure training. Phase/block: none. Transition criteria: protocol assignment. Comparator/outcome: acute fatigue and recovery-related measures. Certainty: systematic review/meta-analysis. Praxis applicability: recovery cannot be inferred from planned effort alone. Does not establish universal fatigue ceilings, deload timing, or phase-transition authority.\n\n" +
    "## Admission Interpretation\n\nNo reviewed source establishes a universal four-week block, calendar advancement, automatic deload, universal rotation, automatic regression, or automatic phase reset. V1 therefore requires typed completed evidence, explicit source authority, repeated evidence where declared, independent safety review, and an adjacent proposal; missing or conflicting evidence holds. Population differences, especially novice versus trained and healthy versus rehabilitation cohorts, remain explicit applicability limits.\n";
}

export function renderPhaseContinuityCagtReports(
  report = buildPhaseContinuityCagtReport(),
): Readonly<Record<string, string>> {
  const ownerRows = [
    ["Explicit athlete/Week intent", "outcome goal, objectives, priorities, schedule/opportunities, direct priorities"],
    ["Phase", "development context, phase identity, typed criteria, transition eligibility, continuity requirements"],
    ["Candidate Intelligence", "contextual suitability for an active need; no automatic replacement"],
    ["Prescription", "exact dose under explicit policy; no automatic progression"],
    ["Final Sequencing", "final order; no phase decision"],
    ["Performance", "completed execution, adherence, actual dose/order"],
    ["Training Response Receiver", "tolerance, re-exposure, prescription-first review, replacement consideration"],
    ["Gate 15", "stay/advance/hold/review and cross-horizon continuity validation"],
    ["Gate 16 later", "progression, regression, rotation, replacement, deload and future dose"],
  ];
  const admissionJson = {
    classification: report.classification,
    ontologyClassification: report.ontologyClassification,
    runtimeStatus: report.runtimeStatus,
    authorityRegistry: report.authorityRegistry.reference,
    contract: report.contractReference,
    policy: report.policy,
    holdout: {
      pairCount: report.holdout.pairCount,
      genuineCompleteProgramPairCount: report.holdout.genuineCompleteProgramPairCount,
      stayCount: report.holdout.stayCount,
      advanceAuthorizedCount: report.holdout.advanceAuthorizedCount,
      holdPendingEvidenceCount: report.holdout.holdPendingEvidenceCount,
      blockerCount: report.holdout.blockerCount,
      conflictCount: report.holdout.conflictCount,
      cycleReviewCount: report.holdout.cycleReviewCount,
      excessiveRegenerationCount: report.holdout.excessiveRegenerationCount,
      downstreamRescueAttemptCount: report.holdout.downstreamRescueAttemptCount,
      acceptedDownstreamRescueCount: report.holdout.acceptedDownstreamRescueCount,
      expectationMismatchCount: report.holdout.expectationMismatchCount,
    },
    observedMetrics: report.observedMetrics,
    coverage: report.coverage,
    stress: report.stress,
    activationGuards: report.activationGuards,
    fingerprints: report.fingerprints,
  };
  return Object.freeze({
    "PHASE_CONTINUITY_ONTOLOGY_AUDIT.md": title("Phase Continuity Ontology Audit") +
      `Classification: ${code(report.ontologyClassification)}. Phase developmental emphasis is not the athlete's explicit outcome goal.\n\n` +
      table(["Concept", "Classification", "Decision"], report.ontologyRows) + "\n\n## Explicit Answers\n\n" +
      table(["#", "Answer", "Reason"], report.ontologyAnswers) + "\n",
    "PHASE_CONTINUITY_OWNER_BOUNDARIES.md": title("Phase Continuity Owner Boundaries") +
      table(["Owner", "Permanent authority"], ownerRows) +
      "\n\nGate 15 may validate continuity and sufficiency. It may not borrow Gate 16 action authority.\n",
    "PHASE_CONTINUITY_POLICY_V1_CONTRACT.md": title("Phase Continuity Policy V1 Contract") +
      `Policy: ${code(`${report.policy.reference.policyId}@${report.policy.reference.version}`)}. State: ${code(report.policy.state)}.\n\n` +
      bullets(report.policy.philosophy) + "\n\nAll automatic action flags are false.\n",
    "PHASE_CYCLE_IDENTITY_CONTRACT.md": title("Phase Cycle Identity Contract") +
      "One Phase 1 to Phase 2 to Phase 3 developmental cycle retains one `phaseCycleId`, athlete, source program/horizon lineage, explicit createdAt, owner/source and provenance. Date, week, phase name, random UUID and completed-count derivation are prohibited. A new cycle needs a future explicit owner and a new identity.\n",
    "PHASE_STATE_IDENTITY_AND_REVISION.md": title("Phase State Identity and Revision") +
      "`ProductionPhaseStateIdentity` binds athlete, cycle and stable state identity. Every immutable `PhaseStateRevision` carries current phase, based-on revision, reason, explicit time, evidence snapshot, status and final-for-decision state. Exactly one revision is final for an attempt. `weekInPhaseObservation` has `automaticAdvancementAuthority=false`.\n",
    "PHASE_ADVANCEMENT_CRITERION_CONTRACT.md": title("Phase Advancement Criterion Contract") +
      `Typed Phase 1 to 2 criteria: ${code(PHASE_1_TO_2_CRITERIA.length)}. Typed Phase 2 to 3 criteria: ${code(PHASE_2_TO_3_CRITERIA.length)}. Definitions own domain, priority, accepted source, quality, repetition, blockers, conflict behavior, review status and provenance. Description is inert.\n\n` +
      table(["Criterion", "Edge", "Domain", "Repetition"], [...PHASE_1_TO_2_CRITERIA,
        ...PHASE_2_TO_3_CRITERIA].map((entry) => [entry.criterionId,
        `${entry.currentPhaseId}->${entry.targetPhaseId}`, entry.domain, entry.repeatedEvidenceRequirement])) + "\n",
    "PHASE_CRITERION_EVIDENCE_CONTRACT.md": title("Phase Criterion Evidence Contract") +
      "Every record binds criterion, athlete, phase cycle/current phase, source owner and source IDs, quality, explicit interval/appliesThrough, evidence and repetition classification, support/contradiction flags, uncertainty and provenance. Repetition is an explicit state and is never inferred from array length. Current design fixtures are labeled test evidence, not production Performance ingestion.\n",
    "PHASE_TRANSITION_PROPOSAL_CONTRACT.md": title("Phase Transition Proposal Contract") +
      "A proposal binds cycle/state revision, current/target phase, transition kind, definitions/evidence/blockers, proposed snapshot, exact typed changed facts, mappings, owner, explicit evaluation time and provenance. A proposal is not a decision and cannot mutate state.\n",
    "PHASE_CONTINUITY_INPUT_CONTRACT.md": title("Phase Continuity Input Contract") +
      "Input requires the exact Gate 15 contract, Registry V3, Policy V1, cycle/state revision, proposal, current/proposed immutable snapshots, Gate 13/14 planned truth, typed criteria/evidence, safety/response/progression traces, explicit completed fixtures and explicit time. UI state, labels, names, prose, candidate rank, hidden time and randomness are excluded.\n",
    "PHASE_CONTINUITY_OUTPUT_CONTRACT.md": title("Phase Continuity Output Contract") +
      `Statuses: ${code(report.statusVocabulary.length)}. Detailed classifications: ${code(report.detailedClassifications.length)}. Output preserves criterion, safety, eligibility, alignment, stable-base, anchor, Prescription, warm-up/activation, replacement, rotation, phase-policy, Gate 16 deferral, fail-stop, decision and provenance traces.\n\n${bullets(report.statusVocabulary)}\n`,
    "PHASE_CONTINUITY_CROSS_HORIZON_ALIGNMENT.md": title("Phase Continuity Cross-Horizon Alignment") +
      "Alignment extends Gate 14 across phase-cycle, objective, opportunity, reservation, session, need, assignment, source-event, Prescription and Sequence identity. Stable lineage, explicit mapping and unique semantic responsibility are legal; day number, split label, array position, names and prose are not. Ambiguity returns `PHASE_PROGRAM_ALIGNMENT_AMBIGUOUS` at 15.5.\n",
    "PHASE_CONTINUITY_STABLE_BASE.md": title("Phase Continuity Stable Base") +
      `Invariant: KEEP -> PRESERVE PRODUCTIVE CONTINUITY -> ALLOW REVIEWED PRESCRIPTION DEVELOPMENT -> MODIFY LOCAL STRUCTURE WHEN JUSTIFIED -> REPLACE ONLY WITH RIGHTFUL AUTHORITY. Observed framework/objective/session-purpose rates: ${code(`${report.observedMetrics.frameworkRetentionRate}/${report.observedMetrics.objectiveRetentionRate}/${report.observedMetrics.sessionPurposeRetentionRate}`)}. No rate is a pass threshold.\n`,
    "PHASE_CONTINUITY_ANCHOR_POLICY.md": title("Phase Continuity Anchor Policy") +
      `Productive anchors remain when their active need, legality, equipment, safety, response and continuity runway remain viable. Phase alone cannot displace them. Observed anchor retention: ${code(report.observedMetrics.anchorRetentionRate)}. Candidate rank and phase-fit review cannot reopen selection automatically.\n`,
    "PHASE_CONTINUITY_PRESCRIPTION_BOUNDARY.md": title("Phase Continuity Prescription Boundary") +
      `A reviewed phase policy may be applicable, but Gate 15 never adds load/sets/range/effort, reduces support, changes tempo, or chooses progression. Same Prescription across a phase is legal. Observed same-Prescription/reps/tempo: ${code(`${report.observedMetrics.samePrescriptionRate}/${report.observedMetrics.sameRepRate}/${report.observedMetrics.sameTempoRate}`)}.\n`,
    "PHASE_CONTINUITY_WARMUP_ACTIVATION.md": title("Phase Continuity Warm-up and Activation") +
      `Supporting work remains dependency-owned. Persisting dependencies preserve work; removed dependencies remove stale work; new work needs a typed dependency. Observed warm-up/activation retention: ${code(`${report.observedMetrics.warmupRetentionRate}/${report.observedMetrics.activationRetentionRate}`)}. Accepted generic phase warm-ups/activations: ${code("0/0")}.\n`,
    "PHASE_CONTINUITY_REPLACEMENT_ROTATION_BOUNDARY.md": title("Phase Continuity Replacement and Rotation Boundary") +
      "Replacement validation requires a changed need, illegality, unavailable equipment, explicit block, repeated response-based consideration, exhausted prescription review, or accepted scoped incompatibility. One adverse realization is insufficient; successful re-exposure weakens permanent-failure pressure. Gate 15 chooses no replacement. Rotation remains observational, with no novelty quota or automatic policy.\n",
    "PHASE_CONTINUITY_EVIDENCE_REVIEW.md": evidenceReview(),
    "PHASE_CONTINUITY_CAGT_MATRIX.md": title("Phase Continuity CAGT Matrix") +
      `Controlled cases: ${code(report.controlled.caseCount)}; malformed result count: ${code(report.controlled.validationFailureCount)}.\n\n` +
      table(["Case", "Status", "First failing subgate"], report.controlled.results.map((entry) =>
        [entry.caseName, entry.status, entry.firstFailingSubgate ?? "none"])) + "\n",
    "PHASE_CONTINUITY_FIXED_SHELL_COHORT.md": title("Phase Continuity Fixed Shell Cohort") +
      `Users/unique users/opportunities each: ${code(`${report.fixedShell.cohortSize}/${report.fixedShell.uniqueAthleteCount}/4`)}. Framework/objective/session-purpose/anchor/Prescription retention: ${code(`${report.fixedShell.frameworkRetentionRate}/${report.fixedShell.objectiveRetentionRate}/${report.fixedShell.sessionPurposeRetentionRate}/${report.fixedShell.anchorRetentionRate}/${report.fixedShell.prescriptionContinuityRate}`)}. Unexplained churn: ${code(report.fixedShell.unexplainedChurnCount)}. Shared framework remains legal.\n`,
    "PHASE_CONTINUITY_HOLDOUT_MANIFEST.md": title("Phase Continuity Gate 15 V1 Holdout Manifest") +
      `Fingerprint: ${code(PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST_FINGERPRINT)}. Frozen before execution: ${code(true)}. Pair/genuine/stable-framework/anchor/local-change/regeneration/no-rescue counts: ${code(`${PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.pairCount}/${PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.genuineCompleteProgramPairCount}/${PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.stableFrameworkTransitionPairCount}/${PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.anchorContinuityPairCount}/${PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.justifiedLocalChangePairCount}/${PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.excessiveRegenerationMutationCount}/${PHASE_CONTINUITY_HOLDOUT_REQUIREMENT_COUNTS.noRescueMutationCount}`)}. Any correction requires V1.1 and a new holdout.\n`,
    "PHASE_CONTINUITY_HOLDOUT_MANIFEST.json": `${JSON.stringify(PHASE_CONTINUITY_GATE_15_V1_HOLDOUT_MANIFEST, null, 2)}\n`,
    "PHASE_CONTINUITY_CAGT_ADMISSION_REPORT.md": title("Phase Continuity CAGT Admission Report") +
      `Classification: ${code(report.classification)}. Ontology: ${code(report.ontologyClassification)}. Holdout expectation mismatches/result failures/accepted rescues: ${code(`${report.holdout.expectationMismatchCount}/${report.holdout.resultValidationFailureCount}/${report.holdout.acceptedDownstreamRescueCount}`)}. Stay/advance/hold/blocker/conflict/cycle/regen: ${code(`${report.holdout.stayCount}/${report.holdout.advanceAuthorizedCount}/${report.holdout.holdPendingEvidenceCount}/${report.holdout.blockerCount}/${report.holdout.conflictCount}/${report.holdout.cycleReviewCount}/${report.holdout.excessiveRegenerationCount}`)}. Combined fingerprint: ${code(report.fingerprints.combinedGate15Design)}.\n`,
    "PHASE_CONTINUITY_CAGT_ADMISSION_REPORT.json": `${JSON.stringify(admissionJson, null, 2)}\n`,
    "PHASE_CONTINUITY_STRESS_REPORT.md": title("Phase Continuity Stress Report") +
      `Comparisons/genuine pairs/criterion evaluations/alignments/anchors/no-rescue: ${code(`${report.stress.deterministicPhaseContinuityComparisonCount}/${report.stress.genuineCurrentProposedCompleteProgramPairCount}/${report.stress.criterionEvidenceEvaluationCount}/${report.stress.crossHorizonAlignmentCount}/${report.stress.anchorContinuityValidationCount}/${report.stress.noRescueMutationCount}`)}. Determinism/result-validation/accepted-rescue/clock/random failures: ${code(`${report.stress.deterministicMismatchCount}/${report.stress.resultValidationFailureCount}/${report.stress.acceptedDownstreamRescueCount}/${report.stress.hiddenClockReadCount}/${report.stress.randomOutputCount}`)}. Result: ${code(report.stress.result)}.\n`,
    "PHASE_CONTINUITY_IMPLEMENTATION_READINESS.md": title("Phase Continuity Implementation Readiness") +
      `Classification: ${code(report.classification)}. Runtime: ${code(report.runtimeStatus)}. Registry: ${code(`${report.authorityRegistry.reference.registryId}@${report.authorityRegistry.reference.version}`)}. Gate 15 authority: ${code("PHASE_CONTINUITY_DESIGN_EVIDENCE")}; Gate 16: ${code("FOUNDATION_ONLY_NOT_IMPLEMENTED")}. Readiness failure count: ${code(report.readinessFailures)}. Production behavior changed: ${code("no")}. Combined fingerprint: ${code(report.fingerprints.combinedGate15Design)}. Exact next dependency: ${code("OWNER_AUTHORIZATION_FOR_PRODUCTION_PHASE_CONTINUITY_KERNEL_IMPLEMENTATION")}.\n`,
  });
}

export const PHASE_CONTINUITY_GATE_15_UPDATED_DOCS = Object.freeze([
  "CAGT_GATE_ORDER.md",
  "CAGT_GATED_STRESS_REPORT.md",
  "CAGT_CAUSAL_PAIR_MATRIX.md",
  "FULL_PRESCRIBED_PROGRAM_CAGT_IMPLEMENTATION_READINESS.md",
  "FULL_PRESCRIBED_PROGRAM_CAUSAL_PROPAGATION.md",
  "FULL_PRESCRIBED_PROGRAM_ADAPTATION_PERSISTENCE.md",
  "PRODUCTION_POST_PRESCRIPTION_WEEK_FUTURE_INTEGRATION.md",
  "PRODUCTION_FINAL_SEQUENCING_FUTURE_INTEGRATION.md",
  "PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md",
  "ARCHITECTURE.md",
  "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md",
  "OPTIMIZER.md",
  "TESTING.md",
]);

export function phaseContinuityGate15DocumentationMarker(
  report = buildPhaseContinuityCagtReport(),
): string {
  return [
    "<!-- PHASE_CONTINUITY_GATE_15_V1:START -->",
    "## Phase Continuity Gate 15 V1",
    "",
    `Classification: ${code(report.classification)}. Ontology: ${code(report.ontologyClassification)}. ` +
      `Authority Registry: ${code(`${report.authorityRegistry.reference.registryId}@${report.authorityRegistry.reference.version}`)}; ` +
      `Gate 15 is ${code("PHASE_CONTINUITY_DESIGN_EVIDENCE")} and remains test/developer tooling, not product runtime. ` +
      `The frozen holdout has ${code(report.holdout.pairCount)} cases, ` +
      `${code(report.holdout.expectationMismatchCount)} mismatches, and ` +
      `${code(report.holdout.acceptedDownstreamRescueCount)} accepted rescues. ` +
      "No automatic phase advancement/regression/reset, progression, replacement, rotation or deload exists. " +
      `Gate 16 remains ${code("FOUNDATION_ONLY_NOT_IMPLEMENTED")}. Combined fingerprint: ` +
      `${code(report.fingerprints.combinedGate15Design)}.`,
    "<!-- PHASE_CONTINUITY_GATE_15_V1:END -->",
  ].join("\n");
}
