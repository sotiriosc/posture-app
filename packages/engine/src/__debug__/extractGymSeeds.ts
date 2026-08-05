import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { allExercises } from "@/lib/exercises";

const catalog = new Set(allExercises.map((e) => e.id));
const seeds = new Set<string>();
const root = path.resolve(process.cwd(), "packages/engine/src");
for (const rel of [
  "program.ts",
  "program/dayTemplates.ts",
  "program/ladderAdvancement.ts",
  "program/bandExerciseRequirements.ts",
]) {
  const text = readFileSync(path.join(root, rel), "utf8");
  for (const match of text.matchAll(/["']([a-z0-9][a-z0-9-]{2,})["']/g)) {
    if (catalog.has(match[1])) seeds.add(match[1]);
  }
}
const ids = [...seeds].sort();
const out = path.join(root, "coaching/releaseCriticalGymSeeds.ts");
writeFileSync(
  out,
  `/** Auto-extracted gym/production ID seeds for Phase 6 reachability (no runtime fs). */\nexport const RELEASE_CRITICAL_GYM_SEEDS: readonly string[] = ${JSON.stringify(
    ids,
    null,
    2
  )} as const;\n`
);
console.log("wrote", ids.length, "to", out);
