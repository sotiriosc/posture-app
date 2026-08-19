import {
  PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS,
  PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS,
  PRODUCT_TRAINING_GOAL_CAGT_RESULT,
  PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR,
  PRODUCT_TRAINING_GOAL_EVIDENCE,
  PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE,
  PRODUCT_TRAINING_GOAL_MAPPING_MATRIX,
  PRODUCT_TRAINING_GOAL_POLICY_CONSEQUENCES,
  PRODUCT_TRAINING_GOAL_SCENARIOS,
  PRODUCT_TRAINING_GOAL_UPSTREAM_FINGERPRINTS,
  buildProductTrainingGoalAuditReport,
} from "./productTrainingGoalAudit";

export const PRODUCT_TRAINING_GOAL_REPORT_FILENAMES = Object.freeze([
  "PRODUCT_TRAINING_GOAL_AND_PRESCRIPTION_SPECIFICITY_ONTOLOGY_AUDIT.md",
  "PRODUCT_TRAINING_GOAL_RESISTANCE_TRAINING_EVIDENCE_REVIEW.md",
  "PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR_AUDIT.md",
  "PRODUCT_TRAINING_GOAL_PRODUCT_VOCABULARY_OPTIONS.md",
  "PRODUCT_TRAINING_GOAL_STRENGTH_DOCTRINE.md",
  "PRODUCT_TRAINING_GOAL_HYPERTROPHY_DOCTRINE.md",
  "PRODUCT_TRAINING_GOAL_TONING_LANGUAGE.md",
  "PRODUCT_TRAINING_GOAL_PRESCRIPTION_FAMILY_OPTIONS.md",
  "PRODUCT_TRAINING_GOAL_COMPILER_FALLTHROUGH_AUDIT.md",
  "PRODUCT_TRAINING_GOAL_EXERCISE_SELECTION_CONSEQUENCES.md",
  "PRODUCT_TRAINING_GOAL_EQUIPMENT_CONSEQUENCES.md",
  "PRODUCT_TRAINING_GOAL_EXPERIENCE_PAIN_RETURN.md",
  "PRODUCT_TRAINING_GOAL_REST_TEMPO_EFFORT_LOAD.md",
  "PRODUCT_TRAINING_GOAL_WARMUP_ACTIVATION.md",
  "PRODUCT_TRAINING_GOAL_WEEK_PHASE_LONGITUDINAL_BOUNDARIES.md",
  "PRODUCT_TRAINING_GOAL_CAGT_CONSEQUENCE_LAB.md",
  "PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md",
  "PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md",
] as const);

export const PRODUCT_TRAINING_GOAL_JSON_FILENAMES = Object.freeze([
  "PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR_MATRIX.json",
  "PRODUCT_TRAINING_GOAL_MAPPING_MATRIX.json",
  "PRODUCT_TRAINING_GOAL_POLICY_CONSEQUENCE_MATRIX.json",
  "PRODUCT_TRAINING_GOAL_SCENARIO_RESULTS.json",
  "PRODUCT_TRAINING_GOAL_CAGT_RESULTS.json",
  "PRODUCT_TRAINING_GOAL_FINGERPRINTS.json",
] as const);

export const PRODUCT_TRAINING_GOAL_UPDATED_DOCS = Object.freeze([
  "FULL_PRESCRIPTION_IMPLEMENTATION_READINESS.md",
  "PRESCRIPTION_POLICY_V1_IMPLEMENTATION_READINESS.md",
  "CONTROLLED_PRODUCT_SHADOW_FUTURE_ACTIVATION.md",
  "CONTROLLED_PRODUCT_SHADOW_IMPLEMENTATION_READINESS.md",
  "TESTING.md",
] as const);

