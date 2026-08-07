/**
 * Phase 3 dumbbell program audit + 10k fuzz.
 * Does not overwrite Phase 0–2 equipment-program reports.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import {
  collectDeferredDumbbellExperienceGaps,
  scoreDumbbellProgramStructuralQuality,
  validateDumbbellProgramContract,
  type DumbbellHardFailure,
} from "@/lib/program/dumbbellProgramContract";
import { exerciseById } from "@/lib/exercises";
import { buildCanonicalFuzzCase } from "@/lib/__debug__/lib/canonicalFuzzCases";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const SUMMARY_MD = path.join(OUT_DIR, "equipment-program-audit-phase3.md");
const SUMMARY_JSON = path.join(OUT_DIR, "equipment-program-audit-phase3.json");
const PERSONAS_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase3-dumbbell-personas.md"
);
const FAILURES_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase3-hard-failures-initial-vs-final.md"
);
const FUZZ_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase3-dumbbell-fuzz-10k.md"
);

type FlagshipPersona = {
  id: string;
  label: string;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
};

const FLAGSHIP: FlagshipPersona[] = [
  {
    id: "db_3d_beginner_p1",
    label: "Beginner three-day dumbbells / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "db_3d_intermediate_p1",
    label: "Intermediate three-day dumbbells / activation",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "db_3d_advanced_p1",
    label: "Advanced three-day dumbbells / activation",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "db_4d_intermediate_p2",
    label: "Four-day dumbbells / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells"],
      daysPerWeek: 4,
    },
    phaseIndex: 2,
  },
  {
    id: "db_5d_advanced_p3",
    label: "Five-day dumbbells / growth",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["dumbbells"],
      daysPerWeek: 5,
    },
    phaseIndex: 3,
  },
  {
    id: "db_3d_no_bench_p1",
    label: "No-bench dumbbells / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "db_3d_bench_confirmed_p2",
    label: "Confirmed-bench dumbbells / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bench"],
      daysPerWeek: 3,
    },
    phaseIndex: 2,
  },
  {
    id: "db_3d_shoulder_pain_p1",
    label: "Shoulder-pain dumbbells / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "db_3d_low_back_pain_p1",
    label: "Low-back-pain dumbbells / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Lower back"],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "db_3d_beginner_p2",
    label: "Beginner three-day dumbbells / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    phaseIndex: 2,
  },
  {
    id: "db_3d_beginner_p3",
    label: "Beginner three-day dumbbells / growth",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells"],
      daysPerWeek: 3,
    },
    phaseIndex: 3,
  },
];

/** Step A — Phase 0/1 documented dumbbell failure modes (pre-Phase-3 ownership). */
const INITIAL_BASELINE_FAILURE_INVENTORY: Array<{
  reasonCode: string;
  detail: string;
  source: string;
}> = [
  {
    reasonCode: "DUMBBELL_GYM_TEMPLATE_INHERITANCE",
    detail:
      "Dumbbells/mixedHome collapsed toward gym-shaped body-part titles via hasLoad identity.",
    source: "Phase 0/1 equipment-program audit",
  },
  {
    reasonCode: "DUMBBELL_IDENTITY_COLLAPSE",
    detail: "primaryEquipmentMode did not remain first-class dumbbells before Phase 1.",
    source: "Phase 0/1 equipment-program audit",
  },
  {
    reasonCode: "DUMBBELL_UNCONFIRMED_BENCH",
    detail: "Home loaded programming could assume bench/chair/step support without confirmation.",
    source: "Phase 0 equipment assumption findings",
  },
  {
    reasonCode: "DUMBBELL_FALSE_VERTICAL_PULL",
    detail: "Pullover/lat-sweep style work could be treated as vertical-pull coverage.",
    source: "Phase 0 pull-honesty findings",
  },
];

const auditPersona = (persona: FlagshipPersona) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  const program = generateWeeklyProgram(
    persona.questionnaire,
    `phase3-${persona.id}`,
    {
      phaseIndex: persona.phaseIndex,
      seed: `phase3-${persona.id}`,
      skipQualityGate: true,
    }
  );
  const primaryMode = resolvePrimaryProgramEquipmentMode(
    persona.questionnaire.equipment
  );
  const failures = validateDumbbellProgramContract({
    program,
    persona: persona.id,
    equipment: persona.questionnaire.equipment,
    experience: persona.questionnaire.experience,
    painAreas: persona.questionnaire.painAreas,
    phaseIndex: persona.phaseIndex,
  });
  const deferred = collectDeferredDumbbellExperienceGaps(program);
  const scores = scoreDumbbellProgramStructuralQuality({
    failures,
    deferredGapCount: deferred.length,
  });

  return {
    persona,
    primaryMode,
    program,
    failures,
    deferred,
    scores,
    daySummaries: program.week.map((day) => ({
      title: day.title,
      mains: day.routine
        .filter((item) => item.section === "main")
        .map((item) => ({
          id: item.exerciseId,
          name: exerciseById(item.exerciseId)?.name ?? item.exerciseId,
          slot: item.selectionDebug?.slotKind ?? null,
          lane: item.selectionDebug?.slotLane ?? null,
        })),
      accessories: day.routine
        .filter((item) => item.section === "accessory")
        .map((item) => item.exerciseId),
    })),
  };
};

