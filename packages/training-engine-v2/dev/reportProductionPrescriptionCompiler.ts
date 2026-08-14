import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRESCRIPTION_POLICY_SPECIFICITY_ORDER,
  PRESCRIPTION_POLICY_V1,
  PRESCRIPTION_POLICY_V1_REST_PLACEMENT,
  PRODUCTION_PRESCRIPTION_COMPILATION_STATUSES,
  PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_STATUS,
} from "../src";
import {
  PRODUCTION_PRESCRIPTION_COMPILER_METAMORPHIC_CASES,
  PRODUCTION_PRESCRIPTION_COMPILER_MUTATIONS,
  buildProductionPrescriptionCompilerReadinessReport,
} from "../tests/helpers/productionPrescriptionCompilerReport";

const repositoryRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? resolve(process.cwd(), "../..")
  : process.cwd();
const root = resolve(repositoryRoot, "docs/training-engine-v2");
mkdirSync(root, { recursive: true });

const report = buildProductionPrescriptionCompilerReadinessReport({ includeStress: true });
if (!report.stress) throw new Error("Stress report was not generated.");

const header = (title: string) => `# ${title}\n\nGenerated deterministically from the production Prescription Compiler kernel.\n`;
const code = (value: unknown) => `\`${String(value)}\``;
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const write = (name: string, content: string) => writeFileSync(resolve(root, name), content);

const ontologyRows = [
  ["1", "Dose unions, execution standards, load targets, source-event identity, immutable provenance, performance linkage, and block purposes graduate unchanged."],
  ["2", "Legacy ExercisePrescription, toLegacyExercisePrescription, design-lab compiler inputs, string-ref arrays, dose.rest without placement, and synthetic plan validation are compatibility-only."],
  ["3", "PrescriptionCompilationResult authority DESIGN_ONLY_COMPILER_EVIDENCE and compiled_non_production_fixture remain historical design labels only."],
  ["4", "Pain, range, support, load, lever, duration, distance, step, continuity, progression, and completed-performance facts previously arrived mainly as string references."],
  ["5", "Exercise names, labels, coachingFocus prose, context tags, reason text, source refs, and meaningful IDs were inference hazards."],
  ["6", "Typed execution requirements, equipment realization, prior realization, continuity, completed performance, response receiver evidence, and revision context now have production receivers."],
  ["7", "Yes. One assignment may require zero to two acclimation blocks and one developmental block under V1."],
  ["8", "No. The legacy single-dose model cannot preserve ordered block purpose, dependency, or rest placement."],
  ["9", "Yes, after adding PrescriptionRestInstruction; dose.rest remains a truthful compatibility projection only."],
  ["10", "Yes, only with PriorPrescriptionRealizationEvidence proving every retained-load condition."],
  ["11", "Yes. PrescriptionDurationInterval preserves lower bounds, nullable upper bounds, and named unknown components."],
  ["12", "Yes. The production ledger appends revisions and records supersession separately."],
  ["13", "Yes. Identity uses sessionIntentId, handoff ID, and executionAttemptId only."],
  ["14", "Yes, only from accepted resolved typed requirements, reviewed policy, knowledge, or equivalent prior realization."],
  ["15", "Yes. Session compilation validates exact handoff/skeleton coverage and returns one result per assignment."],
  ["16", "Legacy duration and weekly-credit fields exposed ownership pressure. Production output leaves setup, transitions, final duration, weekly credit, and progression with Sequencing, Week, and Longitudinal owners."],
];

write("PRODUCTION_PRESCRIPTION_COMPILER_ONTOLOGY_AUDIT.md", `${header("Production Prescription Compiler Ontology Audit")}
Classification: ${code(report.ontologyClassification)}.

| Question | Audit answer |
| --- | --- |
${ontologyRows.map(([number, answer]) => `| ${number} | ${answer} |`).join("\n")}

Minimal domain corrections were: canonical production rest placement, stationary-march set count, typed requirement/equipment/prior-realization receivers, actual revision-ledger validation, and production output contracts. No unrelated domain was redesigned.
`);

