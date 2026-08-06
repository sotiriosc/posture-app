"use client";

import { useMemo, useState } from "react";
import type { ProgramPresentationModel } from "@/lib/program/presentation";
import { buildPlanRevealModel } from "@/lib/program/presentation";
import DayPreview from "./DayPreview";
import PlanRevealHero from "./PlanRevealHero";
import ProgressionPreview from "./ProgressionPreview";
import TechnicalDetailDrawer from "./TechnicalDetailDrawer";
import WeeklyPath from "./WeeklyPath";
import WhyPraxisSection from "./WhyPraxisSection";
import { planRevealPillBase } from "./planRevealStyles";

type PlanRevealExperienceProps = {
  presentationModel: ProgramPresentationModel;
  startHref: string;
  ctaPulse?: boolean;
};

/**
 * Phase 8 first-reveal composition. Mount when dashboardLevel === 1.
 * Returning users keep DashboardHero.
 */
export default function PlanRevealExperience({
  presentationModel,
  startHref,
  ctaPulse = false,
}: PlanRevealExperienceProps) {
  const model = useMemo(
    () => buildPlanRevealModel(presentationModel),
    [presentationModel]
  );
  const [whyOpen, setWhyOpen] = useState(false);
  const [selectedInfluenceId, setSelectedInfluenceId] = useState<string | null>(
    model.influencePoints[0]?.id ?? null
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [technicalOpen, setTechnicalOpen] = useState(false);

  const firstDay = model.days[0] ?? null;

  return (
    <div className="order-1 space-y-2" data-testid="plan-reveal-experience">
      <PlanRevealHero
        model={model}
        startHref={startHref}
        ctaPulse={ctaPulse}
        onSeeWhy={() => setWhyOpen(true)}
      />

      <DayPreview day={firstDay} />

      <WhyPraxisSection
        open={whyOpen}
        onToggle={() => setWhyOpen((v) => !v)}
        influencePoints={model.influencePoints}
        selectedId={selectedInfluenceId}
        onSelect={setSelectedInfluenceId}
      />

      <WeeklyPath
        days={model.days}
        selectedDayIndex={selectedDayIndex}
        onSelectDay={setSelectedDayIndex}
      />

      <ProgressionPreview preview={model.progressionPreview} />

      <div className="mt-4">
        <button
          type="button"
          className={`${planRevealPillBase} border-slate-400/30 bg-slate-900/40 text-slate-200`}
          onClick={() => setTechnicalOpen(true)}
          data-testid="plan-reveal-open-technical"
        >
          Technical detail
        </button>
      </div>

      <TechnicalDetailDrawer
        open={technicalOpen}
        onClose={() => setTechnicalOpen(false)}
        phaseLabel={model.phaseLabel}
        phasePurpose={model.phasePurpose}
        frequencyLabel={model.frequencyLabel}
        equipmentIdentity={model.equipmentIdentity}
        weekLabel={model.weekLabel}
        templateVersion={model.templateVersion}
      />
    </div>
  );
}
