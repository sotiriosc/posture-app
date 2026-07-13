import { validateExerciseCatalog } from "@/lib/exerciseCatalog";

const MAX_LINES = 30;

const result = validateExerciseCatalog();
const combined = [
  ...result.errors.map((entry) => `ERROR: ${entry}`),
  ...result.warnings.map((entry) => `WARN: ${entry}`),
];

console.log("[catalogAudit] summary");
console.log(`- ok: ${result.ok}`);
console.log(`- errors: ${result.errors.length}`);
console.log(`- warnings: ${result.warnings.length}`);

if (combined.length) {
  console.log(`[catalogAudit] top ${Math.min(MAX_LINES, combined.length)} findings`);
  combined.slice(0, MAX_LINES).forEach((line) => {
    console.log(`- ${line}`);
  });
}

if (!result.ok) {
  process.exit(1);
}
