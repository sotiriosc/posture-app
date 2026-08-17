import {
  withControlledOwnerRepositories,
} from "@praxis/engine/controlled-owner-delivery";
import { authorizeOwnerRead, ownerCsrfTokens, ownerJson } from "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const now = new Date().toISOString();
  const authorization = await authorizeOwnerRead({ operation: "read", action: "status-read", limit: 180 });
  if (!authorization.allowed) return authorization.response;
  const gate = authorization.gate;
  try {
    const state = await withControlledOwnerRepositories(async ({ enrollmentProfiles, delivery }) => {
      const [enrollment, profile, pointer] = await Promise.all([
        enrollmentProfiles.readCurrentEnrollment(gate.userId!),
        enrollmentProfiles.readCurrentProfile(gate.userId!),
        delivery.readActivePointer(gate.userId!),
      ]);
      return { enrollmentState: enrollment?.state ?? null, profileState: profile?.reviewState ?? null,
        effectiveProgramMode: gate.mode === "off" ? "legacy" : pointer?.mode ?? "legacy" };
    });
    const csrf = ownerCsrfTokens({ userId: authorization.userId,
      cookieHeader: request.headers.get("cookie") ?? "",
      issuedAt: now, actionFamilies: ["enrollment", "profile", "preview", "approval", "application",
        "session", "rollback"] });
    return ownerJson({ ok: true, mode: gate.mode, ...state, csrf });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
