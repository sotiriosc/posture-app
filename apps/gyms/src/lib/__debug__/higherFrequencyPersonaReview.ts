import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
} from "@/lib/program";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";

type Persona = {
  name: string;
  questionnaire: QuestionnaireData;
};

type BuildPersonaParams = {
  daysPerWeek: 4 | 5;
  experience: QuestionnaireData["experience"];
  equipment: QuestionnaireData["equipment"];
  lowerBackPain?: boolean;
};

const buildQuestionnaire = ({
  daysPerWeek,
  experience,
  equipment,
  lowerBackPain = false,
}: BuildPersonaParams): QuestionnaireData => ({
  goals: lowerBackPain ? "Reduce pain" : "General fitness",
  painAreas: lowerBackPain ? ["lower back"] : [],
  experience,
  equipment,
  daysPerWeek,
});

const persona = (name: string, params: BuildPersonaParams): Persona => ({
  name,
  questionnaire: buildQuestionnaire(params),
});

const personas: Persona[] = [
  persona("Beginner / 4 days / gym / no pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["gym"],
  }),
  persona("Intermediate / 4 days / gym / no pain", {
    daysPerWeek: 4,
    experience: "Intermediate",
    equipment: ["gym"],
  }),
  persona("Advanced / 4 days / gym / no pain", {
    daysPerWeek: 4,
    experience: "Advanced",
    equipment: ["gym"],
  }),
  persona("Beginner / 4 days / gym / lower back pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["gym"],
    lowerBackPain: true,
  }),
  persona("Intermediate / 4 days / dumbbells / no pain", {
    daysPerWeek: 4,
    experience: "Intermediate",
    equipment: ["dumbbells"],
  }),
  persona("Beginner / 4 days / dumbbells / lower back pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["dumbbells"],
    lowerBackPain: true,
  }),
  persona("Intermediate / 4 days / bands / no pain", {
    daysPerWeek: 4,
    experience: "Intermediate",
    equipment: ["bands"],
  }),
  persona("Beginner / 4 days / none / no pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["none"],
  }),
  persona("Beginner / 4 days / none / lower back pain", {
    daysPerWeek: 4,
    experience: "Beginner",
    equipment: ["none"],
    lowerBackPain: true,
  }),
  persona("Beginner / 5 days / gym / no pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["gym"],
  }),
  persona("Intermediate / 5 days / gym / no pain", {
    daysPerWeek: 5,
    experience: "Intermediate",
    equipment: ["gym"],
  }),
  persona("Advanced / 5 days / gym / no pain", {
    daysPerWeek: 5,
    experience: "Advanced",
    equipment: ["gym"],
  }),
  persona("Beginner / 5 days / gym / lower back pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["gym"],
    lowerBackPain: true,
  }),
  persona("Intermediate / 5 days / dumbbells / no pain", {
    daysPerWeek: 5,
    experience: "Intermediate",
    equipment: ["dumbbells"],
  }),
  persona("Beginner / 5 days / dumbbells / lower back pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["dumbbells"],
    lowerBackPain: true,
  }),
  persona("Intermediate / 5 days / bands / no pain", {
    daysPerWeek: 5,
    experience: "Intermediate",
    equipment: ["bands"],
  }),
  persona("Beginner / 5 days / none / no pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["none"],
  }),
  persona("Beginner / 5 days / none / lower back pain", {
    daysPerWeek: 5,
    experience: "Beginner",
    equipment: ["none"],
    lowerBackPain: true,
  }),
];

const phaseIndexes = [1, 2, 3] as const;

const describeExercise = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  return exercise ? exercise.name : `${exerciseId} (missing catalog entry)`;
};

const getSectionItems = (
  day: ProgramDay,
  section: NonNullable<ProgramRoutineItem["section"]>
) => day.routine.filter((item) => item.section === section);

const compactList = (items: string[]) => (items.length ? items.join(", ") : "none");