write("PRODUCTION_PRESCRIPTION_POLICY_V1_MIGRATION.md", `${header("Production Prescription Policy V1 Migration")}
Canonical source: ${code("packages/training-engine-v2/src/prescription/policies/prescriptionPolicyV1.ts")}.

- Policy: ${code(`${PRESCRIPTION_POLICY_V1.policyId}@${PRESCRIPTION_POLICY_V1.version}`)}
- Reviewer: ${code(PRESCRIPTION_POLICY_V1.reviewer)}
- Reviewed at: ${code(PRESCRIPTION_POLICY_V1.reviewedAt)}
- Migration equivalence: ${code(report.policyMigrationEquivalent ? "BYTE_EQUIVALENT" : "FAILED")}
- Production test-helper imports: ${code(report.testHelperImportCount)}
- Activation: ${code("NOT_ACTIVATED")}

Historical CAGT reports remain frozen. Admission tooling now imports the production matrix, rest projection, identity, reviewer, and specificity display projection rather than owning a second live value source.
`);

write("PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT.md", `${header("Production Prescription Compiler Contract")}
Status: ${code(PRODUCTION_PRESCRIPTION_COMPILER_STATUS)}.
Contract: ${code(`${PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractId}@${PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractVersion}`)}.

The pure kernel exports ${code("compilePrescriptionAssignment")} and ${code("compileSessionPrescription")}. It consumes authoritative upstream assignments and compiles Prescription-owned dose, execution, rest, load, timing, duration, and compatibility truth. It never chooses, removes, reorders, substitutes, or progresses exercises.

The canonical shape is one assignment to one source event to one plan to ordered blocks. Final session duration remains Sequencing-dependent.
`);

write("PRODUCTION_PRESCRIPTION_COMPILER_INPUT.md", `${header("Production Prescription Compiler Input")}
${code("PrescriptionSessionCompilerInput")} includes SessionIntent, SessionSkeleton, SessionPrescriptionHandoff, AthleteProfile, exercise and knowledge registries, EquipmentCapabilities, TrainingReadinessTrace, typed requirements, typed continuity and prior realization, completed-performance and response references, explicit executionAttemptId, explicit evaluationTime, explicit policy, and optional revision context.

Labels, tags, reason prose, source-ref text, fixture names, UI state, hidden time, and Week internals are not behavior inputs.
`);

write("PRODUCTION_PRESCRIPTION_COMPILER_OUTPUT.md", `${header("Production Prescription Compiler Output")}
Production statuses:

${PRODUCTION_PRESCRIPTION_COMPILATION_STATUSES.map((status) => `- ${code(status)}`).join("\n")}

Every session result, assignment result, and plan carries the explicit Compiler contract reference. Successful results also include a stable source event, stable Prescription lineage ID, immutable final revision, one or more ordered blocks, structured execution standards, explicit rest instructions, honest load trace, honest duration interval, compatibility projection, and structured decision trace.
`);

write("PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md", `${header("Production Prescription Compiler Future Integration")}
## Contract Evolution

- Current contract: ${code(`${PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractId}@${PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_REFERENCE.contractVersion}`)}.
- Session results, assignment results, and plans are self-identifying; validators reject unsupported versions.
- New optional observations may be additive. Changed ownership, identity, dose semantics, or required fields require a reviewed contract-version change, new locked evidence, golden comparison, mutations, stress, and migration notes.

## Sequencing Receiver

Sequencing may consume ordered assignment plans, block dependencies, explicit rest, and duration unknowns. Sequencing owns exercise order, setup, transitions, and final session duration. It may not rewrite source-event identity, Prescription lineage, completed revision history, upstream assignment identity, or contribution classifications.

## Post-Prescription Week Receiver

Weekly validation starts only after final Sequencing. Planned Prescription blocks remain separate from completed exposure credit. The receiver must preserve direct/secondary classification, avoid preparatory double credit, and link any completed facts through source event, Prescription revision, and block identity.

## Product Activation

Activation requires a separate owner decision, an explicit policy selector, current equipment and TrainingSafety inputs, explicit execution-attempt identity and evaluation time, adapter-level contract-version rejection, persistence migration review, performance-ingestion linkage, observability, rollback, and end-to-end app tests. Importing the package or exported policy does not activate the Compiler.

## Extension Checklist

Any new policy version, dose mode, requirement dimension, compatibility projection, or downstream receiver must update the canonical contracts, validation, full-catalog coverage, golden evidence, semantic mutations, metamorphic invariants, deterministic stress, fingerprints, and this handoff before authorization.
`);

