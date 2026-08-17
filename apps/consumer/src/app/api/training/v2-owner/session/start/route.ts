import { startControlledOwnerSession, withControlledOwnerRepositories } from
  "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, loadActiveOwnerEnvelope, ownerJson, rejectsIdentityFields } from
  "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "apply",
    actionFamily: "session", action: "session-start" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || rejectsIdentityFields(body) || typeof body.applicationId !== "string" ||
      typeof body.sessionId !== "string" || !["full", "lighter", "recovery"].includes(String(body.mode))) {
    return ownerJson({ ok: false, error: { code: "INVALID_SESSION_START",
      message: "Session request is invalid." } }, 400);
  }
  try {
    return await withControlledOwnerRepositories(async ({ delivery, sessionPractice }) => {
      const active = await loadActiveOwnerEnvelope({ userId: authorization.userId,
        applicationId: body.applicationId as string, delivery });
      if (!active || !active.envelope.productProjection.sessions.some((session) => session.sessionId === body.sessionId)) {
        return ownerJson({ ok: false, error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
      }
      const result = await startControlledOwnerSession({ userId: authorization.userId,
        envelope: active.envelope, sessionId: body.sessionId as string,
        mode: body.mode as "full" | "lighter" | "recovery", startedAt: authorization.evaluatedAt,
        repository: sessionPractice });
      return result.revision ? ownerJson({ ok: true, status: result.status,
        attemptId: result.revision.attemptId,
        persistenceRevisionId: result.revision.persistenceRevisionId }) : ownerJson({ ok: false,
        error: { code: "SESSION_MODE_UNAVAILABLE", message: "That practice mode is unavailable." },
        reasonCodes: result.reasonCodes }, 422);
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
