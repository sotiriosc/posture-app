/**
 * Phase 8 §5–6 — at-home composition / repetition baseline BEFORE sequencing claims.
 * Writes docs/dev-reports/at-home-composition-refinement-baseline.{md,json}.
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Program, ProgramDay } from "@/lib/types";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const OUT_MD = path.join(OUT_DIR, "at-home-composition-refinement-baseline.md");
const OUT_JSON = path.join(OUT_DIR, "at-home-composition-refinement-baseline.json");

type ModeKey =
  | "dumbbells"
  | "anchored_bands"
  | "no_anchor_bands"
  | "loop_only"
  | "bodyweight"
  | "mixed_home";

type ProfileSpec = {
  mode: ModeKey;
  id: string;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
};

const hash = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 16);

const dayMainAccessory = (day: ProgramDay) =>
  day.routine
    .filter((item) => item.section === "main" || item.section === "accessory")
    .map((item) => item.exerciseId);

const dayPrimaryMains = (day: ProgramDay) => {
  const mains = day.routine.filter((item) => item.section === "main");
  return mains.length ? [mains[0]!.exerciseId] : [];
};

const signaturesForProgram = (program: Program) => {
  const orderedCompleteWeek = program.week
    .map((day) => `${day.title}|${day.routine.map((i) => i.exerciseId).join(",")}`)
    .join("||");
  const mainAccessory = program.week
    .map((day) => `${day.title}|${dayMainAccessory(day).join(",")}`)
    .join("||");
  const primaryMain = program.week
    .map((day) => `${day.title}|${dayPrimaryMains(day).join(",")}`)
    .join("||");
  const multiset = program.week
    .flatMap((day) => day.routine.map((i) => i.exerciseId))
    .slice()
    .sort()
    .join(",");
  const prescription = program.week
    .flatMap((day) =>
      day.routine.map((i) =>
        [
          i.sets ?? "",
          i.reps ?? "",
          i.durationSec ?? "",
          i.restSec ?? "",
          i.prescription?.tempo ?? "",
          i.prescription?.rpe ?? "",
          i.prescription?.progressionRule ?? "",
        ].join(":")
      )
    )
    .join("|");
  const roleStructure = program.week
    .map((day) =>
      [
        day.title,
        ...day.routine.map(
          (i) =>
            `${i.section ?? "?"}:${i.selectionDebug?.slotLane ?? "?"}:${i.selectionDebug?.slotKind ?? "?"}`
        ),
      ].join(",")
    )
    .join("||");
  const semantic = [
    orderedCompleteWeek,
    prescription,
    String(program.phaseIndex ?? ""),
    String(program.templateVersion ?? ""),
    String(program.daysPerWeek),
    mainAccessory,
  ].join("::");

  return {
    fullSemantic: hash(semantic),
    orderedCompleteWeek: hash(orderedCompleteWeek),
    mainAccessoryOrder: hash(mainAccessory),
    primaryMain: hash(primaryMain),
    unorderedMultiset: hash(multiset),
    prescriptionOnly: hash(prescription),
    roleStructure: hash(roleStructure),
    orderedCompleteWeekRaw: orderedCompleteWeek,
    mainAccessoryOrderRaw: mainAccessory,
  };
};

const PROFILES: ProfileSpec[] = [];

const pushProfile = (spec: ProfileSpec) => {
  PROFILES.push(spec);
};

(["Beginner", "Intermediate", "Advanced"] as const).forEach((experience) => {
  ([3, 4, 5] as const).forEach((daysPerWeek) => {
    ([1, 2, 3] as const).forEach((phaseIndex) => {
      pushProfile({
        mode: "dumbbells",
        id: `db_${experience[0]}${daysPerWeek}d_p${phaseIndex}`,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience,
          equipment: daysPerWeek === 3 ? ["dumbbells"] : ["dumbbells", "bench"],
          daysPerWeek,
        },
        phaseIndex,
      });
      pushProfile({
        mode: "anchored_bands",
        id: `band_anchor_${experience[0]}${daysPerWeek}d_p${phaseIndex}`,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience,
          equipment: ["bands"],
          daysPerWeek,
          bandSetup: "long_with_anchor",
        },
        phaseIndex,
      });
      pushProfile({
        mode: "no_anchor_bands",
        id: `band_noanchor_${experience[0]}${daysPerWeek}d_p${phaseIndex}`,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience,
          equipment: ["bands"],
          daysPerWeek,
          bandSetup: "long_no_anchor",
        },
        phaseIndex,
      });
      pushProfile({
        mode: "loop_only",
        id: `band_loop_${experience[0]}${daysPerWeek}d_p${phaseIndex}`,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience,
          equipment: ["bands"],
          daysPerWeek,
          bandSetup: "loop_only",
        },
        phaseIndex,
      });
      pushProfile({
        mode: "bodyweight",
        id: `bw_${experience[0]}${daysPerWeek}d_p${phaseIndex}`,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience,
          equipment: ["none"],
          daysPerWeek,
        },
        phaseIndex,
      });
      pushProfile({
        mode: "mixed_home",
        id: `mh_${experience[0]}${daysPerWeek}d_p${phaseIndex}`,
        questionnaire: {
          goals: "General fitness",
          painAreas: [],
          experience,
          equipment: ["dumbbells", "bands", "bench"],
          daysPerWeek,
          bandSetup: "long_with_anchor",
        },
        phaseIndex,
      });
    });
  });
});

// Pain / block variants for lock classification.
pushProfile({
  mode: "dumbbells",
  id: "db_B3d_p1_shoulder",
  questionnaire: {
    goals: "Reduce pain",
    painAreas: ["Shoulders"],
    experience: "Beginner",
    equipment: ["dumbbells"],
    daysPerWeek: 3,
  },
  phaseIndex: 1,
});
pushProfile({
  mode: "bodyweight",
  id: "bw_B3d_p1_limited",
  questionnaire: {
    goals: "General fitness",
    painAreas: [],
    experience: "Beginner",
    equipment: ["none"],
    daysPerWeek: 3,
  },
  phaseIndex: 1,
});

const SEED_COUNT = 12;

type FlagClass =
  | "productive_stability"
  | "equipment_limited"
  | "only_one_truthful_structure"
  | "avoidable_sequence_lock"
  | "possible_selection_lock";

const classifyFlag = (params: {
  mode: ModeKey;
  uniqueMainAccessory: number;
  uniqueMultiset: number;
  uniqueOrdered: number;
  seedCount: number;
}): FlagClass => {
  if (params.uniqueMultiset === 1 && params.uniqueMainAccessory === 1) {
    if (params.mode === "bodyweight" || params.mode === "loop_only") {
      return "equipment_limited";
    }
    return "only_one_truthful_structure";
  }
  if (params.uniqueMultiset > 1 && params.uniqueMainAccessory === 1) {
    return "possible_selection_lock";
  }
  if (params.uniqueMultiset === 1 && params.uniqueOrdered === 1 && params.uniqueMainAccessory === 1) {
    return "productive_stability";
  }
  if (params.uniqueMainAccessory === 1 && params.uniqueMultiset >= 1) {
    return "avoidable_sequence_lock";
  }
  return "productive_stability";
};

const countUnique = (values: string[]) => new Set(values).size;

const mostCommon = (values: string[]) => {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  let best = "";
  let bestCount = 0;
  counts.forEach((count, key) => {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  });
  return { key: best, count: bestCount, share: values.length ? bestCount / values.length : 0 };
};

const main = () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const profileResults: Array<Record<string, unknown>> = [];
  const modeAggregates: Record<
    string,
    {
      programs: number;
      semantic: string[];
      ordered: string[];
      mainAccessory: string[];
      primaryMain: string[];
      multiset: string[];
      prescription: string[];
      roleStructure: string[];
      topOrderedRaw: Array<{ raw: string; count: number }>;
    }
  > = {};

  for (const profile of PROFILES) {
    const rows: Array<ReturnType<typeof signaturesForProgram> & { seed: string }> = [];
    for (let i = 0; i < SEED_COUNT; i += 1) {
      const seed = `comp-base-${profile.id}-${i + 1}`;
      clearProgramConstraintWarningBuffer();
      clearProgramVariationHistory();
      try {
        const program = generateWeeklyProgram(profile.questionnaire, seed, {
          phaseIndex: profile.phaseIndex,
          seed,
          cycleIndex: 1,
          weekIndex: 1,
        });
        void resolvePrimaryProgramEquipmentMode(profile.questionnaire.equipment ?? []);
        rows.push({ ...signaturesForProgram(program), seed });
      } catch (error) {
        console.warn(
          `Skipped ${profile.id} seed ${i + 1}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    const semantic = rows.map((r) => r.fullSemantic);
    const ordered = rows.map((r) => r.orderedCompleteWeek);
    const mainAccessory = rows.map((r) => r.mainAccessoryOrder);
    const primaryMain = rows.map((r) => r.primaryMain);
    const multiset = rows.map((r) => r.unorderedMultiset);
    const prescription = rows.map((r) => r.prescriptionOnly);
    const roleStructure = rows.map((r) => r.roleStructure);

    const uniqueMainAccessory = countUnique(mainAccessory);
    const flagged = uniqueMainAccessory === 1 && rows.length >= 10;
    const flagClass = flagged
      ? classifyFlag({
          mode: profile.mode,
          uniqueMainAccessory,
          uniqueMultiset: countUnique(multiset),
          uniqueOrdered: countUnique(ordered),
          seedCount: rows.length,
        })
      : null;

    const result = {
      profileId: profile.id,
      mode: profile.mode,
      phaseIndex: profile.phaseIndex,
      daysPerWeek: profile.questionnaire.daysPerWeek,
      experience: profile.questionnaire.experience,
      seedCount: rows.length,
      uniqueSemantic: countUnique(semantic),
      uniqueOrderedCompleteWeek: countUnique(ordered),
      uniqueMainAccessoryOrder: uniqueMainAccessory,
      uniquePrimaryMain: countUnique(primaryMain),
      uniqueMultiset: countUnique(multiset),
      uniquePrescription: countUnique(prescription),
      uniqueRoleStructure: countUnique(roleStructure),
      mostCommonOrderedShare: mostCommon(ordered).share,
      mostCommonMainAccessoryShare: mostCommon(mainAccessory).share,
      flaggedIdenticalMainAccessory: flagged,
      flagClass,
      sampleMainAccessoryRaw: rows[0]?.mainAccessoryOrderRaw ?? "",
    };
    profileResults.push(result);

    const agg = (modeAggregates[profile.mode] ??= {
      programs: 0,
      semantic: [],
      ordered: [],
      mainAccessory: [],
      primaryMain: [],
      multiset: [],
      prescription: [],
      roleStructure: [],
      topOrderedRaw: [],
    });
    agg.programs += rows.length;
    agg.semantic.push(...semantic);
    agg.ordered.push(...ordered);
    agg.mainAccessory.push(...mainAccessory);
    agg.primaryMain.push(...primaryMain);
    agg.multiset.push(...multiset);
    agg.prescription.push(...prescription);
    agg.roleStructure.push(...roleStructure);
    const orderedRawCounts = new Map<string, number>();
    rows.forEach((r) => {
      orderedRawCounts.set(
        r.orderedCompleteWeekRaw,
        (orderedRawCounts.get(r.orderedCompleteWeekRaw) ?? 0) + 1
      );
    });
    orderedRawCounts.forEach((count, raw) => {
      agg.topOrderedRaw.push({ raw, count });
    });
  }

  const modeSummary = Object.fromEntries(
    Object.entries(modeAggregates).map(([mode, agg]) => {
      const top20 = [...agg.topOrderedRaw]
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map((entry) => ({
          count: entry.count,
          share: entry.count / Math.max(agg.programs, 1),
          preview: entry.raw.slice(0, 180),
        }));
      return [
        mode,
        {
          programs: agg.programs,
          uniqueSemantic: countUnique(agg.semantic),
          uniqueOrderedCompleteWeek: countUnique(agg.ordered),
          uniqueMainAccessoryOrder: countUnique(agg.mainAccessory),
          uniquePrimaryMain: countUnique(agg.primaryMain),
          uniqueMultiset: countUnique(agg.multiset),
          uniquePrescription: countUnique(agg.prescription),
          uniqueRoleStructure: countUnique(agg.roleStructure),
          mostCommonOrderedShare: mostCommon(agg.ordered).share,
          mostCommonMainAccessoryShare: mostCommon(agg.mainAccessory).share,
          top20RepeatedOrderedWeeks: top20,
        },
      ];
    })
  );

  const flaggedProfiles = profileResults.filter((p) => p.flaggedIdenticalMainAccessory);

  const payload = {
    generatedAt: new Date().toISOString(),
    note: "Baseline captured on engine/at-home-composition-refinement after gate corrections; sequencing policy is active in generator.",
    seedCountPerProfile: SEED_COUNT,
    profileCount: PROFILES.length,
    modeSummary,
    flaggedProfiles,
    profiles: profileResults,
  };

  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));

  const md: string[] = [];
  md.push("# At-home composition refinement — baseline (§5–6)");
  md.push("");
  md.push(`Generated: ${payload.generatedAt}`);
  md.push(`Profiles: ${payload.profileCount} × ${SEED_COUNT} seeds`);
  md.push("");
  md.push("> Signatures tracked separately: full semantic, ordered complete-week, main+accessory order, primary-main, unordered multiset, prescription-only, role-structure.");
  md.push("");
  md.push("## Mode summary");
  md.push("");
  md.push(
    "| Mode | Programs | Semantic | Ordered week | Main/acc order | Primary main | Multiset | Prescription | Role struct | Top ordered share | Top main/acc share |"
  );
  md.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
  Object.entries(modeSummary).forEach(([mode, s]) => {
    const summary = s as {
      programs: number;
      uniqueSemantic: number;
      uniqueOrderedCompleteWeek: number;
      uniqueMainAccessoryOrder: number;
      uniquePrimaryMain: number;
      uniqueMultiset: number;
      uniquePrescription: number;
      uniqueRoleStructure: number;
      mostCommonOrderedShare: number;
      mostCommonMainAccessoryShare: number;
    };
    md.push(
      `| ${mode} | ${summary.programs} | ${summary.uniqueSemantic} | ${summary.uniqueOrderedCompleteWeek} | ${summary.uniqueMainAccessoryOrder} | ${summary.uniquePrimaryMain} | ${summary.uniqueMultiset} | ${summary.uniquePrescription} | ${summary.uniqueRoleStructure} | ${(summary.mostCommonOrderedShare * 100).toFixed(1)}% | ${(summary.mostCommonMainAccessoryShare * 100).toFixed(1)}% |`
    );
  });
  md.push("");
  md.push("## Flagged profiles (≥10 seeds → one identical main/accessory order)");
  md.push("");
  if (!flaggedProfiles.length) {
    md.push("None.");
  } else {
    md.push("| Profile | Mode | Class | Unique multiset | Unique ordered | Main/acc share |");
    md.push("|---|---|---|---:|---:|---:|");
    flaggedProfiles.forEach((p) => {
      md.push(
        `| ${p.profileId} | ${p.mode} | ${p.flagClass} | ${p.uniqueMultiset} | ${p.uniqueOrderedCompleteWeek} | ${((p.mostCommonMainAccessoryShare as number) * 100).toFixed(1)}% |`
      );
    });
  }
  md.push("");
  md.push("## Classification guide");
  md.push("");
  md.push("- `productive_stability` — intentional stability with progression room");
  md.push("- `equipment_limited` — pool too small for meaningful order alternatives");
  md.push("- `only_one_truthful_structure` — only one quality-valid exercise structure");
  md.push("- `avoidable_sequence_lock` — same order despite room to rotate equivalents");
  md.push("- `possible_selection_lock` — exercise set varies but order signature collapsed");
  md.push("");
  md.push("See JSON for top-20 repeated ordered weeks and full profile rows.");
  md.push("");

  writeFileSync(OUT_MD, md.join("\n"));
  console.log(`Wrote ${OUT_MD}`);
  console.log(`Wrote ${OUT_JSON}`);
  console.log(
    JSON.stringify(
      {
        flagged: flaggedProfiles.length,
        modes: Object.fromEntries(
          Object.entries(modeSummary).map(([m, s]) => [
            m,
            {
              ordered: (s as { uniqueOrderedCompleteWeek: number }).uniqueOrderedCompleteWeek,
              mainAcc: (s as { uniqueMainAccessoryOrder: number }).uniqueMainAccessoryOrder,
              topShare: (s as { mostCommonMainAccessoryShare: number }).mostCommonMainAccessoryShare,
            },
          ])
        ),
      },
      null,
      2
    )
  );
};

main();
