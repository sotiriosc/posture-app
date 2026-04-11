import { buildEngineSignals, generateProgram } from "@/lib/engine";
import {
  adaptExerciseToV3,
  adaptExercisesToV3Catalog,
  buildThreeDayThreeWeekRotation,
  generateV3PrototypeProgram,
  rankSlotCandidates,
  type V3MovementFamily,
  type V3SlotRole,
  type V3SupportProfile,
} from "@/lib/engine_v3";
import { exercises as sourceExercises } from "@/lib/exercises";
import {
  buildNormalizedMetrics,
  buildProductionRepairMetrics,
  buildV3RepairMetrics,
  normalizeProductionPrograms,
  normalizeV3Program,
  splitWeekOneMetrics,
} from "@/lib/engine_v3_eval/normalize";
import { SHADOW_EVAL_SCENARIOS } from "@/lib/engine_v3_eval/scenarioMatrix";
import type {
  CatalogGapAudit,
  ExperienceBiasCheck,
  ExperienceBiasSummary,
  ScenarioComparison,
  ShadowEvaluationReport,
  ShadowEvaluationSummary,
  ShadowScenario,
} from "@/lib/engine_v3_eval/types";
import type { Program } from "@/lib/types";

const SHADOW_EVAL_NOW_ISO = "2026-04-10T12:00:00.000Z";
const SHADOW_EVAL_GENERATED_AT = "2026-04-10T12:00:00.000Z";

const FAMILY_COUNT_TARGET = 9;

const supportStabilityWeight: Record<V3SupportProfile, number> = {
  machine: 1,
  cable: 0.86,
  supported: 0.92,
  bodyweight: 0.74,
  free: 0.45,
};

const buildProgramWeekSignature = (program: Program) =>
  program.week
    .map((day) =>
      day.routine
        .map((item) => `${item.section ?? "none"}:${item.exerciseId}`)
        .join("|")
    )
    .join("||");

const buildProgramBlockSignature = (programs: Program[]) =>
  programs.map(buildProgramWeekSignature).join("###");

const buildV3BlockSignature = (
  program: ReturnType<typeof generateV3PrototypeProgram>
) =>
  program.days
    .map((day) =>
      day.picks
        .map((pick) => `${pick.slot.id}:${pick.slot.family}:${pick.exercise?.id ?? "none"}`)
        .join("|")
    )
    .join("###");

const average = (values: Array<number | null | undefined>) => {
  const filtered = values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value)
  );
  if (!filtered.length) return null;
  return Number((filtered.reduce((sum, value) => sum + value, 0) / filtered.length).toFixed(4));
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const computeStabilityScore = (distribution: Record<V3SupportProfile, number>) => {
  const total = Object.values(distribution).reduce((count, value) => count + value, 0);
  if (!total) return null;
  const weighted = (
    Object.entries(distribution) as Array<[V3SupportProfile, number]>
  ).reduce((score, [profile, count]) => score + supportStabilityWeight[profile] * count, 0);
  return Number((weighted / total).toFixed(4));
};

const isGeneralFitnessExperienceProbe = (scenario: ShadowScenario) =>
  scenario.questionnaire.goals === "General fitness" && scenario.painProfile === "none";

const runCurrentEngineBlock = (params: {
  scenario: ShadowScenario;
  nowIso: string;
}): {
  programs: Program[];
  seeds: string[];
  signature: string;
} => {
  const signals = buildEngineSignals({
    questionnaire: params.scenario.questionnaire,
    nowIso: params.nowIso,
  });

  const programs: Program[] = [];
  const seeds: string[] = [];
  let currentProgram: Program | undefined;

  [1, 2, 3].forEach((weekNumber) => {
    const result = generateProgram({
      mode: "weekly",
      signals,
      currentProgram: currentProgram ?? null,
      nextProgramId: `${params.scenario.id}-prod-w${weekNumber}`,
      phaseIndex: params.scenario.productionPhaseIndex,
      cycleIndex: 1,
      weekIndex: weekNumber,
      totalWeekIndex: weekNumber,
    });

    if (result.status !== "generated" || !("program" in result)) {
      throw new Error(
        `[engine_v3_eval] Production engine failed for scenario ${params.scenario.id} week ${weekNumber}.`
      );
    }

    programs.push(result.program);
    seeds.push(result.seed);
    currentProgram = result.program;
  });

  return {
    programs,
    seeds,
    signature: buildProgramBlockSignature(programs),
  };
};

