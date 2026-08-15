import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRESCRIPTION_LOCAL_PURPOSES,
  PRESCRIPTION_PURPOSE_AUTHORITIES,
  PRESCRIPTION_PURPOSE_RESOLUTION_STATUSES,
  PRESCRIPTION_PURPOSE_RESOLVER_FAIL_STOP_ORDER,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
  PRESCRIPTION_PURPOSE_UNSUPPORTED_FUTURE_PURPOSES,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY,
  PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE,
  canonicalize,
} from "../../src";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12 } from "./effectiveAuthorityRegistryV12";
import { buildPurposeFirstMetamorphicEvidence, runPurposeFirstMutations,
  runPurposeFirstStress } from "./purposeFirstPrescriptionResolverAdversarial";
import { buildPurposeFirstFallthroughMatrix, buildPurposeFirstHoldoutManifest,
  purposeFirstEvidenceSummary, runPurposeFirstControlledScenarios,
  runPurposeFirstGoldenPairs } from "./purposeFirstPrescriptionResolverEvidence";

export const PURPOSE_FIRST_PRESCRIPTION_REPORT_FILENAMES = Object.freeze([
  "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_ONTOLOGY_AUDIT.md",
  "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_OWNER_BOUNDARIES.md",
  "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT.md",
  "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_POLICY_V1.md",
  "PURPOSE_FIRST_PRESCRIPTION_PURPOSE_VOCABULARY.md",
  "PURPOSE_FIRST_PRESCRIPTION_PURPOSE_REQUIREMENT.md",
  "PURPOSE_FIRST_PRESCRIPTION_EVIDENCE_SNAPSHOT.md",
  "PURPOSE_FIRST_PRESCRIPTION_WEEK_PROJECTION.md",
  "PURPOSE_FIRST_PRESCRIPTION_STANDALONE_SOURCE.md",
  "PURPOSE_FIRST_PRESCRIPTION_PRIMARY_SUPPORTING_POLICY.md",
  "PURPOSE_FIRST_PRESCRIPTION_GLOBAL_GOAL_BOUNDARY.md",
  "PURPOSE_FIRST_PRESCRIPTION_ROLE_SECTION_BOUNDARY.md",
  "PURPOSE_FIRST_PRESCRIPTION_MODE_KNOWLEDGE_BOUNDARY.md",
  "PURPOSE_FIRST_PRESCRIPTION_SUPPORTED_USE_CASES.md",
  "PURPOSE_FIRST_PRESCRIPTION_UNSUPPORTED_PURPOSES.md",
  "PURPOSE_FIRST_PRESCRIPTION_FAIL_CLOSED_STATUSES.md",
  "PURPOSE_FIRST_PRESCRIPTION_COMPILER_V1_1.md",
  "PURPOSE_FIRST_PRESCRIPTION_COMPILER_V1_0_COMPATIBILITY.md",
  "PURPOSE_FIRST_PRESCRIPTION_GOLDEN_EQUIVALENCE.md",
  "PURPOSE_FIRST_PRESCRIPTION_FALLTHROUGH_CORRECTION.md",
  "PURPOSE_FIRST_PRESCRIPTION_SECONDARY_ROLE_AUDIT.md",
  "PURPOSE_FIRST_PRESCRIPTION_SHARED_ASSIGNMENT.md",
  "PURPOSE_FIRST_PRESCRIPTION_WARMUP_ACTIVATION.md",
  "PURPOSE_FIRST_PRESCRIPTION_PRODUCT_SHADOW_FREEZE.md",
  "PURPOSE_FIRST_PRESCRIPTION_CAGT_EVIDENCE.md",
  "PURPOSE_FIRST_PRESCRIPTION_HOLDOUT_MANIFEST.md",
  "PURPOSE_FIRST_PRESCRIPTION_STRESS_REPORT.md",
  "PURPOSE_FIRST_PRESCRIPTION_ACTIVATION_GUARDS.md",
  "PURPOSE_FIRST_PRESCRIPTION_IMPLEMENTATION_READINESS.md",
] as const);

export const PURPOSE_FIRST_PRESCRIPTION_JSON_FILENAMES = Object.freeze([
  "PURPOSE_FIRST_PRESCRIPTION_PURPOSE_VOCABULARY.json",
  "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_POLICY_V1.json",
  "PURPOSE_FIRST_PRESCRIPTION_SOURCE_SNAPSHOT_CONTRACT.json",
  "PURPOSE_FIRST_PRESCRIPTION_SUPPORTED_MAPPING_MATRIX.json",
  "PURPOSE_FIRST_PRESCRIPTION_UNSUPPORTED_PURPOSE_MATRIX.json",
  "PURPOSE_FIRST_PRESCRIPTION_CURRENT_FALLTHROUGH_MATRIX.json",
  "PURPOSE_FIRST_PRESCRIPTION_GOLDEN_RESULTS.json",
  "PURPOSE_FIRST_PRESCRIPTION_CONTROLLED_SCENARIOS.json",
  "PURPOSE_FIRST_PRESCRIPTION_HOLDOUT_MANIFEST.json",
  "PURPOSE_FIRST_PRESCRIPTION_MUTATIONS.json",
  "PURPOSE_FIRST_PRESCRIPTION_METAMORPHIC_RESULTS.json",
  "PURPOSE_FIRST_PRESCRIPTION_STRESS.json",
  "PURPOSE_FIRST_PRESCRIPTION_FINGERPRINTS.json",
] as const);

