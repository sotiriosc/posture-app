import { createHash } from "node:crypto";
import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src/data/referenceExercises";

export const PRODUCT_TRAINING_GOAL_CLASSIFICATION =
  "PRODUCT_TRAINING_GOAL_AND_PRESCRIPTION_SPECIFICITY_V1_READY_FOR_OWNER_POLICY_SELECTION" as const;
export const PRODUCT_TRAINING_GOAL_ONTOLOGY_CLASSIFICATION =
  "PRODUCT_TRAINING_GOAL_ONTOLOGY_READY" as const;
export const PRODUCT_TRAINING_GOAL_NEXT_DEPENDENCY =
  "OWNER_SELECTION_OF_PRODUCT_GOAL_VOCABULARY_AND_GOAL_SPECIFIC_PRESCRIPTION_POLICY" as const;

export function productTrainingGoalDigest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export const PRODUCT_TRAINING_GOAL_UPSTREAM_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
  prescriptionTiming: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
  prescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
  prescriptionPolicyV1: "9ea24d2cbc35ca956f4eb4c87d8bc11db87c1c498a927743c0468f90b34a3fb8",
  productionPrescriptionCompiler: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
  productionWeek: "4f3fd80ed3fee29cb12c88ef6dea38b6e5f70777ac4718391daa8e7548527387",
  productionLongitudinal: "8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581",
  applicationOrchestration: "a88a493e1553badb4f8cada551ee9d8357d21c4e04872c852bc60058769f8aca",
  controlledProductShadow: "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
});

export const PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR = Object.freeze([
  { goal: "strength", canonicalOutcomeGoal: true, mainRepetitionUseCase: "main_strength",
    weekPolicy: "supported_major_strength_movement_development_S2", productOption: false },
  { goal: "hypertrophy", canonicalOutcomeGoal: true, mainRepetitionUseCase: "main_hypertrophy",
    weekPolicy: "unsupported_requires_policy", productOption: false },
  { goal: "general_fitness", canonicalOutcomeGoal: true, mainRepetitionUseCase: "main_strength",
    weekPolicy: "unsupported_requires_policy", productOption: true },
  { goal: "conditioning", canonicalOutcomeGoal: true, mainRepetitionUseCase: "main_strength",
    weekPolicy: "unsupported_requires_policy", productOption: false },
  { goal: "posture_and_movement_quality", canonicalOutcomeGoal: true,
    mainRepetitionUseCase: "main_strength", weekPolicy: "unsupported_requires_policy", productOption: true },
  { goal: "pain_aware_return", canonicalOutcomeGoal: false, programmingContextOnly: true,
    mainRepetitionUseCase: "main_strength", weekPolicy: "context_not_week_goal", productOption: true },
  { goal: "unknown_or_legacy", canonicalOutcomeGoal: false, mainRepetitionUseCase: "main_strength",
    weekPolicy: "mapping_or_policy_required", productOption: false },
] as const);

export const PRODUCT_TRAINING_GOAL_MAPPING_MATRIX = Object.freeze([
  { productValue: "Improve posture", currentOutcomeGoal: "posture_and_movement_quality",
    contextMode: null, sufficiency: "sufficient_for_shadow" },
  { productValue: "Reduce pain", currentOutcomeGoal: "posture_and_movement_quality",
    contextMode: "pain_aware_return", sufficiency: "non_diagnostic_context_mapping" },
  { productValue: "General fitness", currentOutcomeGoal: "general_fitness",
    contextMode: null, sufficiency: "engine_prescription_policy_missing" },
  { productValue: "Athletic performance", currentOutcomeGoal: null,
    contextMode: null, sufficiency: "under_specified" },
  { productValue: "trainingIntent=build", currentOutcomeGoal: null,
    contextMode: null, sufficiency: "developmental_progression_not_strength_or_hypertrophy" },
] as const);

export const PRODUCT_TRAINING_GOAL_POLICY_OPTIONS = Object.freeze([
  { id: "G0", name: "Current behavior", selection: "NOT_SELECTED",
    consequence: "Preserves the observed non-hypertrophy main-strength fallthrough." },
  { id: "G1", name: "Explicit strength and hypertrophy only", selection: "NOT_SELECTED",
    consequence: "Rejects other main goals until an owner supplies policy." },
  { id: "G2", name: "General-fitness main policy", selection: "NOT_SELECTED",
    consequence: "Adds a general-fitness family while leaving posture and conditioning explicit gaps." },
  { id: "G3", name: "Fully goal-specific supported core", selection: "NOT_SELECTED",
    consequence: "Defines supported families for every canonical outcome before Product activation." },
  { id: "G4", name: "Purpose-first resolver", selection: "NOT_SELECTED",
    consequence: "Resolves assignment purpose first and uses global goal as a bounded modifier." },
] as const);

