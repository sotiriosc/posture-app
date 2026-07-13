import { describe, expect, test } from "vitest";
import {
  operatorSignalInputFromSessionRecord,
  operatorSignalInputsFromSessionRecords,
} from "@/lib/gymSaas/sessionSignalAdapter";
import type { SessionRecord } from "@/lib/types";

const buildSession = (overrides: Partial<SessionRecord> = {}): SessionRecord => ({
  id: "session-1",
  userId: null,
  startedAt: "2026-04-29T13:30:00.000Z",
  completedAt: "2026-04-29T14:00:00.000Z",
  createdAt: "2026-04-29T13:20:00.000Z",
  updatedAt: "2026-04-29T14:05:00.000Z",
  routineId: "routine-1",
  durationSec: 1800,
  notes: null,
  sessionFeedback: null,
  sessionPainLocation: null,
  sessionFeedbackNotes: null,
  feedback: {
    completed: "yes",
    difficultyRPE: 6,
    painBefore: 1,
    painAfter: 1,
    energy: 4,
    techniqueConfidence: 4,
  },
  source: "local",
  deletedAt: null,
  ...overrides,
});

describe("session signal adapter", () => {
  test("session with feedback maps to operator signal input", () => {
    const input = operatorSignalInputFromSessionRecord(
      buildSession({ userId: "member-123" })
    );

    expect(input).toMatchObject({
      memberId: "member-123",
      memberName: "Demo Member",
      sessionId: "session-1",
      completedAt: "2026-04-29T14:00:00.000Z",
      feedback: expect.objectContaining({ completed: "yes" }),
    });
  });

  test("session without feedback returns null", () => {
    expect(
      operatorSignalInputFromSessionRecord(buildSession({ feedback: null }))
    ).toBeNull();
  });

  test("completedAt fallback uses updatedAt then createdAt", () => {
    const updatedFallback = operatorSignalInputFromSessionRecord(
      buildSession({ completedAt: null, updatedAt: "2026-04-29T15:00:00.000Z" })
    );
    const createdFallback = operatorSignalInputFromSessionRecord(
      buildSession({
        completedAt: null,
        updatedAt: "",
        createdAt: "2026-04-29T16:00:00.000Z",
      })
    );

    expect(updatedFallback?.completedAt).toBe("2026-04-29T15:00:00.000Z");
    expect(createdFallback?.completedAt).toBe("2026-04-29T16:00:00.000Z");
  });

  test("filters sessions without feedback", () => {
    const inputs = operatorSignalInputsFromSessionRecords([
      buildSession({ id: "session-with-feedback" }),
      buildSession({ id: "session-without-feedback", feedback: null }),
    ]);

    expect(inputs).toHaveLength(1);
    expect(inputs[0]?.sessionId).toBe("session-with-feedback");
  });
});