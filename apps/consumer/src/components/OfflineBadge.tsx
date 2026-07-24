"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Phase 6f, Commit 2 — subtle, informational-only offline indicator.
 *
 * Deliberately not alarming: training already works fully offline (sessions
 * read/write local IndexedDB regardless of connectivity, and writes queue
 * for background sync — see trainingSyncClient.ts's offline queue), so this
 * badge exists only to explain why e.g. a "synced" indicator elsewhere might
 * be stale, not to warn the user anything is broken.
 */
export default function OfflineBadge() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      data-testid="offline-badge"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)]"
    >
      <span className="pointer-events-none rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-slate-200 shadow ring-1 ring-white/10">
        Offline — your progress is saved on this device
      </span>
    </div>
  );
}