export const PRODUCT_TRAINING_GOAL_VOCABULARY_OPTIONS = Object.freeze([
  { id: "V0", labels: ["Improve posture", "Reduce pain", "Athletic performance", "General fitness"],
    selection: "NOT_SELECTED", consequence: "No explicit Product strength or hypertrophy truth." },
  { id: "V1", labels: ["Build strength", "Build muscle"], selection: "NOT_SELECTED",
    consequence: "Directly maps to canonical strength and hypertrophy outcomes." },
  { id: "V2", labels: ["Get stronger", "Build muscle", "Improve fitness"], selection: "NOT_SELECTED",
    consequence: "User language remains direct while mapping to canonical engine goals." },
  { id: "V3", labels: ["Tone / definition"], selection: "NOT_SELECTED",
    consequence: "Alias only; requires a truthful follow-up about muscle gain and body composition." },
] as const);

export const PRODUCT_TRAINING_GOAL_EVIDENCE = Object.freeze([
  { id: "PMID_41843416", year: 2026,
    title: "ACSM Position Stand: Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/",
    finding: "Many resistance-training forms work; heavier loads and 2-3 sets favor strength, while higher weekly volume favors hypertrophy. Failure, equipment type, time under tension, and complex periodization did not consistently alter outcomes." },
  { id: "PMID_37414459", year: 2023,
    title: "Resistance training prescription for muscle strength and hypertrophy in healthy adults",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10579494/",
    finding: "All studied prescriptions outperformed no training; higher-load prescriptions ranked best for strength and multiset prescriptions ranked best for hypertrophy." },
  { id: "PMID_33874848", year: 2021,
    title: "Influence of resistance training load on skeletal muscle hypertrophy and strength",
    url: "https://pubmed.ncbi.nlm.nih.gov/33874848/",
    finding: "Higher and lower loads produced similar hypertrophy, while higher loads produced larger 1RM and isometric strength gains." },
  { id: "PMID_39205815", year: 2024,
    title: "Give it a rest: inter-set rest interval duration and muscle hypertrophy",
    url: "https://pubmed.ncbi.nlm.nih.gov/39205815/",
    finding: "Nine randomized studies showed substantial overlap across rest-duration categories; short rest is not a required hypertrophy mechanism." },
  { id: "PMID_28641044", year: 2017,
    title: "Short versus long inter-set rest intervals and muscle hypertrophy",
    url: "https://pubmed.ncbi.nlm.nih.gov/28641044/",
    finding: "Both short and long rests can support hypertrophy, with limited evidence suggesting an advantage for longer rests in trained participants." },
  { id: "PMID_25601394", year: 2015,
    title: "Repetition duration during resistance training and muscle hypertrophy",
    url: "https://pubmed.ncbi.nlm.nih.gov/25601394/",
    finding: "Hypertrophy was similar across a broad practical repetition-duration range; a single mandatory tempo is not evidence-based and very slow repetitions may be inferior." },
  { id: "PMID_36334240", year: 2023,
    title: "Resistance training proximity-to-failure and skeletal muscle hypertrophy",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9935748/",
    finding: "Momentary muscular failure was not superior to non-failure training; closer effort can matter without making failure compulsory." },
  { id: "PMID_38970765", year: 2024,
    title: "Estimated proximity to failure, strength gain, and muscle hypertrophy",
    url: "https://pubmed.ncbi.nlm.nih.gov/38970765/",
    finding: "Exploratory models found strength gains across a broad RIR range and greater hypertrophy nearer failure, with uncertainty in the exact dose-response." },
] as const);

export const PRODUCT_TRAINING_GOAL_AFFECTED_EXERCISES = Object.freeze(
  REFERENCE_EXERCISES.filter((exercise) =>
    exercise.trainingRoles.includes("primary_strength") &&
    exercise.prescriptionKnowledge.doseModeAnnotations.some((annotation) =>
      annotation.mode === "repetition_sets"))
    .map((exercise) => exercise.id),
);

