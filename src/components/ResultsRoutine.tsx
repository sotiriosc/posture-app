"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuestionnaireData } from "./QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import type { Routine } from "@/lib/routine";
import { generateRoutine } from "@/lib/routine";
import {
  buildEngineSignals,
  buildSignalsFromLocalState,
  generateProgram,
} from "@/lib/engine";
import {
  PROGRAM_TEMPLATE_VERSION,
} from "@/lib/program";
import {
  normalizeEquipmentSelectionValues,
} from "@/lib/equipment";
import { usePhotoContext } from "@/components/PhotoContext";
import {
  analyzeImagePose,
  computeMetrics,
  generateObservations,
  type PoseAnalysis,
  type PoseMetrics,
} from "@/lib/poseAnalyzer";
import {
  buildAssessmentReport,
  type AssessmentReport,
} from "@/lib/assessmentEngine";
import Button from "@/components/ui/Button";
import { loadAppState, saveAppState } from "@/lib/appState";
import { buildQuestionnaireSignature } from "@/lib/questionnaireSignature";
import type { Exercise } from "@/lib/exercises";
import type {
  ExerciseFeedback,
  ExerciseLog,
  Program,
  ProgramProgress,
  ProgramRoutineItem,
  SessionRecord,
} from "@/lib/types";
import {
  getProgramProgress,
  getLatestProgram,
  getProgram,
  listAllPrograms,
  listSessions,
  listExerciseLogsByExercise,
  listExerciseLogsBySessionIds,
  loadPrefs,
  saveProgram,
  saveProgramProgress,
  uuid,
} from "@/lib/logStore";
import type { SubscriptionPlan } from "@/lib/authTypes";
import { loadTrainingSnapshot, pushTrainingPatch } from "@/lib/trainingSyncClient";
import { getProgressionRecommendation } from "@/lib/progression";
import {
  MAX_PHASE_INDEX,
  buildNextWeekPlan,
  getPhaseMetaByIndex,
  getPhaseProfile,
} from "@/lib/phases";
import { clearDraftsByProgramId } from "@/lib/sessionDraftStore";
import {
  canAdvancePhase,
  formatPhaseGateReason,
  skipPhase1,
} from "@/lib/phaseGating";
import {
  buildPhaseReadyDismissalKey,
  getPhaseControlUiState,
  getPhaseReadyNoticeState,
} from "@/lib/phaseControls";
import { getDailyInsight } from "@/lib/insightGenerator";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DailyInsightCard from "@/components/dashboard/DailyInsightCard";
import ProgressSummary from "@/components/dashboard/ProgressSummary";
import ExpandableSection from "@/components/dashboard/ExpandableSection";
import PhaseProgressCard from "@/components/dashboard/PhaseProgressCard";
import DashboardModeCard from "@/components/dashboard/DashboardModeCard";
import ProgressBar from "@/components/ui/ProgressBar";
import ProgramReferenceCard from "@/components/ProgramReferenceCard";
import { secondaryActionBtn } from "@/components/ui/buttonStyles";
import { SESSION_COMPLETE_EVENT } from "@/lib/sessionStore";

const STORAGE_KEY = "posture_questionnaire";
const SESSION_COMPLETE_ACK_KEY = "results_last_seen_session_complete_at";
const SHOW_PHASE_PREVIEW_REFERENCE = false;

type DashboardMode =
  | "today"
  | "week"
  | "progress"
  | "insights"
  | "history"
  | "account";

type HistoryScope = "current" | "all";

const defaultRoutine: Routine = {
  summary:
    "A balanced routine focused on mobility, postural strength, and daily posture reminders.",
  priorities: [],
  observed: [],
  sections: [],
};

type ProgramWeekDay = Program["week"][number];

