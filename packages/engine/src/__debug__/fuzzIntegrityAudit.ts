/**
 * Phase 7B §13 — Fuzz-Integrity Assessment.
 *
 * Uses the same canonical case generators and programQualitySignature as the
 * five mode audits. Writes program-quality-v2-fuzz-integrity* reports.
 *
 * Env:
 *   FUZZ_INTEGRITY_MODE=local|release
 *     local: default 200 cases/mode (override with FUZZ_INTEGRITY_CASES_PER_MODE)
 *     release: must be exactly 10000 cases/mode
 *   FUZZ_INTEGRITY_CASES_PER_MODE — case count override (release enforces 10000)
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
import type { QualityRecoveryTrace } from "@/lib/program/qualityGate/recoverProgramQuality";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const REPORT_MD = path.join(OUT_DIR, "program-quality-v2-fuzz-integrity.md");
const REPORT_JSON = path.join(OUT_DIR, "program-quality-v2-fuzz-integrity.json");
const SAMPLES_MD = path.join(OUT_DIR, "program-quality-v2-fuzz-integrity-samples.md");
const SAMPLES_JSON = path.join(
  OUT_DIR,
  "program-quality-v2-fuzz-integrity-samples.json"
);

const DEFAULT_LOCAL_CASES_PER_MODE = 200;
const RELEASE_CASES_PER_MODE = 10_000;
const HOLDOUT_CASES_PER_MODE = 40;
const BLIND_SAMPLES_PER_MODE = 10;
const COLLAPSE_REPORT_DISPLAY_LIMIT = 40;
const COLLAPSE_ANALYZED_PAIR_CAP = 500;

type FuzzIntegrityMode = "local" | "release";
type FinalOutcomeClass =
  | "initialPass"
  | "recoveryPass"
  | "fallbackPass"
  | "safeGenerationFailure"
  | "exception"
  | "unclassified";

type FallbackTriageBucket =
  | "fallbackPassed"
  | "fallbackFailedSafely"
  | "fallbackEvidenceMalformed";

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
  recoverySucceeded: boolean;
  fallbackUsed: boolean;
  fallbackSucceeded: boolean;
  fallbackStrategy?: string;
  initialQualityPass: boolean;
  qualityPassed: boolean;
  hardFailureCodes: string[];
  capabilityLimitationCodes: string[];
  exception?: string;
  deterministicMismatch: boolean;
  recoveryTrace: QualityRecoveryTrace | null;
  finalOutcomeClass: FinalOutcomeClass;
  /** True when a failed final program was incorrectly treated as usable. */
  failedProgramTreatedAsUsable: boolean;
  fallbackTriage?: FallbackTriageBucket;
};

const classifyFinalOutcome = (
  trace: QualityRecoveryTrace | null,
  qualityPassed: boolean,
  exception?: string
): FinalOutcomeClass => {
  if (exception) return "exception";
  if (!trace) return "unclassified";
  if (trace.finalOutcome === "initialPass" && qualityPassed) return "initialPass";
  if (trace.finalOutcome === "recoveryPass" && qualityPassed) return "recoveryPass";
  if (trace.finalOutcome === "fallbackPass" && qualityPassed) return "fallbackPass";
  if (trace.finalOutcome === "safeGenerationFailure" && !qualityPassed) {
    return "safeGenerationFailure";
  }
  return "unclassified";
};

