import { describe, expect, it } from "vitest";
import { CAGT_GATE_AUTHORITY } from "../cagt/contracts";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
  projectEffectiveAuthorityRegistryV2ToLegacy,
  validateEffectiveAuthorityRegistryV2,
} from "../cagt/effectiveAuthorityRegistryV2";
import { EXPECTED_CAGT_FINGERPRINTS, computeCagtFingerprints } from "../cagt/report";
import { fullProgramCleanSnapshots } from "../helpers/fullPrescribedProgramCagtLab";
import { buildProductionPostPrescriptionWeekBaseInput } from "../helpers/productionPostPrescriptionWeekValidationLab";
import {
  buildFullPrescribedProgramSnapshot,
  validateFullPrescribedProgramSnapshot,
} from "../helpers/fullPrescribedProgramPipeline";

describe("CAGT effective authority registry V2 and full-program snapshots", () => {
  it("preserves historical CAGT V1 while making effective authority explicit", () => {
    expect(computeCagtFingerprints()).toEqual(EXPECTED_CAGT_FINGERPRINTS);
    expect(EXPECTED_CAGT_FINGERPRINTS.combinedCagtTool)
      .toBe("80906606b78c2918137b4e5b13a4cd4fdabb8b424b7e6425c877d2b3b8cb504e");
    expect(CAGT_GATE_AUTHORITY.gate_14_full_prescribed_program_comparison).toBe("NOT_IMPLEMENTED");
    expect(validateEffectiveAuthorityRegistryV2(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2)).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2.gates.gate_14_full_prescribed_program_comparison)
      .toMatchObject({
        exactAuthority: "MIXED_PRODUCTION_AND_DESIGN_PROGRAM_COMPARISON_EVIDENCE",
        productionRuntimeAuthority: false,
        testOnlyComparison: true,
      });
    expect(projectEffectiveAuthorityRegistryV2ToLegacy(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2)
      .gate_14_full_prescribed_program_comparison).toBe("DESIGN_ONLY");
  }, 60_000);

  it("builds deeply immutable complete snapshots with stable lineage identity", () => {
    const [snapshot] = fullProgramCleanSnapshots();
    expect(validateFullPrescribedProgramSnapshot(snapshot)).toEqual([]);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.postPrescriptionWeekValidationResult)).toBe(true);
    expect(snapshot.reservationArtifacts).toHaveLength(snapshot.normalizedWeekSourceSnapshot.reservations.length);
    expect(snapshot.finalSequencePlans.every((plan) => Boolean(plan.revisionLedger.finalRevisionId))).toBe(true);
    expect(snapshot.finalValidationRevisions.some((revision) =>
      revision.validationRevisionId === snapshot.postPrescriptionWeekValidationResult.validationRevisionId)).toBe(true);
  });

  it("keeps snapshot identity stable while structured validation revision truth changes", () => {
    const input = buildProductionPostPrescriptionWeekBaseInput();
    const first = buildFullPrescribedProgramSnapshot({
      validationInput: input,
      authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
    });
    expect(first.status).toBe("built");
    if (first.status !== "built") throw new Error(first.reasonCodes.join(","));
    const revisedInput = {
      ...structuredClone(input),
      evaluationTime: "2026-08-15T00:00:00.000Z",
      priorValidationRevisionContext: {
        ledger: first.snapshot.postPrescriptionWeekValidationResult.revisionLedger!,
        reasonCode: "coach_review" as const,
        changedFieldRefs: ["full-program-snapshot-revision-test"],
      },
    };
    const revised = buildFullPrescribedProgramSnapshot({
      validationInput: revisedInput,
      authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
    });
    expect(revised.status).toBe("built");
    if (revised.status !== "built") throw new Error(revised.reasonCodes.join(","));
    expect(revised.snapshot.snapshotId).toBe(first.snapshot.snapshotId);
    expect(revised.snapshot.snapshotRevisionId).not.toBe(first.snapshot.snapshotRevisionId);
    expect(revised.snapshot.postPrescriptionWeekValidationResult.validationRevisionId)
      .not.toBe(first.snapshot.postPrescriptionWeekValidationResult.validationRevisionId);
  });
});
