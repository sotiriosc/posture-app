import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { UserTrainingState } from "@/lib/phases";

export type CurriculumPhase = "activation" | "skill" | "growth";

export type CurriculumDecision = { phase: CurriculumPhase; reason: string };

export type CurriculumPolicy = {
  tagWeights: Record<string, number>;
  progressiveDemandCap: "low" | "med" | "high";
  volumeBias: "low" | "med" | "high";
  notes: string[];
};

export function decideCurriculumPhase(args: {
  questionnaire: QuestionnaireData;
  trainingState?: UserTrainingState;
  userOptOutActivation?: boolean;
}): CurriculumDecision {
  const { questionnaire, trainingState, userOptOutActivation } = args;

  const experience = questionnaire.experience;
  const painCount = questionnaire.painAreas.length;
  const canUseSkill =
    userOptOutActivation === true &&
    (experience === "Intermediate" || experience === "Advanced") &&
    painCount <= 1;

  const qualifiesGrowth = Boolean(
    trainingState &&
      trainingState.consistency >= 0.8 &&
      trainingState.painRisk < 0.35 &&
      trainingState.fatigueRisk < 0.5 &&
      (trainingState.trend === "up" || trainingState.trend === "flat")
  );

  if (qualifiesGrowth) {
    return {
      phase: "growth",
      reason:
        "Selected growth because consistency, pain risk, fatigue risk, and trend all met progression-readiness thresholds.",
    };
  }

  if (canUseSkill) {
    return {
      phase: "skill",
      reason:
        "Selected skill because activation was opted out and prerequisites were met (experience Intermediate/Advanced with <=1 pain area).",
    };
  }

  return {
    phase: "activation",
    reason:
      "Defaulted to activation to prioritize motor control and stable movement foundations before higher-demand progression.",
  };
}

export function getCurriculumPolicy(phase: CurriculumPhase): CurriculumPolicy {
  if (phase === "growth") {
    return {
      tagWeights: {
        push: 1.2,
        pull: 1.2,
        squat: 1.15,
        hinge: 1.15,
        core: 1.05,
        mobility: 0.95,
        breath: 0.9,
        scap: 0.95,
      },
      progressiveDemandCap: "high",
      volumeBias: "high",
      notes: [
        "Bias toward higher progressive demand and weekly volume expansion.",
        "Maintain enough control/mobility tags to preserve movement quality.",
      ],
    };
  }

  if (phase === "skill") {
    return {
      tagWeights: {
        push: 1,
        pull: 1,
        squat: 1,
        hinge: 1,
        core: 1,
        mobility: 1,
        breath: 1,
        scap: 1,
        hips: 1,
      },
      progressiveDemandCap: "med",
      volumeBias: "med",
      notes: [
        "Balanced policy for skill acquisition with moderate progression.",
        "No dominant movement-tag bias; keep broad competency growth.",
      ],
    };
  }

  return {
    tagWeights: {
      breath: 1.25,
      breathing: 1.25,
      scap: 1.2,
      "t-spine": 1.15,
      hips: 1.15,
      balance: 1.1,
      core: 1.1,
      mobility: 1.1,
      push: 0.95,
      pull: 1,
      squat: 0.95,
      hinge: 1,
    },
    progressiveDemandCap: "low",
    volumeBias: "med",
    notes: [
      "Emphasize breathing/scapular/hip motor-control priorities.",
      "Keep progressive demand conservative while building movement quality.",
    ],
  };
}
