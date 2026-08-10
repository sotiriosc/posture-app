import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  FOUNDATION_COMPONENT_BOUNDARIES,
  PIPELINE_STAGES,
  appendPipelineSnapshot,
  assessmentInfluenceForSignal,
  createPipelineSnapshot,
  deriveAlignmentPriorities,
  isReasonCode,
  type AssessmentSignal,
  type PipelineObservationLog,
} from "../../src";

function tsFilesUnder(directory: string): readonly string[] {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return tsFilesUnder(entryPath);
    }

    return entry.endsWith(".ts") ? [entryPath] : [];
  });
}

describe("architecture hardening contracts", () => {
  it("defines modular component boundaries by training responsibility", () => {
    expect(FOUNDATION_COMPONENT_BOUNDARIES.length).toBeGreaterThan(5);

    const ids = FOUNDATION_COMPONENT_BOUNDARIES.map((component) => component.id);
    expect(ids).toContain("assessment_interpretation");
    expect(ids).toContain("alignment_priority_derivation");
    expect(ids).toContain("equipment_eligibility");
    expect(ids).toContain("candidate_ranking");
    expect(ids).toContain("session_evaluation");
    expect(ids).toContain("week_evaluation");

    const candidateRanking = FOUNDATION_COMPONENT_BOUNDARIES.find(
      (component) => component.id === "candidate_ranking",
    );
    expect(candidateRanking).toEqual(
      expect.objectContaining({
        ownsExerciseScienceRules: false,
      }),
    );
  });

  it("uses stable structured reason codes", () => {
    expect(isReasonCode("EQUIPMENT_UNAVAILABLE")).toBe(true);
    expect(isReasonCode("PERSONAL_BLOCK")).toBe(true);
    expect(isReasonCode("ROLE_MISMATCH")).toBe(true);
    expect(isReasonCode("SECTION_MISMATCH")).toBe(true);
    expect(isReasonCode("MOVEMENT_ROLE_MISMATCH")).toBe(true);
    expect(isReasonCode("TARGET_MUSCLE_MISMATCH")).toBe(true);
    expect(isReasonCode("equipment_unavailable")).toBe(false);
  });

  it("keeps training-engine-v2 source free of implicit current-time decisions", () => {
    const srcRoot = fileURLToPath(new URL("../../src", import.meta.url));
    const forbiddenClockReads = [
      /\bDate\.now\(/,
      /\bnew Date\(\s*\)/,
      /\bperformance\.now\(/,
    ];
    const offenders = tsFilesUnder(srcRoot).flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");

      return forbiddenClockReads.some((pattern) => pattern.test(source)) ? [filePath] : [];
    });

    expect(offenders).toEqual([]);
  });

  it("derives alignment priorities from assessment without allowing low confidence to dominate", () => {
    const lowConfidenceSignal: AssessmentSignal = {
      id: "low-confidence-shoulder",
      type: "control_finding",
      source: "photo_assessment",
      confidence: "low",
      priority: "primary",
      region: "shoulder",
      movementRole: "scapular_control",
      description: "Low-confidence shoulder observation should remain visible but not dominant.",
    };
    const highConfidenceSignal: AssessmentSignal = {
      id: "confirmed-scapular-priority",
      type: "control_finding",
      source: "movement_screen",
      confidence: "high",
      priority: "primary",
      region: "shoulder",
      movementRole: "scapular_control",
      description: "Confirmed scapular control priority.",
    };

    expect(assessmentInfluenceForSignal(lowConfidenceSignal)).toEqual(
      expect.objectContaining({
        relevance: "low",
        direction: "neutral",
        reasonCode: "ASSESSMENT_PRIORITY_SUPPORTED",
      }),
    );

    const result = deriveAlignmentPriorities({
      signals: [lowConfidenceSignal, highConfidenceSignal],
      historicalWeaknesses: [],
    });

    expect(result.ignoredLowRelevanceSignalIds).toEqual(["low-confidence-shoulder"]);
    expect(result.priorities).toHaveLength(1);
    expect(result.priorities[0]).toEqual(
      expect.objectContaining({
        id: "alignment-confirmed-scapular-priority",
        influenceTargets: expect.arrayContaining([
          "phase_intent",
          "session_intent",
          "warmup_intent",
          "activation_intent",
          "main_candidate_scoring",
          "accessory_candidate_scoring",
          "prescription",
          "progression",
        ]),
      }),
    );
  });

  it("captures deterministic pipeline snapshots for bug localization", () => {
    expect(PIPELINE_STAGES).toContain("normalized_athlete_state");
    expect(PIPELINE_STAGES).toContain("candidate_score_breakdowns");
    expect(PIPELINE_STAGES).toContain("week_evaluation");
    expect(PIPELINE_STAGES).toContain("validation");

    const snapshot = createPipelineSnapshot({
      stage: "hard_rejected_candidates",
      localizationStage: "eligibility",
      componentId: "equipment_eligibility",
      payload: {
        rejectedExerciseIds: ["dumbbell-bench-press"],
      },
      reasonCodes: ["ROLE_MISMATCH", "EQUIPMENT_UNAVAILABLE"],
    });

    expect(snapshot.reasonCodes).toEqual(["EQUIPMENT_UNAVAILABLE", "ROLE_MISMATCH"]);

    const log: PipelineObservationLog = appendPipelineSnapshot(
      { snapshots: [] },
      snapshot,
    );
    expect(log.snapshots[0]).toEqual(snapshot);
  });
});
