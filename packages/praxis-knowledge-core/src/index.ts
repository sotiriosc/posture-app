import { KNOWLEDGE_CORE_CONTRACT, type PraxisExerciseKnowledgeCore } from "./contracts";
import { PACKAGE_R_KNOWLEDGE_ENTRIES } from "./entries";

export * from "./contracts";
export * from "./entries";
export * from "./compactProjection";
export * from "./validation";

export const PACKAGE_R_KNOWLEDGE_CORE: PraxisExerciseKnowledgeCore = Object.freeze({
  contract: KNOWLEDGE_CORE_CONTRACT,
  entries: PACKAGE_R_KNOWLEDGE_ENTRIES,
});
