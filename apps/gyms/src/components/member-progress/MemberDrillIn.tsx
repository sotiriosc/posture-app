"use client";

import { useEffect, useState } from "react";
import { projectResults } from "@praxis/engine/results/resultsProjection";
import { init, listAllPrograms, listExerciseLogsBySession, listSessions } from "@/lib/logStore";
import { resolveActiveProgramFromList } from "@/lib/trainingStateModel";
import type { ExerciseLog } from "@/lib/types";
import type { MemberRosterRow } from "@/lib/gymSaas/memberProgressData";
import type { ResultsProjection } from "@praxis/engine/results/resultsProjection";

type Props = {
  member: MemberRosterRow;
};

/**
 * Operator-facing drill-in into a member's full projection.
 *
 * Same data layer as the consumer ResultsView.
 * Operator framing: no gamification copy, no celebration, just facts.
 * "Member cleared scapular focus on retest. Consider mentioning at next session."
 */
export default function MemberDrillIn({ member }: Props) {
  const [projection, setProjection] = useState<ResultsProjection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // In production this would load the specific member's program via their userId.
      // Demo: use the local program as a stand-in.
      await init();
      const programs = await listAllPrograms();
      const active = resolveActiveProgramFromList(programs);
      if (cancelled || !active) {
        if (!cancelled) setLoading(false);
        return;
      }
      const sessionList = await listSessions();
      const allLogs: ExerciseLog[] = [];
      for (const session of sessionList) {
        const sessionLogs = await listExerciseLogsBySession(session.id);
        allLogs.push(...sessionLogs);
      }
      if (cancelled) return;
      setProjection(projectResults(active, allLogs));
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [member.memberId]);

  if (loading) {
    return <p className="text-sm text-[#6B7280]">Loading member data…</p>;
  }

  if (!projection) {
    return (
      <p className="text-sm text-[#6B7280]">
        No program data available for this member yet.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Ladder summary */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
          Ladder Progress
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-[#6B7280]">Rungs climbed</dt>
            <dd className="mt-1 text-2xl font-light tabular-nums text-white">
              {projection.laddersClimbed.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#6B7280]">Active patterns</dt>
            <dd className="mt-1 text-2xl font-light tabular-nums text-white">
              {projection.currentRungByPattern.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#6B7280]">Sessions completed</dt>
            <dd className="mt-1 text-2xl font-light tabular-nums text-white">
              {projection.consistency.sessionsCompleted}
            </dd>
          </div>
        </dl>
        {projection.laddersClimbed.length > 0 && (
          <ul className="mt-4 divide-y divide-[#1F2937] rounded-lg border border-[#1F2937]">
            {projection.laddersClimbed.map((climb, idx) => (
              <li key={idx} className="px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
                  {climb.pattern.replace(/_/g, " ")}
                </p>
                <p className="mt-0.5 text-sm text-[#D1D5DB]">
                  {climb.fromExerciseName} → {climb.toExerciseName}
                </p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Session {climb.atSessionCount} · Phase {climb.atPhase === 0 ? "activation" : climb.atPhase === 1 ? "skill" : "growth"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Retired posture tags */}
      {projection.retiredTags.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
            Posture — Retired Focus Areas
          </h2>
          <ul className="mt-3 space-y-2">
            {projection.retiredTags.map((tag) => (
              <li
                key={tag.tag}
                className="rounded-lg border border-[#1F2937] bg-[#0F1A0A]/60 px-4 py-3"
              >
                <p className="text-sm font-medium text-[#86EFAC] capitalize">
                  {tag.tag.replace(/_/g, " ")} — cleared
                </p>
                <p className="mt-0.5 text-xs text-[#4B5563]">{tag.retirementTrace}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Active posture tags */}
      {projection.activeTags.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
            Posture — Active Observations
          </h2>
          <ul className="mt-3 space-y-2">
            {projection.activeTags.map((tag) => (
              <li key={tag.tag} className="rounded-lg border border-[#1F2937] px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#D1D5DB] capitalize">
                    {tag.tag.replace(/_/g, " ")}
                  </p>
                  <span
                    className={[
                      "text-xs",
                      tag.direction === "improving" ? "text-[#86EFAC]" : tag.direction === "worsening" ? "text-[#FCA5A5]" : "text-[#6B7280]",
                    ].join(" ")}
                  >
                    {tag.notEnoughSignal ? "insufficient signal" : tag.direction}
                  </span>
                </div>
                {tag.sourceObservation && (
                  <p className="mt-1 text-xs text-[#4B5563] italic">{tag.sourceObservation}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Provenance footer — the defensibility line */}
      <footer className="border-t border-[#1F2937] pt-6">
        <p className="text-xs text-[#374151]">{projection.provenanceFooter.footerLine}</p>
        {projection.provenanceFooter.totalDecisionTraces > 0 && (
          <p className="mt-1 text-xs text-[#374151]">
            {projection.provenanceFooter.totalDecisionTraces} decisions traced this week
          </p>
        )}
      </footer>
    </div>
  );
}
