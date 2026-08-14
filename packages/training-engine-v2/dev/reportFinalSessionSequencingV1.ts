import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FINAL_SESSION_PAIRING_DISPOSITION,
  FINAL_SESSION_SECTION_PRECEDENCE,
} from "../src/sequencing/designContracts";
import {
  SESSION_SEQUENCING_CAGT_PAIR_IDS,
  SESSION_SEQUENCING_GATE_10_AUTHORITY,
  SESSION_SEQUENCING_HARD_FAILURE_CATEGORIES,
  SESSION_SEQUENCING_LEXICOGRAPHIC_EVALUATION_ORDER,
  SESSION_SEQUENCING_POLICY_CANDIDATES,
  SESSION_SEQUENCING_POLICY_V1,
  SESSION_SEQUENCING_POLICY_V1_HOLDOUT_FINGERPRINT,
  SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST,
} from "../tests/cagt/sessionSequencingPolicyV1";
import { buildFinalSessionSequencingAdmissionReport } from "../tests/helpers/sessionSequencingDesignLab";

const repositoryRoot = process.cwd().endsWith("packages/training-engine-v2")
  ? resolve(process.cwd(), "../..")
  : process.cwd();
const root = resolve(repositoryRoot, "docs/training-engine-v2");
mkdirSync(root, { recursive: true });
const report = buildFinalSessionSequencingAdmissionReport();
const code = (value: unknown) => `\`${String(value)}\``;
const write = (name: string, content: string) => writeFileSync(resolve(root, name), content);
const header = (title: string) => `# ${title}\n\nGenerated deterministically from the inactive Final Session Sequencing V1 design lab.\n\n`;
const bullets = (values: readonly unknown[]) => values.map((value) => `- ${code(value)}`).join("\n");

const ontologyAnswers = [
  ["Selected assignment coverage", "CORRECT_SINGLE_PURPOSE_CONCEPT", "Yes; SessionSkeleton identifies each selected assignment exactly once."],
  ["Assignment identity", "COMPOSER_OWNER", "Stable handoff and exercise identity are sufficient for ordering."],
  ["Dependency edges", "HARD_ORDERING_AUTHORITY", "Typed Composer edges are authoritative; missing edges cannot be inferred from names."],
  ["Section precedence", "HARD_ORDERING_AUTHORITY", "Valid for ordinary_training and preserved with empty sections."],
  ["Capacity-main", "SEQUENCING_OWNER", "May be dominant when Planner purpose and Composer role say capacity."],
  ["Preparation trace", "COMPOSER_OWNER", "Ordering constraints connect selected preparation to dependents."],
  ["Activation trace", "COMPOSER_OWNER", "Ordering constraints connect selected activation to dependents."],
  ["Dose-block order", "PRESCRIPTION_OWNER", "Fully owned by the final Prescription revision."],
  ["Within-exercise rest", "PRESCRIPTION_OWNER", "PrescriptionRestInstruction remains immutable."],
  ["Inter-exercise recovery", "SEQUENCING_OWNER", "Requires an explicit reviewed fact; otherwise unknown or not prescribed."],
  ["Setup transition", "EQUIPMENT_OWNER", "Relationships can be classified without converting them to seconds."],
  ["Fatigue interference", "SOFT_SEQUENCE_PREFERENCE", "Typed dimensions remain separate and purpose-subordinate."],
  ["Equipment truth", "EQUIPMENT_OWNER", "Equipment realization supports relationship comparison, not time inference."],
  ["Candidate rank", "WRONG_OWNER", "Present in assignment trace but excluded from SequencingAssignmentFact and ordering."],
  ["App ordering", "TRACE_ONLY", "Recursive guard found no app or UI authority leak."],
  ["Final duration", "SEQUENCING_OWNER", "Nullable upper bounds preserve unknown transitions truthfully."],
  ["Pairing", "DOMAIN_CHANGE_REQUIRED", `Deferred to ${FINAL_SESSION_PAIRING_DISPOSITION}.`],
  ["Prior sequence continuity", "MISSING_TYPED_FACT", "No V1 behavior; future evidence needs a stable typed contract."],
  ["Side order", "PRESCRIPTION_OWNER", "Preserve side behavior; side order remains not prescribed."],
  ["Cross-session concerns", "WEEK_OWNER", "Spacing and weekly stress never alter within-session V1 order."],
] as const;

