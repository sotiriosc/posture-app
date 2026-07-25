"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type ClarifyTermProps = {
  term: string;
  explanation: string;
  learnMoreHref?: string;
  learnMoreLabel?: string;
  children: ReactNode;
  className?: string;
  testId?: string;
};

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * Phase 6g, Commit 2 — inline term-clarification control.
 *
 * Deliberately not a browser `title` tooltip (invisible on mobile, can't be
 * styled) and not a floating cursor-tracking tooltip (fragile hit target,
 * disappears the moment the pointer moves toward it). Tapping or hovering
 * the term opens a small card anchored below it that stays open — regardless
 * of pointer position — until the user explicitly dismisses it via an
 * outside tap/click, Escape, or the card's own close button.
 */
export default function ClarifyTerm({
  term,
  explanation,
  learnMoreHref,
  learnMoreLabel = "Learn more",
  children,
  className = "",
  testId,
}: ClarifyTermProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const cardId = useId();
  const slug = testId ?? slugify(term);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span ref={wrapperRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? cardId : undefined}
        data-testid={`clarify-term-${slug}`}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        className="cursor-help text-inherit underline decoration-slate-500/70 decoration-dotted decoration-1 underline-offset-2 hover:decoration-slate-400"
      >
        {children}
      </button>
      {open ? (
        <span
          id={cardId}
          role="status"
          data-testid={`clarify-term-${slug}-card`}
          className="ui-card absolute left-0 top-full z-50 mt-1.5 block w-72 max-w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-slate-700/60 bg-slate-900/95 p-3 text-left text-xs shadow-xl backdrop-blur"
        >
          <span className="flex items-start justify-between gap-2">
            <span className="font-semibold text-white">{term}</span>
            <button
              type="button"
              aria-label={`Close ${term} explanation`}
              data-testid={`clarify-term-${slug}-close`}
              onClick={() => setOpen(false)}
              className="-mr-1 -mt-1 rounded p-1 leading-none text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/60"
            >
              ×
            </button>
          </span>
          <span className="mt-1 block whitespace-normal break-words leading-relaxed text-slate-300">
            {explanation}
          </span>
          {learnMoreHref ? (
            <a
              href={learnMoreHref}
              className="mt-2 inline-block font-medium text-sky-300 underline underline-offset-2 hover:text-sky-200"
            >
              {learnMoreLabel}
            </a>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
