/**
 * Phase 5B mixed-home program audit + 10k fuzz.
 * Does not overwrite Phase 0–5 equipment-program reports.
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
  classifyMixedHomeSessionTools,
  collectDeferredMixedHomeExperienceGaps,
  scoreMixedHomeProgramStructuralQuality,
  validateMixedHomeProgramContract,
  type MixedHomeHardFailure,
} from "@/lib/program/mixedHomeProgramContract";
import {
  mixedHomeLaneHasHighAnchor,
  refineMixedHomeCapabilityLane,
} from "@/lib/program/mixedHomeTemplates";
import { deriveBandCapabilityOverlay } from "@/lib/program/bandSetup";
import { deriveProgramCapabilities } from "@/lib/program/equipmentCapabilities";
import { exerciseById } from "@/lib/exercises";
import { buildCanonicalFuzzCase } from "@/lib/__debug__/lib/canonicalFuzzCases";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const SUMMARY_MD = path.join(OUT_DIR, "equipment-program-audit-phase5b.md");
const SUMMARY_JSON = path.join(OUT_DIR, "equipment-program-audit-phase5b.json");
const PERSONAS_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase5b-mixed-home-personas.md"
);
const FAILURES_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase5b-hard-failures-initial-vs-final.md"
);
const FUZZ_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase5b-mixed-home-fuzz-10k.md"
);
const RATIONALE_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase5b-equipment-rationale.md"
);
const SETUP_MD = path.join(
  OUT_DIR,
  "equipment-program-audit-phase5b-setup-transitions.md"
);

type FlagshipPersona = {
  id: string;
  label: string;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
};

const FLAGSHIP: FlagshipPersona[] = [
  {
    id: "mh_3d_beg_anchored_p1",
    label: "Beginner three-day dumbbells + anchored long band / activation",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_with_anchor",
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "mh_3d_int_anchored_p1",
    label: "Intermediate three-day dumbbells + anchored long band / activation",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_with_anchor",
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "mh_3d_adv_anchored_p1",
    label: "Advanced three-day dumbbells + anchored long band / activation",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_with_anchor",
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "mh_3d_int_no_anchor_p1",
    label: "Dumbbells + long band without anchor",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_no_anchor",
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "mh_3d_int_loop_only_p1",
    label: "Dumbbells + mini loop only",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      bandSetup: "loop_only",
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "mh_3d_int_both_anchor_p1",
    label: "Dumbbells + both band types with anchor",
    questionnaire: {
      goals: "Improve posture",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      bandSetup: "both_with_anchor",
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "mh_4d_int_anchored_p2",
    label: "Four-day mixed home / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_with_anchor",
      daysPerWeek: 4,
    },
    phaseIndex: 2,
  },
  {
    id: "mh_5d_adv_anchored_p3",
    label: "Five-day mixed home / growth",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_with_anchor",
      daysPerWeek: 5,
    },
    phaseIndex: 3,
  },
  {
    id: "mh_3d_shoulder_pain_p1",
    label: "Shoulder-pain mixed home / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      experience: "Beginner",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_with_anchor",
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "mh_3d_low_back_pain_p1",
    label: "Low-back-pain mixed home / activation",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Lower back"],
      experience: "Beginner",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_no_anchor",
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "mh_3d_beg_skill_p2",
    label: "Beginner three-day mixed home / skill",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_with_anchor",
      daysPerWeek: 3,
    },
    phaseIndex: 2,
  },
  {
    id: "mh_3d_beg_growth_p3",
    label: "Beginner three-day mixed home / growth",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["dumbbells", "bands"],
      bandSetup: "long_with_anchor",
      daysPerWeek: 3,
    },
    phaseIndex: 3,
  },
  {
    id: "mh_3d_pullup_bar_p1",
    label: "Mixed home with confirmed pull-up bar",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands", "pullup_bar"],
      bandSetup: "long_no_anchor",
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
    reasonCode: "MIXED_HOME_GYM_TEMPLATE_INHERITANCE",
    detail:
      "dumbbells+bands resolved to mixedHome but weeks used gym body-part titles (Back + Chest / Shoulders + Arms / Legs + Abs).",
    source: "Phase 5B Step A baseline",
  },
  {
    reasonCode: "MIXED_HOME_DUMBBELL_TEMPLATE_ONLY",
    detail: "No deliberate mixed-home policy; bands available via eligibility without justified authorship.",
    source: "Phase 5B Step A baseline",
  },
  {
    reasonCode: "MIXED_HOME_RANDOM_EQUIPMENT_MIX",
    detail: "Dual-tool eligibility under gym slots produced incoherent tool thrash.",
    source: "Phase 5B Step A baseline",
  },
  {
    reasonCode: "MIXED_HOME_FALSE_VERTICAL_PULL",
    detail: "Gym pull slots claimed vertical pulling without confirmed high anchor / pull-up bar.",
    source: "Phase 5B Step A baseline",
  },
  {
    reasonCode: "MIXED_HOME_IDENTITY_COLLAPSE",
    detail: "Identity label mixedHome without first-class template family.",
    source: "Phase 5B Step A baseline",
  },
];

const auditPersona = (persona: FlagshipPersona) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  const program = generateWeeklyProgram(
    persona.questionnaire,
    `phase5b-${persona.id}`,
    {
      phaseIndex: persona.phaseIndex,
      seed: `phase5b-${persona.id}`,
      skipQualityGate: true,
    }
  );
  const primaryMode = resolvePrimaryProgramEquipmentMode(
    persona.questionnaire.equipment
  );
  const failures = validateMixedHomeProgramContract({
    program,
    persona: persona.id,
    equipment: persona.questionnaire.equipment,
    bandSetup: persona.questionnaire.bandSetup,
    experience: persona.questionnaire.experience,
    painAreas: persona.questionnaire.painAreas,
    phaseIndex: persona.phaseIndex,
  });
  const overlay = deriveBandCapabilityOverlay({
    equipment: persona.questionnaire.equipment,
    bandSetup: persona.questionnaire.bandSetup,
  });
  const capabilityLane = refineMixedHomeCapabilityLane({
    bandSetupLane: overlay.setupLane,
    resolvedBandSetup: overlay.resolvedSetup,
  });
  const canVertical =
    deriveProgramCapabilities(persona.questionnaire.equipment).hasPullupBar ||
    mixedHomeLaneHasHighAnchor(capabilityLane);
  const deferred = collectDeferredMixedHomeExperienceGaps(program, {
    hasTrueVerticalPullCapability: canVertical,
  });
  const setupPenalty = failures.filter((failure) =>
    failure.reasonCode.includes("SETUP") || failure.reasonCode.includes("ANCHOR_CHANGES")
  ).length;
  const scores = scoreMixedHomeProgramStructuralQuality({
    failures,
    deferredGapCount: deferred.length,
    setupCoherencePenalty: setupPenalty,
  });

  return {
    persona,
    primaryMode,
    capabilityLane,
    program,
    failures,
    deferred,
    scores,
    daySummaries: program.week.map((day) => {
      const tools = classifyMixedHomeSessionTools(day);
      return {
        title: day.title,
        mains: day.routine
          .filter((item) => item.section === "main")
          .map((item) => ({
            id: item.exerciseId,
            name: exerciseById(item.exerciseId)?.name ?? item.exerciseId,
            slot: item.selectionDebug?.slotKind ?? null,
            lane: item.selectionDebug?.slotLane ?? null,
            tool:
              exerciseById(item.exerciseId)?.equipment.includes("bands")
                ? "band"
                : exerciseById(item.exerciseId)?.equipment.includes("dumbbells")
                ? "dumbbell"
                : "bodyweight",
            rationale:
              item.selectionDebug?.decisionTrace?.slotRoleMatch ?? null,
          })),
        accessories: day.routine
          .filter((item) => item.section === "accessory")
          .map((item) => item.exerciseId),
        setupSequence: tools.setupSequence,
        toolCounts: {
          dumbbell: tools.dumbbell,
          band: tools.band,
          bodyweight: tools.bodyweight,
        },
      };
    }),
  };
};

const runFuzz = (targetCases: number) => {
  const buckets = {
    gymTemplateInheritance: 0,
    illegalEquipment: 0,
    unconfirmedAnchor: 0,
    unconfirmedBandType: 0,
    falseVerticalPull: 0,
    missingHorizontalPull: 0,
    missingHinge: 0,
    prepAsMain: 0,
    randomEquipmentMix: 0,
    bandOveruse: 0,
    redundantCrossToolRole: 0,
    setupTransitionExcess: 0,
    anchorChangeExcess: 0,
    duplicateFamily: 0,
    complexityExcess: 0,
    weeklyCoverage: 0,
    honestCapabilityLimitations: 0,
    phaseChurn: 0,
    exceptions: 0,
    identityCollapse: 0,
    deterministicRepeat: 0,
  };
  const reasonCounts = new Map<string, number>();

  for (let i = 0; i < targetCases; i += 1) {
    const fuzzCase = buildCanonicalFuzzCase("mixedHome", i);
    const { questionnaire, phaseIndex, seed } = fuzzCase;
    const { experience, painAreas, equipment } = questionnaire;
    const bandSetup = questionnaire.bandSetup;

    try {
      if (resolvePrimaryProgramEquipmentMode(equipment) !== "mixedHome") {
        buckets.identityCollapse += 1;
      }
      clearProgramVariationHistory();
      clearProgramConstraintWarningBuffer();
      const programA = generateWeeklyProgram(questionnaire, `mh-fuzz-a-${i}`, {
        phaseIndex,
        seed,
        skipQualityGate: true,
      });

      if (i % 25 === 0) {
        clearProgramVariationHistory();
        clearProgramConstraintWarningBuffer();
        const programB = generateWeeklyProgram(questionnaire, `mh-fuzz-b-${i}`, {
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
        if (sigA !== sigB) buckets.deterministicRepeat += 1;
      }

      const failures = validateMixedHomeProgramContract({
        program: programA,
        persona: `mh-fuzz-${i}`,
        equipment,
        bandSetup,
        experience,
        painAreas,
        phaseIndex,
      });
      const overlay = deriveBandCapabilityOverlay({ equipment, bandSetup });
      const capabilityLane = refineMixedHomeCapabilityLane({
        bandSetupLane: overlay.setupLane,
        resolvedBandSetup: overlay.resolvedSetup,
      });
      const canVertical =
        deriveProgramCapabilities(equipment).hasPullupBar ||
        mixedHomeLaneHasHighAnchor(capabilityLane);
      const deferred = collectDeferredMixedHomeExperienceGaps(programA, {
        hasTrueVerticalPullCapability: canVertical,
      });
      if (deferred.some((gap) => gap.kind === "capability_limitation")) {
        buckets.honestCapabilityLimitations += 1;
      }
      failures.forEach((failure: MixedHomeHardFailure) => {
        reasonCounts.set(
          failure.reasonCode,
          (reasonCounts.get(failure.reasonCode) ?? 0) + 1
        );
        switch (failure.reasonCode) {
          case "MIXED_HOME_GYM_TEMPLATE_INHERITANCE":
            buckets.gymTemplateInheritance += 1;
            break;
          case "MIXED_HOME_ILLEGAL_EQUIPMENT":
            buckets.illegalEquipment += 1;
            break;
          case "MIXED_HOME_UNCONFIRMED_ANCHOR":
            buckets.unconfirmedAnchor += 1;
            break;
          case "MIXED_HOME_UNCONFIRMED_BAND_TYPE":
            buckets.unconfirmedBandType += 1;
            break;
          case "MIXED_HOME_FALSE_VERTICAL_PULL":
            buckets.falseVerticalPull += 1;
            break;
          case "MIXED_HOME_MISSING_HORIZONTAL_PULL":
            buckets.missingHorizontalPull += 1;
            break;
          case "MIXED_HOME_MISSING_HINGE":
            buckets.missingHinge += 1;
            break;
          case "MIXED_HOME_PREP_AS_MAIN":
            buckets.prepAsMain += 1;
            break;
          case "MIXED_HOME_RANDOM_EQUIPMENT_MIX":
            buckets.randomEquipmentMix += 1;
            break;
          case "MIXED_HOME_BAND_OVERUSE":
            buckets.bandOveruse += 1;
            break;
          case "MIXED_HOME_REDUNDANT_CROSS_TOOL_ROLE":
            buckets.redundantCrossToolRole += 1;
            break;
          case "MIXED_HOME_EXCESS_SETUP_TRANSITIONS":
            buckets.setupTransitionExcess += 1;
            break;
          case "MIXED_HOME_EXCESS_ANCHOR_CHANGES":
            buckets.anchorChangeExcess += 1;
            break;
          case "MIXED_HOME_DUPLICATE_FAMILY":
            buckets.duplicateFamily += 1;
            break;
          case "MIXED_HOME_EXCESS_COMPLEXITY":
            buckets.complexityExcess += 1;
            break;
          case "MIXED_HOME_MISSING_WEEKLY_ROLE":
            buckets.weeklyCoverage += 1;
            break;
          case "MIXED_HOME_EXCESSIVE_PHASE_CHURN":
            buckets.phaseChurn += 1;
            break;
          case "MIXED_HOME_IDENTITY_COLLAPSE":
            buckets.identityCollapse += 1;
            break;
          case "MIXED_HOME_NONDETERMINISTIC_OUTPUT":
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
      console.error(`[mixedHomeProgramAudit] fuzz ${i + 1}/${targetCases}`);
    }
  }

  return { buckets, reasonCounts, targetCases };
};

const renderPersonas = (results: ReturnType<typeof auditPersona>[]) => {
  const lines = [
    "# Phase 5B — Flagship Mixed-Home Persona Review",
    "",
    "Manual-review snapshots. Phase 0–5 reports were not overwritten.",
    "",
  ];
  results.forEach((result) => {
    lines.push(`## ${result.persona.label}`);
    lines.push("");
    lines.push(`- Id: \`${result.persona.id}\``);
    lines.push(
      `- Equipment: \`${result.persona.questionnaire.equipment.join(", ")}\``
    );
    lines.push(
      `- Band setup: \`${String(result.persona.questionnaire.bandSetup ?? "legacy_unknown")}\``
    );
    lines.push(`- Capability lane: ${result.capabilityLane}`);
    lines.push(`- Primary mode: ${result.primaryMode}`);
    lines.push(`- Structural score: ${result.scores.structuralScore}/100`);
    lines.push(
      `- Equipment honesty score: ${result.scores.equipmentHonestyScore}/100`
    );
    lines.push(
      `- Setup coherence score: ${result.scores.setupCoherenceScore}/100`
    );
    lines.push(
      `- Full-experience score: ${result.scores.fullExperienceScore}/100`
    );
    lines.push(
      `- Hard failures: ${
        result.failures.length
          ? result.failures.map((failure) => failure.reasonCode).join(", ")
          : "none"
      }`
    );
    lines.push("");
    result.daySummaries.forEach((day) => {
      lines.push(`### ${day.title}`);
      lines.push(
        `- Tools: db=${day.toolCounts.dumbbell} band=${day.toolCounts.band} bw=${day.toolCounts.bodyweight}`
      );
      lines.push(`- Setup sequence: ${day.setupSequence.join(" → ") || "n/a"}`);
      lines.push("- Mains:");
      day.mains.forEach((main) => {
        lines.push(
          `  - \`${main.id}\` ${main.name} | tool=${main.tool} | slot=${main.slot ?? "n/a"} | ${main.rationale ?? ""}`
        );
      });
      lines.push(`- Accessories: ${day.accessories.join(", ") || "none"}`);
      lines.push("");
    });
  });
  return `${lines.join("\n").trim()}\n`;
};

const main = () => {
  const started = Date.now();
  console.error("[mixedHomeProgramAudit] flagship audit…");
  const results = FLAGSHIP.map(auditPersona);
  const allFailures = results.flatMap((result) => result.failures);
  const failuresByReason = new Map<string, number>();
  allFailures.forEach((failure) => {
    failuresByReason.set(
      failure.reasonCode,
      (failuresByReason.get(failure.reasonCode) ?? 0) + 1
    );
  });

  const fuzzTarget = Number(process.env.MIXED_HOME_FUZZ_CASES ?? "10000");
  const fuzzCount =
    Number.isFinite(fuzzTarget) && fuzzTarget >= 0 ? fuzzTarget : 10_000;
  console.error(`[mixedHomeProgramAudit] mixed-home fuzz (${fuzzCount} cases)…`);
  const fuzz = runFuzz(fuzzCount);

  const structuralPassPersonas = results.filter(
    (result) => result.scores.structuralScore >= 95 && result.failures.length === 0
  );

  mkdirSync(OUT_DIR, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    phase: "5b",
    objective:
      "First-class mixed-home programming (dumbbell base + justified bands)",
    preservesPriorReports: [
      "docs/dev-reports/equipment-program-audit-phase0.json",
      "docs/dev-reports/equipment-program-audit-phase1.json",
      "docs/dev-reports/equipment-program-audit-phase2.json",
      "docs/dev-reports/equipment-program-audit-phase3.json",
      "docs/dev-reports/equipment-program-audit-phase4.json",
      "docs/dev-reports/equipment-program-audit-phase5.json",
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
      equipment: result.persona.questionnaire.equipment,
      bandSetup: result.persona.questionnaire.bandSetup ?? null,
      capabilityLane: result.capabilityLane,
      primaryMode: result.primaryMode,
      structuralScore: result.scores.structuralScore,
      hardFailureCount: result.failures.length,
      hardFailures: result.failures,
      dayTitles: result.daySummaries.map((day) => day.title),
    })),
  };

  writeFileSync(SUMMARY_JSON, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  writeFileSync(PERSONAS_MD, renderPersonas(results), "utf8");

  const summaryMd = [
    "# Phase 5B — Mixed-Home Programming Audit",
    "",
    "Mixed-home structural audit. Phase 0–5 equipment reports were preserved.",
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
    `- Fuzz unconfirmed anchor: ${fuzz.buckets.unconfirmedAnchor}`,
    `- Fuzz unconfirmed band type: ${fuzz.buckets.unconfirmedBandType}`,
    `- Fuzz false vertical pull: ${fuzz.buckets.falseVerticalPull}`,
    `- Fuzz prep-as-main: ${fuzz.buckets.prepAsMain}`,
    `- Fuzz identity collapse: ${fuzz.buckets.identityCollapse}`,
    `- Fuzz deterministic-repeat mismatches: ${fuzz.buckets.deterministicRepeat}`,
    `- Fuzz exceptions: ${fuzz.buckets.exceptions}`,
    `- Fuzz honest capability-limitation notes: ${fuzz.buckets.honestCapabilityLimitations}`,
    "",
    "## Hard failures by reason (flagship)",
    "",
    ...(failuresByReason.size
      ? Array.from(failuresByReason.entries()).map(
          ([code, count]) => `- \`${code}\`: ${count}`
        )
      : ["- none"]),
    "",
    "## Artifact paths",
    "",
    `- docs/dev-reports/equipment-program-audit-phase5b.md`,
    `- docs/dev-reports/equipment-program-audit-phase5b.json`,
    `- docs/dev-reports/equipment-program-audit-phase5b-mixed-home-personas.md`,
    `- docs/dev-reports/equipment-program-audit-phase5b-hard-failures-initial-vs-final.md`,
    `- docs/dev-reports/equipment-program-audit-phase5b-mixed-home-fuzz-10k.md`,
    `- docs/dev-reports/equipment-program-audit-phase5b-equipment-rationale.md`,
    `- docs/dev-reports/equipment-program-audit-phase5b-setup-transitions.md`,
    "",
  ];
  writeFileSync(SUMMARY_MD, `${summaryMd.join("\n").trim()}\n`, "utf8");

  const failuresMd = [
    "# Phase 5B — Hard Failures Initial vs Final",
    "",
    "## Initial (Step A)",
    "",
    ...INITIAL_BASELINE_FAILURE_INVENTORY.map(
      (entry) => `- \`${entry.reasonCode}\`: ${entry.detail}`
    ),
    "",
    "## Final (flagship)",
    "",
    ...(failuresByReason.size
      ? Array.from(failuresByReason.entries()).map(
          ([code, count]) => `- \`${code}\`: ${count}`
        )
      : ["- none (all baseline failure classes corrected or deferred honestly)"]),
    "",
  ];
  writeFileSync(FAILURES_MD, `${failuresMd.join("\n").trim()}\n`, "utf8");

  const fuzzMd = [
    "# Phase 5B — Mixed-Home Fuzz 10k Summary",
    "",
    `- Cases: ${fuzz.targetCases}`,
    "",
    "## Buckets",
    "",
    ...Object.entries(fuzz.buckets).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Top reason codes",
    "",
    ...(fuzz.reasonCounts.size
      ? Array.from(fuzz.reasonCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([code, count]) => `- \`${code}\`: ${count}`)
      : ["- none"]),
    "",
  ];
  writeFileSync(FUZZ_MD, `${fuzzMd.join("\n").trim()}\n`, "utf8");

  const rationaleMd = [
    "# Phase 5B — Equipment Selection Rationale Review",
    "",
    "Band vs dumbbell rationale from authored mains (`slotRoleMatch`).",
    "",
  ];
  results.forEach((result) => {
    rationaleMd.push(`## ${result.persona.id}`);
    rationaleMd.push("");
    result.daySummaries.forEach((day) => {
      rationaleMd.push(`### ${day.title}`);
      day.mains.forEach((main) => {
        rationaleMd.push(
          `- \`${main.id}\` tool=${main.tool} rationale=${main.rationale ?? "n/a"}`
        );
      });
      rationaleMd.push("");
    });
  });
  writeFileSync(RATIONALE_MD, `${rationaleMd.join("\n").trim()}\n`, "utf8");

  const setupMd = [
    "# Phase 5B — Setup Transition Review",
    "",
  ];
  results.forEach((result) => {
    setupMd.push(`## ${result.persona.id}`);
    setupMd.push("");
    result.daySummaries.forEach((day) => {
      setupMd.push(
        `- **${day.title}**: ${day.setupSequence.join(" → ") || "n/a"} (db=${day.toolCounts.dumbbell}, band=${day.toolCounts.band}, bw=${day.toolCounts.bodyweight})`
      );
    });
    setupMd.push("");
  });
  writeFileSync(SETUP_MD, `${setupMd.join("\n").trim()}\n`, "utf8");

  const gateOk =
    allFailures.length === 0 &&
    structuralPassPersonas.length === results.length &&
    fuzz.buckets.illegalEquipment === 0 &&
    fuzz.buckets.deterministicRepeat === 0 &&
    fuzz.buckets.exceptions === 0 &&
    fuzz.buckets.identityCollapse === 0;
  console.log(
    JSON.stringify(
      {
        ok: gateOk,
        phase: "5b",
        hardFailureCount: allFailures.length,
        flagshipStructuralPassCount: structuralPassPersonas.length,
        identityCollapse: fuzz.buckets.identityCollapse,
        fuzz: {
          gymTemplateInheritance: fuzz.buckets.gymTemplateInheritance,
          illegalEquipment: fuzz.buckets.illegalEquipment,
          unconfirmedAnchor: fuzz.buckets.unconfirmedAnchor,
          unconfirmedBandType: fuzz.buckets.unconfirmedBandType,
          falseVerticalPull: fuzz.buckets.falseVerticalPull,
          prepAsMain: fuzz.buckets.prepAsMain,
          identityCollapse: fuzz.buckets.identityCollapse,
          deterministicRepeat: fuzz.buckets.deterministicRepeat,
          exceptions: fuzz.buckets.exceptions,
        },
        outputs: [
          "docs/dev-reports/equipment-program-audit-phase5b.md",
          "docs/dev-reports/equipment-program-audit-phase5b.json",
          "docs/dev-reports/equipment-program-audit-phase5b-mixed-home-personas.md",
          "docs/dev-reports/equipment-program-audit-phase5b-hard-failures-initial-vs-final.md",
          "docs/dev-reports/equipment-program-audit-phase5b-mixed-home-fuzz-10k.md",
          "docs/dev-reports/equipment-program-audit-phase5b-equipment-rationale.md",
          "docs/dev-reports/equipment-program-audit-phase5b-setup-transitions.md",
        ],
      },
      null,
      2
    )
  );
  if (!gateOk) process.exitCode = 1;
};

main();
