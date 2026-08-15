import { describe, expect, it } from "vitest";
import { CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER, buildProductSnapshotReference,
  createControlledProductShadowService, createControlledProductShadowV2Pipeline,
  createInMemoryControlledProductShadowRepository, createProductExerciseIdentityRegistry,
  buildControlledProductShadowMappingBundle, mapProductEquipment, mapProductGoal,
  replayControlledProductShadow, validateControlledProductShadowClientTrigger,
  resolveControlledProductShadowRolloutPolicy, type ControlledProductShadowV2StagePort } from
  "../../src/controlledProductShadow";
import { COMPLETE_PRODUCT_SHADOW_PIPELINE, PRODUCT_SHADOW_DATA_POLICY, PRODUCT_SHADOW_RESOURCE_POLICY,
  productShadowClientTrigger, productShadowSnapshot, SHADOW_TIME } from
  "../helpers/controlledProductShadowFixtures";

function service() {
  const repository = createInMemoryControlledProductShadowRepository();
  const policy = resolveControlledProductShadowRolloutPolicy({ mode: "evaluate_internal_allowlist",
    allowlistedUserIds: "athlete-shadow-1", source: "explicit_test_input" });
  return { repository, service: createControlledProductShadowService({ policy,
    dataMinimizationPolicy: PRODUCT_SHADOW_DATA_POLICY, resourcePolicy: PRODUCT_SHADOW_RESOURCE_POLICY,
    repository, loadProductSnapshot: async () => productShadowSnapshot(),
    pipeline: COMPLETE_PRODUCT_SHADOW_PIPELINE, observability: { emit: () => undefined } }) };
}

