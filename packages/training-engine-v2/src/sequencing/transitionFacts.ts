import type {
  ExplicitProductionSequencingTransitionFact,
  ExplicitSequencingTransitionFactType,
  FinalSessionSequencingValidationFinding,
  ProductionFinalSessionSequencingInput,
  ProductionInterExerciseTransitionInstruction,
  ProductionSequencingAssignmentFact,
  ProductionSequencingSetupRelationship,
  ProductionSequencingTransitionFact,
  ProductionSequencingTransitionTarget,
  SequencingInterferenceObservation,
} from "./contracts";
import type {
  OperationalDurationBound,
  OperationalDurationComponent,
} from "../prescription/compiler/contracts";
import { PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE } from "./contracts";
import { buildSequencingInterferenceObservations } from "./interference";
import { finalSequencingDeterministicToken } from "./planIdentity";

export interface ProductionSequencingTransitionFactBuildResult {
  readonly facts: readonly ProductionSequencingTransitionFact[];
  readonly findings: readonly FinalSessionSequencingValidationFinding[];
}

const AUTHORITY: Readonly<Record<ExplicitProductionSequencingTransitionFact["sourceOwner"], number>> = {
  unknown: 0,
  athlete_explicit_fact: 1,
  equipment_product_adapter: 2,
  reviewed_sequencing_policy: 3,
  coach_review: 4,
};

function semanticTarget(fact: ExplicitProductionSequencingTransitionFact): string {
  return finalSequencingDeterministicToken(fact.target);
}

function resolveExplicitFact(input: {
  readonly facts: readonly ExplicitProductionSequencingTransitionFact[];
  readonly type: ExplicitSequencingTransitionFactType;
}): {
  readonly fact: ExplicitProductionSequencingTransitionFact | null;
  readonly conflict: boolean;
} {
  const applicable = input.facts.filter((fact) => fact.factType === input.type);
  if (applicable.length === 0) return { fact: null, conflict: false };
  const maximumAuthority = Math.max(...applicable.map((fact) => AUTHORITY[fact.sourceOwner]));
  const authoritative = applicable.filter((fact) => AUTHORITY[fact.sourceOwner] === maximumAuthority);
  if (new Set(authoritative.map(semanticTarget)).size > 1) return { fact: null, conflict: true };
  return { fact: [...authoritative].sort((left, right) => left.transitionFactId.localeCompare(right.transitionFactId))[0], conflict: false };
}

function derivedSetupRelationship(
  left: ProductionSequencingAssignmentFact,
  right: ProductionSequencingAssignmentFact,
): ProductionSequencingSetupRelationship {
  if (!left.setupSignature || !right.setupSignature || left.setupSignature === "unknown" || right.setupSignature === "unknown") {
    return "unknown";
  }
  if (left.setupSignature === right.setupSignature) return "same_setup";
  if (left.equipmentSignature !== right.equipmentSignature) return "equipment_change_required";
  if (left.supportSignature !== right.supportSignature) return "support_change_required";
  if (left.resistancePathSignature !== right.resistancePathSignature) return "setup_change_required";
  return "compatible_setup";
}

function relationship(
  left: string,
  right: string,
): "same" | "changed" | "unknown" {
  if (!left || !right || left === "unknown" || right === "unknown") return "unknown";
  return left === right ? "same" : "changed";
}

function pairId(left: string, right: string): string {
  return `sequencing-transition:${finalSequencingDeterministicToken({
    fromAssignmentId: left,
    toAssignmentId: right,
  })}`;
}

