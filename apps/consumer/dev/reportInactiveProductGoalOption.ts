import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildInactiveProductGoalReportFiles } from "../tests/inactiveProductGoalOption/reports";

const preG1Pattern = /\n*<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:START -->[\s\S]*?<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:END -->\n?/;

async function main() {
  const repositoryRoot = path.resolve(process.cwd(), "../..");
  const outputRoot = path.join(repositoryRoot, "docs/training-engine-v2");

  await mkdir(outputRoot, { recursive: true });
  const files = buildInactiveProductGoalReportFiles();
  for (const [name, contents] of files) {
    const outputPath = path.join(outputRoot, name);
    const existing = name.endsWith(".md")
      ? await readFile(outputPath, "utf8").catch(() => "")
      : "";
    const preG1Marker = existing.match(preG1Pattern)?.[0]?.trim() ?? "";
    await writeFile(outputPath, preG1Marker ? `${contents.trimEnd()}\n\n${preG1Marker}\n` : contents,
      "utf8");
  }

  console.log(`Wrote ${files.size} inactive Product goal option reports.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
