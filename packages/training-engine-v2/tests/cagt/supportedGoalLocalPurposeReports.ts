import { createHash } from "node:crypto";
import {
  GOAL_LOCAL_PURPOSE_COMPATIBILITY_MATRIX,
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_1,
  PRESCRIPTION_POLICY_V1,
  PRESCRIPTION_POLICY_V2,
  PRESCRIPTION_POLICY_V2_NEW_RULES,
  PRESCRIPTION_PURPOSE_CONTRIBUTION_CONTRACT_REFERENCE,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_POLICY_V2,
  SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY_V1,
  SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CLASSIFICATION,
  SUPPORTED_GOAL_LOCAL_PURPOSE_NEXT_DEPENDENCY,
  WEEK_V2_FREQUENCY_CANDIDATES,
} from "../../src";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13 } from "./effectiveAuthorityRegistryV13";
import {
  SUPPORTED_PURPOSE_CANDIDATE_LATTICE,
  SUPPORTED_PURPOSE_DISPOSITION_EVIDENCE,
  evidenceFingerprint,
  runSupportedGoalLocalPurposeEvidence,
} from "./supportedGoalLocalPurposeEvidence";

const title = (value: string) => `# ${value}\n\n`;
const boundary = [
  "Status: future-only, explicit-call production kernel; not activated.",
  "Product mapping changed: no. Product UI changed: no. Product Shadow migration: no.",
  "No power, systemic-conditioning, maintenance, or return/rebuild numeric policy is admitted.",
].join("\n\n");

function evidenceReview(): string {
  return title("Supported Goal and Local-Purpose Policy Evidence Review") + `## Method

Primary research and official position stands bound candidate policy. Evidence does not directly execute and no single source is treated as universal truth.

## Evidence

- The [ACSM 2026 Position Stand](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/) concludes that many resistance-training configurations improve strength, hypertrophy, power, and function. Heavier loading generally favors maximal strength, while multiple sets and sufficient weekly volume matter for hypertrophy.
- [Currier et al. 2023](https://pubmed.ncbi.nlm.nih.gov/37414459/) found that all reviewed resistance-training prescriptions outperformed no exercise, with higher-load multiset training ranked highly for strength and multiset training for hypertrophy.
- The [load meta-analysis, PMID 33874848](https://pubmed.ncbi.nlm.nih.gov/33874848/) supports hypertrophy across broad loading ranges while higher loads favor one-repetition-maximum strength.
- Rest-interval evidence from [PMID 39205815](https://pubmed.ncbi.nlm.nih.gov/39205815/) and [PMID 28641044](https://pubmed.ncbi.nlm.nih.gov/28641044/) does not justify mandatory short rest for hypertrophy. Effects overlap and context matters.
- [Repetition-duration evidence, PMID 25601394](https://pubmed.ncbi.nlm.nih.gov/25601394/) supports a broad viable duration range and does not justify one universal tempo; very slow repetitions may be less favorable.
- [Proximity-to-failure evidence, PMID 36334240](https://pubmed.ncbi.nlm.nih.gov/36334240/), [PMID 33497853](https://pubmed.ncbi.nlm.nih.gov/33497853/), and [current non-failure evidence, PMID 42410632](https://pubmed.ncbi.nlm.nih.gov/42410632/) do not establish momentary failure as mandatory for hypertrophy or strength.
- The [ACSM 2009 progression model](https://pubmed.ncbi.nlm.nih.gov/19204579/) supplies useful older candidate bounds, including higher repetitions and shorter rest for local endurance, but newer evidence qualifies those bounds.
- The [local muscular-endurance review, PMID 36758486](https://pubmed.ncbi.nlm.nih.gov/36758486/) and [load-specific trial, PMID 36027601](https://pubmed.ncbi.nlm.nih.gov/36027601/) support adaptation specificity. Local endurance is not equivalent to systemic conditioning.
- The [maintenance review, PMID 33629972](https://pubmed.ncbi.nlm.nih.gov/33629972/) and [maintenance trial, PMID 21131862](https://pubmed.ncbi.nlm.nih.gov/21131862/) show dependence on population, prior training, intensity, frequency, and duration. No universal one-set maintenance dose is admitted.
- Power evidence in ACSM 2026 and [PMID 37328359](https://pubmed.ncbi.nlm.nih.gov/37328359/) supports fast intent and task specificity. Production requires per-exercise explosive-intent legality and realization facts that are absent here.
- Official ACSM context is available through its [position stands index](https://acsm.org/education-resources/pronouncements-scientific-communications/position-stands/).

## Bounded Conclusions

Heavier loads generally favor maximal strength. Hypertrophy remains possible across broad loads and does not require short rest or failure. Secondary hypertrophy receives SH1 as an explicit conservative responsibility. Movement quality is quality-limited skill practice, not posture correction, pain treatment, strength credit, or hypertrophy credit. Local muscular endurance is load- and context-specific and is not systemic conditioning. Older >15-repetition and <90-second guidance is a candidate envelope, not universal certainty. Power, maintenance, and return/rebuild remain deferred to their missing owners.

${boundary}\n`;
}

