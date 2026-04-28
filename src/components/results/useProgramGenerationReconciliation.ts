"use client";

import { useCallback, useRef, useState } from "react";

export function useProgramGenerationReconciliation() {
  const [initialProgramLoadPending, setInitialProgramLoadPending] = useState(false);
  const [reconcileProgramPending, setReconcileProgramPending] = useState(false);
  const [settledProgramId, setSettledProgramId] = useState<string | null>(null);
  const initialProgramLoadInFlightRef = useRef(false);
  const initialProgramLoadSignatureRef = useRef<string | null>(null);
  const programGenerationRequestTokenRef = useRef(0);

  const beginProgramGenerationRequest = useCallback(() => {
    programGenerationRequestTokenRef.current += 1;
    setSettledProgramId(null);
    return programGenerationRequestTokenRef.current;
  }, []);

  const isLatestProgramGenerationRequest = useCallback(
    (requestToken: number) =>
      requestToken === programGenerationRequestTokenRef.current,
    []
  );

  const markProgramSettled = useCallback((programId: string) => {
    setSettledProgramId(programId);
  }, []);

  return {
    initialProgramLoadPending,
    setInitialProgramLoadPending,
    reconcileProgramPending,
    setReconcileProgramPending,
    settledProgramId,
    initialProgramLoadInFlightRef,
    initialProgramLoadSignatureRef,
    beginProgramGenerationRequest,
    isLatestProgramGenerationRequest,
    markProgramSettled,
  };
}
