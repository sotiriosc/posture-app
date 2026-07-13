"use client";

import type { RefObject } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { secondaryActionBtn } from "@/components/ui/buttonStyles";
import type { Program } from "@praxis/engine";

export type WeekViewDetailEntry = {
  key: string;
  name: string;
  sectionLabel: string;
  prescription: string | null;
  rationale: string;
};

type WeekViewPanelProps = {
  program: Program;
  sectionRef: RefObject<HTMLElement | null>;
  detailsRef: RefObject<HTMLDivElement | null>;
  resolvedSessionProgramId: string | null;
  weekViewStartDay: number;
  sessionLaunchDayIndex: number;
  completedCount: number;
  activeDaysPerWeek: number;
  inProgressCount: number;
  weekViewBaselineDebugTitle?: string;
  completedDaySet: Set<number>;
  effectiveInProgressDaySet: Set<number>;
  weekViewDetailsOpen: boolean;
  weekViewDay: Program["week"][number];
  weekViewDetailEntries: WeekViewDetailEntry[];
  isFreePlan: boolean;
  isDayLocked: (dayIndex: number) => boolean;
  onFocusTodayPlan: () => void;
  onOpenDayDetails: (
    dayIndex: number,
    options?: { scrollToDetails?: boolean }
  ) => void;
  onCloseDetails: () => void;
  onToggleDetails: () => void;
};

export default function WeekViewPanel({
  program,
  sectionRef,
  detailsRef,
  resolvedSessionProgramId,
  weekViewStartDay,
  sessionLaunchDayIndex,
  completedCount,
  activeDaysPerWeek,
  inProgressCount,
  weekViewBaselineDebugTitle,
  completedDaySet,
  effectiveInProgressDaySet,
  weekViewDetailsOpen,
  weekViewDay,
  weekViewDetailEntries,
  isFreePlan,
  isDayLocked,
  onFocusTodayPlan,
  onOpenDayDetails,
  onCloseDetails,
  onToggleDetails,
}: WeekViewPanelProps) {
  return (
    <section
      id="week-view"
      ref={sectionRef}
      className="ui-card ui-soft-surface-raised order-4 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ui-kicker">This Week</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Week View</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onFocusTodayPlan}>
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
                  onToggleDetails();
                  return;
                }
                onOpenDayDetails(day.dayIndex, { scrollToDetails: true });
              }}
              disabled={isLocked}
              className={`min-h-[116px] rounded-lg border px-4 py-3.5 text-left ${
                isCompleted
                  ? "border-emerald-300/32 bg-emerald-300/10"
                  : isInProgress
                  ? "border-sky-300/38 bg-sky-300/10"
                  : "border-slate-500/20 bg-slate-950/42"
              } ${isSelected ? "shadow-[0_0_0_1px_rgba(125,211,252,0.45),0_18px_46px_rgba(14,165,233,0.13)]" : ""} ${
                shouldDimLockedCard ? "opacity-60" : "hover:border-sky-200/35"
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
              <p className={`mt-1 text-sm font-semibold ${dayTitleTextClass}`}>
                {day.title}
              </p>
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
        <div ref={detailsRef} className="ui-soft-surface mt-5 rounded-lg px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Selected Day Details
            </p>
            <button type="button" onClick={onCloseDetails} className={secondaryActionBtn}>
              Hide details
            </button>
          </div>
          <p className="mt-2 text-lg font-semibold text-white">
            Day {weekViewStartDay + 1} • {weekViewDay.title}
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {weekViewDetailEntries.map((item) => (
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
            ))}
          </div>
        </div>
      ) : null}
      {isFreePlan ? (
        <p className="mt-3 text-xs text-slate-400">
          Free access keeps Day 1 available. Praxis Pro unlocks Day 2 through Day {program.daysPerWeek}.
        </p>
      ) : null}
    </section>
  );
}
