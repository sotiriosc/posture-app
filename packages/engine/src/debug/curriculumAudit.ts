import { exerciseById } from "@/lib/exercises";
import type { Program } from "@/lib/types";

export type CurriculumAuditReport = {
  ok: boolean;
  issues: string[];
  warnings: string[];
  summary: {
    days: number;
    mainPerDay: number[];
    weightedMainPerDay: number[];
  };
};

const validSections = new Set([
  "warmup",
  "activation",
  "main",
  "accessory",
  "cooldown",
]);

export const auditCurriculum = (program: Program): CurriculumAuditReport => {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!program.week?.length) {
    issues.push("Program week is empty.");
  }

  if (program.week.length !== program.daysPerWeek) {
    issues.push(
      `Week length mismatch: expected ${program.daysPerWeek}, got ${program.week.length}.`
    );
  }

  const mainPerDay: number[] = [];
  const weightedMainPerDay: number[] = [];

  program.week.forEach((day, dayIndex) => {
    if (day.dayIndex !== dayIndex) {
      warnings.push(
        `${day.title}: dayIndex is ${day.dayIndex}, expected ${dayIndex}.`
      );
    }

    const mainIds = new Set<string>();
    let mainCount = 0;
    let weightedMainCount = 0;

    day.routine.forEach((item, routineIndex) => {
      if (item.section && !validSections.has(item.section)) {
        issues.push(
          `${day.title}: invalid section "${item.section}" at routine index ${
            routineIndex + 1
          }.`
        );
      }

      const exercise = exerciseById(item.exerciseId);
      if (!exercise) {
        issues.push(
          `${day.title}: unknown exercise "${item.exerciseId}" at routine index ${
            routineIndex + 1
          }.`
        );
        return;
      }

      if (item.section === "main") {
        mainCount += 1;
        if (mainIds.has(item.exerciseId)) {
          issues.push(`${day.title}: duplicate main exercise "${item.exerciseId}".`);
        } else {
          mainIds.add(item.exerciseId);
        }
        if (exercise.category !== "main") {
          issues.push(
            `${day.title}: non-main exercise "${item.exerciseId}" placed in main section.`
          );
        }
        if (item.loadType === "weighted" || exercise.loadType === "weighted") {
          weightedMainCount += 1;
        }
      }

      if (item.section === "activation" && exercise.category === "cooldown") {
        warnings.push(
          `${day.title}: cooldown exercise "${item.exerciseId}" used in activation section.`
        );
      }
    });

    if (mainCount === 0) {
      issues.push(`${day.title}: no main exercises found.`);
    }

    mainPerDay.push(mainCount);
    weightedMainPerDay.push(weightedMainCount);
  });

  return {
    ok: issues.length === 0,
    issues,
    warnings,
    summary: {
      days: program.week.length,
      mainPerDay,
      weightedMainPerDay,
    },
  };
};