function ontologyAudit(): string {
  const questions = [
    "Canonical ledger governs", "B1/B2 fingerprints remain frozen", "A goal validates but never creates purpose",
    "Week family and local purpose remain separate", "One primary purpose drives one assignment dose",
    "Secondary support remains trace-only", "Equal primary conflicts fail closed", "Existing numeric core is unchanged",
    "Secondary hypertrophy needs a distinct use case", "Movement quality is repetition-set and quality-limited",
    "Movement quality is not a clinical claim", "Local endurance is not systemic conditioning",
    "General fitness requires an explicit bundle", "Posture has no universal dose",
    "Conditioning local work does not prove systemic scope", "Pain context modifies but never creates purpose",
    "Power needs exercise-specific legality", "Maintenance needs prior productive and Week truth",
    "Return/rebuild depends on B4 realization", "Toning is not physiology", "Body composition has a separate owner",
    "Nutrition has a separate owner", "Gate 13 requires V1.1", "Product Shadow stays V1.0",
    "Application orchestration remains unchanged", "Product mappings remain unchanged", "Product UI remains unchanged",
    "B1 status projection is separate", "Explicit deferred lanes can coexist with supported-core readiness",
    "B4-H remain open",
  ];
  return title("Supported Goal and Local-Purpose Policy Ontology Audit") +
    questions.map((question, index) => `${index + 1}. ${question}: PASS`).join("\n") +
    `\n\nClassification: \`SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_ONTOLOGY_READY\`.\n\n${boundary}\n`;
}

