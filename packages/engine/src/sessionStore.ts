export type SessionCompletePayload = {
  sessionId: string;
  programId: string | null;
  dayIndex: number | null;
  completedAt: string;
};

export const SESSION_COMPLETE_EVENT = "session:completed";

export const markSessionComplete = (payload: SessionCompletePayload) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("session_last_completed_at", payload.completedAt);
  window.dispatchEvent(new CustomEvent(SESSION_COMPLETE_EVENT, { detail: payload }));
};
