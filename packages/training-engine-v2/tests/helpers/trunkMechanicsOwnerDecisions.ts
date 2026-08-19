import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type {
  TrunkFunctionLevel,
  TrunkMechanicsFunction,
} from "../../src";

export const TRUNK_MECHANICS_OWNER_DECISION_ID =
  "TRUNK-MECHANICS-FIRST-TRANCHE-2026-08-11";
export const TRUNK_MECHANICS_OWNER_DECISION_DATE = "2026-08-11";
export const TRUNK_MECHANICS_OWNER_DECISION_REF =
  "docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md#approved-first-tranche";
export const APPROVED_TRUNK_PROFILE_EXERCISE_IDS = [
  "ninety-ninety-breathing",
  "dead-bug",
  "pallof-press",
] as const;

export type ApprovedTrunkProfileExerciseId =
  (typeof APPROVED_TRUNK_PROFILE_EXERCISE_IDS)[number];

export interface ApprovedTrunkFunctionDecision {
  readonly exerciseId: ApprovedTrunkProfileExerciseId;
  readonly function: TrunkMechanicsFunction;
  readonly level: Exclude<TrunkFunctionLevel, "unknown">;
  readonly evidenceBasis: readonly string[];
}

export interface UnknownTrunkFunctionDecision {
  readonly exerciseId: ApprovedTrunkProfileExerciseId;
  readonly function: TrunkMechanicsFunction;
  readonly reason: string;
}

export interface DeferredTrunkFunctionDecision {
  readonly exerciseId: string;
  readonly function: TrunkMechanicsFunction;
  readonly level: Exclude<TrunkFunctionLevel, "unknown">;
  readonly disposition: "APPROVED_BUT_DEFERRED";
}

export interface UnresolvedTrunkFunctionProposal {
  readonly exerciseId: string;
  readonly function: TrunkMechanicsFunction;
  readonly proposedLevel: Exclude<TrunkFunctionLevel, "unknown">;
  readonly disposition: "REMAINS_NEEDS_REVIEW";
}

export const APPROVED_FIRST_TRANCHE_DECISIONS: readonly ApprovedTrunkFunctionDecision[] = [
  {
    exerciseId: "ninety-ninety-breathing",
    function: "breathingPressureCoordination",
    level: "high",
    evidenceBasis: [
      "movementRoles includes breathing_position.",
      "primaryMuscles includes trunk.",
      "trainingRoles include preparation and recovery.",
      "mechanics.support is accepted floor/supine.",
      "mechanics.demands.trunk_control is accepted low.",
      "Project-owner review approves breathing/pressure coordination as the central function expression.",
    ],
  },
  {
    exerciseId: "ninety-ninety-breathing",
    function: "antiExtensionContribution",
    level: "low",
    evidenceBasis: [
      "movementRoles includes anti_extension_core.",
      "Floor-supported supine mechanics and low loading establish a low-load position-control context.",
      "mechanics.demands.trunk_control is accepted low.",
      "Project-owner review approves low anti-extension expression.",
    ],
  },
  {
    exerciseId: "ninety-ninety-breathing",
    function: "loadedBracingContribution",
    level: "none",
    evidenceBasis: [
      "No external load is modeled for the exercise.",
      "mechanics.support is accepted floor/supine.",
      "loading.loadability is none.",
      "Project-owner review applies the loaded-bracing definition that requires meaningful trunk-position maintenance under external load.",
    ],
  },
  {
    exerciseId: "ninety-ninety-breathing",
    function: "gaitLoadTransferContribution",
    level: "none",
    evidenceBasis: [
      "mechanics.support is accepted floor/supine.",
      "The exercise has no stepping, marching, carrying, or locomotor movement role.",
      "Project-owner review confirms no meaningful gait or load-transfer expression.",
    ],
  },
  {
    exerciseId: "dead-bug",
    function: "antiExtensionContribution",
    level: "high",
    evidenceBasis: [
      "movementRoles includes anti_extension_core.",
      "primaryMuscles includes trunk.",
      "mechanics.demands.trunk_control is accepted moderate.",
      "family is core_control.",
      "Project-owner review approves anti-extension as the central function expression.",
    ],
  },
  {
    exerciseId: "dead-bug",
    function: "loadedBracingContribution",
    level: "none",
    evidenceBasis: [
      "No external loading is modeled for the exercise.",
      "mechanics.support is accepted floor/supine.",
      "Project-owner review applies the loaded-bracing definition that requires meaningful trunk-position maintenance under external load.",
    ],
  },
  {
    exerciseId: "dead-bug",
    function: "gaitLoadTransferContribution",
    level: "none",
    evidenceBasis: [
      "mechanics.support is accepted floor/supine.",
      "The exercise has no gait, stepping, marching, carrying, or locomotor purpose.",
      "Project-owner review confirms that contralateral supine limb motion is not gait/load-transfer expression.",
    ],
  },
  {
    exerciseId: "pallof-press",
    function: "antiRotationContribution",
    level: "high",
    evidenceBasis: [
      "movementRoles includes anti_rotation_core.",
      "primaryMuscles includes trunk.",
      "mechanics.demands.trunk_control is accepted high.",
      "Project-owner review approves anti-rotation as the central function expression.",
    ],
  },
  {
    exerciseId: "pallof-press",
    function: "controlledRotationContribution",
    level: "none",
    evidenceBasis: [
      "The explicit movement purpose is resisting rotation through anti_rotation_core.",
      "movementRoles does not include trunk_rotation.",
      "Project-owner review keeps anti-rotation and intentional controlled rotation as separate concepts.",
    ],
  },
  {
    exerciseId: "pallof-press",
    function: "gaitLoadTransferContribution",
    level: "none",
    evidenceBasis: [
      "The current exercise has no stepping, marching, carrying, or locomotor purpose.",
      "Standing support alone is not gait/load-transfer evidence.",
      "Project-owner review confirms no meaningful gait or load-transfer expression.",
    ],
  },
];

