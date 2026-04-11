"use client";

import Button from "@/components/ui/Button";

type ProgramReferenceCardProps = {
  isOpen: boolean;
  referenceText: string;
  onToggle: () => void;
};

export default function ProgramReferenceCard({
  isOpen,
  referenceText,
  onToggle,
}: ProgramReferenceCardProps) {
  return (
    <section className="ui-card order-2 p-5" data-testid="program-reference-card">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">Program Reference</h3>
        <Button variant="secondary" onClick={onToggle} data-testid="program-reference-toggle">
          {isOpen ? "Hide phase reference" : "Show phase reference"}
        </Button>
      </div>
      <p className="mt-1 text-xs text-slate-600">
        Optional generated phase preview for checking the questionnaire inputs and day-by-day
        structure without cluttering the main plan.
      </p>
      {isOpen ? (
        <div className="mt-3 max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
          <pre
            className="whitespace-pre-wrap text-[11px] leading-5 text-slate-700"
            data-testid="program-reference-body"
          >
            {referenceText}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
