import type {
  ExerciseLog,
  LogPrefs,
  PainLevel,
  Program,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";
import { resolveExerciseHistoryIds } from "@/lib/exercises";
import {
  loadTrainingSnapshotWithStatus,
  pushTrainingPatch,
  type TrainingSnapshot,
} from "@/lib/trainingSyncClient";
import {
  areTrainingRecordsEquivalent,
  shouldUseRemoteTrainingRecord,
} from "@/lib/trainingStateModel";
import { logTrainingSync } from "@/lib/trainingSyncDebug";

const DB_NAME = "bodycoach-logs";
const DB_VERSION = 2;
const SCHEMA_VERSION = 2;

const STORE_SESSIONS = "sessions";
const STORE_LOGS = "exercise_logs";
const STORE_PREFS = "prefs";
const STORE_PROGRAMS = "programs";
const STORE_PROGRESS = "program_progress";

const LEGACY_LOGS_KEY = "exercise_logs";
const LEGACY_SESSIONS_KEY = "bodycoach_sessions";
const LEGACY_PREFS_KEY = "timer_prefs";
const LEGACY_FEEDBACK_KEY = "session_feedback";

let dbPromise: Promise<IDBDatabase> | null = null;
let serverHydrationPromise: Promise<void> | null = null;
let lastServerHydratedAt = 0;
const SERVER_HYDRATION_TTL_MS = 12_000;

export type ExerciseFeedbackSummary = {
  exerciseId: string;
  pain: "none" | "mild" | "moderate" | "severe";
  difficulty: "easy" | "normal" | "hard" | "failed";
  completionRate: number;
};

const painRank: Record<ExerciseFeedbackSummary["pain"], number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
};

const difficultyRank: Record<ExerciseFeedbackSummary["difficulty"], number> = {
  easy: 0,
  normal: 1,
  hard: 2,
  failed: 3,
};

const clampRate = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
};

const completionRateFromLog = (log: ExerciseLog) => {
  const planned = log.setsPlanned ?? 0;
  const completed = log.setsCompleted ?? 0;
  if (planned > 0) return clampRate(completed / planned);
  if (completed > 0) return 1;
  return 0;
};

const painFromLog = (log: ExerciseLog): ExerciseFeedbackSummary["pain"] => {
  if (log.painLevel && log.painLevel !== "none") {
    return log.painLevel;
  }
  if (log.felt !== "pain") return "none";
  const completionRate = completionRateFromLog(log);
  const rpe = log.rpe ?? 0;
  if (completionRate <= 0.5 || rpe >= 9) return "severe";
  if (completionRate < 1 || rpe >= 8) return "moderate";
  return "mild";
};

const difficultyFromLog = (
  log: ExerciseLog,
  pain: ExerciseFeedbackSummary["pain"]
): ExerciseFeedbackSummary["difficulty"] => {
  const completionRate = completionRateFromLog(log);
  if (completionRate < 0.6) return "failed";
  if (pain === "severe" || pain === "moderate") return "failed";
  if (log.felt === "hard") return "hard";
  if (log.felt === "easy") return "easy";
  return "normal";
};