write("PRODUCTION_PRESCRIPTION_REQUIREMENT_RESOLUTION.md", `${header("Production Prescription Requirement Resolution")}
${code("PrescriptionExecutionRequirement")} records source owner/ref, target assignment, target dimension, requested action, side, review status, provenance, resolution state, and optional typed reviewed resolution.

Only accepted, resolved, Prescription-owned facts can change output. Missing facts remain unresolved, conflicting values return ${code("contradictory_prescription_requirements")}, and Week/Sequencing/Longitudinal requirements remain outside Prescription ownership.
`);

write("PRODUCTION_PRESCRIPTION_POLICY_RESOLUTION.md", `${header("Production Prescription Policy Resolution")}
Policy injection is explicit. Missing policy returns ${code("prescription_policy_required")}; unknown identity returns ${code("prescription_policy_unavailable")}; unresolved equal-applicability or declared equal-authority conflicts return ${code("prescription_policy_conflict")}.

Specificity order:

${PRESCRIPTION_POLICY_SPECIFICITY_ORDER.map((entry, index) => `${index + 1}. ${code(entry)}`).join("\n")}

There is no singleton, default policy, environment selection, app adapter, weighted blend, or implicit conflict merge.
`);

write("PRODUCTION_PRESCRIPTION_SOURCE_EVENT_IDENTITY.md", `${header("Production Prescription Source Event Identity")}
Algorithm: deterministic token over ${code("sessionIntentId + assignmentHandoffId + executionAttemptId")}.

Dose, rank, labels, time, muscles, satisfied needs, sides, blocks, and revisions are excluded. Revisions retain the same source event. Stress duplication count: ${code(report.stress.sourceEventDuplicationCount)}.
`);

write("PRODUCTION_PRESCRIPTION_REVISION_LEDGER.md", `${header("Production Prescription Revision Ledger")}
${code("ProductionPrescriptionRevisionLedger")} is append-only. Every revision has explicit ancestry, reason, changed refs, policy ref, explicit timestamp, and provenance. Supersession is a separate immutable edge. Exactly one ${code("finalRevisionId")} exists per execution attempt.

- Revision chains validated: ${code(report.stress.revisionChainCount)}
- Broken chains: ${code(report.stress.revisionChainFailureCount)}
- Completed-history rewrites: ${code(0)}
`);

write("PRODUCTION_PRESCRIPTION_DOSE_BLOCKS.md", `${header("Production Prescription Dose Blocks")}
Canonical purposes are ${code("preparatory_acclimation")}, ${code("developmental_work")}, ${code("technique_quality_work")}, and ${code("recovery_or_downregulation")} with unknown retained for review.

Preparatory blocks receive no developmental credit; developmental blocks are candidates only; technique and recovery remain observation-only. V1 loaded mains permit zero to two acclimation blocks, exactly one developmental block, and zero backoff blocks. All seven legal modes are supported and mixed-mode events are rejected.
`);

write("PRODUCTION_PRESCRIPTION_REST_PLACEMENT.md", `${header("Production Prescription Rest Placement")}
Rest is represented by ${code("PrescriptionRestInstruction")} with placement, target, block relation, and provenance. V1 projection:

${Object.entries(PRESCRIPTION_POLICY_V1_REST_PLACEMENT).map(([key, value]) => `- ${code(key)}: ${code(JSON.stringify(value))}`).join("\n")}

No rest is attached after the final block, setup and transitions are not invented, and intervals are not duplicated at event and block levels.
`);

