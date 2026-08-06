"use client";

import type { PlanRevealModel } from "@/lib/program/presentation";
import ClarifyTerm from "@/components/ui/ClarifyTerm";
import { CLARIFY } from "@/components/ui/clarifyTermCopy";
import CapabilityNotice from "./CapabilityNotice";
import PhasePurpose from "./PhasePurpose";
import PlanSetupRail from "./PlanSetupRail";
import PrimaryPlanAction from "./PrimaryPlanAction";
import { planRevealTransition } from "./planRevealStyles";

type PlanRevealHeroProps = {
  model: PlanRevealModel;
  startHref: string;
  onSeeWhy: () => void;
  ctaPulse?: boolean;
};

export default function PlanRevealHero({
  model,
  startHref,
  onSeeWhy,
  ctaPulse = false,
}: PlanRevealHeroProps) {
  return (
    <section
      className={`ui-card ui-soft-surface-raised p-5 sm:p-6 ${planRevealTransition}`}
      data-testid="plan-reveal-hero"
      aria-labelledby="plan-reveal-phase-label"
    >
      <p className="ui-kicker text-sky-100">Your first phase</p>
      <h1
        id="plan-reveal-phase-label"
        className="mt-1 text-3xl font-semibold text-white sm:text-4xl"
        data-testid="plan-reveal-phase-label"
      >
        <ClarifyTerm term="Phase" explanation={CLARIFY.Phase}>
          {model.phaseLabel}
        </ClarifyTerm>
      </h1>

      <PhasePurpose purpose={model.phasePurpose} />

      <PlanSetupRail
        frequencyLabel={model.frequencyLabel}
        expectedDuration={model.expectedDuration}
        equipmentIdentity={model.equipmentIdentity}
      />

      <CapabilityNotice
        notes={
          model.criticalCapabilityNotes.length
            ? model.criticalCapabilityNotes
            : model.capabilityNotes.slice(0, 1)
        }
      />

      <div className="mt-6 flex w-full flex-col gap-3 lg:max-w-md">
        <PrimaryPlanAction
          href={startHref}
          label={model.primaryCtaLabel}
          pulse={ctaPulse}
        />
        <button
          type="button"
          onClick={onSeeWhy}
          className="min-h-11 rounded-lg border border-slate-400/30 bg-transparent px-4 text-sm font-medium text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          data-testid="plan-reveal-secondary-cta"
        >
          {model.secondaryCtaLabel}
        </button>
      </div>
    </section>
  );
}
