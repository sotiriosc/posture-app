import { deriveSessionFeedbackSignals } from "@/lib/sessionFeedbackSignals";
import type { SessionFeedback } from "@/lib/types";

export type OperatorSignalCategory =
  | "discomfort_review"
  | "technique_confidence"
  | "completion_support"
  | "recovery_support"
  | "progress_opportunity";

export type OperatorSignalPriority = "low" | "medium" | "high";

export type OperatorSignalInput = {
  memberId: string;
  memberName: string;
  sessionId: string;
  completedAt: string;
  feedback?: Partial<SessionFeedback> | null;
};

export type OperatorSignal = {
  id: string;
  memberId: string;
  memberName: string;
  sessionId: string;
  completedAt: string;
  category: OperatorSignalCategory;
  priority: OperatorSignalPriority;
  status: "new";
  headline: string;
  detail: string;
  suggestedNextStep: string;
  flags: string[];
  coachSummary: string;
};

export type OperatorDashboardSummary = {
  totalSignals: number;
  newSignals: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  byCategory: Record<OperatorSignalCategory, number>;
  membersNeedingAttention: number;
};

type SignalCopy = Pick<
  OperatorSignal,
  "category" | "priority" | "headline" | "detail" | "suggestedNextStep" | "coachSummary"
>;

const emptyCategoryCounts = (): Record<OperatorSignalCategory, number> => ({
  discomfort_review: 0,
  technique_confidence: 0,
  completion_support: 0,
  recovery_support: 0,
  progress_opportunity: 0,
});

const buildSignalId = (
  sessionId: string,
  category: OperatorSignalCategory
) => `operator-signal:${sessionId}:${category}`;

const buildSignal = (
  input: OperatorSignalInput,
  copy: SignalCopy,
  flags: string[]
): OperatorSignal => ({
  id: buildSignalId(input.sessionId, copy.category),
  memberId: input.memberId,
  memberName: input.memberName,
  sessionId: input.sessionId,
  completedAt: input.completedAt,
  status: "new",
  flags,
  ...copy,
});

export function deriveOperatorSignalFromSession(
  input: OperatorSignalInput
): OperatorSignal | null {
  const signals = deriveSessionFeedbackSignals(input.feedback);
  if (!signals) return null;

  const flags = [...signals.flags];

  if (signals.painDelta !== undefined && signals.painDelta >= 2) {
    return buildSignal(
      input,
      {
        category: "discomfort_review",
        priority: "high",
        headline: `${input.memberName} may need a discomfort review`,
        detail:
          "The member reported increased discomfort after the session. Keep the next touchpoint calm and practical.",
        suggestedNextStep: "Offer a trainer check-in before the next session.",
        coachSummary:
          "Discomfort review: member feedback suggests a conservative trainer check-in before the next session.",
      },
      flags
    );
  }

  if (signals.completed === "no") {
    return buildSignal(
      input,
      {
        category: "completion_support",
        priority: "high",
        headline: `${input.memberName} did not complete the session`,
        detail:
          "The member reported that the planned session was not completed. A supportive restart may help them continue.",
        suggestedNextStep:
          "Send a supportive restart message and simplify the next session if needed.",
        coachSummary:
          "Completion support: member did not complete the session and may benefit from a simple restart.",
      },
      flags
    );
  }

  if (signals.completed === "partial") {
    return buildSignal(
      input,
      {
        category: "completion_support",
        priority: "medium",
        headline: `${input.memberName} partially completed the session`,
        detail:
          "The member completed part of the session. A manageable next step can help maintain momentum.",
        suggestedNextStep:
          "Send a supportive restart message and simplify the next session if needed.",
        coachSummary:
          "Completion support: partial completion suggests the next session should stay manageable.",
      },
      flags
    );
  }

  if (signals.confidenceBand === "low") {
    return buildSignal(
      input,
      {
        category: "technique_confidence",
        priority: "medium",
        headline: `${input.memberName} reported low technique confidence`,
        detail:
          "The member may benefit from clearer exercise guidance before adding difficulty.",
        suggestedNextStep:
          "Ask whether the member wants a form review or exercise walkthrough.",
        coachSummary:
          "Trainer review: technique confidence was low, so a form review or walkthrough may help.",
      },
      flags
    );
  }

  if (signals.effortBand === "high" || signals.energyBand === "low") {
    return buildSignal(
      input,
      {
        category: "recovery_support",
        priority: "medium",
        headline: `${input.memberName} may need recovery support`,
        detail:
          "Feedback suggests the next session should stay steady while recovery is checked.",
        suggestedNextStep:
          "Hold intensity steady and check recovery before progressing.",
        coachSummary:
          "Recovery support: keep the next exposure steady and check readiness before progressing.",
      },
      flags
    );
  }

  if (signals.readinessHint === "progress") {
    return buildSignal(
      input,
      {
        category: "progress_opportunity",
        priority: "low",
        headline: `${input.memberName} is ready for the next planned step`,
        detail:
          "The member completed the session with steady feedback and can continue the planned path.",
        suggestedNextStep:
          "Celebrate completion and invite the member to continue the next planned session.",
        coachSummary:
          "Progress opportunity: steady completion supports continuing the next planned session.",
      },
      flags
    );
  }

  return null;
}

export function deriveOperatorSignalsFromSessions(
  inputs: OperatorSignalInput[]
): OperatorSignal[] {
  return inputs
    .map((input) => deriveOperatorSignalFromSession(input))
    .filter((signal): signal is OperatorSignal => Boolean(signal));
}

export function summarizeOperatorSignals(
  signals: OperatorSignal[]
): OperatorDashboardSummary {
  const byCategory = emptyCategoryCounts();
  const memberIds = new Set<string>();

  signals.forEach((signal) => {
    byCategory[signal.category] += 1;
    memberIds.add(signal.memberId);
  });

  return {
    totalSignals: signals.length,
    newSignals: signals.filter((signal) => signal.status === "new").length,
    highPriorityCount: signals.filter((signal) => signal.priority === "high")
      .length,
    mediumPriorityCount: signals.filter(
      (signal) => signal.priority === "medium"
    ).length,
    lowPriorityCount: signals.filter((signal) => signal.priority === "low")
      .length,
    byCategory,
    membersNeedingAttention: memberIds.size,
  };
}