const runV3Block = (scenario: ShadowScenario) => {
  const program = generateV3PrototypeProgram({
    seed: `shadow-v3:${scenario.id}`,
    experienceLevel: scenario.questionnaire.experience,
    capabilityProfile: scenario.v3CapabilityProfile,
  });

  return {
    program,
    signature: buildV3BlockSignature(program),
  };
};

const buildScenarioFindings = (params: {
  productionBlockMetrics: ReturnType<typeof buildNormalizedMetrics>;
  productionRepairMetrics: ReturnType<typeof buildProductionRepairMetrics>;
  v3BlockMetrics: ReturnType<typeof buildNormalizedMetrics>;
  v3RepairMetrics: ReturnType<typeof buildV3RepairMetrics>;
}): string[] => {
  const findings: string[] = [];

  if (params.v3RepairMetrics.missingSlots > 0) {
    findings.push(`V3 left ${params.v3RepairMetrics.missingSlots} slot(s) unfilled in the 3-week block.`);
  }
  if (params.productionRepairMetrics.changedSlots > 0) {
    findings.push(
      `Current engine reported ${params.productionRepairMetrics.changedSlots} optimizer-adjusted slot(s).`
    );
  }
  if (params.v3BlockMetrics.familyCoverageCount < FAMILY_COUNT_TARGET) {
    findings.push(
      `V3 missed family coverage for ${params.v3BlockMetrics.missingFamilies.join(", ")}.`
    );
  }
  if (params.productionBlockMetrics.unmappedExerciseIds.length > 0) {
    findings.push(
      `Current engine emitted ${params.productionBlockMetrics.unmappedExerciseIds.length} exercise(s) that the V3 family mapper cannot classify.`
    );
  }

  return findings;
};

export const evaluateCatalogGaps = (): CatalogGapAudit => {
  const adaptedCatalog = adaptExercisesToV3Catalog(sourceExercises);
  const unmappedExercises = sourceExercises.filter((exercise) => !adaptExerciseToV3(exercise));
  const template = buildThreeDayThreeWeekRotation({ seed: "shadow-eval-catalog-template" });
  const uniqueSlotPairs = new Map<string, { role: V3SlotRole; family: V3MovementFamily }>();

  template.days.forEach((day) => {
    day.slots.forEach((slot) => {
      uniqueSlotPairs.set(`${slot.role}:${slot.family}`, {
        role: slot.role,
        family: slot.family,
      });
    });
  });

  const sparseSlotPairs = Array.from(uniqueSlotPairs.values())
    .map((slotPair) => ({
      ...slotPair,
      candidateCount: rankSlotCandidates({
        slot: {
          id: `catalog-${slotPair.role}-${slotPair.family}`,
          label: `${slotPair.role} ${slotPair.family}`,
          role: slotPair.role,
          family: slotPair.family,
          templateId: "A",
          order: 0,
          required: true,
        },
        catalog: adaptedCatalog,
        capabilityProfile: {
          availableEquipment: ["gym"],
          allowOverheadLoading: true,
          allowUnsupportedHinge: true,
        },
        experienceLevel: "Advanced",
        seed: `catalog-gap:${slotPair.role}:${slotPair.family}`,
        limit: adaptedCatalog.length,
      }).length,
    }))
    .filter((entry) => entry.candidateCount < 3)
    .sort((left, right) => left.candidateCount - right.candidateCount);

  return {
    totalExercises: sourceExercises.length,
    mappedExercises: adaptedCatalog.length,
    mappedRate: Number((adaptedCatalog.length / sourceExercises.length).toFixed(4)),
    unmappedExerciseIds: unmappedExercises.map((exercise) => exercise.id).sort(),
    unmappedMainExerciseIds: unmappedExercises
      .filter((exercise) => exercise.category === "main")
      .map((exercise) => exercise.id)
      .sort(),
    sparseSlotPairs,
  };
};

