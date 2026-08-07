/**
 * Phase 7B §12 — Consumer presentation parity via shared engine + real interaction wiring.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  FEEDBACK_CONTRACT_ACTION_LABELS,
  resolveNoValidSwapMessage,
  resolveProgramPresentation,
} from "@/lib/program/presentation";

const root = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

beforeEach(() => {
  clearProgramVariationHistory();
});

describe("Phase 7B consumer presentation parity", () => {
  it("shared engine presentation fields match consumer contract expectations", () => {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: ["Shoulders"],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["dumbbells"],
    };
    const program = generateWeeklyProgram(
      questionnaire,
      "p7b-consumer-parity",
      { seed: "p7b-consumer-parity" }
    );
    const model = resolveProgramPresentation({ program, questionnaire });

    expect(model.program.equipmentIdentity).toBeTruthy();
    expect(model.sessions[0]?.purpose).toBeTruthy();
    expect(model.sessions[0]?.expectedDuration).toMatch(/about \d+ minutes/i);
    expect(model.sessions[0]?.equipmentNeeded.length).toBeGreaterThan(0);
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.sacrifice.label).toBe("Skip for now");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.test.label).toBe("Try again");
    expect(FEEDBACK_CONTRACT_ACTION_LABELS.modify.label).toBe("Make it easier");
    expect(resolveNoValidSwapMessage().text.length).toBeGreaterThan(10);
  });

  it("pain action labels and no-valid-swap actions are wired", () => {
    const src = read("src/app/session/SessionClient.tsx");
    expect(src).toContain("FEEDBACK_CONTRACT_ACTION_LABELS");
    expect(src).toContain("FEEDBACK_CONTRACT_ACTION_LABELS.sacrifice.label");
    expect(src).toContain("FEEDBACK_CONTRACT_ACTION_LABELS.test.label");
    expect(src).toContain("FEEDBACK_CONTRACT_ACTION_LABELS.modify.label");
    expect(src).toContain("FEEDBACK_CONTRACT_ACTION_LABELS.dismiss.label");
    expect(src).not.toContain("Keep and retest");
    expect(src).not.toMatch(/>\s*Sacrifice\s*</);
    expect(src).not.toMatch(/>\s*Modify\s*</);
    expect(src).toContain("resolveNoValidSwapMessage");
    expect(src).toContain("setNoValidSwapActive(true)");
    expect(src).toContain("Skip this exercise");
    expect(src).toContain("End session");
    expect(src).toContain("Save discomfort");
    expect(src).toContain("persistSessionDraftNow");
    expect(src).toContain("substitutionByItemId");
  });

  it("personal-block and feedback-contract labels are reachable", () => {
    const sessionSrc = read("src/app/session/SessionClient.tsx");
    expect(sessionSrc).toContain("Block until I reset");
    expect(sessionSrc).toContain("Remove from my program");
    expect(sessionSrc).toContain("blockedExerciseIds");

    const settingsSrc = read("src/app/settings/page.tsx");
    expect(settingsSrc).toContain("Blocked exercises");
    expect(settingsSrc).toMatch(/Unblock|Reset/);

    const resultsSrc = read("src/components/ResultsRoutine.tsx");
    expect(resultsSrc).toContain("resolveAssessmentFocusFromPose");
    expect(resultsSrc).toContain("resolveProgramPresentation");
    expect(resultsSrc).not.toContain(
      "poseState.report?.observations"
    );
  });
});
