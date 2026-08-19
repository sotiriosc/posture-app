import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  POST_PRESCRIPTION_WEEK_UPDATED_DOCS,
  buildPostPrescriptionWeekValidationReportData,
  postPrescriptionWeekDocAppendix,
  renderPostPrescriptionWeekReports,
} from "../tests/helpers/postPrescriptionWeekValidationReport";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? resolve(process.cwd(), "../..")
  : process.cwd();
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
const markerStart = "<!-- POST_PRESCRIPTION_WEEK_VALIDATION_V1:START -->";
const markerEnd = "<!-- POST_PRESCRIPTION_WEEK_VALIDATION_V1:END -->";

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
  const data = buildPostPrescriptionWeekValidationReportData();
  const reports = renderPostPrescriptionWeekReports(data);
  for (const [filename, content] of Object.entries(reports)) {
    await writeFile(resolve(docsRoot, filename), content, "utf8");
  }
  const appendix = postPrescriptionWeekDocAppendix(data);
  for (const filename of POST_PRESCRIPTION_WEEK_UPDATED_DOCS) {
    const path = resolve(docsRoot, filename);
    const source = await readFile(path, "utf8");
    await writeFile(path, upsertMarkedSection(source, appendix), "utf8");
  }
  process.stdout.write(`${JSON.stringify({
    classification: data.classification,
    ontologyClassification: data.ontologyClassification,
    holdout: data.holdout,
    aggregateIntegrity: data.aggregateIntegrity,
    warmupActivation: data.warmupActivation,
    stress: data.stress,
    fingerprints: data.fingerprints,
  }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
