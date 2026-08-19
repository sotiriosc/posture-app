import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(import.meta.dirname, "../../../..");
const sequencingRoot = resolve(repositoryRoot, "packages/training-engine-v2/src/sequencing");

function TypeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return TypeScriptFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  }).sort();
}

describe("Final Session Sequencing production activation guards", () => {
  it("retains historical design contracts and explicitly exports the dormant production kernel", () => {
    const designSource = readFileSync(resolve(sequencingRoot, "designContracts.ts"), "utf8");
    const packageIndex = readFileSync(resolve(repositoryRoot, "packages/training-engine-v2/src/index.ts"), "utf8");
    const sequencingIndex = readFileSync(resolve(sequencingRoot, "index.ts"), "utf8");
    expect(designSource).not.toMatch(/export\s+function|compileFinalSession|sequenceFinalSession/);
    expect(packageIndex).toContain('export * from "./sequencing"');
    expect(sequencingIndex).toContain('export * from "./sequenceSession"');
    expect(sequencingIndex).not.toContain("designContracts");
  });

  it("activates only through controlled owner delivery, never Product, Product Shadow, or app defaults", () => {
    const roots = [
      resolve(repositoryRoot, "apps"),
      resolve(repositoryRoot, "packages/engine/src"),
      resolve(repositoryRoot, "packages/training-engine-v2/src"),
    ];
    const liveFiles = roots.flatMap(TypeScriptFiles).filter((file) => !file.startsWith(`${sequencingRoot}/`));
    const controlledOwnerPipeline = resolve(
      repositoryRoot,
      "packages/training-engine-v2/src/ownerDelivery/pipeline.ts",
    );
    const activationPattern = /\bsequenceFinalSession\b|PRODUCTION_FINAL_SESSION_SEQUENCING_KERNEL_IMPLEMENTED_NOT_ACTIVATED/;
    const activations = liveFiles.filter((file) => activationPattern.test(readFileSync(file, "utf8")));
    const violations = activations.filter((file) => file !== controlledOwnerPipeline)
      .map((file) => file.slice(repositoryRoot.length + 1));
    const generateProgramViolations = liveFiles.filter((file) => {
      const source = readFileSync(file, "utf8");
      return /generateProgram/.test(source) && activationPattern.test(source);
    });
    expect(activations).toEqual([controlledOwnerPipeline]);
    expect(violations).toEqual([]);
    expect(generateProgramViolations).toEqual([]);
  });

  it("has no test/report dependency, hidden clock, random identity, or implicit default in production sequencing", () => {
    const productionFiles = TypeScriptFiles(sequencingRoot).filter((file) => !file.endsWith("designContracts.ts"));
    const violations = productionFiles.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return [
        /from\s+["'][^"']*tests\//,
        /from\s+["'][^"']*cagt\//,
        /from\s+["'][^"']*report/i,
        /Date\.now|new Date\(|Math\.random|randomUUID/,
        /process\.env/,
        /candidateRank|candidateScore|rankingVector/,
        /REFERENCE_EXERCISES/,
      ].filter((pattern) => pattern.test(source)).map(() => file.slice(repositoryRoot.length + 1));
    });
    expect(violations).toEqual([]);
  });
});
