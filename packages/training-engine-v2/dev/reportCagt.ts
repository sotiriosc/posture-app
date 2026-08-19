import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildCagtReportData, renderCagtMarkdown } from "../tests/cagt/report";

const data = buildCagtReportData();
const docs = resolve(process.cwd(), "../../docs/training-engine-v2");
writeFileSync(resolve(docs, "CAGT_GATED_STRESS_REPORT.json"), `${JSON.stringify(data, null, 2)}\n`);
writeFileSync(resolve(docs, "CAGT_GATED_STRESS_REPORT.md"), renderCagtMarkdown(data));
process.stdout.write(`CAGT ${data.classification}: ${data.curatedPassCount}/${data.curatedPairCount} curated pairs; ${data.stress.cases} stress pairs.\n`);
