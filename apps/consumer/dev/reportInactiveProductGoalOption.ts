import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildInactiveProductGoalReportFiles } from "../tests/inactiveProductGoalOption/reports";

async function main() {
  const repositoryRoot = path.resolve(process.cwd(), "../..");
  const outputRoot = path.join(repositoryRoot, "docs/training-engine-v2");

  await mkdir(outputRoot, { recursive: true });
  const files = buildInactiveProductGoalReportFiles();
  for (const [name, contents] of files) {
    await writeFile(path.join(outputRoot, name), contents, "utf8");
  }

  console.log(`Wrote ${files.size} inactive Product goal option reports.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
