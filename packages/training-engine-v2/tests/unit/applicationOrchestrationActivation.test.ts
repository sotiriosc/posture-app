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

describe("adaptation application orchestration permanent nonactivation", () => {
  it("keeps consumer and gyms apps completely unwired", () => {
    const pattern = /applicationOrchestration|adaptation-application-orchestration|orchestrateAdaptationApplication/g;
    expect(count(resolve(repositoryRoot, "apps/consumer/src"), pattern)).toBe(0);
    expect(count(resolve(repositoryRoot, "apps/gyms/src"), pattern)).toBe(0);
  });

  it("keeps the pure kernel free of persistence, CAGT, hidden clocks, environment, and randomness", () => {
    const root = resolve(repositoryRoot, "packages/training-engine-v2/src/applicationOrchestration");
    expect(count(root, /from ["'][^"']*(?:tests|cagt)/gi)).toBe(0);
    expect(count(root, /from ["']pg["']|process\.env|Date\.now\(|new Date\(\)|randomUUID\(|Math\.random\(/g)).toBe(0);
    expect(count(root, /sessionAdaptation|sessionAdaptationPreview|generateProgram\(/g)).toBe(0);
  });

  it("contains no Product mutation, automatic trigger, route, queue, cron, or webhook", () => {
    const roots = [resolve(repositoryRoot, "packages/training-engine-v2/src/applicationOrchestration"),
      resolve(repositoryRoot, "packages/engine/src/adaptationApplicationOrchestration")];
    for (const root of roots) {
      expect(count(root, /applyProgram\(|applyWeekPlan\(|applyPrescription\(|applyPhase\(|generateProgram\(/g)).toBe(0);
      expect(count(root, /registerQueue\(|registerCron\(|registerWebhook\(|backgroundConsumer\(/g)).toBe(0);
    }
  });
});
