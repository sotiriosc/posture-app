import type { ProgramDay, ProgramRoutineItem } from "@/lib/types";

export type ProgramSelectionAuditCandidate = {
  exerciseId: string;
  name: string;
  score: number;
  reasons: string[];
};

export type ProgramSelectionAuditEntry<TCapabilityMode extends string = string> = {
  slotId: string;
  dayTitle: string;
  slotKind: string;
  capabilityMode: TCapabilityMode;
  chosen: ProgramSelectionAuditCandidate;
  top: ProgramSelectionAuditCandidate[];
};

export type ProgramSelectionAuditHook<TCapabilityMode extends string = string> = (
  entry: ProgramSelectionAuditEntry<TCapabilityMode>
) => void;

const selectionAuditBuffer: ProgramSelectionAuditEntry[] = [];

export const getProgramSelectionAuditBuffer = () => [...selectionAuditBuffer];

export const clearProgramSelectionAuditBuffer = () => {
  selectionAuditBuffer.length = 0;
};

export const recordProgramSelectionAuditEntry = <
  TCapabilityMode extends string
>(params: {
  entry: ProgramSelectionAuditEntry<TCapabilityMode>;
  persistToBuffer?: boolean;
  bufferLimit?: number;
  selectionAuditHook?: ProgramSelectionAuditHook<TCapabilityMode>;
}) => {
  if (params.persistToBuffer) {
    selectionAuditBuffer.push(params.entry);
    while (selectionAuditBuffer.length > (params.bufferLimit ?? 500)) {
      selectionAuditBuffer.shift();
    }
  }
  params.selectionAuditHook?.(params.entry);
};

type FinalTraceAuditMeta<TCapabilityMode extends string, TLane extends string> = {
  slotId: string;
  dayTitle: string;
  dayFocusTags: string[];
  slotKind: string;
  slotLane?: TLane;
  capabilityMode: TCapabilityMode;
};

export const buildFinalSelectionTraceEmitter = <
  TSelectionContext,
  TAvailable,
  TCapabilityMode extends string,
  TExercise,
  TLane extends string
>(deps: {
  resolveExerciseById: (exerciseId: string) => TExercise | undefined;
  getExerciseId: (exercise: TExercise) => string;
  getExerciseName: (exercise: TExercise) => string;
  resolveMainLane: (exercise: TExercise) => TLane | undefined;
  resolveSlotKind: (lane: TLane | undefined) => string;
  buildSlotId: (params: { dayTitle: string; mainIndex: number }) => string;
  scoreExerciseForSelectionTrace: (params: {
    exercise: TExercise;
    selectionContext: TSelectionContext;
    available: Set<TAvailable>;
    auditMeta: FinalTraceAuditMeta<TCapabilityMode, TLane>;
  }) => { score: number; reasons: string[] };
  getCapabilityBonus: (params: {
    exercise: TExercise;
    auditMeta: FinalTraceAuditMeta<TCapabilityMode, TLane>;
  }) => { bonus: number; reasons: string[] };
}) =>
  (params: {
    week: ProgramDay[];
    selectionContext: TSelectionContext;
    available: Set<TAvailable>;
    capabilityMode: TCapabilityMode;
    selectionAuditHook?: ProgramSelectionAuditHook<TCapabilityMode>;
  }) => {
    if (!params.selectionAuditHook) return;

    params.week.forEach((day) => {
      const mainItems = day.routine.filter(
        (item): item is ProgramRoutineItem => item.section === "main"
      );
      mainItems.forEach((item, index) => {
        const exercise = deps.resolveExerciseById(item.exerciseId);
        if (!exercise) return;
        const lane = deps.resolveMainLane(exercise);
        const slotId = deps.buildSlotId({
          dayTitle: day.title,
          mainIndex: index + 1,
        });
        const slotKind = deps.resolveSlotKind(lane);
        const auditMeta = {
          slotId,
          dayTitle: day.title,
          dayFocusTags: day.focusTags,
          slotKind,
          slotLane: lane,
          capabilityMode: params.capabilityMode,
        };
        const detail = deps.scoreExerciseForSelectionTrace({
          exercise,
          selectionContext: params.selectionContext,
          available: params.available,
          auditMeta,
        });
        const capabilityBonus = deps.getCapabilityBonus({
          exercise,
          auditMeta,
        });
        const chosen = {
          exerciseId: deps.getExerciseId(exercise),
          name: deps.getExerciseName(exercise),
          score: Number((detail.score + capabilityBonus.bonus).toFixed(2)),
          reasons: [
            "[final_trace]",
            ...detail.reasons,
            ...capabilityBonus.reasons,
          ],
        };

        params.selectionAuditHook?.({
          slotId,
          dayTitle: day.title,
          slotKind,
          capabilityMode: params.capabilityMode,
          chosen,
          top: [chosen],
        });
      });
    });
  };

export const finalizeWeeklyGenerationObservability = <
  TSelectionContext extends { variationState: TVariationState },
  TVariationState,
  TAvailable,
  TCapabilityMode extends string
>(params: {
  week: ProgramDay[];
  selectionContext: TSelectionContext;
  available: Set<TAvailable>;
  capabilityMode: TCapabilityMode;
  selectionAuditHook?: ProgramSelectionAuditHook<TCapabilityMode>;
  emitSelectionTrace: (params: {
    week: ProgramDay[];
    selectionContext: TSelectionContext;
    available: Set<TAvailable>;
    capabilityMode: TCapabilityMode;
    selectionAuditHook?: ProgramSelectionAuditHook<TCapabilityMode>;
  }) => void;
  commitVariationSnapshot: (
    variationState: TVariationState,
    week: ProgramDay[]
  ) => void;
}) => {
  params.emitSelectionTrace({
    week: params.week,
    selectionContext: params.selectionContext,
    available: params.available,
    capabilityMode: params.capabilityMode,
    selectionAuditHook: params.selectionAuditHook,
  });
  params.commitVariationSnapshot(params.selectionContext.variationState, params.week);
};
