"use client";

import { useState } from "react";
import {
  BUYER_DEMO_COOKIE,
  BUYER_DEMO_COOKIE_MAX_AGE_SECONDS,
  BUYER_DEMO_INDEXED_DB_NAMES,
  BUYER_DEMO_LOCAL_STORAGE_KEYS,
  BUYER_DEMO_QUERY_PARAM,
  BUYER_DEMO_QUERY_VALUE,
} from "@/lib/gymSaas/demoMode";

const deleteDatabase = (name: string) =>
  new Promise<void>((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve();
      return;
    }
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });

export default function DemoStartClient() {
  const [starting, setStarting] = useState(false);

  const startDemo = async () => {
    setStarting(true);
    document.cookie = `${BUYER_DEMO_COOKIE}=${BUYER_DEMO_QUERY_VALUE}; Max-Age=${BUYER_DEMO_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;

    BUYER_DEMO_LOCAL_STORAGE_KEYS.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    await Promise.all(
      BUYER_DEMO_INDEXED_DB_NAMES.map((name) => deleteDatabase(name))
    );

    window.location.href = `/assessment?${BUYER_DEMO_QUERY_PARAM}=${BUYER_DEMO_QUERY_VALUE}`;
  };

  return (
    <aside className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_18px_55px_rgba(31,42,51,0.06)]">
      <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
        Demo setup
      </span>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#1F2A33]">
        Reset this browser for the buyer walkthrough.
      </h2>
      <p className="mt-4 text-sm leading-7 text-[#5F6B75]">
        This only removes the known Praxis demo data used by the member flow. It
        does not connect to billing, accounts, admin tools, or live storage.
      </p>
      <button
        type="button"
        onClick={startDemo}
        disabled={starting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.28)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
      >
        {starting ? "Preparing demo..." : "Start fresh member demo"}
      </button>
    </aside>
  );
}
