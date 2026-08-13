import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildWeekPolicyV1Report, renderAdmission, renderCoherenceMatrix, renderCoherentSession,
  renderFirstCanary, renderHoldoutManifest, renderHoldoutReport, renderHorizon, renderOwnerSelection,
  renderReadiness, renderRecurrence, renderScopeCoverage, renderSessionArgument,
} from "../tests/cagt/weekPolicyV1Report";
import { WEEK_POLICY_V1_HOLDOUT_MANIFEST } from "../tests/cagt/weekPolicyV1Holdout";

const report = buildWeekPolicyV1Report();
const docs = resolve(process.cwd(), "../../docs/training-engine-v2");
const files: Readonly<Record<string, string>> = {
  "WEEK_POLICY_V1_OWNER_SELECTION.md": renderOwnerSelection(report),
  "CAGT_WEEK_POLICY_V1_ADMISSION_REPORT.md": renderAdmission(report),
  "CAGT_WEEK_POLICY_V1_ADMISSION_REPORT.json": `${JSON.stringify(report, null, 2)}\n`,
  "CAGT_WEEK_POLICY_V1_HOLDOUT_MANIFEST.md": renderHoldoutManifest(),
  "CAGT_WEEK_POLICY_V1_HOLDOUT_MANIFEST.json": `${JSON.stringify(WEEK_POLICY_V1_HOLDOUT_MANIFEST, null, 2)}\n`,
  "CAGT_WEEK_POLICY_V1_HOLDOUT_REPORT.md": renderHoldoutReport(report),
  "CAGT_WEEK_POLICY_V1_SCOPE_COVERAGE.md": renderScopeCoverage(report),
  "CAGT_COHERENT_SESSION_PROGRAM_REPORT.md": renderCoherentSession(report),
  "CAGT_WARMUP_ACTIVATION_COHERENCE_MATRIX.md": renderCoherenceMatrix(report),
  "CAGT_WARMUP_ACTIVATION_RECURRENCE_REPORT.md": renderRecurrence(report),
  "CAGT_SESSION_PROGRAM_ARGUMENT_REPORT.md": renderSessionArgument(report),
  "CAGT_FIRST_SESSION_CANARY_REPORT.md": renderFirstCanary(report),
  "CAGT_ALL_SESSIONS_HORIZON_REPORT.md": renderHorizon(report),
  "WEEK_POLICY_V1_IMPLEMENTATION_READINESS.md": renderReadiness(report),
};
for (const [name, contents] of Object.entries(files)) writeFileSync(resolve(docs, name), contents);
process.stdout.write(`${report.classification}: ${report.holdoutScenarioCount} holdout scenarios; ${report.completeDownstreamPipelineCount} complete pipelines; ${report.coherentSession.hardFailureCount} coherence failures; production activation false.\n`);
