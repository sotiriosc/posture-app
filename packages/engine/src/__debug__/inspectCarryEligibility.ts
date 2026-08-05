import { exercises } from "@/lib/exercises";
import {
  buildProgramIntentProfile,
  getPainSeverity,
} from "@/lib/program";

const exerciseById = (id: string) => exercises.find((e) => e.id === id);

const ids = [
  "farmers-carry",
  "suitcase-carry",
  "suitcase-hold-march",
  "band-suitcase-march",
  "dumbbell-suitcase-hold-march",
  "side-plank",
];
for (const id of ids) {
  const e = exerciseById(id);
  console.log(
    JSON.stringify({
      id,
      carryType: e?.carryType,
      weeklyCoverageTags: e?.weeklyCoverageTags,
      accessoryRoles: e?.accessoryRoles,
      pain: e?.painContraindications,
      equipment: e?.equipment,
      difficulty: e?.difficulty,
      phaseMin: e?.phaseMin,
    })
  );
}

const intent = buildProgramIntentProfile({
  questionnaire: {
    goals: "Improve posture",
    painAreas: [],
    experience: "Beginner",
    daysPerWeek: 4,
    equipment: ["gym"],
  },
  painSeverity: getPainSeverity({
    goals: "Improve posture",
    painAreas: [],
    experience: "Beginner",
    daysPerWeek: 4,
    equipment: ["gym"],
  }),
  phaseStage: "activation",
  experienceLevel: "beginner",
  capabilityMode: "hasLoad",
});
console.log("intent needs/recovery", {
  recoveryBudget: intent.recoveryBudget,
  needs: intent.needs,
});
