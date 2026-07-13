"use client";

import Button from "@/components/ui/Button";

type ProgramReferenceCardProps = {
  isOpen: boolean;
  referenceText: string;
  onToggle?: () => void;
  title?: string;
  description?: string;
  showLabel?: string;
  hideLabel?: string;
  cardTestId?: string;
  bodyTestId?: string;
  copyLabel?: string;
  onCopy?: () => void;
  copyStatus?: string | null;
  className?: string;
  bodyClassName?: string;
};

export default function ProgramReferenceCard({
  isOpen,
  referenceText,
  onToggle,
  title = "Phase Preview (Reference)",
  description = "Optional deterministic phase preview for checking questionnaire inputs and day-by-day structure without confusing it with the saved live plan.",
  showLabel = "Show phase preview",
  hideLabel = "Hide phase preview",
  cardTestId = "program-reference-card",
  bodyTestId = "program-reference-body",
  copyLabel,
  onCopy,
  copyStatus,
  className = "order-2 p-5",
  bodyClassName = "mt-3 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3",
}: ProgramReferenceCardProps) {
  return (
    <section className={`ui-card ${className}`} data-testid={cardTestId}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <div className="flex flex-wrap justify-end gap-2">
          {copyLabel && onCopy ? (
            <Button variant="secondary" onClick={onCopy} data-testid={`${cardTestId}-copy`}>
              {copyLabel}
            </Button>
          ) : null}
          {onToggle ? (
            <Button variant="secondary" onClick={onToggle} data-testid={`${cardTestId}-toggle`}>
              {isOpen ? hideLabel : showLabel}
            </Button>
          ) : null}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-600">{description}</p>
      {copyStatus ? (
        <p className="mt-2 text-xs font-semibold text-slate-700" aria-live="polite">
          {copyStatus}
        </p>
      ) : null}
      {isOpen ? (
        <div className={bodyClassName}>
          <pre
            className="whitespace-pre-wrap text-[11px] leading-5 text-slate-700"
            data-testid={bodyTestId}
          >
            {referenceText}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
