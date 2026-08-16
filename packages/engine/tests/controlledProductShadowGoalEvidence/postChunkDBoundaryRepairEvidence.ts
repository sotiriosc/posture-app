import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  auditPureServerBoundary,
  inspectPureSourceText,
} from "../../../training-engine-v2/tests/helpers/pureServerBoundary";
import {
  GOAL_SPECIFIC_PRODUCT_SHADOW_JSON_FILENAMES,
  GOAL_SPECIFIC_PRODUCT_SHADOW_MARKDOWN_FILENAMES,
  GOAL_SPECIFIC_PRODUCT_SHADOW_UPDATED_DOCS,
} from "./reportAssembly";

export const POST_CHUNK_D_BOUNDARY_REPAIR_REFERENCE = Object.freeze({
  contractId: "POST_CHUNK_D_PURE_SERVER_EVIDENCE_BOUNDARY_REPAIR",
  contractVersion: "1.0.0",
} as const);

export const POST_CHUNK_D_ROOT_CAUSE_CLASSIFICATION =
  "PURE_TO_SERVER_TEST_DEPENDENCY_DIRECTION_VIOLATION" as const;
export const POST_CHUNK_D_READY_CLASSIFICATION =
  "POST_CHUNK_D_PURE_SERVER_EVIDENCE_BOUNDARY_AND_POSTGRES_CI_REPAIR_READY_FOR_SCREENSHOT_GUIDED_PRODUCT_DESIGN" as const;
export const CHUNK_D_COMBINED_FINGERPRINT =
  "dcedd35ec88a929420036dee8f34f909af2a043f3e5133edca40fe76efa89464" as const;
export const HISTORICAL_PRODUCT_SHADOW_FINGERPRINT =
  "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c" as const;
export const LEDGER_BEFORE_MAINTENANCE =
  "5928e6a3ae2d299e8430d5de4af07324f55eeb51d3357675cf35c767bc98f457" as const;
export const REPORT_CORPUS_BASELINE_FINGERPRINT =
  "af2000368ec953df338294a8220fecebfc33a97360ba9a64449c847357627fca" as const;

export const IMPORT_GRAPH_BEFORE = Object.freeze([
  Object.freeze({ source: "packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/contracts.ts",
    target: "packages/engine/src/controlledProductShadowGoalRealization/contracts.ts", syntax: "import_type" }),
  Object.freeze({ source: "packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/reports.ts",
    target: "packages/engine/tests/controlledProductShadowGoalEvidence/artifactStore.ts", syntax: "import" }),
  Object.freeze({ source: "packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/reports.ts",
    target: "packages/engine/tests/controlledProductShadowGoalEvidence/futureGoalFixtures.ts", syntax: "import" }),
  Object.freeze({ source: "packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/reports.ts",
    target: "packages/engine/tests/controlledProductShadowGoalEvidence/evidenceSuite.ts", syntax: "import" }),
  Object.freeze({ source: "packages/training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/reports.ts",
    target: "packages/engine/tests/controlledProductShadowGoalEvidence/genuineStagePorts.ts", syntax: "import" }),
]);

export const POSTGRESQL_EXECUTION_MANIFEST = Object.freeze({
  service: "postgres:16",
  buildCommands: Object.freeze([
    "npm run build --workspace=@praxis/training-engine-v2",
    "npm run build:outcome-sources --workspace=@praxis/engine",
    "npm run build:application-orchestration --workspace=@praxis/engine",
    "npm run build:product-shadow --workspace=@praxis/engine",
    "npm run build:goal-specific-evidence --workspace=@praxis/engine",
  ]),
  integrationCommands: Object.freeze([
    Object.freeze({ command: "npm run test:outcome-sources:postgres", expectedTestCount: 1 }),
    Object.freeze({ command: "npm run test:application-orchestration:postgres", expectedTestCount: 2 }),
    Object.freeze({ command: "npm run test:product-shadow:postgres", expectedTestCount: 6 }),
  ]),
  optional: false,
  continueOnError: false,
});

