import type { RankedCandidate } from "../candidate";
import type { SessionNeed } from "../domain/session";

export interface WorkingCoverage {
  readonly need: SessionNeed;
  readonly candidate: RankedCandidate;
  readonly requestId: string;
  readonly bestExecutableFallbackExerciseId: string | null;
}

export interface WorkingAssignment {
  readonly exerciseId: string;
  readonly section: SessionNeed["section"];
  readonly role: SessionNeed["selection"]["requestedRole"];
  readonly coverage: readonly WorkingCoverage[];
}

export interface WorkingState {
  readonly assignments: readonly WorkingAssignment[];
  readonly omittedNeedIds: readonly string[];
}