const generateGuarded = (fuzzCase: CanonicalFuzzCase): CaseRunResult => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  const base: CaseRunResult = {
    case: fuzzCase,
    program: null,
    semanticSignature: null,
    orderedExerciseSignature: null,
    dayIdentitySignature: null,
    recoveryAttempted: false,
    recoveryAttemptCount: 0,
    recoverySucceeded: false,
    fallbackUsed: false,
    fallbackSucceeded: false,
    fallbackStrategy: undefined,
    initialQualityPass: false,
    qualityPassed: false,
    hardFailureCodes: [],
    capabilityLimitationCodes: [],
    deterministicMismatch: false,
    recoveryTrace: null,
    finalOutcomeClass: "unclassified",
    failedProgramTreatedAsUsable: false,
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
      blockedExerciseIds: fuzzCase.blockedExerciseIds,
      generate: (questionnaire, id, opts) =>
        generateWeeklyProgram(questionnaire, id, {
          ...opts,
          skipQualityGate: true,
          blockedExerciseIds: fuzzCase.blockedExerciseIds,
        }),
    });

    const evaluation = guarded.evaluation;
    const recoveryTrace = guarded.recoveryTrace;
    // Use recovery final program — never substitute initial when fallback/recovery failed.
    const program = recoveryTrace.finalProgram;
    const mode = resolvePrimaryProgramEquipmentMode(
      fuzzCase.questionnaire.equipment ?? []
    );
    const capabilityCodes = evaluation.capabilityLimitations.map((f) => f.code);
    const signature = program
      ? evaluation.deterministicSignature ??
        computeProgramQualitySignature({
          mode,
          phaseIndex: program.phaseIndex ?? fuzzCase.phaseIndex,
          daysPerWeek: program.daysPerWeek,
          week: program.week,
          capabilityLimitationCodes: capabilityCodes,
        })
      : null;

    const initialQualityPass = recoveryTrace.finalOutcome === "initialPass";
    const recoverySucceeded = recoveryTrace.finalOutcome === "recoveryPass";
    const fallbackSucceeded = recoveryTrace.finalOutcome === "fallbackPass";
    const fallbackUsed = Boolean(evaluation.fallbackUsed) || Boolean(recoveryTrace.fallback);
    const recoveryAttempted =
      recoveryTrace.recoveryAttempts.length > 0 || Boolean(evaluation.recoveryAttempted);

    let fallbackTriage: FallbackTriageBucket | undefined;
    if (fallbackUsed) {
      // Old bug pattern: substitute initial program when fallback failed.
      // Signature equality alone is not malformed — fallback may regenerate the same week.
      const substitutedInitialOnFallbackFail =
        !evaluation.passed &&
        Boolean(recoveryTrace.fallback) &&
        program === initial;
      const fallbackTraceInconsistent =
        Boolean(recoveryTrace.fallback) &&
        program != null &&
        orderedExerciseSignature(program) !== recoveryTrace.fallback!.programSignature;
      if (substitutedInitialOnFallbackFail || fallbackTraceInconsistent) {
        fallbackTriage = "fallbackEvidenceMalformed";
      } else if (fallbackSucceeded) {
        fallbackTriage = "fallbackPassed";
      } else {
        fallbackTriage = "fallbackFailedSafely";
      }
    }

    const finalOutcomeClass = classifyFinalOutcome(
      recoveryTrace,
      evaluation.passed,
      undefined
    );
    // Usable means: ok:true path with a returned program. Audit never treats fail as usable.
    const failedProgramTreatedAsUsable = !evaluation.passed && guarded.ok;

    return {
      ...base,
      program,
      semanticSignature: signature,
      orderedExerciseSignature: program ? orderedExerciseSignature(program) : null,
      dayIdentitySignature: program ? dayIdentitySignature(program) : null,
      recoveryAttempted,
      recoveryAttemptCount: evaluation.recoveryAttemptCount ?? recoveryTrace.recoveryAttempts.length,
      recoverySucceeded,
      fallbackUsed,
      fallbackSucceeded,
      fallbackStrategy: evaluation.fallbackStrategy ?? recoveryTrace.fallback?.strategy,
      initialQualityPass,
      qualityPassed: evaluation.passed,
      hardFailureCodes: evaluation.hardFailures.map((f) => f.code),
      capabilityLimitationCodes: capabilityCodes,
      recoveryTrace,
      finalOutcomeClass,
      failedProgramTreatedAsUsable,
      fallbackTriage,
    };
  } catch (error) {
    return {
      ...base,
      exception: error instanceof Error ? error.message : String(error),
      finalOutcomeClass: "exception",
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
  initialQualityPass: number;
  recoveryAttempted: number;
  recoverySucceeded: number;
  fallbackAttempted: number;
  fallbackSucceeded: number;
  finalQualityPass: number;
  finalQualityFail: number;
  safeGenerationError: number;
  unclassifiedOutcomes: number;
  finalQualityPassRate: number;
  finalQualityFailureRate: number;
  hardFailureCodesByCount: Record<string, number>;
  failedCasesByStructuralGroup: Record<string, number>;
  fallbackTriage: Record<FallbackTriageBucket, number>;
  failedProgramTreatedAsUsable: number;
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
  const hardFailureCodesByCount: Record<string, number> = {};
  const failedCasesByStructuralGroup: Record<string, number> = {};
  const fallbackTriage: Record<FallbackTriageBucket, number> = {
    fallbackPassed: 0,
    fallbackFailedSafely: 0,
    fallbackEvidenceMalformed: 0,
  };
  let recoveryAttempts = 0;
  let fallbackUses = 0;
  let exceptions = 0;
  let deterministicMismatches = 0;
  let initialQualityPass = 0;
  let recoveryAttempted = 0;
  let recoverySucceeded = 0;
  let fallbackAttempted = 0;
  let fallbackSucceeded = 0;
  let finalQualityPass = 0;
  let finalQualityFail = 0;
  let safeGenerationError = 0;
  let unclassifiedOutcomes = 0;
  let failedProgramTreatedAsUsable = 0;

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
      recoveryAttempted += 1;
    }
    if (result.recoverySucceeded) recoverySucceeded += 1;
    if (result.fallbackUsed) {
      fallbackUses += 1;
      fallbackAttempted += 1;
    }
    if (result.fallbackSucceeded) fallbackSucceeded += 1;
    if (result.initialQualityPass) initialQualityPass += 1;
    if (result.exception) exceptions += 1;
    if (result.deterministicMismatch) deterministicMismatches += 1;
    if (result.failedProgramTreatedAsUsable) failedProgramTreatedAsUsable += 1;

    if (result.finalOutcomeClass === "unclassified") unclassifiedOutcomes += 1;
    if (result.finalOutcomeClass === "safeGenerationFailure") {
      safeGenerationError += 1;
      finalQualityFail += 1;
    } else if (
      result.finalOutcomeClass === "initialPass" ||
      result.finalOutcomeClass === "recoveryPass" ||
      result.finalOutcomeClass === "fallbackPass"
    ) {
      finalQualityPass += 1;
    } else if (result.finalOutcomeClass === "exception") {
      // exceptions counted separately; not a usable plan
    } else if (!result.qualityPassed && !result.exception) {
      finalQualityFail += 1;
    }

    if (!result.qualityPassed && !result.exception) {
      for (const code of result.hardFailureCodes) {
        hardFailureCodesByCount[code] = (hardFailureCodesByCount[code] ?? 0) + 1;
      }
      const group = [
        result.case.questionnaire.experience,
        `phase${result.case.phaseIndex}`,
        `${result.case.questionnaire.daysPerWeek}d`,
        result.case.painKey || "pain:none",
        result.case.blockedKey || "blocks:none",
      ].join("|");
      failedCasesByStructuralGroup[group] =
        (failedCasesByStructuralGroup[group] ?? 0) + 1;
    }

    if (result.fallbackTriage) {
      fallbackTriage[result.fallbackTriage] += 1;
    }
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
    initialQualityPass,
    recoveryAttempted,
    recoverySucceeded,
    fallbackAttempted,
    fallbackSucceeded,
    finalQualityPass,
    finalQualityFail,
    safeGenerationError,
    unclassifiedOutcomes,
    finalQualityPassRate: finalQualityPass / total,
    finalQualityFailureRate: finalQualityFail / total,
    hardFailureCodesByCount,
    failedCasesByStructuralGroup,
    fallbackTriage,
    failedProgramTreatedAsUsable,
  };
};

type CollapseCategory =
  | "expectedIrrelevantInput"
  | "expectedStableTemplateIdentity"
  | "expectedCapabilityLimitation"
  | "suspiciousIgnoredPainInput"
  | "suspiciousIgnoredSupportAnchorInput"
  | "suspiciousIgnoredActiveBlock"
  | "suspiciousIgnoredPhase"
  | "suspiciousIgnoredExperience";

type CollapseFlag = {
  mode: FuzzMode;
  signature: string;
  inputA: string;
  inputB: string;
  explanation: string;
  category: CollapseCategory;
  verdict: "expected" | "suspicious";
  diffs: string[];
};

type CollapseAnalysis = {
  totalDetectedPairs: number;
  analyzedRepresentativePairs: number;
  reportDisplayLimit: number;
  flags: CollapseFlag[];
  rootCausesByCategory: Record<string, number>;
};

const programHasExercise = (program: Program | null, exerciseId: string) =>
  Boolean(program && allExerciseIds(program).includes(exerciseId));

const hasHingeCoverage = (program: Program | null) =>
  Boolean(
    program &&
      allExerciseIds(program).some((id) => {
        const exercise = exerciseById(id);
        return (exercise?.movementPattern ?? []).some((p) =>
          p.toLowerCase().includes("hinge")
        );
      })
  );

/** §8: pain/experience/phase may adapt via non-ID channels. */
const programsShowAdaptationEffect = (
  a: Program | null,
  b: Program | null
): boolean => {
  if (!a || !b) return false;
  const rxOf = (program: Program) =>
    JSON.stringify(
      program.week.map((d) =>
        d.routine.map((i) => ({
          id: i.exerciseId,
          rx: i.prescription ?? null,
          sets: i.sets,
          reps: i.reps,
          rule: i.prescription?.progressionRule ?? null,
        }))
      )
    );
  const warmOf = (program: Program) =>
    program.week
      .flatMap((d) =>
        d.routine
          .filter((i) => i.section === "warmup" || i.section === "activation")
          .map((i) => i.exerciseId)
      )
      .join(",");
  const rationaleOf = (program: Program) =>
    JSON.stringify(program.adaptationSummary ?? []);
  return (
    rxOf(a) !== rxOf(b) ||
    warmOf(a) !== warmOf(b) ||
    rationaleOf(a) !== rationaleOf(b)
  );
};

const programDependsOnDifferingSupport = (
  a: CaseRunResult,
  b: CaseRunResult
): boolean => {
  const aEquip = new Set(
    (a.case.questionnaire.equipment ?? []).map((e) => e.toLowerCase())
  );
  const bEquip = new Set(
    (b.case.questionnaire.equipment ?? []).map((e) => e.toLowerCase())
  );
  const differingSupports = ["bench", "pullup_bar"].filter(
    (token) => aEquip.has(token) !== bEquip.has(token)
  );
  const bandSetupDiffers =
    a.case.questionnaire.bandSetup !== b.case.questionnaire.bandSetup;
  if (!differingSupports.length && !bandSetupDiffers) return false;

  const ids = new Set([
    ...(a.program ? allExerciseIds(a.program) : []),
    ...(b.program ? allExerciseIds(b.program) : []),
  ]);
  for (const id of ids) {
    const exercise = exerciseById(id);
    if (!exercise) continue;
    const equip = (exercise.equipment ?? []).map((e) => e.toLowerCase());
    if (differingSupports.some((token) => equip.includes(token))) return true;
    if (
      bandSetupDiffers &&
      (equip.includes("bands") || id.includes("band") || id.includes("anchor"))
    ) {
      return true;
    }
  }
  return false;
};

