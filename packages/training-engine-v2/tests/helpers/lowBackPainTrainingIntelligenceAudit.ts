import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  REFERENCE_EXERCISES,
  type MovementRole,
} from "../../src";
import { buildPhaseAnnotationContextReviewData } from "./phaseAnnotationContextReview";
import { buildSupportAndStanceMechanicsContractData } from "./supportAndStanceMechanicsContract";
import { buildCurrentTrunkCurationFingerprints } from "./trunkMechanicsCurationProposal";
import { buildTrainingSafetyAndResponseFoundationData } from "./trainingSafetyAndResponseFoundation";
import { buildStableAdaptiveProgrammingPolicyData } from "./stableAdaptiveProgrammingPolicy";

export const LOW_BACK_PAIN_AUDIT_FIXED_AS_OF = "2026-08-12T00:00:00.000Z";
export const LOW_BACK_PAIN_AUDIT_OVERALL_CLASSIFICATION =
  "TARGETED_CONTRACT_REQUIRED";

export type LowBackAuditClassification =
  | "READY"
  | "TARGETED_CONTRACT_REQUIRED"
  | "CATALOG_KNOWLEDGE_REQUIRED"
  | "LONGITUDINAL_OWNER"
  | "UPSTREAM_SAFETY_INPUT_OWNER"
  | "OUT_OF_SCOPE_MEDICAL_DIAGNOSIS";

export interface LowBackAuditArea {
  readonly id: string;
  readonly title: string;
  readonly classification: LowBackAuditClassification;
  readonly finding: string;
  readonly minimumContract: string;
}

