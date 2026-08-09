import type { DecisionReason } from "./reasonCodes";

export type EngineComponentCategory =
  | "input_interpretation"
  | "intent_derivation"
  | "eligibility"
  | "scoring"
  | "evaluation"
  | "optimization"
  | "prescription"
  | "progression"
  | "validation";

export type EngineComponentId =
  | "assessment_interpretation"
  | "alignment_priority_derivation"
  | "phase_intent"
  | "weekly_intent"
  | "session_intent"
  | "equipment_eligibility"
  | "pain_eligibility"
  | "capability_eligibility"
  | "role_eligibility"
  | "assessment_scoring"
  | "alignment_scoring"
  | "phase_scoring"
  | "progression_value"
  | "continuity_value"
  | "fatigue_evaluation"
  | "joint_cost_evaluation"
  | "candidate_ranking"
  | "session_evaluation"
  | "week_evaluation"
  | "prescription"
  | "progression"
  | "phase_readiness";

export interface ComponentResult<Output> {
  readonly output: Output;
  readonly reasons: readonly DecisionReason[];
}

export interface EngineComponent<Input, Output> {
  readonly id: EngineComponentId;
  readonly category: EngineComponentCategory;
  readonly description: string;
  evaluate(input: Input): ComponentResult<Output>;
}

export interface ComponentDescriptor {
  readonly id: EngineComponentId;
  readonly category: EngineComponentCategory;
  readonly responsibility: string;
  readonly ownsExerciseScienceRules: boolean;
}

export const FOUNDATION_COMPONENT_BOUNDARIES: readonly ComponentDescriptor[] = [
  {
    id: "assessment_interpretation",
    category: "input_interpretation",
    responsibility: "Convert normalized assessment signals into interpreted constraints and priorities.",
    ownsExerciseScienceRules: true,
  },
  {
    id: "alignment_priority_derivation",
    category: "intent_derivation",
    responsibility: "Derive alignment priorities from assessment findings without using uploaded photos directly.",
    ownsExerciseScienceRules: true,
  },
  {
    id: "equipment_eligibility",
    category: "eligibility",
    responsibility: "Answer whether required equipment and setup capability exist.",
    ownsExerciseScienceRules: false,
  },
  {
    id: "pain_eligibility",
    category: "eligibility",
    responsibility: "Answer whether pain, contraindication, or blocks make a candidate illegal or review-worthy.",
    ownsExerciseScienceRules: true,
  },
  {
    id: "candidate_ranking",
    category: "scoring",
    responsibility: "Future thin orchestrator over modular score components; no ranking behavior in foundation.",
    ownsExerciseScienceRules: false,
  },
  {
    id: "session_evaluation",
    category: "evaluation",
    responsibility: "Evaluate whole-session coherence after candidate combinations exist.",
    ownsExerciseScienceRules: true,
  },
  {
    id: "week_evaluation",
    category: "evaluation",
    responsibility: "Evaluate weekly exposure, recovery spacing, continuity, and phase fit.",
    ownsExerciseScienceRules: true,
  },
  {
    id: "prescription",
    category: "prescription",
    responsibility: "Decide how a selected exercise is performed today.",
    ownsExerciseScienceRules: true,
  },
  {
    id: "progression",
    category: "progression",
    responsibility: "Decide what changes next without assuming exercise replacement.",
    ownsExerciseScienceRules: true,
  },
];
