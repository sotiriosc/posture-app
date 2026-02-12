import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { ExerciseLog } from "@/lib/types";
import type { AssessmentReport } from "@/lib/assessmentEngine";

export type MovementPatternKey =
  | "squat"
  | "hinge"
  | "push"
  | "pull"
  | "core"
  | "mobility"
  | "balance"
  | "breathing";

export type MovementProfile = {
  generatedAt: string;
  readiness: number;
  recovery: number;
  consistency: number;
  painRisk: number;
  confidence: number;
  asymmetry: number;
  painSensitivity: Record<string, number>;
  skillScores: Record<MovementPatternKey, number>;
  priorities: string[];
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const baselineSkillScoreByExperience = (experience: string) => {
  if (experience === "Advanced") return 0.7;
  if (experience === "Intermediate") return 0.55;
  return 0.4;
};

const painWeights: Record<string, Array<[MovementPatternKey, number]>> = {
  neck: [
    ["mobility", -0.06],
    ["pull", -0.04],
    ["breathing", -0.05],
  ],
  "upper back": [
    ["pull", -0.08],
    ["mobility", -0.05],
    ["core", -0.03],
  ],
  "lower back": [
    ["hinge", -0.08],
    ["core", -0.09],
    ["balance", -0.03],
  ],
  shoulders: [
    ["push", -0.08],
    ["pull", -0.05],
    ["mobility", -0.05],
  ],
  hips: [
    ["hinge", -0.06],
    ["squat", -0.07],
    ["balance", -0.05],
  ],
  knees: [
    ["squat", -0.1],
    ["hinge", -0.04],
    ["balance", -0.05],
  ],
};

const scoreAsymmetry = (report?: AssessmentReport | null) => {
  if (!report?.observations?.length) return 0.2;
  const poseItems = report.observations.filter((item) => item.id.startsWith("pose-"));
  if (!poseItems.length) return 0.2;
  const confidenceWeight = poseItems.reduce((sum, item) => {
    if (item.confidence === "high") return sum + 0.3;
    if (item.confidence === "medium") return sum + 0.2;
    return sum + 0.1;
  }, 0);
  return clamp01(0.15 + confidenceWeight);
};

const computePainRiskFromLogs = (logs: ExerciseLog[]) => {
  if (!logs.length) return 0.2;
  const painCount = logs.filter((log) => log.felt === "pain").length;
  const hardCount = logs.filter((log) => log.felt === "hard").length;
  return clamp01((painCount * 0.6 + hardCount * 0.2) / logs.length);
};

const topPriorities = (skillScores: Record<MovementPatternKey, number>) =>
  (Object.entries(skillScores) as Array<[MovementPatternKey, number]>)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([key]) => key);

export const buildMovementProfile = (params: {
  questionnaire: QuestionnaireData;
  report?: AssessmentReport | null;
  recentLogs?: ExerciseLog[];
  consistencyRate?: number;
}) => {
  const { questionnaire, report, recentLogs = [], consistencyRate = 0 } = params;
  const baseline = baselineSkillScoreByExperience(questionnaire.experience);
  const skillScores: Record<MovementPatternKey, number> = {
    squat: baseline,
    hinge: baseline,
    push: baseline,
    pull: baseline,
    core: baseline,
    mobility: baseline,
    balance: baseline - 0.05,
    breathing: baseline - 0.03,
  };

  const painSensitivity: Record<string, number> = {};
  questionnaire.painAreas.forEach((area) => {
    const key = area.toLowerCase();
    painSensitivity[key] = clamp01((painSensitivity[key] ?? 0) + 0.7);
    (painWeights[key] ?? []).forEach(([pattern, delta]) => {
      skillScores[pattern] = clamp01(skillScores[pattern] + delta);
    });
  });

  const asymmetry = scoreAsymmetry(report);
  if (asymmetry > 0.45) {
    skillScores.balance = clamp01(skillScores.balance - 0.06);
    skillScores.core = clamp01(skillScores.core - 0.04);
  }

  const painRisk = clamp01(
    Math.max(
      computePainRiskFromLogs(recentLogs),
      questionnaire.painAreas.length ? 0.45 : 0.15
    )
  );
  const consistency = clamp01(consistencyRate);
  const recovery = clamp01(1 - painRisk * 0.6);
  const confidence = clamp01(
    baseline + consistency * 0.2 - painRisk * 0.15 + (questionnaire.experience === "Beginner" ? -0.05 : 0)
  );
  const readiness = clamp01(
    consistency * 0.35 +
      recovery * 0.25 +
      confidence * 0.2 +
      (1 - asymmetry) * 0.2 -
      painRisk * 0.2
  );

  return {
    generatedAt: new Date().toISOString(),
    readiness,
    recovery,
    consistency,
    painRisk,
    confidence,
    asymmetry,
    painSensitivity,
    skillScores,
    priorities: topPriorities(skillScores),
  } as MovementProfile;
};
