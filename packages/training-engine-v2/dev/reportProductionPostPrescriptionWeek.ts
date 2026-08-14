import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  PRODUCTION_POST_PRESCRIPTION_WEEK_UPDATED_DOCS,
  buildProductionPostPrescriptionWeekReport,
  productionPostPrescriptionWeekDocAppendix,
  renderProductionPostPrescriptionWeekReports,
} from "../tests/helpers/productionPostPrescriptionWeekReport";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? resolve(process.cwd(), "../..") : process.cwd();
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
const markerStart = "<!-- PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL:START -->";
const markerEnd = "<!-- PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_KERNEL:END -->";

function upsertMarkedSection(source: string, content: string): string {
  const section = `${markerStart}\n${content.trim()}\n${markerEnd}`;
  const start = source.indexOf(markerStart);
  const end = source.indexOf(markerEnd);
  if (start >= 0 && end >= start) {
    return `${source.slice(0, start).trimEnd()}\n\n${section}\n${source.slice(end + markerEnd.length).trimStart()}`.trimEnd() + "\n";
  }
  return `${source.trimEnd()}\n\n${section}\n`;
}

async function main(): Promise<void> {
  const report = buildProductionPostPrescriptionWeekReport();
  for (const [filename, content] of Object.entries(renderProductionPostPrescriptionWeekReports(report))) {
    await writeFile(resolve(docsRoot, filename), content, "utf8");
  }
  const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
  const artifacts: Readonly<Record<string, unknown>> = {
    "PRODUCTION_POST_PRESCRIPTION_WEEK_GOLDEN_EQUIVALENCE.json": report.golden,
    "PRODUCTION_PLANNED_SOURCE_EXPOSURE_LEDGER_INTEGRITY.json": report.sourceIntegrity,
    "PRODUCTION_WEEK_OBJECTIVE_TRACES.json": report.representativeResult.objectiveRealizationTraces,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATION_RESULTS.json": report.mutations,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_STRESS_RESULTS.json": report.stress,
    "PRODUCTION_POST_PRESCRIPTION_WEEK_FINGERPRINTS.json": {
      frozen: report.frozenFingerprints,
      production: report.fingerprints,
    },
  };
  for (const [filename, value] of Object.entries(artifacts)) {
    await writeFile(resolve(docsRoot, filename), json(value), "utf8");
  }
  const appendix = productionPostPrescriptionWeekDocAppendix(report);
  for (const filename of PRODUCTION_POST_PRESCRIPTION_WEEK_UPDATED_DOCS) {
    const path = resolve(docsRoot, filename);
    await writeFile(path, upsertMarkedSection(await readFile(path, "utf8"), appendix), "utf8");
  }
  process.stdout.write(`${JSON.stringify({
    classification: report.classification,
    status: report.status,
    activation: report.activation,
    golden: report.golden.result,
    sourceIntegrity: report.sourceIntegrity,
    mutations: `${report.mutations.rejectedCount}/${report.mutations.mutationCount}`,
    stress: report.stress.result,
    combinedFingerprint: report.fingerprints.combinedProductionPostPrescriptionWeekValidatorKernel,
  }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
