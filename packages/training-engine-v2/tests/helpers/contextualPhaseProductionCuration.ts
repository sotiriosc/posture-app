import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY,
  type PhaseId,
  type SessionSection,
  type TrainingRole,
} from "../../src";
import {
  buildPhaseAnnotationContextReviewData,
  type PhaseAnnotationOwnershipAuditRow,
} from "./phaseAnnotationContextReview";
import {
  CURATED_TRUNK_CARRY_EXERCISES,
  type CuratedTrunkCarryId,
} from "./sevenExerciseTrunkCarryCuration";

export const CONTEXTUAL_PHASE_PRODUCTION_CURATION_CLASSIFICATION =
  "OWNER_POLICY_SELECTED_ANNOTATIONS_PENDING_FINAL_APPROVAL";

export type PhaseCurationDecision =
  | "PROPOSE_ACCEPT"
  | "KEEP_NEEDS_REVIEW"
  | "KEEP_UNKNOWN"
  | "REJECT_AS_WRONG_OWNER";

export interface ContextualPhaseCurationRow {
  readonly exerciseId: string;
  readonly phaseId: PhaseId;
  readonly scope: string;
  readonly trainingRoles: readonly TrainingRole[];
  readonly sessionSections: readonly SessionSection[];
  readonly suitability: "poor" | "possible" | "good" | "excellent";
  readonly decision: PhaseCurationDecision;
  readonly independentPhaseRationale: string;
  readonly evidenceBasis: readonly string[];
  readonly notGoalFit: string;
  readonly notLoadability: string;
  readonly notSkillOrStability: string;
  readonly notProgressionRunway: string;
  readonly notContinuity: string;
  readonly ownerDecisionConsequence: string;
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function scopeLabel(row: PhaseAnnotationOwnershipAuditRow): string {
  const roles = row.proposedScope.trainingRoles?.join(",") ?? "all_legal_roles";
  const sections = row.proposedScope.sessionSections?.join(",") ?? "all_legal_sections";
  return `${roles} @ ${sections}`;
}

function currentDecision(row: PhaseAnnotationOwnershipAuditRow): PhaseCurationDecision {
  if (row.reviewStatus === "needs_review") return "PROPOSE_ACCEPT";
  if (row.evidenceOwnerClassification === "SECTION_SPECIFIC") {
    return "KEEP_NEEDS_REVIEW";
  }
  if (
    row.evidenceOwnerClassification === "AMBIGUOUS" ||
    row.evidenceOwnerClassification === "ARBITRARY_OR_UNDERSPECIFIED"
  ) {
    return "KEEP_UNKNOWN";
  }
  return "REJECT_AS_WRONG_OWNER";
}

function currentRow(row: PhaseAnnotationOwnershipAuditRow): ContextualPhaseCurationRow {
  const decision = currentDecision(row);
  return {
    exerciseId: row.exerciseId,
    phaseId: row.phaseId,
    scope: scopeLabel(row),
    trainingRoles: row.proposedScope.trainingRoles ?? row.trainingRoles,
    sessionSections: row.proposedScope.sessionSections ?? row.sessionSections,
    suitability: row.currentSuitability,
    decision,
    independentPhaseRationale: row.auditFinding,
    evidenceBasis: [
      `Existing catalog annotation: ${row.currentReason}`,
      `Context ownership audit: ${row.auditFinding}`,
      "This remains a curation proposal until explicit owner approval supplies accepted provenance.",
    ],
    notGoalFit:
      "The proposal is limited to developmental phase use in the stated role/section; the enduring CandidateRequest.goal remains independent.",
    notLoadability:
      "No suitability value is justified solely by the exercise loading ceiling or resistance magnitude.",
    notSkillOrStability:
      "Dedicated skill and stability components retain mechanical demand ownership; phase evidence must describe developmental use beyond those facts.",
    notProgressionRunway:
      "Same-exercise progression axes remain owned by progression evidence and are not counted as a phase vote.",
    notContinuity:
      "Productive continuity remains independently owned and cannot be reread as phase suitability.",
    ownerDecisionConsequence:
      decision === "PROPOSE_ACCEPT"
        ? "Approval may create an accepted contextual annotation with owner provenance; rejection omits phase evidence for this context."
        : decision === "REJECT_AS_WRONG_OWNER"
          ? "Remove the legacy phase claim when contextual policy activates and leave the fact with its dedicated owner."
          : "Keep the annotation non-scoring until an owner supplies a narrower truthful judgment or confirms unknown.",
  };
}

interface SevenProposal {
  readonly exerciseId: CuratedTrunkCarryId;
  readonly phaseId: PhaseId;
  readonly role: TrainingRole;
  readonly section: SessionSection;
  readonly suitability: ContextualPhaseCurationRow["suitability"];
  readonly decision: PhaseCurationDecision;
  readonly rationale: string;
}

const SEVEN_PHASE_PROPOSALS: readonly SevenProposal[] = [
  { exerciseId: "forearm-plank", phaseId: "phase_1", role: "activation", section: "activation", suitability: "good", decision: "PROPOSE_ACCEPT", rationale: "A bounded activation exposure can directly serve Phase 1 position and repeatable-control development." },
  { exerciseId: "forearm-plank", phaseId: "phase_2", role: "hypertrophy_accessory", section: "accessory", suitability: "possible", decision: "KEEP_NEEDS_REVIEW", rationale: "Accessory use may support Phase 2 trunk capacity, but independent phase value needs review." },
  { exerciseId: "forearm-plank", phaseId: "phase_3", role: "hypertrophy_accessory", section: "accessory", suitability: "possible", decision: "KEEP_UNKNOWN", rationale: "No independent Phase 3 reason is established beyond accessory allocation and progression." },
  { exerciseId: "forearm-side-plank", phaseId: "phase_1", role: "activation", section: "activation", suitability: "good", decision: "PROPOSE_ACCEPT", rationale: "Scoped activation can serve Phase 1 position and lateral-control development without implying universal suitability." },
  { exerciseId: "forearm-side-plank", phaseId: "phase_2", role: "hypertrophy_accessory", section: "accessory", suitability: "possible", decision: "KEEP_NEEDS_REVIEW", rationale: "Phase 2 accessory capacity is plausible but must not duplicate progression or stability scoring." },
  { exerciseId: "forearm-side-plank", phaseId: "phase_3", role: "hypertrophy_accessory", section: "accessory", suitability: "possible", decision: "KEEP_UNKNOWN", rationale: "No independent Phase 3 developmental judgment is yet supported." },
  { exerciseId: "machine-abdominal-crunch", phaseId: "phase_1", role: "secondary_strength", section: "accessory", suitability: "possible", decision: "KEEP_UNKNOWN", rationale: "Machine guidance and skill are wrong owners for a Phase 1 vote." },
  { exerciseId: "machine-abdominal-crunch", phaseId: "phase_2", role: "secondary_strength", section: "accessory", suitability: "possible", decision: "KEEP_NEEDS_REVIEW", rationale: "Controlled loaded flexion may have a Phase 2 developmental use, pending owner exercise-science review." },
  { exerciseId: "machine-abdominal-crunch", phaseId: "phase_3", role: "hypertrophy_accessory", section: "accessory", suitability: "good", decision: "REJECT_AS_WRONG_OWNER", rationale: "Hypertrophy utility is enduring goal and weekly-allocation evidence, not Phase 3 evidence." },
  { exerciseId: "half-kneeling-high-to-low-cable-chop", phaseId: "phase_1", role: "activation", section: "activation", suitability: "possible", decision: "KEEP_NEEDS_REVIEW", rationale: "Phase 1 rotational-control activation may be appropriate only with reviewed range and prescription context." },
  { exerciseId: "half-kneeling-high-to-low-cable-chop", phaseId: "phase_2", role: "secondary_strength", section: "accessory", suitability: "good", decision: "PROPOSE_ACCEPT", rationale: "Scoped secondary-strength use directly serves Phase 2 capacity development through controlled loaded rotation." },
  { exerciseId: "half-kneeling-high-to-low-cable-chop", phaseId: "phase_3", role: "hypertrophy_accessory", section: "accessory", suitability: "possible", decision: "KEEP_UNKNOWN", rationale: "No independent Phase 3 value is established beyond load and accessory allocation." },
  { exerciseId: "farmer-carry", phaseId: "phase_1", role: "capacity", section: "accessory", suitability: "possible", decision: "KEEP_NEEDS_REVIEW", rationale: "Early capacity exposure may be appropriate, but loading and gait skill cannot become hidden phase bonuses." },
  { exerciseId: "farmer-carry", phaseId: "phase_2", role: "capacity", section: "main", suitability: "good", decision: "PROPOSE_ACCEPT", rationale: "A capacity-role main exposure directly serves Phase 2 training consistency and recoverable loaded capacity." },
  { exerciseId: "farmer-carry", phaseId: "phase_3", role: "capacity", section: "accessory", suitability: "possible", decision: "KEEP_UNKNOWN", rationale: "Phase 3 carry use depends on weekly purpose rather than phase identity alone." },
  { exerciseId: "suitcase-carry", phaseId: "phase_1", role: "capacity", section: "accessory", suitability: "possible", decision: "KEEP_NEEDS_REVIEW", rationale: "Early asymmetric carry exposure needs reviewed prescription context and cannot be inferred from nominal difficulty." },
  { exerciseId: "suitcase-carry", phaseId: "phase_2", role: "capacity", section: "main", suitability: "good", decision: "PROPOSE_ACCEPT", rationale: "A capacity-role main exposure can directly serve Phase 2 loaded gait and trunk-capacity development." },
  { exerciseId: "suitcase-carry", phaseId: "phase_3", role: "capacity", section: "accessory", suitability: "possible", decision: "KEEP_UNKNOWN", rationale: "No independent Phase 3 preference is established beyond weekly capacity intent." },
  { exerciseId: "wall-supported-suitcase-march", phaseId: "phase_1", role: "activation", section: "activation", suitability: "good", decision: "PROPOSE_ACCEPT", rationale: "Supported stationary activation can directly serve Phase 1 position and controlled load-transfer development." },
  { exerciseId: "wall-supported-suitcase-march", phaseId: "phase_2", role: "capacity", section: "accessory", suitability: "possible", decision: "KEEP_NEEDS_REVIEW", rationale: "Capacity use is plausible, but support-force and load-transfer uncertainty remain." },
  { exerciseId: "wall-supported-suitcase-march", phaseId: "phase_3", role: "capacity", section: "accessory", suitability: "poor", decision: "KEEP_UNKNOWN", rationale: "A poor Phase 3 vote is not justified while capacity purpose and support realization remain contextual." },
];

function sevenRow(proposal: SevenProposal): ContextualPhaseCurationRow {
  const exercise = CURATED_TRUNK_CARRY_EXERCISES.find(
    (candidate) => candidate.id === proposal.exerciseId,
  );
  if (!exercise) throw new Error(`Missing seven-row curation ${proposal.exerciseId}.`);
  return {
    exerciseId: proposal.exerciseId,
    phaseId: proposal.phaseId,
    scope: `${proposal.role} @ ${proposal.section}`,
    trainingRoles: [proposal.role],
    sessionSections: [proposal.section],
    suitability: proposal.suitability,
    decision: proposal.decision,
    independentPhaseRationale: proposal.rationale,
    evidenceBasis: [
      proposal.rationale,
      `Curated identity boundary: ${exercise.identity.exactIdentity}`,
      "Proposal remains non-production until explicit owner approval and accepted provenance.",
    ],
    notGoalFit: "The proposal is scoped to developmental role/section use and does not replace the enduring goal.",
    notLoadability: "Load remains prescription and loadability evidence rather than a hidden phase bonus.",
    notSkillOrStability: "Skill, coordination, support and stability retain their dedicated owners.",
    notProgressionRunway: "Progression axes remain same-exercise evidence and do not establish phase fit.",
    notContinuity: "Continuity remains independent and may retain the exercise across phases.",
    ownerDecisionConsequence:
      proposal.decision === "PROPOSE_ACCEPT"
        ? "Approval creates a scoped accepted annotation; rejection leaves no phase component."
        : proposal.decision === "REJECT_AS_WRONG_OWNER"
          ? "Do not create a contextual annotation for this rationale."
          : "Retain as non-scoring review or unknown evidence.",
  };
}

export const PHASE_OWNER_QUESTIONS = [
  "Approve, narrow, or reject each of the 16 current PROPOSE_ACCEPT annotations?",
  "Should the five section-specific legacy claims remain needs-review, or be removed until independent evidence exists?",
  "Do any of the six ambiguous or underspecified claims have evidence strong enough to become scoped proposals?",
  "Approve, narrow, or reject the seven-row Phase 1 activation and Phase 2 capacity proposals?",
  "What reviewer identity, review date, and source reference should become accepted provenance after decisions?",
] as const;

export interface ContextualPhaseProductionCurationData {
  readonly classification: typeof CONTEXTUAL_PHASE_PRODUCTION_CURATION_CLASSIFICATION;
  readonly selectedPolicy: typeof CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY;
  readonly productionActivated: false;
  readonly currentRows: readonly ContextualPhaseCurationRow[];
  readonly sevenRows: readonly ContextualPhaseCurationRow[];
  readonly currentCounts: Readonly<Record<PhaseCurationDecision, number>>;
  readonly ownerQuestions: typeof PHASE_OWNER_QUESTIONS;
  readonly fingerprint: string;
}

function counts(rows: readonly ContextualPhaseCurationRow[]): Readonly<Record<PhaseCurationDecision, number>> {
  return {
    PROPOSE_ACCEPT: rows.filter((row) => row.decision === "PROPOSE_ACCEPT").length,
    KEEP_NEEDS_REVIEW: rows.filter((row) => row.decision === "KEEP_NEEDS_REVIEW").length,
    KEEP_UNKNOWN: rows.filter((row) => row.decision === "KEEP_UNKNOWN").length,
    REJECT_AS_WRONG_OWNER: rows.filter((row) => row.decision === "REJECT_AS_WRONG_OWNER").length,
  };
}

export function buildContextualPhaseProductionCurationData(): ContextualPhaseProductionCurationData {
  const audit = buildPhaseAnnotationContextReviewData();
  const currentRows = audit.ownershipAudit.map(currentRow);
  const sevenRows = SEVEN_PHASE_PROPOSALS.map(sevenRow);
  const payload = {
    classification: CONTEXTUAL_PHASE_PRODUCTION_CURATION_CLASSIFICATION as typeof CONTEXTUAL_PHASE_PRODUCTION_CURATION_CLASSIFICATION,
    selectedPolicy: CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY,
    productionActivated: false as const,
    currentRows,
    sevenRows,
    currentCounts: counts(currentRows),
    ownerQuestions: PHASE_OWNER_QUESTIONS,
  };
  return { ...payload, fingerprint: hash(payload) };
}

function cell(value: unknown): string {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return [
    `| ${headers.map(cell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

export function renderContextualPhaseProductionCuration(
  data: ContextualPhaseProductionCurationData,
): string {
  const proposals = data.currentRows.filter((row) => row.decision === "PROPOSE_ACCEPT");
  return [
    "# Contextual Phase Production Curation",
    "",
    `Classification: **${data.classification}**.`,
    "",
    `Selected owner policy: \`${data.selectedPolicy.policyId}\`. Category values are excellent ${data.selectedPolicy.categoryValues.excellent}, good ${data.selectedPolicy.categoryValues.good}, possible ${data.selectedPolicy.categoryValues.possible}, poor ${data.selectedPolicy.categoryValues.poor}; phase-family weight ${data.selectedPolicy.phaseFamilyWeight}.`,
    "",
    "The policy is not active in production. Proposed annotations are not accepted annotations. Unknown, needs-review, no-match and conflict omit the component and its denominator weight; accepted poor remains a bounded 5.5 preference. The contextual scorer adds no skill/stability or loadability bonus and creates no replacement effect.",
    "",
    `Fingerprint: \`${data.fingerprint}\`.`,
    "",
    "## Current Production Annotation Decisions",
    "",
    `Counts: PROPOSE_ACCEPT=${data.currentCounts.PROPOSE_ACCEPT}; KEEP_NEEDS_REVIEW=${data.currentCounts.KEEP_NEEDS_REVIEW}; KEEP_UNKNOWN=${data.currentCounts.KEEP_UNKNOWN}; REJECT_AS_WRONG_OWNER=${data.currentCounts.REJECT_AS_WRONG_OWNER}.`,
    "",
    table(
      ["Exercise", "Phase", "Scope", "Current category", "Decision", "Independent rationale", "Owner consequence"],
      data.currentRows.map((row) => [row.exerciseId, row.phaseId, row.scope, row.suitability, row.decision, row.independentPhaseRationale, row.ownerDecisionConsequence]),
    ),
    "",
    "## Proposed-Accept Evidence Detail",
    "",
    table(
      ["Exercise/phase", "Exact role/section", "Suitability", "Evidence basis", "Not goal", "Not loadability", "Not skill/stability", "Not runway", "Not continuity"],
      proposals.map((row) => [
        `${row.exerciseId}/${row.phaseId}`,
        row.scope,
        row.suitability,
        row.evidenceBasis.join("; "),
        row.notGoalFit,
        row.notLoadability,
        row.notSkillOrStability,
        row.notProgressionRunway,
        row.notContinuity,
      ]),
    ),
    "",
    "## Seven Proposed Exercises",
    "",
    "These are annotation proposals only. No exercise is added to the production catalog.",
    "",
    table(
      ["Exercise", "Phase", "Exact role/section", "Suitability", "Decision", "Independent rationale", "Owner consequence"],
      data.sevenRows.map((row) => [row.exerciseId, row.phaseId, row.scope, row.suitability, row.decision, row.independentPhaseRationale, row.ownerDecisionConsequence]),
    ),
    "",
    "## Exact Owner Questions",
    "",
    data.ownerQuestions.map((question) => `- ${question}`).join("\n"),
    "",
  ].join("\n");
}

if (process.argv[1]?.endsWith("contextualPhaseProductionCuration.ts")) {
  const outputPath = join(
    process.cwd(),
    "../../docs/training-engine-v2/CONTEXTUAL_PHASE_PRODUCTION_CURATION.md",
  );
  writeFileSync(
    outputPath,
    renderContextualPhaseProductionCuration(
      buildContextualPhaseProductionCurationData(),
    ),
  );
}