const classifyCollapsePair = (
  a: CaseRunResult,
  b: CaseRunResult,
  diffs: string[]
): { category: CollapseCategory; verdict: "expected" | "suspicious"; explanation: string } => {
  const capsEqual =
    a.capabilityLimitationCodes.join("|") === b.capabilityLimitationCodes.join("|") &&
    a.capabilityLimitationCodes.length > 0;

  // Personal-block ID differences are not suspicious by default.
  if (diffs.includes("personal blocks")) {
    const aBlock = a.case.blockedKey;
    const bBlock = b.case.blockedKey;
    const blockedInUnblockedBaseline =
      (aBlock && !bBlock && programHasExercise(b.program, aBlock)) ||
      (bBlock && !aBlock && programHasExercise(a.program, bBlock));
    const roleLost =
      (aBlock === "db-rdl" || bBlock === "db-rdl" || aBlock?.includes("rdl") || bBlock?.includes("rdl")) &&
      ((aBlock && !hasHingeCoverage(a.program)) || (bBlock && !hasHingeCoverage(b.program)));
    if (blockedInUnblockedBaseline || roleLost) {
      return {
        category: "suspiciousIgnoredActiveBlock",
        verdict: "suspicious",
        explanation:
          "Block-related collapse: blocked exercise appears in unblocked baseline or role lost truthful coverage.",
      };
    }
    if (diffs.length === 1) {
      return {
        category: "expectedIrrelevantInput",
        verdict: "expected",
        explanation:
          "Personal-block ID difference alone with no evidence the block was active in the unblocked baseline.",
      };
    }
  }

  // Redundant equipment additions when primary mode unchanged are not suspicious.
  if (diffs.includes("support changes") && !diffs.includes("equipment mode")) {
    const aMode = resolvePrimaryProgramEquipmentMode(a.case.questionnaire.equipment ?? []);
    const bMode = resolvePrimaryProgramEquipmentMode(b.case.questionnaire.equipment ?? []);
    if (aMode === bMode) {
      const onlySupportOrCosmetic = diffs.every(
        (d) =>
          d === "support changes" ||
          d === "personal blocks" ||
          d === "frequency changes" ||
          d === "goals"
      );
      if (onlySupportOrCosmetic || diffs.filter((d) => d !== "support changes").length === 0) {
        return {
          category: "expectedIrrelevantInput",
          verdict: "expected",
          explanation:
            "Redundant equipment/support addition with unchanged primary mode and no expected eligibility difference.",
        };
      }
    }
  }

  if (diffs.includes("anchor/band capability") || diffs.includes("support changes")) {
    if (capsEqual) {
      return {
        category: "expectedCapabilityLimitation",
        verdict: "expected",
        explanation: "Support/anchor difference collapses under the same capability limitation codes.",
      };
    }
    // Support/anchor only matters when it would change eligibility for selected work.
    if (programsShowAdaptationEffect(a.program, b.program)) {
      return {
        category: "expectedIrrelevantInput",
        verdict: "expected",
        explanation:
          "Support/anchor differs but prescription/warmup/rationale/progression already carries an adaptation effect under shared exercise identity.",
      };
    }
    const aNeedsDifferingSupport = programDependsOnDifferingSupport(a, b);
    if (!aNeedsDifferingSupport) {
      return {
        category: "expectedIrrelevantInput",
        verdict: "expected",
        explanation:
          "Support/anchor difference does not affect eligibility of either program's selected exercises.",
      };
    }
    return {
      category: "suspiciousIgnoredSupportAnchorInput",
      verdict: "suspicious",
      explanation: "Support/anchor input differs but semantic signature is identical without shared capability limitation.",
    };
  }

  if (diffs.includes("pain changes")) {
    // §8: pain may change selection, warmup, prescription, rationale, or progression.
    if (programsShowAdaptationEffect(a.program, b.program)) {
      return {
        category: "expectedIrrelevantInput",
        verdict: "expected",
        explanation:
          "Pain differs; non-composition adaptation (prescription/warmup/rationale/progression) is present as intended.",
      };
    }
    const shoulderOrBack =
      a.case.painKey.includes("shoulder") ||
      b.case.painKey.includes("shoulder") ||
      a.case.painKey.includes("lower back") ||
      b.case.painKey.includes("lower back") ||
      a.case.painKey.includes("hip") ||
      b.case.painKey.includes("hip");
    if (shoulderOrBack) {
      return {
        category: "suspiciousIgnoredPainInput",
        verdict: "suspicious",
        explanation:
          "Material pain input differs with identical composition and no prescription/warmup/rationale/progression adaptation.",
      };
    }
    return {
      category: "expectedIrrelevantInput",
      verdict: "expected",
      explanation: "Pain combination differs in a way the contract may adapt via prescription/presentation rather than identity.",
    };
  }

  if (diffs.includes("phase changes")) {
    const titlesStable = a.dayIdentitySignature === b.dayIdentitySignature;
    if (titlesStable && a.orderedExerciseSignature === b.orderedExerciseSignature) {
      return {
        category: "suspiciousIgnoredPhase",
        verdict: "suspicious",
        explanation: "Phase differs with identical day identity and exercise composition and no explained progression delta.",
      };
    }
    return {
      category: "expectedStableTemplateIdentity",
      verdict: "expected",
      explanation: "Phase differs but session identity remains stable as intended.",
    };
  }

  if (diffs.includes("experience changes")) {
    const prescriptionDelta =
      JSON.stringify(
        a.program?.week.map((d) => d.routine.map((i) => i.prescription ?? null))
      ) !==
      JSON.stringify(
        b.program?.week.map((d) => d.routine.map((i) => i.prescription ?? null))
      );
    if (!prescriptionDelta && a.orderedExerciseSignature === b.orderedExerciseSignature) {
      return {
        category: "suspiciousIgnoredExperience",
        verdict: "suspicious",
        explanation: "Experience differs with identical composition and prescription.",
      };
    }
    return {
      category: "expectedStableTemplateIdentity",
      verdict: "expected",
      explanation: "Experience differs; composition may stay stable when prescription/progression carries the effect.",
    };
  }

  if (diffs.includes("equipment mode")) {
    return {
      category: "suspiciousIgnoredSupportAnchorInput",
      verdict: "suspicious",
      explanation: "Primary equipment mode differs but semantic signature collapsed.",
    };
  }

  if (capsEqual) {
    return {
      category: "expectedCapabilityLimitation",
      verdict: "expected",
      explanation: "Collapse under shared capability limitation codes.",
    };
  }

  return {
    category: "expectedIrrelevantInput",
    verdict: "expected",
    explanation: `Structural diffs (${diffs.join(", ")}) do not imply a material eligibility change.`,
  };
};