export const PRODUCT_TRAINING_GOAL_POLICY_CONSEQUENCES = Object.freeze([
  { goal: "strength", intendedFamily: "owner_selection_required_between_G1_G3_G4",
    currentFamily: "main_strength", selectionImpact: "main loadability and progression may matter",
    equipmentImpact: "heavy-load truth depends on realizable load and increments" },
  { goal: "hypertrophy", intendedFamily: "main_hypertrophy",
    currentFamily: "main_hypertrophy", selectionImpact: "volume and muscle coverage may matter",
    equipmentImpact: "broad loads are legal when effort and volume are realizable" },
  { goal: "general_fitness", intendedFamily: "owner_policy_required",
    currentFamily: "main_strength_fallthrough", selectionImpact: "do not invent a strength default",
    equipmentImpact: "purpose and available modalities must constrain realization" },
  { goal: "conditioning", intendedFamily: "owner_policy_required",
    currentFamily: "main_strength_fallthrough", selectionImpact: "capacity purpose cannot be inferred from reps alone",
    equipmentImpact: "modality and space are material" },
  { goal: "posture_and_movement_quality", intendedFamily: "purpose_first_or_owner_policy_required",
    currentFamily: "main_strength_fallthrough", selectionImpact: "movement need remains upstream truth",
    equipmentImpact: "support and movement legality remain material" },
  { goal: "pain_aware_return", intendedFamily: "context_modifier_not_outcome_family",
    currentFamily: "main_strength_fallthrough_for_legacy_main_goal", selectionImpact: "regress dose; do not diagnose",
    equipmentImpact: "support and tolerable loading constrain realization" },
] as const);

const GOAL_TRUTHS = Object.freeze([
  "strength", "hypertrophy", "general_fitness", "conditioning",
  "posture_and_movement_quality", "pain_aware_return", "athletic_performance_under_specified",
  "tone_alias", "unknown_goal", "strength_secondary_goal",
] as const);
const EQUIPMENT_ENVIRONMENTS = Object.freeze([
  "none", "bands", "dumbbells", "full_gym", "machines", "mixed_unknown",
] as const);
const EXPERIENCES = Object.freeze(["beginner", "intermediate", "advanced"] as const);
const SECTIONS = Object.freeze(["warmup", "activation", "main", "accessory", "cooldown"] as const);
const CONTEXTS = Object.freeze([
  "ordinary", "pain_aware", "relevant_safety", "irrelevant_pain", "return_after_absence",
] as const);
const SAME_USER_COMPARISONS = Object.freeze([
  "same_pool_strength_vs_hypertrophy",
  "same_exercise_different_prescription",
  "same_prescription_justified_convergence",
  "main_changes_accessories_remain",
  "accessories_change_main_anchor_remains",
  "warmup_unchanged",
  "activation_unchanged",
] as const);

function currentUseCase(goal: string, section: string): string {
  if (section === "warmup") return "preparation";
  if (section === "activation") return "activation";
  if (section === "cooldown") return "recovery_cooldown";
  if (section === "accessory") return "direct_or_role_owned_accessory";
  return goal === "hypertrophy" ? "main_hypertrophy" : "main_strength";
}

function expectedFutureResponse(goal: string, section: string, equipment: string): string {
  if (section !== "main") return "section_or_role_owned_no_global_goal_override";
  if (goal === "strength" || goal === "strength_secondary_goal") {
    return equipment === "full_gym" || equipment === "machines" ?
      "strength_family_with_realisable_heavy_loading" : "strength_family_with_loadability_constraint";
  }
  if (goal === "hypertrophy") return "hypertrophy_family_with_realisable_volume_and_effort";
  if (goal === "pain_aware_return") return "outcome_goal_required_plus_pain_aware_context_regression";
  return "explicit_owner_policy_or_mapping_required";
}

export interface ProductTrainingGoalScenario {
  readonly id: string;
  readonly comparisonShellId: string;
  readonly comparisonCase: typeof SAME_USER_COMPARISONS[number];
  readonly goalTruth: typeof GOAL_TRUTHS[number];
  readonly goalPosition: "primary" | "secondary";
  readonly equipment: typeof EQUIPMENT_ENVIRONMENTS[number];
  readonly experience: typeof EXPERIENCES[number];
  readonly context: typeof CONTEXTS[number];
  readonly section: typeof SECTIONS[number];
  readonly exerciseId: string;
  readonly observedCurrentUseCase: string;
  readonly expectedFutureResponse: string;
  readonly earliestMaterialOwner: string;
  readonly allowedConvergence: boolean;
  readonly selectedPolicy: false;
  readonly productionBehaviorChanged: false;
}

