"use client";

type PhasePurposeProps = {
  purpose: string;
};

export default function PhasePurpose({ purpose }: PhasePurposeProps) {
  return (
    <p
      className="mt-2 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg"
      data-testid="plan-reveal-phase-purpose"
    >
      {purpose}
    </p>
  );
}
