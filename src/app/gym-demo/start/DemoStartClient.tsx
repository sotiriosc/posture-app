"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BUYER_DEMO_COOKIE,
  BUYER_DEMO_COOKIE_MAX_AGE_SECONDS,
  BUYER_DEMO_INDEXED_DB_NAMES,
  BUYER_DEMO_LOCAL_STORAGE_KEYS,
  BUYER_DEMO_QUERY_PARAM,
  BUYER_DEMO_QUERY_VALUE,
  BUYER_DEMO_RUN_QUERY_PARAM,
} from "@/lib/gymSaas/demoMode";

type DemoStartClientProps = {
  autoStart?: boolean;
};

type DemoDatabaseSpec = {
  name: string;
  version: number;
  stores: string[];
  ensureSchema: (db: IDBDatabase) => void;
};

const INDEXED_DB_CLEAR_TIMEOUT_MS = 900;

const warnInDevelopment = (message: string, error?: unknown) => {
  if (process.env.NODE_ENV !== "development") return;
  console.warn(message, error);
};

const createStoreIfMissing = (
  db: IDBDatabase,
  storeName: string,
  options?: IDBObjectStoreParameters
) => {
  if (db.objectStoreNames.contains(storeName)) return null;
  return db.createObjectStore(storeName, options);
};

const demoDatabaseSpecs: DemoDatabaseSpec[] = [
  {
    name: "bodycoach-logs",
    version: 2,
    stores: [
      "sessions",
      "exercise_logs",
      "prefs",
      "programs",
      "program_progress",
    ],
    ensureSchema: (db) => {
      createStoreIfMissing(db, "sessions", { keyPath: "id" });
      const logs = createStoreIfMissing(db, "exercise_logs", { keyPath: "id" });
      if (logs) {
        logs.createIndex("exerciseId", "exerciseId", { unique: false });
        logs.createIndex("sessionId", "sessionId", { unique: false });
        logs.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      createStoreIfMissing(db, "prefs", { keyPath: "key" });
      const programs = createStoreIfMissing(db, "programs", { keyPath: "id" });
      if (programs) {
        programs.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      createStoreIfMissing(db, "program_progress", { keyPath: "programId" });
    },
  },
  {
    name: "bodycoach-drafts",
    version: 1,
    stores: ["session_draft_v1"],
    ensureSchema: (db) => {
      const drafts = createStoreIfMissing(db, "session_draft_v1", {
        keyPath: "sessionId",
      });
      if (drafts) {
        drafts.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    },
  },
  {
    name: "bodycoach-photos",
    version: 1,
    stores: ["photos"],
    ensureSchema: (db) => {
      createStoreIfMissing(db, "photos", { keyPath: "slot" });
    },
  },
];

const demoDatabaseNameSet = new Set<string>(BUYER_DEMO_INDEXED_DB_NAMES);

const clearDatabaseStores = (spec: DemoDatabaseSpec) =>
  new Promise<void>((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve();
      return;
    }

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve();
    };
    const timeoutId = window.setTimeout(() => {
      warnInDevelopment(`[buyer-demo] IndexedDB clear timed out: ${spec.name}`);
      settle();
    }, INDEXED_DB_CLEAR_TIMEOUT_MS);

    try {
      const request = indexedDB.open(spec.name, spec.version);
      request.onupgradeneeded = () => {
        spec.ensureSchema(request.result);
      };
      request.onsuccess = () => {
        const db = request.result;
        const stores = spec.stores.filter((storeName) =>
          db.objectStoreNames.contains(storeName)
        );
        if (!stores.length) {
          db.close();
          settle();
          return;
        }

        const transaction = db.transaction(stores, "readwrite");
        stores.forEach((storeName) => {
          transaction.objectStore(storeName).clear();
        });
        transaction.oncomplete = () => {
          db.close();
          settle();
        };
        transaction.onerror = () => {
          warnInDevelopment(
            `[buyer-demo] IndexedDB clear transaction failed: ${spec.name}`,
            transaction.error
          );
          db.close();
          settle();
        };
        transaction.onabort = () => {
          warnInDevelopment(
            `[buyer-demo] IndexedDB clear transaction aborted: ${spec.name}`,
            transaction.error
          );
          db.close();
          settle();
        };
      };
      request.onerror = () => {
        warnInDevelopment(
          `[buyer-demo] IndexedDB open failed: ${spec.name}`,
          request.error
        );
        settle();
      };
      request.onblocked = () => {
        warnInDevelopment(`[buyer-demo] IndexedDB open blocked: ${spec.name}`);
        settle();
      };
    } catch (error) {
      warnInDevelopment(`[buyer-demo] IndexedDB clear threw: ${spec.name}`, error);
      settle();
    }
  });

const buildAssessmentDemoUrl = () => {
  const params = new URLSearchParams({
    [BUYER_DEMO_QUERY_PARAM]: BUYER_DEMO_QUERY_VALUE,
    [BUYER_DEMO_RUN_QUERY_PARAM]: String(Date.now()),
  });
  return `/assessment?${params.toString()}`;
};

export default function DemoStartClient({
  autoStart = false,
}: DemoStartClientProps) {
  const [starting, setStarting] = useState(autoStart);
  const startAttemptedRef = useRef(false);

  const startDemo = useCallback(async () => {
    if (startAttemptedRef.current) return;
    startAttemptedRef.current = true;
    setStarting(true);

    try {
      document.cookie = `${BUYER_DEMO_COOKIE}=${BUYER_DEMO_QUERY_VALUE}; Max-Age=${BUYER_DEMO_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;

      BUYER_DEMO_LOCAL_STORAGE_KEYS.forEach((key) => {
        try {
          window.localStorage.removeItem(key);
        } catch (error) {
          warnInDevelopment(
            `[buyer-demo] localStorage removal failed: ${key}`,
            error
          );
        }
      });

      await Promise.all(
        demoDatabaseSpecs
          .filter((spec) => demoDatabaseNameSet.has(spec.name))
          .map((spec) => clearDatabaseStores(spec))
      );
    } finally {
      window.location.assign(buildAssessmentDemoUrl());
    }
  }, []);

  useEffect(() => {
    if (!autoStart) return;
    const timer = window.setTimeout(() => {
      void startDemo();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoStart, startDemo]);

  return (
    <aside className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_18px_55px_rgba(31,42,51,0.06)]">
      <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
        Demo setup
      </span>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#1F2A33]">
        {starting
          ? "Preparing fresh member demo..."
          : "Reset this browser for the buyer walkthrough."}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[#5F6B75]">
        {starting
          ? "Clearing demo state, refreshing buyer access, and launching the live member assessment."
          : "This only removes the known Praxis demo data used by the member flow. It does not connect to billing, accounts, admin tools, or live storage."}
      </p>
      <button
        type="button"
        onClick={() => {
          void startDemo();
        }}
        disabled={starting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.28)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
      >
        {starting ? "Preparing fresh member demo..." : "Start fresh member demo"}
      </button>
    </aside>
  );
}
