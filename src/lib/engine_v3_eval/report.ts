import type {
  CatalogGapAudit,
  ExperienceBiasCheck,
  ScenarioComparison,
  ShadowEvaluationReport,
} from "@/lib/engine_v3_eval/types";

const formatPercent = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value)
    ? `${(value * 100).toFixed(1)}%`
    : "n/a";

const formatNumber = (value: number | null | undefined, digits = 2) =>
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : "n/a";

const renderExperienceBiasLine = (
  engineLabel: string,
  check: ExperienceBiasCheck
) =>
  `- ${engineLabel} / ${check.equipment}: measurable=${check.measurable ? "yes" : "no"}, beginner stability=${formatNumber(
    check.beginnerStability,
    3
  )}, advanced stability=${formatNumber(check.advancedStability, 3)}, beginner complexity=${formatNumber(
    check.beginnerComplexity,
    3
  )}, advanced complexity=${formatNumber(check.advancedComplexity, 3)}, pass=${check.passed ? "yes" : "no"}.
  Note: ${check.note}`;

const renderCatalogGapSection = (catalogGaps: CatalogGapAudit) => {
  const lines = [
    `- Total exercises mapped: ${catalogGaps.mappedExercises}/${catalogGaps.totalExercises} (${formatPercent(
      catalogGaps.mappedRate
    )})`,
    `- Unmapped main exercises: ${
      catalogGaps.unmappedMainExerciseIds.length
        ? catalogGaps.unmappedMainExerciseIds.join(", ")
        : "none"
    }`,
    `- Sparse slot pairs (<3 advanced/gym candidates): ${
      catalogGaps.sparseSlotPairs.length
        ? catalogGaps.sparseSlotPairs
            .map((entry) => `${entry.role}/${entry.family}=${entry.candidateCount}`)
            .join(", ")
        : "none"
    }`,
  ];

  return lines.join("\n");
};

const renderScenarioRow = (scenario: ScenarioComparison) =>
  `| ${scenario.scenario.id} | ${formatPercent(
    scenario.production.blockMetrics.fillRate
  )} | ${formatPercent(scenario.v3.blockMetrics.fillRate)} | ${
    scenario.production.blockMetrics.familyCoverageCount
  } | ${scenario.v3.blockMetrics.familyCoverageCount} | ${formatNumber(
    scenario.production.blockMetrics.averageWorkingComplexity
  )} | ${formatNumber(scenario.v3.blockMetrics.averageWorkingComplexity)} | ${
    scenario.production.repairMetrics.changedSlots
  } | ${scenario.v3.repairMetrics.missingSlots} |`;

export const renderShadowEvaluationMarkdown = (
  report: ShadowEvaluationReport
) => `# Engine V3 Shadow Evaluation

Generated from deterministic snapshot inputs on ${report.generatedAt}.

## Verdict

**${report.summary.verdict}**

${report.summary.verdictReasons.map((reason) => `- ${reason}`).join("\n")}

## Key Signals

- Scenarios evaluated: ${report.summary.scenarioCount}
- Production determinism passes: ${report.summary.productionDeterminismPassCount}/${report.summary.scenarioCount}
- V3 determinism passes: ${report.summary.v3DeterminismPassCount}/${report.summary.scenarioCount}
- Production average fill rate: ${formatPercent(report.summary.productionAverageFillRate)}
- V3 average fill rate: ${formatPercent(report.summary.v3AverageFillRate)}
- Production average family coverage count: ${formatNumber(
    report.summary.productionAverageFamilyCoverageCount,
    1
  )}/${9}
- V3 average family coverage count: ${formatNumber(
    report.summary.v3AverageFamilyCoverageCount,
    1
  )}/${9}
- Production average working complexity: ${formatNumber(
    report.summary.productionAverageComplexity,
    3
  )}
- V3 average working complexity: ${formatNumber(report.summary.v3AverageComplexity, 3)}
- Production average uniqueness score: ${formatNumber(
    report.summary.productionAverageUniqueness,
    3
  )}
- V3 average uniqueness score: ${formatNumber(report.summary.v3AverageUniqueness, 3)}
- Production equipment-valid scenarios: ${report.summary.productionEquipmentValidityPassCount}/${report.summary.scenarioCount}
- V3 equipment-valid scenarios: ${report.summary.v3EquipmentValidityPassCount}/${report.summary.scenarioCount}
- Production optimizer-changed slots: ${report.summary.productionChangedSlotsTotal}
- V3 missing slots: ${report.summary.v3MissingSlotsTotal}

## Scenario Matrix

| Scenario | Prod fill | V3 fill | Prod families | V3 families | Prod complexity | V3 complexity | Prod changed slots | V3 missing slots |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${report.scenarios.map(renderScenarioRow).join("\n")}

## Experience Bias

${report.summary.experienceBias.production
  .map((check) => renderExperienceBiasLine("Current engine", check))
  .join("\n")}

${report.summary.experienceBias.v3
  .map((check) => renderExperienceBiasLine("V3", check))
  .join("\n")}

## Catalog Gaps

${renderCatalogGapSection(report.summary.catalogGaps)}

## Where V3 Looks Stronger

${report.summary.strongestV3Signals.map((reason) => `- ${reason}`).join("\n")}

## Where Current Engine Is Safer

${report.summary.strongestCurrentSignals.map((reason) => `- ${reason}`).join("\n")}

## Scenario Notes

${report.scenarios
  .map((scenario) => {
    const findings = scenario.notableFindings.length
      ? scenario.notableFindings.map((finding) => `  - ${finding}`).join("\n")
      : "  - No additional scenario-specific flags.";
    return `- ${scenario.scenario.id}: ${scenario.scenario.label}\n${findings}`;
  })
  .join("\n")}

## Required Before Adoption

${report.summary.requiredBeforeAdoption.map((reason) => `- ${reason}`).join("\n")}

## Recommendation

Next step: **${report.summary.recommendedNextStep}**
`;

export const renderShadowEvaluationJson = (report: ShadowEvaluationReport) =>
  `${JSON.stringify(report, null, 2)}\n`;
