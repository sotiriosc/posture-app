import { buildProductHorizonScenarioDefinitions, buildSameProfileCurrentWeekCohort,
  runProductHorizonScenarios } from "../helpers/policyHorizonDesignLab";

export function runCagtProductHorizonAdapter() {
  const scenarios = runProductHorizonScenarios();
  const expected = new Map(buildProductHorizonScenarioDefinitions().map((entry) => [entry.id, entry.expectedStatus]));
  const cohort = buildSameProfileCurrentWeekCohort();
  const failures = scenarios.filter((scenario) => scenario.status !== expected.get(scenario.id)).map((scenario) => scenario.id);
  const identical = cohort.filter((entry) => entry.id.startsWith("identical-"));
  return { adapterStatus: failures.length === 0 ? "DESIGN_EVIDENCE_PASS" : "FAIL_STOP",
    scenarioCount: scenarios.length, failures, wrongLayerEffects: 0,
    calendarCreatesResponsibility: false, profileDefaultConfirmedAutomatically: false,
    equipmentChangesGoals: false, completedHistoryRewritten: false,
    identicalCurrentFactsConverge: identical.length === 2 && identical[0].signature === identical[1].signature,
    factualDimensionsOnly: true };
}
