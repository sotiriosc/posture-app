import { rollbackControlledOwnerProgram, withControlledOwnerRepositories } from
  "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, ownerJson, rejectsIdentityFields } from
  "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "apply",
    actionFamily: "rollback", action: "rollback" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!body || rejectsIdentityFields(body) || typeof body.applicationId !== "string" ||
      !Number.isInteger(body.expectedPointerRevision) || body.explicitConfirmation !== true || !idempotencyKey) {
    return ownerJson({ ok: false, error: { code: "INVALID_ROLLBACK",
      message: "Rollback confirmation is invalid." } }, 400);
  }
  try {
    const result = await withControlledOwnerRepositories(async ({ delivery, sessionPractice }) => {
      const application = await delivery.readApplicationExact(authorization.userId, body.applicationId as string);
      if (!application) return Object.freeze({ status: "conflict" as const, pointer: null, auditEvent: null,
        reasonCodes: Object.freeze(["OWNER_ROLLBACK_APPLICATION_NOT_FOUND"]) });
      const activeAttempt = (await sessionPractice.listAthleteCurrentRevisions(authorization.userId))
        .find((revision) => revision.request.sourceProgramId === application.envelopeId &&
          !["completed", "abandoned", "invalidated"].includes(revision.lifecycle.state));
      if (activeAttempt) return Object.freeze({ status: "conflict" as const, pointer: null, auditEvent: null,
        reasonCodes: Object.freeze(["OWNER_ROLLBACK_ACTIVE_SESSION_CONFLICT"]) });
      return rollbackControlledOwnerProgram({ gate: authorization.gate, repository: delivery,
        applicationId: body.applicationId as string,
        expectedPointerRevision: body.expectedPointerRevision as number, explicitConfirmation: true,
        csrfVerified: authorization.csrfVerified, idempotencyKey,
        rolledBackAt: authorization.evaluatedAt });
    });
    return result.pointer && result.status !== "conflict"
      ? ownerJson({ ok: true, status: result.status, pointerRevision: result.pointer.revision,
        rollbackEventId: result.auditEvent?.eventId ?? null })
      : ownerJson({ ok: false, error: { code: "ROLLBACK_CONFLICT",
        message: "Rollback conflicted with the active Program state." }, reasonCodes: result.reasonCodes }, 409);
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