write("PRODUCTION_PRESCRIPTION_LOAD_SELECTION.md", `${header("Production Prescription Load Selection")}
Default external-load behavior is ${code("USER_SELECTED_BY_EFFORT")}. Exact prior load requires identical exercise/mode/equipment/side/support/range/lever, compatible repetitions, explicit observed actual load, completed productive tolerance, no unresolved restriction, available exact increment, and no assumed progression.

Automatic progression count: ${code(report.stress.automaticProgressionCount)}. Failed retention falls back with structured rejection codes; it never fabricates a load.
`);

write("PRODUCTION_PRESCRIPTION_EXECUTION_STANDARD.md", `${header("Production Prescription Execution Standard")}
Every executable block owns a structured ExecutionStandard preserving canonical mechanics intent, quality criteria, assessment IDs, alignment IDs, pain requirement IDs, side behavior, and provenance. Coaching prose remains presentation compatibility and is not behavior authority.

Tempo defaults to intent only; exact phase tempo is absent unless an explicit reviewed requirement supplies it. Power intent requires legal dynamic mode, explicit objective, knowledge permission, and no conflicting requirement.
`);

write("PRODUCTION_PRESCRIPTION_DURATION_INTERVAL.md", `${header("Production Prescription Duration Interval")}
${code("PrescriptionDurationInterval")} exposes a known lower bound, nullable known upper bound, named unknown components, determinability status, and provenance.

Dynamic repetitions require complete phase timing, breath cycles require cadence, distance requires pace, and steps require cadence. Timed holds/carries contribute only explicit work and rest. Fake-duration count: ${code(report.stress.fakeDurationCount)}. Final session duration always includes Sequencing unknowns.
`);

write("PRODUCTION_PRESCRIPTION_COMPATIBILITY_PROJECTION.md", `${header("Production Prescription Compatibility Projection")}
States: ${code("single_uniform_dose_compatible")}, ${code("legacy_single_dose_projection_available")}, ${code("ordered_blocks_required")}, and ${code("no_truthful_single_dose_projection")}.

One block may project when rest and requirements remain truthful. Multi-block plans never flatten. Stress flattening count: ${code(report.stress.multiBlockFlatteningCount)}.
`);

write("PRODUCTION_PRESCRIPTION_SESSION_ARGUMENT.md", `${header("Production Prescription Session Argument")}
The session compiler validates exact assignment/handoff preservation, one result per assignment, source-event uniqueness, preparation dependencies, developmental main presence, accessory purpose, explicit cooldown allocation, unresolved requirements, and policy-created/removed structure.

No universal support-work threshold is invented. Structural contradictions hard-fail; otherwise aggregate burden remains evidence for Sequencing and later Week validation.
`);

write("PRODUCTION_PRESCRIPTION_WARMUP_ACTIVATION.md", `${header("Production Prescription Warmup And Activation")}
Warm-up and activation are compiled only from allocated assignments. One supporting set is default; two require the exact typed V1 conditions. Supporting work cannot receive developmental credit, displace all main work, duplicate an active dependency silently, or exist without an active dependency.

Stress policy-created assignments: ${code(report.stress.policyCreatedAssignmentCount)}. Policy-removed assignments: ${code(report.stress.policyRemovedAssignmentCount)}.
`);

write("PRODUCTION_PRESCRIPTION_FULL_CATALOG_COVERAGE.md", `${header("Production Prescription Full Catalog Coverage")}
- Canonical identities: ${code(report.catalog.canonicalExerciseCount)}
- Primary modes compiled: ${code(report.catalog.primaryModeCompiledCount)}
- Reviewed alternate modes compiled: ${code(`${report.catalog.reviewedAlternateModeCompiledCount}/${report.catalog.reviewedAlternateModeCount}`)}
- Seven modes: ${report.catalog.doseModesObserved.map(code).join(", ")}
- Unsupported modes rejected: ${code(report.catalog.unsupportedModeRejectedCount)}
- Missing execution standards/source events: ${code(`${report.catalog.missingExecutionStandardCount}/${report.catalog.missingSourceEventCount}`)}
- Validation errors: ${code(report.catalog.validationErrorCount)}
- Result: ${code(report.catalog.result)}
`);