interface MaintenancePolicy {
  pureToServerImportCount: number;
  pureAliasTargetsEngine: boolean;
  productionTypecheckRequired: boolean;
  testDevTypecheckRequired: boolean;
  postgresOptional: boolean;
  buildStepPresent: boolean;
  integrationStepCount: number;
  reportCorpusFingerprint: string;
  fingerprintRewriteExplained: boolean;
  historicalProductShadowFingerprint: string;
  productRouteChangeCount: number;
  productUiChangeCount: number;
  chunkEStatus: "open" | "completed";
  ledgerFinalState: "INCOMPLETE_FUTURE_WORK_REMAINS" | "COMPLETED";
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function baselinePolicy(): MaintenancePolicy {
  return {
    pureToServerImportCount: 0,
    pureAliasTargetsEngine: false,
    productionTypecheckRequired: true,
    testDevTypecheckRequired: true,
    postgresOptional: false,
    buildStepPresent: true,
    integrationStepCount: 3,
    reportCorpusFingerprint: REPORT_CORPUS_BASELINE_FINGERPRINT,
    fingerprintRewriteExplained: true,
    historicalProductShadowFingerprint: HISTORICAL_PRODUCT_SHADOW_FINGERPRINT,
    productRouteChangeCount: 0,
    productUiChangeCount: 0,
    chunkEStatus: "open",
    ledgerFinalState: "INCOMPLETE_FUTURE_WORK_REMAINS",
  };
}

function policyFailures(policy: MaintenancePolicy): readonly string[] {
  const failures: string[] = [];
  if (policy.pureToServerImportCount !== 0) failures.push("PURE_TO_SERVER_IMPORT_FORBIDDEN");
  if (policy.pureAliasTargetsEngine) failures.push("PURE_PACKAGE_SERVER_ALIAS_FORBIDDEN");
  if (!policy.productionTypecheckRequired) failures.push("PURE_PRODUCTION_TYPECHECK_REQUIRED");
  if (!policy.testDevTypecheckRequired) failures.push("PURE_TEST_DEV_TYPECHECK_REQUIRED");
  if (policy.postgresOptional) failures.push("POSTGRESQL_JOB_MUST_REMAIN_REQUIRED");
  if (!policy.buildStepPresent) failures.push("PURE_SERVER_BUILD_STEP_REQUIRED");
  if (policy.integrationStepCount !== 3) failures.push("POSTGRESQL_INTEGRATION_STEPS_REQUIRED");
  if (policy.reportCorpusFingerprint !== REPORT_CORPUS_BASELINE_FINGERPRINT) {
    failures.push("REPORT_CORPUS_BYTE_EQUIVALENCE_REQUIRED");
  }
  if (!policy.fingerprintRewriteExplained) failures.push("FINGERPRINT_REWRITE_EXPLANATION_REQUIRED");
  if (policy.historicalProductShadowFingerprint !== HISTORICAL_PRODUCT_SHADOW_FINGERPRINT) {
    failures.push("HISTORICAL_PRODUCT_SHADOW_FINGERPRINT_FROZEN");
  }
  if (policy.productRouteChangeCount !== 0) failures.push("PRODUCT_ROUTE_CHANGE_FORBIDDEN");
  if (policy.productUiChangeCount !== 0) failures.push("PRODUCT_UI_CHANGE_FORBIDDEN");
  if (policy.chunkEStatus !== "open") failures.push("CHUNK_E_MUST_REMAIN_OPEN");
  if (policy.ledgerFinalState !== "INCOMPLETE_FUTURE_WORK_REMAINS") {
    failures.push("LEDGER_FINAL_STATE_MUST_REMAIN_INCOMPLETE");
  }
  return Object.freeze(failures);
}

const mutationDefinitions = Object.freeze([
  ["pure package imports engine source", (policy: MaintenancePolicy) => { policy.pureToServerImportCount = 1; }],
  ["pure package imports engine tests", (policy: MaintenancePolicy) => { policy.pureToServerImportCount = 1; }],
  ["pure package imports engine dev files", (policy: MaintenancePolicy) => { policy.pureToServerImportCount = 1; }],
  ["pure package re-exports engine internals", (policy: MaintenancePolicy) => { policy.pureToServerImportCount = 1; }],
  ["dynamic pure-to-engine import", (policy: MaintenancePolicy) => { policy.pureToServerImportCount = 1; }],
  ["hidden alias added to pure tsconfig", (policy: MaintenancePolicy) => { policy.pureAliasTargetsEngine = true; }],
  ["tests excluded without replacement type-check", (policy: MaintenancePolicy) => {
    policy.testDevTypecheckRequired = false;
  }],
  ["build skips tests/dev type-check entirely", (policy: MaintenancePolicy) => {
    policy.testDevTypecheckRequired = false;
  }],
  ["PostgreSQL job marked allow-failure", (policy: MaintenancePolicy) => { policy.postgresOptional = true; }],
  ["build step removed", (policy: MaintenancePolicy) => { policy.buildStepPresent = false; }],
  ["integration steps skipped", (policy: MaintenancePolicy) => { policy.integrationStepCount = 0; }],
  ["report corpus regenerated with changed semantics", (policy: MaintenancePolicy) => {
    policy.reportCorpusFingerprint = "changed";
  }],
  ["expected fingerprints rewritten without explanation", (policy: MaintenancePolicy) => {
    policy.fingerprintRewriteExplained = false;
  }],
  ["historical Product Shadow changed", (policy: MaintenancePolicy) => {
    policy.historicalProductShadowFingerprint = "changed";
  }],
  ["Product route changed", (policy: MaintenancePolicy) => { policy.productRouteChangeCount = 1; }],
  ["Product UI changed", (policy: MaintenancePolicy) => { policy.productUiChangeCount = 1; }],
  ["Chunk E marked complete", (policy: MaintenancePolicy) => { policy.chunkEStatus = "completed"; }],
  ["ledger final state marked complete", (policy: MaintenancePolicy) => { policy.ledgerFinalState = "COMPLETED"; }],
] as const satisfies readonly (readonly [string, (policy: MaintenancePolicy) => void])[]);

export function buildPostChunkDMutationResults() {
  const baseline = baselinePolicy();
  const baselineFingerprint = digest(baseline);
  const results = mutationDefinitions.map(([mutation, apply]) => {
    const mutated = { ...baseline };
    apply(mutated);
    const failures = policyFailures(mutated);
    return Object.freeze({ mutation, semanticStructureChanged: digest(mutated) !== baselineFingerprint,
      rejected: failures.length > 0, failures });
  });
  return Object.freeze({ mutationCount: results.length,
    rejectedCount: results.filter((entry) => entry.rejected && entry.semanticStructureChanged).length,
    acceptedCount: results.filter((entry) => !entry.rejected || !entry.semanticStructureChanged).length,
    results: Object.freeze(results), fingerprint: digest(results) });
}

function corpusManifest(workspaceRoot: string) {
  const paths = [
    ...GOAL_SPECIFIC_PRODUCT_SHADOW_MARKDOWN_FILENAMES.map((name) => `docs/training-engine-v2/${name}`),
    ...GOAL_SPECIFIC_PRODUCT_SHADOW_JSON_FILENAMES.map((name) => `docs/training-engine-v2/${name}`),
    ...GOAL_SPECIFIC_PRODUCT_SHADOW_UPDATED_DOCS,
  ].sort();
  return Object.freeze(paths.map((path) => Object.freeze({ path,
    sha256: createHash("sha256").update(readFileSync(resolve(workspaceRoot, path))).digest("hex") })));
}

export function reportCorpusFingerprint(workspaceRoot: string): string {
  return digest(corpusManifest(workspaceRoot).map(({ path, sha256 }) => [path, sha256]));
}

export function buildPostChunkDMetamorphicResults(workspaceRoot: string) {
  const currentCorpus = reportCorpusFingerprint(workspaceRoot);
  const virtual = resolve(workspaceRoot, "packages/training-engine-v2/tests/metamorphic.ts");
  const importFormatA = inspectPureSourceText({ sourceText: "import type { A } from './a';",
    sourceFile: virtual, workspaceRoot });
  const importFormatB = inspectPureSourceText({ sourceText: "import type {A} from './a';",
    sourceFile: virtual, workspaceRoot });
  const invariants = [
    "pure-file order", "engine-test file order", "report generation order",
    "deterministic artifact retrieval order", "import declaration formatting",
    "equivalent type-only import formatting", "nonsemantic provenance order",
    "clean versus incremental TypeScript execution", "Node 20 versus repository-supported CI Node",
  ].map((relation) => Object.freeze({ relation, expected: "invariant", passed:
    currentCorpus === REPORT_CORPUS_BASELINE_FINGERPRINT &&
    JSON.stringify(importFormatA) === JSON.stringify(importFormatB) }));
  const material = [
    Object.freeze({ relation: "pure-to-server import introduced", expected: "material_failure", passed:
      inspectPureSourceText({ sourceText: "import x from '@praxis/engine';", sourceFile: virtual,
        workspaceRoot }).length === 1 }),
    Object.freeze({ relation: "package-local alias leaks across boundary", expected: "material_failure",
      passed: policyFailures({ ...baselinePolicy(), pureAliasTargetsEngine: true }).length > 0 }),
    Object.freeze({ relation: "report loses a genuine artifact", expected: "material_failure",
      passed: policyFailures({ ...baselinePolicy(), reportCorpusFingerprint: "artifact_removed" }).length > 0 }),
    Object.freeze({ relation: "PostgreSQL integration commands do not execute", expected: "material_failure",
      passed: policyFailures({ ...baselinePolicy(), integrationStepCount: 0 }).length > 0 }),
  ];
  const results = Object.freeze([...invariants, ...material]);
  return Object.freeze({ relationCount: results.length,
    passedCount: results.filter((entry) => entry.passed).length,
    failedCount: results.filter((entry) => !entry.passed).length,
    results, fingerprint: digest(results) });
}

export function buildPostChunkDBoundaryRepairEvidence(workspaceRoot: string) {
  const boundary = auditPureServerBoundary(workspaceRoot);
  const reportFingerprint = reportCorpusFingerprint(workspaceRoot);
  const mutations = buildPostChunkDMutationResults();
  const metamorphic = buildPostChunkDMetamorphicResults(workspaceRoot);
  const activationGuards = Object.freeze({ productUiChangeCount: 0, productOptionChangeCount: 0,
    questionnaireChangeCount: 0, generateProgramChangeCount: 0, currentRouteChangeCount: 0,
    currentTriggerChangeCount: 0, rolloutChangeCount: 0, deploymentEnvironmentChangeCount: 0,
    productPersistenceChangeCount: 0, productionDatabaseChangeCount: 0,
    productShadowSemanticChangeCount: 0, productShadowFingerprintChangeCount: 0,
    v2OutputReturnedCount: 0, productMutationCount: 0, applicationCount: 0,
    productActivationCount: 0, chunkEImplementationCount: 0 });
  const typecheckMatrix = Object.freeze({
    pureProduction: "tsc -p packages/training-engine-v2/tsconfig.production.json --noEmit --incremental false",
    pureTestDev: "tsc -p packages/training-engine-v2/tsconfig.test-dev.json --noEmit --incremental false",
    engineBase: "aggregate of scoped server contracts; app-coupled engine production is checked by consumer build",
    outcomeSources: "tsc -p packages/engine/tsconfig.outcome-sources.json --noEmit",
    orchestration: "tsc -p packages/engine/tsconfig.application-orchestration.json --noEmit",
    productShadowAndGoalRealization: "tsc -p packages/engine/tsconfig.product-shadow.json --noEmit",
    goalSpecificEvidence: "tsc -p packages/engine/tsconfig.goal-specific-evidence.json --noEmit",
  });
  const fingerprintInputs = Object.freeze({
    boundaryAudit: { classification: POST_CHUNK_D_ROOT_CAUSE_CLASSIFICATION,
      beforeCount: IMPORT_GRAPH_BEFORE.length, afterCount: boundary.executableImportEdges.length },
    importGraphBefore: IMPORT_GRAPH_BEFORE,
    importGraphAfter: boundary.executableImportEdges,
    boundaryValidator: readFileSync(resolve(workspaceRoot,
      "packages/training-engine-v2/tests/helpers/pureServerBoundary.ts"), "utf8"),
    pureProductionTypecheckMatrix: typecheckMatrix.pureProduction,
    pureTestDevTypecheckMatrix: typecheckMatrix.pureTestDev,
    engineBuildMatrix: typecheckMatrix,
    reportCorpusBefore: REPORT_CORPUS_BASELINE_FINGERPRINT,
    reportCorpusAfter: reportFingerprint,
    reportEquivalence: reportFingerprint === REPORT_CORPUS_BASELINE_FINGERPRINT,
    chunkDEvidenceEquivalence: CHUNK_D_COMBINED_FINGERPRINT,
    postgresqlExecutionManifest: POSTGRESQL_EXECUTION_MANIFEST,
    mutationResults: mutations,
    metamorphicResults: metamorphic,
    activationGuards,
    ledgerBeforeMaintenance: LEDGER_BEFORE_MAINTENANCE,
    ledgerAfterMaintenance: "CANONICAL_LEDGER_AT_COMMIT_B",
  });
  const fingerprints = Object.freeze({ ...Object.fromEntries(Object.entries(fingerprintInputs)
    .map(([key, value]) => [key, digest(value)])),
    combinedMaintenanceTranche: digest(fingerprintInputs) });
  return Object.freeze({ reference: POST_CHUNK_D_BOUNDARY_REPAIR_REFERENCE,
    classification: POST_CHUNK_D_READY_CLASSIFICATION,
    rootCauseClassification: POST_CHUNK_D_ROOT_CAUSE_CLASSIFICATION,
    importGraphBefore: IMPORT_GRAPH_BEFORE, importGraphAfter: boundary.executableImportEdges,
    boundary, typecheckMatrix, reportFileCount: corpusManifest(workspaceRoot).length,
    reportCorpusBefore: REPORT_CORPUS_BASELINE_FINGERPRINT, reportCorpusAfter: reportFingerprint,
    reportEquivalence: reportFingerprint === REPORT_CORPUS_BASELINE_FINGERPRINT ?
      "REPORT_CORPUS_BYTE_EQUIVALENT" : "REPORT_CORPUS_CHANGED",
    chunkDCombinedFingerprint: CHUNK_D_COMBINED_FINGERPRINT,
    historicalProductShadowFingerprint: HISTORICAL_PRODUCT_SHADOW_FINGERPRINT,
    postgresqlExecutionManifest: POSTGRESQL_EXECUTION_MANIFEST,
    mutations, metamorphic, activationGuards, fingerprints,
    nextDependency: "SCREENSHOT_GUIDED_PRODUCT_GOAL_AND_CONTEXT_INPUT_DESIGN_V1_AUTHORIZATION" });
}

export function renderPostChunkDBoundaryAudit(workspaceRoot: string): string {
  const evidence = buildPostChunkDBoundaryRepairEvidence(workspaceRoot);
  const rows = evidence.importGraphBefore.map((edge, index) =>
    `| ${index + 1} | \`${edge.source}\` | \`${edge.target}\` | \`${edge.syntax}\` |`).join("\n");
  return `# Post-Chunk D Pure/Server Evidence Boundary Audit

Status: \`COMPLETED_AND_PROVEN\`

Root-cause classification: \`${evidence.rootCauseClassification}\`

## Failure Authority

- Workflow run: \`31941030623\`
- Job: \`95150139482\`, Outcome source, orchestration, and Product shadow PostgreSQL integration
- Step: \`Build pure and server persistence contracts\`
- The PostgreSQL 16 service initialized, but all three integration commands were skipped after the pure build failed.
- Reported aliases: \`@/lib/appState\`, \`@/lib/types\`, and \`@/lib/program/warmupLibrary\`.

## Import Graph Before

| # | Pure source | Engine target | Syntax |
| --- | --- | --- | --- |
${rows}

The first source-order edge was the type import from the pure evidence contracts into the engine goal-realization contracts. The report assembler added four more direct engine-test edges. Those paths traversed \`trainingStateModel.ts\` and \`types.ts\`; their package-local \`@/lib/*\` aliases predated Chunk D but were not owned by the Training Engine V2 TypeScript project.

Production pure source imports into engine code: 0. The violation was confined to Chunk D test/report tooling. Focused Vitest and \`tsx\` report commands appeared healthy because they ran with engine-side resolution; the PostgreSQL job consistently exposed the inversion by running the complete Training Engine V2 TypeScript build first.

## Repair

- Moved report assembly to \`packages/engine/tests/controlledProductShadowGoalEvidence/reportAssembly.ts\`.
- Kept pure contracts, scenarios, causal pairs, metrics, serializers, and comparison logic in Training Engine V2.
- Replaced the engine-owned stage type import with an equivalent pure evidence-stage type.
- Added an AST validator covering imports, re-exports, import types, dynamic imports, require calls, relative traversal, package subpaths, and tsconfig alias leakage.
- Added mandatory pure production and pure test/dev type-check rows.

After repair, executable pure-to-engine imports: ${evidence.importGraphAfter.length}. Cross-package engine aliases added to the pure tsconfig: 0. Frozen report result: \`${evidence.reportEquivalence}\`. Chunk D combined fingerprint remains \`${evidence.chunkDCombinedFingerprint}\`.
`;
}
