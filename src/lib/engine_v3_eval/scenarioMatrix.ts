import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { normalizeEquipmentSelection } from "@/lib/equipment";
import type { ShadowPainProfile, ShadowScenario } from "@/lib/engine_v3_eval/types";
import type { V3CapabilityProfile } from "@/lib/engine_v3";

const buildCapabilityProfile = (params: {
  equipment: QuestionnaireData["equipment"];
  painProfile: ShadowPainProfile;
}): V3CapabilityProfile => {
  const normalized = normalizeEquipmentSelection(params.equipment);
  const availableEquipment = Array.from(normalized.available).sort();

  if (params.painProfile === "lower_back") {
    return {
      availableEquipment,
      allowOverheadLoading: true,
      allowUnsupportedHinge: false,
    };
  }

  if (params.painProfile === "shoulders_neck") {
    return {
      availableEquipment,
      allowOverheadLoading: false,
      allowUnsupportedHinge: true,
      avoidTags: ["neck"],
    };
  }

  return {
    availableEquipment,
    allowOverheadLoading: true,
    allowUnsupportedHinge: true,
  };
};

const buildScenario = (params: {
  id: string;
  label: string;
  goals: QuestionnaireData["goals"];
  equipment: QuestionnaireData["equipment"];
  experience: QuestionnaireData["experience"];
  painAreas: QuestionnaireData["painAreas"];
  painProfile: ShadowPainProfile;
  productionPhaseIndex: 1 | 2 | 3;
  notes: string[];
}): ShadowScenario => ({
  id: params.id,
  label: params.label,
  questionnaire: {
    goals: params.goals,
    equipment: params.equipment,
    experience: params.experience,
    painAreas: params.painAreas,
    daysPerWeek: 3,
  },
  painProfile: params.painProfile,
  productionPhaseIndex: params.productionPhaseIndex,
  notes: params.notes,
  v3CapabilityProfile: buildCapabilityProfile({
    equipment: params.equipment,
    painProfile: params.painProfile,
  }),
});

export const SHADOW_EVAL_SCENARIOS: ShadowScenario[] = [
  buildScenario({
    id: "none-beginner-general-none",
    label: "No equipment / Beginner / General fitness / No pain",
    goals: "General fitness",
    equipment: ["none"],
    experience: "Beginner",
    painAreas: [],
    painProfile: "none",
    productionPhaseIndex: 2,
    notes: ["Core experience-bias baseline for no-equipment users."],
  }),
  buildScenario({
    id: "none-intermediate-general-none",
    label: "No equipment / Intermediate / General fitness / No pain",
    goals: "General fitness",
    equipment: ["none"],
    experience: "Intermediate",
    painAreas: [],
    painProfile: "none",
    productionPhaseIndex: 2,
    notes: ["Core experience-bias baseline for no-equipment users."],
  }),
  buildScenario({
    id: "none-advanced-general-none",
    label: "No equipment / Advanced / General fitness / No pain",
    goals: "General fitness",
    equipment: ["none"],
    experience: "Advanced",
    painAreas: [],
    painProfile: "none",
    productionPhaseIndex: 2,
    notes: ["Core experience-bias baseline for no-equipment users."],
  }),
  buildScenario({
    id: "bands-beginner-general-none",
    label: "Bands / Beginner / General fitness / No pain",
    goals: "General fitness",
    equipment: ["bands"],
    experience: "Beginner",
    painAreas: [],
    painProfile: "none",
    productionPhaseIndex: 2,
    notes: ["Core experience-bias baseline for band users."],
  }),
  buildScenario({
    id: "bands-intermediate-general-none",
    label: "Bands / Intermediate / General fitness / No pain",
    goals: "General fitness",
    equipment: ["bands"],
    experience: "Intermediate",
    painAreas: [],
    painProfile: "none",
    productionPhaseIndex: 2,
    notes: ["Core experience-bias baseline for band users."],
  }),
  buildScenario({
    id: "bands-advanced-general-none",
    label: "Bands / Advanced / General fitness / No pain",
    goals: "General fitness",
    equipment: ["bands"],
    experience: "Advanced",
    painAreas: [],
    painProfile: "none",
    productionPhaseIndex: 2,
    notes: ["Core experience-bias baseline for band users."],
  }),
  buildScenario({
    id: "gym-beginner-general-none",
    label: "Gym / Beginner / General fitness / No pain",
    goals: "General fitness",
    equipment: ["gym"],
    experience: "Beginner",
    painAreas: [],
    painProfile: "none",
    productionPhaseIndex: 2,
    notes: ["Core experience-bias baseline for full-equipment users."],
  }),
  buildScenario({
    id: "gym-intermediate-general-none",
    label: "Gym / Intermediate / General fitness / No pain",
    goals: "General fitness",
    equipment: ["gym"],
    experience: "Intermediate",
    painAreas: [],
    painProfile: "none",
    productionPhaseIndex: 2,
    notes: ["Core experience-bias baseline for full-equipment users."],
  }),
  buildScenario({
    id: "gym-advanced-general-none",
    label: "Gym / Advanced / General fitness / No pain",
    goals: "General fitness",
    equipment: ["gym"],
    experience: "Advanced",
    painAreas: [],
    painProfile: "none",
    productionPhaseIndex: 2,
    notes: ["Core experience-bias baseline for full-equipment users."],
  }),
  buildScenario({
    id: "bands-beginner-reduce-pain-lower-back",
    label: "Bands / Beginner / Reduce pain / Lower back",
    goals: "Reduce pain",
    equipment: ["bands"],
    experience: "Beginner",
    painAreas: ["Lower back"],
    painProfile: "lower_back",
    productionPhaseIndex: 1,
    notes: ["Stress scenario for hinge safety and repair burden."],
  }),
  buildScenario({
    id: "gym-intermediate-posture-shoulders-neck",
    label: "Gym / Intermediate / Improve posture / Shoulders + Neck",
    goals: "Improve posture",
    equipment: ["gym"],
    experience: "Intermediate",
    painAreas: ["Shoulders", "Neck"],
    painProfile: "shoulders_neck",
    productionPhaseIndex: 1,
    notes: ["Stress scenario for overhead tolerance and shoulder-safe coverage."],
  }),
  buildScenario({
    id: "none-advanced-athletic-shoulders-neck",
    label: "No equipment / Advanced / Athletic performance / Shoulders + Neck",
    goals: "Athletic performance",
    equipment: ["none"],
    experience: "Advanced",
    painAreas: ["Shoulders", "Neck"],
    painProfile: "shoulders_neck",
    productionPhaseIndex: 2,
    notes: ["Stress scenario for limited-equipment ambition and pain-aware substitutions."],
  }),
];
