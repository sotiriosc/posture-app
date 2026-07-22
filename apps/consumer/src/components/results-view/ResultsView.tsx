"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { init, listAllPrograms, listExerciseLogsBySession, listSessions } from "@/lib/logStore";
import { loadAppState } from "@/lib/appState";
import { resolveActiveProgramFromList } from "@/lib/trainingStateModel";
import { projectResults } from "@/lib/results/resultsProjection";
import {
  SectionVisibilityProvider,
  VisibilityGate,
  SectionEyeButton,
  HiddenSectionsBar,
} from "@/components/visibility/SectionVisibility";
import type { ExerciseLog, Program } from "@/lib/types";
import type { ResultsProjection } from "@/lib/results/resultsProjection";
import AnimatedDisclosure from "@/components/ui/AnimatedDisclosure";

// ---------------------------------------------------------------------------
// Sub-section components — quiet design language per bloom-plan §Phase 5
// ---------------------------------------------------------------------------

function HeadlineMetric({ projection }: { projection: ResultsProjection }) {
  const rungsCount = projection.laddersClimbed.length;
  const patternsCount = new Set(projection.laddersClimbed.map((c) => c.pattern)).size;
  const sessions = projection.consistency.sessionsCompleted;
  return (
    <div className="border-b border-slate-800 pb-8" data-testid="results-headline">
      {rungsCount > 0 ? (
        <>
          <p className="text-5xl font-light tabular-nums text-white">{rungsCount}</p>
          <p className="mt-1 text-base text-slate-400">
            ladder rung{rungsCount === 1 ? "" : "s"} climbed across{" "}
            <span className="text-slate-200">{patternsCount} pattern{patternsCount === 1 ? "" : "s"}</span>
          </p>
        </>
      ) : (
        <>
          <p className="text-5xl font-light tabular-nums text-white">{sessions}</p>
          <p className="mt-1 text-base text-slate-400">
            clean session{sessions === 1 ? "" : "s"} building your baseline
          </p>
        </>
      )}
    </div>
  );
}

