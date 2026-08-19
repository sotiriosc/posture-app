import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildWeekPolicyTournamentReport, computeWeekPolicyTournamentFingerprints,
  renderAdmissionReadinessMarkdown, renderAtomicResultsMarkdown,
  renderCompositeResultsMarkdown, renderDuplicationMarkdown, renderHoldoutMarkdown,
  renderOwnerRecommendationMarkdown, renderParetoMarkdown, renderSearchCostMarkdown,
  renderWeekPolicyTournamentMarkdown,
} from "../tests/cagt/weekPolicyTournamentReport";
import { digest } from "../tests/cagt/signatures";

const report = buildWeekPolicyTournamentReport();
const fingerprints = computeWeekPolicyTournamentFingerprints();
const { scenarioEvidence, ...reportSummary } = report;
const docs = resolve(process.cwd(), "../../docs/training-engine-v2");
const files: Readonly<Record<string, string>> = {
  "CAGT_WEEKLY_NUMERIC_POLICY_TOURNAMENT.md": renderWeekPolicyTournamentMarkdown(report),
  "CAGT_WEEKLY_NUMERIC_POLICY_TOURNAMENT.json": `${JSON.stringify({ ...reportSummary,
    scenarioEvidenceCount: scenarioEvidence.length, scenarioEvidenceFingerprint: digest(scenarioEvidence), fingerprints }, null, 2)}\n`,
  "CAGT_WEEKLY_ATOMIC_POLICY_RESULTS.md": renderAtomicResultsMarkdown(report),
  "CAGT_WEEKLY_COMPOSITE_POLICY_RESULTS.md": renderCompositeResultsMarkdown(report),
  "CAGT_WEEKLY_POLICY_PARETO_FRONTIER.md": renderParetoMarkdown(report),
  "CAGT_WEEKLY_POLICY_HOLDOUT_REPORT.md": renderHoldoutMarkdown(report),
  "CAGT_WEEKLY_POLICY_DUPLICATION_REPORT.md": renderDuplicationMarkdown(report),
  "CAGT_WEEKLY_POLICY_SEARCH_COST_REPORT.md": renderSearchCostMarkdown(report),
  "CAGT_WEEKLY_POLICY_OWNER_RECOMMENDATION.md": renderOwnerRecommendationMarkdown(report),
  "CAGT_WEEKLY_POLICY_ADMISSION_READINESS.md": renderAdmissionReadinessMarkdown(report),
};
for (const [name, contents] of Object.entries(files)) writeFileSync(resolve(docs, name), contents);
process.stdout.write(`${report.classification}: ${report.scenarioEvaluationCount} evaluations; ${report.completeDownstreamPipelineCount} complete pipelines; production activation false.\n`);
