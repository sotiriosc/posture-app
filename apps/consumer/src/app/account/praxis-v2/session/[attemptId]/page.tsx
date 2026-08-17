import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PRE_PACKAGE_R_REFERENCE_EXERCISES } from "@praxis/training-engine-v2";
import { buildControlledOwnerSessionOptions, buildOwnerSessionPracticeSource,
  withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { loadActiveOwnerEnvelope, ownerCsrfTokens, requireOwnerPage } from "@/server/controlledOwnerDelivery";
import OwnerV2SessionClient from "./OwnerV2SessionClient";
import styles from "../../owner-v2.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function doseText(dose: unknown): string {
  if (!dose || typeof dose !== "object") return "Dose unavailable";
  const value = dose as Record<string, unknown>;
  return `${String(value.mode ?? "dose").replaceAll("_", " ")} · ${JSON.stringify(dose)}`;
}

export default async function OwnerSessionPage({ params }: { readonly params: Promise<{ attemptId: string }> }) {
  const gate = await requireOwnerPage("apply");
  const { attemptId } = await params;
  const state = await withControlledOwnerRepositories(async ({ delivery, sessionPractice }) => {
    const active = await loadActiveOwnerEnvelope({ userId: gate.userId!, delivery });
    if (!active) return null;
    const revisions = await sessionPractice.readAttemptRevisions(gate.userId!, attemptId);
    const revision = revisions.at(-1);
    if (!revision || revision.request.sourceProgramId !== active.envelope.envelopeId || !revision.draft) return null;
    return { ...active, revision };
  }).catch(() => null);
  if (!state) notFound();
  const draft = state.revision.draft;
  if (!draft) notFound();
  const source = buildOwnerSessionPracticeSource({ envelope: state.envelope,
    sessionId: state.revision.request.sourceSessionIntentId });
  const retained = new Set(state.revision.plan.assignments.filter((entry) => entry.state !== "omitted")
    .map((entry) => entry.assignmentId));
  const exercises = state.revision.plan.finalSequence!.steps.filter((step) => retained.has(step.assignmentId))
    .map((step) => {
      const definition = PRE_PACKAGE_R_REFERENCE_EXERCISES.find((entry) => entry.id === step.exerciseId)!;
      const prescription = source.prescriptions.find((entry) => entry.prescriptionId === step.prescriptionId)!;
      const retainedBlocks = state.revision.plan.assignments.find((entry) => entry.assignmentId === step.assignmentId)
        ?.retainedBlockIds ?? [];
      const blocks = prescription.doseBlocks.filter((block) => retainedBlocks.includes(block.blockId));
      return { assignmentId: step.assignmentId, exerciseId: step.exerciseId, name: definition.name,
        summary: definition.summary, coachingFocus: definition.coachingFocus,
        sourceEventId: step.sourceExposureEventId, blockIds: blocks.map((block) => block.blockId),
        dose: blocks.map((block) => doseText(block.dose)).join(" | ") };
    });
  const requestHeaders = await headers();
  const csrf = ownerCsrfTokens({ userId: gate.userId!, cookieHeader: requestHeaders.get("cookie") ?? "",
    issuedAt: new Date().toISOString(), actionFamilies: ["session"] });
  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.kicker}>Owner V2 session</p>
      <h1 className={styles.title}>{state.revision.request.requestedMode[0]!.toUpperCase() +
        state.revision.request.requestedMode.slice(1)}</h1></div>
      <span className={styles.status}>{state.revision.lifecycle.state.replaceAll("_", " ")}</span></header>
    <OwnerV2SessionClient applicationId={state.application.applicationId} attemptId={attemptId}
      persistenceRevisionId={state.revision.persistenceRevisionId} selectedMode={state.revision.plan.mode}
      lifecycleState={state.revision.lifecycle.state} completedStatus={state.revision.completion?.status ?? null}
      exercises={exercises} options={buildControlledOwnerSessionOptions({ envelope: state.envelope,
        sessionId: state.revision.request.sourceSessionIntentId, userId: gate.userId!,
        evaluatedAt: new Date().toISOString() })} initialPerformance={draft.actualPerformanceState}
      csrf={csrf.session ?? ""} />
  </main>;
}
