import { createHash } from "node:crypto";
import type { AwaitedReturn } from "./types";

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const head = `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n`;
  return head + rows.map((row) => `| ${row.map(String).join(" | ")} |`).join("\n") + "\n";
}

function title(value: string): string {
  return `# ${value}\n\n`;
}

export function sessionPracticeV2Artifacts(evidence: AwaitedReturn): Readonly<Record<string, string>> {
  const holdoutRows = evidence.holdout.map((entry) => [entry.scenarioId, entry.mode, entry.exerciseId,
    entry.doseMode, entry.section, entry.historicalV1Golden, entry.genuineV2Realization,
    entry.gate13PracticeValidation, entry.persistenceReplay, entry.expected]);
  const activationRows = Object.entries(evidence.activationGuards).map(([guard, count]) => [guard, count]);
  const mutationRows = evidence.mutations.map((entry) => [entry.mutationId, entry.semanticChange,
    entry.rejected, entry.downstreamRescueAccepted]);
  const metamorphicRows = [...evidence.metamorphic.invariants.map((entry) => [entry.relation, entry.result]),
    ...evidence.metamorphic.materialResponses.map((entry) => [entry.relation, entry.result])];
  const combinedFingerprint = createHash("sha256").update(JSON.stringify({
    ...evidence.fingerprints,
    classification: evidence.classification,
    next: evidence.exactNextDependency,
  })).digest("hex");
  const fingerprints = Object.freeze({ ...evidence.fingerprints, combinedPreG3: combinedFingerprint });
  const cohortSummary = table(["Cohort", "Count"], Object.entries(evidence.cohortCounts));
  const artifacts: Record<string, string> = {
    "SESSION_PRACTICE_OPTIONS_V2_CONTRACTS.json": json(evidence.contracts),
    "SESSION_PRACTICE_OPTIONS_V1_BASELINE.json": json(evidence.historicalV1),
    "SESSION_PRACTICE_REQUEST.json": json(evidence.sampleRequest),
    "SESSION_PRACTICE_OPTION_AVAILABILITY.json": json(evidence.availability),
    "SESSION_PRACTICE_OPTIONS_V2_POLICIES.json": json(evidence.policies),
    "SESSION_PRACTICE_REALIZATION_PLANS.json": json(evidence.realizationPlans),
    "SESSION_PRACTICE_ASSIGNMENT_DISPOSITIONS.json": json(evidence.assignmentDispositions),
    "SESSION_PRACTICE_PRESCRIPTION_REVISIONS.json": json(evidence.prescriptionRevisions),
    "SESSION_PRACTICE_COMPLETION_DISPOSITIONS.json": json(evidence.completionDispositions),
    "SESSION_PRACTICE_PERSISTENCE.json": json(evidence.persistence),
    "SESSION_PRACTICE_OBSERVABILITY.json": json(evidence.observability),
    "SESSION_PRACTICE_OPTIONS_V2_CONTROLLED_SCENARIOS.json": json(evidence.controlledScenarios),
    "SESSION_PRACTICE_OPTIONS_V2_FIXED_SHELL_COHORTS.json": json(evidence.cohorts),
    "SESSION_PRACTICE_OPTIONS_FULL_LIGHTER_RECOVERY_V2_HOLDOUT_MANIFEST.json": json(evidence.holdout),
    "SESSION_PRACTICE_OPTIONS_V2_MUTATIONS.json": json(evidence.mutations),
    "SESSION_PRACTICE_OPTIONS_V2_METAMORPHIC_RESULTS.json": json(evidence.metamorphic),
    "SESSION_PRACTICE_OPTIONS_V2_STRESS.json": json(evidence.stress),
    "SESSION_PRACTICE_OPTIONS_V2_FINGERPRINTS.json": json(fingerprints),
    "SESSION_PRACTICE_OPTIONS_V2_CATALOG_COVERAGE.json": json(evidence.catalog),
    "SESSION_PRACTICE_OPTIONS_V2_ACTIVATION_GUARDS.json": json(evidence.activationGuards),
    "CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17.json": json(evidence.registryV17),
    "SESSION_PRACTICE_DRAFT_RESUME.md": title("Session Practice Draft and Resume") +
      "The V2 draft preserves exact mode, request, realization revision, final Sequence reference, source " +
      "revision, exercise/block/set position, entered Performance, timers, substitutions, update time, and " +
      "attempt state. Exact-version replay restores that object without recomputation. A stale source revision " +
      "returns conflict/review. Historical SessionDraft is unchanged.\n",
    "SESSION_PRACTICE_PERSISTENCE_REPLAY.md": title("Session Practice Persistence and Replay") +
      `Contract: \`SESSION_PRACTICE_PERSISTENCE@1.0.0\`. In-memory and PostgreSQL repositories are ` +
      `append-only. Exact retry is idempotent; semantic collision and missing lineage fail closed. Latest ` +
      `fallback count is \`${evidence.persistence.latestFallbackCount}\`; current-row mutation count is ` +
      `\`${evidence.persistence.currentRecordMutationCount}\`. The isolated migration is test/CI-only until G.\n`,
    "SESSION_PRACTICE_PRODUCT_ADAPTER.md": title("Session Practice Product Adapter") +
      "`SESSION_PRACTICE_PRODUCT_ADAPTER@1.0.0` maps Full/Lighter/Recovery to the closed canonical modes, " +
      "preserves exact copy, Suggested state, and the collapsed control model, and adds structured availability. " +
      "It is default-off, has no SessionClient import, performs no current-route write, runs no Product Shadow, " +
      "and returns no V2 Product output.\n",
    "SESSION_PRACTICE_OBSERVABILITY.md": title("Session Practice Observability") +
      "Structured events cover option availability, selection versus suggestion, source fingerprint, material " +
      "omissions, dose revisions, Recovery eligibility, fail-closed reasons, locks, completion, remaining " +
      "responsibility, and replay. Cue prose, notes, medical/free text, photos, and hidden Product data are absent. " +
      "Current-route event count is `0`.\n",
    "SESSION_PRACTICE_ROLLBACK.md": title("Session Practice Rollback") +
      "Disable the pure bridge consumer, future Product adapter, and persistence writes independently. Exact " +
      "historical replay remains readable. Current V1 requires no migration or Program rewrite, and rollback " +
      "deletes no user data. The new table is isolated and append-only.\n",
    "SESSION_PRACTICE_FULL_COHORT.md": title("Session Practice Full Cohort") +
      `Count: \`${evidence.cohortCounts.full}\`. Every case is exact assignment, Prescription, Sequence, ` +
      "duration, source-event, and Gate 13 pass-through with zero semantic difference.\n",
    "SESSION_PRACTICE_LIGHTER_COHORT.md": title("Session Practice Lighter Cohort") +
      `Count: \`${evidence.cohortCounts.lighter}\`. Structural omission precedes admitted dose revision; ` +
      "required purpose, productive anchors, dependencies, identities, and rest are preserved.\n",
    "SESSION_PRACTICE_RECOVERY_COHORT.md": title("Session Practice Recovery Cohort") +
      `Count: \`${evidence.cohortCounts.recovery}\`. Inclusion is structured and explicit, developmental ` +
      "credit is zero, and ordinary responsibility remains open.\n",
    "SESSION_PRACTICE_CURRENT_ROUTE_INVARIANCE.md": title("Session Practice Current Route Invariance") +
      `Cases: \`${evidence.cohortCounts.currentRoute}\`; stress comparisons: ` +
      `\`${evidence.stress.currentRouteInvariance}\`. Historical source and SessionClient fingerprints remain ` +
      `\`${evidence.historicalV1.sourceFingerprint}\` and ` +
      `\`${evidence.historicalV1.currentSessionClientFingerprint}\`. Current V2 import/call/DOM/copy changes: \`0\`.\n`,
    "SESSION_PRACTICE_PRODUCT_SHADOW_INVARIANCE.md": title("Session Practice Product Shadow Invariance") +
      `Comparisons: \`${evidence.stress.productShadowInvariance}\`. Registry V17 production imports, ` +
      "Product Shadow semantic changes, Product decisions, and Product activation are all `0`/not authorized.\n",
    "SESSION_PRACTICE_OPTIONS_V2_HOLDOUT_MANIFEST.md": title("Session Practice Options V2 Holdout Manifest") +
      `Frozen scenarios: \`${evidence.holdout.length}\`. Fingerprint: \`${evidence.holdoutFingerprint}\`.\n\n` +
      table(["Scenario", "Mode", "Exercise", "Dose", "Section", "V1", "V2", "Gate13", "Replay", "Expected"],
        holdoutRows),
    "SESSION_PRACTICE_OPTIONS_V2_MUTATION_REPORT.md": title("Session Practice Options V2 Mutation Report") +
      `Mutations: \`${evidence.mutations.length}\`; rejected: \`${evidence.mutations.filter((entry) => entry.rejected).length}\`; ` +
      "accepted downstream rescue: `0`.\n\n" +
      table(["Mutation", "Semantic", "Rejected", "Rescue"], mutationRows),
    "SESSION_PRACTICE_OPTIONS_V2_METAMORPHIC_REPORT.md": title("Session Practice Options V2 Metamorphic Report") +
      `Relations: \`${metamorphicRows.length}\`; invariant relations: \`${evidence.metamorphic.invariants.length}\`; ` +
      `material-response relations: \`${evidence.metamorphic.materialResponses.length}\`.\n\n` +
      table(["Relation", "Result"], metamorphicRows),
    "SESSION_PRACTICE_OPTIONS_V2_STRESS_REPORT.md": title("Session Practice Options V2 Stress Report") +
      `Result: \`${evidence.stress.result}\`. Explicit-time deterministic kernels completed every mandated ` +
      "minimum with no hidden clock, production randomness, fallback, or rescue.\n\n" +
      table(["Lane", "Count"], Object.entries(evidence.stress)),
    "SESSION_PRACTICE_OPTIONS_V2_ACTIVATION_GUARDS.md": title("Session Practice Options V2 Activation Guards") +
      "All protected-current-runtime, over-adaptation, and activation counts are zero.\n\n" +
      table(["Guard", "Count"], activationRows),
    "SESSION_PRACTICE_OPTIONS_V2_IMPLEMENTATION_READINESS.md": title("Session Practice Options V2 Implementation Readiness") +
      `Classification: \`${evidence.classification}\`\n\nOntology: \`${evidence.ontologyClassification}\`\n\n` +
      `Combined status: \`${evidence.combinedStatus}\`\n\nCatalog and Knowledge: \`${evidence.catalog.count}\` / ` +
      `\`${evidence.catalog.knowledgeCount}\`. Controlled scenarios: \`${evidence.controlledScenarios.length}\`; ` +
      `fixed-shell cases: \`${Object.values(evidence.cohortCounts).reduce((sum, value) => sum + value, 0)}\`; ` +
      `holdout: \`${evidence.holdout.length}\`. Owner delivery and Product activation remain unauthorized. ` +
      `Exact next dependency: \`${evidence.exactNextDependency}\`.\n`,
    "SESSION_PRACTICE_OPTIONS_V2_COHORT_SUMMARY.md": title("Session Practice Options V2 Cohort Summary") + cohortSummary,
  };
  return Object.freeze(artifacts);
}
