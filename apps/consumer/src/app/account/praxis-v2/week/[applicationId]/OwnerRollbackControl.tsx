"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../owner-v2.module.css";

export default function OwnerRollbackControl(input: { readonly applicationId: string;
  readonly pointerRevision: number; readonly csrf: string }) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const rollback = async () => {
    if (!window.confirm("Return to the retained legacy Program? Your V2 records and session evidence will remain stored.")) {
      return;
    }
    setWorking(true); setMessage("");
    try {
      const response = await fetch("/api/training/v2-owner/rollback", { method: "POST",
        headers: { "Content-Type": "application/json", "x-praxis-owner-csrf": input.csrf,
          "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ applicationId: input.applicationId,
          expectedPointerRevision: input.pointerRevision, explicitConfirmation: true }) });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Rollback could not complete.");
      router.replace("/account/praxis-v2"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Rollback could not complete."); }
    finally { setWorking(false); }
  };
  return <div>
    <button className={`${styles.button} ${styles.buttonSecondary}`} type="button" disabled={working}
      onClick={() => void rollback()}>Return to legacy Program</button>
    <p className={styles.muted} aria-live="polite">{message}</p>
  </div>;
}