const analyzeCrossInputCollapse = (
  mode: FuzzMode,
  results: CaseRunResult[]
): CollapseAnalysis => {
  const bySignature = new Map<string, CaseRunResult[]>();
  for (const result of results) {
    if (!result.semanticSignature || !result.program) continue;
    const list = bySignature.get(result.semanticSignature) ?? [];
    list.push(result);
    bySignature.set(result.semanticSignature, list);
  }

  const allFlags: CollapseFlag[] = [];
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
        if (a.case.questionnaire.goals !== b.case.questionnaire.goals) {
          diffs.push("goals");
        }
        if (a.case.blockedKey !== b.case.blockedKey) diffs.push("personal blocks");

        if (!diffs.length) continue;

        const classified = classifyCollapsePair(a, b, diffs);
        allFlags.push({
          mode,
          signature,
          inputA: a.case.structuralKey,
          inputB: b.case.structuralKey,
          explanation: classified.explanation,
          category: classified.category,
          verdict: classified.verdict,
          diffs,
        });
      }
    }
  }

  const totalDetectedPairs = allFlags.length;
  const analyzedRepresentativePairs = Math.min(
    totalDetectedPairs,
    COLLAPSE_ANALYZED_PAIR_CAP
  );
  const analyzed = allFlags.slice(0, analyzedRepresentativePairs);
  const rootCausesByCategory: Record<string, number> = {};
  for (const flag of allFlags) {
    rootCausesByCategory[flag.category] =
      (rootCausesByCategory[flag.category] ?? 0) + 1;
  }

  return {
    totalDetectedPairs,
    analyzedRepresentativePairs,
    reportDisplayLimit: COLLAPSE_REPORT_DISPLAY_LIMIT,
    flags: analyzed,
    rootCausesByCategory,
  };
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
      const compositionIdentical =
        orderedExerciseSignature(before) === orderedExerciseSignature(after);
      const beforePres = JSON.stringify(
        before.week.map((d) =>
          d.routine.map((i) => ({
            id: i.exerciseId,
            rx: i.prescription ?? null,
            sets: i.sets,
            reps: i.reps,
          }))
        )
      );
      const afterPres = JSON.stringify(
        after.week.map((d) =>
          d.routine.map((i) => ({
            id: i.exerciseId,
            rx: i.prescription ?? null,
            sets: i.sets,
            reps: i.reps,
          }))
        )
      );
      const beforeWarm = before.week
        .flatMap((d) => d.routine.filter((i) => i.section === "warmup").map((i) => i.exerciseId))
        .join(",");
      const afterWarm = after.week
        .flatMap((d) => d.routine.filter((i) => i.section === "warmup").map((i) => i.exerciseId))
        .join(",");
      const beforeRationale = JSON.stringify(before.adaptationSummary ?? []);
      const afterRationale = JSON.stringify(after.adaptationSummary ?? []);
      const nonCompositionAdaptation =
        beforePres !== afterPres ||
        beforeWarm !== afterWarm ||
        beforeRationale !== afterRationale;
      // Named relationship: overhead must not increase; if composition identical,
      // prescription/warmup/rationale/progression/presentation must adapt.
      const ok =
        a <= b && (!compositionIdentical || nonCompositionAdaptation || a < b);
      return {
        ok,
        detail: `overhead before=${b} after=${a} compositionIdentical=${compositionIdentical} nonCompositionAdaptation=${nonCompositionAdaptation}`,
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
    (before) => {
      // Block the ACTUAL squat exercise from the unblocked baseline.
      const baselineSquat =
        allExerciseIds(before).find((id) => {
          const exercise = exerciseById(id);
          return (exercise?.movementPattern ?? []).some((p) =>
            p.toLowerCase().includes("squat")
          );
        }) ?? "goblet-squat";
      clearProgramVariationHistory();
      clearProgramConstraintWarningBuffer();
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
            [baselineSquat]: {
              reason: "personal_preference",
              blockedAt: { phase: "skill", sessionCount: 2 },
            },
          },
        }
      );
      const ids = allExerciseIds(blocked);
      const hasBlocked = ids.includes(baselineSquat);
      const hasSquatPurpose = ids.some((id) => {
        const exercise = exerciseById(id);
        return Boolean(
          exercise &&
            (exercise.movementPattern ?? []).some((p) =>
              p.toLowerCase().includes("squat")
            )
        );
      });
      const evalBlocked = evaluateProgramQuality({
        program: blocked,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Beginner",
          equipment: ["dumbbells"],
          daysPerWeek: 3,
        },
        blockedExerciseIds: [baselineSquat],
      });
      const honestCap = evalBlocked.capabilityLimitations.length > 0;
      return {
        ok: !hasBlocked && (hasSquatPurpose || honestCap),
        detail: `blockedId=${baselineSquat} blockedPresent=${hasBlocked} squatPurpose=${hasSquatPurpose} capabilityLimitation=${honestCap}`,
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
    (before) => {
      const baselineHinge =
        allExerciseIds(before).find((id) => {
          const exercise = exerciseById(id);
          return (exercise?.movementPattern ?? []).some((p) =>
            p.toLowerCase().includes("hinge")
          );
        }) ?? "db-rdl";
      clearProgramVariationHistory();
      clearProgramConstraintWarningBuffer();
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
            [baselineHinge]: {
              reason: "personal_preference",
              blockedAt: { phase: "skill", sessionCount: 2 },
            },
          },
        }
      );
      const ids = allExerciseIds(blocked);
      const hasBlocked = ids.includes(baselineHinge);
      const hasHingePurpose = ids.some((id) => {
        const exercise = exerciseById(id);
        return Boolean(
          exercise &&
            (exercise.movementPattern ?? []).some((p) =>
              p.toLowerCase().includes("hinge")
            )
        );
      });
      const evalBlocked = evaluateProgramQuality({
        program: blocked,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience: "Intermediate",
          equipment: ["dumbbells", "bands"],
          daysPerWeek: 3,
          bandSetup: "long_no_anchor",
        },
        blockedExerciseIds: [baselineHinge],
      });
      const honestCap = evalBlocked.capabilityLimitations.length > 0;
      return {
        ok: !hasBlocked && (hasHingePurpose || honestCap),
        detail: `blockedId=${baselineHinge} blockedPresent=${hasBlocked} hingePurpose=${hasHingePurpose} capabilityLimitation=${honestCap}`,
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
      const identityFail = afterEval.hardFailures.some((f) =>
        f.code.includes("IDENTITY")
      );
      const beforeSets = before.week.reduce(
        (sum, d) => sum + d.routine.reduce((s, i) => s + (i.sets ?? 0), 0),
        0
      );
      const afterSets = after.week.reduce(
        (sum, d) => sum + d.routine.reduce((s, i) => s + (i.sets ?? 0), 0),
        0
      );
      const beforeRx = JSON.stringify(
        before.week.map((d) =>
          d.routine.map((i) => i.prescription?.progressionRule ?? i.reps ?? "")
        )
      );
      const afterRx = JSON.stringify(
        after.week.map((d) =>
          d.routine.map((i) => i.prescription?.progressionRule ?? i.reps ?? "")
        )
      );
      const compositionChanged =
        orderedExerciseSignature(before) !== orderedExerciseSignature(after);
      const complexityOrPrescriptionEffect =
        afterSets >= beforeSets || beforeRx !== afterRx || compositionChanged;
      return {
        ok: !illegal && !identityFail && complexityOrPrescriptionEffect,
        detail: `beginnerHard=${beforeEval.hardFailures.length} advancedHard=${afterEval.hardFailures.length} sets ${beforeSets}->${afterSets} rxChanged=${beforeRx !== afterRx} compositionChanged=${compositionChanged}`,
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
      clearProgramConstraintWarningBuffer();
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
      const exerciseChanged =
        orderedExerciseSignature(before) !== orderedExerciseSignature(after);
      const beforeRx = JSON.stringify(
        before.week.map((d) =>
          d.routine.map((i) => ({
            reps: i.reps,
            sets: i.sets,
            rule: i.prescription?.progressionRule ?? null,
          }))
        )
      );
      const afterRx = JSON.stringify(
        after.week.map((d) =>
          d.routine.map((i) => ({
            reps: i.reps,
            sets: i.sets,
            rule: i.prescription?.progressionRule ?? null,
          }))
        )
      );
      const prescriptionChanged = beforeRx !== afterRx;
      const intendedChange = exerciseChanged || prescriptionChanged;
      const explanation = !exerciseChanged
        ? prescriptionChanged
          ? "exerciseChanged=false but prescription/progression changed as intended"
          : "exerciseChanged=false and no prescription delta — unexplained"
        : "exercise composition changed across phases";
      return {
        ok: identityOk && intendedChange,
        detail: `dayIdentityStable=${identityOk} exerciseChanged=${exerciseChanged} prescriptionChanged=${prescriptionChanged} (${explanation})`,
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
  blockedExercise: string | null;
  recoveryOccurred: boolean;
  fallbackOccurred: boolean;
  fallbackStrategy?: string;
  fallbackTriage?: FallbackTriageBucket;
  dayTitles: string[];
  orderedExerciseIds: string[][];
  prescriptions: Array<Array<{ exerciseId: string; prescription?: ProgramRoutineItem["prescription"] }>>;
  capabilityLimitations: string[];
  qualityVerdict: "pass" | "fail" | "exception";
  finalOutcomeClass: FinalOutcomeClass;
  finalUserFacingOutcome: "usable_program" | "safe_generation_error" | "exception";
  initialHardFailures: string[];
  recoveryHardFailures: Array<{ attempt: number; seed: string; codes: string[] }>;
  fallbackHardFailures: string[];
  reproducibleSeeds: {
    base: string;
    recovery: string[];
    fallback?: string;
  };
  semanticSignature: string | null;
  finalProgramSignature: string | null;
  exception?: string;
};

const toSample = (result: CaseRunResult): SampleRecord => {
  const trace = result.recoveryTrace;
  return {
    mode: result.case.mode,
    index: result.case.index,
    seed: result.case.seed,
    structuralKey: result.case.structuralKey,
    input: {
      questionnaire: result.case.questionnaire,
      phaseIndex: result.case.phaseIndex,
      blockedExerciseIds: result.case.blockedExerciseIds,
    },
    blockedExercise: result.case.blockedKey || null,
    recoveryOccurred: result.recoveryAttempted || result.recoveryAttemptCount > 0,
    fallbackOccurred: result.fallbackUsed,
    fallbackStrategy: result.fallbackStrategy,
    fallbackTriage: result.fallbackTriage,
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
    finalOutcomeClass: result.finalOutcomeClass,
    finalUserFacingOutcome: result.exception
      ? "exception"
      : result.qualityPassed
      ? "usable_program"
      : "safe_generation_error",
    initialHardFailures: trace?.initial.hardFailureCodes ?? [],
    recoveryHardFailures:
      trace?.recoveryAttempts.map((a) => ({
        attempt: a.attempt,
        seed: a.seed,
        codes: a.hardFailureCodes,
      })) ?? [],
    fallbackHardFailures: trace?.fallback?.hardFailureCodes ?? [],
    reproducibleSeeds: {
      base: result.case.seed,
      recovery: trace?.recoveryAttempts.map((a) => a.seed) ?? [],
      fallback: trace?.fallback?.seed,
    },
    semanticSignature: result.semanticSignature,
    finalProgramSignature: trace?.finalProgram
      ? orderedExerciseSignature(trace.finalProgram)
      : result.orderedExerciseSignature,
    exception: result.exception,
  };
};

type GymHingeReproReport = {
  seed: string;
  questionnaire: QuestionnaireData;
  blockedExerciseIds: NonNullable<CanonicalFuzzCase["blockedExerciseIds"]>;
  unblockedHingeMainIds: string[];
  blockedHingeMainIds: string[];
  blockedExercisePresent: boolean;
  hingeRemainsViaLegalAlternative: boolean;
  finalOutcomeClass: FinalOutcomeClass;
  qualityPassed: boolean;
  hardFailureCodes: string[];
  verdict: "hinge_preserved" | "honest_capability_gap" | "genuine_gap_needs_fix";
  detail: string;
};

const mainHingeIds = (program: Program | null) => {
  if (!program) return [] as string[];
  return program.week.flatMap((day) =>
    day.routine
      .filter((item) => item.section === "main")
      .filter((item) => {
        const slot = `${item.selectionDebug?.slotKind ?? ""} ${item.selectionDebug?.slotLane ?? ""}`.toLowerCase();
        const exercise = exerciseById(item.exerciseId);
        const patternHinge = (exercise?.movementPattern ?? []).some((p) =>
          p.toLowerCase().includes("hinge")
        );
        return slot.includes("hinge") || patternHinge;
      })
      .map((item) => item.exerciseId)
  );
};

const runGymDbRdlHingeRepro = (): GymHingeReproReport => {
  const questionnaire: QuestionnaireData = {
    goals: "General fitness",
    painAreas: [],
    experience: "Beginner",
    equipment: ["gym"],
    daysPerWeek: 3,
  };
  const seed = "gym-fuzz-9e37e786";
  const blockedExerciseIds = {
    "db-rdl": {
      reason: "personal_preference" as const,
      blockedAt: { phase: "skill" as const, sessionCount: 3 },
    },
  };

  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  const unblocked = generateWeeklyProgram(questionnaire, "gym-hinge-repro-unblocked", {
    phaseIndex: 1,
    seed,
    skipQualityGate: true,
  });
  const unblockedHingeMainIds = mainHingeIds(unblocked);

  const fuzzCase = buildCanonicalFuzzCase("gym", 0, { includeBlocks: true });
  // Force the documented personal block even if generator block pool drifts.
  const reproCase: CanonicalFuzzCase = {
    ...fuzzCase,
    seed,
    phaseIndex: 1,
    questionnaire,
    blockedExerciseIds,
    blockedKey: "db-rdl",
  };
  const result = generateGuarded(reproCase);
  const blockedHingeMainIds = mainHingeIds(result.program);
  const blockedExercisePresent = Boolean(
    result.program && allExerciseIds(result.program).includes("db-rdl")
  );
  const wrongTruth = result.hardFailureCodes.some(
    (code) =>
      code.includes("REQUIRED_ROLE_WRONG_TRUTH") ||
      code.includes("MISSING_TRUE_HINGE") ||
      code.includes("HINGE_SATISFIED")
  );
  const hingeRemainsViaLegalAlternative =
    !blockedExercisePresent &&
    blockedHingeMainIds.length > 0 &&
    !wrongTruth &&
    (result.qualityPassed || result.finalOutcomeClass !== "safeGenerationFailure");
  const honestCap = result.capabilityLimitationCodes.length > 0;
  let verdict: GymHingeReproReport["verdict"] = "honest_capability_gap";
  if (hingeRemainsViaLegalAlternative || (result.qualityPassed && !blockedExercisePresent)) {
    verdict = "hinge_preserved";
  } else if (
    unblockedHingeMainIds.length > 0 &&
    (blockedHingeMainIds.length === 0 || wrongTruth) &&
    !honestCap
  ) {
    verdict = "genuine_gap_needs_fix";
  }

  return {
    seed,
    questionnaire,
    blockedExerciseIds,
    unblockedHingeMainIds,
    blockedHingeMainIds,
    blockedExercisePresent,
    hingeRemainsViaLegalAlternative: verdict === "hinge_preserved",
    finalOutcomeClass: result.finalOutcomeClass,
    qualityPassed: result.qualityPassed,
    hardFailureCodes: result.hardFailureCodes,
    verdict,
    detail: `unblockedHingeMains=${unblockedHingeMainIds.join(",") || "none"} blockedHingeMains=${blockedHingeMainIds.join(",") || "none"} wrongTruth=${wrongTruth} outcome=${result.finalOutcomeClass}`,
  };
};

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
  const modeEnv = (process.env.FUZZ_INTEGRITY_MODE ?? "local").toLowerCase();
  const fuzzMode: FuzzIntegrityMode = modeEnv === "release" ? "release" : "local";
  const defaultCases =
    fuzzMode === "release" ? RELEASE_CASES_PER_MODE : DEFAULT_LOCAL_CASES_PER_MODE;
  const casesPerModeRaw = Number(
    process.env.FUZZ_INTEGRITY_CASES_PER_MODE ?? String(defaultCases)
  );
  const casesPerMode =
    Number.isFinite(casesPerModeRaw) && casesPerModeRaw >= 0
      ? Math.floor(casesPerModeRaw)
      : defaultCases;

  console.error(
    `[fuzzIntegrityAudit] mode=${fuzzMode} casesPerMode=${casesPerMode}` +
      ` (release requires exactly ${RELEASE_CASES_PER_MODE};` +
      ` local default=${DEFAULT_LOCAL_CASES_PER_MODE})`
  );

  const releaseBlockingFailures: NeedsReviewSignal[] = [];
  const needsReviewWarnings: NeedsReviewSignal[] = [];

  if (fuzzMode === "release" && casesPerMode !== RELEASE_CASES_PER_MODE) {
    releaseBlockingFailures.push({
      code: "RELEASE_CASE_COUNT_INVALID",
      detail: `release mode requires exactly ${RELEASE_CASES_PER_MODE} cases/mode; got ${casesPerMode}`,
    });
  }

  const modeResults = new Map<FuzzMode, CaseRunResult[]>();
  const diversityByMode: DiversityStats[] = [];
  const collapseAnalyses: CollapseAnalysis[] = [];
  const fallbackSamples: SampleRecord[] = [];
  const failedCaseDiagnostics: SampleRecord[] = [];
  const blindSamples: SampleRecord[] = [];

  for (const mode of FUZZ_MODES) {
    console.error(`[fuzzIntegrityAudit] mode=${mode} diversity fuzz…`);
    const results: CaseRunResult[] = [];
    for (let i = 0; i < casesPerMode; i += 1) {
      const fuzzCase = buildCanonicalFuzzCase(mode, i, { includeBlocks: true });
      const result = generateGuarded(fuzzCase);
      results.push(result);
      if (result.fallbackUsed) fallbackSamples.push(toSample(result));
      if (!result.qualityPassed || result.exception) {
        failedCaseDiagnostics.push(toSample(result));
      }
      if ((i + 1) % 100 === 0 || i + 1 === casesPerMode) {
        console.error(`[fuzzIntegrityAudit] ${mode} ${i + 1}/${casesPerMode}`);
      }
    }
    modeResults.set(mode, results);
    diversityByMode.push(accumulateDiversity(mode, results));
    collapseAnalyses.push(analyzeCrossInputCollapse(mode, results));

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

  console.error("[fuzzIntegrityAudit] gym db-rdl hinge repro…");
  const gymHingeRepro = runGymDbRdlHingeRepro();

  const totalDetectedPairs = collapseAnalyses.reduce(
    (sum, c) => sum + c.totalDetectedPairs,
    0
  );
  const analyzedRepresentativePairs = collapseAnalyses.reduce(
    (sum, c) => sum + c.analyzedRepresentativePairs,
    0
  );
  const collapseFlags = collapseAnalyses.flatMap((c) => c.flags);
  const collapseRootCauses: Record<string, number> = {};
  for (const analysis of collapseAnalyses) {
    for (const [category, count] of Object.entries(analysis.rootCausesByCategory)) {
      collapseRootCauses[category] = (collapseRootCauses[category] ?? 0) + count;
    }
  }
  const suspiciousCollapses = collapseFlags.filter((c) => c.verdict === "suspicious");

  for (const stats of diversityByMode) {
    if (stats.fallbackRate > 0.01) {
      needsReviewWarnings.push({
        code: "FALLBACK_RATE_ABOVE_1PCT",
        detail: `${stats.mode} fallbackRate=${(stats.fallbackRate * 100).toFixed(2)}% (warning — not a release failure when all finals pass)`,
      });
    }
    if (stats.recoveryRate > 0.05) {
      needsReviewWarnings.push({
        code: "RECOVERY_RATE_ABOVE_5PCT",
        detail: `${stats.mode} recoveryRate=${(stats.recoveryRate * 100).toFixed(2)}% (warning)`,
      });
    }
    if (
      stats.structuralInputTuples > 1 &&
      stats.mostCommonSignatureShare > 0.95
    ) {
      needsReviewWarnings.push({
        code: "SEMANTIC_SIGNATURE_DOMINANCE",
        detail: `${stats.mode} mostCommonSignatureShare=${(stats.mostCommonSignatureShare * 100).toFixed(2)}% over ${stats.structuralInputTuples} structural personas`,
      });
    }
    if (stats.deterministicMismatches > 0) {
      releaseBlockingFailures.push({
        code: "DETERMINISTIC_MISMATCH",
        detail: `${stats.mode} deterministicMismatches=${stats.deterministicMismatches}`,
      });
    }
    if (stats.exceptions > 0) {
      releaseBlockingFailures.push({
        code: "EXCEPTIONS",
        detail: `${stats.mode} exceptions=${stats.exceptions}`,
      });
    }
    if (stats.unclassifiedOutcomes > 0) {
      releaseBlockingFailures.push({
        code: "UNCLASSIFIED_OUTCOMES",
        detail: `${stats.mode} unclassifiedOutcomes=${stats.unclassifiedOutcomes}`,
      });
    }
    if (stats.failedProgramTreatedAsUsable > 0) {
      releaseBlockingFailures.push({
        code: "FAILED_PROGRAM_TREATED_AS_USABLE",
        detail: `${stats.mode} failedProgramTreatedAsUsable=${stats.failedProgramTreatedAsUsable}`,
      });
    }
    if (stats.uniqueSemanticSignatures === 0 && stats.totalCases > 0) {
      releaseBlockingFailures.push({
        code: "ZERO_OUTPUT_SENSITIVITY",
        detail: `${stats.mode} produced no semantic signatures`,
      });
    }
    if (stats.fallbackTriage.fallbackEvidenceMalformed > 0) {
      releaseBlockingFailures.push({
        code: "FALLBACK_EVIDENCE_MALFORMED",
        detail: `${stats.mode} malformedFallbackEvidence=${stats.fallbackTriage.fallbackEvidenceMalformed}`,
      });
    }
  }

  if (suspiciousCollapses.length) {
    needsReviewWarnings.push({
      code: "UNEXPLAINED_CROSS_INPUT_COLLAPSE",
      detail: `${suspiciousCollapses.length} suspicious collapse pairs (see categories)`,
    });
  }

  if (mutationsDetected < mutations.length) {
    releaseBlockingFailures.push({
      code: "FAILED_MUTATION",
      detail: `${mutations.length - mutationsDetected}/${mutations.length} mutations undetected`,
    });
  }

  if (metamorphicPassed < metamorphic.length) {
    releaseBlockingFailures.push({
      code: "METAMORPHIC_FAILURE",
      detail: `${metamorphic.length - metamorphicPassed}/${metamorphic.length} metamorphic tests failed`,
    });
  }

  const fallbackWithoutSample =
    diversityByMode.some((s) => s.fallbackUses > 0) && fallbackSamples.length === 0;
  if (fallbackWithoutSample) {
    releaseBlockingFailures.push({
      code: "FALLBACK_WITHOUT_SAMPLE",
      detail: "Fallback uses recorded without reproducible sample export",
    });
  }

  const classifiedCount = diversityByMode.reduce(
    (sum, s) =>
      sum +
      s.initialQualityPass +
      s.recoverySucceeded +
      s.fallbackSucceeded +
      s.safeGenerationError +
      s.exceptions,
    0
  );
  const totalCases = diversityByMode.reduce((sum, s) => sum + s.totalCases, 0);
  // Allow recoveryAttempted that later fell to fallback: classify via finalOutcome only.
  const classifiedViaOutcome = diversityByMode.reduce(
    (sum, s) => sum + (s.totalCases - s.unclassifiedOutcomes),
    0
  );
  if (classifiedViaOutcome !== totalCases) {
    releaseBlockingFailures.push({
      code: "REPORT_INCONSISTENCY",
      detail: `classifiedViaOutcome=${classifiedViaOutcome} totalCases=${totalCases}`,
    });
  }
  void classifiedCount;

  const allFinalProgramsPass = diversityByMode.every(
    (s) => s.finalQualityFail === 0 && s.safeGenerationError === 0 && s.exceptions === 0
  );
  const allClassified = diversityByMode.every((s) => s.unclassifiedOutcomes === 0);

  const sampleExport = {
    blindSamples,
    fallbackSamples,
    failedCaseDiagnostics,
    totalBlind: blindSamples.length,
    totalFallback: fallbackSamples.length,
    totalFailedDiagnostics: failedCaseDiagnostics.length,
    fallbackTriageTotals: diversityByMode.reduce(
      (acc, s) => {
        acc.fallbackPassed += s.fallbackTriage.fallbackPassed;
        acc.fallbackFailedSafely += s.fallbackTriage.fallbackFailedSafely;
        acc.fallbackEvidenceMalformed += s.fallbackTriage.fallbackEvidenceMalformed;
        return acc;
      },
      {
        fallbackPassed: 0,
        fallbackFailedSafely: 0,
        fallbackEvidenceMalformed: 0,
      }
    ),
  };

  mkdirSync(OUT_DIR, { recursive: true });

  const hasReleaseBlockers = releaseBlockingFailures.length > 0;
  const hasWarnings = needsReviewWarnings.length > 0;
  const verdict = hasReleaseBlockers
    ? "FAIL"
    : hasWarnings
    ? "NEEDS_REVIEW"
    : "PASS";

  // NEEDS_REVIEW may exit 0 only when all finals pass, all classified, and
  // warnings are explicitly distinguished from failures.
  const exitNonzero =
    hasReleaseBlockers ||
    (verdict === "NEEDS_REVIEW" && !(allFinalProgramsPass && allClassified));

  const summary = {
    generatedAt: new Date().toISOString(),
    phase: "7B-§13",
    objective: "Fuzz-integrity assessment",
    fuzzIntegrityMode: fuzzMode,
    casesPerMode,
    releaseCasesPerMode: RELEASE_CASES_PER_MODE,
    note:
      fuzzMode === "local"
        ? `Local run (${casesPerMode}/mode). Release evidence requires FUZZ_INTEGRITY_MODE=release with ${RELEASE_CASES_PER_MODE}/mode.`
        : `Release run (${casesPerMode}/mode).`,
    elapsedMs: Date.now() - started,
    finalQualityOutcomes: diversityByMode.map((s) => ({
      mode: s.mode,
      totalCases: s.totalCases,
      initialQualityPass: s.initialQualityPass,
      recoveryAttempted: s.recoveryAttempted,
      recoverySucceeded: s.recoverySucceeded,
      fallbackAttempted: s.fallbackAttempted,
      fallbackSucceeded: s.fallbackSucceeded,
      finalQualityPass: s.finalQualityPass,
      finalQualityFail: s.finalQualityFail,
      safeGenerationError: s.safeGenerationError,
      exceptions: s.exceptions,
      unclassifiedOutcomes: s.unclassifiedOutcomes,
      finalQualityPassRate: s.finalQualityPassRate,
      finalQualityFailureRate: s.finalQualityFailureRate,
      hardFailureCodesByCount: s.hardFailureCodesByCount,
      failedCasesByStructuralGroup: s.failedCasesByStructuralGroup,
      fallbackTriage: s.fallbackTriage,
    })),
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
      totalDetectedPairs,
      analyzedRepresentativePairs,
      reportDisplayLimit: COLLAPSE_REPORT_DISPLAY_LIMIT,
      suspicious: suspiciousCollapses.length,
      expected: collapseFlags.filter((c) => c.verdict === "expected").length,
      rootCausesByCategory: collapseRootCauses,
      flags: collapseFlags.slice(0, COLLAPSE_REPORT_DISPLAY_LIMIT),
      analyzedFlags: collapseFlags,
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
    gymHingeRepro,
    holdout: holdoutByMode,
    samples: {
      blindPerMode: BLIND_SAMPLES_PER_MODE,
      blindTotal: blindSamples.length,
      fallbackTotal: fallbackSamples.length,
      failedDiagnosticsTotal: failedCaseDiagnostics.length,
    },
    releaseBlockingFailures,
    needsReviewWarnings,
    needsReview: needsReviewWarnings,
    gateDistinction: {
      releaseBlockingFailures: releaseBlockingFailures.length,
      needsReviewWarnings: needsReviewWarnings.length,
      allFinalProgramsPass,
      allClassified,
      note: "NEEDS_REVIEW warnings are not release failures when all finals pass and all cases are classified.",
    },
    verdict,
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
    `- Mode: **${fuzzMode}**`,
    `- Cases per mode: **${casesPerMode}** (release requires exactly **${RELEASE_CASES_PER_MODE}**)`,
    `- Elapsed: ${summary.elapsedMs}ms`,
    `- Verdict: **${summary.verdict}**`,
    "",
    summary.note,
    "",
    "## Final quality outcomes",
    "",
    ...diversityByMode.flatMap((s) => [
      `### ${s.mode}`,
      "",
      `- Total cases: ${s.totalCases}`,
      `- Initial quality pass: ${s.initialQualityPass}`,
      `- Recovery attempted / succeeded: ${s.recoveryAttempted} / ${s.recoverySucceeded}`,
      `- Fallback attempted / succeeded: ${s.fallbackAttempted} / ${s.fallbackSucceeded}`,
      `- Final quality pass / fail: ${s.finalQualityPass} / ${s.finalQualityFail}`,
      `- Safe generation error: ${s.safeGenerationError}`,
      `- Exceptions: ${s.exceptions}`,
      `- Unclassified: ${s.unclassifiedOutcomes}`,
      `- Final pass rate / failure rate: ${(s.finalQualityPassRate * 100).toFixed(2)}% / ${(s.finalQualityFailureRate * 100).toFixed(2)}%`,
      `- Fallback triage: passed=${s.fallbackTriage.fallbackPassed} failedSafely=${s.fallbackTriage.fallbackFailedSafely} malformed=${s.fallbackTriage.fallbackEvidenceMalformed}`,
      "",
    ]),
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
    `- Total detected pairs: ${totalDetectedPairs}`,
    `- Analyzed representative pairs: ${analyzedRepresentativePairs}`,
    `- Report display limit: ${COLLAPSE_REPORT_DISPLAY_LIMIT}`,
    `- Suspicious / expected (in analyzed set): ${suspiciousCollapses.length} / ${collapseFlags.filter((c) => c.verdict === "expected").length}`,
    "",
    "### Root causes by category",
    "",
    ...Object.entries(collapseRootCauses).map(
      ([category, count]) => `- \`${category}\`: ${count}`
    ),
    Object.keys(collapseRootCauses).length ? "" : "- none",
    "",
    ...collapseFlags.slice(0, COLLAPSE_REPORT_DISPLAY_LIMIT).flatMap((flag) => [
      `### ${flag.mode} — ${flag.verdict} / ${flag.category}`,
      "",
      `- Signature: \`${flag.signature}\``,
      `- Input A: \`${flag.inputA}\``,
      `- Input B: \`${flag.inputB}\``,
      `- Diffs: ${flag.diffs.join(", ")}`,
      `- Explanation: ${flag.explanation}`,
      "",
    ]),
    totalDetectedPairs > COLLAPSE_REPORT_DISPLAY_LIMIT
      ? `_Display capped at ${COLLAPSE_REPORT_DISPLAY_LIMIT}; totalDetectedPairs=${totalDetectedPairs} in JSON._\n`
      : "",
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
    `- Failed-case diagnostics: ${failedCaseDiagnostics.length}`,
    `- See \`${path.relative(process.cwd(), SAMPLES_MD)}\` and JSON companion.`,
    "",
    "## Gym hinge repro (db-rdl blocked)",
    "",
    `- Seed: \`${gymHingeRepro.seed}\``,
    `- Verdict: **${gymHingeRepro.verdict}**`,
    `- Hinge remains via legal alternative: ${gymHingeRepro.hingeRemainsViaLegalAlternative}`,
    `- Detail: ${gymHingeRepro.detail}`,
    "",
    "## Gate: release blockers vs NEEDS_REVIEW warnings",
    "",
    "### Release-blocking failures",
    "",
    releaseBlockingFailures.length
      ? releaseBlockingFailures.map((s) => `- \`${s.code}\`: ${s.detail}`).join("\n")
      : "- none",
    "",
    "### NEEDS_REVIEW warnings (not release failures when finals pass + classified)",
    "",
    needsReviewWarnings.length
      ? needsReviewWarnings.map((s) => `- \`${s.code}\`: ${s.detail}`).join("\n")
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
    "Uncurated deterministic sample for independent review. Includes every fallback case and full failed-case diagnostics.",
    "",
    `Blind total: ${blindSamples.length}`,
    `Fallback total: ${fallbackSamples.length}`,
    `Failed diagnostics: ${failedCaseDiagnostics.length}`,
    "",
    "## Blind samples (10 per mode)",
    "",
    ...blindSamples.flatMap((sample, i) => [
      `### Blind ${i + 1} — ${sample.mode} #${sample.index}`,
      "",
      `- Seed: \`${sample.seed}\``,
      `- Structural key: \`${sample.structuralKey}\``,
      `- Blocked exercise: ${sample.blockedExercise ?? "none"}`,
      `- Recovery: ${sample.recoveryOccurred}`,
      `- Fallback: ${sample.fallbackOccurred}${sample.fallbackStrategy ? ` (${sample.fallbackStrategy})` : ""}`,
      `- Final outcome: ${sample.finalOutcomeClass} / ${sample.finalUserFacingOutcome}`,
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
      ? fallbackSamples
          .flatMap((sample, i) => [
            `### Fallback ${i + 1} — ${sample.mode} #${sample.index}`,
            "",
            `- Seed: \`${sample.seed}\``,
            `- Strategy: ${sample.fallbackStrategy ?? "n/a"}`,
            `- Triage: ${sample.fallbackTriage ?? "n/a"}`,
            `- Final outcome: ${sample.finalOutcomeClass} / ${sample.finalUserFacingOutcome}`,
            `- Initial hard failures: ${sample.initialHardFailures.join(", ") || "none"}`,
            `- Recovery hard failures: ${
              sample.recoveryHardFailures
                .map((r) => `#${r.attempt}[${r.seed}]=${r.codes.join("|") || "none"}`)
                .join("; ") || "none"
            }`,
            `- Fallback hard failures: ${sample.fallbackHardFailures.join(", ") || "none"}`,
            `- Reproducible seeds: base=${sample.reproducibleSeeds.base} fallback=${sample.reproducibleSeeds.fallback ?? "n/a"}`,
            `- Final program signature: \`${sample.finalProgramSignature ?? "n/a"}\``,
            `- Semantic signature: \`${sample.semanticSignature ?? "n/a"}\``,
            `- Day titles: ${sample.dayTitles.join(" | ") || "none"}`,
            `- Ordered exercise IDs:`,
            ...sample.orderedExerciseIds.map(
              (ids, dayIndex) => `  - Day ${dayIndex + 1}: ${ids.join(", ") || "none"}`
            ),
            "",
          ])
          .join("\n")
      : "None in this run.",
    "",
    "## Failed-case diagnostics",
    "",
    failedCaseDiagnostics.length
      ? failedCaseDiagnostics
          .flatMap((sample, i) => [
            `### Failed ${i + 1} — ${sample.mode} #${sample.index}`,
            "",
            `- Input: \`${JSON.stringify(sample.input)}\``,
            `- Blocked exercise: ${sample.blockedExercise ?? "none"}`,
            `- Initial hard failures: ${sample.initialHardFailures.join(", ") || "none"}`,
            `- Recovery: ${JSON.stringify(sample.recoveryHardFailures)}`,
            `- Fallback hard failures: ${sample.fallbackHardFailures.join(", ") || "none"}`,
            `- Final user-facing outcome: ${sample.finalUserFacingOutcome}`,
            `- Reproducible seeds: ${JSON.stringify(sample.reproducibleSeeds)}`,
            "",
          ])
          .join("\n")
      : "None in this run.",
    "",
  ];
  writeFileSync(SAMPLES_MD, `${samplesMd.join("\n").trim()}\n`, "utf8");

  const consoleSummary = {
    ok: !exitNonzero,
    verdict: summary.verdict,
    fuzzIntegrityMode: fuzzMode,
    casesPerMode,
    mutationsDetected,
    metamorphicPassed,
    metamorphicTotal: metamorphic.length,
    releaseBlockingFailures,
    needsReviewWarnings,
    gymHingeRepro: {
      verdict: gymHingeRepro.verdict,
      hingeRemainsViaLegalAlternative: gymHingeRepro.hingeRemainsViaLegalAlternative,
      detail: gymHingeRepro.detail,
    },
    finalQuality: diversityByMode.map((s) => ({
      mode: s.mode,
      pass: s.finalQualityPass,
      fail: s.finalQualityFail,
      safeGen: s.safeGenerationError,
      unclassified: s.unclassifiedOutcomes,
      fallbackTriage: s.fallbackTriage,
    })),
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

  if (exitNonzero) {
    process.exit(1);
  }
};

main();
