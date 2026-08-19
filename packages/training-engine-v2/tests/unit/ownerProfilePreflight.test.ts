import { describe, expect, it } from "vitest";
import {
  CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
  EQUIPMENT_CAPABILITY_KEYS,
  REFERENCE_EXERCISES,
  applyOwnerProfilePreflightAnswers,
  buildOwnerEquipmentAvailabilityQuestion,
  buildOwnerEnrollmentRevision,
  buildOwnerFamiliarityQuestion,
  buildOwnerGenerationCommand,
  buildOwnerProfilePreflight,
  buildOwnerProfileRevision,
  ownerSatisfiedPrerequisiteIds,
  runControlledOwnerProductionPipeline,
  type OwnerGetStrongerProfileRevision,
  type OwnerPipelineStageArtifact,
  type OwnerProfilePreflightAnswerSubmission,
} from "../../src";

const SOURCE_PRODUCT_REVISION = "product-revision:owner-preflight";
const ENGINE_VERSION = "training-engine-v2@owner-preflight-test";
const TIMES = ["2026-08-18T10:00:00.000Z", "2026-08-18T10:01:00.000Z",
  "2026-08-18T10:02:00.000Z", "2026-08-18T10:03:00.000Z",
  "2026-08-18T10:04:00.000Z", "2026-08-18T10:05:00.000Z"] as const;

