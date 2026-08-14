import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildLongitudinalAdaptationReports,
  LONGITUDINAL_ADAPTATION_REPORT_FILENAMES,
} from "../tests/cagt/longitudinalAdaptationReport";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
  resolve(process.cwd(), "packages/training-engine-v2");
const outputRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(outputRoot, { recursive: true });
const reports = buildLongitudinalAdaptationReports();
for (const filename of LONGITUDINAL_ADAPTATION_REPORT_FILENAMES) {
  writeFileSync(resolve(outputRoot, filename), reports[filename], "utf8");
}
console.log(`Wrote ${LONGITUDINAL_ADAPTATION_REPORT_FILENAMES.length} Gate 16 design reports to ${outputRoot}`);