describe("controlled Product shadow server boundary", () => {
  it("defaults off and requires its dedicated allowlist", () => {
    const policy = resolveControlledProductShadowRolloutPolicy({ mode: undefined,
      allowlistedUserIds: "athlete-shadow-1" });
    expect(policy.mode).toBe("off");
    expect(policy.adminAllowlistReused).toBe(false);
    expect(policy.legacyAdaptiveFlagReused).toBe(false);
    expect(policy.allUsersEnabled).toBe(false);
  });

  it("fails malformed runtime trigger shapes closed without throwing", () => {
    expect(() => validateControlledProductShadowClientTrigger({} as never)).not.toThrow();
    expect(validateControlledProductShadowClientTrigger({} as never)).toEqual(expect.arrayContaining([
      "UNSUPPORTED_CONTROLLED_PRODUCT_SHADOW_TRIGGER", "INVALID_SHADOW_TRIGGER_KIND",
      "SHADOW_TRIGGER_IDENTITY_REQUIRED", "SHADOW_TRIGGER_CATEGORY_INVALID",
    ]));
  });

  it("maps goals and equipment without inventing outcome or capability facts", () => {
    expect(mapProductGoal({ goals: "Athletic performance" })).toMatchObject({
      status: "under_specified", primaryGoal: null });
    expect(mapProductGoal({ goals: "Reduce pain" })).toMatchObject({
      primaryGoal: "posture_and_movement_quality", programmingContexts: ["pain_aware_return"] });
    expect(mapProductEquipment({ equipment: ["bands", "dumbbells"] })).toMatchObject({
      knownCapabilities: ["bodyweight", "dumbbells"], unknownCapabilities: ["band_type_and_anchor"] });
    expect(buildControlledProductShadowMappingBundle({ athleteId: "athlete-shadow-1",
      questionnaire: { goals: "General fitness", experience: "Beginner", equipment: ["none"], daysPerWeek: 3 },
      assessment: null, prefs: null, productStateRevision: "missing-intent" }).trainingIntent)
      .toMatchObject({ productTrainingIntent: null, status: "mapping_required" });
    const bundle = buildControlledProductShadowMappingBundle({ athleteId: "athlete-shadow-1",
      questionnaire: { goals: "Improve posture", trainingIntent: "maintain", experience: "Beginner",
        equipment: ["bands"], daysPerWeek: 4 }, assessment: null, prefs: null,
      productStateRevision: "product-state-1" });
    expect(bundle.horizon).toMatchObject({ boundary: { kind: "ordered_cycle", startOrder: 1, endOrder: 4 },
      opportunities: expect.arrayContaining([expect.objectContaining({ expectedMinutes: null,
        date: null, weekday: null })]) });
    expect(bundle.unresolvedRequirements).toEqual(expect.arrayContaining([
      "PRODUCT_MAINTENANCE_POLICY_REQUIRED", "band_type_and_anchor",
      "PRODUCT_SESSION_AVAILABILITY_REQUIRED" ]));
    expect(bundle.preferences).toMatchObject({ painMarkedExerciseIds: [], materialExclusionAuthority: false });
    expect(createProductExerciseIdentityRegistry(["dead-bug", "legacy-display-name-exercise"]).entries)
      .toEqual([expect.objectContaining({ productExerciseId: "dead-bug", v2ExerciseId: "dead-bug",
        classification: "exact_same_canonical_id" }), expect.objectContaining({
        productExerciseId: "legacy-display-name-exercise", v2ExerciseId: null,
        classification: "legacy_only_no_v2_identity" })]);
  });

  it("derives stable Product state revisions excluding presentation title changes", () => {
    const first = productShadowSnapshot();
    const second = productShadowSnapshot();
    second.programs![0]!.week[0]!.title = "Presentation title changed";
    expect(buildProductSnapshotReference(first).productStateRevisionFingerprint)
      .toBe(buildProductSnapshotReference(second).productStateRevisionFingerprint);
    second.meta!.programUpdatedAtById!["legacy-program-1"] = "2026-08-15T14:00:00.000-04:00";
    expect(buildProductSnapshotReference(first).productStateRevisionFingerprint)
      .toBe(buildProductSnapshotReference(second).productStateRevisionFingerprint);
    second.questionnaire = { ...second.questionnaire, goals: "General fitness" };
    expect(buildProductSnapshotReference(first).productStateRevisionFingerprint)
      .not.toBe(buildProductSnapshotReference(second).productStateRevisionFingerprint);
  });

  it("persists one unapplied run, returns exact retry, and exposes no client artifact", async () => {
    const context = service();
    const input = { clientTrigger: productShadowClientTrigger(), authenticatedUserId: "athlete-shadow-1",
      appSurface: "consumer" as const, evaluationTime: SHADOW_TIME };
    const first = await context.service.run(input);
    const retry = await context.service.run(input);
    expect(first).toMatchObject({ disposition: "accepted", clientArtifactCount: 0 });
    expect(retry).toMatchObject({ disposition: "idempotent_prior", clientArtifactCount: 0 });
    const record = await context.repository.readRun("athlete-shadow-1", first.runRevisionId!);
    expect(record?.runRevision).toMatchObject({ productMutationApplied: false, applicationApplied: false,
      deliveredToUser: false, performed: false });
    expect(record?.source.excludedSourceReferences).toContain("email");
    expect(PRODUCT_SHADOW_DATA_POLICY).toMatchObject({ emailPersistence: false,
      notesPersistence: false, photoPersistence: false, authTokenPersistence: false,
      rawProductSnapshotPersistence: false });
    expect(record).not.toHaveProperty("rawProductSnapshot");
  });

  it("replays only with exact historical versions and performs no writes or application", async () => {
    const context = service();
    const result = await context.service.run({ clientTrigger: productShadowClientTrigger(),
      authenticatedUserId: "athlete-shadow-1", appSurface: "consumer", evaluationTime: SHADOW_TIME });
    const record = await context.repository.readRun("athlete-shadow-1", result.runRevisionId!);
    const replay = await replayControlledProductShadow({ repository: context.repository,
      athleteId: "athlete-shadow-1", runRevisionId: result.runRevisionId!, mode: "full_shadow_run",
      availableVersions: [...record!.runRevision.adapterReferences, ...record!.runRevision.policyReferences,
        "CONTROLLED_PRODUCT_SHADOW_RUN@1.0.0"] });
    expect(replay).toMatchObject({ status: "exact_historical_match", latestVersionFallbackCount: 0,
      productMutationCount: 0, applicationCount: 0, persistenceWriteCount: 0 });
    await expect(replayControlledProductShadow({ repository: context.repository,
      athleteId: "athlete-shadow-1", runRevisionId: result.runRevisionId!, mode: "comparison",
      availableVersions: [] })).rejects.toThrow(/HISTORICAL_VERSION_UNAVAILABLE/);
  });

  it("persists sanitized pipeline failures and ignores observability failures", async () => {
    const repository = createInMemoryControlledProductShadowRepository();
    const policy = resolveControlledProductShadowRolloutPolicy({ mode: "evaluate_internal_allowlist",
      allowlistedUserIds: "athlete-shadow-1", source: "explicit_test_input" });
    const failing = createControlledProductShadowService({ policy,
      dataMinimizationPolicy: PRODUCT_SHADOW_DATA_POLICY, resourcePolicy: PRODUCT_SHADOW_RESOURCE_POLICY,
      repository, loadProductSnapshot: async () => productShadowSnapshot(),
      pipeline: { evaluate: () => { throw new TypeError("raw internal detail"); } },
      observability: { emit: () => { throw new Error("observer unavailable"); } } });
    const result = await failing.run({ clientTrigger: productShadowClientTrigger(),
      authenticatedUserId: "athlete-shadow-1", appSurface: "consumer", evaluationTime: SHADOW_TIME });
    expect(result).toMatchObject({ disposition: "accepted", status: "shadow_failed",
      clientArtifactCount: 0 });
    const record = await repository.readRun("athlete-shadow-1", result.runRevisionId!);
    expect(record?.failureCodes).toEqual(["V2_PIPELINE_FAILED:TypeError"]);
    expect(JSON.stringify(record)).not.toContain("raw internal detail");
  });

  it("rejects same operation key with a different semantic trigger and isolates athletes", async () => {
    const context = service();
    const firstTrigger = productShadowClientTrigger();
    await context.service.run({ clientTrigger: firstTrigger, authenticatedUserId: "athlete-shadow-1",
      appSurface: "consumer", evaluationTime: SHADOW_TIME });
    const conflict = await context.service.run({ clientTrigger: productShadowClientTrigger({
      productPatchSemanticFingerprint: "different", clientOperationId: firstTrigger.clientOperationId }),
    authenticatedUserId: "athlete-shadow-1", appSurface: "consumer", evaluationTime: SHADOW_TIME });
    expect(conflict.disposition).toBe("conflict");
    const run = await context.repository.findLatestRun("athlete-shadow-1", "legacy-program-1");
    expect(await context.repository.readRun("different-athlete", run!.runRevision.runRevisionId)).toBeNull();
  });

  it("treats a conflicting client Program anchor as a persisted source conflict", async () => {
    const context = service();
    const result = await context.service.run({ clientTrigger: productShadowClientTrigger({
      anchorProgramId: "client-selected-other-program", changedEntityIds: ["legacy-program-1"] }),
    authenticatedUserId: "athlete-shadow-1", appSurface: "consumer", evaluationTime: SHADOW_TIME });
    expect(result).toMatchObject({ disposition: "accepted", status: "shadow_source_conflict" });
    const record = await context.repository.readRun("athlete-shadow-1", result.runRevisionId!);
    expect(record?.source.unresolvedMappings).toContain("product_snapshot_conflict");
  });

  it("keeps a missing expected session pending rather than fabricating Product truth", async () => {
    const context = service();
    const result = await context.service.run({ clientTrigger: productShadowClientTrigger({
      triggerKind: "product_session_completed", changedEntityCategories: ["session"],
      changedEntityIds: ["session-not-yet-visible"], anchorSessionId: "session-not-yet-visible" }),
    authenticatedUserId: "athlete-shadow-1", appSurface: "gyms", evaluationTime: SHADOW_TIME });
    expect(result).toMatchObject({ disposition: "accepted", status: "shadow_source_pending_sync" });
  });

  it("runs every explicit V2 stage in fail-stop order", async () => {
    const calls: string[] = [];
    const ports: ControlledProductShadowV2StagePort[] = CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER.map((stage) => ({
      stage, contractReference: { contractId: `TEST_${stage.toUpperCase()}`, contractVersion: "1.0.0" },
      evaluate: () => { calls.push(stage); return { status: stage === "longitudinal" ||
        stage === "application_orchestration" ? "not_applicable" : "complete", artifactReference: null,
      unresolvedRequirements: [] }; },
    }));
    const pipeline = createControlledProductShadowV2Pipeline({ stagePorts: ports });
    await pipeline.evaluate({ athleteId: "athlete-shadow-1", source: {} as never,
      mappings: {} as never, legacyProjection: null, evaluationTime: SHADOW_TIME });
    expect(calls).toEqual(CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER);
  });

  it("stops at the first incomplete V2 stage with no downstream rescue", async () => {
    const calls: string[] = [];
    const ports: ControlledProductShadowV2StagePort[] = CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER.map((stage) => ({
      stage, contractReference: { contractId: `TEST_${stage.toUpperCase()}`, contractVersion: "1.0.0" },
      evaluate: () => { calls.push(stage); return { status: stage === "week_allocation" ?
        "incomplete_policy" : "complete", artifactReference: null,
      unresolvedRequirements: stage === "week_allocation" ? ["WEEK_POLICY_REQUIRED"] : [] }; },
    }));
    const result = await createControlledProductShadowV2Pipeline({ stagePorts: ports }).evaluate({
      athleteId: "athlete-shadow-1", source: {} as never, mappings: {} as never,
      legacyProjection: null, evaluationTime: SHADOW_TIME });
    expect(calls).toEqual(["week_source", "weekly_intent", "week_allocation"]);
    expect(result).toMatchObject({ status: "shadow_program_incomplete_policy",
      unresolvedRequirements: ["WEEK_POLICY_REQUIRED"], productMutationApplied: false,
      applicationApplied: false });
  });

  it("persists deterministic search and wall-clock resource limits", async () => {
    const repository = createInMemoryControlledProductShadowRepository();
    const policy = resolveControlledProductShadowRolloutPolicy({ mode: "evaluate_internal_allowlist",
      allowlistedUserIds: "athlete-shadow-1", source: "explicit_test_input" });
    const times = [1_000, 1_001, 9_100, 9_100];
    const limited = createControlledProductShadowService({ policy,
      dataMinimizationPolicy: PRODUCT_SHADOW_DATA_POLICY,
      resourcePolicy: { ...PRODUCT_SHADOW_RESOURCE_POLICY, maximumSearchUnits: 0,
        wallClockBudgetMs: 8_000 }, repository,
      loadProductSnapshot: async () => productShadowSnapshot(), pipeline: COMPLETE_PRODUCT_SHADOW_PIPELINE,
      observability: { emit: () => undefined }, monotonicNowMs: () => times.shift() ?? 9_100 });
    const result = await limited.run({ clientTrigger: productShadowClientTrigger(),
      authenticatedUserId: "athlete-shadow-1", appSurface: "consumer", evaluationTime: SHADOW_TIME });
    expect(result).toMatchObject({ disposition: "resource_limit", status: "shadow_resource_limit",
      clientArtifactCount: 0 });
    const record = await repository.readRun("athlete-shadow-1", result.runRevisionId!);
    expect(record?.pipelineResult.unresolvedRequirements).toEqual(expect.arrayContaining([
      "CONTROLLED_PRODUCT_SHADOW_SEARCH_UNIT_LIMIT_REACHED",
      "CONTROLLED_PRODUCT_SHADOW_WALL_CLOCK_LIMIT_REACHED",
    ]));
    expect(record?.resourceTrace).toMatchObject({ searchUnitsConsumed: 1, wallClockElapsedMs: 8_100,
      limitReached: true });
    expect(record?.runRevision).toMatchObject({ productMutationApplied: false, applicationApplied: false,
      deliveredToUser: false, performed: false });
  });

  it("executes 5,000 complete 13-stage shadow pipeline attempts deterministically", async () => {
    let stageEvaluationCount = 0;
    const ports: ControlledProductShadowV2StagePort[] = CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER.map((stage) => ({
      stage, contractReference: { contractId: `STRESS_${stage.toUpperCase()}`, contractVersion: "1.0.0" },
      evaluate: () => { stageEvaluationCount += 1; return { status: stage === "longitudinal" ||
        stage === "application_orchestration" ? "not_applicable" : "complete",
      artifactReference: null, unresolvedRequirements: [] }; },
    }));
    const pipeline = createControlledProductShadowV2Pipeline({ stagePorts: ports });
    const statuses = new Set<string>();
    for (let index = 0; index < 5_000; index += 1) {
      const result = await pipeline.evaluate({ athleteId: `stress-athlete-${index % 80}`,
        source: {} as never, mappings: {} as never, legacyProjection: null,
        evaluationTime: SHADOW_TIME });
      statuses.add(result.status);
      expect(result).toMatchObject({ productMutationApplied: false, applicationApplied: false });
    }
    expect(stageEvaluationCount).toBe(5_000 * CONTROLLED_PRODUCT_SHADOW_V2_STAGE_ORDER.length);
    expect([...statuses]).toEqual(["shadow_program_complete"]);
  });
});
