import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PACKAGE_R_SELECTED_EXERCISE_IDS,
  stableKnowledgeJson,
  type ExerciseKnowledgeEntry,
} from "../../praxis-knowledge-core/src";
import {
  knowledgeBoundaryGuards,
  knowledgeContractRegistry,
  knowledgeFoundationFingerprints,
  knowledgeFoundationValidation,
  knowledgeOntologyAnswers,
  knowledgeOntologyClassification,
  packageRCompactFallbackProjection,
} from "../tests/packageRKnowledge/foundationEvidence";
import {
  current45KnowledgeAudit,
  current45KnowledgeCompletenessMatrix,
} from "../tests/packageRKnowledge/current45Audit";

const packageRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? process.cwd()
  : resolve(process.cwd(), "packages/training-engine-v2");
const docsRoot = resolve(packageRoot, "../../docs/training-engine-v2");
mkdirSync(docsRoot, { recursive: true });

const generated = "Generated deterministically from `@praxis/knowledge-core`; edit canonical TypeScript data, not this report.";
const md = (title: string, body: readonly string[]) =>
  `# ${title}\n\n${generated}\n\n${body.join("\n\n")}\n`;
const bullets = (values: readonly string[]) => values.map((value) => `- ${value}`).join("\n");
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

const categoryRows = (entry: ExerciseKnowledgeEntry) => [
  ["focus", [entry.presentation.focus]],
  ["cues", entry.presentation.cues],
  ["setup", entry.presentation.setup],
  ["during", entry.presentation.during],
  ["pattern", entry.presentation.pattern],
  ["watchFor", entry.presentation.watchFor],
] as const;

function renderEntry(entry: ExerciseKnowledgeEntry): string {
  const fact = (id: string) => entry.facts.find((candidate) => candidate.id === id)?.canonicalStatement ?? "MISSING";
  return md(`${entry.canonicalName} Production Curation`, [
    `- Canonical exercise ID: \`${entry.exerciseId}\`\n- Review status: \`${entry.reviewStatus}\`\n- Identity: one production identity; fact IDs are subordinate references, not exercise IDs.`,
    "## Teaching Core\n\n" + categoryRows(entry).map(([category, refs]) =>
      `### ${category}\n\n${refs.map((ref) => `- \`${ref}\`: ${fact(ref)}`).join("\n")}`).join("\n\n"),
    `## Identity And Equipment Boundary\n\n${bullets(entry.facts.filter((item) => item.kind === "equipment_boundary").map((item) => item.canonicalStatement))}`,
    `## Realization Differences\n\n${entry.realizationOverrides.length === 0
      ? "No additional realization is admitted. Named future variants remain absent until reviewed."
      : entry.realizationOverrides.map((override) => `- \`${override.realizationId}\`: differences-only override \`${override.id}\`.`).join("\n")}`,
    `## Decision Intelligence Links\n\n- Movement roles: ${entry.relatedMovementRoleIds.join(", ") || "none/accessory only"}\n- Action functions: ${entry.relatedActionFunctionIds.join(", ") || "none"}\n- Mechanics: ${entry.relatedMechanicsIds.join(", ")}\n- Stress tags: ${entry.relatedStressTags.join(", ") || "none"}\n- Related pain topics: ${entry.relatedPainTopicIds.join(", ") || "none"}. These references are non-diagnostic and inert.`,
    `## Prescription And Progression Boundary\n\nRepetition-set legality and exact progression axes belong to the production row. No fact invents sets, repetitions, load, tempo, duration, frequency, or automatic progression.`,
    `## Provenance And Unresolved Claims\n\n${bullets(entry.provenance.map((item) => `${item.sourceType}: ${item.sourceRef}`))}\n\n${entry.unresolvedClaims.length ? bullets(entry.unresolvedClaims) : "- None."}`,
  ]);
}

