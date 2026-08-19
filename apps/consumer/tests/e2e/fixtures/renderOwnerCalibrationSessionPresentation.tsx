import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const styles = new Proxy({} as Record<string, string>, {
  get: (_target, property) => String(property),
});

const options = ["kg", "lb"];

function SetResult({ setNumber }: { readonly setNumber: number }) {
  return <div className={styles.calibrationSet}>
    <h4>Set {setNumber}</h4>
    <div className={styles.grid}>
      <label className={styles.field}><span>Actual repetitions</span>
        <input type="number" min="0" step="1" defaultValue="8" /></label>
      <label className={styles.field}><span>Load unit</span><select defaultValue="kg">
        {options.map((unit) => <option value={unit} key={unit}>{unit}</option>)}</select></label>
      <label className={styles.field}><span>Actual load</span>
        <input type="number" min="0" step="0.5" defaultValue="20" /></label>
      <label className={styles.field}><span>Effort scale</span><select defaultValue="RIR">
        <option value="RIR">RIR</option><option value="RPE">RPE</option></select></label>
      <label className={styles.field}><span>RIR value (0-10)</span>
        <input type="number" min="0" max="10" step="0.5" defaultValue="3" /></label>
      <label className={styles.field}><span>Technique / control</span><select defaultValue="controlled">
        <option value="controlled">Controlled</option><option value="limited">Limited</option>
        <option value="stopped">Stopped</option></select></label>
      <label className={styles.field}><span>Pain / discomfort</span><select defaultValue="none">
        <option value="none">None</option><option value="discomfort">Discomfort</option>
        <option value="pain">Pain</option><option value="session_stopped">Session stopped</option></select></label>
      <label className={styles.field}><span>Set completion</span><select defaultValue="completed">
        <option value="completed">Completed</option><option value="partially_completed">Partial</option>
        <option value="stopped">Stopped</option></select></label>
    </div>
    <label className={styles.check}><input type="checkbox" />
      <span>No external load applied (bodyweight or unloaded)</span></label>
  </div>;
}

function OwnerCalibrationSessionPresentationFixture() {
  return <main className={styles.shell} data-testid="owner-calibration-session-presentation">
    <header className={styles.header}><div><p className={styles.kicker}>Owner V2 session</p>
      <h1 className={styles.title}>Full</h1></div><span className={styles.status}>Final for execution</span></header>
    <section className={styles.section}><p className={styles.muted}>Suggested: Full</p>
      <div className={styles.actions} role="group" aria-label="Practice mode">
        <button className={styles.button} type="button">Full</button>
        <button className={`${styles.button} ${styles.buttonSecondary}`} type="button" disabled>Lighter</button>
        <button className={`${styles.button} ${styles.buttonSecondary}`} type="button" disabled>Recovery</button>
      </div></section>
    <section className={styles.section}><h2>Session results</h2>
      <p className={styles.notice}>Record actuals after each performed set. These observations support later review;
        they do not prescribe a future load or apply progression.</p>
      <div className={styles.sessions}><article className={styles.session}>
        <h3>Goblet squat</h3><p>2 sets · 5-10 reps</p>
        <p className={styles.muted}>Controlled squat pattern.</p><ul><li>Keep a comfortable range.</li></ul>
        <fieldset><legend className={styles.legend}>Developmental work actuals</legend>
          <SetResult setNumber={1} /><SetResult setNumber={2} />
        </fieldset>
        <label className={styles.check}><input type="checkbox" defaultChecked />
          <span>Exercise performed</span></label>
      </article></div>
    </section>
    <section className={styles.section}><h2>Session response</h2><div className={styles.grid}>
      <label className={styles.field}><span>Overall difficulty (1-10)</span>
        <input type="number" min="1" max="10" defaultValue="6" /></label>
      <label className={styles.field}><span>Energy before training</span><select defaultValue="moderate">
        <option value="low">Low</option><option value="moderate">Moderate</option>
        <option value="high">High</option></select></label>
      <label className={styles.field}><span>Immediate pain response</span><select defaultValue="none">
        <option value="none">None</option><option value="discomfort">Discomfort</option>
        <option value="pain">Pain</option></select></label>
      <label className={`${styles.field} ${styles.fieldWide}`}><span>Session notes (context only)</span>
        <textarea maxLength={2000} defaultValue="" /></label>
    </div><div className={styles.actions}><button className={`${styles.button} ${styles.buttonSecondary}`}
      type="button">Save progress</button></div></section>
    <button className={styles.button} type="button">Complete session</button>
    <p className={styles.muted} aria-live="polite"></p>
  </main>;
}

process.stdout.write(renderToStaticMarkup(createElement(OwnerCalibrationSessionPresentationFixture)));
