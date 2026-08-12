import { describe, expect, it } from "vitest";
import {
  buildPainAuditData,
  renderPainSemanticsCalibrationReview,
  type PainContrastRow,
  type PainMatrixRow,
} from "../helpers/painSemanticsCalibrationReview";

const data = buildPainAuditData();

function stableContrastSignature(row: PainContrastRow): string {
  return JSON.stringify({
    warning: row.warning,
    painSuitability: row.painSuitability,
    jointCost: row.jointCost,
    stabilityFit: row.stabilityFit,
    assessmentFit: row.assessmentFit,
    alignmentFit: row.alignmentFit,
    capability: row.capability,
    relationship: row.relationship,
    demandReductionRelevant: row.demandReductionRelevant,
    total: row.total,
    rank: row.rank,
  });
}

function rowsForCandidate(
  rows: readonly PainContrastRow[],
  candidateId: string,
): readonly PainContrastRow[] {
  return rows.filter((row) => row.candidateId === candidateId);
}

function matrixRow(input: {
  readonly matrixId: string;
  readonly state: string;
  readonly candidateId: string;
}): PainMatrixRow {
  const found = data.matrix.find(
    (row) =>
      row.matrixId === input.matrixId &&
      row.state === input.state &&
      row.candidateId === input.candidateId,
  );
  if (!found) {
    throw new Error(
      `Missing matrix row ${input.matrixId}/${input.state}/${input.candidateId}.`,
    );
  }

  return found;
}

