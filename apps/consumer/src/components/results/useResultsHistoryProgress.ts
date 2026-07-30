"use client";

import { useMemo, useState } from "react";
import { exerciseById } from "@/lib/exercises";
import { getPhaseGateThreshold } from "@/lib/phaseGating";
import type { Program, ProgramProgress, SessionRecord } from "@/lib/types";
import { calculatePhaseWeekDisplay } from "@/components/results/progressMetrics";

export type HistoryScope = "current" | "all";

export type ResultsHistoryEntry = {
  session: SessionRecord;
  dayIndex: number | null;
  dayLabel: string;
  displayDate: string;
  programLabel: string;
  exerciseNames: string[];
  searchText: string;
};

const parseDayIndexFromSession = (session: SessionRecord) => {
  const match = session.notes?.match(/dayIndex:(\d+)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const toTimestampMs = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const completedTimestampMs = (session: SessionRecord) =>
  toTimestampMs(session.completedAt ?? session.updatedAt ?? session.createdAt);

export function buildSessionProgramLabel({
  session,
  sessionProgram,
  activeProgramId,
  programProgress,
}: {
  session: SessionRecord;
  sessionProgram: Program | null | undefined;
  activeProgramId: string | null;
  programProgress: ProgramProgress | null | undefined;
}) {
  if (!sessionProgram) return session.routineId ?? "Plan";

  const phaseStartedAt =
    session.routineId === activeProgramId
      ? programProgress?.phaseStartedAt ?? sessionProgram.createdAt
      : sessionProgram.createdAt;
  const phaseStartedAtMs = toTimestampMs(phaseStartedAt);
  const completedAtMs = completedTimestampMs(session);
  let weekLabel = `Week ${sessionProgram.weekIndex ?? 1}`;

  if (phaseStartedAtMs !== null && completedAtMs !== null) {
    const phaseIndex =
      programProgress?.phaseIndex ??
      sessionProgram.phaseIndex ??
      sessionProgram.phase?.phaseIndex ??
      1;
    const daysPerWeek = programProgress?.daysPerWeek ?? sessionProgram.daysPerWeek;
    const { minDays } = getPhaseGateThreshold(phaseIndex, daysPerWeek);
    const daysSincePhaseStart = Math.max(
      0,
      Math.floor((completedAtMs - phaseStartedAtMs) / DAY_MS)
    );
    const { currentWeek } = calculatePhaseWeekDisplay({
      daysSincePhaseStart,
      dayTarget: minDays,
      weekIndex: 1,
    });
    weekLabel = `Week ${currentWeek}`;
  }

  return `${sessionProgram.phaseName ?? "Plan"} • ${weekLabel}`;
}

type UseResultsHistoryProgressParams = {
  allSessions: SessionRecord[];
  activeProgramId: string | null;
  program: Program | null;
  programProgress?: ProgramProgress | null;
  allPrograms: Program[];
};

export function useResultsHistoryProgress({
  allSessions,
  activeProgramId,
  program,
  programProgress,
  allPrograms,
}: UseResultsHistoryProgressParams) {
  const [historyScope, setHistoryScope] = useState<HistoryScope>("current");
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  const allCompletedSessions = useMemo(
    () =>
      allSessions
        .filter((session) => session.completedAt)
        .toSorted((a, b) =>
          (b.completedAt ?? b.updatedAt ?? b.createdAt ?? "").localeCompare(
            a.completedAt ?? a.updatedAt ?? a.createdAt ?? ""
          )
        ),
    [allSessions]
  );

  const currentProgramCompletedSessions = useMemo(() => {
    if (!activeProgramId) return [] as SessionRecord[];
    return allCompletedSessions.filter(
      (session) => session.routineId === activeProgramId
    );
  }, [allCompletedSessions, activeProgramId]);

  const programById = useMemo(() => {
    const map = new Map<string, Program>();
    allPrograms.forEach((entry) => {
      map.set(entry.id, entry);
    });
    if (program) {
      map.set(program.id, program);
    }
    return map;
  }, [allPrograms, program]);

  const historyScopeSessions =
    historyScope === "current" ? currentProgramCompletedSessions : allCompletedSessions;
  const historySearchTerm = historySearchQuery.trim().toLowerCase();
  const historyEntries = useMemo(() => {
    return historyScopeSessions
      .map((session) => {
        const dayIndex = parseDayIndexFromSession(session);
        const sessionProgram = session.routineId
          ? programById.get(session.routineId)
          : null;
        const day =
          dayIndex === null
            ? null
            : sessionProgram?.week.find((entry) => entry.dayIndex === dayIndex) ??
              null;
        const exerciseNames =
          day?.routine
            .map((item) => exerciseById(item.exerciseId)?.name)
            .filter((name): name is string => Boolean(name)) ?? [];
        const completedAtValue =
          session.completedAt ?? session.updatedAt ?? session.createdAt;
        const completedAt = completedAtValue ? new Date(completedAtValue) : null;
        const isoDate =
          completedAt && !Number.isNaN(completedAt.getTime())
            ? completedAt.toISOString().slice(0, 10)
            : "";
        const displayDate =
          completedAt && !Number.isNaN(completedAt.getTime())
            ? completedAt.toLocaleDateString()
            : "Completed";
        const dayLabel =
          day?.title ??
          (dayIndex === null ? "Plan day saved" : `Day ${dayIndex + 1}`);
        const programLabel = buildSessionProgramLabel({
          session,
          sessionProgram,
          activeProgramId,
          programProgress,
        });
        const searchText = [
          displayDate,
          isoDate,
          dayLabel,
          programLabel,
          session.routineId ?? "",
          dayIndex === null ? "" : `day ${dayIndex + 1}`,
          ...exerciseNames,
        ]
          .join(" ")
          .toLowerCase();
        return {
          session,
          dayIndex,
          dayLabel,
          displayDate,
          programLabel,
          exerciseNames,
          searchText,
        };
      })
      .filter((entry) =>
        historySearchTerm ? entry.searchText.includes(historySearchTerm) : true
      );
  }, [historyScopeSessions, historySearchTerm, programById, activeProgramId, programProgress]);

  return {
    historyScope,
    setHistoryScope,
    historySearchQuery,
    setHistorySearchQuery,
    historySearchTerm,
    historyEntries,
    allCompletedSessions,
    currentProgramCompletedSessions,
  };
}
