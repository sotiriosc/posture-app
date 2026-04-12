import type { AppState } from "@/lib/appState";
import type {
  ExerciseLog,
  LogPrefs,
  Program,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";

export type TrainingSnapshotMeta = {
  stateUpdatedAt?: string | null;
  programUpdatedAtById?: Record<string, string>;
  programProgressUpdatedAtByProgramId?: Record<string, string>;
  sessionUpdatedAtById?: Record<string, string>;
  exerciseLogUpdatedAtById?: Record<string, string>;
};

export type TrainingSnapshot = {
  questionnaire?: Record<string, unknown> | null;
  assessment?: Record<string, unknown> | null;
  prefs?: LogPrefs | null;
  programs?: Program[];
  programProgress?: ProgramProgress[];
  sessions?: SessionRecord[];
  exerciseLogs?: ExerciseLog[];
  meta?: TrainingSnapshotMeta;
};

export type TimestampedTrainingRecord = {
  id?: string;
  updatedAt?: string | null;
  createdAt?: string | null;
  deletedAt?: string | null;
};

const parseTime = (value?: string | null) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getTrainingRecordUpdatedMs = (
  record: TimestampedTrainingRecord | null | undefined,
  serverUpdatedAt?: string | null
) =>
  Math.max(
    parseTime(record?.updatedAt),
    parseTime(record?.createdAt),
    parseTime(serverUpdatedAt)
  );

export const shouldUseRemoteTrainingRecord = <T extends TimestampedTrainingRecord>(
  remote: T,
  local: T | null | undefined,
  serverUpdatedAt?: string | null
) => {
  if (!local) return true;
  const remoteMs = getTrainingRecordUpdatedMs(remote, serverUpdatedAt);
  const localMs = getTrainingRecordUpdatedMs(local);
  if (remoteMs <= 0) return false;
  if (localMs <= 0) return true;
  if (remote.deletedAt && remoteMs >= localMs) return true;
  return remoteMs > localMs;
};

export type ActiveProgramResolution = {
  program: Program | null;
  programId: string | null;
  source: "active" | "legacy" | "latest" | "none";
  staleActiveProgramId: string | null;
};

export const resolveActiveProgramFromList = (
  programs: Program[],
  appState: AppState | null | undefined
): ActiveProgramResolution => {
  const availablePrograms = programs.filter((program) => !program.deletedAt);
  const byId = new Map(availablePrograms.map((program) => [program.id, program]));
  const activeProgramId = appState?.activeProgramId ?? null;
  if (activeProgramId) {
    const active = byId.get(activeProgramId);
    if (active) {
      return {
        program: active,
        programId: active.id,
        source: "active",
        staleActiveProgramId: null,
      };
    }
  }

  const legacyProgramId =
    appState?.programId && appState.programId !== activeProgramId
      ? appState.programId
      : null;
  if (legacyProgramId) {
    const legacy = byId.get(legacyProgramId);
    if (legacy) {
      return {
        program: legacy,
        programId: legacy.id,
        source: "legacy",
        staleActiveProgramId: activeProgramId,
      };
    }
  }

  const latest =
    [...availablePrograms].sort((left, right) => {
      const rightMs = getTrainingRecordUpdatedMs(right);
      const leftMs = getTrainingRecordUpdatedMs(left);
      if (rightMs !== leftMs) return rightMs - leftMs;
      return left.id.localeCompare(right.id);
    })[0] ?? null;

  return {
    program: latest,
    programId: latest?.id ?? null,
    source: latest ? "latest" : "none",
    staleActiveProgramId: activeProgramId,
  };
};
