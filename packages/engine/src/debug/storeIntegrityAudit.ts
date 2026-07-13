import { loadAppState } from "@/lib/appState";

type InvariantResult = {
  ok: boolean;
  detail?: string;
};

export type StoreIntegrityReport = {
  ok: boolean;
  summary: {
    hasQuestionnaire: boolean;
    hasPhotos: boolean;
    programCount: number;
    sessionCount: number;
    logCount: number;
    activeProgramId: string | null;
  };
  invariants: Record<string, InvariantResult>;
  errors: string[];
  warnings: string[];
  snapshot: Record<string, unknown>;
};

const isBrowser = () =>
  typeof window !== "undefined" &&
  typeof indexedDB !== "undefined" &&
  typeof localStorage !== "undefined";

const parseJson = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const countStoreRecords = (
  dbName: string,
  storeName: string
): Promise<number> =>
  new Promise((resolve) => {
    try {
      const openReq = indexedDB.open(dbName);
      openReq.onerror = () => resolve(0);
      openReq.onupgradeneeded = () => resolve(0);
      openReq.onsuccess = () => {
        const db = openReq.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.close();
          resolve(0);
          return;
        }
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const countReq = store.count();
        countReq.onerror = () => {
          db.close();
          resolve(0);
        };
        countReq.onsuccess = () => {
          const count = Number(countReq.result ?? 0);
          db.close();
          resolve(Number.isFinite(count) ? count : 0);
        };
      };
    } catch {
      resolve(0);
    }
  });

export const auditStoreIntegrity = async (): Promise<StoreIntegrityReport> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isBrowser()) {
    warnings.push("Store integrity audit is running in non-browser context; storage is unavailable.");
    return {
      ok: true,
      summary: {
        hasQuestionnaire: false,
        hasPhotos: false,
        programCount: 0,
        sessionCount: 0,
        logCount: 0,
        activeProgramId: null,
      },
      invariants: {
        storageAvailable: { ok: true, detail: "non-browser context" },
        activeProgramBaselineAligned: { ok: true, detail: "not evaluated" },
        activeProgramExistsWhenSet: { ok: true, detail: "not evaluated" },
      },
      errors,
      warnings,
      snapshot: {
        environment: "server",
      },
    };
  }

  const questionnaire = parseJson<Record<string, unknown>>(
    localStorage.getItem("posture_questionnaire")
  );
  const photoMeta = parseJson<Record<string, unknown>>(
    localStorage.getItem("posture_photo_meta")
  );
  const appState = loadAppState();

  const [programCount, sessionCount, logCount] = await Promise.all([
    countStoreRecords("bodycoach-logs", "programs"),
    countStoreRecords("bodycoach-logs", "sessions"),
    countStoreRecords("bodycoach-logs", "exercise_logs"),
  ]);

  const activeProgramId = appState?.activeProgramId ?? null;
  const activeProgramBaselineAt = appState?.activeProgramBaselineAt ?? null;

  const invariants: Record<string, InvariantResult> = {
    storageAvailable: { ok: true },
    activeProgramBaselineAligned: {
      ok: !activeProgramId || typeof activeProgramBaselineAt === "number",
      detail:
        activeProgramId && typeof activeProgramBaselineAt !== "number"
          ? "activeProgramId is set but activeProgramBaselineAt is missing"
          : undefined,
    },
    activeProgramExistsWhenSet: {
      ok: !activeProgramId || programCount > 0,
      detail:
        activeProgramId && programCount === 0
          ? "activeProgramId present but no programs found in IndexedDB"
          : undefined,
    },
    questionnaireShape: {
      ok:
        !questionnaire ||
        (typeof questionnaire.experience === "string" &&
          typeof questionnaire.goals === "string"),
      detail:
        questionnaire &&
        !(typeof questionnaire.experience === "string" && typeof questionnaire.goals === "string")
          ? "questionnaire exists but is missing expected keys"
          : undefined,
    },
  };

  Object.entries(invariants).forEach(([name, invariant]) => {
    if (!invariant.ok) {
      errors.push(`${name}: ${invariant.detail ?? "failed"}`);
    }
  });

  const summary = {
    hasQuestionnaire: Boolean(questionnaire),
    hasPhotos: Boolean(photoMeta),
    programCount,
    sessionCount,
    logCount,
    activeProgramId,
  };

  return {
    ok: errors.length === 0,
    summary,
    invariants,
    errors,
    warnings,
    snapshot: {
      appState,
      questionnaire,
      photoMeta,
      counts: {
        programCount,
        sessionCount,
        logCount,
      },
    },
  };
};

