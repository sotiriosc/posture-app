import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT,
  PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH,
  PRODUCT_GOAL_ARCHITECTURE_NEXT_DEPENDENCY,
  PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE,
  PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_STATUS,
} from "../../src/productGoalArchitecture/contracts";
import {
  buildProductTrainingGoalArchitecturePolicyFingerprints,
  productGoalArchitectureFingerprint,
} from "../../src/productGoalArchitecture/fingerprints";
import { PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1 } from
  "../../src/productGoalArchitecture/ownerPolicyV1";
import { validateProductTrainingGoalArchitecturePolicy } from
  "../../src/productGoalArchitecture/validation";
import { PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS,
  PRODUCT_TRAINING_GOAL_UPSTREAM_FINGERPRINTS } from "./productTrainingGoalAudit";
import {
  PRODUCT_GOAL_ARCHITECTURE_CAGT_SCENARIOS,
  PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE,
  buildProductGoalArchitectureCagtResult,
  buildProductGoalArchitectureMetamorphicEvidence,
  runProductGoalArchitectureMutations,
  validateProductGoalArchitectureSourceGuards,
} from "./productGoalArchitectureEvidence";
import {
  PRODUCT_GOAL_ARCHITECTURE_LINKED_DOCS,
  normalizeProductGoalArchitectureLedger,
  productGoalArchitectureLedgerFingerprint,
  productGoalArchitectureLinkGraph,
  validateProductGoalArchitectureLedgerWorkspace,
  type ProductGoalArchitectureLedgerB1State,
} from "./productGoalArchitectureLedger";

export const PRODUCT_GOAL_ARCHITECTURE_REPORT_FILENAMES = Object.freeze([
  "PRODUCT_TRAINING_GOAL_ARCHITECTURE_OWNER_POLICY_V1.md",
  "PRODUCT_TRAINING_GOAL_ARCHITECTURE_LEDGER_INTEGRATION.md",
  "PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md",
] as const);

export const PRODUCT_GOAL_ARCHITECTURE_JSON_FILENAMES = Object.freeze([
  "PRODUCT_TRAINING_GOAL_ARCHITECTURE_OWNER_POLICY_V1.json",
  "PRODUCT_TRAINING_GOAL_ARCHITECTURE_CONTRACT_FINGERPRINTS.json",
] as const);

export const PRODUCT_GOAL_ARCHITECTURE_UPDATED_DOCS = PRODUCT_GOAL_ARCHITECTURE_LINKED_DOCS;

export const PRODUCT_GOAL_ARCHITECTURE_CLASSIFICATION =
  "PRODUCT_TRAINING_GOAL_ARCHITECTURE_OWNER_POLICY_V1_READY_FOR_PURPOSE_FIRST_RESOLVER_IMPLEMENTATION_AUTHORIZATION" as const;

export const PRODUCT_GOAL_ARCHITECTURE_AUTHORITY_STATEMENT =
  "The Praxis Product Goal Architecture Ledger is the canonical owner-approved architecture record for Product training-goal vocabulary, goal priority, programming context, training mode, goal-to-purpose ownership, purpose-specific Prescription resolution, body-composition/nutrition boundaries, staged Product integration, and completion tracking." as const;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function policyJson(): string {
  return `${JSON.stringify(PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1, null, 2)}\n`;
}

function detectB1State(ledger: string): ProductGoalArchitectureLedgerB1State {
  return ledger.includes("## Chunk B1 \u2014 Canonical owner-policy contracts") ? "completed" : "future";
}

function implementationCommit(ledger: string): string | null {
  return ledger.match(/Implementation commit:\*\* `([a-f0-9]{40})`/)?.[1] ??
    ledger.match(/Implementation commit:\s*`([a-f0-9]{40})`/)?.[1] ?? null;
}

function reportModelFingerprint(report: Readonly<Record<string, unknown>>): string {
  return productGoalArchitectureFingerprint(report);
}

