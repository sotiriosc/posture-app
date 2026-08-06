/**
 * Phase 8 — thin view-model helpers that ONLY reshape existing
 * resolveProgramPresentation / adaptation / coaching outputs.
 * No generation, eligibility, or template changes.
 */

import { getPhaseMetaByIndex, MAX_PHASE_INDEX } from "@/lib/phases";
import type {
  PresentationMessage,
  ProgramPresentationModel,
  SessionPresentationModel,
} from "./presentationContractTypes";
import { containsForbiddenInternalUiLanguage } from "./resolveAdaptationPresentation";

export type PlanRevealInfluencePoint = {
  id: string;
  label: string;
  detail: string;
  reason?: PresentationMessage["reason"];
};

export type PlanRevealDayNode = {
  dayIndex: number;
  title: string;
  purpose: string;
  expectedDuration: string;
  equipmentNeeded: string[];
  exerciseCount: number;
  status: "completed" | "not_started";
  movementSummary: string;
};

export type PlanRevealProgressionPreview = {
  headline: string;
  summary: string;
  nextPhaseLabel: string | null;
  conditions: string[];
};

export type PlanRevealModel = {
  phaseLabel: string;
  phasePurpose: string;
  frequencyLabel: string;
  expectedDuration: string;
  equipmentIdentity: string;
  equipmentIdentityMode: string;
  weekLabel: string;
  capabilityNotes: PresentationMessage[];
  criticalCapabilityNotes: PresentationMessage[];
  adaptationSummary: PresentationMessage[];
  influencePoints: PlanRevealInfluencePoint[];
  days: PlanRevealDayNode[];
  firstSession: SessionPresentationModel | null;
  progressionPreview: PlanRevealProgressionPreview;
  primaryCtaLabel: "Start Day 1";
  secondaryCtaLabel: "See why Praxis chose this";
  templateVersion: number;
};

const sanitizeUserFacing = (text: string): string => {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (containsForbiddenInternalUiLanguage(trimmed)) {
    return "Adjusted to match your confirmed setup and focus.";
  }
  return trimmed;
};

const influenceLabelForReason = (
  reason: PresentationMessage["reason"] | undefined
): string => {
  switch (reason) {
    case "reportedPain":
    case "sessionDiscomfort":
      return "Comfort focus";
    case "assessmentFocus":
      return "Movement focus";
    case "equipmentCapability":
      return "Equipment fit";
    case "progression":
      return "Progression path";
    case "phaseChange":
      return "Phase intent";
    case "personalPreference":
      return "Your preferences";
    case "weeklyBalance":
      return "Weekly balance";
    default:
      return "Plan focus";
  }
};

export const buildInfluencePoints = (
  model: ProgramPresentationModel,
  limit = 3
): PlanRevealInfluencePoint[] => {
  const messages = [
    ...model.program.adaptationSummary,
    ...model.program.capabilityNotes.filter((n) => n.severity === "caution" || n.severity === "safety"),
  ];
  const points: PlanRevealInfluencePoint[] = [];
  for (const message of messages) {
    const detail = sanitizeUserFacing(message.text);
    if (!detail) continue;
    points.push({
      id: message.id,
      label: influenceLabelForReason(message.reason),
      detail,
      reason: message.reason,
    });
    if (points.length >= limit) break;
  }
  if (!points.length) {
    points.push({
      id: "influence.equipment",
      label: "Equipment fit",
      detail: `Built for ${model.program.equipmentIdentity.toLowerCase()} with your confirmed weekly schedule.`,
      reason: "equipmentCapability",
    });
  }
  return points.slice(0, limit);
};

export const buildWeeklyPathDays = (
  model: ProgramPresentationModel
): PlanRevealDayNode[] =>
  model.sessions.map((session) => ({
    dayIndex: session.dayIndex,
    title: session.title,
    purpose: sanitizeUserFacing(session.purpose),
    expectedDuration: session.expectedDuration,
    equipmentNeeded: session.equipmentNeeded,
    exerciseCount: session.exerciseCount,
    status: session.completionLabel === "Completed" ? "completed" : "not_started",
    movementSummary:
      session.exerciseCount > 0
        ? `${session.exerciseCount} main exercises`
        : "Session details ready when you begin",
  }));

export const buildProgressionPreview = (
  model: ProgramPresentationModel
): PlanRevealProgressionPreview => {
  const phaseMatch = model.program.phaseLabel.match(/Phase\s+(\d+)/i);
  const phaseIndex = phaseMatch ? Number(phaseMatch[1]) : 1;
  const currentMeta = getPhaseMetaByIndex(phaseIndex);
  const atMax = phaseIndex >= MAX_PHASE_INDEX;
  const nextMeta = atMax ? null : getPhaseMetaByIndex(phaseIndex + 1);

  const conditions = [
    sanitizeUserFacing(currentMeta.goal),
    `Complete your ${model.program.frequencyLabel.toLowerCase()} consistently.`,
    atMax
      ? "Stay in this phase and keep execution quality high."
      : "Advance when session consistency and readiness criteria clear.",
  ].filter(Boolean);

  return {
    headline: "What comes next?",
    summary: atMax
      ? "You are in the final phase. Keep building strength and clean execution."
      : `After this phase: ${nextMeta?.phaseName ?? "the next phase"} — ${sanitizeUserFacing(
          nextMeta?.goal ?? "continued progress."
        )}`,
    nextPhaseLabel: nextMeta?.phaseName ?? null,
    conditions: conditions.slice(0, 3),
  };
};

/**
 * Reshape a resolved ProgramPresentationModel into the first-reveal hierarchy.
 * Does not call generation; does not invent equipment identity.
 */
export const buildPlanRevealModel = (
  model: ProgramPresentationModel
): PlanRevealModel => {
  const firstSession = model.sessions[0] ?? null;
  const expectedDuration =
    firstSession?.expectedDuration ?? "About 30 minutes";
  const criticalCapabilityNotes = model.program.capabilityNotes.filter(
    (note) => note.severity === "caution" || note.severity === "safety"
  );

  return {
    phaseLabel: model.program.phaseLabel,
    phasePurpose: sanitizeUserFacing(model.program.phasePurpose),
    frequencyLabel: model.program.frequencyLabel,
    expectedDuration,
    equipmentIdentity: model.program.equipmentIdentity,
    equipmentIdentityMode: model.program.equipmentIdentityMode,
    weekLabel: model.program.weekLabel,
    capabilityNotes: model.program.capabilityNotes,
    criticalCapabilityNotes,
    adaptationSummary: model.program.adaptationSummary.map((m) => ({
      ...m,
      text: sanitizeUserFacing(m.text),
    })),
    influencePoints: buildInfluencePoints(model),
    days: buildWeeklyPathDays(model),
    firstSession,
    progressionPreview: buildProgressionPreview(model),
    primaryCtaLabel: "Start Day 1",
    secondaryCtaLabel: "See why Praxis chose this",
    templateVersion: model.program.templateVersion,
  };
};

/** Critical controls that must never appear in SECTION_REGISTRY. */
export const PHASE8_CRITICAL_CONTROL_LABELS = [
  "Start Day 1",
  "Begin session",
  "Report discomfort",
  "Save discomfort",
  "Make it easier",
  "Swap exercise",
  "Skip exercise",
  "End session",
] as const;