const buildExperienceBiasChecks = (params: {
  scenarios: ScenarioComparison[];
  engine: "production" | "v3";
}): ExperienceBiasCheck[] =>
  (["none", "bands", "gym"] as const).map((equipment) => {
    const relevant = params.scenarios.filter(
      (scenario) =>
        isGeneralFitnessExperienceProbe(scenario.scenario) &&
        scenario.scenario.questionnaire.equipment[0] === equipment
    );
    const beginner = relevant.find(
      (scenario) => scenario.scenario.questionnaire.experience === "Beginner"
    );
    const advanced = relevant.find(
      (scenario) => scenario.scenario.questionnaire.experience === "Advanced"
    );

    if (!beginner || !advanced) {
      return {
        measurable: false,
        equipment,
        beginnerStability: null,
        advancedStability: null,
        beginnerComplexity: null,
        advancedComplexity: null,
        passed: false,
        note: "Missing beginner/advanced comparison pair.",
      };
    }

    const beginnerMetrics =
      params.engine === "production"
        ? beginner.production.blockMetrics
        : beginner.v3.blockMetrics;
    const advancedMetrics =
      params.engine === "production"
        ? advanced.production.blockMetrics
        : advanced.v3.blockMetrics;

    const beginnerStability = computeStabilityScore(
      beginnerMetrics.workingSupportProfileDistribution
    );
    const advancedStability = computeStabilityScore(
      advancedMetrics.workingSupportProfileDistribution
    );
    const beginnerComplexity = beginnerMetrics.averageWorkingComplexity;
    const advancedComplexity = advancedMetrics.averageWorkingComplexity;

    if (equipment !== "gym") {
      return {
        measurable: false,
        equipment,
        beginnerStability,
        advancedStability,
        beginnerComplexity,
        advancedComplexity,
        passed: false,
        note: "Limited equipment keeps the stable/free-weight contrast too small to treat as a hard pass/fail signal.",
      };
    }

    const passed =
      typeof beginnerStability === "number" &&
      typeof advancedStability === "number" &&
      typeof beginnerComplexity === "number" &&
      typeof advancedComplexity === "number" &&
      beginnerStability >= advancedStability &&
      advancedComplexity >= beginnerComplexity;

    return {
      measurable: true,
      equipment,
      beginnerStability,
      advancedStability,
      beginnerComplexity,
      advancedComplexity,
      passed,
      note: passed
        ? "Gym scenario shows the expected beginner-to-advanced stability/complexity shift."
        : "Gym scenario does not yet show the expected beginner-to-advanced stability/complexity shift clearly enough.",
    };
  });

const buildExperienceBiasSummary = (
  scenarios: ScenarioComparison[]
): ExperienceBiasSummary => ({
  production: buildExperienceBiasChecks({
    scenarios,
    engine: "production",
  }),
  v3: buildExperienceBiasChecks({
    scenarios,
    engine: "v3",
  }),
});

