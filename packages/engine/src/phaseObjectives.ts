import { getPhaseProfile } from "@/lib/phases";
import type { MovementProfile } from "@/lib/movementProfile";

export type PhaseObjective = {
  title: string;
  objective: string;
  phaseFocus: string;
  primaryPatterns: string[];
  successMarkers: string[];
  guardrail: string;
  weekIntent: string;
  whyNow: string;
  riskWatchouts: string[];
  coachingPrompts: string[];
  metrics: {
    readiness: number;
    consistency: number;
    painRisk: number;
    asymmetry: number;
  };
};

const patternLabel: Record<string, string> = {
  squat: "squat pattern control",
  hinge: "hinge pattern control",
  push: "push mechanics",
  pull: "pull mechanics",
  core: "core bracing",
  mobility: "mobility quality",
  balance: "balance and asymmetry control",
  breathing: "breathing and ribcage control",
};

const unique = <T,>(values: T[]) => Array.from(new Set(values));

const topPatterns = (profile: MovementProfile) =>
  unique(
    profile.priorities
      .map((key) => patternLabel[key] ?? key)
      .filter(Boolean)
      .slice(0, 3)
  );

const toPercent = (value: number) =>
  `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;

const phaseLanguage = (key: string) => {
  if (key === "control") return "slow, precise control";
  if (key === "capacity") return "repeatable work capacity";
  if (key === "strength") return "high-tension strength output";
  if (key === "strength-volume") return "strength with added volume tolerance";
  if (key === "performance") return "powerful, crisp execution";
  if (key === "deload") return "recovery-focused quality";
  return "clean progressive execution";
};

export const buildPhaseObjective = (params: {
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
  movementProfile: MovementProfile;
}) => {
  const { phaseIndex, cycleIndex, weekIndex, movementProfile } = params;
  const profile = getPhaseProfile(phaseIndex);
  const primaryPatterns = topPatterns(movementProfile);
  const weekLabel = `Week ${Math.max(1, weekIndex)}`;
  const cycleLabel = `Cycle ${Math.max(1, cycleIndex)}`;
  const readinessLabel =
    movementProfile.readiness >= 0.75
      ? "high"
      : movementProfile.readiness >= 0.5
      ? "moderate"
      : "building";
  const weekIntent =
    profile.key === "control"
      ? "Refine mechanics and own positions under control."
      : profile.key === "capacity"
      ? "Expand repeatable work capacity without quality drop."
      : profile.key === "deload"
      ? "Recover strategically while preserving movement quality."
      : "Build higher-demand strength and coordination with precision.";

  const objective = `Build reliable ${primaryPatterns.join(", ")} with ${phaseLanguage(
    profile.key
  )} this week.`;
  const successMarkers = [
    "Complete all planned days with stable form quality.",
    movementProfile.painRisk >= 0.5
      ? "Keep pain signals at or below baseline while completing sessions."
      : "Finish main sets without pain flags.",
    readinessLabel === "high"
      ? "Progress one variable on 1-2 mains while preserving control."
      : "Hold loading steady and improve rep precision before adding demand.",
  ];
  const guardrail =
    movementProfile.painRisk >= 0.6
      ? "Pain risk is elevated: prioritize comfort and control over intensity."
      : movementProfile.asymmetry >= 0.45
      ? "Asymmetry is elevated: slow tempo and strict side-to-side quality."
      : "Move with control first; increase demand only when form stays stable.";
  const riskWatchouts = [
    movementProfile.painRisk >= 0.6
      ? "Avoid forcing range under pain; use regression when symptoms rise."
      : "Avoid chasing fatigue at the cost of clean reps.",
    movementProfile.asymmetry >= 0.45
      ? "Watch left/right drift, rotation, or uneven bracing."
      : "Watch tempo breakdown on final sets.",
    "If two sessions in a row feel unstable, hold progression next week.",
  ];
  const coachingPrompts = [
    `Primary focus patterns: ${primaryPatterns.join(" • ")}`,
    "Use controlled eccentric tempo and stable breathing on mains.",
    "Record one technical win and one correction after each session.",
  ];
  const whyNow = `Readiness is ${toPercent(
    movementProfile.readiness
  )} with consistency ${toPercent(
    movementProfile.consistency
  )}; this week emphasizes ${profile.label.toLowerCase()} while managing pain risk ${toPercent(
    movementProfile.painRisk
  )}.`;

  return {
    title: `${weekLabel} Objective`,
    objective,
    phaseFocus: `${cycleLabel} • ${profile.label}`,
    primaryPatterns,
    successMarkers,
    guardrail,
    weekIntent,
    whyNow,
    riskWatchouts,
    coachingPrompts,
    metrics: {
      readiness: movementProfile.readiness,
      consistency: movementProfile.consistency,
      painRisk: movementProfile.painRisk,
      asymmetry: movementProfile.asymmetry,
    },
  } as PhaseObjective;
};
