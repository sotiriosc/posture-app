import { exerciseById } from "@/lib/exercises";

const ids = [
  "db-rdl",
  "band-rdl",
  "dumbbell-sumo-rdl",
  "barbell-romanian-deadlift",
  "barbell-hip-thrust",
  "machine-glute-drive",
  "back-extension",
  "single-leg-rdl",
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
      load: e.loadType,
      loadedMainEligible: e.loadedMainEligible,
      phaseMin: e.phaseMin,
      difficultyTier: e.difficultyTier,
      slotRoles: e.slotRoles,
      equipment: e.equipment,
      regressionOnly: e.regressionOnly,
    })
  );
}
