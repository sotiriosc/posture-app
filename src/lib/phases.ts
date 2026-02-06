export type PhasePlan = {
  name: string;
  weekIndex: number;
  weekCount: number;
  goal: string;
};

export type NextWeekPlan = {
  summary: string;
  change: string;
  reason: string;
};

type PhaseDefinition = {
  name: string;
  weekStart: number;
  weekEnd: number | null;
  goal: string;
};

const PHASES: PhaseDefinition[] = [
  {
    name: "Phase 1: Restore & Control",
    weekStart: 1,
    weekEnd: 2,
    goal: "mobility, activation, motor control, pain reduction",
  },
  {
    name: "Phase 2: Strength & Capacity",
    weekStart: 3,
    weekEnd: 6,
    goal: "progressive overload, capacity, technique",
  },
  {
    name: "Phase 3: Performance & Aesthetics",
    weekStart: 7,
    weekEnd: null,
    goal: "hypertrophy/strength bias based on goal",
  },
];

export const getPhaseForWeekIndex = (
  weekIndex: number,
  goal: string
): PhasePlan => {
  const safeWeek = Math.max(1, weekIndex);
  const match =
    PHASES.find(
      (phase) =>
        safeWeek >= phase.weekStart &&
        (phase.weekEnd ? safeWeek <= phase.weekEnd : true)
    ) ?? PHASES[0];

  const weekCount =
    match.weekEnd === null ? 0 : match.weekEnd - match.weekStart + 1;

  return {
    name: match.name,
    weekIndex: safeWeek,
    weekCount,
    goal: goal || match.goal,
  };
};

export const buildNextWeekPlan = (params: {
  complianceRate: number;
  painFlag: boolean;
  fatigueFlag: boolean;
  phaseName: string;
}): NextWeekPlan => {
  const { complianceRate, painFlag, fatigueFlag, phaseName } = params;

  if (painFlag) {
    return {
      summary:
        "Next week: regress intensity and prioritize comfortable movement.",
      change: "Reduce range or load on 1–2 exercises; add extra mobility.",
      reason: "Pain flagged last week—regress to keep this smooth.",
    };
  }

  if (fatigueFlag) {
    return {
      summary: "Next week: hold load and focus on control.",
      change: "Keep weights the same; aim for cleaner reps or tempo work.",
      reason: "Fatigue was high—hold load and refine technique.",
    };
  }

  if (complianceRate >= 0.75) {
    return {
      summary: "Next week: progress one variable on 1–2 lifts.",
      change: "Add 1–2 reps or a small load bump within your range.",
      reason: `Strong compliance in ${phaseName}.`,
    };
  }

  return {
    summary: "Next week: repeat this week and build consistency.",
    change: "Keep targets steady; focus on showing up.",
    reason: "Consistency first before adding stress.",
  };
};
