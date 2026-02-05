import type {
  ExerciseLog,
  LogPrefs,
  Program,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";

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
        felt: feedback[log.exerciseId]?.toLowerCase() as
          | "easy"
          | "good"
          | "hard"
          | null,
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
      Object.entries(feedback).map(([key, value]) => [
        key,
        value.toLowerCase() as "easy" | "good" | "hard",
      ])
    ),
  });

  localStorage.removeItem(LEGACY_LOGS_KEY);
  localStorage.removeItem(LEGACY_SESSIONS_KEY);
  localStorage.removeItem(LEGACY_PREFS_KEY);
  localStorage.removeItem(LEGACY_FEEDBACK_KEY);
};

export const init = async () => {
  await openDb();
  await migrateFromLocalStorage();
};

export const createSession = async (session: SessionRecord) => {
  await init();
  return withStore(STORE_SESSIONS, "readwrite", async (store) => {
    await requestToPromise(store.put(session));
    return session;
  });
};

export const updateSession = async (session: SessionRecord) => {
  await init();
  return withStore(STORE_SESSIONS, "readwrite", async (store) => {
    await requestToPromise(store.put(session));
    return session;
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
  return withStore(STORE_PROGRAMS, "readwrite", async (store) => {
    await requestToPromise(store.put(program));
    return program;
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
  return withStore(STORE_PROGRESS, "readwrite", async (store) => {
    await requestToPromise(store.put(progress));
    return progress;
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
  return withStore(STORE_LOGS, "readwrite", async (store) => {
    await requestToPromise(store.put(log));
    return log;
  });
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

export const savePrefs = async (prefs: LogPrefs) => {
  await init();
  return savePrefsRecord(prefs);
};

export const loadPrefs = async () => {
  await init();
  return (await loadPrefsRecord()) ?? { schemaVersion: SCHEMA_VERSION };
};

export { uuid, nowIso, SCHEMA_VERSION };
