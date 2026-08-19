import { describe, expect, it } from "vitest";
import {
  BODYWEIGHT_EQUIPMENT,
  NO_PAIN_OR_INJURY,
  planAndComposeSessionSkeleton,
  planSessionIntent,
  validateSessionAllocationDirective,
  type AllocatedPreparationDependency,
  type AllocatedSessionObjective,
  type AssessmentState,
  type PainAndInjuryState,
  type SessionIntentPlannerInput,
} from "../../src";
import {
  plannerDirective,
  plannerInput,
  plannerObjective,
} from "../helpers/sessionIntentPlannerProduction";

function dependency(
  input: Partial<AllocatedPreparationDependency> & Pick<AllocatedPreparationDependency, "id">,
): AllocatedPreparationDependency {
  return {
    id: input.id,
    requiredPreparationCategories: input.requiredPreparationCategories ?? ["activation_control"],
    sourceAssessmentFactIds: input.sourceAssessmentFactIds ?? [],
    requiredEquipmentCapabilities: input.requiredEquipmentCapabilities ?? ["floor_space"],
    intendedSection: input.intendedSection ?? "activation",
    priority: input.priority ?? "preferred",
    ownership: input.ownership ?? "shared",
    selectionTarget: input.selectionTarget ?? {
      targetMovementRoles: ["anti_extension_core"],
      targetActionFunctions: [],
      targetMuscles: ["trunk"],
      muscleRequirement: "any_meaningful_contributor",
      targetBodyRegions: ["lumbar_spine", "pelvis"],
    },
    targetExerciseIds: input.targetExerciseIds ?? [],
    rangeRequirements: input.rangeRequirements ?? [],
    required: input.required ?? false,
    familiarityPolicy: input.familiarityPolicy ?? "always_when_owned",
    provenance: input.provenance ?? {
      sourceKind: "explicit_range_or_control_requirement",
      sourceId: `${input.id}:source`,
      evidenceRefs: [`${input.id}:evidence`],
      transformationRuleId: "test_typed_preparation_dependency",
    },
    reasonCode: input.reasonCode ?? "typed_preparation_dependency",
    explanation: input.explanation ?? "Structured test preparation dependency.",
  };
}

function pushObjective(
  preparationDependencies: readonly AllocatedPreparationDependency[],
  overrides: Partial<AllocatedSessionObjective> = {},
): AllocatedSessionObjective {
  return plannerObjective({
    id: overrides.id ?? "main-push",
    kind: overrides.kind ?? "dominant_main",
    priority: overrides.priority,
    priorityOrder: overrides.priorityOrder,
    preparationDependencies,
    selectionTarget: {
      targetMovementRoles: ["horizontal_push"],
      targetActionFunctions: [],
      targetMuscles: ["chest"],
      muscleRequirement: "primary_required",
      targetBodyRegions: ["shoulder", "elbow"],
    },
  });
}

function upperPushDependency(id = "scapular-upward-rotation"): AllocatedPreparationDependency {
  return dependency({
    id,
    requiredPreparationCategories: ["activation_control"],
    requiredEquipmentCapabilities: ["wall"],
    intendedSection: "activation",
    selectionTarget: {
      targetMovementRoles: ["scapular_control"],
      targetActionFunctions: ["scapular_upward_rotation"],
      targetMuscles: ["serratus"],
      muscleRequirement: "any_meaningful_contributor",
      targetBodyRegions: ["shoulder", "thoracic_spine"],
    },
  });
}

function plannedWith(objectives: readonly AllocatedSessionObjective[]) {
  const directive = plannerDirective({ id: "preparation-derivation", objectives, minutes: 90 });
  return planAndComposeSessionSkeleton(plannerInput({ directive }));
}

