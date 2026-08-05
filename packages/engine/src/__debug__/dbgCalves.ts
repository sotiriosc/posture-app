import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import { exerciseById } from "@/lib/exercises";

clearProgramVariationHistory();
const q = {
  goals: "Reduce pain",
  painAreas: ["low_back", "neck"],
  experience: "Advanced",
  daysPerWeek: 5 as const,
  equipment: ["gym"],
};
const program = generateWeeklyProgram(q, "dbg", {
  phaseIndex: 3,
  seed: "phase-matrix-pain advanced-5-gym-growth",
});
for (const d of program.week) {
  if (!/lower/i.test(d.title)) continue;
  console.log(
    "\n",
    d.title,
    d.routine
      .filter((i) => i.section === "accessory")
      .map((i) => {
        const ex = exerciseById(i.exerciseId);
        return {
          id: i.exerciseId,
          src: i.selectionDebug?.source,
          lane: i.selectionDebug?.slotLane,
          tags: ex?.tags,
          patterns: ex?.movementPattern,
          notes: i.notes,
        };
      })
  );
}