export const PRODUCT_TRAINING_GOAL_SCENARIOS: readonly ProductTrainingGoalScenario[] = Object.freeze(
  GOAL_TRUTHS.flatMap((goal, goalIndex) => EQUIPMENT_ENVIRONMENTS.flatMap((equipment, equipmentIndex) =>
    EXPERIENCES.map((experience, experienceIndex) => {
      const index = goalIndex * EQUIPMENT_ENVIRONMENTS.length * EXPERIENCES.length +
        equipmentIndex * EXPERIENCES.length + experienceIndex;
      const shellIndex = equipmentIndex * EXPERIENCES.length + experienceIndex;
      const section = SECTIONS[shellIndex % SECTIONS.length];
      const context = CONTEXTS[(equipmentIndex + experienceIndex) % CONTEXTS.length];
      const normalizedGoal = goal === "strength_secondary_goal" ? "strength" : goal;
      return Object.freeze({
        id: `PTG-${String(index + 1).padStart(3, "0")}`,
        comparisonShellId: `SHELL-${String(shellIndex + 1).padStart(2, "0")}`,
        comparisonCase: SAME_USER_COMPARISONS[shellIndex % SAME_USER_COMPARISONS.length],
        goalTruth: goal,
        goalPosition: goal === "strength_secondary_goal" ? "secondary" : "primary",
        equipment,
        experience,
        context,
        section,
        exerciseId: PRODUCT_TRAINING_GOAL_AFFECTED_EXERCISES[
          shellIndex % PRODUCT_TRAINING_GOAL_AFFECTED_EXERCISES.length],
        observedCurrentUseCase: currentUseCase(normalizedGoal, section),
        expectedFutureResponse: expectedFutureResponse(normalizedGoal, section, equipment),
        earliestMaterialOwner: goal === "athletic_performance_under_specified" || goal === "tone_alias" ||
          goal === "unknown_goal" ? "Product_goal_mapping" : section === "main" ? "Prescription" : "section_role_owner",
        allowedConvergence: section !== "main" || goal === "tone_alias" || goal === "unknown_goal",
        selectedPolicy: false,
        productionBehaviorChanged: false,
      });
    }))),
);

export const PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS = Object.freeze([
  { id: "M01", mutation: "strength_changes_label_only", result: "REJECTED",
    failure: "strength requires truthful upstream purpose and a goal-specific Prescription response" },
  { id: "M02", mutation: "strength_changes_only_reps", result: "REJECTED",
    failure: "downstream reps cannot rescue an incorrect Week or Session purpose" },
  { id: "M03", mutation: "hypertrophy_short_rest_only", result: "REJECTED",
    failure: "short rest is neither required nor a sufficient hypertrophy policy" },
  { id: "M04", mutation: "tone_high_reps_only", result: "REJECTED",
    failure: "tone is not a distinct high-repetition physiological adaptation" },
  { id: "M05", mutation: "every_non_hypertrophy_goal_becomes_strength", result: "REJECTED",
    failure: "observed compiler fallthrough is overbroad and requires owner policy" },
  { id: "M06", mutation: "strength_forces_low_reps_on_all_sections", result: "REJECTED",
    failure: "preparation, activation, accessories, dose modes, and recovery retain local ownership" },
  { id: "M07", mutation: "equipment_limits_ignored", result: "REJECTED",
    failure: "load and increment realization require explicit equipment capabilities" },
  { id: "M08", mutation: "beginner_or_pain_context_ignored", result: "REJECTED",
    failure: "experience, safety, and pain-aware regression remain material" },
  { id: "M09", mutation: "generic_goal_warmup_or_activation", result: "REJECTED",
    failure: "preparation and activation remain dependency-owned" },
  { id: "M10", mutation: "product_engine_semantic_disagreement", result: "REJECTED",
    failure: "Product labels must map truthfully before a policy is applied" },
  { id: "M11", mutation: "downstream_prescription_rescues_bad_mapping", result: "REJECTED",
    failure: "CAGT stops at the earliest incorrect owner" },
] as const);

