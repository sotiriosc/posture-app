import { exerciseById } from "../exercises";
import { pathToFileURL } from "node:url";
import { computeEquipmentCapability } from "../engine/equipmentCapability";
import { normalizeEquipmentSelectionValues } from "../equipment";
import {
  buildProgramIntentProfile,
  clearProgramConstraintWarningBuffer,
  daySatisfiesSpec,
  deriveExerciseRole,
  generateWeeklyProgram,
  getPainSeverity,
  getProgramConstraintWarningBuffer,
  getWeeklyCoverageContract,
  resolveDayConstraintSpec,
  summarizeWeekCoverage,
  type WeekCoverageSummary,
} from "../program";
import type { ProgramConstraintWarning } from "../program";
import type { Program } from "../types";

type AuditQuestionnaireData = {
  goals: "Improve posture" | "Reduce pain" | "Athletic performance" | "General fitness";
  painAreas: string[];
  experience: "Beginner" | "Intermediate" | "Advanced";
  daysPerWeek: 3 | 4 | 5;
  equipment: string[];
};

const requireExerciseById = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) {
    throw new Error(`[coverageContractAudit] Unknown exercise: ${exerciseId}`);
  }
  return exercise;
};

type CoverageMetricKey =
  | "calvesDays"
  | "bicepsDays"
  | "tricepsDays"
  | "squatDays"
  | "hingeDays"
  | "pullDays"
  | "pushDays";

export type DayContractAudit = {
  dayTitle: string;
  ok: boolean;
  missing: string[];
  violations: string[];
  optionalMissing: string[];
};

export type CoverageContractAuditResult = {
  profile: string;
  phase: string;
  daysPerWeek: 3 | 4 | 5;
  equipment: string[];
  capabilityMode: "noneOnly" | "bandOnly" | "hasLoad";
  ok: boolean;
  dayContracts: DayContractAudit[];
  weekly: WeekCoverageSummary;
  weeklyMinima: Record<CoverageMetricKey, number>;
  weeklyFailures: string[];
  intelligenceFailures: string[];
  unresolvedBudgetViolations: string[];
  relaxedBudgetReasons: string[];
  invalidRelaxations: string[];
};

const isArmIsolationExercise = (exerciseId: string) => {
  const exercise = requireExerciseById(exerciseId);
  const role = deriveExerciseRole(exercise);
  if (role !== "accessoryIsolation") return false;
  const tags = new Set(exercise.tags.map((tag) => tag.toLowerCase()));
  return tags.has("biceps") || tags.has("triceps") || exercise.muscleGroups.some((group) => {
    const token = group.toLowerCase();
    return token.includes("biceps") || token.includes("triceps");
  });
};

const isRowMainExercise = (exerciseId: string) => {
  const exercise = requireExerciseById(exerciseId);
  const idName = `${exercise.id} ${exercise.name}`.toLowerCase();
  return idName.includes("row");
};

const isShoulderIsolationMain = (exerciseId: string) => {
  const exercise = requireExerciseById(exerciseId);
  const tags = new Set(exercise.tags.map((tag) => tag.toLowerCase()));
  return tags.has("lateral-delt") || tags.has("shoulders-isolation");
};

const toPhaseStage = (phase: string): "activation" | "skill" | "growth" => {
  if (phase === "growth") return "growth";
  if (phase === "skill") return "skill";
  return "activation";
};

const toExperienceLevel = (
  value: string
): "beginner" | "intermediate" | "advanced" => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "advanced") return "advanced";
  if (normalized === "intermediate") return "intermediate";
  return "beginner";
};

const isUpperIntentDay = (title: string) => {
  const normalized = title.toLowerCase();
  return (
    normalized.includes("upper") ||
    normalized.includes("back + chest") ||
    normalized.includes("shoulders + arms") ||
    normalized.includes("arms + posture")
  );
};

