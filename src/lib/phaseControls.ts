import type { PhaseAdvanceGateResult } from "@/lib/phaseGating";
import { MAX_PHASE_INDEX } from "@/lib/phases";

export type PhaseControlUiState = {
  showSkipPhaseOne: boolean;
  canMoveNextPhase: boolean;
  canUploadPhotos: boolean;
};

export type PhaseReadyNoticeState = {
  shouldShow: boolean;
  storageKey: string | null;
  nextPhaseIndex: number | null;
};

export const buildPhaseReadyDismissalKey = (programId: string, phaseIndex: number) =>
  `phase-ready-dismissed:${programId}:phase-${phaseIndex}`;

export const getPhaseControlUiState = (params: {
  phaseIndex: number;
  gate: PhaseAdvanceGateResult;
}): PhaseControlUiState => {
  const { phaseIndex, gate } = params;
  const showSkipPhaseOne = false;
  const canMoveNextPhase = phaseIndex < MAX_PHASE_INDEX && gate.ok;
  const canUploadPhotos = phaseIndex > 1 || gate.ok;
  return {
    showSkipPhaseOne,
    canMoveNextPhase,
    canUploadPhotos,
  };
};

export const getPhaseReadyNoticeState = (params: {
  programId: string | null | undefined;
  phaseIndex: number;
  gate: PhaseAdvanceGateResult;
  previousWorkoutsCompletedInPhase?: number;
  dismissed?: boolean;
}): PhaseReadyNoticeState => {
  const {
    programId,
    phaseIndex,
    gate,
    previousWorkoutsCompletedInPhase = gate.workoutsCompletedInPhase,
    dismissed = false,
  } = params;
  if (!programId || phaseIndex >= MAX_PHASE_INDEX || dismissed || !gate.ok) {
    return { shouldShow: false, storageKey: null, nextPhaseIndex: null };
  }

  const previousWorkouts = Math.max(0, Math.floor(previousWorkoutsCompletedInPhase));
  const previousGateWasSatisfied =
    previousWorkouts >= gate.minWorkouts &&
    gate.daysSincePhaseStart >= gate.minDays;

  return {
    shouldShow: !previousGateWasSatisfied,
    storageKey: buildPhaseReadyDismissalKey(programId, phaseIndex),
    nextPhaseIndex: phaseIndex + 1,
  };
};

export const evaluateSkipPhaseOneAction = (params: {
  currentPhaseIndex: number;
  confirmed: boolean;
}) => {
  const { currentPhaseIndex, confirmed } = params;
  if (currentPhaseIndex !== 1 || !confirmed) {
    return {
      didAdvance: false,
      nextPhaseIndex: currentPhaseIndex,
    };
  }
  return {
    didAdvance: true,
    nextPhaseIndex: 2,
  };
};
