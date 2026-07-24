import type { ProgramDay } from "@/lib/types";
import type { MovementProfile } from "@/lib/movementProfile";
import type { UserTrainingState } from "@/lib/phases";
import { exerciseById } from "@/lib/exercises";

export type SessionAdaptation = {
  summary: string;
  reasons: string[];
  appliedChanges: string[];
  masteryNext: string[];
  dataSignals: string[];
  masteryChecks: string[];
};

const toPercent = (value: number) => `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;

const unique = <T,>(values: T[]) => Array.from(new Set(values));

const sectionLabel = (section?: string) => {
  if (section === "main") return "main lift";
  if (section === "activation") return "activation";
  if (section === "accessory") return "accessory";
  if (section === "warmup") return "warm-up";
  if (section === "cooldown") return "cooldown";
  return "session work";
};

const buildCheckpoint = (params: {
  section?: string;
  patterns: string[];
  loadType?: string;
  index: number;
}) => {
  const { section, patterns, loadType, index } = params;
  const has = (key: string) => patterns.includes(key);

  if (section === "warmup") {
    const options = [
      "breathing stays calm and even",
      "range opens gradually without forcing",
      "no pinch or sharp discomfort",
    ];
    return options[index % options.length];
  }
  if (section === "activation") {
    const options = [
      "core and scapula stay engaged before loading",
      "tempo stays crisp without compensating",
      "prep work turns on target muscles without pain",
    ];
    return options[index % options.length];
  }
  if (section === "cooldown") {
    const options = [
      "finish feeling looser than you started",
      "no guarding or compensation",
      "smooth breathing through full range",
    ];
    return options[index % options.length];
  }
  if (has("core") || has("anti-rotation") || has("anti-extension")) {
    return "trunk stays braced and level for full set";
  }
  if (has("hinge")) {
    return "hips drive the movement, spine stays neutral";
  }
  if (has("squat")) {
    return "knees track clean and depth stays controlled";
  }
  if (has("push")) {
    return loadType === "weighted"
      ? "bar path is stable and lockout remains smooth"
      : "body line stays solid through full range";
  }
  if (has("pull")) {
    return "shoulders stay down and reps finish with control";
  }
  if (section === "main") {
    const options = [
      "last reps match your first-rep technique",
      "tempo stays controlled from first to last set",
      "no form drift as effort rises",
    ];
    return options[index % options.length];
  }
  if (section === "accessory") {
    const options = [
      "full range with no momentum",
      "target muscle stays loaded the whole set",
      "clean tempo without rushing",
    ];
    return options[index % options.length];
  }
  return "movement quality stays consistent";
};

const buildMasteryPrompts = (week: ProgramDay[]) => {
  const prompts: string[] = [];
  week.forEach((day) => {
    day.routine.slice(0, 5).forEach((item, index) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return;
      const cue = (exercise.cues?.[0] ?? "Control each rep").replace(/\.$/, "");
      const checkpoint = buildCheckpoint({
        section: item.section,
        patterns: exercise.movementPattern,
        loadType: exercise.loadType,
        index,
      });
      prompts.push(
        `${day.title}: ${exercise.name} (${sectionLabel(item.section)}) - ${cue}; check: ${checkpoint}.`
      );
    });
  });
  const fromRoutine = unique(prompts);
  if (fromRoutine.length) return fromRoutine.slice(0, 4);
  return unique(
    week
      .flatMap((day) => day.focusTags.map((tag) => `${day.title}: master ${tag} with controlled reps and stable breathing.`))
      .slice(0, 4)
  );
};

export const buildSessionAdaptation = (params: {
  movementProfile: MovementProfile;
  trainingState?: UserTrainingState;
  changedSlots?: number;
  totalSlots?: number;
  week: ProgramDay[];
}) => {
  const { movementProfile, trainingState, changedSlots = 0, totalSlots = 0, week } =
    params;
  const changeRatio = totalSlots > 0 ? changedSlots / totalSlots : 0;

  const reasons: string[] = [];
  if (movementProfile.painRisk >= 0.55) {
    reasons.push("Pain-risk profile required more control-focused selections.");
  }
  if (movementProfile.asymmetry >= 0.45) {
    reasons.push("Asymmetry markers raised priority for unilateral/balance quality.");
  }
  if (trainingState?.readiness && trainingState.readiness >= 0.75) {
    reasons.push("Readiness was high enough to increase challenge safely.");
  } else if (trainingState?.fatigueRisk && trainingState.fatigueRisk >= 0.65) {
    reasons.push("Fatigue risk required stable loading and cleaner rep targets.");
  }
  if (changeRatio > 0.4) {
    reasons.push(
      `Program structure intentionally changed (${Math.round(changeRatio * 100)}% of slots) to prevent plateaus.`
    );
  }
  if (!reasons.length) {
    reasons.push("Plan held mostly stable to build repeatable movement quality.");
  }

  const appliedChanges = [
    `Readiness ${toPercent(movementProfile.readiness)} and consistency ${toPercent(
      movementProfile.consistency
    )} informed progression speed.`,
    changedSlots > 0 && totalSlots > 0
      ? `${changedSlots}/${totalSlots} exercise slots were remapped for this week.`
      : "Core day structure preserved while refining quality targets.",
    movementProfile.priorities.length
      ? `Top movement priorities: ${movementProfile.priorities.slice(0, 3).join(", ")}.`
      : "General movement balance retained.",
    trainingState?.trend
      ? `Training trend: ${trainingState.trend} (${trainingState.reason})`
      : "Trend baseline established from current block.",
  ];

  const masteryNext = buildMasteryPrompts(week);
  const dataSignals = [
    `Readiness ${toPercent(movementProfile.readiness)}`,
    `Consistency ${toPercent(movementProfile.consistency)}`,
    `Recovery ${toPercent(movementProfile.recovery)}`,
    `Pain risk ${toPercent(movementProfile.painRisk)}`,
    `Asymmetry ${toPercent(movementProfile.asymmetry)}`,
  ];
  const masteryChecks = [
    "Main lifts: no form breakdown on final 2 reps of each set.",
    "Accessory work: full range with consistent tempo and breathing.",
    movementProfile.painRisk >= 0.5
      ? "Symptoms remain stable or lower across the week."
      : "Session RPE remains productive without excessive fatigue carryover.",
  ];

  return {
    summary:
      changeRatio > 0.35
        ? "Next week emphasizes targeted variation plus tighter quality control."
        : "Next week keeps the base structure and tightens execution quality.",
    reasons,
    appliedChanges,
    masteryNext,
    dataSignals,
    masteryChecks,
  } as SessionAdaptation;
};
