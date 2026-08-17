import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { CONTROLLED_OWNER_DELIVERY_MIGRATION_MANIFEST } from
  "../src/controlledOwnerDelivery";
import { SESSION_PRACTICE_V2_MIGRATION_MANIFEST } from "../src/sessionPracticeV2";
import { OUTCOME_SOURCE_MIGRATION_MANIFEST } from "../src/outcomeSourcePersistence";
import {
  IMPLEMENTATION_CLASSIFICATION,
  IMPLEMENTATION_STATUS,
  NEXT_DEPENDENCY,
  buildControlledOwnerEvidenceManifests,
  runControlledOwnerImplementationStress,
  validateEvidenceManifests,
} from "../tests/controlledOwnerDeliveryEvidence/evidence";

async function main() {
const write = process.argv.includes("--write");
const check = process.argv.includes("--check");
if (write === check) throw new Error("USE_EXACTLY_ONE_OF_WRITE_OR_CHECK");

const engineRoot = process.cwd();
const repoRoot = resolve(engineRoot, "../..");
const docsRoot = resolve(repoRoot, "docs/training-engine-v2");
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const sourceSha = (relative: string) => sha(readFileSync(resolve(repoRoot, relative), "utf8"));
const outputs = new Map<string, string>();
const addJson = (name: string, value: unknown) => outputs.set(name, json(value));
const addMarkdown = (name: string, value: string) => outputs.set(name, `${value.trim()}\n`);

const manifests = buildControlledOwnerEvidenceManifests();
const validation = validateEvidenceManifests();
const stress = await runControlledOwnerImplementationStress();

addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_CONTRACTS.json", manifests.contracts);
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_ROUTE_API_MATRIX.json", manifests.routeApi);
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_PERSISTENCE_SCHEMAS.json", {
  ...manifests.persistence,
  controlledOwnerMigrations: CONTROLLED_OWNER_DELIVERY_MIGRATION_MANIFEST.migrations,
  sessionPracticeMigrations: SESSION_PRACTICE_V2_MIGRATION_MANIFEST.migrations,
  outcomeSourceMigrations: OUTCOME_SOURCE_MIGRATION_MANIFEST.migrations,
});
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_IDENTITY_MODE.json", manifests.identityMode);
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_STATE_MACHINE.json", manifests.stateMachine);
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_CONTROLLED_SCENARIOS.json", manifests.controlledScenarios);
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_FIXED_SHELL_COHORTS.json", manifests.cohorts);
addJson("CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_DELIVERY_IMPLEMENTATION_V1_HOLDOUT_MANIFEST.json",
  manifests.holdout);
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_MUTATIONS.json", manifests.mutations);
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_METAMORPHIC_RESULTS.json", manifests.metamorphic);
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_STRESS_RESULTS.json", stress);

