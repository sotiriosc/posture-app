"use client";

import { useMemo, useState } from "react";
import { exerciseById } from "@/lib/exercises";
import type { Program, SessionRecord } from "@/lib/types";

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

type UseResultsHistoryProgressParams = {
  allSessions: SessionRecord[];
  activeProgramId: string | null;
  program: Program | null;
  allPrograms: Program[];
};

export function useResultsHistoryProgress({
  allSessions,
  activeProgramId,
  program,
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
        const programLabel = sessionProgram
          ? `${sessionProgram.phaseName ?? "Plan"} • Week ${sessionProgram.weekIndex ?? 1}`
          : session.routineId ?? "Plan";
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
  }, [historyScopeSessions, historySearchTerm, programById]);

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
