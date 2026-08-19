import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  B4_UPDATED_DOCS,
  b4DocumentationMarker,
  buildB4JsonReports,
  renderB4MarkdownReports,
} from "../tests/cagt/equipmentExperienceContextReports";

const repositoryRoot = resolve(process.cwd(), "../..");
const outputDirectory = resolve(repositoryRoot, "docs/training-engine-v2");
mkdirSync(outputDirectory, { recursive: true });

for (const [name, content] of Object.entries(renderB4MarkdownReports())) {
  writeFileSync(resolve(outputDirectory, name), content, "utf8");
}
for (const [name, content] of Object.entries(buildB4JsonReports())) {
  writeFileSync(resolve(outputDirectory, name), `${JSON.stringify(content, null, 2)}\n`, "utf8");
}

const marker = b4DocumentationMarker();
for (const relativePath of B4_UPDATED_DOCS) {
  const path = resolve(repositoryRoot, relativePath);
  if (!existsSync(path)) throw new Error(`B4_INTEGRATION_DOCUMENT_REQUIRED:${relativePath}`);
  const current = readFileSync(path, "utf8");
  if (current.includes(marker)) continue;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${current.trimEnd()}\n\n${marker}\n`, "utf8");
}