const runFuzz = (targetCases: number) => {
  const buckets = {
    illegalEquipment: 0,
    unconfirmedSupport: 0,
    gymTemplateInheritance: 0,
    falseVerticalPull: 0,
    missingHorizontalPull: 0,
    missingHinge: 0,
    dayIdentityMismatch: 0,
    duplicateFamily: 0,
    complexityExcess: 0,
    weeklyCoverage: 0,
    phaseChurn: 0,
    exceptions: 0,
    identityCollapse: 0,
    deterministicRepeat: 0,
  };
  const reasonCounts = new Map<string, number>();

  for (let i = 0; i < targetCases; i += 1) {
    const fuzzCase = buildCanonicalFuzzCase("dumbbells", i);
    const { questionnaire, phaseIndex, seed } = fuzzCase;
    const { experience, painAreas, equipment } = questionnaire;

    try {
      if (resolvePrimaryProgramEquipmentMode(equipment) !== "dumbbells") {
        buckets.identityCollapse += 1;
      }
      clearProgramVariationHistory();
      clearProgramConstraintWarningBuffer();
      const programA = generateWeeklyProgram(questionnaire, `db-fuzz-a-${i}`, {
        phaseIndex,
        seed,
        skipQualityGate: true,
      });

      if (i % 25 === 0) {
        clearProgramVariationHistory();
        clearProgramConstraintWarningBuffer();
        const programB = generateWeeklyProgram(questionnaire, `db-fuzz-b-${i}`, {
          phaseIndex,
          seed,
          skipQualityGate: true,
        });
        const sigA = programA.week
          .map(
            (day) =>
              `${day.title}:${day.routine.map((item) => item.exerciseId).join(",")}`
          )
          .join("|");
        const sigB = programB.week
          .map(
            (day) =>
              `${day.title}:${day.routine.map((item) => item.exerciseId).join(",")}`
          )
          .join("|");
        if (sigA !== sigB) {
          buckets.deterministicRepeat += 1;
        }
      }

      const failures = validateDumbbellProgramContract({
        program: programA,
        persona: `db-fuzz-${i}`,
        equipment,
        experience,
        painAreas,
        phaseIndex,
      });
      failures.forEach((failure) => {
        reasonCounts.set(
          failure.reasonCode,
          (reasonCounts.get(failure.reasonCode) ?? 0) + 1
        );
        if (failure.reasonCode === "DUMBBELL_ILLEGAL_EQUIPMENT") {
          buckets.illegalEquipment += 1;
        } else if (
          failure.reasonCode === "DUMBBELL_UNCONFIRMED_SUPPORT" ||
          failure.reasonCode === "DUMBBELL_UNCONFIRMED_BENCH"
        ) {
          buckets.unconfirmedSupport += 1;
        } else if (failure.reasonCode === "DUMBBELL_GYM_TEMPLATE_INHERITANCE") {
          buckets.gymTemplateInheritance += 1;
        } else if (failure.reasonCode === "DUMBBELL_FALSE_VERTICAL_PULL") {
          buckets.falseVerticalPull += 1;
        } else if (failure.reasonCode === "DUMBBELL_MISSING_HORIZONTAL_PULL") {
          buckets.missingHorizontalPull += 1;
        } else if (
          failure.reasonCode === "DUMBBELL_MISSING_TRUE_HINGE" ||
          failure.reasonCode === "DUMBBELL_CURL_ONLY_HINGE"
        ) {
          buckets.missingHinge += 1;
        } else if (failure.reasonCode === "DUMBBELL_DAY_IDENTITY_MISMATCH") {
          buckets.dayIdentityMismatch += 1;
        } else if (failure.reasonCode === "DUMBBELL_DUPLICATE_FAMILY") {
          buckets.duplicateFamily += 1;
        } else if (failure.reasonCode === "DUMBBELL_EXCESS_COMPLEXITY") {
          buckets.complexityExcess += 1;
        } else if (failure.reasonCode === "DUMBBELL_MISSING_WEEKLY_ROLE") {
          buckets.weeklyCoverage += 1;
        } else if (failure.reasonCode === "DUMBBELL_EXCESSIVE_PHASE_CHURN") {
          buckets.phaseChurn += 1;
        } else if (failure.reasonCode === "DUMBBELL_IDENTITY_COLLAPSE") {
          buckets.identityCollapse += 1;
        }
      });
    } catch {
      buckets.exceptions += 1;
    }

    if ((i + 1) % 1000 === 0) {
      console.error(`[dumbbellProgramAudit] fuzz ${i + 1}/${targetCases}`);
    }
  }

  return { buckets, reasonCounts, targetCases };
};