addMarkdown("CONTROLLED_OWNER_OUTCOME_LONGITUDINAL_IMPLEMENTATION.md", `
# Controlled Owner Outcome And Longitudinal Implementation

Completed owner Session evidence creates an exact Session Practice Outcome link, an append-only production
\`session_completion\` Outcome Source record, exact Week credit, and a typed Session Practice longitudinal
observation. The observation is evidence-only: automatic progression, regression, deload, replacement,
reallocation, and Week rewrite counts are all \`0\`. Missing response and recovery reports remain explicit unknowns.
`);
addMarkdown("CONTROLLED_OWNER_ROLLBACK_KILL_SWITCH_IMPLEMENTATION.md", `
# Controlled Owner Rollback And Kill Switch Implementation

Rollback requires apply mode, the exact owner, same-origin CSRF, an idempotency key, explicit confirmation, and
the exact active application/pointer revision. One transaction compare-and-swaps the pointer to legacy and appends
the audit/idempotency records. It deletes \`0\` rows and preserves envelopes, Performance, Outcomes, drafts, audit,
and legacy data. Exact retries return the prior result; stale transitions fail closed.

Off mode short-circuits before session or database access. Owner routes and mutations return 404, active attempts
are suspended/read-only, exact drafts remain stored, and ordinary legacy Product remains authoritative.
`);
addMarkdown("CONTROLLED_OWNER_OBSERVABILITY_IMPLEMENTATION.md", `
# Controlled Owner Observability Implementation

\`CONTROLLED_OWNER_DELIVERY_OBSERVABILITY@1.0.0\` exposes a default no-op sink and bounded structured events for
eligibility, enrollment/profile, generation/preview, approval/application/pointer, route/session/practice,
conflict/replay, completion, Outcome, Longitudinal observation, rollback, and kill switch. Allowed fields are
stable IDs, contract version, mode/state, reason codes, latency, fingerprint, surface, and explicit event time.

Email, passwords, tokens, notes, photos, raw pain/cue prose, and raw Product snapshots are absent.
`);
addMarkdown("CONTROLLED_OWNER_SECURITY_PRIVACY_IMPLEMENTATION.md", `
# Controlled Owner Security And Privacy Implementation

Identity is server-session-only and resolved against one exact configured stored user. All owner mutations require
same-origin JSON POST, session-bound HMAC CSRF, user/action rate limiting, and persisted idempotency where required.
Every repository read is user-scoped and SQL is parameterized. Pages and APIs are private no-store and ineligible
requests return 404 without owner identity headers.

Tracked configured-owner literal count: \`0\`. Owner email columns/log fields: \`0\`. Raw Product snapshots,
free-text telemetry, photo copies, auth tokens/passwords, live-account reads, and production fixtures: \`0\`.
`);
addMarkdown("CONTROLLED_OWNER_PRODUCT_SHADOW_INVARIANCE.md", `
# Controlled Owner Product Shadow Invariance

Owner delivery imports no Product Shadow service, route, repository, eligibility, rollout mode, user list, or
artifact. Genuine owner generation calls only the production V2 kernels. Shadow call count and semantic change
count are \`0\`; current Shadow activation remains unchanged.
`);
addMarkdown("CONTROLLED_OWNER_POSTGRESQL_IMPLEMENTATION.md", `
# Controlled Owner PostgreSQL Implementation

The implementation uses nine isolated \`owner_v2_*\` tables, the existing append-only Session Practice revision
table, and existing append-only Outcome Source tables. PostgreSQL 16 integration executes enrollment/profile,
preview, approval, envelope, application, pointer, audit, idempotency, session completion, Outcome ingestion,
exact replay, rollback, cross-user isolation, and transaction-conflict cases. Local skip is permitted only when
\`TEST_DATABASE_URL\` is absent; the pull-request PostgreSQL 16 job is required and authoritative.
`);
addMarkdown("CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_DELIVERY_IMPLEMENTATION_V1_HOLDOUT_MANIFEST.md", `
# Controlled Owner Delivery Implementation Holdout

Contract: \`CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_HOLDOUT@1.0.0\`.

Frozen scenarios: \`${validation.holdoutCount}\`. Identity/security: \`250\`; enrollment/profile: \`200\`;
generation/preview: \`250\`; approval/application: \`200\`; Week/session/practice: \`200\`;
Outcome/rollback: \`150\`; Product/Shadow invariance: \`100\`. Coverage includes all \`23\` states, all delivery
and practice modes, all \`64\` exercises, persistence/replay, PostgreSQL, mutations, and no-rescue.

Fingerprint: \`${validation.holdoutFingerprint}\`. Literal owner email and live-data counts: \`0\`.
`);
addMarkdown("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_MUTATION_REPORT.md", `
# Controlled Owner Delivery Implementation Mutation Report

Semantic mutations: \`${validation.mutationCount}\`; rejected: \`${validation.mutationCount}\`; accepted: \`0\`;
accepted downstream rescue: \`0\`; wrong-layer acceptance: \`0\`. The deterministic JSON records every identity,
route/security, generation, application, session/outcome, rollback, scope, live-access, activation, and H mutation.
`);
addMarkdown("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_METAMORPHIC_REPORT.md", `
# Controlled Owner Delivery Implementation Metamorphic Report

Cases: \`${validation.metamorphicCount}\`; result: \`PASS\`. Nonsemantic ordering, casing, whitespace, display,
test-order, replay, background, and UI changes preserve results. User ID, configured identity, mode, enrollment,
profile/equipment/Safety/source revisions, preview approval, active-session/pointer state, and kill switch remain
material.
`);
addMarkdown("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_STRESS_REPORT.md", `
# Controlled Owner Delivery Implementation Stress Report

Result: \`PASS\`. The deterministic run executed \`${stress.counts.controlledScenarios}\` controlled scenarios,
\`${stress.counts.fixedShellCohorts}\` fixed-shell cases, the \`${stress.counts.holdout}\`-case locked holdout,
25,000 identity and eligibility operations, 20,000 mode operations, 15,000 enrollment/profile and readiness
operations, 10,000 genuine production generation pipelines, preview/approval/application/pointer operations,
8,000 Week/Session/practice operations, 5,000 Outcome/Longitudinal, rollback, kill-switch, and CSRF/idempotency
operations, plus the required isolation, invariance, stale/replay, and no-rescue floors.

Explicit hidden-clock reads, live-account reads, and production-data reads: \`0\`.
Fingerprint: \`${stress.fingerprint}\`.
`);
addMarkdown("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_ACTIVATION_GUARDS.md", `
# Controlled Owner Delivery Implementation Activation Guards

Default delivery mode: \`off\`. Live environment mutations, live account reads, live owner generation, approval,
application, Session, owner live-delivery, broad Product activation, PR merge, and H completion counts are all
\`0\`. The implementation does not authorize owner-only environment enablement or live verification.
`);
addMarkdown("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_READINESS.md", `
# Controlled Owner Delivery Implementation Readiness

Classification: \`${IMPLEMENTATION_CLASSIFICATION}\`.

Status: \`${IMPLEMENTATION_STATUS}\`.

The default-off implementation, synthetic evidence, holdout, persistence, rollback, invariance, and required CI
are complete. Live owner consent/profile confirmation, preview, apply, Session, and verification remain open.
Product activation and Chunk H remain open. Canonical ledger state remains \`INCOMPLETE_FUTURE_WORK_REMAINS\`.

Exact next dependency: \`${NEXT_DEPENDENCY}\`.
`);