export function buildProductGoalArchitectureImplementationReport(workspaceRoot: string) {
  const ledger = normalizeProductGoalArchitectureLedger(readFileSync(
    resolve(workspaceRoot, PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH), "utf8"));
  const b1State = detectB1State(ledger);
  const ledgerValidation = validateProductGoalArchitectureLedgerWorkspace(workspaceRoot, b1State);
  const policyValidation = validateProductTrainingGoalArchitecturePolicy(
    PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1);
  const sourceGuardValidation = validateProductGoalArchitectureSourceGuards(
    PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE);
  const mutations = runProductGoalArchitectureMutations(ledger, b1State);
  const metamorphic = buildProductGoalArchitectureMetamorphicEvidence(ledger, b1State);
  const cagt = buildProductGoalArchitectureCagtResult();
  const linkGraph = productGoalArchitectureLinkGraph(workspaceRoot);
  const ownerDecisionModel = Object.freeze({
    authority: PRODUCT_GOAL_ARCHITECTURE_AUTHORITY_STATEMENT,
    policyReference: PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_REFERENCE,
    policyStatus: PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_STATUS,
    selectedArchitecture: PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1.prescriptionResolution.selectedArchitecture,
    productVocabulary: PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1.productVocabulary,
    b1State,
    nextDependency: PRODUCT_GOAL_ARCHITECTURE_NEXT_DEPENDENCY,
  });
  const readinessModel = Object.freeze({
    b1State,
    implementationCommit: implementationCommit(ledger),
    ledgerIssues: ledgerValidation.issues,
    policyIssues: policyValidation,
    sourceGuardIssues: sourceGuardValidation,
    mutationFailures: mutations.filter((entry) => entry.result !== "REJECTED").length,
    metamorphicInvariantFailures: metamorphic.invariantFailureCount,
    metamorphicResponseFailures: metamorphic.materialResponseFailureCount,
    artificialRuntimeDifferenceCount: cagt.artificialRuntimeDifferenceCount,
    activation: PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1.activation,
  });
  const fingerprintsWithoutCombined = Object.freeze({
    initialLedgerSeed: PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT,
    canonicalLedgerBeforeClosure: PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT,
    canonicalLedgerAfterClosure: productGoalArchitectureLedgerFingerprint(ledger),
    ...buildProductTrainingGoalArchitecturePolicyFingerprints(),
    generatedPolicyJson: sha256(policyJson()),
    ledgerValidator: productGoalArchitectureFingerprint({
      b1State, issues: ledgerValidation.issues, requiredPath: PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH,
    }),
    linkGraph: productGoalArchitectureFingerprint(linkGraph),
    ownerDecisionReport: reportModelFingerprint(ownerDecisionModel),
    mutationResults: productGoalArchitectureFingerprint(mutations),
    metamorphicResults: productGoalArchitectureFingerprint(metamorphic),
    cagtArchitectureEvidence: productGoalArchitectureFingerprint({
      scenarios: PRODUCT_GOAL_ARCHITECTURE_CAGT_SCENARIOS, result: cagt,
    }),
    readiness: reportModelFingerprint(readinessModel),
  });
  const fingerprints = Object.freeze({
    ...fingerprintsWithoutCombined,
    combinedB1ArchitectureAdmission: productGoalArchitectureFingerprint(fingerprintsWithoutCombined),
  });
  const ready = b1State === "completed" && ledgerValidation.issues.length === 0 &&
    policyValidation.length === 0 && sourceGuardValidation.length === 0 &&
    mutations.every((entry) => entry.result === "REJECTED") &&
    metamorphic.invariantFailureCount === 0 && metamorphic.materialResponseFailureCount === 0 &&
    cagt.artificialRuntimeDifferenceCount === 0;
  return Object.freeze({
    classification: ready ? PRODUCT_GOAL_ARCHITECTURE_CLASSIFICATION :
      "PRODUCT_TRAINING_GOAL_ARCHITECTURE_OWNER_POLICY_V1_SUPPORTED_SCOPE_READY_TARGETED_LEDGER_GAPS",
    authorityStatement: PRODUCT_GOAL_ARCHITECTURE_AUTHORITY_STATEMENT,
    b1State,
    implementationCommit: implementationCommit(ledger),
    ledger,
    ledgerValidation,
    policyValidation,
    sourceGuardValidation,
    mutations,
    metamorphic,
    cagt,
    linkGraph,
    ownerDecisionModel,
    readinessModel,
    fingerprints,
    upstreamFingerprints: Object.freeze({
      ...PRODUCT_TRAINING_GOAL_UPSTREAM_FINGERPRINTS,
      productTrainingGoalAudit: PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS.combinedAudit,
    }),
    productionBehaviorChanged: false,
    productBehaviorChanged: false,
    shadowRolloutChanged: false,
    v2ActivationChanged: false,
    publicProductApiChanged: false,
    nextDependency: PRODUCT_GOAL_ARCHITECTURE_NEXT_DEPENDENCY,
  });
}

