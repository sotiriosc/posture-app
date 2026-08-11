import type { ExerciseDefinition } from "../../domain/exercise";
import type { CandidateRequest } from "../request";
import type { ScoreComponent } from "../../scoringContracts";
import type { CandidatePainMatchTrace } from "../pain";

export interface ScoreComponentInput {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
  readonly painMatchTrace?: CandidatePainMatchTrace;
}

export interface CandidateScoreComponent {
  readonly id: string;
  score(input: ScoreComponentInput): ScoreComponent;
}
