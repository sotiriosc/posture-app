import { buildOwnerEnrollmentRevision } from "@praxis/training-engine-v2";
import { withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, ownerJson, rejectsIdentityFields } from "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "preview",
    actionFamily: "enrollment", action: "enrollment" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || rejectsIdentityFields(body) || body.explicitConsent !== true ||
      !["preview_only", "apply_allowed"].includes(String(body.permission)) ||
      (body.permission === "apply_allowed" && authorization.gate.mode !== "apply")) {
    return ownerJson({ ok: false, error: { code: "INVALID_ENROLLMENT", message: "Enrollment is invalid." } }, 400);
  }
  try {
    return await withControlledOwnerRepositories(async ({ enrollmentProfiles }) => {
      const current = await enrollmentProfiles.readCurrentEnrollment(authorization.userId);
      const revision = buildOwnerEnrollmentRevision({ enrollmentId: current?.enrollmentId,
        userId: authorization.userId, basedOnRevisionId: current?.revisionId ?? null, state: "active",
        fixedGoal: "strength", permission: body.permission as "preview_only" | "apply_allowed",
        explicitConsent: true, acceptedVersions: ["controlled-owner-delivery@1.0.0"],
        provenance: { source: "owner_confirmation", sourceRefs: ["owner-account-enrollment"] },
        createdAt: authorization.evaluatedAt });
      const written = await enrollmentProfiles.appendEnrollment(revision);
      return written === "conflict" ? ownerJson({ ok: false,
        error: { code: "ENROLLMENT_CONFLICT", message: "Enrollment changed. Reload and try again." } }, 409) :
        ownerJson({ ok: true, enrollmentId: revision.enrollmentId, revisionId: revision.revisionId });
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
