import { withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { ownerJson, readOwnerGate } from "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const gate = await readOwnerGate("apply");
  if (!gate.allowed || !gate.userId) return ownerJson({ ok: false,
    error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
  try {
    const history = await withControlledOwnerRepositories(async ({ delivery, sessionPractice }) => {
      const [applications, sessions, auditEvents] = await Promise.all([delivery.listApplications(gate.userId!),
        sessionPractice.listAthleteCurrentRevisions(gate.userId!), delivery.listAuditEvents(gate.userId!)]);
      return { applications, sessions, auditEvents };
    });
    return ownerJson({ ok: true, ...history });
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
