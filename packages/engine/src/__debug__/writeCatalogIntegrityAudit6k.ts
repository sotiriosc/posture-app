import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  auditCatalog,
  renderCatalogIntegrityMarkdown,
  summarizeCatalogAudit,
} from "@/lib/catalogDataIntegrity";

const results = auditCatalog();
const summary = summarizeCatalogAudit(results);
const outPath = resolve(process.cwd(), "docs/catalog-integrity-audit-6k.md");
writeFileSync(outPath, renderCatalogIntegrityMarkdown(results), "utf8");

console.log(
  JSON.stringify(
    {
      total: summary.total,
      pass: summary.pass,
      fail: summary.fail,
      needsReview: summary.needsReview,
      failIds: summary.failResults.map((r) => r.id),
      reviewIds: summary.reviewResults.map((r) => r.id),
    },
    null,
    2
  )
);
console.log(`Wrote ${outPath}`);