export function auditCoverageContract(args: {
  profile: string;
  phase: string;
  daysPerWeek: 3 | 4 | 5;
  equipment: string[];
  questionnaire: AuditQuestionnaireData;
  program: Program;
  warnings?: ProgramConstraintWarning[];
}): CoverageContractAuditResult {
  const { profile, phase, daysPerWeek, equipment, questionnaire, program, warnings = [] } = args;
  const normalizedEquipment = normalizeEquipmentSelectionValues(equipment);
  const capability = computeEquipmentCapability(normalizedEquipment);
  const capabilityMode: "noneOnly" | "bandOnly" | "hasLoad" = capability.hasLoad
    ? "hasLoad"
    : capability.hasBand
    ? "bandOnly"
    : "noneOnly";

  const dayContracts: DayContractAudit[] = program.week.map((day) => {
    const spec = resolveDayConstraintSpec({ day, daysPerWeek, capabilityMode });
    if (!spec) {
      return {
        dayTitle: day.title,
        ok: false,
        missing: ["No day contract spec found"],
        violations: [],
        optionalMissing: [],
      };
    }

    const validation = daySatisfiesSpec(day, spec);
    return {
      dayTitle: day.title,
      ok: validation.ok,
      missing: validation.missing.map((rule) => rule.description || rule.id),
      violations: validation.violations.map(
        (violation) => `${violation.exerciseName} -> ${violation.rule.description || violation.rule.id}`
      ),
      optionalMissing: validation.optionalMissing.map((rule) => rule.description || rule.id),
    };
  });

  const weekly = summarizeWeekCoverage(program.week);
  const weeklyMinima = getWeeklyCoverageContract(daysPerWeek);
  const weeklyFailures: string[] = [];

  (Object.keys(weeklyMinima) as CoverageMetricKey[]).forEach((metric) => {
    const current = weekly[metric];
    const required = weeklyMinima[metric];
    if (current < required) {
      weeklyFailures.push(`${metric} ${current}/${required}`);
    }
  });

  const intentProfile = buildProgramIntentProfile({
    questionnaire,
    painSeverity: getPainSeverity(questionnaire),
    phaseStage: toPhaseStage(phase),
    experienceLevel: toExperienceLevel(questionnaire.experience),
    capabilityMode,
  });

  const intelligenceFailures: string[] = [];
  const unresolvedBudgetViolations: string[] = [];
  const relaxedBudgetReasons: string[] = [];
  const invalidRelaxations: string[] = [];
  const parsedRelaxations: Array<{
    dayTitle: string;
    pattern: string;
    fromMax: number;
    toMax: number;
    reason: string;
  }> = [];

  const parseBudgetPayload = (message: string, marker: "[budget_unresolved]" | "[budget_relaxed]") => {
    if (!message.startsWith(marker)) return null;
    const raw = message.slice(marker.length).trim();
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  };

  warnings.forEach((warning) => {
    const unresolvedPayload = parseBudgetPayload(warning.message, "[budget_unresolved]");
    if (unresolvedPayload) {
      const pattern = String(unresolvedPayload.pattern ?? "unknown");
      const slotId = String(unresolvedPayload.slotId ?? "unknown");
      const reason = String(unresolvedPayload.reason ?? "unknown");
      unresolvedBudgetViolations.push(`${warning.dayTitle}:${pattern}:${slotId}:${reason}`);
      return;
    }
    const relaxedPayload = parseBudgetPayload(warning.message, "[budget_relaxed]");
    if (relaxedPayload) {
      const pattern = String(relaxedPayload.pattern ?? "unknown");
      const fromMax = Number(relaxedPayload.fromMax ?? NaN);
      const toMax = Number(relaxedPayload.toMax ?? NaN);
      const reason = String(relaxedPayload.reason ?? "");
      parsedRelaxations.push({
        dayTitle: warning.dayTitle,
        pattern,
        fromMax,
        toMax,
        reason,
      });
      relaxedBudgetReasons.push(`${warning.dayTitle}:${pattern}:${fromMax}->${toMax}:${reason}`);
      const validReason = reason === "no eligible candidates for replacement";
      const validStep = Number.isFinite(fromMax) && Number.isFinite(toMax) && toMax - fromMax === 1;
      if (!validReason || !validStep) {
        invalidRelaxations.push(`${warning.dayTitle}:${pattern}:${fromMax}->${toMax}:${reason}`);
      }
    }
  });

  const hasHipKneePain = (questionnaire.painAreas ?? []).some((entry) => {
    const token = entry.toLowerCase();
    return token.includes("hip") || token.includes("knee");
  });

  parsedRelaxations.forEach((entry) => {
    const disallowForRecovery = intentProfile.recoveryBudget === "low";
    const laneToken = entry.pattern.toLowerCase();
    const disallowForPain =
      (laneToken === "squat" || laneToken === "hinge") &&
      intentProfile.painSeverity === "high" &&
      hasHipKneePain;
    if (disallowForRecovery || disallowForPain) {
      invalidRelaxations.push(
        `${entry.dayTitle}:${entry.pattern}:${entry.fromMax}->${entry.toMax}:relax policy disallowed`
      );
    }
  });

  if (daysPerWeek === 3 && weekly.calvesDays === 0) {
    intelligenceFailures.push("3-day plan has zero calf exposure");
  }

  if (weekly.carryDays === 0) {
    intelligenceFailures.push("Carry exposure missing for the week");
  }

  program.week.forEach((day) => {
    const mainItems = day.routine.filter((item) => item.section === "main");

    if (
      day.title === "Back + Chest" &&
      mainItems.some((item) => isShoulderIsolationMain(item.exerciseId))
    ) {
      intelligenceFailures.push(
        `${day.title}: lateral/shoulder isolation appeared as MAIN`
      );
    }

    if (day.title === "Shoulders + Arms") {
      const hasRowMain = mainItems.some((item) => isRowMainExercise(item.exerciseId));
      const hasArmIsolation = day.routine.some((item) => isArmIsolationExercise(item.exerciseId));
      if (hasRowMain && !hasArmIsolation) {
        intelligenceFailures.push(
          `${day.title}: row MAIN present without biceps/triceps isolation`
        );
      }
    }

    if (isUpperIntentDay(day.title)) {
      const squatMains = mainItems.filter((item) => {
        const ex = requireExerciseById(item.exerciseId);
        return ex.movementPattern.some((pattern) => pattern.toLowerCase() === "squat");
      });
      if (squatMains.length > 0) {
        intelligenceFailures.push(`${day.title}: upper day includes squat MAIN`);
      }

      const hingeMains = mainItems.filter((item) => {
        const ex = requireExerciseById(item.exerciseId);
        return ex.movementPattern.some((pattern) => pattern.toLowerCase() === "hinge");
      });

      if (hingeMains.length > 0) {
        const allowSingleControlHinge =
          intentProfile.primaryGoal === "posture" &&
          intentProfile.experienceLevel === "beginner" &&
          intentProfile.phase === "activation";

        const invalidHinge = hingeMains.some((item) => {
          const ex = requireExerciseById(item.exerciseId);
          return deriveExerciseRole(ex) !== "mainControl";
        });

        if (!allowSingleControlHinge || hingeMains.length > 1 || invalidHinge) {
          intelligenceFailures.push(
            `${day.title}: upper day hinge MAIN violates control exception`
          );
        }
      }
    }
  });

  const dayFailures = dayContracts.some((entry) => !entry.ok);
  const ok =
    !dayFailures &&
    weeklyFailures.length === 0 &&
    intelligenceFailures.length === 0 &&
    unresolvedBudgetViolations.length === 0 &&
    invalidRelaxations.length === 0;

  return {
    profile,
    phase,
    daysPerWeek,
    equipment: normalizedEquipment,
    capabilityMode,
    ok,
    dayContracts,
    weekly,
    weeklyMinima,
    weeklyFailures,
    intelligenceFailures,
    unresolvedBudgetViolations,
    relaxedBudgetReasons,
    invalidRelaxations,
  };
}