const namesForSection = (
  day: ProgramDay,
  section: NonNullable<ProgramRoutineItem["section"]>
) => compactList(getSectionItems(day, section).map((item) => describeExercise(item.exerciseId)));

const debugBits = (item: ProgramRoutineItem) => {
  const debug = item.selectionDebug;
  return [
    `slot=${debug?.slotKind ?? "n/a"}`,
    `lane=${debug?.slotLane ?? "n/a"}`,
    `source=${debug?.source ?? "n/a"}`,
  ].join(" ");
};

const detailedExerciseLine = (item: ProgramRoutineItem) => {
  const name = describeExercise(item.exerciseId);
  return `  - \`${item.exerciseId}\` ${name} (${debugBits(item)})`;
};

const buildMainLayoutSignature = (program: Program) =>
  program.week
    .map((day) => {
      const slotSignature = getSectionItems(day, "main")
        .map(
          (item) =>
            `${item.selectionDebug?.slotKind ?? item.selectionDebug?.slotLane ?? "main"}:${
              item.exerciseId
            }`
        )
        .join(">");
      return `${day.title}=[${slotSignature}]`;
    })
    .join(" | ");

const formatWarnings = (warnings: ReturnType<typeof getProgramConstraintWarningBuffer>) => {
  if (!warnings.length) return "  - none";
  return warnings
    .map((warning) => `  - [${warning.kind}] ${warning.dayTitle}: ${warning.message}`)
    .join("\n");
};

const renderProgram = (
  persona: Persona,
  phaseIndex: 1 | 2 | 3,
  program: Program,
  warnings: ReturnType<typeof getProgramConstraintWarningBuffer>
) => {
  const lines: string[] = [];

  lines.push(`## ${persona.name} - Phase ${phaseIndex}`);
  lines.push("");
  lines.push(`- Goal: ${persona.questionnaire.goals}`);
  lines.push(`- Experience: ${persona.questionnaire.experience}`);
  lines.push(`- Equipment: ${persona.questionnaire.equipment.join(", ")}`);
  lines.push(`- Pain areas: ${persona.questionnaire.painAreas.join(", ") || "none"}`);
  lines.push(`- Phase: ${program.phaseName ?? `phase ${phaseIndex}`}`);
  lines.push(`- Main layout signature: ${buildMainLayoutSignature(program)}`);
  lines.push("- Coverage warnings / audit hints:");
  lines.push(formatWarnings(warnings));
  lines.push("");

  program.week.forEach((day) => {
    lines.push(`### ${day.title}`);
    lines.push(`- Warm-up: ${namesForSection(day, "warmup")}`);
    lines.push(`- Corrective: ${namesForSection(day, "activation")}`);
    lines.push("- Main:");
    const mainItems = getSectionItems(day, "main");
    lines.push(...(mainItems.length ? mainItems.map(detailedExerciseLine) : ["  - none"]));
    lines.push("- Accessory:");
    const accessoryItems = getSectionItems(day, "accessory");
    lines.push(
      ...(accessoryItems.length ? accessoryItems.map(detailedExerciseLine) : ["  - none"])
    );
    lines.push(`- Cooldown: ${namesForSection(day, "cooldown")}`);
    lines.push("");
  });

  return lines.join("\n");
};

const reports: string[] = [
  "# Higher-Frequency Persona Review",
  "",
  "Deterministic manual-review output for key 4-day and 5-day profiles.",
  "",
];

personas.forEach((entry, personaIndex) => {
  phaseIndexes.forEach((phaseIndex) => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const seed = `higher-frequency-persona-review-${personaIndex + 1}-phase-${phaseIndex}`;
    const program = generateWeeklyProgram(
      entry.questionnaire,
      `higher-frequency-persona-review-${personaIndex + 1}-phase-${phaseIndex}`,
      {
        phaseIndex,
        seed,
      }
    );
    const warnings = getProgramConstraintWarningBuffer().filter(
      (warning) => warning.programId === program.id
    );

    reports.push(renderProgram(entry, phaseIndex, program, warnings));
  });
});

console.log(reports.join("\n"));
