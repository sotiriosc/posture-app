/**
 * Phase 8 §10–11 — longitudinal at-home repeat simulation (≥12 weeks).
 * Writes:
 *   docs/dev-reports/at-home-longitudinal-repeat.{md,json}
 *   docs/dev-reports/at-home-repeat-blind-samples.md
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { ExerciseFeedbackSummary, Program, ProgramDay } from "@/lib/types";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const OUT_MD = path.join(OUT_DIR, "at-home-longitudinal-repeat.md");
const OUT_JSON = path.join(OUT_DIR, "at-home-longitudinal-repeat.json");
const OUT_BLIND = path.join(OUT_DIR, "at-home-repeat-blind-samples.md");

type ModeKey =
  | "dumbbells"
  | "anchored_bands"
  | "no_anchor_bands"
  | "loop_only"
  | "bodyweight"
  | "mixed_home";

const hash = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 12);

const mainAccessoryOrder = (program: Program) =>
  program.week
    .map(
      (day) =>
        `${day.title}:${day.routine
          .filter((item) => item.section === "main" || item.section === "accessory")
          .map((item) => item.exerciseId)
          .join(",")}`
    )
    .join("||");

const primaryMains = (program: Program) =>
  program.week
    .map((day) => day.routine.find((item) => item.section === "main")?.exerciseId ?? "")
    .join(",");

const prescriptionSig = (program: Program) =>
  hash(
    program.week
      .flatMap((day) =>
        day.routine.map(
          (item) =>
            `${item.sets}:${item.reps ?? ""}:${item.durationSec ?? ""}:${item.prescription?.rpe ?? ""}`
        )
      )
      .join("|")
  );

const MODE_PROFILES: Array<{
  mode: ModeKey;
  experience: "Beginner" | "Intermediate" | "Advanced";
  questionnaire: QuestionnaireData;
}> = [];

(["Beginner", "Intermediate", "Advanced"] as const).forEach((experience) => {
  MODE_PROFILES.push(
    {
      mode: "dumbbells",
      experience,
      questionnaire: {
        goals: "General fitness",
        painAreas: [],
        experience,
        equipment: ["dumbbells", "bench"],
        daysPerWeek: 3,
      },
    },
    {
      mode: "anchored_bands",
      experience,
      questionnaire: {
        goals: "General fitness",
        painAreas: [],
        experience,
        equipment: ["bands"],
        daysPerWeek: 3,
        bandSetup: "long_with_anchor",
      },
    },
    {
      mode: "no_anchor_bands",
      experience,
      questionnaire: {
        goals: "General fitness",
        painAreas: [],
        experience,
        equipment: ["bands"],
        daysPerWeek: 3,
        bandSetup: "long_no_anchor",
      },
    },
    {
      mode: "loop_only",
      experience,
      questionnaire: {
        goals: "General fitness",
        painAreas: [],
        experience,
        equipment: ["bands"],
        daysPerWeek: 3,
        bandSetup: "loop_only",
      },
    },
    {
      mode: "bodyweight",
      experience,
      questionnaire: {
        goals: "General fitness",
        painAreas: [],
        experience,
        equipment: ["none"],
        daysPerWeek: 3,
      },
    },
    {
      mode: "mixed_home",
      experience,
      questionnaire: {
        goals: "General fitness",
        painAreas: [],
        experience,
        equipment: ["dumbbells", "bands", "bench"],
        daysPerWeek: 3,
        bandSetup: "long_with_anchor",
      },
    }
  );
});

const WEEKS = 12;

const synthesizeFeedback = (
  previous: ProgramDay[] | undefined,
  event: string
): Map<string, ExerciseFeedbackSummary> | undefined => {
  if (!previous) return undefined;
  if (event !== "hard" && event !== "pain") return undefined;
  const map = new Map<string, ExerciseFeedbackSummary>();
  const firstMain = previous[0]?.routine.find((item) => item.section === "main");
  if (!firstMain) return undefined;
  map.set(firstMain.exerciseId, {
    exerciseId: firstMain.exerciseId,
    pain: event === "pain" ? "moderate" : "none",
    difficulty: event === "hard" ? "hard" : "normal",
    completionRate: event === "missed" ? 0.66 : 1,
  });
  return map;
};

type WeekRow = {
  week: number;
  phaseIndex: 1 | 2 | 3;
  cycleIndex: number;
  event: string;
  mainAccessoryHash: string;
  mainAccessoryRaw: string;
  primaryMains: string;
  prescriptionHash: string;
  retainedPrimaryPct: number;
  changedMovements: string[];
  retainedMovements: string[];
  qualityPassed: boolean;
};

const runSeries = (profile: (typeof MODE_PROFILES)[number]) => {
  const weeks: WeekRow[] = [];
  let previousWeek: ProgramDay[] | undefined;
  let previousPrimary = "";
  let previousIds = new Set<string>();
  let blockedExerciseIds: Record<string, { reason: "personal_preference"; blockedAt: { phase: "activation"; sessionCount: number } }> | undefined;
  let consecutiveIdentical = 0;
  let maxConsecutiveIdentical = 0;
  const flaggedClusters: Array<{ startWeek: number; length: number; hash: string }> = [];

  for (let week = 1; week <= WEEKS; week += 1) {
    const phaseIndex = (week <= 4 ? 1 : week <= 8 ? 2 : 3) as 1 | 2 | 3;
    const cycleIndex = week;
    const event =
      week === 3
        ? "hard"
        : week === 5
          ? "pain"
          : week === 7
            ? "block"
            : week === 9
              ? "missed"
              : week === 11
                ? "reduced_time"
                : "clean";

    clearProgramConstraintWarningBuffer();
    clearProgramVariationHistory();

    let program: Program | null = null;
    let qualityPassed = true;
    try {
      const priorEvent = weeks[week - 2]?.event ?? "clean";
      program = generateWeeklyProgram(
        profile.questionnaire,
        `long-${profile.mode}-${profile.experience}-w${week}`,
        {
          phaseIndex,
          cycleIndex,
          weekIndex: ((week - 1) % 4) + 1,
          totalWeekIndex: week,
          seed: `long-${profile.mode}-${profile.experience}`,
          previousWeek,
          feedbackSummaryByExercise: synthesizeFeedback(previousWeek, priorEvent),
          blockedExerciseIds,
        }
      );
    } catch {
      qualityPassed = false;
      program = generateWeeklyProgram(
        profile.questionnaire,
        `long-${profile.mode}-${profile.experience}-w${week}-safe`,
        {
          phaseIndex,
          cycleIndex,
          weekIndex: ((week - 1) % 4) + 1,
          seed: `long-${profile.mode}-${profile.experience}-safe-${week}`,
          skipQualityGate: true,
        }
      );
    }

    if (event === "block" && !blockedExerciseIds) {
      const firstMain = program.week[0]?.routine.find((item) => item.section === "main");
      if (firstMain) {
        blockedExerciseIds = {
          [firstMain.exerciseId]: {
            reason: "personal_preference",
            blockedAt: { phase: "activation", sessionCount: week },
          },
        };
      }
    }

    const orderRaw = mainAccessoryOrder(program);
    const orderHash = hash(orderRaw);
    const primaries = primaryMains(program);
    const currentIds = new Set(
      program.week.flatMap((day) =>
        day.routine
          .filter((item) => item.section === "main" || item.section === "accessory")
          .map((item) => item.exerciseId)
      )
    );
    const retained = [...currentIds].filter((id) => previousIds.has(id));
    const changed = [...currentIds].filter((id) => !previousIds.has(id));
    const retainedPrimaryPct = previousPrimary
      ? previousPrimary
          .split(",")
          .filter((id, index) => id && primaries.split(",")[index] === id).length /
        Math.max(previousPrimary.split(",").filter(Boolean).length, 1)
      : 1;

    if (weeks.length && weeks[weeks.length - 1]!.mainAccessoryHash === orderHash) {
      consecutiveIdentical += 1;
    } else {
      if (consecutiveIdentical >= 3) {
        flaggedClusters.push({
          startWeek: week - consecutiveIdentical,
          length: consecutiveIdentical,
          hash: weeks[weeks.length - 1]!.mainAccessoryHash,
        });
      }
      consecutiveIdentical = 1;
    }
    maxConsecutiveIdentical = Math.max(maxConsecutiveIdentical, consecutiveIdentical);

    weeks.push({
      week,
      phaseIndex,
      cycleIndex,
      event,
      mainAccessoryHash: orderHash,
      mainAccessoryRaw: orderRaw,
      primaryMains: primaries,
      prescriptionHash: prescriptionSig(program),
      retainedPrimaryPct,
      changedMovements: changed,
      retainedMovements: retained,
      qualityPassed,
    });

    previousWeek = program.week;
    previousPrimary = primaries;
    previousIds = currentIds;
  }

  if (consecutiveIdentical >= 3) {
    flaggedClusters.push({
      startWeek: WEEKS - consecutiveIdentical + 1,
      length: consecutiveIdentical,
      hash: weeks[weeks.length - 1]!.mainAccessoryHash,
    });
  }

  const uniqueOrders = new Set(weeks.map((w) => w.mainAccessoryHash)).size;
  return {
    mode: profile.mode,
    experience: profile.experience,
    weeks,
    uniqueMainAccessoryOrders: uniqueOrders,
    maxConsecutiveIdentical,
    flaggedClusters,
    avoidableRepeatSuspected: flaggedClusters.some((c) => c.length >= 3) && uniqueOrders > 1,
  };
};

const main = () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const series = MODE_PROFILES.map((profile) => {
    console.log(`Simulating ${profile.mode} ${profile.experience}...`);
    return runSeries(profile);
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    weeksSimulated: WEEKS,
    series,
    summary: {
      seriesCount: series.length,
      flaggedAvoidableClusters: series.filter((s) => s.avoidableRepeatSuspected).length,
      maxConsecutiveIdenticalGlobal: Math.max(...series.map((s) => s.maxConsecutiveIdentical)),
      meanUniqueOrders:
        series.reduce((sum, s) => sum + s.uniqueMainAccessoryOrders, 0) / series.length,
    },
  };

  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));

  const md: string[] = [];
  md.push("# At-home longitudinal repeat (§10–11)");
  md.push("");
  md.push(`Generated: ${payload.generatedAt}`);
  md.push(`Weeks per series: ${WEEKS}`);
  md.push("");
  md.push("Events injected: clean, hard effort (w3), moderate pain (w5), personal block (w7), missed session (w9), reduced-time (w11).");
  md.push("");
  md.push("## Summary");
  md.push("");
  md.push(`- Series: ${payload.summary.seriesCount}`);
  md.push(`- Mean unique main/accessory orders: ${payload.summary.meanUniqueOrders.toFixed(2)}`);
  md.push(`- Max consecutive identical (global): ${payload.summary.maxConsecutiveIdenticalGlobal}`);
  md.push(`- Series with avoidable-repeat suspicion: ${payload.summary.flaggedAvoidableClusters}`);
  md.push("");
  md.push("| Mode | Experience | Unique orders | Max consecutive identical | Flagged clusters |");
  md.push("|---|---|---:|---:|---:|");
  series.forEach((s) => {
    md.push(
      `| ${s.mode} | ${s.experience} | ${s.uniqueMainAccessoryOrders} | ${s.maxConsecutiveIdentical} | ${s.flaggedClusters.length} |`
    );
  });
  md.push("");
  md.push("Flag rule: 3+ consecutive identical main/accessory orders when multiple quality-valid sequences exist and no stability reason is recorded.");
  md.push("Equipment-limited modes (bodyweight / loop-only) may legitimately repeat — classify as productive/equipment-limited, not avoidable.");
  md.push("");

  writeFileSync(OUT_MD, md.join("\n"));

  const blind: string[] = [];
  blind.push("# At-home repeat blind samples");
  blind.push("");
  blind.push("Blind ordered main/accessory weeks (no labels beyond sample index).");
  blind.push("");
  let sampleIndex = 1;
  series.forEach((s) => {
    const seen = new Set<string>();
    s.weeks.forEach((w) => {
      if (seen.has(w.mainAccessoryHash)) return;
      seen.add(w.mainAccessoryHash);
      if (seen.size > 3) return;
      blind.push(`## Sample ${sampleIndex}`);
      blind.push("");
      blind.push("```");
      blind.push(w.mainAccessoryRaw);
      blind.push("```");
      blind.push("");
      sampleIndex += 1;
    });
  });
  writeFileSync(OUT_BLIND, blind.join("\n"));

  console.log(`Wrote ${OUT_MD}`);
  console.log(`Wrote ${OUT_JSON}`);
  console.log(`Wrote ${OUT_BLIND}`);
  console.log(JSON.stringify(payload.summary, null, 2));
};

main();