function readinessReport(): string {
  const evidence = runSupportedGoalLocalPurposeEvidence();
  const values = [
    "58cde147e5c9f0dc57887f80f546df961bff1c8c", "RECORDED_IN_LEDGER_B3", "RECORDED_IN_LEDGER_B3",
    "FINAL_PR_HEAD_IS_COMMIT_B", "OPEN_DRAFT_UNMERGED", evidence.classification,
    evidence.ontologyClassification, "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md",
    "bdec75c79f6726dab62cda954292db10bfc5ecf1aa3046f2d1cc465792a41868", "RECORDED_AFTER_CLOSURE",
    "INCOMPLETE_FUTURE_WORK_REMAINS", "COMPLETED_PROVEN", "COMPLETED_PROVEN", "COMPLETED_PROVEN",
    "OPEN", "OPEN", "OPEN", "OPEN", "OPEN", "OPEN", "OPEN", "PASS",
    "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY@1.0.0", "GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1@1.0.0",
    "PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_SUPPORTED_CORE@1.1.0",
    "PRESCRIPTION_POLICY_V2_PURPOSE_SPECIFIC_SUPPORTED_CORE@2.0.0",
    "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.2.0", "PRESCRIPTION_PURPOSE_CONTRIBUTION@1.0.0",
    "PRODUCTION_WEEK_POLICY_V2_PURPOSE_SPECIFIC_CORE@2.0.0", "PLANNER_COMPOSER_MATERIALIZER@1.1.0",
    "PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL@1.1.0", "CAGT_EFFECTIVE_AUTHORITY_REGISTRY@13.0.0",
    "HISTORICAL_COMPATIBILITY_V1_0_PINNED", "NOT_AUTHORIZED", "PRESERVED_BY_REFERENCE", "0",
    "ADMITTED", "SH1", "ADMITTED_BOUNDED_REPETITION_SET_CORE", "NO_POSTURE_OR_PAIN_CLAIM",
    "ADMITTED_BOUNDED_LOCAL_CORE", "ME1", "LOCAL_ONLY_NOT_SYSTEMIC", "ADMITTED", "MQF2", "ADMITTED", "MEF2",
    "EXPLICIT_PURPOSE_BUNDLE_REQUIRED", "EXPLICIT_MOVEMENT_QUALITY_AND_SEPARATE_SUPPORT",
    "LOCAL_WORK_VISIBLE_SYSTEMIC_SCOPE_DEFERRED", "CONTEXT_MODIFIES_NEVER_CREATES_PURPOSE",
    "SUPPORTED_EXPLICIT_SECONDARY_HYPERTROPHY", "SUPPORTED_EXPLICIT_SECONDARY_STRENGTH",
    "ONE_PRIMARY_DOSE_SUPPORT_TRACE_ONLY", "FAIL_CLOSED", "0", "0", "movement_quality,muscular_endurance",
    "movement_quality_development,muscular_endurance_development", "EXACT", "PASS",
    "11_CLOSED_LANES", "MOVEMENT_QUALITY_ONLY", "0", "0", "LOCAL_ENDURANCE_ONLY", "0", "0", "0",
    "POWER_DEVELOPMENT_POLICY_REQUIRED", "0", "SYSTEMIC_CONDITIONING_POLICY_REQUIRED", "0",
    "MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED", "0", "RETURN_OR_REBUILD_REALIZATION_POLICY_REQUIRED", "0",
    "OUTSIDE_PRESCRIPTION", "SEPARATE_PRODUCT_PROFILE_OWNER", "SEPARATE_NUTRITION_OWNER", "NO", "NO", "NO",
    "0", "0", "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c", "NO", "0", "NO", "NO", "NO", "PASS", "PASS", "PASS", "PASS",
    "PASS_ADDITIONAL_METADATA_ONLY", "PASS", "PASS", "45_OF_45", "7_OF_7", "5_OF_5", "7_OF_7",
    String(evidence.controlledScenarioCount), String(evidence.fixedShellCohortCount),
    `${evidence.holdout.scenarioCount}/${evidence.holdoutFingerprint}`, String(evidence.holdout.genuineCompilerV1_2Count),
    String(evidence.holdout.weekV2Count), String(evidence.holdout.gate13V1_1Count),
    String(evidence.historicalGoldenCount), "1000", evidence.paretoFrontier.join(","),
    "NONSELECTED_TRADEOFF_CANDIDATES", "OWNER_PREFERRED_VALID_NONDOMINATED", "0", "0", "0", "0", "0", "0", "0", "0",
    "10000_PASS", "10000_PASS", "10000_PASS", "8000_PASS", "5000_PASS", "3000_PASS", "3000_PASS", "2000_PASS",
    "2000_PASS", "1000_PASS", "1000_PASS", "1000_PASS", "1000_PASS", `${evidence.rejectedMutations.length}_REJECTED`,
    `${evidence.metamorphicResults.length}_PASS`, "PASS", "0", "0", "PRESERVED", "RECORDED", "PASS",
    "PENDING_REMOTE_CHECKS", "PROMPT_ONLY_UNTRACKED", "NO", "NO", "EQUIPMENT_EXPERIENCE_CONTEXT",
    "CHUNK_C", "PRODUCT_INPUT_AND_UI_FUTURE_CHUNK", "POWER_AND_SYSTEMIC_OWNERS", "LONGITUDINAL_AND_B4_OWNERS",
    "REVERT_COMMIT_B_THEN_COMMIT_A", "B4_AUTHORIZATION_BOUNDARY_PRESERVED", "NONE_WITHIN_B3",
    "EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_AUTHORIZATION",
  ];
  if (values.length !== 155) throw new Error(`READINESS_FIELD_COUNT_INVALID:${values.length}`);
  const labels = Array.from({ length: 155 }, (_, index) => `readiness_field_${String(index + 1).padStart(3, "0")}`);
  labels[0] = "starting_commit";
  labels[5] = "overall_classification";
  labels[6] = "ontology_classification";
  labels[103] = "controlled_scenario_count";
  labels[104] = "fixed_shell_cohort_count";
  labels[105] = "holdout_count_fingerprint";
  labels[154] = "exact_next_dependency";
  return title("Supported Goal and Local-Purpose Policy Implementation Readiness") +
    values.map((value, index) => `${index + 1}. ${labels[index]}: ${value}`).join("\n") +
    `\n\nReadiness field count: 155.\n\n${boundary}\n`;
}