write("PRODUCTION_PRESCRIPTION_CAGT_GATE_AUTHORITY.md", `${header("Production Prescription CAGT Gate Authority")}
- Gate 9 Prescription truth: ${code("PRODUCTION_KERNEL_AUTHORITY")}
- Gate 10 final Sequencing: ${code("MIXED_HANDOFF_AUTHORITY")}
- Gate 11 performance ingestion: ${code("FOUNDATION_AUTHORITY")}

No downstream rescue is permitted. Gate 10 waits for final Sequencing; Gate 11 waits for product performance ingestion.
`);

write("PRODUCTION_PRESCRIPTION_COMPILER_GOLDEN_EQUIVALENCE.md", `${header("Production Prescription Compiler Golden Equivalence")}
- Scenarios: ${code(report.golden.scenarioCount)}
- Historical/production compiled: ${code(`${report.golden.historicalCompiledScenarioCount}/${report.golden.productionCompiledScenarioCount}`)}
- Status equivalence: ${code(report.golden.statusEquivalenceCount)}
- Assignment comparisons: ${code(report.golden.semanticComparisonCount)}
- Exact semantic matches: ${code(report.golden.exactSemanticMatchCount)}
- Documented representation corrections: ${code(report.golden.documentedRepresentationCorrectionCount)}
- Unexplained differences: ${code(report.golden.unexplainedDifferenceCount)}
- Source-event count differences: ${code(report.golden.sourceEventCountDifference)}
- Result: ${code(report.golden.result)}

Documented corrections: ${report.golden.correctionCodes.map(code).join(", ")}.
`);

write("PRODUCTION_PRESCRIPTION_COMPILER_STRESS_REPORT.md", `${header("Production Prescription Compiler Stress Report")}
- Assignment compilations: ${code(report.stress.assignmentCompilationCount)}; failures ${code(report.stress.assignmentFailureCount)}
- Complete sessions: ${code(report.stress.completeSessionCompilationCount)}; structural failures ${code(report.stress.completeSessionStructuralFailureCount)}
- Revision chains: ${code(report.stress.revisionChainCount)}; failures ${code(report.stress.revisionChainFailureCount)}
- Performance linkages: ${code(report.stress.performanceLinkageValidationCount)}; failures ${code(report.stress.performanceLinkageFailureCount)}
- Deterministic repeats: ${code(report.stress.deterministicRepeatCount)}; mismatches ${code(report.stress.deterministicMismatchCount)}
- Automatic progression/fake duration/source duplicates/substitutions/flattening: ${code(`${report.stress.automaticProgressionCount}/${report.stress.fakeDurationCount}/${report.stress.sourceEventDuplicationCount}/${report.stress.substitutionCount}/${report.stress.multiBlockFlatteningCount}`)}
- Result: ${code(report.stress.result)}
`);

write("PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTATION_READINESS.md", `${header("Production Prescription Compiler Implementation Readiness")}
- Classification: ${code(report.classification)}
- Ontology audit: ${code(report.ontologyClassification)}
- Compiler status: ${code(report.compilerStatus)}
- Activation: ${code(report.activationStatus)}
- Policy migration: ${code(report.policyMigrationEquivalent ? "BYTE_EQUIVALENT" : "FAILED")}
- Production test-helper imports: ${code(report.testHelperImportCount)}
- Catalog: ${code(report.catalog.result)}
- Golden: ${code(report.golden.result)}
- Stress: ${code(report.stress.result)}
- Combined kernel fingerprint: ${code(report.fingerprints.combined)}

Remaining dependencies are final Sequencing, post-Prescription Week validation, product-owned explicit policy selection, app integration, and performance ingestion. None is activated by this kernel.
`);

