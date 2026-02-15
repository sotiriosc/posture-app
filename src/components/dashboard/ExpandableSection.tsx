"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const [contentHeight, setContentHeight] = useState(0);
  const [programmaticFlash, setProgrammaticFlash] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const userToggleRef = useRef(false);
  const previousExpandedRef = useRef(defaultExpanded);
  const isControlled = typeof controlledExpanded === "boolean";
  const isExpanded = isControlled ? controlledExpanded : localExpanded;

  useEffect(() => {
    previousExpandedRef.current = isExpanded;
  }, []);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const measure = () => {
      setContentHeight(node.scrollHeight);
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [children, isExpanded]);

  useEffect(() => {
    let timer: number | null = null;
    const wasExpanded = previousExpandedRef.current;
    const openedProgrammatically =
      !wasExpanded && isExpanded && isControlled && !userToggleRef.current;

    if (openedProgrammatically) {
      setProgrammaticFlash(true);
      timer = window.setTimeout(() => {
        setProgrammaticFlash(false);
      }, 600);
    } else if (!isExpanded) {
      setProgrammaticFlash(false);
    }

    previousExpandedRef.current = isExpanded;
    userToggleRef.current = false;

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [isExpanded, isControlled]);

  const handleToggle = () => {
    const next = !isExpanded;
    userToggleRef.current = true;
    if (!isControlled) {
      setLocalExpanded(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <section
      className={`ui-card p-5 transition-all duration-[180ms] ease-out hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(15,23,42,0.09)] ${
        programmaticFlash
          ? "bg-sky-50/55 ring-1 ring-sky-200"
          : ""
      }`}
    >
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
        className={`overflow-hidden transition-[max-height,opacity,margin,transform] duration-[180ms] ease-out ${
          isExpanded
            ? "mt-3 translate-y-0 opacity-100"
            : "mt-0 -translate-y-1 opacity-0"
        }`}
        style={{ maxHeight: isExpanded ? `${Math.max(contentHeight, 1)}px` : "0px" }}
        aria-hidden={!isExpanded}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </section>
  );
}