const ONTOLOGY_ANSWERS = `1. **Strength canonical?** Yes. \`strength\` is a canonical \`TrainingOutcomeGoal\`.
2. **Consumed by Week planning?** Yes, narrowly: Week Policy V1 owns \`major_strength_movement_development:S2\` opportunity targets.
3. **Consumed by Session planning?** Yes. Explicit \`outcomeGoal\` is validated and carried into \`SessionIntent\`.
4. **Consumed by Prescription?** Yes. Main repetition-set work resolves to \`main_strength\` unless the goal is hypertrophy.
5. **Product exposed?** No explicit Build strength option exists.
6. **Meaning of Product build?** Developmental progression only; it does not distinguish strength from hypertrophy.
7. **Athletic performance sufficient?** No. It cannot truthfully select strength, power, conditioning, or mixed policy without another fact.
8. **General-fitness fallthrough?** Yes, for main repetition-set assignments.
9. **Posture fallthrough?** Yes, for main repetition-set assignments.
10. **Pain-aware fallthrough?** Yes when the legacy value is used as a main goal; canonically it is a context mode, not an outcome.
11. **Intentional?** The strength and hypertrophy branches are intentional; the defaulting of every other value to strength is overbroad and apparently accidental.
12. **General-fitness use case?** An explicit family or an explicit purpose-first rule is required; the owner must select which.
13. **Conditioning use case?** An explicit family or purpose-first rule is required before it is supported as main repetition work.
14. **Posture use case?** It needs explicit purpose semantics; posture should not silently mean low-repetition strength.
15. **Power representation?** Owner decision. A structured secondary goal is the smaller first option; a future canonical outcome requires separate domain authorization.
16. **Tone / definition?** Only as user language that is clarified into muscle-building and body-composition intent, never as a false high-repetition physiology.
17. **Body-composition owner?** Product/profile goal ownership outside the training Prescription; the engine may consume an authorized fact later.
18. **Nutrition owner?** A nutrition domain/service, not Candidate, Composer, Week, or Prescription.
19. **Same exercise for strength and hypertrophy?** Yes. Load, reps, sets, rest, effort, and weekly volume can differ while exercise identity converges.
20. **Classes protected from blanket low reps?** Preparation, activation, mobility, recovery, carries, holds, breaths, counted steps, and role-owned accessories.
21. **Equipment blockers?** Load ceilings, unavailable increments, missing anchors/benches/machines, and absent support or loaded-gait space.
22. **Missing Product facts?** Direct goal truth, owner-approved mapping, explicit equipment capabilities, usable availability, experience, and enough prior-load evidence for safe realization.`;

const ONTOLOGY_CLASSIFICATIONS = `| Concept | Classification |
| --- | --- |
${Object.entries(buildProductTrainingGoalAuditReport().ontologyAudit).map(([concept, classification]) =>
    `| ${concept} | \`${classification}\` |`).join("\n")}`;

const EVIDENCE_REVIEW = `## Sources and bounded conclusions

| Source | Primary conclusion used here |
| --- | --- |
${PRODUCT_TRAINING_GOAL_EVIDENCE.map((source) =>
    `| [${source.id}: ${source.title}](${source.url}) | ${source.finding} |`).join("\n")}

## Translation boundary

The evidence supports separate strength and hypertrophy emphases, not rigid universal recipes. Heavy loading is a useful strength-specific signal when equipment and athlete context make it realizable. Hypertrophy can occur across a broad loading range and is more coherently differentiated by sufficient effort and volume. Rest, tempo, and failure are prescription variables, not Product goal labels. These findings concern healthy adults; pain-aware return remains a non-diagnostic context that requires conservative regression and Safety ownership.`;

const CURRENT_BEHAVIOR = `## Verified behavior

| Goal/context | Canonical | Current main repetition use case | Week status | Product option |
| --- | --- | --- | --- | --- |
${PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR.map((entry) =>
    `| ${entry.goal} | ${entry.canonicalOutcomeGoal ? "yes" : "no"} | ${entry.mainRepetitionUseCase} | ${entry.weekPolicy} | ${entry.productOption ? "yes" : "no"} |`).join("\n")}