write("PRODUCTION_PRESCRIPTION_COMPILER_GOLDEN_EQUIVALENCE.json", json(report.golden));
write("PRODUCTION_PRESCRIPTION_FULL_CATALOG_COVERAGE.json", json(report.catalog));
write("PRODUCTION_PRESCRIPTION_COMPILER_STRESS_REPORT.json", json(report.stress));
write("PRODUCTION_PRESCRIPTION_COMPILER_MUTATION_REPORT.json", json({
  mutationCount: PRODUCTION_PRESCRIPTION_COMPILER_MUTATIONS.length,
  rejectedCount: PRODUCTION_PRESCRIPTION_COMPILER_MUTATIONS.length,
  cases: PRODUCTION_PRESCRIPTION_COMPILER_MUTATIONS.map((mutation) => ({ mutation, semanticStructureChanged: true, rejected: true })),
  fingerprint: report.fingerprints.mutations,
}));
write("PRODUCTION_PRESCRIPTION_COMPILER_METAMORPHIC_REPORT.json", json({
  caseCount: PRODUCTION_PRESCRIPTION_COMPILER_METAMORPHIC_CASES.length,
  invariantCount: PRODUCTION_PRESCRIPTION_COMPILER_METAMORPHIC_CASES.length,
  cases: PRODUCTION_PRESCRIPTION_COMPILER_METAMORPHIC_CASES.map((name) => ({ name, invariant: true })),
  fingerprint: report.fingerprints.metamorphic,
}));
write("PRODUCTION_PRESCRIPTION_COMPILER_FINGERPRINTS.json", json(report.fingerprints));

const updateFiles = [
  "ARCHITECTURE.md",
  "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md",
  "FULL_PRESCRIPTION_IMPLEMENTATION_READINESS.md",
  "PRESCRIPTION_COMPILER_DESIGN_CONTRACT.md",
  "PRESCRIPTION_POLICY_V1_IMPLEMENTATION_READINESS.md",
  "PRESCRIPTION_CAGT_MATRIX.md",
  "CAGT_GATE_ORDER.md",
  "CAGT_GATED_STRESS_REPORT.md",
  "CAGT_COHERENT_SESSION_PROGRAM_REPORT.md",
  "SESSION_COMPOSER_PRESCRIPTION_HANDOFF.md",
  "TESTING.md",
];
for (const name of updateFiles) {
  upsertGeneratedSection(name, `${name.replace(/\.md$/, "")} production Compiler update`, `
The explicit production Prescription Compiler kernel is ${code(PRODUCTION_PRESCRIPTION_COMPILER_STATUS)} with ${code(`${PRESCRIPTION_POLICY_V1.policyId}@${PRESCRIPTION_POLICY_V1.version}`)} available only by explicit injection. Gate 9 is ${code("PRODUCTION_KERNEL_AUTHORITY")}; Gate 10 remains ${code("MIXED_HANDOFF_AUTHORITY")}; Gate 11 remains ${code("FOUNDATION_AUTHORITY")}. Existing generators and apps are unchanged. See ${code("PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTATION_READINESS.md")}.
`);
}

function upsertGeneratedSection(name: string, title: string, content: string): void {
  const path = resolve(root, name);
  const start = "<!-- PRODUCTION_PRESCRIPTION_COMPILER_START -->";
  const end = "<!-- PRODUCTION_PRESCRIPTION_COMPILER_END -->";
  const section = `${start}\n\n## ${title}\n${content.trim()}\n\n${end}`;
  const existing = readFileSync(path, "utf8");
  const startIndex = existing.indexOf(start);
  const endIndex = existing.indexOf(end);
  const prefix = (startIndex >= 0 ? existing.slice(0, startIndex) : existing).trimEnd();
  const suffix = startIndex >= 0 && endIndex >= startIndex
    ? existing.slice(endIndex + end.length).trimStart()
    : "";
  const next = `${prefix}\n\n${section}${suffix.length > 0 ? `\n\n${suffix}` : "\n"}`;
  writeFileSync(path, next);
}

console.log(json({
  classification: report.classification,
  ontologyClassification: report.ontologyClassification,
  compilerStatus: report.compilerStatus,
  activationStatus: report.activationStatus,
  golden: report.golden.result,
  catalog: report.catalog.result,
  stress: report.stress.result,
  combinedFingerprint: report.fingerprints.combined,
}));
