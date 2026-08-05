/**
 * Deterministic reproduction of Phase 7 Completion matrix blockers.
 */
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
  getWeeklyCoverageContract,
  summarizeWeekCoverage,
} from "@/lib/program";
import { auditCoverageContract } from "@/lib/__debug__/coverageContractAudit";
import { exerciseById } from "@/lib/exercises";

const PHASES = [
  { key: "activation" as const, phaseIndex: 1 as const },
  { key: "skill" as const, phaseIndex: 2 as const },
  { key: "growth" as const, phaseIndex: 3 as const },
];
const DAYS: Array<3 | 4 | 5> = [3, 4, 5];
const EQUIPMENT = [
  { label: "none", values: ["none"] },
  { label: "bands", values: ["bands"] },
  { label: "gym", values: ["gym"] },
];
const PROFILES = [
  {
    name: "pain beginner",
    goals: "Reduce pain" as const,
    painAreas: ["low_back", "shoulders"],
    experience: "Beginner" as const,
  },
  {
    name: "normal beginner",
    goals: "Improve posture" as const,
    painAreas: [] as string[],
    experience: "Beginner" as const,
  },
  {
    name: "intermediate",
    goals: "Improve posture" as const,
    painAreas: [] as string[],
    experience: "Intermediate" as const,
  },
  {
    name: "advanced",
    goals: "Athletic performance" as const,
    painAreas: [] as string[],
    experience: "Advanced" as const,
  },
  {
    name: "pain advanced",
    goals: "Reduce pain" as const,
    painAreas: ["low_back", "neck"],
    experience: "Advanced" as const,
  },
];

type FailureRow = {
  code: string;
  profile: string;
  phase: string;
  days: number;
  equipment: string;
  weekly: Record<string, number>;
  weeklyFailures: string[];
  intelligenceFailures: string[];
  dayTitles: string[];
  accessoriesByDay: Record<string, string[]>;
  mainsByDay: Record<string, string[]>;
  seed: string;
};

const rows: FailureRow[] = [];

for (const profile of PROFILES) {
  for (const daysPerWeek of DAYS) {
    for (const equipmentCase of EQUIPMENT) {
      for (const phase of PHASES) {
        const questionnaire: QuestionnaireData = {
          goals: profile.goals,
          painAreas: [...profile.painAreas],
          experience: profile.experience,
          daysPerWeek,
          equipment: [...equipmentCase.values],
        };
        const seed = `phase-matrix-${profile.name}-${daysPerWeek}-${equipmentCase.label}-${phase.key}`;
        clearProgramVariationHistory();
        clearProgramConstraintWarningBuffer();
        const program = generateWeeklyProgram(
          questionnaire,
          `repro-${seed}`,
          { phaseIndex: phase.phaseIndex, seed, skipQualityGate: true }
        );
        const warnings = getProgramConstraintWarningBuffer().filter(
          (w) => w.programId === program.id
        );
        const audit = auditCoverageContract({
          profile: profile.name,
          phase: phase.key,
          daysPerWeek,
          equipment: equipmentCase.values,
          questionnaire,
          program,
          warnings,
        });
        const weekly = summarizeWeekCoverage(program.week);
        const contract = getWeeklyCoverageContract(daysPerWeek);
        const armPushFail =
          daysPerWeek === 4 &&
          equipmentCase.label === "gym" &&
          (weekly.bicepsDays < contract.bicepsDays ||
            weekly.tricepsDays < contract.tricepsDays ||
            weekly.pushDays < contract.pushDays);
        const carryFail = audit.intelligenceFailures.some((f) =>
          f.includes("Carry exposure missing")
        );
        if (!armPushFail && !carryFail) continue;
        const accessoriesByDay: Record<string, string[]> = {};
        const mainsByDay: Record<string, string[]> = {};
        for (const day of program.week) {
          accessoriesByDay[day.title] = day.routine
            .filter((i) => i.section === "accessory")
            .map((i) => i.exerciseId);
          mainsByDay[day.title] = day.routine
            .filter((i) => i.section === "main")
            .map((i) => i.exerciseId);
        }
        if (armPushFail) {
          rows.push({
            code: "MATRIX_GYM_4D_BICEPS_TRICEPS_PUSH_COVERAGE",
            profile: profile.name,
            phase: phase.key,
            days: daysPerWeek,
            equipment: equipmentCase.label,
            weekly: weekly as unknown as Record<string, number>,
            weeklyFailures: audit.weeklyFailures,
            intelligenceFailures: audit.intelligenceFailures,
            dayTitles: program.week.map((d) => d.title),
            accessoriesByDay,
            mainsByDay,
            seed,
          });
        }
        if (carryFail) {
          rows.push({
            code: "MATRIX_CARRY_EXPOSURE_INTELLIGENCE",
            profile: profile.name,
            phase: phase.key,
            days: daysPerWeek,
            equipment: equipmentCase.label,
            weekly: weekly as unknown as Record<string, number>,
            weeklyFailures: audit.weeklyFailures,
            intelligenceFailures: audit.intelligenceFailures,
            dayTitles: program.week.map((d) => d.title),
            accessoriesByDay,
            mainsByDay,
            seed,
          });
        }
      }
    }
  }
}

const summarize = (code: string) => {
  const subset = rows.filter((r) => r.code === code);
  const keys = new Map<string, number>();
  for (const row of subset) {
    const key = `${row.profile}|${row.days}d|${row.equipment}|${row.phase}`;
    keys.set(key, (keys.get(key) ?? 0) + 1);
  }
  return {
    count: subset.length,
    personas: [...keys.keys()],
    sample: subset.slice(0, 3).map((row) => ({
      ...row,
      accessoryTags: Object.fromEntries(
        Object.entries(row.accessoriesByDay).map(([title, ids]) => [
          title,
          ids.map((id) => {
            const ex = exerciseById(id);
            return {
              id,
              patterns: ex?.movementPattern ?? [],
              tags: ex?.tags?.slice(0, 6) ?? [],
            };
          }),
        ])
      ),
    })),
  };
};

console.log(
  JSON.stringify(
    {
      totalFailureRows: rows.length,
      armPush: summarize("MATRIX_GYM_4D_BICEPS_TRICEPS_PUSH_COVERAGE"),
      carry: summarize("MATRIX_CARRY_EXPOSURE_INTELLIGENCE"),
    },
    null,
    2
  )
);