Product currently offers Improve posture, Reduce pain, Athletic performance, and General fitness. It does not offer Build strength or Build muscle. Product \`trainingIntent=build\` means developmental progression, not a canonical outcome. The compiler consequence is narrow but material: main-section repetition-set assignments that survive earlier role/dose-mode branches default to \`main_strength\` unless the goal is exactly \`hypertrophy\`.`;

const VOCABULARY = `## Owner options, no selection

- **V0 current labels:** preserves the Product surface but provides no explicit strength or hypertrophy truth.
- **V1 direct outcomes:** Build strength and Build muscle map directly to canonical engine goals.
- **V2 plain-language outcomes:** Get stronger, Build muscle, and Improve fitness retain direct mappings with friendlier Product language.
- **V3 tone alias:** Tone / definition may be shown only as an alias followed by a muscle-building/body-composition clarification.

Athletic performance remains under-specified. Power, speed, sport preparation, strength, and conditioning must not be collapsed into one silent engine mapping. No vocabulary option is selected by this audit.`;

const STRENGTH = `## Doctrine

- Strength is already a canonical engine outcome and already has a current main Prescription family.
- Prefer higher loads when the athlete, exercise, and equipment can realize them safely; do not turn a percentage guideline into fabricated load precision.
- Keep the current main-strength ranges as observed behavior: standard 3 sets, 3-6 reps, RIR 1-3, 180-300 seconds; regression 2 sets, 3-6 reps, RIR 2-4, 120-240 seconds.
- Secondary strength remains role-owned at 2-3 sets, 5-10 reps, RIR 2-3, 90-180 seconds.
- Strength changes must begin with truthful Product/Week/Session purpose. Changing only a label or only downstream reps is a causal failure.
- Accessories, preparation, activation, mobility, recovery, and non-repetition dose modes do not inherit low reps from the global goal.
- Bodyweight, bands, dumbbells, machines, and free weights can all support strength, but their progression axes differ.
- Failure is optional. Quality, loadability, complete range of motion where appropriate, recovery, and repeatable progression matter more than compulsory failure.`;

const HYPERTROPHY = `## Doctrine

- Hypertrophy is already canonical and is the only goal with an explicit alternate main branch in the compiler.
- Current observed main policy is 3 sets, 6-20 reps, RIR 1-3, 90-180 seconds. Accessories generally use 1-2 sets, 8-20 reps, and 45-120 seconds according to purpose.
- A broad loading range can produce hypertrophy. Lower repetitions are legal; higher repetitions are legal; neither is a complete policy by itself.
- Sufficient weekly volume and effort are stronger distinguishing signals than a mandatory short rest or one tempo.
- Momentary failure is not required. Closer proximity may support hypertrophy, especially with lighter loading, but fatigue, safety, adherence, and exercise type bound the choice.
- Exercise selection may converge with strength while dose and weekly emphasis differ. Artificially changing exercises to make goals look unique is prohibited.
- Exact weekly volume remains an owner policy decision and must account for direct/indirect work, experience, availability, and recovery.`;

const TONING = `## Truthful Product language

\`tone\`, \`toned\`, and \`definition\` are appearance language, not a unique resistance-training adaptation. Visible definition can involve muscle size, body-fat level, genetics, hydration, and presentation. Resistance training can support muscle development, but the training engine must not promise localized fat loss or encode tone as high reps plus short rest.

## Options, no selection

- **T0:** do not use the term.
- **T1:** use it as a user-facing alias and map only after clarification.
- **T2:** keep it under-specified until the user chooses muscle building, body-composition support, or both.

Body-composition intent needs a Product/profile owner. Nutrition and fat-loss support need a nutrition owner. Any claims and Product copy require separate review.`;

const POLICY_FAMILIES = `## Options, no selection

| Option | Consequence |
| --- | --- |
| G0 current behavior | Keeps the observed non-hypertrophy strength fallback. |
| G1 explicit strength/hypertrophy | Rejects unsupported main goals rather than silently defaulting. |
| G2 add general fitness | Adds one family while preserving explicit posture/conditioning gaps. |
| G3 fully goal-specific core | Adds owner-defined families for every supported canonical outcome. |
| G4 purpose first | Resolves assignment purpose first and uses global outcome as a bounded modifier. |

G4 best reflects existing role/section/dose-mode ownership, while G1 is the smallest strict correction. That is design analysis, not a policy selection. The owner must decide how unsupported goals fail, how secondary goals interact, and whether general fitness, conditioning, and posture receive distinct families or purpose-first resolution.`;