export const PRODUCT_TRAINING_GOAL_CAGT_RESULT = Object.freeze({
  result: "PASS_ALL_EXPECTED_MATERIAL_RESPONSES_AND_HARD_FAILURES_RECORDED",
  scenarioCount: PRODUCT_TRAINING_GOAL_SCENARIOS.length,
  mutationCount: PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS.length,
  rejectedMutationCount: PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS.filter((entry) =>
    entry.result === "REJECTED").length,
  artificialUniquenessCount: 0,
  diversityQuotaCount: 0,
  genericStrengthWarmupCount: 0,
  genericHypertrophyActivationCount: 0,
  acceptedDownstreamRescueCount: 0,
  productionBehaviorChangeCount: 0,
  selectedPolicy: false,
});

export const PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE = Object.freeze([
  { chunk: "A", authorization: "OWNER_REQUIRED", action: "Select Product goal vocabulary", behavior: "none" },
  { chunk: "B", authorization: "SEPARATE", action: "Implement engine goal-specific Prescription resolver/policy", behavior: "engine_only_not_activated" },
  { chunk: "C", authorization: "SEPARATE", action: "Extend Controlled Product Shadow mapping", behavior: "default_off_shadow_only" },
  { chunk: "D", authorization: "SEPARATE", action: "Run strength, hypertrophy, and general-fitness shadow evidence", behavior: "counterfactual_only" },
  { chunk: "E", authorization: "OWNER_SCREENSHOT_REQUIRED", action: "Review one actual Product goal surface", behavior: "none" },
  { chunk: "F", authorization: "SEPARATE", action: "Add one Product option behind an inactive feature control", behavior: "inactive" },
  { chunk: "G", authorization: "SEPARATE_DELIVERY", action: "Controlled owner-account delivery", behavior: "owner_only" },
  { chunk: "H", authorization: "SEPARATE_ACTIVATION", action: "Broader Product activation", behavior: "not_authorized" },
] as const);

const ONTOLOGY_AUDIT = Object.freeze({
  canonicalOutcomeGoal: "CORRECT_OWNER_AND_SEMANTICS",
  legacyTrainingGoal: "CORRECT_BUT_NOT_PRODUCT_EXPOSED",
  productGoalStrings: "AMBIGUOUS_REQUIRES_OWNER_DECISION",
  productTrainingIntent: "PRODUCT_LABEL_ONLY",
  programmingContextMode: "PROGRAMMING_CONTEXT_ONLY",
  weeklyDevelopmentObjective: "WEEK_OWNER",
  sessionAllocationDirective: "CORRECT_OWNER_AND_SEMANTICS",
  sessionIntent: "CORRECT_OWNER_AND_SEMANTICS",
  sessionNeed: "CANDIDATE_COMPOSER_OWNER",
  assignmentRoleAndSection: "CORRECT_OWNER_AND_SEMANTICS",
  prescriptionPolicyUseCase: "PRESCRIPTION_OWNER",
  prescriptionSpecificity: "CORRECT_BUT_NOT_GOAL_SPECIFIC",
  compilerMainFallback: "OVERBROAD_FALLTHROUGH",
  exerciseKnowledge: "EXERCISE_KNOWLEDGE_OWNER",
  doseModeLegality: "EXERCISE_KNOWLEDGE_OWNER",
  restTempoEffortLoad: "PRESCRIPTION_OWNER",
  equipmentRealization: "EQUIPMENT_OWNER",
  phaseContext: "PHASE_CONTEXT_ONLY",
  painAwareRegression: "PROGRAMMING_CONTEXT_ONLY",
  longitudinalAxes: "CORRECT_OWNER_AND_SEMANTICS",
  productShadowMappings: "CORRECT_BUT_NOT_GOAL_SPECIFIC",
});

