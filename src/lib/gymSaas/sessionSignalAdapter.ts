import type { OperatorSignalInput } from "@/lib/gymSaas/operatorSignals";
import type { SessionRecord } from "@/lib/types";

export function operatorSignalInputFromSessionRecord(
  session: SessionRecord
): OperatorSignalInput | null {
  if (!session.feedback) return null;

  return {
    memberId: session.userId ?? "demo-member",
    memberName: "Demo Member",
    sessionId: session.id,
    completedAt: session.completedAt || session.updatedAt || session.createdAt,
    feedback: session.feedback,
  };
}

export function operatorSignalInputsFromSessionRecords(
  sessions: SessionRecord[]
): OperatorSignalInput[] {
  return sessions
    .map((session) => operatorSignalInputFromSessionRecord(session))
    .filter((input): input is OperatorSignalInput => Boolean(input));
}
