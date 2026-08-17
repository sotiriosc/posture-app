import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  gDesignFingerprints,
  gDesignIntegrationBlocks,
  gDesignJsonReports,
  gDesignMarkdownReports,
  gDesignReportCorpusFingerprint,
} from "../controlledOwnerDeliveryDesign/reports";

const repositoryRoot = resolve(import.meta.dirname, "../../../..");
const docsRoot = resolve(repositoryRoot, "docs/training-engine-v2");

describe("controlled owner delivery design reports", () => {
  it("creates every required report and deterministic JSON artifact", () => {
    expect(Object.keys(gDesignMarkdownReports)).toHaveLength(40);
    expect(Object.keys(gDesignJsonReports)).toHaveLength(18);
    expect(gDesignMarkdownReports).toHaveProperty("CONTROLLED_OWNER_GET_STRONGER_DELIVERY_ONTOLOGY_AUDIT.md");
    expect(gDesignMarkdownReports).toHaveProperty("CONTROLLED_OWNER_GET_STRONGER_DELIVERY_IMPLEMENTATION_HANDOFF.md");
    expect(gDesignJsonReports).toHaveProperty("CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_DELIVERY_DESIGN_V1_HOLDOUT_MANIFEST.json");
    expect(gDesignFingerprints.combinedGDesign).toMatch(/^[a-f0-9]{64}$/);
    expect(gDesignReportCorpusFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it("contains only synthetic email values in Chunk G artifacts", () => {
    const corpus = [...Object.values(gDesignMarkdownReports), ...Object.values(gDesignJsonReports)].join("\n");
    const emails = corpus.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
    expect(emails.length).toBeGreaterThan(0);
    expect(emails.every((email) => email.toLowerCase().endsWith("@example.test"))).toBe(true);
  });

  it("keeps all generated reports fresh on disk", () => {
    for (const [filename, expected] of Object.entries({ ...gDesignMarkdownReports, ...gDesignJsonReports })) {
      expect(readFileSync(resolve(docsRoot, filename), "utf8"), filename).toBe(expected);
    }
    for (const relativePath of Object.keys(gDesignIntegrationBlocks)) {
      const content = readFileSync(resolve(repositoryRoot, relativePath), "utf8");
      expect(content).toContain("<!-- CHUNK_G_OWNER_DELIVERY_DESIGN:START -->");
      expect(content).toContain(gDesignFingerprints.combinedGDesign);
    }
  });

  it("changes no runtime source and commits no prompt", () => {
    const runtimeDiff = execFileSync("git", ["diff", "--name-only", "4bc1ceb618480dc58693b34f4b8cca81ed6d3961", "--",
      "apps/consumer/src", "apps/gyms/src", "packages/engine/src", "packages/training-engine-v2/src"], {
      cwd: repositoryRoot, encoding: "utf8",
    }).trim();
    expect(runtimeDiff).toBe("");
    const trackedPrompts = execFileSync("git", ["ls-files", "packages/training-engine-v2/docs"], {
      cwd: repositoryRoot, encoding: "utf8",
    }).trim();
    expect(trackedPrompts).toBe("");
  });
});
