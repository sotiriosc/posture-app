import { createHash } from "node:crypto";
import { buildOwnerProfileRevision, isOwnerAvailableTrainingDays } from "@praxis/training-engine-v2";
import { normalizeProposedOwnerPainRegionFact, proposeOwnerImportsFromTrainingSnapshot,
  withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerMutation, authorizeOwnerRead, loadOwnerProductRuntimeContext, ownerJson, rejectsIdentityFields } from
  "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const authorization = await authorizeOwnerRead({ operation: "preview", action: "profile-read", limit: 120 });
  if (!authorization.allowed) return authorization.response;
  const gate = authorization.gate;
  try {
    const profile = await withControlledOwnerRepositories(({ enrollmentProfiles }) =>
      enrollmentProfiles.readCurrentProfile(gate.userId!));
    return ownerJson({ ok: true, profile });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "preview",
    actionFamily: "profile", action: "profile" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || rejectsIdentityFields(body)) return ownerJson({ ok: false,
    error: { code: "INVALID_PROFILE", message: "Profile is invalid." } }, 400);
  const days = body.daysPerWeek;
  const sessionMinutes = body.sessionMinutes as { status?: unknown; minutes?: unknown } | null;
  const environment = body.equipmentEnvironment;
  const capabilityIds = body.capabilityIds;
  const experience = body.coarseExperience;
  const assessmentReferences = body.assessmentReferences;
  const painFactIds = body.painFactIds;
  const validMinutes = sessionMinutes?.status === "explicit_unknown" && sessionMinutes.minutes === null ||
    sessionMinutes?.status === "known" && typeof sessionMinutes.minutes === "number" &&
      sessionMinutes.minutes >= 15 && sessionMinutes.minutes <= 180;
  if (!isOwnerAvailableTrainingDays(days) || !validMinutes ||
      !["home", "commercial_gym", "mixed"].includes(String(environment)) ||
      !Array.isArray(capabilityIds) || !capabilityIds.length || !capabilityIds.every((value) => typeof value === "string") ||
      !Array.isArray(assessmentReferences) || !assessmentReferences.every((value) => typeof value === "string") ||
      !Array.isArray(painFactIds) || !painFactIds.every((value) => typeof value === "string") ||
      !["beginner", "intermediate", "advanced"].includes(String(experience)) || body.painConfirmed !== true) {
    return ownerJson({ ok: false, error: { code: "INVALID_PROFILE", message: "Profile is invalid." } }, 400);
  }
  const normalizedOpportunities = Array.from({ length: days }, (_, index) => ({
    opportunityId: `owner-opportunity-${index + 1}`, order: index + 1,
    minutes: sessionMinutes?.status === "known" ? sessionMinutes.minutes as number : null,
  }));
  try {
    return await withControlledOwnerRepositories(async ({ enrollmentProfiles }) => {
      const product = await loadOwnerProductRuntimeContext(authorization.userId);
      const proposedFacts = proposeOwnerImportsFromTrainingSnapshot({
        snapshot: product.snapshot, sourceRevision: product.sourceProductRevisionId,
      });
      const allowedAssessmentReferences = new Set(proposedFacts
        .filter((fact) => fact.field === "assessment_reference" && typeof fact.structuredValue === "string")
        .map((fact) => fact.structuredValue as string));
      if ((assessmentReferences as string[]).some((reference) => !allowedAssessmentReferences.has(reference))) {
        return ownerJson({ ok: false, error: { code: "INVALID_ASSESSMENT_REFERENCE",
          message: "Assessment confirmation is stale or invalid." } }, 409);
      }
      const proposedPainFacts = proposedFacts.filter((fact) => fact.field === "pain_region");
      const normalizedPainFacts = proposedPainFacts.map(normalizeProposedOwnerPainRegionFact);
      if (normalizedPainFacts.some((fact) => fact === null)) {
        return ownerJson({ ok: false, error: { code: "UNSUPPORTED_PAIN_FACT",
          message: "Pain information needs review before this profile can be saved." } }, 409);
      }
      const requiredPainFactIds = [...new Set(proposedPainFacts.map((fact) => fact.factId))].sort();
      const confirmedPainFactIds = [...new Set(painFactIds as string[])].sort();
      if (JSON.stringify(confirmedPainFactIds) !== JSON.stringify(requiredPainFactIds)) {
        return ownerJson({ ok: false, error: { code: "PAIN_FACT_CONFIRMATION_REQUIRED",
          message: "Review and confirm each current pain region before saving." } }, 409);
      }
      const current = await enrollmentProfiles.readCurrentProfile(authorization.userId);
      const sourceRevision = `owner-equipment:${createHash("sha256").update(JSON.stringify({ environment,
        capabilityIds: [...new Set(capabilityIds as string[])].sort() })).digest("hex")}`;
      const profile = buildOwnerProfileRevision({ profileId: current?.profileId, userId: authorization.userId,
        basedOnRevisionId: current?.revisionId ?? null, primaryGoal: "strength", trainingMode: "develop",
        secondaryGoal: null, daysPerWeek: days, sessionOpportunities: normalizedOpportunities,
        sessionMinutes: sessionMinutes?.status === "known" ? { status: "known", minutes: sessionMinutes.minutes as number } :
          { status: "explicit_unknown", minutes: null },
        equipmentCapabilitySnapshot: { environment: environment as "home" | "commercial_gym" | "mixed",
          capabilityIds: capabilityIds as string[], confirmed: true, sourceRevision },
        coarseExperience: experience as "beginner" | "intermediate" | "advanced",
        familiarity: current?.familiarity ?? [],
        painContext: { regionIds: normalizedPainFacts.flatMap((fact) => fact ? [fact.regionId] : []),
          limitationIds: current?.painContext.limitationIds ?? [], confirmed: true, diagnosticClaimCount: 0,
          sourceFactIds: confirmedPainFactIds, sourceRevision: product.sourceProductRevisionId },
        assessmentReferences: assessmentReferences as string[], trainingSafety: body.safetyConfirmed === true
          ? "clear" : "review_required", continuityReferences: current?.continuityReferences ?? [],
        evaluationTime: authorization.evaluatedAt,
        provenance: { source: "owner_confirmation",
          sourceRefs: ["owner-account-profile", ...confirmedPainFactIds] },
        reviewState: "confirmed", createdAt: authorization.evaluatedAt });
      const written = await enrollmentProfiles.appendProfile(profile);
      return written === "conflict" ? ownerJson({ ok: false,
        error: { code: "PROFILE_CONFLICT", message: "Profile changed. Reload and try again." } }, 409) :
        ownerJson({ ok: true, profileId: profile.profileId, revisionId: profile.revisionId });
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