export const FIRST_TRANCHE_UNKNOWN_FIELDS: readonly UnknownTrunkFunctionDecision[] = [
  {
    exerciseId: "ninety-ninety-breathing",
    function: "antiRotationContribution",
    reason: "No approved evidence classifies anti-rotation expression for the supine breathing and position drill.",
  },
  {
    exerciseId: "ninety-ninety-breathing",
    function: "antiLateralFlexionContribution",
    reason: "No approved evidence classifies anti-lateral-flexion expression for the floor-supported breathing drill.",
  },
  {
    exerciseId: "ninety-ninety-breathing",
    function: "controlledFlexionContribution",
    reason: "No approved evidence classifies intentional controlled trunk flexion.",
  },
  {
    exerciseId: "ninety-ninety-breathing",
    function: "controlledRotationContribution",
    reason: "No approved evidence classifies intentional controlled trunk rotation.",
  },
  {
    exerciseId: "dead-bug",
    function: "breathingPressureCoordination",
    reason: "The proposed moderate value remains unapproved pending a separate genuine review.",
  },
  {
    exerciseId: "dead-bug",
    function: "antiRotationContribution",
    reason: "Contralateral limb coordination is not approved as anti-rotation evidence.",
  },
  {
    exerciseId: "dead-bug",
    function: "antiLateralFlexionContribution",
    reason: "No approved evidence isolates anti-lateral-flexion expression in the supine task.",
  },
  {
    exerciseId: "dead-bug",
    function: "controlledFlexionContribution",
    reason: "Anti-extension purpose establishes neither controlled flexion nor reviewed absence.",
  },
  {
    exerciseId: "dead-bug",
    function: "controlledRotationContribution",
    reason: "No approved evidence classifies intentional controlled trunk rotation.",
  },
  {
    exerciseId: "pallof-press",
    function: "breathingPressureCoordination",
    reason: "No approved evidence classifies breathing or pressure-coordination expression.",
  },
  {
    exerciseId: "pallof-press",
    function: "antiExtensionContribution",
    reason: "No approved evidence isolates anti-extension expression from anti-rotation purpose.",
  },
  {
    exerciseId: "pallof-press",
    function: "antiLateralFlexionContribution",
    reason: "The proposed low value remains unapproved.",
  },
  {
    exerciseId: "pallof-press",
    function: "controlledFlexionContribution",
    reason: "No approved evidence classifies intentional controlled trunk flexion.",
  },
  {
    exerciseId: "pallof-press",
    function: "loadedBracingContribution",
    reason: "The proposed moderate value remains unapproved and unseparated from anti-rotation expression.",
  },
];