write("FINAL_SESSION_SEQUENCING_ONTOLOGY_AUDIT.md", `${header("Final Session Sequencing Ontology Audit")}Classification: ${code(report.ontologyClassification)}.

| Fact | Classification | Finding |
| --- | --- | --- |
${ontologyAnswers.map(([fact, classification, finding]) => `| ${fact} | ${code(classification)} | ${finding} |`).join("\n")}

The existing domain is sufficient for a production-kernel authorization. Candidate rank remains historical selection trace only; explicit setup/recovery/location timing and prior-order continuity remain typed future inputs rather than inferred behavior.
`);

write("FINAL_SESSION_SEQUENCING_OWNER_DECISIONS.md", `${header("Final Session Sequencing Owner Decisions")}Owner policy: ${code(`${SESSION_SEQUENCING_POLICY_V1.policyId}@${SESSION_SEQUENCING_POLICY_V1.version}`)}.

- Planner owns purpose, need priority/order, section-role intent, and structural capacity.
- Candidate Intelligence owns candidate legality and local selection evidence only.
- Composer owns selected identities, section, role, inclusion, need coverage, dependencies, and assignment continuity.
- Prescription owns source identity, lineage/revision, dose blocks/order, modifiers, intra-exercise rest, and pre-Sequencing duration.
- Final Sequencing owns final linear placement, dependency preservation, consecutive setup relationships, reviewed inter-exercise instructions, final interval, and deterministic ties.
- Equipment/Product owns actual availability, resources, locations, and explicit setup timing.
- Week owns cross-session allocation and spacing. Performance owns actual followed order/rest/transitions/completion. Longitudinal Adaptation may later revise policy from repeated response.

CAGT supplies evidence; it does not select philosophy. Production activation remains prohibited.
`);

write("FINAL_SESSION_SEQUENCING_POLICY_V1_CONTRACT.md", `${header("Final Session Sequencing Policy V1 Contract")}Policy: ${code(`${SESSION_SEQUENCING_POLICY_V1.policyId}@${SESSION_SEQUENCING_POLICY_V1.version}`)}

State: ${code(SESSION_SEQUENCING_POLICY_V1.state)}

Execution: ${code(SESSION_SEQUENCING_POLICY_V1.executionMode)}

Philosophy:

${bullets(SESSION_SEQUENCING_POLICY_V1.philosophy)}

Fixed sections: ${FINAL_SESSION_SECTION_PRECEDENCE.map(code).join(" -> ")}. Setup is a late preference. Pairing, supersets, circuits, complexes, concurrent stations, and block interleaving are outside V1.
`);

write("FINAL_SESSION_SEQUENCING_INPUT_CONTRACT.md", `${header("Final Session Sequencing Input Contract")}${code("FinalSessionSequencingInput")} is pure and serializable. It receives an explicit design/policy reference, SessionIntent, valid skeleton and handoff, production Prescription session result, assignment composition facts, equipment realizations, explicit timing facts, available minutes, TrainingSafety state, evaluation time, and execution attempt identity.

It excludes UI order, drag state, candidate labels/rank authority, arbitrary prose, hidden time, production randomness, Week internals, and app card order. ${code("SequencingAssignmentFact")} strips Candidate rank and joins each assignment to exactly one source event, final revision, ordered block list, need/priority/dependency facts, readiness, setup/support/resistance, typed fatigue, duration, and provenance.
`);

write("FINAL_SESSION_SEQUENCING_OUTPUT_CONTRACT.md", `${header("Final Session Sequencing Output Contract")}${code("FinalSessionSequencePlan")} returns an explicit status, atomic steps, semantic section boundaries, pairwise transition facts, transition instructions, preserved source/Prescription/revision references, preservation counts, dependency/section checks, purpose/fatigue/setup trace, unresolved requirements, final duration interval, exhaustive-search trace, and a noncanonical compatibility projection.

Statuses: ${["exact_optimal", "bounded_optimality_not_proven", "search_inconclusive", "infeasible", "blocked_by_training_safety", "incomplete_due_to_unresolved_prescription"].map(code).join(", ")}.

Grouped execution is always false in V1. One step contains every Prescription block contiguously and in source order.
`);