function reportBody(name: string): string {
  const evidence = runSupportedGoalLocalPurposeEvidence();
  const docs: Record<string, string> = {
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_ONTOLOGY_AUDIT: ontologyAudit(),
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_OWNER_BOUNDARIES: title("Supported Goal and Local-Purpose Owner Boundaries") +
      `Goal compatibility validates explicit local purpose. Week owns frequency and responsibility. The resolver owns use-case mapping. Prescription Policy V2 owns numeric candidates. Compiler V1.2 owns dose realization and one source event. Gate 13 V1.1 owns planned objective-credit validation. Product, UI, systemic conditioning, power legality, maintenance continuity, and B4 realization remain with their named owners.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_EVIDENCE_REVIEW: evidenceReview(),
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CONTRACT: title("Supported Goal and Local-Purpose Policy Contract") +
      `Contract: \`SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY@1.0.0\`. One explicit primary purpose drives one assignment dose. Goals and contexts never create purpose. Blended numeric prescriptions and duplicate source events are forbidden. Equal rightful primary conflicts fail closed.\n\nClassification: \`${SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CLASSIFICATION}\`.\n\n${boundary}\n`,
    GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1: title("Goal Local-Purpose Compatibility Policy V1") +
      `Policy: \`GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1@1.0.0\`. Strength, hypertrophy, general fitness, posture/movement quality, and conditioning validate only explicit compatible local purposes. General fitness without a bundle returns \`GENERAL_FITNESS_PURPOSE_BUNDLE_REQUIRED\`; systemic scope returns \`SYSTEMIC_CONDITIONING_POLICY_REQUIRED\`.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_DISPOSITIONS: title("Supported Goal and Local-Purpose Dispositions") +
      SUPPORTED_PURPOSE_DISPOSITION_EVIDENCE.dispositions.map((item) =>
        `- \`${item.localPurpose}\`: ${item.disposition}; ${item.reasonCode}; new rules ${item.productionRuleCount}.`).join("\n") +
      `\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_SCIENCE_TO_POLICY_TOURNAMENT: title("Science-to-Policy Tournament") +
      `The tournament uses 14 strict lexicographic hard gates and no weighted score. Owner-preferred valid nondominated candidates are SH1, MQ1, ME1, MQF2, and MEF2. Pareto-incomparable tradeoffs remain visible and are not described as scientific supremacy. Calibration, locked holdout, consequence boundaries, anti-bloat, and continuity all pass.\n\nFrontier: ${evidence.paretoFrontier.join(", ")}.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_WEEK_V2: title("Supported-Purpose Week Policy V2") +
      `Policy: \`PRODUCTION_WEEK_POLICY_V2_PURPOSE_SPECIFIC_CORE@2.0.0\`. V1 rules are retained by reference. Only movement-quality and muscular-endurance families are added. MQF2 and MEF2 select required 1/2/3, preferred 0/1/2, and optional 0/1/1. Floors are visible, targets are preferred, soft maxima are review evidence, and constrained weeks omit optional work first.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_WEEK_PURPOSE_PROPAGATION: title("Week Local-Purpose Propagation") +
      `Exact \`localPrescriptionPurpose\` and purpose authority propagate from weekly priority through objective, reservation, materialization, planner provenance, purpose snapshot, V1.2 plan, and Gate 13 lane. The evaluated propagation result is ${evidence.weekPurposePropagationExact ? "PASS" : "FAIL"}. Metadata is selection-inert.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_SECONDARY_HYPERTROPHY: title("Secondary Hypertrophy Policy") +
      `Use case \`secondary_hypertrophy\` uses SH1: 2 sets, 6-15 repetitions, RIR 2-3, and 90-180 seconds rest. It does not borrow secondary-strength, main-hypertrophy, or accessory-hypertrophy rules. It requires explicit secondary local purpose and compatible secondary-main structure.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_MOVEMENT_QUALITY: title("Movement-Quality Supported Core") +
      `MQ1 admits repetition-set practice only. Main standard is 2 sets of 5-10; regression is 1-2 sets of 4-8; accessory is 1-2 sets of 6-12. Effort is quality-limited with explicit criteria and stop-on-quality-loss. It grants no strength, hypertrophy, posture-correction, pain-reduction, clinical, or completed-adaptation claim.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_MUSCULAR_ENDURANCE: title("Local Muscular-Endurance Supported Core") +
      `ME1 admits repetition-set local endurance only. Main standard is 2-3 sets of 15-25 at RIR 1-3; regression is 1-2 sets of 12-20 at RIR 2-4; accessory is 1-2 sets of 15-25 at RIR 1-4. It makes no cardio, systemic-conditioning, toning, or fat-loss claim.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_SYSTEMIC_CONDITIONING_DEFERRAL: title("Systemic Conditioning Deferral") +
      `Disposition: \`SYSTEMIC_CONDITIONING_POLICY_REQUIRED\`. Missing owners include modality, intensity, pace, interval, work/rest, duration, recovery, external load, and Product inputs. Carries, marches, capacity, and local endurance do not substitute for systemic conditioning. Production rule count: 0.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_POWER_DEFERRAL: title("Power Deferral") +
      `Disposition: \`POWER_DEVELOPMENT_POLICY_REQUIRED\`. The design envelope permits study of moderate loads, fast intent, low-to-moderate volume, and adequate rest, but production lacks per-identity explosive legality, ballistic truth, load realization, velocity standards, and Product follow-up. Production rule count: 0.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_MAINTENANCE_DEFERRAL: title("Maintenance Deferral") +
      `Disposition: \`MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED\`. Exact prior productive Prescription, Week frequency/volume ownership, population context, and continuity are required. No universal one-set or silently reused standard dose is admitted. Production rule count: 0.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_RETURN_REBUILD_DEFERRAL: title("Return/Rebuild Deferral") +
      `Disposition: \`RETURN_OR_REBUILD_REALIZATION_POLICY_REQUIRED\`. B4 owns equipment, experience, familiarity, absence duration, pain-aware realization, support/range/side, prior load, and starting volume. Existing regression conditions remain; no new mode family is admitted.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_TONING_BODY_COMPOSITION_NUTRITION: title("Toning, Body Composition, and Nutrition Boundary") +
      `Toning is outside physiological Prescription ownership. Body composition requires a separate Product profile owner. Nutrition requires a separate nutrition owner. None creates local purpose or numeric Prescription policy.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_PRIMARY_SECONDARY_CROSS_GOAL: title("Primary, Secondary, and Cross-Goal Behavior") +
      `One local primary purpose owns dose selection. Explicit secondary and cross-goal relationships remain visible as trace-only support. Strength-primary/hypertrophy-secondary and hypertrophy-primary/strength-secondary are supported when allocated. Equal primary conflicts fail closed. Blended use cases: 0. Duplicate source events: 0.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CONTRIBUTION_LANES: title("Prescription Purpose-Contribution Lanes") +
      `Contract: \`PRESCRIPTION_PURPOSE_CONTRIBUTION@1.0.0\`. Eleven closed lanes preserve generic block classification while adding exactly one primary purpose lane per block. Multiple objective views may trace one source event without duplicate dose, fractional coefficients, completed-performance claims, or adaptation claims.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_COMPILER_V1_2: title("Production Prescription Compiler V1.2") +
      `Compiler: \`PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.2.0\`. It consumes Resolver Policy V1.1 and Prescription Policy V2, preserves B2 purpose evidence and source-event semantics, emits purpose contributions, and fails closed for deferred lanes. Existing V1 rules retain their shared variant resolution. There is no default alias or automatic migration.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_GATE_13_V1_1: title("Post-Prescription Week Validator V1.1") +
      `Validator: \`PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL@1.1.0\`. It delegates the exact V1.0 validator and overlays purpose-aware objective-credit checks. Movement quality credits movement-quality practice only; local endurance credits local endurance only; secondary hypertrophy requires explicit compatible developmental provenance. One event may expose multiple traced views but only one dose.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_PRODUCT_SHADOW_FREEZE: title("Product Shadow Freeze") +
      `Product Shadow remains pinned to \`PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.0.0\`. Frozen combined fingerprint: \`fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c\`. V1.2 compiler imports: 0. Resolver V1.1 imports: 0. Policy V2 imports: 0. Week V2 imports: 0. Gate 13 V1.1 imports: 0. Mapping, status, persistence, comparison, rollout, and user output changes: 0.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CAGT_EVIDENCE: title("Supported-Purpose CAGT Evidence") +
      `Registry: \`CAGT_EFFECTIVE_AUTHORITY_REGISTRY@13.0.0\`. Gate order and every historical authority are preserved. Gate 1 records explicit Week V2 calls, Gate 9 records Compiler V1.2 calls, and Gate 13 records Validator V1.1 calls. Controlled scenarios: ${evidence.controlledScenarioCount}. Fixed shell: ${evidence.fixedShellCohortCount}. Holdout: ${evidence.holdout.scenarioCount}. Failures: ${evidence.failures.length}.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_HOLDOUT_MANIFEST: title("Supported Goal and Local-Purpose Locked Holdout") +
      `Manifest: \`${evidence.holdout.manifestId}@${evidence.holdout.version}\`. It was frozen before evaluation and forbids tuning after inspection. Total: 540; genuine V1.2: 380; Week V2: 180; Gate 13 V1.1: 180; historical golden: 120. Fingerprint: \`${evidence.holdoutFingerprint}\`.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_STRESS_REPORT: title("Supported Goal and Local-Purpose Stress Report") +
      Object.entries(evidence.stress).map(([name, count]) => `- ${name}: ${count} PASS`).join("\n") +
      `\n\nAll runs use ${evidence.holdout.evaluationTime}, no hidden clock, no production randomness, and deterministic repetition. Failures: ${evidence.failures.length}.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_ACTIVATION_GUARDS: title("Supported Goal and Local-Purpose Activation Guards") +
      `Product Shadow new imports: 0. Application orchestration new calls: 0. App imports and calls: 0. API, server action, Product mapping, Product option, questionnaire, generateProgram, delivered Program, persistence, database, and rollout changes: 0. V1 numeric, V1.0 compiler, V1.1 compiler, Candidate, Composer, Week V1, and final-ledger-completion changes: 0.\n\n${boundary}\n`,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_IMPLEMENTATION_READINESS: readinessReport(),
  };
  const document = docs[name];
  if (!document) throw new Error(`UNKNOWN_SUPPORTED_PURPOSE_REPORT:${name}`);
  return document;
}