function resolveExplicitInterferenceFacts(input: {
  readonly facts: readonly ExplicitProductionSequencingTransitionFact[];
  readonly fromAssignmentId: string;
  readonly toAssignmentId: string;
}): {
  readonly observations: readonly SequencingInterferenceObservation[];
  readonly conflict: boolean;
} {
  const interferenceFacts = input.facts.filter((fact) =>
    fact.factType === "interference" && fact.target.kind === "interference"
  );
  const dimensions = [...new Set(interferenceFacts.map((fact) =>
    fact.target.kind === "interference" ? fact.target.value.dimension : ""
  ))].sort();
  const observations: SequencingInterferenceObservation[] = [];
  for (const dimension of dimensions) {
    const applicable = interferenceFacts.filter((fact) =>
      fact.target.kind === "interference" && fact.target.value.dimension === dimension
    );
    const maximumAuthority = Math.max(...applicable.map((fact) => AUTHORITY[fact.sourceOwner]));
    const authoritative = applicable.filter((fact) => AUTHORITY[fact.sourceOwner] === maximumAuthority);
    if (new Set(authoritative.map(semanticTarget)).size > 1) {
      return { observations: [], conflict: true };
    }
    const selected = [...authoritative].sort((left, right) =>
      left.transitionFactId.localeCompare(right.transitionFactId)
    )[0];
    if (selected.target.kind !== "interference") continue;
    observations.push({
      observationId: `sequencing-interference:${finalSequencingDeterministicToken({
        transitionFactId: selected.transitionFactId,
        fromAssignmentId: input.fromAssignmentId,
        toAssignmentId: input.toAssignmentId,
        dimension,
      })}`,
      precedingAssignmentId: input.fromAssignmentId,
      protectedAssignmentId: input.toAssignmentId,
      dimension: selected.target.value.dimension,
      basis: [...selected.target.value.basis].sort(),
      classification: selected.target.value.classification,
      affectedActiveNeedIds: [...selected.target.value.affectedActiveNeedIds].sort(),
      reviewState: selected.reviewState,
      provenance: [selected.provenance],
    });
  }
  return { observations, conflict: false };
}

function unresolvedTimingComponent(
  type: "setup_duration" | "inter_exercise_recovery" | "section_boundary_duration",
  fact: ExplicitProductionSequencingTransitionFact | null,
): string | null {
  if (!fact) return type === "inter_exercise_recovery" ? null : type;
  if (fact.target.kind !== "timing") return type;
  return fact.target.value.kind === "unknown" || fact.target.value.kind === "not_prescribed"
    ? type
    : null;
}