export const DEFERRED_ACCEPTED_TRUNK_DECISIONS: readonly DeferredTrunkFunctionDecision[] = [
  {
    exerciseId: "push-up",
    function: "antiExtensionContribution",
    level: "moderate",
    disposition: "APPROVED_BUT_DEFERRED",
  },
  {
    exerciseId: "push-up",
    function: "gaitLoadTransferContribution",
    level: "none",
    disposition: "APPROVED_BUT_DEFERRED",
  },
  {
    exerciseId: "chest-supported-dumbbell-row",
    function: "loadedBracingContribution",
    level: "low",
    disposition: "APPROVED_BUT_DEFERRED",
  },
  {
    exerciseId: "chest-supported-dumbbell-row",
    function: "gaitLoadTransferContribution",
    level: "none",
    disposition: "APPROVED_BUT_DEFERRED",
  },
  {
    exerciseId: "seated-cable-row",
    function: "gaitLoadTransferContribution",
    level: "none",
    disposition: "APPROVED_BUT_DEFERRED",
  },
];

export const UNRESOLVED_NEEDS_REVIEW_PROPOSALS: readonly UnresolvedTrunkFunctionProposal[] = [
  { exerciseId: "dead-bug", function: "breathingPressureCoordination", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "pallof-press", function: "antiLateralFlexionContribution", proposedLevel: "low", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "pallof-press", function: "loadedBracingContribution", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "push-up", function: "loadedBracingContribution", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "one-arm-dumbbell-row", function: "antiRotationContribution", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "one-arm-dumbbell-row", function: "antiLateralFlexionContribution", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "one-arm-dumbbell-row", function: "loadedBracingContribution", proposedLevel: "high", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "goblet-squat", function: "breathingPressureCoordination", proposedLevel: "low", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "goblet-squat", function: "loadedBracingContribution", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "dumbbell-romanian-deadlift", function: "loadedBracingContribution", proposedLevel: "high", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "cable-pull-through", function: "loadedBracingContribution", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "split-squat", function: "antiRotationContribution", proposedLevel: "low", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "split-squat", function: "antiLateralFlexionContribution", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "step-up", function: "antiRotationContribution", proposedLevel: "low", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "step-up", function: "antiLateralFlexionContribution", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "step-up", function: "gaitLoadTransferContribution", proposedLevel: "moderate", disposition: "REMAINS_NEEDS_REVIEW" },
  { exerciseId: "seated-cable-row", function: "loadedBracingContribution", proposedLevel: "low", disposition: "REMAINS_NEEDS_REVIEW" },
];

function markdownCell(value: string | number): string {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(
  headers: readonly string[],
  rows: readonly (readonly (string | number)[])[],
): string {
  return [
    `| ${headers.map(markdownCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`),
  ].join("\n");
}

