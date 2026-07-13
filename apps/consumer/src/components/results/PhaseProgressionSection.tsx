"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import ExpandableSection from "@/components/dashboard/ExpandableSection";
import PhaseProgressCard from "@/components/dashboard/PhaseProgressCard";
import type { PhaseAdvanceGateResult } from "@/lib/phaseGating";

type PhaseProgressionSectionProps = {
  phaseName: string;
  phaseDescription: string;
  phaseRequirementsText: string;
  phaseGateStatusDetail: string;
  phaseGateStatusLabel: "Ready to advance" | "Gate locked" | "Phase 3 active";
  phaseGateProgressText: string;
  phaseGateReason: string;
  phaseGate: PhaseAdvanceGateResult;
  movePhaseButtonLabel: string;
  canMoveNextPhase: boolean;
  showSkipPhaseOne: boolean;
  canUploadPhotos: boolean;
  onOpenMove: () => void;
  onOpenSkip: () => void;
};

export default function PhaseProgressionSection({
  phaseName,
  phaseDescription,
  phaseRequirementsText,
  phaseGateStatusDetail,
  phaseGateStatusLabel,
  phaseGateProgressText,
  phaseGateReason,
  phaseGate,
  movePhaseButtonLabel,
  canMoveNextPhase,
  showSkipPhaseOne,
  canUploadPhotos,
  onOpenMove,
  onOpenSkip,
}: PhaseProgressionSectionProps) {
  return (
    <div className="order-4">
      <ExpandableSection
        title="Phase Progression"
        subtitle="Requirements and readiness to move ahead."
        previewLines={[phaseRequirementsText, phaseGateStatusDetail]}
        previewChips={[
          `${phaseGate.workoutsCompletedInPhase}/${phaseGate.minWorkouts} workouts`,
          `${phaseGate.daysSincePhaseStart}/${phaseGate.minDays} days`,
          phaseGateStatusLabel,
        ]}
      >
        <PhaseProgressCard
          phaseName={phaseName}
          phaseDescription={phaseDescription}
          requirementsText={phaseRequirementsText}
          gateProgressText={phaseGateProgressText}
          moveButtonLabel={movePhaseButtonLabel}
          canMove={canMoveNextPhase}
          showSkip={showSkipPhaseOne}
          workoutsCompletedInPhase={phaseGate.workoutsCompletedInPhase}
          workoutTarget={phaseGate.minWorkouts}
          daysInPhase={phaseGate.daysSincePhaseStart}
          dayTarget={phaseGate.minDays}
          gateStatusLabel={phaseGateStatusLabel}
          gateStatusDetail={phaseGateStatusDetail}
          onOpenMove={onOpenMove}
          onOpenSkip={onOpenSkip}
          uploadControl={
            canUploadPhotos ? (
              <Link href="/assessment">
                <Button variant="secondary" data-testid="upload-photos-button">
                  Upload new photos
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                disabled
                data-testid="upload-photos-button"
                title={phaseGateReason}
              >
                Upload new photos
              </Button>
            )
          }
        />
        <div className="mt-3">
          <Link href="/questionnaire">
            <Button variant="secondary">Edit profile</Button>
          </Link>
        </div>
      </ExpandableSection>
    </div>
  );
}
