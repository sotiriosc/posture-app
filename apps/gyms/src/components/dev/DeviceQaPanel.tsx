"use client";

import { useEffect, useMemo, useState } from "react";

type QaChecklistItem = {
  id: string;
  label: string;
  detail: string;
};

const QA_CHECKLIST_ITEMS: QaChecklistItem[] = [
  {
    id: "qa-flow-questionnaire",
    label: "Questionnaire flow",
    detail: "Complete questionnaire and confirm correct 3/4/5 day split output.",
  },
  {
    id: "qa-flow-session",
    label: "Session flow",
    detail: "Run full session, save data, and ensure progress advances to next day.",
  },
  {
    id: "qa-flow-history",
    label: "History correctness",
    detail: "Verify date • load • reps×sets • timer • feedback lines match last log.",
  },
  {
    id: "qa-mobile-touch",
    label: "Mobile touch/swipe",
    detail: "Check day/session history swipes and controls on phone and tablet.",
  },
  {
    id: "qa-resume-draft",
    label: "Resume + autosave",
    detail: "Exit during session and confirm resume draft restores exact state.",
  },
  {
    id: "qa-offline-recovery",
    label: "Offline recovery",
    detail: "Toggle offline/online and confirm data sync state is consistent.",
  },
];

const QA_STORAGE_KEY = "device_qa_checklist_v1";

const loadQaChecklistState = () => {
  if (typeof window === "undefined") return {} as Record<string, boolean>;
  const raw = window.localStorage.getItem(QA_STORAGE_KEY);
  if (!raw) return {} as Record<string, boolean>;
  try {
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveQaChecklistState = (state: Record<string, boolean>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(state));
};

export default function DeviceQaPanel() {
  const [qaChecklist, setQaChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    // Populate from localStorage after mount (empty on the server) so the
    // checkbox state hydrates cleanly. Defer through a promise so state is only
    // set from an async callback, never synchronously within the effect body.
    void Promise.resolve(loadQaChecklistState()).then((stored) => {
      if (active) setQaChecklist(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const diagnostics = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        isTouchCapable: false,
        isStandalone: false,
        serviceWorkerReady: false,
        online: true,
      };
    }
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches || Boolean(nav.standalone);
    return {
      isTouchCapable:
        "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0,
      isStandalone,
      serviceWorkerReady: Boolean(navigator.serviceWorker?.controller),
      online: navigator.onLine,
    };
  }, []);

  const qaProgress = useMemo(() => {
    const completed = QA_CHECKLIST_ITEMS.filter((item) => qaChecklist[item.id]).length;
    return { completed, total: QA_CHECKLIST_ITEMS.length };
  }, [qaChecklist]);

  const toggleQaItem = (id: string) => {
    setQaChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveQaChecklistState(next);
      return next;
    });
  };

  return (
    <div className="ui-card ui-soft-surface-raised rounded-lg p-6">
      <h2 className="text-sm font-semibold text-slate-900">
        Real-device QA pass
      </h2>
      <p className="mt-2 text-xs text-slate-600">
        Track actual device validation before release. Keep this checklist green.
      </p>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
        Completed {qaProgress.completed}/{qaProgress.total}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Diagnostics</p>
          <p className="mt-1">Touch capable: {diagnostics.isTouchCapable ? "Yes" : "No"}</p>
          <p className="mt-1">Standalone mode: {diagnostics.isStandalone ? "Yes" : "No"}</p>
          <p className="mt-1">
            Service worker active: {diagnostics.serviceWorkerReady ? "Yes" : "No"}
          </p>
          <p className="mt-1">Online: {diagnostics.online ? "Yes" : "No"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Recommended run order</p>
          <p className="mt-1">1. Phone (iOS + Android)</p>
          <p className="mt-1">2. Tablet (touch + rotation)</p>
          <p className="mt-1">3. Desktop (Chrome + Safari)</p>
          <p className="mt-1">4. Offline/online interruption test</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {QA_CHECKLIST_ITEMS.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs"
          >
            <input
              type="checkbox"
              checked={Boolean(qaChecklist[item.id])}
              onChange={() => toggleQaItem(item.id)}
              className="mt-0.5 h-4 w-4 accent-slate-900"
            />
            <span>
              <span className="font-semibold text-slate-900">{item.label}</span>
              <span className="mt-0.5 block text-slate-600">{item.detail}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
