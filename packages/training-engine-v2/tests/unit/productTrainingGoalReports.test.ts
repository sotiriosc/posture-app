import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRODUCT_TRAINING_GOAL_JSON_FILENAMES,
  PRODUCT_TRAINING_GOAL_REPORT_FILENAMES,
  PRODUCT_TRAINING_GOAL_UPDATED_DOCS,
  buildProductTrainingGoalJsonReports,
  buildProductTrainingGoalMarkdownReports,
  productTrainingGoalDocumentationMarker,
} from "../cagt/productTrainingGoalReports";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
const architectureMarker = /\n*<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:START -->[\s\S]*?<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:END -->\n?/;
const purposeFirstMarker = /\n*<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->[\s\S]*?<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:END -->\n?/;
const supportedPurposeMarker = /\n*<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:START -->[\s\S]*?<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:END -->\n?/;
const b4Marker = /\n*<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->[\s\S]*?<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->\n?/;
const goalRealizationMarker = /\n*<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:END -->\n?/;
const goalSpecificEvidenceMarker = /\n*<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:START -->[\s\S]*?<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:END -->\n?/;
const productGoalContextMarker = /\n*<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:START -->[\s\S]*?<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:END -->\n?/;
const inactiveProductGoalMarker = /\n*<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:START -->[\s\S]*?<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:END -->\n?/;
const preG1Marker = /\n*<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:START -->[\s\S]*?<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:END -->\n?/;
const preG2Marker = /\n*<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:START -->[\s\S]*?<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:END -->\n?/;
const preG2KMarker = /\n*<!-- PRE_G2K_CURRENT_45_KNOWLEDGE_COMPLETION:START -->[\s\S]*?<!-- PRE_G2K_CURRENT_45_KNOWLEDGE_COMPLETION:END -->\n?/;
const preG2LMarker = /\n*<!-- PRE_G2L_STANDARD_GYM_FOUNDATIONS:START -->[\s\S]*?<!-- PRE_G2L_STANDARD_GYM_FOUNDATIONS:END -->\n?/;
const withoutLinkedMarkers = (value: string) => value.replace(architectureMarker, "\n")
  .replace(purposeFirstMarker, "\n").replace(supportedPurposeMarker, "\n").replace(b4Marker, "\n")
  .replace(goalRealizationMarker, "\n").replace(goalSpecificEvidenceMarker, "\n")
  .replace(productGoalContextMarker, "\n").replace(inactiveProductGoalMarker, "\n")
  .replace(preG1Marker, "\n").replace(preG2Marker, "\n").replace(preG2KMarker, "\n")
  .replace(preG2LMarker, "\n");

describe("Product training goal deterministic reports", () => {
  it("builds and persists all 18 Markdown and six JSON artifacts", () => {
    const markdown = buildProductTrainingGoalMarkdownReports();
    const json = buildProductTrainingGoalJsonReports();
    expect(Object.keys(markdown)).toEqual([...PRODUCT_TRAINING_GOAL_REPORT_FILENAMES]);
    expect(Object.keys(json)).toEqual([...PRODUCT_TRAINING_GOAL_JSON_FILENAMES]);
    for (const filename of PRODUCT_TRAINING_GOAL_REPORT_FILENAMES) {
      expect(withoutLinkedMarkers(readFileSync(resolve(docsRoot, filename), "utf8")))
        .toBe(markdown[filename]);
      expect(markdown[filename]).toContain("Production/Product/shadow rollout changed: `NO/NO/NO`");
    }
    for (const filename of PRODUCT_TRAINING_GOAL_JSON_FILENAMES) {
      expect(() => JSON.parse(json[filename])).not.toThrow();
      expect(readFileSync(resolve(docsRoot, filename), "utf8")).toBe(json[filename]);
    }
  });

  it("renders the exact sequential 84-field readiness ledger", () => {
    const readiness = buildProductTrainingGoalMarkdownReports()[
      "PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md"];
    const items = [...readiness.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1]));
    expect(items).toEqual(Array.from({ length: 84 }, (_, index) => index + 1));
    expect(readiness).toContain("84. exact next dependency: " +
      "OWNER_SELECTION_OF_PRODUCT_GOAL_VOCABULARY_AND_GOAL_SPECIFIC_PRESCRIPTION_POLICY");
  });

  it("updates only the bounded readiness, future-activation, and testing handoffs", () => {
    const marker = productTrainingGoalDocumentationMarker();
    expect(PRODUCT_TRAINING_GOAL_UPDATED_DOCS).toHaveLength(5);
    for (const filename of PRODUCT_TRAINING_GOAL_UPDATED_DOCS) {
      const content = readFileSync(resolve(docsRoot, filename), "utf8");
      expect(content.match(/<!-- PRODUCT_TRAINING_GOAL_SPECIFICITY_V1:START -->/g)).toHaveLength(1);
      expect(content).toContain(marker);
    }
  });
});