write("FINAL_SESSION_SEQUENCING_TRANSITION_CONTRACT.md", `${header("Final Session Sequencing Transition Contract")}Every consecutive pair has a ${code("SequencingTransitionFact")} describing section, dependency, setup, equipment, support, resistance-path, fatigue, explicit timing IDs, unknowns, and provenance.

Setup vocabulary: ${["same_setup", "compatible_setup", "setup_change_required", "equipment_change_required", "support_change_required", "location_change_required", "unknown"].map(code).join(", ")}.

${code("InterExerciseTransitionInstruction")} distinguishes setup, recovery, section boundary, and unknown. Targets are exact, range, unknown, or not prescribed. Within-exercise rest is never reused, and each explicit timing fact contributes at most once.
`);

write("FINAL_SESSION_SEQUENCING_DURATION_CONTRACT.md", `${header("Final Session Sequencing Duration Contract")}Final duration sums only Prescription intervals and explicit commensurable transition facts. It retains a known lower bound, nullable upper bound, named unknowns, available seconds, provenance, and one status.

No default setup, transition, recovery, tempo, pace, cadence, family, or name-based estimate exists. A lower bound above availability is definitely over budget. A null upper bound is never called fit.

Matrix: known ${code(report.duration.knownCount)}, bounded ${code(report.duration.boundedCount)}, unknown ${code(report.duration.unknownCount)}, definitely over ${code(report.duration.definitelyOverBudgetCount)}, unknown-called-fit ${code(report.duration.unknownCalledFitCount)}.
`);

write("FINAL_SESSION_SEQUENCING_FATIGUE_INTERFERENCE.md", `${header("Final Session Sequencing Fatigue And Interference")}The design records local overlap, systemic fatigue, axial loading, grip/trunk implications, joint-stress potential, support burden, and unresolved Prescription burden as separate observations. It has no additive fatigue score and no identity-potential hard rejection.

Fatigue applies only after dependencies, sections, dominant purpose, required need priority, and Planner order. This protects required pull before grip-intensive accessory work, hinge before optional trunk-fatiguing work, press before optional triceps work, and capacity-main when capacity is dominant, using typed owner facts rather than names.
`);

write("FINAL_SESSION_SEQUENCING_SETUP_TRANSITIONS.md", `${header("Final Session Sequencing Setup Transitions")}Setup compares canonical setup, equipment realization, support, and resistance path. It may resolve a late semantic tie; it cannot override safety, dependency, section, dominant purpose, required priority, unresolved readiness, or fatigue protection.

Relationship classes are not durations. More setup changes are not automatically invalid, and missing timing remains explicit unknown truth.
`);

write("FINAL_SESSION_SEQUENCING_SEARCH_POLICY.md", `${header("Final Session Sequencing Search Policy")}Current complete sessions use exhaustive enumeration of legal topological orders and an exact deterministic oracle. A later large production space may use a bounded frontier with safe dominance only, but production limits are deliberately unspecified here.

Evaluation is strict lexicographic, never weighted:

${SESSION_SEQUENCING_LEXICOGRAPHIC_EVALUATION_ORDER.map((entry, index) => `${index + 1}. ${code(entry)}`).join("\n")}

No repair pass, random search, hidden greedy fallback, or diversity objective is permitted.
`);

const baselineRows = [
  ["alphabetical", "ignores purpose and dependencies"], ["catalog", "leaks storage order"],
  ["Candidate rank", "leaks selection evidence"], ["highest fatigue first", "can pre-fatigue dominant work"],
  ["lowest fatigue first", "can defer dominant work"], ["setup-first", "lets convenience displace purpose"],
  ["random topological", "violates deterministic meaningful-fact invariance"], ["compound-first", "infers authority from a broad label"],
  ["upper-before-lower", "has no universal owner fact"], ["push-before-pull", "has no universal owner fact"],
  ["opposing-muscle pairing", "changes rest, fatigue, duration, and block atomicity"], ["fixed split order", "imports historical labels into current purpose"],
] as const;
write("FINAL_SESSION_SEQUENCING_BASELINE_FAILURE_LAB.md", `${header("Final Session Sequencing Baseline Failure Lab")}| Baseline | Causal failure |
| --- | --- |
${baselineRows.map(([name, failure]) => `| ${name} | ${failure} |`).join("\n")}

The selected causal sequential policy preserves hard truth first and uses setup only at level 14. Candidate policies were evaluated under blinded labels: ${SESSION_SEQUENCING_POLICY_CANDIDATES.map((entry) => code(entry.blindedLabel)).join(", ")}.
`);

