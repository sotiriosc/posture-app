"use client";

import { planRevealPillBase } from "./planRevealStyles";

type PlanSetupRailProps = {
  frequencyLabel: string;
  expectedDuration: string;
  equipmentIdentity: string;
};

export default function PlanSetupRail({
  frequencyLabel,
  expectedDuration,
  equipmentIdentity,
}: PlanSetupRailProps) {
  const items = [
    { id: "frequency", label: frequencyLabel, sr: `Training frequency: ${frequencyLabel}` },
    { id: "duration", label: expectedDuration, sr: `Expected session duration: ${expectedDuration}` },
    { id: "equipment", label: equipmentIdentity, sr: `Equipment: ${equipmentIdentity}` },
  ];

  return (
    <ul
      className="mt-5 flex flex-wrap gap-2"
      data-testid="plan-reveal-setup-rail"
      aria-label="Plan setup"
    >
      {items.map((item) => (
        <li key={item.id}>
          <span
            className={`${planRevealPillBase} border-slate-400/25 bg-slate-950/50 text-slate-100`}
            aria-label={item.sr}
          >
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
