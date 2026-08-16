import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1 } from
  "../../src/productGoalArchitecture/ownerPolicyV1";
import {
  PRODUCT_GOAL_ARCHITECTURE_AUTHORITY_STATEMENT,
  PRODUCT_GOAL_ARCHITECTURE_JSON_FILENAMES,
  PRODUCT_GOAL_ARCHITECTURE_REPORT_FILENAMES,
  PRODUCT_GOAL_ARCHITECTURE_UPDATED_DOCS,
  buildProductGoalArchitectureImplementationReport,
  buildProductGoalArchitectureJsonReports,
  buildProductGoalArchitectureMarkdownReports,
  productGoalArchitectureDocumentationMarker,
} from "../cagt/productGoalArchitectureReports";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");
const purposeFirstMarker = /\n*<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:START -->[\s\S]*?<!-- PURPOSE_FIRST_PRESCRIPTION_RESOLVER_V1:END -->\n?/;
const supportedPurposeMarker = /\n*<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:START -->[\s\S]*?<!-- SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_V1:END -->\n?/;
const b4Marker = /\n*<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:START -->[\s\S]*?<!-- EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_V1:END -->\n?/;
const goalRealizationMarker = /\n*<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:START -->[\s\S]*?<!-- CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_MAPPING_V1:END -->\n?/;
const goalSpecificEvidenceMarker = /\n*<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:START -->[\s\S]*?<!-- GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_V1:END -->\n?/;
const productGoalContextMarker = /\n*<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:START -->[\s\S]*?<!-- PRODUCT_GOAL_CONTEXT_CHUNK_E:END -->\n?/;
const inactiveProductGoalMarker = /\n*<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:START -->[\s\S]*?<!-- ONE_INACTIVE_PRODUCT_GOAL_OPTION_CHUNK_F:END -->\n?/;
const preG1Marker = /\n*<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:START -->[\s\S]*?<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:END -->\n?/;
const preG2Marker = /\n*<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:START -->[\s\S]*?<!-- PRE_G2_PACKAGE_R_HOME_FIRST_MIXED_RELEASE:END -->\n?/;
const withoutPurposeFirstMarker = (value: string) => value.replace(purposeFirstMarker, "\n")
  .replace(supportedPurposeMarker, "\n").replace(b4Marker, "\n")
  .replace(goalRealizationMarker, "\n").replace(goalSpecificEvidenceMarker, "\n")
  .replace(productGoalContextMarker, "\n").replace(inactiveProductGoalMarker, "\n")
  .replace(preG1Marker, "\n").replace(preG2Marker, "\n");

describe("Product goal architecture deterministic reports", () => {
  it("builds and persists three Markdown and two JSON artifacts exactly", () => {
    const markdown = buildProductGoalArchitectureMarkdownReports(workspaceRoot);
    const json = buildProductGoalArchitectureJsonReports(workspaceRoot);
    expect(Object.keys(markdown)).toEqual([...PRODUCT_GOAL_ARCHITECTURE_REPORT_FILENAMES]);
    expect(Object.keys(json)).toEqual([...PRODUCT_GOAL_ARCHITECTURE_JSON_FILENAMES]);
    for (const filename of PRODUCT_GOAL_ARCHITECTURE_REPORT_FILENAMES) {
      expect(withoutPurposeFirstMarker(readFileSync(resolve(docsRoot, filename), "utf8")))
        .toBe(markdown[filename]);
    }
    for (const filename of PRODUCT_GOAL_ARCHITECTURE_JSON_FILENAMES) {
      expect(() => JSON.parse(json[filename])).not.toThrow();
      expect(readFileSync(resolve(docsRoot, filename), "utf8")).toBe(json[filename]);
    }
    expect(JSON.parse(json["PRODUCT_TRAINING_GOAL_ARCHITECTURE_OWNER_POLICY_V1.json"]))
      .toEqual(PRODUCT_TRAINING_GOAL_ARCHITECTURE_POLICY_V1);
  });

  it("renders the exact sequential 79-field readiness ledger", () => {
    const readiness = buildProductGoalArchitectureMarkdownReports(workspaceRoot)[
      "PRODUCT_TRAINING_GOAL_ARCHITECTURE_IMPLEMENTATION_READINESS.md"];
    const items = [...readiness.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1]));
    expect(items).toEqual(Array.from({ length: 79 }, (_, index) => index + 1));
    expect(readiness).toContain("79. exact next dependency: " +
      "PURPOSE_FIRST_GOAL_SPECIFIC_PRESCRIPTION_RESOLVER_V1_IMPLEMENTATION_AUTHORIZATION");
  });

  it("records authority, closure state, and one bounded link marker per document", () => {
    const report = buildProductGoalArchitectureImplementationReport(workspaceRoot);
    expect(report.authorityStatement).toBe(PRODUCT_GOAL_ARCHITECTURE_AUTHORITY_STATEMENT);
    expect(report.productionBehaviorChanged).toBe(false);
    expect(report.productBehaviorChanged).toBe(false);
    expect(PRODUCT_GOAL_ARCHITECTURE_UPDATED_DOCS).toHaveLength(7);
    const marker = productGoalArchitectureDocumentationMarker();
    for (const path of PRODUCT_GOAL_ARCHITECTURE_UPDATED_DOCS) {
      const content = readFileSync(resolve(workspaceRoot, path), "utf8");
      expect(content.match(/<!-- PRODUCT_GOAL_ARCHITECTURE_LEDGER_V1:START -->/g)).toHaveLength(1);
      expect(content).toContain(marker);
    }
  });
});
