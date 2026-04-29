import {
  deriveOperatorSignalsFromSessions,
  summarizeOperatorSignals,
  type OperatorSignalInput,
} from "@/lib/gymSaas/operatorSignals";

export const pilotSignalInputs: OperatorSignalInput[] = [
  {
    memberId: "pilot-member-maya",
    memberName: "Maya C.",
    sessionId: "pilot-session-maya-001",
    completedAt: "2026-04-22T14:20:00.000Z",
    feedback: {
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 1,
      painAfter: 4,
      energy: 4,
      techniqueConfidence: 4,
    },
  },
  {
    memberId: "pilot-member-jordan",
    memberName: "Jordan P.",
    sessionId: "pilot-session-jordan-001",
    completedAt: "2026-04-22T16:05:00.000Z",
    feedback: {
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 2,
    },
  },
  {
    memberId: "pilot-member-avery",
    memberName: "Avery M.",
    sessionId: "pilot-session-avery-001",
    completedAt: "2026-04-23T09:45:00.000Z",
    feedback: {
      completed: "no",
      difficultyRPE: 5,
      painBefore: 2,
      painAfter: 2,
      energy: 3,
      techniqueConfidence: 3,
    },
  },
  {
    memberId: "pilot-member-samira",
    memberName: "Samira R.",
    sessionId: "pilot-session-samira-001",
    completedAt: "2026-04-23T18:15:00.000Z",
    feedback: {
      completed: "yes",
      difficultyRPE: 9,
      painBefore: 1,
      painAfter: 1,
      energy: 2,
      techniqueConfidence: 4,
    },
  },
  {
    memberId: "pilot-member-theo",
    memberName: "Theo R.",
    sessionId: "pilot-session-theo-001",
    completedAt: "2026-04-24T12:30:00.000Z",
    feedback: {
      completed: "yes",
      difficultyRPE: 6,
      painBefore: 2,
      painAfter: 2,
      energy: 4,
      techniqueConfidence: 4,
    },
  },
  {
    memberId: "pilot-member-mina",
    memberName: "Mina S.",
    sessionId: "pilot-session-mina-001",
    completedAt: "2026-04-24T17:10:00.000Z",
    feedback: {
      completed: "partial",
      difficultyRPE: 7,
      painBefore: 2,
      painAfter: 2,
      energy: 3,
      techniqueConfidence: 3,
    },
  },
];

export const pilotOperatorSignals =
  deriveOperatorSignalsFromSessions(pilotSignalInputs);

export const pilotOperatorSummary =
  summarizeOperatorSignals(pilotOperatorSignals);

export function findPilotOperatorSignal(signalId: string) {
  return pilotOperatorSignals.find((signal) => signal.id === signalId) ?? null;
}
