import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { requireExerciseById } from "@/lib/exerciseCatalog";
import {
  generateWeeklyProgram,
  getPainSeverity,
  previewPainSubstitutionChoices,
} from "@/lib/program";

const BASE: Omit<QuestionnaireData, "painAreas"> = {
  goals: "Improve posture",
  experience: "Beginner",
  equipment: ["gym"],
  daysPerWeek: 3,
};

const CASES: Array<{ label: string; painAreas: string[] }> = [
  { label: "none", painAreas: [] },
  { label: "low_back", painAreas: ["low_back"] },
  { label: "shoulders+neck", painAreas: ["shoulders", "neck"] },
];

CASES.forEach(({ label, painAreas }) => {
  const questionnaire: QuestionnaireData = { ...BASE, painAreas };
  const painSeverity = getPainSeverity(questionnaire);
  const program = generateWeeklyProgram(
    questionnaire,
    `pain-policy-smoke-${label}`,
    { seed: "pain-policy-smoke-seed" }
  );
  const day1 = program.week[0];
  const day1Mains = day1?.routine.filter((item) => item.section === "main") ?? [];

  console.log(`[painPolicySmoke] case=${label}`);
  console.log(`- painSeverity=${painSeverity}`);
  console.log(`- day1=${day1?.title ?? "n/a"}`);
  console.log(`- nextWeekSummary=${program.nextWeekPlan?.summary ?? "--"}`);
  day1Mains.forEach((item, index) => {
    const exercise = requireExerciseById(item.exerciseId);
    console.log(
      `  * [${index + 1}] ${exercise.name} | sets=${String(item.sets)} reps=${item.reps ?? "--"} rest=${item.restSec ?? "--"} notes=${item.notes ?? "--"}`
    );
  });

  if (painSeverity === "low") {
    console.log("- substitutionChoices=n/a (painSeverity low)");
    return;
  }

  const preferredAnchorId =
    label === "low_back"
      ? "db-rdl"
      : label === "shoulders+neck"
      ? "db-overhead-press"
      : day1Mains[0]?.exerciseId;
  const anchorId = preferredAnchorId ?? day1Mains[0]?.exerciseId;

  if (!anchorId) {
    console.log("- substitutionChoices=n/a (no anchor exercise)");
    return;
  }

  const choices = previewPainSubstitutionChoices({
    questionnaire,
    exerciseId: anchorId,
    section: "main",
    limit: 5,
  });
  const anchorName = requireExerciseById(anchorId).name;
  console.log(`- substitutionChoices for ${anchorName}`);
  choices.forEach((choice, index) => {
    console.log(
      `  * [${index + 1}] ${choice.name} (${choice.exerciseId}) score=${choice.score} reasons=${choice.reasons.join(" | ")}`
    );
  });
});
