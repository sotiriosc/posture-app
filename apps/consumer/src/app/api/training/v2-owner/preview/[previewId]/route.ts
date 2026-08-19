import { withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { ownerJson, readOwnerGate } from "@/server/controlledOwnerDelivery";
import { normalizeOwnerDynamicRecordId } from "@/server/ownerDynamicRecordId";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, { params }: { readonly params: Promise<{ previewId: string }> }) {
  const gate = await readOwnerGate("preview");
  if (!gate.allowed || !gate.userId) return ownerJson({ ok: false,
    error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
  const previewId = normalizeOwnerDynamicRecordId((await params).previewId, "owner-v2-preview");
  if (!previewId) return ownerJson({ ok: false,
    error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
  try {
    const preview = await withControlledOwnerRepositories(({ delivery }) =>
      delivery.readPreviewExact(gate.userId!, previewId));
    return preview ? ownerJson({ ok: true, preview }) : ownerJson({ ok: false,
      error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
  } catch {
    return ownerJson({ ok: false, error: { code: "OWNER_DELIVERY_UNAVAILABLE",
      message: "Owner delivery is unavailable." } }, 503);
  }
}
