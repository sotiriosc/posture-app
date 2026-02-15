import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { auditCurriculum } from "@/lib/debug/curriculumAudit";
import { getExerciseById, requireExerciseById } from "@/lib/exerciseCatalog";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
import { generateWeeklyProgram } from "@/lib/program";

type MatrixCase = {
  equipment: QuestionnaireData["equipment"];
  daysPerWeek: QuestionnaireData["daysPerWeek"];
  experience: QuestionnaireData["experience"];
  painAreas: QuestionnaireData["painAreas"];
};

const SEED = "engine-matrix-v2";
const EXPECTED_MAINS_BY_EXPERIENCE: Record<
  QuestionnaireData["experience"],
  number
> = {
  Beginner: 2,
  Intermediate: 3,
  Advanced: 4,
};

const matrix: MatrixCase[] = [];
const equipmentValues: QuestionnaireData["equipment"][] = [
  ["none"],
  ["bands"],
  ["gym"],
];
const daysPerWeekValues: QuestionnaireData["daysPerWeek"][] = [3, 4, 5];
const experienceValues: QuestionnaireData["experience"][] = [
  "Beginner",
  "Intermediate",
];
const painAreaValues: QuestionnaireData["painAreas"][] = [
  [],
  ["low_back"],
  ["shoulders", "neck"],
];

equipmentValues.forEach((equipment) => {
  daysPerWeekValues.forEach((daysPerWeek) => {
    experienceValues.forEach((experience) => {
      painAreaValues.forEach((painAreas) => {
        matrix.push({
          equipment,
          daysPerWeek,
          experience,
          painAreas,
        });
      });
    });
  });
});

const isBandEquipped = (equipment: string[]) =>
  equipment.some((item) => {
    const token = String(item).toLowerCase();
    return token === "bands" || token === "band";
  });

const hasEligibleBandMainCandidates = (questionnaire: QuestionnaireData) => {
  const candidateIds = [
    "split-stance-row",
    "band-row",
    "band-lat-pulldown",
    "band-rdl",
    "band-front-squat",
    "band-chest-press",
  ];
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  return candidateIds.some((id) => {
    const exercise = getExerciseById(id);
    if (!exercise) return false;
    if (exercise.category !== "main") return false;
    if (!isBandEquipped(exercise.equipment)) return false;
    return isExerciseEligible(exercise, available);
  });
};

const formatArr = (values: number[]) => values.join("/");

const buildProgramSignature = (
  program: ReturnType<typeof generateWeeklyProgram>
) =>
  program.week
    .map((day) =>
      [
        day.dayIndex,
        day.title,
        day.routine
          .map(
            (item) =>
              `${item.section}:${item.exerciseId}:${item.loadType}:${item.durationOrReps}`
          )
          .join("|"),
      ].join("::")
    )
    .join("||");

let passCount = 0;
let failCount = 0;