function ownerPolicyMarkdown(workspaceRoot: string): string {
  const report = buildProductGoalArchitectureImplementationReport(workspaceRoot);
  const policy = PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1;
  return `# Product Training Goal Architecture Owner Policy V1

Status: \`${policy.status}\`

Contract: \`${policy.policyReference.contractReference}\`

## Authority

${report.authorityStatement}

- [Canonical owner ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md)
- [Canonical inert code contract](../../packages/training-engine-v2/src/productGoalArchitecture/ownerPolicyV1.ts)
- [Prior audit evidence](./PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md)
- [Future implementation sequence](./PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md)

## Recorded owner selection

The layered model keeps one primary and at most one ordered secondary outcome, while programming context and training mode remain separate. Local purpose owns local Prescription. The selected future resolver direction is \`G4_PURPOSE_FIRST_PLUS_G1_FAIL_CLOSED\`: unsupported purpose policy returns \`POLICY_REQUIRED\` or \`UNSUPPORTED_SCOPE\` rather than strength fallback.

Product labels are approved direction only. Toning remains unexposed under T0, with T2 clarification as future direction. Body composition and nutrition have separate future owners. Power, muscular endurance, and systemic conditioning remain visible future policy lanes.

## Non-execution boundary

The contract is inert and has no compiler, Week, Candidate/Composer, Product Shadow, app, or public root import. Current Product options, mappings, resolver fallthrough, numeric policies, and rollout are unchanged. No policy resolution or Product activation is authorized.

Combined B1 fingerprint: \`${report.fingerprints.combinedB1ArchitectureAdmission}\`.

Next dependency: \`${report.nextDependency}\`.
`;
}

function ledgerIntegrationMarkdown(workspaceRoot: string): string {
  const report = buildProductGoalArchitectureImplementationReport(workspaceRoot);
  return `# Product Training Goal Architecture Ledger Integration

## Canonical source

- Seed location: \`packages/training-engine-v2/docs/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md\`.
- Canonical path: [\`${PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH}\`](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md).
- Initial normalized seed SHA-256: \`${PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT}\`.
- Current canonical ledger SHA-256: \`${report.fingerprints.canonicalLedgerAfterClosure}\`.
- Duplicate ledger count: ${Math.max(0, report.ledgerValidation.ledgerPaths.length - 1)}.
- Current B1 state: \`${report.b1State}\`.
- Final architecture state: \`INCOMPLETE_FUTURE_WORK_REMAINS\`.

## Authority and references

${report.authorityStatement}

Code encodes the owner selection; generated reports explain and fingerprint it; linked architecture documents point here without copying the full architecture. Conflicts require owner review rather than silent reconciliation.

Link graph:

${report.linkGraph.map((entry) => `- \`${entry}\``).join("\n")}