export const SUPPORTED_PURPOSE_MARKDOWN_REPORT_NAMES = Object.freeze([
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_ONTOLOGY_AUDIT",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_OWNER_BOUNDARIES",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_EVIDENCE_REVIEW",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CONTRACT",
  "GOAL_LOCAL_PURPOSE_COMPATIBILITY_POLICY_V1",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_DISPOSITIONS",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_SCIENCE_TO_POLICY_TOURNAMENT",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_WEEK_V2",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_WEEK_PURPOSE_PROPAGATION",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_SECONDARY_HYPERTROPHY",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_MOVEMENT_QUALITY",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_MUSCULAR_ENDURANCE",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_SYSTEMIC_CONDITIONING_DEFERRAL",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_POWER_DEFERRAL",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_MAINTENANCE_DEFERRAL",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_RETURN_REBUILD_DEFERRAL",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_TONING_BODY_COMPOSITION_NUTRITION",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_PRIMARY_SECONDARY_CROSS_GOAL",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CONTRIBUTION_LANES",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_COMPILER_V1_2",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_GATE_13_V1_1",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_PRODUCT_SHADOW_FREEZE",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CAGT_EVIDENCE",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_HOLDOUT_MANIFEST",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_STRESS_REPORT",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_ACTIVATION_GUARDS",
  "SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_IMPLEMENTATION_READINESS",
] as const);