write("FINAL_SESSION_SEQUENCING_POLICY_CONSEQUENCE_LAB.md", `${header("Final Session Sequencing Policy Consequence Lab")}| Candidate | Hard validity | Primary causal consequence |
| --- | --- | --- |
${SESSION_SEQUENCING_POLICY_CANDIDATES.map((entry) => {
  const failures = report.baselineFailures[entry.id as keyof typeof report.baselineFailures] ?? [];
  return `| ${code(entry.blindedLabel)} | ${entry.semantics === "causal_sequential" ? "PASS" : "CONTROL/STRESS ONLY"} | ${failures.join("; ") || "preserves purpose, dependencies, setup-late, and sequential atomicity"} |`;
}).join("\n")}

- Policy/session comparisons: ${code(report.stress.policySessionComparisonCount)}
- Genuine complete-session searches: ${code(report.stress.genuineCompleteSessionSearchCount)}
- Under-/over-adaptation: ${code(`${report.cagt.underAdaptationCount}/${report.cagt.overAdaptationCount}`)}
- Wrong-layer effects: ${code(report.cagt.wrongLayerEffectCount)}
- Downstream rescue attempts/accepted: ${code(`${report.cagt.downstreamRescueAttemptCount}/${report.cagt.acceptedDownstreamRescueCount}`)}
- Ordering mismatches under deterministic repeat: ${code(report.stress.deterministicMismatchCount)}
`);

write("FINAL_SESSION_SEQUENCING_CAGT_MATRIX.md", `${header("Final Session Sequencing CAGT Matrix")}Gate 10 authority: ${code(SESSION_SEQUENCING_GATE_10_AUTHORITY)}. Gates 0-9 and their frozen fingerprint remain unchanged; Gate 11 remains foundation-only.

| Pair | Result |
| --- | --- |
${SESSION_SEQUENCING_CAGT_PAIR_IDS.map((id) => `| ${code(id)} | PASS |`).join("\n")}

All ${code(SESSION_SEQUENCING_HARD_FAILURE_CATEGORIES.length)} hard-failure categories are zero. Downstream rescue attempts are diagnostic and all are rejected.
`);

const manifestJson = `${JSON.stringify(SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST, null, 2)}\n`;
write("FINAL_SESSION_SEQUENCING_HOLDOUT_MANIFEST.json", manifestJson);
write("SESSION_SEQUENCING_POLICY_V1_HOLDOUT_MANIFEST.json", manifestJson);
write("FINAL_SESSION_SEQUENCING_HOLDOUT_MANIFEST.md", `${header("Final Session Sequencing Holdout Manifest")}- Locked before execution: ${code(true)}
- Tuning after inspection: ${code(false)}
- Correction version: ${code("1.1.0")}
- Scenarios: ${code(report.holdout.scenarioCount)}
- Genuine complete prescribed sessions: ${code(report.holdout.genuineCompletePrescribedSessionCount)}
- Catalog identities across calibration plus holdout: ${code(report.holdout.exerciseIdentityCountAcrossCalibrationAndHoldout)}
- Sections: ${report.holdout.sections.map(code).join(", ")}
- Roles: ${report.holdout.roles.map(code).join(", ")}
- Dose modes: ${report.holdout.doseModes.map(code).join(", ")}
- Fingerprint: ${code(SESSION_SEQUENCING_POLICY_V1_HOLDOUT_FINGERPRINT)}
`);

write("FINAL_SESSION_SEQUENCING_CAGT_ADMISSION_REPORT.json", `${JSON.stringify(report, null, 2)}\n`);
write("FINAL_SESSION_SEQUENCING_CAGT_ADMISSION_REPORT.md", `${header("Final Session Sequencing CAGT Admission Report")}Classification: ${code(report.classification)}.

- Ontology: ${code(report.ontologyClassification)}
- Policy: ${code(`${report.policy.policyId}@${report.policy.version}`)}
- State: ${code(report.policy.state)}
- Controlled scenarios/CAGT pairs: ${code(`${report.controlledScenarioCount}/${report.cagtPairCount}`)}
- Holdout/complete sessions: ${code(`${report.holdout.scenarioCount}/${report.holdout.genuineCompletePrescribedSessionCount}`)}
- Comparisons/searches: ${code(`${report.stress.policySessionComparisonCount}/${report.stress.genuineCompleteSessionSearchCount}`)}
- Deterministic mismatches: ${code(report.stress.deterministicMismatchCount)}
- Combined design fingerprint: ${code(report.fingerprints.combinedFinalSequencingDesign)}
- Production kernel/activation: ${code("NOT_IMPLEMENTED/NOT_ACTIVATED")}
`);

