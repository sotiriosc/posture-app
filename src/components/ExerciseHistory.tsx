"use client";

import { useEffect, useMemo, useState } from "react";
import { exerciseById } from "@/lib/exercises";
import type { ExerciseLog } from "@/lib/types";
import { init, listExerciseLogsByExercise } from "@/lib/logStore";

type Props = {
  exerciseId: string;
};

export default function ExerciseHistory({ exerciseId }: Props) {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);

  useEffect(() => {
    const load = async () => {
      await init();
      const items = await listExerciseLogsByExercise(exerciseId, 10);
      setLogs(items);
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
