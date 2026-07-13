import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { requireExerciseById } from "@/lib/exerciseCatalog";
import {
  clearProgramConstraintWarningBuffer,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
} from "@/lib/program";

import { auditCoverageContract } from "./coverageContractAudit";

type PhaseCase = { key: "activation" | "skill" | "growth"; phaseIndex: 1 | 2 | 3 };
type ProfileBase = {
  name: string;
  goals: QuestionnaireData["goals"];
  painAreas: QuestionnaireData["painAreas"];
  experience: QuestionnaireData["experience"];
};

type EquipmentCase = {
  label: string;
  values: string[];
};

const PHASES: PhaseCase[] = [
  { key: "activation", phaseIndex: 1 },
  { key: "skill", phaseIndex: 2 },
  { key: "growth", phaseIndex: 3 },
];

const DAY_OPTIONS: Array<3 | 4 | 5> = [3, 4, 5];

const EQUIPMENT_CASES: EquipmentCase[] = [
  { label: "none", values: ["none"] },
  { label: "bands", values: ["bands"] },
  { label: "gym", values: ["gym"] },
];

const PROFILE_BASES: ProfileBase[] = [
  {
    name: "pain beginner",
    goals: "Reduce pain",
    painAreas: ["low_back", "shoulders"],
    experience: "Beginner",
  },
  {
    name: "normal beginner",
    goals: "Improve posture",
    painAreas: [],
    experience: "Beginner",
  },
  {
    name: "intermediate",
    goals: "Improve posture",
    painAreas: [],
    experience: "Intermediate",
  },
  {
    name: "advanced",
    goals: "Athletic performance",
    painAreas: [],
    experience: "Advanced",
  },
  {
    name: "pain advanced",
    goals: "Reduce pain",
    painAreas: ["low_back", "neck"],
    experience: "Advanced",
  },
];

const formatMain = (exerciseId: string) => {
  const exercise = requireExerciseById(exerciseId);
  const patterns = exercise.movementPattern.join("/");
  const tags = exercise.tags.slice(0, 4).join("/");
  return `${exercise.name} [p:${patterns}${tags ? ` | t:${tags}` : ""}]`;
};

const normalizeSlotToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

let hasFailures = false;

