import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  OUTCOME_SOURCE_REPORT_FILENAMES,
  OUTCOME_SOURCE_UPDATED_DOCS,
  buildOutcomeSourceAdmissionReport,
  buildOutcomeSourceReports,
  outcomeSourceDocumentationMarker,
} from "../cagt/outcomeSourceReport";

describe("outcome source foundation reports", () => {
  const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
    resolve(process.cwd(), "packages/training-engine-v2");
  const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
  const productionMarker = /\n*<!-- PRODUCTION_OUTCOME_SOURCE_(?:PERSISTENCE|REPORT)_V1:START -->[\s\S]*?<!-- PRODUCTION_OUTCOME_SOURCE_(?:PERSISTENCE|REPORT)_V1:END -->\n*/g;
  const productionWeekMarker = /\n*<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:START -->[\s\S]*?<!-- PRODUCTION_WEEK_PLANNER_AND_ALLOCATION_V1:END -->\n*/g;
  const orchestrationMarker = /\n*<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:START -->[\s\S]*?<!-- ADAPTATION_APPLICATION_ORCHESTRATION_V1:END -->\n*/g;

  it("freezes all 41 required Markdown and JSON artifacts", () => {
    const reports = buildOutcomeSourceReports();
    expect(OUTCOME_SOURCE_REPORT_FILENAMES).toHaveLength(41);
    expect(Object.keys(reports).sort()).toEqual([...OUTCOME_SOURCE_REPORT_FILENAMES].sort());
    for (const filename of OUTCOME_SOURCE_REPORT_FILENAMES) {
      expect(readFileSync(resolve(docsRoot, filename), "utf8").replace(productionMarker, "\n")
        .replace(productionWeekMarker, "\n").replace(orchestrationMarker, "\n"), filename)
        .toBe(reports[filename]);
    }
  });

  it("updates all 12 handoff/architecture documents with one deterministic marker", () => {
    const marker = outcomeSourceDocumentationMarker();
    expect(OUTCOME_SOURCE_UPDATED_DOCS).toHaveLength(12);
    for (const filename of OUTCOME_SOURCE_UPDATED_DOCS) {
      const content = readFileSync(resolve(docsRoot, filename), "utf8");
      expect(content, filename).toContain(marker);
      expect(content.match(/OUTCOME_SOURCE_PERSISTENCE_FOUNDATION_V1:START/g), filename).toHaveLength(1);
    }
  });

  it("publishes ready design evidence while all live and mutation counts stay zero", () => {
    const report = buildOutcomeSourceAdmissionReport();
    expect(report).toMatchObject({
      classification:
        "OUTCOME_SOURCE_AND_ADAPTATION_PERSISTENCE_FOUNDATION_V1_READY_FOR_PRODUCTION_IMPLEMENTATION_AUTHORIZATION",
      ontologyAuditClassification: "TARGETED_OUTCOME_SOURCE_AND_PERSISTENCE_DOMAIN_FIXES_REQUIRED",
      activationStatus: "NOT_ACTIVATED", controlled: { scenarioCount: 158, failureCount: 0 },
      fixedShell: { cohortCount: 40, failureCount: 0 }, holdout: { total: 360, failureCount: 0 },
      replay: { replayHistoryCount: 240, duplicateDecisionCount: 0, applicationCount: 0, failureCount: 0 },
      golden: { comparisonCount: 530, semanticMismatchCount: 0 }, mutations: { acceptedMutationCount: 0 },
      metamorphic: { failureCount: 0 }, applicationHandoff: { appliedStateCount: 0, failureCount: 0 },
      stress: { failureCount: 0 }, activation: { failureCount: 0, databaseMigrationCount: 0,
        persistenceWriteCount: 0, directiveApplicationCount: 0, candidateComposerRerunCount: 0,
        prescriptionMutationCount: 0, weekMutationCount: 0, phaseMutationCount: 0 },
      nextDependency: "OWNER_AUTHORIZATION_FOR_PRODUCTION_OUTCOME_SOURCE_ADAPTERS_AND_APPEND_ONLY_PERSISTENCE_IMPLEMENTATION",
    });
    expect(Object.keys(report.foundationFingerprints)).toHaveLength(48);
  });
});
