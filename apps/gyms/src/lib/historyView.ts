import type { ExerciseLog } from "@/lib/types";

const safeNumber = (value: number | null | undefined) =>
  value === null || value === undefined || Number.isNaN(value) ? null : value;

const labelWithSign = (diff: number) => (diff >= 0 ? `+${diff}` : `${diff}`);

export const repsPerSet = (log: ExerciseLog) => {
  if (log.repsBySet?.length) {
    const [first, ...rest] = log.repsBySet;
    if (rest.every((value) => value === first)) return first;
    return null;
  }
  return safeNumber(log.reps);
};

const totalReps = (log: ExerciseLog) => {
  if (log.repsBySet?.length) {
    return log.repsBySet.reduce((sum, value) => sum + value, 0);
  }
  return safeNumber(log.reps);
};

const setsValue = (log: ExerciseLog) =>
  safeNumber(log.setsCompleted) ?? safeNumber(log.setsPlanned);

const loadLabel = (log: ExerciseLog) => {
  if (log.loadType === "weighted") {
    const weight = safeNumber(log.weight);
    if (weight === null) return "bodyweight";
    return `${weight}${log.unit ?? ""}`;
  }
  if (log.loadType === "assisted") return "assisted";
  if (log.loadType === "timed") return "timed";
  return "bodyweight";
};

const repsSetsLabel = (log: ExerciseLog) => {
  const reps = repsPerSet(log) ?? totalReps(log);
  const sets = setsValue(log);
  if (reps !== null && sets !== null) return `${reps} reps x ${sets} sets`;
  if (reps !== null) return `${reps} reps`;
  if (sets !== null) return `${sets} sets`;
  return "--";
};

const timerLabel = (log: ExerciseLog) => {
  const work = safeNumber(log.workSecondsUsed) ?? safeNumber(log.durationSec);
  const rest = safeNumber(log.restSecondsUsed);
  if (work === null && rest === null) return "--";
  if (work !== null && rest !== null) return `${work}s/${rest}s`;
  if (work !== null) return `${work}s`;
  return `--/${rest}s`;
};

const feedbackLabel = (log: ExerciseLog) => {
  if (!log.felt) return "--";
  const base =
    log.felt === "moderate"
      ? "moderate"
      : log.felt === "pain"
      ? "pain"
      : log.felt;
  if (base !== "pain" || !log.painLocation) return base;
  return `${base} (${log.painLocation})`;
};

export const formatHistorySchemaRow = (log: ExerciseLog | null) => {
  if (!log) return "-- • -- • -- • -- • --";
  const date = (log.createdAt ?? "").slice(0, 10) || "--";
  return [
    date,
    loadLabel(log),
    repsSetsLabel(log),
    timerLabel(log),
    feedbackLabel(log),
  ].join(" • ");
};

export const getHistoryDeltaPills = (
  last: ExerciseLog | null,
  prev: ExerciseLog | null
) => {
  if (!last || !prev) return [] as string[];
  const deltas: string[] = [];

  if (last.loadType === "weighted") {
    const lastWeight = safeNumber(last.weight);
    const prevWeight = safeNumber(prev.weight);
    if (lastWeight !== null && prevWeight !== null) {
      const diff = Number((lastWeight - prevWeight).toFixed(2));
      if (diff !== 0) {
        deltas.push(`${labelWithSign(diff)} ${last.unit ?? ""} wt`);
      }
    }
  }

  const lastPerSet = repsPerSet(last);
  const prevPerSet = repsPerSet(prev);
  if (lastPerSet !== null && prevPerSet !== null) {
    const diff = lastPerSet - prevPerSet;
    if (diff !== 0) {
      deltas.push(`${labelWithSign(diff)} reps`);
    }
  }

  const lastDuration = safeNumber(last.workSecondsUsed) ?? safeNumber(last.durationSec);
  const prevDuration = safeNumber(prev.workSecondsUsed) ?? safeNumber(prev.durationSec);
  if (lastDuration !== null && prevDuration !== null && last.loadType === "timed") {
    const diff = lastDuration - prevDuration;
    if (diff !== 0) {
      deltas.push(`${labelWithSign(diff)}s work`);
    }
  }

  return deltas;
};