const FALLTHROUGH = `## Exact branch

After preparation, activation, recovery, holds, breaths, carries, marches, counted steps, and secondary-strength branches, main-section work evaluates only whether the goal is hypertrophy. Hypertrophy resolves to \`main_hypertrophy\`; every other value resolves to \`main_strength\`.

## Consequence

The affected goal/context states are general fitness, conditioning, posture/movement quality, legacy pain-aware return, and unknown/legacy values. The canonical primary-main repetition exercise set contains ${buildProductTrainingGoalAuditReport().affectedExercises.length} exercises:

${buildProductTrainingGoalAuditReport().affectedExercises.map((id) => `- \`${id}\``).join("\n")}

This does not convert every session element to strength. It affects main repetition-set assignments that reach the branch. The finding is classified \`OVERBROAD_FALLTHROUGH\`; this audit does not alter it.`;

const EXERCISE_SELECTION = `## Consequences

Current Candidate roles, exercise knowledge, dose-mode legality, equipment requirements, structural capacity, and Composer constraints can express the legal selection boundary for the next policy tranche. Therefore no Candidate or Composer change is required before owner policy selection.

Goal may become material to selection when a future policy requires heavy-load realizability, particular muscle coverage, or a specific progression axis. That receiver should be added only with causal evidence. One exercise may serve strength and hypertrophy with different doses. The same main anchor may remain while accessories change; accessories may remain while main dose changes; complete convergence is valid when work demands are equivalent. No diversity quota or artificial uniqueness is allowed.`;

const EQUIPMENT = `## Environment consequences

- **Full gym:** can often realize heavy strength loads, fine increments, benches, cables, and multiple machine patterns; capabilities still must be explicit.
- **Dumbbells:** strength remains valid up to available load and increment ceilings. Use harder variants, unilateral work, range, or controlled progression without pretending a heavier load exists.
- **Bands:** anchor type, height, resistance curve, and band increments are material. Unanchored bands cannot satisfy anchored requirements.
- **Bodyweight:** progress through leverage, range, support, unilateral demand, pauses, or added load only when legal. High absolute loading is not guaranteed.
- **Machines:** stable heavy loading can be useful, but exact machine identity and fit matter.
- **Mixed/unknown:** do not infer a full gym from a broad label. Unknown capability must remain an explicit gap.

Equipment affects realization, not the truth of the user's goal. A truthful strength policy may report a loadability limitation rather than silently changing the goal.`;

const EXPERIENCE_PAIN = `## Context consequences

- **Beginner:** prioritize familiarization, technique, conservative effort, stable exercise choices, and increments that can be observed. Beginner does not mean a different physiology.
- **Advanced:** permit higher specificity and progression only when familiarity, prior load, recovery, and equipment evidence support it.
- **Pain-aware return:** remains a non-diagnostic context modifier. Regress sets, effort, load, range, support, or exercise as owned; do not recast pain as a training outcome.
- **Relevant Safety:** Safety gates precede goal-specific optimization.
- **Irrelevant pain:** do not globally suppress training from unrelated or stale evidence.
- **Return after absence:** reestablish load and tolerance evidence; do not resume an old load automatically.
- **Unknown prior load:** use bounded calibration rather than invented percentages or increments.`;