function LaddersSection({ projection }: { projection: ResultsProjection }) {
  if (projection.currentRungByPattern.length === 0) return null;
  return (
    <section aria-labelledby="ladders-heading">
      <div className="flex items-center justify-between">
        <h2 id="ladders-heading" className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Ladders
        </h2>
        <SectionEyeButton sectionId="results.ladders" title="Ladders" />
      </div>
      <div className="mt-4 space-y-6">
        {projection.currentRungByPattern.map((rung) => {
          const climbs = projection.laddersClimbed.filter((c) => c.pattern === rung.pattern);
          const maxDifficulty = 5;
          return (
            <div key={rung.pattern} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold text-slate-100 capitalize">
                  {rung.pattern.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-slate-500">d{rung.difficulty} / d{maxDifficulty}</p>
              </div>
              {/* Ladder rungs visualisation d1–d5 */}
              <div className="flex gap-1.5" aria-label={`${rung.pattern} ladder`}>
                {Array.from({ length: maxDifficulty }, (_, i) => {
                  const d = i + 1;
                  const isCurrent = d === rung.difficulty;
                  const isClimbed = d < rung.difficulty;
                  return (
                    <div
                      key={d}
                      className={[
                        "h-1.5 flex-1 rounded-full",
                        isCurrent
                          ? "bg-slate-200"
                          : isClimbed
                            ? "bg-slate-500"
                            : "bg-slate-800",
                      ].join(" ")}
                      aria-current={isCurrent ? "step" : undefined}
                    />
                  );
                })}
              </div>
              <p className="text-sm text-slate-300">{rung.exerciseName}</p>
              <p className="text-xs text-slate-500">{rung.nextRungRequirements}</p>
              {climbs.length > 0 && (
                <AnimatedDisclosure
                  summary={
                    <span className="text-xs text-slate-600 hover:text-slate-400">
                      {climbs.length} advancement{climbs.length === 1 ? "" : "s"} logged
                    </span>
                  }
                  contentClassName="mt-1"
                >
                  <ul className="space-y-1 pl-3">
                    {climbs.map((c, idx) => (
                      <li key={idx} className="text-xs text-slate-600">
                        {c.fromExerciseName} → {c.toExerciseName} (session {c.atSessionCount})
                      </li>
                    ))}
                  </ul>
                </AnimatedDisclosure>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PostureSection({ projection }: { projection: ResultsProjection }) {
  if (projection.activeTags.length === 0) return null;
  return (
    <section aria-labelledby="posture-heading">
      <div className="flex items-center justify-between">
        <h2 id="posture-heading" className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Posture
        </h2>
        <SectionEyeButton sectionId="results.posture" title="Posture" />
      </div>
      <div className="mt-4 space-y-4">
        {projection.activeTags.map((tag) => (
          <div key={tag.tag} className="rounded-lg border border-slate-800 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-200 capitalize">
                {tag.tag.replace(/_/g, " ")}
              </p>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  tag.direction === "improving"
                    ? "bg-slate-700 text-slate-300"
                    : tag.direction === "worsening"
                      ? "bg-red-950/60 text-red-400"
                      : "bg-slate-800 text-slate-500",
                ].join(" ")}
              >
                {tag.direction}
              </span>
            </div>
            {tag.notEnoughSignal ? (
              <p className="mt-2 text-xs text-slate-500">
                Not enough signal — last assessment photo was below quality threshold.
              </p>
            ) : (
              <>
                {tag.currentValue !== null && tag.threshold !== null && (
                  <p className="mt-2 text-xs text-slate-500">
                    {tag.currentValue.toFixed(3)} / threshold {tag.threshold}
                  </p>
                )}
                {tag.sourceObservation && (
                  <p className="mt-1 text-xs text-slate-600 italic">{tag.sourceObservation}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function RetiredTagsSection({ projection }: { projection: ResultsProjection }) {
  if (projection.retiredTags.length === 0) return null;
  return (
    <section aria-labelledby="retired-tags-heading">
      <div className="flex items-center justify-between">
        <h2 id="retired-tags-heading" className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Retired focus
        </h2>
        <SectionEyeButton sectionId="results.retiredTags" title="Retired focus" />
      </div>
      <div className="mt-4 space-y-4">
        {projection.retiredTags.map((tag) => (
          <div key={tag.tag} className="rounded-lg border border-slate-800/50 p-4 opacity-60">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-400 capitalize line-through">
                {tag.tag.replace(/_/g, " ")}
              </p>
              <span className="text-xs text-slate-500">retired</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              You&#39;ve retired: {tag.tag.replace(/_/g, " ")} focus. Your program is adjusting.
            </p>
            {tag.baselineValue !== null && tag.finalValue !== null && (
              <p className="mt-1 text-xs text-slate-700">
                {tag.baselineValue.toFixed(3)} → {tag.finalValue.toFixed(3)}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SacrificeRetestSection({
  queue,
  onAccept,
  onDecline,
}: {
  queue: ResultsProjection["sacrificeRetestQueue"];
  onAccept: (exerciseId: string) => void;
  onDecline: (exerciseId: string) => void;
}) {
  const eligible = queue.filter((item) => item.eligibleForRetestNow);
  if (eligible.length === 0) return null;
  return (
    <section aria-labelledby="retest-heading">
      <div className="flex items-center justify-between">
        <h2 id="retest-heading" className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Ready to retest?
        </h2>
        <SectionEyeButton sectionId="results.sacrificeRetest" title="Ready to retest?" />
      </div>
      <div className="mt-4 space-y-3">
        {eligible.map((item) => (
          <div key={item.exerciseId} className="rounded-lg border border-slate-800 p-4">
            <p className="text-sm font-semibold text-slate-200">{item.exerciseName}</p>
            <p className="mt-1 text-xs text-slate-500">
              Sacrificed during {item.sacrificedAtPhase} phase
            </p>
            <div className="mt-3 flex gap-3">
              <button
                data-testid={`retest-accept-${item.exerciseId}`}
                onClick={() => onAccept(item.exerciseId)}
                className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-600"
              >
                Yes, add back
              </button>
              <button
                data-testid={`retest-decline-${item.exerciseId}`}
                onClick={() => onDecline(item.exerciseId)}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-slate-500"
              >
                Keep sacrificed
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PhaseHistorySection({ history }: { history: ResultsProjection["phaseHistory"] }) {
  if (history.length === 0) return null;
  return (
    <section aria-labelledby="phase-history-heading">
      <div className="flex items-center justify-between">
        <h2 id="phase-history-heading" className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Phase History
        </h2>
        <SectionEyeButton sectionId="results.phaseHistory" title="Phase History" />
      </div>
      <ol className="mt-4 space-y-2">
        {history.map((record, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span
              className={[
                "mt-0.5 h-2 w-2 flex-shrink-0 rounded-full",
                record.exitedAtSessionCount === null
                  ? "bg-slate-300"
                  : "bg-slate-600",
              ].join(" ")}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm text-slate-300 capitalize">
                {record.phase}
                {record.exitedAtSessionCount !== null
                  ? ` — sessions ${record.enteredAtSessionCount}–${record.exitedAtSessionCount}`
                  : " — current phase"}
              </p>
              {record.exitedAtSessionCount !== null && record.criteriaAtExit.length > 0 && (
                <p className="mt-0.5 text-xs text-slate-600">
                  {record.criteriaAtExit.length} criteria satisfied
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProvenanceFooter({ footer }: { footer: ResultsProjection["provenanceFooter"] }) {
  return (
    <footer className="border-t border-slate-800 pt-6 text-center">
      <p className="text-xs leading-5 text-slate-600">{footer.footerLine}</p>
      {footer.totalDecisionTraces > 0 && (
        <p className="mt-1 text-xs text-slate-700">
          {footer.totalDecisionTraces} decisions traced this week
          {footer.retestCount > 0 && ` · ${footer.retestCount} posture retest${footer.retestCount === 1 ? "" : "s"}`}
        </p>
      )}
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ResultsView() {
  const [program, setProgram] = useState<Program | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [retestDismissed, setRetestDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await init();
      const programs = await listAllPrograms();
      const active = resolveActiveProgramFromList(programs, await loadAppState()).program;
      if (cancelled) return;
      if (active) {
        setProgram(active);
        const sessionList = await listSessions();
        const allLogs: ExerciseLog[] = [];
        for (const session of sessionList) {
          const sessionLogs = await listExerciseLogsBySession(session.id);
          allLogs.push(...sessionLogs);
        }
        if (!cancelled) {
          setLogs(allLogs);
        }
      }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const projection = useMemo<ResultsProjection | null>(() => {
    if (!program) return null;
    return projectResults(program, logs);
  }, [program, logs]);

  const filteredQueue = useMemo(() => {
    if (!projection) return [];
    return projection.sacrificeRetestQueue.filter(
      (item) => !retestDismissed.has(item.exerciseId)
    );
  }, [projection, retestDismissed]);

  const handleRetestAccept = (exerciseId: string) => {
    // Remove the deferred flag by marking it dismissed in UI.
    // The actual engine state update is performed by the caller via existing
    // Phase 3.2 mechanisms (remove deferred, mark for next-cycle inclusion).
    setRetestDismissed((prev) => new Set([...prev, exerciseId]));
  };

  const handleRetestDecline = (exerciseId: string) => {
    setRetestDismissed((prev) => new Set([...prev, exerciseId]));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-500">Loading results…</p>
      </div>
    );
  }

  if (!program || !projection) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center">
        <p className="text-sm text-slate-400">No program found.</p>
        <Link href="/results" className="text-xs text-slate-500 underline underline-offset-2">
          Back to results
        </Link>
      </div>
    );
  }

  return (
    <SectionVisibilityProvider screen="results">
      <div className="min-h-screen bg-slate-950 px-4 pb-24 pt-8 sm:px-6">
        <div className="mx-auto max-w-lg space-y-10">
          {/* Back navigation */}
          <nav>
            <Link href="/results" className="text-xs text-slate-500 hover:text-slate-400">
              ← Back to program
            </Link>
          </nav>

          {/* Headline metric */}
          <VisibilityGate sectionId="results.headline">
            <HeadlineMetric projection={projection} />
          </VisibilityGate>

          {/* Sacrifice retest queue — shown above main content when eligible */}
          <VisibilityGate sectionId="results.sacrificeRetest">
            <SacrificeRetestSection
              queue={filteredQueue}
              onAccept={handleRetestAccept}
              onDecline={handleRetestDecline}
            />
          </VisibilityGate>

          {/* Ladders section */}
          <VisibilityGate sectionId="results.ladders">
            <LaddersSection projection={projection} />
          </VisibilityGate>

          {/* Posture section */}
          <VisibilityGate sectionId="results.posture">
            <PostureSection projection={projection} />
          </VisibilityGate>

          {/* Retired posture focus */}
          <VisibilityGate sectionId="results.retiredTags">
            <RetiredTagsSection projection={projection} />
          </VisibilityGate>

          {/* Phase history timeline (hidden by default) */}
          <VisibilityGate sectionId="results.phaseHistory">
            <PhaseHistorySection history={projection.phaseHistory} />
          </VisibilityGate>

          {/* Recovery affordance for any hidden sections */}
          <HiddenSectionsBar />

          {/* Provenance footer */}
          <VisibilityGate sectionId="results.provenanceFooter">
            <ProvenanceFooter footer={projection.provenanceFooter} />
          </VisibilityGate>
        </div>
      </div>
    </SectionVisibilityProvider>
  );
}
