"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { syncLocalOwner } from "@/lib/accountIsolation";

type AccountIsolationGateProps = {
  userId: string | null;
  children: ReactNode;
};

/**
 * Phase 6e / 6j — do not mount app children until local owner reconciliation
 * has finished. Prevents freemium/session readers from touching the prior
 * account's IndexedDB mid-wipe (child effects otherwise run before AppMenu's
 * syncLocalOwner effect).
 */
export default function AccountIsolationGate({
  userId,
  children,
}: AccountIsolationGateProps) {
  const [readyFor, setReadyFor] = useState<string | null | undefined>(undefined);

  useLayoutEffect(() => {
    let cancelled = false;
    void syncLocalOwner(userId).finally(() => {
      if (!cancelled) setReadyFor(userId);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (readyFor !== userId) return null;
  return <>{children}</>;
}
