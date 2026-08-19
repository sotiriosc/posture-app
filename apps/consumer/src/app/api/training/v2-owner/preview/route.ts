import { proposeOwnerImportsFromTrainingSnapshot, withControlledOwnerRepositories,
  generateControlledOwnerGetStrongerPreview } from "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, loadOwnerProductRuntimeContext, OWNER_ENGINE_VERSION,
  OWNER_POLICY_VERSIONS, ownerJson, rejectsIdentityFields } from "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "preview",
    actionFamily: "preview", action: "preview" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null);
  const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
  if (rejectsIdentityFields(body) || !idempotencyKey) return ownerJson({ ok: false,
    error: { code: "INVALID_PREVIEW_REQUEST", message: "Preview request is invalid." } }, 400);
  try {
    return await withControlledOwnerRepositories(async ({ enrollmentProfiles, delivery, outcomeSources }) => {
      let product: Awaited<ReturnType<typeof loadOwnerProductRuntimeContext>> | null = null;
      const loadProduct = async () => product ??= await loadOwnerProductRuntimeContext(authorization.userId);
      const generated = await generateControlledOwnerGetStrongerPreview({
        requestedAt: authorization.evaluatedAt, evaluationTime: authorization.evaluatedAt,
        engineVersion: OWNER_ENGINE_VERSION, policyVersions: OWNER_POLICY_VERSIONS, idempotencyKey,
        gate: async () => authorization.gate, enrollmentProfiles, delivery,
        productImport: { loadProposedFacts: async () => {
          const current = await loadProduct();
          return proposeOwnerImportsFromTrainingSnapshot({ snapshot: current.snapshot,
            sourceRevision: current.sourceProductRevisionId });
        } },
        loadSourceContext: async () => {
          const current = await loadProduct();
          return { sourceProductSnapshotId: current.sourceProductSnapshotId,
            sourceProductRevisionId: current.sourceProductRevisionId,
            activeLegacyProgramRevisionId: current.activeLegacyProgramRevisionId,
            assessmentReport: current.snapshot.assessment ?? null };
        },
        loadCalibrationEvidence: async (userId, evaluationTime) => {
          const cycle = await delivery.readLatestCalibrationCycle(userId);
          if (!cycle) return null;
          const records = await outcomeSources.readActiveSourceRecords(userId, evaluationTime);
          return { cycle, records };
        },
      });
      if (!generated.preview) {
        const safetyReviewRequired = generated.reasonCodes.some((reason) =>
          reason.startsWith("OWNER_TRAINING_SAFETY_REVIEW_REQUIRED") ||
          reason.startsWith("OWNER_PAIN_FACT_"));
        return ownerJson({ ok: false, error: { code: safetyReviewRequired ? "SAFETY_REVIEW_REQUIRED" :
          generated.status.toUpperCase(), message: safetyReviewRequired ?
            "Review and confirm the current pain or safety information before generating a preview." :
            generated.status === "profile_not_ready" ? "Confirm the owner profile first." :
              "Preview could not be generated." }, reasonCodes: generated.reasonCodes },
        generated.status === "conflict" ? 409 : 422);
      }
      return ownerJson({ ok: true, status: generated.status, previewId: generated.preview.previewId,
        previewFingerprint: generated.preview.previewFingerprint });
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
