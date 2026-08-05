/**
 * Phase 7B — Canonical program presentation resolver (React-free).
 * Exercise-level coaching reuses Phase 6 resolveExerciseCoachingViewModel.
 */

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { formatPhaseName, getPhaseMetaByIndex } from "@/lib/phases";
import { deriveProgramCapabilities } from "@/lib/program/equipmentCapabilities";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import type { Program, ProgramDay, ProgramProgress } from "@/lib/types";
import { resolveExerciseCoachingViewModel } from "@/lib/coaching/resolveExerciseCoaching";

/** Fallback only — prefer Program.templateVersion from generation. */
const PRESENTATION_TEMPLATE_VERSION_FALLBACK = 18;
import { getProgramPresentationInventory } from "./programPresentationInventory";
import {
  resolveAssessmentFocusSummary,
  resolvePainAdaptationSummary,
} from "./resolveAdaptationPresentation";
import type {
  PresentationMessage,
  ProgramPresentationModel,
  SessionPresentationModel,
} from "./presentationContractTypes";

const EQUIPMENT_IDENTITY_LABEL: Record<string, string> = {
  gym: "Gym",
  dumbbells: "Dumbbells",
  bands: "Bands",
  bodyweight: "Bodyweight",
  mixedHome: "Mixed home",
};

export type ResolveProgramPresentationInput = {
  program: Program;
  questionnaire: QuestionnaireData;
  programProgress?: ProgramProgress | null;
  /** Confidence-qualified focus tags from assessment (already filtered). */
  assessmentFocusTags?: string[];
  assessmentFocusHighConfidence?: boolean;
};

const estimateSessionDurationMinutes = (day: ProgramDay): number => {
  const items = day.routine ?? [];
  let minutes = 8; // warmup/activation/cooldown baseline
  for (const item of items) {
    const sets = typeof item.sets === "number" ? item.sets : 2;
    const rest = typeof item.restSec === "number" ? item.restSec : 60;
    const work =
      typeof item.durationSec === "number"
        ? item.durationSec
        : Math.max(30, sets * 40);
    minutes += (work + rest * Math.max(0, sets - 1)) / 60;
  }
  return Math.max(20, Math.round(minutes / 5) * 5);
};

const formatDuration = (minutes: number) => `About ${minutes} minutes`;

export const resolveSessionPurpose = (day: ProgramDay): string => {
  const title = (day.title ?? "Session").trim();
  const tags = (day.focusTags ?? []).map((t) => t.trim()).filter(Boolean);
  if (tags.length) {
    return `${title}: emphasizes ${tags.slice(0, 2).join(" and ")}.`;
  }
  const lower = title.toLowerCase();
  if (lower.includes("full body")) {
    return `${title}: balanced push, pull, and lower-body practice.`;
  }
  if (lower.includes("upper") || lower.includes("push") || lower.includes("pull")) {
    return `${title}: upper-body strength and posture support.`;
  }
  if (lower.includes("lower") || lower.includes("legs") || lower.includes("hinge")) {
    return `${title}: lower-body strength and control.`;
  }
  if (lower.includes("shoulder") || lower.includes("arm")) {
    return `${title}: shoulder and arm control with posture support.`;
  }
  return `${title}: focused training for today's plan.`;
};

const equipmentNeededForDay = (
  day: ProgramDay,
  questionnaire: QuestionnaireData
): string[] => {
  const caps = deriveProgramCapabilities(questionnaire.equipment ?? [], {
    bandSetup: questionnaire.bandSetup,
  });
  const mode = resolvePrimaryProgramEquipmentMode(questionnaire.equipment ?? []);
  const needed = new Set<string>();
  for (const item of day.routine ?? []) {
    const ex = exerciseById(item.exerciseId);
    if (!ex) continue;
    for (const token of ex.equipment ?? []) {
      if (token === "none") continue;
      if (token === "gym" && caps.hasGymAccess) needed.add("Gym access");
      if (token === "dumbbells" && caps.hasDumbbells) needed.add("Dumbbells");
      if (token === "bands" && caps.hasBands) needed.add("Bands");
      if (token === "bench" && caps.hasBench) needed.add("Bench");
      if (token === "pullup_bar" && caps.hasPullupBar) needed.add("Pull-up bar");
      if (token === "machines" && caps.hasMachines) needed.add("Machines");
      if (token === "cables" && caps.hasCables) needed.add("Cables");
      if (token === "barbell" && caps.hasBarbell) needed.add("Barbell");
    }
  }
  if (!needed.size) {
    if (mode === "bodyweight") needed.add("Floor space");
    else needed.add(EQUIPMENT_IDENTITY_LABEL[mode] ?? "Confirmed equipment");
  }
  return Array.from(needed).sort((a, b) => a.localeCompare(b));
};