const ontologyBody = [
  "## Classification\n\n`" + knowledgeOntologyClassification + "`",
  "## Architecture Decision\n\n`@praxis/knowledge-core` owns canonical educational facts. Training Engine V2 remains the only production exercise catalog and imports no Knowledge runtime API. Build-time tooling may combine catalog and Knowledge data to validate and generate committed compact fallbacks.",
  "## Audited Concepts\n\n" + bullets([
    "canonical ledger and Pre-G1 frozen 45-row evidence",
    "ExerciseDefinition identity, role, action, muscle, equipment, support, stress, Prescription, progression, transition, phase, summary, and coachingFocus fields",
    "future Focus, Cues, Setup, During, Pattern, WatchFor presentations",
    "consumer and gyms compact coaching surfaces without changing either runtime",
    "workspace package boundaries and one-way build-time projection",
  ]),
  "## Explicit Answers\n\n" + knowledgeOntologyAnswers.map((answer, index) => `${index + 1}. ${answer}`).join("\n"),
  "## Risk Classification\n\n" + bullets([
    "PRODUCTION_READY_UNCHANGED: stable exercise IDs and current decision fields",
    "KNOWLEDGE_CORE_REQUIRED: all eight owner-selected rows",
    "COMPACT_FALLBACK_REQUIRED: deterministic generated projection for selected rows",
    "REALIZATION_KNOWLEDGE_OVERRIDE_REQUIRED: admitted Floor Press one-dumbbell and Bird Dog alternating differences",
    "EQUIPMENT_CONTRACT_REQUIRED: exact machine IDs and Band Curl self-anchor",
    "PRE_G2K_REQUIRED: every original 45-row canonical teaching core",
    "OUT_OF_SCOPE: UI, routes, CMS, database, network, owner delivery, and Product activation",
  ]),
];

const current45Table = [
  "| Exercise | Statuses | Pre-G2K blocker |",
  "| --- | --- | --- |",
  ...current45KnowledgeCompletenessMatrix.map((row) =>
    `| \`${row.exerciseId}\` | ${row.statuses.join(", ")} | ${row.exactBlockers.join(" ")} |`),
].join("\n");

