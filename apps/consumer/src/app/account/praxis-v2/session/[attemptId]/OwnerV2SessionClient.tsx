"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../owner-v2.module.css";

interface CalibrationObligationSummary {
  readonly obligationId: string;
  readonly doseBlockId: string;
  readonly requiredSetCount: number;
}

interface SessionExercise {
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly name: string;
  readonly summary: string;
  readonly coachingFocus: readonly string[];
  readonly sourceEventId: string;
  readonly blockIds: readonly string[];
  readonly dose: string;
  readonly calibrationObligation: CalibrationObligationSummary | null;
}

interface Option { readonly mode: string; readonly availability: { readonly state: string;
  readonly reasonCodes: readonly string[] } }

interface SetDraft {
  readonly setNumber: number;
  readonly repetitions: number | "";
  readonly loadKind: "recorded" | "not_applicable";
  readonly loadValue: number | "";
  readonly loadUnit: "kg" | "lb";
  readonly effortScale: "RPE" | "RIR";
  readonly effortValue: number | "";
  readonly completionState: "completed" | "partially_completed" | "stopped";
  readonly painResponse: "none" | "discomfort" | "pain" | "session_stopped";
  readonly techniqueResponse: "controlled" | "limited" | "stopped";
}

interface CalibrationDraft {
  readonly setsByObligationId: Readonly<Record<string, readonly SetDraft[]>>;
  readonly difficulty: number | "";
  readonly energy: "low" | "moderate" | "high";
  readonly immediatePainResponse: "none" | "discomfort" | "pain" | "session_stopped";
  readonly notes: string;
}

function initialCalibrationDraft(exercises: readonly SessionExercise[], initial: Readonly<Record<string, unknown>>):
CalibrationDraft {
  const saved = initial.calibrationDraft as CalibrationDraft | undefined;
  if (saved?.setsByObligationId) return saved;
  return {
    setsByObligationId: Object.fromEntries(exercises.flatMap((exercise) => exercise.calibrationObligation ? [[
      exercise.calibrationObligation.obligationId,
      Array.from({ length: exercise.calibrationObligation.requiredSetCount }, (_, index): SetDraft => ({
        setNumber: index + 1, repetitions: "", loadKind: "recorded", loadValue: "", loadUnit: "kg",
        effortScale: "RIR", effortValue: "", completionState: "completed", painResponse: "none",
        techniqueResponse: "controlled",
      })),
    ]] : [])),
    difficulty: "", energy: "moderate", immediatePainResponse: "none", notes: "",
  };
}

function initialCompletions(exercises: readonly SessionExercise[], initial: Readonly<Record<string, unknown>>) {
  const saved = initial.completionBySourceEventId;
  if (saved && typeof saved === "object" && !Array.isArray(saved)) return { ...saved } as Record<string, boolean>;
  return Object.fromEntries(exercises.map((exercise) => [exercise.sourceEventId,
    Boolean((initial[exercise.sourceEventId] as { readonly completed?: boolean } | undefined)?.completed)]));
}

