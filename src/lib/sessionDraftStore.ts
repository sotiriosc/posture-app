export type SessionDraft = {
  sessionId: string;
  programId: string | null;
  dayIndex: number | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  entries: {
    completedSets: Record<string, boolean[]>;
    selectedSets: Record<string, number>;
    weightByExercise: Record<string, string>;
    repsByExercise: Record<string, string>;
    repsBySetByExercise: Record<string, string[]>;
    unitByExercise: Record<string, "lb" | "kg">;
    notesByExercise: Record<string, string>;
    feedbackByExercise: Record<
      string,
      { rating: "easy" | "moderate" | "hard" | "pain"; painLocation?: string | null; notes?: string | null }
    >;
  };
  timerState?: {
    workSeconds: number;
    restSeconds: number;
  } | null;
  startedAt?: string | null;
  updatedAt: string;
};

const DB_NAME = "bodycoach-drafts";
const DB_VERSION = 1;
const STORE_DRAFTS = "session_draft_v1";

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        const store = db.createObjectStore(STORE_DRAFTS, {
          keyPath: "sessionId",
        });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
};

const withStore = async <T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => Promise<T>
) => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_DRAFTS, mode);
    const store = tx.objectStore(STORE_DRAFTS);
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

export const saveDraft = async (draft: SessionDraft) => {
  const updated = { ...draft, updatedAt: new Date().toISOString() };
  await withStore("readwrite", async (store) => {
    await requestToPromise(store.put(updated));
  });
  return updated;
};

export const loadDraft = async (sessionId?: string | null) => {
  return withStore("readonly", async (store) => {
    if (sessionId) {
      const item = await requestToPromise(store.get(sessionId));
      return (item as SessionDraft) ?? null;
    }
    const items = (await requestToPromise(store.getAll())) as SessionDraft[];
    if (!items.length) return null;
    return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  });
};

export const clearDraft = async (sessionId?: string | null) => {
  await withStore("readwrite", async (store) => {
    if (sessionId) {
      await requestToPromise(store.delete(sessionId));
      return;
    }
    await requestToPromise(store.clear());
  });
};
