import { recordControlledOwnerCalibrationRecovery, withControlledOwnerTransaction } from
  "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, ownerJson, rejectsIdentityFields } from
  "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "apply",
    actionFamily: "session", action: "session-recovery" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!body || rejectsIdentityFields(body) || typeof body.cycleId !== "string" ||
      typeof body.sessionId !== "string" ||
      !["explicit_adequate", "localized_concern", "systemic_concern", "explicit_not_ready"]
        .includes(String(body.readiness)) ||
      !["restorative", "disrupted", "insufficient", "unknown"].includes(String(body.sleepReport)) ||
      !idempotencyKey) return ownerJson({ ok: false, error: { code: "INVALID_CALIBRATION_RECOVERY",
        message: "Recovery check-in is invalid." } }, 400);
  try {
    return await withControlledOwnerTransaction(async ({ delivery, outcomeSources }) => {
      const result = await recordControlledOwnerCalibrationRecovery({ userId: authorization.userId,
        cycleId: body.cycleId as string, observation: Object.freeze({ schemaVersion: "1.0.0" as const,
          cycleId: body.cycleId as string, sessionId: body.sessionId as string,
          readiness: body.readiness as "explicit_adequate" | "localized_concern" |
            "systemic_concern" | "explicit_not_ready",
          sleepReport: body.sleepReport as "restorative" | "disrupted" | "insufficient" | "unknown",
          reportingAuthority: "athlete_explicit_report" as const }), idempotencyKey,
        recordedAt: authorization.evaluatedAt, delivery, outcomeRepository: outcomeSources });
      return result.cycle && ["recorded", "exact_retry"].includes(result.status) ? ownerJson({ ok: true,
        status: result.status, cycleState: result.cycle.state,
        cycleRevisionId: result.cycle.cycleRevisionId }) : ownerJson({ ok: false,
        error: { code: result.status.toUpperCase(), message: "Recovery check-in could not be recorded." },
        reasonCodes: result.reasonCodes }, result.status === "not_found" ? 404 :
          result.status === "conflict" ? 409 : 422);
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
