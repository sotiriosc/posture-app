import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { REFERENCE_EXERCISES, resolveOwnerProgramClassification } from "@praxis/training-engine-v2";
import { buildControlledOwnerSessionOptions, buildOwnerSessionPracticeSource,
  withControlledOwnerRepositories } from "@praxis/engine/controlled-owner-delivery";
import { loadActiveOwnerEnvelope, ownerCsrfTokens, requireOwnerPage } from "@/server/controlledOwnerDelivery";
import OwnerV2SessionClient from "./OwnerV2SessionClient";
import styles from "../../owner-v2.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function targetText(target: unknown, unit: string): string {
  if (!target || typeof target !== "object") return `${unit} require calibration`;
  const value = target as Record<string, unknown>;
  if (value.kind === "exact" && typeof value.value === "number") return `${value.value} ${unit}`;
  if (value.kind === "range" && typeof value.min === "number" && typeof value.max === "number") {
    return `${value.min}-${value.max} ${unit}`;
  }
  if (value.kind === "not_prescribed") return `No ${unit} prescribed`;
  return `${unit} require calibration`;
}

function doseText(dose: unknown): string {
  if (!dose || typeof dose !== "object") return "Dose unavailable";
  const value = dose as Record<string, unknown>;
  if (value.mode === "repetition_sets") {
    return `${targetText(value.sets, "sets")} · ${targetText(value.repetitions, "reps")}`;
  }
  if (value.mode === "timed_hold") {
    return `${targetText(value.sets, "sets")} · ${targetText(value.duration, "seconds")}`;
  }
  if (value.mode === "breath_cycles") {
    return `${targetText(value.rounds, "rounds")} · ${targetText(value.breathCycles, "breath cycles")}`;
  }
  if (value.mode === "distance_carry") {
    return `${targetText(value.trips, "trips")} · ${targetText(value.distancePerTrip, "metres per trip")}`;
  }
  if (value.mode === "timed_carry") {
    return `${targetText(value.trips, "trips")} · ${targetText(value.durationPerTrip, "seconds per trip")}`;
  }
  if (value.mode === "step_sets") {
    return `${targetText(value.sets, "sets")} · ${targetText(value.steps, "steps")}`;
  }
  if (value.mode === "step_march") {
    return `${targetText(value.sets, "sets")} · ${value.steps ? targetText(value.steps, "steps") :
      targetText(value.duration, "seconds")}`;
  }
  return "Dose requires calibration";
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
    const calibrationCycle = await delivery.readCalibrationCycleForEnvelope(gate.userId!,
      active.envelope.envelopeRevisionId);
    return { ...active, revision, calibrationCycle };
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
      const definition = REFERENCE_EXERCISES.find((entry) => entry.id === step.exerciseId)!;
      const prescription = source.prescriptions.find((entry) => entry.prescriptionId === step.prescriptionId)!;
      const retainedBlocks = state.revision.plan.assignments.find((entry) => entry.assignmentId === step.assignmentId)
        ?.retainedBlockIds ?? [];
      const blocks = prescription.doseBlocks.filter((block) => retainedBlocks.includes(block.blockId));
      const obligation = state.calibrationCycle?.obligations.find((entry) =>
        entry.sessionId === state.revision.request.sourceSessionIntentId && entry.assignmentId === step.assignmentId);
      return { assignmentId: step.assignmentId, exerciseId: step.exerciseId, name: definition.name,
        summary: definition.summary, coachingFocus: definition.coachingFocus,
        sourceEventId: step.sourceExposureEventId, blockIds: blocks.map((block) => block.blockId),
        dose: blocks.map((block) => doseText(block.dose)).join(" | "),
        calibrationObligation: obligation ? { obligationId: obligation.obligationId,
          doseBlockId: obligation.doseBlockId, requiredSetCount: obligation.requiredSetCount } : null };
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
        evaluatedAt: new Date().toISOString(), calibrationCycle: state.calibrationCycle })}
      calibration={resolveOwnerProgramClassification(state.envelope) === "initial_calibration" &&
        state.calibrationCycle ? { cycleId: state.calibrationCycle.cycleId,
          sessionId: state.revision.request.sourceSessionIntentId,
          state: state.calibrationCycle.state,
          recoveryPending: state.calibrationCycle.evidenceSufficiency.recoveryPendingSessionIds
            .includes(state.revision.request.sourceSessionIntentId) } : null}
      initialPerformance={draft.actualPerformanceState}
      csrf={csrf.session ?? ""} />
  </main>;
}
