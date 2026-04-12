import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Equipment } from "@/lib/equipment";
import type { Exercise } from "@/lib/exercises";
import type { ProgramDay } from "@/lib/types";
import type {
  GenerationSettingsFingerprint,
  ProgramDayKey,
  ProgramRecentGenerationDaySummary,
  ProgramRecentGenerationPhaseSummary,
  ProgramVariationOptions,
} from "@/lib/program";

export type ProgramVariationConfig = {
  topBandPercent: number;
  topBandMinCandidates: number;
  topBandMaxCandidates: number;
  topBandMinScoreAllowance: number;
  historySize: number;
};

export type ProgramVariationSnapshot = {
  exerciseIds: string[];
  familyCounts: Record<string, number>;
  variantCounts: Record<string, number>;
  slotExerciseIds: Record<string, string>;
  slotFamilyKeys: Record<string, string>;
  slotVariantKeys: Record<string, string>;
  slotFamilySignatures: Record<string, string>;
  dayMainLayoutSignatures: Record<string, string>;
  dayMainFamilyLayoutSignatures: Record<string, string>;
  dayTemplateKeys: Record<string, string>;
};

export type ProgramVariationMemory = {
  recentExerciseIds: Set<string>;
  recentFamilyCounts: Map<string, number>;
  recentVariantCounts: Map<string, number>;
  recentSlotExerciseIds: Map<string, string>;
  recentSlotFamilyKeys: Map<string, string>;
  recentSlotVariantKeys: Map<string, string>;
  recentSlotFamilySignatures: Map<string, string>;
  recentDayMainLayoutSignatures: Map<string, string[]>;
  recentDayMainFamilyLayoutSignatures: Map<string, string[]>;
  recentDayTemplateKeys: Map<string, string[]>;
};

export type ProgramVariationState = {
  enabled: boolean;
  settingsKey: string;
  seedKey: string;
  config: ProgramVariationConfig;
  memory: ProgramVariationMemory;
  selectedDayTemplateKeys: Map<string, string>;
  options: ProgramVariationOptions;
};

type ProgramVariationMemoryRuntimeDeps = {
  exerciseById: (exerciseId: string) => Exercise | undefined;
  normalizeSlotToken: (value: string) => string;
  normalizeTagToken: (value: string) => string;
  stableHashToken: (value: string) => string;
  clampPhaseIndexToSupportedRange: (phaseIndex: number) => number;
  resolveVariationIndex: (variation?: ProgramVariationOptions) => number;
};

const PROGRAM_DAY_KEY_TO_DAY_TOKEN: Record<ProgramDayKey, string> = {
  day1_back_chest: "back_chest",
  day2_shoulders_arms: "shoulders_arms",
  day3_legs_abs: "legs_abs",
};

export const DEFAULT_PROGRAM_VARIATION_CONFIG: ProgramVariationConfig = {
  topBandPercent: 0.12,
  topBandMinCandidates: 2,
  topBandMaxCandidates: 6,
  topBandMinScoreAllowance: 1.75,
  historySize: 4,
};

