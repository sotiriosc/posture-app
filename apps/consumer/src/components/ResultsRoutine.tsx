"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuestionnaireData } from "./QuestionnaireForm";
import { exerciseById } from "@praxis/engine";
import {
  buildEngineSignals,
  buildSignalsFromLocalState,
  generateProgram,
} from "@praxis/engine";
import {
  PROGRAM_TEMPLATE_VERSION,
} from "@praxis/engine";
import {
  normalizeEquipmentSelectionValues,
} from "@praxis/engine";
import { usePhotoContext } from "@/components/PhotoContext";
import {
  type PoseAnalysis,
} from "@praxis/engine";
import {
  type AssessmentReport,
} from "@praxis/engine";
import Button from "@/components/ui/Button";
import { loadAppState, saveAppState } from "@praxis/engine";
import { buildQuestionnaireSignature } from "@praxis/engine";
import type { Exercise } from "@praxis/engine";
import type {
  ExerciseLog,
  Program,
  ProgramProgress,
  ProgramRoutineItem,
  SessionRecord,
} from "@praxis/engine";
import {
  getProgramProgress,
  getLatestProgram,
  getProgram,
  listAllPrograms,
  listSessions,
  listExerciseLogsBySessionIds,
  saveProgram,
  saveProgramProgress,
  uuid,
} from "@praxis/engine";
import {
  MAX_PHASE_INDEX,
  buildNextWeekPlan,
  getPhaseMetaByIndex,
  getPhaseProfile,
} from "@praxis/engine";
import { clearDraftsByProgramId } from "@praxis/engine";
import {
  canAdvancePhase,
  formatPhaseGateReason,
  skipPhase1,
} from "@praxis/engine";
import {
  buildPhaseReadyDismissalKey,
  getPhaseControlUiState,
  getPhaseReadyNoticeState,
} from "@praxis/engine";
import { getDailyInsight } from "@praxis/engine";
import DashboardHero from "@/components/dashboard/DashboardHero";
import ProgressSummary from "@/components/dashboard/ProgressSummary";
import ExpandableSection from "@/components/dashboard/ExpandableSection";
import DashboardModeCard from "@/components/dashboard/DashboardModeCard";
import ProgramReferenceCard from "@/components/ProgramReferenceCard";
import RoutineItemCoachingDetails, {
  formatRoutineItemDose,
} from "@/components/RoutineItemCoachingDetails";
import { secondaryActionBtn } from "@/components/ui/buttonStyles";
import { SESSION_COMPLETE_EVENT } from "@praxis/engine";
import { formatNextSessionRecommendationFromSession } from "@praxis/engine";
import { formatSessionAdaptationPreviewFromFeedback } from "@praxis/engine";
import { formatSessionFeedbackCoachSummary } from "@praxis/engine";
import { useTrainingSyncStatus } from "@praxis/engine";
import { useResultsBootstrap } from "@/components/results/useResultsBootstrap";
import { usePoseAssessment } from "@/components/results/usePoseAssessment";
import { useResultsHistoryProgress } from "@/components/results/useResultsHistoryProgress";
import { useProgramGenerationReconciliation } from "@/components/results/useProgramGenerationReconciliation";
import AccountModePanel from "@/components/results/AccountModePanel";
import PhaseProgressionSection from "@/components/results/PhaseProgressionSection";
import WeekViewPanel, { type WeekViewDetailEntry } from "@/components/results/WeekViewPanel";
import InsightsPanel, { type KnowledgeCard } from "@/components/results/InsightsPanel";
import { buildProgramDashboardCopy } from "@/components/results/programDashboardSelectors";

const STORAGE_KEY = "posture_questionnaire";
const SESSION_COMPLETE_ACK_KEY = "results_last_seen_session_complete_at";
const DASHBOARD_UNLOCK_LEVEL_KEY = "praxis_dashboard_unlock_level";
const SHOW_TECHNICAL_PROGRAM_REFERENCE = process.env.NODE_ENV !== "production";
const SHOW_PHASE_PREVIEW_REFERENCE = false;

type DashboardMode =
  | "today"
  | "week"
  | "progress"
  | "insights"
  | "history"
  | "account";

type LevelUpNotice = {
  eyebrow: string;
  title: string;
  body: string;
};

type ProgramWeekDay = Program["week"][number];

const formatLegacyRoutineItemDose = (item: ProgramRoutineItem) =>
  item.reps
    ? `${item.sets ?? 1} x ${item.reps}`
    : item.durationSec
    ? `${item.sets ? `${item.sets} x ` : ""}${item.durationSec}s`
    : item.sets
    ? `${item.sets} sets`
    : null;

const formatRoutineItemPrescription = (item: ProgramRoutineItem) =>
  formatRoutineItemDose(item, formatLegacyRoutineItemDose(item));

function CurrentSavedProgramSnapshotLoadingCard({
  message = "Finalizing the plan reference.",
}: {
  message?: string;
}) {
  return (
    <section
      className="ui-card ui-soft-surface order-20 p-4 opacity-75 sm:p-5"
      data-testid="current-saved-week-loading-card"
      aria-live="polite"
    >
      <h3 className="text-base font-semibold text-white">
        Plan Reference
      </h3>
      <p className="mt-1 text-xs text-slate-400">{message}</p>
      <div
        className="mt-4 h-2 w-full overflow-hidden rounded-full border border-slate-500/30 bg-slate-950/60"
        role="progressbar"
        aria-label="Plan reference status"
      >
        <div
          className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-slate-500 via-sky-400 to-slate-400 opacity-70"
        />
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Ready when the plan reference is available.
      </p>
    </section>
  );
}

type AssessmentStatusTone = "photo" | "fallback" | "failed" | "loading";

type AssessmentStatusInfo = {
  tone: AssessmentStatusTone;
  title: string;
  body: string;
  chips: string[];
};

const photoViewLabelByKey: Record<string, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
};

const orderedPhotoViewKeys = ["front", "side", "back"];

const formatDetectedPhotoViews = (views: string[]) => {
  if (!views.length) return "none";
  return views.map((view) => photoViewLabelByKey[view] ?? view).join(" / ");
};

const formatConfidencePercent = (score: number | null | undefined) => {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  return `${Math.round(Math.max(0, Math.min(1, score)) * 100)}% confidence`;
};

const detectPoseAnalysisViews = (analysis: PoseAnalysis | null) => {
  if (!analysis) return [] as string[];
  const views = new Set<string>();
  analysis.observations.forEach((item) => {
    const match = item.match(/^(front|side|back):/i);
    if (match) views.add(match[1].toLowerCase());
  });
  const metricViewMap: Record<string, Array<keyof PoseAnalysis["metrics"]>> = {
    front: ["shoulderHeightDelta", "hipHeightDelta", "kneeAlignmentDelta"],
    side: ["headForwardOffset", "torsoLeanAngle", "hipToShoulderAlignment"],
    back: ["scapularSymmetry", "hipShift"],
  };
  Object.entries(metricViewMap).forEach(([view, metricKeys]) => {
    if (
      metricKeys.some((key) => {
        const value = analysis.metrics[key];
        return typeof value === "number" && Number.isFinite(value);
      })
    ) {
      views.add(view);
    }
  });
  return orderedPhotoViewKeys.filter((view) => views.has(view));
};

const detectAssessmentReportPhotoViews = (report: AssessmentReport | null) => {
  if (!report) return [] as string[];
  const views = new Set<string>();
  report.observations.forEach((observation) => {
    observation.evidence.forEach((item) => {
      const match = item.match(/^View:\s*(front|side|back)$/i);
      if (match) views.add(match[1].toLowerCase());
    });
  });
  return orderedPhotoViewKeys.filter((view) => views.has(view));
};

const hasPhotoDerivedAssessmentReport = (report: AssessmentReport | null) =>
  Boolean(
    report?.observations.some((observation) => {
      if (observation.id.startsWith("pose-")) return true;
      return observation.evidence.some((item) => {
        const lower = item.toLowerCase();
        return lower.startsWith("scan:") || lower.startsWith("view:");
      });
    })
  );