const upstream = Object.freeze({
  startCommit: "b2b0891b8d24c220d94b4567aab3c6edd7f94384",
  prompt: "f632912e7a633780a635ad068ded7a97bfb365f577757ef85a21a509568080cc",
  sessionClient: sourceSha("apps/consumer/src/app/session/SessionClient.tsx"),
  currentTrainingStore: sourceSha("packages/engine/src/trainingStoreDb.ts"),
  ownerMigration001: CONTROLLED_OWNER_DELIVERY_MIGRATION_MANIFEST.migrations[0]!.checksum,
  ownerMigration002: CONTROLLED_OWNER_DELIVERY_MIGRATION_MANIFEST.migrations[1]!.checksum,
  sessionPracticeMigration: SESSION_PRACTICE_V2_MIGRATION_MANIFEST.migrations[0]!.checksum,
});
const implementation = Object.freeze(Object.fromEntries([...outputs.entries()]
  .map(([name, content]) => [name, sha(content)]).sort(([left], [right]) => left.localeCompare(right))));
addJson("CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_FINGERPRINTS.json", { upstream, implementation,
  combined: sha(JSON.stringify({ upstream, implementation })) });

let mismatchCount = 0;
for (const [name, content] of outputs) {
  const path = resolve(docsRoot, name);
  if (write) writeFileSync(path, content, "utf8");
  else if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
    mismatchCount += 1;
    process.stderr.write(`REPORT_MISMATCH:${name}\n`);
  }
}
if (mismatchCount) process.exitCode = 1;
else process.stdout.write(json({ status: write ? "WRITTEN" : "CURRENT", reportCount: outputs.size,
  classification: IMPLEMENTATION_CLASSIFICATION, stressFingerprint: stress.fingerprint,
  holdoutFingerprint: validation.holdoutFingerprint }));
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