const renderPersonas = (results: ReturnType<typeof auditPersona>[]) => {
  const lines = [
    "# Phase 3 — Flagship Dumbbell Persona Review",
    "",
    "Manual-review snapshots for dumbbell-only personas. Phase 0–2 reports were not overwritten.",
    "",
  ];
  results.forEach((result) => {
    lines.push(`## ${result.persona.label}`);
    lines.push("");
    lines.push(`- Id: \`${result.persona.id}\``);
    lines.push(`- Primary mode: ${result.primaryMode}`);
    lines.push(`- Structural score: ${result.scores.structuralScore}/100`);
    lines.push(
      `- Full-experience score (includes deferred coaching gaps): ${result.scores.fullExperienceScore}/100`
    );
    lines.push(
      `- Hard failures: ${
        result.failures.length
          ? result.failures.map((failure) => failure.reasonCode).join(", ")
          : "none"
      }`
    );
    lines.push(
      `- Deferred experience gaps: ${result.deferred.length} (demo/cues/progression-link metadata)`
    );
    lines.push("");
    result.daySummaries.forEach((day) => {
      lines.push(`### ${day.title}`);
      lines.push("- Mains:");
      day.mains.forEach((main) => {
        lines.push(
          `  - \`${main.id}\` ${main.name} | slot=${main.slot ?? "n/a"} | lane=${main.lane ?? "n/a"}`
        );
      });
      lines.push(`- Accessories: ${day.accessories.join(", ") || "none"}`);
      lines.push("");
    });
    lines.push("### Manual review checklist");
    lines.push("- Day identity truthful and deliberately dumbbell-shaped?");
    lines.push("- Main exercises recognizable without external research?");
    lines.push("- Pulling represented honestly (no false vertical pull)?");
    lines.push("- Hinge truthful or pain-aware hip-extension surrogate?");
    lines.push("- Session simple to follow with confirmed equipment?");
    lines.push("- Pain adaptation retains a meaningful workout (if pain case)?");
    lines.push("- Next phase feels like progression rather than randomization?");
    lines.push("");
  });
  return `${lines.join("\n").trim()}\n`;
};

