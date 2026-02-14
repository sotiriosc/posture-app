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

const SEED = "fixed-seed";

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

const isLowerDay = (title: string, focusTags: string[]) => {
  const loweredTitle = title.toLowerCase();
  if (loweredTitle.includes("leg")) return true;
  const loweredTags = focusTags.map((tag) => tag.toLowerCase());
  return loweredTags.some((tag) =>
    ["legs", "lower", "quads", "hamstrings", "posterior", "glutes"].some((needle) =>
      tag.includes(needle)
    )
  );
};

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

  const caseLabel = `equipment=[${questionnaire.equipment.join(",")}] days=${questionnaire.daysPerWeek} experience=${questionnaire.experience} painAreas=[${
    questionnaire.painAreas.length ? questionnaire.painAreas.join(",") : "none"
  }]`;

  const program = generateWeeklyProgram(questionnaire, `matrix-${index + 1}`, {
    seed: SEED,
  });
  const audit = auditCurriculum(program);
  const capability = computeEquipmentCapability(questionnaire.equipment);

  const mainPerDay = program.week.map(
    (day) => day.routine.filter((item) => item.section === "main").length
  );
  const weightedMainByDay = program.week.map((day) =>
    day.routine.filter((item) => {
      if (item.section !== "main") return false;
      const exercise = requireExerciseById(item.exerciseId);
      return item.loadType === "weighted" || exercise.loadType === "weighted";
    }).length
  );
  const resistedMainByDay = program.week.map((day) =>
    day.routine.filter((item) => {
      if (item.section !== "main") return false;
      if (item.loadType === "weighted") return true;
      if (!capability.hasBand) return false;
      const exercise = requireExerciseById(item.exerciseId);
      return isBandEquipped(exercise.equipment);
    }).length
  );
  const extraMainCountByDay = program.week.map((day) =>
    day.routine.filter(
      (item) =>
        item.section === "main" &&
        (item.notes ?? "").toLowerCase().includes("3 sec eccentric")
    ).length
  );

  const checkIssues: string[] = [];

  if (program.week.length !== questionnaire.daysPerWeek) {
    checkIssues.push(
      `Week length mismatch: expected ${questionnaire.daysPerWeek}, got ${program.week.length}.`
    );
  }

  program.week.forEach((day) => {
    day.routine.forEach((item, routineIndex) => {
      if (!item.exerciseId) {
        checkIssues.push(
          `${day.title}: routine item ${routineIndex + 1} has empty exerciseId.`
        );
        return;
      }
      const resolved = requireExerciseById(item.exerciseId);
      if (!resolved?.id) {
        checkIssues.push(
          `${day.title}: routine item ${routineIndex + 1} could not resolve exerciseId "${item.exerciseId}".`
        );
      }
      if (!getExerciseById(item.exerciseId)) {
        checkIssues.push(
          `${day.title}: exercise "${item.exerciseId}" resolved via fallback only.`
        );
      }
    });

    const mainIds = day.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);
    const uniqueMainIds = new Set(mainIds);
    if (uniqueMainIds.size !== mainIds.length) {
      checkIssues.push(`${day.title}: duplicate main exerciseId detected.`);
    }
  });

  const noneOnly = !capability.hasLoad && !capability.hasBand;
  const bandOnly = !capability.hasLoad && capability.hasBand;
  const hasLoad = capability.hasLoad;

  if (noneOnly) {
    if (questionnaire.daysPerWeek === 3) {
      mainPerDay.forEach((count, dayIndex) => {
        if (count < 4) {
          checkIssues.push(
            `${program.week[dayIndex]?.title ?? `Day ${dayIndex + 1}`}: none-only expects >=4 main slots for 3-day split, got ${count}.`
          );
        }
      });
    } else {
      const loadedReference = generateWeeklyProgram(
        { ...questionnaire, equipment: ["gym"] },
        `matrix-${index + 1}-ref`,
        { seed: SEED }
      );
      mainPerDay.forEach((count, dayIndex) => {
        const baseCount =
          loadedReference.week[dayIndex]?.routine.filter(
            (item) => item.section === "main"
          ).length ?? 0;
        if (count < baseCount + 2) {
          checkIssues.push(
            `${program.week[dayIndex]?.title ?? `Day ${dayIndex + 1}`}: none-only expects >= base+2 mains (${baseCount + 2}), got ${count}.`
          );
        }
      });
    }

    if (weightedMainByDay.some((count) => count !== 0)) {
      checkIssues.push("none-only expects weightedMainByDay == 0.");
    }
  }

  if (bandOnly && hasEligibleBandMainCandidates(questionnaire)) {
    const daysWithResisted = resistedMainByDay.filter((count) => count >= 1).length;
    if (daysWithResisted < 2) {
      checkIssues.push(
        `band-only expects resistedMainByDay >=1 on at least 2 days, got ${daysWithResisted}.`
      );
    }
  }

  if (hasLoad) {
    weightedMainByDay.forEach((count, dayIndex) => {
      if (count < 1) {
        checkIssues.push(
          `${program.week[dayIndex]?.title ?? `Day ${dayIndex + 1}`}: load-capable case expects weightedMainByDay >=1.`
        );
      }
    });
    const lowerDays = program.week
      .map((day, dayIndex) => ({ day, dayIndex }))
      .filter(({ day }) => isLowerDay(day.title, day.focusTags));
    lowerDays.forEach(({ day, dayIndex }) => {
      if ((weightedMainByDay[dayIndex] ?? 0) < 2) {
        checkIssues.push(`${day.title}: gym case expects weightedMainByDay >=2.`);
      }
    });
  }

  const allIssues = [
    ...audit.issues.map((issue) => `audit: ${issue}`),
    ...checkIssues.map((issue) => `check: ${issue}`),
  ];
  const ok = allIssues.length === 0;

  if (ok) {
    passCount += 1;
  } else {
    failCount += 1;
  }

  console.log(
    `CASE ${index + 1}/${matrix.length} ${caseLabel}`
  );
  console.log(
    `${ok ? "PASS" : "FAIL"} main=${formatArr(mainPerDay)} weighted=${formatArr(
      weightedMainByDay
    )} resisted=${formatArr(resistedMainByDay)} extra=${formatArr(extraMainCountByDay)}`
  );
  if (!ok) {
    allIssues.forEach((issue) => console.log(`- ${issue}`));
  }
});

console.log(`SUMMARY pass=${passCount} fail=${failCount} total=${matrix.length}`);
if (failCount > 0) {
  process.exitCode = 1;
}