export const LOW_BACK_AUDIT_AREAS: readonly LowBackAuditArea[] = [
  {
    id: "safety_escalation",
    title: "Safety escalation versus pain severity",
    classification: "READY",
    finding:
      "TrainingSafetyState now carries explicit review or urgent-review authority independently of pain severity. Unresolved signals block result-level downstream readiness without changing candidate scores or manufacturing contraindications. The legacy AcuteSeverePain bridge reads only explicit urgentReviewRecommended authority, never severity alone.",
    minimumContract:
      "Normalized engine input/result contract implemented and regression-tested. Golden-product wiring remains separately PRODUCT_ADAPTER_PENDING; future execution layers must consume downstreamTrainingAllowed. Only external resolution evidence can clear a signal.",
  },
  {
    id: "region_intolerance_separation",
    title: "Region must not create mechanical intolerance",
    classification: "READY",
    finding:
      "Canonical pain matching requires an explicit shared stress tag; lumbar_spine alone creates no flexion, extension, hinge, axial-load, rotation, lateral-load, gait, or march intolerance. Region can provide generic assessment context and row-review trace context, but does not manufacture a stress fact or hard rejection.",
    minimumContract:
      "Retain regression tests proving region-only signals cannot create stress matches. Review generic region-based assessment capability adjustments separately before describing them as mechanical tolerance evidence.",
  },
  {
    id: "symptom_behavior_tolerance",
    title: "Symptom behavior and training tolerance",
    classification: "READY",
    finding:
      "TrainingResponseObservation records factual response, and the deterministic receiver now distinguishes exact, related, and identity-only applicability. Exact dose, range, load, support, and laterality remain owned by linked prescription/performance records; partial historical reports preserve unknown.",
    minimumContract:
      "Observation, linkage and owner receiver policy implemented. It routes prescription review, progression readiness and continuity without candidate scoring or automatic action.",
  },
  {
    id: "historical_injury",
    title: "Historical injury",
    classification: "READY",
    finding:
      "HistoricalInjury remains observational by doctrine and regression test. It creates no score, permanent avoidance, or mechanical intolerance. Current response observations can restore contextual relevance without altering the historical record, and successful re-exposure remains positive evidence rather than erasure.",
    minimumContract:
      "Policy implemented as non-consumption in Candidate Intelligence. Explicit restrictions remain in HardContraindication; any future historical receiver must require separate current evidence and owner review.",
  },
  {
    id: "side_distribution",
    title: "Side and distribution",
    classification: "READY",
    finding:
      "Response observations can record multiple descriptive region/side locations, while the ledger resolves realization side from linked prescriptions. Left-side evidence does not automatically apply to a right-side realization. Distribution remains descriptive and cannot create diagnosis or candidate illegality.",
    minimumContract:
      "Observation/linkage ownership implemented. Future candidate or prescription policy must still decide when side-specific evidence requests review and must preserve unknown.",
  },
  {
    id: "exercise_stress_knowledge",
    title: "Exercise stress knowledge",
    classification: "CATALOG_KNOWLEDGE_REQUIRED",
    finding:
      "Owner decisions are implemented: RDL and cable pull-through have intrinsic structured hinge exposure, false flexion/extension legacy facts are removed, and lever/row/heavy-load contexts remain potential until realization.",
    minimumContract:
      "Owner approval and behavior-equivalent structured/legacy migration remain required. Exposure metadata must never be interpreted as danger or pathology.",
  },
  {
    id: "support_prescription",
    title: "Support and prescription",
    classification: "TARGETED_CONTRACT_REQUIRED",
    finding:
      "The new support/stance schema and prescription side/support types can represent chest support, free standing, machine support, wall support, support amount, and load/support relationship. Candidate policy still defers prefer_support/increase_support without an authoritative selection-versus-prescription-versus-progression ownership rule.",
    minimumContract:
      "Use support as a contextual candidate differentiator when requested, realize exact support in prescription, record temporary response, and reduce support only through earned progression. Never make support a permanent destination from region or history alone.",
  },
  {
    id: "exercise_coverage",
    title: "Exercise coverage",
    classification: "CATALOG_KNOWLEDGE_REQUIRED",
    finding:
      "The current catalog can still provide presses, pulls, squats, hinges, single-leg, glute/hamstring, anti-extension, and anti-rotation options. It lacks production anti-lateral-flexion, controlled flexion, controlled rotation, loaded bracing, and carry/capacity rows, and supported alternatives are uneven across patterns.",
    minimumContract:
      "Add only the reviewed minimal trunk/carry tranche after the listed blockers, then run the planned whole-body candidate-pool audit for supported/unsupported diversity and progression runway rather than creating a back-pain-only routine.",
  },
  {
    id: "response_led_progression",
    title: "Response-led progression",
    classification: "READY",
    finding:
      "The response receiver integrates exact current evidence with progression readiness: tolerated may permit review, limited holds, aggravated requests regression/review, and mixed/unknown remains insufficient. Later tolerated re-exposure removes permanent-failure pressure while preserving prior history.",
    minimumContract:
      "Candidate Intelligence receiver policy implemented. It selects no axis, threshold, progression, regression, replacement or score; later composition remains responsible for any actual program change.",
  },
  {
    id: "fear_overprotection_guard",
    title: "Fear and overprotection guard",
    classification: "READY",
    finding:
      "Regression tests prove region/severity/history do not manufacture intolerance, safety escalation, permanent blocks, or support preference; explicit restrictions retain hard authority; one adverse response remains prescription-specific; and later tolerated re-exposure stays visible.",
    minimumContract:
      "Current Candidate Intelligence invariant and receiver regressions are implemented. Future composers must retain them before any program-change policy is approved.",
  },
  {
    id: "whole_body_interaction",
    title: "Whole-body interaction",
    classification: "CATALOG_KNOWLEDGE_REQUIRED",
    finding:
      "Support, trunk demand, hip demand, load, fatigue, stance, laterality, grip/carry contribution, pattern, fit, and progression runway are distributed across current contracts, but no whole-program audit has tested their combined coverage.",
    minimumContract:
      "Run the planned whole-body exercise-knowledge and candidate-pool audit after upstream safety/tolerance ownership is fixed. Do not create a mandatory back-pain section.",
  },
  {
    id: "medical_diagnosis_boundary",
    title: "Medical diagnosis boundary",
    classification: "OUT_OF_SCOPE_MEDICAL_DIAGNOSIS",
    finding:
      "Training Engine V2 consumes reported training response, restrictions, and safety/escalation evidence. It must not infer a condition from posture, pain location, distribution, form, imaging, or exercise identity.",
    minimumContract:
      "Keep diagnosis, imaging interpretation, pathology classification, medical screening, and treatment outside V2. Preserve externally reported restrictions and review requests with provenance without translating them into diagnostic claims.",
  },
] as const;

