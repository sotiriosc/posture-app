import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type {
  V3CapabilityProfile,
  V3MovementFamily,
  V3SlotRole,
  V3SupportProfile,
} from "@/lib/engine_v3";

export type ShadowPainProfile = "none" | "lower_back" | "shoulders_neck";

export type ShadowScenario = {
  id: string;
  label: string;
  questionnaire: QuestionnaireData;
  painProfile: ShadowPainProfile;
  productionPhaseIndex: 1 | 2 | 3;
  notes: string[];
  v3CapabilityProfile: V3CapabilityProfile;
};

export type NormalizedSelectionEntry = {
  weekIndex: number;
  dayIndex: number;
  sessionIndex: number;
  entryId: string;
  role: V3SlotRole;
  scheduledFamily: V3MovementFamily | null;
  coverageFamilies: V3MovementFamily[];
  primaryFamily: V3MovementFamily | null;
  exerciseId: string | null;
  exerciseName: string | null;
  supportProfile: V3SupportProfile | null;
  complexity: number | null;
  equipmentValid: boolean | null;
  mapped: boolean;
  filled: boolean;
};

export type NormalizedBlockMetrics = {
  totalEntries: number;
  filledEntries: number;
  fillRate: number;
  mappedEntries: number;
  mappedRate: number;
  familyCoverageCount: number;
  missingFamilies: V3MovementFamily[];
  familyCounts: Record<V3MovementFamily, number>;
  patternBalance: {
    upperPush: number;
    upperPull: number;
    lower: number;
    trunk: number;
  };
  roleDistribution: Record<V3SlotRole, number>;
  supportProfileDistribution: Record<V3SupportProfile, number>;
  workingSupportProfileDistribution: Record<V3SupportProfile, number>;
  averageComplexity: number | null;
  averageWorkingComplexity: number | null;
  equipmentValidityRate: number | null;
  invalidEquipmentExerciseIds: string[];
  uniqueExerciseRatio: number;
  repeatedExerciseCount: number;
  repeatedFamilyCount: number;
  averageUniquenessScore: number | null;
  unmappedExerciseIds: string[];
};

export type ProductionRepairMetrics = {
  measurable: boolean;
  changedSlots: number;
  totalSlots: number;
  weeksWithOptimizerReport: number;
};

export type V3RepairMetrics = {
  measurable: boolean;
  missingSlots: number;
};

export type EngineDeterminismCheck = {
  passed: boolean;
  signature: string;
};

export type ProductionShadowResult = {
  weekSignatures: string[];
  determinism: EngineDeterminismCheck;
  week1Metrics: NormalizedBlockMetrics;
  blockMetrics: NormalizedBlockMetrics;
  repairMetrics: ProductionRepairMetrics;
  seeds: string[];
};

export type V3ShadowResult = {
  blockSignature: string;
  determinism: EngineDeterminismCheck;
  week1Metrics: NormalizedBlockMetrics;
  blockMetrics: NormalizedBlockMetrics;
  repairMetrics: V3RepairMetrics;
};

export type ScenarioComparison = {
  scenario: ShadowScenario;
  production: ProductionShadowResult;
  v3: V3ShadowResult;
  notableFindings: string[];
};

export type ExperienceBiasCheck = {
  measurable: boolean;
  equipment: "none" | "bands" | "gym";
  beginnerStability: number | null;
  advancedStability: number | null;
  beginnerComplexity: number | null;
  advancedComplexity: number | null;
  passed: boolean;
  note: string;
};

export type ExperienceBiasSummary = {
  production: ExperienceBiasCheck[];
  v3: ExperienceBiasCheck[];
};

export type CatalogGapAudit = {
  totalExercises: number;
  mappedExercises: number;
  mappedRate: number;
  unmappedExerciseIds: string[];
  unmappedMainExerciseIds: string[];
  sparseSlotPairs: Array<{
    role: V3SlotRole;
    family: V3MovementFamily;
    candidateCount: number;
  }>;
};

export type ShadowEvaluationVerdict =
  | "V3 not ready"
  | "V3 promising but 3-day only"
  | "V3 ready for limited feature-flag trial";

export type ShadowEvaluationSummary = {
  scenarioCount: number;
  productionDeterminismPassCount: number;
  v3DeterminismPassCount: number;
  productionAverageFillRate: number;
  v3AverageFillRate: number;
  productionAverageFamilyCoverageCount: number;
  v3AverageFamilyCoverageCount: number;
  productionAverageComplexity: number | null;
  v3AverageComplexity: number | null;
  productionAverageUniqueness: number | null;
  v3AverageUniqueness: number | null;
  productionEquipmentValidityPassCount: number;
  v3EquipmentValidityPassCount: number;
  productionChangedSlotsTotal: number;
  v3MissingSlotsTotal: number;
  catalogGaps: CatalogGapAudit;
  experienceBias: ExperienceBiasSummary;
  strongestV3Signals: string[];
  strongestCurrentSignals: string[];
  requiredBeforeAdoption: string[];
  recommendedNextStep:
    | "continue V3 prototyping"
    | "integrate V3 behind a feature flag for 3-day only"
    | "keep current engine and stop here for now";
  verdict: ShadowEvaluationVerdict;
  verdictReasons: string[];
};

export type ShadowEvaluationReport = {
  generatedAt: string;
  evaluationVersion: "engine_v3_shadow_eval_v1";
  scenarios: ScenarioComparison[];
  summary: ShadowEvaluationSummary;
};
