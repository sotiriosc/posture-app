import { completeControlledOwnerSession, withControlledOwnerTransaction } from
  "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, loadActiveOwnerEnvelope, ownerJson, rejectsIdentityFields } from
  "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "apply",
    actionFamily: "session", action: "session-complete" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!body || rejectsIdentityFields(body) || typeof body.applicationId !== "string" ||
      typeof body.attemptId !== "string" || typeof body.basedOnPersistenceRevisionId !== "string" ||
      !Array.isArray(body.performedSourceEventIds) || !Array.isArray(body.completedBlockIds) ||
      !Array.isArray(body.partiallyCompletedBlockIds) || !idempotencyKey ||
      ![body.performedSourceEventIds, body.completedBlockIds, body.partiallyCompletedBlockIds]
        .every((list) => (list as unknown[]).every((value) => typeof value === "string"))) {
    return ownerJson({ ok: false, error: { code: "INVALID_SESSION_COMPLETION",
      message: "Session completion is invalid." } }, 400);
  }
  try {
    return await withControlledOwnerTransaction(async ({ delivery, sessionPractice, outcomeSources }) => {
      const active = await loadActiveOwnerEnvelope({ userId: authorization.userId,
        applicationId: body.applicationId as string, delivery });
      if (!active) return ownerJson({ ok: false, error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
      const result = await completeControlledOwnerSession({ userId: authorization.userId,
        attemptId: body.attemptId as string,
        basedOnPersistenceRevisionId: body.basedOnPersistenceRevisionId as string,
        envelope: active.envelope, performedSourceEventIds: body.performedSourceEventIds as string[],
        completedBlockIds: body.completedBlockIds as string[],
        partiallyCompletedBlockIds: body.partiallyCompletedBlockIds as string[],
        completedAt: authorization.evaluatedAt, idempotencyKey, repository: sessionPractice, delivery,
        outcomeRepository: outcomeSources });
      return result.revision ? ownerJson({ ok: true, status: result.status,
        persistenceRevisionId: result.revision.persistenceRevisionId,
        completion: result.revision.completion }) : ownerJson({ ok: false,
        error: { code: result.status === "invalid_calibration_evidence" ? "INVALID_CALIBRATION_EVIDENCE" :
          "SESSION_COMPLETION_CONFLICT", message: result.status === "invalid_calibration_evidence" ?
            "Complete every required set and response field before finishing the calibration session." :
            "Session completion conflicted." },
        reasonCodes: "reasonCodes" in result ? result.reasonCodes : [] },
      result.status === "invalid_calibration_evidence" ? 422 : 409);
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
