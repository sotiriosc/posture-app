import { recordControlledOwnerSessionDraft, reviseControlledOwnerSessionMode,
  withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, loadActiveOwnerEnvelope, ownerJson, rejectsIdentityFields } from
  "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function nonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "apply",
    actionFamily: "session", action: "session-record" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || rejectsIdentityFields(body) || typeof body.attemptId !== "string" ||
      typeof body.basedOnPersistenceRevisionId !== "string") return ownerJson({ ok: false,
    error: { code: "INVALID_SESSION_RECORD", message: "Session update is invalid." } }, 400);
  const attemptId = body.attemptId;
  const basedOnPersistenceRevisionId = body.basedOnPersistenceRevisionId;
  try {
    return await withControlledOwnerRepositories(async ({ delivery, sessionPractice }) => {
      if (body.action === "mode") {
        if (typeof body.applicationId !== "string" || !["full", "lighter", "recovery"].includes(String(body.mode))) {
          return ownerJson({ ok: false, error: { code: "INVALID_MODE_REVISION",
            message: "Mode revision is invalid." } }, 400);
        }
        const active = await loadActiveOwnerEnvelope({ userId: authorization.userId,
          applicationId: body.applicationId, delivery });
        if (!active) return ownerJson({ ok: false, error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
        const result = await reviseControlledOwnerSessionMode({ userId: authorization.userId,
          attemptId, basedOnPersistenceRevisionId,
          envelope: active.envelope, mode: body.mode as "full" | "lighter" | "recovery",
          selectedAt: authorization.evaluatedAt, repository: sessionPractice });
        return result.revision && result.status !== "locked" ? ownerJson({ ok: true, status: result.status,
          persistenceRevisionId: result.revision.persistenceRevisionId }) : ownerJson({ ok: false,
          error: { code: result.status.toUpperCase(), message: "Mode cannot be changed." },
          reasonCodes: result.reasonCodes }, result.status === "locked" ? 409 : 422);
      }
      const position = body.currentPosition as Record<string, unknown> | null;
      const timers = Array.isArray(body.timers) ? body.timers : [];
      if (!position || !nonNegativeInteger(position.exerciseIndex) || !nonNegativeInteger(position.blockIndex) ||
          !nonNegativeInteger(position.setIndex) || !timers.every((entry) => {
            const timer = entry as Record<string, unknown>;
            return typeof timer.timerId === "string" && nonNegativeInteger(timer.elapsedSeconds) &&
              typeof timer.running === "boolean";
          }) || !body.actualPerformanceState || typeof body.actualPerformanceState !== "object" ||
          Array.isArray(body.actualPerformanceState)) return ownerJson({ ok: false,
        error: { code: "INVALID_SESSION_DRAFT", message: "Session draft is invalid." } }, 400);
      const result = await recordControlledOwnerSessionDraft({ userId: authorization.userId,
        attemptId, basedOnPersistenceRevisionId,
        currentPosition: position as { exerciseIndex: number; blockIndex: number; setIndex: number },
        actualPerformanceState: body.actualPerformanceState as Readonly<Record<string, unknown>>,
        timers: timers as { timerId: string; elapsedSeconds: number; running: boolean }[],
        executionStarted: body.executionStarted === true, recordedAt: authorization.evaluatedAt,
        repository: sessionPractice });
      return result.revision ? ownerJson({ ok: true, status: result.status,
        persistenceRevisionId: result.revision.persistenceRevisionId }) : ownerJson({ ok: false,
        error: { code: "SESSION_REVISION_CONFLICT", message: "Session changed. Reload to resume." } }, 409);
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
