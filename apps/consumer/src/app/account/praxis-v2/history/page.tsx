import Link from "next/link";
import { withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { requireOwnerPage } from "@/server/controlledOwnerDelivery";
import styles from "../owner-v2.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OwnerHistoryPage() {
  const gate = await requireOwnerPage("apply");
  const history = await withControlledOwnerRepositories(async ({ delivery, sessionPractice }) => {
    const [applications, sessions, audits] = await Promise.all([delivery.listApplications(gate.userId!),
      sessionPractice.listAthleteCurrentRevisions(gate.userId!), delivery.listAuditEvents(gate.userId!)]);
    return { applications, sessions, audits };
  }).catch(() => ({ applications: [], sessions: [], audits: [] }));
  const rollbackEvents = history.audits.filter((event) => event.action === "rollback");
  const longitudinalEvents = history.audits.filter((event) => event.action === "longitudinal_observation");
  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.kicker}>Owner V2 only</p>
      <h1 className={styles.title}>History</h1></div><Link className={styles.link} href="/progress">Legacy history</Link></header>
    <section className={styles.section}><h2>Applications</h2>
      {history.applications.length ? <ul>{history.applications.map((application) =>
        <li key={application.applicationId}>{application.appliedAt} · {application.applicationId}</li>)}</ul> :
        <p className={styles.muted}>No owner V2 applications.</p>}
    </section>
    <section className={styles.section}><h2>Sessions</h2><div className={styles.sessions}>
      {history.sessions.map((session) => <article className={styles.session} key={session.attemptId}>
        <h3>{session.plan.mode[0]!.toUpperCase() + session.plan.mode.slice(1)}</h3>
        <p>{session.completion?.status.replaceAll("_", " ") ?? session.lifecycle.state.replaceAll("_", " ")}</p>
        <p className={styles.muted}>{session.outcomeLink ? "Outcome lineage recorded" : "Outcome pending"}</p>
        <Link className={styles.link} href={`/account/praxis-v2/session/${encodeURIComponent(session.attemptId)}`}>Open</Link>
      </article>)}
      {!history.sessions.length ? <p className={styles.muted}>No owner V2 sessions.</p> : null}
    </div></section>
    <section className={styles.section}><h2>Longitudinal observations</h2>
      {longitudinalEvents.length ? <ul>{longitudinalEvents.map((event) =>
        <li key={event.eventId}>Evidence recorded · observation only · {event.occurredAt}</li>)}</ul> :
        <p className={styles.muted}>No owner V2 longitudinal observations.</p>}
    </section>
    <section className={styles.section}><h2>Rollbacks</h2>
      {rollbackEvents.length ? <ul>{rollbackEvents.map((event) =>
        <li key={event.eventId}>Legacy Program restored · V2 evidence retained · {event.occurredAt}</li>)}</ul> :
        <p className={styles.muted}>No owner V2 rollbacks.</p>}
    </section>
    <section className={styles.section}><h2>Delivery events</h2>
      <ul>{history.audits.map((event) => <li key={event.eventId}>{event.action.replaceAll("_", " ")} · {event.occurredAt}</li>)}</ul>
    </section>
  </main>;
}
