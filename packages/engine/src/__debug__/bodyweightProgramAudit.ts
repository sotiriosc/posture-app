/**
 * Phase 5 bodyweight program audit + 10k fuzz.
 * Does not overwrite Phase 0–4 equipment-program reports.
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
  collectDeferredBodyweightExperienceGaps,
  scoreBodyweightProgramStructuralQuality,
  validateBodyweightProgramContract,
  type BodyweightHardFailure,
} from "@/lib/program/bodyweightProgramContract";
import { exerciseById } from "@/lib/exercises";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const SUMMARY_MD = path.join(OUT_DIR, "equipment-program-audit-phase5.md");
const SUMMARY_JSON = path.join(OUT_DIR, "equipment-program-audit-phase5.json");
const PERSONAS_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase5-bodyweight-personas.md"
);
const FAILURES_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase5-hard-failures-initial-vs-final.md"
);
const FUZZ_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase5-bodyweight-fuzz-10k.md"
);

type FlagshipPersona = {
  id: string;
  label: string;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
};

const FLAGSHIP: FlagshipPersona[] = [
  {
    id: "bw_3d_beginner_floor_wall_p1",
    label: "Beginner three-day floor-and-wall / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "bw_3d_intermediate_p1",
    label: "Intermediate three-day bodyweight / activation",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "bw_3d_advanced_p1",
    label: "Advanced three-day bodyweight / activation",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "bw_4d_intermediate_p2",
    label: "Four-day bodyweight / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["none"],
      daysPerWeek: 4,
    },
    phaseIndex: 2,
  },
  {
    id: "bw_5d_advanced_p3",
    label: "Five-day bodyweight / growth",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["none"],
      daysPerWeek: 5,
    },
    phaseIndex: 3,
  },
  {
    id: "bw_3d_no_support_p1",
    label: "No-support bodyweight (floor/wall only) / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: [],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "bw_3d_pullup_bar_p1",
    label: "Confirmed pull-up-bar bodyweight / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["none", "pullup_bar"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "bw_3d_shoulder_pain_p1",
    label: "Shoulder-pain bodyweight / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "bw_3d_low_back_pain_p1",
    label: "Low-back-pain bodyweight / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Lower back"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "bw_3d_knee_pain_p1",
    label: "Knee-pain bodyweight / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Knees"],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "bw_3d_beginner_skill_p2",
    label: "Beginner three-day bodyweight / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    phaseIndex: 2,
  },
  {
    id: "bw_3d_beginner_growth_p3",
    label: "Beginner three-day bodyweight / growth",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    phaseIndex: 3,
  },
];

const INITIAL_BASELINE_FAILURE_INVENTORY: Array<{
  reasonCode: string;
  detail: string;
  source: string;
}> = [
  {
    reasonCode: "BODYWEIGHT_GYM_TEMPLATE_INHERITANCE",
    detail:
      "Bodyweight weeks used gym body-part titles (Back + Chest, Shoulders + Arms, Legs + Abs, Upper/Lower HF titles).",
    source: "Phase 5 Step A baseline",
  },
  {
    reasonCode: "BODYWEIGHT_FALSE_VERTICAL_PULL",
    detail:
      "mainPullVertical filled with seated-lat-sweep-pulse / supine-lat-pulldown-isometric style surrogates.",
    source: "Phase 0/5 Step A pull-honesty findings",
  },
  {
    reasonCode: "BODYWEIGHT_FALSE_HORIZONTAL_PULL",
    detail:
      "Prone/elbow-drive drills satisfied true horizontal-pull slots under gym inheritance.",
    source: "Phase 5 Step A baseline",
  },
  {
    reasonCode: "BODYWEIGHT_UNCONFIRMED_SUPPORT",
    detail: "countertop-pushup and similar furniture assumptions scheduled without confirmation.",
    source: "Phase 5 Step A baseline",
  },
  {
    reasonCode: "BODYWEIGHT_IDENTITY_COLLAPSE",
    detail: "No first-class bodyweight template; generator inherited gym split architecture.",
    source: "Phase 0/5 Step A",
  },
];

const auditPersona = (persona: FlagshipPersona) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  const program = generateWeeklyProgram(
    persona.questionnaire,
    `phase5-${persona.id}`,
    {
      phaseIndex: persona.phaseIndex,
      seed: `phase5-${persona.id}`,
      skipQualityGate: true,
    }
  );
  const primaryMode = resolvePrimaryProgramEquipmentMode(
    persona.questionnaire.equipment
  );
  const failures = validateBodyweightProgramContract({
    program,
    persona: persona.id,
    equipment: persona.questionnaire.equipment,
    experience: persona.questionnaire.experience,
    painAreas: persona.questionnaire.painAreas,
    phaseIndex: persona.phaseIndex,
  });
  const deferred = collectDeferredBodyweightExperienceGaps(program);
  const scores = scoreBodyweightProgramStructuralQuality({
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
  return `bw-fuzz-${(x >>> 0).toString(16)}`;
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
    ["Neck"],
  ];
  const equipmentCombos = [
    ["none"],
    [],
    ["none", "pullup_bar"],
    ["pullup_bar"],
    ["none", "bench"],
    ["foam_roller"],
  ];

  const buckets = {
    gymTemplateInheritance: 0,
    illegalEquipment: 0,
    unconfirmedSupport: 0,
    falseVerticalPull: 0,
    falseHorizontalPull: 0,
    missingSquat: 0,
    missingHinge: 0,
    missingUnilateral: 0,
    missingPush: 0,
    missingTrunk: 0,
    prepAsMain: 0,
    correctiveCluster: 0,
    duplicateFamily: 0,
    complexityExcess: 0,
    positionTransitionExcess: 0,
    weeklyCoverage: 0,
    phaseChurn: 0,
    exceptions: 0,
    identityCollapse: 0,
    deterministicRepeat: 0,
    honestCapabilityLimitations: 0,
  };
  const reasonCounts = new Map<string, number>();

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
      equipment: [...equipment] as QuestionnaireData["equipment"],
      daysPerWeek,
    };

    try {
      if (resolvePrimaryProgramEquipmentMode(equipment) !== "bodyweight") {
        buckets.identityCollapse += 1;
      }
      clearProgramVariationHistory();
      clearProgramConstraintWarningBuffer();
      const programA = generateWeeklyProgram(questionnaire, `bw-fuzz-a-${i}`, {
        phaseIndex,
        seed,
        skipQualityGate: true,
      });

      if (i % 25 === 0) {
        clearProgramVariationHistory();
        clearProgramConstraintWarningBuffer();
        const programB = generateWeeklyProgram(questionnaire, `bw-fuzz-b-${i}`, {
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

      const failures = validateBodyweightProgramContract({
        program: programA,
        persona: `bw-fuzz-${i}`,
        equipment,
        experience,
        painAreas,
        phaseIndex,
      });
      const deferred = collectDeferredBodyweightExperienceGaps(programA);
      if (deferred.some((gap) => gap.kind === "capability_limitation")) {
        buckets.honestCapabilityLimitations += 1;
      }
      failures.forEach((failure) => {
        reasonCounts.set(
          failure.reasonCode,
          (reasonCounts.get(failure.reasonCode) ?? 0) + 1
        );
        switch (failure.reasonCode) {
          case "BODYWEIGHT_GYM_TEMPLATE_INHERITANCE":
            buckets.gymTemplateInheritance += 1;
            break;
          case "BODYWEIGHT_ILLEGAL_EQUIPMENT":
            buckets.illegalEquipment += 1;
            break;
          case "BODYWEIGHT_UNCONFIRMED_SUPPORT":
            buckets.unconfirmedSupport += 1;
            break;
          case "BODYWEIGHT_FALSE_VERTICAL_PULL":
            buckets.falseVerticalPull += 1;
            break;
          case "BODYWEIGHT_FALSE_HORIZONTAL_PULL":
            buckets.falseHorizontalPull += 1;
            break;
          case "BODYWEIGHT_MISSING_SQUAT":
            buckets.missingSquat += 1;
            break;
          case "BODYWEIGHT_MISSING_HINGE_OR_HIP_EXTENSION":
            buckets.missingHinge += 1;
            break;
          case "BODYWEIGHT_MISSING_UNILATERAL":
            buckets.missingUnilateral += 1;
            break;
          case "BODYWEIGHT_MISSING_PUSH":
            buckets.missingPush += 1;
            break;
          case "BODYWEIGHT_MISSING_TRUNK":
            buckets.missingTrunk += 1;
            break;
          case "BODYWEIGHT_PREP_AS_MAIN":
            buckets.prepAsMain += 1;
            break;
          case "BODYWEIGHT_CORRECTIVE_CLUSTER":
            buckets.correctiveCluster += 1;
            break;
          case "BODYWEIGHT_DUPLICATE_FAMILY":
            buckets.duplicateFamily += 1;
            break;
          case "BODYWEIGHT_EXCESS_COMPLEXITY":
            buckets.complexityExcess += 1;
            break;
          case "BODYWEIGHT_EXCESS_POSITION_TRANSITIONS":
            buckets.positionTransitionExcess += 1;
            break;
          case "BODYWEIGHT_MISSING_WEEKLY_ROLE":
            buckets.weeklyCoverage += 1;
            break;
          case "BODYWEIGHT_EXCESSIVE_PHASE_CHURN":
            buckets.phaseChurn += 1;
            break;
          case "BODYWEIGHT_IDENTITY_COLLAPSE":
            buckets.identityCollapse += 1;
            break;
          case "BODYWEIGHT_NONDETERMINISTIC_OUTPUT":
            buckets.deterministicRepeat += 1;
            break;
          default:
            break;
        }
      });
    } catch {
      buckets.exceptions += 1;
    }

    if ((i + 1) % 1000 === 0) {
      console.error(`[bodyweightProgramAudit] fuzz ${i + 1}/${targetCases}`);
    }
  }

  return { buckets, reasonCounts, targetCases };
};

const renderPersonas = (results: ReturnType<typeof auditPersona>[]) => {
  const lines = [
    "# Phase 5 — Flagship Bodyweight Persona Review",
    "",
    "Manual-review snapshots for bodyweight personas. Phase 0–4 reports were not overwritten.",
    "",
  ];
  results.forEach((result) => {
    lines.push(`## ${result.persona.label}`);
    lines.push("");
    lines.push(`- Id: \`${result.persona.id}\``);
    lines.push(
      `- Equipment: \`${result.persona.questionnaire.equipment.join(", ") || "(empty → none)"}\``
    );
    lines.push(`- Primary mode: ${result.primaryMode}`);
    lines.push(`- Structural score: ${result.scores.structuralScore}/100`);
    lines.push(
      `- Capability honesty score: ${result.scores.capabilityHonestyScore}/100`
    );
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
      `- Deferred experience gaps: ${result.deferred.length} (demo/cues/progression/capability-limitation)`
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
    lines.push("- Day identity truthful and deliberately bodyweight-shaped?");
    lines.push("- Every exercise performable with confirmed floor/wall/support?");
    lines.push("- Main exercises recognizable?");
    lines.push("- Pulling represented honestly (upper-back control vs true pull)?");
    lines.push("- Squat and hinge/hip-extension roles truthful?");
    lines.push("- Session simple; position transitions reasonable?");
    lines.push("- Progression clear through leverage/range/tempo/variation?");
    lines.push("- Pain adaptation retains a meaningful workout (if pain case)?");
    lines.push("- Next phase feels like progression?");
    lines.push("");
  });
  return `${lines.join("\n").trim()}\n`;
};

const main = () => {
  const started = Date.now();
  console.error("[bodyweightProgramAudit] flagship audit…");
  const results = FLAGSHIP.map(auditPersona);
  const allFailures = results.flatMap((result) => result.failures);
  const failuresByReason = new Map<string, number>();
  allFailures.forEach((failure) => {
    failuresByReason.set(
      failure.reasonCode,
      (failuresByReason.get(failure.reasonCode) ?? 0) + 1
    );
  });

  const fuzzTarget = Number(process.env.BODYWEIGHT_FUZZ_CASES ?? "10000");
  const fuzzCount =
    Number.isFinite(fuzzTarget) && fuzzTarget >= 0 ? fuzzTarget : 10_000;
  console.error(`[bodyweightProgramAudit] bodyweight fuzz (${fuzzCount} cases)…`);
  const fuzz = runFuzz(fuzzCount);

  const structuralPassPersonas = results.filter(
    (result) => result.scores.structuralScore >= 95 && result.failures.length === 0
  );

  mkdirSync(OUT_DIR, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    phase: 5,
    objective:
      "First-class floor/wall bodyweight programming with honest pulling limitations",
    preservesPriorReports: [
      "docs/dev-reports/equipment-program-audit-phase0.json",
      "docs/dev-reports/equipment-program-audit-phase1.json",
      "docs/dev-reports/equipment-program-audit-phase2.json",
      "docs/dev-reports/equipment-program-audit-phase3.json",
      "docs/dev-reports/equipment-program-audit-phase4.json",
    ],
    elapsedMs: Date.now() - started,
    flagshipCount: results.length,
    hardFailureCount: allFailures.length,
    failuresByReason: Object.fromEntries(failuresByReason),
    flagshipStructuralPassCount: structuralPassPersonas.length,
    initialBaselineInventory: INITIAL_BASELINE_FAILURE_INVENTORY,
    defaultEnvironmentAssumptions: ["floor", "wall", "body", "standing_room"],
    confirmedSupportPolicy: {
      pullup_bar: "unlocks true vertical pulling",
      bench: "only confirmed elevated-surface token today; no chair questionnaire added",
      floor_wall: "always assumed",
    },
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
      equipment: result.persona.questionnaire.equipment,
      primaryMode: result.primaryMode,
      structuralScore: result.scores.structuralScore,
      capabilityHonestyScore: result.scores.capabilityHonestyScore,
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
    "# Phase 5 — Bodyweight Programming Audit",
    "",
    "Bodyweight-only structural audit. Phase 0–4 equipment reports were preserved.",
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
    `- Fuzz gym-template inheritance: ${fuzz.buckets.gymTemplateInheritance}`,
    `- Fuzz illegal equipment: ${fuzz.buckets.illegalEquipment}`,
    `- Fuzz unconfirmed support: ${fuzz.buckets.unconfirmedSupport}`,
    `- Fuzz false vertical pull: ${fuzz.buckets.falseVerticalPull}`,
    `- Fuzz false horizontal pull: ${fuzz.buckets.falseHorizontalPull}`,
    `- Fuzz prep-as-main: ${fuzz.buckets.prepAsMain}`,
    `- Fuzz identity collapse: ${fuzz.buckets.identityCollapse}`,
    `- Fuzz deterministic-repeat mismatches: ${fuzz.buckets.deterministicRepeat}`,
    `- Fuzz exceptions: ${fuzz.buckets.exceptions}`,
    `- Fuzz cases with honest capability-limitation notes: ${fuzz.buckets.honestCapabilityLimitations}`,
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
    "# Phase 5 — Hard Failures Initial vs Final",
    "",
    "## Initial (Phase 0 + Step A documented)",
    "",
    ...INITIAL_BASELINE_FAILURE_INVENTORY.map(
      (entry) => `- \`${entry.reasonCode}\` — ${entry.detail}`
    ),
    "",
    "## Final (current flagship contract)",
    "",
    ...allFailures.map(
      (failure: BodyweightHardFailure) =>
        `- \`${failure.reasonCode}\` persona=${failure.persona} day=${failure.dayTitle ?? "n/a"} slot=${failure.slot ?? "n/a"} exercise=${failure.exerciseId ?? "n/a"} expected=${failure.expectedRole ?? "n/a"} actual=${failure.actualRole ?? "n/a"} roleTruth=${failure.roleTruth ?? "n/a"} — ${failure.detail}`
    ),
    allFailures.length ? "" : "- none",
    "",
  ];
  writeFileSync(FAILURES_MD, `${failuresMd.join("\n").trim()}\n`, "utf8");

  const fuzzMd = [
    "# Phase 5 — Bodyweight Fuzz 10k Summary",
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
        phase: 5,
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