PROFILE_BASES.forEach((profile) => {
  DAY_OPTIONS.forEach((daysPerWeek) => {
    EQUIPMENT_CASES.forEach((equipmentCase) => {
      PHASES.forEach((phase) => {
        const questionnaire: QuestionnaireData = {
          goals: profile.goals,
          painAreas: [...profile.painAreas],
          experience: profile.experience,
          daysPerWeek,
          equipment: [...equipmentCase.values],
        };

        clearProgramConstraintWarningBuffer();
        const programId = [
          "phase-matrix",
          profile.name.replace(/\s+/g, "-"),
          `${daysPerWeek}d`,
          equipmentCase.label,
          phase.key,
        ].join("-");

        const selectionTraceByDay = new Map<
          string,
          Map<
            string,
            {
              slotId: string;
              slotKind: string;
              chosenExerciseId: string;
              exercise: string;
              reasons: string[];
              penalties: string[];
            }
          >
        >();
        const finalizedTraceDaySet = new Set<string>();
        const program = generateWeeklyProgram(questionnaire, programId, {
          phaseIndex: phase.phaseIndex,
          seed: `phase-matrix-${profile.name}-${daysPerWeek}-${equipmentCase.label}-${phase.key}`,
          selectionAuditHook: (entry) => {
            const isFinalTrace = entry.chosen.reasons.includes("[final_trace]");
            const current =
              isFinalTrace && !finalizedTraceDaySet.has(entry.dayTitle)
                ? new Map<
                    string,
                    {
                      slotId: string;
                      slotKind: string;
                      chosenExerciseId: string;
                      exercise: string;
                      reasons: string[];
                      penalties: string[];
                    }
                  >()
                : selectionTraceByDay.get(entry.dayTitle) ?? new Map();
            if (isFinalTrace) {
              finalizedTraceDaySet.add(entry.dayTitle);
            } else if (finalizedTraceDaySet.has(entry.dayTitle)) {
              return;
            }
            const reasons = entry.chosen.reasons
              .filter((reason) => reason !== "[final_trace]")
              .slice(0, 3);
            current.set(entry.slotId, {
              slotId: entry.slotId,
              slotKind: entry.slotKind,
              chosenExerciseId: entry.chosen.exerciseId,
              exercise: entry.chosen.name,
              reasons,
              penalties: reasons.filter((reason) => reason.trim().startsWith("-")),
            });
            selectionTraceByDay.set(entry.dayTitle, current);
          },
        });

        const warnings = getProgramConstraintWarningBuffer().filter(
          (warning) => warning.programId === program.id
        );

        const contractAudit = auditCoverageContract({
          profile: profile.name,
          phase: phase.key,
          daysPerWeek,
          equipment: equipmentCase.values,
          questionnaire,
          program,
          warnings,
        });

        console.log(
          `PROFILE=${profile.name} | PHASE=${phase.key} | days=${daysPerWeek} | equipment=${equipmentCase.label} | capability=${contractAudit.capabilityMode} | phaseName=${program.phaseName ?? "n/a"}`
        );

        program.week.forEach((day) => {
          const mainItems = day.routine.filter((item) => item.section === "main");
          const mains = mainItems.map((item) => formatMain(item.exerciseId));
          const accessories = day.routine
            .filter((item) => item.section === "accessory")
            .map((item) => requireExerciseById(item.exerciseId).name);
          console.log(`- ${day.title}`);
          mains.forEach((main) => console.log(`  MAIN: ${main}`));
          console.log(
            `  ACCESSORY: ${accessories.length ? accessories.join(", ") : "(none)"}`
          );
          const traceMap = selectionTraceByDay.get(day.title) ?? new Map();
          const expectedSlotIds = mainItems.map(
            (_, index) => `${normalizeSlotToken(day.title)}-main-${index + 1}`
          );
          const skippedTraceIds = Array.from(traceMap.keys()).filter(
            (slotId) => !expectedSlotIds.includes(slotId)
          );
          const missingTraceIds = expectedSlotIds.filter((slotId) => !traceMap.has(slotId));
          if (skippedTraceIds.length || missingTraceIds.length) {
            hasFailures = true;
            console.log(
              `  TRACE SLOT DIAGNOSTIC expected=${expectedSlotIds.length} trace=${traceMap.size}`
            );
            console.log(`  - expectedSlots=${expectedSlotIds.join(", ") || "(none)"}`);
            console.log(`  - missingSlots=${missingTraceIds.join(", ") || "(none)"}`);
            console.log(`  - skippedTraceSlots=${skippedTraceIds.join(", ") || "(none)"}`);
          }

          expectedSlotIds.forEach((slotId, mainIndex) => {
            const trace = traceMap.get(slotId);
            const mainItem = mainItems[mainIndex];
            if (!mainItem) return;
            const expectedExercise = requireExerciseById(mainItem.exerciseId);
            if (!trace) {
              hasFailures = true;
              console.log(
                `  TRACE ${slotId}: MISSING (expected ${expectedExercise.name} / ${expectedExercise.id})`
              );
              return;
            }
            if (trace.chosenExerciseId !== mainItem.exerciseId) {
              hasFailures = true;
              console.log(
                `  TRACE MISMATCH ${slotId}: rendered=${expectedExercise.id} traced=${trace.chosenExerciseId}`
              );
            }
            console.log(
              `  TRACE ${trace.slotId} ${trace.slotKind}: ${expectedExercise.name} (${expectedExercise.id}) | reasons=${trace.reasons.join(" ; ")}${
                trace.penalties.length ? ` | penalties=${trace.penalties.join(" ; ")}` : ""
              }`
            );
          });
        });

        console.log(
          `  COVERAGE calves=${contractAudit.weekly.calvesDays} biceps=${contractAudit.weekly.bicepsDays} triceps=${contractAudit.weekly.tricepsDays} squat=${contractAudit.weekly.squatDays} hinge=${contractAudit.weekly.hingeDays} pull=${contractAudit.weekly.pullDays} push=${contractAudit.weekly.pushDays} antiRotation=${contractAudit.weekly.antiRotationDays} carry=${contractAudit.weekly.carryDays} scapular=${contractAudit.weekly.scapularDays}`
        );

        if (contractAudit.weeklyFailures.length) {
          hasFailures = true;
          console.log(`  COVERAGE FAILURES: ${contractAudit.weeklyFailures.join("; ")}`);
        } else {
          console.log("  COVERAGE FAILURES: none");
        }

        const dayFailures = contractAudit.dayContracts.filter((entry) => !entry.ok);
        if (dayFailures.length) {
          hasFailures = true;
          console.log(`  DAY CONTRACT FAILURES (${dayFailures.length})`);
          dayFailures.forEach((failure) => {
            const missing = failure.missing.length ? `missing=${failure.missing.join(", ")}` : "";
            const violations = failure.violations.length
              ? `violations=${failure.violations.join(", ")}`
              : "";
            const detail = [missing, violations].filter(Boolean).join(" | ");
            console.log(`  - ${failure.dayTitle}: ${detail || "failed"}`);
          });
        } else {
          console.log("  DAY CONTRACT FAILURES: none");
        }

        if (contractAudit.intelligenceFailures.length) {
          hasFailures = true;
          console.log(
            `  INTELLIGENCE FAILURES (${contractAudit.intelligenceFailures.length})`
          );
          contractAudit.intelligenceFailures.forEach((failure) => {
            console.log(`  - ${failure}`);
          });
        } else {
          console.log("  INTELLIGENCE FAILURES: none");
        }

        if (contractAudit.unresolvedBudgetViolations.length) {
          hasFailures = true;
          console.log(
            `  BUDGET UNRESOLVED (${contractAudit.unresolvedBudgetViolations.length})`
          );
          contractAudit.unresolvedBudgetViolations.forEach((failure) => {
            console.log(`  - ${failure}`);
          });
        } else {
          console.log("  BUDGET UNRESOLVED: none");
        }

        if (contractAudit.relaxedBudgetReasons.length) {
          console.log(`  BUDGET RELAXED (${contractAudit.relaxedBudgetReasons.length})`);
          contractAudit.relaxedBudgetReasons.forEach((entry) => {
            console.log(`  - ${entry}`);
          });
        } else {
          console.log("  BUDGET RELAXED: none");
        }

        if (contractAudit.invalidRelaxations.length) {
          hasFailures = true;
          console.log(`  INVALID RELAX (${contractAudit.invalidRelaxations.length})`);
          contractAudit.invalidRelaxations.forEach((entry) => {
            console.log(`  - ${entry}`);
          });
        } else {
          console.log("  INVALID RELAX: none");
        }

        if (warnings.length) {
          console.log(`  WARNINGS (${warnings.length})`);
          warnings.forEach((warning) => {
            console.log(`  - [${warning.kind}] ${warning.dayTitle}: ${warning.message}`);
          });
        } else {
          console.log("  WARNINGS (0)");
        }

        if (!contractAudit.ok) {
          console.log("  CONTRACT AUDIT: FAIL");
        } else {
          console.log("  CONTRACT AUDIT: PASS");
        }

        const isTargetBandOnlyCase =
          profile.name === "pain beginner" &&
          phase.key === "growth" &&
          daysPerWeek === 3 &&
          equipmentCase.label === "bands";
        if (isTargetBandOnlyCase) {
          const backChestDay = program.week.find((day) => day.title === "Back + Chest");
          if (!backChestDay) {
            hasFailures = true;
            console.log(
              "  TARGET ASSERT FAIL: missing Back + Chest day for pain beginner/growth/bands/3d"
            );
          } else {
            const mainExercises = backChestDay.routine
              .filter((item) => item.section === "main")
              .map((item) => requireExerciseById(item.exerciseId));
            const mainPushCount = mainExercises.filter((exercise) =>
              exercise.movementPattern.some((pattern) => pattern.toLowerCase() === "push")
            ).length;
            const mainPullCount = mainExercises.filter((exercise) =>
              exercise.movementPattern.some((pattern) => pattern.toLowerCase() === "pull")
            ).length;
            if (mainPushCount < 1 || mainPullCount < 1) {
              hasFailures = true;
              console.log(
                `  TARGET ASSERT FAIL: Back + Chest mains need push>=1 & pull>=1 (got push=${mainPushCount}, pull=${mainPullCount})`
              );
            } else {
              console.log(
                `  TARGET ASSERT PASS: Back + Chest mains push=${mainPushCount}, pull=${mainPullCount}`
              );
            }
          }
        }

        console.log("");
      });
    });
  });
});

if (hasFailures) {
  console.error("Coverage matrix audit failed.");
  process.exitCode = 1;
}
