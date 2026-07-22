"use client";

import { useId, useState, type ReactNode } from "react";

type AnimatedDisclosureProps = {
  summary: ReactNode | ((open: boolean) => ReactNode);
  children: ReactNode;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
  defaultOpen?: boolean;
  testId?: string;
};

/**
 * Drop-in replacement for native <details>/<summary> that animates open/close
 * with zero cumulative layout shift (Phase 6c, Commit 2).
 *
 * Native <details> inserts/removes its content in a single frame with no
 * transition, so everything below it jumps instantly. This uses the
 * grid-template-rows 0fr -> 1fr technique: the row track's animated size is
 * driven by the browser's own layout of the content, so it works for any
 * content height without JS measurement (unlike a max-height animation,
 * which needs a known ceiling or a ResizeObserver).
 */
export default function AnimatedDisclosure({
  summary,
  children,
  className = "",
  summaryClassName = "",
  contentClassName = "",
  defaultOpen = false,
  testId,
}: AnimatedDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        data-testid={testId ? `${testId}-toggle` : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`w-full text-left ${summaryClassName}`}
      >
        {typeof summary === "function" ? summary(open) : summary}
      </button>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className={`min-h-0 overflow-hidden ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