export const LOW_BACK_STRESS_REVIEW = [
  { tag: "loaded_hinge", currentRows: ["dumbbell-romanian-deadlift", "cable-pull-through"], classification: "A for reviewed hinge identities; C for row variants", finding: "One-arm row hinge remains variant-dependent potential and cannot match until prescription realization." },
  { tag: "loaded_spinal_flexion", currentRows: ["machine-abdominal-crunch"], classification: "A for controlled crunch identity", finding: "False row/RDL legacy flexion was removed; controlled machine flexion is truthful exposure, not a danger label." },
  { tag: "loaded_spinal_extension", currentRows: [], classification: "E for reviewed current identities", finding: "Possible compensation is not intrinsic intended exposure; false shoulder-press and bridge legacy facts were removed." },
  { tag: "heavy_axial_loading", currentRows: [], classification: "D", finding: "Heavy is dose-created; exercise identity alone is insufficient." },
  { tag: "loaded_trunk_rotation", currentRows: ["half-kneeling-high-to-low-cable-chop"], classification: "A plus B prescription context", finding: "Controlled loaded rotation is exposure, not danger; range, side, load and tempo remain prescription facts." },
  { tag: "lateral_trunk_loading", currentRows: ["forearm-side-plank", "suitcase-carry"], classification: "A for reviewed identities; B for supported march", finding: "Wall-march support amount keeps lateral exposure potential and needs-review." },
  { tag: "loaded_gait", currentRows: ["farmer-carry", "suitcase-carry"], classification: "A for walking carries", finding: "Requires actual gait space; stationary march does not inherit it." },
  { tag: "loaded_march", currentRows: ["wall-supported-suitcase-march"], classification: "A for stationary loaded march", finding: "Stationary stepping remains distinct from loaded gait and distance carry." },
  { tag: "long_lever_core", currentRows: [], classification: "C potential on dead bug, push-up and Pallof press", finding: "Legacy arrays were removed; variant or prescription realization owns the final exposure." },
] as const;

export const LOW_BACK_EXTERNAL_EVIDENCE = [
  {
    source: "VA/DoD Clinical Practice Guideline for the Diagnosis and Treatment of Low Back Pain",
    version: "Version 3.0, February 2022",
    url: "https://www.healthquality.va.gov/guidelines/Pain/lbp/VADoDLBPCPGFinal508.pdf",
    accessedAt: LOW_BACK_PAIN_AUDIT_FIXED_AS_OF,
    status: "ACCESSED",
    useBoundary:
      "Supports a safety path based on reported signs, symptoms, and history rather than pain score alone, and supports broad structured exercise. It does not authorize Praxis to diagnose or screen pathology.",
  },
  {
    source: "WHO guideline for non-surgical management of chronic primary low back pain in adults in primary and community care settings",
    version: "7 December 2023",
    url: "https://www.who.int/publications/i/item/9789240081789",
    accessedAt: LOW_BACK_PAIN_AUDIT_FIXED_AS_OF,
    status: "ACCESSED",
    useBoundary:
      "Supports person-centred, graded and paced activity, structured exercise, shared decisions, monitoring, and modification. It does not create exercise-row mechanical truth or numeric response thresholds.",
  },
  {
    source: "Interventions for the Management of Acute and Chronic Low Back Pain: Revision 2021",
    version: "JOSPT 51(11), 2021; DOI 10.2519/jospt.2021.0304",
    url: "https://www.orthopt.org/uploads/content_files/files/jospt.2021.0304.pdf",
    accessedAt: LOW_BACK_PAIN_AUDIT_FIXED_AS_OF,
    status: "ACCESSED",
    useBoundary:
      "Supports exercise diversity including general, aerobic, trunk strengthening/endurance, and movement-control approaches. Clinical subgrouping and treatment remain outside Training Engine V2.",
  },
] as const;

