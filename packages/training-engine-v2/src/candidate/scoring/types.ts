import type { ExerciseDefinition } from "../../domain/exercise";
import type { CandidateRequest } from "../request";
import type { ScoreComponent } from "../../scoringContracts";

export interface ScoreComponentInput {
  readonly request: CandidateRequest;
  readonly exercise: ExerciseDefinition;
}

export interface CandidateScoreComponent {
  readonly id: string;
  score(input: ScoreComponentInput): ScoreComponent;
}
