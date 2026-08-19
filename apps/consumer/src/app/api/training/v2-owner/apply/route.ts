import { applyControlledOwnerGetStrongerApproval, withControlledOwnerRepositories } from
  "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, loadOwnerProductRuntimeContext, OWNER_ENGINE_VERSION,
  OWNER_POLICY_VERSIONS, ownerJson, rejectsIdentityFields } from "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "apply",
    actionFamily: "application", action: "application" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!body || rejectsIdentityFields(body) || typeof body.approvalId !== "string" || !idempotencyKey) {
    return ownerJson({ ok: false, error: { code: "INVALID_APPLICATION_REQUEST",
      message: "Application request is invalid." } }, 400);
  }
  try {
    return await withControlledOwnerRepositories(async ({ enrollmentProfiles, delivery }) => {
      const result = await applyControlledOwnerGetStrongerApproval({ approvalId: body.approvalId as string,
        idempotencyKey, csrfVerified: true, appliedAt: authorization.evaluatedAt,
        gate: async () => authorization.gate, enrollmentProfiles, delivery,
        loadCurrentContext: async (userId) => {
          const [product, profile] = await Promise.all([loadOwnerProductRuntimeContext(userId),
            enrollmentProfiles.readCurrentProfile(userId)]);
          if (!profile) throw new Error("OWNER_PROFILE_REQUIRED");
          return { currentProductRevisionId: product.sourceProductRevisionId,
            currentLegacyProgramRevisionId: product.activeLegacyProgramRevisionId,
            currentEquipmentSourceRevision: profile.equipmentCapabilitySnapshot.sourceRevision,
            currentSafetyState: profile.trainingSafety, currentEngineVersion: OWNER_ENGINE_VERSION,
            currentPolicyVersions: OWNER_POLICY_VERSIONS, activeLegacySession: product.activeLegacySession,
            activeV2Session: false };
        } });
      return result.application ? ownerJson({ ok: true, status: result.status,
        applicationId: result.application.applicationId }) : ownerJson({ ok: false,
        error: { code: result.status.toUpperCase(), message: "Program could not be applied." },
        reasonCodes: result.reasonCodes }, result.status === "not_found" ? 404 : result.status === "conflict" ? 409 : 422);
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