const buildSummary = (scenarios: ScenarioComparison[]): ShadowEvaluationSummary => {
  const catalogGaps = evaluateCatalogGaps();
  const experienceBias = buildExperienceBiasSummary(scenarios);

  const productionAverageFillRate =
    average(scenarios.map((scenario) => scenario.production.blockMetrics.fillRate)) ?? 0;
  const v3AverageFillRate =
    average(scenarios.map((scenario) => scenario.v3.blockMetrics.fillRate)) ?? 0;
  const productionAverageFamilyCoverageCount =
    average(scenarios.map((scenario) => scenario.production.blockMetrics.familyCoverageCount)) ?? 0;
  const v3AverageFamilyCoverageCount =
    average(scenarios.map((scenario) => scenario.v3.blockMetrics.familyCoverageCount)) ?? 0;
  const productionAverageComplexity = average(
    scenarios.map((scenario) => scenario.production.blockMetrics.averageWorkingComplexity)
  );
  const v3AverageComplexity = average(
    scenarios.map((scenario) => scenario.v3.blockMetrics.averageWorkingComplexity)
  );
  const productionAverageUniqueness = average(
    scenarios.map((scenario) => scenario.production.blockMetrics.averageUniquenessScore)
  );
  const v3AverageUniqueness = average(
    scenarios.map((scenario) => scenario.v3.blockMetrics.averageUniquenessScore)
  );
  const productionEquipmentValidityPassCount = scenarios.filter(
    (scenario) => scenario.production.blockMetrics.invalidEquipmentExerciseIds.length === 0
  ).length;
  const v3EquipmentValidityPassCount = scenarios.filter(
    (scenario) => scenario.v3.blockMetrics.invalidEquipmentExerciseIds.length === 0
  ).length;
  const productionChangedSlotsTotal = sum(
    scenarios.map((scenario) => scenario.production.repairMetrics.changedSlots)
  );
  const v3MissingSlotsTotal = sum(
    scenarios.map((scenario) => scenario.v3.repairMetrics.missingSlots)
  );
  const productionDeterminismPassCount = scenarios.filter(
    (scenario) => scenario.production.determinism.passed
  ).length;
  const v3DeterminismPassCount = scenarios.filter((scenario) => scenario.v3.determinism.passed)
    .length;

  const strongestV3Signals: string[] = [];
  const strongestCurrentSignals: string[] = [];
  const requiredBeforeAdoption: string[] = [];
  const verdictReasons: string[] = [];

  if (v3DeterminismPassCount === scenarios.length) {
    strongestV3Signals.push("V3 was deterministic across the full shadow matrix.");
  }
  if (v3EquipmentValidityPassCount === scenarios.length) {
    strongestV3Signals.push("V3 respected questionnaire equipment limits in every evaluated scenario.");
  }
  if (experienceBias.v3.some((check) => check.measurable && check.passed)) {
    strongestV3Signals.push(
      "V3 showed the intended beginner-vs-advanced stability/complexity bias in the gym comparison."
    );
  }
  if (v3AverageFamilyCoverageCount >= productionAverageFamilyCoverageCount) {
    strongestV3Signals.push("V3 maintained at least as much 3-week family coverage as the current engine.");
  }

  if (productionDeterminismPassCount === scenarios.length) {
    strongestCurrentSignals.push("The current engine stayed deterministic across the full shadow matrix.");
  }
  if (productionEquipmentValidityPassCount === scenarios.length) {
    strongestCurrentSignals.push("The current engine preserved full equipment validity across all evaluated scenarios.");
  }
  if (v3MissingSlotsTotal > 0) {
    strongestCurrentSignals.push(
      "The current engine still looks safer because it never left explicit slots unfilled while V3 did."
    );
  }
  if (productionChangedSlotsTotal > 0) {
    strongestCurrentSignals.push(
      "The current engine exposes downstream optimizer repair behavior that V3 does not model yet."
    );
  }

  if (v3MissingSlotsTotal > 0) {
    requiredBeforeAdoption.push(
      "Close V3 slot-coverage gaps so all scheduled 3-day slots fill under the evaluated pain/equipment scenarios."
    );
    verdictReasons.push(`V3 left ${v3MissingSlotsTotal} slot(s) unfilled across the shadow matrix.`);
  }
  if (catalogGaps.unmappedMainExerciseIds.length > 0) {
    requiredBeforeAdoption.push(
      "Improve V3 catalog mapping for remaining production main exercises so shadow reports are not losing signal."
    );
    verdictReasons.push(
      `${catalogGaps.unmappedMainExerciseIds.length} production main exercise(s) still do not map cleanly into the V3 family model.`
    );
  }

  requiredBeforeAdoption.push(
    "Add goal-aware and phase-aware policy before any production trial, because V3 currently ignores those live engine dimensions."
  );
  requiredBeforeAdoption.push(
    "Add real pain/repair handling instead of the current prototype capability flags."
  );
  requiredBeforeAdoption.push(
    "Extend the curriculum beyond the current 3-day-only schedule before any broader rollout."
  );

  let verdict: ShadowEvaluationSummary["verdict"] = "V3 promising but 3-day only";
  let recommendedNextStep: ShadowEvaluationSummary["recommendedNextStep"] =
    "continue V3 prototyping";

  if (
    v3DeterminismPassCount !== scenarios.length ||
    v3EquipmentValidityPassCount !== scenarios.length ||
    v3MissingSlotsTotal > 0
  ) {
    verdict = "V3 not ready";
    recommendedNextStep = "continue V3 prototyping";
  } else if (
    experienceBias.v3.some((check) => check.measurable && !check.passed) ||
    catalogGaps.unmappedMainExerciseIds.length > 0
  ) {
    verdict = "V3 promising but 3-day only";
    recommendedNextStep = "continue V3 prototyping";
  } else {
    verdict = "V3 ready for limited feature-flag trial";
    recommendedNextStep = "integrate V3 behind a feature flag for 3-day only";
  }

  if (!verdictReasons.length) {
    if (verdict === "V3 ready for limited feature-flag trial") {
      verdictReasons.push(
        "V3 stayed deterministic, equipment-valid, fully filled, and experience-biased across the evaluated 3-day matrix."
      );
    } else {
      verdictReasons.push(
        "V3 looked structurally promising, but the prototype still lacks enough production policy coverage to replace the live engine safely."
      );
    }
  }

  return {
    scenarioCount: scenarios.length,
    productionDeterminismPassCount,
    v3DeterminismPassCount,
    productionAverageFillRate,
    v3AverageFillRate,
    productionAverageFamilyCoverageCount,
    v3AverageFamilyCoverageCount,
    productionAverageComplexity,
    v3AverageComplexity,
    productionAverageUniqueness,
    v3AverageUniqueness,
    productionEquipmentValidityPassCount,
    v3EquipmentValidityPassCount,
    productionChangedSlotsTotal,
    v3MissingSlotsTotal,
    catalogGaps,
    experienceBias,
    strongestV3Signals,
    strongestCurrentSignals,
    requiredBeforeAdoption,
    recommendedNextStep,
    verdict,
    verdictReasons,
  };
};

