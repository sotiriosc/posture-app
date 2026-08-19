import type {
  ProductionSequencingAssignmentFact,
  SequencingInterferenceClassification,
  SequencingInterferenceDimension,
  SequencingInterferenceObservation,
} from "./contracts";
import { finalSequencingDeterministicToken } from "./planIdentity";

function protectedLater(fact: ProductionSequencingAssignmentFact): boolean {
  return fact.dominantPurposeRelationship === "dominant" || fact.needPriorities.includes("required");
}

function demandClassification(input: {
  readonly level: ProductionSequencingAssignmentFact["localFatigue"];
  readonly protected: boolean;
}): SequencingInterferenceClassification {
  if (input.level === "unknown") return "unknown";
  if (!input.protected || input.level === "low") return "no_known_interference";
  return "potential_interference";
}

export function buildSequencingInterferenceObservations(input: {
  readonly preceding: ProductionSequencingAssignmentFact;
  readonly protectedLater: ProductionSequencingAssignmentFact;
}): readonly SequencingInterferenceObservation[] {
  const activeNeedIds = input.protectedLater.satisfiedNeedIds;
  const isProtected = protectedLater(input.protectedLater);
  const sharedStress = input.preceding.intrinsicStressFacts.filter((tag) =>
    input.protectedLater.intrinsicStressFacts.includes(tag) ||
    input.protectedLater.potentialStressFacts.includes(tag)
  );
  const dimensions: readonly {
    readonly dimension: SequencingInterferenceDimension;
    readonly classification: SequencingInterferenceClassification;
    readonly basis: readonly string[];
  }[] = [
    { dimension: "local_fatigue_overlap", classification: demandClassification({ level: input.preceding.localFatigue, protected: isProtected }), basis: [`local_fatigue:${input.preceding.localFatigue}`] },
    { dimension: "systemic_fatigue", classification: demandClassification({ level: input.preceding.systemicFatigue, protected: isProtected }), basis: [`systemic_fatigue:${input.preceding.systemicFatigue}`] },
    { dimension: "axial_loading", classification: demandClassification({ level: input.preceding.axialLoading, protected: isProtected }), basis: [`axial_loading:${input.preceding.axialLoading}`] },
    { dimension: "grip_loading", classification: demandClassification({ level: input.preceding.gripLoadingPotential, protected: isProtected }), basis: [`grip_loading:${input.preceding.gripLoadingPotential}`] },
    { dimension: "trunk_bracing", classification: demandClassification({ level: input.preceding.trunkBracingPotential, protected: isProtected }), basis: [`trunk_bracing:${input.preceding.trunkBracingPotential}`] },
    {
      dimension: "repeated_joint_stress",
      classification: sharedStress.length > 0 && isProtected ? "potential_interference" : "no_known_interference",
      basis: sharedStress.length > 0 ? sharedStress.map((tag) => `shared_stress:${tag}`) : ["no_shared_structured_stress_fact"],
    },
    {
      dimension: "unresolved_prescription_burden",
      classification: input.preceding.unresolvedRequirementIds.length > 0 ? "unknown" : "no_known_interference",
      basis: input.preceding.unresolvedRequirementIds.length > 0
        ? input.preceding.unresolvedRequirementIds
        : ["no_unresolved_prescription_requirement"],
    },
  ];
  return dimensions.map((entry) => ({
    observationId: `sequencing-interference:${finalSequencingDeterministicToken({
      precedingAssignmentId: input.preceding.assignmentId,
      protectedAssignmentId: input.protectedLater.assignmentId,
      dimension: entry.dimension,
    })}`,
    precedingAssignmentId: input.preceding.assignmentId,
    protectedAssignmentId: input.protectedLater.assignmentId,
    dimension: entry.dimension,
    basis: entry.basis,
    classification: entry.classification,
    affectedActiveNeedIds: activeNeedIds,
    reviewState: "unknown",
    provenance: [{ source: "prescription_contract", sourceRef: "sequencing:structured-interference-v1" }],
  }));
}