export function buildProductionSequencingTransitionFacts(input: {
  readonly sequencingInput: ProductionFinalSessionSequencingInput;
  readonly assignmentFacts: readonly ProductionSequencingAssignmentFact[];
}): ProductionSequencingTransitionFactBuildResult {
  const findings: FinalSessionSequencingValidationFinding[] = [];
  const knownIds = new Set(input.assignmentFacts.map((fact) => fact.assignmentId));
  const explicitIds = input.sequencingInput.explicitTransitionFacts.map((fact) => fact.transitionFactId);
  if (new Set(explicitIds).size !== explicitIds.length) {
    findings.push({ severity: "error", code: "DUPLICATE_SEQUENCING_TRANSITION_FACT_ID" });
  }
  for (const fact of input.sequencingInput.explicitTransitionFacts) {
    if (!knownIds.has(fact.fromAssignmentId) || !knownIds.has(fact.toAssignmentId) || fact.fromAssignmentId === fact.toAssignmentId) {
      findings.push({ severity: "error", code: "SEQUENCING_TRANSITION_FACT_UNKNOWN_ASSIGNMENT_PAIR", targetId: fact.transitionFactId });
    }
    if (fact.executionAttemptId !== input.sequencingInput.executionAttemptId) {
      findings.push({ severity: "error", code: "SEQUENCING_TRANSITION_FACT_EXECUTION_ATTEMPT_MISMATCH", targetId: fact.transitionFactId });
    }
    if (
      fact.sequencingContract.contractId !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractId ||
      fact.sequencingContract.contractVersion !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE.contractVersion
    ) findings.push({ severity: "error", code: "UNSUPPORTED_SEQUENCING_CONTRACT_VERSION", targetId: fact.transitionFactId });
  }

  const result: ProductionSequencingTransitionFact[] = [];
  for (const left of input.assignmentFacts) {
    for (const right of input.assignmentFacts) {
      if (left.assignmentId === right.assignmentId) continue;
      const explicit = input.sequencingInput.explicitTransitionFacts.filter((fact) =>
        fact.fromAssignmentId === left.assignmentId && fact.toAssignmentId === right.assignmentId
      ).sort((first, second) => first.transitionFactId.localeCompare(second.transitionFactId));
      const resolved = {
        setup: resolveExplicitFact({ facts: explicit, type: "setup_relationship" }),
        equipment: resolveExplicitFact({ facts: explicit, type: "equipment_relationship" }),
        support: resolveExplicitFact({ facts: explicit, type: "support_relationship" }),
        resistance: resolveExplicitFact({ facts: explicit, type: "resistance_path_relationship" }),
        location: resolveExplicitFact({ facts: explicit, type: "location_relationship" }),
        setupDuration: resolveExplicitFact({ facts: explicit, type: "setup_duration" }),
        recovery: resolveExplicitFact({ facts: explicit, type: "inter_exercise_recovery" }),
        sectionDuration: resolveExplicitFact({ facts: explicit, type: "section_boundary_duration" }),
        unknown: resolveExplicitFact({ facts: explicit, type: "unknown_transition_component" }),
      };
      const explicitInterference = resolveExplicitInterferenceFacts({
        facts: explicit,
        fromAssignmentId: left.assignmentId,
        toAssignmentId: right.assignmentId,
      });
      if (Object.values(resolved).some((entry) => entry.conflict) || explicitInterference.conflict) {
        findings.push({
          severity: "error",
          code: "SEQUENCING_TRANSITION_FACT_CONFLICT",
          targetId: pairId(left.assignmentId, right.assignmentId),
        });
        continue;
      }
      const explicitTimingFactIds = [
        resolved.setupDuration.fact,
        resolved.recovery.fact,
        resolved.sectionDuration.fact,
      ].flatMap((fact) => fact ? [fact.transitionFactId] : []).sort();
      const sectionBoundary = left.section !== right.section;
      const unknownTimingComponents = [
        ...[(input.sequencingInput.operationalDurationPolicy && !resolved.setupDuration.fact)
          ? null
          : unresolvedTimingComponent("setup_duration", resolved.setupDuration.fact)].filter(
          (value): value is string => value !== null,
        ),
        ...[unresolvedTimingComponent("inter_exercise_recovery", resolved.recovery.fact)].filter(
          (value): value is string => value !== null,
        ),
        ...(sectionBoundary
          ? [(input.sequencingInput.operationalDurationPolicy && !resolved.sectionDuration.fact)
            ? null
            : unresolvedTimingComponent("section_boundary_duration", resolved.sectionDuration.fact)].filter(
            (value): value is string => value !== null,
          )
          : []),
        ...(resolved.unknown.fact ? [resolved.unknown.fact.transitionFactId] : []),
      ];
      const readRelationship = (
        fact: ExplicitProductionSequencingTransitionFact | null,
        fallback: "same" | "changed" | "unknown",
      ): "same" | "changed" | "unknown" => fact?.target.kind === "relationship"
        ? fact.target.value
        : fallback;
      const equipmentRelationship = readRelationship(
        resolved.equipment.fact,
        relationship(left.equipmentSignature, right.equipmentSignature),
      );
      const supportRelationship = readRelationship(
        resolved.support.fact,
        relationship(left.supportSignature, right.supportSignature),
      );
      const resistancePathRelationship = readRelationship(
        resolved.resistance.fact,
        relationship(left.resistancePathSignature, right.resistancePathSignature),
      );
      const locationTarget = resolved.location.fact?.target;
      const locationRelationship = locationTarget?.kind === "location_relationship" ? locationTarget.value : "unknown";
      const setupTarget = resolved.setup.fact?.target;
      const setupRelationship = setupTarget?.kind === "setup_relationship"
        ? setupTarget.value
        : resolved.location.fact && locationRelationship === "changed" ? "location_change_required"
          : resolved.equipment.fact && equipmentRelationship === "changed" ? "equipment_change_required"
            : resolved.support.fact && supportRelationship === "changed" ? "support_change_required"
              : resolved.resistance.fact && resistancePathRelationship === "changed" ? "setup_change_required"
                : derivedSetupRelationship(left, right);
      const derivedInterference = buildSequencingInterferenceObservations({ preceding: left, protectedLater: right });
      const explicitInterferenceByDimension = new Map(explicitInterference.observations.map((observation) => [
        observation.dimension,
        observation,
      ]));
      result.push({
        sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        transitionFactId: pairId(left.assignmentId, right.assignmentId),
        fromAssignmentId: left.assignmentId,
        toAssignmentId: right.assignmentId,
        executionAttemptId: input.sequencingInput.executionAttemptId,
        sectionRelationship: sectionBoundary ? "section_boundary" : "same_section",
        dependencyRelationship: right.dependencyAssignmentIds.includes(left.assignmentId)
          ? "direct_dependency" : "no_direct_dependency",
        dependencyIds: right.dependencyAssignmentIds.includes(left.assignmentId) ? right.dependencyIds : [],
        setupRelationship,
        equipmentRelationship,
        supportRelationship,
        resistancePathRelationship,
        locationRelationship,
        interferenceObservations: derivedInterference.map((observation) =>
          explicitInterferenceByDimension.get(observation.dimension) ?? observation
        ),
        explicitTimingFactIds,
        unknownTimingComponents,
        provenance: [
          { source: "prescription_contract", sourceRef: `assignment:${left.assignmentId}` },
          { source: "prescription_contract", sourceRef: `assignment:${right.assignmentId}` },
          ...explicit.map((fact) => fact.provenance),
        ],
      });
    }
  }
  return { facts: result.sort((left, right) => left.transitionFactId.localeCompare(right.transitionFactId)), findings };
}