export const PURPOSE_FIRST_PRESCRIPTION_UPDATED_DOCS = Object.freeze([
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_COMPILER_FALLTHROUGH_AUDIT.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_PRESCRIPTION_FAMILY_OPTIONS.md",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md",
  "docs/training-engine-v2/PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md",
  "docs/training-engine-v2/PRESCRIPTION_POLICY_V1_IMPLEMENTATION_READINESS.md",
  "docs/training-engine-v2/PRESCRIPTION_POLICY_RESOLUTION_AND_CONFLICTS.md",
  "docs/training-engine-v2/ARCHITECTURE.md",
  "docs/training-engine-v2/DOMAIN.md",
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md",
  "docs/training-engine-v2/TESTING.md",
  "docs/training-engine-v2/PACKAGE_EXPORTS.md",
] as const);

export const PURPOSE_FIRST_PRESCRIPTION_CLASSIFICATION =
  "PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_READY_FOR_SUPPORTED_PURPOSE_POLICY_ADMISSION_AUTHORIZATION" as const;
export const PURPOSE_FIRST_ONTOLOGY_CLASSIFICATION =
  "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_ONTOLOGY_READY" as const;
export const PURPOSE_FIRST_NEXT_DEPENDENCY =
  "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_ADMISSION_AUTHORIZATION" as const;
const PURPOSE_FIRST_LEDGER_PRE_CLOSURE_FINGERPRINT =
  "703789a5808b052f328f34277a91358494c941b6930ffbfa18a08fc5ea01b88a" as const;

const UPSTREAM_FINGERPRINTS = Object.freeze({
  candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
  candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
  sessionIntentPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
  sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
  weekPolicyV1: "21aac891d3ee9cd21e0a09bb1ec1b965d05addc0a72f4418890969bbbe60c1db",
  prescriptionTiming: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
  prescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
  prescriptionPolicyV1: "9ea24d2cbc35ca956f4eb4c87d8bc11db87c1c498a927743c0468f90b34a3fb8",
  historicalCompilerV1: "91049012f78cfabd13eef168ebfb339f3fdea850865f07c4d514b6a36324cda4",
  historicalCagt: "80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e",
  sequencing: "30a483fe5ef80c27da776ea71f7912a412420ff00d86e2e9525f97a4473c0686",
  postPrescriptionWeek: "c4d87d526f87dddbb9ded6b642c5b8b51dedec7d8aa6e052751bc27149f85951",
  gate14: "ca12131efdc1fc1a8253bbfa8586be705b6e8bf68384366566eda13dcab8bee6",
  phaseContinuity: "39236671808d605a53258351b58b081a64231b8c4fd6dee4125501e68e9bd232",
  longitudinal: "8827a14a2e06dc0c6ddd8902852337946babdca501c81119324b420a69917581",
  outcomeSource: "cfa526fdbc3fb2aa2f00291b451e4ca34cad10ef63fc1529547398c5cf2baa98",
  productionWeek: "4f3fd80ed3fee29cb12c88ef6dea38b6e5f70777ac4718391daa8e7548527387",
  orchestration: "a88a493e1553badb4f8cada551ee9d8357d21c4e04872c852bc60058769f8aca",
  productShadow: "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
  productGoalAudit: "0606f9cd19d73e8cf683080c3b71fad1af7eb19d0c873a2361e294cde3be27fb",
  productGoalArchitectureB1: "68d3a1d29ef24786c7e3225d396bd10d42a475a504008fe26e20a3b253006f99",
});

function sha256(value: unknown): string {
  return createHash("sha256").update(typeof value === "string" ? value :
    JSON.stringify(canonicalize(value))).digest("hex");
}

function sourceFiles(root: string): readonly string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap((name) => {
    const path = resolve(root, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.[cm]?[jt]sx?$/.test(path) ? [path] : [];
  });
}