matrix.forEach((input, index) => {
  const questionnaire: QuestionnaireData = {
    goals: "Improve posture",
    painAreas: input.painAreas,
    experience: input.experience,
    equipment: input.equipment,
    daysPerWeek: input.daysPerWeek,
  };

  const caseLabel = `equipment=[${questionnaire.equipment.join(
    ","
  )}] days=${questionnaire.daysPerWeek} experience=${questionnaire.experience} painAreas=[${
    questionnaire.painAreas.length ? questionnaire.painAreas.join(",") : "none"
  }]`;

  const programA = generateWeeklyProgram(questionnaire, `matrix-${index + 1}`, {
    seed: SEED,
  });
  const programB = generateWeeklyProgram(questionnaire, `matrix-${index + 1}`, {
    seed: SEED,
  });
  const audit = auditCurriculum(programA);
  const capability = computeEquipmentCapability(questionnaire.equipment);

  const mainPerDay = programA.week.map(
    (day) => day.routine.filter((item) => item.section === "main").length
  );
  const weightedMainByDay = programA.week.map((day) =>
    day.routine.filter((item) => {
      if (item.section !== "main") return false;
      const exercise = requireExerciseById(item.exerciseId);
      return item.loadType === "weighted" || exercise.loadType === "weighted";
    }).length
  );
  const resistedMainByDay = programA.week.map((day) =>
    day.routine.filter((item) => {
      if (item.section !== "main") return false;
      if (item.loadType === "weighted") return true;
      if (!capability.hasBand) return false;
      const exercise = requireExerciseById(item.exerciseId);
      return isBandEquipped(exercise.equipment);
    }).length
  );

  const issues: string[] = [];

  if (buildProgramSignature(programA) !== buildProgramSignature(programB)) {
    issues.push("determinism check failed (same seed produced different week structure)");
  }

  if (programA.week.length !== questionnaire.daysPerWeek) {
    issues.push(
      `week length mismatch: expected ${questionnaire.daysPerWeek}, got ${programA.week.length}`
    );
  }

  if (!audit.ok) {
    audit.issues.forEach((issue) => issues.push(`audit: ${issue}`));
  }

  const expectedMainCount = EXPECTED_MAINS_BY_EXPERIENCE[questionnaire.experience];
  mainPerDay.forEach((count, dayIndex) => {
    if (count !== expectedMainCount) {
      issues.push(
        `${programA.week[dayIndex]?.title ?? `Day ${dayIndex + 1}`}: expected ${expectedMainCount} mains, got ${count}`
      );
    }
  });

  programA.week.forEach((day) => {
    const mainIds = day.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);
    if (new Set(mainIds).size !== mainIds.length) {
      issues.push(`${day.title}: duplicate main exerciseId detected`);
    }

    if (day.title !== "Back + Chest") return;
    const mainExercises = mainIds.map((id) => requireExerciseById(id));
    const hasPush = mainExercises.some((exercise) =>
      exercise.movementPattern.some((pattern) => pattern.toLowerCase() === "push")
    );
    const hasPull = mainExercises.some((exercise) =>
      exercise.movementPattern.some((pattern) => pattern.toLowerCase() === "pull")
    );
    if (!hasPush || !hasPull) {
      issues.push(
        `${day.title}: mains must include push>=1 and pull>=1 (got push=${hasPush ? 1 : 0}, pull=${hasPull ? 1 : 0})`
      );
    }
  });

  const noneOnly = !capability.hasLoad && !capability.hasBand;
  const bandOnly = !capability.hasLoad && capability.hasBand;
  const hasLoad = capability.hasLoad;

  if (noneOnly && weightedMainByDay.some((count) => count !== 0)) {
    issues.push("none-only case expects zero weighted main movements");
  }

  if (hasLoad) {
    weightedMainByDay.forEach((count, dayIndex) => {
      if (count < 1) {
        issues.push(
          `${programA.week[dayIndex]?.title ?? `Day ${dayIndex + 1}`}: load-capable case expects weightedMainByDay >=1`
        );
      }
    });
  }

  if (bandOnly && hasEligibleBandMainCandidates(questionnaire)) {
    const daysWithResisted = resistedMainByDay.filter((count) => count >= 1).length;
    if (daysWithResisted < 1) {
      issues.push("band-only case expects at least one resisted main day");
    }
  }

  const ok = issues.length === 0;
  if (ok) {
    passCount += 1;
  } else {
    failCount += 1;
  }

  console.log(`CASE ${index + 1}/${matrix.length} ${caseLabel}`);
  console.log(
    `${ok ? "PASS" : "FAIL"} main=${formatArr(mainPerDay)} weighted=${formatArr(
      weightedMainByDay
    )} resisted=${formatArr(resistedMainByDay)}`
  );
  if (!ok) {
    issues.forEach((issue) => console.log(`- ${issue}`));
  }
});

console.log(`SUMMARY pass=${passCount} fail=${failCount} total=${matrix.length}`);
if (failCount > 0) {
  process.exitCode = 1;
}
