import { describe, expect, it } from "vitest";
import {
  mapProductAssessmentReportToV2,
  projectProductAssessmentReportForShadow,
} from "../../src/productAssessmentAdapter";
import { mapProductAssessment } from "../../src/controlledProductShadow";
import { mapProductAssessmentV2 } from "../../src/controlledProductShadowGoalRealization";

const report = () => ({
  observations: [
    { id: "pose-shoulder-asymmetry", confidence: "high", title: "DO_NOT_CONSUME_TITLE",
      description: "DO_NOT_CONSUME_DESCRIPTION", evidence: ["DO_NOT_CONSUME_EVIDENCE"],
      likelyDrivers: ["DO_NOT_CONSUME_DRIVER"], riskIfIgnored: "DO_NOT_CONSUME_RISK",
      primaryFocusTags: ["scap_control"], recommendedInterventions: [{ type: "activation",
        target: "DO_NOT_CONSUME_TARGET", suggestion: "DO_NOT_CONSUME_SUGGESTION" }] },
    { id: "pose-hip-shift", confidence: "medium", title: "Hip shift", description: "opaque",
      evidence: [], likelyDrivers: [], riskIfIgnored: "opaque", primaryFocusTags: ["glute_medius"],
      recommendedInterventions: [] },
    { id: "pain-shoulder", confidence: "medium", title: "Pain", description: "opaque",
      evidence: [], likelyDrivers: [], riskIfIgnored: "opaque", primaryFocusTags: [],
      recommendedInterventions: [] },
    { id: "notes-considerations", confidence: "low", title: "Notes", description: "opaque",
      evidence: [], likelyDrivers: [], riskIfIgnored: "opaque", primaryFocusTags: [],
      recommendedInterventions: [] },
    { id: "unknown-new-observation", confidence: "high", title: "Unknown", description: "opaque",
      evidence: [], likelyDrivers: [], riskIfIgnored: "opaque", primaryFocusTags: [],
      recommendedInterventions: [] },
  ],
  priorities: ["pose-shoulder-asymmetry", "pose-hip-shift", "pain-shoulder"],
  summary: "DO_NOT_CONSUME_SUMMARY",
  disclaimers: ["DO_NOT_CONSUME_DISCLAIMER"],
});

describe("typed Product AssessmentReport adapter", () => {
  it("maps only accepted structured observation IDs with provenance", () => {
    const result = mapProductAssessmentReportToV2({
      assessment: report(),
      sourceRevision: "product-state:test-1",
    });
    expect(result.status).toBe("mapped_with_unresolved_observations");
    expect(result.assessment.signals).toEqual([
      expect.objectContaining({ id: "product-assessment:pose-hip-shift", type: "asymmetry_finding",
        source: "photo_assessment", confidence: "medium", priority: "secondary", region: "hip",
        movementRole: "single_leg", provenance: expect.objectContaining({
          sourceObservationId: "pose-hip-shift", opaqueTextConsumed: false }) }),
      expect.objectContaining({ id: "product-assessment:pose-shoulder-asymmetry",
        type: "asymmetry_finding", source: "photo_assessment", confidence: "high",
        priority: "primary", region: "shoulder", movementRole: "scapular_control" }),
    ]);
    expect(result.proseConsumptionCount).toBe(0);
    expect(result.diagnosticInferenceCount).toBe(0);
    expect(JSON.stringify(result)).not.toMatch(/DO_NOT_CONSUME/);
  });

  it("keeps pain, notes, and unsupported observations explicitly unresolved", () => {
    const result = mapProductAssessmentReportToV2({ assessment: report(), sourceRevision: "product-state:test-1" });
    expect(result.unresolvedObservations).toEqual([
      expect.objectContaining({ sourceObservationId: "notes-considerations",
        reason: "goal_or_notes_not_assessment_truth" }),
      expect.objectContaining({ sourceObservationId: "pain-shoulder", reason: "pain_owned_by_pain_state" }),
      expect.objectContaining({ sourceObservationId: "unknown-new-observation",
        reason: "unsupported_observation_id" }),
    ]);
  });

  it("fails unsupported or malformed shapes closed without throwing", () => {
    expect(mapProductAssessmentReportToV2({ assessment: { signals: [] }, sourceRevision: "legacy" }))
      .toMatchObject({ status: "unsupported_shape", assessment: { signals: [] } });
    expect(mapProductAssessmentReportToV2({ assessment: { observations: [null, { id: "pose-hip-shift",
      confidence: "numeric-ish" }], priorities: [] }, sourceRevision: "malformed" }))
      .toMatchObject({ status: "mapped_with_unresolved_observations", assessment: { signals: [] },
        unresolvedObservations: [expect.objectContaining({ reason: "malformed_observation" }),
          expect.objectContaining({ reason: "malformed_observation" })] });
  });

  it("shares one report projection across Product Shadow adapters", () => {
    const assessment = report();
    const base = projectProductAssessmentReportForShadow({ assessment, sourceRevision: "product-shadow:assessment" });
    expect(mapProductAssessment(assessment)).toEqual(base);
    const goal = mapProductAssessmentV2(assessment);
    expect(goal).toMatchObject({ proseConsumptionCount: 0, genericCorrectiveCircuitCount: 0 });
    expect(goal.signals.map(({ reviewState: _reviewState, ...signal }) => signal))
      .toEqual(base.map(({ reviewState: _reviewState, ...signal }) => signal));
  });

  it("preserves legacy Product Shadow signal behavior exactly", () => {
    const legacy = { signals: [{ id: "legacy-2", confidence: 0.8, region: "hip", action: "reviewed",
      reviewState: "confirmed" }, { id: "legacy-1", confidence: 0.9, region: "trunk", action: "hold",
      reviewState: "reviewed" }] };
    expect(mapProductAssessment(legacy)).toEqual([
      { signalId: "legacy-2", confidence: 0.8, region: "hip", action: "reviewed", reviewState: "confirmed" },
      { signalId: "legacy-1", confidence: 0.9, region: "trunk", action: "hold", reviewState: "reviewed" },
    ]);
    expect(mapProductAssessmentV2(legacy).signals.map((entry) => entry.signalId))
      .toEqual(["legacy-1", "legacy-2"]);
  });
});
