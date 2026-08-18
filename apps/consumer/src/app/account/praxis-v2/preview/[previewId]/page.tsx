import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { ownerCsrfTokens, requireOwnerPage } from "@/server/controlledOwnerDelivery";
import { normalizeOwnerDynamicRecordId } from "@/server/ownerDynamicRecordId";
import OwnerPreviewActions from "./OwnerPreviewActions";
import OwnerPreviewPresentation from "./OwnerPreviewPresentation";
import styles from "../../owner-v2.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OwnerPreviewPage({ params }: { readonly params: Promise<{ previewId: string }> }) {
  const gate = await requireOwnerPage("preview");
  const previewId = normalizeOwnerDynamicRecordId((await params).previewId, "owner-v2-preview");
  if (!previewId) notFound();
  const preview = await withControlledOwnerRepositories(({ delivery }) =>
    delivery.readPreviewExact(gate.userId!, previewId)).catch(() => null);
  if (!preview) notFound();
  const requestHeaders = await headers();
  const csrf = ownerCsrfTokens({ userId: gate.userId!, cookieHeader: requestHeaders.get("cookie") ?? "",
    issuedAt: new Date().toISOString(), actionFamilies: ["approval", "application"] });
  return <OwnerPreviewPresentation preview={preview} styles={styles}
    actions={<OwnerPreviewActions previewId={preview.previewId} previewFingerprint={preview.previewFingerprint}
      csrf={csrf} applyAvailable={gate.mode === "apply" && preview.readinessStatus === "ready_for_approval"} />} />;
}
