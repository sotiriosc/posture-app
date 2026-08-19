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

describe("production Week bounded activation", () => {
  it("activates only controlled-owner delivery and keeps consumer, gyms, Product, and Product Horizon unwired", () => {
    const liveRoots = [resolve(repositoryRoot, "apps/consumer/src"), resolve(repositoryRoot, "apps/gyms/src"),
      resolve(repositoryRoot, "packages/engine/src")];
    const weekImport = /weekPlanning|planWeeklyIntent|composeWeekAllocation|materializeSessionAllocation|reallocateRemainingWeek/g;
    expect(count(liveRoots[0]!, weekImport)).toBe(0);
    expect(count(liveRoots[1]!, weekImport)).toBe(0);
    expect(count(liveRoots[2]!, /planWeeklyIntent\(|composeWeekAllocation\(|materializeSessionAllocation\(|reallocateRemainingWeek\(/g)).toBe(0);
    const ownerRoot = resolve(repositoryRoot, "packages/training-engine-v2/src/ownerDelivery");
    expect(count(ownerRoot, /planWeeklyIntent\(/g)).toBe(1);
    expect(count(ownerRoot, /composeWeekAllocation\(/g)).toBe(1);
    expect(count(ownerRoot, /materializeSessionAllocation\(/g)).toBe(1);
    expect(count(ownerRoot, /reallocateRemainingWeek\(/g)).toBe(0);
    expect(count(liveRoots[0]!, /ProductWeekHorizon|Product Horizon/g) + count(liveRoots[1]!, /ProductWeekHorizon|Product Horizon/g)).toBe(0);
  });

  it("keeps the pure production module free of tests, CAGT, persistence, clocks, and randomness", () => {
    const root = resolve(repositoryRoot, "packages/training-engine-v2/src/weekPlanning");
    expect(count(root, /from ["'][^"']*(?:tests|cagt)/gi)).toBe(0);
    expect(count(root, /from ["']pg["']|database|repository\.write|persistWeekPlan|writeWeekPlan/gi)).toBe(0);
    expect(count(root, /Date\.now\(|new Date\(\)|randomUUID\(|Math\.random\(/g)).toBe(0);
    expect(count(root, /process\.env/g)).toBe(0);
  });

  it("contains no hidden default policy, hidden search budget, fixed seed, or greedy fallback", () => {
    const root = resolve(repositoryRoot, "packages/training-engine-v2/src/weekPlanning");
    expect(count(root, /DEFAULT_WEEK_POLICY|process\.env|fixedSeed|Math\.random|greedyFallback|greedy_fallback/g)).toBe(0);
    expect(count(root, /maximumExpandedStates:\s*\d|maximumCompletePlansEvaluated:\s*\d/g)).toBe(0);
  });

  it("contains no automatic application, downstream rerun, mutation, or deload construction", () => {
    const root = resolve(repositoryRoot, "packages/training-engine-v2/src/weekPlanning");
    for (const pattern of [/persistWeekPlan\(/g, /applyWeekPlan\(/g, /applyReallocation\(/g, /constructDeload\(/g,
      /generateProgram\(/g, /planAndComposeSessionSkeleton\(/g, /compilePrescription\(/g, /sequenceSession\(/g,
      /validatePrescribedWeek\(/g, /applyLongitudinalDirective\(/g, /mutatePhase\(/g]) {
      expect(count(root, pattern)).toBe(0);
    }
  });

  it("imports without side effects and exposes only explicit pure entry points", async () => {
    const weekPlanningModule = await import("../../src/weekPlanning");
    expect(weekPlanningModule).toMatchObject({
      PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_ACTIVATION_STATUS: "NOT_ACTIVATED",
      planWeeklyIntent: expect.any(Function),
      composeWeekAllocation: expect.any(Function),
      materializeSessionAllocation: expect.any(Function),
      reallocateRemainingWeek: expect.any(Function),
      buildProductionPrescribedWeekSourceProjection: expect.any(Function),
    });
  });
});
