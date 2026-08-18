import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const styles = new Proxy({} as Record<string, string>, {
  get: (_target, property) => String(property),
});

function OwnerProfilePresentationFixture() {
  return <main className={styles.shell} data-testid="owner-profile-presentation">
    <header className={styles.header}><div><p className={styles.kicker}>Controlled owner delivery</p>
      <h1 className={styles.title}>Praxis V2</h1></div><span className={styles.status}>Preview</span></header>
    <section className={styles.section}>
      <h2>Training profile</h2>
      <div className={styles.grid}>
        <div className={styles.field}><label htmlFor="owner-goal">Goal</label>
          <input id="owner-goal" value="Get stronger" disabled readOnly /></div>
        <div className={styles.field}><label htmlFor="owner-mode">Mode</label>
          <input id="owner-mode" value="Develop" disabled readOnly /></div>
        <div className={styles.field}><label htmlFor="owner-days">Days per week</label>
          <select id="owner-days" defaultValue="5"><option value="5">5</option></select></div>
        <div className={styles.field}><label htmlFor="owner-minutes">Minutes per session</label>
          <input id="owner-minutes" type="number" value="90" readOnly /></div>
      </div>
      <label className={styles.check}><input type="checkbox" /><span>Session duration is unknown</span></label>
    </section>
    <section className={styles.section}>
      <h2>Equipment</h2>
      <div className={styles.field}><label htmlFor="owner-environment">Environment</label>
        <select id="owner-environment" defaultValue="commercial_gym">
          <option value="commercial_gym">Commercial gym</option>
        </select></div>
      <fieldset><legend className={styles.legend}>Confirmed capabilities</legend>
        <div className={styles.choices}>
          <label className={styles.check}><input type="checkbox" defaultChecked /><span>commercial gym</span></label>
          <label className={styles.check}><input type="checkbox" defaultChecked /><span>dumbbells</span></label>
          <label className={styles.check}><input type="checkbox" defaultChecked /><span>adjustable bench</span></label>
          <label className={styles.check}><input type="checkbox" /><span>pull up station</span></label>
        </div>
      </fieldset>
    </section>
    <section className={styles.section}>
      <h2>Readiness</h2>
      <div className={styles.field}><label htmlFor="owner-experience">Experience</label>
        <select id="owner-experience" defaultValue="advanced"><option value="advanced">Advanced</option></select></div>
      <label className={styles.check}><input type="checkbox" defaultChecked />
        <span>Pain and limitations reviewed</span></label>
      <label className={styles.check}><input type="checkbox" defaultChecked />
        <span>Availability and training Safety confirmed</span></label>
    </section>
    <section className={styles.section}>
      <h2>Current Product facts</h2>
      <ul className={styles.facts}><li className={styles.fact}>
        <span>primary goal</span><span className={styles.status}>proposed</span>
      </li></ul>
    </section>
    <label className={styles.check}><input type="checkbox" />
      <span>Enroll in controlled Praxis V2 owner delivery</span></label>
    <div className={styles.actions}>
      <button className={styles.button} type="button" disabled>Save profile</button>
      <button className={`${styles.button} ${styles.buttonSecondary}`} type="button">Generate preview</button>
    </div>
    <p aria-live="polite" className={styles.muted}>Profile revision saved.</p>
  </main>;
}

process.stdout.write(renderToStaticMarkup(createElement(OwnerProfilePresentationFixture)));
