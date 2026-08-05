import { exerciseById } from "@/lib/exercises";

const ids = [
  "assisted-box-squat",
  "machine-leg-press",
  "goblet-squat",
  "bodyweight-squat",
  "heels-elevated-squat",
  "band-front-squat",
  "dumbbell-step-up-loaded",
  "split-squat",
  "machine-hack-squat",
];

for (const id of ids) {
  const e = exerciseById(id);
  if (!e) {
    console.log(id, "MISSING");
    continue;
  }
  console.log(
    JSON.stringify({
      id,
      cat: e.category,
      load: e.loadType,
      loadedMainEligible: e.loadedMainEligible,
      equipment: e.equipment,
      slotRoles: e.slotRoles,
      movementPattern: e.movementPattern,
    })
  );
}
