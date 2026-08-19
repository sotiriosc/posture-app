import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  gDesignFingerprints,
  gDesignIntegrationBlocks,
  gDesignJsonReports,
  gDesignMarkdownReports,
  gDesignReportCorpusFingerprint,
} from "../tests/controlledOwnerDeliveryDesign/reports";
import { chunkGReadiness } from "../tests/controlledOwnerDeliveryDesign/evidence";
import { validationSummary } from "../tests/controlledOwnerDeliveryDesign/validation";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const workspaceRoot = resolve(packageRoot, "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
const mode = process.argv.includes("--check") ? "check" : "write";
const markerStart = "<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:START -->";
const markerEnd = "<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:END -->";
const markerPattern = /\n*<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:START -->[\s\S]*?<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:END -->\n?/;
const mismatches: string[] = [];
const implementationAuthorized = existsSync(resolve(docsRoot,
  "CONTROLLED_OWNER_DELIVERY_IMPLEMENTATION_READINESS.md"));
const implementationSuccessors = new Set([
  "CONTROLLED_OWNER_ACCOUNT_ENTRY_IMPLEMENTATION.md", "CONTROLLED_OWNER_ACTIVE_PROGRAM_POINTER_IMPLEMENTATION.md",
  "CONTROLLED_OWNER_APPROVAL_APPLICATION_IMPLEMENTATION.md", "CONTROLLED_OWNER_CURRENT_PRODUCT_INVARIANCE.md",
  "CONTROLLED_OWNER_DELIVERY_MODE_IMPLEMENTATION.md", "CONTROLLED_OWNER_DELIVERY_RUNTIME_CONTRACT.md",
  "CONTROLLED_OWNER_ENROLLMENT_PROFILE_IMPLEMENTATION.md", "CONTROLLED_OWNER_GENERATION_IMPLEMENTATION.md",
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_IMPLEMENTATION_ONTOLOGY_AUDIT.md",
  "CONTROLLED_OWNER_GET_STRONGER_DELIVERY_DESIGN_READINESS.md", "CONTROLLED_OWNER_IDENTITY_GATE_IMPLEMENTATION.md",
  "CONTROLLED_OWNER_PREVIEW_IMPLEMENTATION.md", "CONTROLLED_OWNER_PRODUCT_IMPORT_IMPLEMENTATION.md",
  "CONTROLLED_OWNER_PRODUCT_PROJECTION_IMPLEMENTATION.md", "CONTROLLED_OWNER_ROUTE_AND_API_MATRIX.md",
  "CONTROLLED_OWNER_WEEK_IMPLEMENTATION.md", "OWNER_V2_PROGRAM_ENVELOPE_IMPLEMENTATION.md",
]);

const applyExpected = (path: string, expected: string) => {
  if (mode === "write") {
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, expected, "utf8");
    return;
  }
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (current !== expected) mismatches.push(path.replace(`${workspaceRoot}/`, ""));
};

mkdirSync(docsRoot, { recursive: true });
for (const [filename, content] of Object.entries(gDesignMarkdownReports)) {
  if (implementationAuthorized && implementationSuccessors.has(filename)) continue;
  applyExpected(resolve(docsRoot, filename), content);
}
for (const [filename, content] of Object.entries(gDesignJsonReports)) {
  applyExpected(resolve(docsRoot, filename), content);
}

for (const [relativePath, summary] of Object.entries(gDesignIntegrationBlocks)) {
  const path = resolve(workspaceRoot, relativePath);
  if (!existsSync(path)) throw new Error(`CHUNK_G_INTEGRATION_DOCUMENT_REQUIRED:${relativePath}`);
  const current = readFileSync(path, "utf8");
  const block = `${markerStart}\n\n## Chunk G Design - Controlled owner Get stronger delivery\n\n${summary}\n\n` +
    `Combined G-design fingerprint: \`${gDesignFingerprints.combinedGDesign}\`. ` +
    `Exact next dependency: \`${chunkGReadiness.nextDependency}\`.\n\n${markerEnd}`;
  const expected = markerPattern.test(current)
    ? current.replace(markerPattern, `\n\n${block}\n`)
    : `${current.trimEnd()}\n\n${block}\n`;
  applyExpected(path, expected);
}

if (mismatches.length > 0) {
  throw new Error(`CHUNK_G_DESIGN_REPORTS_STALE:\n${mismatches.join("\n")}`);
}

process.stdout.write(`${JSON.stringify({
  mode,
  classification: chunkGReadiness.classification,
  ontology: chunkGReadiness.ontology,
  markdownReportCount: Object.keys(gDesignMarkdownReports).length,
  jsonReportCount: Object.keys(gDesignJsonReports).length,
  controlledScenarioCount: validationSummary.controlledScenarioCount,
  fixedShellCohortCount: validationSummary.fixedShellCohortCount,
  holdoutCount: validationSummary.holdoutCount,
  mutationResult: `${validationSummary.mutationRejectedCount}/${validationSummary.mutationCount}`,
  metamorphicResult: `${validationSummary.invariantCount}/${validationSummary.materialResponseCount}`,
  reportCorpusFingerprint: gDesignReportCorpusFingerprint,
  combinedGDesignFingerprint: gDesignFingerprints.combinedGDesign,
  ownerDeliveryCount: chunkGReadiness.ownerDeliveryCount,
  productActivationCount: chunkGReadiness.productActivationCount,
  nextDependency: chunkGReadiness.nextDependency,
}, null, 2)}\n`);
