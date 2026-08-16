import { KNOWLEDGE_CORE_CONTRACT, type PraxisExerciseKnowledgeCore } from "./contracts";
import { PACKAGE_R_KNOWLEDGE_ENTRIES } from "./entries";
import { PREPARATION_PRESSING_PULLING_KNOWLEDGE_ENTRIES } from "./entries/preparationPressingPulling";

export * from "./contracts";
export * from "./entries";
export * from "./entries/preparationPressingPulling";
export * from "./entries/shared";
export * from "./compactProjection";
export * from "./validation";

export const PACKAGE_R_KNOWLEDGE_CORE: PraxisExerciseKnowledgeCore = Object.freeze({
  contract: KNOWLEDGE_CORE_CONTRACT,
  entries: PACKAGE_R_KNOWLEDGE_ENTRIES,
});

export const WAVE_K1_KNOWLEDGE_CORE: PraxisExerciseKnowledgeCore = Object.freeze({
  contract: KNOWLEDGE_CORE_CONTRACT,
  entries: PREPARATION_PRESSING_PULLING_KNOWLEDGE_ENTRIES,
});
