import type { ReactNode } from "react";
import { resolveOwnerExerciseDoseBlocks, type ControlledOwnerV2ProgramPreview } from "@praxis/training-engine-v2";
import { presentBlockPurpose, presentDiagnosticIdentity, presentExerciseIdentity, presentOwnerWeekObjectives,
  presentPracticeMode, presentReadiness, presentSessionPurpose } from "./presentation";

export interface OwnerPreviewPresentationProps {
  readonly preview: ControlledOwnerV2ProgramPreview;
  readonly actions: ReactNode;
  readonly styles: Readonly<Record<string, string>>;
}

function DoseFacts(input: { readonly styles: Readonly<Record<string, string>>; readonly volume: string;
  readonly target: string; readonly rest: string; readonly effort: string; readonly tempo: string;
  readonly load: string; readonly calibrationRequired?: boolean }) {
  const facts = [
    ["Volume", input.volume], ["Target", input.target], ["Rest", input.rest], ["Effort", input.effort],
    ["Tempo", input.tempo], ["Load", input.load],
    ...(typeof input.calibrationRequired === "boolean" ?
      [["Calibration", input.calibrationRequired ? "Required" : "Not required"]] : []),
  ];
  return <dl className={input.styles.doseFacts}>{facts.map(([label, value]) =>
    <div className={input.styles.doseFact} key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

export default function OwnerPreviewPresentation({ preview, actions, styles }: OwnerPreviewPresentationProps) {
  const objectives = presentOwnerWeekObjectives(preview.productProjection.weekObjectiveIds);
  return <main className={`${styles.shell} ${styles.previewShell}`} data-testid="owner-preview-presentation">
    <header className={styles.previewHeader}>
      <div className={styles.headerCopy}>
        <p className={styles.kicker}>Counterfactual owner preview</p>
        <h1 className={styles.title}>Get stronger</h1>
        <p className={styles.mode}>Develop</p>
      </div>
      <div className={styles.statusPanel} role="status" aria-label="Preview readiness status">
        <span className={styles.statusLabel}>Preview status</span>
        <strong className={styles.status}>{presentReadiness(preview.readinessStatus)}</strong>
      </div>
    </header>

    <p className={styles.notice}>Your legacy Program is unchanged.</p>

    <section className={styles.previewSection} aria-labelledby="week-responsibilities-heading">
      <h2 id="week-responsibilities-heading">Week responsibilities</h2>
      <ul className={styles.responsibilityList} data-testid="owner-preview-responsibilities">{objectives.map((objective) =>
        <li className={styles.responsibility} key={objective.canonicalId}>
          <span className={objective.recognized ? undefined : styles.code}>{objective.label}</span>
          {!objective.recognized ? <span className={styles.unrecognizedResponsibility}>Canonical objective</span> : null}
        </li>)}</ul>
    </section>

    <section className={styles.previewSection} aria-labelledby="sessions-heading">
      <h2 id="sessions-heading">Sessions</h2>
      <div className={styles.sessionList}>{preview.productProjection.sessions.map((session, sessionIndex) =>
        <article className={styles.previewSession} data-testid="owner-preview-session" key={session.sessionId}>
          <header className={styles.sessionHeader}>
            <h3>Session {sessionIndex + 1}</h3>
            <p className={styles.sessionMeta}>{presentSessionPurpose(session.purpose)} · {
              session.durationStatus === "known" && typeof session.durationMinutes === "number" ?
                `${session.durationMinutes} minutes` : "Duration unknown"}</p>
          </header>

          <div className={styles.exerciseList}>{session.exerciseAssignments.map((exercise) => {
            const doseBlocks = resolveOwnerExerciseDoseBlocks(preview, exercise);
            return <article className={styles.previewExercise} data-testid="owner-preview-exercise"
              key={exercise.assignmentId}>
              <header className={styles.exerciseHeader}>
                <p className={styles.exerciseKicker}>Exercise</p>
                <h4 className={styles.exerciseTitle}>{presentExerciseIdentity(exercise.exerciseId)}</h4>
              </header>

              <div className={styles.doseBlocks}>{doseBlocks.map((block) =>
                <section className={styles.doseBlock} data-testid="owner-preview-dose-block"
                  data-block-purpose={block.purpose} key={block.blockId}>
                  <h5 className={styles.doseBlockTitle}>{presentBlockPurpose(block.purpose)}</h5>
                  <DoseFacts styles={styles} volume={block.volume} target={block.target} rest={block.rest}
                    effort={block.effort} tempo={block.tempo} load={block.load}
                    calibrationRequired={block.calibrationRequired} />
                </section>)}
                {!doseBlocks.length ? <section className={styles.doseBlock}>
                  <h5 className={styles.doseBlockTitle}>Stored assignment summary</h5>
                  <DoseFacts styles={styles} volume={`${exercise.sets ?? "Unknown"} sets`} target={exercise.reps}
                    rest={typeof exercise.restSeconds === "number" ? `${exercise.restSeconds} seconds` : "Unknown"}
                    effort={exercise.effort ?? "Unknown"} tempo={exercise.tempo ?? "Unknown"}
                    load="Calibration state unavailable" />
                </section> : null}
              </div>

              {exercise.reasonCodes.length ? <details className={styles.trace}
                data-testid="owner-preview-prescription-trace">
                <summary>Why this prescription?</summary>
                <ul className={styles.traceList}>{exercise.reasonCodes.map((reason) =>
                  <li className={styles.code} key={reason}>{reason}</li>)}</ul>
              </details> : null}
            </article>;
          })}</div>

          <aside className={styles.sessionOptions} data-testid="owner-preview-session-options"
            aria-label={`Session ${sessionIndex + 1} options`}>
            <span className={styles.sessionOptionsLabel}>Session options</span>
            <ul className={styles.optionList}>{session.practiceModes.map((mode) =>
              <li key={mode}>{presentPracticeMode(mode)}</li>)}</ul>
          </aside>
        </article>)}</div>
    </section>

    {preview.unresolvedFacts.length ? <section className={styles.previewSection}>
      <h2>Unresolved facts</h2>
      <ul className={styles.unresolvedList}>{preview.unresolvedFacts.map((fact) =>
        <li key={fact}>{presentDiagnosticIdentity(fact)}</li>)}</ul>
    </section> : null}

    <details className={styles.technical} data-testid="owner-preview-technical-details">
      <summary>Technical details</summary>
      <div className={styles.technicalContent}>
        <dl className={styles.technicalFacts}>
          <div className={styles.technicalFact}><dt>Engine version</dt>
            <dd className={styles.code}>{preview.engineVersion}</dd></div>
          <div className={styles.technicalFact}><dt>Policy versions</dt><dd><ul>{preview.policyVersions.map((version) =>
            <li className={styles.code} key={version}>{version}</li>)}</ul></dd></div>
          <div className={styles.technicalFact}><dt>Preview fingerprint</dt>
            <dd className={styles.code}>{preview.previewFingerprint}</dd></div>
          <div className={styles.technicalFact}><dt>Canonical Week objective IDs</dt><dd><ul>{
            preview.productProjection.weekObjectiveIds.map((id) =>
              <li className={styles.code} key={id}>{id}</li>)}</ul></dd></div>
        </dl>
      </div>
    </details>

    {actions}
  </main>;
}