function AssessmentStatusCard({ status }: { status: AssessmentStatusInfo }) {
  const toneClasses: Record<AssessmentStatusTone, string> = {
    photo: "border-emerald-300/30 bg-emerald-400/10 text-emerald-50",
    fallback: "border-slate-500/25 bg-slate-950/42 text-slate-100",
    failed: "border-amber-300/30 bg-amber-400/10 text-amber-50",
    loading: "border-sky-300/30 bg-sky-400/10 text-sky-50",
  };
  const chipClasses: Record<AssessmentStatusTone, string> = {
    photo: "border-emerald-300/40 bg-emerald-300/10 text-emerald-100",
    fallback: "border-slate-500/35 bg-slate-900/70 text-slate-200",
    failed: "border-amber-300/40 bg-amber-300/10 text-amber-100",
    loading: "border-sky-300/40 bg-sky-300/10 text-sky-100",
  };

  return (
    <section
      className={`ui-card order-2 border px-4 py-3 sm:px-5 ${toneClasses[status.tone]}`}
      data-testid="assessment-status-card"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
            Assessment Status
          </p>
          <h2 className="mt-1 text-base font-semibold">{status.title}</h2>
          <p className="mt-1 text-sm leading-5 opacity-85">{status.body}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5 sm:max-w-xs sm:justify-end">
          {status.chips.map((chip) => (
            <span
              key={chip}
              className={`rounded-md border px-2 py-1 text-xs font-medium ${chipClasses[status.tone]}`}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const formatReferencePrepItems = (
  items?: Array<{ name: string; reps?: string; durationSec?: number }>
) => {
  if (!items?.length) return "none";
  return items
    .map((item) => {
      const prescription = item.reps ?? (item.durationSec ? `${item.durationSec}s` : null);
      return prescription ? `${item.name} (${prescription})` : item.name;
    })
    .join(", ");
};

const formatReferenceRoutineItems = (
  items: ProgramRoutineItem[],
  options?: { includeDebug?: boolean }
) => {
  if (!items.length) return "none";
  return items
    .map((item) => {
      const exercise = exerciseById(item.exerciseId);
      const name = exercise?.name ?? item.exerciseId;
      const prescription = formatRoutineItemPrescription(item);
      const base = prescription ? `${name} [${prescription}]` : name;
      if (!options?.includeDebug || !item.selectionDebug) return base;
      const debugParts = [
        item.selectionDebug.source ? `source=${item.selectionDebug.source}` : null,
        item.selectionDebug.slotKind ? `slot=${item.selectionDebug.slotKind}` : null,
        item.selectionDebug.slotLane ? `lane=${item.selectionDebug.slotLane}` : null,
      ].filter(Boolean);
      return debugParts.length ? `${base} {${debugParts.join(", ")}}` : base;
    })
    .join(", ");
};

type ProgramPrepItem = { name: string; reps?: string; durationSec?: number };

const buildReferenceLinesForDay = (
  day: ProgramWeekDay,
  options?: { includeDebug?: boolean }
) => {
  const dayWithCorrective = day as ProgramWeekDay & {
    corrective?: { items?: ProgramPrepItem[] };
  };
  const warmupText =
    day.warmup?.items?.length
      ? formatReferencePrepItems(day.warmup.items)
      : formatReferenceRoutineItems(
          day.routine.filter((item) => item.section === "warmup"),
          options
        );
  const correctiveText = dayWithCorrective.corrective?.items?.length
    ? formatReferencePrepItems(dayWithCorrective.corrective.items)
    : day.activation?.items?.length
    ? formatReferencePrepItems(day.activation.items)
    : formatReferenceRoutineItems(
        day.routine.filter((item) => item.section === "activation"),
        options
      );
  const cooldownText =
    day.cooldown?.items?.length
      ? formatReferencePrepItems(day.cooldown.items)
      : formatReferenceRoutineItems(
          day.routine.filter((item) => item.section === "cooldown"),
          options
        );
  const mainText = formatReferenceRoutineItems(
    day.routine.filter((item) => item.section === "main"),
    options
  );
  const accessoryText = formatReferenceRoutineItems(
    day.routine.filter((item) => item.section === "accessory"),
    options
  );
  return [
    `Day ${day.dayIndex + 1}: ${day.title}`,
    `Warm-up: ${warmupText}`,
    `Corrective: ${correctiveText}`,
    `Routine: ${mainText}`,
    `Accessory: ${accessoryText}`,
    `Cooldown: ${cooldownText}`,
  ];
};

const buildMainLayoutSignature = (program: Program) =>
  program.week
    .map((day) =>
      [
        `day${day.dayIndex + 1}`,
        day.routine
          .filter((item) => item.section === "main")
          .map((item) => item.exerciseId)
          .join(","),
      ].join(":")
    )
    .join(" | ");

type ProgressionInspectionPhaseSnapshot = {
  phaseIndex: number;
  phaseName: string;
  description: string;
  source: "saved_current_phase" | "generated_inspection_phase" | "unavailable";
  program?: Program | null;
  error?: string | null;
  seed?: string | null;
  settingsHash?: string | null;
};

const formatPhaseMetrics = (program: Program) => {
  const metrics = program.phaseObjective?.metrics;
  if (!metrics) return null;
  return [
    `readiness=${Math.round(metrics.readiness * 100)}%`,
    `consistency=${Math.round(metrics.consistency * 100)}%`,
    `painRisk=${Math.round(metrics.painRisk * 100)}%`,
    `asymmetry=${Math.round(metrics.asymmetry * 100)}%`,
  ].join(", ");
};

const buildPhaseSnapshotLines = (
  snapshot: ProgressionInspectionPhaseSnapshot,
  currentSavedPhaseIndex: number
) => {
  const lines: string[] = [];
  const sourceLabel =
    snapshot.source === "saved_current_phase"
      ? "CURRENT SAVED PHASE"
      : snapshot.source === "generated_inspection_phase"
      ? "GENERATED INSPECTION PHASE - NOT SAVED"
      : "UNAVAILABLE";

  lines.push(`PHASE ${snapshot.phaseIndex}: ${snapshot.phaseName} [${sourceLabel}]`);
  lines.push(`Description: ${snapshot.description}`);

  if (!snapshot.program) {
    lines.push(`Status: ${snapshot.error ?? "phase snapshot unavailable"}`);
    return lines;
  }

  const phaseProgram = snapshot.program;
  const phaseObjective = phaseProgram.phaseObjective;
  const phaseIndex =
    phaseProgram.phaseIndex ?? phaseProgram.phase?.phaseIndex ?? snapshot.phaseIndex;
  const phaseName =
    phaseProgram.phaseName ?? phaseProgram.phase?.name ?? snapshot.phaseName;
  const metrics = formatPhaseMetrics(phaseProgram);

  lines.push(`Program ID: ${phaseProgram.id}`);
  lines.push(`Source: ${snapshot.source}`);
  if (snapshot.seed) {
    lines.push(`Inspection Seed: ${snapshot.seed}`);
  }
  if (snapshot.settingsHash) {
    lines.push(`Settings Hash: ${snapshot.settingsHash}`);
  }
  lines.push(`Template Version: ${phaseProgram.templateVersion ?? "unknown"}`);
  lines.push(`Phase: ${phaseName} (index ${phaseIndex})`);
  lines.push(`Cycle Index: ${phaseProgram.cycleIndex ?? phaseProgram.phase?.cycleIndex ?? 1}`);
  lines.push(`Week Index: ${phaseProgram.weekIndex ?? phaseProgram.phase?.weekIndex ?? 1}`);
  if (phaseProgram.totalWeekIndex) {
    lines.push(`Total Week Index: ${phaseProgram.totalWeekIndex}`);
  }
  lines.push(`Main Layout Signature: ${buildMainLayoutSignature(phaseProgram)}`);
  if (phaseObjective) {
    lines.push(`Objective: ${phaseObjective.objective}`);
    lines.push(`Focus: ${phaseObjective.phaseFocus}`);
    lines.push(`Week Intent: ${phaseObjective.weekIntent}`);
    lines.push(`Guardrail: ${phaseObjective.guardrail}`);
    if (metrics) lines.push(`Metrics: ${metrics}`);
  }
  if (snapshot.phaseIndex !== currentSavedPhaseIndex) {
    lines.push("Inspection Note: generated for comparison only; this was not saved over the active program.");
  }
  lines.push("");

  [...phaseProgram.week]
    .sort((left, right) => left.dayIndex - right.dayIndex)
    .forEach((day, index, days) => {
      lines.push(...buildReferenceLinesForDay(day, { includeDebug: true }));
      if (index < days.length - 1) lines.push("");
    });

  return lines;
};

const buildCurrentSavedWeekSnapshotText = (params: {
  program: Program;
  questionnaire: QuestionnaireData | null;
  generationMode?: string | null;
  initialVariationSeed?: string | null;
  phaseSnapshots?: ProgressionInspectionPhaseSnapshot[];
}) => {
  const { program, questionnaire, generationMode, initialVariationSeed, phaseSnapshots } = params;
  const lines: string[] = [];
  const normalizedQuestionnaire = questionnaire
    ? {
        ...questionnaire,
        daysPerWeek: normalizeDaysPerWeek(questionnaire.daysPerWeek),
        equipment: normalizeEquipmentSelectionValues(questionnaire.equipment),
      }
    : null;
  const phaseIndex = program.phaseIndex ?? program.phase?.phaseIndex ?? 1;
  const phaseName =
    program.phaseName ?? program.phase?.name ?? getPhaseMetaByIndex(phaseIndex).phaseName;

  if (normalizedQuestionnaire) {
    lines.push("QUESTIONNAIRE INPUTS");
    lines.push(`Goal: ${normalizedQuestionnaire.goals}`);
    lines.push(`Experience: ${normalizedQuestionnaire.experience}`);
    lines.push(`Days Per Week: ${normalizedQuestionnaire.daysPerWeek}`);
    lines.push(`Equipment: ${formatQuestionnaireList(normalizedQuestionnaire.equipment)}`);
    lines.push(`Pain Areas: ${formatQuestionnaireList(normalizedQuestionnaire.painAreas)}`);
    lines.push("");
  }

  lines.push("CURRENT SAVED WEEK (LIVE PROGRAM SNAPSHOT)");
  lines.push(`Program ID: ${program.id}`);
  if (generationMode) {
    lines.push(`Generation Mode: ${generationMode}`);
  }
  if (initialVariationSeed) {
    lines.push(`Initial Live Variation Slot: ${initialVariationSeed}`);
  }
  lines.push(`Phase: ${phaseName} (index ${phaseIndex})`);
  lines.push(`Cycle Index: ${program.cycleIndex ?? program.phase?.cycleIndex ?? 1}`);
  lines.push(`Week Index: ${program.weekIndex ?? program.phase?.weekIndex ?? 1}`);
  if (program.totalWeekIndex) {
    lines.push(`Total Week Index: ${program.totalWeekIndex}`);
  }
  lines.push(`Template Version: ${program.templateVersion ?? "unknown"}`);
  lines.push(`Main Layout Signature: ${buildMainLayoutSignature(program)}`);
  lines.push("");
  if (program.phaseObjective) {
    lines.push("CURRENT PHASE OBJECTIVE");
    lines.push(`Title: ${program.phaseObjective.title}`);
    lines.push(`Objective: ${program.phaseObjective.objective}`);
    lines.push(`Focus: ${program.phaseObjective.phaseFocus}`);
    lines.push(`Week Intent: ${program.phaseObjective.weekIntent}`);
    lines.push(`Why Now: ${program.phaseObjective.whyNow}`);
    lines.push(`Guardrail: ${program.phaseObjective.guardrail}`);
  }
  lines.push("");

  [...program.week]
    .sort((left, right) => left.dayIndex - right.dayIndex)
    .forEach((day, index, days) => {
      lines.push(...buildReferenceLinesForDay(day, { includeDebug: true }));
      if (index < days.length - 1) lines.push("");
    });

  if (phaseSnapshots?.length) {
    lines.push("");
    lines.push("FULL PROGRESSION SNAPSHOT (SAVED CURRENT PHASE + INSPECTION PHASES)");
    lines.push(
      "Use this section to compare phase intent, main layouts, prep, accessories, cooldown, and debug provenance across the full generated progression."
    );
    lines.push(
      "Only the current phase is the saved live program; inspection phases are generated for review and are not persisted."
    );
    lines.push("");
    phaseSnapshots.forEach((snapshot, index) => {
      lines.push(...buildPhaseSnapshotLines(snapshot, phaseIndex));
      if (index < phaseSnapshots.length - 1) lines.push("");
    });
  }

  return lines.join("\n");
};

const buildProgressionInspectionPhaseSnapshots = (params: {
  program: Program;
  questionnaire: QuestionnaireData | null;
  poseAnalysis?: PoseAnalysis | null;
  assessmentReport?: AssessmentReport | null;
  programProgress?: ProgramProgress | null;
  initialVariationSeed?: string | null;
}): ProgressionInspectionPhaseSnapshot[] => {
  const {
    program,
    questionnaire,
    poseAnalysis,
    assessmentReport,
    programProgress,
    initialVariationSeed,
  } = params;
  const currentPhaseIndex = program.phaseIndex ?? program.phase?.phaseIndex ?? 1;
  const normalizedQuestionnaire = questionnaire
    ? {
        ...questionnaire,
        daysPerWeek: normalizeDaysPerWeek(questionnaire.daysPerWeek),
        equipment: normalizeEquipmentSelectionValues(questionnaire.equipment),
      }
    : null;

  return Array.from({ length: MAX_PHASE_INDEX }, (_, index) => {
    const phaseIndex = index + 1;
    const phaseMeta = getPhaseMetaByIndex(phaseIndex);
    const phaseProfile = getPhaseProfile(phaseIndex);

    if (phaseIndex === currentPhaseIndex) {
      return {
        phaseIndex,
        phaseName: phaseMeta.phaseName,
        description: phaseProfile.description,
        source: "saved_current_phase",
        program,
      };
    }

    if (!normalizedQuestionnaire) {
      return {
        phaseIndex,
        phaseName: phaseMeta.phaseName,
        description: phaseProfile.description,
        source: "unavailable",
        program: null,
        error: "questionnaire inputs unavailable",
      };
    }

    try {
      const phaseSignals = buildEngineSignals({
        questionnaire: normalizedQuestionnaire,
        poseAnalysis: poseAnalysis ?? null,
        assessmentReport: assessmentReport ?? null,
        history: {
          sessions: [],
          exerciseLogs: [],
          programProgress: programProgress ?? null,
        },
        nowIso: program.createdAt ?? new Date().toISOString(),
      });
      const phaseResult = generateProgram({
        mode: "weekly",
        signals: phaseSignals,
        nextProgramId: `${program.id}-progression-inspection-phase-${phaseIndex}`,
        phaseIndex,
        cycleIndex: 1,
        weekIndex: 1,
        totalWeekIndex: phaseIndex,
        initialVariationSeed: initialVariationSeed ?? program.id,
      });

      if (!("program" in phaseResult)) {
        return {
          phaseIndex,
          phaseName: phaseMeta.phaseName,
          description: phaseProfile.description,
          source: "unavailable",
          program: null,
          error: phaseResult.message,
        };
      }

      return {
        phaseIndex,
        phaseName: phaseMeta.phaseName,
        description: phaseProfile.description,
        source: "generated_inspection_phase",
        program: phaseResult.program,
        seed: phaseResult.seed,
        settingsHash: phaseResult.debug.settingsHash,
      };
    } catch (error) {
      return {
        phaseIndex,
        phaseName: phaseMeta.phaseName,
        description: phaseProfile.description,
        source: "unavailable",
        program: null,
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate inspection phase snapshot.",
      };
    }
  });
};

const normalizeDaysPerWeek = (value: unknown): 3 | 4 | 5 => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? Number(value)
      : NaN;
  return parsed === 4 || parsed === 5 ? parsed : 3;
};

const formatQuestionnaireToken = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatQuestionnaireList = (values: string[] | null | undefined) => {
  if (!values?.length) return "none";
  const formatted = values
    .map((entry) => formatQuestionnaireToken(entry))
    .filter((entry) => entry.length > 0);
  return formatted.length ? formatted.join(", ") : "none";
};

const toEpochMs = (value: string | null | undefined) => {
  if (!value) return NaN;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? NaN : parsed;
};

const parseDayIndexFromSession = (session: SessionRecord) => {
  const match = session.notes?.match(/dayIndex:(\d+)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const deriveWorkoutsCompletedInPhase = (
  sessions: SessionRecord[],
  phaseStartedAt: string | null | undefined
) => {
  const phaseStartedAtMs = toEpochMs(phaseStartedAt);
  return sessions.filter((session) => {
    if (!session.completedAt) return false;
    if (Number.isNaN(phaseStartedAtMs)) return true;
    const completedAtMs = toEpochMs(session.completedAt);
    return !Number.isNaN(completedAtMs) && completedAtMs >= phaseStartedAtMs;
  }).length;
};

const hasValidWeekStructure = (program: Program) => {
  const targetDays = program.daysPerWeek;
  if (!Array.isArray(program.week) || program.week.length !== targetDays) {
    return false;
  }
  const dayIndexes = new Set(program.week.map((day) => day.dayIndex));
  if (dayIndexes.size !== targetDays) return false;
  for (let index = 0; index < targetDays; index += 1) {
    if (!dayIndexes.has(index)) return false;
  }
  return true;
};

const hasRoutableWorkoutDay = (program: Program | null, dayIndex: number) => {
  if (!program) return false;
  const day = program.week.find((entry) => entry.dayIndex === dayIndex);
  return Boolean(day && Array.isArray(day.routine) && day.routine.length > 0);
};

const resolveFirstRoutableDay = (program: Program | null) => {
  if (!program) return 0;
  const first = program.week.find(
    (day) => Array.isArray(day.routine) && day.routine.length > 0
  );
  return first?.dayIndex ?? 0;
};

const isProgramCompatibleWithQuestionnaire = (
  candidate: Program | null,
  questionnaire: QuestionnaireData,
  options: {
    questionnaireSignature?: string | null;
    savedQuestionnaireSignature?: string | null;
  } = {}
) => {
  if (!candidate) return false;
  const expectedSignature =
    options.questionnaireSignature ?? buildQuestionnaireSignature(questionnaire);
  const persistedSignature =
    typeof candidate.questionnaireSignature === "string" && candidate.questionnaireSignature
      ? candidate.questionnaireSignature
      : options.savedQuestionnaireSignature ?? null;
  return (
    candidate.templateVersion === PROGRAM_TEMPLATE_VERSION &&
    candidate.daysPerWeek === questionnaire.daysPerWeek &&
    candidate.goalTrack === questionnaire.goals &&
    persistedSignature === expectedSignature &&
    hasValidWeekStructure(candidate)
  );
};

const attachQuestionnaireSignatureToProgram = (
  program: Program,
  questionnaireSignature: string
): Program => ({
  ...program,
  questionnaireSignature,
});

const formatProgramGenerationIssue = (error: unknown) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return "Unable to generate a weekly program from the current profile.";
};

export default function ResultsRoutine() {
  const router = useRouter();
  const {
    data,
    isReady,
    authEnabled,
    plan,
    nowAnchor,
    remoteAssessment,
  } = useResultsBootstrap({ storageKey: STORAGE_KEY });
  const { photos } = usePhotoContext();
  const poseState = usePoseAssessment({ photos, data, remoteAssessment });
  const trainingSyncStatus = useTrainingSyncStatus();
  const [program, setProgram] = useState<Program | null>(null);
  const [programLoadIssue, setProgramLoadIssue] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [progress, setProgress] = useState<ProgramProgress | null>(null);
  const [allSessions, setAllSessions] = useState<SessionRecord[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [activeProgramBaselineAt, setActiveProgramBaselineAt] = useState(0);
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [advanceConfirm, setAdvanceConfirm] = useState(false);
  const [advanceMessage, setAdvanceMessage] = useState<string | null>(null);
  const [skipPhaseOneOpen, setSkipPhaseOneOpen] = useState(false);
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(false);
  const [knowledgeHighlighted, setKnowledgeHighlighted] = useState(false);
  const [systemAdjustmentsExpanded, setSystemAdjustmentsExpanded] = useState(false);
  const [showSessionCompleteNotice, setShowSessionCompleteNotice] = useState(false);
  const [sessionCompleteNoticeFading, setSessionCompleteNoticeFading] = useState(false);
  const [phaseReadyNoticeOpen, setPhaseReadyNoticeOpen] = useState(false);
  const [programReferenceOpen, setProgramReferenceOpen] = useState(false);
  const [currentWeekCopyStatus, setCurrentWeekCopyStatus] = useState<string | null>(null);
  const [weekViewDetailsOpen, setWeekViewDetailsOpen] = useState(false);
  const [weekViewSelectedDay, setWeekViewSelectedDay] = useState<number | null>(
    null
  );
  const [knowledgeDetailExpanded, setKnowledgeDetailExpanded] = useState<{
    movement: boolean;
    stability: boolean;
    compensation: boolean;
    adaptation: boolean;
  }>({
    movement: false,
    stability: false,
    compensation: false,
    adaptation: false,
  });
  const [lastTwoLogs, setLastTwoLogs] = useState<ExerciseLog[]>([]);
  const [activeMode, setActiveMode] = useState<DashboardMode>("week");
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [resetProgressConfirmOpen, setResetProgressConfirmOpen] = useState(false);
  const [resetProgressWorking, setResetProgressWorking] = useState(false);
  const [resetProgressMessage, setResetProgressMessage] = useState<string | null>(null);
  const [levelUpNotice, setLevelUpNotice] = useState<LevelUpNotice | null>(null);
  const knowledgeSectionRef = useRef<HTMLDivElement | null>(null);
  const systemAdjustmentsSectionRef = useRef<HTMLDivElement | null>(null);
  const weekViewSectionRef = useRef<HTMLElement | null>(null);
  const weekViewDetailsRef = useRef<HTMLDivElement | null>(null);
  const knowledgeHighlightTimeoutRef = useRef<number | null>(null);
  const sessionCompleteNoticeFadeTimeoutRef = useRef<number | null>(null);
  const sessionCompleteNoticeTimeoutRef = useRef<number | null>(null);
  const levelUpNoticeTimeoutRef = useRef<number | null>(null);
  const previousUnlockLevelRef = useRef<number | null>(null);
  const previousCelebratedPhaseRef = useRef<number | null>(null);
  const missingWorkoutRepairAttemptRef = useRef(new Set<string>());
  const programProgressSnapshotRef = useRef<Program | null>(null);
  const {
    initialProgramLoadPending,
    setInitialProgramLoadPending,
    reconcileProgramPending,
    setReconcileProgramPending,
    settledProgramId,
    initialProgramLoadInFlightRef,
    initialProgramLoadSignatureRef,
    beginProgramGenerationRequest,
    isLatestProgramGenerationRequest,
    markProgramSettled,
  } = useProgramGenerationReconciliation();
  const dataRef = useRef<QuestionnaireData | null>(null);
  const poseAnalysisRef = useRef<PoseAnalysis | null>(null);
  const assessmentReportRef = useRef<AssessmentReport | null>(null);
  dataRef.current = data;
  poseAnalysisRef.current = poseState.analysis;
  assessmentReportRef.current = poseState.report;
  const programId = program?.id ?? null;
  if (program && programProgressSnapshotRef.current?.id !== program.id) {
    programProgressSnapshotRef.current = program;
  }
  const triggerSessionCompleteNotice = () => {
    setSessionCompleteNoticeFading(false);
    setShowSessionCompleteNotice(true);
  };

  const showLevelUpNotice = useCallback((notice: LevelUpNotice) => {
    if (levelUpNoticeTimeoutRef.current !== null) {
      window.clearTimeout(levelUpNoticeTimeoutRef.current);
    }
    setLevelUpNotice(notice);
    levelUpNoticeTimeoutRef.current = window.setTimeout(() => {
      setLevelUpNotice(null);
      levelUpNoticeTimeoutRef.current = null;
    }, 4400);
  }, []);

  const loadGenerationSignals = useCallback(
    async (programId?: string | null) => {
      const questionnaire = dataRef.current;
      if (!questionnaire) {
        throw new Error("Questionnaire data is unavailable.");
      }
      return buildSignalsFromLocalState({
        programId,
        questionnaire,
        poseAnalysis: poseAnalysisRef.current ?? null,
        assessmentReport: assessmentReportRef.current ?? null,
        nowIso: new Date().toISOString(),
      });
    },
    []
  );

  const questionnaireSignature = useMemo(() => {
    if (!data) return null;
    return buildQuestionnaireSignature(data);
  }, [data]);
  const programGenerationInputsReady = Boolean(
    data && questionnaireSignature && (poseState.report || poseState.error)
  );
  const uploadedPhotoViews = useMemo(
    () =>
      orderedPhotoViewKeys.filter(
        (view) => Boolean(photos[view as keyof typeof photos])
      ),
    [photos]
  );
  const detectedPoseViews = useMemo(() => {
    const fromAnalysis = detectPoseAnalysisViews(poseState.analysis);
    if (fromAnalysis.length) return fromAnalysis;
    return detectAssessmentReportPhotoViews(poseState.report);
  }, [poseState.analysis, poseState.report]);
  const assessmentStatus = useMemo<AssessmentStatusInfo>(() => {
    const uploadedViewsLabel = formatDetectedPhotoViews(uploadedPhotoViews);
    const detectedViewsLabel = formatDetectedPhotoViews(detectedPoseViews);
    const confidenceChip = formatConfidencePercent(poseState.analysis?.confidenceScore);
    const hasPhotoAnalysis =
      !poseState.error &&
      (detectedPoseViews.length > 0 ||
        hasPhotoDerivedAssessmentReport(poseState.report));

    if (poseState.loading && uploadedPhotoViews.length > 0) {
      return {
        tone: "loading",
        title: "Checking photos",
        body: "Photo analysis is still running. The program status will settle when it finishes.",
        chips: [`Uploaded: ${uploadedViewsLabel}`],
      };
    }

    if (poseState.error) {
      return {
        tone: "failed",
        title: "Photos unavailable",
        body: "Photo analysis could not finish, so Praxis is using your movement profile answers for now.",
        chips: ["Profile-based plan", uploadedPhotoViews.length ? `Uploaded: ${uploadedViewsLabel}` : "No photos active"],
      };
    }

    if (hasPhotoAnalysis) {
      return {
        tone: "photo",
        title: "Photos informed this plan",
        body: "Plan informed by uploaded posture photos and questionnaire inputs.",
        chips: [
          detectedPoseViews.length
            ? `Views: ${detectedViewsLabel}`
            : "Photo-derived report",
          confidenceChip,
        ].filter((chip): chip is string => Boolean(chip)),
      };
    }

    return {
      tone: "fallback",
      title: "Profile-based plan",
      body: "Praxis is currently using your movement profile answers only.",
      chips: [
        uploadedPhotoViews.length
          ? "No usable photo analysis"
          : "No photos uploaded",
      ],
    };
  }, [
    detectedPoseViews,
    poseState.analysis?.confidenceScore,
    poseState.error,
    poseState.loading,
    poseState.report,
    uploadedPhotoViews,
  ]);

  const optimizerReasonsByExercise = useMemo(
    () => program?.phaseOptimizerReport?.exerciseReasons ?? {},
    [program]
  );

  const buildWhyPicked = (exercise: Exercise) => {
    const patterns = exercise.movementPattern;
    const slotLabel = (() => {
      if (patterns.includes("mobility")) return "Mobility";
      if (patterns.includes("pull")) return "Main pull";
      if (patterns.includes("push")) return "Main push";
      if (patterns.includes("squat")) return "Squat pattern";
      if (patterns.includes("hinge")) return "Hinge pattern";
      if (patterns.includes("core")) return "Core stability";
      return "Support work";
    })();

    const goalMatch = [
      "posture",
      data?.goals === "Reduce pain" ? "pain reduction" : "strength",
    ].filter(Boolean) as string[];

    const trains = exercise.muscleGroups;

    const purpose = (() => {
      if (patterns.includes("mobility")) {
        return "Improves range and reduces stiffness so daily movement feels smoother.";
      }
      if (patterns.includes("pull")) {
        return "Builds upper-back strength to support tall, stable posture.";
      }
      if (patterns.includes("push")) {
        return "Builds pushing strength and shoulder control without compensation.";
      }
      if (patterns.includes("squat")) {
        return "Reinforces leg strength and alignment for better lower-body support.";
      }
      if (patterns.includes("hinge")) {
        return "Reinforces hip control and posterior-chain strength.";
      }
      if (patterns.includes("core")) {
        return "Trains bracing and stability to protect spine alignment.";
      }
      return "Supports balanced posture and coordination.";
    })();

    const setup = (() => {
      if (exercise.equipment.includes("bands")) {
        return "Anchor band at chest height, step back to tension, stay tall.";
      }
      if (patterns.includes("mobility")) {
        return "Slow reps with full breaths, stay relaxed.";
      }
      return "Control each rep, steady tempo.";
    })();

    const progressions = (() => {
      if (patterns.includes("mobility")) return ["Add pause at end range"];
      if (patterns.includes("pull")) return ["Add band tension or pause"];
      if (patterns.includes("push")) return ["Slow tempo or add reps"];
      if (patterns.includes("squat")) return ["Add tempo or split stance"];
      if (patterns.includes("hinge")) return ["Single-leg or add reach"];
      if (patterns.includes("core")) return ["Longer holds or slower reps"];
      return [];
    })();

    const regressions = (() => {
      if (patterns.includes("push")) return ["Incline variation"];
      if (patterns.includes("squat")) return ["Shallower depth"];
      if (patterns.includes("hinge")) return ["Hands to thighs"];
      return [];
    })();

    return {
      slot: slotLabel,
      goalMatch,
      trains,
      purpose,
      setup,
      progressions: progressions.length ? progressions : undefined,
      regressions: regressions.length ? regressions : undefined,
    };
  };

  const movePhaseButtonLabel =
    (program?.phaseIndex ?? 1) >= MAX_PHASE_INDEX
      ? `Phase ${MAX_PHASE_INDEX} is active`
      : `Move to Phase ${(program?.phaseIndex ?? 1) + 1}`;

  const previewSummary = () => {
    const currentPhaseIndex = program?.phaseIndex ?? 1;
    if (currentPhaseIndex >= MAX_PHASE_INDEX) {
      return `Phase ${MAX_PHASE_INDEX} is currently the highest phase. Continue workouts to keep progression and variation moving.`;
    }
    const nextPhaseIndex = currentPhaseIndex + 1;
    const nextProfile = getPhaseProfile(nextPhaseIndex);
    return `Next phase focuses on ${nextProfile.label.toLowerCase()}. ${nextProfile.description}`;
  };

  const handleAdvanceProgram = async () => {
    if (!program || !data) return;
    if ((program.phaseIndex ?? 1) >= MAX_PHASE_INDEX) {
      setAdvanceMessage(
        `Phase ${MAX_PHASE_INDEX} is currently the highest phase. Continue workouts to keep progressing.`
      );
      return;
    }
    setAdvanceMessage(null);
    const state = loadAppState();
    const nextProgramVersion =
      typeof state?.programVersion === "number" ? state.programVersion + 1 : 1;
    const requestToken = beginProgramGenerationRequest();
    const signals = await loadGenerationSignals(program.id);
    if (!isLatestProgramGenerationRequest(requestToken)) return;
    const result = generateProgram({
      mode: "nextPhase",
      signals,
      currentProgram: program,
      nextProgramId: uuid(),
    });
    if (!isLatestProgramGenerationRequest(requestToken)) return;

    if (result.status === "advanced") {
      const signedProgram = attachQuestionnaireSignatureToProgram(
        result.program,
        questionnaireSignature ?? buildQuestionnaireSignature(data)
      );
      const nowIso = new Date().toISOString();
      const activationBaselineAt = Date.now();
      const nextProgress: ProgramProgress = {
        programId: signedProgram.id,
        lastCompletedDayIndex: null,
        nextDayIndex: 0,
        completedDayIndices: [],
        phaseIndex: signedProgram.phaseIndex ?? 2,
        phaseStartedAt: nowIso,
        cyclesCompletedInPhase: 0,
        workoutsCompletedInPhase: 0,
        daysPerWeek: signedProgram.daysPerWeek,
        weekIndex: 1,
        countedWeekKeys: [],
        updatedAt: nowIso,
      };
      if (!isLatestProgramGenerationRequest(requestToken)) return;
      await saveProgram(signedProgram);
      if (!isLatestProgramGenerationRequest(requestToken)) return;
      await saveProgramProgress(nextProgress);
      if (!isLatestProgramGenerationRequest(requestToken)) return;
      setProgram(signedProgram);
      setProgress(nextProgress);
      setSelectedDay(0);
      await clearDraftsByProgramId(program.id);
      if (!isLatestProgramGenerationRequest(requestToken)) return;
      saveAppState({
        programId: signedProgram.id,
        activeProgramId: signedProgram.id,
        activeProgramBaselineAt: activationBaselineAt,
        activeGenerationMode: "live_regeneration",
        activeInitialVariationSeed: undefined,
        selectedDay: 0,
        activePhaseIndex: signedProgram.phaseIndex ?? 1,
        activeCycleIndex: signedProgram.cycleIndex ?? 1,
        programVersion: nextProgramVersion,
        activeSessionId: undefined,
        questionnaireSignature: questionnaireSignature ?? undefined,
        lastRoute: "/results",
      });
      markProgramSettled(signedProgram.id);
      setAdvanceOpen(false);
      setAdvanceConfirm(false);
      return;
    }

    markProgramSettled(program.id);
    setAdvanceMessage("message" in result ? result.message : null);
  };

  const handleSkipPhaseOne = async () => {
    if (!program || !data) return;
    const currentPhaseIndex = progress?.phaseIndex ?? program.phaseIndex ?? 1;
    if (currentPhaseIndex !== 1) {
      setSkipPhaseOneOpen(false);
      return;
    }
    const state = loadAppState();
    const nextProgramVersion =
      typeof state?.programVersion === "number" ? state.programVersion + 1 : 1;
    const nowIso = new Date().toISOString();
    const activationBaselineAt = Date.now();
    const requestToken = beginProgramGenerationRequest();
    const signals = await loadGenerationSignals(program.id);
    if (!isLatestProgramGenerationRequest(requestToken)) return;
    const nextProgramResult = generateProgram({
      mode: "weekly",
      signals,
      currentProgram: program,
      nextProgramId: uuid(),
      phaseIndex: 2,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: (program.totalWeekIndex ?? program.weekIndex ?? 1) + 1,
    });
    if (!isLatestProgramGenerationRequest(requestToken)) return;
    if (!("program" in nextProgramResult)) {
      markProgramSettled(program.id);
      return;
    }
    const nextProgram = attachQuestionnaireSignatureToProgram(
      nextProgramResult.program,
      questionnaireSignature ?? buildQuestionnaireSignature(data)
    );
    const baseProgress: ProgramProgress = {
      programId: nextProgram.id,
      lastCompletedDayIndex: null,
      nextDayIndex: 0,
      completedDayIndices: [],
      phaseIndex: currentPhaseIndex,
      phaseStartedAt: progress?.phaseStartedAt ?? program.createdAt ?? nowIso,
      cyclesCompletedInPhase: progress?.cyclesCompletedInPhase ?? 0,
      workoutsCompletedInPhase: progress?.workoutsCompletedInPhase ?? 0,
      daysPerWeek: nextProgram.daysPerWeek,
      weekIndex: progress?.weekIndex ?? 1,
      countedWeekKeys: progress?.countedWeekKeys ?? [],
      updatedAt: nowIso,
    };
    const skipped = skipPhase1(baseProgress, nowIso);
    const nextProgress: ProgramProgress = {
      ...skipped,
      programId: nextProgram.id,
      lastCompletedDayIndex: null,
      nextDayIndex: 0,
      completedDayIndices: [],
      daysPerWeek: nextProgram.daysPerWeek,
      updatedAt: nowIso,
    };
    if (!isLatestProgramGenerationRequest(requestToken)) return;
    await saveProgram(nextProgram);
    if (!isLatestProgramGenerationRequest(requestToken)) return;
    await saveProgramProgress(nextProgress);
    if (!isLatestProgramGenerationRequest(requestToken)) return;
    setProgram(nextProgram);
    setProgress(nextProgress);
    setSelectedDay(0);
    await clearDraftsByProgramId(program.id);
    if (!isLatestProgramGenerationRequest(requestToken)) return;
    saveAppState({
      programId: nextProgram.id,
      activeProgramId: nextProgram.id,
      activeProgramBaselineAt: activationBaselineAt,
      activeGenerationMode: "live_regeneration",
      activeInitialVariationSeed: undefined,
      selectedDay: 0,
      activePhaseIndex: nextProgram.phaseIndex ?? 2,
      activeCycleIndex: nextProgram.cycleIndex ?? 1,
      programVersion: nextProgramVersion,
      activeSessionId: undefined,
      questionnaireSignature: questionnaireSignature ?? undefined,
      lastRoute: "/results",
    });
    markProgramSettled(nextProgram.id);
    setSkipPhaseOneOpen(false);
  };

  useEffect(() => {
    if (!data || !questionnaireSignature || !programGenerationInputsReady) return;
    if (
      initialProgramLoadInFlightRef.current &&
      initialProgramLoadSignatureRef.current === questionnaireSignature
    ) {
      return;
    }
    const requestToken = beginProgramGenerationRequest();
    initialProgramLoadInFlightRef.current = true;
    initialProgramLoadSignatureRef.current = questionnaireSignature;
    setInitialProgramLoadPending(true);
    let cancelled = false;
    const loadProgram = async () => {
      try {
        setProgramLoadIssue(null);
        const state = loadAppState();
        const stateQuestionnaireSignature = state?.questionnaireSignature ?? null;
        if (state?.activeProgramId) {
          const active = await getProgram(state.activeProgramId);
          if (
            isProgramCompatibleWithQuestionnaire(active, data, {
              questionnaireSignature,
              savedQuestionnaireSignature: stateQuestionnaireSignature,
            })
          ) {
            if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
            setProgram(active);
            markProgramSettled(active.id);
            return;
          }
        }
        const latest = await getLatestProgram();
        const latestSavedSignature =
          latest &&
          (latest.id === state?.activeProgramId || latest.id === state?.programId)
            ? stateQuestionnaireSignature
            : null;
        if (
          latest &&
          isProgramCompatibleWithQuestionnaire(latest, data, {
            questionnaireSignature,
            savedQuestionnaireSignature: latestSavedSignature,
          })
        ) {
          if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
          setProgram(latest);
          markProgramSettled(latest.id);
          return;
        }
        const signals = await loadGenerationSignals(null);
        if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
        const nextProgramId = uuid();
        const generated = generateProgram({
          mode: "weekly",
          signals,
          nextProgramId,
          initialVariationSeed: nextProgramId,
        });
        if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
        if (!("program" in generated)) {
          setProgramLoadIssue(generated.message);
          return;
        }
        const newProgram = attachQuestionnaireSignatureToProgram(
          generated.program,
          questionnaireSignature
        );
        if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
        await saveProgram(newProgram);
        if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
        saveAppState({
          programId: newProgram.id,
          activeProgramId: newProgram.id,
          activeProgramBaselineAt: Date.now(),
          activeGenerationMode: "live_initial",
          activeInitialVariationSeed: nextProgramId,
          selectedDay: 0,
          activePhaseIndex: newProgram.phaseIndex ?? 1,
          activeCycleIndex: newProgram.cycleIndex ?? 1,
          questionnaireSignature,
          lastRoute: "/results",
        });
        setProgram(newProgram);
        markProgramSettled(newProgram.id);
      } catch (error) {
        if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
        setProgramLoadIssue(formatProgramGenerationIssue(error));
      } finally {
        if (isLatestProgramGenerationRequest(requestToken)) {
          initialProgramLoadInFlightRef.current = false;
          initialProgramLoadSignatureRef.current = null;
          setInitialProgramLoadPending(false);
        }
      }
    };
    void loadProgram();
    return () => {
      cancelled = true;
      if (isLatestProgramGenerationRequest(requestToken)) {
        initialProgramLoadInFlightRef.current = false;
        initialProgramLoadSignatureRef.current = null;
        setInitialProgramLoadPending(false);
      }
    };
  }, [
    data,
    questionnaireSignature,
    programGenerationInputsReady,
    loadGenerationSignals,
    beginProgramGenerationRequest,
    isLatestProgramGenerationRequest,
    markProgramSettled,
    initialProgramLoadInFlightRef,
    initialProgramLoadSignatureRef,
    setInitialProgramLoadPending,
  ]);

  useEffect(() => {
    if (!program || !data || !questionnaireSignature) return;
    if (
      initialProgramLoadPending ||
      initialProgramLoadInFlightRef.current ||
      reconcileProgramPending
    ) {
      return;
    }
    if (settledProgramId !== program.id) return;
    const state = loadAppState();
    if (state?.activeProgramId && state.activeProgramId !== program.id) return;
    const programIsCompatible = isProgramCompatibleWithQuestionnaire(program, data, {
      questionnaireSignature,
      savedQuestionnaireSignature: state?.questionnaireSignature ?? null,
    });
    if (programIsCompatible) return;

    const reconcileProgram = async () => {
      const requestToken = beginProgramGenerationRequest();
      setReconcileProgramPending(true);
      try {
        const signals = await loadGenerationSignals(null);
        if (!isLatestProgramGenerationRequest(requestToken)) return;
        const generated = generateProgram({
          mode: "weekly",
          signals,
          nextProgramId: uuid(),
        });
        if (!isLatestProgramGenerationRequest(requestToken)) return;
        if (!("program" in generated)) return;
        const reconciled = attachQuestionnaireSignatureToProgram(
          generated.program,
          questionnaireSignature
        );
        if (!isLatestProgramGenerationRequest(requestToken)) return;
        await saveProgram(reconciled);
        if (!isLatestProgramGenerationRequest(requestToken)) return;
        saveAppState({
          programId: reconciled.id,
          activeProgramId: reconciled.id,
          activeProgramBaselineAt: Date.now(),
          activeGenerationMode: "live_regeneration",
          activeInitialVariationSeed: undefined,
          selectedDay: 0,
          activePhaseIndex: reconciled.phaseIndex ?? 1,
          activeCycleIndex: reconciled.cycleIndex ?? 1,
          questionnaireSignature,
        });
        if (!isLatestProgramGenerationRequest(requestToken)) return;
        setProgram(reconciled);
        setSelectedDay(0);
        markProgramSettled(reconciled.id);
      } finally {
        if (isLatestProgramGenerationRequest(requestToken)) {
          setReconcileProgramPending(false);
        }
      }
    };

    void reconcileProgram();
  }, [
    program,
    data,
    questionnaireSignature,
    loadGenerationSignals,
    initialProgramLoadPending,
    reconcileProgramPending,
    settledProgramId,
    beginProgramGenerationRequest,
    isLatestProgramGenerationRequest,
    markProgramSettled,
    initialProgramLoadInFlightRef,
    setReconcileProgramPending,
  ]);

  useEffect(() => {
    if (!program || !questionnaireSignature) return;
    const stateDay =
      authEnabled && plan !== "pro"
        ? 0
        : Math.min(Math.max(0, selectedDay), Math.max(0, program.week.length - 1));
    const state = loadAppState();
    const nextVersion =
      typeof state?.programVersion === "number"
        ? state.programVersion
        : 0;
    const parsedProgramCreatedAt = toEpochMs(program.createdAt);
    const fallbackBaselineAt = Number.isNaN(parsedProgramCreatedAt)
      ? Date.now()
      : parsedProgramCreatedAt;
    const sameActiveProgram = state?.activeProgramId === program.id;
    const storedBaselineAt =
      typeof state?.activeProgramBaselineAt === "number" &&
      Number.isFinite(state.activeProgramBaselineAt)
        ? state.activeProgramBaselineAt
        : null;
    const nextBaselineAt = sameActiveProgram
      ? (storedBaselineAt ?? fallbackBaselineAt)
      : fallbackBaselineAt;
    setActiveProgramBaselineAt(nextBaselineAt);
    saveAppState({
      programId: program.id,
      activeProgramId: program.id,
      activeProgramBaselineAt: nextBaselineAt,
      activeGenerationMode: sameActiveProgram ? state?.activeGenerationMode : undefined,
      activeInitialVariationSeed: sameActiveProgram
        ? state?.activeInitialVariationSeed
        : undefined,
      selectedDay: stateDay,
      activePhaseIndex: program.phaseIndex ?? 1,
      activeCycleIndex: program.cycleIndex ?? 1,
      programVersion: nextVersion,
      questionnaireSignature,
      lastRoute: "/results",
    });
  }, [program, selectedDay, authEnabled, plan, questionnaireSignature]);

  const baselineForActiveProgram = useMemo(() => {
    if (activeProgramBaselineAt > 0) return activeProgramBaselineAt;
    const parsedProgramCreatedAt = toEpochMs(program?.createdAt);
    return Number.isNaN(parsedProgramCreatedAt) ? 0 : parsedProgramCreatedAt;
  }, [activeProgramBaselineAt, program?.createdAt]);

  const activeProgramId = useMemo(() => {
    if (!programId) return null;
    const stored = loadAppState()?.activeProgramId;
    if (!stored) return programId;
    return stored === programId ? stored : programId;
  }, [programId]);

  const activeSessionId = loadAppState()?.activeSessionId ?? null;

  const activeDaysPerWeek = program?.daysPerWeek ?? data?.daysPerWeek ?? 3;
  const calendarWeekWindow = useMemo(() => {
    const weekStart = new Date(nowAnchor);
    weekStart.setHours(0, 0, 0, 0);
    const mondayOffset = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - mondayOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return {
      startMs: weekStart.getTime(),
      endMs: weekEnd.getTime(),
    };
  }, [nowAnchor]);

  const sessionsSinceBaseline = useMemo(() => {
    if (!activeProgramId) return [] as SessionRecord[];
    return allSessions.filter((session) => {
      if (session.routineId !== activeProgramId) return false;
      const parsedSessionAt = toEpochMs(session.startedAt ?? session.createdAt);
      const sessionAt = Number.isNaN(parsedSessionAt) ? 0 : parsedSessionAt;
      return sessionAt >= baselineForActiveProgram;
    });
  }, [allSessions, activeProgramId, baselineForActiveProgram]);

  const currentCalendarWeekSessions = useMemo(() => {
    if (!activeProgramId) return [] as SessionRecord[];
    return allSessions.filter((session) => {
      if (session.routineId !== activeProgramId) return false;
      const sessionAt = toEpochMs(
        session.completedAt ?? session.startedAt ?? session.createdAt
      );
      if (Number.isNaN(sessionAt)) return false;
      return sessionAt >= calendarWeekWindow.startMs && sessionAt < calendarWeekWindow.endMs;
    });
  }, [allSessions, activeProgramId, calendarWeekWindow]);

  const completedCalendarWeekSessions = useMemo(
    () =>
      currentCalendarWeekSessions.filter((session) => {
        const completedAt = toEpochMs(session.completedAt);
        if (Number.isNaN(completedAt)) return false;
        return (
          completedAt >= calendarWeekWindow.startMs &&
          completedAt < calendarWeekWindow.endMs
        );
      }),
    [currentCalendarWeekSessions, calendarWeekWindow]
  );

  const completedDaySet = useMemo(() => {
    const set = new Set<number>();
    completedCalendarWeekSessions.forEach((session) => {
      const dayIndex = parseDayIndexFromSession(session);
      if (dayIndex === null) return;
      if (
        dayIndex >= 0 &&
        dayIndex < activeDaysPerWeek
      ) {
        set.add(dayIndex);
      }
    });
    return set;
  }, [completedCalendarWeekSessions, activeDaysPerWeek]);

  const inProgressDaySet = useMemo(() => {
    const set = new Set<number>();
    currentCalendarWeekSessions.forEach((session) => {
      if (session.completedAt) return;
      const dayIndex = parseDayIndexFromSession(session);
      if (dayIndex === null) return;
      if (dayIndex < 0 || dayIndex >= activeDaysPerWeek) return;
      if (completedDaySet.has(dayIndex)) return;
      set.add(dayIndex);
    });
    return set;
  }, [currentCalendarWeekSessions, activeDaysPerWeek, completedDaySet]);

  const latestInProgressDayIndex = useMemo(() => {
    let latest: { dayIndex: number; timestamp: number } | null = null;
    for (const session of currentCalendarWeekSessions) {
      if (session.completedAt) continue;
      const dayIndex = parseDayIndexFromSession(session);
      if (dayIndex === null || dayIndex < 0 || dayIndex >= activeDaysPerWeek) continue;
      const parsedTimestamp = toEpochMs(session.startedAt ?? session.createdAt);
      const timestamp = Number.isNaN(parsedTimestamp) ? 0 : parsedTimestamp;
      if (!latest || timestamp > latest.timestamp) {
        latest = { dayIndex, timestamp };
      }
    }
    return latest?.dayIndex ?? null;
  }, [currentCalendarWeekSessions, activeDaysPerWeek]);

  const nextDayIndex = useMemo(() => {
    if (!program) return 0;
    if (
      latestInProgressDayIndex !== null &&
      latestInProgressDayIndex >= 0 &&
      latestInProgressDayIndex < program.week.length &&
      !completedDaySet.has(latestInProgressDayIndex)
    ) {
      return latestInProgressDayIndex;
    }
    const firstPending = program.week.find(
      (day) => !completedDaySet.has(day.dayIndex)
    )?.dayIndex;
    if (typeof firstPending === "number") {
      return firstPending;
    }
    // Calendar fallback keeps session targeting fresh at week rollover.
    return new Date(nowAnchor).getDay() % Math.max(1, program.daysPerWeek);
  }, [program, latestInProgressDayIndex, completedDaySet, nowAnchor]);

  const completedCount = useMemo(() => {
    return Math.min(activeDaysPerWeek, completedCalendarWeekSessions.length);
  }, [completedCalendarWeekSessions, activeDaysPerWeek]);

  const isFreePlan = authEnabled && plan !== "pro";
  const isDayLocked = (dayIndex: number) => isFreePlan && dayIndex > 0;
  const effectiveSelectedDay = isDayLocked(selectedDay) ? 0 : selectedDay;
  const effectiveNextDayIndex = isDayLocked(nextDayIndex) ? 0 : nextDayIndex;
  const sessionLaunchDayIndex = useMemo(() => {
    if (!program) return 0;
    if (hasRoutableWorkoutDay(program, effectiveNextDayIndex)) {
      return effectiveNextDayIndex;
    }
    return resolveFirstRoutableDay(program);
  }, [program, effectiveNextDayIndex]);
  const effectiveInProgressDaySet = useMemo(() => {
    const set = new Set<number>();
    inProgressDaySet.forEach((dayIndex) => {
      if (isFreePlan && dayIndex > 0) return;
      set.add(dayIndex);
    });
    return set;
  }, [inProgressDaySet, isFreePlan]);
  const inProgressCount = useMemo(
    () => effectiveInProgressDaySet.size,
    [effectiveInProgressDaySet]
  );

  const completedSessions = useMemo(
    () =>
      sessionsSinceBaseline
        .filter((session) => session.completedAt)
        .toSorted((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
    [sessionsSinceBaseline]
  );

  const {
    historyScope,
    setHistoryScope,
    historySearchQuery,
    setHistorySearchQuery,
    historySearchTerm,
    historyEntries,
    allCompletedSessions,
    currentProgramCompletedSessions,
  } = useResultsHistoryProgress({
    allSessions,
    activeProgramId,
    program,
    allPrograms,
  });

  const completedWeeks =
    !program || !completedSessions.length
      ? 0
      : Math.floor(completedSessions.length / program.daysPerWeek);

  const workoutsThisWeek = completedCount;

  useEffect(() => {
    if (!program || !data || !activeProgramId) return;
    if (activeProgramId !== program.id) return;
    if (hasRoutableWorkoutDay(program, effectiveNextDayIndex)) return;
    if (missingWorkoutRepairAttemptRef.current.has(program.id)) return;

    missingWorkoutRepairAttemptRef.current.add(program.id);
    let cancelled = false;

    const repairMissingNextWorkout = async () => {
      const state = loadAppState();
      const nextProgramVersion =
        typeof state?.programVersion === "number" ? state.programVersion + 1 : 1;
      const requestToken = beginProgramGenerationRequest();
      const signals = await loadGenerationSignals(program.id);
      if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
      const nextCycleResult = generateProgram({
        mode: "nextCycle",
        signals,
        currentProgram: program,
        nextProgramId: uuid(),
      });
      if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;

      const generatedNextProgram = (() => {
        if (nextCycleResult.status === "advanced") return nextCycleResult.program;
        const fallback = generateProgram({
          mode: "weekly",
          signals,
          currentProgram: program,
          nextProgramId: uuid(),
          phaseIndex: program.phaseIndex ?? 1,
          weekIndex: Math.max(1, (program.weekIndex ?? 1) + 1),
          cycleIndex: Math.max(1, (program.cycleIndex ?? 1) + 1),
          totalWeekIndex: Math.max(
            1,
            (program.totalWeekIndex ?? program.weekIndex ?? 1) + 1
          ),
        });
        return "program" in fallback ? fallback.program : null;
      })();
      if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
      if (!generatedNextProgram) {
        markProgramSettled(program.id);
        return;
      }
      const nextProgram = attachQuestionnaireSignatureToProgram(
        generatedNextProgram,
        questionnaireSignature ?? buildQuestionnaireSignature(data)
      );
      const nowIso = new Date().toISOString();
      const nextPhaseIndex = nextProgram.phaseIndex ?? 1;
      const previousPhaseIndex = program.phaseIndex ?? 1;
      const phaseChanged = nextPhaseIndex !== previousPhaseIndex;
      const nextProgress: ProgramProgress = {
        programId: nextProgram.id,
        lastCompletedDayIndex: null,
        nextDayIndex: 0,
        completedDayIndices: [],
        phaseIndex: nextPhaseIndex,
        phaseStartedAt: phaseChanged
          ? nowIso
          : progress?.phaseStartedAt ?? program.createdAt ?? nowIso,
        cyclesCompletedInPhase: phaseChanged
          ? 0
          : Math.max(progress?.cyclesCompletedInPhase ?? 0, completedWeeks),
        workoutsCompletedInPhase: phaseChanged
          ? 0
          : progress?.workoutsCompletedInPhase ?? completedSessions.length,
        daysPerWeek: nextProgram.daysPerWeek,
        weekIndex: Math.max(1, nextProgram.weekIndex ?? 1),
        countedWeekKeys: [],
        updatedAt: nowIso,
      };
      if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
      await saveProgram(nextProgram);
      if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
      await saveProgramProgress(nextProgress);
      if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
      setProgram(nextProgram);
      setProgress(nextProgress);
      setSelectedDay(0);
      setWeekViewSelectedDay(0);
      setWeekViewDetailsOpen(false);
      if (cancelled || !isLatestProgramGenerationRequest(requestToken)) return;
      saveAppState({
        programId: nextProgram.id,
        activeProgramId: nextProgram.id,
        activeProgramBaselineAt: Date.now(),
        activeGenerationMode: "live_regeneration",
        activeInitialVariationSeed: undefined,
        selectedDay: 0,
        activePhaseIndex: nextProgram.phaseIndex ?? 1,
        activeCycleIndex: nextProgram.cycleIndex ?? 1,
        activeSessionId: undefined,
        programVersion: nextProgramVersion,
        questionnaireSignature: questionnaireSignature ?? undefined,
        lastRoute: "/results",
      });
      markProgramSettled(nextProgram.id);
    };

    void repairMissingNextWorkout();
    return () => {
      cancelled = true;
    };
  }, [
    program,
    data,
    activeProgramId,
    effectiveNextDayIndex,
    allSessions,
    baselineForActiveProgram,
    completedWeeks,
    completedSessions.length,
    progress?.cyclesCompletedInPhase,
    progress?.workoutsCompletedInPhase,
    progress?.phaseStartedAt,
    questionnaireSignature,
    loadGenerationSignals,
    beginProgramGenerationRequest,
    isLatestProgramGenerationRequest,
    markProgramSettled,
  ]);

  useEffect(() => {
    const loadLastTwo = async () => {
      if (!completedSessions.length) {
        setLastTwoLogs((prev) => (prev.length ? [] : prev));
        return;
      }
      const lastTwo = completedSessions.slice(0, 2);
      const logs = await listExerciseLogsBySessionIds(
        lastTwo.map((session) => session.id)
      );
      setLastTwoLogs(logs);
    };
    loadLastTwo();
  }, [completedSessions]);

  useEffect(() => {
    const progressProgram = programProgressSnapshotRef.current;
    if (!progressProgram || !programId || progressProgram.id !== programId) return;
    let cancelled = false;
    getProgramProgress(programId).then((stored) => {
      if (cancelled) return;
      if (stored) {
        const nowIso = new Date().toISOString();
        const phaseStartedAt =
          stored.phaseStartedAt ?? progressProgram.createdAt ?? nowIso;
        const storedWorkoutsCompletedInPhase =
          typeof stored.workoutsCompletedInPhase === "number"
            ? stored.workoutsCompletedInPhase
            : 0;
        const backfilledWorkoutsCompletedInPhase =
          deriveWorkoutsCompletedInPhase(currentProgramCompletedSessions, phaseStartedAt);
        const normalized: ProgramProgress = {
          ...stored,
          phaseIndex: stored.phaseIndex ?? (progressProgram.phaseIndex ?? 1),
          phaseStartedAt,
          cyclesCompletedInPhase:
            typeof stored.cyclesCompletedInPhase === "number"
              ? stored.cyclesCompletedInPhase
              : 0,
          workoutsCompletedInPhase: Math.max(
            storedWorkoutsCompletedInPhase,
            backfilledWorkoutsCompletedInPhase
          ),
          daysPerWeek: stored.daysPerWeek ?? progressProgram.daysPerWeek,
          weekIndex: Math.max(1, stored.weekIndex ?? 1),
          countedWeekKeys: Array.isArray(stored.countedWeekKeys)
            ? stored.countedWeekKeys
            : [],
          updatedAt: stored.updatedAt ?? nowIso,
        };
        setProgress(normalized);
        setSelectedDay(normalized.nextDayIndex ?? 0);
        if (
          stored.phaseStartedAt !== normalized.phaseStartedAt ||
          stored.cyclesCompletedInPhase !== normalized.cyclesCompletedInPhase ||
          stored.workoutsCompletedInPhase !== normalized.workoutsCompletedInPhase ||
          stored.phaseIndex !== normalized.phaseIndex ||
          stored.daysPerWeek !== normalized.daysPerWeek ||
          stored.weekIndex !== normalized.weekIndex ||
          JSON.stringify(stored.countedWeekKeys ?? []) !==
            JSON.stringify(normalized.countedWeekKeys ?? [])
        ) {
          void saveProgramProgress(normalized);
        }
      } else {
        const nowIso = new Date().toISOString();
        const phaseStartedAt = progressProgram.createdAt ?? nowIso;
        const initial: ProgramProgress = {
          programId,
          lastCompletedDayIndex: null,
          nextDayIndex: 0,
          completedDayIndices: [],
          phaseIndex: progressProgram.phaseIndex ?? 1,
          phaseStartedAt,
          cyclesCompletedInPhase: 0,
          workoutsCompletedInPhase: deriveWorkoutsCompletedInPhase(
            currentProgramCompletedSessions,
            phaseStartedAt
          ),
          daysPerWeek: progressProgram.daysPerWeek,
          weekIndex: 1,
          countedWeekKeys: [],
          updatedAt: nowIso,
        };
        saveProgramProgress(initial);
        setProgress(initial);
        setSelectedDay(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [programId, currentProgramCompletedSessions]);

  useEffect(() => {
    return () => {
      if (knowledgeHighlightTimeoutRef.current !== null) {
        window.clearTimeout(knowledgeHighlightTimeoutRef.current);
      }
      if (sessionCompleteNoticeFadeTimeoutRef.current !== null) {
        window.clearTimeout(sessionCompleteNoticeFadeTimeoutRef.current);
      }
      if (sessionCompleteNoticeTimeoutRef.current !== null) {
        window.clearTimeout(sessionCompleteNoticeTimeoutRef.current);
      }
      if (levelUpNoticeTimeoutRef.current !== null) {
        window.clearTimeout(levelUpNoticeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const maybeShowSessionCompleteNotice = (completedAtIso: string | null | undefined) => {
      if (!completedAtIso) return;
      const completedAtMs = Date.parse(completedAtIso);
      if (Number.isNaN(completedAtMs)) return;
      const seenRaw = localStorage.getItem(SESSION_COMPLETE_ACK_KEY);
      const seenMs = seenRaw ? Number(seenRaw) : 0;
      const parsedSeenMs = Number.isFinite(seenMs) ? seenMs : 0;
      if (completedAtMs <= parsedSeenMs) return;
      localStorage.setItem(SESSION_COMPLETE_ACK_KEY, String(completedAtMs));
      triggerSessionCompleteNotice();
    };

    maybeShowSessionCompleteNotice(localStorage.getItem("session_last_completed_at"));
    const onSessionCompleted = (event: Event) => {
      const detail = (event as CustomEvent<{ completedAt?: string }>).detail;
      maybeShowSessionCompleteNotice(
        detail?.completedAt ?? localStorage.getItem("session_last_completed_at")
      );
    };
    window.addEventListener(SESSION_COMPLETE_EVENT, onSessionCompleted as EventListener);
    return () => {
      window.removeEventListener(
        SESSION_COMPLETE_EVENT,
        onSessionCompleted as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (!showSessionCompleteNotice) return;
    if (sessionCompleteNoticeFadeTimeoutRef.current !== null) {
      window.clearTimeout(sessionCompleteNoticeFadeTimeoutRef.current);
    }
    if (sessionCompleteNoticeTimeoutRef.current !== null) {
      window.clearTimeout(sessionCompleteNoticeTimeoutRef.current);
    }
    sessionCompleteNoticeFadeTimeoutRef.current = window.setTimeout(() => {
      setSessionCompleteNoticeFading(true);
    }, 3600);
    sessionCompleteNoticeTimeoutRef.current = window.setTimeout(() => {
      setShowSessionCompleteNotice(false);
      setSessionCompleteNoticeFading(false);
    }, 4000);
    return () => {
      if (sessionCompleteNoticeFadeTimeoutRef.current !== null) {
        window.clearTimeout(sessionCompleteNoticeFadeTimeoutRef.current);
      }
      if (sessionCompleteNoticeTimeoutRef.current !== null) {
        window.clearTimeout(sessionCompleteNoticeTimeoutRef.current);
      }
    };
  }, [showSessionCompleteNotice]);

  useEffect(() => {
    if (!programId) return;
    let cancelled = false;
    const loadSessions = () => {
      listSessions(500).then((sessions) => {
        if (!cancelled) {
          setAllSessions(sessions);
          setSessionsLoaded(true);
        }
      });
    };
    loadSessions();
    window.addEventListener("focus", loadSessions);
    window.addEventListener("visibilitychange", loadSessions);
    window.addEventListener(SESSION_COMPLETE_EVENT, loadSessions as EventListener);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", loadSessions);
      window.removeEventListener("visibilitychange", loadSessions);
      window.removeEventListener(SESSION_COMPLETE_EVENT, loadSessions as EventListener);
    };
  }, [programId]);

  useEffect(() => {
    if (!programId) return;
    let cancelled = false;
    listAllPrograms()
      .then((programs) => {
        if (!cancelled) {
          setAllPrograms(programs);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [programId]);

  useEffect(() => {
    setWeekViewDetailsOpen(false);
    setWeekViewSelectedDay(null);
  }, [programId, baselineForActiveProgram]);

  const currentPhaseIndex = progress?.phaseIndex ?? program?.phaseIndex ?? 1;
  const workoutsCompletedInPhase =
    progress?.workoutsCompletedInPhase ?? completedSessions.length;

  const phaseGate = useMemo(() => {
    return canAdvancePhase({
      phaseIndex: currentPhaseIndex,
      phaseStartedAt: progress?.phaseStartedAt ?? program?.createdAt ?? null,
      cyclesCompletedInPhase: progress?.cyclesCompletedInPhase ?? 0,
      workoutsCompletedInPhase,
      daysPerWeek: progress?.daysPerWeek ?? program?.daysPerWeek ?? activeDaysPerWeek,
    });
  }, [
    currentPhaseIndex,
    program?.createdAt,
    program?.daysPerWeek,
    activeDaysPerWeek,
    progress?.phaseStartedAt,
    progress?.cyclesCompletedInPhase,
    progress?.daysPerWeek,
    workoutsCompletedInPhase,
  ]);

  const phaseGateReason = useMemo(() => {
    if (currentPhaseIndex >= MAX_PHASE_INDEX) {
      return `Phase ${MAX_PHASE_INDEX} is active. Continue building completion and execution quality.`;
    }
    return formatPhaseGateReason(phaseGate);
  }, [phaseGate, currentPhaseIndex]);

  const phaseControlUi = useMemo(
    () =>
      getPhaseControlUiState({
        phaseIndex: currentPhaseIndex,
        gate: phaseGate,
      }),
    [currentPhaseIndex, phaseGate]
  );
  const phaseAdvanceReady = currentPhaseIndex < MAX_PHASE_INDEX && phaseGate.ok;
  const nextPhaseIndex = Math.min(MAX_PHASE_INDEX, currentPhaseIndex + 1);
  const phaseReadyDismissalKey = programId
    ? buildPhaseReadyDismissalKey(programId, currentPhaseIndex)
    : null;
  const completedWorkoutCount = currentProgramCompletedSessions.length;
  const totalCompletedWorkoutCount = allCompletedSessions.length;
  const hasCompletedWorkout = totalCompletedWorkoutCount >= 1;
  const lifetimeCompletedWeeks = Math.floor(
    totalCompletedWorkoutCount / Math.max(1, activeDaysPerWeek)
  );
  const hasAdvancedPhaseUnlock = currentPhaseIndex > 1;
  const hasCompletedFullWeek =
    hasAdvancedPhaseUnlock ||
    completedWeeks >= 1 ||
    phaseGate.cyclesCompletedInPhase >= 1 ||
    lifetimeCompletedWeeks >= 1;
  const dashboardLevel = hasCompletedFullWeek ? 3 : hasCompletedWorkout ? 2 : 1;

  useEffect(() => {
    if (!sessionsLoaded) return;
    const storedLevelRaw = localStorage.getItem(DASHBOARD_UNLOCK_LEVEL_KEY);
    const storedLevel = storedLevelRaw ? Number(storedLevelRaw) : 0;
    const normalizedStoredLevel = Number.isFinite(storedLevel) ? storedLevel : 0;
    const previousLevel = previousUnlockLevelRef.current;
    previousUnlockLevelRef.current = dashboardLevel;

    if (normalizedStoredLevel <= 0) {
      localStorage.setItem(DASHBOARD_UNLOCK_LEVEL_KEY, String(dashboardLevel));
      return;
    }
    const priorLevel = Math.max(normalizedStoredLevel, previousLevel ?? 0);
    if (dashboardLevel <= priorLevel) return;

    localStorage.setItem(DASHBOARD_UNLOCK_LEVEL_KEY, String(dashboardLevel));

    showLevelUpNotice({
      eyebrow: "Praxis level up",
      title:
        dashboardLevel >= 3
          ? "Level 3 analysis unlocked"
          : "Level 2 progress unlocked",
      body:
        dashboardLevel >= 3
          ? "Deeper insights stay available as your plan evolves."
          : "History and progress are now open from your completed work.",
    });
  }, [dashboardLevel, sessionsLoaded, showLevelUpNotice]);

  useEffect(() => {
    if (!programId) return;
    const previousPhaseIndex = previousCelebratedPhaseRef.current;
    previousCelebratedPhaseRef.current = currentPhaseIndex;
    if (previousPhaseIndex === null || currentPhaseIndex <= previousPhaseIndex) return;

    showLevelUpNotice({
      eyebrow: "Phase advanced",
      title: `Phase ${currentPhaseIndex} unlocked`,
      body: "Your prior history and analysis stay available while the new phase begins.",
    });
  }, [programId, currentPhaseIndex, showLevelUpNotice]);

  useEffect(() => {
    if (!programId || currentPhaseIndex >= MAX_PHASE_INDEX || !phaseGate.ok) {
      setPhaseReadyNoticeOpen(false);
      return;
    }
    const lastCompletedAt = localStorage.getItem("session_last_completed_at");
    if (!lastCompletedAt) return;
    const latestCompletionMatchesActiveProgram = currentProgramCompletedSessions.some(
      (session) => session.completedAt === lastCompletedAt
    );
    if (!latestCompletionMatchesActiveProgram) return;
    const storageKey = buildPhaseReadyDismissalKey(programId, currentPhaseIndex);
    if (localStorage.getItem(storageKey)) return;

    const noticeState = getPhaseReadyNoticeState({
      programId,
      phaseIndex: currentPhaseIndex,
      gate: phaseGate,
      previousWorkoutsCompletedInPhase: phaseGate.workoutsCompletedInPhase - 1,
    });
    if (!noticeState.shouldShow || !noticeState.storageKey) return;
    localStorage.setItem(noticeState.storageKey, "shown");
    setPhaseReadyNoticeOpen(true);
  }, [programId, currentPhaseIndex, phaseGate, currentProgramCompletedSessions]);

  const openPhaseAdvancePrompt = () => {
    if (phaseReadyDismissalKey) {
      localStorage.setItem(phaseReadyDismissalKey, "move-opened");
    }
    setPhaseReadyNoticeOpen(false);
    setAdvanceMessage(previewSummary());
    setAdvanceOpen(true);
  };

  const dismissPhaseReadyNotice = () => {
    if (phaseReadyDismissalKey) {
      localStorage.setItem(phaseReadyDismissalKey, "dismissed");
    }
    setPhaseReadyNoticeOpen(false);
  };

  const heroGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const resolvedSessionProgramId = activeProgramId ?? program?.id ?? null;

  const heroCta = useMemo(() => {
    if (!resolvedSessionProgramId) {
      return {
        label: "Start Today's Session" as const,
        href: "/session",
      };
    }
    if (activeSessionId) {
      return {
        label: "Continue Session" as const,
        href: `/session?sessionId=${encodeURIComponent(activeSessionId)}`,
      };
    }
    return {
      label: "Start Today's Session" as const,
      href: `/session?programId=${resolvedSessionProgramId}&dayIndex=${sessionLaunchDayIndex}`,
    };
  }, [resolvedSessionProgramId, activeSessionId, sessionLaunchDayIndex]);

  const dailyInsight = useMemo(() => {
    const seed = questionnaireSignature ?? program?.id ?? "insight";
    return getDailyInsight(seed, currentPhaseIndex);
  }, [questionnaireSignature, program?.id, currentPhaseIndex]);

  const temporaryProgramReferenceText = useMemo(() => {
    if (!SHOW_PHASE_PREVIEW_REFERENCE) return "";
    if (!programReferenceOpen) return "";
    if (!program) return "";

    const lines: string[] = [];
    const referenceQuestionnaire = data
      ? {
          ...data,
          daysPerWeek: normalizeDaysPerWeek(data.daysPerWeek),
          equipment: normalizeEquipmentSelectionValues(data.equipment),
        }
      : null;

    if (referenceQuestionnaire) {
      lines.push("QUESTIONNAIRE INPUTS");
      lines.push(`Goal: ${referenceQuestionnaire.goals}`);
      lines.push(`Experience: ${referenceQuestionnaire.experience}`);
      lines.push(`Days Per Week: ${referenceQuestionnaire.daysPerWeek}`);
      lines.push(`Equipment: ${formatQuestionnaireList(referenceQuestionnaire.equipment)}`);
      lines.push(`Pain Areas: ${formatQuestionnaireList(referenceQuestionnaire.painAreas)}`);
      lines.push("");
    }

    if (!referenceQuestionnaire) return lines.join("\n");
    lines.push("");
    lines.push("DETERMINISTIC PHASE PREVIEW (REFERENCE, ALL 3 DAYS)");
    for (let phaseIndex = 1; phaseIndex <= MAX_PHASE_INDEX; phaseIndex += 1) {
      const phaseMeta = getPhaseMetaByIndex(phaseIndex);
      const profile = getPhaseProfile(phaseIndex);
      lines.push(`${phaseMeta.phaseName} | ${profile.description}`);
      try {
        const phaseSignals = buildEngineSignals({
          questionnaire: referenceQuestionnaire,
          poseAnalysis: poseState.analysis ?? null,
          assessmentReport: poseState.report ?? null,
          history: {
            sessions: [],
            exerciseLogs: [],
            programProgress: progress,
          },
          nowIso: program.createdAt ?? new Date().toISOString(),
        });
        const phaseResult = generateProgram({
          mode: "weekly",
          signals: phaseSignals,
          nextProgramId: `${program.id}-reference-phase-${phaseIndex}`,
          phaseIndex,
          cycleIndex: 1,
          weekIndex: 1,
          totalWeekIndex: 1,
        });
        if (!("program" in phaseResult)) {
          throw new Error(phaseResult.message);
        }
        const phaseProgram = phaseResult.program;
        const referenceDays = [...phaseProgram.week]
          .sort((left, right) => left.dayIndex - right.dayIndex)
          .slice(0, 3);
        if (referenceDays.length) {
          referenceDays.forEach((phaseDay, dayListIndex) => {
            lines.push(...buildReferenceLinesForDay(phaseDay));
            if (dayListIndex < referenceDays.length - 1) {
              lines.push("");
            }
          });
        } else {
          lines.push("(phase day preview unavailable)");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to generate phase preview.";
        lines.push(`(preview unavailable) ${message}`);
      }
      if (phaseIndex < MAX_PHASE_INDEX) {
        lines.push("");
      }
    }

    return lines.join("\n");
  }, [data, poseState.analysis, poseState.report, program, programReferenceOpen, progress]);

  const currentSavedWeekSnapshot = useMemo(() => {
    if (!SHOW_TECHNICAL_PROGRAM_REFERENCE || !program || !data || !questionnaireSignature) {
      return { settled: false, text: "" };
    }
    const state = loadAppState();
    const metadataMatchesProgram =
      state?.activeProgramId === program.id &&
      state?.questionnaireSignature === questionnaireSignature;
    const programIsCompatible = isProgramCompatibleWithQuestionnaire(program, data, {
      questionnaireSignature,
      savedQuestionnaireSignature: state?.questionnaireSignature ?? null,
    });
    if (
      !metadataMatchesProgram ||
      !programIsCompatible ||
      settledProgramId !== program.id ||
      initialProgramLoadPending ||
      reconcileProgramPending
    ) {
      return { settled: false, text: "" };
    }
    const initialVariationSeed = metadataMatchesProgram
      ? state?.activeInitialVariationSeed
      : null;
    const phaseSnapshots = buildProgressionInspectionPhaseSnapshots({
      program,
      questionnaire: data,
      poseAnalysis: poseState.analysis ?? null,
      assessmentReport: poseState.report ?? null,
      programProgress: progress,
      initialVariationSeed,
    });
    const text = buildCurrentSavedWeekSnapshotText({
      program,
      questionnaire: data,
      generationMode: metadataMatchesProgram ? state?.activeGenerationMode : null,
      initialVariationSeed,
      phaseSnapshots,
    });
    return { settled: true, text };
  }, [
    data,
    poseState.analysis,
    poseState.report,
    program,
    progress,
    questionnaireSignature,
    settledProgramId,
    initialProgramLoadPending,
    reconcileProgramPending,
  ]);

  const currentSavedWeekSnapshotText = currentSavedWeekSnapshot.text;
  const isCurrentSavedWeekSnapshotSettled = currentSavedWeekSnapshot.settled;
  const currentSavedWeekSnapshotLoadingMessage = !program
    ? programGenerationInputsReady
      ? "Building and saving your weekly plan."
      : "Preparing your movement profile."
    : reconcileProgramPending
    ? "Checking the saved plan against your current profile."
    : initialProgramLoadPending
    ? "Finishing the initial saved plan."
    : "Checking the saved plan against your current profile.";

  const handleCopyCurrentSavedWeek = useCallback(() => {
    if (!isCurrentSavedWeekSnapshotSettled || !currentSavedWeekSnapshotText) return;
    const writeText = navigator.clipboard?.writeText;
    if (!writeText) {
      setCurrentWeekCopyStatus("Copy unavailable in this browser.");
      return;
    }
    void writeText.call(navigator.clipboard, currentSavedWeekSnapshotText).then(
      () => setCurrentWeekCopyStatus("Current saved week copied."),
      () => setCurrentWeekCopyStatus("Copy failed. Select the text manually.")
    );
  }, [currentSavedWeekSnapshotText, isCurrentSavedWeekSnapshotSettled]);

  const adherencePercent = useMemo(() => {
    if (!activeDaysPerWeek) return 0;
    return Math.round((completedCount / activeDaysPerWeek) * 100);
  }, [completedCount, activeDaysPerWeek]);

  const consistencyPercent = useMemo(() => {
    const fromMetrics = program?.phaseObjective?.metrics?.consistency;
    if (typeof fromMetrics === "number") {
      return Math.round(Math.max(0, Math.min(1, fromMetrics)) * 100);
    }
    return adherencePercent;
  }, [program?.phaseObjective?.metrics?.consistency, adherencePercent]);

  const painTrendLabel = useMemo(() => {
    const logs = lastTwoLogs.filter((entry) => entry.felt);
    if (!logs.length) return "No pain signals";
    if (logs.some((entry) => entry.painLevel === "severe" || entry.painLevel === "moderate")) {
      return "Needs caution";
    }
    if (logs.some((entry) => entry.painLevel === "mild" || entry.felt === "pain")) {
      return "Mild signals";
    }
    return "Stable";
  }, [lastTwoLogs]);

  const painTrendPercent = useMemo(() => {
    if (painTrendLabel === "Needs caution") return 30;
    if (painTrendLabel === "Mild signals") return 58;
    if (painTrendLabel === "Stable") return 82;
    return 74;
  }, [painTrendLabel]);

  const movementQualityPercent = useMemo(() => {
    const readiness = program?.phaseObjective?.metrics?.readiness;
    const consistency = program?.phaseObjective?.metrics?.consistency;
    if (typeof readiness === "number" && typeof consistency === "number") {
      return Math.round(((readiness + consistency) / 2) * 100);
    }
    return Math.max(55, consistencyPercent - 5);
  }, [
    program?.phaseObjective?.metrics?.readiness,
    program?.phaseObjective?.metrics?.consistency,
    consistencyPercent,
  ]);

  const movementQualityTrend = useMemo(() => {
    if (movementQualityPercent >= 78) return "Stable and improving";
    if (movementQualityPercent >= 62) return "Improving";
    return "Needs more consistency";
  }, [movementQualityPercent]);

  useEffect(() => {
    if (!program) return;
    const updatePhasePlan = async () => {
      const computedWeekIndex =
        Math.floor(completedSessions.length / program.daysPerWeek) + 1;
      const weekIndex = Math.max(program.weekIndex ?? 1, computedWeekIndex);
      const phaseIndex = Math.min(
        MAX_PHASE_INDEX,
        Math.max(1, program.phaseIndex ?? 1)
      );
      const phaseMeta = getPhaseMetaByIndex(phaseIndex);
      const phaseName = program.phaseName ?? phaseMeta.phaseName;
      const phaseProfile = getPhaseProfile(phaseIndex);
      const phase = {
        name: phaseName,
        phaseIndex,
        cycleIndex: program.cycleIndex ?? 1,
        weekIndex,
        weekCount: weekIndex,
        goal: phaseProfile.description,
      };

      const now = Date.now();
      const recentSessions = completedSessions.filter((session) => {
        if (!session.completedAt) return false;
        const timestamp = Date.parse(session.completedAt);
        if (Number.isNaN(timestamp)) return false;
        return now - timestamp <= 7 * 24 * 60 * 60 * 1000;
      });

      const recentLogs = await listExerciseLogsBySessionIds(
        recentSessions.map((session) => session.id)
      );

      const feedbackRatings = [
        ...recentSessions
          .map((session) => session.sessionFeedback)
          .filter(Boolean),
        ...recentLogs.map((log) => log.felt).filter(Boolean),
      ];

      const painFlag = feedbackRatings.includes("pain");
      const hardCount = feedbackRatings.filter((rating) => rating === "hard")
        .length;
      const fatigueFlag =
        feedbackRatings.length >= 3 &&
        hardCount / feedbackRatings.length >= 0.5;
      const complianceRate = Math.min(
        1,
        recentSessions.length / program.daysPerWeek
      );

      const nextWeekPlan = buildNextWeekPlan({
        complianceRate,
        painFlag,
        fatigueFlag,
        phaseName,
      });

      const needsUpdate =
        program.weekIndex !== weekIndex ||
        program.phaseName !== phaseName ||
        program.phase?.weekIndex !== phase.weekIndex ||
        program.phase?.name !== phase.name ||
        program.nextWeekPlan?.summary !== nextWeekPlan.summary;

      if (needsUpdate) {
        const updatedProgram = {
          ...program,
          phaseIndex,
          phaseName,
          weekIndex,
          phase,
          nextWeekPlan,
          updatedAt: new Date().toISOString(),
        };
        await saveProgram(updatedProgram);
        setProgram(updatedProgram);
      }
    };

    updatePhasePlan();
  }, [program, completedSessions, data]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !programId) return;
    if (!baselineForActiveProgram) return;
    console.log(
      `[Week View] baseline=${new Date(baselineForActiveProgram).toISOString()} programId=${activeProgramId ?? programId}`
    );
  }, [programId, activeProgramId, baselineForActiveProgram]);

  if (!isReady) {
    return (
      <div className="ui-card ui-soft-surface-raised p-6">
        <p className="text-sm text-slate-300">Loading your Praxis plan...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ui-card ui-soft-surface-raised rounded-lg border-dashed p-6 text-center">
        <p className="text-sm text-slate-300">
          We need your movement profile answers to build your Praxis plan.
        </p>
        <Link
          href="/questionnaire"
          className="mt-4 inline-flex rounded-lg bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)]"
        >
          Build profile
        </Link>
      </div>
    );
  }

  if (!program) {
    if (programLoadIssue) {
      return (
        <div className="ui-card ui-soft-surface-raised p-6">
          <p className="text-sm font-semibold text-white">
            We couldn&apos;t build your weekly plan yet.
          </p>
          <p className="mt-2 text-sm text-slate-300">{programLoadIssue}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setProgramLoadIssue(null);
                window.location.reload();
              }}
            >
              Try again
            </Button>
            <Link href="/questionnaire">
              <Button variant="primary">Review profile</Button>
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="ui-card ui-soft-surface-raised p-6">
          <p className="text-sm text-slate-300">Building your weekly plan...</p>
        </div>
        {SHOW_TECHNICAL_PROGRAM_REFERENCE ? (
          <CurrentSavedProgramSnapshotLoadingCard
            message={currentSavedWeekSnapshotLoadingMessage}
          />
        ) : null}
      </div>
    );
  }

  const selectedDayProgram = program.week[effectiveSelectedDay];
  const phaseName = program.phaseName ?? getPhaseMetaByIndex(currentPhaseIndex).phaseName;
  const phaseDescription = getPhaseProfile(currentPhaseIndex).description;
  const cycleCurrent = Math.max(1, phaseGate.cyclesCompletedInPhase + 1);
  const weekProgressPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((completedCount + inProgressCount * 0.5) / Math.max(1, activeDaysPerWeek)) * 100
      )
    )
  );
  const phaseGoalText =
    program.phaseObjective?.weekIntent ??
    program.phaseObjective?.objective ??
    "Build movement control and clean execution.";
  const {
    movementPatternItems,
    stabilityPatternItems,
    compensationPatternItems,
    weeklyPriorities,
    coachFocus,
  } = buildProgramDashboardCopy({
    program,
    assessmentReport: poseState.report,
    painTrendLabel,
  });
  const encouragementMessage =
    consistencyPercent >= 72 && (painTrendLabel === "Stable" || painTrendLabel === "No pain signals")
      ? "Your consistency is accelerating adaptation."
      : consistencyPercent >= 62
      ? "Steady consistency is building durable progress."
      : painTrendLabel === "Needs caution"
      ? "Stay controlled this week and prioritize clean reps."
      : null;

  const workoutsRemaining = Math.max(
    0,
    phaseGate.minWorkouts - phaseGate.workoutsCompletedInPhase
  );
  const daysRemaining = Math.max(0, phaseGate.minDays - phaseGate.daysSincePhaseStart);
  const gateRemainingText = `${workoutsRemaining} workout${workoutsRemaining === 1 ? "" : "s"} remaining or ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`;
  const gateSatisfiedText =
    phaseGate.satisfiedBy === "both"
      ? "All gate requirements satisfied"
      : phaseGate.satisfiedBy === "workouts"
      ? "Workout gate requirement satisfied"
      : phaseGate.satisfiedBy === "days"
      ? "Days-in-phase gate requirement satisfied"
      : gateRemainingText;
  const phaseGateStatusLabel =
    currentPhaseIndex >= MAX_PHASE_INDEX
      ? "Phase 3 active"
      : phaseAdvanceReady
      ? "Ready to advance"
      : "Gate locked";
  const phaseGateStatusDetail =
    currentPhaseIndex >= MAX_PHASE_INDEX
      ? `Phase ${MAX_PHASE_INDEX} is active. Continue building completion and execution quality.`
      : phaseAdvanceReady
      ? gateSatisfiedText
      : gateRemainingText;
  const phaseGateProgressText = `Workouts in phase: ${phaseGate.workoutsCompletedInPhase}/${phaseGate.minWorkouts} • Days in phase: ${phaseGate.daysSincePhaseStart}/${phaseGate.minDays}`;
  const phaseRequirementsText = `Complete ${phaseGate.minWorkouts} workouts or spend at least ${phaseGate.minDays} days in this phase.`;
  const adaptationTrendItems = [
    ...(program.sessionAdaptation?.reasons ?? []),
    ...(program.sessionAdaptation?.appliedChanges ?? []),
    ...(program.sessionAdaptation?.masteryChecks ?? []),
  ]
    .filter(Boolean)
    .slice(0, 4);

  const exerciseRationaleItems = (selectedDayProgram?.routine ?? []).flatMap(
    (item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return [];
      const why = buildWhyPicked(exercise);
      const primaryReason = optimizerReasonsByExercise[item.exerciseId]?.[0] ?? null;
      return [
        {
          exerciseId: item.exerciseId,
          exerciseName: exercise.name,
          section: item.section ?? "support",
          primaryReason,
          contextReason: why.purpose,
          setup: why.setup,
          progressions: why.progressions ?? [],
          regressions: why.regressions ?? [],
        },
      ];
    }
  );
  const exerciseRationaleById = new Map(
    exerciseRationaleItems.map((item) => [item.exerciseId, item] as const)
  );

  const coachWin =
    movementQualityPercent >= 75
      ? "Biggest win: Movement quality is climbing with cleaner execution."
      : consistencyPercent >= 70
      ? "Biggest win: Consistency is strong and adaptation is compounding."
      : adherencePercent >= 65
      ? "Biggest win: Completion is trending up this week."
      : "Biggest win: You are building momentum by staying engaged.";
  const coachRisk =
    painTrendLabel === "Needs caution"
      ? "Biggest risk: Pain trend is elevated; keep range and load conservative."
      : adherencePercent < 50
      ? "Biggest risk: Missed sessions can slow progression and recovery."
      : movementQualityPercent < 60
      ? "Biggest risk: Movement quality is inconsistent under fatigue."
      : "Biggest risk: Keep recovery habits steady to avoid regression.";
  const coachAction = activeSessionId
    ? "Next best action: Resume your active session and finish today's key movements."
    : `Next best action: Complete Day ${effectiveNextDayIndex + 1} with controlled tempo and clean reps.`;
  const coachNotes: [string, string, string] = [
    coachWin,
    coachRisk,
    coachAction,
  ];

  const whyChangedLine =
    program.sessionAdaptation?.summary ??
    program.phaseOptimizerReport?.summary ??
    "Program adjusted from recent performance signals.";

  const progressPreviewLines = [
    `Consistency ${consistencyPercent}% • Completion ${adherencePercent}%`,
    `Pain trend: ${painTrendLabel} • Movement quality: ${movementQualityTrend}`,
  ];
  const progressPreviewChips = [
    `Workouts in phase: ${phaseGate.workoutsCompletedInPhase}/${phaseGate.minWorkouts}`,
    `Days in phase: ${phaseGate.daysSincePhaseStart}/${phaseGate.minDays}`,
    phaseGateStatusLabel,
  ];

  const knowledgePreviewLines = [
    whyChangedLine,
    poseState.report
      ? "Assessment details are grouped by pattern and trend."
      : "Upload posture photos to add deeper movement analysis.",
  ];
  const knowledgePreviewChips = [
    "Movement patterns",
    "Stability/control",
    "Compensation tendencies",
    "Adaptation/progression",
  ];

  const readinessScore = (() => {
    if (heroCta.label === "Continue Session") return 70;

    const now = Date.now();
    let score = 75;

    const completedSessionTimestamps = completedSessions
      .map((session) => {
        const parsed = Date.parse(
          session.completedAt ?? session.updatedAt ?? session.createdAt
        );
        return Number.isNaN(parsed) ? null : parsed;
      })
      .filter((timestamp): timestamp is number => timestamp !== null);

    if (completedSessionTimestamps.length > 0) {
      const latestSessionAt = Math.max(...completedSessionTimestamps);
      const hoursSinceLatest = (now - latestSessionAt) / (60 * 60 * 1000);
      if (hoursSinceLatest < 18) {
        score -= 10;
      }
      if (hoursSinceLatest >= 24 * 7) {
        score -= 5;
      }

      const sessionsInLast3Days = completedSessionTimestamps.filter(
        (timestamp) => now - timestamp <= 24 * 3 * 60 * 60 * 1000
      ).length;
      if (sessionsInLast3Days >= 2) {
        score -= 10;
      }
    }

    const hasPainFlagToday = lastTwoLogs.some((log) => {
      const hasPainSignal =
        (log.painLevel && log.painLevel !== "none") || log.felt === "pain";
      if (!hasPainSignal) return false;
      const parsed = Date.parse(log.createdAt ?? "");
      if (Number.isNaN(parsed)) return false;
      return now - parsed <= 24 * 60 * 60 * 1000;
    });
    if (hasPainFlagToday) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  })();

  const readinessLabel =
    readinessScore >= 80 ? "High" : readinessScore >= 55 ? "Good" : "Caution";
  const shouldPulsePrimaryCta =
    heroCta.label === "Start Today's Session" &&
    !completedDaySet.has(effectiveNextDayIndex);
  const showWeeklyCompletionNudge =
    completedCount < activeDaysPerWeek &&
    !completedDaySet.has(effectiveNextDayIndex);

  const heroMetricChips = [
    `Training readiness: ${readinessScore}% (${readinessLabel})`,
    `Week: ${completedCount}/${activeDaysPerWeek} days`,
    `Cycle: ${program.cycleIndex ?? cycleCurrent}`,
  ].filter((chip): chip is string => Boolean(chip));

  const coachToday = (() => {
    if (heroCta.label === "Continue Session") return "Today: Continue your active session.";
    return `Today: Start Day ${effectiveNextDayIndex + 1} and finish all planned sections.`;
  })();
  const coachWatch =
    painTrendLabel === "Needs caution"
      ? "Watch: Keep pain below moderate and reduce range/load if needed."
      : adherencePercent < 60
      ? "Watch: Protect consistency by completing the next planned day."
      : "Watch: Stay smooth and pain-free; prioritize control over load.";
  const coachSummaryBullets: Array<{ label: string; text: string }> = [
    { label: "Today", text: coachToday.replace(/^Today:\s*/i, "") },
    { label: "Focus", text: coachFocus },
    { label: "Watch", text: coachWatch.replace(/^Watch:\s*/i, "") },
  ];

  const hasAdaptationCallout = Boolean(
    program.phaseOptimizerReport ||
      program.sessionAdaptation?.summary ||
      adaptationTrendItems.length
  );
  const hasSystemAdjustments = hasAdaptationCallout;
  const systemAdjustmentSummary =
    program.sessionAdaptation?.summary ??
    program.phaseOptimizerReport?.summary ??
    "System updated your plan from recent completion and pain signals.";
  const systemAdjustmentChanged = program.phaseOptimizerReport
    ? `${program.phaseOptimizerReport.changedSlots}/${program.phaseOptimizerReport.totalSlots} slots were adjusted.`
    : program.sessionAdaptation?.appliedChanges?.[0] ??
      "Session focus and progression guidance were tuned.";
  const systemAdjustmentWhy =
    program.sessionAdaptation?.reasons?.[0] ??
    program.sessionAdaptation?.summary ??
    "Adjustments reflect recent completion pace and pain feedback.";
  const systemAdjustmentFocus =
    program.sessionAdaptation?.masteryChecks?.[0] ??
    program.phaseObjective?.weekIntent ??
    "Focus now on clean execution and stable control.";
  const systemAdjustmentChips = [
    program.phaseOptimizerReport
      ? `${program.phaseOptimizerReport.changedSlots}/${program.phaseOptimizerReport.totalSlots} changed`
      : null,
    ...(program.sessionAdaptation?.dataSignals ?? []).slice(0, 2),
  ].filter((chip): chip is string => Boolean(chip));

  const movementSummary =
    movementPatternItems[0] ?? "Movement patterns will populate as sessions complete.";
  const stabilitySummary =
    stabilityPatternItems[0] ?? "Control trends will populate from logs and assessments.";
  const compensationSummary =
    compensationPatternItems[0] ??
    "Compensation tendencies will appear as movement data accumulates.";
  const adaptationSummary =
    adaptationTrendItems[0] ??
    "Complete one full week to unlock richer adaptation trends.";

  const knowledgeCards: KnowledgeCard[] = [
    {
      key: "movement",
      title: "Movement patterns",
      summary: movementSummary,
      items: movementPatternItems,
    },
    {
      key: "stability",
      title: "Stability/control",
      summary: stabilitySummary,
      items: stabilityPatternItems,
    },
    {
      key: "compensation",
      title: "Compensation tendencies",
      summary: compensationSummary,
      items: compensationPatternItems,
    },
    {
      key: "adaptation",
      title: "Adaptation/progression",
      summary: adaptationSummary,
      items: adaptationTrendItems.length
        ? adaptationTrendItems
        : ["Complete one full week to unlock richer adaptation trends."],
    },
  ];

  const todayPlanDayIndex = Math.min(
    Math.max(0, sessionLaunchDayIndex),
    Math.max(0, program.week.length - 1)
  );
  const weekViewStartDay =
    weekViewSelectedDay !== null &&
    weekViewSelectedDay >= 0 &&
    weekViewSelectedDay < program.week.length
      ? weekViewSelectedDay
      : todayPlanDayIndex;
  const weekViewDay = program.week[weekViewStartDay];
  const weekViewMainAccessoryRoutine = weekViewDay.routine.filter(
    (item) => item.section === "main" || item.section === "accessory"
  );
  const weekViewStructuredPrepEntries = [
    ...(weekViewDay.warmup?.items.map((item, index) => ({
      key: `structured-warmup-${item.id}-${index}`,
      name: item.name,
      sectionLabel: "warmup",
      prescription: item.reps ?? (item.durationSec ? `${item.durationSec}s` : null),
      rationale: item.cue ?? "Prepare range and control before loaded work.",
    })) ?? []),
    ...(weekViewDay.activation?.items.map((item, index) => ({
      key: `structured-activation-${item.id}-${index}`,
      name: item.name,
      sectionLabel: "activation",
      prescription: item.reps ?? (item.durationSec ? `${item.durationSec}s` : null),
      rationale: item.cue ?? "Prime movement quality before main sets.",
    })) ?? []),
  ];
  const weekViewStructuredCooldownEntries =
    weekViewDay.cooldown?.items.map((item, index) => ({
      key: `structured-cooldown-${item.id}-${index}`,
      name: item.name,
      sectionLabel: "cooldown",
      prescription: item.reps ?? (item.durationSec ? `${item.durationSec}s` : null),
      rationale: item.cue ?? "Downshift and recover after the session.",
    })) ?? [];
  const weekViewMainAccessoryEntries = weekViewMainAccessoryRoutine.flatMap((item, index) => {
    const exercise = exerciseById(item.exerciseId);
    if (!exercise) return [];
    const rationale =
      item.rationale?.whyThisExercise ??
      optimizerReasonsByExercise[item.exerciseId]?.[0] ??
      exerciseRationaleById.get(item.exerciseId)?.primaryReason ??
      exerciseRationaleById.get(item.exerciseId)?.contextReason ??
      buildWhyPicked(exercise).purpose ??
      "Rationale isn’t available for this exercise yet.";
    const prescription = formatRoutineItemPrescription(item);
    return [
      {
        key: `routine-main-${item.exerciseId}-${index}`,
        name: exercise.name,
        sectionLabel: item.section ?? "support",
        prescription,
        rationale,
      },
    ];
  });
  const weekViewFallbackRoutineEntries = weekViewDay.routine.flatMap((item, index) => {
    const exercise = exerciseById(item.exerciseId);
    if (!exercise) return [];
    const rationale =
      item.rationale?.whyThisExercise ??
      optimizerReasonsByExercise[item.exerciseId]?.[0] ??
      exerciseRationaleById.get(item.exerciseId)?.primaryReason ??
      exerciseRationaleById.get(item.exerciseId)?.contextReason ??
      buildWhyPicked(exercise).purpose ??
      "Rationale isn’t available for this exercise yet.";
    const prescription = formatRoutineItemPrescription(item);
    return [
      {
        key: `routine-fallback-${item.exerciseId}-${index}`,
        name: exercise.name,
        sectionLabel: item.section ?? "support",
        prescription,
        rationale,
      },
    ];
  });
  const weekViewDetailEntries: WeekViewDetailEntry[] =
    weekViewStructuredPrepEntries.length > 0 || weekViewStructuredCooldownEntries.length > 0
      ? [
          ...weekViewStructuredPrepEntries,
          ...weekViewMainAccessoryEntries,
          ...weekViewStructuredCooldownEntries,
        ]
      : weekViewFallbackRoutineEntries;
  const weekViewBaselineDebugTitle =
    process.env.NODE_ENV === "development" && baselineForActiveProgram
      ? `Baseline: ${new Date(baselineForActiveProgram).toISOString()}`
      : undefined;

  const openKnowledgeAnalysis = () => {
    setActiveMode("insights");
    setKnowledgeExpanded(true);
    setKnowledgeHighlighted(true);
    window.requestAnimationFrame(() => {
      knowledgeSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    if (knowledgeHighlightTimeoutRef.current !== null) {
      window.clearTimeout(knowledgeHighlightTimeoutRef.current);
    }
    knowledgeHighlightTimeoutRef.current = window.setTimeout(() => {
      setKnowledgeHighlighted(false);
    }, 900);
  };

  const openSystemAdjustments = () => {
    setActiveMode("insights");
    setSystemAdjustmentsExpanded(true);
    window.requestAnimationFrame(() => {
      systemAdjustmentsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const scrollWeekViewDetailsIntoView = (
    behavior: ScrollBehavior = "smooth",
    block: ScrollLogicalPosition = "nearest"
  ) => {
    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
      return;
    }
    if (!weekViewDetailsRef.current) return;
    try {
      weekViewDetailsRef.current.scrollIntoView({
        behavior,
        block,
      });
    } catch {
      weekViewDetailsRef.current.scrollIntoView();
    }
  };

  const openWeekViewDayDetails = (
    dayIndex: number,
    options?: { scrollToDetails?: boolean }
  ) => {
    setSelectedDay(dayIndex);
    setWeekViewSelectedDay(dayIndex);
    setWeekViewDetailsOpen(true);
    if (!options?.scrollToDetails) return;
    window.requestAnimationFrame(() => {
      scrollWeekViewDetailsIntoView("smooth", "start");
    });
  };

  const focusTodayPlanInWeekView = () => {
    setActiveMode("week");
    openWeekViewDayDetails(todayPlanDayIndex);
    window.requestAnimationFrame(() => {
      weekViewSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.requestAnimationFrame(() => {
        scrollWeekViewDetailsIntoView("smooth", "nearest");
      });
    });
  };

  const resetCurrentProgress = async () => {
    if (!program) return;
    setResetProgressWorking(true);
    setResetProgressMessage(null);
    try {
      const resetAt = Date.now();
      const resetAtIso = new Date(resetAt).toISOString();
      const nextProgress: ProgramProgress = {
        programId: program.id,
        lastCompletedDayIndex: null,
        nextDayIndex: 0,
        completedDayIndices: [],
        phaseIndex: program.phaseIndex ?? 1,
        phaseStartedAt: resetAtIso,
        cyclesCompletedInPhase: 0,
        workoutsCompletedInPhase: 0,
        daysPerWeek: program.daysPerWeek,
        weekIndex: Math.max(1, program.weekIndex ?? 1),
        countedWeekKeys: [],
        updatedAt: resetAtIso,
      };
      await saveProgramProgress(nextProgress);
      await clearDraftsByProgramId(program.id);
      setProgress(nextProgress);
      setSelectedDay(0);
      setWeekViewSelectedDay(null);
      setWeekViewDetailsOpen(false);
      setActiveProgramBaselineAt(resetAt);
      saveAppState({
        programId: program.id,
        activeProgramId: program.id,
        activeProgramBaselineAt: resetAt,
        selectedDay: 0,
        activeSessionId: undefined,
        activePhaseIndex: program.phaseIndex ?? 1,
        activeCycleIndex: program.cycleIndex ?? 1,
        questionnaireSignature: questionnaireSignature ?? undefined,
        lastRoute: "/results",
      });
      setResetProgressConfirmOpen(false);
      setResetProgressMessage("Current progress reset. Your workout history is still saved.");
      setActiveMode("history");
    } catch {
      setResetProgressMessage("Could not reset current progress. Please try again.");
    } finally {
      setResetProgressWorking(false);
    }
  };

  const progressLocked = dashboardLevel < 2;
  const historyLocked = dashboardLevel < 2;
  const insightsLocked = dashboardLevel < 3;
  const dashboardLevelLabel =
    dashboardLevel === 3
      ? "Level 3 analysis"
      : dashboardLevel === 2
      ? "Level 2 progress"
      : "Level 1 foundation";
  const dashboardLevelDescription =
    dashboardLevel === 3
      ? "Full-cycle analysis is available from your completed week."
    : dashboardLevel === 2
      ? "Progress and history are unlocked from your first completed workout."
      : "Assessment, Today, and Week are ready. Complete one workout to unlock Progress and History.";
  const dashboardModes: Array<{
    key: DashboardMode;
    title: string;
    eyebrow: string;
    summary: string;
    icon: string;
    locked?: boolean;
    lockReason?: string;
  }> = [
    {
      key: "today",
      title: "Today",
      eyebrow: "Next",
      summary: `Day ${sessionLaunchDayIndex + 1}: ${program.week[sessionLaunchDayIndex]?.title ?? "current plan"}`,
      icon: "T",
    },
    {
      key: "week",
      title: "Week",
      eyebrow: "Plan",
      summary: `${completedCount}/${activeDaysPerWeek} days complete with ${inProgressCount} in progress.`,
      icon: "W",
    },
    {
      key: "progress",
      title: "Progress",
      eyebrow: "Level 2",
      summary: `Consistency ${consistencyPercent}% with movement quality ${movementQualityPercent}%.`,
      icon: "P",
      locked: progressLocked,
      lockReason: "Complete one workout to unlock your progress summary.",
    },
    {
      key: "insights",
      title: "Insights",
      eyebrow: "Level 3",
      summary: "Pattern, stability, compensation, and adaptation analysis.",
      icon: "I",
      locked: insightsLocked,
      lockReason: "Complete one full week or cycle to unlock deeper analysis.",
    },
    {
      key: "history",
      title: "History",
      eyebrow: "Level 2",
      summary: `${totalCompletedWorkoutCount} completed workouts saved across your history.`,
      icon: "H",
      locked: historyLocked,
      lockReason: "Complete one workout to unlock session history.",
    },
    {
      key: "account",
      title: "Billing / Account",
      eyebrow: authEnabled ? (plan === "pro" ? "Pro" : "Free") : "Local",
      summary: authEnabled
        ? "Manage plan status and account data."
        : "Review local data controls.",
      icon: "A",
    },
  ];
  const activeModeConfig =
    dashboardModes.find((mode) => mode.key === activeMode) ?? dashboardModes[0];
  const activeModeLocked = Boolean(activeModeConfig.locked);
  const todayModeDay =
    program.week[sessionLaunchDayIndex] ?? selectedDayProgram ?? program.week[0];
  const todayModeEntries = (todayModeDay?.routine ?? [])
    .map((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return null;
      const prescription = formatRoutineItemPrescription(item);
      return {
        key: `${item.exerciseId}-${item.section}`,
        item,
        name: exercise.name,
        section: item.section ?? "work",
        prescription,
      };
    })
    .filter(
      (
        entry
      ): entry is {
        key: string;
        item: ProgramRoutineItem;
        name: string;
        section: string;
        prescription: string | null;
      } => Boolean(entry)
    )
    .slice(0, 5);
  const showTrainingSyncIssue =
    trainingSyncStatus.state === "error" &&
    trainingSyncStatus.authenticated !== false;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {levelUpNotice ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex justify-center px-4 sm:top-6"
          data-testid="level-up-celebration"
          aria-live="polite"
        >
          <div className="level-up-pop ui-card ui-soft-surface-raised relative w-full max-w-sm overflow-hidden rounded-lg border-sky-300/35 px-4 py-3 text-slate-100 shadow-[0_18px_60px_rgba(14,165,233,0.24)] sm:max-w-md sm:px-5 sm:py-4">
            <div className="relative z-10">
              <p className="ui-kicker text-sky-100">{levelUpNotice.eyebrow}</p>
              <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                {levelUpNotice.title}
              </p>
              <p className="mt-1 text-sm text-slate-300">{levelUpNotice.body}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="order-1">
        <DashboardHero
          greeting={heroGreeting}
          phaseName={phaseName}
          workoutsCompletedInPhase={phaseGate.workoutsCompletedInPhase}
          workoutTarget={phaseGate.minWorkouts}
          daysInPhase={phaseGate.daysSincePhaseStart}
          dayTarget={phaseGate.minDays}
          weekCompletedDays={completedCount}
          weekTargetDays={activeDaysPerWeek}
          weekProgressPercent={weekProgressPercent}
          phaseGateStatusLabel={phaseGateStatusLabel}
          phaseGateStatusDetail={phaseGateStatusDetail}
          phaseGateReady={phaseAdvanceReady}
          phaseGateActionLabel={
            phaseAdvanceReady && !phaseReadyNoticeOpen
              ? `Move to Phase ${nextPhaseIndex}`
              : null
          }
          onPhaseGateAction={
            phaseAdvanceReady && !phaseReadyNoticeOpen
              ? openPhaseAdvancePrompt
              : null
          }
          readinessScore={readinessScore}
          weeklyConsistencyCount={workoutsThisWeek}
          weeklyConsistencyTarget={program?.daysPerWeek ?? data?.daysPerWeek ?? null}
          phaseGoal={phaseGoalText}
          encouragement={encouragementMessage}
          metricChips={heroMetricChips}
          ctaLabel={heroCta.label}
          ctaHref={heroCta.href}
          ctaPulse={shouldPulsePrimaryCta}
        />
      </div>

      <AssessmentStatusCard status={assessmentStatus} />

      {showTrainingSyncIssue ? (
        <section
          className="ui-soft-surface order-2 rounded-lg border border-amber-300/25 px-4 py-3 text-amber-100"
          data-testid="training-sync-status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold">Local progress is saved</p>
          <p className="mt-1 text-xs text-amber-100/80">
            Cloud sync could not finish. We&apos;ll keep using this device and retry
            automatically.
          </p>
        </section>
      ) : null}

      {phaseReadyNoticeOpen ? (
        <section
          className="ui-card ui-soft-surface-raised order-2 rounded-lg border-sky-300/35 p-5 text-slate-100 sm:p-6"
          data-testid="phase-ready-notice"
          aria-live="polite"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="ui-kicker text-sky-100">Phase gate reached</p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                You&apos;ve reached the Phase {nextPhaseIndex} gate
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {gateSatisfiedText}: Workouts in phase {phaseGate.workoutsCompletedInPhase}/{phaseGate.minWorkouts} and Days in phase {phaseGate.daysSincePhaseStart}/{phaseGate.minDays}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={openPhaseAdvancePrompt}>
                Move now
              </Button>
              <Button variant="secondary" onClick={dismissPhaseReadyNotice}>
                Later
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {showSessionCompleteNotice ? (
        <section
          className={`ui-soft-surface order-2 rounded-lg px-4 py-3 text-emerald-100 transition-opacity duration-300 ${
            sessionCompleteNoticeFading ? "opacity-0" : "opacity-100"
          }`}
          aria-live="polite"
        >
          <p className="text-sm font-semibold">Session complete</p>
          <p className="mt-1 text-xs text-emerald-200/85">
            Your Praxis plan has been updated from today&apos;s performance.
          </p>
        </section>
      ) : null}

      {showWeeklyCompletionNudge ? (
        <section className="ui-soft-surface order-2 rounded-lg px-4 py-3 text-xs text-slate-300">
          Complete today&apos;s session to maintain progression.
        </section>
      ) : null}

      <section className="ui-card ui-soft-surface-raised order-3 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ui-kicker">Praxis dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {activeModeConfig.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              {dashboardLevelDescription}
            </p>
          </div>
          <div className="rounded-lg border border-slate-400/20 bg-slate-950/38 px-4 py-3 text-xs text-slate-200">
            <p className="font-semibold text-white">{dashboardLevelLabel}</p>
            <p className="mt-1 text-slate-400">
              {totalCompletedWorkoutCount} workouts logged
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardModes.map((mode) => (
            <DashboardModeCard
              key={mode.key}
              title={mode.title}
              eyebrow={mode.eyebrow}
              summary={mode.summary}
              icon={mode.icon}
              active={activeMode === mode.key}
              locked={mode.locked}
              lockReason={mode.lockReason}
              onClick={() => setActiveMode(mode.key)}
            />
          ))}
        </div>
      </section>

      {activeModeLocked ? (
        <section className="ui-card ui-soft-surface order-4 p-5 sm:p-6">
          <p className="ui-kicker">Unlock Path</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {activeModeConfig.title} unlocks with real use
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            {activeModeConfig.lockReason}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-300/18 bg-emerald-300/8 p-4">
              <p className="text-xs font-semibold text-emerald-100">Level 1</p>
              <p className="mt-1 text-sm text-slate-200">Assessment, Today, Week View</p>
            </div>
            <div className="rounded-lg border border-sky-300/18 bg-sky-300/8 p-4">
              <p className="text-xs font-semibold text-sky-100">Level 2</p>
              <p className="mt-1 text-sm text-slate-200">History and Progress Summary</p>
            </div>
            <div className="rounded-lg border border-amber-300/18 bg-amber-300/8 p-4">
              <p className="text-xs font-semibold text-amber-100">Level 3</p>
              <p className="mt-1 text-sm text-slate-200">Deeper Knowledge and Analysis</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={heroCta.href} scroll>
              <Button variant="primary">Start today&apos;s session</Button>
            </Link>
            <Button variant="secondary" onClick={() => setActiveMode("week")}>
              Review week plan
            </Button>
          </div>
        </section>
      ) : null}

      {activeMode === "today" && !activeModeLocked ? (
        <section className="ui-card ui-soft-surface-raised order-4 p-5 sm:p-6" data-testid="today-mode-panel">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
            <div>
              <p className="ui-kicker">Today</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                Day {sessionLaunchDayIndex + 1}
                {todayModeDay?.title ? `: ${todayModeDay.title}` : ""}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {coachAction.replace(/^Next best action:\s*/i, "")}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {coachSummaryBullets.map((item) => (
                  <div
                    key={item.label}
                    className="ui-soft-surface rounded-lg px-3 py-3"
                  >
                    <p className="text-xs font-semibold text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-100">{item.text}</p>
                  </div>
                ))}
              </div>
              {hasAdaptationCallout ? (
                <div className="ui-soft-surface mt-5 rounded-lg px-3 py-3 text-xs text-slate-200">
                  <p>System adapted this week to improve stability and execution quality.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={openKnowledgeAnalysis}
                      className={secondaryActionBtn}
                    >
                      Why
                    </button>
                    <button
                      type="button"
                      onClick={openSystemAdjustments}
                      className={secondaryActionBtn}
                    >
                      Adjustments
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="ui-soft-surface rounded-lg p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Session Entry
              </p>
              <div className="mt-3 space-y-2">
                {todayModeEntries.length ? (
                  todayModeEntries.map((entry) => (
                    <div
                      key={entry.key}
                      className="rounded-lg border border-slate-500/20 bg-slate-950/42 px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">{entry.name}</p>
                        <span className="rounded-md border border-slate-600/60 px-2 py-0.5 text-[10px] uppercase text-slate-300">
                          {entry.section}
                        </span>
                      </div>
                      <RoutineItemCoachingDetails
                        item={entry.item}
                        fallbackDose={entry.prescription}
                        showDetails={false}
                        tone="dark"
                        className="mt-1"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Today&apos;s plan is loading.</p>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/session?programId=${resolvedSessionProgramId ?? program.id}&dayIndex=${sessionLaunchDayIndex}`}
                  scroll
                >
                  <Button
                    variant="primary"
                    data-testid="start-selected-day"
                    className="h-12 w-full"
                  >
                    Start Selected Day
                  </Button>
                </Link>
                <Button variant="secondary" onClick={() => setActiveMode("week")}>
                  View full week
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {program && SHOW_TECHNICAL_PROGRAM_REFERENCE ? (
        <>
          {SHOW_PHASE_PREVIEW_REFERENCE ? (
            <ProgramReferenceCard
              isOpen={programReferenceOpen}
              referenceText={temporaryProgramReferenceText}
              onToggle={() => setProgramReferenceOpen((current) => !current)}
            />
          ) : null}
          {isCurrentSavedWeekSnapshotSettled ? (
            <ProgramReferenceCard
              title="Current Saved Program Snapshot"
              description="Development-only plan reference for the saved live program and inspection snapshots."
              isOpen
              referenceText={currentSavedWeekSnapshotText}
              cardTestId="current-saved-week-card"
              bodyTestId="current-saved-week-body"
              copyLabel="Copy Full Progression Snapshot"
              onCopy={handleCopyCurrentSavedWeek}
              copyStatus={currentWeekCopyStatus}
              className="order-20 p-3 opacity-70 sm:p-4"
              bodyClassName="mt-3 max-h-[27rem] overflow-auto rounded-lg border border-slate-500/20 bg-slate-950/45 p-3"
            />
          ) : (
            <CurrentSavedProgramSnapshotLoadingCard
              message={currentSavedWeekSnapshotLoadingMessage}
            />
          )}
        </>
      ) : null}

      {activeMode === "week" && !activeModeLocked ? (
        <WeekViewPanel
          program={program}
          sectionRef={weekViewSectionRef}
          detailsRef={weekViewDetailsRef}
          resolvedSessionProgramId={resolvedSessionProgramId}
          weekViewStartDay={weekViewStartDay}
          sessionLaunchDayIndex={sessionLaunchDayIndex}
          completedCount={completedCount}
          activeDaysPerWeek={activeDaysPerWeek}
          inProgressCount={inProgressCount}
          weekViewBaselineDebugTitle={weekViewBaselineDebugTitle}
          completedDaySet={completedDaySet}
          effectiveInProgressDaySet={effectiveInProgressDaySet}
          weekViewDetailsOpen={weekViewDetailsOpen}
          weekViewDay={weekViewDay}
          weekViewDetailEntries={weekViewDetailEntries}
          isFreePlan={isFreePlan}
          isDayLocked={isDayLocked}
          onFocusTodayPlan={focusTodayPlanInWeekView}
          onOpenDayDetails={openWeekViewDayDetails}
          onCloseDetails={() => setWeekViewDetailsOpen(false)}
          onToggleDetails={() => setWeekViewDetailsOpen(false)}
        />
      ) : null}

      {activeMode === "insights" && !activeModeLocked ? (
        <InsightsPanel
          dailyInsight={dailyInsight}
          coachNotes={coachNotes}
          weeklyPriorities={weeklyPriorities}
        />
      ) : null}

      {activeMode === "insights" && !activeModeLocked && hasSystemAdjustments ? (
        <div ref={systemAdjustmentsSectionRef} className="order-4 scroll-mt-24">
          <ExpandableSection
            title="System Adjustments"
            subtitle="What the system changed and why."
            previewLines={[systemAdjustmentSummary]}
            previewChips={systemAdjustmentChips}
            expanded={systemAdjustmentsExpanded}
            onExpandedChange={setSystemAdjustmentsExpanded}
          >
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">What changed:</span>{" "}
                {systemAdjustmentChanged}
              </p>
              <p>
                <span className="font-medium text-slate-900">Why it changed:</span>{" "}
                {systemAdjustmentWhy}
              </p>
              <p>
                <span className="font-medium text-slate-900">Focus now:</span>{" "}
                {systemAdjustmentFocus}
              </p>
            </div>
          </ExpandableSection>
        </div>
      ) : null}

      <div
        ref={knowledgeSectionRef}
        className={`${
          activeMode === "insights" && !activeModeLocked ? "order-4" : "hidden"
        } scroll-mt-24 rounded-3xl transition-[box-shadow,background-color] duration-200 ${
          knowledgeHighlighted
            ? "bg-sky-400/10 ring-2 ring-sky-300/35 ring-offset-2 ring-offset-slate-950"
            : "bg-transparent"
        }`}
      >
        <ExpandableSection
          title="Knowledge & Analysis"
          subtitle="Structured movement and adaptation analysis."
          previewLines={knowledgePreviewLines}
          previewChips={knowledgePreviewChips}
          expanded={knowledgeExpanded}
          onExpandedChange={setKnowledgeExpanded}
        >
          <div className="space-y-3">
            {knowledgeCards.map((card) => {
              const isCardExpanded = knowledgeDetailExpanded[card.key];
              return (
                <div
                  key={card.key}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{card.title}</p>
                    <button
                      type="button"
                      className={secondaryActionBtn}
                      onClick={() =>
                        setKnowledgeDetailExpanded((prev) => ({
                          ...prev,
                          [card.key]: !prev[card.key],
                        }))
                      }
                    >
                      {isCardExpanded ? "Hide details" : "View details"}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{card.summary}</p>
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 ${
                      isCardExpanded
                        ? "mt-2 grid-rows-[1fr] opacity-100"
                        : "mt-0 grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-1 pt-1 text-xs text-slate-700">
                        {card.items.map((item) => (
                          <p key={`${card.key}-${item}`}>• {item}</p>
                        ))}
                      </div>
                      <div
                        className={`mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 transition-[opacity,transform] duration-200 ${
                          isCardExpanded
                            ? "translate-y-0 opacity-100"
                            : "translate-y-1 opacity-0"
                        }`}
                      >
                        <p className="font-semibold text-slate-900">Why this matters</p>
                        <div className="mt-1.5 space-y-1.5">
                          <p>
                            This system continuously monitors your movement quality, fatigue patterns, and structural balance.
                          </p>
                          <p>
                            Your current plan reflects what your body is ready to improve safely and efficiently.
                          </p>
                          <p>
                            As your execution improves, the system will automatically increase complexity and progression.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <details className="rounded-xl border border-slate-200 bg-white px-3 py-2">
              <summary className={`${secondaryActionBtn} list-none cursor-pointer`}>
                View details: Day {effectiveSelectedDay + 1} plan reasoning
              </summary>
              <div className="mt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedDayProgram?.title}
                  </p>
                </div>
                <div className="mt-2 space-y-2">
                  {selectedDayProgram?.routine.map((item, index) => {
                    const exercise = exerciseById(item.exerciseId);
                    if (!exercise) return null;
                    const reason =
                      item.rationale?.whyThisExercise ??
                      optimizerReasonsByExercise[item.exerciseId]?.[0] ??
                      buildWhyPicked(exercise).purpose;
                    return (
                      <div key={`${item.exerciseId}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900">{exercise.name}</p>
                          <span className="text-[11px] uppercase text-slate-500">{item.section}</span>
                        </div>
                        <RoutineItemCoachingDetails
                          item={item}
                          fallbackDose={formatRoutineItemPrescription(item)}
                          fallbackRationale={reason}
                          tone="light"
                          className="mt-1"
                        />
                      </div>
                    );
                  })}
                </div>
                {!selectedDayProgram?.routine || selectedDayProgram.routine.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">
                    No exercises found for today yet.
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => router.push(`/program/${program.id}/day/${effectiveSelectedDay}`)}
                    className={secondaryActionBtn}
                  >
                    View day history
                  </button>
                </div>
              </div>
            </details>
          </div>
        </ExpandableSection>
      </div>

      {activeMode === "history" && !activeModeLocked ? (
        <section className="ui-card ui-soft-surface-raised order-4 p-5 sm:p-6" data-testid="history-mode-panel">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="ui-kicker">History</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                Completed workouts
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Search completed sessions across the active plan or your full local history.
              </p>
              {resetProgressMessage ? (
                <p className="mt-3 text-xs font-medium text-sky-100" aria-live="polite">
                  {resetProgressMessage}
                </p>
              ) : null}
            </div>
            <Button variant="secondary" onClick={() => router.push("/progress")}>
              Open progress page
            </Button>
          </div>
          <div className="ui-soft-surface mt-5 rounded-lg p-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-400">
                  Search history
                </span>
                <input
                  value={historySearchQuery}
                  onChange={(event) => setHistorySearchQuery(event.target.value)}
                  data-testid="history-search-input"
                  className="mt-2 h-11 w-full rounded-lg border border-slate-500/25 bg-slate-950/55 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus-visible:border-sky-300/50 focus-visible:ring-2 focus-visible:ring-sky-300/25"
                  placeholder="Search date, day, plan, or exercise"
                />
              </label>
              <div className="flex rounded-lg border border-slate-500/25 bg-slate-950/45 p-1 text-xs font-semibold text-slate-300">
                {(["current", "all"] as const).map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    data-testid={`history-scope-${scope}`}
                    onClick={() => setHistoryScope(scope)}
                    className={`rounded-md px-3 py-2 ${
                      historyScope === scope
                        ? "bg-sky-400/18 text-white shadow-[0_10px_24px_rgba(14,165,233,0.14)]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {scope === "current" ? "Current plan" : "All history"}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {historyEntries.length} result{historyEntries.length === 1 ? "" : "s"} •{" "}
              {historyScope === "current"
                ? `${completedWorkoutCount} saved for this plan`
                : `${totalCompletedWorkoutCount} completed workouts total`}
            </p>
          </div>
          <div className="mt-4 grid h-[min(58vh,30rem)] gap-2.5 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable] sm:h-[min(52vh,34rem)] sm:gap-3 sm:pr-2">
            {historyEntries.length ? (
              historyEntries.map((entry) => {
                const { session, dayIndex } = entry;
                const historyProgramId = session.routineId ?? program.id;
                const feedbackSummary = formatSessionFeedbackCoachSummary(
                  session.feedback ?? null
                );
                const adaptationPreview =
                  formatSessionAdaptationPreviewFromFeedback(
                    session.feedback ?? null
                  );
                const nextSessionRecommendation =
                  formatNextSessionRecommendationFromSession(session);
                return (
                  <div
                    key={session.id}
                    className="ui-soft-surface rounded-lg px-3 py-3 sm:px-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">
                        {entry.dayLabel}
                      </p>
                      <span className="text-xs text-slate-400">{entry.displayDate}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">
                      {entry.programLabel}
                      {dayIndex === null ? "" : ` • Day ${dayIndex + 1}`}{" "}
                      {session.durationSec ? `• ${Math.round(session.durationSec / 60)} min` : ""}
                    </p>
                    {entry.exerciseNames.length ? (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                        {entry.exerciseNames.slice(0, 5).join(" • ")}
                      </p>
                    ) : null}
                    {feedbackSummary ? (
                      <p className="mt-2 text-xs font-semibold text-slate-300">
                        {feedbackSummary}
                      </p>
                    ) : null}
                    {adaptationPreview ? (
                      <p
                        className="mt-1 text-xs font-semibold text-slate-300"
                        data-testid="adaptation-preview"
                      >
                        {adaptationPreview} Preview only; no workout has been changed.
                      </p>
                    ) : null}
                    {nextSessionRecommendation ? (
                      <p
                        className="mt-1 text-xs font-semibold text-slate-300"
                        data-testid="next-session-recommendation"
                      >
                        {nextSessionRecommendation} Recommendation only; your plan has not been changed.
                      </p>
                    ) : null}
                    {dayIndex !== null ? (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/program/${historyProgramId}/day/${dayIndex}`)
                        }
                        className={`${secondaryActionBtn} mt-3`}
                      >
                        View day history
                      </button>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="ui-soft-surface rounded-lg px-4 py-5 text-sm text-slate-300">
                {historySearchTerm
                  ? "No completed workouts match that search."
                  : historyScope === "current"
                  ? totalCompletedWorkoutCount > completedWorkoutCount
                    ? "No completed workouts in this phase yet. Switch to All history to review earlier sessions."
                    : "Complete your first workout in this plan to build history."
                  : "Complete your first workout to build history."}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {activeMode === "account" && !activeModeLocked ? (
        <AccountModePanel
          authEnabled={authEnabled}
          plan={plan}
          currentPhaseIndex={currentPhaseIndex}
          totalCompletedWorkoutCount={totalCompletedWorkoutCount}
          resetProgressMessage={resetProgressMessage}
          resetProgressConfirmOpen={resetProgressConfirmOpen}
          resetProgressWorking={resetProgressWorking}
          onOpenResetProgressConfirm={() => setResetProgressConfirmOpen(true)}
          onCloseResetProgressConfirm={() => setResetProgressConfirmOpen(false)}
          onResetCurrentProgress={resetCurrentProgress}
        />
      ) : null}

      {activeMode === "progress" && !activeModeLocked ? (
      <div className="order-4">
        <ExpandableSection
          title="Progress Summary"
          subtitle="How your consistency, completion, pain, and quality are trending."
          previewLines={progressPreviewLines}
          previewChips={progressPreviewChips}
        >
          <ProgressSummary
            workoutsCompletedInPhase={phaseGate.workoutsCompletedInPhase}
            workoutTarget={phaseGate.minWorkouts}
            daysInPhase={phaseGate.daysSincePhaseStart}
            dayTarget={phaseGate.minDays}
            gateStatusLabel={phaseGateStatusLabel}
            gateStatusDetail={phaseGateStatusDetail}
            consistencyPercent={consistencyPercent}
            completionPercent={adherencePercent}
            painTrend={painTrendLabel}
            painTrendPercent={painTrendPercent}
            movementQualityTrend={movementQualityTrend}
            movementQualityPercent={movementQualityPercent}
          />
        </ExpandableSection>
      </div>
      ) : null}

      {activeMode === "progress" && !activeModeLocked ? (
        <PhaseProgressionSection
          phaseName={phaseName}
          phaseDescription={phaseDescription}
          phaseRequirementsText={phaseRequirementsText}
          phaseGateStatusDetail={phaseGateStatusDetail}
          phaseGateStatusLabel={phaseGateStatusLabel}
          phaseGateProgressText={phaseGateProgressText}
          phaseGateReason={phaseGateReason}
          phaseGate={phaseGate}
          movePhaseButtonLabel={movePhaseButtonLabel}
          canMoveNextPhase={phaseControlUi.canMoveNextPhase}
          showSkipPhaseOne={phaseControlUi.showSkipPhaseOne}
          canUploadPhotos={phaseControlUi.canUploadPhotos}
          onOpenMove={openPhaseAdvancePrompt}
          onOpenSkip={() => setSkipPhaseOneOpen(true)}
        />
      ) : null}

      {advanceOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setAdvanceOpen(false);
              setAdvanceConfirm(false);
            }}
          />
          <div className="ui-card ui-soft-surface-raised relative w-full max-w-md rounded-lg p-6 text-slate-100 shadow-xl">
            <h3 className="text-lg font-semibold text-white">
              {(program?.phaseIndex ?? 1) >= MAX_PHASE_INDEX
                ? `Phase ${MAX_PHASE_INDEX} is active`
                : `Move to Phase ${(program?.phaseIndex ?? 1) + 1}?`}
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              This creates your next progressive plan. Your logs and history stay saved.
            </p>
            {!phaseGate.ok ? (
              <div className="mt-3 rounded-lg border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                {phaseGateReason}
              </div>
            ) : null}
            {advanceMessage ? (
              <div className="ui-soft-surface mt-3 rounded-lg px-3 py-2 text-xs text-slate-300">
                {advanceMessage}
              </div>
            ) : null}
            <label className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={advanceConfirm}
                onChange={(event) => setAdvanceConfirm(event.target.checked)}
                className="h-4 w-4 accent-foreground"
              />
              I’m ready to progress
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdvanceOpen(false);
                  setAdvanceConfirm(false);
                }}
                className={secondaryActionBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!advanceConfirm || !phaseGate.ok}
                onClick={() => handleAdvanceProgram()}
                className="rounded-lg bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Move phase
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {skipPhaseOneOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSkipPhaseOneOpen(false)}
          />
          <div
            className="ui-card ui-soft-surface-raised relative w-full max-w-md rounded-lg p-6 text-slate-100 shadow-xl"
            data-testid="skip-phase-one-modal"
          >
            <h3 className="text-lg font-semibold text-white">Skip Phase 1?</h3>
            <p className="mt-2 text-sm text-slate-300">
              Phase 1 builds control and tolerance. Skipping can make Phase 2 feel sharper and less stable.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              You can continue now, but expect stricter loading and technique demands.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="skip-phase-one-cancel"
                onClick={() => setSkipPhaseOneOpen(false)}
                className={secondaryActionBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="skip-phase-one-confirm"
                onClick={handleSkipPhaseOne}
                className="rounded-lg bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-4 py-2 text-xs font-semibold text-white"
              >
                Confirm skip
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  // QA checklist:
  // - No duplicate start CTAs above the fold.
  // - View today's plan never routes.
  // - Start Selected Day routes.
  // - Selected Day Details shows full routine list.
  // - Readiness renders safely with missing data.
  // - Progress animations do not cause hydration mismatch.
  // - No maximum update depth regressions.
}