const setupRequirementsForDay = (
  day: ProgramDay,
  questionnaire: QuestionnaireData
): string[] => {
  const caps = deriveProgramCapabilities(questionnaire.equipment ?? [], {
    bandSetup: questionnaire.bandSetup,
  });
  const setup = new Set<string>();
  for (const item of day.routine ?? []) {
    const vm = resolveExerciseCoachingViewModel({
      exerciseId: item.exerciseId,
      item,
      capabilities: {
        hasBench: caps.hasBench,
        hasPullupBar: caps.hasPullupBar,
        bandSetupLane: caps.bandSetupConfirmed
          ? String(
              (questionnaire.bandSetup as { setupLane?: string } | undefined)
                ?.setupLane ?? ""
            )
          : null,
        equipment: questionnaire.equipment,
      },
    });
    for (const step of vm.setupSteps.slice(0, 1)) {
      if (/anchor|bench|pull-up|door|loop/i.test(step)) setup.add(step);
    }
  }
  if (caps.hasHighAnchor) setup.add("High band anchor available");
  if (caps.hasMidAnchor) setup.add("Mid band anchor available");
  if (caps.hasLowAnchor) setup.add("Low band anchor available");
  if (caps.hasDoorAnchor) setup.add("Door anchor available");
  if (caps.hasLoopBand && !caps.hasLongBand) setup.add("Loop bands");
  return Array.from(setup).slice(0, 6);
};

const buildCapabilityNotes = (
  questionnaire: QuestionnaireData
): PresentationMessage[] => {
  const caps = deriveProgramCapabilities(questionnaire.equipment ?? [], {
    bandSetup: questionnaire.bandSetup,
  });
  const mode = resolvePrimaryProgramEquipmentMode(questionnaire.equipment ?? []);
  const notes: PresentationMessage[] = [];
  if (mode === "bodyweight") {
    notes.push({
      id: "capability.bodyweight",
      reason: "equipmentCapability",
      text: "This plan uses floor and wall support with no external load tools confirmed.",
      severity: "info",
    });
  }
  if (mode === "bands" && !caps.bandSetupConfirmed) {
    notes.push({
      id: "capability.bandSetupUnknown",
      reason: "equipmentCapability",
      text: "Band type and anchors are limited until setup details are confirmed.",
      severity: "caution",
    });
  }
  if (mode === "bands" && caps.bandSetupConfirmed && !caps.hasHighAnchor && !caps.hasMidAnchor && !caps.hasLowAnchor && !caps.hasDoorAnchor) {
    notes.push({
      id: "capability.noAnchor",
      reason: "equipmentCapability",
      text: "This band plan avoids fixed-anchor exercises based on your setup.",
      severity: "info",
    });
  }
  return notes;
};

const buildAdaptationSummary = (
  input: ResolveProgramPresentationInput
): PresentationMessage[] => {
  const messages: PresentationMessage[] = [];
  const pain = resolvePainAdaptationSummary({
    painAreas: input.questionnaire.painAreas ?? [],
  });
  if (pain) messages.push(pain);

  const focus = resolveAssessmentFocusSummary({
    focusTags: input.assessmentFocusTags ?? [],
    highConfidence: Boolean(input.assessmentFocusHighConfidence),
  });
  if (focus) messages.push(focus);

  const adaptation = input.program.sessionAdaptation;
  if (adaptation?.summary?.trim()) {
    messages.push({
      id: "adaptation.sessionAdaptationSummary",
      reason: "weeklyBalance",
      text: adaptation.summary.trim(),
      severity: "info",
    });
  }
  return messages;
};

export const resolveProgramPresentation = (
  input: ResolveProgramPresentationInput
): ProgramPresentationModel => {
  const { program, questionnaire, programProgress } = input;
  const mode = resolvePrimaryProgramEquipmentMode(questionnaire.equipment ?? []);
  const phaseIndex = program.phaseIndex ?? programProgress?.phaseIndex ?? 1;
  const phaseMeta = getPhaseMetaByIndex(phaseIndex);
  const weekIndex = program.weekIndex ?? 1;
  const completed = new Set(programProgress?.completedDayIndices ?? []);

  const sessions: SessionPresentationModel[] = (program.week ?? []).map(
    (day, dayIndex) => {
      const durationMin = estimateSessionDurationMinutes(day);
      const executable = (day.routine ?? []).filter(
        (item) => item.section === "main" || item.section === "accessory"
      );
      const painMsg =
        (questionnaire.painAreas?.length ?? 0) > 0
          ? resolvePainAdaptationSummary({
              painAreas: questionnaire.painAreas ?? [],
            }) ?? undefined
          : undefined;
      return {
        dayIndex,
        title: day.title ?? `Day ${dayIndex + 1}`,
        purpose: resolveSessionPurpose(day),
        expectedDuration: formatDuration(durationMin),
        equipmentNeeded: equipmentNeededForDay(day, questionnaire),
        setupRequirements: setupRequirementsForDay(day, questionnaire),
        exerciseCount: executable.length,
        painAdaptation: painMsg,
        completionLabel: completed.has(dayIndex) ? "Completed" : "Not started",
      };
    }
  );

  return {
    program: {
      equipmentIdentity: EQUIPMENT_IDENTITY_LABEL[mode] ?? mode,
      equipmentIdentityMode: mode,
      frequencyLabel: `${program.daysPerWeek ?? questionnaire.daysPerWeek ?? sessions.length} days / week`,
      phaseLabel: formatPhaseName(phaseIndex),
      phasePurpose:
        program.phaseObjective?.objective?.trim() ||
        phaseMeta.goal ||
        "Build control and capacity for your current phase.",
      weekLabel: `Week ${weekIndex}`,
      weeklyStructure: sessions.map((s) => s.title),
      templateVersion:
        program.templateVersion ?? PRESENTATION_TEMPLATE_VERSION_FALLBACK,
      capabilityNotes: buildCapabilityNotes(questionnaire),
      adaptationSummary: buildAdaptationSummary(input),
    },
    sessions,
    relationships: getProgramPresentationInventory(),
  };
};

export const resolveExercisePresentation = resolveExerciseCoachingViewModel;