type AuditScenario = {
  profile: string;
  phase: "activation" | "skill" | "growth";
  phaseIndex: 1 | 2 | 3;
  questionnaire: AuditQuestionnaireData;
};

const TWO_SCENARIOS: AuditScenario[] = [
  {
    profile: "normal beginner",
    phase: "activation",
    phaseIndex: 1,
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      daysPerWeek: 3,
      equipment: ["bands"],
    },
  },
  {
    profile: "pain advanced",
    phase: "growth",
    phaseIndex: 3,
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["low_back", "neck"],
      experience: "Advanced",
      daysPerWeek: 5,
      equipment: ["gym"],
    },
  },
];

const resolvePreset = () => {
  const envPreset = String(process.env.AUDIT_PRESET ?? "")
    .trim()
    .toLowerCase();
  const inlineArg = process.argv.find((arg) => arg.startsWith("--preset="));
  if (inlineArg) {
    return inlineArg.split("=")[1]?.trim().toLowerCase() ?? "";
  }
  const presetIndex = process.argv.findIndex((arg) => arg === "--preset");
  if (presetIndex >= 0) {
    return String(process.argv[presetIndex + 1] ?? "")
      .trim()
      .toLowerCase();
  }
  return envPreset;
};

const collectAuditMissingDetails = (audit: CoverageContractAuditResult) => {
  const details: string[] = [];
  audit.dayContracts
    .filter((entry) => !entry.ok)
    .forEach((entry) => {
      if (entry.missing.length) {
        details.push(`${entry.dayTitle}:missing=${entry.missing.join(",")}`);
      }
      if (entry.violations.length) {
        details.push(`${entry.dayTitle}:violations=${entry.violations.join(",")}`);
      }
    });
  if (audit.weeklyFailures.length) {
    details.push(`weekly=${audit.weeklyFailures.join(",")}`);
  }
  if (audit.intelligenceFailures.length) {
    details.push(`intelligence=${audit.intelligenceFailures.join(",")}`);
  }
  if (audit.unresolvedBudgetViolations.length) {
    details.push(`budget_unresolved=${audit.unresolvedBudgetViolations.join(",")}`);
  }
  if (audit.invalidRelaxations.length) {
    details.push(`budget_invalid_relax=${audit.invalidRelaxations.join(",")}`);
  }
  return details;
};

