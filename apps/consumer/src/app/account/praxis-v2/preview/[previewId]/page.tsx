import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { ownerCsrfTokens, requireOwnerPage } from "@/server/controlledOwnerDelivery";
import OwnerPreviewActions from "./OwnerPreviewActions";
import styles from "../../owner-v2.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OwnerPreviewPage({ params }: { readonly params: Promise<{ previewId: string }> }) {
  const gate = await requireOwnerPage("preview");
  const { previewId } = await params;
  const preview = await withControlledOwnerRepositories(({ delivery }) =>
    delivery.readPreviewExact(gate.userId!, previewId)).catch(() => null);
  if (!preview) notFound();
  const requestHeaders = await headers();
  const csrf = ownerCsrfTokens({ userId: gate.userId!, cookieHeader: requestHeaders.get("cookie") ?? "",
    issuedAt: new Date().toISOString(), actionFamilies: ["approval", "application"] });
  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.kicker}>Counterfactual owner preview</p>
      <h1 className={styles.title}>Get stronger</h1><p className={styles.muted}>Develop</p></div>
      <span className={styles.status}>{preview.readinessStatus.replaceAll("_", " ")}</span></header>
    <p className={styles.notice}>Your legacy Program is unchanged.</p>
    <section className={styles.section}><h2>Week objectives</h2>
      <ul>{preview.productProjection.weekObjectiveIds.map((id) => <li className={styles.code} key={id}>{id}</li>)}</ul>
    </section>
    <section className={styles.section}><h2>Sessions</h2><div className={styles.sessions}>
      {preview.productProjection.sessions.map((session) => <article className={styles.session} key={session.sessionId}>
        <h3>{session.purpose.replaceAll("_", " ")}</h3>
        <p className={styles.muted}>{session.durationStatus === "known" ? `${session.durationMinutes} minutes` : "Duration unknown"}</p>
        {session.exerciseAssignments.map((exercise) => <div className={styles.exercise} key={exercise.assignmentId}>
          <div><strong>{exercise.exerciseId.replaceAll("-", " ")}</strong>
            <p className={styles.muted}>{exercise.reasonCodes.join(", ")}</p></div>
          <div>{exercise.sets ?? "?"} sets · {exercise.reps}<br />{exercise.restSeconds ?? "?"}s rest</div>
        </div>)}
        <p className={styles.muted}>Full · Lighter · Recovery</p>
      </article>)}
    </div></section>
    {preview.unresolvedFacts.length ? <section className={styles.section}><h2>Unresolved facts</h2>
      <ul>{preview.unresolvedFacts.map((fact) => <li key={fact}>{fact.replaceAll("_", " ")}</li>)}</ul></section> : null}
    <details className={styles.technical}><summary>Technical details</summary>
      <p className={styles.code}>{preview.engineVersion}</p>
      {preview.policyVersions.map((version) => <p className={styles.code} key={version}>{version}</p>)}
      <p className={styles.code}>{preview.previewFingerprint}</p>
    </details>
    <OwnerPreviewActions previewId={preview.previewId} previewFingerprint={preview.previewFingerprint}
      csrf={csrf} applyAvailable={gate.mode === "apply" && preview.readinessStatus === "ready_for_approval"} />
  </main>;
}
