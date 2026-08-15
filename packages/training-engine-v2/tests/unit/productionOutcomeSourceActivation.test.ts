import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(__dirname, "../../../..");

function sourceFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap((name) => {
    const path = resolve(root, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(?:ts|tsx|js|mjs|cjs)$/.test(name) ? [path] : [];
  });
}

function count(root: string, pattern: RegExp): number {
  return sourceFiles(root).reduce((sum, path) => sum + (readFileSync(path, "utf8").match(pattern)?.length ?? 0), 0);
}

describe("production outcome source permanent nonactivation", () => {
  it("keeps both applications and every live receiver unwired", () => {
    const consumer = resolve(repositoryRoot, "apps/consumer/src");
    const gyms = resolve(repositoryRoot, "apps/gyms/src");
    const liveRoots = [consumer, gyms];
    for (const root of liveRoots) {
      expect(count(root, /outcome-source-persistence|outcomeSourcePersistence|ingestOutcomeSourceEnvelope/g)).toBe(0);
      expect(count(root, /applyOutcomeSourceMigrations|buildVersionedProductionOutcomeSourceSnapshot/g)).toBe(0);
    }
  });

  it("keeps production source code free of CAGT, pg, hidden clocks, and random identity", () => {
    const pureRoot = resolve(repositoryRoot, "packages/training-engine-v2/src/outcomeSources");
    expect(count(pureRoot, /from ["'][^"']*(?:tests\/cagt|\/cagt)/g)).toBe(0);
    expect(count(pureRoot, /from ["']pg["']|require\(["']pg["']\)/g)).toBe(0);
    expect(count(pureRoot, /Date\.now\(|new Date\(\)|randomUUID\(|Math\.random\(/g)).toBe(0);
  });

  it("exports persistence only through the explicit server subpath", () => {
    const engineIndex = readFileSync(resolve(repositoryRoot, "packages/engine/src/index.ts"), "utf8");
    const packageManifest = JSON.parse(readFileSync(resolve(repositoryRoot, "packages/engine/package.json"), "utf8"));
    expect(engineIndex).not.toContain("outcomeSourcePersistence");
    expect(packageManifest.exports["./outcome-source-persistence"]).toBe(
      "./src/outcomeSourcePersistence/index.ts");
  });

  it("records every forbidden runtime mutation count as zero", () => {
    const productionRoots = [resolve(repositoryRoot, "packages/training-engine-v2/src/outcomeSources"),
      resolve(repositoryRoot, "packages/engine/src/outcomeSourcePersistence")];
    const forbidden = ["generateProgram(", "evaluateLongitudinalAdaptation(", "applyDirective(",
      "mutatePrescription(", "mutateWeek(", "mutatePhase(", "registerCron(", "registerWebhook(",
      "registerQueue(", "registerConsumer("];
    for (const token of forbidden) {
      expect(productionRoots.reduce((sum, root) => sum + count(root,
        new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")), 0)).toBe(0);
    }
    const serverRoot = resolve(repositoryRoot, "packages/engine/src/outcomeSourcePersistence");
    expect(sourceFiles(serverRoot).filter((path) => !path.endsWith("cli.ts"))
      .reduce((sum, path) => sum + (readFileSync(path, "utf8").match(/applyOutcomeSourceMigrations\(/g)?.length ?? 0), 0))
      .toBe(1); // Function declaration only; no invocation.
  });
});
