import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { requireExerciseById } from "@/lib/exerciseCatalog";
import { generateWeeklyProgram } from "@/lib/program";

type SmokeCase = {
  label: string;
  phaseIndex: 1 | 2 | 3;
  experience: QuestionnaireData["experience"];
  equipment: QuestionnaireData["equipment"];
  expectNoRdlInActivation: boolean;
};

type MainPick = {
  dayTitle: string;
  exerciseId: string;
  name: string;
  movementPattern: string[];
  difficultyTier: string;
  phaseMin: string;
  movementIntensity: string;
};

const BASE_QUESTIONNAIRE: Omit<QuestionnaireData, "experience" | "equipment"> = {
  goals: "Improve posture",
  painAreas: [],
  daysPerWeek: 3,
};

const CASES: SmokeCase[] = [
  {
    label: "A) activation + beginner + gym",
    phaseIndex: 1,
    experience: "Beginner",
    equipment: ["gym"],
    expectNoRdlInActivation: true,
  },
  {
    label: "B) activation + intermediate + gym",
    phaseIndex: 1,
    experience: "Intermediate",
    equipment: ["gym"],
    expectNoRdlInActivation: true,
  },
  {
    label: "C) activation + advanced + gym",
    phaseIndex: 1,
    experience: "Advanced",
    equipment: ["gym"],
    expectNoRdlInActivation: false,
  },
  {
    label: "D) skill + intermediate + gym",
    phaseIndex: 2,
    experience: "Intermediate",
    equipment: ["gym"],
    expectNoRdlInActivation: false,
  },
  {
    label: "E) growth + intermediate + gym",
    phaseIndex: 3,
    experience: "Intermediate",
    equipment: ["gym"],
    expectNoRdlInActivation: false,
  },
];

const toToken = (value: string) => value.trim().toLowerCase();
const isDeadliftLike = (exerciseId: string, name: string) => {
  const token = `${exerciseId} ${name}`.toLowerCase();
  return token.includes("deadlift");
};
const isRdlLike = (exerciseId: string, name: string) => {
  const token = `${exerciseId} ${name}`.toLowerCase();
  return token.includes("rdl");
};
const hasHingePattern = (patterns: string[]) =>
  patterns.map(toToken).includes("hinge");

const collectMainPicks = (questionnaire: QuestionnaireData, phaseIndex: 1 | 2 | 3) => {
  const program = generateWeeklyProgram(
    questionnaire,
    `phase-eligibility-${phaseIndex}-${questionnaire.experience.toLowerCase()}`,
    { phaseIndex, seed: "phase-eligibility-fixed-seed" }
  );

  const mains: MainPick[] = program.week.flatMap((day) =>
    day.routine
      .filter((item) => item.section === "main")
      .map((item) => {
        const ex = requireExerciseById(item.exerciseId);
        return {
          dayTitle: day.title,
          exerciseId: ex.id,
          name: ex.name,
          movementPattern: ex.movementPattern,
          difficultyTier: ex.difficultyTier ?? "unknown",
          phaseMin: ex.phaseMin ?? "activation",
          movementIntensity:
            ex.movementIntensity ?? (ex.loadType === "weighted" ? "load" : "pattern"),
        };
      })
  );

  return { program, mains };
};

let hasFailures = false;

CASES.forEach((smokeCase) => {
  const questionnaire: QuestionnaireData = {
    ...BASE_QUESTIONNAIRE,
    experience: smokeCase.experience,
    equipment: smokeCase.equipment,
  };

  const { program, mains } = collectMainPicks(questionnaire, smokeCase.phaseIndex);
  const deadliftHits = mains.filter((main) => isDeadliftLike(main.exerciseId, main.name));
  const rdlHits = mains.filter((main) => isRdlLike(main.exerciseId, main.name));
  const hingeMains = mains.filter((main) => hasHingePattern(main.movementPattern));

  const issues: string[] = [];

  if (smokeCase.phaseIndex === 1 && deadliftHits.length > 0) {
    issues.push(
      `Activation contains deadlift-like selections: ${deadliftHits
        .map((hit) => `${hit.dayTitle}:${hit.exerciseId}`)
        .join(", ")}`
    );
  }

  if (
    smokeCase.phaseIndex === 1 &&
    smokeCase.expectNoRdlInActivation &&
    rdlHits.length > 0
  ) {
    issues.push(
      `Activation beginner/intermediate contains RDL-like selections: ${rdlHits
        .map((hit) => `${hit.dayTitle}:${hit.exerciseId}`)
        .join(", ")}`
    );
  }

  console.log(`[phaseEligibilitySmoke] ${smokeCase.label}`);
  console.log(
    `- phase=${program.phaseName ?? `Phase ${smokeCase.phaseIndex}`} mains=${mains.length} hingeMains=${hingeMains.length}`
  );
  if (hingeMains.length) {
    hingeMains.forEach((main) => {
      console.log(
        `  * ${main.dayTitle}: ${main.name} (${main.exerciseId}) patterns=${JSON.stringify(
          main.movementPattern
        )} tier=${main.difficultyTier} phaseMin=${main.phaseMin} intensity=${main.movementIntensity}`
      );
    });
  } else {
    console.log("  * no hinge mains selected");
  }

  if (issues.length > 0) {
    hasFailures = true;
    issues.forEach((issue) => console.log(`  ! ${issue}`));
  } else {
    console.log("  PASS");
  }
});

if (hasFailures) {
  process.exitCode = 1;
}