Ledger validation issues: ${report.ledgerValidation.issues.length}. Policy validation issues: ${report.policyValidation.length}. Source-guard issues: ${report.sourceGuardValidation.length}.
`;
}

function returnLedger(workspaceRoot: string): string {
  const report = buildProductGoalArchitectureImplementationReport(workspaceRoot);
  const policy = PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1;
  const entries = [
    "starting synchronized commit: 3708876ea48dab6f38d641cb67d05da95351245c",
    `Commit A SHA: ${report.implementationCommit ?? "pending Commit A"}`,
    "Commit B SHA: recorded in Git history / final PR HEAD",
    "final PR HEAD: recorded in Git history / final PR HEAD",
    "PR state/draft/merge status: open / draft / unmerged",
    `overall classification: ${report.classification}`,
    "seed ledger location: packages/training-engine-v2/docs/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md",
    `seed normalized SHA-256: ${PRODUCT_GOAL_ARCHITECTURE_INITIAL_LEDGER_FINGERPRINT}`,
    `canonical ledger path: ${PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH}`,
    `duplicate ledger count: ${Math.max(0, report.ledgerValidation.ledgerPaths.length - 1)}`,
    `final ledger SHA-256: ${report.fingerprints.canonicalLedgerAfterClosure}`,
    `ledger authority statement: ${report.authorityStatement}`,
    `ledger required headings result: ${report.ledgerValidation.issues.filter((entry) => entry.includes("HEADING")).length === 0 ? "PASS" : "FAIL"}`,
    "final ledger state: INCOMPLETE_FUTURE_WORK_REMAINS",
    `B1 status: ${report.b1State}`,
    "B2 status: future work", "B3 status: future work", "B4 status: future work",
    "C status: future work", "D status: future work", "E status: future work", "F status: future work",
    "G status: future work", "H status: future work", "final completion template result: present and unfilled",
    `owner-policy contract ID/version: ${policy.policyReference.contractReference}`,
    `owner-policy status: ${policy.status}`,
    "canonical policy object location: packages/training-engine-v2/src/productGoalArchitecture/ownerPolicyV1.ts",
    "duplicate policy object count: 0",
    `Product vocabulary direction: ${policy.productVocabulary.map((entry) => entry.displayDirection).join("; ")}`,
    "primary/secondary policy: exactly one primary and zero or one ordered secondary; duplicates rejected",
    "programming-context policy: separate from outcome; pain-aware return is non-diagnostic context",
    "training-mode policy: develop / maintain / return_or_rebuild, separate from outcome",
    "G4 purpose-first result: owner selected, encoded, not executable",
    "G1 fail-closed result: owner selected, encoded, not executable",
    "strength boundary: loadable main strength without blanket low repetitions or maximal loading",
    "hypertrophy boundary: sufficient volume/effort across broad legal ranges without mandatory short rest/failure",
    "general-fitness boundary: coherent responsibility bundle, not universal rep range",
    "muscular-endurance boundary: local fatigue resistance, not systemic conditioning",
    "conditioning boundary: systemic/broader capacity future policy required",
    "power boundary: explicit future purpose and policy required",
    "athletic-performance boundary: structured follow-up; no silent mapping",
    "toning T0 result: intentionally not exposed",
    "toning T2 future result: structured clarification",
    "body-composition owner: separate Product/profile owner required",
    "nutrition owner: separate nutrition owner required",
    "Product mapping changed: no", "Product UI changed: no", "current resolver changed: no",
    "current fallthrough changed: no", "current fallthrough preserved as open issue: yes",
    "current Product options changed: no", "current trainingIntent=build changed: no",
    `runtime import count: ${PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE.runtimeImportCount}`,
    `Product Shadow import count: ${PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE.productShadowImportCount}`,
    `app import count: ${PRODUCT_GOAL_ARCHITECTURE_SOURCE_GUARD_BASELINE.appImportCount}`,
    "public API change result: no",
    `architecture-doc link result: ${report.linkGraph.every((entry) => entry.endsWith(":linked")) ? "PASS" : "FAIL"}`,
    "duplicate architecture prose result: none; links and purpose-specific notes only",
    `ledger validator result: ${report.ledgerValidation.issues.length === 0 ? "PASS" : "FAIL"}`,
    `mutation count/result: ${report.mutations.length}/${report.mutations.every((entry) => entry.result === "REJECTED") ? "ALL_REJECTED" : "FAIL"}`,
    `metamorphic count/result: ${report.metamorphic.invariants.length + report.metamorphic.materialResponses.length}/${report.metamorphic.invariantFailureCount + report.metamorphic.materialResponseFailureCount === 0 ? "PASS" : "FAIL"}`,
    `CAGT architecture result: ${report.cagt.result}`,
    `artificial runtime difference count: ${report.cagt.artificialRuntimeDifferenceCount}`,
    "production behavior changed: no", "Product behavior changed: no", "shadow rollout changed: no",
    "V2 activation changed: no", "upstream fingerprints: preserved in contract fingerprint JSON",
    `B1 fingerprints: ${report.fingerprints.combinedB1ArchitectureAdmission}`,
    "tests: owner policy, selection, ledger, mutation, metamorphic, CAGT, report, and activation guards",
    "CI status: resolved at PR publication", "untracked paths after completion: instruction prompt only",
    "prompt committed: no",
    "remaining owner decisions: purpose-policy admission, ambiguous mappings, UI inputs, delivery, activation",
    "remaining open policy lanes: B2-H and Future extension lanes",
    "exact rollback boundary: remove inert namespace, generated reports, and links without runtime changes",
    "blocker before B2: separate purpose-first resolver implementation authorization",
    `exact next dependency: ${report.nextDependency}`,
  ];
  return entries.map((entry, index) => `${index + 1}. ${entry}`).join("\n");
}

function readinessMarkdown(workspaceRoot: string): string {
  const report = buildProductGoalArchitectureImplementationReport(workspaceRoot);
  return `# Product Training Goal Architecture Implementation Readiness