function buildAuditFingerprints() {
  const components = {
    ontologyAudit: ONTOLOGY_AUDIT,
    currentBehavior: PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR,
    evidenceReview: PRODUCT_TRAINING_GOAL_EVIDENCE,
    strengthDoctrine: { load: "heavier_when_realisable", sets: "2_to_3_main", rest: "task_recovery",
      effort: "high_not_mandatory_failure", equipment: "capability_bounded" },
    hypertrophyDoctrine: { volume: "higher_weekly_volume", load: "broad_legal_range",
      rest: "not_short_by_definition", effort: "close_enough_not_mandatory_failure" },
    toningOptions: { physiology: "not_distinct", alias: true, bodyCompositionOwner: true, nutritionOwner: true },
    productVocabularyOptions: PRODUCT_TRAINING_GOAL_VOCABULARY_OPTIONS,
    compilerFallthrough: { affectedGoals: PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR
      .filter((entry) => entry.mainRepetitionUseCase === "main_strength" && entry.goal !== "strength")
      .map((entry) => entry.goal), affectedExercises: PRODUCT_TRAINING_GOAL_AFFECTED_EXERCISES },
    prescriptionFamilyOptions: PRODUCT_TRAINING_GOAL_POLICY_OPTIONS,
    exerciseSelectionConsequences: { candidateChangeRequiredBeforeSelection: false,
      sameExerciseDifferentDoseLegal: true, roleAndDoseModeRemainAuthoritative: true },
    equipmentConsequences: EQUIPMENT_ENVIRONMENTS,
    experiencePainConsequences: { beginner: "regress_and_constrain", advanced: "progress_when_evidenced",
      painAware: "context_regression_not_diagnosis", returnAfterAbsence: "reestablish_evidence" },
    restTempoEffortLoad: PRODUCT_TRAINING_GOAL_EVIDENCE.map((entry) => entry.id),
    warmupActivation: { globalGoalOverride: false, dependencyOwned: true },
    weekPhaseLongitudinal: { weekStrengthS2: true, phaseOnlyProgression: false,
      calendarProgression: false, automaticDeload: false, automaticReplacement: false },
    controlledScenarios: PRODUCT_TRAINING_GOAL_SCENARIOS,
    cagtConsequenceLab: PRODUCT_TRAINING_GOAL_CAGT_RESULT,
    implementationSequence: PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE,
    readiness: { classification: PRODUCT_TRAINING_GOAL_CLASSIFICATION,
      ontology: PRODUCT_TRAINING_GOAL_ONTOLOGY_CLASSIFICATION, next: PRODUCT_TRAINING_GOAL_NEXT_DEPENDENCY },
  };
  const fingerprints = Object.fromEntries(Object.entries(components).map(([key, value]) =>
    [key, productTrainingGoalDigest(value)]));
  return Object.freeze({ ...fingerprints, combinedAudit: productTrainingGoalDigest(fingerprints) });
}

export const PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS = buildAuditFingerprints();

export function buildProductTrainingGoalAuditReport() {
  return Object.freeze({
    classification: PRODUCT_TRAINING_GOAL_CLASSIFICATION,
    ontologyClassification: PRODUCT_TRAINING_GOAL_ONTOLOGY_CLASSIFICATION,
    nextDependency: PRODUCT_TRAINING_GOAL_NEXT_DEPENDENCY,
    productionBehaviorChanged: false,
    productBehaviorChanged: false,
    shadowRolloutChanged: false,
    selectedPolicy: false,
    publicApiChanges: 0,
    productionCodeChanges: 0,
    currentBehavior: PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR,
    mappingMatrix: PRODUCT_TRAINING_GOAL_MAPPING_MATRIX,
    policyConsequences: PRODUCT_TRAINING_GOAL_POLICY_CONSEQUENCES,
    affectedExercises: PRODUCT_TRAINING_GOAL_AFFECTED_EXERCISES,
    compilerFallthroughGoalCount: 5,
    compilerFallthroughCharacterization: "OVERBROAD_ACCIDENTAL_FALLTHROUGH_FOR_MAIN_REPETITION_SET_ASSIGNMENTS",
    scenarios: PRODUCT_TRAINING_GOAL_SCENARIOS,
    cagt: PRODUCT_TRAINING_GOAL_CAGT_RESULT,
    mutations: PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS,
    evidence: PRODUCT_TRAINING_GOAL_EVIDENCE,
    vocabularyOptions: PRODUCT_TRAINING_GOAL_VOCABULARY_OPTIONS,
    policyOptions: PRODUCT_TRAINING_GOAL_POLICY_OPTIONS,
    implementationSequence: PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE,
    ontologyAudit: ONTOLOGY_AUDIT,
    upstreamFingerprints: PRODUCT_TRAINING_GOAL_UPSTREAM_FINGERPRINTS,
    auditFingerprints: PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS,
  });
}
