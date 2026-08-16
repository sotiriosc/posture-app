import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  CHUNK_C_UPDATED_DOCS,
  buildChunkCJsonReports,
  chunkCDocumentationMarker,
  renderChunkCMarkdownReports,
} from "../tests/cagt/controlledProductShadowGoalRealizationReports";

async function main() {
  const repositoryRoot = resolve(process.cwd(), "../..");
  const outputDirectory = resolve(repositoryRoot, "docs/training-engine-v2");
  mkdirSync(outputDirectory, { recursive: true });

  for (const [name, content] of Object.entries(await renderChunkCMarkdownReports())) {
    writeFileSync(resolve(outputDirectory, name), content, "utf8");
  }
  for (const [name, content] of Object.entries(await buildChunkCJsonReports())) {
    writeFileSync(resolve(outputDirectory, name), `${JSON.stringify(content, null, 2)}\n`, "utf8");
  }

  const marker = chunkCDocumentationMarker();
  for (const relativePath of CHUNK_C_UPDATED_DOCS) {
    const path = resolve(repositoryRoot, relativePath);
    if (!existsSync(path)) throw new Error(`CHUNK_C_INTEGRATION_DOCUMENT_REQUIRED:${relativePath}`);
    const current = readFileSync(path, "utf8");
    if (current.includes("<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->")) continue;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${current.trimEnd()}\n\n${marker}\n`, "utf8");
  }
}

void main();
