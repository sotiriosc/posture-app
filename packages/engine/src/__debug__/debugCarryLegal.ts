/**
 * Probe why hasLegalTrueCarryCandidate fails in activation.
 * Duplicates the weekly-coverage gate checks via public-ish helpers.
 */
import { exercises } from "@/lib/exercises";
import { normalizeEquipmentSelection } from "@/lib/equipment";
import {
  buildProgramIntentProfile,
  getPainSeverity,
  isEligibleForPhase,
} from "@/lib/program";

const available = normalizeEquipmentSelection(["gym"]).available;
const questionnaire = {
  goals: "Improve posture" as const,
  painAreas: [] as string[],
  experience: "Beginner" as const,
  daysPerWeek: 4 as const,
  equipment: ["gym"],
};
const intent = buildProgramIntentProfile({
  questionnaire,
  painSeverity: getPainSeverity(questionnaire),
  phaseStage: "activation",
  experienceLevel: "beginner",
  capabilityMode: "hasLoad",
});

const preferred = ["farmers-carry", "suitcase-carry", "suitcase-hold-march"];
for (const id of preferred) {
  const exercise = exercises.find((e) => e.id === id)!;
  const trueCarry =
    exercise.carryType === "carry" ||
    (exercise.weeklyCoverageTags ?? []).includes("carry");
  const phaseOk = isEligibleForPhase(exercise, "Phase 1: Control & Technique", {
    intentProfile: intent,
    phaseStage: "activation",
    phaseName: "Phase 1: Control & Technique",
    experienceLevel: "beginner",
    painSeverity: "low",
    painAreas: [],
    trainingContext: "gym",
    capabilityMode: "hasLoad",
    primaryEquipmentMode: "gym",
    programCapabilities: {
      hasBench: true,
      hasPullupBar: true,
      hasBands: false,
      hasDumbbells: true,
      hasBarbell: true,
      hasCables: true,
      hasMachines: true,
      hasGym: true,
      hasNone: false,
      bandSetupConfirmed: false,
      hasLoopBand: false,
      hasLongBand: false,
      hasDoorAnchor: false,
      hasHighAnchor: false,
      hasMidAnchor: false,
      hasLowAnchor: false,
    } as never,
    availableEquipment: available,
    recentlyUsedExerciseIds: new Set(),
    feedbackSummaryByExercise: new Map(),
    poseFocusTags: new Set(),
    blockedExerciseIds: new Set(),
  } as never);
  console.log(
    JSON.stringify({
      id,
      carryType: exercise.carryType,
      trueCarry,
      phaseOk,
      difficultyTier: exercise.difficultyTier,
      difficulty: exercise.difficulty,
    })
  );
}
