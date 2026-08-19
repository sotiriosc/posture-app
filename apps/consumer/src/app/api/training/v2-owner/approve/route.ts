import { approveControlledOwnerGetStrongerPreview, withControlledOwnerRepositories } from
  "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, loadOwnerProductRuntimeContext, OWNER_ENGINE_VERSION,
  OWNER_POLICY_VERSIONS, ownerJson, rejectsIdentityFields } from "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "apply",
    actionFamily: "approval", action: "approval" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  const approvalClassification = body?.approvalClassification;
  if (!body || rejectsIdentityFields(body) || typeof body.previewId !== "string" ||
      typeof body.previewFingerprint !== "string" || body.explicitConfirmation !== true ||
      !["ordinary_program", "initial_calibration"].includes(String(approvalClassification)) || !idempotencyKey) {
    return ownerJson({ ok: false, error: { code: "INVALID_APPROVAL_REQUEST",
      message: "Approval request is invalid." } }, 400);
  }
  try {
    return await withControlledOwnerRepositories(async ({ enrollmentProfiles, delivery }) => {
      const result = await approveControlledOwnerGetStrongerPreview({ previewId: body.previewId as string,
        previewFingerprint: body.previewFingerprint as string, explicitConfirmation: true, csrfVerified: true,
        approvalClassification: approvalClassification as "ordinary_program" | "initial_calibration",
        idempotencyKey, approvedAt: authorization.evaluatedAt, gate: async () => authorization.gate,
        enrollmentProfiles, delivery, loadCurrentContext: async (userId) => {
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
      return result.approval ? ownerJson({ ok: true, status: result.status,
        approvalId: result.approval.approvalId }) : ownerJson({ ok: false,
        error: { code: result.status.toUpperCase(), message: "Preview could not be approved." },
        reasonCodes: result.reasonCodes }, result.status === "not_found" ? 404 : result.status === "conflict" ? 409 : 422);
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