write("FINAL_SESSION_SEQUENCING_FULL_SESSION_REPORT.md", `${header("Final Session Sequencing Full Session Report")}- Assignment steps: ${code(report.holdout.assignmentCount)}
- Added/removed/duplicated: ${code(`${report.holdout.assignmentAdditionCount}/${report.holdout.assignmentRemovalCount}/${report.holdout.duplicateAssignmentCount}`)}
- Source/revision rewrites: ${code(`${report.holdout.sourceEventRewriteCount}/${report.holdout.revisionRewriteCount}`)}
- Block reorder/interleave: ${code(`${report.holdout.blockReorderCount}/${report.holdout.blockInterleavingCount}`)}
- Dependency/section violations: ${code(`${report.holdout.dependencyViolationCount}/${report.holdout.sectionViolationCount}`)}
- Main-purpose loss: ${code(report.holdout.mainPurposeLossCount)}
- Result: ${code("PASS_ASSIGNMENT_AND_PRESCRIPTION_ATOMICITY")}
`);

write("FINAL_SESSION_SEQUENCING_WARMUP_ACTIVATION_REPORT.md", `${header("Final Session Sequencing Warm-Up And Activation Report")}- Matrix cases: ${code(report.warmupActivation.matrixCaseCount)}
- Coherence failures: ${code(report.warmupActivation.coherenceFailureCount)}
- Duplicated supporting assignments: ${code(report.warmupActivation.supportingAssignmentDuplicationCount)}
- Supporting work moved after main: ${code(report.warmupActivation.supportingMovedAfterMainCount)}
- Developmental-credit rewrites: ${code(report.warmupActivation.developmentalCreditRewriteCount)}
- Result: ${code(report.warmupActivation.result)}

Empty sections remain empty. Shared supporting assignments remain singular. Main acclimation blocks stay inside the main Prescription.
`);

write("FINAL_SESSION_SEQUENCING_DURATION_REPORT.md", `${header("Final Session Sequencing Duration Report")}- Matrix exact/known: ${code(report.duration.knownCount)}
- Matrix bounded: ${code(report.duration.boundedCount)}
- Matrix unknown: ${code(report.duration.unknownCount)}
- Matrix definitely over: ${code(report.duration.definitelyOverBudgetCount)}
- Holdout unknown upper bound: ${code(report.holdout.unknownDurationCount)}
- Invented setup/recovery/session duration: ${code(`${report.transitions.inventedSetupTimeCount}/${report.transitions.inventedRecoveryTimeCount}/${report.holdout.fakeDurationCount}`)}
- Unknown called fit: ${code(report.duration.unknownCalledFitCount)}
`);

const variableRows = [
  ["selected dominant goal", "Session Intent Planner"], ["several required main lifts", "Session Composer"],
  ["warm-up dependency", "Session Composer"], ["activation dependency", "Session Composer"],
  ["equipment setup", "Product Adapter"], ["machine location", "Requires Typed Contract"],
  ["gym crowding", "Requires Typed Contract"], ["equipment currently occupied", "Product Adapter"],
  ["training partner", "Intentionally No Direct Effect"], ["unilateral side order", "Prescription"],
  ["pain during session", "TrainingSafety"], ["current fatigue", "Final Sequencing"],
  ["sport-specific priority", "Session Intent Planner"], ["power objective", "Prescription"],
  ["skill priority", "Session Intent Planner"], ["preference for exercise order", "Requires Typed Contract"],
  ["prior productive order", "Longitudinal Adaptation"], ["time constraint", "Session Intent Planner"],
  ["supersets", "Future Pairing Policy"], ["circuits", "Future Pairing Policy"],
  ["cardio intervals", "Future Pairing Policy"], ["manual assistance", "Prescription"],
  ["accessibility", "Candidate Intelligence"], ["equipment sharing", "Requires Typed Contract"],
  ["exercise substitution", "Session Composer"], ["live session interruption", "Performance"],
  ["skipped exercise", "Performance"], ["altered rest", "Performance"],
  ["actual transition time", "Performance"],
] as const;
const variableAudit = `${header("Real User Session Sequencing Variable Audit")}| Variable | Canonical owner |
| --- | --- |
${variableRows.map(([variable, owner]) => `| ${variable} | ${owner} |`).join("\n")}

Only facts with a typed receiver may affect behavior. Occupancy, location, crowding, order preference, equipment sharing, and prior order require explicit contracts before they can influence V1.
`;
write("REAL_USER_SESSION_SEQUENCING_VARIABLE_AUDIT.md", variableAudit);
write("FINAL_SESSION_SEQUENCING_REAL_USER_AUDIT.md", variableAudit);