function CurrentSavedProgramSnapshotLoadingCard({
  message = "Finalizing saved program snapshot.",
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
        Current Saved Program Snapshot
      </h3>
      <p className="mt-1 text-xs text-slate-400">{message}</p>
      <div
        className="mt-4 h-2 w-full overflow-hidden rounded-full border border-slate-500/30 bg-slate-950/60"
        role="progressbar"
        aria-label="Current saved program snapshot status"
      >
        <div
          className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-slate-500 via-sky-400 to-slate-400 opacity-70"
        />
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Ready when the full saved snapshot is available.
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
      const prescription = item.reps
        ? `${item.sets ?? 1}x${item.reps}`
        : item.durationSec
        ? `${item.sets ? `${item.sets}x` : ""}${item.durationSec}s`
        : item.sets
        ? `${item.sets} sets`
        : null;
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

const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image file."));
    };
    img.src = url;
  });

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
  const [data, setData] = useState<QuestionnaireData | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [programLoadIssue, setProgramLoadIssue] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [progress, setProgress] = useState<ProgramProgress | null>(null);
  const [allSessions, setAllSessions] = useState<SessionRecord[]>([]);
  const [activeProgramBaselineAt, setActiveProgramBaselineAt] = useState(0);
  const [latestLogsByExercise, setLatestLogsByExercise] = useState<
    Record<string, ExerciseLog | null>
  >({});
  const [substitutionByExercise, setSubstitutionByExercise] = useState<
    Record<string, string>
  >({});
  const [isReady, setIsReady] = useState(false);
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
  const [nowAnchor, setNowAnchor] = useState(() => Date.now());
  const [lastTwoLogs, setLastTwoLogs] = useState<ExerciseLog[]>([]);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [activeMode, setActiveMode] = useState<DashboardMode>("week");
  const [historyScope, setHistoryScope] = useState<HistoryScope>("current");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [resetProgressConfirmOpen, setResetProgressConfirmOpen] = useState(false);
  const [resetProgressWorking, setResetProgressWorking] = useState(false);
  const [resetProgressMessage, setResetProgressMessage] = useState<string | null>(null);
  const knowledgeSectionRef = useRef<HTMLDivElement | null>(null);
  const systemAdjustmentsSectionRef = useRef<HTMLDivElement | null>(null);
  const weekViewSectionRef = useRef<HTMLElement | null>(null);
  const weekViewDetailsRef = useRef<HTMLDivElement | null>(null);
  const knowledgeHighlightTimeoutRef = useRef<number | null>(null);
  const sessionCompleteNoticeFadeTimeoutRef = useRef<number | null>(null);
  const sessionCompleteNoticeTimeoutRef = useRef<number | null>(null);
  const missingWorkoutRepairAttemptRef = useRef(new Set<string>());
  const programProgressSnapshotRef = useRef<Program | null>(null);
  const initialProgramLoadInFlightRef = useRef(false);
  const initialProgramLoadSignatureRef = useRef<string | null>(null);
  const programGenerationRequestTokenRef = useRef(0);
  const { photos } = usePhotoContext();
  const [initialProgramLoadPending, setInitialProgramLoadPending] = useState(false);
  const [reconcileProgramPending, setReconcileProgramPending] = useState(false);
  const [settledProgramId, setSettledProgramId] = useState<string | null>(null);
  const [poseState, setPoseState] = useState<{
    loading: boolean;
    error: string | null;
    analysis: PoseAnalysis | null;
    report: AssessmentReport | null;
  }>({ loading: false, error: null, analysis: null, report: null });
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

  const beginProgramGenerationRequest = useCallback(() => {
    programGenerationRequestTokenRef.current += 1;
    setSettledProgramId(null);
    return programGenerationRequestTokenRef.current;
  }, []);

  const isLatestProgramGenerationRequest = useCallback(
    (requestToken: number) =>
      requestToken === programGenerationRequestTokenRef.current,
    []
  );

  const markProgramSettled = useCallback((programId: string) => {
    setSettledProgramId(programId);
  }, []);

  useEffect(() => {
    const loadBootstrap = async () => {
      const snapshot = await loadTrainingSnapshot();
      const remoteAssessment = snapshot?.assessment as AssessmentReport | undefined;
      if (remoteAssessment) {
        setPoseState((current) =>
          current.report
            ? current
            : {
                ...current,
                error: null,
                analysis: current.analysis ?? null,
                report: remoteAssessment,
              }
        );
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<QuestionnaireData>;
        setData({
          goals: parsed.goals ?? "Improve posture",
          painAreas: parsed.painAreas ?? [],
          experience: parsed.experience ?? "Beginner",
          equipment: normalizeEquipmentSelectionValues(
            parsed.equipment ?? ["none"]
          ),
          daysPerWeek: normalizeDaysPerWeek(parsed.daysPerWeek),
        });
      } else {
        const remote = snapshot?.questionnaire as Partial<QuestionnaireData> | undefined;
        if (remote) {
          const next = {
            goals: remote.goals ?? "Improve posture",
            painAreas: remote.painAreas ?? [],
            experience: remote.experience ?? "Beginner",
            equipment: normalizeEquipmentSelectionValues(
              remote.equipment ?? ["none"]
            ),
            daysPerWeek: normalizeDaysPerWeek(remote.daysPerWeek),
          };
          setData(next);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
      }
      setIsReady(true);
    };
    const loadPrefsData = async () => {
      const prefs = await loadPrefs();
      if (prefs.substitutionByExercise) {
        setSubstitutionByExercise(prefs.substitutionByExercise);
      }
    };
    loadBootstrap().finally(() => loadPrefsData());
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        const payload = (await response.json()) as {
          enabled?: boolean;
          authenticated?: boolean;
          user?: { plan?: SubscriptionPlan } | null;
        };
        setAuthEnabled(Boolean(payload.enabled));
        setPlan(payload.user?.plan === "pro" ? "pro" : "free");
      } catch {
        setAuthEnabled(false);
        setPlan("free");
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    const tick = () => setNowAnchor(Date.now());
    const timer = window.setInterval(tick, 60 * 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const loadLogs = async () => {
      if (!program) return;
      const dayIndex = authEnabled && plan !== "pro" ? 0 : selectedDay;
      const day = program.week[dayIndex];
      if (!day) return;
      const ids = Array.from(new Set(day.routine.map((item) => item.exerciseId)));
      const entries = await Promise.all(
        ids.map(async (id) => {
          const effectiveId = substitutionByExercise[id] ?? id;
          const logs = await listExerciseLogsByExercise(effectiveId, 1);
          return [id, logs[0] ?? null] as const;
        })
      );
      setLatestLogsByExercise(Object.fromEntries(entries));
    };
    loadLogs();
  }, [program, selectedDay, substitutionByExercise, authEnabled, plan]);

  const routine = useMemo(() => {
    if (!data) return defaultRoutine;
    return generateRoutine(data);
  }, [data]);

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
        title: "Photo analysis failed",
        body: "Photo analysis could not be completed. Program used questionnaire fallback.",
        chips: ["Questionnaire fallback", uploadedPhotoViews.length ? `Uploaded: ${uploadedViewsLabel}` : "No photos active"],
      };
    }

    if (hasPhotoAnalysis) {
      return {
        tone: "photo",
        title: "Photos analyzed",
        body: "Program informed by uploaded posture photos and questionnaire inputs.",
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
      title: "Questionnaire-only fallback",
      body: "Program currently informed by questionnaire inputs only.",
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

  const dayPreviewRecommendations = (() => {
    if (!program) return [];
    const dayIndex = authEnabled && plan !== "pro" ? 0 : selectedDay;
    const day = program.week[dayIndex];
    if (!day) return [];
    return day.routine
      .map((item) => {
        const effectiveId = substitutionByExercise[item.exerciseId] ?? item.exerciseId;
        const exercise = exerciseById(effectiveId);
        if (!exercise) return null;
        const latestLog = latestLogsByExercise[item.exerciseId] ?? null;
        if (!latestLog) return null;
        const feedback: ExerciseFeedback | null = latestLog.felt
          ? {
              rating: latestLog.felt,
              painLocation: latestLog.painLocation ?? null,
              notes: latestLog.feedbackNotes ?? null,
            }
          : null;
        const rec = getProgressionRecommendation({
          exercise,
          logs: [latestLog],
          feedback,
          prescription: {
            sets: item.sets,
            reps: item.reps ?? exercise.durationOrReps,
            durationSec: item.durationSec ?? null,
            restSec: item.restSec ?? null,
          },
        });
        if (!rec) return null;
        return { item, exercise, rec };
      })
      .filter(Boolean) as Array<{
      item: ProgramRoutineItem;
      exercise: Exercise;
      rec: ReturnType<typeof getProgressionRecommendation>;
    }>;
  })();

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

  const formatRecommendation = (rec: ReturnType<typeof getProgressionRecommendation>) => {
    if (!rec) return "";
    const { recommendedNext } = rec;
    const parts: string[] = [];
    if (recommendedNext.weight) parts.push(`${recommendedNext.weight} lb`);
    if (recommendedNext.reps) parts.push(`${recommendedNext.reps} reps`);
    if (recommendedNext.sets) parts.push(`${recommendedNext.sets} sets`);
    if (recommendedNext.durationSeconds) {
      parts.push(`${recommendedNext.durationSeconds} sec`);
    }
    if (recommendedNext.tempo) parts.push(`tempo ${recommendedNext.tempo}`);
    if (!parts.length) return "Keep targets consistent";
    return parts.join(" • ");
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

  const sessionsSinceBaseline = useMemo(() => {
    if (!activeProgramId) return [] as SessionRecord[];
    return allSessions.filter((session) => {
      if (session.routineId !== activeProgramId) return false;
      const parsedSessionAt = toEpochMs(session.startedAt ?? session.createdAt);
      const sessionAt = Number.isNaN(parsedSessionAt) ? 0 : parsedSessionAt;
      return sessionAt >= baselineForActiveProgram;
    });
  }, [allSessions, activeProgramId, baselineForActiveProgram]);

  const completedDaySet = useMemo(() => {
    const set = new Set<number>();
    sessionsSinceBaseline.forEach((session) => {
      if (!session.completedAt) return;
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
  }, [sessionsSinceBaseline, activeDaysPerWeek]);

  const inProgressDaySet = useMemo(() => {
    const set = new Set<number>();
    sessionsSinceBaseline.forEach((session) => {
      if (session.completedAt) return;
      const dayIndex = parseDayIndexFromSession(session);
      if (dayIndex === null) return;
      if (dayIndex < 0 || dayIndex >= activeDaysPerWeek) return;
      if (completedDaySet.has(dayIndex)) return;
      set.add(dayIndex);
    });
    return set;
  }, [sessionsSinceBaseline, activeDaysPerWeek, completedDaySet]);

  const latestInProgressDayIndex = useMemo(() => {
    let latest: { dayIndex: number; timestamp: number } | null = null;
    for (const session of sessionsSinceBaseline) {
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
  }, [sessionsSinceBaseline, activeDaysPerWeek]);

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
    return completedDaySet.size;
  }, [completedDaySet]);

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

  const allCompletedSessions = useMemo(
    () =>
      allSessions
        .filter((session) => session.completedAt)
        .toSorted((a, b) =>
          (b.completedAt ?? b.updatedAt ?? b.createdAt ?? "").localeCompare(
            a.completedAt ?? a.updatedAt ?? a.createdAt ?? ""
          )
        ),
    [allSessions]
  );

  const currentProgramCompletedSessions = useMemo(() => {
    if (!activeProgramId) return [] as SessionRecord[];
    return allCompletedSessions.filter(
      (session) => session.routineId === activeProgramId
    );
  }, [allCompletedSessions, activeProgramId]);

  const programById = useMemo(() => {
    const map = new Map<string, Program>();
    allPrograms.forEach((entry) => {
      map.set(entry.id, entry);
    });
    if (program) {
      map.set(program.id, program);
    }
    return map;
  }, [allPrograms, program]);

  const historyScopeSessions =
    historyScope === "current" ? currentProgramCompletedSessions : allCompletedSessions;
  const historySearchTerm = historySearchQuery.trim().toLowerCase();
  const historyEntries = useMemo(() => {
    return historyScopeSessions
      .map((session) => {
        const dayIndex = parseDayIndexFromSession(session);
        const sessionProgram = session.routineId
          ? programById.get(session.routineId)
          : null;
        const day =
          dayIndex === null
            ? null
            : sessionProgram?.week.find((entry) => entry.dayIndex === dayIndex) ?? null;
        const exerciseNames =
          day?.routine
            .map((item) => exerciseById(item.exerciseId)?.name)
            .filter((name): name is string => Boolean(name)) ?? [];
        const completedAtValue =
          session.completedAt ?? session.updatedAt ?? session.createdAt;
        const completedAt = completedAtValue
          ? new Date(completedAtValue)
          : null;
        const isoDate =
          completedAt && !Number.isNaN(completedAt.getTime())
            ? completedAt.toISOString().slice(0, 10)
            : "";
        const displayDate =
          completedAt && !Number.isNaN(completedAt.getTime())
            ? completedAt.toLocaleDateString()
            : "Completed";
        const dayLabel =
          day?.title ??
          (dayIndex === null ? "Program day saved" : `Day ${dayIndex + 1}`);
        const programLabel = sessionProgram
          ? `${sessionProgram.phaseName ?? "Program"} • Week ${sessionProgram.weekIndex ?? 1}`
          : session.routineId ?? "Program";
        const searchText = [
          displayDate,
          isoDate,
          dayLabel,
          programLabel,
          session.routineId ?? "",
          dayIndex === null ? "" : `day ${dayIndex + 1}`,
          ...exerciseNames,
        ]
          .join(" ")
          .toLowerCase();
        return {
          session,
          dayIndex,
          dayLabel,
          displayDate,
          programLabel,
          exerciseNames,
          searchText,
        };
      })
      .filter((entry) =>
        historySearchTerm ? entry.searchText.includes(historySearchTerm) : true
      );
  }, [historyScopeSessions, historySearchTerm, programById]);

  const completedWeeks =
    !program || !completedSessions.length
      ? 0
      : Math.floor(completedSessions.length / program.daysPerWeek);

  const workoutsThisWeek = useMemo(() => {
    const weekStart = new Date(nowAnchor);
    weekStart.setHours(0, 0, 0, 0);
    const mondayOffset = (weekStart.getDay() + 6) % 7;
    weekStart.setDate(weekStart.getDate() - mondayOffset);
    const weekStartMs = weekStart.getTime();
    return completedSessions.filter((session) => {
      const parsed = Date.parse(
        session.completedAt ?? session.updatedAt ?? session.createdAt
      );
      if (Number.isNaN(parsed)) return false;
      return parsed >= weekStartMs;
    }).length;
  }, [completedSessions, nowAnchor]);

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
        const normalized: ProgramProgress = {
          ...stored,
          phaseIndex: stored.phaseIndex ?? (progressProgram.phaseIndex ?? 1),
          phaseStartedAt:
            stored.phaseStartedAt ?? progressProgram.createdAt ?? nowIso,
          cyclesCompletedInPhase:
            typeof stored.cyclesCompletedInPhase === "number"
              ? stored.cyclesCompletedInPhase
              : 0,
          workoutsCompletedInPhase:
            typeof stored.workoutsCompletedInPhase === "number"
              ? stored.workoutsCompletedInPhase
              : 0,
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
        const initial: ProgramProgress = {
          programId,
          lastCompletedDayIndex: null,
          nextDayIndex: 0,
          completedDayIndices: [],
          phaseIndex: progressProgram.phaseIndex ?? 1,
          phaseStartedAt: progressProgram.createdAt ?? nowIso,
          cyclesCompletedInPhase: 0,
          workoutsCompletedInPhase: 0,
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
  }, [programId]);

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

  const phaseProgressPercent = useMemo(() => {
    const workoutRatio =
      phaseGate.minWorkouts > 0
        ? phaseGate.workoutsCompletedInPhase / phaseGate.minWorkouts
        : 0;
    const dayRatio = phaseGate.minDays > 0 ? phaseGate.daysSincePhaseStart / phaseGate.minDays : 0;
    return Math.round(Math.min(1, (workoutRatio + dayRatio) / 2) * 100);
  }, [phaseGate]);

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

  const weeklyStructure = useMemo(() => {
    if (!program) return "";
    return program.week.map((day) => `Day ${day.dayIndex + 1}: ${day.title}`).join(" • ");
  }, [program]);

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
    if (!program || !data || !questionnaireSignature) {
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
      ? "Generating and saving your weekly program."
      : "Preparing your questionnaire inputs."
    : reconcileProgramPending
    ? "Reconciling the saved program with your current questionnaire."
    : initialProgramLoadPending
    ? "Finishing the initial saved program."
    : "Checking the saved program against your current questionnaire.";

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

  useEffect(() => {
    const runPoseAnalysis = async () => {
      if (!data) return;
      const entries = Object.entries(photos).filter(
        ([, value]) => value !== null
      ) as [string, File][];

      if (!entries.length) {
        const fallbackReport = buildAssessmentReport({ questionnaire: data });
        setPoseState((current) => {
          if (
            !current.loading &&
            current.error === null &&
            current.analysis === null &&
            current.report
          ) {
            return current;
          }
          return {
            loading: false,
            error: null,
            analysis: null,
            report: fallbackReport,
          };
        });
        void pushTrainingPatch({ assessment: fallbackReport as unknown as Record<string, unknown> });
        return;
      }

      setPoseState({ loading: true, error: null, analysis: null, report: null });

      try {
        const metricsByView: Record<string, PoseMetrics> = {};
        const observations: string[] = [];
        const priorities: string[] = [];
        const confidenceScores: number[] = [];

        for (const [view, file] of entries) {
          const image = await loadImageFromFile(file);
          const keypoints = await analyzeImagePose(image);
          if (!keypoints) continue;
          const metrics = computeMetrics(keypoints);
          metricsByView[view] = metrics;
          const analysis = generateObservations(metrics);
          observations.push(...analysis.observations.map((item) => `${view}: ${item}`));
          priorities.push(...analysis.priorities);
          confidenceScores.push(analysis.confidenceScore);
        }

        const combined: PoseAnalysis = {
          metrics: {
            torsoHeight: null,
            avgKeypointScore: null,
            shoulderHeightDelta: metricsByView.front?.shoulderHeightDelta ?? null,
            hipHeightDelta: metricsByView.front?.hipHeightDelta ?? null,
            kneeAlignmentDelta: metricsByView.front?.kneeAlignmentDelta ?? null,
            headForwardOffset: metricsByView.side?.headForwardOffset ?? null,
            torsoLeanAngle: metricsByView.side?.torsoLeanAngle ?? null,
            hipToShoulderAlignment:
              metricsByView.side?.hipToShoulderAlignment ?? null,
            scapularSymmetry: metricsByView.back?.scapularSymmetry ?? null,
            hipShift: metricsByView.back?.hipShift ?? null,
          },
          observations: observations.length
            ? observations
            : ["We couldn’t reliably detect posture landmarks in these photos."],
          priorities: Array.from(new Set(priorities)).slice(0, 4),
          confidenceScore: confidenceScores.length
            ? confidenceScores.reduce((sum, value) => sum + value, 0) /
              confidenceScores.length
            : 0.4,
        };

        const report = buildAssessmentReport({
          questionnaire: data,
          poseAnalysis: combined,
        });
        setPoseState({ loading: false, error: null, analysis: combined, report });
        void pushTrainingPatch({ assessment: report as unknown as Record<string, unknown> });
      } catch (error) {
        const fallbackReport = buildAssessmentReport({ questionnaire: data });
        setPoseState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Pose detection failed. Try clearer photos.",
          analysis: null,
          report: fallbackReport,
        });
        void pushTrainingPatch({ assessment: fallbackReport as unknown as Record<string, unknown> });
      }
    };

    runPoseAnalysis();
  }, [photos, data]);


  if (!isReady) {
    return (
      <div className="ui-card ui-soft-surface-raised p-6">
        <p className="text-sm text-slate-300">Loading your program...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ui-card ui-soft-surface-raised rounded-lg border-dashed p-6 text-center">
        <p className="text-sm text-slate-300">
          We need your questionnaire answers to build a routine.
        </p>
        <Link
          href="/questionnaire"
          className="mt-4 inline-flex rounded-lg bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)]"
        >
          Go to questionnaire
        </Link>
      </div>
    );
  }

  if (!program) {
    if (programLoadIssue) {
      return (
        <div className="ui-card ui-soft-surface-raised p-6">
          <p className="text-sm font-semibold text-white">
            We couldn&apos;t generate your weekly program yet.
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
              <Button variant="primary">Review questionnaire</Button>
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="ui-card ui-soft-surface-raised p-6">
          <p className="text-sm text-slate-300">Loading your weekly program...</p>
        </div>
        <CurrentSavedProgramSnapshotLoadingCard
          message={currentSavedWeekSnapshotLoadingMessage}
        />
      </div>
    );
  }

  const selectedDayProgram = program.week[effectiveSelectedDay];
  const phaseName = program.phaseName ?? getPhaseMetaByIndex(currentPhaseIndex).phaseName;
  const phaseDescription = getPhaseProfile(currentPhaseIndex).description;
  const cycleCurrent = Math.max(1, phaseGate.cyclesCompletedInPhase + 1);
  const workoutProgressPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (phaseGate.workoutsCompletedInPhase / Math.max(1, phaseGate.minWorkouts)) *
          100
      )
    )
  );
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
  const focusAreas =
    program.phaseObjective?.primaryPatterns?.slice(0, 4) ??
    routine.priorities.slice(0, 4);
  const adaptationPriority =
    program.sessionAdaptation?.summary ??
    "Build control before intensity";
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
  const readinessEstimate =
    workoutsRemaining <= 0 && daysRemaining <= 0
      ? "Ready now"
      : `${workoutsRemaining} workout${workoutsRemaining === 1 ? "" : "s"} + ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`;

  const phaseProgressText = `Workouts: ${phaseGate.workoutsCompletedInPhase}/${phaseGate.minWorkouts} • Days: ${phaseGate.daysSincePhaseStart}/${phaseGate.minDays}`;
  const phaseRequirementsText = `Complete ${phaseGate.minWorkouts} workouts and spend at least ${phaseGate.minDays} days in this phase.`;
  const movementPatternItems =
    routine.observed.slice(0, 4).length > 0
      ? routine.observed.slice(0, 4)
      : ["Movement patterns will populate as your sessions complete."];
  const stabilityPatternItems =
    poseState.report?.observations
      .filter((item) =>
        /stability|alignment|control|scap|hip|core/i.test(
          `${item.title} ${item.description}`
        )
      )
      .slice(0, 3)
      .map((item) => `${item.title} - ${item.description}`) ?? [
      "Trunk alignment improving - core stabilization is becoming more consistent.",
    ];
  const compensationPatternItems =
    poseState.report?.observations
      .filter((item) =>
        /forward|tilt|shift|asym|compens|flare|lean/i.test(
          `${item.title} ${item.description}`
        )
      )
      .slice(0, 3)
      .map((item) => `${item.title} - ${item.description}`) ?? [
      "Compensation signals are monitored and adjusted through movement quality.",
    ];
  const adaptationTrendItems = [
    ...(program.sessionAdaptation?.reasons ?? []),
    ...(program.sessionAdaptation?.appliedChanges ?? []),
    ...(program.sessionAdaptation?.masteryChecks ?? []),
  ]
    .filter(Boolean)
    .slice(0, 4);

  const recByExerciseId = new Map(
    dayPreviewRecommendations.map(({ exercise, rec }) => [exercise.id, rec])
  );
  const recentExerciseSignals = (selectedDayProgram?.routine ?? [])
    .map((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return null;
      const latestLog = latestLogsByExercise[item.exerciseId] ?? null;
      const rec = recByExerciseId.get(exercise.id);
      const status = latestLog?.painLevel === "moderate" || latestLog?.painLevel === "severe"
        ? "Needs caution"
        : latestLog?.felt === "easy" || latestLog?.felt === "moderate"
        ? "Improving"
        : latestLog?.felt === "hard" || latestLog?.felt === "pain"
        ? "Stable with effort"
        : "Stable";
      const guidance =
        latestLog?.nextTimeGuidance ??
        (rec ? `Next time: ${formatRecommendation(rec)}` : "Maintain load and improve control.");
      return {
        exerciseName: exercise.name,
        status,
        guidance,
      };
    })
    .filter((entry): entry is { exerciseName: string; status: string; guidance: string } => Boolean(entry))
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

  const postureCue =
    routine.priorities[0] ??
    program.phaseObjective?.primaryPatterns?.[0] ??
    "Posture cue: stack ribs over pelvis";
  const mainFocus =
    focusAreas[1] ?? focusAreas[0] ?? "Main focus: controlled compound reps";
  const recoveryCue =
    painTrendLabel === "Needs caution"
      ? "Recovery cue: lower intensity and protect range"
      : "Recovery cue: easy walk + mobility after sessions";
  const weeklyPriorities = [postureCue, mainFocus, recoveryCue];

  const phaseSummaryLine =
    program.phaseObjective?.title ??
    `${phaseName} focus: ${getPhaseProfile(currentPhaseIndex).label}`;
  const whyChangedLine =
    program.sessionAdaptation?.summary ??
    program.phaseOptimizerReport?.summary ??
    "Program adjusted from recent performance signals.";
  const hasRecentLogs = recentExerciseSignals.length > 0;

  const planPreviewLines = [
    phaseSummaryLine,
    hasRecentLogs
      ? `Recent signals available for ${recentExerciseSignals.length} exercises.`
      : "No recent logs yet. Complete your next session to unlock tailored signals.",
  ];
  const planPreviewChips = [
    ...focusAreas.slice(0, 3),
    program.phaseObjective?.weekIntent ?? "Control before intensity",
  ].filter(Boolean);

  const progressPreviewLines = [
    `Consistency ${consistencyPercent}% • Completion ${adherencePercent}%`,
    `Pain trend: ${painTrendLabel} • Movement quality: ${movementQualityTrend}`,
  ];
  const progressPreviewChips = [
    `${phaseGate.workoutsCompletedInPhase}/${phaseGate.minWorkouts} workouts`,
    `${completedCount}/${activeDaysPerWeek} days`,
    encouragementMessage ?? "Keep steady progress",
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
    readinessScore >= 80 ? "Ready" : readinessScore >= 55 ? "Good" : "Caution";
  const shouldPulsePrimaryCta =
    heroCta.label === "Start Today's Session" &&
    !completedDaySet.has(effectiveNextDayIndex);
  const showWeeklyCompletionNudge =
    completedCount < activeDaysPerWeek &&
    !completedDaySet.has(effectiveNextDayIndex);

  const heroMetricChips = [
    `Week: ${completedCount}/${activeDaysPerWeek} days`,
    `Cycle: ${program.cycleIndex ?? cycleCurrent}`,
    `Readiness for Corrective Progress: ${readinessScore}% (${readinessLabel})`,
    phaseGate.minWorkouts > 0 && phaseGate.minDays > 0
      ? `Phase gate: ${phaseGate.minWorkouts} workouts + ${phaseGate.minDays} days`
      : "Phase gate: Progressing normally",
  ].filter((chip): chip is string => Boolean(chip));

  const coachToday = (() => {
    if (heroCta.label === "Continue Session") return "Today: Continue your active session.";
    return `Today: Start Day ${effectiveNextDayIndex + 1} and finish all planned sections.`;
  })();
  const coachFocus =
    focusAreas[0] ??
    program.phaseObjective?.primaryPatterns?.[0] ??
    "Control and alignment";
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

  const knowledgeCards: Array<{
    key: "movement" | "stability" | "compensation" | "adaptation";
    title: string;
    summary: string;
    items: string[];
  }> = [
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
      optimizerReasonsByExercise[item.exerciseId]?.[0] ??
      exerciseRationaleById.get(item.exerciseId)?.primaryReason ??
      exerciseRationaleById.get(item.exerciseId)?.contextReason ??
      buildWhyPicked(exercise).purpose ??
      "Rationale isn’t available for this exercise yet.";
    const prescription = item.reps
      ? `${item.sets ?? 1} x ${item.reps}`
      : item.durationSec
      ? `${item.sets ? `${item.sets} x ` : ""}${item.durationSec}s`
      : item.sets
      ? `${item.sets} sets`
      : null;
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
      optimizerReasonsByExercise[item.exerciseId]?.[0] ??
      exerciseRationaleById.get(item.exerciseId)?.primaryReason ??
      exerciseRationaleById.get(item.exerciseId)?.contextReason ??
      buildWhyPicked(exercise).purpose ??
      "Rationale isn’t available for this exercise yet.";
    const prescription = item.reps
      ? `${item.sets ?? 1} x ${item.reps}`
      : item.durationSec
      ? `${item.sets ? `${item.sets} x ` : ""}${item.durationSec}s`
      : item.sets
      ? `${item.sets} sets`
      : null;
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
  const weekViewDetailEntries =
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

  const completedWorkoutCount = currentProgramCompletedSessions.length;
  const totalCompletedWorkoutCount = allCompletedSessions.length;
  const hasCompletedWorkout = totalCompletedWorkoutCount >= 1;
  const hasCompletedFullWeek =
    completedWeeks >= 1 ||
    phaseGate.cyclesCompletedInPhase >= 1 ||
    Math.floor(completedWorkoutCount / Math.max(1, activeDaysPerWeek)) >= 1;
  const dashboardLevel = hasCompletedFullWeek ? 3 : hasCompletedWorkout ? 2 : 1;
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
      : "Assessment, today, and week planning are ready. Complete one workout to unlock progress and history.";
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
      summary: `${completedWorkoutCount} completed workouts saved for this program.`,
      icon: "H",
      locked: historyLocked,
      lockReason: "Complete one workout to unlock session history.",
    },
    {
      key: "account",
      title: "Billing / Account",
      eyebrow: authEnabled ? (plan === "pro" ? "Pro" : "Free") : "Local",
      summary: authEnabled
        ? "Manage billing, plan status, and account data."
        : "Review local data controls and account options.",
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
      const prescription = item.reps
        ? `${item.sets ?? 1} x ${item.reps}`
        : item.durationSec
        ? `${item.sets ? `${item.sets} x ` : ""}${item.durationSec}s`
        : item.sets
        ? `${item.sets} sets`
        : null;
      return {
        key: `${item.exerciseId}-${item.section}`,
        name: exercise.name,
        section: item.section ?? "work",
        prescription,
      };
    })
    .filter((entry): entry is { key: string; name: string; section: string; prescription: string | null } =>
      Boolean(entry)
    )
    .slice(0, 5);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="order-1">
        <DashboardHero
          greeting={heroGreeting}
          phaseName={phaseName}
          workoutsCompletedInPhase={phaseGate.workoutsCompletedInPhase}
          workoutTarget={phaseGate.minWorkouts}
          weekCompletedDays={completedCount}
          weekTargetDays={activeDaysPerWeek}
          workoutProgressPercent={workoutProgressPercent}
          weekProgressPercent={weekProgressPercent}
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
                Both targets are satisfied: workouts {phaseGate.workoutsCompletedInPhase}/{phaseGate.minWorkouts} and days {phaseGate.daysSincePhaseStart}/{phaseGate.minDays}.
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

      {phaseAdvanceReady && !phaseReadyNoticeOpen ? (
        <section
          className="ui-soft-surface order-2 rounded-lg px-4 py-3 text-sm text-slate-200"
          data-testid="phase-ready-persistent-cta"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Phase {nextPhaseIndex} is ready: workouts {phaseGate.workoutsCompletedInPhase}/{phaseGate.minWorkouts} and days {phaseGate.daysSincePhaseStart}/{phaseGate.minDays}.
            </p>
            <Button variant="primary" onClick={openPhaseAdvancePrompt}>
              Move to Phase {nextPhaseIndex}
            </Button>
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
          <p className="text-sm font-semibold">Session Complete</p>
          <p className="mt-1 text-xs text-emerald-200/85">
            Your program has been updated based on today&apos;s performance.
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
            <p className="ui-kicker">Dashboard Modes</p>
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
              {completedWorkoutCount} workouts logged
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
                      {entry.prescription ? (
                        <p className="mt-1 text-xs text-slate-400">{entry.prescription}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Today&apos;s routine is loading.</p>
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

      {program ? (
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
              description="Technical reference for the saved live program and inspection snapshots. Kept below the main dashboard flow."
              isOpen
              referenceText={currentSavedWeekSnapshotText}
              cardTestId="current-saved-week-card"
              bodyTestId="current-saved-week-body"
              copyLabel="Copy Full Progression Snapshot"
              onCopy={handleCopyCurrentSavedWeek}
              copyStatus={currentWeekCopyStatus}
              className="order-20 p-3 opacity-70 sm:p-4"
              bodyClassName="mt-3 max-h-36 overflow-auto rounded-lg border border-slate-500/20 bg-slate-950/45 p-3"
            />
          ) : (
            <CurrentSavedProgramSnapshotLoadingCard
              message={currentSavedWeekSnapshotLoadingMessage}
            />
          )}
        </>
      ) : null}

      {activeMode === "week" && !activeModeLocked ? (
      <section id="week-view" ref={weekViewSectionRef} className="ui-card ui-soft-surface-raised order-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="ui-kicker">
              This Week
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Week View</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={focusTodayPlanInWeekView}>
              View today&apos;s plan
            </Button>
            <Link
              href={`/session?programId=${resolvedSessionProgramId ?? program.id}&dayIndex=${weekViewStartDay}`}
              scroll
            >
              <Button variant="primary" data-testid="start-selected-day">
                Start Selected Day
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            data-testid="completed-count"
            title={weekViewBaselineDebugTitle}
            className="rounded-lg border border-slate-500/25 bg-slate-950/38 px-2.5 py-1 text-xs text-slate-300"
          >
            {completedCount} completed / {activeDaysPerWeek}
          </span>
          <span className="rounded-lg border border-sky-300/25 bg-sky-300/10 px-2.5 py-1 text-xs text-sky-100">
            {inProgressCount} in progress
          </span>
          <span className="rounded-lg border border-slate-500/25 bg-slate-950/38 px-2.5 py-1 text-xs text-slate-300">
            Current day: {sessionLaunchDayIndex + 1}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {program.week.map((day) => {
            const isCompleted = completedDaySet.has(day.dayIndex);
            const isInProgress =
              !isCompleted && effectiveInProgressDaySet.has(day.dayIndex);
            const isSelected = day.dayIndex === weekViewStartDay;
            const isLocked = isDayLocked(day.dayIndex);
            const isToday = day.dayIndex === sessionLaunchDayIndex;
            const shouldDimLockedCard = isLocked && !isCompleted;
            const stateLabel = isCompleted
              ? "Completed"
              : isInProgress
              ? "In progress"
              : "Not started";
            const statePercent = isCompleted ? 100 : isInProgress ? 50 : 0;
            const dayIndexTextClass = isCompleted
              ? "text-emerald-100"
              : isInProgress
              ? "text-sky-100"
              : "text-slate-300";
            const dayTitleTextClass = isCompleted
              ? "text-emerald-50"
              : isInProgress
              ? "text-sky-50"
              : "text-white";
            const stateLabelClass = isCompleted
              ? "text-emerald-200"
              : isInProgress
              ? "text-sky-200"
              : "text-slate-400";
            return (
              <button
                key={day.dayIndex}
                type="button"
                onClick={() => {
                  if (isLocked) return;
                  if (day.dayIndex === weekViewStartDay && weekViewDetailsOpen) {
                    setWeekViewDetailsOpen(false);
                    return;
                  }
                  openWeekViewDayDetails(day.dayIndex, { scrollToDetails: true });
                }}
                disabled={isLocked}
                className={`min-h-[116px] rounded-lg border px-4 py-3.5 text-left ${
                  isCompleted
                    ? "border-emerald-300/32 bg-emerald-300/10"
                    : isInProgress
                    ? "border-sky-300/38 bg-sky-300/10"
                    : "border-slate-500/20 bg-slate-950/42"
                } ${isSelected ? "shadow-[0_0_0_1px_rgba(125,211,252,0.45),0_18px_46px_rgba(14,165,233,0.13)]" : ""} ${
                  shouldDimLockedCard
                    ? "opacity-60"
                    : "hover:border-sky-200/35"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-semibold ${dayIndexTextClass}`}>
                    Day {day.dayIndex + 1}
                  </p>
                  <div className="flex items-center gap-1">
                    {isCompleted ? (
                      <span className="rounded-lg border border-emerald-300/35 bg-emerald-300/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                        ✓ Completed
                      </span>
                    ) : null}
                    {isInProgress ? (
                      <span className="rounded-lg border border-sky-300/35 bg-sky-300/12 px-2 py-0.5 text-[10px] font-semibold text-sky-100">
                        In progress
                      </span>
                    ) : null}
                    {isToday ? (
                      <span className="rounded-lg border border-slate-400/25 bg-slate-100/8 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                        Today
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className={`mt-1 text-sm font-semibold ${dayTitleTextClass}`}>{day.title}</p>
                <p className={`mt-1 text-xs ${stateLabelClass}`}>{stateLabel}</p>
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded-full border border-slate-500/30 bg-slate-950/60">
                    <div
                      className={`h-full rounded-full transition-[width] duration-[700ms] ease-[cubic-bezier(.22,1,.36,1)] ${
                        isCompleted
                          ? "bg-emerald-500"
                        : isInProgress
                          ? "bg-sky-400"
                          : "bg-slate-500"
                      }`}
                      style={{ width: `${statePercent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {weekViewDetailsOpen && weekViewDay ? (
          <div
            ref={weekViewDetailsRef}
            className="ui-soft-surface mt-5 rounded-lg px-4 py-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Selected Day Details
              </p>
              <button
                type="button"
                onClick={() => setWeekViewDetailsOpen(false)}
                className={secondaryActionBtn}
              >
                Hide details
              </button>
            </div>
            <p className="mt-2 text-lg font-semibold text-white">
              Day {weekViewStartDay + 1} • {weekViewDay.title}
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {weekViewDetailEntries.map((item) => {
                return (
                  <div
                    key={item.key}
                    className="rounded-lg border border-slate-500/22 bg-slate-950/42 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="rounded-md border border-slate-500/24 bg-slate-900/55 px-2 py-0.5 text-[10px] uppercase text-slate-300">
                          {item.sectionLabel}
                        </span>
                      </div>
                    </div>
                    {item.prescription ? (
                      <p className="mt-1 text-xs text-slate-400">{item.prescription}</p>
                    ) : null}
                    <p className="mt-2 text-xs leading-5 text-slate-300">{item.rationale}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
        {isFreePlan ? (
          <p className="mt-3 text-xs text-slate-400">
            Free plan preview is limited to Day 1. Upgrade to unlock Day 2–{program.daysPerWeek}.
          </p>
        ) : null}
      </section>
      ) : null}

      {activeMode === "insights" && !activeModeLocked ? (
      <div className="order-4">
        <DailyInsightCard
          insight={dailyInsight}
          coachNotes={coachNotes}
          priorities={weeklyPriorities}
        />
      </div>
      ) : null}

      <section className="hidden">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Corrective Focus
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Corrective Focus Summary
          </h2>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {coachSummaryBullets.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-slate-700">{item.text}</p>
            </div>
          ))}
        </div>
        {hasAdaptationCallout ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <p>
              System adapted this week to improve stability and execution quality.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
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
        <p className="mt-3 text-xs text-slate-500">Plan adapts as you log sessions.</p>
      </section>

      <div className="hidden">
        <ExpandableSection
          title="Your Current Plan"
          subtitle="Phase intent, weekly objective, and adaptive guidance."
          previewLines={planPreviewLines}
          previewChips={planPreviewChips}
        >
          <div className="space-y-3 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Phase:</span> {phaseName}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Cycle:</span> {program.cycleIndex ?? 1}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Weekly objective:</span>{" "}
            {program.phaseObjective?.weekIntent ?? phaseGoalText}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Weekly structure:</span> {weeklyStructure}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Primary adaptation goal:</span>{" "}
            {adaptationPriority}
          </p>
          <div>
            <p className="font-semibold text-slate-900">Focus areas:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {focusAreas.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <ProgressBar
            label="Plan completion"
            value={weekProgressPercent}
            max={100}
            animate
            subtitle={`${completedCount}/${activeDaysPerWeek} week days completed`}
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold text-slate-800">Why this week changed</p>
            <p className="mt-1 text-xs text-slate-700">{whyChangedLine}</p>
            {program.phaseOptimizerReport ? (
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5">
                  {program.phaseOptimizerReport.changedSlots}/{program.phaseOptimizerReport.totalSlots} slots changed
                </span>
                {(program.sessionAdaptation?.dataSignals ?? [])
                  .slice(0, 3)
                  .map((signal) => (
                    <span
                      key={signal}
                      className="rounded-full border border-slate-200 bg-white px-2 py-0.5"
                    >
                      {signal}
                    </span>
                  ))}
              </div>
            ) : null}
          </div>
          <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            Your nervous system is adapting to improve coordination, stability, and movement confidence.
          </p>
          <details className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <summary className={`${secondaryActionBtn} list-none cursor-pointer`}>
              View details: Recent exercise signals
            </summary>
            <div className="mt-3 space-y-2">
              {recentExerciseSignals.length ? (
                recentExerciseSignals.map((entry) => (
                  <div key={entry.exerciseName} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                    <p className="font-semibold text-slate-800">{entry.exerciseName}</p>
                    <p className="mt-1 text-slate-600">Last session: {entry.status}</p>
                    <p className="text-slate-600">Guidance: {entry.guidance}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  No exercise signals yet. Complete one session and log difficulty/pain to unlock guidance.
                </p>
              )}
            </div>
          </details>
          </div>
        </ExpandableSection>
      </div>

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
                <div
                  id={showDebug ? "exercise-rationale" : undefined}
                  className="mt-2 space-y-2"
                >
                  {selectedDayProgram?.routine.map((item, index) => {
                    const exercise = exerciseById(item.exerciseId);
                    if (!exercise) return null;
                    const richRationale = exerciseRationaleById.get(item.exerciseId);
                    const reason =
                      optimizerReasonsByExercise[item.exerciseId]?.[0] ??
                      buildWhyPicked(exercise).purpose;
                    return (
                      <div key={`${item.exerciseId}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900">{exercise.name}</p>
                          <span className="text-[11px] uppercase text-slate-500">{item.section}</span>
                        </div>
                        {!showDebug ? (
                          <p className="mt-1 text-xs text-slate-600">{reason}</p>
                        ) : (
                          <div className="mt-1 space-y-1">
                            <p className="text-[11px] text-slate-500">
                              Why:{" "}
                              {richRationale?.primaryReason ??
                                richRationale?.contextReason ??
                                "Rationale isn\u2019t available for this exercise yet."}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Setup: {richRationale?.setup ?? "Control each rep, steady tempo."}
                            </p>
                            {richRationale?.progressions.length ? (
                              <p className="text-[11px] text-slate-500">
                                Progression: {richRationale.progressions.join(" / ")}
                              </p>
                            ) : null}
                            {richRationale?.regressions.length ? (
                              <p className="text-[11px] text-slate-500">
                                Regression: {richRationale.regressions.join(" / ")}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {showDebug && (!selectedDayProgram?.routine || selectedDayProgram.routine.length === 0) ? (
                  <p className="mt-2 text-xs text-slate-500">
                    No exercises found for today yet.
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => setShowDebug((prev) => !prev)}
                    className={secondaryActionBtn}
                  >
                    {showDebug ? "Hide exercise rationale" : "Show exercise rationale"}
                  </button>
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
                Search completed sessions across the active program or your full local history.
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
                  placeholder="Search date, day, program, or exercise"
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
                    {scope === "current" ? "Current program" : "All history"}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              {historyEntries.length} result{historyEntries.length === 1 ? "" : "s"} •{" "}
              {historyScope === "current"
                ? `${completedWorkoutCount} saved for this program`
                : `${totalCompletedWorkoutCount} completed workouts total`}
            </p>
          </div>
          <div className="mt-4 grid h-[min(58vh,30rem)] gap-2.5 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] [scrollbar-gutter:stable] sm:h-[min(52vh,34rem)] sm:gap-3 sm:pr-2">
            {historyEntries.length ? (
              historyEntries.map((entry) => {
                const { session, dayIndex } = entry;
                const historyProgramId = session.routineId ?? program.id;
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
                  ? "Complete your first workout in this program to build history."
                  : "Complete your first workout to build history."}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {activeMode === "account" && !activeModeLocked ? (
        <section className="ui-card ui-soft-surface-raised order-4 p-5 sm:p-6" data-testid="account-mode-panel">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
            <div>
              <p className="ui-kicker">Billing / Account</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                {authEnabled ? (plan === "pro" ? "Pro access active" : "Free access") : "Local account controls"}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Manage plan status, exports, and local training data without leaving the dashboard flow.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="ui-soft-surface rounded-lg px-3 py-3">
                  <p className="text-xs text-slate-400">Plan</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {authEnabled ? (plan === "pro" ? "Pro" : "Free") : "Local"}
                  </p>
                </div>
                <div className="ui-soft-surface rounded-lg px-3 py-3">
                  <p className="text-xs text-slate-400">Program</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Phase {currentPhaseIndex}
                  </p>
                </div>
                <div className="ui-soft-surface rounded-lg px-3 py-3">
                  <p className="text-xs text-slate-400">History</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {completedWorkoutCount} workouts
                  </p>
                </div>
              </div>
            </div>
            <div className="ui-soft-surface rounded-lg p-4">
              <p className="text-sm font-semibold text-white">Account actions</p>
              <div className="mt-3 flex flex-col gap-2">
                {authEnabled ? (
                  <Link href="/account/billing" className="self-start">
                    <Button variant="primary">
                      {plan === "pro" ? "Manage subscription" : "Billing status"}
                    </Button>
                  </Link>
                ) : null}
                <Link href="/account/settings">
                  <Button variant="secondary" className="h-11 w-full">
                    Data and settings
                  </Button>
                </Link>
                <Link href="/questionnaire">
                  <Button variant="secondary" className="h-11 w-full">
                    Edit questionnaire
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="ui-soft-surface mt-4 rounded-lg p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Reset current progress</p>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
                  Start this active program from Day 1 again. Completed workout history and logs stay saved.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setResetProgressConfirmOpen(true)}
                data-testid="reset-current-progress-trigger"
              >
                Reset current progress
              </Button>
            </div>
            {resetProgressMessage ? (
              <p className="mt-3 text-xs text-slate-300" aria-live="polite">
                {resetProgressMessage}
              </p>
            ) : null}
            {resetProgressConfirmOpen ? (
              <div
                className="mt-4 rounded-lg border border-sky-300/25 bg-sky-400/10 p-4"
                data-testid="reset-current-progress-confirm"
              >
                <p className="text-sm font-semibold text-white">Start fresh week?</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  This resets the active program baseline and current day back to Day 1.
                  It does not erase completed sessions, exercise logs, programs, photos, or exports.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    disabled={resetProgressWorking}
                    onClick={resetCurrentProgress}
                    data-testid="reset-current-progress-confirm-button"
                  >
                    {resetProgressWorking ? "Resetting..." : "Start fresh week"}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={resetProgressWorking}
                    onClick={() => setResetProgressConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
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
      <div className="order-4">
        <ExpandableSection
          title="Phase Progression"
          subtitle="Requirements and readiness to move ahead."
          previewLines={[phaseRequirementsText, phaseGateReason]}
          previewChips={[
            `${phaseGate.workoutsCompletedInPhase}/${phaseGate.minWorkouts} workouts`,
            `${phaseGate.daysSincePhaseStart}/${phaseGate.minDays} days`,
            readinessEstimate,
          ]}
        >
          <PhaseProgressCard
            phaseName={phaseName}
            phaseDescription={phaseDescription}
            requirementsText={phaseRequirementsText}
            gateReason={phaseGateReason}
            gateProgressText={phaseProgressText}
            moveButtonLabel={movePhaseButtonLabel}
            canMove={phaseControlUi.canMoveNextPhase}
            showSkip={phaseControlUi.showSkipPhaseOne}
            phaseProgressPercent={phaseProgressPercent}
            workoutProgressPercent={workoutProgressPercent}
            readinessEstimate={readinessEstimate}
            onOpenMove={openPhaseAdvancePrompt}
            onOpenSkip={() => setSkipPhaseOneOpen(true)}
            uploadControl={
              phaseControlUi.canUploadPhotos ? (
                <Link href="/assessment">
                  <Button variant="secondary" data-testid="upload-photos-button">
                    Upload new photos
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  disabled
                  data-testid="upload-photos-button"
                  title={phaseGateReason}
                >
                  Upload new photos
                </Button>
              )
            }
          />
          <div className="mt-3">
            <Link href="/questionnaire">
              <Button variant="secondary">Edit answers</Button>
            </Link>
          </div>
        </ExpandableSection>
      </div>
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
