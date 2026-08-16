import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  chunkEFingerprints,
  chunkEJsonReports,
  chunkEMarkdownReports,
  reportCorpusFingerprint,
} from "../tests/productGoalContextDesign/reports";
import { validationSummary } from "../tests/productGoalContextDesign/validation";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

const chunkFPattern = /\n*<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:START -->[\s\S]*?<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:END -->\n?/;
for (const [filename, content] of Object.entries(chunkEMarkdownReports)) {
  const path = resolve(docsRoot, filename);
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const chunkFMarker = existing.match(chunkFPattern)?.[0]?.trim() ?? "";
  writeFileSync(path, chunkFMarker ? `${content.trimEnd()}\n\n${chunkFMarker}\n` : content, "utf8");
}
for (const [filename, content] of Object.entries(chunkEJsonReports)) {
  writeFileSync(resolve(docsRoot, filename), content, "utf8");
}

const integrationBlocks: Readonly<Record<string, string>> = Object.freeze({
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md":
    "Chunk E selects the consumer `/questionnaire` surface and completes design-only primary-goal, follow-up, pain/context, mode, schedule, experience, equipment, responsive, accessibility, migration, and F handoff evidence. Product/UI/runtime changes remain zero.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md":
    "Chunk E adds no activation authority. Get stronger remains a future inactive internal option for a separately authorized F preview; ordinary consumer, gyms, buyer-demo, persistence, generation, Product Shadow, and V2 output paths remain unchanged.",
  "docs/training-engine-v2/PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md":
    "Chunk E design is ready for ledger closure. The next separately authorized step is F: one explicit inactive consumer preview option (`get_stronger`) with fail-closed submission and no route, persistence, generation, shadow, or output behavior.",
  "docs/training-engine-v2/GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_READINESS.md":
    "Chunk D evidence remains binding: primary goal/follow-up, goal-specific focus, pain/context separation, and exact equipment capability when legality requires it are the first Product-surface priorities. Chunk E changes none of the frozen D evidence or fingerprints.",
  "docs/training-engine-v2/CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_ACTIVATION_GUARDS.md":
    "Chunk E designs the missing Product input ownership without selecting the B1-B4 mapping profile on current routes. Controlled Product Shadow remains explicit-only, default-off, counterfactual-only, and absent from Product output.",
  "docs/training-engine-v2/TESTING.md":
    "Chunk E adds deterministic design validators plus synthetic Playwright render capture for consumer and gyms. The focused design suite passes 11 tests, rejects 29/29 semantic mutations, passes 21/21 metamorphic relations, and captures 22 current-head states with no horizontal overflow or fixed Info/Menu overlap.",
  "docs/training-engine-v2/ARCHITECTURE.md":
    "Chunk E defines design-only `ProductTrainingProfileV2` and `QUESTIONNAIRE_SIGNATURE_V2` contracts. They use canonical IDs and explicit semantic ownership but have no production export, Product import, persistence, signature, engine, or route integration.",
  "docs/training-engine-v2/DOMAIN.md":
    "Product input semantics now distinguish primary outcome, optional secondary personalization, pain/limitations context, training mode, availability, coarse experience, equipment environment, exact capability, and calibration. None creates an exercise or numeric dose.",
  "docs/training-engine-v2/ENGINE_V2_BLUEPRINT.md":
    "Chunk E preserves design-before-implementation: Option A keeps the compact goal select and adds inline follow-up only when required. F is bounded to one inactive Get stronger preview; owner-account delivery and broader activation remain G and H.",
});

const start = "<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:START -->";
const end = "<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:END -->";
const pattern = /<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:START -->[\s\S]*?<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:END -->/;
for (const [relativePath, summary] of Object.entries(integrationBlocks)) {
  const path = resolve(workspaceRoot, relativePath);
  if (!existsSync(path)) throw new Error(`CHUNK_E_INTEGRATION_DOCUMENT_REQUIRED:${relativePath}`);
  const current = readFileSync(path, "utf8");
  const block = `${start}\n\n## Chunk E - Screenshot-guided Product input design\n\n${summary}\n\n` +
    `Combined Chunk E fingerprint: \`${chunkEFingerprints.combinedChunkE}\`. ` +
    "Exact next dependency: `ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_IMPLEMENTATION_AUTHORIZATION`.\n\n" +
    `${end}`;
  writeFileSync(path, pattern.test(current) ? current.replace(pattern, block) :
    `${current.trimEnd()}\n\n${block}\n`, "utf8");
}

process.stdout.write(`${JSON.stringify({
  classification:
    "SCREENSHOT_GUIDED_PRODUCT_GOAL_AND_CONTEXT_INPUT_DESIGN_V1_READY_FOR_ONE_INACTIVE_PRODUCT_GOAL_OPTION_AUTHORIZATION",
  markdownReportCount: Object.keys(chunkEMarkdownReports).length,
  jsonReportCount: Object.keys(chunkEJsonReports).length,
  mutationResult: `${validationSummary.mutationRejected}/${validationSummary.mutationTotal}`,
  metamorphicResult: `${validationSummary.metamorphicPassed}/${validationSummary.metamorphicTotal}`,
  reportCorpusFingerprint,
  combinedChunkEFingerprint: chunkEFingerprints.combinedChunkE,
  nextDependency: "ONE_INACTIVE_PRODUCT_GOAL_OPTION_V1_IMPLEMENTATION_AUTHORIZATION",
}, null, 2)}\n`);
