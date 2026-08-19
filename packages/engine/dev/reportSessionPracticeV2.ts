import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { runSessionPracticeV2Evidence } from "../tests/sessionPracticeV2Evidence/evidence";
import { sessionPracticeV2Artifacts } from "../tests/sessionPracticeV2Evidence/reportAssembly";

const outputDirectory = fileURLToPath(new URL("../../../docs/training-engine-v2", import.meta.url));
const mode = process.argv.includes("--check") ? "check" : "write";
const chunkGDesignMarker = /\n*<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:START -->[\s\S]*?<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:END -->\n*/;
const chunkGImplementationMarker = /\n*<!-- CHUNK_G_OWNER_DELIVERY_IMPLEMENTATION:START -->[\s\S]*?<!-- CHUNK_G_OWNER_DELIVERY_IMPLEMENTATION:END -->\n*/;

function preserveChunkGDesignMarker(content: string, current: string): string {
  const markers = [current.match(chunkGDesignMarker)?.[0].trim(),
    current.match(chunkGImplementationMarker)?.[0].trim()].filter((value): value is string => value !== undefined);
  return markers.length === 0 ? content : `${content.trimEnd()}\n\n${markers.join("\n\n")}\n`;
}

async function main(): Promise<void> {
  const evidence = await runSessionPracticeV2Evidence();
  const artifacts = sessionPracticeV2Artifacts(evidence);
  mkdirSync(outputDirectory, { recursive: true });
  const stale: string[] = [];
  for (const [filename, content] of Object.entries(artifacts)) {
    const path = resolve(outputDirectory, filename);
    let current = "";
    try { current = readFileSync(path, "utf8"); } catch {
      if (mode === "check") { stale.push(filename); continue; }
    }
    if (mode === "write") writeFileSync(path, preserveChunkGDesignMarker(content, current), "utf8");
    else if (current.replace(chunkGDesignMarker, "\n").replace(chunkGImplementationMarker, "\n") !== content) {
      stale.push(filename);
    }
  }
  if (stale.length) throw new Error(`SESSION_PRACTICE_V2_REPORTS_STALE:${stale.join(",")}`);
  process.stdout.write(`${JSON.stringify({ mode, artifactCount: Object.keys(artifacts).length,
    classification: evidence.classification, controlledScenarios: evidence.controlledScenarios.length,
    holdout: evidence.holdout.length, stress: evidence.stress.result }, null, 2)}\n`);
}

void main();
