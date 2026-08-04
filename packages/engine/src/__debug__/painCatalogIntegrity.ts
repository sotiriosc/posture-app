/**
 * Deterministic catalog integrity report for painContraindications tokens.
 *
 * Usage:
 *   npm run audit:pain-catalog
 *   node --import tsx packages/engine/src/__debug__/painCatalogIntegrity.ts
 *
 * Writes docs/pain-catalog-integrity-report.md (repo root relative).
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { exercises } from "../exercises";
import {
  CANONICAL_PAIN_AREAS,
  evaluateHardPainExclusion,
  hasUsableStructuredPainMetadata,
  legacyTextContraindicationHits,
  normalizePainAreaToken,
  parsePainToken,
  type CanonicalPainArea,
} from "../painModel";

const sha = (() => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
})();

type Finding = {
  exerciseId: string;
  kind: string;
  detail: string;
};

const findings: Finding[] = [];
const tokenCounts = new Map<string, number>();
const unknownTokens = new Map<string, string[]>();

for (const ex of exercises) {
  const tokens = ex.painContraindications ?? [];
  for (const token of tokens) {
    const key = normalizePainAreaToken(token);
    tokenCounts.set(key, (tokenCounts.get(key) ?? 0) + 1);
    const parsed = parsePainToken(token);
    if (parsed.unknownModifier) {
      findings.push({
        exerciseId: ex.id,
        kind: "unknown_modifier",
        detail: token,
      });
    }
    if (parsed.unknownArea) {
      const list = unknownTokens.get(key) ?? [];
      list.push(ex.id);
      unknownTokens.set(key, list);
      findings.push({
        exerciseId: ex.id,
        kind: "unmapped_structured_token",
        detail: token,
      });
    }
  }

  // Contradiction: structured usable + no knee match, but free text mentions knee
  // while structured deliberately omits knees — report as information when structured
  // has usable tokens and legacy would have hit a different set.
  if (hasUsableStructuredPainMetadata(tokens) && ex.contraindications?.length) {
    for (const area of CANONICAL_PAIN_AREAS) {
      const structuredHit = evaluateHardPainExclusion(ex, [area]).excluded;
      const legacyHit = legacyTextContraindicationHits(ex.contraindications, [
        area,
      ]).excluded;
      if (!structuredHit && legacyHit) {
        findings.push({
          exerciseId: ex.id,
          kind: "structured_overrides_legacy_text",
          detail: `area=${area}; free-text would exclude but structured does not`,
        });
      }
    }
  }

  if (!tokens.length && (ex.contraindications?.length ?? 0) > 0) {
    findings.push({
      exerciseId: ex.id,
      kind: "legacy_text_only",
      detail: (ex.contraindications ?? []).join(" | "),
    });
  }
}

const unmappedSummary = [...unknownTokens.entries()]
  .sort((a, b) => b[1].length - a[1].length)
  .map(([token, ids]) => `- \`${token}\` (${ids.length} exercises): ${ids.slice(0, 8).join(", ")}${ids.length > 8 ? ", …" : ""}`)
  .join("\n");

const tokenTable = [...tokenCounts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([token, count]) => {
    const parsed = parsePainToken(token);
    const mapped = parsed.area ?? "(unmapped)";
    return `| \`${token}\` | ${count} | ${mapped} |`;
  })
  .join("\n");

const byKind = new Map<string, number>();
for (const f of findings) {
  byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);
}

const kindSummary = [...byKind.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([k, n]) => `- **${k}**: ${n}`)
  .join("\n");

const contradictionSample = findings
  .filter((f) => f.kind === "structured_overrides_legacy_text")
  .slice(0, 40)
  .map((f) => `- \`${f.exerciseId}\`: ${f.detail}`)
  .join("\n");

const legacyOnlySample = findings
  .filter((f) => f.kind === "legacy_text_only")
  .slice(0, 40)
  .map((f) => `- \`${f.exerciseId}\`: ${f.detail}`)
  .join("\n");

const md = `# Pain catalog integrity report

Generated: ${new Date().toISOString()}
Commit: \`${sha}\`
Command: \`npm run audit:pain-catalog\`
(or \`node --import tsx packages/engine/src/__debug__/painCatalogIntegrity.ts\`)

## Summary

- Exercises scanned: ${exercises.length}
- Distinct structured pain tokens: ${tokenCounts.size}
- Canonical areas: ${CANONICAL_PAIN_AREAS.join(", ")}
- Finding counts:
${kindSummary || "- (none)"}

## Structured token frequency

| Token | Count | Canonical map |
| --- | ---: | --- |
${tokenTable}

## Unmapped structured tokens

These are not body-area questionnaire tokens (e.g. hamstring strain). They do not
drive questionnaire hard exclusion unless later mapped.

${unmappedSummary || "_None_"}

## Structured overrides legacy free-text (sample)

When structured metadata is usable and does **not** list an area, free-text must
not hard-exclude. The following pairs would have disagreed under the old
substring matcher (informational — expected under new precedence):

${contradictionSample || "_None in sample_"}

## Legacy-text-only exercises (no structured tokens)

These still rely on the temporary free-text fallback for hard exclusion:

${legacyOnlySample || "_None_"}

## Recommendation

- Do not mass-edit the catalog from this report alone.
- Prefer adding/fixing \`painContraindications\` on \`legacy_text_only\` entries
  in a follow-up when coaching intent is clear.
- Keep strain/tissue tokens (\`hamstrings\`, etc.) as non-area metadata unless
  product adds a corresponding input path.
`;

const outPath = resolve(process.cwd(), "docs/pain-catalog-integrity-report.md");
writeFileSync(outPath, md, "utf8");
console.log(`Wrote ${outPath}`);
console.log(`Findings: ${findings.length}`);