const REST_TEMPO_EFFORT_LOAD = `## Rest

Longer rest usually protects force and repetition performance for demanding strength work. Hypertrophy does not require short rest; both short and long rests can work, and current evidence has substantial overlap. Rest should follow exercise purpose, fatigue, time, and performance requirements.

## Tempo

No single tempo defines strength or hypertrophy. Use controlled, safe execution and any explicit exercise knowledge. Very slow repetitions are not a default hypertrophy upgrade. Fast concentric intent belongs to a separately authorized power purpose.

## Effort

High effort matters, but momentary failure is not mandatory. Current RIR ranges are sensible bounded observations, not a newly selected policy. Exercise type, load, experience, and safety constrain effort.

## Load

Higher loads preferentially support measured strength; hypertrophy is possible across a broad range when effort and volume are sufficient. Percentage-based targets require a credible maximum and realizable equipment. Never fabricate an exact load or increment.`;

const WARMUP_ACTIVATION = `## Ownership

Preparation remains dependency-owned. Activation remains dependency-owned. A strength goal does not authorize a generic strength warm-up, and a hypertrophy goal does not authorize generic activation. Current compiler ordering correctly protects warm-up, activation, recovery, and non-repetition dose modes before the main goal branch.

Goal-specific main loading may create a real preparation dependency, but the dependency must be carried explicitly from the selected exercise and work demand. Allowed convergence is expected: the same user may retain the same warm-up and activation when changing from strength to hypertrophy. This lab records zero generic strength warm-ups and zero generic hypertrophy activations.`;

const WEEK_PHASE_LONGITUDINAL = `## Boundaries

- **Week:** owns opportunities and distribution. Current strength support is narrow: required [1,2,3], preferred [0,1,2], optional [0,1,1] with scope \`major_strength_movement_development:S2\`. Opportunity counts are not sets.
- **Session:** owns today's purpose and allocated objectives; it consumes the canonical outcome goal.
- **Prescription:** owns exact sets, reps, rest, effort, load realization, and assignment-level specificity.
- **Phase:** supplies context only. Phase does not manufacture a missing goal or policy.
- **Longitudinal:** may progress evidence-backed load, reps, sets, range, support, or another authorized axis. It does not invent calendar progression, phase-only progression, automatic deloads, or automatic replacements.

Hypertrophy, general fitness, conditioning, and posture Week scopes remain policy questions. A Prescription correction must not silently create Week policy.`;

const CAGT = `## Lab result

- Controlled scenarios: ${PRODUCT_TRAINING_GOAL_SCENARIOS.length}
- Goal truths: 10
- Equipment environments: 6
- Experience levels: 3
- Sections: warm-up, activation, main, accessory, cooldown
- Result: \`${PRODUCT_TRAINING_GOAL_CAGT_RESULT.result}\`
- Artificial uniqueness: 0
- Diversity quota: 0
- Generic strength warm-ups: 0
- Generic hypertrophy activations: 0
- Accepted downstream rescues: 0

All ${PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS.length} hard-failure mutations were rejected. The earliest incorrect owner wins: downstream dose cannot rescue a false Product mapping or incorrect Week/Session purpose. Material response windows are Product mapping, Week responsibility, Session purpose, Candidate/Composer only when legal selection changes, Prescription, and sequencing/duration only when rest changes.`;

const IMPLEMENTATION = `## Required sequence

${PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.map((entry) =>
    `- **Chunk ${entry.chunk}:** ${entry.action}. Authorization: \`${entry.authorization}\`; behavior: \`${entry.behavior}\`.`).join("\n")}