const COVERAGE_ROLES: readonly { readonly label: string; readonly roles: readonly MovementRole[] }[] = [
  { label: "horizontal pull", roles: ["horizontal_pull"] },
  { label: "vertical pull", roles: ["vertical_pull"] },
  { label: "squat", roles: ["squat"] },
  { label: "hinge", roles: ["hinge"] },
  { label: "single-leg", roles: ["single_leg"] },
  { label: "trunk anti-extension", roles: ["anti_extension_core"] },
  { label: "anti-rotation", roles: ["anti_rotation_core"] },
  { label: "anti-lateral-flexion", roles: ["anti_lateral_flexion_core"] },
  { label: "controlled flexion", roles: ["trunk_flexion"] },
  { label: "controlled rotation", roles: ["trunk_rotation"] },
  { label: "loaded bracing", roles: ["loaded_bracing"] },
  { label: "carries/capacity", roles: ["carry"] },
  { label: "upper-body pressing", roles: ["horizontal_push", "vertical_push"] },
];

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function buildLowBackPainTrainingIntelligenceAuditData() {
  const coverage = COVERAGE_ROLES.map((target) => ({
    label: target.label,
    exerciseIds: REFERENCE_EXERCISES.filter((exercise) =>
      target.roles.some((role) => exercise.movementRoles.includes(role)),
    ).map((exercise) => exercise.id),
  }));
  const fingerprints = buildCurrentTrunkCurationFingerprints();
  const support = buildSupportAndStanceMechanicsContractData();
  const phase = buildPhaseAnnotationContextReviewData();
  const safetyAndResponse = buildTrainingSafetyAndResponseFoundationData();
  const stableAdaptive = buildStableAdaptiveProgrammingPolicyData();
  const payload = {
    areas: LOW_BACK_AUDIT_AREAS,
    stressReview: LOW_BACK_STRESS_REVIEW,
    coverage,
    externalEvidence: LOW_BACK_EXTERNAL_EVIDENCE,
    behaviorFingerprints: fingerprints,
    supportFingerprint: support.fingerprint,
    phaseFingerprint: phase.contextualFingerprint,
    safetyFingerprint: safetyAndResponse.safetyFingerprint,
    responseFingerprint: safetyAndResponse.responseFingerprint,
    responseReceiverFingerprint: stableAdaptive.responseReceiverFingerprint,
    stableAdaptivePolicyFingerprint: stableAdaptive.policyFingerprint,
    rowStressCurationFingerprint: stableAdaptive.stressFingerprint,
    phaseCalibrationConsequences: safetyAndResponse.phaseCalibrationConsequences,
  };

  return {
    fixedAsOf: LOW_BACK_PAIN_AUDIT_FIXED_AS_OF,
    overallClassification: LOW_BACK_PAIN_AUDIT_OVERALL_CLASSIFICATION,
    readyToIntelligentlyTrainAroundReportedLowBackPain: false as const,
    areas: LOW_BACK_AUDIT_AREAS,
    stressReview: LOW_BACK_STRESS_REVIEW,
    coverage,
    externalEvidence: LOW_BACK_EXTERNAL_EVIDENCE,
    behaviorFingerprints: fingerprints,
    supportFingerprint: support.fingerprint,
    phaseFingerprint: phase.contextualFingerprint,
    safetyFingerprint: safetyAndResponse.safetyFingerprint,
    responseFingerprint: safetyAndResponse.responseFingerprint,
    responseReceiverFingerprint: stableAdaptive.responseReceiverFingerprint,
    stableAdaptivePolicyFingerprint: stableAdaptive.policyFingerprint,
    rowStressCurationFingerprint: stableAdaptive.stressFingerprint,
    safetyAndResponseFingerprint: safetyAndResponse.combinedFingerprint,
    phaseCalibrationConsequences: safetyAndResponse.phaseCalibrationConsequences,
    blockersBeforeSevenRows: ["None. Exactly seven owner-approved rows are implemented in the canonical production catalog."],
    blockersBeforeWholeBodyAudit: [
      "No technical blocker prevents the separately requested review-only whole-body audit.",
      "Review the three unexplained contextual-phase winner changes before authorizing the deferred whole-body audit; this task does not start that audit.",
    ],
    exactNextDependency:
      "Review the three unexplained contextual-phase winner changes (two controlled scenarios and one golden persona); keep legacy phase scoring authoritative until a revised contextual policy passes the semantic gate.",
    fingerprint: hash(payload),
  };
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function list(values: readonly string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

export function renderLowBackPainTrainingIntelligenceAudit(
  data = buildLowBackPainTrainingIntelligenceAuditData(),
): string {
  return [
    "# Low-Back Pain Training Intelligence Audit",
    "",
    `Fixed review time: \`${data.fixedAsOf}\`.`,
    "",
    `Overall classification: **${data.overallClassification}**.`,
    "",
    "## Boundary",
    "",
    "Training Engine V2 consumes normalized training, response, restriction, and safety-escalation evidence. It does not diagnose low-back conditions, interpret imaging, infer pathology from posture or pain location, or prescribe medical treatment. This is a review-only audit; it adds no screening questionnaire, disease classifier, pain threshold, exercise row, Session Composer, or Week Composer.",
    "",
    "## Readiness Answer",
    "",
    "At candidate scope, the reviewed pain/stress, safety, response, support, and seven-row catalog contracts are implemented. Full-program low-back-aware training remains incomplete because Session/Week Composer and product adapter consumption are outside this task. Contextual phase scoring also remains legacy-authoritative after the new policy failed its semantic activation gate.",
    "",
    "## Classification Summary",
    "",
    table(
      ["Area", "Classification", "Finding", "Minimum contract"],
      data.areas.map((area) => [area.title, area.classification, area.finding, area.minimumContract]),
    ),
    "",
    "## Safety Escalation Versus Pain Severity",
    "",
    "`TrainingSafetyState` now accepts explicit review or urgent-external-review authority independently of pain severity. `TrainingReadinessTrace` reports whether downstream ordinary training is allowed, the unresolved and externally resolved signal IDs, full authority/provenance, and the required review level. Candidate ranking still runs for diagnostics and is unchanged; unresolved authority gates only result-level downstream execution. The engine never clears a signal because time passed or symptoms changed.",
    "",
    "For backward compatibility, `AcuteSeverePain.urgentReviewRecommended=true` is explicitly bridged into global readiness as legacy urgent authority. The bridge condition is the boolean authority field, not severity 7-10. High severity with the flag false creates no independent safety escalation and no diagnosis.",
    "",
    "`HardContraindication` remains the correct authority for explicit athlete/clinician/coach/safety restrictions on known exercises, roles, or stresses. It should not be overloaded as the only general review signal, and this task does not create a medical screening questionnaire.",
    "",
    "## Region And Mechanical Intolerance",
    "",
    "Canonical candidate pain matching joins explicit reported stress tags to explicit exercise stress facts. Region is copied into trace evidence but does not create a stress tag. A lumbar-only report with no stress evidence therefore creates none of the listed mechanical intolerances. Generic assessment code can use same-region pain as context for a small capability adjustment, and horizontal-row review traces can expose chest support in a lumbar context; neither pathway creates a specific motion intolerance or hard rejection. Keep both under regression test.",
    "",
    "## Historical Injury",
    "",
    "`HistoricalInjury` remains deliberately inert in Candidate Intelligence. Resolved, managed, or recurring history creates no score, mechanical intolerance, or permanent avoidance by itself. Current response evidence can make the context relevant again without modifying history. Successful re-exposure is positive evidence rather than deletion. Explicit restrictions belong in `HardContraindication`, with source authority preserved.",
    "",
    "## Side And Distribution",
    "",
    "Training response observations preserve multiple descriptive region/side locations. Exact movement, load, support, and starting side remain owned by the linked prescription. Ledger queries resolve side through that source of truth, so left-side exposure evidence does not automatically apply to a right-side realization. Distribution is descriptive only and is never translated into a diagnosis or candidate prohibition.",
    "",
    "## Exercise Stress Knowledge",
    "",
    "A stress tag describes exposure, not pathology, harm, or contraindication. Scope is row-specific; the same vocabulary item can be intrinsic for one identity and variant-dependent for another.",
    "",
    table(
      ["Stress", "Current production rows", "A-E classification", "Finding"],
      data.stressReview.map((row) => [row.tag, list(row.currentRows), row.classification, row.finding]),
    ),
    "",
    "## Support And Prescription",
    "",
    "The implemented support/stance model can distinguish chest-supported and unsupported rows, machine and free-standing setups, task-changing wall support, half-kneeling, and load/support relationship. Prescription can separately own support level/surface, range, load, and side. Candidate selection should use explicit preference/tolerance evidence; prescription should realize the exact support and dose; response tracking should decide whether it helped; progression may reduce support when earned. Region alone must not choose permanent support.",
    "",
    "## Candidate Coverage",
    "",
    table(
      ["Need", "Current production candidates"],
      data.coverage.map((row) => [row.label, list(row.exerciseIds)]),
    ),
    "",
    "The catalog now includes truthful production options for anti-lateral flexion, controlled flexion and rotation, loaded bracing, walking carries, and a stationary supported loaded march. They improve candidate diversity without creating a mandatory slot, workout-length policy, substitution, or progression behavior.",
    "",
    "## Response-Led Progression",
    "",
    "The intended doctrine remains: appropriate task -> tolerable starting prescription -> repeatable form -> observed symptom/performance response -> maintain or modify -> earned progression -> broader capacity. TrainingResponseObservation records tolerance, symptom change, onset, persistence, completion/modification consequence, locations, and provenance. ExercisePerformanceRecord references observation IDs; the completed prescription remains source of truth for dose, range, load, support, and side.",
    "",
    "The deterministic receiver classifies exact, related and identity-only evidence. Current tolerated evidence may permit progression review; limited evidence holds/monitors; aggravated evidence requests regression or review; mixed/unknown evidence stays insufficient. It preserves earlier adverse and later tolerated re-exposure, but selects no axis, threshold, progression, replacement or ban.",
    "",
    "## Fear And Overprotection Guard",
    "",
    "Praxis must preserve the middle path: no universal ban on lumbar bending, hinging, loading, gait, or rotation; no universal core routine; no implication that pain or posture proves damage; and no instruction to ignore symptoms or load regardless of response. Support and reduced exposure are temporary tools when evidence supports them, with re-exposure and broader capacity available when earned.",
    "",
    "The regression matrix now proves region-only, severity-only, historical injury, one adverse exposure, symptom side, and notes cannot manufacture global intolerance or permanent exercise identity behavior. Explicit hard restrictions retain their existing authority.",
    "",
    "## Phase Calibration Consequences",
    "",
    "Owner-approved contextual annotations and the annotation-only low-churn shape are implemented for dual-run inspection. Production remains legacy because three winner changes lacked accepted contextual phase evidence on the new winner; no continuity winner changed, unknown/no-match stays omitted, and the contextual scorer remains explicit and non-default.",
    "",
    table(
      ["Policy", "Category spacing", "Phase weight", "Winner changes", "Close-order changes", "Continuity disruptions", "Unknown evidence", "Accepted poor", "Representative Phase 1/2/3 effects"],
      data.phaseCalibrationConsequences.map((row) => [
        row.policyId,
        row.categorySpacing,
        row.phaseFamilyWeight,
        String(row.winnerChanges),
        String(row.closeOrderChanges),
        String(row.continuityDisruptions),
        row.unknownEvidenceBehavior,
        row.acceptedPoorBehavior,
        row.representativePhaseEffects,
      ]),
    ),
    "",
    "## Whole-Body Interaction",
    "",
    "Low-back-sensitive programming must emerge from the whole program. The future whole-body audit needs to compare support, trunk and hip demand, loading, fatigue, stance, laterality, grip/carry contribution, movement pattern, fit, and progression runway. It should not create a mandatory back-pain section.",
    "",
    "## External Evidence Boundary",
    "",
    table(
      ["Source", "Version", "Status", "URL", "Use boundary"],
      data.externalEvidence.map((source) => [source.source, source.version, source.status, source.url, source.useBoundary]),
    ),
    "",
    "These clinician-facing guidelines inform safety boundaries, exercise-program principles, and uncertainty only. They do not establish diagnosis logic, exercise-row stress truth, arbitrary pain thresholds, or medical treatment in Praxis. Guidance version and access date are recorded because recommendations can change.",
    "",
    "## Seven Production Row Status",
    "",
    ...data.blockersBeforeSevenRows.map((blocker) => `- ${blocker}`),
    "",
    "## Blockers Before Whole-Body Audit",
    "",
    ...data.blockersBeforeWholeBodyAudit.map((blocker) => `- ${blocker}`),
    "",
    "## Fingerprints",
    "",
    table(
      ["Artifact", "Fingerprint", "Behavior meaning"],
      [
        ["Production ranking", data.behaviorFingerprints.productionRanking, "Intentionally changed by approved catalog/stress truth"],
        ["Comprehensive behavior", data.behaviorFingerprints.comprehensiveBehavior, "Intentionally changed by approved catalog/stress truth"],
        ["Reference catalog", data.behaviorFingerprints.referenceCatalog, "Intentionally changed by seven rows and focused migrations"],
        ["Support/stance contract", data.supportFingerprint, "Intentionally changed by implementation"],
        ["Contextual phase laboratory", data.phaseFingerprint, "Resolver/trace contract implementation"],
        ["Training safety", data.safetyFingerprint, "Independent global readiness contract"],
        ["Training response", data.responseFingerprint, "Exposure-linked observation and ledger contract"],
        ["Response receiver", data.responseReceiverFingerprint, "Applicability, prescription-first routing, progression and continuity policy"],
        ["Stable-adaptive policy", data.stableAdaptivePolicyFingerprint, "Continuity doctrine and selected contextual phase policy"],
        ["Focused row stress curation", data.rowStressCurationFingerprint, "Current low-back-relevant migration decisions"],
        ["Safety/response combined", data.safetyAndResponseFingerprint, "Training intelligence foundation"],
        ["Low-back audit", data.fingerprint, "Deterministic review artifact"],
      ],
    ),
    "",
    "## Exact Next Dependency",
    "",
    data.exactNextDependency,
    "",
  ].join("\n");
}

export function writeLowBackPainTrainingIntelligenceAudit(
  rootDir = process.cwd(),
): { readonly outputPath: string; readonly data: ReturnType<typeof buildLowBackPainTrainingIntelligenceAuditData> } {
  const data = buildLowBackPainTrainingIntelligenceAuditData();
  const outputPath = join(
    rootDir,
    "docs/training-engine-v2/LOW_BACK_PAIN_TRAINING_INTELLIGENCE_AUDIT.md",
  );
  writeFileSync(outputPath, renderLowBackPainTrainingIntelligenceAudit(data));
  return { outputPath, data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writeLowBackPainTrainingIntelligenceAudit();
  console.log(`Wrote ${result.outputPath}`);
  console.log(JSON.stringify({
    classification: result.data.overallClassification,
    safetyFingerprint: result.data.safetyFingerprint,
    responseFingerprint: result.data.responseFingerprint,
    combinedFingerprint: result.data.safetyAndResponseFingerprint,
    auditFingerprint: result.data.fingerprint,
  }, null, 2));
}
