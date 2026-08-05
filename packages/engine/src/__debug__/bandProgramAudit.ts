/**
 * Phase 4 band program audit + 10k fuzz.
 * Does not overwrite Phase 0–3 equipment-program reports.
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
  collectDeferredBandExperienceGaps,
  scoreBandProgramStructuralQuality,
  validateBandProgramContract,
  type BandHardFailure,
} from "@/lib/program/bandProgramContract";
import type { BandSetupOption } from "@/lib/program/bandSetup";
import { exerciseById } from "@/lib/exercises";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const SUMMARY_MD = path.join(OUT_DIR, "equipment-program-audit-phase4.md");
const SUMMARY_JSON = path.join(OUT_DIR, "equipment-program-audit-phase4.json");
const PERSONAS_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase4-band-personas.md"
);
const FAILURES_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase4-hard-failures-initial-vs-final.md"
);
const FUZZ_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase4-band-fuzz-10k.md"
);
const MIGRATION_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase4-capability-migration.md"
);

type FlagshipPersona = {
  id: string;
  label: string;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
};

const FLAGSHIP: FlagshipPersona[] = [
  {
    id: "band_3d_beginner_long_anchor_p1",
    label: "Beginner three-day long band with anchor / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    phaseIndex: 1,
  },
  {
    id: "band_3d_intermediate_long_anchor_p1",
    label: "Intermediate three-day long band with anchor / activation",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    phaseIndex: 1,
  },
  {
    id: "band_3d_advanced_long_anchor_p1",
    label: "Advanced three-day long band with anchor / activation",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    phaseIndex: 1,
  },
  {
    id: "band_3d_long_no_anchor_p1",
    label: "Long band without anchor / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_no_anchor",
    },
    phaseIndex: 1,
  },
  {
    id: "band_3d_loop_only_p1",
    label: "Mini loop only / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "loop_only",
    },
    phaseIndex: 1,
  },
  {
    id: "band_3d_both_with_anchor_p2",
    label: "Both band types with anchor / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "both_with_anchor",
    },
    phaseIndex: 2,
  },
  {
    id: "band_4d_intermediate_p2",
    label: "Four-day bands / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 4,
      bandSetup: "long_with_anchor",
    },
    phaseIndex: 2,
  },
  {
    id: "band_5d_advanced_p3",
    label: "Five-day bands / growth",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["bands"],
      daysPerWeek: 5,
      bandSetup: "long_with_anchor",
    },
    phaseIndex: 3,
  },
  {
    id: "band_3d_shoulder_pain_p1",
    label: "Shoulder-pain bands / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    phaseIndex: 1,
  },
  {
    id: "band_3d_low_back_pain_p1",
    label: "Low-back-pain bands / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Lower back"],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    phaseIndex: 1,
  },
  {
    id: "band_3d_beginner_p3",
    label: "Beginner three-day long band with anchor / growth",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
      bandSetup: "long_with_anchor",
    },
    phaseIndex: 3,
  },
  {
    id: "band_3d_legacy_unknown_p1",
    label: "Legacy unknown bands (no bandSetup) / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["bands"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
];

const INITIAL_BASELINE_FAILURE_INVENTORY: Array<{
  reasonCode: string;
  detail: string;
  source: string;
}> = [
  {
    reasonCode: "BAND_GYM_TEMPLATE_INHERITANCE",
    detail: "Band weeks inherited gym body-part titles (Back + Chest, etc.).",
    source: "Phase 0/1 equipment-program audit",
  },
  {
    reasonCode: "BAND_UNCONFIRMED_ANCHOR",
    detail: "Pulldowns / face pulls / Pallof scheduled without confirmed door/high/mid/low anchor.",
    source: "Phase 0 equipment assumption findings",
  },
  {
    reasonCode: "BAND_UNCONFIRMED_TYPE",
    detail: "hasLongBand/hasLoopBand stayed false while long-band exercises still scheduled.",
    source: "Phase 4 Step A baseline",
  },
  {
    reasonCode: "BAND_FALSE_VERTICAL_PULL",
    detail: "Vertical-pull claims without high-anchor capability.",
    source: "Phase 0 pull-honesty findings",
  },
  {
    reasonCode: "BAND_IDENTITY_COLLAPSE",
    detail: "Band programming collapsed toward gym-shaped selection heuristics.",
    source: "Phase 0/1 equipment-program audit",
  },
];

const auditPersona = (persona: FlagshipPersona) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  const program = generateWeeklyProgram(
    persona.questionnaire,
    `phase4-${persona.id}`,
    {
      phaseIndex: persona.phaseIndex,
      seed: `phase4-${persona.id}`,
    }
  );
  const primaryMode = resolvePrimaryProgramEquipmentMode(
    persona.questionnaire.equipment
  );
  const failures = validateBandProgramContract({
    program,
    persona: persona.id,
    equipment: persona.questionnaire.equipment,
    bandSetup: persona.questionnaire.bandSetup,
    experience: persona.questionnaire.experience,
    phaseIndex: persona.phaseIndex,
  });
  const deferred = collectDeferredBandExperienceGaps(program);
  const scores = scoreBandProgramStructuralQuality({
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

const hashSeed = (index: number) => {
  let x = (index + 1) * 2654435761;
  x ^= x >>> 16;
  return `band-fuzz-${(x >>> 0).toString(16)}`;
};

const BAND_SETUPS: Array<BandSetupOption | undefined> = [
  undefined,
  "loop_only",
  "long_no_anchor",
  "long_with_anchor",
  "both_no_anchor",
  "both_with_anchor",
];

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
    ["Neck"],
  ];

  const buckets = {
    illegalEquipment: 0,
    unconfirmedAnchor: 0,
    unconfirmedType: 0,
    gymTemplateInheritance: 0,
    falseVerticalPull: 0,
    loopOnlyLongBandLeakage: 0,
    anchorHeightMismatch: 0,
    dayIdentityMismatch: 0,
    excessAnchorChanges: 0,
    weeklyCoverage: 0,
    exceptions: 0,
    identityCollapse: 0,
    deterministicRepeat: 0,
  };
  const reasonCounts = new Map<string, number>();

  for (let i = 0; i < targetCases; i += 1) {
    const experience = experiences[i % experiences.length];
    const phaseIndex = phases[Math.floor(i / 3) % phases.length];
    const daysPerWeek = days[Math.floor(i / 9) % days.length];
    const goalsValue = goals[Math.floor(i / 27) % goals.length];
    const painAreas = painCombos[Math.floor(i / 81) % painCombos.length];
    const bandSetup = BAND_SETUPS[Math.floor(i / 243) % BAND_SETUPS.length];
    const seed = hashSeed(i);
    const questionnaire: QuestionnaireData = {
      goals: goalsValue,
      painAreas: [...painAreas],
      experience,
      equipment: ["bands"],
      daysPerWeek,
      ...(bandSetup ? { bandSetup } : {}),
    };

    try {
      if (resolvePrimaryProgramEquipmentMode(["bands"]) !== "bands") {
        buckets.identityCollapse += 1;
      }
      clearProgramVariationHistory();
      clearProgramConstraintWarningBuffer();
      const programA = generateWeeklyProgram(questionnaire, `band-fuzz-a-${i}`, {
        phaseIndex,
        seed,
      });

      if (i % 25 === 0) {
        clearProgramVariationHistory();
        clearProgramConstraintWarningBuffer();
        const programB = generateWeeklyProgram(questionnaire, `band-fuzz-b-${i}`, {
          phaseIndex,
          seed,
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

      const failures = validateBandProgramContract({
        program: programA,
        persona: `band-fuzz-${i}`,
        equipment: ["bands"],
        bandSetup,
        experience,
        phaseIndex,
      });
      failures.forEach((failure) => {
        reasonCounts.set(
          failure.reasonCode,
          (reasonCounts.get(failure.reasonCode) ?? 0) + 1
        );
        if (failure.reasonCode === "BAND_ILLEGAL_EQUIPMENT") {
          buckets.illegalEquipment += 1;
        } else if (failure.reasonCode === "BAND_UNCONFIRMED_ANCHOR") {
          buckets.unconfirmedAnchor += 1;
        } else if (failure.reasonCode === "BAND_UNCONFIRMED_TYPE") {
          buckets.unconfirmedType += 1;
        } else if (failure.reasonCode === "BAND_GYM_TEMPLATE_INHERITANCE") {
          buckets.gymTemplateInheritance += 1;
        } else if (failure.reasonCode === "BAND_FALSE_VERTICAL_PULL") {
          buckets.falseVerticalPull += 1;
        } else if (failure.reasonCode === "BAND_LOOP_ONLY_LONG_BAND_EXERCISE") {
          buckets.loopOnlyLongBandLeakage += 1;
        } else if (failure.reasonCode === "BAND_ANCHOR_HEIGHT_MISMATCH") {
          buckets.anchorHeightMismatch += 1;
        } else if (failure.reasonCode === "BAND_DAY_IDENTITY_MISMATCH") {
          buckets.dayIdentityMismatch += 1;
        } else if (failure.reasonCode === "BAND_EXCESS_ANCHOR_CHANGES") {
          buckets.excessAnchorChanges += 1;
        } else if (failure.reasonCode === "BAND_MISSING_WEEKLY_ROLE") {
          buckets.weeklyCoverage += 1;
        } else if (failure.reasonCode === "BAND_IDENTITY_COLLAPSE") {
          buckets.identityCollapse += 1;
        }
      });
    } catch {
      buckets.exceptions += 1;
    }

    if ((i + 1) % 1000 === 0) {
      console.error(`[bandProgramAudit] fuzz ${i + 1}/${targetCases}`);
    }
  }

  return { buckets, reasonCounts, targetCases };
};

const renderPersonas = (results: ReturnType<typeof auditPersona>[]) => {
  const lines = [
    "# Phase 4 — Flagship Band Persona Review",
    "",
    "Manual-review snapshots for band-only personas. Phase 0–3 reports were not overwritten.",
    "",
  ];
  results.forEach((result) => {
    lines.push(`## ${result.persona.label}`);
    lines.push("");
    lines.push(`- Id: \`${result.persona.id}\``);
    lines.push(`- Setup: \`${result.persona.questionnaire.bandSetup ?? "legacy_unknown"}\``);
    lines.push(`- Primary mode: ${result.primaryMode}`);
    lines.push(`- Structural score: ${result.scores.structuralScore}/100`);
    lines.push(
      `- Full-experience score (includes deferred coaching/anchor-safety gaps): ${result.scores.fullExperienceScore}/100`
    );
    lines.push(
      `- Hard failures: ${
        result.failures.length
          ? result.failures.map((failure) => failure.reasonCode).join(", ")
          : "none"
      }`
    );
    lines.push(
      `- Deferred experience gaps: ${result.deferred.length} (demo/cues/anchor-safety metadata)`
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
    lines.push("- Day identity truthful and deliberately band-shaped?");
    lines.push("- Exercises performable with confirmed band type/anchor?");
    lines.push("- Anchor requirements clear; transitions controlled?");
    lines.push("- Pulling and hinge represented honestly for the setup lane?");
    lines.push("- Pain adaptation retains a meaningful workout (if pain case)?");
    lines.push("- Next phase feels like progression rather than randomization?");
    lines.push("");
  });
  return `${lines.join("\n").trim()}\n`;
};

const main = () => {
  const started = Date.now();
  console.error("[bandProgramAudit] flagship audit…");
  const results = FLAGSHIP.map(auditPersona);
  const allFailures = results.flatMap((result) => result.failures);
  const failuresByReason = new Map<string, number>();
  allFailures.forEach((failure) => {
    failuresByReason.set(
      failure.reasonCode,
      (failuresByReason.get(failure.reasonCode) ?? 0) + 1
    );
  });

  const fuzzTarget = Number(process.env.BAND_FUZZ_CASES ?? "10000");
  const fuzzCount =
    Number.isFinite(fuzzTarget) && fuzzTarget >= 0 ? fuzzTarget : 10_000;
  console.error(`[bandProgramAudit] band fuzz (${fuzzCount} cases)…`);
  const fuzz = runFuzz(fuzzCount);

  const structuralPassPersonas = results.filter(
    (result) => result.scores.structuralScore >= 95 && result.failures.length === 0
  );

  mkdirSync(OUT_DIR, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    phase: 4,
    objective: "First-class anchor-aware band programming audit and contract",
    preservesPriorReports: [
      "docs/dev-reports/equipment-program-audit-phase0.json",
      "docs/dev-reports/equipment-program-audit-phase1.json",
      "docs/dev-reports/equipment-program-audit-phase2.json",
      "docs/dev-reports/equipment-program-audit-phase3.json",
      "docs/dev-reports/equipment-program-audit-phase4-baseline-bands.md",
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
      bandSetup: result.persona.questionnaire.bandSetup ?? "legacy_unknown",
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
    "# Phase 4 — Band Programming Audit",
    "",
    "Band-only structural audit. Phase 0–3 equipment reports were preserved.",
    "",
    "## Step A — Initial baseline inventory",
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
    `- Fuzz unconfirmed anchor: ${fuzz.buckets.unconfirmedAnchor}`,
    `- Fuzz unconfirmed type: ${fuzz.buckets.unconfirmedType}`,
    `- Fuzz gym-template inheritance: ${fuzz.buckets.gymTemplateInheritance}`,
    `- Fuzz false vertical pull: ${fuzz.buckets.falseVerticalPull}`,
    `- Fuzz loop→long leakage: ${fuzz.buckets.loopOnlyLongBandLeakage}`,
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
    `- ${path.relative(process.cwd(), MIGRATION_MD)}`,
    `- docs/dev-reports/equipment-program-audit-phase4-baseline-bands.md`,
    "",
  ];
  writeFileSync(SUMMARY_MD, `${summaryMd.join("\n").trim()}\n`, "utf8");

  const failuresMd = [
    "# Phase 4 — Hard Failures Initial vs Final",
    "",
    "## Initial (Phase 0/1 + Step A documented)",
    "",
    ...INITIAL_BASELINE_FAILURE_INVENTORY.map(
      (entry) => `- \`${entry.reasonCode}\` — ${entry.detail}`
    ),
    "",
    "## Final (current flagship contract)",
    "",
    ...allFailures.map(
      (failure: BandHardFailure) =>
        `- \`${failure.reasonCode}\` persona=${failure.persona} day=${failure.dayTitle ?? "n/a"} slot=${failure.slot ?? "n/a"} exercise=${failure.exerciseId ?? "n/a"} expected=${failure.expectedRole ?? "n/a"} actual=${failure.actualRole ?? "n/a"} — ${failure.detail}`
    ),
    allFailures.length ? "" : "- none",
    "",
  ];
  writeFileSync(FAILURES_MD, `${failuresMd.join("\n").trim()}\n`, "utf8");

  const fuzzMd = [
    "# Phase 4 — Band Fuzz 10k Summary",
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

  const migrationMd = [
    "# Phase 4 — Questionnaire / Capability Migration",
    "",
    "See also `equipment-program-audit-phase4-baseline-bands.md` (Step A).",
    "",
    "## Current questionnaire semantics",
    "",
    "- Equipment token: `bands` (label: Resistance bands)",
    "- New field: `bandSetup` with five options (loop only / long±anchor / both±anchor)",
    "",
    "## Legacy migration policy",
    "",
    "1. Stored `bands` without `bandSetup` → `legacy_unknown`",
    "2. Never imply long/loop type or any anchor from legacy",
    "3. Unknown anchors remain false",
    "4. Existing stored programs remain viewable unchanged",
    "5. New generation must not schedule unconfirmed type/anchor exercises",
    "",
    "## Setup lanes",
    "",
    "| Lane | Setup | Anchors |",
    "|---|---|---|",
    "| A | long/both + repositionable anchor | high + mid + low |",
    "| B | long/both, no anchor | none |",
    "| C | loop_only | none (loop + bodyweight) |",
    "| Legacy | unknown type | none |",
    "",
  ];
  writeFileSync(MIGRATION_MD, `${migrationMd.join("\n").trim()}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        phase: 4,
        hardFailureCount: allFailures.length,
        flagshipStructuralPassCount: structuralPassPersonas.length,
        fuzz: fuzz.buckets,
        outputs: [
          path.relative(process.cwd(), SUMMARY_MD),
          path.relative(process.cwd(), SUMMARY_JSON),
          path.relative(process.cwd(), PERSONAS_MD),
          path.relative(process.cwd(), FAILURES_MD),
          path.relative(process.cwd(), FUZZ_MD),
          path.relative(process.cwd(), MIGRATION_MD),
        ],
      },
      null,
      2
    )
  );
};

main();
