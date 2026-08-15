import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildSupportedPurposeJsonReports, renderSupportedPurposeMarkdownReports } from
  "../tests/cagt/supportedGoalLocalPurposeReports";

const outputDirectory = resolve(process.cwd(), "../../docs/training-engine-v2");
mkdirSync(outputDirectory, { recursive: true });

for (const [name, content] of Object.entries(renderSupportedPurposeMarkdownReports())) {
  writeFileSync(resolve(outputDirectory, name), content, "utf8");
}
for (const [name, content] of Object.entries(buildSupportedPurposeJsonReports())) {
  writeFileSync(resolve(outputDirectory, name), `${JSON.stringify(content, null, 2)}\n`, "utf8");
}