describe("pain semantics and calibration audit", () => {
  it("builds deterministic post-contract evidence with a controlled scenario fingerprint", () => {
    const second = buildPainAuditData();
    const rendered = renderPainSemanticsCalibrationReview(data);

    expect(data.matrix).toHaveLength(144);
    expect(data.fieldConsumption).toHaveLength(48);
    expect(data.stressTagAudit).toHaveLength(15);
    expect(data.existingScenarioFingerprint).toBe(
      data.expectedExistingScenarioFingerprint,
    );
    expect(second).toEqual(data);
    expect(renderPainSemanticsCalibrationReview(second)).toBe(rendered);
    expect(
      rendered.match(/PAIN_CONTRACT_READY/g),
    ).toHaveLength(1);

    const requiredFields = [
      "HistoricalInjury.status",
      "HistoricalInjury.region",
      "HistoricalInjury.side",
      "HistoricalInjury.relevantStressTags",
      "HistoricalSensitivity.preferredModification",
      "CurrentDiscomfort.severity0To10",
      "CurrentDiscomfort.effect",
      "ModeratePain.severity0To10",
      "ModeratePain.requiredResponse",
      "AcuteSeverePain.invalidatesTrainingRoles",
      "AcuteSeverePain.urgentReviewRecommended",
      "HardContraindication.source",
      "PersonalExerciseBlock.exerciseIds",
    ];
    expect(data.fieldConsumption.map((row) => row.field)).toEqual(
      expect.arrayContaining(requiredFields),
    );
  });

  it("proves moderate severity 3 through 6 are behaviorally identical", () => {
    for (const candidateId of [
      "dumbbell-romanian-deadlift",
      "cable-pull-through",
    ]) {
      const rows = rowsForCandidate(data.severityContrasts, candidateId);
      expect(rows.map((row) => row.variant)).toEqual(["3", "4", "5", "6"]);
      expect(new Set(rows.map(stableContrastSignature))).toHaveLength(1);
    }

    for (const candidateId of [
      "push-up",
      "dumbbell-bench-press",
      "machine-chest-press",
    ]) {
      const severity1 = matrixRow({
        matrixId: "shoulder-horizontal-push",
        state: "discomfort severity 1",
        candidateId,
      });
      const severity2 = matrixRow({
        matrixId: "shoulder-horizontal-push",
        state: "discomfort severity 2",
        candidateId,
      });

      expect({
        warning: severity1.warning,
        pain: severity1.painSuitabilityRaw,
        joint: severity1.jointCostRaw,
        stability: severity1.stabilityFit,
        total: severity1.total,
        rank: severity1.rank,
      }).toEqual({
        warning: severity2.warning,
        pain: severity2.painSuitabilityRaw,
        joint: severity2.jointCostRaw,
        stability: severity2.stabilityFit,
        total: severity2.total,
        rank: severity2.rank,
      });
    }
  });

  it("proves all moderate requiredResponse variants are currently identical", () => {
    for (const candidateId of [
      "dumbbell-romanian-deadlift",
      "cable-pull-through",
    ]) {
      const rows = rowsForCandidate(data.requiredResponseContrasts, candidateId);
      expect(rows.map((row) => row.variant)).toEqual([
        "avoid_aggravator",
        "reduce_load_and_range",
        "substitute_role",
      ]);
      expect(new Set(rows.map(stableContrastSignature))).toHaveLength(1);
    }
  });

  it("distinguishes monitor from actionable discomfort effects only in assessment context", () => {
    const [monitor, preferSupport, reduceRange, reduceLoad] =
      data.discomfortEffectContrasts;

    expect(monitor).toEqual(
      expect.objectContaining({
        variant: "monitor",
        candidateId: "goblet-squat",
        painSuitability: 7.3,
        jointCost: 8,
        stabilityFit: 8.5,
        relationship: "under_challenges_development",
        demandReductionRelevant: false,
      }),
    );
    for (const actionable of [preferSupport, reduceRange, reduceLoad]) {
      expect(actionable).toEqual(
        expect.objectContaining({
          painSuitability: monitor?.painSuitability,
          jointCost: monitor?.jointCost,
          stabilityFit: monitor?.stabilityFit,
          relationship: "reduces_excess_demand",
          demandReductionRelevant: true,
        }),
      );
    }
    expect(preferSupport?.total).toBeGreaterThan(monitor?.total ?? 0);
    expect(stableContrastSignature(preferSupport!)).toBe(
      stableContrastSignature(reduceRange!),
    );
    expect(stableContrastSignature(reduceRange!)).toBe(
      stableContrastSignature(reduceLoad!),
    );
  });

  it("distinguishes monitor from actionable historical modifications only in assessment context", () => {
    const [monitor, increaseSupport, reduceRange, reduceLoad] =
      data.historicalModificationContrasts;

    expect(monitor).toEqual(
      expect.objectContaining({
        variant: "monitor",
        candidateId: "goblet-squat",
        painSuitability: 7.8,
        jointCost: 8.45,
        relationship: "under_challenges_development",
        demandReductionRelevant: false,
      }),
    );
    for (const actionable of [increaseSupport, reduceRange, reduceLoad]) {
      expect(actionable).toEqual(
        expect.objectContaining({
          painSuitability: monitor?.painSuitability,
          jointCost: monitor?.jointCost,
          stabilityFit: monitor?.stabilityFit,
          relationship: "reduces_excess_demand",
          demandReductionRelevant: true,
        }),
      );
    }
    expect(increaseSupport?.total).toBeGreaterThan(monitor?.total ?? 0);
    expect(stableContrastSignature(increaseSupport!)).toBe(
      stableContrastSignature(reduceRange!),
    );
    expect(stableContrastSignature(reduceRange!)).toBe(
      stableContrastSignature(reduceLoad!),
    );
  });

  it("keeps stress-tag scoring region-neutral while exposing partial region and no side use", () => {
    const regionRows = data.regionSideContrasts.filter(
      (row) => row.contrast === "same stress tags, different region",
    );
    const sideRows = data.regionSideContrasts.filter(
      (row) => row.contrast === "same historical injury, different side",
    );

    expect(regionRows.map((row) => row.variant)).toEqual([
      "lumbar_spine",
      "shoulder",
    ]);
    expect(regionRows[0]?.capability).toBe(1.35);
    expect(regionRows[1]?.capability).toBe(1.7);
    expect(
      regionRows.map((row) => ({
        pain: row.painSuitability,
        joint: row.jointCost,
        stability: row.stabilityFit,
        relationship: row.relationship,
        total: row.total,
        rank: row.rank,
      })),
    ).toEqual([expect.any(Object), expect.any(Object)]);
    expect(
      JSON.stringify({
        ...regionRows[0],
        variant: undefined,
        capability: undefined,
      }),
    ).toBe(
      JSON.stringify({
        ...regionRows[1],
        variant: undefined,
        capability: undefined,
      }),
    );
    expect(
      JSON.stringify({ ...sideRows[0], variant: undefined }),
    ).toBe(JSON.stringify({ ...sideRows[1], variant: undefined }));
  });

  it("proves source-specific stress counting and contraindicated-only behavior", () => {
    const resolvedDuplicates = data.stressTagAudit.filter(
      (row) => row.duplicateClassification === "RESOLVED_SOURCE_DEDUPLICATION",
    );
    const nonDuplicates = data.stressTagAudit.filter(
      (row) => row.duplicateClassification === "NOT_APPLICABLE",
    );

    expect(resolvedDuplicates).toHaveLength(13);
    expect(resolvedDuplicates.every((row) => row.uniqueFactCount === 1)).toBe(true);
    expect(resolvedDuplicates.every((row) => row.painSuitabilityCount === 1)).toBe(true);
    expect(resolvedDuplicates.every((row) => row.jointCostCount === 1)).toBe(true);
    expect(nonDuplicates).toHaveLength(2);
    expect(nonDuplicates.every((row) => row.jointCostCount === 1)).toBe(true);
    expect(data.stressTagAudit.every((row) => row.warningResult === "warning")).toBe(true);
    expect(data.contraindicatedOnlyProbe).toEqual({
      painSuitability: 7.3,
      jointCost: 8.8,
      warning: true,
      hardContraindicationRejects: true,
      acuteSevereRejects: false,
    });
  });

  it("reproduces current pain and joint formulas plus normalized contributions", () => {
    const relevantRows = data.matrix.filter((row) =>
      [
        "shoulder-horizontal-push",
        "low-back-hinge",
        "low-back-horizontal-row",
        "knee-squat",
        "single-leg",
      ].includes(row.matrixId),
    );
    const clamp = (value: number) =>
      Math.max(0, Math.min(10, Number(value.toFixed(3))));

    for (const row of relevantRows.filter((candidate) => candidate.outcome === "legal")) {
      const baseline = matrixRow({
        matrixId: row.matrixId,
        state: "no pain",
        candidateId: row.candidateId,
      });
      const painCoefficient =
        row.painKind === "current_discomfort"
          ? 0.9
          : row.painKind === "moderate_pain"
            ? 1.8
            : 0;
      const jointCoefficient =
        row.painKind === "current_discomfort"
          ? 0.8
          : row.painKind === "moderate_pain"
            ? 1.4
            : 0;
      const expectedPain = clamp(8.2 - row.painCountedOverlap * painCoefficient);
      const expectedJoint = clamp(
        (baseline.jointCostRaw ?? 0) - row.jointCountedOverlap * jointCoefficient,
      );

      expect(row.painSuitabilityRaw).toBe(expectedPain);
      expect(row.jointCostRaw).toBe(expectedJoint);
      expect(row.painSuitabilityWeightedContribution).toBe(
        Number((expectedPain * (1.2 / 16.2)).toFixed(6)),
      );
      expect(row.jointCostWeightedContribution).toBe(
        Number((expectedJoint * (0.8 / 16.2)).toFixed(6)),
      );
    }
  });

  it("proves hard states gate matched stress while unrelated pain is stability-neutral", () => {
    const relevantMatrixIds = [
      "shoulder-horizontal-push",
      "low-back-hinge",
      "low-back-horizontal-row",
      "knee-squat",
      "single-leg",
    ];
    const hardRows = data.matrix.filter(
      (row) =>
        relevantMatrixIds.includes(row.matrixId) &&
        (row.state === "acute/severe" || row.state === "hard contraindication"),
    );
    expect(hardRows).toHaveLength(28);
    const rejectedHardRows = hardRows.filter((row) => row.outcome === "rejected");
    const legalHardRows = hardRows.filter((row) => row.outcome === "legal");
    expect(rejectedHardRows).toHaveLength(20);
    expect(
      rejectedHardRows.every((row) =>
        row.hardRejectionReason.includes("HARD_CONTRAINDICATION"),
      ),
    ).toBe(true);
    expect(
      rejectedHardRows.every((row) => row.total === null && row.rank === null),
    ).toBe(true);
    expect(legalHardRows).toHaveLength(8);
    expect([...new Set(legalHardRows.map((row) => row.candidateId))].sort()).toEqual([
      "chest-supported-dumbbell-row",
      "machine-row",
      "one-arm-dumbbell-row",
      "seated-cable-row",
    ]);

    const unrelatedRows = data.matrix.filter(
      (row) => row.state === "unrelated discomfort",
    );
    expect(unrelatedRows).toHaveLength(9);
    expect(unrelatedRows.every((row) => row.outcome === "legal")).toBe(true);
    expect(unrelatedRows.every((row) => row.warning === "-")).toBe(true);
    expect(unrelatedRows.every((row) => row.uniqueOverlapCount === 0)).toBe(true);
    expect(unrelatedRows.every((row) => row.painCountedOverlap === 0)).toBe(true);
    expect(unrelatedRows.every((row) => row.jointCountedOverlap === 0)).toBe(true);

    for (const row of unrelatedRows) {
      const baseline = matrixRow({
        matrixId: row.matrixId,
        state: "no pain baseline",
        candidateId: row.candidateId,
      });
      expect(row.painSuitabilityRaw).toBe(baseline.painSuitabilityRaw);
      expect(row.jointCostRaw).toBe(baseline.jointCostRaw);
    }

    for (const row of unrelatedRows) {
      const baseline = matrixRow({
        matrixId: row.matrixId,
        state: "no pain baseline",
        candidateId: row.candidateId,
      });
      expect(row.stabilityFit).toBe(baseline.stabilityFit);
      expect(row.total).toBe(baseline.total);
      expect(row.rank).toBe(baseline.rank);
    }
  });
});