function timingTarget(
  fact: ExplicitProductionSequencingTransitionFact | undefined,
  fallback: ProductionSequencingTransitionTarget,
): ProductionSequencingTransitionTarget {
  return fact?.target.kind === "timing" ? fact.target.value : fallback;
}

const EXPLICIT_TRANSITION_POLICY_REF = "SESSION_EXPLICIT_TRANSITION_EVIDENCE_POLICY@1.0.0";

function operationalComponent(input: {
  readonly transition: ProductionSequencingTransitionFact;
  readonly kind: OperationalDurationComponent["kind"];
  readonly bound: OperationalDurationBound;
}): OperationalDurationComponent {
  return Object.freeze({
    componentId: `sequencing-duration:${finalSequencingDeterministicToken({
      transitionFactId: input.transition.transitionFactId,
      kind: input.kind,
      policyRef: input.bound.policyRef,
      sourceRef: input.bound.provenance.sourceRef,
    })}`,
    owner: "sequencing",
    kind: input.kind,
    lowerBoundSeconds: input.bound.lowerBoundSeconds,
    upperBoundSeconds: input.bound.upperBoundSeconds,
    policyRef: input.bound.policyRef,
    classification: input.bound.classification,
    sourceAssignmentId: input.transition.toAssignmentId,
    sourceDoseBlockId: null,
    countedExactlyOnce: true,
    provenance: input.bound.provenance,
  });
}

function explicitTimingComponent(input: {
  readonly transition: ProductionSequencingTransitionFact;
  readonly fact: ExplicitProductionSequencingTransitionFact;
}): readonly OperationalDurationComponent[] {
  if (input.fact.target.kind !== "timing") return [];
  const target = input.fact.target.value;
  if (target.kind !== "exact" && target.kind !== "range") return [];
  const lower = target.kind === "exact" ? target.seconds : target.minimumSeconds;
  const upper = target.kind === "exact" ? target.seconds : target.maximumSeconds;
  return [operationalComponent({
    transition: input.transition,
    kind: "explicit_transition_timing",
    bound: {
      lowerBoundSeconds: lower,
      upperBoundSeconds: upper,
      classification: "evidence_backed",
      policyRef: EXPLICIT_TRANSITION_POLICY_REF,
      provenance: input.fact.provenance,
    },
  })];
}

function aggregateTarget(
  components: readonly OperationalDurationComponent[],
): ProductionSequencingTransitionTarget {
  return {
    kind: "range",
    minimumSeconds: components.reduce((total, entry) => total + entry.lowerBoundSeconds, 0),
    maximumSeconds: components.reduce((total, entry) => total + entry.upperBoundSeconds, 0),
  };
}

