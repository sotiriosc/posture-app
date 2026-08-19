import type { ReactNode } from "react";
import { resolveOwnerExerciseDoseBlocks, type ControlledOwnerV2ProgramPreview } from "@praxis/training-engine-v2";
import { presentBlockPurpose, presentExerciseIdentity, presentOwnerWeekObjectives,
  presentPracticeMode, presentPreparationCategory, presentReadiness, presentSessionPurpose,
  presentUnresolvedFact } from "./presentation";

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

function durationPresentation(
  session: ControlledOwnerV2ProgramPreview["productProjection"]["sessions"][number],
): { readonly capacity: string; readonly planning: string } {
  const available = typeof session.availableMinutes === "number" ? `${session.availableMinutes} minutes available` :
    "Available time unknown";
  const calculated = session.calculatedDuration;
  if (!calculated) {
    return { capacity: available, planning: session.durationStatus === "known" &&
      typeof session.durationMinutes === "number" ? `Planned duration: ${session.durationMinutes} minutes` :
      "Planned duration unavailable" };
  }
  if (calculated.knownUpperBoundSeconds === null) {
    const component = calculated.unknownComponents[0] ?? "";
    const unresolved = component.includes("setup") ? "setup timing" :
      component.includes("transition") ? "transition timing" :
        component.includes("repetition") ? "repetition execution timing" :
          component.includes("breath") ? "breathing cadence" :
            component.includes("pace") || component.includes("step") ? "movement pace" :
              component.includes("rest") ? "rest timing" : "an operational timing fact";
    return { capacity: available, planning: `Planned duration unavailable: ${unresolved} is unresolved` };
  }
  const lowerMinutes = Math.max(1, Math.round(calculated.knownLowerBoundSeconds / 60));
  const upperMinutes = Math.max(lowerMinutes, Math.round(calculated.knownUpperBoundSeconds / 60));
  const range = lowerMinutes === upperMinutes ? `${lowerMinutes} minutes` :
    `${lowerMinutes}-${upperMinutes} minutes`;
  return { capacity: available, planning: `Planned duration: approximately ${range}` };
}

function sectionGroup(section: string | undefined): "prepare" | "main" | "supporting" | "cooldown" {
  if (section === "warmup" || section === "activation") return "prepare";
  if (section === "accessory") return "supporting";
  if (section === "cooldown") return "cooldown";
  return "main";
}

const SECTION_LABELS = Object.freeze({ prepare: "Prepare", main: "Main work",
  supporting: "Supporting work", cooldown: "Cooldown" });

