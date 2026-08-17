"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../owner-v2.module.css";

interface SessionExercise {
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly name: string;
  readonly summary: string;
  readonly coachingFocus: readonly string[];
  readonly sourceEventId: string;
  readonly blockIds: readonly string[];
  readonly dose: string;
}

interface Option { readonly mode: string; readonly availability: { readonly state: string;
  readonly reasonCodes: readonly string[] } }

export default function OwnerV2SessionClient(input: { readonly applicationId: string; readonly attemptId: string;
  readonly persistenceRevisionId: string; readonly selectedMode: string; readonly lifecycleState: string;
  readonly completedStatus: string | null; readonly exercises: readonly SessionExercise[];
  readonly options: readonly Option[]; readonly initialPerformance: Readonly<Record<string, unknown>>;
  readonly csrf: string }) {
  const router = useRouter();
  const [revisionId, setRevisionId] = useState(input.persistenceRevisionId);
  const [mode, setMode] = useState(input.selectedMode);
  const [performance, setPerformance] = useState<Record<string, unknown>>({ ...input.initialPerformance });
  const [started, setStarted] = useState(input.lifecycleState === "execution_started");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState(input.completedStatus ?? "");
  const completed = input.completedStatus !== null;

  const post = async (url: string, body: unknown, idempotency = false) => {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json",
      "x-praxis-owner-csrf": input.csrf, ...(idempotency ? { "Idempotency-Key": crypto.randomUUID() } : {}) },
    body: JSON.stringify(body) });
    const payload = await response.json() as { persistenceRevisionId?: string; error?: { message?: string } };
    if (!response.ok || !payload.persistenceRevisionId) throw new Error(payload.error?.message ?? "Session update failed.");
    setRevisionId(payload.persistenceRevisionId);
    return payload;
  };

  const changeMode = async (nextMode: string) => {
    setWorking(true); setMessage("");
    try {
      await post("/api/training/v2-owner/session/record", { action: "mode", applicationId: input.applicationId,
        attemptId: input.attemptId, basedOnPersistenceRevisionId: revisionId, mode: nextMode });
      setMode(nextMode); setPerformance({}); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Mode cannot be changed."); }
    finally { setWorking(false); }
  };

  const toggleExercise = async (exercise: SessionExercise, index: number, checked: boolean) => {
    const next = { ...performance, [exercise.sourceEventId]: checked ? { completed: true,
      observedAt: new Date().toISOString() } : undefined };
    setPerformance(next); setWorking(true); setMessage("");
    try {
      await post("/api/training/v2-owner/session/record", { action: "draft", attemptId: input.attemptId,
        basedOnPersistenceRevisionId: revisionId, currentPosition: { exerciseIndex: index, blockIndex: 0,
          setIndex: checked ? 1 : 0 }, actualPerformanceState: next, timers: [], executionStarted: true });
      setStarted(true); setMessage("Session saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Session save failed."); }
    finally { setWorking(false); }
  };

  const complete = async () => {
    setWorking(true); setMessage("");
    try {
      const performed = input.exercises.filter((exercise) => performance[exercise.sourceEventId])
        .map((exercise) => exercise.sourceEventId);
      const blocks = input.exercises.filter((exercise) => performance[exercise.sourceEventId])
        .flatMap((exercise) => exercise.blockIds);
      await post("/api/training/v2-owner/session/complete", { applicationId: input.applicationId,
        attemptId: input.attemptId, basedOnPersistenceRevisionId: revisionId,
        performedSourceEventIds: performed, completedBlockIds: blocks, partiallyCompletedBlockIds: [] }, true);
      setMessage("Session completed."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Session completion failed."); }
    finally { setWorking(false); }
  };

  return <>
    <section className={styles.section}>
      <p className={styles.muted}>Suggested: Full</p>
      <div className={styles.actions} role="group" aria-label="Practice mode">
        {input.options.map((option) => {
          const available = option.availability.state === "available" ||
            option.availability.state === "available_with_pending_week_responsibility";
          return <button key={option.mode} type="button"
            className={`${styles.button} ${mode === option.mode ? "" : styles.buttonSecondary}`}
            disabled={!available || started || completed || working} title={available ? "" : option.availability.reasonCodes.join(", ")}
            onClick={() => void changeMode(option.mode)}>{option.mode[0]!.toUpperCase() + option.mode.slice(1)}</button>;
        })}
      </div>
    </section>
    <section className={styles.section}><h2>Exercises</h2><div className={styles.sessions}>
      {input.exercises.map((exercise, index) => <article className={styles.session} key={exercise.assignmentId}>
        <h3>{exercise.name}</h3><p>{exercise.dose}</p><p className={styles.muted}>{exercise.summary}</p>
        <ul>{exercise.coachingFocus.slice(0, 3).map((cue) => <li key={cue}>{cue}</li>)}</ul>
        <label className={styles.check}><input type="checkbox" disabled={completed || working}
          checked={Boolean(performance[exercise.sourceEventId])}
          onChange={(event) => void toggleExercise(exercise, index, event.target.checked)} />
          <span>Completed as recorded</span></label>
      </article>)}
    </div></section>
    <button className={styles.button} type="button" disabled={!started || completed || working}
      onClick={() => void complete()}>Complete session</button>
    <p className={styles.muted} aria-live="polite">{message}</p>
  </>;
}