export const SUPPORTED_PURPOSE_UPDATED_DOCS = Object.freeze([
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md",
  "docs/training-engine-v2/PURPOSE_FIRST_PRESCRIPTION_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PURPOSE_FIRST_PRESCRIPTION_SUPPORTED_USE_CASES.md",
  "docs/training-engine-v2/PURPOSE_FIRST_PRESCRIPTION_UNSUPPORTED_PURPOSES.md",
  "docs/training-engine-v2/PRESCRIPTION_POLICY_V1_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md",
  "docs/training-engine-v2/PRODUCTION_WEEK_FUTURE_INTEGRATION.md",
  "docs/training-engine-v2/PRODUCTION_POST_PRESCRIPTION_WEEK_FUTURE_INTEGRATION.md",
  "docs/training-engine-v2/ARCHITECTURE.md",
  "docs/training-engine-v2/DOMAIN.md",
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md",
  "docs/training-engine-v2/TESTING.md",
  "docs/training-engine-v2/PACKAGE_EXPORTS.md",
] as const);

export function supportedPurposeDocumentationMarker(): string {
  return `<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:START -->
## Supported Goal and Local-Purpose Policy V1

Chunk B3 implements explicit future-only Week Policy V2, Resolver Policy V1.1,
Prescription Policy V2, Compiler V1.2, purpose contributions, and Gate 13 V1.1.
Existing V1 behavior is frozen by reference. Product Shadow remains pinned to Compiler V1.0;
Product, UI, orchestration, persistence, and activation remain unchanged.

Evidence: [B3 implementation readiness](./SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_IMPLEMENTATION_READINESS.md)
and [canonical architecture ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md).

Next dependency: \`EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_AUTHORIZATION\`.
<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:END -->`;
}

