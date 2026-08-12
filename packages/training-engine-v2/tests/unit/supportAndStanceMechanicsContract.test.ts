import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { REFERENCE_EXERCISES } from "../../src";
import {
  SEVEN_EXERCISE_SUPPORT_GAPS,
  SUPPORT_AND_STANCE_CONSUMER_AUDIT,
  SUPPORT_AND_STANCE_MECHANICS_CONTRACT_CLASSIFICATION,
  SUPPORT_AND_STANCE_SCHEMA_RECOMMENDATION,
  buildSupportAndStanceMechanicsContractData,
  renderSupportAndStanceMechanicsContractReport,
} from "../helpers/supportAndStanceMechanicsContract";

const data = buildSupportAndStanceMechanicsContractData();

describe("support and stance mechanics contract review", () => {
  it("renders a deterministic checked-in contract artifact", () => {
    const second = buildSupportAndStanceMechanicsContractData();
    const rendered = renderSupportAndStanceMechanicsContractReport(data);

    expect(second).toEqual(data);
    expect(renderSupportAndStanceMechanicsContractReport(second)).toBe(rendered);
    expect(data.classification).toBe(
      SUPPORT_AND_STANCE_MECHANICS_CONTRACT_CLASSIFICATION,
    );
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/SUPPORT_AND_STANCE_MECHANICS_CONTRACT.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });

  it("audits every current production support consumer before schema change", () => {
    expect(SUPPORT_AND_STANCE_CONSUMER_AUDIT.map((row) => row.path)).toEqual([
      "packages/training-engine-v2/src/domain/exercise.ts",
      "packages/training-engine-v2/src/transitionComparison.ts",
      "packages/training-engine-v2/src/candidate/rowSelectionKnowledge.ts",
      "packages/training-engine-v2/tests/helpers/candidateIntelligenceReviewReport.ts",
    ]);
    expect(
      SUPPORT_AND_STANCE_CONSUMER_AUDIT.every((row) =>
        row.currentUse.length > 0 && row.migrationNeed.length > 0
      ),
    ).toBe(true);
  });

  it("recommends compositional support and stance rather than one enum per exercise", () => {
    expect(SUPPORT_AND_STANCE_SCHEMA_RECOMMENDATION.map((row) => row.field))
      .toEqual([
        "basePosition",
        "stance",
        "orientation",
        "supportContacts[]",
        "supportAmount",
        "supportRelationship",
      ]);
    expect(
      SUPPORT_AND_STANCE_SCHEMA_RECOMMENDATION.some((row) =>
        row.recommendation.includes("half_kneeling")
      ),
    ).toBe(true);
    expect(
      SUPPORT_AND_STANCE_SCHEMA_RECOMMENDATION.some((row) =>
        row.recommendation.includes("forearm-floor-primary")
      ),
    ).toBe(true);
    expect(
      SUPPORT_AND_STANCE_SCHEMA_RECOMMENDATION.some((row) =>
        row.recommendation.includes("prescription_modifiable")
      ),
    ).toBe(true);
  });

  it("blocks the seven-exercise tranche on truthful support and stance fields", () => {
    expect(SEVEN_EXERCISE_SUPPORT_GAPS.map((row) => row.exerciseId)).toEqual([
      "forearm-plank",
      "forearm-side-plank",
      "half-kneeling-high-to-low-cable-chop",
      "wall-supported-suitcase-march",
    ]);
    expect(
      SEVEN_EXERCISE_SUPPORT_GAPS.find((row) =>
        row.exerciseId === "half-kneeling-high-to-low-cable-chop"
      )?.gap,
    ).toContain("Encoding it as standing would lie");
    expect(
      SEVEN_EXERCISE_SUPPORT_GAPS.find((row) =>
        row.exerciseId === "forearm-plank"
      )?.gap,
    ).toContain("`hands_supported` would be false");
  });

  it("finds no current production support or stance lie while preserving behavior", () => {
    expect(data.currentSupportInventory).toHaveLength(REFERENCE_EXERCISES.length);
    expect(data.lieStatus).toBe("NO_CURRENT_PRODUCTION_SUPPORT_STANCE_LIE_DISCOVERED");
    expect(data.currentProductionLieFindings).toEqual([]);
    expect(data.schemaChangeStatus).toBe("RECOMMENDED_NOT_IMPLEMENTED");
    expect(data.productionBehaviorChanged).toBe(false);
  });
});