Classification: \`${report.classification}\`

## Result

B1 is \`${report.b1State}\`. The owner ledger is canonical and incomplete, the policy object is inert, all later chunks remain open, and the current resolver/fallthrough remains unchanged for separately authorized B2 work.

- Ledger validation issues: ${report.ledgerValidation.issues.length}
- Policy validation issues: ${report.policyValidation.length}
- Source-guard issues: ${report.sourceGuardValidation.length}
- Mutations rejected: ${report.mutations.filter((entry) => entry.result === "REJECTED").length}/${report.mutations.length}
- Metamorphic checks: ${report.metamorphic.invariants.length + report.metamorphic.materialResponses.length}
- CAGT scenarios: ${report.cagt.scenarioCount}
- Artificial runtime differences: ${report.cagt.artificialRuntimeDifferenceCount}
- Product/production/shadow/activation changes: no/no/no/no

## Return ledger

${returnLedger(workspaceRoot)}
`;
}

export function buildProductGoalArchitectureMarkdownReports(workspaceRoot: string): Readonly<Record<
  typeof PRODUCT_GOAL_ARCHITECTURE_REPORT_FILENAMES[number], string>> {
  return Object.freeze({
    "PRODUCT_TRAINING_GOAL_ARCHITECTURE_OWNER_POLICY_V1.md": ownerPolicyMarkdown(workspaceRoot),
    "PRODUCT_TRAINING_GOAL_ARCHITECTURE_LEDGER_INTEGRATION.md": ledgerIntegrationMarkdown(workspaceRoot),
    "PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md": readinessMarkdown(workspaceRoot),
  });
}

export function buildProductGoalArchitectureJsonReports(workspaceRoot: string): Readonly<Record<
  typeof PRODUCT_GOAL_ARCHITECTURE_JSON_FILENAMES[number], string>> {
  const report = buildProductGoalArchitectureImplementationReport(workspaceRoot);
  return Object.freeze({
    "PRODUCT_TRAINING_GOAL_ARCHITECTURE_OWNER_POLICY_V1.json": policyJson(),
    "PRODUCT_TRAINING_GOAL_ARCHITECTURE_CONTRACT_FINGERPRINTS.json": `${JSON.stringify({
      initialLedgerLocation: "packages/training-engine-v2/docs/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md",
      canonicalLedgerPath: PRODUCT_GOAL_ARCHITECTURE_LEDGER_PATH,
      fingerprints: report.fingerprints,
      upstream: report.upstreamFingerprints,
      policyValidation: report.policyValidation,
      ledgerValidation: report.ledgerValidation.issues,
      sourceGuardValidation: report.sourceGuardValidation,
      mutations: report.mutations,
      metamorphic: report.metamorphic,
      cagt: report.cagt,
    }, null, 2)}\n`,
  });
}

export function productGoalArchitectureDocumentationMarker(): string {
  return `<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:START -->
## Product Goal Architecture Ledger

The [Praxis Product Goal Architecture Ledger](./PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md) is the canonical owner-approved architecture record for Product vocabulary, ordered goal priority, context/mode separation, purpose-first Prescription direction, owner boundaries, staged integration, and completion tracking. This document remains purpose-specific and does not duplicate or override that ledger.

The admitted contract is inert, unexported from the package root, and non-executable. Current Product, compiler, Week, Candidate/Composer, Shadow, and activation behavior remains unchanged. B2 and every later chunk require separate authorization.
<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:END -->`;
}
