import { withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { ownerJson, readOwnerGate } from "@/server/controlledOwnerDelivery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, { params }: { readonly params: Promise<{ applicationId: string }> }) {
  const gate = await readOwnerGate("apply");
  if (!gate.allowed || !gate.userId) return ownerJson({ ok: false,
    error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
  const { applicationId } = await params;
  try {
    const state = await withControlledOwnerRepositories(async ({ delivery }) => {
      const [application, pointer] = await Promise.all([delivery.readApplicationExact(gate.userId!, applicationId),
        delivery.readActivePointer(gate.userId!)]);
      if (!application || pointer?.activeApplicationId !== application.applicationId || pointer.mode !== "v2_owner") return null;
      const envelope = await delivery.readEnvelopeExact(gate.userId!, application.envelopeId,
        application.envelopeRevisionId);
      return envelope ? { application, envelope } : null;
    });
    return state ? ownerJson({ ok: true, ...state }) : ownerJson({ ok: false,
      error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
