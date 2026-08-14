import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../../../..");
const sequencingDesignRoot = resolve(repositoryRoot, "packages/training-engine-v2/src/sequencing");

function TypeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return TypeScriptFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  }).sort();
}

describe("Final Session Sequencing design activation guards", () => {
  it("contains contracts only and is absent from the production package export", () => {
    const designSources = TypeScriptFiles(sequencingDesignRoot).map((file) => readFileSync(file, "utf8")).join("\n");
    const packageIndex = readFileSync(resolve(repositoryRoot, "packages/training-engine-v2/src/index.ts"), "utf8");
    expect(designSources).not.toMatch(/export\s+function|compileFinalSession|sequenceFinalSession/);
    expect(packageIndex).not.toMatch(/sequencing\/designContracts|sequenceSessionDesignOnly|SESSION_SEQUENCING_POLICY_V1/);
  });

  it("has no app, generateProgram, engine runtime, consumer, gyms, default-policy, or Product Adapter wiring", () => {
    const roots = [
      resolve(repositoryRoot, "apps"),
      resolve(repositoryRoot, "packages/engine/src"),
      resolve(repositoryRoot, "packages/training-engine-v2/src"),
    ];
    const liveFiles = roots.flatMap(TypeScriptFiles).filter((file) => !file.startsWith(`${sequencingDesignRoot}/`));
    const activationPattern = /sequenceSessionDesignOnly|FINAL_SESSION_SEQUENCING_DESIGN|SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL/;
    const violations = liveFiles.filter((file) => activationPattern.test(readFileSync(file, "utf8")))
      .map((file) => file.slice(repositoryRoot.length + 1));
    const generateProgramViolations = liveFiles.filter((file) => {
      const source = readFileSync(file, "utf8");
      return /generateProgram/.test(source) && activationPattern.test(source);
    });
    expect(violations).toEqual([]);
    expect(generateProgramViolations).toEqual([]);
  });
});
