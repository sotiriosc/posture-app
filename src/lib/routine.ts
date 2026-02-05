import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { normalizeEquipmentSelection } from "@/lib/equipment";

type RoutineItem = {
  exerciseId: string;
  sets: string;
  reps: string;
  durationSec?: number;
};

type RoutineSection = {
  title: string;
  items: RoutineItem[];
};

type Routine = {
  summary: string;
  priorities: string[];
  observed: string[];
  sections: RoutineSection[];
};

const getVolume = (experience: string, goal: string) => {
  if (goal === "Reduce pain") return { sets: "2-3", reps: "8-10" };
  if (experience === "Beginner") return { sets: "3", reps: "8-12" };
  if (experience === "Advanced") return { sets: "4-5", reps: "8-12" };
  return { sets: "4", reps: "8-12" };
};

export const generateRoutine = (data: QuestionnaireData): Routine => {
  const { sets, reps } = getVolume(data.experience, data.goals);
  const equipmentContext = normalizeEquipmentSelection(data.equipment);
  const hasBands = equipmentContext.available.has("bands");
  const hasDumbbells = equipmentContext.available.has("dumbbells");
  const hasRoller = equipmentContext.available.has("foam_roller");
  const hasGym = equipmentContext.hasGym;

  const warmup: RoutineItem[] = [
    {
      exerciseId: "cat-cow",
      sets: "2",
      reps: "6-8",
      durationSec: 60,
    },
    {
      exerciseId: "wall-slides",
      sets: "2",
      reps: "8-10",
      durationSec: 60,
    },
    {
      exerciseId: "thoracic-rotation",
      sets: "2",
      reps: "6-8 per side",
      durationSec: 60,
    },
  ];

  if (hasRoller) {
    warmup.push({
      exerciseId: "foam-roll-upper-back",
      sets: "1",
      reps: "60 sec",
      durationSec: 60,
    });
  }

  const activation: RoutineItem[] = [
    {
      exerciseId: "glute-bridges",
      sets,
      reps,
      durationSec: 75,
    },
    {
      exerciseId: "bird-dog",
      sets: "2-3",
      reps: "6-8 per side",
      durationSec: 75,
    },
  ];

  if (hasBands) {
    activation.push({
      exerciseId: "band-pull-aparts",
      sets,
      reps,
      durationSec: 75,
    });
  } else {
    activation.push({
      exerciseId: "scapular-pushups",
      sets,
      reps,
      durationSec: 75,
    });
  }

  const main: RoutineItem[] = [];

  if (hasDumbbells) {
    main.push({
      exerciseId: "dumbbell-rows",
      sets,
      reps,
      durationSec: 90,
    });
  } else if (hasGym) {
    main.push({
      exerciseId: "dumbbell-rows",
      sets,
      reps,
      durationSec: 90,
    });
  } else {
    main.push({
      exerciseId: "prone-ytw",
      sets,
      reps: "6-8 each",
      durationSec: 90,
    });
  }

  if (hasGym || hasBands) {
    main.push({
      exerciseId: "face-pull",
      sets: "3-4",
      reps: "10-12",
      durationSec: 90,
    });
  }

  if (hasGym) {
    main.push({
      exerciseId: "pallof-press",
      sets: "3",
      reps: "8-10 per side",
      durationSec: 90,
    });
  }

  const cooldown: RoutineItem[] = [
    {
      exerciseId: "hip-flexor-stretch",
      sets: "2",
      reps: "30 sec per side",
      durationSec: 60,
    },
    {
      exerciseId: "thread-the-needle",
      sets: "2",
      reps: "5-6 per side",
      durationSec: 60,
    },
    {
      exerciseId: "hamstring-stretch",
      sets: "2",
      reps: "30 sec per side",
      durationSec: 60,
    },
  ];

  if (data.painAreas.includes("Neck")) {
    cooldown.push({
      exerciseId: "chin-tucks",
      sets: "2",
      reps: "8-10",
      durationSec: 60,
    });
  }

  if (data.painAreas.includes("Lower back")) {
    cooldown.push({
      exerciseId: "dead-bug",
      sets: "2",
      reps: "6-8 per side",
      durationSec: 75,
    });
  }

  const summaryParts = [
    `Goal focus: ${data.goals}.`,
    `Primary equipment: ${
      data.equipment.length ? data.equipment.join(", ") : "none"
    }.`,
    `Experience: ${data.experience}.`,
  ];

  const priorities = [
    data.goals === "Reduce pain" ? "Daily gentle mobility" : "Posture strength",
    data.painAreas.length
      ? `Focus area: ${data.painAreas[0]}`
      : "Balanced full-body support",
    data.equipment.includes("none")
      ? "Bodyweight consistency"
      : "Use your available equipment",
  ].slice(0, 3);

  const observed: string[] = [];
  if (data.painAreas.includes("Neck")) {
    observed.push("Neck tension tends to show with screen-heavy days.");
  }
  if (data.painAreas.includes("Upper back")) {
    observed.push("Upper-back tightness often pairs with rounded shoulders.");
  }
  if (data.painAreas.includes("Lower back")) {
    observed.push("Low-back soreness can reflect core fatigue.");
  }
  if (data.painAreas.length === 0) {
    observed.push("No pain areas selected; focus stays preventive.");
  }
  if (observed.length < 2) {
    observed.push("Consistency matters more than intensity right now.");
  }

  return {
    summary: summaryParts.join(" "),
    priorities,
    observed: observed.slice(0, 3),
    sections: [
      { title: "Warm-up", items: warmup },
      { title: "Activation", items: activation },
      { title: "Main", items: main },
      { title: "Cooldown", items: cooldown },
    ],
  };
};

export type { Routine, RoutineItem, RoutineSection };