export function resolveProductionSequencingTransitionInstructions(input: {
  readonly sequencingInput: ProductionFinalSessionSequencingInput;
  readonly transition: ProductionSequencingTransitionFact;
}): readonly ProductionInterExerciseTransitionInstruction[] {
  const explicit = input.sequencingInput.explicitTransitionFacts.filter((fact) =>
    fact.fromAssignmentId === input.transition.fromAssignmentId &&
    fact.toAssignmentId === input.transition.toAssignmentId
  ).sort((first, second) => first.transitionFactId.localeCompare(second.transitionFactId));
  const setup = resolveExplicitFact({ facts: explicit, type: "setup_duration" }).fact ?? undefined;
  const recovery = resolveExplicitFact({ facts: explicit, type: "inter_exercise_recovery" }).fact ?? undefined;
  const section = resolveExplicitFact({ facts: explicit, type: "section_boundary_duration" }).fact ?? undefined;
  const instruction = (
    type: ProductionInterExerciseTransitionInstruction["type"],
    source: ExplicitProductionSequencingTransitionFact | undefined,
    target: ProductionSequencingTransitionTarget,
    operationalComponents: readonly OperationalDurationComponent[] = [],
  ): ProductionInterExerciseTransitionInstruction => ({
    sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
    instructionId: `sequencing-instruction:${finalSequencingDeterministicToken({ transitionFactId: input.transition.transitionFactId, type })}`,
    transitionFactId: input.transition.transitionFactId,
    type,
    target,
    sourceTransitionFactId: source?.transitionFactId ?? null,
    countedInDurationExactlyOnce: true,
    ...(input.sequencingInput.operationalDurationPolicy ? {
      operationalComponents: Object.freeze(operationalComponents),
    } : {}),
    provenance: source
      ? [source.provenance]
      : operationalComponents.length
        ? operationalComponents.map((entry) => entry.provenance)
        : [{ source: "policy", sourceRef: "SESSION_SEQUENCING_POLICY_V1:NO_INVENTED_TIME" }],
  });
  const durationPolicy = input.sequencingInput.operationalDurationPolicy;
  const setupComponents = setup && durationPolicy
    ? explicitTimingComponent({ transition: input.transition, fact: setup })
    : durationPolicy
      ? [
        operationalComponent({ transition: input.transition, kind: "assignment_transition",
          bound: durationPolicy.assignmentTransition }),
        operationalComponent({ transition: input.transition, kind: "exercise_setup",
          bound: durationPolicy.exerciseSetupByRelationship[input.transition.setupRelationship] }),
        ...(input.transition.equipmentRelationship === "changed" ||
          input.transition.setupRelationship === "equipment_change_required"
          ? [operationalComponent({ transition: input.transition, kind: "equipment_adjustment",
            bound: durationPolicy.equipmentAdjustment })]
          : []),
      ]
      : [];
  const sectionComponents = section && durationPolicy
    ? explicitTimingComponent({ transition: input.transition, fact: section })
    : durationPolicy && input.transition.sectionRelationship === "section_boundary"
      ? [operationalComponent({ transition: input.transition, kind: "section_transition",
        bound: durationPolicy.sectionTransition })]
      : [];
  const recoveryComponents = recovery && durationPolicy
    ? explicitTimingComponent({ transition: input.transition, fact: recovery })
    : [];
  const instructions: ProductionInterExerciseTransitionInstruction[] = [
    instruction("setup", setup, setupComponents.length
      ? aggregateTarget(setupComponents)
      : timingTarget(setup, { kind: "unknown", reasonCode: "SETUP_DURATION_NOT_EXPLICIT" }),
    setupComponents),
    instruction("recovery", recovery, recoveryComponents.length
      ? aggregateTarget(recoveryComponents)
      : timingTarget(recovery, { kind: "not_prescribed",
        reasonCode: "INTER_EXERCISE_RECOVERY_NOT_PRESCRIBED" }), recoveryComponents),
  ];
  if (input.transition.sectionRelationship === "section_boundary") {
    instructions.push(instruction("section_boundary", section, sectionComponents.length
      ? aggregateTarget(sectionComponents)
      : timingTarget(section, { kind: "unknown",
        reasonCode: "SECTION_BOUNDARY_DURATION_NOT_EXPLICIT" }), sectionComponents));
  }
  return instructions;
}
