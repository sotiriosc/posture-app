import Link from "next/link";
import { notFound } from "next/navigation";
import { withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { requireOwnerPage } from "@/server/controlledOwnerDelivery";
import styles from "../../owner-v2.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OwnerWeekPage({ params }: { readonly params: Promise<{ applicationId: string }> }) {
  const gate = await requireOwnerPage("apply");
  const { applicationId } = await params;
  const state = await withControlledOwnerRepositories(async ({ delivery }) => {
    const [application, pointer] = await Promise.all([
      delivery.readApplicationExact(gate.userId!, applicationId), delivery.readActivePointer(gate.userId!),
    ]);
    if (!application || pointer?.mode !== "v2_owner" || pointer.activeApplicationId !== application.applicationId) return null;
    const envelope = await delivery.readEnvelopeExact(gate.userId!, application.envelopeId,
      application.envelopeRevisionId);
    return envelope ? { application, envelope } : null;
  }).catch(() => null);
  if (!state) notFound();
  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.kicker}>Active owner Program</p>
      <h1 className={styles.title}>Get stronger</h1><p className={styles.muted}>Develop</p></div>
      <span className={styles.status}>V2 owner</span></header>
    <p className={styles.notice}>Legacy Program retained as fallback.</p>
    <section className={styles.section}><h2>This week</h2><div className={styles.sessions}>
      {state.envelope.productProjection.sessions.map((session, index) => <article className={styles.session} key={session.sessionId}>
        <h3>Session {index + 1}</h3><p>{session.purpose.replaceAll("_", " ")}</p>
        <p className={styles.muted}>{session.durationStatus === "known" ? `${session.durationMinutes} minutes` : "Duration unknown"}</p>
        <Link className={styles.link} href={`/account/praxis-v2/session/${encodeURIComponent(session.sessionId)}`}>
          Open session
        </Link>
      </article>)}
    </div></section>
    <details className={styles.technical}><summary>Program lineage</summary>
      <p className={styles.code}>{state.envelope.envelopeRevisionId}</p>
      <p className={styles.code}>{state.application.applicationId}</p>
    </details>
  </main>;
}