const main = () => {
  const started = Date.now();
  console.error("[dumbbellProgramAudit] flagship audit…");
  const results = FLAGSHIP.map(auditPersona);
  const allFailures = results.flatMap((result) => result.failures);
  const failuresByReason = new Map<string, number>();
  allFailures.forEach((failure) => {
    failuresByReason.set(
      failure.reasonCode,
      (failuresByReason.get(failure.reasonCode) ?? 0) + 1
    );
  });

  const fuzzTarget = Number(process.env.DUMBBELL_FUZZ_CASES ?? "10000");
  const fuzzCount =
    Number.isFinite(fuzzTarget) && fuzzTarget >= 0 ? fuzzTarget : 10_000;
  console.error(`[dumbbellProgramAudit] dumbbell fuzz (${fuzzCount} cases)…`);
  const fuzz = runFuzz(fuzzCount);

  const structuralPassPersonas = results.filter(
    (result) => result.scores.structuralScore >= 95 && result.failures.length === 0
  );

  mkdirSync(OUT_DIR, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    phase: 3,
    objective: "First-class dumbbell programming audit and contract",
    preservesPriorReports: [
      "docs/dev-reports/equipment-program-audit-phase0.json",
      "docs/dev-reports/equipment-program-audit-phase1.json",
      "docs/dev-reports/equipment-program-audit-phase2.json",
    ],
    elapsedMs: Date.now() - started,
    flagshipCount: results.length,
    hardFailureCount: allFailures.length,
    failuresByReason: Object.fromEntries(failuresByReason),
    flagshipStructuralPassCount: structuralPassPersonas.length,
    initialBaselineInventory: INITIAL_BASELINE_FAILURE_INVENTORY,
    fuzz: {
      cases: fuzz.targetCases,
      buckets: fuzz.buckets,
      topReasons: Array.from(fuzz.reasonCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20),
    },
    personas: results.map((result) => ({
      id: result.persona.id,
      label: result.persona.label,
      primaryMode: result.primaryMode,
      structuralScore: result.scores.structuralScore,
      fullExperienceScore: result.scores.fullExperienceScore,
      hardFailureCount: result.failures.length,
      hardFailures: result.failures,
      deferredGapCount: result.deferred.length,
      dayTitles: result.daySummaries.map((day) => day.title),
    })),
  };

  writeFileSync(SUMMARY_JSON, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  writeFileSync(PERSONAS_MD, renderPersonas(results), "utf8");

  const summaryMd = [
    "# Phase 3 — Dumbbell Programming Audit",
    "",
    "Dumbbell-only structural audit. Phase 0–2 equipment reports were preserved.",
    "",
    "## Step A — Initial baseline inventory (from Phase 0/1)",
    "",
    ...INITIAL_BASELINE_FAILURE_INVENTORY.map(
      (entry) =>
        `- \`${entry.reasonCode}\` — ${entry.detail} _(source: ${entry.source})_`
    ),
    "",
    "## Results",
    "",
    `- Flagship personas: ${results.length}`,
    `- Hard failures (flagship): ${allFailures.length}`,
    `- Flagship personas with structural score ≥95 and zero hard failures: ${structuralPassPersonas.length}/${results.length}`,
    `- Fuzz cases: ${fuzz.targetCases}`,
    `- Fuzz identity collapse: ${fuzz.buckets.identityCollapse}`,
    `- Fuzz illegal equipment: ${fuzz.buckets.illegalEquipment}`,
    `- Fuzz unconfirmed support: ${fuzz.buckets.unconfirmedSupport}`,
    `- Fuzz gym-template inheritance: ${fuzz.buckets.gymTemplateInheritance}`,
    `- Fuzz false vertical pull: ${fuzz.buckets.falseVerticalPull}`,
    `- Fuzz deterministic-repeat mismatches: ${fuzz.buckets.deterministicRepeat}`,
    `- Fuzz exceptions: ${fuzz.buckets.exceptions}`,
    "",
    "## Hard failures by reason (flagship)",
    "",
    ...Array.from(failuresByReason.entries()).map(
      ([code, count]) => `- \`${code}\`: ${count}`
    ),
    failuresByReason.size ? "" : "- none",
    "",
    "## Artifact paths",
    "",
    `- ${path.relative(process.cwd(), SUMMARY_MD)}`,
    `- ${path.relative(process.cwd(), SUMMARY_JSON)}`,
    `- ${path.relative(process.cwd(), PERSONAS_MD)}`,
    `- ${path.relative(process.cwd(), FAILURES_MD)}`,
    `- ${path.relative(process.cwd(), FUZZ_MD)}`,
    "",
  ];
  writeFileSync(SUMMARY_MD, `${summaryMd.join("\n").trim()}\n`, "utf8");

  const failuresMd = [
    "# Phase 3 — Hard Failures Initial vs Final",
    "",
    "## Initial (Phase 0/1 documented)",
    "",
    ...INITIAL_BASELINE_FAILURE_INVENTORY.map(
      (entry) => `- \`${entry.reasonCode}\` — ${entry.detail}`
    ),
    "",
    "## Final (current flagship contract)",
    "",
    ...allFailures.map(
      (failure: DumbbellHardFailure) =>
        `- \`${failure.reasonCode}\` persona=${failure.persona} day=${failure.dayTitle ?? "n/a"} slot=${failure.slot ?? "n/a"} exercise=${failure.exerciseId ?? "n/a"} expected=${failure.expectedRole ?? "n/a"} actual=${failure.actualRole ?? "n/a"} — ${failure.detail}`
    ),
    allFailures.length ? "" : "- none",
    "",
  ];
  writeFileSync(FAILURES_MD, `${failuresMd.join("\n").trim()}\n`, "utf8");

  const fuzzMd = [
    "# Phase 3 — Dumbbell Fuzz 10k Summary",
    "",
    `- Cases: ${fuzz.targetCases}`,
    "",
    "## Buckets",
    "",
    ...Object.entries(fuzz.buckets).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Top reason codes",
    "",
    ...Array.from(fuzz.reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([code, count]) => `- \`${code}\`: ${count}`),
    fuzz.reasonCounts.size ? "" : "- none",
    "",
  ];
  writeFileSync(FUZZ_MD, `${fuzzMd.join("\n").trim()}\n`, "utf8");

  const gateOk =
    allFailures.length === 0 &&
    fuzz.buckets.illegalEquipment === 0 &&
    fuzz.buckets.deterministicRepeat === 0 &&
    fuzz.buckets.exceptions === 0;
  console.log(
    JSON.stringify(
      {
        ok: gateOk,
        phase: 3,
        hardFailureCount: allFailures.length,
        flagshipStructuralPassCount: structuralPassPersonas.length,
        fuzz: fuzz.buckets,
        outputs: [
          path.relative(process.cwd(), SUMMARY_MD),
          path.relative(process.cwd(), SUMMARY_JSON),
          path.relative(process.cwd(), PERSONAS_MD),
          path.relative(process.cwd(), FAILURES_MD),
          path.relative(process.cwd(), FUZZ_MD),
        ],
      },
      null,
      2
    )
  );
  if (!gateOk) process.exitCode = 1;
};

main();
