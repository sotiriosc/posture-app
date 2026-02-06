"use client";

import { useEffect, useMemo, useState } from "react";
import { exerciseById } from "@/lib/exercises";
import type { ExerciseFeedback, ExerciseLog } from "@/lib/types";
import { init, listExerciseLogsByExercise, loadPrefs, savePrefs } from "@/lib/logStore";
import { getProgressionRecommendation } from "@/lib/progression";

type Props = {
  exerciseId: string;
};

export default function ExerciseHistory({ exerciseId }: Props) {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [substitutionByExercise, setSubstitutionByExercise] = useState<
    Record<string, string>
  >({});
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      await init();
      const items = await listExerciseLogsByExercise(exerciseId, 10);
      setLogs(items);
      const prefs = await loadPrefs();
      if (prefs.substitutionByExercise) {
        setSubstitutionByExercise(prefs.substitutionByExercise);
      }
      setPrefsLoaded(true);
    };
    load();
  }, [exerciseId]);

  const exerciseLogs = useMemo(() => logs, [logs]);

  const maxWeight = useMemo(() => {
    return exerciseLogs.reduce(
      (max, log) => (log.weight && log.weight > max ? log.weight : max),
      0
    );
  }, [exerciseLogs]);

  const maxVolume = useMemo(() => {
    return exerciseLogs.reduce(
      (max, log) =>
        log.computedVolume && log.computedVolume > max
          ? log.computedVolume
          : max,
      0
    );
  }, [exerciseLogs]);

  const recommendation = useMemo(() => {
    if (!exerciseLogs.length) return null;
    const exercise = exerciseById(exerciseId);
    if (!exercise) return null;
    const latest = exerciseLogs[0];
    const feedback: ExerciseFeedback | null = latest.felt
      ? {
          rating: latest.felt,
          painLocation: latest.painLocation ?? null,
          notes: latest.feedbackNotes ?? null,
        }
      : null;
    return getProgressionRecommendation({
      exercise,
      logs: exerciseLogs,
      feedback,
      prescription: {
        sets: latest.setsPlanned ?? latest.setsCompleted ?? null,
        reps: exercise.durationOrReps,
      },
    });
  }, [exerciseLogs, exerciseId]);

  const handleSubstitution = async (originalId: string, substituteId: string) => {
    const prefs = await loadPrefs();
    const nextMap = {
      ...(prefs.substitutionByExercise ?? {}),
      [originalId]: substituteId,
    };
    const nextPrefs = { ...prefs, substitutionByExercise: nextMap };
    await savePrefs(nextPrefs);
    setSubstitutionByExercise(nextMap);
  };

  const formatRecommendation = (
    rec: ReturnType<typeof getProgressionRecommendation>
  ) => {
    if (!rec) return "";
    const { recommendedNext } = rec;
    const parts: string[] = [];
    if (recommendedNext.weight) parts.push(`${recommendedNext.weight} lb`);
    if (recommendedNext.reps) parts.push(`${recommendedNext.reps} reps`);
    if (recommendedNext.sets) parts.push(`${recommendedNext.sets} sets`);
    if (recommendedNext.tempo) parts.push(`tempo ${recommendedNext.tempo}`);
    if (!parts.length) return "Keep targets consistent";
    return parts.join(" • ");
  };

  if (!exerciseLogs.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">No history yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">History</h2>
      {recommendation ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
          {recommendation.safetyFlag ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
              Safety
            </span>
          ) : null}
          <p className="mt-2 font-semibold text-slate-900">Next time:</p>
          <p>{formatRecommendation(recommendation)}</p>
          <p className="mt-1 text-slate-500">{recommendation.reason}</p>
        </div>
      ) : null}
      {prefsLoaded && exerciseLogs[0]?.felt === "pain" ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <p className="font-semibold">Try this instead</p>
          <p className="mt-1 text-amber-800/80">
            Swap in a safer option next session (optional).
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(exerciseById(exerciseId)?.swapOptions ?? []).map((optionId) => {
              const option = exerciseById(optionId);
              if (!option) return null;
              const isSelected = substitutionByExercise[exerciseId] === optionId;
              return (
                <button
                  key={optionId}
                  type="button"
                  onClick={() => handleSubstitution(exerciseId, optionId)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                    isSelected
                      ? "border-amber-900 bg-amber-900 text-white"
                      : "border-amber-200 bg-white text-amber-900"
                  }`}
                >
                  {option.name}
                </button>
              );
            })}
          </div>
          {substitutionByExercise[exerciseId] ? (
            <p className="mt-2 text-[11px] text-amber-900/70">
              Substitution saved for next session.
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {exerciseLogs.map((log, index) => {
          const exercise = exerciseById(log.exerciseId);
          const loadType = exercise?.loadType ?? "bodyweight";
          const isMaxWeight = log.weight && log.weight === maxWeight;
          const isMaxVolume =
            log.computedVolume && log.computedVolume === maxVolume;
          return (
            <div
              key={`${log.exerciseId}-${log.createdAt}-${index}`}
              className="rounded-2xl bg-slate-50 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>{log.createdAt.slice(0, 10)}</span>
                <span>
                  {log.setsCompleted} sets •{" "}
                  {log.repsBySet
                    ? log.repsBySet.join(", ")
                    : log.reps ?? "--"}{" "}
                  reps
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {log.weight
                  ? `${log.weight} ${log.unit}`
                  : loadType === "timed"
                  ? "Timed"
                  : "Bodyweight"}{" "}
                {isMaxWeight ? "• PR weight" : ""}
              </p>
              <p className="text-xs text-slate-500">
                Volume: {log.computedVolume ?? "--"}{" "}
                {isMaxVolume ? "• PR volume" : ""}
              </p>
              {log.originalExerciseId ? (
                <p className="text-xs text-slate-500">
                  Substitution:{" "}
                  {exerciseById(log.originalExerciseId)?.name ??
                    log.originalExerciseId}{" "}
                  →{" "}
                  {exerciseById(log.substitutedExerciseId ?? "")?.name ??
                    log.substitutedExerciseId}
                </p>
              ) : null}
              {log.notes ? (
                <p className="mt-1 text-xs text-slate-500">{log.notes}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
