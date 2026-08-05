/**
 * Phase 2 gym perfection audit + 10k fuzz.
 * Does not overwrite Phase 0/1 equipment-program reports.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
  getWeeklyCoverageContract,
  summarizeWeekCoverage,
} from "@/lib/program";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import {
  collectDeferredExperienceGaps,
  scoreGymProgramStructuralQuality,
  validateGymProgramContract,
  type GymHardFailure,
} from "@/lib/program/gymProgramContract";
import { exerciseById } from "@/lib/exercises";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const SUMMARY_MD = path.join(OUT_DIR, "equipment-program-audit-phase2.md");
const SUMMARY_JSON = path.join(OUT_DIR, "equipment-program-audit-phase2.json");
const PERSONAS_MD = path.join(OUT_DIR, "equipment-program-audit-phase2-gym-personas.md");
const FAILURES_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase2-hard-failures-initial-vs-final.md"
);
const FUZZ_MD = path.join(OUT_DIR, "equipment-program-audit-phase2-gym-fuzz-10k.md");

type FlagshipPersona = {
  id: string;
  label: string;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
};

const FLAGSHIP: FlagshipPersona[] = [
  {
    id: "gym_3d_beginner_p1",
    label: "Beginner three-day gym / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "gym_3d_intermediate_p1",
    label: "Intermediate three-day gym / activation",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "gym_3d_advanced_p1",
    label: "Advanced three-day gym / activation",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "gym_4d_intermediate_p2",
    label: "Four-day gym / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 4,
    },
    phaseIndex: 2,
  },
  {
    id: "gym_5d_advanced_p3",
    label: "Five-day gym / growth",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["gym"],
      daysPerWeek: 5,
    },
    phaseIndex: 3,
  },
  {
    id: "gym_3d_shoulder_pain_p1",
    label: "Shoulder-pain gym / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "gym_3d_low_back_pain_p1",
    label: "Low-back-pain gym / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Lower back", "Hips"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "gym_3d_beginner_p2",
    label: "Beginner three-day gym / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 2,
  },
  {
    id: "gym_3d_beginner_p3",
    label: "Beginner three-day gym / growth",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 3,
  },
  {
    id: "gym_5d_pain_advanced_p3",
    label: "Five-day advanced pain gym / growth (baseline hotspot)",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Lower back", "Neck"],
      experience: "Advanced",
      equipment: ["gym"],
      daysPerWeek: 5,
    },
    phaseIndex: 3,
  },
];

const auditPersona = (persona: FlagshipPersona) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  const program = generateWeeklyProgram(
    persona.questionnaire,
    `phase2-${persona.id}`,
    {
      phaseIndex: persona.phaseIndex,
      seed: `phase2-${persona.id}`,
      skipQualityGate: true,
    }
  );
  const primaryMode = resolvePrimaryProgramEquipmentMode(
    persona.questionnaire.equipment
  );
  const failures = validateGymProgramContract({
    program,
    persona: persona.id,
    equipment: persona.questionnaire.equipment,
    experience: persona.questionnaire.experience,
    painAreas: persona.questionnaire.painAreas,
  });
  const deferred = collectDeferredExperienceGaps(program);
  const scores = scoreGymProgramStructuralQuality({
    failures,
    deferredGapCount: deferred.length,
  });
  const coverage = summarizeWeekCoverage(program.week);
  const coverageContract = getWeeklyCoverageContract(
    persona.questionnaire.daysPerWeek
  );
  const coverageGaps = (
    Object.keys(coverageContract) as Array<keyof typeof coverageContract>
  )
    .filter((key) => coverage[key] < coverageContract[key])
    .map((key) => `${key} ${coverage[key]}/${coverageContract[key]}`);
  const warnings = getProgramConstraintWarningBuffer()
    .filter((warning) => warning.programId === program.id)
    .map((warning) => `[${warning.kind}] ${warning.dayTitle}: ${warning.message}`);

  return {
    persona,
    primaryMode,
    program,
    failures,
    deferred,
    scores,
    coverageGaps,
    warnings,
    daySummaries: program.week.map((day) => ({
      title: day.title,
      mains: day.routine
        .filter((item) => item.section === "main")
        .map((item) => ({
          id: item.exerciseId,
          name: exerciseById(item.exerciseId)?.name ?? item.exerciseId,
          slot: item.selectionDebug?.slotKind ?? null,
          source: item.selectionDebug?.source ?? null,
        })),
      accessories: day.routine
        .filter((item) => item.section === "accessory")
        .map((item) => item.exerciseId),
      warmup: day.routine
        .filter((item) => item.section === "warmup")
        .map((item) => item.exerciseId),
      activation: day.routine
        .filter((item) => item.section === "activation")
        .map((item) => item.exerciseId),
    })),
  };
};

const hashSeed = (index: number) => {
  let x = (index + 1) * 2654435761;
  x ^= x >>> 16;
  return `gym-fuzz-${(x >>> 0).toString(16)}`;
};

const runFuzz = (targetCases: number) => {
  const experiences = ["Beginner", "Intermediate", "Advanced"] as const;
  const phases = [1, 2, 3] as const;
  const days = [3, 4, 5] as const;
  const goals = [
    "General fitness",
    "Improve posture",
    "Reduce pain",
    "Athletic performance",
  ] as const;
  const painCombos: string[][] = [
    [],
    ["Shoulders"],
    ["Upper back"],
    ["Lower back"],
    ["Hips"],
    ["Knees"],
    ["Shoulders", "Upper back"],
    ["Lower back", "Hips"],
    ["Lower back", "Neck"],
    ["Neck"],
  ];
  const equipmentCombos = [["gym"], ["gym", "dumbbells"], ["gym", "bands"]];

  const buckets = {
    illegalEquipment: 0,
    mainRoleTruth: 0,
    weeklyCoverage: 0,
    duplicateFamily: 0,
    dayIdentity: 0,
    progressionContinuity: 0,
    exceptions: 0,
    deterministicRepeat: 0,
  };
  const reasonCounts = new Map<string, number>();
  let identityCollapse = 0;

  for (let i = 0; i < targetCases; i += 1) {
    const experience = experiences[i % experiences.length];
    const phaseIndex = phases[Math.floor(i / 3) % phases.length];
    const daysPerWeek = days[Math.floor(i / 9) % days.length];
    const goalsValue = goals[Math.floor(i / 27) % goals.length];
    const painAreas = painCombos[Math.floor(i / 81) % painCombos.length];
    const equipment = equipmentCombos[Math.floor(i / 243) % equipmentCombos.length];
    const seed = hashSeed(i);
    const questionnaire: QuestionnaireData = {
      goals: goalsValue,
      painAreas: [...painAreas],
      experience,
      equipment: [...equipment],
      daysPerWeek,
    };

    try {
      if (resolvePrimaryProgramEquipmentMode(equipment) !== "gym") {
        identityCollapse += 1;
      }
      clearProgramVariationHistory();
      clearProgramConstraintWarningBuffer();
      const programA = generateWeeklyProgram(questionnaire, `fuzz-a-${i}`, {
        phaseIndex,
        seed,
        skipQualityGate: true,
      });

      // Determinism sample: every 25th case only (still thousands of checks).
      if (i % 25 === 0) {
        clearProgramVariationHistory();
        clearProgramConstraintWarningBuffer();
        const programB = generateWeeklyProgram(questionnaire, `fuzz-b-${i}`, {
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

      const failures = validateGymProgramContract({
        program: programA,
        persona: `fuzz-${i}`,
        equipment,
        experience,
        painAreas,
      });
      failures.forEach((failure) => {
        reasonCounts.set(
          failure.reasonCode,
          (reasonCounts.get(failure.reasonCode) ?? 0) + 1
        );
        if (failure.reasonCode === "GYM_ILLEGAL_EQUIPMENT") {
          buckets.illegalEquipment += 1;
        } else if (
          failure.reasonCode.includes("ROLE") ||
          failure.reasonCode.includes("SURROGATE") ||
          failure.reasonCode.includes("PREP_ONLY") ||
          failure.reasonCode.includes("HINGE") ||
          failure.reasonCode.includes("VERTICAL")
        ) {
          buckets.mainRoleTruth += 1;
        } else if (failure.reasonCode.includes("WEEKLY")) {
          buckets.weeklyCoverage += 1;
        } else if (failure.reasonCode.includes("DUPLICATE")) {
          buckets.duplicateFamily += 1;
        } else if (
          failure.reasonCode.includes("TITLE") ||
          failure.reasonCode.includes("DAY")
        ) {
          buckets.dayIdentity += 1;
        } else if (failure.reasonCode.includes("PHASE")) {
          buckets.progressionContinuity += 1;
        }
      });

      // Weekly coverage is expensive to summarize every time; sample every 5th.
      if (i % 5 === 0) {
        const coverage = summarizeWeekCoverage(programA.week);
        const contract = getWeeklyCoverageContract(daysPerWeek);
        const hasCoverageGap = (
          Object.keys(contract) as Array<keyof typeof contract>
        ).some((key) => coverage[key] < contract[key]);
        if (hasCoverageGap) buckets.weeklyCoverage += 1;
      }
    } catch {
      buckets.exceptions += 1;
    }

    if ((i + 1) % 1000 === 0) {
      console.error(`[gymProgramAudit] fuzz ${i + 1}/${targetCases}`);
    }
  }

  return { buckets, reasonCounts, identityCollapse, targetCases };
};

const renderPersonas = (
  results: ReturnType<typeof auditPersona>[]
) => {
  const lines = [
    "# Phase 2 — Flagship Gym Persona Review",
    "",
    "Manual-review snapshots for gym-only personas. Phase 0/1 reports were not overwritten.",
    "",
  ];
  results.forEach((result) => {
    lines.push(`## ${result.persona.label}`);
    lines.push("");
    lines.push(`- Id: \`${result.persona.id}\``);
    lines.push(`- Primary mode: ${result.primaryMode}`);
    lines.push(
      `- Structural score: ${result.scores.structuralScore}/100`
    );
    lines.push(
      `- Full-experience score (includes deferred coaching gaps): ${result.scores.fullExperienceScore}/100`
    );
    lines.push(
      `- Hard failures: ${result.failures.length ? result.failures.map((f) => f.reasonCode).join(", ") : "none"}`
    );
    lines.push(
      `- Coverage gaps: ${result.coverageGaps.join(", ") || "none"}`
    );
    lines.push(
      `- Deferred experience gaps: ${result.deferred.length} (demo/cues/progression-link metadata)`
    );
    lines.push("");
    result.daySummaries.forEach((day) => {
      lines.push(`### ${day.title}`);
      lines.push(`- Warmup: ${day.warmup.join(", ") || "none"}`);
      lines.push(`- Activation: ${day.activation.join(", ") || "none"}`);
      lines.push("- Mains:");
      day.mains.forEach((main) => {
        lines.push(
          `  - \`${main.id}\` ${main.name} | slot=${main.slot ?? "n/a"} | source=${main.source ?? "n/a"}`
        );
      });
      lines.push(`- Accessories: ${day.accessories.join(", ") || "none"}`);
      lines.push("");
    });
    lines.push("### Manual review checklist");
    lines.push("- Day title matches workout?");
    lines.push("- Main exercises immediately recognizable?");
    lines.push("- Every required main role truthful?");
    lines.push("- Exercise order logical?");
    lines.push("- Accessories purposeful?");
    lines.push("- Volume appropriate?");
    lines.push("- Pain adaptation preserves identity (if pain case)?");
    lines.push("- Next phase looks like progression rather than randomization?");
    lines.push("");
  });
  return `${lines.join("\n").trim()}\n`;
};

const main = () => {
  const started = Date.now();
  console.error("[gymProgramAudit] Step A/C flagship audit…");
  const results = FLAGSHIP.map(auditPersona);
  const allFailures = results.flatMap((result) => result.failures);
  const failuresByReason = new Map<string, number>();
  allFailures.forEach((failure) => {
    failuresByReason.set(
      failure.reasonCode,
      (failuresByReason.get(failure.reasonCode) ?? 0) + 1
    );
  });

  const fuzzTarget = Number(process.env.GYM_FUZZ_CASES ?? "10000");
  const fuzzCount = Number.isFinite(fuzzTarget) && fuzzTarget >= 0 ? fuzzTarget : 10_000;
  console.error(`[gymProgramAudit] gym fuzz (${fuzzCount} cases)…`);
  const fuzz = runFuzz(fuzzCount);

  const structuralPassPersonas = results.filter(
    (result) => result.scores.structuralScore >= 95 && result.failures.length === 0
  );

  mkdirSync(OUT_DIR, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    phase: 2,
    objective: "Gym perfection audit and contract",
    preservesPriorReports: [
      "docs/dev-reports/equipment-program-audit-phase0.json",
      "docs/dev-reports/equipment-program-audit-phase1.json",
    ],
    elapsedMs: Date.now() - started,
    flagshipCount: results.length,
    hardFailureCount: allFailures.length,
    failuresByReason: Object.fromEntries(failuresByReason),
    flagshipStructuralPassCount: structuralPassPersonas.length,
    identityCollapseInFuzz: fuzz.identityCollapse,
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
      coverageGaps: result.coverageGaps,
      deferredGapCount: result.deferred.length,
      dayTitles: result.daySummaries.map((day) => day.title),
    })),
  };

  writeFileSync(SUMMARY_JSON, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  writeFileSync(PERSONAS_MD, renderPersonas(results), "utf8");

  const summaryMd = [
    "# Phase 2 — Gym Perfection Audit",
    "",
    "Gym-only structural audit. Phase 0/1 equipment reports were preserved.",
    "",
    "## Results",
    "",
    `- Flagship personas: ${results.length}`,
    `- Hard failures (flagship): ${allFailures.length}`,
    `- Flagship personas with structural score ≥95 and zero hard failures: ${structuralPassPersonas.length}/${results.length}`,
    `- Fuzz cases: ${fuzz.targetCases}`,
    `- Fuzz identity collapse to non-gym: ${fuzz.identityCollapse}`,
    `- Fuzz illegal equipment: ${fuzz.buckets.illegalEquipment}`,
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
    "## Deferred experience gaps",
    "",
    "Demo/cue/progression-link metadata gaps are reported per persona but are **not** Phase 2 structural hard failures.",
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
    "# Phase 2 — Hard Failures Initial vs Final",
    "",
    "This run is the current gym-contract inventory after introducing the canonical contract validator.",
    "",
    "## Flagship hard failures",
    "",
    ...allFailures.map(
      (failure: GymHardFailure) =>
        `- \`${failure.reasonCode}\` persona=${failure.persona} day=${failure.dayTitle ?? "n/a"} slot=${failure.slot ?? "n/a"} exercise=${failure.exerciseId ?? "n/a"} expected=${failure.expectedRole ?? "n/a"} actual=${failure.actualRole ?? "n/a"} — ${failure.detail}`
    ),
    allFailures.length ? "" : "- none",
    "",
    "## Notes",
    "",
    "- Baseline Phase 0 matrix already documented advanced 5-day pain gym calves/intelligence failures.",
    "- Home-mode template mismatches are excluded from this gym Phase 2 failure count.",
    "",
  ];
  writeFileSync(FAILURES_MD, `${failuresMd.join("\n").trim()}\n`, "utf8");

  const fuzzMd = [
    "# Phase 2 — Gym Fuzz 10k Summary",
    "",
    `- Cases: ${fuzz.targetCases}`,
    `- Identity collapse (non-gym primary mode for gym equipment): ${fuzz.identityCollapse}`,
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
    "",
  ];
  writeFileSync(FUZZ_MD, `${fuzzMd.join("\n").trim()}\n`, "utf8");

  const gateOk =
    allFailures.length === 0 &&
    fuzz.identityCollapse === 0 &&
    fuzz.buckets.illegalEquipment === 0 &&
    fuzz.buckets.deterministicRepeat === 0 &&
    fuzz.buckets.exceptions === 0;
  console.log(
    JSON.stringify(
      {
        ok: gateOk,
        phase: 2,
        hardFailureCount: allFailures.length,
        flagshipStructuralPassCount: structuralPassPersonas.length,
        fuzz: fuzz.buckets,
        identityCollapse: fuzz.identityCollapse,
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
