import { describe, expect, test } from "vitest";
import { defaultGymConfig } from "@/lib/gymSaas/gymConfig";
import { buildTrainerHandoff } from "@/lib/gymSaas/trainerHandoff";
import type { OperatorSignal } from "@/lib/gymSaas/operatorSignals";

const buildSignal = (
  overrides: Partial<OperatorSignal>
): OperatorSignal => ({
  id: "operator-signal:test",
  memberId: "member-1",
  memberName: "Avery M.",
  sessionId: "session-1",
  completedAt: "2026-04-29T14:00:00.000Z",
  category: "progress_opportunity",
  priority: "low",
  status: "new",
  headline: "Avery M. is ready for the next planned step",
  detail: "The member completed the session with steady feedback.",
  suggestedNextStep:
    "Celebrate completion and invite the member to continue the next planned session.",
  flags: [],
  coachSummary:
    "Progress opportunity: steady completion supports continuing the next planned session.",
  ...overrides,
});

describe("trainer handoff", () => {
  test("discomfort signal creates careful trainer check-in copy", () => {
    const handoff = buildTrainerHandoff(
      buildSignal({
        category: "discomfort_review",
        priority: "high",
      }),
      defaultGymConfig
    );

    expect(handoff.trainerAction).toContain("offer a trainer check-in");
    expect(handoff.memberFacingMessage).toContain(
      "reported increased discomfort"
    );
    expect(handoff.ownerNote).toContain("Member reported increased discomfort");
    expect(handoff.memberFacingMessage.toLowerCase()).not.toContain("diagn");
    expect(handoff.memberFacingMessage.toLowerCase()).not.toContain("medic");
    expect(handoff.memberFacingMessage.toLowerCase()).not.toContain("emerg");
  });

  test("technique confidence signal creates form review copy", () => {
    const handoff = buildTrainerHandoff(
      buildSignal({
        category: "technique_confidence",
        priority: "medium",
      }),
      defaultGymConfig
    );

    expect(handoff.title).toBe("Form review opportunity");
    expect(handoff.trainerAction).toContain("form review");
    expect(handoff.memberFacingMessage).toContain("walk through the movement");
  });

  test("completion support creates supportive restart copy", () => {
    const handoff = buildTrainerHandoff(
      buildSignal({
        category: "completion_support",
        priority: "high",
      }),
      defaultGymConfig
    );

    expect(handoff.title).toBe("Supportive restart recommended");
    expect(handoff.trainerAction).toContain("supportive restart message");
    expect(handoff.memberFacingMessage).toContain("restart");
    expect(handoff.ctaLabel).toBe("Prepare restart note");
  });
  test("progress opportunity creates positive reinforcement copy", () => {
    const handoff = buildTrainerHandoff(
      buildSignal({
        category: "progress_opportunity",
        priority: "low",
      }),
      defaultGymConfig
    );

    expect(handoff.title).toBe("Positive reinforcement opportunity");
    expect(handoff.trainerAction).toContain("Celebrate");
    expect(handoff.memberFacingMessage).toContain("Nice work");
    expect(handoff.ctaLabel).toBe("Prepare encouragement note");
  });
});