export const evaluateShadowScenario = (params: {
  scenario: ShadowScenario;
  nowIso?: string;
}): ScenarioComparison => {
  const nowIso = params.nowIso ?? SHADOW_EVAL_NOW_ISO;

  const productionRunA = runCurrentEngineBlock({
    scenario: params.scenario,
    nowIso,
  });
  const productionRunB = runCurrentEngineBlock({
    scenario: params.scenario,
    nowIso,
  });
  const productionEntries = normalizeProductionPrograms({
    programs: productionRunA.programs,
    questionnaire: params.scenario.questionnaire,
  });
  const productionBlockMetrics = buildNormalizedMetrics(productionEntries);
  const productionRepairMetrics = buildProductionRepairMetrics(productionRunA.programs);

  const v3RunA = runV3Block(params.scenario);
  const v3RunB = runV3Block(params.scenario);
  const v3Entries = normalizeV3Program(v3RunA.program);
  const v3BlockMetrics = buildNormalizedMetrics(v3Entries);
  const v3RepairMetrics = buildV3RepairMetrics(v3RunA.program);

  return {
    scenario: params.scenario,
    production: {
      weekSignatures: productionRunA.programs.map((program) => buildProgramWeekSignature(program)),
      determinism: {
        passed: productionRunA.signature === productionRunB.signature,
        signature: productionRunA.signature,
      },
      week1Metrics: splitWeekOneMetrics(productionEntries),
      blockMetrics: productionBlockMetrics,
      repairMetrics: productionRepairMetrics,
      seeds: productionRunA.seeds,
    },
    v3: {
      blockSignature: v3RunA.signature,
      determinism: {
        passed: v3RunA.signature === v3RunB.signature,
        signature: v3RunA.signature,
      },
      week1Metrics: splitWeekOneMetrics(v3Entries),
      blockMetrics: v3BlockMetrics,
      repairMetrics: v3RepairMetrics,
    },
    notableFindings: buildScenarioFindings({
      productionBlockMetrics,
      productionRepairMetrics,
      v3BlockMetrics,
      v3RepairMetrics,
    }),
  };
};

export const evaluateShadowMatrix = (params?: {
  scenarios?: ShadowScenario[];
  nowIso?: string;
  generatedAt?: string;
}): ShadowEvaluationReport => {
  const scenarios = (params?.scenarios ?? SHADOW_EVAL_SCENARIOS).map((scenario) =>
    evaluateShadowScenario({
      scenario,
      nowIso: params?.nowIso ?? SHADOW_EVAL_NOW_ISO,
    })
  );

  return {
    generatedAt: params?.generatedAt ?? SHADOW_EVAL_GENERATED_AT,
    evaluationVersion: "engine_v3_shadow_eval_v1",
    scenarios,
    summary: buildSummary(scenarios),
  };
};

export const SHADOW_EVAL_DEFAULTS = {
  nowIso: SHADOW_EVAL_NOW_ISO,
  generatedAt: SHADOW_EVAL_GENERATED_AT,
};
