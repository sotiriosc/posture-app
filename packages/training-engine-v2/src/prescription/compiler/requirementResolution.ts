import type { SessionPrescriptionAssignmentHandoff } from "../../sessionComposer/contracts";
import type {
  PrescriptionExecutionRequirement,
  PrescriptionRequirementTargetDimension,
  ResolvedPrescriptionRequirementSet,
} from "./contracts";
import { sameSemanticValue, uniqueSorted } from "./utilities";

const NON_PRESCRIPTION_OWNERS = new Set([
  "week",
  "sequencing",
  "longitudinal",
]);

function handoffRequirementIds(
  handoff: SessionPrescriptionAssignmentHandoff,
): readonly string[] {
  return uniqueSorted([
    ...handoff.requiredPrescriptionResolutionIds,
    ...handoff.knownRequirements.sideRequirements.map((entry) => entry.requirementId),
    ...handoff.knownRequirements.supportRequirementIds,
    ...handoff.knownRequirements.rangeRequirementIds,
    ...handoff.knownRequirements.loadRequirementIds,
    ...handoff.knownRequirements.leverRequirementIds,
    ...handoff.knownRequirements.durationRequirementIds,
    ...handoff.knownRequirements.distanceRequirementIds,
    ...handoff.knownRequirements.stepRequirementIds,
    ...handoff.knownRequirements.unclassifiedRequirementIds,
  ]);
}

export function resolvePrescriptionRequirements(input: {
  readonly assignment: SessionPrescriptionAssignmentHandoff;
  readonly requirements: readonly PrescriptionExecutionRequirement[];
}): ResolvedPrescriptionRequirementSet {
  const targeted = input.requirements.filter((requirement) =>
    requirement.targetAssignmentHandoffId === input.assignment.handoffId
  );
  const outside = targeted.filter((requirement) =>
    requirement.resolutionState === "outside_prescription_ownership" ||
    NON_PRESCRIPTION_OWNERS.has(requirement.sourceOwner)
  );
  const owned = targeted.filter((requirement) => !outside.includes(requirement));
  const requiredIds = handoffRequirementIds(input.assignment);
  const presentIds = new Set(targeted.map((requirement) => requirement.requirementId));
  const missing = requiredIds.filter((id) => !presentIds.has(id));
  const unresolved = owned.filter((requirement) =>
    requirement.resolutionState === "unresolved" ||
    requirement.resolutionState === "no_applicable_resolution" ||
    requirement.reviewStatus === "needs_review" ||
    requirement.reviewStatus === "unknown" ||
    (requirement.resolutionState === "resolved" && !requirement.reviewedResolution)
  );
  const conflicting = owned.filter((requirement) =>
    requirement.resolutionState === "conflicting"
  );
  const values: Partial<Record<PrescriptionRequirementTargetDimension, NonNullable<PrescriptionExecutionRequirement["reviewedResolution"]>>> = {};
  const resolved = owned.filter((requirement) =>
    requirement.resolutionState === "resolved" &&
    requirement.reviewStatus === "accepted" &&
    requirement.reviewedResolution !== undefined
  );
  for (const requirement of resolved) {
    const resolution = requirement.reviewedResolution;
    if (!resolution || resolution.kind !== requirement.targetDimension) {
      conflicting.push(requirement);
      continue;
    }
    const existing = values[requirement.targetDimension];
    if (existing && !sameSemanticValue(existing, resolution)) {
      conflicting.push(requirement);
      continue;
    }
    values[requirement.targetDimension] = resolution;
  }
  const reasonCodes = uniqueSorted([
    ...missing.map((id) => `MISSING_REQUIREMENT_RESOLUTION:${id}`),
    ...unresolved.map((entry) => `UNRESOLVED_REQUIREMENT:${entry.requirementId}`),
    ...conflicting.map((entry) => `CONFLICTING_REQUIREMENT:${entry.requirementId}`),
  ]);
  const status = conflicting.length > 0
    ? "conflicting" as const
    : missing.length > 0 || unresolved.length > 0
      ? "unresolved" as const
      : "resolved" as const;
  const syntheticMissing: readonly PrescriptionExecutionRequirement[] = missing.map((id) => ({
    requirementId: id,
    targetAssignmentHandoffId: input.assignment.handoffId,
    sourceOwner: "session_composer",
    sourceRef: `SessionPrescriptionAssignmentHandoff:${input.assignment.handoffId}`,
    targetDimension: "unresolved_other",
    requestedAction: "review_required",
    side: null,
    reviewStatus: "unknown",
    provenance: {
      source: "prescription_contract",
      sourceRef: `missing-requirement-resolution:${id}`,
    },
    resolutionState: "unresolved",
  }));
  return {
    status,
    applicable: resolved,
    ignoredOutsideOwnership: outside,
    unresolved: [...unresolved, ...syntheticMissing],
    conflicting,
    values,
    reasonCodes,
  };
}