export const summarizeExerciseFeedbackFromLogs = (
  logs: ExerciseLog[],
  userId: string
): Map<string, ExerciseFeedbackSummary> => {
  const relevant = logs
    .filter((log) => {
      if (log.deletedAt) return false;
      if (!userId) return true;
      if (userId === "local") return log.userId === null || log.userId === "local";
      return log.userId === userId;
    })
    .sort((left, right) => {
      const updatedOrder = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
      if (updatedOrder !== 0) return updatedOrder;
      const createdOrder = (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
      if (createdOrder !== 0) return createdOrder;
      return left.id.localeCompare(right.id);
    });

  const grouped = new Map<string, ExerciseLog[]>();
  relevant.forEach((log) => {
    const list = grouped.get(log.exerciseId) ?? [];
    if (list.length < 3) {
      list.push(log);
      grouped.set(log.exerciseId, list);
    }
  });

  const summaries = new Map<string, ExerciseFeedbackSummary>();
  Array.from(grouped.keys())
    .sort((left, right) => left.localeCompare(right))
    .forEach((exerciseId) => {
      const recentLogs = grouped.get(exerciseId) ?? [];
      if (!recentLogs.length) return;

      let worstPain: ExerciseFeedbackSummary["pain"] = "none";
      let completionTotal = 0;
      const difficultyCounts = new Map<ExerciseFeedbackSummary["difficulty"], number>();

      recentLogs.forEach((log) => {
        const pain = painFromLog(log);
        if (painRank[pain] > painRank[worstPain]) {
          worstPain = pain;
        }
        const difficulty = difficultyFromLog(log, pain);
        difficultyCounts.set(difficulty, (difficultyCounts.get(difficulty) ?? 0) + 1);
        completionTotal += completionRateFromLog(log);
      });

      const difficulty = Array.from(difficultyCounts.entries()).sort((left, right) => {
        if (right[1] !== left[1]) return right[1] - left[1];
        const rankDelta = difficultyRank[right[0]] - difficultyRank[left[0]];
        if (rankDelta !== 0) return rankDelta;
        return left[0].localeCompare(right[0]);
      })[0]?.[0] ?? "normal";

      summaries.set(exerciseId, {
        exerciseId,
        pain: worstPain,
        difficulty,
        completionRate: clampRate(completionTotal / recentLogs.length),
      });
    });

  return summaries;
};

const openDb = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        db.createObjectStore(STORE_SESSIONS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        const store = db.createObjectStore(STORE_LOGS, { keyPath: "id" });
        store.createIndex("exerciseId", "exerciseId", { unique: false });
        store.createIndex("sessionId", "sessionId", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_PREFS)) {
        db.createObjectStore(STORE_PREFS, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_PROGRAMS)) {
        const store = db.createObjectStore(STORE_PROGRAMS, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
        db.createObjectStore(STORE_PROGRESS, { keyPath: "programId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

const withStore = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => Promise<T>
) => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    handler(store)
      .then((result) => {
        tx.oncomplete = () => resolve(result);
      })
      .catch((error) => reject(error));
    tx.onerror = () => reject(tx.error);
  });
};

const requestToPromise = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const saveTrainingRecordIfChanged = async <T extends object>(
  params: {
    storeName: string;
    key: IDBValidKey;
    record: T;
    label: string;
    toPatch: (record: T) => TrainingSnapshot;
  }
) => {
  const result = await withStore(params.storeName, "readwrite", async (store) => {
    const existing = (await requestToPromise(store.get(params.key))) as
      | T
      | undefined;
    if (
      existing &&
      areTrainingRecordsEquivalent(existing, params.record, {
        ignoreUpdatedAt: true,
      })
    ) {
      return { record: existing, changed: false };
    }
    await requestToPromise(store.put(params.record));
    return { record: params.record, changed: true };
  });

  if (result.changed) {
    void pushTrainingPatch(params.toPatch(result.record));
  } else {
    logTrainingSync("training-local", `skipped unchanged ${params.label}`, {
      key: String(params.key),
    });
  }

  return result.record;
};

const nowIso = () => new Date().toISOString();

const normalizeDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? nowIso() : parsed.toISOString();
};

const uuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `uuid-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const loadPrefsRecord = async (): Promise<LogPrefs | null> => {
  return withStore(STORE_PREFS, "readonly", async (store) => {
    const result = await requestToPromise(store.get("prefs"));
    return result?.value ?? null;
  });
};

const savePrefsRecord = async (prefs: LogPrefs) => {
  return withStore(STORE_PREFS, "readwrite", async (store) => {
    await requestToPromise(store.put({ key: "prefs", value: prefs }));
    return prefs;
  });
};

const migrateFromLocalStorage = async () => {
  const prefs = await loadPrefsRecord();
  if (prefs?.schemaVersion === SCHEMA_VERSION) return;

  const legacySessionsRaw = localStorage.getItem(LEGACY_SESSIONS_KEY);
  const legacyLogsRaw = localStorage.getItem(LEGACY_LOGS_KEY);
  const legacyPrefsRaw = localStorage.getItem(LEGACY_PREFS_KEY);
  const legacyFeedbackRaw = localStorage.getItem(LEGACY_FEEDBACK_KEY);

  const sessions: SessionRecord[] = [];
  const sessionIdByDate = new Map<string, string>();

  if (legacySessionsRaw) {
    const legacySessions = JSON.parse(legacySessionsRaw) as Array<{
      date: string;
      completedExercises: number;
      totalExercises: number;
      estimatedMinutes: number;
    }>;

    legacySessions.forEach((session) => {
      const sessionId = uuid();
      const createdAt = normalizeDate(session.date);
      sessionIdByDate.set(session.date, sessionId);
      sessions.push({
        id: sessionId,
        userId: null,
        startedAt: createdAt,
        completedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
        routineId: null,
        durationSec: session.estimatedMinutes * 60,
        notes: null,
        source: "local",
        deletedAt: null,
      });
    });
  }

  const feedback =
    (legacyFeedbackRaw ? JSON.parse(legacyFeedbackRaw) : {}) as Record<
      string,
      "Easy" | "Good" | "Hard"
    >;

  const mapLegacyFeedback = (value?: "Easy" | "Good" | "Hard") => {
    if (!value) return null;
    if (value === "Good") return "moderate";
    return value.toLowerCase() as "easy" | "hard";
  };

  const logs: ExerciseLog[] = [];
  if (legacyLogsRaw) {
    const legacyLogs = JSON.parse(legacyLogsRaw) as Array<{
      exerciseId: string;
      date: string;
      unit: "lb" | "kg";
      weight: number | null;
      reps: number | null;
      repsBySet: number[] | null;
      setsCompleted: number;
      notes?: string;
      computedVolume?: number;
    }>;

    legacyLogs.forEach((log) => {
      const sessionId = sessionIdByDate.get(log.date) ?? uuid();
      if (!sessionIdByDate.has(log.date)) {
        const createdAt = normalizeDate(log.date);
        sessionIdByDate.set(log.date, sessionId);
        sessions.push({
          id: sessionId,
          userId: null,
          startedAt: createdAt,
          completedAt: createdAt,
          createdAt,
          updatedAt: createdAt,
          routineId: null,
          durationSec: null,
          notes: null,
          source: "local",
          deletedAt: null,
        });
      }

      logs.push({
        id: uuid(),
        userId: null,
        sessionId,
        exerciseId: log.exerciseId,
        createdAt: normalizeDate(log.date),
        updatedAt: normalizeDate(log.date),
        loadType: "bodyweight",
        unit: log.unit ?? null,
        weight: log.weight ?? null,
        reps: log.reps ?? null,
        repsBySet: log.repsBySet ?? null,
        setsPlanned: null,
        setsCompleted: log.setsCompleted ?? null,
        durationSec: null,
        rpe: null,
        felt: mapLegacyFeedback(feedback[log.exerciseId]),
        painLevel: null,
        nextTimeGuidance: null,
        notes: log.notes ?? null,
        computedVolume: log.computedVolume ?? null,
        source: "local",
        deletedAt: null,
      });
    });
  }

  await withStore(STORE_SESSIONS, "readwrite", async (store) => {
    for (const session of sessions) {
      await requestToPromise(store.put(session));
    }
    return true;
  });

  await withStore(STORE_LOGS, "readwrite", async (store) => {
    for (const log of logs) {
      await requestToPromise(store.put(log));
    }
    return true;
  });

  const legacyPrefs = legacyPrefsRaw
    ? (JSON.parse(legacyPrefsRaw) as { workSeconds?: number; restSeconds?: number })
    : undefined;

  await savePrefsRecord({
    schemaVersion: SCHEMA_VERSION,
    timerPrefs: legacyPrefs
      ? {
          workSeconds: legacyPrefs.workSeconds ?? 60,
          restSeconds: legacyPrefs.restSeconds ?? 60,
        }
      : undefined,
    feedbackByExercise: Object.fromEntries(
      Object.entries(feedback)
        .map(([key, value]) => {
          const rating = mapLegacyFeedback(value);
          if (!rating) return null;
          return [
            key,
            {
              rating,
              painLocation: null,
              notes: null,
            },
          ] as const;
        })
        .filter((entry): entry is [string, { rating: "easy" | "moderate" | "hard"; painLocation: null; notes: null }] =>
          Boolean(entry)
        )
    ),
  });

  localStorage.removeItem(LEGACY_LOGS_KEY);
  localStorage.removeItem(LEGACY_SESSIONS_KEY);
  localStorage.removeItem(LEGACY_PREFS_KEY);
  localStorage.removeItem(LEGACY_FEEDBACK_KEY);
};

const hydrateFromServerSnapshot = async (snapshot: TrainingSnapshot | null) => {
  if (!snapshot) return;

  if (snapshot.questionnaire !== undefined && snapshot.questionnaire !== null) {
    const existingQuestionnaire = localStorage.getItem("posture_questionnaire");
    if (!existingQuestionnaire) {
      localStorage.setItem("posture_questionnaire", JSON.stringify(snapshot.questionnaire));
    }
  }

  if (snapshot.prefs) {
    const localPrefs = await loadPrefsRecord();
    if (!localPrefs || localPrefs.schemaVersion !== SCHEMA_VERSION) {
      await savePrefsRecord(snapshot.prefs);
    }
  }

  if (snapshot.programs?.length) {
    await withStore(STORE_PROGRAMS, "readwrite", async (store) => {
      for (const program of snapshot.programs ?? []) {
        const localProgram = await requestToPromise(store.get(program.id));
        if (
          shouldUseRemoteTrainingRecord(
            program,
            localProgram ?? null,
            snapshot.meta?.programUpdatedAtById?.[program.id]
          )
        ) {
          await requestToPromise(store.put(program));
        }
      }
      return true;
    });
  }

  if (snapshot.programProgress?.length) {
    await withStore(STORE_PROGRESS, "readwrite", async (store) => {
      for (const progress of snapshot.programProgress ?? []) {
        const localProgress = await requestToPromise(store.get(progress.programId));
        if (
          shouldUseRemoteTrainingRecord(
            progress,
            localProgress ?? null,
            snapshot.meta?.programProgressUpdatedAtByProgramId?.[progress.programId]
          )
        ) {
          await requestToPromise(store.put(progress));
        }
      }
      return true;
    });
  }

  if (snapshot.sessions?.length) {
    await withStore(STORE_SESSIONS, "readwrite", async (store) => {
      for (const session of snapshot.sessions ?? []) {
        const localSession = await requestToPromise(store.get(session.id));
        if (
          shouldUseRemoteTrainingRecord(
            session,
            localSession ?? null,
            snapshot.meta?.sessionUpdatedAtById?.[session.id]
          )
        ) {
          await requestToPromise(store.put(session));
        }
      }
      return true;
    });
  }

  if (snapshot.exerciseLogs?.length) {
    await withStore(STORE_LOGS, "readwrite", async (store) => {
      for (const log of snapshot.exerciseLogs ?? []) {
        const localLog = await requestToPromise(store.get(log.id));
        if (
          shouldUseRemoteTrainingRecord(
            log,
            localLog ?? null,
            snapshot.meta?.exerciseLogUpdatedAtById?.[log.id]
          )
        ) {
          await requestToPromise(store.put(log));
        }
      }
      return true;
    });
  }
};

const ensureServerHydrated = async () => {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastServerHydratedAt < SERVER_HYDRATION_TTL_MS) return;
  if (serverHydrationPromise) return serverHydrationPromise;
  serverHydrationPromise = (async () => {
    const result = await loadTrainingSnapshotWithStatus();
    if (result.ok) {
      await hydrateFromServerSnapshot(result.snapshot);
      lastServerHydratedAt = Date.now();
    }
  })()
    .catch(() => {})
    .finally(() => {
      serverHydrationPromise = null;
    });
  await serverHydrationPromise;
};

export const init = async () => {
  await openDb();
  await migrateFromLocalStorage();
  await ensureServerHydrated();
};

export const createSession = async (session: SessionRecord) => {
  await init();
  return saveTrainingRecordIfChanged({
    storeName: STORE_SESSIONS,
    key: session.id,
    record: session,
    label: "session",
    toPatch: (saved) => ({ sessions: [saved] }),
  });
};

export const updateSession = async (session: SessionRecord) => {
  await init();
  return saveTrainingRecordIfChanged({
    storeName: STORE_SESSIONS,
    key: session.id,
    record: session,
    label: "session",
    toPatch: (saved) => ({ sessions: [saved] }),
  });
};

export const listSessions = async (limit = 20) => {
  await init();
  return withStore(STORE_SESSIONS, "readonly", async (store) => {
    const request = store.getAll();
    const items = await requestToPromise(request);
    return items
      .filter((session) => !session.deletedAt)
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
      .slice(0, limit);
  });
};

const parseDayIndexFromNotes = (notes: string | null) => {
  if (!notes) return null;
  const match = notes.match(/dayIndex:(\d+)/);
  return match ? Number(match[1]) : null;
};

export const listSessionsByProgramId = async (programId: string) => {
  const sessions = await listSessions(500);
  return sessions.filter((session) => session.routineId === programId);
};

export const listSessionsByProgramDay = async (
  programId: string,
  dayIndex: number
) => {
  const sessions = await listSessionsByProgramId(programId);
  return sessions.filter(
    (session) => parseDayIndexFromNotes(session.notes) === dayIndex
  );
};

export const listExerciseLogsByProgramDay = async (
  programId: string,
  dayIndex: number
) => {
  const sessions = await listSessionsByProgramDay(programId, dayIndex);
  const logsBySession = await Promise.all(
    sessions.map((session) => listExerciseLogsBySession(session.id))
  );
  return logsBySession.flat();
};

export const saveProgram = async (program: Program) => {
  await init();
  return saveTrainingRecordIfChanged({
    storeName: STORE_PROGRAMS,
    key: program.id,
    record: program,
    label: "program",
    toPatch: (saved) => ({ programs: [saved] }),
  });
};

export const getLatestProgram = async () => {
  await init();
  return withStore(STORE_PROGRAMS, "readonly", async (store) => {
    const request = store.getAll();
    const items = await requestToPromise(request);
    const programs = items
      .filter((program) => !program.deletedAt)
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    return programs[0] ?? null;
  });
};

export const getProgram = async (id: string) => {
  await init();
  return withStore(STORE_PROGRAMS, "readonly", async (store) => {
    const request = store.get(id);
    const item = await requestToPromise(request);
    return item ?? null;
  });
};

export const listAllPrograms = async () => {
  await init();
  return withStore(STORE_PROGRAMS, "readonly", async (store) => {
    const request = store.getAll();
    const items = await requestToPromise(request);
    return items
      .filter((program) => !program.deletedAt)
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  });
};

export const saveProgramProgress = async (progress: ProgramProgress) => {
  await init();
  return saveTrainingRecordIfChanged({
    storeName: STORE_PROGRESS,
    key: progress.programId,
    record: progress,
    label: "program progress",
    toPatch: (saved) => ({ programProgress: [saved] }),
  });
};

export const getProgramProgress = async (programId: string) => {
  await init();
  return withStore(STORE_PROGRESS, "readonly", async (store) => {
    const request = store.get(programId);
    const item = await requestToPromise(request);
    return item ?? null;
  });
};

export const saveExerciseLog = async (log: ExerciseLog) => {
  await init();
  return saveTrainingRecordIfChanged({
    storeName: STORE_LOGS,
    key: log.id,
    record: log,
    label: "exercise log",
    toPatch: (saved) => ({ exerciseLogs: [saved] }),
  });
};

export const saveExerciseSwapEvent = async (params: {
  sessionId: string;
  originalExerciseId: string;
  swappedExerciseId?: string | null;
  painLevel: PainLevel;
  programId?: string | null;
  dayIndex?: number | null;
  loadType?: ExerciseLog["loadType"];
  painLocation?: ExerciseLog["painLocation"];
  notes?: string | null;
  userId?: string | null;
  timestamp?: string;
}) => {
  const {
    sessionId,
    originalExerciseId,
    swappedExerciseId = null,
    painLevel,
    programId = null,
    dayIndex = null,
    loadType = "bodyweight",
    painLocation = null,
    notes = null,
    userId = null,
    timestamp,
  } = params;

  const createdAt = timestamp ?? nowIso();
  const felt: ExerciseLog["felt"] =
    painLevel === "none"
      ? "easy"
      : painLevel === "mild"
      ? "moderate"
      : "pain";
  const log: ExerciseLog = {
    id: uuid(),
    userId,
    sessionId,
    exerciseId: originalExerciseId,
    originalExerciseId,
    substitutedExerciseId:
      swappedExerciseId && swappedExerciseId !== originalExerciseId
        ? swappedExerciseId
        : null,
    programId,
    dayIndex,
    createdAt,
    updatedAt: createdAt,
    loadType,
    unit: null,
    weight: null,
    reps: null,
    repsBySet: null,
    setsPlanned: null,
    setsCompleted: null,
    durationSec: null,
    workSecondsUsed: null,
    restSecondsUsed: null,
    rpe: null,
    felt,
    painLevel,
    painLocation,
    nextTimeGuidance: null,
    feedbackNotes:
      swappedExerciseId && swappedExerciseId !== originalExerciseId
        ? "pain-trigger swap event"
        : "pain report event",
    notes,
    computedVolume: null,
    source: "local",
    deletedAt: null,
  };

  return saveExerciseLog(log);
};

export const listExerciseLogsByExercise = async (
  exerciseId: string,
  limit = 10
) => {
  await init();
  return withStore(STORE_LOGS, "readonly", async (store) => {
    const index = store.index("exerciseId");
    const request = index.getAll(exerciseId);
    const items = await requestToPromise(request);
    return items
      .filter((log) => !log.deletedAt)
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
      .slice(0, limit);
  });
};

export const listExerciseLogsByExerciseHistory = async (
  exerciseId: string,
  limit = 10,
  maxHops = 0
) => {
  const historyIds = new Set(resolveExerciseHistoryIds(exerciseId, maxHops));
  if (!historyIds.size) {
    return listExerciseLogsByExercise(exerciseId, limit);
  }

  const allLogs = await listAllExerciseLogs();
  const filtered = allLogs.filter((log) => {
    if (historyIds.has(log.exerciseId)) return true;
    if (log.originalExerciseId && historyIds.has(log.originalExerciseId)) return true;
    if (log.substitutedExerciseId && historyIds.has(log.substitutedExerciseId))
      return true;
    return false;
  });

  return filtered
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .slice(0, limit);
};

export const listExerciseLogsBySession = async (sessionId: string) => {
  await init();
  return withStore(STORE_LOGS, "readonly", async (store) => {
    const index = store.index("sessionId");
    const request = index.getAll(sessionId);
    const items = await requestToPromise(request);
    return items.filter((log) => !log.deletedAt);
  });
};

export const listExerciseLogsBySessionIds = async (sessionIds: string[]) => {
  if (!sessionIds.length) return [];
  const logsBySession = await Promise.all(
    sessionIds.map((sessionId) => listExerciseLogsBySession(sessionId))
  );
  return logsBySession.flat();
};

const compareSessionRecencyDeterministic = (
  left: SessionRecord,
  right: SessionRecord
) => {
  const rightAnchor = right.completedAt ?? right.updatedAt ?? right.createdAt ?? "";
  const leftAnchor = left.completedAt ?? left.updatedAt ?? left.createdAt ?? "";
  const anchorOrder = rightAnchor.localeCompare(leftAnchor);
  if (anchorOrder !== 0) return anchorOrder;
  return left.id.localeCompare(right.id);
};

const compareExerciseLogRecencyDeterministic = (
  left: ExerciseLog,
  right: ExerciseLog
) => {
  const updatedOrder = (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "");
  if (updatedOrder !== 0) return updatedOrder;
  const createdOrder = (right.createdAt ?? "").localeCompare(left.createdAt ?? "");
  if (createdOrder !== 0) return createdOrder;
  return left.id.localeCompare(right.id);
};

export const listRecentExerciseLogsForProgram = async (params: {
  programId: string;
  lookbackDays?: number;
  limit?: number;
  nowIso?: string;
}) => {
  const { programId, lookbackDays = 14, limit = 250, nowIso: nowIsoOverride } = params;
  if (!programId) return [] as ExerciseLog[];

  const boundedLookbackDays = Math.max(7, Math.min(21, Math.round(lookbackDays)));
  const nowMs = Date.parse(nowIsoOverride ?? nowIso());
  const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
  const cutoffMs = safeNowMs - boundedLookbackDays * 24 * 60 * 60 * 1000;

  const sessions = await listSessionsByProgramId(programId);
  const recentSessionIds = sessions
    .filter((session) => !session.deletedAt)
    .filter((session) => {
      const anchor = session.completedAt ?? session.updatedAt ?? session.createdAt;
      if (!anchor) return false;
      const timestamp = Date.parse(anchor);
      if (!Number.isFinite(timestamp)) return false;
      return timestamp >= cutoffMs;
    })
    .sort(compareSessionRecencyDeterministic)
    .map((session) => session.id);

  if (!recentSessionIds.length) return [] as ExerciseLog[];

  const logs = await listExerciseLogsBySessionIds(recentSessionIds);
  return logs
    .filter((log) => !log.deletedAt)
    .sort(compareExerciseLogRecencyDeterministic)
    .slice(0, Math.max(1, limit));
};

export const listAllExerciseLogs = async () => {
  await init();
  return withStore(STORE_LOGS, "readonly", async (store) => {
    const request = store.getAll();
    const items = await requestToPromise(request);
    return items.filter((log) => !log.deletedAt);
  });
};

export const getLatestExerciseLog = async (exerciseId: string) => {
  const items = await listExerciseLogsByExercise(exerciseId, 1);
  return items[0] ?? null;
};

export const summarizeExerciseFeedback = async (userId: string) => {
  const logs = await listAllExerciseLogs();
  return summarizeExerciseFeedbackFromLogs(logs, userId);
};

export const savePrefs = async (prefs: LogPrefs) => {
  await init();
  const saved = await savePrefsRecord(prefs);
  void pushTrainingPatch({ prefs: saved });
  return saved;
};

export const loadPrefs = async () => {
  await init();
  return (await loadPrefsRecord()) ?? { schemaVersion: SCHEMA_VERSION };
};

export { uuid, nowIso, SCHEMA_VERSION };