export default function OwnerV2SessionClient(input: { readonly applicationId: string; readonly attemptId: string;
  readonly persistenceRevisionId: string; readonly selectedMode: string; readonly lifecycleState: string;
  readonly completedStatus: string | null; readonly exercises: readonly SessionExercise[];
  readonly options: readonly Option[]; readonly initialPerformance: Readonly<Record<string, unknown>>;
  readonly calibration: { readonly cycleId: string; readonly sessionId: string; readonly state: string;
    readonly recoveryPending: boolean } | null;
  readonly csrf: string }) {
  const router = useRouter();
  const [revisionId, setRevisionId] = useState(input.persistenceRevisionId);
  const [mode, setMode] = useState(input.selectedMode);
  const [performance, setPerformance] = useState<Record<string, unknown>>({ ...input.initialPerformance });
  const [completions, setCompletions] = useState<Record<string, boolean>>(() =>
    initialCompletions(input.exercises, input.initialPerformance));
  const [calibrationDraft, setCalibrationDraft] = useState<CalibrationDraft>(() =>
    initialCalibrationDraft(input.exercises, input.initialPerformance));
  const [started, setStarted] = useState(input.lifecycleState === "execution_started");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState(input.completedStatus ?? "");
  const [recoveryReadiness, setRecoveryReadiness] = useState("explicit_adequate");
  const [sleepReport, setSleepReport] = useState("unknown");
  const completed = input.completedStatus !== null;
  const calibrationExercises = useMemo(() => input.exercises.filter((exercise) =>
    exercise.calibrationObligation), [input.exercises]);

  const post = async (url: string, body: unknown, idempotency = false) => {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json",
      "x-praxis-owner-csrf": input.csrf, ...(idempotency ? { "Idempotency-Key": crypto.randomUUID() } : {}) },
    body: JSON.stringify(body) });
    const payload = await response.json() as { persistenceRevisionId?: string; error?: { message?: string } };
    const revisionRequired = !url.includes("/session/recovery");
    if (!response.ok || revisionRequired && !payload.persistenceRevisionId) {
      throw new Error(payload.error?.message ?? "Session update failed.");
    }
    if (payload.persistenceRevisionId) setRevisionId(payload.persistenceRevisionId);
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

  const toggleOrdinaryExercise = async (exercise: SessionExercise, index: number, checked: boolean) => {
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

  const updateSet = (obligationId: string, setIndex: number, patch: Partial<SetDraft>) => {
    setCalibrationDraft((current) => ({ ...current, setsByObligationId: {
      ...current.setsByObligationId,
      [obligationId]: current.setsByObligationId[obligationId]!.map((set, index) =>
        index === setIndex ? { ...set, ...patch } : set),
    } }));
  };

  const canonicalObservation = () => {
    if (!input.calibration || calibrationDraft.difficulty === "") return null;
    const assignments = calibrationExercises.map((exercise) => {
      const obligation = exercise.calibrationObligation!;
      const sets = calibrationDraft.setsByObligationId[obligation.obligationId] ?? [];
      if (sets.length !== obligation.requiredSetCount || sets.some((set) => set.repetitions === "" ||
          set.effortValue === "" || set.loadKind === "recorded" && set.loadValue === "")) return null;
      return { obligationId: obligation.obligationId, assignmentId: exercise.assignmentId,
        exerciseId: exercise.exerciseId, doseBlockId: obligation.doseBlockId,
        sets: sets.map((set) => ({ setNumber: set.setNumber, repetitions: set.repetitions as number,
          load: set.loadKind === "recorded" ? { kind: "recorded" as const,
            value: set.loadValue as number, unit: set.loadUnit } :
            { kind: "not_applicable" as const, reason: "bodyweight_or_unloaded" as const },
          effort: { scale: set.effortScale, value: set.effortValue as number },
          completionState: set.completionState, painResponse: set.painResponse,
          techniqueResponse: set.techniqueResponse })) };
    });
    const completeAssignments = assignments.filter((assignment): assignment is NonNullable<typeof assignment> =>
      assignment !== null);
    if (completeAssignments.length !== assignments.length) return null;
    return { schemaVersion: "1.0.0" as const, cycleId: input.calibration.cycleId,
      sessionId: input.calibration.sessionId, assignments: completeAssignments,
      session: { difficulty: calibrationDraft.difficulty, energy: calibrationDraft.energy,
        immediatePainResponse: calibrationDraft.immediatePainResponse, notes: calibrationDraft.notes },
      reportingAuthority: "athlete_explicit_report" as const };
  };

  const saveCalibration = async (requireComplete: boolean) => {
    const observation = canonicalObservation();
    if (requireComplete && (!observation || input.exercises.some((exercise) => !completions[exercise.sourceEventId]))) {
      throw new Error("Record every required set, response, and exercise completion before finishing.");
    }
    const actualPerformanceState = { calibrationDraft, completionBySourceEventId: completions,
      ...(observation ? { calibrationObservation: observation } : {}) };
    const saved = await post("/api/training/v2-owner/session/record", { action: "draft",
      attemptId: input.attemptId, basedOnPersistenceRevisionId: revisionId,
      currentPosition: { exerciseIndex: 0, blockIndex: 0, setIndex: 0 }, actualPerformanceState,
      timers: [], executionStarted: true });
    setStarted(true);
    return saved.persistenceRevisionId!;
  };

  const complete = async () => {
    setWorking(true); setMessage("");
    try {
      const completeRevision = input.calibration ? await saveCalibration(true) : revisionId;
      const performed = input.calibration ? input.exercises.filter((exercise) => completions[exercise.sourceEventId]) :
        input.exercises.filter((exercise) => performance[exercise.sourceEventId]);
      const observation = input.calibration ? canonicalObservation() : null;
      const partialAssignmentIds = new Set(observation?.assignments.filter((assignment) =>
        assignment.sets.some((set) => set.completionState !== "completed")).map((assignment) =>
        assignment.assignmentId) ?? []);
      await post("/api/training/v2-owner/session/complete", { applicationId: input.applicationId,
        attemptId: input.attemptId, basedOnPersistenceRevisionId: completeRevision,
        performedSourceEventIds: performed.map((exercise) => exercise.sourceEventId),
        completedBlockIds: performed.filter((exercise) => !partialAssignmentIds.has(exercise.assignmentId))
          .flatMap((exercise) => exercise.blockIds),
        partiallyCompletedBlockIds: performed.filter((exercise) => partialAssignmentIds.has(exercise.assignmentId))
          .flatMap((exercise) => exercise.blockIds) }, true);
      setMessage("Session completed. Add the separate recovery check-in when you are ready."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Session completion failed."); }
    finally { setWorking(false); }
  };

  const recordRecovery = async () => {
    if (!input.calibration) return;
    setWorking(true); setMessage("");
    try {
      await post("/api/training/v2-owner/session/recovery", { cycleId: input.calibration.cycleId,
        sessionId: input.calibration.sessionId, readiness: recoveryReadiness, sleepReport }, true);
      setMessage("Recovery check-in recorded. No Program change was applied."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Recovery check-in failed."); }
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
    <section className={styles.section}><h2>{input.calibration ? "Session results" : "Exercises"}</h2>
      {input.calibration ? <p className={styles.notice}>Record actuals after each performed set. These observations support
        later review; they do not prescribe a future load or apply progression.</p> : null}
      <div className={styles.sessions}>
      {input.exercises.map((exercise, index) => <article className={styles.session} key={exercise.assignmentId}>
        <h3>{exercise.name}</h3><p>{exercise.dose}</p><p className={styles.muted}>{exercise.summary}</p>
        <ul>{exercise.coachingFocus.slice(0, 3).map((cue) => <li key={cue}>{cue}</li>)}</ul>
        {input.calibration && exercise.calibrationObligation ? <fieldset>
          <legend className={styles.legend}>Developmental work actuals</legend>
          {(calibrationDraft.setsByObligationId[exercise.calibrationObligation.obligationId] ?? [])
            .map((set, setIndex) => <div className={styles.calibrationSet} key={set.setNumber}>
              <h4>Set {set.setNumber}</h4>
              <div className={styles.grid}>
                <label className={styles.field}><span>Actual repetitions</span><input type="number" min="0" step="1"
                  disabled={completed || working} value={set.repetitions}
                  onChange={(event) => updateSet(exercise.calibrationObligation!.obligationId, setIndex,
                    { repetitions: event.target.value === "" ? "" : Number(event.target.value) })} /></label>
                <label className={styles.field}><span>Load unit</span><select disabled={completed || working ||
                    set.loadKind === "not_applicable"} value={set.loadUnit}
                  onChange={(event) => updateSet(exercise.calibrationObligation!.obligationId, setIndex,
                    { loadUnit: event.target.value as "kg" | "lb" })}><option value="kg">kg</option>
                  <option value="lb">lb</option></select></label>
                <label className={styles.field}><span>Actual load</span><input type="number" min="0" step="0.5"
                  disabled={completed || working || set.loadKind === "not_applicable"} value={set.loadValue}
                  onChange={(event) => updateSet(exercise.calibrationObligation!.obligationId, setIndex,
                    { loadValue: event.target.value === "" ? "" : Number(event.target.value) })} /></label>
                <label className={styles.field}><span>Effort scale</span><select disabled={completed || working}
                  value={set.effortScale} onChange={(event) => updateSet(
                    exercise.calibrationObligation!.obligationId, setIndex,
                    { effortScale: event.target.value as "RPE" | "RIR" })}>
                  <option value="RIR">RIR</option><option value="RPE">RPE</option></select></label>
                <label className={styles.field}><span>{set.effortScale} value (0-10)</span>
                  <input type="number" min="0" max="10" step="0.5" disabled={completed || working}
                    value={set.effortValue} onChange={(event) => updateSet(
                      exercise.calibrationObligation!.obligationId, setIndex,
                      { effortValue: event.target.value === "" ? "" : Number(event.target.value) })} /></label>
                <label className={styles.field}><span>Technique / control</span><select disabled={completed || working}
                  value={set.techniqueResponse} onChange={(event) => updateSet(
                    exercise.calibrationObligation!.obligationId, setIndex,
                    { techniqueResponse: event.target.value as SetDraft["techniqueResponse"] })}>
                  <option value="controlled">Controlled</option><option value="limited">Limited</option>
                  <option value="stopped">Stopped</option></select></label>
                <label className={styles.field}><span>Pain / discomfort</span><select disabled={completed || working}
                  value={set.painResponse} onChange={(event) => updateSet(
                    exercise.calibrationObligation!.obligationId, setIndex,
                    { painResponse: event.target.value as SetDraft["painResponse"] })}>
                  <option value="none">None</option><option value="discomfort">Discomfort</option>
                  <option value="pain">Pain</option><option value="session_stopped">Session stopped</option></select></label>
                <label className={styles.field}><span>Set completion</span><select disabled={completed || working}
                  value={set.completionState} onChange={(event) => updateSet(
                    exercise.calibrationObligation!.obligationId, setIndex,
                    { completionState: event.target.value as SetDraft["completionState"] })}>
                  <option value="completed">Completed</option><option value="partially_completed">Partial</option>
                  <option value="stopped">Stopped</option></select></label>
              </div>
              <label className={styles.check}><input type="checkbox" disabled={completed || working}
                checked={set.loadKind === "not_applicable"} onChange={(event) => updateSet(
                  exercise.calibrationObligation!.obligationId, setIndex,
                  { loadKind: event.target.checked ? "not_applicable" : "recorded" })} />
                <span>No external load applied (bodyweight or unloaded)</span></label>
            </div>)}
        </fieldset> : null}
        <label className={styles.check}><input type="checkbox" disabled={completed || working}
          checked={input.calibration ? Boolean(completions[exercise.sourceEventId]) :
            Boolean(performance[exercise.sourceEventId])}
          onChange={(event) => input.calibration ? setCompletions((current) => ({ ...current,
            [exercise.sourceEventId]: event.target.checked })) :
            void toggleOrdinaryExercise(exercise, index, event.target.checked)} />
          <span>Exercise performed</span></label>
      </article>)}
    </div></section>
    {input.calibration && !completed ? <section className={styles.section}><h2>Session response</h2>
      <div className={styles.grid}>
        <label className={styles.field}><span>Overall difficulty (1-10)</span><input type="number" min="1" max="10"
          disabled={working} value={calibrationDraft.difficulty}
          onChange={(event) => setCalibrationDraft((current) => ({ ...current,
            difficulty: event.target.value === "" ? "" : Number(event.target.value) }))} /></label>
        <label className={styles.field}><span>Energy before training</span><select value={calibrationDraft.energy}
          disabled={working} onChange={(event) => setCalibrationDraft((current) => ({ ...current,
            energy: event.target.value as CalibrationDraft["energy"] }))}><option value="low">Low</option>
          <option value="moderate">Moderate</option><option value="high">High</option></select></label>
        <label className={styles.field}><span>Immediate pain response</span>
          <select disabled={working} value={calibrationDraft.immediatePainResponse}
            onChange={(event) => setCalibrationDraft((current) =>
            ({ ...current, immediatePainResponse: event.target.value as CalibrationDraft["immediatePainResponse"] }))}>
            <option value="none">None</option><option value="discomfort">Discomfort</option>
            <option value="pain">Pain</option><option value="session_stopped">Session stopped</option></select></label>
        <label className={`${styles.field} ${styles.fieldWide}`}><span>Session notes (context only)</span>
          <textarea maxLength={2000} disabled={working} value={calibrationDraft.notes}
            onChange={(event) => setCalibrationDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
      </div>
      <div className={styles.actions}><button className={`${styles.button} ${styles.buttonSecondary}`} type="button"
        disabled={working} onClick={() => { setWorking(true); setMessage(""); void saveCalibration(false)
          .then(() => setMessage("Calibration progress saved."))
          .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Save failed."))
          .finally(() => setWorking(false)); }}>Save progress</button></div>
    </section> : null}
    {input.calibration && completed && input.calibration.recoveryPending ? <section className={styles.section}>
      <h2>Recovery check-in</h2><p className={styles.muted}>This is separate from the immediate session result.
        No waiting period or recovery result is assumed.</p><div className={styles.grid}>
        <label className={styles.field}><span>Current recovery</span><select disabled={working} value={recoveryReadiness}
          onChange={(event) => setRecoveryReadiness(event.target.value)}><option value="explicit_adequate">Ready</option>
          <option value="localized_concern">Localized concern</option><option value="systemic_concern">Systemic concern</option>
          <option value="explicit_not_ready">Not ready</option></select></label>
        <label className={styles.field}><span>Sleep</span><select disabled={working} value={sleepReport}
          onChange={(event) => setSleepReport(event.target.value)}><option value="unknown">Not reported</option>
          <option value="restorative">Restorative</option><option value="disrupted">Disrupted</option>
          <option value="insufficient">Insufficient</option></select></label></div>
      <button className={styles.button} type="button" disabled={working} onClick={() => void recordRecovery()}>
        Record recovery</button>
    </section> : null}
    {!completed ? <button className={styles.button} type="button" disabled={!started && !input.calibration || working}
      onClick={() => void complete()}>Complete session</button> : null}
    <p className={styles.muted} aria-live="polite">{message}</p>
  </>;
}
