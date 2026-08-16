import type { LogPrefs, Program } from "../../src/types";
import {
  PRODUCT_SHADOW_GOAL_REALIZATION_FIXTURE_EXTENSIONS_REFERENCE,
  type ProductGoalRealizationFixtureExtensions,
  type ProductGoalRealizationMappingInput,
} from "../../src/controlledProductShadowGoalRealization";
import type {
  EvidenceEquipmentDetail,
  GoalSpecificProductFixture,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/scenarioManifest";
import { GOAL_SPECIFIC_PRODUCT_SHADOW_EVALUATION_TIME } from
  "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/contracts";

function equipmentDetail(detail: EvidenceEquipmentDetail):
NonNullable<ProductGoalRealizationFixtureExtensions["equipmentDetails"]>[number] | null {
  if (detail === "none") return null;
  if (detail === "bodyweight_exact") return Object.freeze({
    productLabel: "none" as const,
    implementReference: "fixture:bodyweight:floor-space",
    capabilities: Object.freeze(["floor_space", "bodyweight_training_area", "stable_support_surface"]),
    loadMinimum: 0, loadMaximum: 0, loadIncrement: 0,
    unit: "not_applicable" as const,
  });
  if (detail === "dumbbell_exact" || detail === "dumbbell_low_ceiling") return Object.freeze({
    productLabel: "dumbbells" as const,
    implementReference: detail === "dumbbell_low_ceiling"
      ? "fixture:dumbbells:low-ceiling" : "fixture:dumbbells:adjustable-pair",
    capabilities: Object.freeze(["dumbbell_pair", "flat_bench", "floor_space"]),
    loadMinimum: 2,
    loadMaximum: detail === "dumbbell_low_ceiling" ? 6 : 50,
    loadIncrement: 2,
    unit: "kg" as const,
  });
  if (detail === "band_exact" || detail === "band_missing_anchor") return Object.freeze({
    productLabel: "bands" as const,
    implementReference: detail === "band_missing_anchor"
      ? "fixture:bands:unanchored" : "fixture:bands:anchored-loop",
    capabilities: Object.freeze(detail === "band_missing_anchor"
      ? ["loop_band"] : ["loop_band", "stable_band_anchor", "floor_space"]),
    loadMinimum: 1, loadMaximum: 5, loadIncrement: 1,
    unit: "band_level" as const,
  });
  return Object.freeze({
    productLabel: "gym" as const,
    implementReference: "fixture:gym:reviewed-capabilities",
    capabilities: Object.freeze([
      "floor_space", "stable_support_surface", "dumbbell_pair", "flat_bench",
      "selectorized_chest_press", "cable_station", "loaded_gait_space",
    ]),
    loadMinimum: 2, loadMaximum: 120, loadIncrement: 2,
    unit: "kg" as const,
  });
}

export function fixtureExtensions(fixture: GoalSpecificProductFixture):
ProductGoalRealizationFixtureExtensions | null {
  if (!fixture.useFixtureExtensions) return null;
  const equipment = equipmentDetail(fixture.equipmentDetail);
  return Object.freeze({
    reference: PRODUCT_SHADOW_GOAL_REALIZATION_FIXTURE_EXTENSIONS_REFERENCE,
    source: "versioned_test_or_replay_fixture",
    secondaryOutcome: fixture.secondaryGoal,
    purposeBundle: fixture.purposeBundle,
    fitnessFocus: fixture.fitnessFocus,
    sessionMinutes: fixture.minutes,
    equipmentDetails: Object.freeze(equipment ? [equipment] : []),
  });
}

function legacyProgram(fixture: GoalSpecificProductFixture): Program {
  return {
    id: `legacy-program:${fixture.athleteShellId}`,
    userId: fixture.athleteShellId,
    createdAt: GOAL_SPECIFIC_PRODUCT_SHADOW_EVALUATION_TIME,
    updatedAt: GOAL_SPECIFIC_PRODUCT_SHADOW_EVALUATION_TIME,
    goalTrack: "posture",
    daysPerWeek: fixture.daysPerWeek,
    estimatedSessionMinutesRange: { min: 45, max: 60 },
    source: "local",
    deletedAt: null,
    phaseIndex: 1,
    weekIndex: 1,
    cycleIndex: 1,
    week: Array.from({ length: fixture.daysPerWeek }, (_, dayIndex) => ({
      dayIndex,
      title: `Day ${dayIndex + 1}`,
      focusTags: [],
      routine: [{ exerciseId: "push-up", section: "main", sets: 2, reps: "8",
        durationSec: null, loadType: "bodyweight" }],
    })),
  };
}

function assessment(fixture: GoalSpecificProductFixture): Record<string, unknown> {
  if (fixture.assessment === "none") return { signals: [] };
  if (fixture.assessment === "irrelevant_low_confidence") return { signals: [{
    id: "assessment:irrelevant-ankle", confidence: 0.2, region: "ankle",
    action: "observe", reviewState: "unreviewed",
  }] };
  return { signals: [{ id: "assessment:reviewed-press-control", confidence: 0.9,
    region: "shoulder", action: "horizontal_push_control", reviewState: "reviewed" }] };
}

export function buildGoalSpecificMappingInput(fixture: GoalSpecificProductFixture):
ProductGoalRealizationMappingInput {
  const program = legacyProgram(fixture);
  const preferences: LogPrefs = { schemaVersion: 1, feedbackByExercise: {} };
  return Object.freeze({
    athleteId: fixture.athleteShellId,
    questionnaire: Object.freeze({
      goals: fixture.goal,
      experience: fixture.experience,
      equipment: Object.freeze([fixture.equipment]),
      daysPerWeek: fixture.daysPerWeek,
      trainingIntent: fixture.trainingIntent,
      painAreas: fixture.painAreas,
    }),
    assessment: assessment(fixture),
    preferences,
    programs: Object.freeze([program]),
    sessions: Object.freeze([]),
    exerciseLogs: Object.freeze([]),
    activeProgramId: program.id,
    productStateRevision: fixture.productSourceRevision,
    evaluationTime: GOAL_SPECIFIC_PRODUCT_SHADOW_EVALUATION_TIME,
    fixtureExtensions: fixtureExtensions(fixture),
  });
}
