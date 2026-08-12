import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  buildCanonicalPainEvidence,
  type CurrentDiscomfort,
} from "../../src";
import {
  LOW_BACK_AUDIT_AREAS,
  LOW_BACK_EXTERNAL_EVIDENCE,
  LOW_BACK_PAIN_AUDIT_OVERALL_CLASSIFICATION,
  LOW_BACK_STRESS_REVIEW,
  buildLowBackPainTrainingIntelligenceAuditData,
  renderLowBackPainTrainingIntelligenceAudit,
} from "../helpers/lowBackPainTrainingIntelligenceAudit";

describe("low-back pain training intelligence audit", () => {
  const data = buildLowBackPainTrainingIntelligenceAuditData();

  it("renders the checked-in deterministic review artifact", () => {
    const rendered = renderLowBackPainTrainingIntelligenceAudit(data);
    expect(buildLowBackPainTrainingIntelligenceAuditData()).toEqual(data);
    expect(
      readFileSync(
        new URL(
          "../../../../docs/training-engine-v2/LOW_BACK_PAIN_TRAINING_INTELLIGENCE_AUDIT.md",
          import.meta.url,
        ),
        "utf8",
      ),
    ).toBe(rendered);
  });

  it("answers readiness conservatively and classifies every required area", () => {
    expect(data.overallClassification).toBe(LOW_BACK_PAIN_AUDIT_OVERALL_CLASSIFICATION);
    expect(data.readyToIntelligentlyTrainAroundReportedLowBackPain).toBe(false);
    expect(LOW_BACK_AUDIT_AREAS).toHaveLength(12);
    expect(new Set(LOW_BACK_AUDIT_AREAS.map((area) => area.classification))).toEqual(
      new Set([
        "READY",
        "TARGETED_CONTRACT_REQUIRED",
        "CATALOG_KNOWLEDGE_REQUIRED",
        "LONGITUDINAL_OWNER",
        "OUT_OF_SCOPE_MEDICAL_DIAGNOSIS",
      ]),
    );
  });

  it("proves lumbar region alone creates no mechanical stress match", () => {
    const regionOnly: CurrentDiscomfort = {
      kind: "current_discomfort",
      id: "region-only-lumbar-sensitivity",
      region: "lumbar_spine",
      severity0To10: 2,
      stressTags: [],
      effect: "monitor",
      description: "Synthetic region-only audit fixture.",
    };

    for (const exercise of REFERENCE_EXERCISES) {
      const evidence = buildCanonicalPainEvidence({
        exercise,
        painAndInjury: {
          ...NO_PAIN_OR_INJURY,
          currentDiscomforts: [regionOnly],
        },
      });
      expect(evidence.signalMatches, exercise.id).toEqual([]);
      expect(evidence.uniqueMatchCount, exercise.id).toBe(0);
    }
  });

  it("classifies each required low-back stress without calling exposure harm", () => {
    expect(LOW_BACK_STRESS_REVIEW.map((row) => row.tag)).toEqual([
      "loaded_hinge",
      "loaded_spinal_flexion",
      "loaded_spinal_extension",
      "heavy_axial_loading",
      "loaded_trunk_rotation",
      "lateral_trunk_loading",
      "loaded_gait",
      "loaded_march",
      "long_lever_core",
    ]);
    expect(LOW_BACK_STRESS_REVIEW.every((row) => !row.finding.includes("harmful"))).toBe(true);
  });

  it("records all requested external guidance with version and provenance", () => {
    expect(LOW_BACK_EXTERNAL_EVIDENCE).toHaveLength(3);
    expect(LOW_BACK_EXTERNAL_EVIDENCE.every((source) => source.status === "ACCESSED")).toBe(true);
    expect(LOW_BACK_EXTERNAL_EVIDENCE.every((source) => source.version.length > 0)).toBe(true);
    expect(LOW_BACK_EXTERNAL_EVIDENCE.every((source) => source.url.startsWith("https://"))).toBe(true);
  });

  it("keeps the seven-row tranche blocked and permits only a review-only whole-body audit", () => {
    expect(data.blockersBeforeSevenRows).toHaveLength(6);
    expect(data.blockersBeforeWholeBodyAudit[0]).toContain("review-only");
    expect(data.exactNextDependency).toContain("response-history receivers");
    expect(data.exactNextDependency).toContain("phase scoring");
  });

  it("records implemented safety/response fingerprints and phase consequences", () => {
    expect(data.safetyFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(data.responseFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(data.safetyAndResponseFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(data.phaseCalibrationConsequences.map((row) => row.policyId)).toEqual([
      "A_CURRENT",
      "B_ANNOTATION_ONLY",
      "C_NO_PHASE_COMPONENT",
      "D_WEIGHT_05",
      "E_GENTLE_GAP",
      "E_MODERATE_GAP",
    ]);
    expect(data.phaseCalibrationConsequences.every((row) => row.continuityDisruptions === 0))
      .toBe(true);
  });
});
