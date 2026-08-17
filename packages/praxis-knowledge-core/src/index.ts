import { KNOWLEDGE_CORE_CONTRACT, type PraxisExerciseKnowledgeCore } from "./contracts";
import { PACKAGE_R_KNOWLEDGE_ENTRIES } from "./entries";
import { PREPARATION_PRESSING_PULLING_KNOWLEDGE_ENTRIES } from "./entries/preparationPressingPulling";
import { LOWER_BODY_ACCESSORY_KNOWLEDGE_ENTRIES } from "./entries/lowerBodyAndAccessories";
import { TRUNK_CARRY_SUPPORT_KNOWLEDGE_ENTRIES } from "./entries/trunkCarriesAndSupport";
import { PACKAGE_S_KNOWLEDGE_ENTRIES } from "./entries/standardGymFoundations";

export * from "./contracts";
export * from "./entries";
export * from "./entries/preparationPressingPulling";
export * from "./entries/lowerBodyAndAccessories";
export * from "./entries/trunkCarriesAndSupport";
export * from "./entries/standardGymFoundations";
export * from "./entries/shared";
export * from "./compactProjection";
export * from "./validation";
export * from "./registry";

export const PACKAGE_R_KNOWLEDGE_CORE: PraxisExerciseKnowledgeCore = Object.freeze({
  contract: KNOWLEDGE_CORE_CONTRACT,
  entries: PACKAGE_R_KNOWLEDGE_ENTRIES,
});

export const WAVE_K1_KNOWLEDGE_CORE: PraxisExerciseKnowledgeCore = Object.freeze({
  contract: KNOWLEDGE_CORE_CONTRACT,
  entries: PREPARATION_PRESSING_PULLING_KNOWLEDGE_ENTRIES,
});

export const WAVE_K2_KNOWLEDGE_CORE: PraxisExerciseKnowledgeCore = Object.freeze({
  contract: KNOWLEDGE_CORE_CONTRACT,
  entries: LOWER_BODY_ACCESSORY_KNOWLEDGE_ENTRIES,
});

export const WAVE_K3_KNOWLEDGE_CORE: PraxisExerciseKnowledgeCore = Object.freeze({
  contract: KNOWLEDGE_CORE_CONTRACT,
  entries: TRUNK_CARRY_SUPPORT_KNOWLEDGE_ENTRIES,
});

export const PACKAGE_S_KNOWLEDGE_CORE: PraxisExerciseKnowledgeCore = Object.freeze({
  contract: KNOWLEDGE_CORE_CONTRACT,
  entries: PACKAGE_S_KNOWLEDGE_ENTRIES,
});
