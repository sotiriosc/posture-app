"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../owner-v2.module.css";

export default function OwnerPreviewActions(input: { readonly previewId: string; readonly previewFingerprint: string;
  readonly programClassification: "ordinary_program" | "initial_calibration";
  readonly csrf: Readonly<Record<string, string>>; readonly applyAvailable: boolean }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const approveAndApply = async () => {
    setWorking(true); setMessage("");
    try {
      const approve = await fetch("/api/training/v2-owner/approve", { method: "POST",
        headers: { "Content-Type": "application/json", "x-praxis-owner-csrf": input.csrf.approval ?? "",
          "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ previewId: input.previewId, previewFingerprint: input.previewFingerprint,
          explicitConfirmation: confirmed, approvalClassification: input.programClassification }) });
      const approval = await approve.json() as { approvalId?: string; error?: { message?: string } };
      if (!approve.ok || !approval.approvalId) throw new Error(approval.error?.message ?? "Approval failed.");
      const apply = await fetch("/api/training/v2-owner/apply", { method: "POST",
        headers: { "Content-Type": "application/json", "x-praxis-owner-csrf": input.csrf.application ?? "",
          "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ approvalId: approval.approvalId }) });
      const application = await apply.json() as { applicationId?: string; error?: { message?: string } };
      if (!apply.ok || !application.applicationId) throw new Error(application.error?.message ?? "Application failed.");
      router.push(`/account/praxis-v2/week/${encodeURIComponent(application.applicationId)}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Application failed."); }
    finally { setWorking(false); }
  };
  if (!input.applyAvailable) return <p className={styles.warning}>Application is unavailable in preview mode.</p>;
  return <div className={styles.section}>
    <label className={styles.check}><input type="checkbox" checked={confirmed}
      onChange={(event) => setConfirmed(event.target.checked)} /><span>Approve this exact {
        input.programClassification === "initial_calibration" ? "calibration" : "preview"}</span></label>
    <button className={styles.button} type="button" disabled={!confirmed || working}
      onClick={() => void approveAndApply()}>Approve and apply</button>
    <p aria-live="polite" className={styles.muted}>{message}</p>
  </div>;
}