describe("causal preparation dependency ingress and need derivation", () => {
  it("preserves typed upper-push dependency truth and lets Candidate Intelligence select the legal wall-slide identity", () => {
    const result = plannedWith([pushObjective([upperPushDependency()])]);
    const preparationNeed = result.planning.sessionIntent?.needs.find((need) => need.section === "activation");
    expect(preparationNeed).toMatchObject({
      priority: "preferred",
      selection: {
        requestedRole: "activation",
        targetMovementRoles: ["scapular_control"],
        targetActionFunctions: ["scapular_upward_rotation"],
        targetMuscles: ["serratus"],
      },
    });
    expect(preparationNeed?.dependencies[0]).toMatchObject({
      requiredPreparationCategories: ["activation_control"],
      requiredEquipmentCapabilities: ["wall"],
      intendedSection: "activation",
      ownership: "shared",
      targetObjectiveIds: ["main-push"],
    });
    const ranked = result.candidateResultsByNeed?.[preparationNeed!.id].rankedCandidates;
    expect(ranked?.map((entry) => entry.exercise.id)).toContain("serratus-wall-slide");
    expect(ranked?.[0].exercise.id).toBe("serratus-wall-slide");
  });

  it("turns a confirmed provenance-bearing assessment fact into a typed shared dependency", () => {
    const assessment: AssessmentState = {
      signals: [{
        id: "product-assessment:pose-shoulder-asymmetry",
        type: "asymmetry_finding",
        source: "photo_assessment",
        confidence: "high",
        priority: "primary",
        region: "shoulder",
        movementRole: "scapular_control",
        description: "Structured Product assessment observation pose-shoulder-asymmetry.",
        provenance: {
          sourceSystem: "product_assessment_report",
          sourceObservationId: "pose-shoulder-asymmetry",
          sourceRevision: "assessment-report:test",
          mappingRuleId: "product-assessment-report-v1:pose-shoulder-asymmetry",
          evidenceRefs: ["assessment-report:test:observation:pose-shoulder-asymmetry"],
          opaqueTextConsumed: false,
        },
      }],
      historicalWeaknesses: [],
    };
    const directive = plannerDirective({
      id: "assessment-owned-preparation",
      objectives: [pushObjective([])],
    });
    const result = planSessionIntent(plannerInput({ directive, assessment }));
    const activation = result.sessionIntent?.needs.find((need) => need.section === "activation");
    expect(activation?.dependencies[0]).toMatchObject({
      assessmentSignalIds: ["product-assessment:pose-shoulder-asymmetry"],
      requiredPreparationCategories: ["activation_control"],
      intendedSection: "activation",
      priority: "preferred",
      ownership: "shared",
      provenance: {
        sourceKind: "assessment_fact",
        transformationRuleId: "high_confidence_primary_or_blocking_relevant_cluster",
      },
    });
    expect(activation?.plannerProvenance?.sourceEvidenceRefs)
      .toContain("assessment-report:test:observation:pose-shoulder-asymmetry");
  });

  it("derives distinct lower-body dynamic-range and trunk-control needs without choosing identities in the planner", () => {
    const objectives = [plannerObjective({
      id: "main-squat",
      kind: "dominant_main",
      preparationDependencies: [
        dependency({
          id: "hip-rotation-range",
          requiredPreparationCategories: ["dynamic_mobility", "range_access"],
          intendedSection: "warmup",
          selectionTarget: {
            targetMovementRoles: ["mobility"],
            targetActionFunctions: ["hip_internal_rotation", "hip_external_rotation"],
            targetMuscles: [],
            muscleRequirement: "any_meaningful_contributor",
            targetBodyRegions: ["hip", "pelvis"],
          },
        }),
        dependency({ id: "trunk-position-control" }),
      ],
      selectionTarget: {
        targetMovementRoles: ["squat", "knee_dominant"],
        targetActionFunctions: ["knee_extension", "hip_extension"],
        targetMuscles: ["quads", "glutes"],
        muscleRequirement: "primary_required",
        targetBodyRegions: ["hip", "knee", "ankle"],
      },
    })];
    const result = plannedWith(objectives);
    const warmup = result.planning.sessionIntent?.needs.find((need) => need.section === "warmup");
    const activation = result.planning.sessionIntent?.needs.find((need) => need.section === "activation");
    expect(warmup?.selection).toMatchObject({
      requestedRole: "preparation",
      targetActionFunctions: ["hip_external_rotation", "hip_internal_rotation"],
    });
    expect(activation?.selection).toMatchObject({
      requestedRole: "activation",
      targetMovementRoles: ["anti_extension_core"],
    });
    expect(result.candidateResultsByNeed?.[warmup!.id].rankedCandidates[0].exercise.id)
      .toBe("moving-ninety-ninety-hip-switch");
    expect(result.candidateResultsByNeed?.[activation!.id].rankedCandidates
      .map((entry) => entry.exercise.id)).toContain("dead-bug");
  });

  it("merges one shared dependency across assignments instead of duplicating a general warm-up", () => {
    const shared = upperPushDependency("shared-scapular-control");
    const objectives = [
      pushObjective([shared], { id: "primary-push", kind: "dominant_main", priorityOrder: 0 }),
      pushObjective([shared], { id: "secondary-push", kind: "secondary_main", priority: "preferred", priorityOrder: 0 }),
    ];
    const result = planSessionIntent(plannerInput({
      directive: plannerDirective({ id: "shared-preparation", objectives, minutes: 90 }),
    }));
    const activationNeeds = result.sessionIntent?.needs.filter((need) => need.section === "activation") ?? [];
    expect(activationNeeds).toHaveLength(1);
    expect(activationNeeds[0].dependencies).toHaveLength(1);
    expect(activationNeeds[0].dependencies[0].targetNeedIds).toHaveLength(2);
    expect(activationNeeds[0].dependencies[0].targetObjectiveIds)
      .toEqual(["primary-push", "secondary-push"]);
    expect(result.preparationNeedTraces).toContainEqual(expect.objectContaining({
      disposition: "merged_shared_dependency",
    }));
  });

  it("does not manufacture corrective work from exercise names or opaque prose", () => {
    const assessment: AssessmentState = {
      signals: [{
        id: "opaque-corrective-prose",
        type: "control_finding",
        source: "questionnaire",
        confidence: "high",
        priority: "primary",
        description: "Chest day should use serratus wall slide; leg day should use couch stretch.",
      }],
      historicalWeaknesses: [],
    };
    const objective = plannerObjective({
      id: "prose-only-main",
      kind: "dominant_main",
      explanation: "Add 90/90 breathing, wall slides, dead bugs, and hip switches.",
    });
    const result = planSessionIntent(plannerInput({
      directive: plannerDirective({ id: "prose-is-inert", objectives: [objective] }),
      assessment,
    }));
    expect(result.sessionIntent?.needs.map((need) => need.section)).toEqual(["main"]);
    expect(result.assessmentEnrichmentTraces).toContainEqual(expect.objectContaining({
      assessmentSignalIds: ["opaque-corrective-prose"],
      disposition: "insufficient_structured_truth",
      producedNeedId: null,
    }));
  });

  it("lets Safety and region-relevant pain suppress preparation before identity ranking", () => {
    const directive = plannerDirective({
      id: "safety-pain-override",
      objectives: [pushObjective([upperPushDependency()])],
    });
    const pain: PainAndInjuryState = {
      ...NO_PAIN_OR_INJURY,
      moderatePain: [{
        kind: "moderate_pain",
        id: "shoulder-pain",
        region: "shoulder",
        severity0To10: 4,
        stressTags: ["overhead_pressing"],
        requiredResponse: "avoid_aggravator",
        description: "Current shoulder pain owns the exclusion.",
      }],
    };
    const painResult = planSessionIntent(plannerInput({ directive, pain }));
    expect(painResult.sessionIntent?.needs.some((need) => need.section === "activation")).toBe(false);
    expect(painResult.preparationNeedTraces).toContainEqual(expect.objectContaining({
      disposition: "blocked_by_pain_or_contraindication",
      producedNeedId: null,
    }));

    const base = plannerInput({ directive });
    const safetyInput: SessionIntentPlannerInput = {
      ...base,
      trainingSafety: { signals: [{
        signalId: "review-first",
        requestedReviewLevel: "review_required_before_ordinary_training",
        authority: {
          source: "coach",
          sourceRef: "coach-review",
          evidenceBasis: ["Explicit review direction."],
          reportedBy: "coach-1",
          reportedAt: "2026-08-18T10:00:00-04:00",
        },
        resolution: { state: "unresolved" },
        notes: [],
      }] },
    };
    const safetyResult = planSessionIntent(safetyInput);
    expect(safetyResult.sessionIntent?.needs.some((need) => need.section === "activation")).toBe(false);
    expect(safetyResult.preparationNeedTraces).toContainEqual(expect.objectContaining({
      disposition: "blocked_by_training_safety",
      producedNeedId: null,
    }));
  });

  it("fails closed when a required wall capability is unavailable", () => {
    const directive = plannerDirective({
      id: "wall-capability",
      objectives: [pushObjective([upperPushDependency()])],
    });
    const noWall = {
      ...BODYWEIGHT_EQUIPMENT,
      bodyweight: { ...BODYWEIGHT_EQUIPMENT.bodyweight, wallAvailable: false },
      supportSurfaces: [],
    };
    const result = planSessionIntent(plannerInput({
      directive,
      equipment: { capabilities: noWall, provenance: "explicit_today", sourceRef: "no-wall" },
    }));
    expect(result.sessionIntent?.needs.some((need) => need.section === "activation")).toBe(false);
    expect(result.preparationNeedTraces).toContainEqual(expect.objectContaining({
      disposition: "required_equipment_unavailable",
      producedNeedId: null,
    }));
  });

  it("uses typed experience and familiarity only when upstream explicitly owns that policy", () => {
    const rehearsal = dependency({
      id: "goblet-squat-rehearsal",
      requiredPreparationCategories: ["movement_rehearsal"],
      intendedSection: "warmup",
      requiredEquipmentCapabilities: ["floor_space"],
      targetExerciseIds: ["goblet-squat"],
      familiarityPolicy: "novice_or_unfamiliar",
      provenance: {
        sourceKind: "selected_exercise_mechanics",
        sourceId: "selected:goblet-squat",
        evidenceRefs: ["selected:goblet-squat:mechanics"],
        transformationRuleId: "selected_exercise_rehearsal_if_unfamiliar",
      },
      selectionTarget: {
        targetMovementRoles: ["squat", "knee_dominant"],
        targetActionFunctions: ["knee_extension", "hip_extension"],
        targetMuscles: ["quads", "glutes"],
        muscleRequirement: "any_meaningful_contributor",
        targetBodyRegions: ["hip", "knee", "ankle"],
      },
    });
    const objective = plannerObjective({
      id: "squat-main",
      kind: "dominant_main",
      preparationDependencies: [rehearsal],
    });
    const directive = plannerDirective({ id: "familiarity", objectives: [objective] });
    const unfamiliar = planSessionIntent(plannerInput({ directive }));
    expect(unfamiliar.sessionIntent?.needs.some((need) => need.section === "warmup")).toBe(true);

    const base = plannerInput({ directive });
    const familiar = planSessionIntent({
      ...base,
      history: {
        ...base.history,
        exerciseHistory: {
          ...base.history.exerciseHistory,
          stableExerciseIds: ["goblet-squat"],
        },
      },
    });
    expect(familiar.sessionIntent?.needs.some((need) => need.section === "warmup")).toBe(false);
    expect(familiar.preparationNeedTraces).toContainEqual(expect.objectContaining({
      disposition: "familiar_movement_rehearsal_not_required",
    }));
  });

  it("rejects unresolved assessment references and replays deterministically", () => {
    const invalid = pushObjective([dependency({
      id: "unknown-assessment",
      sourceAssessmentFactIds: ["missing-assessment-signal"],
      provenance: {
        sourceKind: "assessment_fact",
        sourceId: "missing-assessment-signal",
        evidenceRefs: ["missing-assessment-signal"],
        transformationRuleId: "typed_assessment_dependency",
      },
    })]);
    const invalidInput = plannerInput({
      directive: plannerDirective({ id: "invalid-assessment-ref", objectives: [invalid] }),
    });
    expect(validateSessionAllocationDirective(invalidInput).map((entry) => entry.code))
      .toContain("unknown_preparation_assessment_fact");
    expect(planSessionIntent(invalidInput).status).toBe("under_specified");

    const validInput = plannerInput({
      directive: plannerDirective({
        id: "deterministic-preparation",
        objectives: [pushObjective([upperPushDependency()])],
      }),
    });
    expect(planSessionIntent(validInput)).toEqual(planSessionIntent(validInput));
  });
});
