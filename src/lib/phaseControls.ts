import type { PhaseAdvanceGateResult } from "@/lib/phaseGating";

export type PhaseControlUiState = {
  showSkipPhaseOne: boolean;
  canMoveNextPhase: boolean;
  canUploadPhotos: boolean;
};

export const getPhaseControlUiState = (params: {
  phaseIndex: number;
  gate: PhaseAdvanceGateResult;
}): PhaseControlUiState => {
  const { phaseIndex, gate } = params;
  const showSkipPhaseOne = phaseIndex === 1;
  const canMoveNextPhase = gate.ok;
  const canUploadPhotos = phaseIndex > 1 || gate.ok;
  return {
    showSkipPhaseOne,
    canMoveNextPhase,
    canUploadPhotos,
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