No chunk is authorized by this audit. Chunk A is the immediate owner dependency. Chunk B must not activate Product behavior. Chunk C stays default off. Chunk E requires an owner screenshot of one actual goal surface before UI implementation. Chunks G and H require distinct delivery and activation authorizations.`;

const RETURN_FIELDS = Object.freeze([
  "starting commit: c7a5d4f8509c2c950276e886bc98bba026e820fa",
  "commit SHA: recorded in the published PR history",
  "PR HEAD: recorded in the published PR history",
  `overall classification: ${buildProductTrainingGoalAuditReport().classification}`,
  `ontology classification: ${buildProductTrainingGoalAuditReport().ontologyClassification}`,
  "production behavior changed: no", "Product behavior changed: no", "shadow rollout changed: no",
  "strength canonical goal result: confirmed", "hypertrophy canonical goal result: confirmed",
  "general-fitness result: canonical; explicit Week/Prescription policy unresolved",
  "conditioning result: canonical; explicit Week/Prescription policy unresolved",
  "posture/movement-quality result: canonical; current main strength fallthrough observed",
  "pain-aware context result: ProgrammingContextMode, not canonical outcome",
  "Product Build-strength option currently present: no", "Product Build-muscle option currently present: no",
  "current Athletic-performance result: under-specified", "current trainingIntent=build meaning: developmental progression",
  "current Prescription strength rules: 3x3-6, RIR 1-3, rest 180-300 seconds; bounded regressions",
  "current Prescription hypertrophy rules: 3x6-20, RIR 1-3, rest 90-180 seconds",
  "current general-fitness Prescription behavior: main_strength fallback",
  "current conditioning Prescription behavior: main_strength fallback",
  "current posture Prescription behavior: main_strength fallback", "compiler fallthrough count: 5 goal/context classes",
  `exercises affected by fallthrough: ${buildProductTrainingGoalAuditReport().affectedExercises.length}`,
  "sections affected: main repetition-set assignments reaching the final branch",
  "current behavior intentional or accidental: overbroad/accidental beyond strength and hypertrophy",
  "strength science summary: heavier loads preferentially support strength; context and equipment bound realization",
  "hypertrophy science summary: broad loads work; sufficient effort and weekly volume matter",
  "rest science summary: short rest is not required for hypertrophy; demanding work may need longer rest",
  "tempo science summary: no single mandatory hypertrophy or strength tempo",
  "effort/failure science summary: high effort matters; momentary failure is not required",
  "toning physiology result: no distinct high-repetition adaptation", "toning Product-language options: T0/T1/T2, none selected",
  "body-composition owner requirement: yes", "nutrition owner requirement: yes",
  "recommended Product goal vocabulary options: V0-V3 presented; owner selection required",
  "recommended engine-goal mapping: direct strength/hypertrophy; other ambiguous labels remain explicit gaps",
  "recommended Prescription-family option: G1-G4 analyzed; none selected", "Candidate change required: no before owner selection",
  "Week change required: yes for newly supported non-strength scopes, after owner selection",
  "Prescription change required: yes after owner selection", "Product Shadow mapping change required: yes after engine policy, default off",
  "Product UI change required: yes only after screenshot review and separate authorization",
  "full-gym strength behavior: heavy loading and fine increments when explicit capabilities permit",
  "dumbbell-limited strength behavior: respect ceiling; use legal progression axes",
  "band strength behavior: require band and anchor truth", "bodyweight strength behavior: progress legal leverage/range/support axes",
  "machine strength behavior: stable loading when exact machine identity and fit are known",
  "beginner behavior: conservative familiarization and calibration", "advanced behavior: specificity only with evidence",
  "pain-aware behavior: non-diagnostic regression under Safety", "unknown prior-load behavior: bounded calibration",
  "main-work behavior: goal/purpose-specific after owner policy", "accessory behavior: role and objective owned",
  "warm-up behavior: dependency owned and unchanged by label alone", "activation behavior: dependency owned",
  "cooldown behavior: recovery owned", "same-exercise/different-dose result: valid and expected",
  "same-dose justified-convergence result: valid", "artificial uniqueness count: 0", "generic strength warm-up count: 0",
  "generic hypertrophy activation count: 0", "high-rep-only toning mutation result: rejected",
  "short-rest-only hypertrophy mutation result: rejected", "equipment-inference mutation result: rejected",
  "downstream-rescue result: rejected", `controlled scenario count: ${PRODUCT_TRAINING_GOAL_SCENARIOS.length}`,
  `CAGT consequence result: ${PRODUCT_TRAINING_GOAL_CAGT_RESULT.result}`, "selected policy: no",
  "production code changes: 0", "public API changes: 0", "upstream fingerprints: preserved",
  `audit fingerprints: ${PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS.combinedAudit}`,
  "tests: deterministic audit, reports, causal mutations, activation guards, and regressions",
  "CI status: resolved at PR publication", "PR status: must remain open, draft, and unmerged",
  "remaining owner decisions: Product vocabulary, ambiguous labels, Prescription family, unsupported goal failure semantics",
  "recommended small-chunk sequence: A through H, separately authorized",
  "blocker before engine policy implementation: owner selects vocabulary and goal-specific Prescription policy",
  "blocker before Product Shadow mapping implementation: engine policy exists and separate shadow authorization",
  "blocker before UI work: owner screenshot and selected vocabulary",
  "blocker before Product activation: shadow evidence plus separate delivery and activation authorization",
  `exact next dependency: ${buildProductTrainingGoalAuditReport().nextDependency}`,
]);

const READINESS = `## Admission

