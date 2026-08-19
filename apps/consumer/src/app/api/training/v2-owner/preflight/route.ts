import {
  preflightControlledOwnerGetStrongerProfile,
  proposeOwnerImportsFromTrainingSnapshot,
  type OwnerEnrollmentProfileRepository,
  withControlledOwnerRepositories,
} from "@praxis/engine/controlled-owner-delivery";
import {
  OWNER_PROFILE_PREFLIGHT_MAX_QUESTIONS,
  applyOwnerProfilePreflightAnswers,
  type OwnerProfilePreflightAnswerSubmission,
} from "@praxis/training-engine-v2";
import {
  authorizeOwnerMutation,
  authorizeOwnerRead,
  loadOwnerProductRuntimeContext,
  OWNER_ENGINE_VERSION,
  OWNER_POLICY_VERSIONS,
  ownerJson,
  rejectsIdentityFields,
} from "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isPreflightAnswerSubmission(value: unknown): value is OwnerProfilePreflightAnswerSubmission {
  if (!value || typeof value !== "object") return false;
  const answer = value as Record<string, unknown>;
  return typeof answer.questionId === "string" && typeof answer.questionRevisionId === "string" &&
    typeof answer.answer === "string" &&
    (answer.value === undefined || typeof answer.value === "number") &&
    (answer.unit === undefined || answer.unit === "kg" || answer.unit === "lb");
}

async function loadPreflight(userId: string, evaluationTime: string,
  enrollmentProfiles: OwnerEnrollmentProfileRepository) {
  const [enrollment, profile, product] = await Promise.all([
    enrollmentProfiles.readCurrentEnrollment(userId),
    enrollmentProfiles.readCurrentProfile(userId),
    loadOwnerProductRuntimeContext(userId),
  ]);
  if (!enrollment || !profile) return null;
  const proposedProductFacts = proposeOwnerImportsFromTrainingSnapshot({ snapshot: product.snapshot,
    sourceRevision: product.sourceProductRevisionId });
  return { enrollment, profile, preflight: preflightControlledOwnerGetStrongerProfile({ profile,
    enrollmentRevisionId: enrollment.revisionId, source: {
      sourceProductSnapshotId: product.sourceProductSnapshotId,
      sourceProductRevisionId: product.sourceProductRevisionId,
      activeLegacyProgramRevisionId: product.activeLegacyProgramRevisionId,
      assessmentReport: product.snapshot.assessment ?? null,
    }, proposedProductFacts, evaluationTime, engineVersion: OWNER_ENGINE_VERSION,
    policyVersions: OWNER_POLICY_VERSIONS }).preflight };
}

export async function GET() {
  const authorization = await authorizeOwnerRead({ operation: "preview", action: "profile-preflight-read" });
  if (!authorization.allowed) return authorization.response;
  try {
    return await withControlledOwnerRepositories(async ({ enrollmentProfiles }) => {
      const current = await loadPreflight(authorization.userId, authorization.evaluatedAt, enrollmentProfiles);
      return current ? ownerJson({ ok: true, preflight: current.preflight }) : ownerJson({ ok: false,
        error: { code: "OWNER_PROFILE_REQUIRED", message: "Confirm the owner profile first." } }, 409);
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}

export async function POST(request: Request) {
  const authorization = await authorizeOwnerMutation({ request, operation: "preview",
    actionFamily: "profile", action: "profile" });
  if (!authorization.allowed) return authorization.response;
  const body = await request.json().catch(() => null) as { readonly answers?: unknown } | null;
  const answers = body?.answers;
  if (!body || rejectsIdentityFields(body) || !Array.isArray(answers) || answers.length === 0 ||
      answers.length > OWNER_PROFILE_PREFLIGHT_MAX_QUESTIONS ||
      !answers.every(isPreflightAnswerSubmission)) {
    return ownerJson({ ok: false, error: { code: "INVALID_PREFLIGHT_ANSWERS",
      message: "The review answers are invalid." } }, 400);
  }
  try {
    return await withControlledOwnerRepositories(async ({ enrollmentProfiles }) => {
      const current = await loadPreflight(authorization.userId, authorization.evaluatedAt, enrollmentProfiles);
      if (!current) return ownerJson({ ok: false, error: { code: "OWNER_PROFILE_REQUIRED",
        message: "Confirm the owner profile first." } }, 409);
      const applied = applyOwnerProfilePreflightAnswers({ profile: current.profile,
        preflight: current.preflight, answers,
        answeredAt: authorization.evaluatedAt });
      if (!applied.profile) return ownerJson({ ok: false, error: { code: "PREFLIGHT_ANSWERS_REJECTED",
        message: "The review changed. Reload and answer the current questions." },
      reasonCodes: applied.reasonCodes }, 409);
      const written = await enrollmentProfiles.appendProfile(applied.profile);
      return written === "conflict" ? ownerJson({ ok: false,
        error: { code: "PROFILE_CONFLICT", message: "Profile changed. Reload and try again." } }, 409) :
        ownerJson({ ok: true, profileId: applied.profile.profileId,
          revisionId: applied.profile.revisionId });
    });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
