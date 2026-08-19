"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../owner-v2.module.css";

type Option = { readonly mode: string; readonly availability: { readonly state: string;
  readonly reasonCodes: readonly string[] }; readonly assignmentCount: number };

export default function OwnerSessionStart(input: { readonly applicationId: string; readonly sessionId: string;
  readonly options: readonly Option[]; readonly csrf: string }) {
  const router = useRouter();
  const [mode, setMode] = useState("full");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const selected = input.options.find((option) => option.mode === mode)!;
  const available = selected.availability.state === "available" ||
    selected.availability.state === "available_with_pending_week_responsibility";
  const start = async () => {
    setWorking(true); setMessage("");
    try {
      const response = await fetch("/api/training/v2-owner/session/start", { method: "POST",
        headers: { "Content-Type": "application/json", "x-praxis-owner-csrf": input.csrf },
        body: JSON.stringify({ applicationId: input.applicationId, sessionId: input.sessionId, mode }) });
      const payload = await response.json() as { attemptId?: string; error?: { message?: string } };
      if (!response.ok || !payload.attemptId) throw new Error(payload.error?.message ?? "Session could not start.");
      router.push(`/account/praxis-v2/session/${encodeURIComponent(payload.attemptId)}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Session could not start."); }
    finally { setWorking(false); }
  };
  return <div>
    <p className={styles.muted}>Suggested: Full</p>
    <div className={styles.actions} role="group" aria-label="Practice mode">
      {input.options.map((option) => {
        const enabled = option.availability.state === "available" ||
          option.availability.state === "available_with_pending_week_responsibility";
        return <button key={option.mode} type="button"
          className={`${styles.button} ${mode === option.mode ? "" : styles.buttonSecondary}`}
          disabled={!enabled || working} title={enabled ? `Includes ${option.assignmentCount} exercises` :
            option.availability.reasonCodes.join(", ")} onClick={() => setMode(option.mode)}>
          {option.mode[0]!.toUpperCase() + option.mode.slice(1)}
        </button>;
      })}
    </div>
    <button className={styles.button} type="button" disabled={!available || working} onClick={() => void start()}>
      Start {mode[0]!.toUpperCase() + mode.slice(1)}
    </button>
    <p className={styles.muted} aria-live="polite">{message || (!available ? selected.availability.reasonCodes.join(", ") : "")}</p>
  </div>;
}