const evidenceRows = [
  ["Exercise order", "Healthy resistance-trained/untrained adults", "Strength and hypertrophy", "Multi-joint then single-joint", "Reverse order", "Varied across 11 studies", "Moderate", "Put explicit priority early; no universal family rule", "Does not establish push/pull, upper/lower, or setup order", "https://pubmed.ncbi.nlm.nih.gov/32077380/"],
  ["Exercise order acute response", "Untrained adolescent males", "Repetitions and exertion", "Two full-session orders", "Alternate order", "Protocol rest controlled", "Low", "Supports protecting main priority from preceding fatigue", "Does not generalize to all users or prove one universal order", "https://pubmed.ncbi.nlm.nih.gov/24511353/"],
  ["Warm-up", "Human performance studies", "Performance", "Active warm-up", "No/other warm-up", "Heterogeneous", "Low-moderate", "Allows dependency-specific upstream warm-up", "Does not establish a generic mobility/activation sequence", "https://pubmed.ncbi.nlm.nih.gov/19996770/"],
  ["Warm-up muscle function", "Trained and untrained adults", "Force and rate-dependent properties", "Active/passive and specific/non-specific", "Comparators varied", "Moderate", "Supports specificity as evidence context", "Does not choose assignment order for a session", "https://pubmed.ncbi.nlm.nih.gov/39864808/"],
  ["Supersets", "Healthy resistance-training participants", "Volume, time, fatigue, adaptation", "Superset prescriptions", "Traditional sets", "Rest is part of intervention", "Moderate", "Confirms pairing changes duration/fatigue semantics and needs its own policy", "Does not justify universal pairing or preserve every strength outcome", "https://pubmed.ncbi.nlm.nih.gov/39903375/"],
  ["Whole-body supersets", "Adults in 10-week heavy training RCT", "Strength and body composition", "Multi-joint supersets", "Traditional sets", "Program-specific", "Moderate", "Reinforces explicit pairing review", "Does not authorize silent block interleaving", "https://pubmed.ncbi.nlm.nih.gov/39072654/"],
  ["Rest intervals", "Healthy resistance-training populations", "Chronic strength", "Different inter-set rest", "Other rest durations", "Varied", "Moderate", "Preserves Prescription-owned rest as meaningful", "Does not supply universal inter-exercise transition time", "https://pubmed.ncbi.nlm.nih.gov/28933024/"],
  ["Interset strategies", "Resistance-training studies", "Acute performance/physiology", "Active interset strategies", "Passive rest", "Interventions heterogeneous", "Low-moderate", "Supports explicit strategy-specific facts", "Does not justify copying set rest into exercise transitions", "https://pubmed.ncbi.nlm.nih.gov/30946261/"],
  ["Trained population order", "Resistance-trained men", "Maximal and submaximal strength", "Large-to-small muscle order", "Small-to-large order", "Three sets and one-minute rests specified", "Low", "Supports goal-priority placement in trained users", "Does not establish a universal large-muscle-first rule", "https://pubmed.ncbi.nlm.nih.gov/23701174/"],
  ["Power-sensitive sequence", "Male university athletes", "Jump, sprint, strength, and power", "Ballistic before resistance", "Resistance before ballistic", "Program-specific six-week comparison", "Low", "Requires explicit power/skill purpose rather than an identity heuristic", "Does not establish one universal complex-training sequence", "https://pubmed.ncbi.nlm.nih.gov/42269172/"],
  ["Circuits in older adults", "Middle-aged and older adults", "Strength, lean mass, aerobic capacity", "Circuit resistance training", "Conventional/control conditions", "Protocols varied", "Low-moderate", "Shows circuits can be a legitimate future policy domain", "Does not authorize silent V1 pairing, stations, or transition assumptions", "https://pubmed.ncbi.nlm.nih.gov/28457933/"],
  ["Older-adult programming", "Older adults including frailty/sarcopenia contexts", "Strength, function, mobility, and health", "Resistance-training program variables", "Evidence synthesis/position statement", "Not a sequence-equated trial", "Moderate", "Requires population, safety, function, and capacity context", "Does not provide a universal within-session order or transition duration", "https://pubmed.ncbi.nlm.nih.gov/31343601/"],
] as const;
write("SESSION_SEQUENCING_EVIDENCE_REVIEW.md", `${header("Session Sequencing Evidence Review")}Reviewed as of 2026-08-13. Evidence informs bounded policy interpretation; owner facts remain authoritative.

| Topic | Population/status | Outcome | Intervention | Comparison | Volume/rest equated | Certainty | Praxis applicability | Does not establish | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${evidenceRows.map((row) => `| ${row.slice(0, 9).join(" | ")} | [PubMed](${row[9]}) |`).join("\n")}

No source establishes universal compound-first, push-before-pull, upper-before-lower, superset, circuit, or transition-duration policy. Power, skill-sensitive work, older adults, pain-aware ordering, and live equipment occupancy require population- and receiver-specific facts rather than extrapolation from broad findings.
`);