const markdownReports: Readonly<Record<string, string>> = Object.freeze({
  "HOME_FIRST_MIXED_CATALOG_KNOWLEDGE_ONTOLOGY_AUDIT.md": md("Home-First Mixed Catalog Knowledge Ontology Audit", ontologyBody),
  "PRAXIS_EXERCISE_KNOWLEDGE_CORE_CONTRACT.md": md("Praxis Exercise Knowledge Core Contract", [
    `Contract: \`PRAXIS_EXERCISE_KNOWLEDGE_CORE@1.0.0\`. Unsupported versions fail validation.`,
    "The pure private package owns facts and presentation references only. It owns no Candidate logic, exercise eligibility, ranking, Prescription policy, Product state, UI, network, database, or CMS integration.",
    `Registered contracts:\n${bullets(knowledgeContractRegistry.map((entry) => `\`${entry.contractId}@${entry.contractVersion}\``))}`,
  ]),
  "PRAXIS_EXERCISE_KNOWLEDGE_FACT_MODEL.md": md("Praxis Exercise Knowledge Fact Model", [
    "One stable subordinate fact ID owns one canonical statement, optional compact instruction, applicability, review state, and provenance. Duplicate semantic facts and orphan accepted facts fail validation.",
    "Fact kinds are setup instruction, execution instruction, movement pattern, watch for, mechanics explanation, equipment boundary, and safety boundary.",
  ]),
  "PRAXIS_EXERCISE_KNOWLEDGE_PRESENTATION_MODEL.md": md("Praxis Exercise Knowledge Presentation Model", [
    "Focus, Cues, Setup, During, Pattern, and WatchFor store fact references rather than copied prose. Focus resolves exactly one fact; every other category meets the selected-row minimums independently.",
  ]),
  "PRAXIS_EXERCISE_REALIZATION_KNOWLEDGE_OVERRIDES.md": md("Praxis Exercise Realization Knowledge Overrides", [
    "Overrides model differences only. They may add or replace bounded presentation references and may never duplicate a parent entry.",
    PACKAGE_R_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides.map((override) =>
      `- \`${override.id}\` for \`${override.realizationId}\`.`)).join("\n") || "No overrides.",
    "Unapproved triceps, reverse-fly, banded hip-abduction, band-type, and plate-loaded machine realizations remain absent.",
  ]),
  "PRAXIS_EXERCISE_KNOWLEDGE_COMPACT_FALLBACK.md": md("Praxis Exercise Knowledge Compact Fallback", [
    "Summary projects from the first accepted pattern fact. Coaching focus projects from the accepted focus and first cue. Output is sorted by exercise ID and committed to Training Engine V2 only when production rows are admitted.",
    packageRCompactFallbackProjection.map((entry) => `- \`${entry.exerciseId}\`: ${entry.summary} Focus: ${entry.coachingFocus.join(" / ")}`).join("\n"),
  ]),
  "PRAXIS_EXERCISE_KNOWLEDGE_ENGINE_BOUNDARY.md": md("Praxis Exercise Knowledge Engine Boundary", [
    "Engine decisions use structured domain facts. Knowledge prose never selects, excludes, ranks, scores, prescribes, sequences, progresses, or diagnoses. Production engine source consumes only a committed generated compact fallback after admission.",
    `Boundary guards:\n${bullets(Object.entries(knowledgeBoundaryGuards).map(([key, value]) => `${key}: ${value}`))}`,
  ]),
  "PRAXIS_EXERCISE_KNOWLEDGE_COACHING_RAIL_COMPATIBILITY.md": md("Praxis Exercise Knowledge Coaching Rail Compatibility", [
    "All selected entries resolve Focus immediately and expose Cues, Setup, During, Pattern, and WatchFor independently. A future fixed-height rail can choose references without parsing paragraphs or requiring a Library redirect.",
    "No Coaching Rail component, interaction, route, or runtime import is implemented.",
  ]),
  "PRAXIS_EXERCISE_KNOWLEDGE_LIBRARY_COMPATIBILITY.md": md("Praxis Exercise Knowledge Library Compatibility", [
    "Stable exercise IDs and related mechanics, movement, action, stress, and pain-topic references can support future deeper exercise pages. Long-form explanations, public articles, media, SEO, routes, and CMS behavior remain absent.",
  ]),
  "PRAXIS_EXERCISE_KNOWLEDGE_PAIN_TOPIC_BOUNDARY.md": md("Praxis Exercise Knowledge Pain Topic Boundary", [
    "Pain-topic IDs are future educational references only. They do not diagnose, infer causation, promise treatment, change Safety, alter eligibility, affect ranking, or create receiver obligations.",
    `Diagnosis claims: ${knowledgeFoundationValidation.diagnosisClaimCount}. Treatment claims: ${knowledgeFoundationValidation.treatmentClaimCount}.`,
  ]),
  "PACKAGE_R_KNOWLEDGE_COMPLETENESS.md": md("Package R Knowledge Completeness", [
    `Entries: ${knowledgeFoundationValidation.entryCount}. Facts: ${knowledgeFoundationValidation.factCount}. Realization overrides: ${knowledgeFoundationValidation.realizationOverrideCount}. Validation findings: ${knowledgeFoundationValidation.findings.length}.`,
    "Every selected entry has one focus, at least two cues, two setup facts, two during facts, one pattern fact, two WatchFor facts, equipment boundaries, related mechanics, provenance, and deterministic compact fallback projection.",
  ]),
  "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_AUDIT.md": md("Current 45 Exercise Knowledge Core Completeness Audit", [
    `Contract: \`${current45KnowledgeAudit.contract.contractId}@${current45KnowledgeAudit.contract.contractVersion}\`. Authority: \`${current45KnowledgeAudit.authority}\`.`,
    "Summary and coachingFocus are compact fallbacks only. They are not expanded into accepted facts. No original-row copy changes in Pre-G2.",
    `Counts:\n${bullets(Object.entries(current45KnowledgeAudit.counts).map(([key, value]) => `${key}: ${value}`))}`,
  ]),
  "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_MATRIX.md": md("Current 45 Exercise Knowledge Core Completeness Matrix", [current45Table]),
  "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_PRE_G2K_READINESS.md": md("Current 45 Exercise Knowledge Core Pre-G2K Readiness", [
    `All ${current45KnowledgeAudit.counts.rowBlockerCount} original rows remain blocked on canonical fact curation and provenance before controlled delivery. ${current45KnowledgeAudit.counts.realizationOverrideRequired} also require explicit realization-difference review.`,
    "Priority order is production usage and workout-card visibility, then pain-context relevance, realization complexity, setup risk, frequency, and future Coaching Rail need. Popularity is not a ranking input.",
    `Exact next dependency: \`${current45KnowledgeAudit.exactNextDependency}\`.`,
  ]),
  ...Object.fromEntries(PACKAGE_R_KNOWLEDGE_ENTRIES.map((entry) => {
    const filename = `${entry.exerciseId.replaceAll("-", "_").toUpperCase()}_PRODUCTION_CURATION.md`;
    return [filename, renderEntry(entry)];
  })),
});