export default function OwnerPreviewPresentation({ preview, actions, styles }: OwnerPreviewPresentationProps) {
  const objectives = presentOwnerWeekObjectives(
    preview.productProjection.weekObjectiveIds,
    preview.completeProgramSnapshot,
  );
  return <main className={`${styles.shell} ${styles.previewShell}`} data-testid="owner-preview-presentation">
    <header className={styles.previewHeader}>
      <div className={styles.headerCopy}>
        <p className={styles.kicker}>Counterfactual owner preview</p>
        <h1 className={styles.title}>Get stronger</h1>
        <p className={styles.mode}>Develop</p>
      </div>
      <div className={styles.statusPanel} role="status" aria-label="Preview readiness status">
        <span className={styles.statusLabel}>Preview status</span>
        <strong className={styles.status}>{presentReadiness(preview.readinessStatus, preview.unresolvedFacts)}</strong>
      </div>
    </header>

    <p className={styles.notice}>Your legacy Program is unchanged.</p>

    {preview.programClassification === "initial_calibration" ?
      <section className={styles.previewSection} aria-labelledby="initial-calibration-heading"
        data-testid="owner-preview-calibration">
        <p className={styles.kicker}>Initial calibration program</p>
        <h2 id="initial-calibration-heading">A conservative evidence-building week</h2>
        <p>This workload reflects missing reliable performance history. It is intended to record actual sets,
          repetitions, load, effort, technique, pain response, and recovery for a later reviewed Program.</p>
        <p>It is not confirmed long-term Advanced volume, and no progression or replacement is automatic.</p>
        <dl className={styles.doseFacts}>
          <div className={styles.doseFact}><dt>Sessions</dt><dd>{preview.productProjection.sessions.length}</dd></div>
          <div className={styles.doseFact}><dt>Evidence obligations</dt>
            <dd>{preview.calibrationPlan?.obligations.length ?? 0} developmental assignments</dd></div>
          <div className={styles.doseFact}><dt>Planned duration</dt><dd>{preview.productProjection.sessions
            .map((session, index) => `Session ${index + 1}: ${durationPresentation(session).planning
              .replace("Planned duration: ", "")}`).join("; ")}</dd></div>
        </dl>
      </section> : null}

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
      <div className={styles.sessionList}>{preview.productProjection.sessions.map((session, sessionIndex) => {
        const duration = durationPresentation(session);
        return <article className={styles.previewSession} data-testid="owner-preview-session" key={session.sessionId}>
          <header className={styles.sessionHeader}>
            <h3>Session {sessionIndex + 1}</h3>
            <p className={styles.sessionMeta}>{presentSessionPurpose(session.purpose)}</p>
            <div className={styles.sessionTiming}>
              <p>{duration.capacity}</p>
              <p>{duration.planning}</p>
            </div>
          </header>

          <div className={styles.exerciseList}>{session.exerciseAssignments.map((exercise, exerciseIndex) => {
            const doseBlocks = resolveOwnerExerciseDoseBlocks(preview, exercise);
            const group = sectionGroup(exercise.section);
            const previousGroup = exerciseIndex === 0 ? null :
              sectionGroup(session.exerciseAssignments[exerciseIndex - 1]?.section);
            const categories = exercise.preparationCategories ?? [];
            return <div className={styles.sessionSectionGroup} key={exercise.assignmentId}>
              {group !== previousGroup ? <h4 className={styles.sessionSectionHeading}>{SECTION_LABELS[group]}</h4> : null}
              <article className={styles.previewExercise} data-testid="owner-preview-exercise"
              key={exercise.assignmentId}>
              <header className={styles.exerciseHeader}>
                <p className={styles.exerciseKicker}>{categories.length ?
                  categories.map(presentPreparationCategory).join(" · ") : "Exercise"}</p>
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
              {exercise.dependencyReasons?.length ? <details className={styles.trace}>
                <summary>Why this preparation?</summary>
                <ul className={styles.traceList}>{exercise.dependencyReasons.map((reason) =>
                  <li key={reason}>{reason}</li>)}</ul>
              </details> : null}
            </article></div>;
          })}</div>

          <aside className={styles.sessionOptions} data-testid="owner-preview-session-options"
            aria-label={`Session ${sessionIndex + 1} options`}>
            <span className={styles.sessionOptionsLabel}>Session options</span>
            <ul className={styles.optionList}>{session.practiceModes.map((mode) =>
              <li key={mode}>{presentPracticeMode(mode)}</li>)}</ul>
          </aside>
        </article>;
      })}</div>
    </section>

    {preview.unresolvedFacts.length ? <section className={styles.previewSection}>
      <h2>Unresolved facts</h2>
      <ul className={styles.unresolvedList}>{preview.unresolvedFacts.map((fact) =>
        <li key={fact}>{presentUnresolvedFact(fact)}</li>)}</ul>
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
          <div className={styles.technicalFact}><dt>Program classification</dt>
            <dd className={styles.code}>{preview.programClassification ?? "ordinary_program"}</dd></div>
          {preview.calibrationPlan ? <div className={styles.technicalFact}><dt>Calibration plan fingerprint</dt>
            <dd className={styles.code}>{preview.calibrationPlan.planFingerprint}</dd></div> : null}
          <div className={styles.technicalFact}><dt>Canonical Week objective IDs</dt><dd><ul>{
            preview.productProjection.weekObjectiveIds.map((id) =>
              <li className={styles.code} key={id}>{id}</li>)}</ul></dd></div>
          {preview.productProjection.sessions.map((session, index) => session.calculatedDuration ?
            <div className={styles.technicalFact} key={`duration-${session.sessionId}`}>
              <dt>Session {index + 1} duration interval</dt><dd>
                <p className={styles.code}>{session.calculatedDuration.knownLowerBoundSeconds}-{
                  session.calculatedDuration.knownUpperBoundSeconds ?? "unknown"} seconds · {
                  session.calculatedDuration.status}</p>
                {session.durationResolution ? <p className={styles.code}>{session.durationResolution.status} · {
                  session.durationResolution.rebuildCount} rebuilds / {
                  session.durationResolution.structuralIterationBound} removable assignments</p> : null}
                {session.calculatedDuration.policyRefs?.length ? <ul>{session.calculatedDuration.policyRefs.map((ref) =>
                  <li className={styles.code} key={ref}>{ref}</li>)}</ul> : null}
                {session.calculatedDuration.includedComponents?.length ? <ul>{
                  session.calculatedDuration.includedComponents.map((component) =>
                    <li className={styles.code} key={component.componentId}>{component.kind}: {
                      component.lowerBoundSeconds}-{component.upperBoundSeconds} seconds ({
                      component.classification})</li>)}</ul> : null}
              </dd>
            </div> : null)}
          {preview.unresolvedFacts.length ? <div className={styles.technicalFact}><dt>Diagnostic identifiers</dt>
            <dd><ul>{preview.unresolvedFacts.map((fact) =>
              <li className={styles.code} key={fact}>{fact}</li>)}</ul></dd></div> : null}
        </dl>
      </div>
    </details>

    {actions}
  </main>;
}
