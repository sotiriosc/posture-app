"use client";

import { useState, type ReactNode } from "react";
import { secondaryActionBtn } from "@/components/ui/buttonStyles";

type ExpandableSectionProps = {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
  testId?: string;
  previewLines?: string[];
  previewChips?: string[];
};

export default function ExpandableSection({
  title,
  subtitle,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
  testId,
  previewLines = [],
  previewChips = [],
}: ExpandableSectionProps) {
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const isControlled = typeof controlledExpanded === "boolean";
  const isExpanded = isControlled ? controlledExpanded : localExpanded;

  const handleToggle = () => {
    const next = !isExpanded;
    if (!isControlled) {
      setLocalExpanded(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <section className="ui-card p-5">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={isExpanded}
        data-testid={testId ? `${testId}-toggle` : undefined}
        onClick={handleToggle}
      >
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        <span className={secondaryActionBtn}>
          {isExpanded ? "Hide" : "View"}
        </span>
      </button>
      {!isExpanded && (previewLines.length > 0 || previewChips.length > 0) ? (
        <div className="mt-3 space-y-1.5">
          {previewLines.length ? (
            <div className="space-y-1 text-sm text-slate-600">
              {previewLines.slice(0, 1).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
          {previewChips.length ? (
            <div className="flex flex-wrap gap-1.5">
              {previewChips.slice(0, 3).map((chip) => (
                <span
                  key={chip}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin,transform] duration-200 ease-out ${
          isExpanded
            ? "mt-3 grid-rows-[1fr] translate-y-0 opacity-100"
            : "mt-0 grid-rows-[0fr] -translate-y-0.5 opacity-0"
        }`}
        aria-hidden={!isExpanded}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}
