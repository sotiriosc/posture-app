import { describe, expect, it } from "vitest";
import { buildSessionProgramLabel } from "@/components/results/useResultsHistoryProgress";
import type { Program, ProgramProgress, SessionRecord } from "@/lib/types";

const programId = "6ef55a15-150a-4866-86cd-2cd10862d46d";

const program = {
  id: programId,
  userId: "b04c651e-24a3-4f6e-a41e-4dfc821e1f8c",
  createdAt: "2026-07-03T12:00:00.000Z",
  updatedAt: "2026-07-30T12:00:00.000Z",
  goalTrack: "posture",
  daysPerWeek: 3,
  estimatedSessionMinutesRange: { min: 45, max: 60 },
  phaseIndex: 1,
  phaseName: "Phase 1: Control & Technique",
  weekIndex: 5,
  week: [],
} as unknown as Program;

const progress = {
  programId,
  phaseIndex: 1,
  phaseStartedAt: "2026-07-03T12:00:00.000Z",
  daysPerWeek: 3,
  weekIndex: 5,
  updatedAt: "2026-07-30T12:00:00.000Z",
} as ProgramProgress;

const session = (id: string, completedAt: string) =>
  ({
    id,
    userId: program.userId,
    routineId: programId,
    startedAt: completedAt,
    completedAt,
    createdAt: completedAt,
    updatedAt: completedAt,
    deletedAt: null,
    source: "cloud",
  } as SessionRecord);

describe("results history progress", () => {
  it("labels completed sessions by their own phase week, not the program current week", () => {
    expect(
      buildSessionProgramLabel({
        session: session("s1", "2026-07-03T13:00:00.000Z"),
        sessionProgram: program,
        activeProgramId: programId,
        programProgress: progress,
      })
    ).toBe("Phase 1: Control & Technique • Week 1");

    expect(
      buildSessionProgramLabel({
        session: session("s6", "2026-07-13T13:00:00.000Z"),
        sessionProgram: program,
        activeProgramId: programId,
        programProgress: progress,
      })
    ).toBe("Phase 1: Control & Technique • Week 2");

    expect(
      buildSessionProgramLabel({
        session: session("s12", "2026-07-29T13:00:00.000Z"),
        sessionProgram: program,
        activeProgramId: programId,
        programProgress: progress,
      })
    ).toBe("Phase 1: Control & Technique • Week 4");
  });

  it("falls back to the routine id when the saved program is unavailable", () => {
    expect(
      buildSessionProgramLabel({
        session: session("legacy", "2026-07-29T13:00:00.000Z"),
        sessionProgram: null,
        activeProgramId: programId,
        programProgress: progress,
      })
    ).toBe(programId);
  });
});
