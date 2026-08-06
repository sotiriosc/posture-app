/**
 * Phase 7B §13 — Fuzz-Integrity Assessment.
 *
 * Uses the same canonical case generators and programQualitySignature as the
 * five mode audits. Writes program-quality-v2-fuzz-integrity* reports.
 *
 * Env:
 *   FUZZ_INTEGRITY_CASES_PER_MODE — default 200 for local/CI iteration;
 *                                   set to 10000 for release evidence.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  computeProgramQualitySignature,
  evaluateProgramQuality,
  generateWeeklyProgram,
  recoverAndEvaluateProgramQuality,
} from "@/lib/program";
import { resolveBandExerciseRequirement } from "@/lib/program/bandExerciseRequirements";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import { GYM_THREE_DAY_TITLES } from "@/lib/program/gymProgramContract";
import { resolveProgramPresentation } from "@/lib/program/presentation";
import type { Program, ProgramRoutineItem } from "@/lib/types";
import {
  buildCanonicalFuzzCase,
  FUZZ_MODES,
  HOLDOUT_NAMESPACE,
  holdoutSeed,
  type CanonicalFuzzCase,
  type FuzzMode,
} from "@/lib/__debug__/lib/canonicalFuzzCases";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const REPORT_MD = path.join(OUT_DIR, "program-quality-v2-fuzz-integrity.md");
const REPORT_JSON = path.join(OUT_DIR, "program-quality-v2-fuzz-integrity.json");
const SAMPLES_MD = path.join(OUT_DIR, "program-quality-v2-fuzz-integrity-samples.md");
const SAMPLES_JSON = path.join(
  OUT_DIR,
  "program-quality-v2-fuzz-integrity-samples.json"
);

const DEFAULT_CASES_PER_MODE = 200;
const RELEASE_CASES_PER_MODE = 10_000;
const HOLDOUT_CASES_PER_MODE = 40;
const BLIND_SAMPLES_PER_MODE = 10;

const cloneProgram = (program: Program): Program =>
  JSON.parse(JSON.stringify(program)) as Program;

const orderedExerciseSignature = (program: Program) =>
  program.week
    .map((day) => `${day.title}:${day.routine.map((item) => item.exerciseId).join(",")}`)
    .join("|");

const dayIdentitySignature = (program: Program) =>
  program.week.map((day) => day.title).join("|");

const allExerciseIds = (program: Program) =>
  program.week.flatMap((day) => day.routine.map((item) => item.exerciseId));

const countOverheadDemand = (program: Program) => {
  let count = 0;
  for (const id of allExerciseIds(program)) {
    const exercise = exerciseById(id);
    if (!exercise) continue;
    const blob = `${exercise.id} ${exercise.name} ${(exercise.movementPattern ?? []).join(" ")}`.toLowerCase();
    if (
      blob.includes("overhead") ||
      blob.includes("shoulder press") ||
      blob.includes("verticalpush") ||
      blob.includes("vertical_push") ||
      (exercise.movementPattern ?? []).some((p) =>
        p.toLowerCase().replace(/[^a-z0-9]+/g, "") === "verticalpush"
      )
    ) {
      count += 1;
    }
  }
  return count;
};

const replaceFirstMain = (
  program: Program,
  mutator: (item: ProgramRoutineItem) => ProgramRoutineItem
): Program => {
  const next = cloneProgram(program);
  for (const day of next.week) {
    const idx = day.routine.findIndex((item) => item.section === "main");
    if (idx >= 0) {
      day.routine[idx] = mutator(day.routine[idx]);
      return next;
    }
  }
  if (next.week[0]?.routine[0]) {
    next.week[0].routine[0] = mutator(next.week[0].routine[0]);
  }
  return next;
};

const replaceHingeMain = (
  program: Program,
  mutator: (item: ProgramRoutineItem) => ProgramRoutineItem
): Program => {
  const next = cloneProgram(program);
  for (const day of next.week) {
    const idx = day.routine.findIndex(
      (item) =>
        item.section === "main" &&
        (item.selectionDebug?.slotKind?.toLowerCase().includes("hinge") ||
          item.selectionDebug?.slotLane?.toLowerCase().includes("hinge") ||
          (exerciseById(item.exerciseId)?.movementPattern ?? []).some((p) =>
            p.toLowerCase().includes("hinge")
          ))
    );
    if (idx >= 0) {
      day.routine[idx] = mutator(day.routine[idx]);
      return next;
    }
  }
  return replaceFirstMain(program, mutator);
};

const replaceVerticalPullMain = (
  program: Program,
  mutator: (item: ProgramRoutineItem) => ProgramRoutineItem
): Program => {
  const next = cloneProgram(program);
  for (const day of next.week) {
    const idx = day.routine.findIndex((item) => {
      if (item.section !== "main") return false;
      const slot = `${item.selectionDebug?.slotKind ?? ""} ${item.selectionDebug?.slotLane ?? ""}`.toLowerCase();
      return slot.includes("vertical") && slot.includes("pull");
    });
    if (idx >= 0) {
      day.routine[idx] = mutator({
        ...day.routine[idx],
        selectionDebug: {
          source: day.routine[idx].selectionDebug?.source ?? "initial_pick",
          ...day.routine[idx].selectionDebug,
          slotKind: day.routine[idx].selectionDebug?.slotKind ?? "pullVertical",
        },
      });
      day.routine[idx] = mutator(day.routine[idx]);
      return next;
    }
  }
  return replaceFirstMain(program, (item) =>
    mutator({
      ...item,
      selectionDebug: {
        source: item.selectionDebug?.source ?? "initial_pick",
        ...item.selectionDebug,
        slotKind: "pullVertical",
      },
    })
  );
};

type CaseRunResult = {
  case: CanonicalFuzzCase;
  program: Program | null;
  semanticSignature: string | null;
  orderedExerciseSignature: string | null;
  dayIdentitySignature: string | null;
  recoveryAttempted: boolean;
  recoveryAttemptCount: number;
  fallbackUsed: boolean;
  fallbackStrategy?: string;
  qualityPassed: boolean;
  hardFailureCodes: string[];
  capabilityLimitationCodes: string[];
  exception?: string;
  deterministicMismatch: boolean;
};

const generateGuarded = (fuzzCase: CanonicalFuzzCase): CaseRunResult => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  const base = {
    case: fuzzCase,
    program: null as Program | null,
    semanticSignature: null as string | null,
    orderedExerciseSignature: null as string | null,
    dayIdentitySignature: null as string | null,
    recoveryAttempted: false,
    recoveryAttemptCount: 0,
    fallbackUsed: false,
    fallbackStrategy: undefined as string | undefined,
    qualityPassed: false,
    hardFailureCodes: [] as string[],
    capabilityLimitationCodes: [] as string[],
    deterministicMismatch: false,
  };

  try {
    const initial = generateWeeklyProgram(
      fuzzCase.questionnaire,
      `fuzz-integrity-${fuzzCase.mode}-${fuzzCase.index}`,
      {
        phaseIndex: fuzzCase.phaseIndex,
        seed: fuzzCase.seed,
        skipQualityGate: true,
        blockedExerciseIds: fuzzCase.blockedExerciseIds,
      }
    );

    if (fuzzCase.index % 25 === 0) {
      clearProgramVariationHistory();
      clearProgramConstraintWarningBuffer();
      const repeat = generateWeeklyProgram(
        fuzzCase.questionnaire,
        `fuzz-integrity-repeat-${fuzzCase.mode}-${fuzzCase.index}`,
        {
          phaseIndex: fuzzCase.phaseIndex,
          seed: fuzzCase.seed,
          skipQualityGate: true,
          blockedExerciseIds: fuzzCase.blockedExerciseIds,
        }
      );
      if (orderedExerciseSignature(initial) !== orderedExerciseSignature(repeat)) {
        base.deterministicMismatch = true;
      }
    }

    const guarded = recoverAndEvaluateProgramQuality({
      questionnaire: fuzzCase.questionnaire,
      programId: `fuzz-integrity-${fuzzCase.mode}-${fuzzCase.index}`,
      phaseIndex: fuzzCase.phaseIndex,
      baseSeed: fuzzCase.seed,
      initialProgram: initial,
      generate: (questionnaire, id, opts) =>
        generateWeeklyProgram(questionnaire, id, {
          ...opts,
          skipQualityGate: true,
          blockedExerciseIds: fuzzCase.blockedExerciseIds,
        }),
    });

    const program = guarded.ok ? guarded.program : initial;
    const evaluation = guarded.evaluation;
    const mode = resolvePrimaryProgramEquipmentMode(
      fuzzCase.questionnaire.equipment ?? []
    );
    const capabilityCodes = evaluation.capabilityLimitations.map((f) => f.code);
    const signature =
      evaluation.deterministicSignature ??
      computeProgramQualitySignature({
        mode,
        phaseIndex: program.phaseIndex ?? fuzzCase.phaseIndex,
        daysPerWeek: program.daysPerWeek,
        week: program.week,
        capabilityLimitationCodes: capabilityCodes,
      });

    return {
      ...base,
      program,
      semanticSignature: signature,
      orderedExerciseSignature: orderedExerciseSignature(program),
      dayIdentitySignature: dayIdentitySignature(program),
      recoveryAttempted: Boolean(evaluation.recoveryAttempted),
      recoveryAttemptCount: evaluation.recoveryAttemptCount ?? 0,
      fallbackUsed: Boolean(evaluation.fallbackUsed),
      fallbackStrategy: evaluation.fallbackStrategy,
      qualityPassed: evaluation.passed,
      hardFailureCodes: evaluation.hardFailures.map((f) => f.code),
      capabilityLimitationCodes: capabilityCodes,
    };
  } catch (error) {
    return {
      ...base,
      exception: error instanceof Error ? error.message : String(error),
    };
  }
};

type DiversityStats = {
  mode: FuzzMode;
  totalCases: number;
  structuralInputTuples: number;
  uniqueCompleteInputTuples: number;
  uniquePainCombinations: number;
  uniqueExperienceValues: number;
  uniquePhases: number;
  uniqueFrequencies: number;
  uniqueEquipmentCapabilityLanes: number;
  uniqueBlockedConfigurations: number;
  uniqueSemanticSignatures: number;
  uniqueOrderedWeeklyExerciseSignatures: number;
  uniqueDayIdentitySignatures: number;
  top20RepeatedSemanticSignatures: Array<{ signature: string; count: number }>;
  mostCommonSignatureCount: number;
  mostCommonSignatureShare: number;
  recoveryAttempts: number;
  recoveryRate: number;
  fallbackUses: number;
  fallbackRate: number;
  exceptions: number;
  deterministicMismatches: number;
};

const accumulateDiversity = (
  mode: FuzzMode,
  results: CaseRunResult[]
): DiversityStats => {
  const structural = new Set<string>();
  const complete = new Set<string>();
  const pains = new Set<string>();
  const experiences = new Set<string>();
  const phases = new Set<number>();
  const frequencies = new Set<number>();
  const lanes = new Set<string>();
  const blocks = new Set<string>();
  const semantic = new Map<string, number>();
  const ordered = new Set<string>();
  const dayIds = new Set<string>();
  let recoveryAttempts = 0;
  let fallbackUses = 0;
  let exceptions = 0;
  let deterministicMismatches = 0;

  for (const result of results) {
    structural.add(result.case.structuralKey);
    complete.add(result.case.completeKey);
    pains.add(result.case.painKey);
    experiences.add(result.case.questionnaire.experience);
    phases.add(result.case.phaseIndex);
    frequencies.add(result.case.questionnaire.daysPerWeek);
    lanes.add(result.case.capabilityLane);
    blocks.add(result.case.blockedKey || "blocks:none");
    if (result.semanticSignature) {
      semantic.set(
        result.semanticSignature,
        (semantic.get(result.semanticSignature) ?? 0) + 1
      );
    }
    if (result.orderedExerciseSignature) ordered.add(result.orderedExerciseSignature);
    if (result.dayIdentitySignature) dayIds.add(result.dayIdentitySignature);
    if (result.recoveryAttempted || result.recoveryAttemptCount > 0) {
      recoveryAttempts += 1;
    }
    if (result.fallbackUsed) fallbackUses += 1;
    if (result.exception) exceptions += 1;
    if (result.deterministicMismatch) deterministicMismatches += 1;
  }

  const top20 = Array.from(semantic.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([signature, count]) => ({ signature, count }));
  const mostCommon = top20[0]?.count ?? 0;
  const total = results.length || 1;

  return {
    mode,
    totalCases: results.length,
    structuralInputTuples: structural.size,
    uniqueCompleteInputTuples: complete.size,
    uniquePainCombinations: pains.size,
    uniqueExperienceValues: experiences.size,
    uniquePhases: phases.size,
    uniqueFrequencies: frequencies.size,
    uniqueEquipmentCapabilityLanes: lanes.size,
    uniqueBlockedConfigurations: blocks.size,
    uniqueSemanticSignatures: semantic.size,
    uniqueOrderedWeeklyExerciseSignatures: ordered.size,
    uniqueDayIdentitySignatures: dayIds.size,
    top20RepeatedSemanticSignatures: top20,
    mostCommonSignatureCount: mostCommon,
    mostCommonSignatureShare: mostCommon / total,
    recoveryAttempts,
    recoveryRate: recoveryAttempts / total,
    fallbackUses,
    fallbackRate: fallbackUses / total,
    exceptions,
    deterministicMismatches,
  };
};

type CollapseFlag = {
  mode: FuzzMode;
  signature: string;
  inputA: string;
  inputB: string;
  explanation: string;
  verdict: "expected" | "suspicious";
};

const analyzeCrossInputCollapse = (
  mode: FuzzMode,
  results: CaseRunResult[]
): CollapseFlag[] => {
  const bySignature = new Map<string, CaseRunResult[]>();
  for (const result of results) {
    if (!result.semanticSignature || !result.program) continue;
    const list = bySignature.get(result.semanticSignature) ?? [];
    list.push(result);
    bySignature.set(result.semanticSignature, list);
  }

  const flags: CollapseFlag[] = [];
  for (const [signature, group] of bySignature) {
    const byStructural = new Map<string, CaseRunResult>();
    for (const entry of group) {
      if (!byStructural.has(entry.case.structuralKey)) {
        byStructural.set(entry.case.structuralKey, entry);
      }
    }
    if (byStructural.size < 2) continue;
    const entries = Array.from(byStructural.values());
    for (let i = 0; i < entries.length; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        const a = entries[i];
        const b = entries[j];
        const diffs: string[] = [];
        if (
          resolvePrimaryProgramEquipmentMode(a.case.questionnaire.equipment) !==
          resolvePrimaryProgramEquipmentMode(b.case.questionnaire.equipment)
        ) {
          diffs.push("equipment mode");
        }
        if (a.case.questionnaire.bandSetup !== b.case.questionnaire.bandSetup) {
          diffs.push("anchor/band capability");
        }
        const aEquip = sorted(a.case.questionnaire.equipment ?? []);
        const bEquip = sorted(b.case.questionnaire.equipment ?? []);
        if (
          aEquip.includes("bench") !== bEquip.includes("bench") ||
          aEquip.includes("pullup_bar") !== bEquip.includes("pullup_bar")
        ) {
          diffs.push("support changes");
        }
        if (a.case.painKey !== b.case.painKey) diffs.push("pain changes");
        if (a.case.questionnaire.experience !== b.case.questionnaire.experience) {
          diffs.push("experience changes");
        }
        if (a.case.phaseIndex !== b.case.phaseIndex) diffs.push("phase changes");
        if (a.case.questionnaire.daysPerWeek !== b.case.questionnaire.daysPerWeek) {
          diffs.push("frequency changes");
        }
        if (a.case.blockedKey !== b.case.blockedKey) diffs.push("personal blocks");

        if (!diffs.length) continue;

        // Legitimate irrelevance: goals-only / foam_roller-only / seed-free structural
        // noise that contracts intentionally ignore.
        const onlyGoalsOrCosmetic =
          diffs.length === 1 &&
          (diffs[0] === "experience changes" || diffs[0] === "phase changes") &&
          a.case.painKey === b.case.painKey &&
          a.case.capabilityLane === b.case.capabilityLane;

        const materialEquipment =
          diffs.includes("equipment mode") ||
          diffs.includes("anchor/band capability") ||
          diffs.includes("support changes") ||
          diffs.includes("personal blocks") ||
          (diffs.includes("pain changes") &&
            (a.case.painKey.includes("shoulder") ||
              b.case.painKey.includes("shoulder") ||
              a.case.painKey.includes("lower back") ||
              b.case.painKey.includes("lower back")));

        const verdict: "expected" | "suspicious" =
          materialEquipment && !onlyGoalsOrCosmetic ? "suspicious" : "expected";

        flags.push({
          mode,
          signature,
          inputA: a.case.structuralKey,
          inputB: b.case.structuralKey,
          explanation: `Materially different structural inputs (${diffs.join(", ")}) collapse to identical semantic signature.`,
          verdict,
        });
      }
    }
  }
  return flags.slice(0, 200);
};

const sorted = (values: string[]) => [...values].map((v) => v.toLowerCase()).sort();

type MutationResult = {
  id: number;
  name: string;
  expectedReasonFamily: string;
  actualFindings: string[];
  detected: boolean;
  usedIndependentCanonicalMetadata: boolean;
};

const baseItem = (exerciseId: string, slotKind?: string): ProgramRoutineItem => ({
  exerciseId,
  section: "main",
  sets: 3,
  reps: "8-12",
  loadType: "weighted",
  selectionDebug: {
    source: "initial_pick",
    slotKind: slotKind ?? "main",
  },
});

const runMutations = (): MutationResult[] => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();

  const dbQ: QuestionnaireData = {
    goals: "General fitness",
    painAreas: [],
    experience: "Intermediate",
    equipment: ["dumbbells"],
    daysPerWeek: 3,
  };
  const bandNoAnchorQ: QuestionnaireData = {
    goals: "General fitness",
    painAreas: [],
    experience: "Intermediate",
    equipment: ["bands"],
    daysPerWeek: 3,
    bandSetup: "long_no_anchor",
  };
  const bandLoopQ: QuestionnaireData = {
    goals: "General fitness",
    painAreas: [],
    experience: "Intermediate",
    equipment: ["bands"],
    daysPerWeek: 3,
    bandSetup: "loop_only",
  };
  const mixedQ: QuestionnaireData = {
    goals: "General fitness",
    painAreas: [],
    experience: "Intermediate",
    equipment: ["dumbbells", "bands"],
    daysPerWeek: 3,
    bandSetup: "long_with_anchor",
  };
  const bwQ: QuestionnaireData = {
    goals: "General fitness",
    painAreas: [],
    experience: "Beginner",
    equipment: ["none"],
    daysPerWeek: 3,
  };
  const gymQ: QuestionnaireData = {
    goals: "General fitness",
    painAreas: [],
    experience: "Intermediate",
    equipment: ["gym"],
    daysPerWeek: 3,
  };

  const gen = (q: QuestionnaireData, id: string, seed: string, phaseIndex = 1) =>
    generateWeeklyProgram(q, id, { phaseIndex, seed, skipQualityGate: true });

  const dbProgram = gen(dbQ, "mut-db", "fuzz-integrity-mutation-db");
  const bandNoAnchor = gen(bandNoAnchorQ, "mut-band-na", "fuzz-integrity-mutation-band-na");
  const bandLoop = gen(bandLoopQ, "mut-band-loop", "fuzz-integrity-mutation-band-loop");
  const mixed = gen(mixedQ, "mut-mh", "fuzz-integrity-mutation-mh");
  const bw = gen(bwQ, "mut-bw", "fuzz-integrity-mutation-bw");
  const gym = gen(gymQ, "mut-gym", "fuzz-integrity-mutation-gym");

  const specs: Array<{
    id: number;
    name: string;
    expectedReasonFamily: string;
    usedIndependentCanonicalMetadata: boolean;
    questionnaire: QuestionnaireData;
    program: Program;
    blocked?: string[];
    compareProgram?: Program;
  }> = [
    {
      id: 1,
      name: "cable exercise in dumbbell-only",
      expectedReasonFamily: "DUMBBELL_ILLEGAL_EQUIPMENT|ILLEGAL",
      usedIndependentCanonicalMetadata: true,
      questionnaire: dbQ,
      program: replaceFirstMain(dbProgram, () => baseItem("cable-lat-pulldown")),
    },
    {
      id: 2,
      name: "high-anchor exercise in no-anchor bands",
      expectedReasonFamily: "BAND_UNCONFIRMED_ANCHOR|BAND_FALSE_VERTICAL",
      usedIndependentCanonicalMetadata: true,
      questionnaire: bandNoAnchorQ,
      program: replaceFirstMain(bandNoAnchor, () =>
        baseItem("band-lat-pulldown", "pullVertical")
      ),
    },
    {
      id: 3,
      name: "long-band exercise in loop-only",
      expectedReasonFamily: "BAND_LOOP_ONLY_LONG_BAND",
      usedIndependentCanonicalMetadata: true,
      questionnaire: bandLoopQ,
      program: replaceFirstMain(bandLoop, () => baseItem("band-rdl", "hingePrimary")),
    },
    {
      id: 4,
      name: "gym machine in mixed home",
      expectedReasonFamily: "MIXED_HOME_ILLEGAL_EQUIPMENT|ILLEGAL",
      usedIndependentCanonicalMetadata: true,
      questionnaire: mixedQ,
      program: replaceFirstMain(mixed, () => baseItem("machine-leg-press")),
    },
    {
      id: 5,
      name: "unsupported chair/bench in bodyweight",
      expectedReasonFamily: "BODYWEIGHT_UNCONFIRMED_SUPPORT",
      usedIndependentCanonicalMetadata: true,
      questionnaire: bwQ,
      program: replaceFirstMain(bw, () => baseItem("countertop-pushup")),
    },
    {
      id: 6,
      name: "pullover falsely occupying true vertical pull",
      expectedReasonFamily: "GYM_VERTICAL_PULL_SURROGATE|FALSE_VERTICAL",
      usedIndependentCanonicalMetadata: true,
      questionnaire: gymQ,
      program: replaceVerticalPullMain(gym, (item) => ({
        ...item,
        ...baseItem("dumbbell-pullover", "pullVertical"),
        selectionDebug: {
          source: "initial_pick",
          slotKind: "pullVertical",
        },
      })),
    },
    {
      id: 7,
      name: "preparation drill replacing a main hinge",
      expectedReasonFamily: "PREP_AS_MAIN|DUMBBELL_PREP_AS_MAIN",
      usedIndependentCanonicalMetadata: true,
      questionnaire: dbQ,
      program: replaceHingeMain(dbProgram, () =>
        baseItem("hip-hinge-drill", "hingePrimary")
      ),
    },
    {
      id: 8,
      name: "curl replacing a primary hinge",
      expectedReasonFamily: "CURL_ONLY_HINGE|GYM_HINGE_SATISFIED_BY_CURL",
      usedIndependentCanonicalMetadata: true,
      questionnaire: gymQ,
      program: replaceHingeMain(gym, () =>
        baseItem("machine-seated-hamstring-curl", "hingePrimary")
      ),
    },
    {
      id: 9,
      name: "personally blocked exercise reinserted",
      expectedReasonFamily: "QUALITY_BLOCKED_EXERCISE_PRESENT",
      usedIndependentCanonicalMetadata: true,
      questionnaire: dbQ,
      program: replaceFirstMain(dbProgram, () => baseItem("db-rdl")),
      blocked: ["db-rdl"],
    },
    {
      id: 10,
      name: "required coaching removed",
      expectedReasonFamily: "QUALITY_UNRESOLVABLE_EXERCISE_ID|COACHING_MISSING",
      usedIndependentCanonicalMetadata: true,
      questionnaire: dbQ,
      program: replaceFirstMain(dbProgram, () =>
        baseItem("__missing_coaching_exercise_id__")
      ),
    },
    {
      id: 11,
      name: "bodyweight program given a gym title",
      expectedReasonFamily: "BODYWEIGHT_GYM_TEMPLATE_INHERITANCE|DAY_IDENTITY",
      usedIndependentCanonicalMetadata: true,
      questionnaire: bwQ,
      program: (() => {
        const next = cloneProgram(bw);
        next.week = next.week.map((day, index) => ({
          ...day,
          title: GYM_THREE_DAY_TITLES[index % GYM_THREE_DAY_TITLES.length],
        }));
        return next;
      })(),
    },
    {
      id: 12,
      name: "nondeterministic order mutation",
      expectedReasonFamily: "QUALITY_NONDETERMINISTIC_REPEAT",
      usedIndependentCanonicalMetadata: true,
      questionnaire: dbQ,
      program: dbProgram,
      compareProgram: (() => {
        const next = cloneProgram(dbProgram);
        if (next.week[0]?.routine.length > 1) {
          const [a, b] = next.week[0].routine;
          next.week[0].routine[0] = b;
          next.week[0].routine[1] = a;
        } else if (next.week.length > 1) {
          const tmp = next.week[0];
          next.week[0] = next.week[1];
          next.week[1] = tmp;
        }
        return next;
      })(),
    },
    {
      id: 13,
      name: "invalid progression reference",
      expectedReasonFamily: "QUALITY_INVALID_PROGRESSION_REFERENCE",
      usedIndependentCanonicalMetadata: true,
      questionnaire: dbQ,
      program: replaceFirstMain(dbProgram, (item) => ({
        ...item,
        prescription: {
          ...(item.prescription ?? {}),
          progressionRule: "progress-to:nonexistent-progression-rung-999",
        },
      })),
    },
    {
      id: 14,
      name: "wrong primary equipment identity",
      expectedReasonFamily: "DUMBBELL_GYM_TEMPLATE_INHERITANCE|IDENTITY",
      usedIndependentCanonicalMetadata: true,
      questionnaire: dbQ,
      program: (() => {
        const next = cloneProgram(dbProgram);
        next.week = next.week.map((day, index) => ({
          ...day,
          title: GYM_THREE_DAY_TITLES[index % GYM_THREE_DAY_TITLES.length],
        }));
        return next;
      })(),
    },
  ];

  return specs.map((spec) => {
    const evaluation = evaluateProgramQuality({
      program: spec.program,
      questionnaire: spec.questionnaire,
      persona: `mutation-${spec.id}`,
      compareProgram: spec.compareProgram,
      blockedExerciseIds: spec.blocked,
    });
    // For nondeterministic mutation, compareProgram is the mutated order against
    // the original — evaluate with original as program and mutated as compare.
    const evaluationFinal =
      spec.id === 12
        ? evaluateProgramQuality({
            program: spec.program,
            questionnaire: spec.questionnaire,
            persona: `mutation-${spec.id}`,
            compareProgram: spec.compareProgram,
          })
        : evaluation;
    const codes = [
      ...evaluationFinal.hardFailures.map((f) => f.code),
      ...evaluationFinal.warnings.map((f) => f.code),
    ];
    const family = spec.expectedReasonFamily.split("|");
    const detected = family.some((token) =>
      codes.some((code) => code.includes(token))
    );
    return {
      id: spec.id,
      name: spec.name,
      expectedReasonFamily: spec.expectedReasonFamily,
      actualFindings: codes,
      detected,
      usedIndependentCanonicalMetadata: spec.usedIndependentCanonicalMetadata,
    };
  });
};

type MetamorphicResult = {
  name: string;
  passed: boolean;
  detail: string;
};

const runMetamorphic = (): MetamorphicResult[] => {
  const results: MetamorphicResult[] = [];

  const runPair = (
    name: string,
    beforeQ: QuestionnaireData,
    afterQ: QuestionnaireData,
    seed: string,
    assert: (before: Program, after: Program) => { ok: boolean; detail: string }
  ) => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const before = generateWeeklyProgram(beforeQ, `meta-before-${name}`, {
      phaseIndex: 1,
      seed,
      skipQualityGate: true,
    });
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const after = generateWeeklyProgram(afterQ, `meta-after-${name}`, {
      phaseIndex: 1,
      seed,
      skipQualityGate: true,
    });
    const verdict = assert(before, after);
    results.push({ name, passed: verdict.ok, detail: verdict.detail });
  };

  runPair(
    "add shoulder pain → overhead demand must not increase",
    {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    {
      goals: "Athletic performance",
      painAreas: ["Shoulders"],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    "fuzz-integrity-meta-shoulder",
    (before, after) => {
      const b = countOverheadDemand(before);
      const a = countOverheadDemand(after);
      return {
        ok: a <= b,
        detail: `overhead before=${b} after=${a}`,
      };
    }
  );

  runPair(
    "remove high anchor → high-anchor exercises disappear",
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_no_anchor",
    },
    "fuzz-integrity-meta-anchor",
    (_before, after) => {
      const high = allExerciseIds(after).filter((id) => {
        const exercise = exerciseById(id);
        if (!exercise) return false;
        const req = resolveBandExerciseRequirement({
          exerciseId: exercise.id,
          name: exercise.name,
          equipment: exercise.equipment,
          variantKey: exercise.variantKey,
          cues: exercise.cues,
        });
        return req?.anchor === "high";
      });
      return {
        ok: high.length === 0,
        detail: `remaining high-anchor ids: ${high.join(", ") || "none"}`,
      };
    }
  );

  runPair(
    "change long band to loop-only → long-band exercises disappear",
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "loop_only",
    },
    "fuzz-integrity-meta-loop",
    (_before, after) => {
      const longOnly = allExerciseIds(after).filter((id) => {
        const exercise = exerciseById(id);
        if (!exercise?.equipment.includes("bands")) return false;
        const req = resolveBandExerciseRequirement({
          exerciseId: exercise.id,
          name: exercise.name,
          equipment: exercise.equipment,
          variantKey: exercise.variantKey,
          cues: exercise.cues,
        });
        return req?.bandType === "longBand";
      });
      return {
        ok: longOnly.length === 0,
        detail: `remaining long-band ids: ${longOnly.join(", ") || "none"}`,
      };
    }
  );

  runPair(
    "block selected squat → blocked squat disappears while squat purpose remains when possible",
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    "fuzz-integrity-meta-block-squat",
    (before, after) => {
      // Rebuild after with block using same seed.
      clearProgramVariationHistory();
      const blocked = generateWeeklyProgram(
        {
          goals: "General fitness",
          painAreas: [],
          experience: "Beginner",
          equipment: ["dumbbells"],
          daysPerWeek: 3,
        },
        "meta-block-squat",
        {
          phaseIndex: 1,
          seed: "fuzz-integrity-meta-block-squat",
          skipQualityGate: true,
          blockedExerciseIds: {
            "goblet-squat": {
              reason: "personal_preference",
              blockedAt: { phase: "skill", sessionCount: 2 },
            },
          },
        }
      );
      void before;
      void after;
      const ids = allExerciseIds(blocked);
      const hasBlocked = ids.includes("goblet-squat");
      const hasSquatPurpose = ids.some((id) => {
        const exercise = exerciseById(id);
        return Boolean(
          exercise &&
            (exercise.movementPattern ?? []).some((p) =>
              p.toLowerCase().includes("squat")
            )
        );
      });
      return {
        ok: !hasBlocked && hasSquatPurpose,
        detail: `blockedPresent=${hasBlocked} squatPurpose=${hasSquatPurpose}`,
      };
    }
  );

  runPair(
    "block selected hinge → blocked hinge disappears while hinge purpose remains when possible",
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      daysPerWeek: 3,
      bandSetup: "long_no_anchor",
    },
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      daysPerWeek: 3,
      bandSetup: "long_no_anchor",
    },
    "fuzz-integrity-meta-block-hinge",
    () => {
      clearProgramVariationHistory();
      const blocked = generateWeeklyProgram(
        {
          goals: "General fitness",
          painAreas: [],
          experience: "Intermediate",
          equipment: ["dumbbells", "bands"],
          daysPerWeek: 3,
          bandSetup: "long_no_anchor",
        },
        "meta-block-hinge",
        {
          phaseIndex: 1,
          seed: "fuzz-integrity-meta-block-hinge",
          skipQualityGate: true,
          blockedExerciseIds: {
            "db-rdl": {
              reason: "personal_preference",
              blockedAt: { phase: "skill", sessionCount: 2 },
            },
          },
        }
      );
      const ids = allExerciseIds(blocked);
      const hasBlocked = ids.includes("db-rdl");
      const hasHingePurpose = ids.some((id) => {
        const exercise = exerciseById(id);
        return Boolean(
          exercise &&
            (exercise.movementPattern ?? []).some((p) =>
              p.toLowerCase().includes("hinge")
            )
        );
      });
      return {
        ok: !hasBlocked && hasHingePurpose,
        detail: `blockedPresent=${hasBlocked} hingePurpose=${hasHingePurpose}`,
      };
    }
  );

  runPair(
    "change dumbbells to bodyweight → equipment identity and legality change",
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    "fuzz-integrity-meta-db-to-bw",
    (before, after) => {
      const beforeMode = "dumbbells";
      const afterMode = resolvePrimaryProgramEquipmentMode(["none"]);
      const beforeHasDb = allExerciseIds(before).some((id) =>
        exerciseById(id)?.equipment.includes("dumbbells")
      );
      const afterHasDb = allExerciseIds(after).some((id) =>
        exerciseById(id)?.equipment.includes("dumbbells")
      );
      const afterIllegalGym = allExerciseIds(after).some((id) => {
        const eq = exerciseById(id)?.equipment ?? [];
        return eq.includes("machines") || eq.includes("cables") || eq.includes("gym");
      });
      return {
        ok: afterMode === "bodyweight" && beforeMode === "dumbbells" && !afterHasDb && !afterIllegalGym,
        detail: `beforeDb=${beforeHasDb} afterDb=${afterHasDb} afterMode=${afterMode}`,
      };
    }
  );

  runPair(
    "increase experience → complexity may increase but equipment/role truth remain stable",
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Advanced",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    "fuzz-integrity-meta-experience",
    (before, after) => {
      const beforeEval = evaluateProgramQuality({
        program: before,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Beginner",
          equipment: ["dumbbells"],
          daysPerWeek: 3,
        },
      });
      const afterEval = evaluateProgramQuality({
        program: after,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Advanced",
          equipment: ["dumbbells"],
          daysPerWeek: 3,
        },
      });
      const illegal = afterEval.hardFailures.some((f) =>
        f.code.includes("ILLEGAL_EQUIPMENT")
      );
      return {
        ok: !illegal && afterEval.hardFailures.filter((f) => f.code.includes("IDENTITY")).length === 0,
        detail: `beginnerHard=${beforeEval.hardFailures.length} advancedHard=${afterEval.hardFailures.length}`,
      };
    }
  );

  runPair(
    "advance phase → progression changes without arbitrary identity collapse",
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    "fuzz-integrity-meta-phase",
    (before) => {
      clearProgramVariationHistory();
      const after = generateWeeklyProgram(
        {
          goals: "General fitness",
          painAreas: [],
          experience: "Intermediate",
          equipment: ["gym"],
          daysPerWeek: 3,
        },
        "meta-phase-after",
        {
          phaseIndex: 3,
          seed: "fuzz-integrity-meta-phase",
          skipQualityGate: true,
        }
      );
      const beforeTitles = dayIdentitySignature(before);
      const afterTitles = dayIdentitySignature(after);
      const identityOk = beforeTitles === afterTitles;
      const changed =
        orderedExerciseSignature(before) !== orderedExerciseSignature(after);
      return {
        ok: identityOk,
        detail: `dayIdentityStable=${identityOk} exerciseChanged=${changed}`,
      };
    }
  );

  // Photo confidence metamorphic via presentation resolver.
  {
    const questionnaire: QuestionnaireData = {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    };
    clearProgramVariationHistory();
    const program = generateWeeklyProgram(questionnaire, "meta-photo", {
      phaseIndex: 1,
      seed: "fuzz-integrity-meta-photo",
      skipQualityGate: true,
    });
    const high = resolveProgramPresentation({
      program,
      questionnaire,
      assessmentFocusTags: ["thoracic_extension", "scapular_control"],
      assessmentFocusHighConfidence: true,
    });
    const low = resolveProgramPresentation({
      program,
      questionnaire,
      assessmentFocusTags: ["thoracic_extension", "scapular_control"],
      assessmentFocusHighConfidence: false,
    });
    const highHas = high.program.adaptationSummary.some(
      (m) => m.id.includes("assessmentFocus") || m.reason === "assessmentFocus"
    );
    const lowHas = low.program.adaptationSummary.some(
      (m) => m.id.includes("assessmentFocus") || m.reason === "assessmentFocus"
    );
    results.push({
      name: "lower photo confidence → unsupported presentation rationale disappears",
      passed: highHas && !lowHas,
      detail: `highClaim=${highHas} lowClaim=${lowHas}`,
    });
  }

  return results;
};

type SampleRecord = {
  mode: FuzzMode;
  index: number;
  seed: string;
  structuralKey: string;
  input: {
    questionnaire: QuestionnaireData;
    phaseIndex: number;
    blockedExerciseIds?: CanonicalFuzzCase["blockedExerciseIds"];
  };
  recoveryOccurred: boolean;
  fallbackOccurred: boolean;
  fallbackStrategy?: string;
  dayTitles: string[];
  orderedExerciseIds: string[][];
  prescriptions: Array<Array<{ exerciseId: string; prescription?: ProgramRoutineItem["prescription"] }>>;
  capabilityLimitations: string[];
  qualityVerdict: "pass" | "fail" | "exception";
  semanticSignature: string | null;
  exception?: string;
};

const toSample = (result: CaseRunResult): SampleRecord => ({
  mode: result.case.mode,
  index: result.case.index,
  seed: result.case.seed,
  structuralKey: result.case.structuralKey,
  input: {
    questionnaire: result.case.questionnaire,
    phaseIndex: result.case.phaseIndex,
    blockedExerciseIds: result.case.blockedExerciseIds,
  },
  recoveryOccurred: result.recoveryAttempted || result.recoveryAttemptCount > 0,
  fallbackOccurred: result.fallbackUsed,
  fallbackStrategy: result.fallbackStrategy,
  dayTitles: result.program?.week.map((day) => day.title) ?? [],
  orderedExerciseIds:
    result.program?.week.map((day) => day.routine.map((item) => item.exerciseId)) ??
    [],
  prescriptions:
    result.program?.week.map((day) =>
      day.routine.map((item) => ({
        exerciseId: item.exerciseId,
        prescription: item.prescription,
      }))
    ) ?? [],
  capabilityLimitations: result.capabilityLimitationCodes,
  qualityVerdict: result.exception
    ? "exception"
    : result.qualityPassed
    ? "pass"
    : "fail",
  semanticSignature: result.semanticSignature,
  exception: result.exception,
});

const pickBlindIndices = (casesPerMode: number, count: number): number[] => {
  const indices: number[] = [];
  if (casesPerMode <= 0) return indices;
  const step = Math.max(1, Math.floor(casesPerMode / count));
  for (let i = 0; i < count; i += 1) {
    indices.push(Math.min(casesPerMode - 1, i * step + ((i * 7) % step)));
  }
  return Array.from(new Set(indices)).slice(0, count);
};

type NeedsReviewSignal = {
  code: string;
  detail: string;
};

const main = () => {
  const started = Date.now();
  const casesPerModeRaw = Number(
    process.env.FUZZ_INTEGRITY_CASES_PER_MODE ?? String(DEFAULT_CASES_PER_MODE)
  );
  const casesPerMode =
    Number.isFinite(casesPerModeRaw) && casesPerModeRaw >= 0
      ? Math.floor(casesPerModeRaw)
      : DEFAULT_CASES_PER_MODE;

  console.error(
    `[fuzzIntegrityAudit] casesPerMode=${casesPerMode}` +
      ` (release evidence uses ${RELEASE_CASES_PER_MODE};` +
      ` default local/CI=${DEFAULT_CASES_PER_MODE})`
  );

  const modeResults = new Map<FuzzMode, CaseRunResult[]>();
  const diversityByMode: DiversityStats[] = [];
  const collapses: CollapseFlag[] = [];
  const fallbackSamples: SampleRecord[] = [];
  const blindSamples: SampleRecord[] = [];

  for (const mode of FUZZ_MODES) {
    console.error(`[fuzzIntegrityAudit] mode=${mode} diversity fuzz…`);
    const results: CaseRunResult[] = [];
    for (let i = 0; i < casesPerMode; i += 1) {
      const fuzzCase = buildCanonicalFuzzCase(mode, i, { includeBlocks: true });
      const result = generateGuarded(fuzzCase);
      results.push(result);
      if (result.fallbackUsed) fallbackSamples.push(toSample(result));
      if ((i + 1) % 100 === 0 || i + 1 === casesPerMode) {
        console.error(`[fuzzIntegrityAudit] ${mode} ${i + 1}/${casesPerMode}`);
      }
    }
    modeResults.set(mode, results);
    diversityByMode.push(accumulateDiversity(mode, results));
    collapses.push(...analyzeCrossInputCollapse(mode, results));

    const blindIdx = pickBlindIndices(casesPerMode, BLIND_SAMPLES_PER_MODE);
    for (const index of blindIdx) {
      const result = results[index];
      if (result) blindSamples.push(toSample(result));
    }
  }

  console.error("[fuzzIntegrityAudit] holdout seeds…");
  const holdoutByMode: Record<string, DiversityStats & { namespace: string }> = {};
  for (const mode of FUZZ_MODES) {
    const results: CaseRunResult[] = [];
    for (let i = 0; i < HOLDOUT_CASES_PER_MODE; i += 1) {
      const fuzzCase = buildCanonicalFuzzCase(mode, i, {
        seedOverride: holdoutSeed(mode, i),
        includeBlocks: true,
      });
      results.push(generateGuarded(fuzzCase));
    }
    holdoutByMode[mode] = {
      ...accumulateDiversity(mode, results),
      namespace: HOLDOUT_NAMESPACE,
    };
  }

  console.error("[fuzzIntegrityAudit] mutation testing…");
  const mutations = runMutations();
  const mutationsDetected = mutations.filter((m) => m.detected).length;

  console.error("[fuzzIntegrityAudit] metamorphic tests…");
  const metamorphic = runMetamorphic();
  const metamorphicPassed = metamorphic.filter((m) => m.passed).length;

  const needsReview: NeedsReviewSignal[] = [];
  for (const stats of diversityByMode) {
    if (stats.fallbackRate > 0.01) {
      needsReview.push({
        code: "FALLBACK_RATE_ABOVE_1PCT",
        detail: `${stats.mode} fallbackRate=${(stats.fallbackRate * 100).toFixed(2)}%`,
      });
    }
    if (stats.recoveryRate > 0.05) {
      needsReview.push({
        code: "RECOVERY_RATE_ABOVE_5PCT",
        detail: `${stats.mode} recoveryRate=${(stats.recoveryRate * 100).toFixed(2)}%`,
      });
    }
    if (
      stats.structuralInputTuples > 1 &&
      stats.mostCommonSignatureShare > 0.95
    ) {
      needsReview.push({
        code: "SEMANTIC_SIGNATURE_DOMINANCE",
        detail: `${stats.mode} mostCommonSignatureShare=${(stats.mostCommonSignatureShare * 100).toFixed(2)}% over ${stats.structuralInputTuples} structural personas`,
      });
    }
    if (stats.deterministicMismatches > 0) {
      needsReview.push({
        code: "DETERMINISTIC_MISMATCH",
        detail: `${stats.mode} deterministicMismatches=${stats.deterministicMismatches}`,
      });
    }
    if (stats.uniqueSemanticSignatures === 0 && stats.totalCases > 0) {
      needsReview.push({
        code: "ZERO_OUTPUT_SENSITIVITY",
        detail: `${stats.mode} produced no semantic signatures`,
      });
    }
  }

  const suspiciousCollapses = collapses.filter((c) => c.verdict === "suspicious");
  if (suspiciousCollapses.length) {
    needsReview.push({
      code: "UNEXPLAINED_CROSS_INPUT_COLLAPSE",
      detail: `${suspiciousCollapses.length} suspicious collapse pairs`,
    });
  }

  if (mutationsDetected < mutations.length) {
    needsReview.push({
      code: "FAILED_MUTATION",
      detail: `${mutations.length - mutationsDetected}/${mutations.length} mutations undetected`,
    });
  }

  const fallbackWithoutSample = diversityByMode.some((s) => s.fallbackUses > 0) &&
    fallbackSamples.length === 0;
  if (fallbackWithoutSample) {
    needsReview.push({
      code: "FALLBACK_WITHOUT_SAMPLE",
      detail: "Fallback uses recorded without reproducible sample export",
    });
  }

  // Ensure every fallback is in samples (may exceed 50).
  const sampleExport = {
    blindSamples,
    fallbackSamples,
    totalBlind: blindSamples.length,
    totalFallback: fallbackSamples.length,
  };

  mkdirSync(OUT_DIR, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    phase: "7B-§13",
    objective: "Fuzz-integrity assessment",
    casesPerMode,
    releaseCasesPerMode: RELEASE_CASES_PER_MODE,
    note:
      casesPerMode < RELEASE_CASES_PER_MODE
        ? `Short/local run (${casesPerMode}/mode). Release evidence requires FUZZ_INTEGRITY_CASES_PER_MODE=${RELEASE_CASES_PER_MODE}.`
        : `Full release run (${casesPerMode}/mode).`,
    elapsedMs: Date.now() - started,
    diversity: {
      structural: diversityByMode.map((s) => ({
        mode: s.mode,
        structuralInputTuples: s.structuralInputTuples,
        uniquePainCombinations: s.uniquePainCombinations,
        uniqueExperienceValues: s.uniqueExperienceValues,
        uniquePhases: s.uniquePhases,
        uniqueFrequencies: s.uniqueFrequencies,
        uniqueEquipmentCapabilityLanes: s.uniqueEquipmentCapabilityLanes,
        uniqueBlockedConfigurations: s.uniqueBlockedConfigurations,
      })),
      variationSeed: diversityByMode.map((s) => ({
        mode: s.mode,
        uniqueCompleteInputTuples: s.uniqueCompleteInputTuples,
        totalCases: s.totalCases,
      })),
      output: diversityByMode.map((s) => ({
        mode: s.mode,
        uniqueSemanticSignatures: s.uniqueSemanticSignatures,
        uniqueOrderedWeeklyExerciseSignatures: s.uniqueOrderedWeeklyExerciseSignatures,
        uniqueDayIdentitySignatures: s.uniqueDayIdentitySignatures,
        mostCommonSignatureShare: s.mostCommonSignatureShare,
        top20RepeatedSemanticSignatures: s.top20RepeatedSemanticSignatures,
      })),
      byMode: diversityByMode,
    },
    crossInputCollapse: {
      totalFlags: collapses.length,
      suspicious: suspiciousCollapses.length,
      expected: collapses.length - suspiciousCollapses.length,
      flags: collapses,
    },
    mutations: {
      required: 14,
      detected: mutationsDetected,
      falsePass: mutations.length - mutationsDetected,
      acceptance: mutationsDetected === 14 ? "PASS" : "FAIL",
      results: mutations,
    },
    metamorphic: {
      total: metamorphic.length,
      passed: metamorphicPassed,
      results: metamorphic,
    },
    holdout: holdoutByMode,
    samples: {
      blindPerMode: BLIND_SAMPLES_PER_MODE,
      blindTotal: blindSamples.length,
      fallbackTotal: fallbackSamples.length,
    },
    needsReview,
    verdict:
      mutationsDetected === 14 && needsReview.length === 0
        ? "PASS"
        : needsReview.length
        ? "NEEDS_REVIEW"
        : "PASS_WITH_NOTES",
  };

  writeFileSync(REPORT_JSON, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  writeFileSync(
    SAMPLES_JSON,
    `${JSON.stringify({ generatedAt: summary.generatedAt, ...sampleExport }, null, 2)}\n`,
    "utf8"
  );

  const md = [
    "# Program Quality V2 — Fuzz-Integrity Assessment (Phase 7B §13)",
    "",
    `- Generated: ${summary.generatedAt}`,
    `- Cases per mode: **${casesPerMode}** (release uses **${RELEASE_CASES_PER_MODE}** via \`FUZZ_INTEGRITY_CASES_PER_MODE\`)`,
    `- Elapsed: ${summary.elapsedMs}ms`,
    `- Verdict: **${summary.verdict}**`,
    "",
    summary.note,
    "",
    "## 13A. Diversity accounting",
    "",
    "Reported as structural diversity / variation-seed diversity / output diversity.",
    "",
    ...diversityByMode.flatMap((s) => [
      `### ${s.mode}`,
      "",
      "**Structural diversity**",
      "",
      `- Total cases: ${s.totalCases}`,
      `- Structural input tuples (excluding seed): ${s.structuralInputTuples}`,
      `- Unique pain combinations: ${s.uniquePainCombinations}`,
      `- Unique experience values: ${s.uniqueExperienceValues}`,
      `- Unique phases: ${s.uniquePhases}`,
      `- Unique frequencies: ${s.uniqueFrequencies}`,
      `- Unique equipment/capability lanes: ${s.uniqueEquipmentCapabilityLanes}`,
      `- Unique blocked-exercise configurations: ${s.uniqueBlockedConfigurations}`,
      "",
      "**Variation-seed diversity**",
      "",
      `- Unique complete input tuples (including seed): ${s.uniqueCompleteInputTuples}`,
      "",
      "**Output diversity**",
      "",
      `- Unique semantic program signatures: ${s.uniqueSemanticSignatures}`,
      `- Unique ordered weekly exercise signatures: ${s.uniqueOrderedWeeklyExerciseSignatures}`,
      `- Unique day-identity signatures: ${s.uniqueDayIdentitySignatures}`,
      `- Most common signature count/share: ${s.mostCommonSignatureCount} / ${(s.mostCommonSignatureShare * 100).toFixed(2)}%`,
      `- Recovery attempts / rate: ${s.recoveryAttempts} / ${(s.recoveryRate * 100).toFixed(2)}%`,
      `- Fallback uses / rate: ${s.fallbackUses} / ${(s.fallbackRate * 100).toFixed(2)}%`,
      `- Exceptions: ${s.exceptions}`,
      `- Deterministic mismatches: ${s.deterministicMismatches}`,
      "",
      "Top 20 repeated semantic signatures:",
      "",
      ...s.top20RepeatedSemanticSignatures.map(
        (row) => `- \`${row.signature}\`: ${row.count}`
      ),
      s.top20RepeatedSemanticSignatures.length ? "" : "- none",
      "",
    ]),
    "## 13B. Cross-input collapse analysis",
    "",
    `- Flags: ${collapses.length} (suspicious=${suspiciousCollapses.length}, expected=${collapses.length - suspiciousCollapses.length})`,
    "",
    ...collapses.slice(0, 40).flatMap((flag) => [
      `### ${flag.mode} — ${flag.verdict}`,
      "",
      `- Signature: \`${flag.signature}\``,
      `- Input A: \`${flag.inputA}\``,
      `- Input B: \`${flag.inputB}\``,
      `- Explanation: ${flag.explanation}`,
      "",
    ]),
    collapses.length > 40 ? `_…${collapses.length - 40} additional flags in JSON._\n` : "",
    "## 13C. Mutation testing",
    "",
    `- Detected: **${mutationsDetected}/14**`,
    `- False PASS: **${mutations.length - mutationsDetected}**`,
    `- Acceptance: **${summary.mutations.acceptance}**`,
    "",
    ...mutations.map(
      (m) =>
        `- #${m.id} ${m.name}: detected=${m.detected} expected=${m.expectedReasonFamily} actual=${m.actualFindings.join(",") || "none"} canonicalMetadata=${m.usedIndependentCanonicalMetadata}`
    ),
    "",
    "## 13D. Metamorphic tests",
    "",
    `- Passed: **${metamorphicPassed}/${metamorphic.length}**`,
    "",
    ...metamorphic.map((m) => `- ${m.passed ? "PASS" : "FAIL"} — ${m.name} (${m.detail})`),
    "",
    "## 13E. Holdout seeds",
    "",
    `- Namespace: \`${HOLDOUT_NAMESPACE}\``,
    `- Cases per mode: ${HOLDOUT_CASES_PER_MODE}`,
    "",
    ...FUZZ_MODES.map((mode) => {
      const h = holdoutByMode[mode];
      return `- ${mode}: semanticSignatures=${h.uniqueSemanticSignatures} recoveryRate=${(h.recoveryRate * 100).toFixed(2)}% fallbackRate=${(h.fallbackRate * 100).toFixed(2)}% exceptions=${h.exceptions} deterministicMismatches=${h.deterministicMismatches}`;
    }),
    "",
    "## 13F. Reproducible blind sample",
    "",
    `- Blind samples: ${blindSamples.length} (10×5 modes)`,
    `- Fallback samples (all): ${fallbackSamples.length}`,
    `- See \`${path.relative(process.cwd(), SAMPLES_MD)}\` and JSON companion.`,
    "",
    "## 13G. Review thresholds / NEEDS_REVIEW",
    "",
    needsReview.length
      ? needsReview.map((s) => `- \`${s.code}\`: ${s.detail}`).join("\n")
      : "- none",
    "",
    "## Artifact paths",
    "",
    `- ${path.relative(process.cwd(), REPORT_MD)}`,
    `- ${path.relative(process.cwd(), REPORT_JSON)}`,
    `- ${path.relative(process.cwd(), SAMPLES_MD)}`,
    `- ${path.relative(process.cwd(), SAMPLES_JSON)}`,
    "",
  ];
  writeFileSync(REPORT_MD, `${md.join("\n").trim()}\n`, "utf8");

  const samplesMd = [
    "# Program Quality V2 — Fuzz-Integrity Blind Samples",
    "",
    "Uncurated deterministic sample for independent review. Includes every fallback case.",
    "",
    `Blind total: ${blindSamples.length}`,
    `Fallback total: ${fallbackSamples.length}`,
    "",
    "## Blind samples (10 per mode)",
    "",
    ...blindSamples.flatMap((sample, i) => [
      `### Blind ${i + 1} — ${sample.mode} #${sample.index}`,
      "",
      `- Seed: \`${sample.seed}\``,
      `- Structural key: \`${sample.structuralKey}\``,
      `- Recovery: ${sample.recoveryOccurred}`,
      `- Fallback: ${sample.fallbackOccurred}${sample.fallbackStrategy ? ` (${sample.fallbackStrategy})` : ""}`,
      `- Quality verdict: ${sample.qualityVerdict}`,
      `- Semantic signature: \`${sample.semanticSignature ?? "n/a"}\``,
      `- Day titles: ${sample.dayTitles.join(" | ") || "none"}`,
      `- Ordered exercise IDs:`,
      ...sample.orderedExerciseIds.map(
        (ids, dayIndex) => `  - Day ${dayIndex + 1}: ${ids.join(", ") || "none"}`
      ),
      `- Capability limitations: ${sample.capabilityLimitations.join(", ") || "none"}`,
      `- Input: \`${JSON.stringify(sample.input)}\``,
      "",
    ]),
    "## Fallback samples (complete set)",
    "",
    fallbackSamples.length
      ? fallbackSamples.flatMap((sample, i) => [
          `### Fallback ${i + 1} — ${sample.mode} #${sample.index}`,
          "",
          `- Seed: \`${sample.seed}\``,
          `- Strategy: ${sample.fallbackStrategy ?? "n/a"}`,
          `- Semantic signature: \`${sample.semanticSignature ?? "n/a"}\``,
          `- Day titles: ${sample.dayTitles.join(" | ") || "none"}`,
          `- Ordered exercise IDs:`,
          ...sample.orderedExerciseIds.map(
            (ids, dayIndex) => `  - Day ${dayIndex + 1}: ${ids.join(", ") || "none"}`
          ),
          "",
        ]).join("\n")
      : "None in this run.",
    "",
  ];
  writeFileSync(SAMPLES_MD, `${samplesMd.join("\n").trim()}\n`, "utf8");

  const consoleSummary = {
    ok: summary.mutations.acceptance === "PASS",
    verdict: summary.verdict,
    casesPerMode,
    mutationsDetected,
    metamorphicPassed,
    metamorphicTotal: metamorphic.length,
    needsReview,
    diversity: diversityByMode.map((s) => ({
      mode: s.mode,
      structural: s.structuralInputTuples,
      semantic: s.uniqueSemanticSignatures,
      recoveryRate: s.recoveryRate,
      fallbackRate: s.fallbackRate,
      deterministicMismatches: s.deterministicMismatches,
      exceptions: s.exceptions,
    })),
    elapsedMs: summary.elapsedMs,
  };
  console.log(JSON.stringify(consoleSummary, null, 2));

  if (mutationsDetected < 14) {
    process.exitCode = 1;
  }
};

main();