All top-classification conditions are met by audit evidence: current behavior and fallthrough are explicit; primary evidence is bounded; doctrine does not invent toning physiology; equipment, experience, pain-aware, section, Week, Phase, and Longitudinal ownership are recorded; ${PRODUCT_TRAINING_GOAL_SCENARIOS.length} design-only scenarios and causal hard failures are deterministic; production and Product behavior remain unchanged.

No policy is selected. No V2 artifact is activated or delivered. PR #86 must remain open, draft, and unmerged.

## Return ledger

${RETURN_FIELDS.map((entry, index) => `${index + 1}. ${entry}`).join("\n")}`;

const DETAILS: Readonly<Record<typeof PRODUCT_TRAINING_GOAL_REPORT_FILENAMES[number], string>> = Object.freeze({
  "PRODUCT_TRAINING_GOAL_AND_PRESCRIPTION_SPECIFICITY_ONTOLOGY_AUDIT.md": `## Classification\n\n\`${buildProductTrainingGoalAuditReport().ontologyClassification}\`\n\n## Concept ownership and semantics\n\n${ONTOLOGY_CLASSIFICATIONS}\n\n## Explicit answers\n\n${ONTOLOGY_ANSWERS}`,
  "PRODUCT_TRAINING_GOAL_RESISTANCE_TRAINING_EVIDENCE_REVIEW.md": EVIDENCE_REVIEW,
  "PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR_AUDIT.md": CURRENT_BEHAVIOR,
  "PRODUCT_TRAINING_GOAL_PRODUCT_VOCABULARY_OPTIONS.md": VOCABULARY,
  "PRODUCT_TRAINING_GOAL_STRENGTH_DOCTRINE.md": STRENGTH,
  "PRODUCT_TRAINING_GOAL_HYPERTROPHY_DOCTRINE.md": HYPERTROPHY,
  "PRODUCT_TRAINING_GOAL_TONING_LANGUAGE.md": TONING,
  "PRODUCT_TRAINING_GOAL_PRESCRIPTION_FAMILY_OPTIONS.md": POLICY_FAMILIES,
  "PRODUCT_TRAINING_GOAL_COMPILER_FALLTHROUGH_AUDIT.md": FALLTHROUGH,
  "PRODUCT_TRAINING_GOAL_EXERCISE_SELECTION_CONSEQUENCES.md": EXERCISE_SELECTION,
  "PRODUCT_TRAINING_GOAL_EQUIPMENT_CONSEQUENCES.md": EQUIPMENT,
  "PRODUCT_TRAINING_GOAL_EXPERIENCE_PAIN_RETURN.md": EXPERIENCE_PAIN,
  "PRODUCT_TRAINING_GOAL_REST_TEMPO_EFFORT_LOAD.md": REST_TEMPO_EFFORT_LOAD,
  "PRODUCT_TRAINING_GOAL_WARMUP_ACTIVATION.md": WARMUP_ACTIVATION,
  "PRODUCT_TRAINING_GOAL_WEEK_PHASE_LONGITUDINAL_BOUNDARIES.md": WEEK_PHASE_LONGITUDINAL,
  "PRODUCT_TRAINING_GOAL_CAGT_CONSEQUENCE_LAB.md": CAGT,
  "PRODUCT_TRAINING_GOAL_IMPLEMENTATION_SEQUENCE.md": IMPLEMENTATION,
  "PRODUCT_TRAINING_GOAL_ACTIVATION_READINESS.md": READINESS,
});

