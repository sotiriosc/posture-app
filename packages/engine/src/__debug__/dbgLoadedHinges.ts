import { exercises } from "@/lib/exercises";

const hinges = exercises.filter((e) => {
  const patterns = (e.movementPattern ?? []).map((p) => p.toLowerCase());
  return (
    e.category === "main" &&
    patterns.some((p) => p.includes("hinge")) &&
    e.loadedMainEligible === true
  );
});
for (const e of hinges) {
  console.log(
    e.id,
    e.loadType,
    e.phaseMin ?? "-",
    e.difficultyTier ?? "-",
    e.equipment.join("+"),
    e.slotRoles?.join(",") ?? ""
  );
}
