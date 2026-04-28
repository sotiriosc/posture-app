import type { AppState } from "@/lib/appState";
import type { SessionDraft } from "@/lib/sessionDraftStore";

export const shouldShowContinueCTA = (
  state: AppState | null,
  draft: SessionDraft | null
) => {
  if (!state?.activeProgramId) return false;
  if (!draft) return false;
  if (draft.programId !== state.activeProgramId) return false;
  if (
    typeof state.programVersion === "number" &&
    typeof draft.programVersion === "number" &&
    state.programVersion !== draft.programVersion
  ) {
    return false;
  }
  if (
    typeof state.activePhaseIndex === "number" &&
    typeof draft.phaseIndex === "number" &&
    state.activePhaseIndex !== draft.phaseIndex
  ) {
    return false;
  }
  if (
    typeof state.activeCycleIndex === "number" &&
    typeof draft.cycleIndex === "number" &&
    state.activeCycleIndex !== draft.cycleIndex
  ) {
    return false;
  }
  return true;
};
