"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { QuestionnaireData } from "./QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import type { Routine } from "@/lib/routine";
import { generateRoutine } from "@/lib/routine";
import { generateWeeklyProgram } from "@/lib/program";
import {
  normalizeEquipmentSelection,
  normalizeEquipmentSelectionValues,
  type Equipment,
} from "@/lib/equipment";
import { usePhotoContext } from "@/components/PhotoContext";
import {
  analyzeImagePose,
  computeMetrics,
  generateObservations,
  type PoseAnalysis,
  type PoseMetrics,
} from "@/lib/poseAnalyzer";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import type { Exercise } from "@/lib/exercises";
import type { Program, ProgramProgress, SessionRecord } from "@/lib/types";
import {
  getProgramProgress,
  getLatestProgram,
  listSessionsByProgramId,
  saveProgram,
  saveProgramProgress,
  uuid,
} from "@/lib/logStore";

const STORAGE_KEY = "posture_questionnaire";

const defaultRoutine: Routine = {
  summary:
    "A balanced routine focused on mobility, postural strength, and daily posture reminders.",
  priorities: [],
  observed: [],
  sections: [],
};

const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image file."));
    };
    img.src = url;
  });

export default function ResultsRoutine() {
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [progress, setProgress] = useState<ProgramProgress | null>(null);
  const [programSessions, setProgramSessions] = useState<SessionRecord[]>([]);
  const [isReady, setIsReady] = useState(false);
  const { photos } = usePhotoContext();
  const [poseState, setPoseState] = useState<{
    loading: boolean;
    error: string | null;
    report: PoseAnalysis | null;
  }>({ loading: false, error: null, report: null });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<QuestionnaireData>;
      setData({
        goals: parsed.goals ?? "Improve posture",
        painAreas: parsed.painAreas ?? [],
        experience: parsed.experience ?? "Beginner",
        equipment: normalizeEquipmentSelectionValues(
          parsed.equipment ?? ["none"]
        ),
        daysPerWeek: parsed.daysPerWeek ?? 3,
      });
    }
    setIsReady(true);
  }, []);

  const routine = useMemo(() => {
    if (!data) return defaultRoutine;
    return generateRoutine(data);
  }, [data]);

  const equipmentContext = useMemo(() => {
    if (!data) {
      return { available: new Set<Equipment>(), hasGym: false };
    }
    return normalizeEquipmentSelection(data.equipment);
  }, [data]);

  const buildWhyPicked = (exercise: Exercise) => {
    const patterns = exercise.movementPattern;
    const slotLabel = (() => {
      if (patterns.includes("mobility")) return "Mobility";
      if (patterns.includes("pull")) return "Main pull";
      if (patterns.includes("push")) return "Main push";
      if (patterns.includes("squat")) return "Squat pattern";
      if (patterns.includes("hinge")) return "Hinge pattern";
      if (patterns.includes("core")) return "Core stability";
      return "Support work";
    })();

    const goalMatch = [
      "posture",
      data?.goals === "Reduce pain" ? "pain reduction" : "strength",
    ].filter(Boolean) as string[];

    const trains = exercise.muscleGroups;

    const purpose = (() => {
      if (patterns.includes("mobility")) {
        return "Improves range and reduces stiffness so daily movement feels smoother.";
      }
      if (patterns.includes("pull")) {
        return "Builds upper-back strength to support tall, stable posture.";
      }
      if (patterns.includes("push")) {
        return "Builds pushing strength and shoulder control without compensation.";
      }
      if (patterns.includes("squat")) {
        return "Reinforces leg strength and alignment for better lower-body support.";
      }
      if (patterns.includes("hinge")) {
        return "Reinforces hip control and posterior-chain strength.";
      }
      if (patterns.includes("core")) {
        return "Trains bracing and stability to protect spine alignment.";
      }
      return "Supports balanced posture and coordination.";
    })();

    const setup = (() => {
      if (exercise.equipment.includes("bands")) {
        return "Anchor band at chest height, step back to tension, stay tall.";
      }
      if (patterns.includes("mobility")) {
        return "Slow reps with full breaths, stay relaxed.";
      }
      return "Control each rep, steady tempo.";
    })();

    const progressions = (() => {
      if (patterns.includes("mobility")) return ["Add pause at end range"];
      if (patterns.includes("pull")) return ["Add band tension or pause"];
      if (patterns.includes("push")) return ["Slow tempo or add reps"];
      if (patterns.includes("squat")) return ["Add tempo or split stance"];
      if (patterns.includes("hinge")) return ["Single-leg or add reach"];
      if (patterns.includes("core")) return ["Longer holds or slower reps"];
      return [];
    })();

    const regressions = (() => {
      if (patterns.includes("push")) return ["Incline variation"];
      if (patterns.includes("squat")) return ["Shallower depth"];
      if (patterns.includes("hinge")) return ["Hands to thighs"];
      return [];
    })();

    return {
      slot: slotLabel,
      goalMatch,
      trains,
      purpose,
      setup,
      progressions: progressions.length ? progressions : undefined,
      regressions: regressions.length ? regressions : undefined,
    };
  };

  useEffect(() => {
    if (!data) return;
    const loadProgram = async () => {
      const latest = await getLatestProgram();
      if (
        latest &&
        latest.daysPerWeek === data.daysPerWeek &&
        latest.goalTrack === data.goals
      ) {
        setProgram(latest);
        return;
      }
      const newProgram = generateWeeklyProgram(data, uuid());
      await saveProgram(newProgram);
      setProgram(newProgram);
    };
    loadProgram();
  }, [data]);

  const completedByDay = useMemo(() => {
    const map = new Map<number, SessionRecord[]>();
    programSessions.forEach((session) => {
      if (!session.completedAt) return;
      const match = session.notes?.match(/dayIndex:(\d+)/);
      if (!match) return;
      const dayIndex = Number(match[1]);
      const list = map.get(dayIndex) ?? [];
      list.push(session);
      map.set(dayIndex, list);
    });
    return map;
  }, [programSessions]);

  const nextDayIndex = useMemo(() => {
    if (!program) return 0;
    const completedDays = Array.from(completedByDay.keys()).sort((a, b) => a - b);
    if (!completedDays.length) return 0;
    const last = completedDays[completedDays.length - 1];
    return last + 1 < program.daysPerWeek ? last + 1 : 0;
  }, [program, completedByDay]);

  const completedCount = useMemo(() => {
    return Array.from(completedByDay.keys()).length;
  }, [completedByDay]);


  useEffect(() => {
    if (!program) return;
    getProgramProgress(program.id).then((stored) => {
      if (stored) {
        setProgress(stored);
        setSelectedDay(stored.nextDayIndex ?? 0);
      } else {
        const initial: ProgramProgress = {
          programId: program.id,
          lastCompletedDayIndex: null,
          nextDayIndex: 0,
          completedDayIndices: [],
          updatedAt: new Date().toISOString(),
        };
        saveProgramProgress(initial);
        setProgress(initial);
        setSelectedDay(0);
      }
    });
  }, [program]);

  useEffect(() => {
    if (!program) return;
    const loadSessions = () => {
      listSessionsByProgramId(program.id).then(setProgramSessions);
    };
    loadSessions();
    window.addEventListener("focus", loadSessions);
    window.addEventListener("visibilitychange", loadSessions);
    return () => {
      window.removeEventListener("focus", loadSessions);
      window.removeEventListener("visibilitychange", loadSessions);
    };
  }, [program]);

  useEffect(() => {
    if (!program) return;
    const completedIndices = Array.from(completedByDay.keys());
    const updated: ProgramProgress = {
      programId: program.id,
      lastCompletedDayIndex: completedIndices.length
        ? completedIndices.sort((a, b) => a - b)[completedIndices.length - 1]
        : null,
      nextDayIndex,
      completedDayIndices: completedIndices,
      updatedAt: new Date().toISOString(),
    };
    saveProgramProgress(updated);
    setProgress(updated);
  }, [program, completedByDay, nextDayIndex]);

  useEffect(() => {
    const runPoseAnalysis = async () => {
      const entries = Object.entries(photos).filter(
        ([, value]) => value !== null
      ) as [string, File][];

      if (!entries.length) {
        setPoseState((prev) => ({ ...prev, report: null, error: null }));
        return;
      }

      setPoseState({ loading: true, error: null, report: null });

      try {
        const metricsByView: Record<string, PoseMetrics> = {};
        const observations: string[] = [];
        const priorities: string[] = [];
        const confidenceScores: number[] = [];

        for (const [view, file] of entries) {
          const image = await loadImageFromFile(file);
          const keypoints = await analyzeImagePose(image);
          if (!keypoints) continue;
          const metrics = computeMetrics(keypoints);
          metricsByView[view] = metrics;
          const analysis = generateObservations(metrics);
          observations.push(...analysis.observations.map((item) => `${view}: ${item}`));
          priorities.push(...analysis.priorities);
          confidenceScores.push(analysis.confidenceScore);
        }

        const combined: PoseAnalysis = {
          metrics: {
            torsoHeight: null,
            avgKeypointScore: null,
            shoulderHeightDelta: metricsByView.front?.shoulderHeightDelta ?? null,
            hipHeightDelta: metricsByView.front?.hipHeightDelta ?? null,
            kneeAlignmentDelta: metricsByView.front?.kneeAlignmentDelta ?? null,
            headForwardOffset: metricsByView.side?.headForwardOffset ?? null,
            torsoLeanAngle: metricsByView.side?.torsoLeanAngle ?? null,
            hipToShoulderAlignment:
              metricsByView.side?.hipToShoulderAlignment ?? null,
            scapularSymmetry: metricsByView.back?.scapularSymmetry ?? null,
            hipShift: metricsByView.back?.hipShift ?? null,
          },
          observations: observations.length
            ? observations
            : ["We couldn’t reliably detect posture landmarks in these photos."],
          priorities: Array.from(new Set(priorities)).slice(0, 4),
          confidenceScore: confidenceScores.length
            ? confidenceScores.reduce((sum, value) => sum + value, 0) /
              confidenceScores.length
            : 0.4,
        };

        setPoseState({ loading: false, error: null, report: combined });
      } catch (error) {
        setPoseState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Pose detection failed. Try clearer photos.",
          report: null,
        });
      }
    };

    runPoseAnalysis();
  }, [photos]);


  if (!isReady) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading your program...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <p className="text-sm text-slate-600">
          We need your questionnaire answers to build a routine.
        </p>
        <Link
          href="/questionnaire"
          className="mt-4 inline-flex rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white"
        >
          Go to questionnaire
        </Link>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading your weekly program...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Summary
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Weekly posture reset
        </h2>
        <p className="mt-2 text-sm text-slate-600">{routine.summary}</p>
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          {routine.priorities.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-slate-900" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Posture scan
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              What we observed
            </h2>
          </div>
          {poseState.report ? (
            <div className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
              Confidence: {Math.round(poseState.report.confidenceScore * 100)}%
            </div>
          ) : null}
        </div>

        {poseState.loading ? (
          <p className="mt-4 text-sm text-slate-600">
            Analyzing your posture photos…
          </p>
        ) : poseState.error ? (
          <p className="mt-4 text-sm text-rose-600">{poseState.error}</p>
        ) : poseState.report ? (
          <>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              {poseState.report.observations.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                What we’ll focus on
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                {Array.from(
                  new Set([
                    ...poseState.report.priorities,
                    ...routine.priorities,
                  ])
                )
                  .slice(0, 5)
                  .map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1"
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            Upload posture photos to see observations here.
          </p>
        )}

        <p className="mt-6 text-xs text-slate-500">
          This scan estimates posture patterns — not a medical diagnosis.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Observed patterns
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          {routine.observed.map((item) => (
            <div key={item} className="rounded-2xl bg-slate-50 px-3 py-2">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Your weekly program
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {data.daysPerWeek}-day split • Estimated 45–60 minutes
            </h3>
          </div>
          <Link
            href={`/session?programId=${program?.id ?? ""}&dayIndex=${nextDayIndex}`}
            className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white"
          >
            {completedCount >= data.daysPerWeek
              ? "Continue Program"
              : completedCount
              ? "Continue Program"
              : "Continue Program"}
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="rounded-full border border-slate-200 px-3 py-1">
            Day {nextDayIndex + 1} of {data.daysPerWeek}
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1">
            {completedCount} completed
          </span>
        </div>
      </div>

      {program ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Program Dashboard
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Weekly calendar
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Tap a day to view details
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {program.week.map((day) => {
                const isCompleted = completedByDay.has(day.dayIndex);
                const isNext = day.dayIndex === nextDayIndex;
                return (
                  <Link
                    key={day.dayIndex}
                    href={`/program/${program.id}/day/${day.dayIndex}`}
                    className={`relative rounded-2xl border px-4 py-3 transition ${
                      isNext
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide">
                          Day {day.dayIndex + 1}
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {day.title}
                        </p>
                      </div>
                      {isCompleted ? (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            isNext
                              ? "border-white/40 text-white"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          ✓
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      {isNext ? (
                        <span className="rounded-full border border-white/30 px-2 py-0.5 text-white">
                          Next
                        </span>
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-500">
                          {isCompleted ? "Completed" : "Pending"}
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-2 py-0.5 ${
                          isNext
                            ? "border-white/30 text-white"
                            : "border-slate-200 bg-white text-slate-500"
                        }`}
                      >
                        {day.routine.length} exercises
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <OnImage>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">
                  Day Preview
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Day {selectedDay + 1}: {program.week[selectedDay].title}
                </h3>
                <p className="mt-1 text-xs text-slate-200">
                  Focus: {program.week[selectedDay].focusTags.join(", ")}
                </p>
              </div>
              <Link href={`/session?programId=${program.id}&dayIndex=${selectedDay}`}>
                <Button variant="secondary">Start Selected Day</Button>
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-200">
              <label className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1">
                <input
                  type="checkbox"
                  checked={showDebug}
                  onChange={() => setShowDebug((prev) => !prev)}
                  className="h-3 w-3 accent-white"
                />
                Why this exercise was picked
              </label>
              <span className="text-[11px] text-slate-200">
                Tap to see quick rationale
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {program.week.map((day) => (
                <button
                  key={day.dayIndex}
                  type="button"
                  onClick={() => setSelectedDay(day.dayIndex)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    selectedDay === day.dayIndex
                      ? "border-white/40 bg-white/20 text-white"
                      : "border-white/20 text-slate-200"
                  }`}
                >
                  Day {day.dayIndex + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
              {program.week[selectedDay].routine.slice(0, 5).map((item, index) => {
                const exercise = exerciseById(item.exerciseId);
                return (
                  <span
                    key={`${item.exerciseId}-${index}-${selectedDay}`}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1"
                  >
                    {exercise?.name ?? "Exercise"}
                  </span>
                );
              })}
            </div>
            {showDebug ? (
              <div className="mt-4 space-y-2 text-xs text-slate-200">
                {program.week[selectedDay].routine.map((item, index) => {
                  const exercise = exerciseById(item.exerciseId);
                  if (!exercise) return null;
                  const why = buildWhyPicked(exercise);
                  return (
                    <div
                      key={`debug-${item.exerciseId}-${index}-${selectedDay}`}
                      className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2"
                    >
                      <p className="font-semibold text-white">
                        {exercise.name}
                      </p>
                      <ul className="mt-2 space-y-1 text-[11px] text-slate-200">
                        <li>Slot: {why.slot}</li>
                        <li>Goal match: {why.goalMatch.join(", ")}</li>
                        <li>Trains: {why.trains.join(", ")}</li>
                        <li>Purpose: {why.purpose}</li>
                        <li>Setup: {why.setup}</li>
                        {why.progressions?.length ? (
                          <li>Progression: {why.progressions.join(" / ")}</li>
                        ) : null}
                        {why.regressions?.length ? (
                          <li>Regression: {why.regressions.join(" / ")}</li>
                        ) : null}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-200">
              <span className="rounded-full border border-white/20 px-3 py-1">
                {completedByDay.has(selectedDay) ? "Completed" : "Pending"}
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                Sessions: {completedByDay.get(selectedDay)?.length ?? 0}
              </span>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Coach&apos;s Corner
                  </h4>
                  <p className="text-xs text-slate-200">
                    Tap an exercise to see form cues + demo video
                  </p>
                </div>
                <a
                  href="#coachs-corner-list"
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                >
                  Get form help
                </a>
              </div>

              <div
                id="coachs-corner-list"
                className="mt-4 flex flex-wrap gap-2 text-xs"
              >
                {program.week[selectedDay].routine.map((item, index) => {
                  const exercise = exerciseById(item.exerciseId);
                  if (!exercise) return null;
                  return (
                    <Link
                      key={`${item.exerciseId}-coach-${index}`}
                      href={`/exercise/${exercise.id}`}
                      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white transition hover:bg-white/15"
                    >
                      <span>{exercise.name}</span>
                      <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/90">
                        Video
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          </OnImage>

        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {routine.sections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {section.title}
              </h3>
              <div className="mt-4 space-y-4">
                {section.items.map((item) => {
                  const exercise = exerciseById(item.exerciseId);
                  return (
                    <div
                      key={item.exerciseId}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {exercise ? (
                          <Link
                            href={`/exercise/${exercise.id}`}
                            className="hover:underline"
                          >
                            {exercise.name}
                          </Link>
                        ) : (
                          "Exercise"
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.sets} sets • {item.reps} reps
                      </p>
                      <div className="mt-3 text-xs text-slate-600">
                        <p className="font-semibold text-slate-700">Cues</p>
                        <ul className="list-disc pl-4">
                          {(exercise?.cues ?? []).map((cue) => (
                            <li key={cue}>{cue}</li>
                          ))}
                        </ul>
                        <p className="mt-2 text-slate-500">
                          Common mistake:{" "}
                          {exercise?.mistakes?.[0] ?? "Keep form controlled"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <OnImage className="flex flex-wrap gap-3">
        <Link href="/assessment">
          <Button variant="secondary">Update photos</Button>
        </Link>
        <Link href="/questionnaire">
          <Button variant="secondary">Edit answers</Button>
        </Link>
      </OnImage>
    </div>
  );
}
