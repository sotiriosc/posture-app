import { describe, expect, test } from "vitest";
import {
  deriveOperatorSignalFromSession,
  deriveOperatorSignalsFromSessions,
  summarizeOperatorSignals,
  type OperatorSignalInput,
} from "@/lib/gymSaas/operatorSignals";

const buildInput = (
  feedback: OperatorSignalInput["feedback"],
  overrides: Partial<OperatorSignalInput> = {}
): OperatorSignalInput => ({
  memberId: "member-1",
  memberName: "Avery M.",
  sessionId: "session-1",
  completedAt: "2026-04-29T14:00:00.000Z",
  feedback,
  ...overrides,
});

describe("gym operator signals", () => {
  test("pain increase creates high-priority discomfort review", () => {
    const signal = deriveOperatorSignalFromSession(
      buildInput({
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 1,
        painAfter: 4,
        energy: 4,
        techniqueConfidence: 4,
      })
    );

    expect(signal).toMatchObject({
      id: "operator-signal:session-1:discomfort_review",
      category: "discomfort_review",
      priority: "high",
      status: "new",
      suggestedNextStep: "Offer a trainer check-in before the next session.",
    });
    expect(signal?.flags).toContain("pain_increased");
    expect(signal?.headline).toContain("discomfort review");
  });

  test("low confidence creates technique confidence signal", () => {
    const signal = deriveOperatorSignalFromSession(
      buildInput({
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 2,
        painAfter: 2,
        energy: 4,
        techniqueConfidence: 2,
      })
    );

    expect(signal).toMatchObject({
      category: "technique_confidence",
      priority: "medium",
      suggestedNextStep:
        "Ask whether the member wants a form review or exercise walkthrough.",
    });
    expect(signal?.flags).toContain("low_technique_confidence");
  });

  test("incomplete session creates completion support signal", () => {
    const signal = deriveOperatorSignalFromSession(
      buildInput({
        completed: "no",
        difficultyRPE: 5,
        painBefore: 2,
        painAfter: 2,
        energy: 3,
        techniqueConfidence: 4,
      })
    );

    expect(signal).toMatchObject({
      category: "completion_support",
      priority: "high",
      suggestedNextStep:
        "Send a supportive restart message and simplify the next session if needed.",
    });
    expect(signal?.flags).toContain("not_completed");
  });

  test("steady successful session creates progress opportunity", () => {
    const signal = deriveOperatorSignalFromSession(
      buildInput({
        completed: "yes",
        difficultyRPE: 6,
        painBefore: 2,
        painAfter: 2,
        energy: 4,
        techniqueConfidence: 4,
      })
    );

    expect(signal).toMatchObject({
      category: "progress_opportunity",
      priority: "low",
      suggestedNextStep:
        "Celebrate completion and invite the member to continue the next planned session.",
    });
  });

  test("null or empty feedback returns null", () => {
    expect(deriveOperatorSignalFromSession(buildInput(null))).toBeNull();
    expect(deriveOperatorSignalFromSession(buildInput({}))).toBeNull();
  });

  test("summarizes derived operator signals", () => {
    const signals = deriveOperatorSignalsFromSessions([
      buildInput(
        {
          completed: "no",
          difficultyRPE: 5,
          painBefore: 2,
          painAfter: 2,
          energy: 3,
          techniqueConfidence: 4,
        },
        { memberId: "member-1", sessionId: "session-1" }
      ),
      buildInput(
        {
          completed: "yes",
          difficultyRPE: 6,
          painBefore: 2,
          painAfter: 2,
          energy: 4,
          techniqueConfidence: 4,
        },
        { memberId: "member-2", sessionId: "session-2" }
      ),
    ]);

    expect(summarizeOperatorSignals(signals)).toMatchObject({
      totalSignals: 2,
      newSignals: 2,
      highPriorityCount: 1,
      lowPriorityCount: 1,
      membersNeedingAttention: 2,
      byCategory: expect.objectContaining({
        completion_support: 1,
        progress_opportunity: 1,
      }),
    });
  });
});