export const createProgramVariationMemoryRuntime = (
  deps: ProgramVariationMemoryRuntimeDeps
) => {
  const programVariationHistoryBySettings = new Map<string, ProgramVariationSnapshot[]>();

  const resolveRecentGenerationDayToken = (dayTokenRaw: string) => {
    const normalized = deps.normalizeSlotToken(dayTokenRaw);
    if (!normalized) return "";
    const mapped = PROGRAM_DAY_KEY_TO_DAY_TOKEN[normalized as ProgramDayKey];
    return mapped ?? normalized;
  };

  const resolveProgramVariationPhaseIndex = (value?: number | null) =>
    typeof value === "number" && Number.isFinite(value)
      ? deps.clampPhaseIndexToSupportedRange(value)
      : null;

  const buildVariationDayPhaseToken = (dayToken: string, phaseIndex?: number | null) => {
    const normalizedDayToken = deps.normalizeSlotToken(dayToken);
    const normalizedPhaseIndex = resolveProgramVariationPhaseIndex(phaseIndex);
    if (!normalizedDayToken) return "";
    return normalizedPhaseIndex === null
      ? normalizedDayToken
      : `${normalizedDayToken}__phase_${normalizedPhaseIndex}`;
  };

  const pushUniqueValue = (values: string[], value: string) => {
    if (!value || values.includes(value)) return values;
    return [...values, value];
  };

  const createEmptyProgramVariationMemory = (): ProgramVariationMemory => ({
    recentExerciseIds: new Set<string>(),
    recentFamilyCounts: new Map<string, number>(),
    recentVariantCounts: new Map<string, number>(),
    recentSlotExerciseIds: new Map<string, string>(),
    recentSlotFamilyKeys: new Map<string, string>(),
    recentSlotVariantKeys: new Map<string, string>(),
    recentSlotFamilySignatures: new Map<string, string>(),
    recentDayMainLayoutSignatures: new Map<string, string[]>(),
    recentDayMainFamilyLayoutSignatures: new Map<string, string[]>(),
    recentDayTemplateKeys: new Map<string, string[]>(),
  });

  const cloneProgramVariationMemory = (
    memory: ProgramVariationMemory
  ): ProgramVariationMemory => ({
    recentExerciseIds: new Set(memory.recentExerciseIds),
    recentFamilyCounts: new Map(memory.recentFamilyCounts),
    recentVariantCounts: new Map(memory.recentVariantCounts),
    recentSlotExerciseIds: new Map(memory.recentSlotExerciseIds),
    recentSlotFamilyKeys: new Map(memory.recentSlotFamilyKeys),
    recentSlotVariantKeys: new Map(memory.recentSlotVariantKeys),
    recentSlotFamilySignatures: new Map(memory.recentSlotFamilySignatures),
    recentDayMainLayoutSignatures: new Map(memory.recentDayMainLayoutSignatures),
    recentDayMainFamilyLayoutSignatures: new Map(
      memory.recentDayMainFamilyLayoutSignatures
    ),
    recentDayTemplateKeys: new Map(memory.recentDayTemplateKeys),
  });

  const resolveProgramVariationFamilyKey = (exercise: Exercise) => {
    const raw = exercise.familyKey?.trim() ? exercise.familyKey : exercise.id;
    return deps.normalizeTagToken(raw);
  };

  const resolveProgramVariationVariantKey = (exercise: Exercise) => {
    const raw =
      exercise.variantKey?.trim() ||
      `${exercise.loadType}-${exercise.equipment.slice().sort().join("_") || "none"}`;
    return deps.normalizeTagToken(raw);
  };

  const getVariationMemoryValuesForDayToken = (
    map: Map<string, string[]>,
    dayTokenRaw: string,
    phaseIndex?: number | null
  ) => {
    const dayToken = deps.normalizeSlotToken(dayTokenRaw);
    if (!dayToken) return [] as string[];
    const merged: string[] = [];
    const baseValues = map.get(dayToken) ?? [];
    baseValues.forEach((value) => {
      if (!value || merged.includes(value)) return;
      merged.push(value);
    });
    const phaseToken = buildVariationDayPhaseToken(dayToken, phaseIndex);
    if (phaseToken && phaseToken !== dayToken) {
      const phaseValues = map.get(phaseToken) ?? [];
      phaseValues.forEach((value) => {
        if (!value || merged.includes(value)) return;
        merged.push(value);
      });
    }
    return merged;
  };

  const pushVariationMemoryDayValue = (params: {
    map: Map<string, string[]>;
    dayTokenRaw: string;
    value: string;
    phaseIndex?: number | null;
  }) => {
    const { map, dayTokenRaw, value, phaseIndex } = params;
    const normalizedValue = String(value ?? "").trim();
    if (!normalizedValue) return;
    const dayToken = deps.normalizeSlotToken(dayTokenRaw);
    if (!dayToken) return;
    const nextBaseValues = pushUniqueValue(map.get(dayToken) ?? [], normalizedValue);
    map.set(dayToken, nextBaseValues);
    const phaseToken = buildVariationDayPhaseToken(dayToken, phaseIndex);
    if (phaseToken && phaseToken !== dayToken) {
      const nextPhaseValues = pushUniqueValue(map.get(phaseToken) ?? [], normalizedValue);
      map.set(phaseToken, nextPhaseValues);
    }
  };

  const buildProgramVariationSettingsKey = (params: {
    questionnaire: QuestionnaireData;
    available: Set<Equipment>;
    daysPerWeek: 3 | 4 | 5;
    phaseIndex: number;
    poseFocusTags?: string[];
  }): string => {
    const { questionnaire, available, daysPerWeek, phaseIndex, poseFocusTags } = params;
    const fingerprint: GenerationSettingsFingerprint = {
      goal: deps.normalizeTagToken(questionnaire.goals ?? ""),
      experience: deps.normalizeTagToken(questionnaire.experience ?? ""),
      daysPerWeek,
      equipment: [...available].sort(),
      painAreas: [...(questionnaire.painAreas ?? [])]
        .map((area) => deps.normalizeTagToken(area))
        .sort(),
      poseFocusTags: [...(poseFocusTags ?? [])]
        .map((tag) => deps.normalizeTagToken(tag))
        .sort(),
      phaseIndex,
    };
    const serialized = JSON.stringify(fingerprint);
    return `gsf_${deps.stableHashToken(serialized)}`;
  };

  const buildVariationSnapshot = (
    week: ProgramDay[],
    selectedDayTemplateKeys?: Map<string, string>
  ): ProgramVariationSnapshot => {
    const exerciseIds: string[] = [];
    const familyCounts = new Map<string, number>();
    const variantCounts = new Map<string, number>();
    const slotExerciseIds = new Map<string, string>();
    const slotFamilyKeys = new Map<string, string>();
    const slotVariantKeys = new Map<string, string>();
    const slotFamilySignatures = new Map<string, string>();
    const dayMainLayoutSignatures = new Map<string, string>();
    const dayMainFamilyLayoutSignatures = new Map<string, string>();
    const dayTemplateKeys = new Map<string, string>();

    week.forEach((day) => {
      const dayToken = deps.normalizeSlotToken(day.title);
      let mainOrdinal = 0;
      let accessoryOrdinal = 0;
      const dayMainSignatures: string[] = [];
      const dayMainFamilySignatures: string[] = [];

      day.routine.forEach((item) => {
        const exercise = deps.exerciseById(item.exerciseId);
        if (!exercise) return;
        const familyKey = resolveProgramVariationFamilyKey(exercise);
        const variantKey = resolveProgramVariationVariantKey(exercise);
        const signature = `${familyKey}::${variantKey}`;
        exerciseIds.push(exercise.id);
        familyCounts.set(familyKey, (familyCounts.get(familyKey) ?? 0) + 1);
        variantCounts.set(variantKey, (variantCounts.get(variantKey) ?? 0) + 1);

        if (item.section === "main") {
          mainOrdinal += 1;
          const slotId = `${dayToken}-main-${mainOrdinal}`;
          slotExerciseIds.set(slotId, exercise.id);
          slotFamilyKeys.set(slotId, familyKey);
          slotVariantKeys.set(slotId, variantKey);
          slotFamilySignatures.set(slotId, signature);
          dayMainSignatures.push(signature);
          dayMainFamilySignatures.push(familyKey);
        } else if (item.section === "accessory") {
          accessoryOrdinal += 1;
          const slotId = `${dayToken}-accessory-${accessoryOrdinal}`;
          slotExerciseIds.set(slotId, exercise.id);
          slotFamilyKeys.set(slotId, familyKey);
          slotVariantKeys.set(slotId, variantKey);
          slotFamilySignatures.set(slotId, signature);
        }
      });

      dayMainLayoutSignatures.set(dayToken, dayMainSignatures.join("|"));
      dayMainFamilyLayoutSignatures.set(dayToken, dayMainFamilySignatures.join("|"));
      const selectedTemplateKey = selectedDayTemplateKeys?.get(dayToken);
      if (selectedTemplateKey) {
        dayTemplateKeys.set(dayToken, selectedTemplateKey);
      }
    });

    return {
      exerciseIds,
      familyCounts: Object.fromEntries(familyCounts.entries()),
      variantCounts: Object.fromEntries(variantCounts.entries()),
      slotExerciseIds: Object.fromEntries(slotExerciseIds.entries()),
      slotFamilyKeys: Object.fromEntries(slotFamilyKeys.entries()),
      slotVariantKeys: Object.fromEntries(slotVariantKeys.entries()),
      slotFamilySignatures: Object.fromEntries(slotFamilySignatures.entries()),
      dayMainLayoutSignatures: Object.fromEntries(dayMainLayoutSignatures.entries()),
      dayMainFamilyLayoutSignatures: Object.fromEntries(
        dayMainFamilyLayoutSignatures.entries()
      ),
      dayTemplateKeys: Object.fromEntries(dayTemplateKeys.entries()),
    };
  };

  const aggregateVariationHistory = (
    history: ProgramVariationSnapshot[]
  ): ProgramVariationMemory => {
    const memory = createEmptyProgramVariationMemory();
    if (!history.length) return memory;

    const recencyOrdered = [...history].reverse();
    const latest = recencyOrdered[0]!;
    latest.exerciseIds.forEach((id) => memory.recentExerciseIds.add(id));
    Object.entries(latest.slotExerciseIds).forEach(([slotId, exerciseId]) => {
      if (!exerciseId) return;
      memory.recentSlotExerciseIds.set(slotId, exerciseId);
    });
    Object.entries(latest.slotFamilyKeys).forEach(([slotId, familyKey]) => {
      if (!familyKey) return;
      memory.recentSlotFamilyKeys.set(slotId, familyKey);
    });
    Object.entries(latest.slotVariantKeys).forEach(([slotId, variantKey]) => {
      if (!variantKey) return;
      memory.recentSlotVariantKeys.set(slotId, variantKey);
    });
    Object.entries(latest.slotFamilySignatures).forEach(([slotId, signature]) => {
      memory.recentSlotFamilySignatures.set(slotId, signature);
    });

    recencyOrdered.forEach((snapshot, index) => {
      const recencyWeight = Math.max(1, recencyOrdered.length - index);
      Object.entries(snapshot.familyCounts).forEach(([familyKey, count]) => {
        memory.recentFamilyCounts.set(
          familyKey,
          (memory.recentFamilyCounts.get(familyKey) ?? 0) + count * recencyWeight
        );
      });
      Object.entries(snapshot.variantCounts).forEach(([variantKey, count]) => {
        memory.recentVariantCounts.set(
          variantKey,
          (memory.recentVariantCounts.get(variantKey) ?? 0) + count * recencyWeight
        );
      });
      Object.entries(snapshot.dayMainLayoutSignatures).forEach(([dayToken, signature]) => {
        if (!signature) return;
        pushVariationMemoryDayValue({
          map: memory.recentDayMainLayoutSignatures,
          dayTokenRaw: dayToken,
          value: signature,
        });
      });
      Object.entries(snapshot.dayMainFamilyLayoutSignatures).forEach(
        ([dayToken, signature]) => {
          if (!signature) return;
          pushVariationMemoryDayValue({
            map: memory.recentDayMainFamilyLayoutSignatures,
            dayTokenRaw: dayToken,
            value: signature,
          });
        }
      );
      Object.entries(snapshot.dayTemplateKeys).forEach(([dayToken, templateKey]) => {
        if (!templateKey) return;
        pushVariationMemoryDayValue({
          map: memory.recentDayTemplateKeys,
          dayTokenRaw: dayToken,
          value: templateKey,
        });
      });
    });

    return memory;
  };

  const resolveRecentGenerationPhaseSummary = (params: {
    daySummary: ProgramRecentGenerationDaySummary;
    summaryPhaseIndex: number | null;
  }): ProgramRecentGenerationPhaseSummary | null => {
    const { daySummary, summaryPhaseIndex } = params;
    const phaseSummaries = (daySummary.phaseSummaries ?? [])
      .filter((entry): entry is ProgramRecentGenerationPhaseSummary => Boolean(entry))
      .filter((entry) => entry.phase === 1 || entry.phase === 2 || entry.phase === 3);
    if (!phaseSummaries.length) return null;
    if (summaryPhaseIndex !== null) {
      const exact = phaseSummaries.find((entry) => entry.phase === summaryPhaseIndex);
      if (exact) return exact;
    }
    return [...phaseSummaries].sort((left, right) => left.phase - right.phase).at(-1) ?? null;
  };

  const resolveRecentGenerationMemory = (params: {
    memory: ProgramVariationMemory;
    summary?: ProgramVariationOptions["recentGenerationSummary"];
  }): ProgramVariationMemory => {
    const { memory, summary } = params;
    if (!summary) return memory;
    const summaryPhaseIndex = resolveProgramVariationPhaseIndex(summary.phaseIndex);
    const nextMemory = cloneProgramVariationMemory(memory);

    const addExerciseId = (exerciseIdRaw: string | null | undefined) => {
      const exerciseId = String(exerciseIdRaw ?? "").trim();
      if (!exerciseId) return;
      nextMemory.recentExerciseIds.add(exerciseId);
    };

    const addFamilyKey = (familyKeyRaw: string | null | undefined) => {
      const familyKey = String(familyKeyRaw ?? "").trim();
      if (!familyKey) return;
      const normalized = deps.normalizeTagToken(familyKey);
      nextMemory.recentFamilyCounts.set(
        normalized,
        (nextMemory.recentFamilyCounts.get(normalized) ?? 0) + 1
      );
    };

    const addVariantKey = (variantKeyRaw: string | null | undefined) => {
      const variantKey = String(variantKeyRaw ?? "").trim();
      if (!variantKey) return;
      const normalized = deps.normalizeTagToken(variantKey);
      nextMemory.recentVariantCounts.set(
        normalized,
        (nextMemory.recentVariantCounts.get(normalized) ?? 0) + 1
      );
    };

    const addResolvedExerciseTraits = (
      exerciseIdRaw: string | null | undefined,
      options?: {
        slotSignatureId?: string;
      }
    ) => {
      const exerciseId = String(exerciseIdRaw ?? "").trim();
      if (!exerciseId) return;
      addExerciseId(exerciseId);
      const exercise = deps.exerciseById(exerciseId);
      if (!exercise) return;
      const familyKey = resolveProgramVariationFamilyKey(exercise);
      const variantKey = resolveProgramVariationVariantKey(exercise);
      addFamilyKey(familyKey);
      addVariantKey(variantKey);
      if (options?.slotSignatureId) {
        nextMemory.recentSlotExerciseIds.set(options.slotSignatureId, exerciseId);
        nextMemory.recentSlotFamilyKeys.set(options.slotSignatureId, familyKey);
        nextMemory.recentSlotVariantKeys.set(options.slotSignatureId, variantKey);
        nextMemory.recentSlotFamilySignatures.set(
          options.slotSignatureId,
          `${familyKey}::${variantKey}`
        );
      }
    };

    const addDayTemplateKey = (
      dayTokenRaw: string,
      templateKeyRaw: string | null | undefined
    ) => {
      const templateKey = String(templateKeyRaw ?? "").trim();
      if (!templateKey) return;
      pushVariationMemoryDayValue({
        map: nextMemory.recentDayTemplateKeys,
        dayTokenRaw,
        value: templateKey,
        phaseIndex: summaryPhaseIndex,
      });
    };

    const addDayRoutineLayout = (
      dayTokenRaw: string,
      routineIdsRaw: string[] | null | undefined
    ) => {
      const dayToken = deps.normalizeSlotToken(dayTokenRaw);
      if (!dayToken) return;
      const routineIds = (routineIdsRaw ?? [])
        .map((id) => String(id ?? "").trim())
        .filter((id) => Boolean(id));
      if (!routineIds.length) return;
      const layoutSignatures: string[] = [];
      const familyLayout: string[] = [];
      routineIds.forEach((exerciseId, index) => {
        addResolvedExerciseTraits(exerciseId, {
          slotSignatureId: `${dayToken}-main-${index + 1}`,
        });
        const exercise = deps.exerciseById(exerciseId);
        if (!exercise) return;
        const familyKey = resolveProgramVariationFamilyKey(exercise);
        const variantKey = resolveProgramVariationVariantKey(exercise);
        layoutSignatures.push(`${familyKey}::${variantKey}`);
        familyLayout.push(familyKey);
      });
      if (layoutSignatures.length) {
        pushVariationMemoryDayValue({
          map: nextMemory.recentDayMainLayoutSignatures,
          dayTokenRaw: dayToken,
          value: layoutSignatures.join("|"),
          phaseIndex: summaryPhaseIndex,
        });
        pushVariationMemoryDayValue({
          map: nextMemory.recentDayMainFamilyLayoutSignatures,
          dayTokenRaw: dayToken,
          value: familyLayout.join("|"),
          phaseIndex: summaryPhaseIndex,
        });
      }
    };

    const addDayAccessoryEntries = (
      dayTokenRaw: string,
      accessoryIdsRaw: string[] | null | undefined
    ) => {
      const dayToken = deps.normalizeSlotToken(dayTokenRaw);
      if (!dayToken) return;
      const accessoryIds = (accessoryIdsRaw ?? [])
        .map((id) => String(id ?? "").trim())
        .filter((id) => Boolean(id));
      accessoryIds.forEach((exerciseId, index) => {
        addResolvedExerciseTraits(exerciseId, {
          slotSignatureId: `${dayToken}-accessory-${index + 1}`,
        });
      });
    };

    summary.exerciseIds?.forEach((id) => {
      addExerciseId(id);
    });
    summary.familyKeys?.forEach((familyKey) => {
      addFamilyKey(familyKey);
    });
    summary.variantKeys?.forEach((variantKey) => {
      addVariantKey(variantKey);
    });
    Object.entries(summary.dayTemplateKeys ?? {}).forEach(([dayTokenRaw, templateKey]) => {
      addDayTemplateKey(resolveRecentGenerationDayToken(dayTokenRaw), templateKey);
    });
    Object.entries(summary.days ?? {}).forEach(([dayTokenRaw, daySummary]) => {
      if (!daySummary) return;
      const normalizedDayToken = resolveRecentGenerationDayToken(dayTokenRaw);
      const phaseSummary = resolveRecentGenerationPhaseSummary({
        daySummary,
        summaryPhaseIndex,
      });
      const routineIds = phaseSummary?.routineIds ?? daySummary.routineIds;
      const accessoryIds = phaseSummary?.accessoryIds ?? daySummary.accessoryIds;
      addDayTemplateKey(normalizedDayToken, daySummary.templateKey);
      addDayRoutineLayout(normalizedDayToken, routineIds);
      addDayAccessoryEntries(normalizedDayToken, accessoryIds);
      phaseSummary?.routineFamilyKeys?.forEach((familyKey) => {
        addFamilyKey(familyKey);
      });
      phaseSummary?.accessoryFamilyKeys?.forEach((familyKey) => {
        addFamilyKey(familyKey);
      });
      phaseSummary?.routineVariantKeys?.forEach((variantKey) => {
        addVariantKey(variantKey);
      });
      phaseSummary?.accessoryVariantKeys?.forEach((variantKey) => {
        addVariantKey(variantKey);
      });
      daySummary.familyKeys?.forEach((familyKey) => {
        addFamilyKey(familyKey);
      });
      daySummary.variantKeys?.forEach((variantKey) => {
        addVariantKey(variantKey);
      });
    });

    return nextMemory;
  };

  const clearProgramVariationHistory = () => {
    programVariationHistoryBySettings.clear();
  };

  const resolveProgramVariationState = (params: {
    questionnaire: QuestionnaireData;
    available: Set<Equipment>;
    daysPerWeek: 3 | 4 | 5;
    phaseIndex: number;
    poseFocusTags?: string[];
    baseSeed?: string;
    variation?: ProgramVariationOptions;
  }): ProgramVariationState | null => {
    const {
      questionnaire,
      available,
      daysPerWeek,
      phaseIndex,
      poseFocusTags,
      baseSeed,
      variation,
    } = params;
    const seedToken = String(variation?.seed ?? "").trim();
    const settingsHashToken = String(variation?.settingsHash ?? "").trim();
    const hasExternalSummary = Boolean(variation?.recentGenerationSummary);
    const indexRaw = deps.resolveVariationIndex(variation);
    const useRecentMemory =
      variation?.useRecentMemory ??
      Boolean(seedToken || settingsHashToken || indexRaw > 0 || hasExternalSummary);
    const enabled = Boolean(
      seedToken || settingsHashToken || indexRaw > 0 || useRecentMemory || hasExternalSummary
    );
    if (!enabled) return null;

    const settingsKey =
      settingsHashToken ||
      buildProgramVariationSettingsKey({
        questionnaire,
        available,
        daysPerWeek,
        phaseIndex,
        poseFocusTags,
      });
    const summarySettingsHash = String(
      variation?.recentGenerationSummary?.settingsHash ?? ""
    ).trim();
    const externalSummaryMatchesSettings =
      !summarySettingsHash || summarySettingsHash === settingsKey;
    const externalSummary = externalSummaryMatchesSettings
      ? variation?.recentGenerationSummary
      : undefined;
    const seedKey = [
      "variety",
      settingsKey,
      seedToken || "default",
      String(indexRaw),
      String(baseSeed ?? ""),
    ].join("|");
    const history = useRecentMemory
      ? programVariationHistoryBySettings.get(settingsKey) ?? []
      : [];
    const memory = resolveRecentGenerationMemory({
      memory: aggregateVariationHistory(history),
      summary: externalSummary,
    });

    return {
      enabled: true,
      settingsKey,
      seedKey,
      config: DEFAULT_PROGRAM_VARIATION_CONFIG,
      memory,
      selectedDayTemplateKeys: new Map<string, string>(),
      options: {
        seed: seedToken || undefined,
        variationIndex: indexRaw,
        index: indexRaw,
        useRecentMemory,
        settingsHash: settingsHashToken || undefined,
        recentGenerationSummary: externalSummary,
        initialLiveVariation: variation?.initialLiveVariation ?? false,
      },
    };
  };

  const commitProgramVariationSnapshot = (
    variationState: ProgramVariationState | null,
    week: ProgramDay[]
  ) => {
    if (!variationState?.enabled) return;
    if (!variationState.options.useRecentMemory) return;
    if (variationState.options.recentGenerationSummary) return;
    const history = programVariationHistoryBySettings.get(variationState.settingsKey) ?? [];
    history.push(buildVariationSnapshot(week, variationState.selectedDayTemplateKeys));
    while (history.length > variationState.config.historySize) {
      history.shift();
    }
    programVariationHistoryBySettings.set(variationState.settingsKey, history);
  };

  return {
    clearProgramVariationHistory,
    getVariationMemoryValuesForDayToken,
    resolveProgramVariationFamilyKey,
    resolveProgramVariationVariantKey,
    buildProgramVariationSettingsKey,
    buildVariationSnapshot,
    aggregateVariationHistory,
    resolveRecentGenerationMemory,
    resolveProgramVariationState,
    commitProgramVariationSnapshot,
  };
};