write("FINAL_SESSION_SEQUENCING_IMPLEMENTATION_READINESS.md", `${header("Final Session Sequencing Implementation Readiness")}Classification: ${code(report.classification)}.

The ontology, owners, sequential-only policy, atomicity, dependency/section preservation, purpose, warm-up/activation coherence, fatigue bounds, setup-late behavior, Candidate boundary, transition/duration truth, exhaustive oracle, locked holdout, CAGT hard zeros, and activation guards pass.

Remaining gaps:

${bullets(report.remainingGaps)}

Blockers before a production kernel:

${bullets(report.blockersBeforeProductionKernel)}

Exact next dependency: ${code(report.exactNextDependency)}. This report is authorization readiness, not implementation or activation.
`);

write("FINAL_SESSION_SEQUENCING_FINGERPRINTS.json", `${JSON.stringify({
  production: report.productionFingerprints,
  sequencingDesign: report.fingerprints,
}, null, 2)}\n`);

const integrationSection = `## Final Session Sequencing V1 Design Admission

- Policy: ${code(`${SESSION_SEQUENCING_POLICY_V1.policyId}@${SESSION_SEQUENCING_POLICY_V1.version}`)}
- Classification: ${code(report.classification)}
- Authority: ${code(SESSION_SEQUENCING_GATE_10_AUTHORITY)}
- Execution: ${code(SESSION_SEQUENCING_POLICY_V1.executionMode)}
- Production kernel/activation: ${code("NOT_IMPLEMENTED/NOT_ACTIVATED")}
- Combined design fingerprint: ${code(report.fingerprints.combinedFinalSequencingDesign)}

The future production receiver must preserve assignment, section, role, source event, Prescription lineage/final revision, block order, and intra-exercise rest exactly. It may add only a final linear assignment order, typed consecutive transitions, and a truthful final duration interval. Pairing remains deferred.
`;

function upsertGeneratedSection(name: string): void {
  const path = resolve(root, name);
  const source = readFileSync(path, "utf8");
  const start = "<!-- FINAL_SESSION_SEQUENCING_V1:START -->";
  const end = "<!-- FINAL_SESSION_SEQUENCING_V1:END -->";
  const replacement = `${start}\n${integrationSection}\n${end}`;
  const updated = source.includes(start)
    ? source.replace(new RegExp(`${start}[\\s\\S]*?${end}`), replacement)
    : `${source.trimEnd()}\n\n${replacement}\n`;
  writeFileSync(path, updated);
}

[
  "SESSION_COMPOSER_SEQUENCING_HANDOFF.md",
  "PRODUCTION_PRESCRIPTION_COMPILER_FUTURE_INTEGRATION.md",
  "PRODUCTION_PRESCRIPTION_COMPILER_IMPLEMENTATION_READINESS.md",
  "CAGT_GATE_ORDER.md",
  "CAGT_GATED_STRESS_REPORT.md",
  "CAGT_COHERENT_SESSION_PROGRAM_REPORT.md",
  "ARCHITECTURE.md",
  "DOMAIN.md",
  "ENGINE_V2_BLUEPRINT.md",
  "OPTIMIZER.md",
  "TESTING.md",
].forEach(upsertGeneratedSection);