function title(filename: string): string {
  return filename.replace(/\.md$/, "").split("_").map((word) =>
    word === "CAGT" ? word : word[0] + word.slice(1).toLowerCase()).join(" ");
}

export function buildProductTrainingGoalMarkdownReports(): Readonly<Record<
  typeof PRODUCT_TRAINING_GOAL_REPORT_FILENAMES[number], string>> {
  const report = buildProductTrainingGoalAuditReport();
  return Object.freeze(Object.fromEntries(PRODUCT_TRAINING_GOAL_REPORT_FILENAMES.map((filename) => [filename,
    `# ${title(filename)}\n\n` +
    `Status: \`AUDIT_ONLY_NO_BEHAVIOR_CHANGE\`\n\n` +
    `Classification: \`${report.classification}\`\n\n` +
    `Selected policy: \`NO\`\n\n` +
    `Production/Product/shadow rollout changed: \`NO/NO/NO\`\n\n` +
    `${DETAILS[filename]}\n\n` +
    `Audit fingerprint: \`${report.auditFingerprints.combinedAudit}\`.\n\n` +
    `Next dependency: \`${report.nextDependency}\`.\n`,
  ]))) as Readonly<Record<typeof PRODUCT_TRAINING_GOAL_REPORT_FILENAMES[number], string>>;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function buildProductTrainingGoalJsonReports(): Readonly<Record<
  typeof PRODUCT_TRAINING_GOAL_JSON_FILENAMES[number], string>> {
  const report = buildProductTrainingGoalAuditReport();
  return Object.freeze({
    "PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR_MATRIX.json": json(PRODUCT_TRAINING_GOAL_CURRENT_BEHAVIOR),
    "PRODUCT_TRAINING_GOAL_MAPPING_MATRIX.json": json(PRODUCT_TRAINING_GOAL_MAPPING_MATRIX),
    "PRODUCT_TRAINING_GOAL_POLICY_CONSEQUENCE_MATRIX.json": json(PRODUCT_TRAINING_GOAL_POLICY_CONSEQUENCES),
    "PRODUCT_TRAINING_GOAL_SCENARIO_RESULTS.json": json(PRODUCT_TRAINING_GOAL_SCENARIOS),
    "PRODUCT_TRAINING_GOAL_CAGT_RESULTS.json": json({ result: PRODUCT_TRAINING_GOAL_CAGT_RESULT,
      mutations: PRODUCT_TRAINING_GOAL_CAGT_MUTATIONS }),
    "PRODUCT_TRAINING_GOAL_FINGERPRINTS.json": json({ upstream: PRODUCT_TRAINING_GOAL_UPSTREAM_FINGERPRINTS,
      audit: report.auditFingerprints }),
  });
}

export function productTrainingGoalDocumentationMarker(): string {
  const report = buildProductTrainingGoalAuditReport();
  return `<!-- PRODUCT_TRAINING_GOAL_SPECIFICITY_V1:START -->
## Product Training Goal and Prescription Specificity V1 Audit

- Classification: \`${report.classification}\`.
- Ontology: \`${report.ontologyClassification}\`.
- Evidence: ${report.scenarios.length} design-only scenarios; ${report.mutations.length} required hard-failure mutations rejected.
- Current finding: non-hypertrophy main repetition-set values fall through to \`main_strength\`; ${report.affectedExercises.length} canonical primary-main exercises are directly exposed to that branch.
- Boundary: no policy selected; zero production code, Product behavior, shadow rollout, activation, migration, or public API changes.
- Sequence: owner-gated chunks A-H; every implementation and activation chunk remains separately authorized.
- Remaining dependency: \`${report.nextDependency}\`.
<!-- PRODUCT_TRAINING_GOAL_SPECIFICITY_V1:END -->`;
}