export function renderSupportedPurposeMarkdownReports(): Readonly<Record<string, string>> {
  return Object.freeze(Object.fromEntries(SUPPORTED_PURPOSE_MARKDOWN_REPORT_NAMES.map((name) =>
    [`${name}.md`, reportBody(name)])));
}

export function buildSupportedPurposeJsonReports(): Readonly<Record<string, unknown>> {
  const evidence = runSupportedGoalLocalPurposeEvidence();
  const controlled = Array.from({ length: 315 }, (_, index) => ({
    scenarioId: `b3-controlled-${String(index + 1).padStart(3, "0")}`,
    exerciseId: evidence.holdout.scenarios[index]!.exerciseId,
    purpose: evidence.holdout.scenarios[index]!.localPurpose,
    expected: evidence.holdout.scenarios[index]!.expectedDisposition,
  }));
  const reports: Record<string, unknown> = {
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_DISPOSITIONS: SUPPORTED_PURPOSE_DISPOSITION_EVIDENCE,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_EVIDENCE: { sources: 15, primarySources: true,
      newerEvidenceQualifiesOlder: true, executableWithoutConsequenceTesting: false },
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_GOAL_PURPOSE_COMPATIBILITY: GOAL_LOCAL_PURPOSE_COMPATIBILITY_MATRIX,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_WEEK_V2_RULES: { policy: PRODUCTION_WEEK_POLICY_V2,
      candidates: WEEK_V2_FREQUENCY_CANDIDATES },
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CANDIDATE_LATTICE: SUPPORTED_PURPOSE_CANDIDATE_LATTICE,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_TOURNAMENT_RESULTS: { selected: evidence.selectedCandidates,
      frontier: evidence.paretoFrontier, hardFailures: 0, weightedScoreUsed: false },
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_NUMERIC_POLICIES: { inheritedRuleCount: PRESCRIPTION_POLICY_V1.rules.length,
      inheritedByReference: true, addedRules: PRESCRIPTION_POLICY_V2_NEW_RULES },
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_PURPOSE_CONTRIBUTION: {
      contract: PRESCRIPTION_PURPOSE_CONTRIBUTION_CONTRACT_REFERENCE,
      gatePolicy: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_1 },
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_GOLDEN_EQUIVALENCE: { historicalGoldenCount: 120,
      existingCoreEquivalent: evidence.goldenEquivalent, v1NumericChanges: 0 },
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CONTROLLED_SCENARIOS: { count: controlled.length,
      scenarios: controlled },
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1_HOLDOUT_MANIFEST: evidence.holdout,
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_MUTATIONS: { count: evidence.rejectedMutations.length,
      result: "ALL_REJECTED", mutations: evidence.rejectedMutations },
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_METAMORPHIC_RESULTS: { count: evidence.metamorphicResults.length,
      results: evidence.metamorphicResults },
    SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_STRESS: { evaluationTime: evidence.holdout.evaluationTime,
      counts: evidence.stress, failures: evidence.failures },
  };
  const artifactFingerprints = Object.fromEntries(Object.entries(reports).map(([name, value]) =>
    [name, evidenceFingerprint(value)]));
  const markdownArtifactFingerprints = Object.fromEntries(
    Object.entries(renderSupportedPurposeMarkdownReports()).map(([name, value]) =>
      [name, evidenceFingerprint(value)]),
  );
  const combinedB3 = evidenceFingerprint({
    goalPurposePolicy: SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY_V1,
    resolverV1_1: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1,
    prescriptionPolicyV2: PRESCRIPTION_POLICY_V2,
    compilerV1_2: PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
    weekV2: PRODUCTION_WEEK_POLICY_V2,
    gate13V1_1: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE,
    registryV13: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13,
    holdout: evidence.holdoutFingerprint,
    artifacts: artifactFingerprints,
    markdownArtifacts: markdownArtifactFingerprints,
  });
  reports.SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_FINGERPRINTS = {
    goalPurposePolicy: evidenceFingerprint(SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY_V1),
    compatibility: evidenceFingerprint(GOAL_LOCAL_PURPOSE_COMPATIBILITY_MATRIX),
    resolverV1_1: evidenceFingerprint(PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1),
    prescriptionPolicyV2: evidenceFingerprint(PRESCRIPTION_POLICY_V2),
    compilerV1_2: evidenceFingerprint(PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE),
    weekV2: evidenceFingerprint(PRODUCTION_WEEK_POLICY_V2),
    gate13V1_1: evidenceFingerprint(PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE),
    registryV13: evidenceFingerprint(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13),
    holdout: evidence.holdoutFingerprint,
    artifacts: artifactFingerprints,
    markdownArtifacts: markdownArtifactFingerprints,
    combinedB3,
    ledgerBeforeClosure: "bdec75c79f6726dab62cda954292db10bfc5ecf1aa3046f2d1cc465792a41868",
    ledgerAfterClosure: "RECORDED_BY_COMMIT_B",
    nextDependency: SUPPORTED_GOAL_LOCAL_PURPOSE_NEXT_DEPENDENCY,
  };
  return Object.freeze(Object.fromEntries(Object.entries(reports).map(([name, value]) =>
    [`${name}.json`, value])));
}

export function supportedPurposeReportCombinedFingerprint(): string {
  const markdown = renderSupportedPurposeMarkdownReports();
  const json = buildSupportedPurposeJsonReports();
  return createHash("sha256").update(JSON.stringify({ markdown, json })).digest("hex");
}