const jsonReports: Readonly<Record<string, string>> = Object.freeze({
  "PRAXIS_EXERCISE_KNOWLEDGE_CONTRACTS.json": json(knowledgeContractRegistry),
  "PACKAGE_R_SELECTED_IDS.json": json(PACKAGE_R_SELECTED_EXERCISE_IDS),
  "PACKAGE_R_KNOWLEDGE_ENTRIES.json": json(PACKAGE_R_KNOWLEDGE_ENTRIES),
  "PACKAGE_R_KNOWLEDGE_FACT_REGISTRIES.json": json(PACKAGE_R_KNOWLEDGE_ENTRIES.map((entry) => ({ exerciseId: entry.exerciseId, facts: entry.facts }))),
  "PACKAGE_R_KNOWLEDGE_PRESENTATION_MAPS.json": json(PACKAGE_R_KNOWLEDGE_ENTRIES.map((entry) => entry.presentation)),
  "PACKAGE_R_KNOWLEDGE_REALIZATION_OVERRIDES.json": json(PACKAGE_R_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides)),
  "PACKAGE_R_KNOWLEDGE_COMPACT_FALLBACK_PROJECTION.json": json(packageRCompactFallbackProjection),
  "CURRENT_45_EXERCISE_KNOWLEDGE_CORE_COMPLETENESS_MATRIX.json": json(current45KnowledgeCompletenessMatrix),
  "PACKAGE_R_KNOWLEDGE_FOUNDATION_FINGERPRINTS.json": json(knowledgeFoundationFingerprints),
});

for (const [filename, content] of Object.entries({ ...markdownReports, ...jsonReports })) {
  writeFileSync(resolve(docsRoot, filename), content, "utf8");
}

process.stdout.write(`${JSON.stringify({
  ontologyClassification: knowledgeOntologyClassification,
  selectedIds: PACKAGE_R_SELECTED_EXERCISE_IDS,
  markdownReportCount: Object.keys(markdownReports).length,
  jsonReportCount: Object.keys(jsonReports).length,
  validationFindingCount: knowledgeFoundationValidation.findings.length,
  current45BlockerCount: current45KnowledgeAudit.counts.rowBlockerCount,
  compactProjectionFingerprint: knowledgeFoundationFingerprints.compactProjection,
  combinedFoundationFingerprint: knowledgeFoundationFingerprints.combinedFoundation,
  serializationCheck: stableKnowledgeJson({ b: 2, a: 1 }) === stableKnowledgeJson({ a: 1, b: 2 }),
}, null, 2)}\n`);