const printAuditBlock = (params: {
  scenario: AuditScenario;
  audit: CoverageContractAuditResult;
  program: Program;
}) => {
  const { scenario, audit, program } = params;
  console.log(
    `PROFILE=${scenario.profile} | PHASE=${scenario.phase} | days=${scenario.questionnaire.daysPerWeek} | equipment=${scenario.questionnaire.equipment.join(",")} | capability=${audit.capabilityMode}`
  );
  program.week.forEach((day) => {
    const mainIds = day.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);
    console.log(`- ${day.title}`);
    console.log(`  MAIN: ${mainIds.length ? mainIds.join(", ") : "(none)"}`);
  });
  console.log(
    `WEEKLY COVERAGE: calves=${audit.weekly.calvesDays} biceps=${audit.weekly.bicepsDays} triceps=${audit.weekly.tricepsDays} squat=${audit.weekly.squatDays} hinge=${audit.weekly.hingeDays} pull=${audit.weekly.pullDays} push=${audit.weekly.pushDays} antiRotation=${audit.weekly.antiRotationDays} carry=${audit.weekly.carryDays} scapular=${audit.weekly.scapularDays}`
  );
  const missing = collectAuditMissingDetails(audit);
  if (audit.ok) {
    console.log("CONTRACT AUDIT: PASS");
  } else {
    console.log(
      `CONTRACT AUDIT: FAIL${missing.length ? ` | missing=${missing.join(" ; ")}` : ""}`
    );
  }
  console.log("");
};

const runCoverageAuditCli = async () => {
  const preset = resolvePreset();
  const scenarios = preset === "two" || !preset ? TWO_SCENARIOS : TWO_SCENARIOS;

  scenarios.forEach((scenario) => {
    const programId = [
      "coverage-audit",
      scenario.profile.replace(/\s+/g, "-"),
      scenario.phase,
      `${scenario.questionnaire.daysPerWeek}d`,
      scenario.questionnaire.equipment.join("-"),
    ].join("-");

    clearProgramConstraintWarningBuffer();
    const program = generateWeeklyProgram(scenario.questionnaire, programId, {
      phaseIndex: scenario.phaseIndex,
      seed: `coverage-audit-${scenario.profile}-${scenario.phase}-${scenario.questionnaire.daysPerWeek}`,
    });
    const warnings = getProgramConstraintWarningBuffer().filter(
      (warning) => warning.programId === program.id
    );
    const audit = auditCoverageContract({
      profile: scenario.profile,
      phase: scenario.phase,
      daysPerWeek: scenario.questionnaire.daysPerWeek,
      equipment: scenario.questionnaire.equipment,
      questionnaire: scenario.questionnaire,
      program,
      warnings,
    });
    printAuditBlock({ scenario, audit, program });
  });
};

const isDirectExecution = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(entry).href;
  } catch {
    return false;
  }
})();

if (isDirectExecution) {
  runCoverageAuditCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