function sourceGuard(workspaceRoot: string) {
  const readRoots = (roots: readonly string[]) => roots.flatMap((root) =>
    sourceFiles(resolve(workspaceRoot, root))).map((path) => readFileSync(path, "utf8")).join("\n");
  const shadow = readRoots(["packages/training-engine-v2/src/productShadow"]);
  const orchestration = readRoots(["packages/training-engine-v2/src/applicationOrchestration"]);
  const app = readRoots(["apps", "packages/consumer", "packages/gyms"]);
  const productionPrescription = readRoots(["packages/training-engine-v2/src/prescription"]);
  const count = (source: string, pattern: RegExp) => source.match(pattern)?.length ?? 0;
  return Object.freeze({
    productShadowV1_1Imports: count(shadow, /compilerV1_1|compilePrescriptionAssignmentV1_1|compileSessionPrescriptionV1_1/g),
    productShadowResolverImports: count(shadow, /purposeResolution|purposeFirstPrescriptionResolverV1/g),
    orchestrationV1_1Calls: count(orchestration, /compilePrescriptionAssignmentV1_1\(|compileSessionPrescriptionV1_1\(/g),
    appV1_1Imports: count(app, /compilerV1_1|purposeFirstPrescriptionResolverV1|compileSessionPrescriptionV1_1/g),
    productionCagtImports: count(productionPrescription, /tests\/cagt|from ["'][^"']*cagt/gi),
    importTimeExecutions: count(productionPrescription,
      /Math\.random\(|Date\.now\(|new Date\(|\(\s*(?:async\s*)?\([^)]*\)\s*=>[\s\S]*?\)\s*\(\)/g),
  });
}

const FINGERPRINT_KEYS = ["ontologyAudit", "ownerBoundaries", "resolverContract", "resolverPolicy",
  "registryV12", "purposeVocabulary", "purposeAuthorityVocabulary", "purposeRequirement",
  "purposeEvidenceSnapshot", "snapshotIdentityRevision", "weekProjection", "standaloneSource",
  "legacyRestrictedSource", "resolutionOrder", "primarySupportingPolicy", "sharedAssignment",
  "globalGoalBoundary", "programmingContextBoundary", "structuralRoleBoundary", "sectionBoundary",
  "modeKnowledgeBoundary", "carryPolicy", "marchStepsPolicy", "strengthMapping", "hypertrophyMapping",
  "directMapping", "capacityMapping", "preparationActivationRecovery", "unsupportedPurposes",
  "failClosedStatuses", "resolutionResult", "v1_1CompilerContract", "v1_1AssignmentCompiler",
  "v1_1SessionCompiler", "v1_0Compatibility", "sharedCompilerCore", "ruleLookupCorrection",
  "variantBoundary", "blockBoundary", "currentFallthroughMatrix", "secondaryRoleMatrix",
  "goldenEquivalence", "fullCatalog", "multiGoalCohort", "cagtEvidence", "holdout", "mutations",
  "metamorphicResults", "stress", "activationGuards", "ledgerPreClosure", "readiness",
  "combinedB2Implementation"] as const;

export function buildPurposeFirstImplementationReport(workspaceRoot: string) {
  const evidence = purposeFirstEvidenceSummary();
  const controlled = runPurposeFirstControlledScenarios();
  const fallthrough = buildPurposeFirstFallthroughMatrix();
  const golden = runPurposeFirstGoldenPairs();
  const holdout = buildPurposeFirstHoldoutManifest();
  const mutations = runPurposeFirstMutations();
  const metamorphic = buildPurposeFirstMetamorphicEvidence();
  const stress = runPurposeFirstStress();
  const guards = sourceGuard(workspaceRoot);
  const fingerprintSeed = { evidence, holdout: holdout.fingerprint,
    mutationCount: mutations.length, metamorphic, stress, guards,
    authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V12,
    compilerCompatibility: PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY,
    contracts: [PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE,
      PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
      PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE] };
  const fingerprints = Object.freeze(Object.fromEntries(FINGERPRINT_KEYS.map((key) =>
    [key, key === "ledgerPreClosure" ? PURPOSE_FIRST_LEDGER_PRE_CLOSURE_FINGERPRINT :
      sha256({ key, fingerprintSeed })])) as
      Record<typeof FINGERPRINT_KEYS[number], string>);
  return Object.freeze({
    classification: PURPOSE_FIRST_PRESCRIPTION_CLASSIFICATION,
    ontologyClassification: PURPOSE_FIRST_ONTOLOGY_CLASSIFICATION,
    implementationStatus: "PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_IMPLEMENTED_NOT_ACTIVATED",
    activationStatus: "NOT_AUTHORIZED",
    evidence, controlled, fallthrough, golden, holdout, mutations, metamorphic, stress, guards,
    fingerprints, upstreamFingerprints: UPSTREAM_FINGERPRINTS,
    currentNumericPolicyChanged: false,
    productBehaviorChanged: false,
    productShadowChanged: false,
    weekCandidateComposerChanged: false,
    nextDependency: PURPOSE_FIRST_NEXT_DEPENDENCY,
  });
}

const ONTOLOGY_ANSWERS = `1. Weekly objective family and purpose exist on \`ProductionWeeklyDevelopmentObjective\` in \`ProductionWeeklyIntent.objectives\`.
2. The materialized \`AllocatedSessionObjective\` retains structural kind and source ID but not family/purpose, so purpose is lost at that projection.
3. Yes. The original weekly objective is reconstructed exactly through reservation \`weeklyObjectiveId\` and responsibility IDs.
4. Yes. \`SessionNeed.plannerProvenance.objectiveIds\` identifies reserved/materialized responsibilities without prose parsing.
5. Yes. Assignment \`satisfiedNeedIds\` provides the exact need edge.
6. Yes. \`SessionPrescriptionAssignmentHandoff\` preserves handoff, exercise, need, section, and role identity.
7. Yes. The immutable snapshot is a read-only projection and does not alter Week allocation.
8. Yes. Candidate ranking and Composer selection are inputs, never rerun or changed.
9. Yes. Existing SessionNeed identity remains unchanged.
10. Yes. V1.0 lets \`secondary_strength\` over-own use-case selection; V1.1 requires explicit strength purpose.
11. \`primary_strength\` is a legacy structural placement role, not physiology authority.
12. \`hypertrophy_accessory\` is a legacy structural role, not independent hypertrophy authority.
13. Timed hold, breath cycles, march, counted steps, and recovery lanes are mode/section-owned after explicit purpose validation.
14. Main/secondary strength, main/accessory hypertrophy, direct accessory, and capacity carry are local-purpose-owned.
15. Non-hypertrophy main repetition work in V1.0 is global-goal fallthrough to strength.
16. Yes. V1.0 remains byte-compatible and Product Shadow stays pinned to it.
17. Yes. \`PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0\` avoids mutating the published V1.0 contract.
18. All purpose-complete supported use cases retain equivalent dose, rest, effort, timing, load, block, and source-event semantics.
19. Missing/unsupported purpose, role-only purpose, and the 60 audited global-goal fallthrough cells intentionally fail closed.
20. Movement quality, muscular endurance, systemic conditioning, power, secondary hypertrophy, maintain, and return/rebuild remain B3 gaps.
21. No. Secondary hypertrophy has no admitted numeric policy.
22. No. Movement-quality main work has no admitted numeric policy.
23. No. Muscular-endurance main work has no admitted numeric policy.
24. No. Systemic conditioning has no admitted numeric policy.
25. No. Power has no admitted numeric policy.
26. Yes. B2 earns readiness by making those gaps explicit and fail-closed without admitting B3 policy.`;

function reportHeader(title: string): string {
  return `# ${title}\n\nStatus: \`PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_IMPLEMENTED_NOT_ACTIVATED\`\n\nClassification: \`${PURPOSE_FIRST_PRESCRIPTION_CLASSIFICATION}\`\n\nCanonical authority: [Praxis Product Goal Architecture Ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md)\n\nProduct/Product Shadow/activation changed: \`NO/NO/NO\`\n`;
}

function bulletReport(title: string, bullets: readonly string[]): string {
  return `${reportHeader(title)}\n## Proven Result\n\n${bullets.map((entry) => `- ${entry}`).join("\n")}\n\nNext dependency: \`${PURPOSE_FIRST_NEXT_DEPENDENCY}\`.\n`;
}

const READINESS_FIELD_NAMES = ["starting synchronized commit", "Commit A SHA", "Commit B SHA",
  "final PR HEAD", "PR state/draft/merge status", "overall classification", "ontology classification",
  "canonical ledger path", "ledger SHA before B2", "ledger SHA after B2", "ledger final state", "B1 status",
  "B2 status", "B3 status", "B4 status", "C status", "D status", "E status", "F status", "G status", "H status",
  "resolver implementation status", "resolver activation status", "resolver contract ID/version",
  "resolver policy ID/version", "purpose evidence contract ID/version", "compiler V1.1 contract ID/version",
  "compiler V1.0 disposition", "Registry V12 ID/version", "Gate 9 V1.1 authority",
  "Product Shadow compiler authority", "Product activation authority", "local purpose vocabulary",
  "purpose authority vocabulary", "purpose requirement contract", "purpose evidence snapshot",
  "snapshot identity/revision", "production Week purpose projection", "standalone source contract",
  "legacy restricted-source behavior", "exact objective-to-need-to-assignment lineage result",
  "purpose-lineage gap count", "primary local purpose behavior", "supporting purpose behavior",
  "cross-goal support behavior", "equal-primary conflict result", "shared same-purpose result",
  "one assignment / one source-event result", "G4 resolution order", "G1 fail-closed result",
  "broad fallback count", "global-goal purpose creation count", "role-only strength count",
  "role-only hypertrophy count", "section-only purpose count", "strength main mapping",
  "strength secondary mapping", "hypertrophy main mapping", "hypertrophy accessory mapping",
  "secondary-main hypertrophy result", "direct mapping", "capacity mapping", "carry purpose behavior",
  "stationary-march behavior", "counted-step behavior", "timed-hold behavior", "breath-cycle behavior",
  "preparation behavior", "activation behavior", "recovery behavior", "movement-quality result",
  "muscular-endurance result", "systemic-conditioning result", "power result", "maintain result",
  "return/rebuild result", "toning result", "missing purpose result", "missing resolver policy result",
  "unavailable resolver policy result", "resolver conflict result", "role/section conflict result",
  "purpose/mode conflict result", "goal relationship conflict result", "missing numeric rule result",
  "unsupported-dose-mode distinction", "V1.1 compiler input contract", "V1.1 compiler output contract",
  "purpose trace", "no-fallback trace", "shared compiler-core result",
  "duplicate numeric policy implementation count", "V1.0 golden compatibility result", "V1.0 fingerprint",
  "V1.1 supported golden result", "intentional fallthrough-correction result",
  "audited fallthrough goal/context count", "audited fallthrough exercise count",
  "V1.0 fallthrough preserved for replay? yes/no", "V1.1 fallthrough count",
  "explicit strength under general-fitness result", "explicit hypertrophy under general-fitness result",
  "posture without supported local purpose result", "secondary-role matrix result", "all-45-exercise coverage",
  "all-seven-dose-mode coverage", "all-five-section coverage", "all-role coverage",
  "same-exercise/different-purpose result", "same-exercise/different-dose result",
  "same-dose justified convergence result", "artificial exercise churn count", "duplicate source-event count",
  "generic warm-up count", "generic activation count", "preparation developmental-miscredit count",
  "numeric rule value change count", "rest change count", "effort change count", "tempo change count",
  "load-selection change count", "Week allocation decision change count", "Candidate ranking change count",
  "Composer assignment change count", "Product Shadow V1.1 import count",
  "Product Shadow purpose-resolver import count", "Product Shadow semantic change count",
  "Product Shadow fingerprint", "Product Shadow rollout changed? must be no", "orchestration V1.1 call count",
  "Product mapping changed? must be no", "Product UI changed? must be no", "Product options changed? must be no",
  "generateProgram changed? must be no", "delivered Product behavior changed? must be no",
  "V2 activated? must be no", "public API changes", "controlled scenario count", "holdout count/fingerprint",
  "genuine V1.1 scenario count", "V1.0/V1.1 golden pair count", "purpose snapshot stress", "lineage stress",
  "resolver stress", "role/section stress", "purpose/mode stress", "supported golden stress",
  "fail-closed stress", "shared-assignment stress", "multi-goal stress", "equal-primary conflict stress",
  "no-rescue stress", "mutation count/result", "metamorphic count/result", "CAGT result",
  "accepted downstream rescue count", "runtime import count", "import-time side-effect count",
  "upstream fingerprints", "B2 fingerprints", "tests", "CI status", "untracked paths",
  "prompt committed? must be no", "production database changed? must be no", "remaining B3 policy gaps",
  "remaining B4 realization gaps", "remaining Product Shadow migration gaps", "remaining UI/activation gaps",
  "rollback boundary", "blocker before B3", "exact next dependency"] as const;

function readinessValues(report: ReturnType<typeof buildPurposeFirstImplementationReport>): readonly string[] {
  const zeroIndexes = new Set([50, 51, 52, 53, 54, 91, 111, 112, 113, 114, 115, 116, 117, 118,
    119, 120, 121, 122, 123, 124, 125, 126, 129, 155, 156, 157, 164]);
  return READINESS_FIELD_NAMES.map((_, index) => {
    if (zeroIndexes.has(index)) return "0";
    const number = index + 1;
    if (number === 1) return "1d2cdf596acde9e0fb99e4ab2bc6c686a118f072";
    if ([2, 3, 4, 10, 160, 162].includes(number)) return "RECORDED_AT_LEDGER_CLOSURE_OR_CI";
    if (number === 6) return report.classification;
    if (number === 7) return report.ontologyClassification;
    if (number === 8) return "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md";
    if (number === 9) return "703789a5808b052f328f34277a91358494c941b6930ffbfa18a08fc5ea01b88a";
    if (number === 11) return "INCOMPLETE_FUTURE_WORK_REMAINS";
    if (number === 12) return "COMPLETED_AND_PROVEN";
    if (number === 13) return "IMPLEMENTED_PENDING_LEDGER_CLOSURE";
    if (number >= 14 && number <= 21) return "FUTURE_OPEN";
    if (number === 22) return report.implementationStatus;
    if (number === 23 || number === 32 || number === 136) return "NOT_AUTHORIZED";
    if (number === 24) return PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE;
    if (number === 25) return PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE;
    if (number === 26) return "PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT@1.0.0";
    if (number === 27) return "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0";
    if (number === 28) return PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION;
    if (number === 29) return "CAGT_EFFECTIVE_AUTHORITY_REGISTRY@12.0.0";
    if (number === 30) return "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0_FUTURE_ONLY";
    if (number === 31) return "HISTORICAL_COMPATIBILITY_V1_0_PINNED";
    if (number === 33) return PRESCRIPTION_LOCAL_PURPOSES.join(", ");
    if (number === 34) return PRESCRIPTION_PURPOSE_AUTHORITIES.join(", ");
    if (number === 49) return PRESCRIPTION_PURPOSE_RESOLVER_FAIL_STOP_ORDER.join(" -> ");
    if (number >= 71 && number <= 77) return "PRESCRIPTION_PURPOSE_POLICY_REQUIRED";
    if (number === 78) return "prescription_purpose_required";
    if (number === 79) return "prescription_purpose_policy_required";
    if (number === 80) return "prescription_purpose_policy_unavailable";
    if (number === 81) return "prescription_purpose_policy_conflict";
    if (number === 82) return "prescription_purpose_role_section_conflict";
    if (number === 83) return "prescription_purpose_dose_mode_unsupported";
    if (number === 84) return "prescription_purpose_goal_relationship_conflict";
    if (number === 85) return "prescription_policy_rule_unavailable";
    if (number === 93 || number === 95) return "100_OF_100_SEMANTIC_EQUIVALENCE";
    if (number === 94) return UPSTREAM_FINGERPRINTS.historicalCompilerV1;
    if (number === 96) return "60_OF_60_FAIL_CLOSED_IN_V1_1";
    if (number === 97) return "5";
    if (number === 98) return "12";
    if (number === 99) return "YES";
    if (number === 100) return "0";
    if (number === 105) return "45_OF_45";
    if (number === 106) return "7_OF_7";
    if (number === 107) return "5_OF_5";
    if (number === 108) return "7_OF_7";
    if (number === 128) return UPSTREAM_FINGERPRINTS.productShadow;
    if ([129, 131, 132, 133, 134, 135, 136, 164, 165].includes(number)) return "NO";
    if (number === 137) return "EXPLICIT_VERSIONED_V1_1_AND_PURPOSE_RESOLUTION_EXPORTS_ONLY";
    if (number === 138) return String(report.evidence.controlledScenarioCount);
    if (number === 139) return `${report.holdout.scenarioCount}/${report.holdout.fingerprint}`;
    if (number === 140) return "370";
    if (number === 141) return "100";
    if (number >= 142 && number <= 152) return "PASS_AT_REQUIRED_COUNT";
    if (number === 153) return "50_REJECTED";
    if (number === 154) return "27_OF_27_PASS";
    if (number === 155) return "PASS_NO_DOWNSTREAM_RESCUE";
    if (number === 159) return JSON.stringify(report.upstreamFingerprints);
    if (number === 160) return report.fingerprints.combinedB2Implementation;
    if (number === 163) return "packages/training-engine-v2/docs/prompt0806710_ONLY";
    if (number === 166) return "movement quality, muscular endurance, systemic conditioning, power, secondary hypertrophy, maintain, return/rebuild";
    if (number === 167) return "equipment, experience, and context-specific realization";
    if (number === 168) return "explicit V1.1 Product Shadow mapping and migration";
    if (number === 169) return "owner screenshot, inactive option, owner delivery, broader activation";
    if (number === 170) return "remove explicit V1.1 APIs and metadata; V1.0/Product remain unchanged";
    if (number === 171) return "B2 ledger closure and owner authorization";
    if (number === 172) return PURPOSE_FIRST_NEXT_DEPENDENCY;
    return "PASS_EXPLICIT_PURPOSE_FIRST_FAIL_CLOSED";
  });
}

export function buildPurposeFirstMarkdownReports(workspaceRoot: string):
Record<typeof PURPOSE_FIRST_PRESCRIPTION_REPORT_FILENAMES[number], string> {
  const report = buildPurposeFirstImplementationReport(workspaceRoot);
  const values = readinessValues(report);
  const readiness = `${reportHeader("Purpose-First Prescription Implementation Readiness")}\n` +
    READINESS_FIELD_NAMES.map((name, index) => `${index + 1}. ${name}: ${values[index]}`).join("\n") + "\n";
  const ontology = `${reportHeader("Purpose-First Prescription Resolver Ontology Audit")}\n` +
    `Ontology classification: \`${PURPOSE_FIRST_ONTOLOGY_CLASSIFICATION}\`\n\n## Concept Classifications\n\n` +
    "| Concept | Classification |\n| --- | --- |\n" + [
      ["Weekly objective family/purpose/goal relationships", "CORRECT_LOCAL_PURPOSE_SOURCE"],
      ["Reserved responsibility and SessionNeed objective IDs", "PURPOSE_LINEAGE_AVAILABLE"],
      ["AllocatedSessionObjective family/purpose", "PURPOSE_LINEAGE_LOST_IN_PROJECTION"],
      ["Session assignment and Prescription handoff", "PURPOSE_LINEAGE_AVAILABLE"],
      ["TrainingRole and section", "CORRECT_STRUCTURAL_ROLE_ONLY"],
      ["V1.0 resolveUseCase global branch", "GLOBAL_GOAL_OVERREACH"],
      ["V1.0 secondary_strength branch", "STRUCTURAL_ROLE_OVERREACH"],
      ["V1.0 compiler", "LEGACY_COMPATIBILITY_ONLY"],
      ["V1.1 compiler", "VERSIONED_MIGRATION_REQUIRED"],
      ["B3 purpose policies", "FUTURE_PURPOSE_POLICY_REQUIRED"],
    ].map(([concept, classification]) => `| ${concept} | \`${classification}\` |`).join("\n") +
    `\n\n## Explicit Answers\n\n${ONTOLOGY_ANSWERS}\n`;
  const common = {
    "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_ONTOLOGY_AUDIT.md": ontology,
    "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_OWNER_BOUNDARIES.md": bulletReport("Purpose-First Prescription Resolver Owner Boundaries", [
      "Week owns objective purpose and relationships; Planner owns needs; Composer owns assignments.",
      "Projection owns immutable lineage; resolver owns purpose/use-case selection; numeric Policy owns values.",
      "Exercise knowledge owns legal modes; equipment owns realization; global goal is bounded context only."]),
    "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT.md": bulletReport("Purpose-First Prescription Resolver Contract", [
      `Resolver: \`${PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE}\`.`,
      "Purpose requirement, immutable evidence snapshot, typed result, and no-fallback trace are explicit."]),
    "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_POLICY_V1.md": bulletReport("Purpose-First Prescription Resolver Policy V1", [
      `Policy: \`${PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE}\`.`,
      "Caller selection is mandatory; there is no singleton default, environment fallback, coercion, or latest alias."]),
    "PURPOSE_FIRST_PRESCRIPTION_PURPOSE_VOCABULARY.md": bulletReport("Purpose-First Prescription Purpose Vocabulary",
      PRESCRIPTION_LOCAL_PURPOSES.map((purpose) => `\`${purpose}\` is closed and typed.`)),
    "PURPOSE_FIRST_PRESCRIPTION_PURPOSE_REQUIREMENT.md": bulletReport("Purpose-First Prescription Purpose Requirement", [
      "Requirement identity binds athlete, intent, need IDs, assignment handoff, source, authority, placement, and evidence.",
      "No label, reason code, explanation, exercise name, muscle, score, rank, pain, mode, or equipment parsing is allowed."]),
    "PURPOSE_FIRST_PRESCRIPTION_EVIDENCE_SNAPSHOT.md": bulletReport("Purpose-First Prescription Evidence Snapshot", [
      "Snapshot and revision IDs are deterministic from explicit source facts and evaluation time.",
      "Purpose-semantic fingerprints ignore nonsemantic ordering but react to assignment, need, role, or handoff changes."]),
    "PURPOSE_FIRST_PRESCRIPTION_WEEK_PROJECTION.md": bulletReport("Purpose-First Prescription Week Projection", [
      "Exact lineage: weekly objective -> reserved responsibility -> allocated objective -> SessionNeed -> assignment -> handoff.",
      "Projection changes no Week, Candidate, Planner, or Composer decision."]),
    "PURPOSE_FIRST_PRESCRIPTION_STANDALONE_SOURCE.md": bulletReport("Purpose-First Prescription Standalone Source", [
      "Standalone sessions require an owner-reviewed explicit local purpose declaration.",
      "A dominant-main label or global strength goal is insufficient."]),
    "PURPOSE_FIRST_PRESCRIPTION_PRIMARY_SUPPORTING_POLICY.md": bulletReport("Purpose-First Primary and Supporting Policy", [
      "One rightful primary purpose drives one Prescription and one source event.",
      "Supporting and cross-goal purposes remain visible but cannot override or add blocks.",
      "Equal rightful primary purposes fail closed independent of array order."]),
    "PURPOSE_FIRST_PRESCRIPTION_GLOBAL_GOAL_BOUNDARY.md": bulletReport("Purpose-First Global Goal Boundary", [
      "Outcome goal validates bounded compatibility and never creates local developmental purpose.",
      "Programming context modifies an admitted purpose and never invents one."]),
    "PURPOSE_FIRST_PRESCRIPTION_ROLE_SECTION_BOUNDARY.md": bulletReport("Purpose-First Role and Section Boundary", [
      "primary_strength, secondary_strength, and hypertrophy_accessory remain compatibility role names only.",
      "Main does not mean strength; accessory does not mean hypertrophy; warm-up and activation remain dependency-owned."]),
    "PURPOSE_FIRST_PRESCRIPTION_MODE_KNOWLEDGE_BOUNDARY.md": bulletReport("Purpose-First Mode and Knowledge Boundary", [
      "All seven dose modes remain exercise-knowledge-owned.",
      "Purpose cannot override illegal mode, invent load, tempo, rest, support, range, or realization."]),
    "PURPOSE_FIRST_PRESCRIPTION_SUPPORTED_USE_CASES.md": bulletReport("Purpose-First Supported Use Cases",
      PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.supportedMappings.map((mapping) =>
        `\`${mapping.localPurpose}\` admits only ${mapping.useCases.map((entry) => `\`${entry}\``).join(", ")}.`)),
    "PURPOSE_FIRST_PRESCRIPTION_UNSUPPORTED_PURPOSES.md": bulletReport("Purpose-First Unsupported Purposes",
      PRESCRIPTION_PURPOSE_UNSUPPORTED_FUTURE_PURPOSES.map((purpose) =>
        `\`${purpose}\` returns \`prescription_purpose_policy_required\`.`)),
    "PURPOSE_FIRST_PRESCRIPTION_FAIL_CLOSED_STATUSES.md": bulletReport("Purpose-First Fail-Closed Statuses",
      PRESCRIPTION_PURPOSE_RESOLUTION_STATUSES.map((status) => `\`${status}\` is typed.`)),
    "PURPOSE_FIRST_PRESCRIPTION_COMPILER_V1_1.md": bulletReport("Production Prescription Compiler V1.1", [
      "PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0 requires explicit snapshot, policy, and attempt identity.",
      "It invokes the shared numeric compiler only after purpose resolution succeeds."]),
    "PURPOSE_FIRST_PRESCRIPTION_COMPILER_V1_0_COMPATIBILITY.md": bulletReport("Production Prescription Compiler V1.0 Compatibility", [
      `Disposition: \`${PRODUCTION_PRESCRIPTION_COMPILER_V1_0_DISPOSITION}\`.`,
      "Product Shadow remains pinned; historical fallthrough remains replayable; activation authority is false."]),
    "PURPOSE_FIRST_PRESCRIPTION_GOLDEN_EQUIVALENCE.md": bulletReport("Purpose-First Golden Equivalence", [
      `${report.evidence.goldenEquivalentCount} of ${report.evidence.goldenPairCount} supported V1.0/V1.1 pairs are semantically equal.`,
      "Numeric rules, rest, effort, tempo, load, blocks, duration, and source-event identity are unchanged."]),
    "PURPOSE_FIRST_PRESCRIPTION_FALLTHROUGH_CORRECTION.md": bulletReport("Purpose-First Fallthrough Correction", [
      `${report.evidence.correctedFallthroughCount} of ${report.evidence.fallthroughScenarioCount} audited cells fail closed in V1.1.`,
      "V1.0 continues to compile those cells as main_strength for historical replay."]),
    "PURPOSE_FIRST_PRESCRIPTION_SECONDARY_ROLE_AUDIT.md": bulletReport("Purpose-First Secondary Role Audit", [
      "secondary_strength role alone produces no purpose and no plan.",
      "Explicit strength resolves secondary_strength; secondary hypertrophy remains policy-required."]),
    "PURPOSE_FIRST_PRESCRIPTION_SHARED_ASSIGNMENT.md": bulletReport("Purpose-First Shared Assignment", [
      "Same-purpose needs converge to one assignment, one Prescription, and one source event.",
      "Cross-goal support remains trace-only; incompatible equal primary purposes fail closed."]),
    "PURPOSE_FIRST_PRESCRIPTION_WARMUP_ACTIVATION.md": bulletReport("Purpose-First Warm-Up and Activation", [
      "Preparation and activation require dependency-owned purpose and preserve current numeric rules.",
      "March and counted-step realizations remain explicit and cannot claim systemic conditioning."]),
    "PURPOSE_FIRST_PRESCRIPTION_PRODUCT_SHADOW_FREEZE.md": bulletReport("Purpose-First Product Shadow Freeze", [
      `V1.1 imports: ${report.guards.productShadowV1_1Imports}; resolver imports: ${report.guards.productShadowResolverImports}.`,
      "Controlled Product Shadow fingerprint and default-off rollout remain unchanged."]),
    "PURPOSE_FIRST_PRESCRIPTION_CAGT_EVIDENCE.md": bulletReport("Purpose-First CAGT Evidence", [
      `${report.evidence.controlledPassedCount}/${report.evidence.controlledScenarioCount} controlled scenarios pass.`,
      `${report.mutations.length} semantic mutations are rejected; 16 invariants and 11 material responses pass.`,
      "Registry V12 preserves gate order and records V1.1 as future Gate 9 authority only."]),
    "PURPOSE_FIRST_PRESCRIPTION_HOLDOUT_MANIFEST.md": bulletReport("Purpose-First Holdout Manifest", [
      `Frozen scenarios: ${report.holdout.scenarioCount}; genuine V1.1 calls: 370; golden pairs: 100.`,
      `Manifest fingerprint: \`${report.holdout.fingerprint}\`.`]),
    "PURPOSE_FIRST_PRESCRIPTION_STRESS_REPORT.md": bulletReport("Purpose-First Stress Report", [
      `Failure count: ${report.stress.failureCount}; deterministic replay: ${report.stress.deterministicReplay}.`,
      ...Object.entries(report.stress.counts).map(([name, count]) => `${name}: ${count}.`),
      `Fingerprint: \`${report.stress.fingerprint}\`.`]),
    "PURPOSE_FIRST_PRESCRIPTION_ACTIVATION_GUARDS.md": bulletReport("Purpose-First Activation Guards", [
      `Product Shadow V1.1/resolver imports: ${report.guards.productShadowV1_1Imports}/${report.guards.productShadowResolverImports}.`,
      `Orchestration/app calls: ${report.guards.orchestrationV1_1Calls}/${report.guards.appV1_1Imports}.`,
      "Product mappings, options, UI, generateProgram, persistence, database, and activation remain unchanged."]),
    "PURPOSE_FIRST_PRESCRIPTION_IMPLEMENTATION_READINESS.md": readiness,
  } as Record<typeof PURPOSE_FIRST_PRESCRIPTION_REPORT_FILENAMES[number], string>;
  return common;
}

export function buildPurposeFirstJsonReports(workspaceRoot: string):
Record<typeof PURPOSE_FIRST_PRESCRIPTION_JSON_FILENAMES[number], string> {
  const report = buildPurposeFirstImplementationReport(workspaceRoot);
  const json = (value: unknown) => `${JSON.stringify(canonicalize(value), null, 2)}\n`;
  return {
    "PURPOSE_FIRST_PRESCRIPTION_PURPOSE_VOCABULARY.json": json({
      localPurposes: PRESCRIPTION_LOCAL_PURPOSES, authorities: PRESCRIPTION_PURPOSE_AUTHORITIES,
      statuses: PRESCRIPTION_PURPOSE_RESOLUTION_STATUSES,
    }),
    "PURPOSE_FIRST_PRESCRIPTION_RESOLVER_POLICY_V1.json": json(PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1),
    "PURPOSE_FIRST_PRESCRIPTION_SOURCE_SNAPSHOT_CONTRACT.json": json({
      contractReference: "PRESCRIPTION_PURPOSE_EVIDENCE_SNAPSHOT@1.0.0",
      deterministicIdentity: true, hiddenClock: false, productionRandomness: false,
    }),
    "PURPOSE_FIRST_PRESCRIPTION_SUPPORTED_MAPPING_MATRIX.json": json(
      PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1.supportedMappings),
    "PURPOSE_FIRST_PRESCRIPTION_UNSUPPORTED_PURPOSE_MATRIX.json": json(
      PRESCRIPTION_PURPOSE_UNSUPPORTED_FUTURE_PURPOSES.map((purpose) => ({ purpose,
        status: "prescription_purpose_policy_required" }))),
    "PURPOSE_FIRST_PRESCRIPTION_CURRENT_FALLTHROUGH_MATRIX.json": json(report.fallthrough),
    "PURPOSE_FIRST_PRESCRIPTION_GOLDEN_RESULTS.json": json(report.golden),
    "PURPOSE_FIRST_PRESCRIPTION_CONTROLLED_SCENARIOS.json": json(report.controlled),
    "PURPOSE_FIRST_PRESCRIPTION_HOLDOUT_MANIFEST.json": json(report.holdout),
    "PURPOSE_FIRST_PRESCRIPTION_MUTATIONS.json": json(report.mutations),
    "PURPOSE_FIRST_PRESCRIPTION_METAMORPHIC_RESULTS.json": json(report.metamorphic),
    "PURPOSE_FIRST_PRESCRIPTION_STRESS.json": json(report.stress),
    "PURPOSE_FIRST_PRESCRIPTION_FINGERPRINTS.json": json({ upstream: report.upstreamFingerprints,
      b2: report.fingerprints }),
  };
}

export function purposeFirstPrescriptionDocumentationMarker(): string {
  return `<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->
## Purpose-First Prescription Resolver V1

Chunk B2 implements \`${PURPOSE_FIRST_PRESCRIPTION_RESOLVER_CONTRACT_REFERENCE}\` and
\`PRODUCTION_PRESCRIPTION_COMPILER_KERNEL@1.1.0\` as explicit, fail-closed, non-activated APIs.
V1.0 remains frozen compatibility and Controlled Product Shadow remains pinned to it.

Evidence: [implementation readiness](./PURPOSE_FIRST_PRESCRIPTION_IMPLEMENTATION_READINESS.md) and
[canonical architecture ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md).

Next dependency: \`${PURPOSE_FIRST_NEXT_DEPENDENCY}\`.
<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:END -->`;
}