function profile(input: {
  readonly id?: string;
  readonly familiarity?: OwnerGetStrongerProfileRevision["familiarity"];
  readonly safety?: OwnerGetStrongerProfileRevision["trainingSafety"];
  readonly equipmentCapabilityIds?: readonly string[];
} = {}): OwnerGetStrongerProfileRevision {
  const userId = `owner-preflight-${input.id ?? "fixture"}`;
  return buildOwnerProfileRevision({ userId, basedOnRevisionId: null,
    primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: 5,
    sessionOpportunities: Array.from({ length: 5 }, (_, index) => ({
      opportunityId: `owner-opportunity-${index + 1}`, order: index + 1, minutes: 90,
    })), sessionMinutes: { status: "known", minutes: 90 },
    equipmentCapabilitySnapshot: { environment: "commercial_gym",
      capabilityIds: input.equipmentCapabilityIds ?? ["bodyweight", "dumbbells", "adjustable_bench"],
      confirmed: true,
      sourceRevision: "owner-equipment:preflight-fixture" }, coarseExperience: "advanced",
    familiarity: input.familiarity ?? [],
    painContext: { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
    assessmentReferences: [], trainingSafety: input.safety ?? "clear", continuityReferences: [],
    evaluationTime: TIMES[0], provenance: { source: "owner_confirmation", sourceRefs: ["fixture"] },
    reviewState: "confirmed", createdAt: TIMES[0] });
}

function run(current: OwnerGetStrongerProfileRevision, engineVersion = ENGINE_VERSION) {
  const enrollment = buildOwnerEnrollmentRevision({ userId: current.userId, basedOnRevisionId: null,
    state: "active", fixedGoal: "strength", permission: "preview_only", explicitConsent: true,
    acceptedVersions: ["controlled-owner-delivery@1.0.0"],
    provenance: { source: "owner_confirmation", sourceRefs: ["fixture"] }, createdAt: TIMES[0] });
  const command = buildOwnerGenerationCommand({ userId: current.userId,
    enrollmentRevisionId: enrollment.revisionId, profileRevisionId: current.revisionId,
    sourceProductSnapshotId: "product-snapshot:owner-preflight",
    sourceProductRevisionId: SOURCE_PRODUCT_REVISION, activeLegacyProgramRevisionId: "legacy:unchanged",
    engineVersion, policyVersions: CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
    evaluationTime: TIMES[5], requestedAt: TIMES[5] });
  return runControlledOwnerProductionPipeline({ command, profile: current, proposedProductFacts: [] });
}

function answer(current: OwnerGetStrongerProfileRevision,
  result: ReturnType<typeof run>, answers: readonly OwnerProfilePreflightAnswerSubmission[], time: string) {
  const applied = applyOwnerProfilePreflightAnswers({ profile: current, preflight: result.preflight,
    answers, answeredAt: time });
  expect(applied.status, applied.reasonCodes.join(",")).toBe("revised");
  return applied.profile!;
}

function answerAll(current: OwnerGetStrongerProfileRevision, result: ReturnType<typeof run>,
  value: OwnerProfilePreflightAnswerSubmission["answer"], time: string) {
  return answer(current, result, result.preflight.questions.map((question) => ({
    questionId: question.questionId, questionRevisionId: question.questionRevisionId, answer: value,
  }) as OwnerProfilePreflightAnswerSubmission), time);
}

function stage<T>(stages: readonly OwnerPipelineStageArtifact[], name: OwnerPipelineStageArtifact["stage"]): T {
  return stages.find((entry) => entry.stage === name)!.payload as T;
}

describe("controlled-owner progressive profile preflight", () => {
  it("keeps hinge-control owned by movement competency rather than familiarity or experience", () => {
    const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === "dumbbell-romanian-deadlift")!;
    expect(exercise.prerequisites).toEqual([{ id: "hinge-control", type: "required_competency",
      description: "Requires ability to hinge without loaded spinal flexion." }]);

    const familiar = profile({ id: "familiarity-is-not-capability", familiarity: [{
      exerciseId: exercise.id, realizationId: null, status: "known",
    }] });
    expect(ownerSatisfiedPrerequisiteIds({ profile: familiar,
      sourceProductRevisionId: SOURCE_PRODUCT_REVISION, engineVersion: ENGINE_VERSION })).toEqual([]);
    const first = run(familiar);
    const replay = run(familiar);
    expect(first).toEqual(replay);
    expect(first.status).toBe("blocked");
    expect(first.unresolvedFacts).toContain("OWNER_REQUIRED_CANDIDATE_CAPABILITY_UNRESOLVED:hinge-control");
    expect(first.preflight.questions).toHaveLength(1);
    expect(first.preflight.questions[0]).toMatchObject({
      questionId: "owner-query:movement-capability:hinge-control",
      kind: "movement_capability", canonicalFactId: "hinge-control",
      prerequisiteType: "required_competency", exerciseId: exercise.id,
      prompt: "Can you perform a hip hinge with a comfortable, controlled trunk position?",
      requiredBeforePreview: true,
    });
    expect(first.preflight.questions[0]!.technicalRefs).toContain("hinge-control");
  });

  it("applies Yes, No, and Not sure without crossing fact authorities", () => {
    const initial = profile({ id: "answer-semantics" });
    const unresolved = run(initial);
    const question = unresolved.preflight.questions[0]!;

    const yes = answer(initial, unresolved, [{ questionId: question.questionId,
      questionRevisionId: question.questionRevisionId, answer: "yes" }], TIMES[1]);
    expect(yes.basedOnRevisionId).toBe(initial.revisionId);
    expect(yes.prerequisiteConfirmations).toMatchObject([{ prerequisiteId: "hinge-control",
      prerequisiteType: "required_competency", answer: "yes", confirmationTime: TIMES[1],
      provenance: { source: "owner_confirmation" } }]);
    expect(yes.familiarity).toEqual([]);
    expect(yes.equipmentCapabilitySnapshot.capabilityIds).toEqual(initial.equipmentCapabilitySnapshot.capabilityIds);
    expect(yes.painContext).toEqual(initial.painContext);
    expect(run(yes).status).toBe("complete");

    for (const response of ["no", "not_sure"] as const) {
      const revised = answer(initial, unresolved, [{ questionId: question.questionId,
        questionRevisionId: question.questionRevisionId, answer: response }], TIMES[2]);
      const blocked = run(revised);
      expect(blocked.status).toBe("blocked");
      expect(blocked.preflight.questions[0]).toMatchObject({ canonicalFactId: "hinge-control",
        currentAnswer: response });
      expect(ownerSatisfiedPrerequisiteIds({ profile: revised,
        sourceProductRevisionId: SOURCE_PRODUCT_REVISION, engineVersion: ENGINE_VERSION })).toEqual([]);
      expect(blocked.preflight.blockerCodes).toContain(response === "no"
        ? "OWNER_REQUIRED_CANDIDATE_CAPABILITY_DECLINED:hinge-control"
        : "OWNER_REQUIRED_CANDIDATE_CAPABILITY_NOT_CONFIRMED:hinge-control");
    }
  });

  it("records exact familiarity provenance without granting capability, Safety, equipment, or load truth", () => {
    const initial = profile({ id: "familiarity-provenance" });
    const familiarityQuestion = buildOwnerFamiliarityQuestion({ profile: initial,
      exerciseId: "dumbbell-romanian-deadlift", sourceProductRevisionId: SOURCE_PRODUCT_REVISION,
      engineVersion: ENGINE_VERSION, responsibilityKey: "foundation:hinge_hip_extension" });
    const preflight = buildOwnerProfilePreflight({ profile: initial, questions: [familiarityQuestion],
      blockerCodes: [] });
    const applied = applyOwnerProfilePreflightAnswers({ profile: initial, preflight, answers: [{
      questionId: familiarityQuestion.questionId,
      questionRevisionId: familiarityQuestion.questionRevisionId, answer: "yes",
    }], answeredAt: TIMES[1] });
    expect(applied.profile?.familiarity).toMatchObject([{ exerciseId: "dumbbell-romanian-deadlift",
      status: "known", answer: "yes", confirmationTime: TIMES[1],
      provenance: { source: "owner_confirmation" } }]);
    expect(applied.profile?.prerequisiteConfirmations).toEqual([]);
    expect(run(applied.profile!).status).toBe("blocked");
  });

  it("does not infer exact equipment from Advanced experience or a commercial-gym label", () => {
    let current = profile({ id: "no-environment-inference", equipmentCapabilityIds: [] });
    let result = run(current);
    current = answerAll(current, result, "yes", TIMES[1]);
    result = run(current);

    expect(result.status).toBe("blocked");
    expect(result.preflight.questions).toHaveLength(1);
    expect(result.preflight.questions[0]).toMatchObject({
      kind: "equipment_availability",
      equipmentCapabilityId: "flat_bench",
      currentAnswer: null,
    });
  });

  it("progresses through only relevant equipment and loading facts with unit-preserving calibration", () => {
    let current = profile({ id: "complete-progressive-trace" });
    let result = run(current);

    current = answerAll(current, result, "yes", TIMES[1]);
    result = run(current);
    expect(result.preflight.questions.map((entry) => entry.questionId)).toEqual([
      "owner-query:equipment-availability:dumbbell_pair",
    ]);
    expect(result.preflight.questions[0]!.why).toContain("environment label alone does not confirm it");

    current = answerAll(current, result, "yes", TIMES[2]);
    result = run(current);
    expect(result.preflight.questions.map((entry) => entry.questionId)).toEqual([
      "owner-query:equipment-load-ceiling:dumbbells",
    ]);
    const ceilingQuestion = result.preflight.questions[0]!;
    current = answer(current, result, [{ questionId: ceilingQuestion.questionId,
      questionRevisionId: ceilingQuestion.questionRevisionId, answer: "provided", value: 100, unit: "lb" }],
    TIMES[3]);
    expect(current.equipmentCapabilitySnapshot.loadCeilings).toMatchObject([{ equipmentId: "dumbbells",
      enteredValue: 100, enteredUnit: "lb", normalizedKilograms: 45.359237, status: "provided" }]);

    result = run(current);
    expect(result.preflight.questions).toHaveLength(4);
    expect(result.preflight.questions.every((entry) => entry.kind === "loading_suitability")).toBe(true);
    expect(result.preflight.questions.map((entry) => entry.responsibilityKey).sort()).toEqual([
      "foundation:hinge_hip_extension", "foundation:knee_dominant_squat",
      "foundation:upper_pull", "foundation:upper_push",
    ]);
    const squatQuestion = result.preflight.questions.find((entry) =>
      entry.responsibilityKey === "foundation:knee_dominant_squat")!;
    expect(squatQuestion.exerciseId).toBe("goblet-squat");
    current = answerAll(current, result, "yes", TIMES[4]);
    result = run(current);

    expect(result.status).toBe("complete");
    expect(result.preflight).toMatchObject({ status: "ready", questions: [], bounded: true,
      maximumQuestionCount: 12 });
    expect(result.approvalAllowed).toBe(true);
    expect(result.unresolvedFacts.filter((entry) =>
      entry.startsWith("OWNER_CALCULATED_SESSION_DURATION_INDETERMINATE"))).toHaveLength(0);
    expect(result.unresolvedFacts).toEqual([]);
    expect(result.unresolvedFacts).not.toContain("OWNER_REQUIRED_LOADING_COMPLETENESS_SATISFIED");
    expect(result.projection?.sessions).toHaveLength(4);
    expect(result.projection?.sessions.map((session) => session.exerciseAssignments.map((assignment) =>
      assignment.exerciseId))).toEqual([
      ["goblet-squat", "dumbbell-romanian-deadlift"],
      ["dumbbell-bench-press", "chest-supported-dumbbell-row"],
      ["split-squat", "dumbbell-romanian-deadlift"],
      ["dumbbell-bench-press", "chest-supported-dumbbell-row"],
    ]);
    expect(result.projection?.sessions.map((session) => [
      session.calculatedDuration?.knownLowerBoundSeconds,
      session.calculatedDuration?.knownUpperBoundSeconds,
    ])).toEqual([[573, 2038], [573, 2038], [618, 2278], [573, 2038]]);
    for (const session of result.projection?.sessions ?? []) {
      expect(session).toMatchObject({ durationStatus: "bounded", availableMinutes: 90,
        durationResolution: { status: "duration_within_capacity", rebuildCount: 0 } });
      expect(session.exerciseAssignments).toHaveLength(2);
      expect(session.exerciseAssignments.every((assignment) =>
        assignment.doseBlocks?.map((block) => block.purpose).join(",") ===
          "preparatory_acclimation,developmental_work")).toBe(true);
      const components = session.calculatedDuration?.includedComponents ?? [];
      expect(new Set(components.map((component) => component.componentId)).size).toBe(components.length);
      expect(components.reduce((sum, component) => sum + component.lowerBoundSeconds, 0))
        .toBe(session.calculatedDuration?.knownLowerBoundSeconds);
      expect(components.reduce((sum, component) => sum + component.upperBoundSeconds, 0))
        .toBe(session.calculatedDuration?.knownUpperBoundSeconds);
      expect(components.map((component) => component.kind)).toEqual(expect.arrayContaining([
        "dose_execution", "prescribed_rest", "load_calibration", "initial_session_setup",
        "exercise_setup", "assignment_transition",
      ]));
      expect(session.calculatedDuration?.knownUpperBoundSeconds).toBeLessThanOrEqual(90 * 60);
    }
    expect(JSON.stringify(result.projection)).not.toContain("45.359237");
    expect(result.stages.filter((entry) => entry.stage === "gate_13")).toHaveLength(1);
    expect(result.projection?.sessions.flatMap((session) => session.exerciseAssignments)
      .flatMap((assignment) => assignment.doseBlocks ?? [])
      .filter((block) => block.purpose === "developmental_work")
      .every((block) => block.load === "Choose load to match the effort target" &&
        block.calibrationRequired)).toBe(true);
    const week = stage<{ readonly topologyEvidence: { readonly occupiedSessionCount: number;
      readonly unusedOpportunityIds: readonly string[] } }>(result.stages, "week_allocation");
    expect(week.topologyEvidence).toMatchObject({ occupiedSessionCount: 4 });
    expect(week.topologyEvidence.unusedOpportunityIds).toHaveLength(1);
    const policy = stage<{ readonly weeklyResponsibilityPolicy: { readonly responsibilityTraces: readonly {
      readonly loadingCompletenessState: string }[] } }>(result.stages, "product_mapping");
    expect(policy.weeklyResponsibilityPolicy.responsibilityTraces.map((entry) =>
      entry.loadingCompletenessState)).toEqual(Array(4).fill("bounded_initial_calibration"));
    expect(run(current)).toEqual(result);
  });

  it("lets a loading No reject only the exact realization and evaluates a legal fallback", () => {
    let current = profile({ id: "loading-fallback" });
    let result = run(current);
    current = answerAll(current, result, "yes", TIMES[1]);
    result = run(current);
    current = answerAll(current, result, "yes", TIMES[2]);
    result = run(current);
    const ceiling = result.preflight.questions[0]!;
    current = answer(current, result, [{ questionId: ceiling.questionId,
      questionRevisionId: ceiling.questionRevisionId, answer: "provided", value: 50, unit: "kg" }], TIMES[3]);
    result = run(current);
    const declined = result.preflight.questions.find((entry) =>
      entry.responsibilityKey === "foundation:knee_dominant_squat")!;
    expect(declined.exerciseId).toBe("goblet-squat");

    current = answer(current, result, [{ questionId: declined.questionId,
      questionRevisionId: declined.questionRevisionId, answer: "no" }], TIMES[4]);
    result = run(current);
    const fallback = result.preflight.questions.find((entry) =>
      entry.responsibilityKey === "foundation:knee_dominant_squat");

    expect(fallback?.exerciseId).not.toBe("goblet-squat");
    expect(result.preflight.blockerCodes).not.toContain(
      "OWNER_REQUIRED_LOADING_INSUFFICIENT:foundation:knee_dominant_squat:goblet-squat");
    expect(result.unresolvedFacts.some((entry) =>
      entry.includes("OWNER_REQUIRED_RESPONSIBILITY_NO_LEGAL_REALIZATION:foundation:knee_dominant_squat")))
      .toBe(false);
  });

  it("deduplicates canonical questions and fails closed at the bounded question limit", () => {
    const current = profile({ id: "question-bound" });
    const questions = EQUIPMENT_CAPABILITY_KEYS.slice(0, 13).map((capabilityId) =>
      buildOwnerEquipmentAvailabilityQuestion({ profile: current, capabilityId,
        sourceProductRevisionId: SOURCE_PRODUCT_REVISION, engineVersion: ENGINE_VERSION,
        responsibilityKey: "foundation:upper_push", exerciseId: "dumbbell-bench-press" }));
    const duplicate = buildOwnerProfilePreflight({ profile: current,
      questions: [questions[0]!, questions[0]!], blockerCodes: [] });
    expect(duplicate).toMatchObject({ status: "questions_required", bounded: true });
    expect(duplicate.questions).toHaveLength(1);

    const bounded = buildOwnerProfilePreflight({ profile: current, questions, blockerCodes: [] });
    expect(bounded).toMatchObject({ status: "blocked", bounded: true,
      maximumQuestionCount: 12,
      blockerCodes: ["OWNER_PROFILE_PREFLIGHT_QUESTION_BOUND_EXCEEDED"] });
    expect(bounded.questions).toHaveLength(12);
  });

  it("fails stale answers closed and gives Safety precedence", () => {
    const initial = profile({ id: "stale" });
    const first = run(initial);
    const yes = answerAll(initial, first, "yes", TIMES[1]);
    expect(run(yes).status).toBe("complete");
    expect(run(yes, `${ENGINE_VERSION}-changed`).status).toBe("blocked");

    const staleSubmission = applyOwnerProfilePreflightAnswers({ profile: yes, preflight: run(yes).preflight,
      answers: [{ questionId: first.preflight.questions[0]!.questionId,
        questionRevisionId: first.preflight.questions[0]!.questionRevisionId, answer: "yes" }],
      answeredAt: TIMES[2] });
    expect(staleSubmission).toMatchObject({ status: "rejected", profile: null });
    expect(staleSubmission.reasonCodes.some((entry) =>
      entry.startsWith("OWNER_PROFILE_PREFLIGHT_ANSWER_STALE_OR_INVALID"))).toBe(true);

    const safety = run(profile({ id: "safety", safety: "blocked" }));
    expect(safety.status).toBe("blocked");
    expect(safety.unresolvedFacts).toContain("OWNER_PROFILE_TRAINING_SAFETY_BLOCKED");
    expect(safety.preflight.questions).toEqual([]);
  });
});