export function renderTrunkMechanicsOwnerDecisions(): string {
  return [
    "# Approved First Tranche",
    "",
    "This is the project-owner review artifact for the first production TrunkMechanicsProfile tranche. It records a bounded exercise-science judgment, not a general changelog.",
    "",
    "## Decision Record",
    "",
    `- Decision ID: \`${TRUNK_MECHANICS_OWNER_DECISION_ID}\``,
    `- Date: \`${TRUNK_MECHANICS_OWNER_DECISION_DATE}\``,
    "- Context: project-owner acceptance of the representative trunk-mechanics curation proposal at Candidate Intelligence checkpoint `1dfb4713c4a1bd399574eda4cb4da0dbf31ae8fa`.",
    `- Stable provenance reference: \`${TRUNK_MECHANICS_OWNER_DECISION_REF}\``,
    "- Production authorization: exactly 90/90 Breathing, Dead Bug, and Pallof Press.",
    "",
    "## Owner Doctrine",
    "",
    "- These are function-expression judgments during exercise execution; they do not grant movement roles or selection-purpose legality.",
    "- They do not establish dosage, prescription, progression, direct weekly credit, or exposure-ledger accounting.",
    "- They do not change Candidate Intelligence eligibility, scoring, totals, ranking, pain, phase, assessment, or transitions.",
    "- `unknown` remains unavailable or unapproved evidence. It is not none, low, negative evidence, easy, safe, or poor fit.",
    "- No `PROPOSE_NEEDS_REVIEW` value is promoted by this decision.",
    "- The owner artifact is the review authority; production metadata cites this artifact plus the pre-existing structured facts supporting each field.",
    "",
    "## Accepted Function Decisions",
    "",
    table(
      ["Exercise", "Function", "Approved level", "Evidence basis"],
      APPROVED_FIRST_TRANCHE_DECISIONS.map((decision) => [
        decision.exerciseId,
        decision.function,
        decision.level,
        decision.evidenceBasis.join(" "),
      ]),
    ),
    "",
    `Accepted production fields: ${APPROVED_FIRST_TRANCHE_DECISIONS.length}. Every field is \`accepted\`, uses \`human_exercise_science_review\`, cites this artifact, and carries nonempty structured evidence basis.`,
    "",
    "## Remaining Explicit Unknown Fields",
    "",
    table(
      ["Exercise", "Function", "Reason it remains unknown"],
      FIRST_TRANCHE_UNKNOWN_FIELDS.map((decision) => [
        decision.exerciseId,
        decision.function,
        decision.reason,
      ]),
    ),
    "",
    `Unknown production fields: ${FIRST_TRANCHE_UNKNOWN_FIELDS.length}. Each remains \`needs_review\` with \`source=unknown\` and empty provenance.`,
    "",
    "## Approved But Deferred",
    "",
    "These five field judgments are accepted as defensible conclusions but are not authorized as production profiles in this tranche:",
    "",
    table(
      ["Exercise", "Function", "Approved level", "Disposition"],
      DEFERRED_ACCEPTED_TRUNK_DECISIONS.map((decision) => [
        decision.exerciseId,
        decision.function,
        decision.level,
        decision.disposition,
      ]),
    ),
    "",
    "No partial profile is authorized for Push-Up, Chest-Supported Dumbbell Row, or Seated Cable Row.",
    "",
    "## Unresolved Needs-Review Proposals",
    "",
    "These qualified proposal values are not accepted production facts and remain unresolved:",
    "",
    table(
      ["Exercise", "Function", "Proposed level", "Disposition"],
      UNRESOLVED_NEEDS_REVIEW_PROPOSALS.map((proposal) => [
        proposal.exerciseId,
        proposal.function,
        proposal.proposedLevel,
        proposal.disposition,
      ]),
    ),
    "",
    "In particular, Dead Bug breathing/pressure coordination remains unknown rather than moderate; Pallof Press anti-lateral-flexion and loaded-bracing contributions remain unknown rather than low and moderate. Contralateral motion is not promoted to anti-rotation evidence.",
    "",
    "## Explicit Rejections And Deferrals",
    "",
    "No field-level conclusion is newly rejected as biomechanically impossible. The five accepted secondary/support judgments are deferred from implementation, all 17 qualified proposals remain unapproved, and every other insufficient-evidence proposal remains unknown. Production authorization outside the exact three-exercise tranche is rejected for this increment.",
    "",
    "## Non-Scoring Boundary",
    "",
    "`TrunkMechanicsProfile` remains a validation and observability contract only. The accepted 22-scenario ranking fingerprint remains `d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782`; the comprehensive totals/components/rejections/pain/phase/assessment fingerprint remains `216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9`. No scoring consumer is authorized.",
    "",
    "## Implementation Authorization",
    "",
    "Implement complete eight-field profiles only for `ninety-ninety-breathing`, `dead-bug`, and `pallof-press`, containing the ten accepted decisions and fourteen explicit unknowns above. Do not change their movement roles or any other catalog field.",
    "",
  ].join("\n");
}

export function writeTrunkMechanicsOwnerDecisions(rootDir = process.cwd()): string {
  const outputPath = join(
    rootDir,
    "docs/training-engine-v2/TRUNK_MECHANICS_OWNER_DECISIONS.md",
  );
  writeFileSync(outputPath, renderTrunkMechanicsOwnerDecisions());
  return outputPath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outputPath = writeTrunkMechanicsOwnerDecisions();
  console.log(`Wrote ${outputPath}`);
  console.log(
    JSON.stringify(
      {
        decisionId: TRUNK_MECHANICS_OWNER_DECISION_ID,
        approvedExercises: APPROVED_TRUNK_PROFILE_EXERCISE_IDS.length,
        acceptedFields: APPROVED_FIRST_TRANCHE_DECISIONS.length,
        unknownFields: FIRST_TRANCHE_UNKNOWN_FIELDS.length,
        deferredAcceptedFields: DEFERRED_ACCEPTED_TRUNK_DECISIONS.length,
        unresolvedNeedsReviewFields: UNRESOLVED_NEEDS_REVIEW_PROPOSALS.length,
      },
      null,
      2,
    ),
  );
}
