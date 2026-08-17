import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildControlledOwnerSessionOptions, withControlledOwnerRepositories } from
  "@praxis/engine/controlled-owner-delivery";
import { ownerCsrfTokens, requireOwnerPage } from "@/server/controlledOwnerDelivery";
import OwnerSessionStart from "./OwnerSessionStart";
import OwnerRollbackControl from "./OwnerRollbackControl";
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
    return envelope ? { application, envelope, pointer } : null;
  }).catch(() => null);
  if (!state) notFound();
  const requestHeaders = await headers();
  const csrf = ownerCsrfTokens({ userId: gate.userId!, cookieHeader: requestHeaders.get("cookie") ?? "",
    issuedAt: new Date().toISOString(), actionFamilies: ["session", "rollback"] });
  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.kicker}>Active owner Program</p>
      <h1 className={styles.title}>Get stronger</h1><p className={styles.muted}>Develop</p></div>
      <div><span className={styles.status}>V2 owner</span><br />
        <Link className={styles.link} href="/account/praxis-v2/history">History</Link></div></header>
    <p className={styles.notice}>Legacy Program retained as fallback.</p>
    <section className={styles.section}><h2>This week</h2><div className={styles.sessions}>
      {state.envelope.productProjection.sessions.map((session, index) => <article className={styles.session} key={session.sessionId}>
        <h3>Session {index + 1}</h3><p>{session.purpose.replaceAll("_", " ")}</p>
        <p className={styles.muted}>{session.durationStatus === "known" ? `${session.durationMinutes} minutes` : "Duration unknown"}</p>
        <OwnerSessionStart applicationId={state.application.applicationId} sessionId={session.sessionId}
          csrf={csrf.session ?? ""} options={buildControlledOwnerSessionOptions({ envelope: state.envelope,
            sessionId: session.sessionId, userId: gate.userId!, evaluatedAt: new Date().toISOString() })} />
      </article>)}
    </div></section>
    <section className={styles.section}><h2>Program control</h2>
      <OwnerRollbackControl applicationId={state.application.applicationId}
        pointerRevision={state.pointer.revision} csrf={csrf.rollback ?? ""} />
    </section>
    <details className={styles.technical}><summary>Program lineage</summary>
      <p className={styles.code}>{state.envelope.envelopeRevisionId}</p>
      <p className={styles.code}>{state.application.applicationId}</p>
    </details>
  </main>;
}
