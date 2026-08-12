import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  REFERENCE_EXERCISES,
  TRUNK_MECHANICS_FUNCTIONS,
  type BodyRegion,
  type JointStressTag,
  type MovementRole,
  type MuscleGroup,
  type TrainingRole,
  type TrunkMechanicsFunction,
} from "../../src";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
  buildCurrentTrunkCurationFingerprints,
} from "./trunkMechanicsCurationProposal";

export const MINIMAL_TRUNK_CARRY_GOLDEN_ANCESTOR =
  "8af4934641c46da9abbe77a62881151cca9cbf34";

export const PROPOSED_TRUNK_CARRY_CANDIDATE_IDS = [
  "forearm-plank",
  "long-lever-plank",
  "stability-ball-rollout",
  "ab-wheel-rollout",
  "barbell-rollout",
  "forearm-side-plank",
  "bent-knee-side-plank",
  "suitcase-hold",
  "suitcase-carry",
  "machine-abdominal-crunch",
  "kneeling-cable-crunch",
  "reverse-crunch",
  "hanging-knee-raise",
  "standing-cable-chop",
  "half-kneeling-high-to-low-cable-chop",
  "band-chop",
  "cable-lift",
  "farmer-carry",
  "front-rack-carry",
  "front-rack-march",
  "front-rack-hold",
  "goblet-brace-hold",
  "wall-supported-suitcase-march",
  "overhead-carry",
] as const;

export type ProposedTrunkCarryCandidateId =
  (typeof PROPOSED_TRUNK_CARRY_CANDIDATE_IDS)[number];

export const SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE = [
  "forearm-plank",
  "forearm-side-plank",
  "machine-abdominal-crunch",
  "half-kneeling-high-to-low-cable-chop",
  "farmer-carry",
  "suitcase-carry",
  "wall-supported-suitcase-march",
] as const;

export type CandidateDisposition =
  | "SELECTED_FOR_FIRST_IMPLEMENTATION"
  | "DEFERRED_FOR_LATER"
  | "REJECTED_FOR_CURRENT_V2";

export type ContractGapClassification =
  | "CURRENT_TAG_SUFFICIENT"
  | "CURRENT_TAG_IMPERFECT_BUT_USABLE"
  | "NEW_TAG_REVIEW_REQUIRED"
  | "NO_STRESS_TAG_NEEDED";

export type ProposalReviewStatus =
  | "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED"
  | "REMAIN_UNKNOWN";

export type ProposedMechanicsLevel =
  | "unknown"
  | "none"
  | "low"
  | "moderate"
  | "high";

export type PhaseContextUse =
  | "preparation"
  | "activation"
  | "main"
  | "hypertrophy_accessory"
  | "capacity"
  | "recovery";

export type PhaseContextStatus =
  | "POTENTIAL_WITH_REVIEW"
  | "NOT_PROPOSED";

export type ExposureLane =
  | "DIRECT_DEVELOPMENTAL"
  | "MEANINGFUL_SECONDARY"
  | "INCIDENTAL_BRACING"
  | "CAPACITY_EXPOSURE";

export type LegacyConceptClassification =
  | "PRESERVE_AS_REVIEWED_DOMAIN_KNOWLEDGE"
  | "PRESERVE_AFTER_HUMAN_REVIEW"
  | "REQUIRES_NEW_STRUCTURED_METADATA"
  | "REDUNDANT"
  | "QUESTIONABLE"
  | "REJECT";

export type PersonaCandidateStatus =
  | "POTENTIALLY_LEGAL"
  | "CONTEXT_DEPENDENT"
  | "UNAVAILABLE"
  | "REVIEW_REQUIRED"
  | "INAPPROPRIATE_FOR_PURPOSE";

export interface MechanicsProposal {
  readonly level: ProposedMechanicsLevel;
  readonly reviewStatus: ProposalReviewStatus;
  readonly sourceRef: string | null;
  readonly evidenceBasis: readonly string[];
  readonly uncertainty: string;
}

export interface ProposedEquipmentContract {
  readonly requiredEquipment: readonly string[];
  readonly optionalEquipment: readonly string[];
  readonly setupCapability: string;
  readonly spaceRequirement: string;
  readonly anchorRequirement: string;
  readonly loadRangeRequirement: string;
  readonly supportRequirement: string;
  readonly currentDomainSupport: string;
  readonly contractGap: string;
}

export interface ProposedPainStressContract {
  readonly currentTags: readonly JointStressTag[];
  readonly classification: ContractGapClassification;
  readonly relevantExposure: string;
  readonly contractFinding: string;
}

export interface ProposedPrescriptionContract {
  readonly requiredUnits: readonly string[];
  readonly currentlyRepresentable: readonly string[];
  readonly contractGaps: readonly string[];
}

export interface ProposedTransition {
  readonly targetConcept: string;
  readonly context: string;
  readonly automaticSelectionEffect: "none";
}

export interface MultiFunctionCreditContract {
  readonly primaryTrainingPurpose: string;
  readonly secondaryFunctionExpressions: readonly string[];
  readonly capacityExpressions: readonly string[];
  readonly sharedEvidenceClusters: readonly string[];
  readonly doubleCreditRisk: string;
  readonly futureLedgerRule: string;
}

export interface LedgerHandoffContract {
  readonly possibleLane: ExposureLane;
  readonly directFunctionTarget: string;
  readonly secondaryFunctionEvidence: string;
  readonly capacityEvidence: string;
  readonly doseUnit: string;
  readonly fatigueStressEffect: string;
  readonly hypertrophyContribution: string;
  readonly gaitCarryContribution: string;
  readonly doubleCreditControl: string;
}

export interface ProposedExerciseContract {
  readonly id: ProposedTrunkCarryCandidateId;
  readonly displayName: string;
  readonly exerciseFamily: string;
  readonly movementRoles: readonly MovementRole[];
  readonly trainingRoles: readonly TrainingRole[];
  readonly primaryMuscles: readonly MuscleGroup[];
  readonly secondaryMuscles: readonly MuscleGroup[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly equipment: ProposedEquipmentContract;
  readonly prerequisites: readonly string[];
  readonly sectionSuitability: string;
  readonly loadingProfile: string;
  readonly supportMechanics: string;
  readonly resistancePathMechanics: string;
  readonly genericDemands: Readonly<Record<string, MechanicsProposal>>;
  readonly trunkMechanicsProfile: Readonly<
    Record<TrunkMechanicsFunction, MechanicsProposal>
  >;
  readonly painStress: ProposedPainStressContract;
  readonly progressionAxes: readonly string[];
  readonly possibleTransitions: readonly ProposedTransition[];
  readonly coachingPurpose: string;
  readonly prescription: ProposedPrescriptionContract;
  readonly phaseContexts: Readonly<Record<PhaseContextUse, PhaseContextStatus>>;
  readonly phaseContextNeeds: string;
  readonly reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED";
  readonly provenancePlan: readonly string[];
  readonly selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW";
  readonly disposition: CandidateDisposition;
  readonly dispositionReason: string;
  readonly multiFunctionCredit?: MultiFunctionCreditContract;
  readonly ledgerHandoff: LedgerHandoffContract;
  readonly legacyClassification: LegacyConceptClassification;
  readonly legacyEvidence: string;
}

const PRIMARY_REVIEW_SOURCES = {
  plank: "https://pubmed.ncbi.nlm.nih.gov/35370773/",
  sidePlank: "https://pubmed.ncbi.nlm.nih.gov/37624139/",
  carry: "https://pubmed.ncbi.nlm.nih.gov/38665162/",
  trunkFlexion: "https://pubmed.ncbi.nlm.nih.gov/12937449/",
  machineCrunch: "https://pubmed.ncbi.nlm.nih.gov/22893857/",
  controlledRotation: "https://pubmed.ncbi.nlm.nih.gov/37628528/",
  rollout: "https://pubmed.ncbi.nlm.nih.gov/15085210/",
} as const;

const PHASE_CONTEXT_USES: readonly PhaseContextUse[] = [
  "preparation",
  "activation",
  "main",
  "hypertrophy_accessory",
  "capacity",
  "recovery",
];

function phaseContexts(
  potential: readonly PhaseContextUse[],
): Readonly<Record<PhaseContextUse, PhaseContextStatus>> {
  return Object.fromEntries(
    PHASE_CONTEXT_USES.map((use) => [
      use,
      potential.includes(use) ? "POTENTIAL_WITH_REVIEW" : "NOT_PROPOSED",
    ]),
  ) as Readonly<Record<PhaseContextUse, PhaseContextStatus>>;
}

function unknownMechanics(
  uncertainty: string,
): MechanicsProposal {
  return {
    level: "unknown",
    reviewStatus: "REMAIN_UNKNOWN",
    sourceRef: null,
    evidenceBasis: [],
    uncertainty,
  };
}

function reviewedMechanics(input: {
  readonly candidateId: ProposedTrunkCarryCandidateId;
  readonly field: string;
  readonly level: Exclude<ProposedMechanicsLevel, "unknown">;
  readonly evidenceBasis: readonly string[];
  readonly uncertainty: string;
}): MechanicsProposal {
  return {
    level: input.level,
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    sourceRef: `pending-owner-review:minimal-trunk-carry:${input.candidateId}.${input.field}`,
    evidenceBasis: input.evidenceBasis,
    uncertainty: input.uncertainty,
  };
}

function demandSet(
  candidateId: ProposedTrunkCarryCandidateId,
  levels: Readonly<Record<string, ProposedMechanicsLevel>>,
): Readonly<Record<string, MechanicsProposal>> {
  return Object.fromEntries(
    Object.entries(levels).map(([field, level]) => [
      field,
      level === "unknown"
        ? unknownMechanics(
            `${field} remains unknown until the exact setup and ordinary execution are reviewed.`,
          )
        : reviewedMechanics({
            candidateId,
            field: `genericDemands.${field}`,
            level,
            evidenceBasis: [
              "Review the exact proposed support, resistance path, range, laterality, and loading definition.",
              "Do not infer demand from the candidate ID, display name, tags, coaching prose, or legacy difficulty tier.",
            ],
            uncertainty:
              "The proposed level is a review hypothesis and is not accepted production mechanics.",
          }),
    ]),
  );
}

function trunkProfile(
  candidateId: ProposedTrunkCarryCandidateId,
  overrides: Partial<
    Record<
      TrunkMechanicsFunction,
      {
        readonly level: Exclude<ProposedMechanicsLevel, "unknown">;
        readonly evidenceBasis: readonly string[];
        readonly uncertainty: string;
      }
    >
  >,
): Readonly<Record<TrunkMechanicsFunction, MechanicsProposal>> {
  return Object.fromEntries(
    TRUNK_MECHANICS_FUNCTIONS.map((functionName) => {
      const override = overrides[functionName];
      return [
        functionName,
        override
          ? reviewedMechanics({
              candidateId,
              field: `trunkMechanics.${functionName}`,
              ...override,
            })
          : unknownMechanics(
              `${functionName} remains unknown; absence of a proposed role is not reviewed none.`,
            ),
      ];
    }),
  ) as Readonly<Record<TrunkMechanicsFunction, MechanicsProposal>>;
}

function provenancePlan(
  legacyEvidence: string,
  primarySources: readonly string[],
): readonly string[] {
  return [
    "Project-owner exercise-science review of the exact movement definition, intended roles, support, path, laterality, prerequisites, stress mapping, and ordinary prescription context.",
    ...primarySources.map(
      (source) =>
        `Primary-source review context: ${source}. The source informs review but does not independently authorize production metadata.`,
    ),
    `Protected legacy evidence: ${legacyEvidence}. Legacy is migration context only and cannot authorize metadata or behavior.`,
    "Accepted production provenance must cite a stable owner-review artifact and independent evidence; proposed metadata cannot cite itself.",
  ];
}

function transition(
  targetConcept: string,
  context: string,
): ProposedTransition {
  return { targetConcept, context, automaticSelectionEffect: "none" };
}

function oneSourceRule(functions: readonly string[]): string {
  return `Record one source exposure event with reviewed characteristics [${functions.join(
    ", ",
  )}]; do not clone it into independent full-volume units.`;
}

function floorEquipment(contractGap: string): ProposedEquipmentContract {
  return {
    requiredEquipment: ["bodyweight", "floor_space"],
    optionalEquipment: ["exercise mat if available; not required for legality"],
    setupCapability: "clear floor area for the exact support position",
    spaceRequirement: "ordinary floor_space is sufficient only for a stationary floor exercise",
    anchorRequirement: "none",
    loadRangeRequirement: "bodyweight leverage; external-load thresholds are not proposed",
    supportRequirement: "stable non-slip floor support",
    currentDomainSupport: "bodyweight and floor_space are representable",
    contractGap,
  };
}

const CANDIDATES: readonly ProposedExerciseContract[] = [
  {
    id: "forearm-plank",
    displayName: "Forearm Plank",
    exerciseFamily: "core_control",
    movementRoles: ["anti_extension_core"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["serratus", "glutes"],
    bodyRegions: ["lumbar_spine", "pelvis", "shoulder"],
    equipment: floorEquipment(
      "Hold duration and lever progression are not structured progression axes; upper-limb weight-bearing stress also needs review.",
    ),
    prerequisites: [
      "tolerates forearm-supported shoulder loading",
      "can maintain reviewed ribcage-pelvis position at the selected lever",
    ],
    sectionSuitability:
      "Potential activation or accessory use; preparation use requires separate role-and-section review.",
    loadingProfile:
      "Bodyweight, limited external loadability, scalable lever and duration, moderate local fatigue, low systemic fatigue.",
    supportMechanics:
      "Floor support through forearms and feet or knees; the accepted exercise identity would define the ordinary full-lever setup.",
    resistancePathMechanics:
      "Bodyweight isometric support with no implement path; lever length changes demand without changing exercise identity when approved.",
    genericDemands: demandSet("forearm-plank", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "moderate",
      coordination: "low",
      range: "low",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("forearm-plank", {
      antiExtensionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact forearm-supported bodyweight hold and intended anti-extension selection purpose.",
          `Review primary plank context at ${PRIMARY_REVIEW_SOURCES.plank}.`,
        ],
        uncertainty:
          "Lever, fatigue, and support can materially change anti-extension demand.",
      },
    }),
    painStress: {
      currentTags: ["long_lever_core"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure:
        "Long-lever trunk demand plus sustained forearm/shoulder weight bearing.",
      contractFinding:
        "long_lever_core is useful, but no current tag identifies sustained upper-limb weight bearing.",
    },
    progressionAxes: ["hold_duration", "lever", "support_reduction", "effort"],
    possibleTransitions: [
      transition(
        "rollout family",
        "Only after reviewed shoulder, wrist, range, equipment, and progression context justifies an exercise change.",
      ),
    ],
    coachingPurpose:
      "Direct anti-extension position control with a later bodyweight option beyond Dead Bug.",
    prescription: {
      requiredUnits: ["sets", "hold_duration", "lever", "effort", "rest"],
      currentlyRepresentable: ["sets", "timeSeconds", "effortTarget", "restSeconds"],
      contractGaps: ["typed hold purpose", "lever", "support level"],
    },
    phaseContexts: phaseContexts([
      "preparation",
      "activation",
      "hypertrophy_accessory",
      "capacity",
    ]),
    phaseContextNeeds:
      "Review activation, accessory, and timed-capacity uses independently; a Phase 3 accessory rationale cannot leak into activation.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:1366-1382 contains a legacy Plank row and rejected automatic ladder metadata.",
      [PRIMARY_REVIEW_SOURCES.plank],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "SELECTED_FOR_FIRST_IMPLEMENTATION",
    dispositionReason:
      "Adds one equipment-light later anti-extension option while keeping long-lever work inside the same exercise progression contract.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "anti_extension_control",
      secondaryFunctionEvidence: "none accepted before profile review",
      capacityEvidence: "timed bracing endurance only when capacity is the actual role",
      doseUnit: "sets x hold duration at reviewed lever and effort",
      fatigueStressEffect: "moderate local trunk and shoulder-support fatigue; low systemic fatigue",
      hypertrophyContribution:
        "not a hypertrophy set by default; only an approved developmental prescription may contribute",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["anti-extension", "timed bracing capacity"]),
    },
    legacyClassification: "PRESERVE_AS_REVIEWED_DOMAIN_KNOWLEDGE",
    legacyEvidence:
      "Legacy Plank supports the exercise-family concept, but its difficulty and progression links are not authority.",
  },
  {
    id: "long-lever-plank",
    displayName: "Long-Lever Forearm Plank",
    exerciseFamily: "core_control",
    movementRoles: ["anti_extension_core"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["serratus", "glutes"],
    bodyRegions: ["lumbar_spine", "pelvis", "shoulder"],
    equipment: floorEquipment(
      "The domain cannot yet represent lever as a same-exercise progression variable.",
    ),
    prerequisites: [
      "successful standard forearm-plank control",
      "tolerates longer-lever shoulder support",
    ],
    sectionSuitability:
      "Potential accessory use; activation use is review-required because the longer lever can create unnecessary fatigue.",
    loadingProfile:
      "Bodyweight, limited loadability, high trunk and shoulder-support demand, moderate local fatigue.",
    supportMechanics:
      "Same forearm-and-foot support as Forearm Plank with the elbows positioned farther from the torso.",
    resistancePathMechanics:
      "Same isometric bodyweight path as Forearm Plank; the distinguishing fact is lever length.",
    genericDemands: demandSet("long-lever-plank", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "high",
      coordination: "low",
      range: "low",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("long-lever-plank", {
      antiExtensionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the same forearm-plank identity with a deliberately increased lever.",
          `Review primary plank context at ${PRIMARY_REVIEW_SOURCES.plank}.`,
        ],
        uncertainty:
          "The meaningful difference from Forearm Plank is prescription-level lever, not necessarily exercise identity.",
      },
    }),
    painStress: {
      currentTags: ["long_lever_core"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure: "Long-lever trunk and sustained shoulder-support exposure.",
      contractFinding:
        "Current long_lever_core is useful, but upper-limb weight-bearing exposure remains unrepresented.",
    },
    progressionAxes: ["hold_duration", "lever", "effort"],
    possibleTransitions: [
      transition(
        "forearm-plank",
        "Regress lever within the same exercise contract before replacing exercise identity.",
      ),
    ],
    coachingPurpose:
      "Increase anti-extension lever demand without introducing a new implement.",
    prescription: {
      requiredUnits: ["sets", "hold_duration", "lever", "effort", "rest"],
      currentlyRepresentable: ["sets", "timeSeconds", "effortTarget", "restSeconds"],
      contractGaps: ["typed lever", "same-exercise variant identity"],
    },
    phaseContexts: phaseContexts(["activation", "hypertrophy_accessory", "capacity"]),
    phaseContextNeeds:
      "Review only as a context-specific higher-lever prescription; do not label it Phase 3 merely because it is harder.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Legacy Plank and Hollow Body rows preserve a lever-progression concept but not a separate long-lever catalog identity.",
      [PRIMARY_REVIEW_SOURCES.plank],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "REJECTED_FOR_CURRENT_V2",
    dispositionReason:
      "Reject as a separate catalog row; represent it as reviewed Forearm Plank lever progression to avoid a near-duplicate.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "anti_extension_control",
      secondaryFunctionEvidence: "none accepted",
      capacityEvidence: "timed bracing endurance when explicitly selected",
      doseUnit: "sets x hold duration at long lever",
      fatigueStressEffect: "higher local trunk and shoulder-support fatigue than standard lever",
      hypertrophyContribution: "not direct hypertrophy volume by default",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["anti-extension", "timed capacity"]),
    },
    legacyClassification: "REDUNDANT",
    legacyEvidence:
      "Legacy lever variants support progression knowledge; a second V2 ID would duplicate Forearm Plank without a separate selection purpose.",
  },
  {
    id: "stability-ball-rollout",
    displayName: "Kneeling Stability-Ball Rollout",
    exerciseFamily: "core_control",
    movementRoles: ["anti_extension_core"],
    trainingRoles: ["hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["lats", "serratus"],
    bodyRegions: ["lumbar_spine", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["bodyweight", "floor_space", "stability_ball"],
      optionalEquipment: ["kneeling pad"],
      setupCapability: "stable ball, non-slip floor, and kneeling clearance",
      spaceRequirement: "floor_space for the full rollout path",
      anchorRequirement: "none",
      loadRangeRequirement: "ball size and lever range must be compatible with athlete dimensions",
      supportRequirement: "knees on floor and forearms or hands on stable ball",
      currentDomainSupport: "bodyweight and floor_space exist; stability_ball does not",
      contractGap: "Add a reviewed stability_ball capability and usable-size/setup contract before implementation.",
    },
    prerequisites: [
      "anti-extension control through the selected range",
      "kneeling tolerance",
      "shoulder support and reach tolerance",
    ],
    sectionSuitability: "Potential accessory use; not proposed as generic preparation.",
    loadingProfile:
      "Bodyweight leverage, moderate loadability through range and ball geometry, moderate skill and local fatigue.",
    supportMechanics:
      "Kneeling floor support plus a compliant rolling support surface.",
    resistancePathMechanics:
      "Athlete-controlled curved rollout path; ball size and surface change leverage and stability.",
    genericDemands: demandSet("stability-ball-rollout", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "high",
      coordination: "moderate",
      range: "high",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("stability-ball-rollout", {
      antiExtensionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact kneeling rollout path and range-limited anti-extension purpose.",
          `Review rollout-device context at ${PRIMARY_REVIEW_SOURCES.rollout}.`,
        ],
        uncertainty:
          "Ball size, surface, and range materially change task demand and may prevent one universal level.",
      },
    }),
    painStress: {
      currentTags: ["long_lever_core"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure: "Long-lever trunk demand, kneeling contact, and loaded shoulder reach.",
      contractFinding:
        "long_lever_core is useful; loaded shoulder reach and kneeling-pressure exposure need review.",
    },
    progressionAxes: ["range", "lever", "reps", "sets", "tempo"],
    possibleTransitions: [
      transition(
        "forearm-plank",
        "Use only as a contextual regression when range, shoulder support, or equipment justifies replacement.",
      ),
    ],
    coachingPurpose:
      "Provide a dynamic anti-extension progression with scalable range and support geometry.",
    prescription: {
      requiredUnits: ["sets", "reps", "range", "tempo", "effort", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "effortTarget", "restSeconds"],
      contractGaps: ["structured rollout range", "ball geometry"],
    },
    phaseContexts: phaseContexts(["hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review accessory use by role and range; no phase should inherit a generic harder-is-better rationale.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Legacy catalog contained rollout concepts but no reviewed stability-ball V2 capability contract.",
      [PRIMARY_REVIEW_SOURCES.rollout],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer until stability-ball capability, range, and shoulder/kneeling stress contracts are reviewed.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "anti_extension_control",
      secondaryFunctionEvidence: "possible shoulder/scapular support, uncredited until reviewed",
      capacityEvidence: "none by default",
      doseUnit: "sets x reps at range and tempo",
      fatigueStressEffect: "moderate trunk and shoulder local fatigue",
      hypertrophyContribution: "possible only under an approved developmental accessory prescription",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["anti-extension", "shoulder-support exposure"]),
    },
    legacyClassification: "REQUIRES_NEW_STRUCTURED_METADATA",
    legacyEvidence:
      "Legacy rollout knowledge does not supply stability-ball equipment, size, support, or stress truth.",
  },
  {
    id: "ab-wheel-rollout",
    displayName: "Kneeling Ab-Wheel Rollout",
    exerciseFamily: "core_control",
    movementRoles: ["anti_extension_core"],
    trainingRoles: ["hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["lats", "serratus"],
    bodyRegions: ["lumbar_spine", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["bodyweight", "floor_space", "ab_wheel"],
      optionalEquipment: ["kneeling pad"],
      setupCapability: "stable ab wheel and non-slip rolling surface",
      spaceRequirement: "clear floor path for the selected rollout range",
      anchorRequirement: "none",
      loadRangeRequirement: "bodyweight lever and range; no external load threshold",
      supportRequirement: "kneeling floor support with hands on wheel",
      currentDomainSupport: "bodyweight and floor_space exist; ab_wheel does not",
      contractGap: "Add ab_wheel and safe rolling-surface capabilities before implementation.",
    },
    prerequisites: [
      "successful shorter-lever anti-extension control",
      "kneeling tolerance",
      "wrist and shoulder support tolerance",
    ],
    sectionSuitability: "Potential accessory use only in the first reviewed contract.",
    loadingProfile:
      "Bodyweight leverage with high range sensitivity, moderate-high skill and local fatigue, low systemic fatigue.",
    supportMechanics: "Knees supported on floor; hands supported on a narrow rolling implement.",
    resistancePathMechanics:
      "Free rolling path constrained by wheel and floor; athlete controls range and return.",
    genericDemands: demandSet("ab-wheel-rollout", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "high",
      coordination: "moderate",
      range: "high",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("ab-wheel-rollout", {
      antiExtensionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact kneeling wheel rollout and range-limited anti-extension purpose.",
          `Review rollout-device context at ${PRIMARY_REVIEW_SOURCES.rollout}.`,
        ],
        uncertainty:
          "Range and return strategy can materially change whether the ordinary task remains controlled.",
      },
    }),
    painStress: {
      currentTags: ["long_lever_core", "wrist_extension_loading"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure: "Long-lever trunk, wrist support, loaded shoulder reach, and kneeling contact.",
      contractFinding:
        "Current tags cover lever and wrist exposure; loaded shoulder reach remains unrepresented.",
    },
    progressionAxes: ["range", "lever", "reps", "sets", "tempo"],
    possibleTransitions: [
      transition(
        "forearm-plank",
        "Consider only when a reviewed contextual regression is needed; do not create a universal plank-to-rollout ladder.",
      ),
    ],
    coachingPurpose: "Provide a compact implement-based dynamic anti-extension option.",
    prescription: {
      requiredUnits: ["sets", "reps", "range", "tempo", "effort", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "effortTarget", "restSeconds"],
      contractGaps: ["structured rollout range", "implement setup"],
    },
    phaseContexts: phaseContexts(["hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review only the exact accessory context; Phase 3 must not mean maximal rollout range.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Legacy Barbell Rollout preserves the general rollout concept, not ab-wheel equipment or dosage truth.",
      [PRIMARY_REVIEW_SOURCES.rollout],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer until ab-wheel capability and loaded shoulder/wrist/kneeling stress mappings are accepted.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "anti_extension_control",
      secondaryFunctionEvidence: "possible shoulder/scapular support, uncredited until reviewed",
      capacityEvidence: "none by default",
      doseUnit: "sets x reps at reviewed range and tempo",
      fatigueStressEffect: "moderate-high trunk and shoulder local fatigue",
      hypertrophyContribution: "possible under reviewed accessory dosage only",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["anti-extension", "shoulder-support exposure"]),
    },
    legacyClassification: "REQUIRES_NEW_STRUCTURED_METADATA",
    legacyEvidence:
      "The protected legacy catalog did not provide an exact ab-wheel capability contract.",
  },
  {
    id: "barbell-rollout",
    displayName: "Kneeling Barbell Rollout",
    exerciseFamily: "core_control",
    movementRoles: ["anti_extension_core"],
    trainingRoles: ["hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["lats", "serratus"],
    bodyRegions: ["lumbar_spine", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["bodyweight", "floor_space", "barbell", "rollable_plate_setup"],
      optionalEquipment: ["kneeling pad"],
      setupCapability: "barbell with plates that roll securely on a suitable surface",
      spaceRequirement: "clear floor path for the selected rollout range",
      anchorRequirement: "none",
      loadRangeRequirement: "bar and plates must support smooth rolling; plate load is not the trunk dose",
      supportRequirement: "kneeling floor support with hands on bar",
      currentDomainSupport: "barbell and floor_space exist; rollable_plate_setup does not",
      contractGap:
        "Do not infer a safe rolling setup from barbell availability; add explicit rollable setup capability.",
    },
    prerequisites: [
      "successful shorter-lever anti-extension control",
      "kneeling tolerance",
      "wrist and shoulder support tolerance",
      "reviewed rolling-bar setup skill",
    ],
    sectionSuitability: "Potential accessory use only.",
    loadingProfile:
      "Bodyweight leverage with high range and setup demand; barbell mass is secondary to rolling geometry.",
    supportMechanics: "Knees supported on floor; hands supported on a rolling barbell.",
    resistancePathMechanics:
      "Barbell rolls freely on the floor; plate geometry and surface constrain the path.",
    genericDemands: demandSet("barbell-rollout", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "high",
      coordination: "high",
      range: "high",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("barbell-rollout", {
      antiExtensionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact kneeling barbell rollout, rolling setup, and range-limited anti-extension purpose.",
          `Review rollout-device context at ${PRIMARY_REVIEW_SOURCES.rollout}.`,
        ],
        uncertainty:
          "Bar geometry, surface, and range can materially change task safety and demand.",
      },
    }),
    painStress: {
      currentTags: ["long_lever_core", "wrist_extension_loading"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure: "Long-lever trunk, wrist support, shoulder reach, kneeling, and rolling setup.",
      contractFinding:
        "Current tags cover lever and wrist exposure; shoulder reach and setup failure remain unrepresented.",
    },
    progressionAxes: ["range", "lever", "reps", "sets", "tempo"],
    possibleTransitions: [
      transition(
        "forearm-plank",
        "Only as a reviewed contextual regression; legacy progression links have no automatic effect.",
      ),
    ],
    coachingPurpose:
      "Provide a barbell-available dynamic anti-extension option where rolling setup is verified.",
    prescription: {
      requiredUnits: ["sets", "reps", "range", "tempo", "effort", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "effortTarget", "restSeconds"],
      contractGaps: ["structured rollout range", "rollable setup capability"],
    },
    phaseContexts: phaseContexts(["hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review exact accessory use without treating a barbell identity or legacy difficulty tier as phase evidence.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:4564-4581 contains Barbell Rollout with legacy difficulty and progression links that are not authority.",
      [PRIMARY_REVIEW_SOURCES.rollout],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer because ordinary barbell availability does not prove a compatible rolling setup.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "anti_extension_control",
      secondaryFunctionEvidence: "possible shoulder/scapular support, uncredited until reviewed",
      capacityEvidence: "none by default",
      doseUnit: "sets x reps at reviewed range and tempo",
      fatigueStressEffect: "high local trunk and shoulder-support fatigue",
      hypertrophyContribution: "possible under reviewed accessory dosage only",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["anti-extension", "shoulder-support exposure"]),
    },
    legacyClassification: "PRESERVE_AFTER_HUMAN_REVIEW",
    legacyEvidence:
      "Preserve the rollout concept only after equipment, path, prerequisites, and stress are normalized.",
  },
  {
    id: "forearm-side-plank",
    displayName: "Forearm Side Plank",
    exerciseFamily: "core_control",
    movementRoles: ["anti_lateral_flexion_core"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["glutes", "serratus"],
    bodyRegions: ["lumbar_spine", "pelvis", "shoulder"],
    equipment: floorEquipment(
      "Side, lever, knee support, and hold duration are not structured prescription fields; shoulder weight-bearing stress needs review.",
    ),
    prerequisites: [
      "tolerates forearm-supported shoulder loading on the prescribed side",
      "can maintain lateral trunk and pelvic position at the selected lever",
    ],
    sectionSuitability:
      "Potential activation or accessory use; capacity use requires a separate timed-role review.",
    loadingProfile:
      "Bodyweight, limited loadability, scalable side/lever/support/duration, moderate local fatigue.",
    supportMechanics:
      "Forearm and lateral foot or knee support on floor; bent-knee support is a prescription variant, not a second exercise.",
    resistancePathMechanics:
      "Bodyweight isometric lateral support; no implement path.",
    genericDemands: demandSet("forearm-side-plank", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "high",
      coordination: "low",
      range: "low",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("forearm-side-plank", {
      antiLateralFlexionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact lateral forearm-support hold and direct anti-lateral-flexion purpose.",
          `Review plank and side-plank context at ${PRIMARY_REVIEW_SOURCES.sidePlank}.`,
        ],
        uncertainty:
          "Lever, shoulder support, side, and fatigue materially change demand.",
      },
      antiRotationContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review whether maintaining stacked shoulders and pelvis creates meaningful secondary anti-rotation expression.",
          `Review plank and side-plank context at ${PRIMARY_REVIEW_SOURCES.sidePlank}.`,
        ],
        uncertainty:
          "Anti-rotation may be secondary and must not become a second full developmental credit.",
      },
    }),
    painStress: {
      currentTags: ["long_lever_core"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure:
        "Lateral trunk loading plus sustained unilateral forearm/shoulder support.",
      contractFinding:
        "Current long_lever_core is imperfect; lateral trunk loading and upper-limb weight bearing need reviewed tags.",
    },
    progressionAxes: ["hold_duration", "lever", "support_reduction", "load", "side"],
    possibleTransitions: [
      transition(
        "suitcase-carry",
        "Only when a real loaded-gait need, equipment, grip, space, and tolerance justify changing exercise identity.",
      ),
    ],
    coachingPurpose:
      "Direct anti-lateral-flexion development without making gait or carry a prerequisite.",
    prescription: {
      requiredUnits: ["sets", "hold_duration", "side", "lever", "support", "effort", "rest"],
      currentlyRepresentable: ["sets", "timeSeconds", "supportInstruction", "effortTarget", "restSeconds"],
      contractGaps: ["structured side", "typed hold purpose", "lever", "support level", "optional load"],
    },
    phaseContexts: phaseContexts([
      "preparation",
      "activation",
      "hypertrophy_accessory",
      "capacity",
    ]),
    phaseContextNeeds:
      "Review supported activation, full-lever accessory, and timed capacity uses separately.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:2210-2227 and 1252-1267 preserve Side Plank and Side Plank Star concepts but misclassify lateral control as generic anti-rotation.",
      [PRIMARY_REVIEW_SOURCES.sidePlank],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "SELECTED_FOR_FIRST_IMPLEMENTATION",
    dispositionReason:
      "Closes direct anti-lateral-flexion with no carry, grip, or walking-space requirement and supports one-exercise lever regression.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "anti-lateral-flexion development",
      secondaryFunctionExpressions: ["possible anti-rotation position control"],
      capacityExpressions: ["timed trunk and shoulder-support endurance when explicitly prescribed"],
      sharedEvidenceClusters: ["one lateral support and stacked-position cluster"],
      doubleCreditRisk:
        "One hold could be counted as lateral control, anti-rotation, and capacity three times.",
      futureLedgerRule: oneSourceRule([
        "anti-lateral flexion",
        "secondary anti-rotation",
        "timed capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "lateral_trunk_control",
      secondaryFunctionEvidence: "possible reviewed anti-rotation expression",
      capacityEvidence: "timed hold capacity only when selected for capacity",
      doseUnit: "sets x hold duration per side at reviewed lever/support",
      fatigueStressEffect: "moderate lateral trunk and shoulder-support fatigue",
      hypertrophyContribution: "not hypertrophy volume by default",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule([
        "lateral control",
        "anti-rotation",
        "timed capacity",
      ]),
    },
    legacyClassification: "PRESERVE_AS_REVIEWED_DOMAIN_KNOWLEDGE",
    legacyEvidence:
      "Preserve Side Plank as lateral trunk control after correcting legacy role semantics and structuring support/side.",
  },
  {
    id: "bent-knee-side-plank",
    displayName: "Bent-Knee Forearm Side Plank",
    exerciseFamily: "core_control",
    movementRoles: ["anti_lateral_flexion_core"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["glutes", "serratus"],
    bodyRegions: ["lumbar_spine", "pelvis", "shoulder"],
    equipment: floorEquipment(
      "The contract needs structured lever and support so this can remain a Side Plank prescription rather than a duplicate row.",
    ),
    prerequisites: ["tolerates reduced-lever forearm support"],
    sectionSuitability: "Potential activation or accessory regression use.",
    loadingProfile:
      "Bodyweight, reduced lever, limited loadability, lower stability and local fatigue than full Side Plank.",
    supportMechanics: "Forearm, lower knee, and lower leg supported on floor.",
    resistancePathMechanics: "Bodyweight isometric lateral support with reduced lever.",
    genericDemands: demandSet("bent-knee-side-plank", {
      trunk_control: "moderate",
      scapular_control: "moderate",
      stability: "moderate",
      coordination: "low",
      range: "low",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("bent-knee-side-plank", {
      antiLateralFlexionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact bent-knee lateral support and direct anti-lateral-flexion purpose.",
          `Review side-plank context at ${PRIMARY_REVIEW_SOURCES.sidePlank}.`,
        ],
        uncertainty:
          "Reduced lever changes demand but may not change function expression or exercise identity.",
      },
    }),
    painStress: {
      currentTags: ["long_lever_core"],
      classification: "CURRENT_TAG_IMPERFECT_BUT_USABLE",
      relevantExposure: "Reduced-lever lateral trunk and unilateral forearm support.",
      contractFinding:
        "long_lever_core is imprecise for a bent-knee lever; lateral and shoulder-support tag review remains needed at family level.",
    },
    progressionAxes: ["hold_duration", "lever", "support_reduction", "side"],
    possibleTransitions: [
      transition(
        "forearm-side-plank",
        "Progress lever inside one Side Plank definition when readiness is earned.",
      ),
    ],
    coachingPurpose:
      "Reduce the Side Plank lever while preserving lateral trunk-control purpose.",
    prescription: {
      requiredUnits: ["sets", "hold_duration", "side", "lever", "support", "effort", "rest"],
      currentlyRepresentable: ["sets", "timeSeconds", "supportInstruction", "effortTarget", "restSeconds"],
      contractGaps: ["structured side", "lever", "support level"],
    },
    phaseContexts: phaseContexts(["preparation", "activation", "hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review as a supported Side Plank use; do not assign separate global phase evidence.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Legacy Side Plank notes mention knee regression but do not justify a second exercise identity.",
      [PRIMARY_REVIEW_SOURCES.sidePlank],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "REJECTED_FOR_CURRENT_V2",
    dispositionReason:
      "Reject as a separate catalog row; preserve it as the support/lever regression of Side Plank.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "lateral_trunk_control",
      secondaryFunctionEvidence: "none accepted",
      capacityEvidence: "timed hold capacity when explicitly selected",
      doseUnit: "sets x hold duration per side at bent-knee support",
      fatigueStressEffect: "lower local demand than full Side Plank",
      hypertrophyContribution: "not hypertrophy volume by default",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["lateral control", "timed capacity"]),
    },
    legacyClassification: "REDUNDANT",
    legacyEvidence:
      "The regression concept is useful; a separate row duplicates one exercise's support/lever prescription.",
  },
  {
    id: "suitcase-hold",
    displayName: "Suitcase Hold",
    exerciseFamily: "carry_load (new family review required)",
    movementRoles: ["anti_lateral_flexion_core", "loaded_bracing"],
    trainingRoles: ["activation", "hypertrophy_accessory", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["upper_back", "glutes"],
    bodyRegions: ["lumbar_spine", "pelvis", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["dumbbells", "stable_loaded_standing_space"],
      optionalEquipment: ["wall or rack upright for light balance support"],
      setupCapability: "single-side load with clear stationary standing area",
      spaceRequirement: "stationary loaded stance; not loaded_gait_space",
      anchorRequirement: "none",
      loadRangeRequirement: "one dumbbell in a reviewed usable range",
      supportRequirement: "standing, with optional non-load-bearing balance support",
      currentDomainSupport: "dumbbell availability/max pair load exist; stable loaded standing space and minimum usable load do not",
      contractGap:
        "Add stable_loaded_standing_space and a requirement path for usable unilateral load.",
    },
    prerequisites: [
      "grip and shoulder tolerance for unilateral load",
      "can stand with reviewed lateral trunk control",
    ],
    sectionSuitability: "Potential activation, accessory, or capacity use; not a distance carry.",
    loadingProfile:
      "Unilateral external load, high loadability, moderate local trunk/grip fatigue, low-moderate systemic fatigue.",
    supportMechanics:
      "Standing without locomotion; optional light balance support must not unload the suitcase side.",
    resistancePathMechanics:
      "Unilateral free implement held beside the body; no gait path.",
    genericDemands: demandSet("suitcase-hold", {
      trunk_control: "high",
      scapular_control: "low",
      stability: "moderate",
      coordination: "low",
      range: "low",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("suitcase-hold", {
      antiLateralFlexionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact unilateral static load and direct lateral-control purpose.",
          `Review hold/carry comparison context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty: "Load and support materially change lateral-control demand.",
      },
      loadedBracingContribution: {
        level: "high",
        evidenceBasis: [
          "Review trunk-position maintenance under a unilateral external load.",
          `Review hold/carry comparison context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "The same unilateral load is shared evidence with lateral control and cannot create duplicate credit.",
      },
    }),
    painStress: {
      currentTags: ["grip_intensive", "heavy_axial_loading"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure: "Unilateral lateral trunk load, grip demand, shoulder traction, and sustained bracing.",
      contractFinding:
        "Grip and heavy-load tags are imperfect; lateral trunk loading needs a reviewed tag while sustained bracing itself may not need one.",
    },
    progressionAxes: ["load", "hold_duration", "sets", "side"],
    possibleTransitions: [
      transition(
        "suitcase-carry",
        "Add locomotion only when safe walkway, gait capacity, grip, and fatigue context justify it.",
      ),
    ],
    coachingPurpose:
      "Provide a stationary unilateral loaded-bracing and lateral-control option without claiming carry distance.",
    prescription: {
      requiredUnits: ["sets", "hold_duration", "load", "side", "effort", "rest"],
      currentlyRepresentable: ["sets", "timeSeconds", "effortTarget", "restSeconds"],
      contractGaps: ["structured load", "side", "typed hold purpose"],
    },
    phaseContexts: phaseContexts(["activation", "hypertrophy_accessory", "capacity"]),
    phaseContextNeeds:
      "Review light activation, loaded accessory, and sustained-capacity contexts independently.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:2193-2209 and 4545-4562 contain inconsistent Suitcase Hold March concepts; static hold truth requires a new exact definition.",
      [PRIMARY_REVIEW_SOURCES.carry],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer as a separate row until static hold versus march/carry identity and prescription units are settled.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "unilateral loaded bracing or anti-lateral-flexion, depending on requested role",
      secondaryFunctionExpressions: ["the other reviewed trunk function"],
      capacityExpressions: ["static grip and bracing endurance"],
      sharedEvidenceClusters: ["one unilateral external-load hold cluster"],
      doubleCreditRisk:
        "One hold could be counted as lateral control, loaded bracing, grip capacity, and trunk capacity independently.",
      futureLedgerRule: oneSourceRule([
        "anti-lateral flexion",
        "loaded bracing",
        "grip capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "CAPACITY_EXPOSURE",
      directFunctionTarget: "anti_lateral_flexion_core or loaded_bracing by actual role",
      secondaryFunctionEvidence: "the non-primary reviewed function",
      capacityEvidence: "static grip and loaded-bracing endurance",
      doseUnit: "sets x hold duration x load per side",
      fatigueStressEffect: "moderate grip, trunk, and shoulder traction fatigue",
      hypertrophyContribution: "not direct hypertrophy volume by default",
      gaitCarryContribution: "no gait; must not satisfy a distance-carry target",
      doubleCreditControl: oneSourceRule([
        "lateral control",
        "loaded bracing",
        "grip capacity",
      ]),
    },
    legacyClassification: "PRESERVE_AFTER_HUMAN_REVIEW",
    legacyEvidence:
      "Preserve the unilateral hold concept only after separating static hold, march, and true carry semantics.",
  },
  {
    id: "suitcase-carry",
    displayName: "Suitcase Carry",
    exerciseFamily: "carry_load (new family review required)",
    movementRoles: ["carry", "anti_lateral_flexion_core", "loaded_bracing"],
    trainingRoles: ["secondary_strength", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["upper_back", "glutes"],
    bodyRegions: ["lumbar_spine", "pelvis", "hip", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["dumbbells", "loaded_gait_space"],
      optionalEquipment: [],
      setupCapability: "single-side dumbbell loading with safe start, turn, and set-down area",
      spaceRequirement: "loaded_gait_space; ordinary floor_space is not accepted as a safe walkway",
      anchorRequirement: "none",
      loadRangeRequirement: "one dumbbell in a reviewed usable range with side-specific handling",
      supportRequirement: "unsupported standing and walking",
      currentDomainSupport: "dumbbell availability/max pair load exist; safe walkway and minimum unilateral load do not",
      contractGap:
        "Add loaded_gait_space and a requirement path for usable unilateral load; do not infer either from floor_space.",
    },
    prerequisites: [
      "grip and shoulder tolerance for unilateral load",
      "walking and turning control under the proposed load",
      "reviewed lateral trunk control for the selected distance",
    ],
    sectionSuitability:
      "Potential main, accessory, or capacity use; it is never mandatory filler.",
    loadingProfile:
      "Unilateral free load, high loadability, moderate-high grip/trunk fatigue, moderate systemic and gait demand.",
    supportMechanics:
      "Unsupported loaded walking with one implement held beside the body.",
    resistancePathMechanics:
      "Unilateral free implement with athlete-controlled gait path, turns, and set-down.",
    genericDemands: demandSet("suitcase-carry", {
      trunk_control: "high",
      scapular_control: "low",
      stability: "high",
      coordination: "moderate",
      range: "moderate",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("suitcase-carry", {
      antiLateralFlexionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact unilateral walking load and direct anti-lateral-flexion selection purpose.",
          `Review loaded carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Load, distance, gait, and fatigue change expression; unilateral loading does not settle every trunk function.",
      },
      antiRotationContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review whether the exact gait and unilateral load create meaningful secondary anti-rotation expression.",
          `Review loaded carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Anti-rotation is proposed as secondary mechanics, not a direct movement role or independent volume unit.",
      },
      loadedBracingContribution: {
        level: "high",
        evidenceBasis: [
          "Review trunk-position maintenance under one external load during walking.",
          `Review loaded carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "The same load is shared evidence with lateral and rotational control.",
      },
      gaitLoadTransferContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact loaded walking, turn, and set-down definition.",
          `Review loaded carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Distance, gait speed, turns, and surface are prescription facts not captured by one global level.",
      },
    }),
    painStress: {
      currentTags: ["grip_intensive", "heavy_axial_loading"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure:
        "Unilateral lateral trunk loading, loaded locomotion, grip, shoulder traction, and sustained bracing.",
      contractFinding:
        "Current tags are incomplete; lateral trunk loading and loaded-carry locomotion require reviewed tags.",
    },
    progressionAxes: ["load", "distance", "time", "trips", "turns", "gait_control"],
    possibleTransitions: [
      transition(
        "wall-supported-suitcase-march",
        "Use only when space, gait, support, load, pain response, or skill evidence justifies a regression.",
      ),
      transition(
        "suitcase-hold",
        "Remove locomotion only for an explicit stationary-capacity or tolerance reason.",
      ),
    ],
    coachingPurpose:
      "Train unilateral loaded gait, direct lateral trunk control, and loaded bracing in one explicit source exposure.",
    prescription: {
      requiredUnits: ["trips", "distance_or_time", "load", "side", "rest", "gait_control_standard"],
      currentlyRepresentable: ["timeSeconds", "effortTarget", "restSeconds"],
      contractGaps: ["trips", "distance", "load", "side", "turns", "gait control standard"],
    },
    phaseContexts: phaseContexts(["main", "hypertrophy_accessory", "capacity"]),
    phaseContextNeeds:
      "Review main, accessory, and capacity uses independently; capacity evidence cannot leak into recovery or activation.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:2159-2174 preserves the unilateral Suitcase Carry concept but uses broad strings and free-text pain authority.",
      [PRIMARY_REVIEW_SOURCES.carry],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "SELECTED_FOR_FIRST_IMPLEMENTATION",
    dispositionReason:
      "Supplies the minimal unilateral carry and a direct lateral-control/load-bracing comparison against Side Plank and Farmer Carry.",
    multiFunctionCredit: {
      primaryTrainingPurpose:
        "carry, anti-lateral-flexion, or loaded bracing according to the requested role",
      secondaryFunctionExpressions: [
        "reviewed anti-rotation expression",
        "the non-primary reviewed trunk functions",
      ],
      capacityExpressions: ["loaded gait", "grip", "trunk endurance"],
      sharedEvidenceClusters: [
        "one unilateral load and trunk-control cluster",
        "one loaded gait and grip cluster",
      ],
      doubleCreditRisk:
        "One trip could be counted as carry, gait, lateral control, anti-rotation, loaded bracing, and grip six times.",
      futureLedgerRule: oneSourceRule([
        "carry",
        "gait",
        "anti-lateral flexion",
        "anti-rotation",
        "loaded bracing",
        "grip capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "CAPACITY_EXPOSURE",
      directFunctionTarget: "actual selected role: carry, lateral control, or loaded bracing",
      secondaryFunctionEvidence: "remaining reviewed trunk characteristics",
      capacityEvidence: "loaded gait and grip capacity",
      doseUnit: "trips x distance or time x load per side",
      fatigueStressEffect: "moderate-high grip, trunk, shoulder traction, and gait fatigue",
      hypertrophyContribution: "not converted to direct hypertrophy sets by default",
      gaitCarryContribution: "yes, as one loaded-gait source event",
      doubleCreditControl: oneSourceRule([
        "carry",
        "lateral control",
        "anti-rotation",
        "loaded bracing",
        "grip",
      ]),
    },
    legacyClassification: "PRESERVE_AS_REVIEWED_DOMAIN_KNOWLEDGE",
    legacyEvidence:
      "Preserve the bilateral-versus-unilateral carry distinction after replacing string labels with reviewed structured metadata.",
  },
  {
    id: "machine-abdominal-crunch",
    displayName: "Machine Abdominal Crunch",
    exerciseFamily: "core_control",
    movementRoles: ["trunk_flexion"],
    trainingRoles: ["hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: [],
    bodyRegions: ["lumbar_spine", "ribcage", "pelvis"],
    equipment: {
      requiredEquipment: ["selectorized_machine", "machine:abdominal_crunch"],
      optionalEquipment: [],
      setupCapability: "seat, pad, pivot, and range adjustment compatible with the athlete",
      spaceRequirement: "machine footprint only",
      anchorRequirement: "none",
      loadRangeRequirement: "selectorized stack with a usable reviewed starting and progression range",
      supportRequirement: "seated machine support with reviewed pad and pivot fit",
      currentDomainSupport: "selectorized machines exist; abdominal_crunch is not a MachineId",
      contractGap:
        "Add machine:abdominal_crunch plus fit/range setup evidence; generic selectorized_machine is insufficient.",
    },
    prerequisites: [
      "tolerates reviewed controlled trunk-flexion range",
      "can fit the machine pivot and pads without forced setup",
    ],
    sectionSuitability: "Accessory only in the first proposal.",
    loadingProfile:
      "Machine-guided, high progressive loadability, low stability demand, moderate local trunk fatigue.",
    supportMechanics: "Seated and externally supported by machine geometry and pads.",
    resistancePathMechanics:
      "Machine-guided trunk-flexion path with high fit dependency and low trajectory freedom.",
    genericDemands: demandSet("machine-abdominal-crunch", {
      trunk_control: "high",
      scapular_control: "low",
      stability: "low",
      coordination: "low",
      range: "moderate",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("machine-abdominal-crunch", {
      controlledFlexionContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact machine-guided controlled trunk-flexion and abdominal-shortening purpose.",
          `Review trunk-flexion evidence at ${PRIMARY_REVIEW_SOURCES.trunkFlexion} and machine comparison context at ${PRIMARY_REVIEW_SOURCES.machineCrunch}.`,
        ],
        uncertainty:
          "Machine geometry, range, pad placement, and athlete fit prevent generic machine identity from being enough.",
      },
    }),
    painStress: {
      currentTags: ["loaded_spinal_flexion"],
      classification: "CURRENT_TAG_SUFFICIENT",
      relevantExposure: "Controlled loaded trunk flexion through a machine-guided range.",
      contractFinding:
        "loaded_spinal_flexion can represent the relevant exposure; a separate abdominal-shortening stress tag would duplicate mechanics unless a receiver is identified.",
    },
    progressionAxes: ["load", "reps", "sets", "range", "tempo", "effort"],
    possibleTransitions: [
      transition(
        "kneeling-cable-crunch",
        "Only for a real equipment, fit, path, or preference reason; not as an automatic progression.",
      ),
    ],
    coachingPurpose:
      "Provide one direct, progressively overloadable controlled trunk-flexion option for reviewed accessory use.",
    prescription: {
      requiredUnits: ["sets", "reps", "load", "range", "tempo", "effort", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "effortTarget", "restSeconds"],
      contractGaps: ["structured load", "machine setup/fit", "numeric range"],
    },
    phaseContexts: phaseContexts(["hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review hypertrophy-accessory evidence only; it must not influence activation, preparation, or recovery use.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:4378-4394 preserves Machine Ab Crunch but incorrectly labels it anti-extension and relies on legacy difficulty/prose.",
      [PRIMARY_REVIEW_SOURCES.trunkFlexion, PRIMARY_REVIEW_SOURCES.machineCrunch],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "SELECTED_FOR_FIRST_IMPLEMENTATION",
    dispositionReason:
      "Offers the cleanest first direct, gym-loadable shortening/flexion bootstrap candidate with explicit machine-fit limits.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "controlled trunk flexion / abdominal shortening",
      secondaryFunctionEvidence: "none accepted",
      capacityEvidence: "none",
      doseUnit: "sets x reps x load at range, tempo, and effort",
      fatigueStressEffect: "moderate local trunk fatigue; low systemic fatigue",
      hypertrophyContribution:
        "may contribute direct trunk hypertrophy volume only under a reviewed hypertrophy prescription",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["controlled flexion", "direct trunk volume"]),
    },
    legacyClassification: "PRESERVE_AFTER_HUMAN_REVIEW",
    legacyEvidence:
      "Preserve controlled machine flexion after correcting role truth and adding machine-specific fit and stress metadata.",
  },
  {
    id: "kneeling-cable-crunch",
    displayName: "Kneeling Cable Crunch",
    exerciseFamily: "core_control",
    movementRoles: ["trunk_flexion"],
    trainingRoles: ["hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: [],
    bodyRegions: ["lumbar_spine", "ribcage", "pelvis", "knee"],
    equipment: {
      requiredEquipment: ["cable_stack", "cable_anchor_high", "floor_space"],
      optionalEquipment: ["kneeling pad", "rope attachment"],
      setupCapability: "high cable line with kneeling clearance and stable attachment",
      spaceRequirement: "stationary kneeling area in front of cable",
      anchorRequirement: "high adjustable cable anchor",
      loadRangeRequirement: "cable stack with usable starting and progression load",
      supportRequirement: "kneeling floor support without external torso support",
      currentDomainSupport: "cable availability/adjustableHeight exist, but EquipmentRequirement cannot require a high cable position",
      contractGap:
        "Add cable_anchor_high requirement semantics and structured kneeling support/load capability.",
    },
    prerequisites: [
      "kneeling tolerance",
      "can distinguish controlled trunk flexion from hip-dominant movement",
      "tolerates reviewed loaded-flexion range",
    ],
    sectionSuitability: "Accessory only in the first proposal.",
    loadingProfile:
      "Cable-anchored, high loadability, moderate stability and coordination demand, moderate local fatigue.",
    supportMechanics: "Kneeling on floor without torso support.",
    resistancePathMechanics:
      "High cable line with adjustable pull; torso and pelvis strategy materially affect the movement definition.",
    genericDemands: demandSet("kneeling-cable-crunch", {
      trunk_control: "high",
      scapular_control: "low",
      stability: "moderate",
      coordination: "moderate",
      range: "moderate",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("kneeling-cable-crunch", {
      controlledFlexionContribution: {
        level: "high",
        evidenceBasis: [
          "Review an exact pelvis-controlled kneeling cable definition that intentionally produces trunk flexion.",
          `Review trunk-flexion context at ${PRIMARY_REVIEW_SOURCES.trunkFlexion}.`,
        ],
        uncertainty:
          "Pelvic motion and hip flexion can change the exercise away from the proposed function.",
      },
    }),
    painStress: {
      currentTags: ["loaded_spinal_flexion"],
      classification: "CURRENT_TAG_SUFFICIENT",
      relevantExposure: "Controlled loaded trunk flexion plus kneeling contact.",
      contractFinding:
        "loaded_spinal_flexion is sufficient for trunk exposure; kneeling contact belongs to setup/tolerance review unless a stress receiver is approved.",
    },
    progressionAxes: ["load", "reps", "sets", "range", "tempo", "effort"],
    possibleTransitions: [
      transition(
        "machine-abdominal-crunch",
        "Only for equipment, fit, support, path, or tolerance context.",
      ),
    ],
    coachingPurpose:
      "Provide cable-loadable controlled flexion where pelvis and kneeling setup can be reviewed.",
    prescription: {
      requiredUnits: ["sets", "reps", "load", "range", "tempo", "effort", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "effortTarget", "restSeconds"],
      contractGaps: ["structured load", "high cable setup", "numeric range"],
    },
    phaseContexts: phaseContexts(["hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review only as an accessory; cable loadability cannot create a global later-phase preference.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "No exact protected-legacy row provides reviewed kneeling cable flexion mechanics; legacy machine crunch is only adjacent migration evidence.",
      [PRIMARY_REVIEW_SOURCES.trunkFlexion],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer because machine flexion is the cleaner first bootstrap and cable anchor/pelvis/kneeling contracts remain open.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "controlled trunk flexion / abdominal shortening",
      secondaryFunctionEvidence: "possible kneeling bracing, uncredited",
      capacityEvidence: "none",
      doseUnit: "sets x reps x load at range, tempo, and effort",
      fatigueStressEffect: "moderate local trunk and kneeling setup fatigue",
      hypertrophyContribution: "possible direct trunk volume under reviewed dosage",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["controlled flexion", "direct trunk volume"]),
    },
    legacyClassification: "REQUIRES_NEW_STRUCTURED_METADATA",
    legacyEvidence:
      "A new exact cable setup and movement definition is required; no legacy label can supply it.",
  },
  {
    id: "reverse-crunch",
    displayName: "Reverse Crunch",
    exerciseFamily: "core_control",
    movementRoles: ["trunk_flexion"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: [],
    bodyRegions: ["lumbar_spine", "pelvis", "hip"],
    equipment: floorEquipment(
      "Range and pelvis-versus-hip motion are not structured, and optional bench support is not part of one exact definition.",
    ),
    prerequisites: [
      "can produce reviewed posterior pelvic movement without momentum",
      "tolerates the selected lumbar/pelvic range",
    ],
    sectionSuitability: "Potential activation or accessory use after function review.",
    loadingProfile:
      "Bodyweight, limited loadability, moderate coordination and range sensitivity, low systemic fatigue.",
    supportMechanics: "Supine floor support with legs moving and pelvis lifting through reviewed range.",
    resistancePathMechanics:
      "Bodyweight limb and pelvic path; hip-flexion contribution and momentum can dominate without an exact definition.",
    genericDemands: demandSet("reverse-crunch", {
      trunk_control: "moderate",
      scapular_control: "low",
      stability: "moderate",
      coordination: "moderate",
      range: "moderate",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("reverse-crunch", {
      controlledFlexionContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review the exact pelvic-lift definition and whether controlled trunk flexion remains the ordinary purpose.",
          `Review trunk-flexion context at ${PRIMARY_REVIEW_SOURCES.trunkFlexion}.`,
        ],
        uncertainty:
          "Hip flexion, momentum, and range can dominate; bodyweight identity alone is insufficient.",
      },
    }),
    painStress: {
      currentTags: ["long_lever_core"],
      classification: "CURRENT_TAG_IMPERFECT_BUT_USABLE",
      relevantExposure: "Bodyweight trunk/pelvic flexion with moving limb lever.",
      contractFinding:
        "long_lever_core can conservatively represent limb leverage, but the vocabulary lacks a precise unloaded-flexion exposure.",
    },
    progressionAxes: ["reps", "sets", "range", "tempo", "lever"],
    possibleTransitions: [
      transition(
        "machine-abdominal-crunch",
        "Only for a real loadability, setup, or goal reason; not an automatic bodyweight-to-machine ladder.",
      ),
    ],
    coachingPurpose:
      "Provide a bodyweight controlled-flexion option only if pelvic and hip-motion truth can be separated.",
    prescription: {
      requiredUnits: ["sets", "reps", "range", "tempo", "lever", "effort", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "effortTarget", "restSeconds"],
      contractGaps: ["typed lever", "structured pelvic/trunk range"],
    },
    phaseContexts: phaseContexts(["activation", "hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review low-fatigue activation separately from direct accessory use; neither is inferred from bodyweight status.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "No exact protected-legacy Reverse Crunch row was accepted; hanging and machine concepts expose the need to separate hip from trunk flexion.",
      [PRIMARY_REVIEW_SOURCES.trunkFlexion],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer until controlled trunk flexion can be separated from hip-dominant motion and a bodyweight prescription contract exists.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "controlled trunk flexion if human review confirms it",
      secondaryFunctionEvidence: "hip-flexion contribution is not trunk credit",
      capacityEvidence: "none",
      doseUnit: "sets x reps at range, lever, and tempo",
      fatigueStressEffect: "low-moderate local trunk/hip-flexor fatigue",
      hypertrophyContribution: "possible only if direct flexion and dosage are approved",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["controlled flexion"]),
    },
    legacyClassification: "QUESTIONABLE",
    legacyEvidence:
      "Adjacent legacy core rows conflate hip and trunk movement; the concept needs a new exact review.",
  },
  {
    id: "hanging-knee-raise",
    displayName: "Hanging Knee Raise",
    exerciseFamily: "core_control",
    movementRoles: ["trunk_flexion"],
    trainingRoles: ["hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["lats"],
    bodyRegions: ["lumbar_spine", "pelvis", "hip", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["pull_up_bar"],
      optionalEquipment: [],
      setupCapability: "stable hanging bar with safe mount/dismount clearance",
      spaceRequirement: "vertical hanging and leg-motion clearance",
      anchorRequirement: "rated overhead bar",
      loadRangeRequirement: "bodyweight hanging capacity",
      supportRequirement: "full upper-limb suspension",
      currentDomainSupport: "pull_up_bar exists; rated hanging clearance and mount/dismount setup are not explicit",
      contractGap:
        "Add hanging setup/prerequisite truth and distinguish controlled trunk flexion from hip-dominant knee raising.",
    },
    prerequisites: [
      "grip and shoulder hanging tolerance",
      "safe mount and dismount capability",
      "reviewed control without swing",
      "function review distinguishing trunk from hip flexion",
    ],
    sectionSuitability: "Potential accessory use only after prerequisite and function review.",
    loadingProfile:
      "Bodyweight hanging, moderate loadability through lever/range, high grip/shoulder and coordination demand.",
    supportMechanics: "Suspended from a pull-up bar with no lower-body support.",
    resistancePathMechanics:
      "Bodyweight limb and pelvic path under suspension; swing and hip flexion can dominate.",
    genericDemands: demandSet("hanging-knee-raise", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "high",
      coordination: "high",
      range: "high",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("hanging-knee-raise", {
      controlledFlexionContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review an exact no-swing pelvic/trunk motion definition and quantify hip-flexion contribution.",
          `Review trunk-flexion context at ${PRIMARY_REVIEW_SOURCES.trunkFlexion}.`,
        ],
        uncertainty:
          "The ordinary exercise may be hip-flexion dominant and cannot be accepted from the legacy core label.",
      },
    }),
    painStress: {
      currentTags: ["long_lever_core", "grip_intensive"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure: "Hanging shoulder traction, grip, long-lever trunk/hip motion, and swing control.",
      contractFinding:
        "Current grip and lever tags are useful; sustained hanging/shoulder traction requires review.",
    },
    progressionAxes: ["reps", "sets", "range", "tempo", "lever", "load"],
    possibleTransitions: [
      transition(
        "reverse-crunch",
        "Only when grip, shoulder, setup, swing, or tolerance context justifies a supported alternative.",
      ),
    ],
    coachingPurpose:
      "Evaluate a hanging direct-flexion option without equating knee movement with trunk flexion.",
    prescription: {
      requiredUnits: ["sets", "reps", "range", "tempo", "lever", "effort", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "effortTarget", "restSeconds"],
      contractGaps: ["typed lever", "swing standard", "hanging setup", "structured trunk-versus-hip range"],
    },
    phaseContexts: phaseContexts(["hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review prerequisite-aware accessory use; hanging or legacy difficulty cannot become phase evidence.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:3191-3274 contains hanging rows with generic anti-extension/anti-rotation labels and timed prescriptions that do not prove flexion mechanics.",
      [PRIMARY_REVIEW_SOURCES.trunkFlexion],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer because grip/shoulder prerequisites and hip-versus-trunk function ambiguity make it a poor first flexion bootstrap.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "controlled trunk flexion only if confirmed",
      secondaryFunctionExpressions: ["possible anti-swing trunk control"],
      capacityExpressions: ["grip and hanging shoulder capacity"],
      sharedEvidenceClusters: ["one suspended bodyweight and no-swing control cluster"],
      doubleCreditRisk:
        "One set could be counted as flexion, anti-extension, grip, and shoulder capacity without separate evidence.",
      futureLedgerRule: oneSourceRule([
        "controlled flexion",
        "anti-swing control",
        "grip/hanging capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "controlled flexion if confirmed",
      secondaryFunctionEvidence: "anti-swing control remains secondary",
      capacityEvidence: "grip and hanging shoulder capacity",
      doseUnit: "sets x reps at range and lever",
      fatigueStressEffect: "high grip/shoulder and moderate trunk/hip-flexor fatigue",
      hypertrophyContribution: "possible only after function and dosage review",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule([
        "controlled flexion",
        "grip",
        "hanging capacity",
      ]),
    },
    legacyClassification: "QUESTIONABLE",
    legacyEvidence:
      "Legacy rows are useful failure evidence because their labels and prescriptions do not separate hip flexion, trunk flexion, and hanging capacity.",
  },
  {
    id: "standing-cable-chop",
    displayName: "Standing Cable Chop",
    exerciseFamily: "core_control",
    movementRoles: ["trunk_rotation"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["glutes", "serratus"],
    bodyRegions: ["thoracic_spine", "lumbar_spine", "pelvis", "hip", "shoulder"],
    equipment: {
      requiredEquipment: ["cable_stack", "cable_anchor_high", "stable_standing_space"],
      optionalEquipment: ["rope or single handle"],
      setupCapability: "high cable line with standing rotational clearance",
      spaceRequirement: "clear standing rotation area beside cable",
      anchorRequirement: "high adjustable cable anchor",
      loadRangeRequirement: "usable cable load for controlled full-range repetitions",
      supportRequirement: "unsupported bilateral or split stance, to be fixed by the definition",
      currentDomainSupport: "cable availability exists; high anchor and stable rotational space are not requirement keys",
      contractGap:
        "Add high-anchor/setup requirements and fix stance/pelvis motion before one mechanics profile can be accepted.",
    },
    prerequisites: [
      "tolerates reviewed rotational range",
      "can control pelvis, knees, and cable return",
      "can use the fixed proposed stance without momentum",
    ],
    sectionSuitability:
      "Potential activation or accessory use; each use needs separate load/range evidence.",
    loadingProfile:
      "Cable-loaded, moderate-high loadability, moderate stability/coordination, moderate local fatigue.",
    supportMechanics:
      "Unsupported standing stance; pelvis and foot motion must be explicitly defined.",
    resistancePathMechanics:
      "High-to-low cable path with adjustable line of pull and athlete-controlled trunk/hip trajectory.",
    genericDemands: demandSet("standing-cable-chop", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "moderate",
      coordination: "high",
      range: "high",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("standing-cable-chop", {
      controlledRotationContribution: {
        level: "high",
        evidenceBasis: [
          "Review an exact standing stance, pelvis policy, rotational range, and controlled cable-return definition.",
          `Review cable woodchop context at ${PRIMARY_REVIEW_SOURCES.controlledRotation}.`,
        ],
        uncertainty:
          "Hip and pelvis motion can make the generic standing definition too variable for one trunk-rotation level.",
      },
      loadedBracingContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review position maintenance under cable load separately from produced rotation.",
          `Review cable woodchop context at ${PRIMARY_REVIEW_SOURCES.controlledRotation}.`,
        ],
        uncertainty:
          "The same cable and stance facts cannot become independent full rotation and bracing credits.",
      },
    }),
    painStress: {
      currentTags: [],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure: "Loaded trunk rotation with stance, hip, knee, and shoulder participation.",
      contractFinding:
        "No current JointStressTag represents loaded trunk rotation; free-text low-back contraindications are not authority.",
    },
    progressionAxes: ["load", "reps", "sets", "range", "tempo", "stance"],
    possibleTransitions: [
      transition(
        "half-kneeling-high-to-low-cable-chop",
        "Use only when stance/pelvis-control context justifies the setup change.",
      ),
    ],
    coachingPurpose:
      "Produce and control trunk rotation under cable resistance with an explicit stance and pelvis policy.",
    prescription: {
      requiredUnits: ["sets", "reps_per_side", "load", "range", "tempo", "stance", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "restSeconds"],
      contractGaps: ["structured side", "load", "stance", "rotation range", "high cable setup"],
    },
    phaseContexts: phaseContexts(["activation", "hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review light activation separately from loaded accessory use; rotation range is not a phase proxy.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:4358-4375 preserves a standing cable woodchop but incorrectly links it as Pallof progression and mixes anti-rotation with rotation control.",
      [PRIMARY_REVIEW_SOURCES.controlledRotation],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer because standing hip/pelvis/stance variability is less clean than the first half-kneeling definition.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "controlled trunk rotation",
      secondaryFunctionExpressions: ["loaded bracing", "hip/pelvis control"],
      capacityExpressions: [],
      sharedEvidenceClusters: ["one cable-load, stance, and controlled-return cluster"],
      doubleCreditRisk:
        "One set could become full rotation, loaded-bracing, and hip-control units.",
      futureLedgerRule: oneSourceRule([
        "controlled rotation",
        "loaded bracing",
        "stance control",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "controlled_rotation_control",
      secondaryFunctionEvidence: "loaded bracing and stance control when reviewed",
      capacityEvidence: "none by default",
      doseUnit: "sets x reps per side x load at range and tempo",
      fatigueStressEffect: "moderate trunk, hip, and shoulder fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["controlled rotation", "loaded bracing"]),
    },
    legacyClassification: "PRESERVE_AFTER_HUMAN_REVIEW",
    legacyEvidence:
      "Preserve controlled rotation only after separating it from Pallof anti-rotation and fixing stance/pelvis/path truth.",
  },
  {
    id: "half-kneeling-high-to-low-cable-chop",
    displayName: "Half-Kneeling High-to-Low Cable Chop",
    exerciseFamily: "core_control",
    movementRoles: ["trunk_rotation"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["glutes", "serratus"],
    bodyRegions: ["thoracic_spine", "lumbar_spine", "pelvis", "hip", "knee", "shoulder"],
    equipment: {
      requiredEquipment: ["cable_stack", "cable_anchor_high", "floor_space"],
      optionalEquipment: ["kneeling pad", "rope or single handle"],
      setupCapability: "high cable line with half-kneeling rotational clearance",
      spaceRequirement: "stationary half-kneeling area beside cable",
      anchorRequirement: "high adjustable cable anchor",
      loadRangeRequirement: "usable cable load for controlled range and return",
      supportRequirement: "one knee and opposite foot supported on floor",
      currentDomainSupport: "cable and floor capability exist; high cable requirement and half-kneeling setup do not",
      contractGap:
        "Add cable_anchor_high plus side/stance and kneeling-support requirement semantics.",
    },
    prerequisites: [
      "kneeling and hip tolerance on both sides",
      "can maintain reviewed pelvis position",
      "tolerates reviewed rotational and shoulder range",
      "can control cable return without momentum",
    ],
    sectionSuitability:
      "Potential activation or accessory use; load and range must be context-specific.",
    loadingProfile:
      "Cable-loaded, moderate loadability, moderate stability and high coordination/range demand.",
    supportMechanics:
      "Half-kneeling floor support reduces stance variability while leaving trunk rotation intentional.",
    resistancePathMechanics:
      "High-to-low adjustable cable path with defined pelvis policy and per-side execution.",
    genericDemands: demandSet("half-kneeling-high-to-low-cable-chop", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "moderate",
      coordination: "high",
      range: "high",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("half-kneeling-high-to-low-cable-chop", {
      controlledRotationContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact half-kneeling stance, pelvis policy, rotational range, and controlled cable return.",
          `Review cable woodchop context at ${PRIMARY_REVIEW_SOURCES.controlledRotation}.`,
        ],
        uncertainty:
          "The approved range and pelvis policy must define where rotation is intended and tolerated.",
      },
      loadedBracingContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review position maintenance under cable load separately from the produced rotation.",
          `Review cable woodchop context at ${PRIMARY_REVIEW_SOURCES.controlledRotation}.`,
        ],
        uncertainty:
          "Loaded bracing is secondary shared evidence and cannot become a second full dose.",
      },
    }),
    painStress: {
      currentTags: [],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure:
        "Loaded trunk rotation plus kneeling, hip, knee, shoulder, and cable-return demands.",
      contractFinding:
        "A reviewed loaded_trunk_rotation tag is required; kneeling tolerance remains a setup/prerequisite concern unless a receiver needs a tag.",
    },
    progressionAxes: ["load", "reps", "sets", "range", "tempo", "stance_control"],
    possibleTransitions: [
      transition(
        "standing-cable-chop",
        "Only when standing pelvis/hip contribution is an intended contextual development, not because standing is universally harder.",
      ),
    ],
    coachingPurpose:
      "Provide the first explicit controlled-rotation candidate with a more constrained pelvis/stance definition than standing chop.",
    prescription: {
      requiredUnits: ["sets", "reps_per_side", "load", "range", "tempo", "stance", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "restSeconds"],
      contractGaps: ["structured side", "load", "stance", "rotation range", "high cable setup"],
    },
    phaseContexts: phaseContexts(["activation", "hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review light activation and loaded accessory contexts separately; hypertrophy rationale cannot influence activation.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Legacy woodchop rows preserve rotation concepts but do not provide a half-kneeling, pelvis-scoped, role-truthful contract.",
      [PRIMARY_REVIEW_SOURCES.controlledRotation],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "SELECTED_FOR_FIRST_IMPLEMENTATION",
    dispositionReason:
      "Closes controlled rotation with a constrained stance while deferring more variable standing and band paths.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "controlled trunk rotation",
      secondaryFunctionExpressions: ["loaded bracing", "pelvis/stance control"],
      capacityExpressions: [],
      sharedEvidenceClusters: ["one cable-load, range, stance, and controlled-return cluster"],
      doubleCreditRisk:
        "One set could be counted as rotation, loaded bracing, and hip/pelvis control independently.",
      futureLedgerRule: oneSourceRule([
        "controlled rotation",
        "loaded bracing",
        "stance control",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "controlled_rotation_control",
      secondaryFunctionEvidence: "loaded bracing and pelvis control when reviewed",
      capacityEvidence: "none by default",
      doseUnit: "sets x reps per side x load at range and tempo",
      fatigueStressEffect: "moderate trunk, hip, knee-contact, and shoulder fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["controlled rotation", "loaded bracing"]),
    },
    legacyClassification: "REQUIRES_NEW_STRUCTURED_METADATA",
    legacyEvidence:
      "The selected exact half-kneeling definition needs new stance, path, support, role, and stress metadata.",
  },
  {
    id: "band-chop",
    displayName: "Standing Band Chop",
    exerciseFamily: "core_control",
    movementRoles: ["trunk_rotation"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["glutes", "serratus"],
    bodyRegions: ["thoracic_spine", "lumbar_spine", "pelvis", "hip", "shoulder"],
    equipment: {
      requiredEquipment: ["tube_band", "band_anchor_high", "stable_standing_space"],
      optionalEquipment: [],
      setupCapability: "stable high band anchor with rotational clearance and known tension range",
      spaceRequirement: "clear standing rotation area beside anchor",
      anchorRequirement: "high anchor rated for proposed tension",
      loadRangeRequirement: "band type and stretch range compatible with controlled repetitions",
      supportRequirement: "unsupported standing stance",
      currentDomainSupport: "tube_band and high anchor exist; tension/load range and rotational clearance do not",
      contractGap:
        "Band tension/path comparability and stance/pelvis definition need review before it can diversify the cable pool.",
    },
    prerequisites: [
      "stable band setup skill",
      "tolerates reviewed rotational range",
      "can control changing band tension and return",
    ],
    sectionSuitability: "Potential activation or accessory use.",
    loadingProfile:
      "Band-anchored, limited-moderate loadability, changing resistance, moderate coordination and local fatigue.",
    supportMechanics: "Unsupported standing stance.",
    resistancePathMechanics:
      "High-to-low band line with changing tension and athlete-controlled trunk/hip path.",
    genericDemands: demandSet("band-chop", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "moderate",
      coordination: "high",
      range: "high",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("band-chop", {
      controlledRotationContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact stance, pelvis policy, band line, tension range, and controlled return.",
          `Review rotational exercise context at ${PRIMARY_REVIEW_SOURCES.controlledRotation}.`,
        ],
        uncertainty:
          "Band tension and anchor distance can materially alter the ordinary demand.",
      },
    }),
    painStress: {
      currentTags: [],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure: "Loaded trunk rotation under changing band tension.",
      contractFinding: "No current tag represents loaded trunk rotation.",
    },
    progressionAxes: ["band_tension", "reps", "sets", "range", "tempo", "stance"],
    possibleTransitions: [
      transition(
        "half-kneeling-high-to-low-cable-chop",
        "Only for a real path, loadability, stance, or equipment reason.",
      ),
    ],
    coachingPurpose:
      "Offer future home controlled-rotation coverage after band path and tension are normalized.",
    prescription: {
      requiredUnits: ["sets", "reps_per_side", "band_tension", "range", "tempo", "stance", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "restSeconds"],
      contractGaps: ["structured side", "band tension", "stance", "rotation range"],
    },
    phaseContexts: phaseContexts(["activation", "hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review low-tension activation separately from accessory work; home equipment does not imply an early phase.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:1709-1725 preserves Band Woodchop but mixes anti-rotation and rotation labels and uses cues/prose as mechanics.",
      [PRIMARY_REVIEW_SOURCES.controlledRotation],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer until the cable definition is reviewed and band tension/path can add real equipment diversity without ambiguity.",
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "controlled_rotation_control",
      secondaryFunctionEvidence: "stance bracing remains review-qualified",
      capacityEvidence: "none by default",
      doseUnit: "sets x reps per side at band tension, range, and tempo",
      fatigueStressEffect: "low-moderate trunk and shoulder fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule(["controlled rotation"]),
    },
    legacyClassification: "PRESERVE_AFTER_HUMAN_REVIEW",
    legacyEvidence:
      "Preserve the band equipment alternative only after correcting role and path semantics.",
  },
  {
    id: "cable-lift",
    displayName: "Half-Kneeling Cable Lift",
    exerciseFamily: "core_control",
    movementRoles: ["trunk_rotation"],
    trainingRoles: ["activation", "hypertrophy_accessory"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["glutes", "serratus"],
    bodyRegions: ["thoracic_spine", "lumbar_spine", "pelvis", "hip", "knee", "shoulder"],
    equipment: {
      requiredEquipment: ["cable_stack", "cable_anchor_low", "floor_space"],
      optionalEquipment: ["kneeling pad", "rope or single handle"],
      setupCapability: "low cable line with half-kneeling diagonal clearance",
      spaceRequirement: "stationary half-kneeling area beside cable",
      anchorRequirement: "low adjustable cable anchor",
      loadRangeRequirement: "usable cable load for controlled low-to-high path",
      supportRequirement: "one knee and opposite foot supported on floor",
      currentDomainSupport: "cable and floor capability exist; cable low-position requirement is not expressible",
      contractGap:
        "Add cable_anchor_low requirement semantics and review whether direction creates a distinct exercise purpose.",
    },
    prerequisites: [
      "kneeling and hip tolerance",
      "reviewed overhead/diagonal shoulder range",
      "pelvis and cable-return control",
    ],
    sectionSuitability: "Potential activation or accessory use.",
    loadingProfile:
      "Cable-loaded, moderate loadability, high coordination/range, moderate local fatigue.",
    supportMechanics: "Half-kneeling floor support.",
    resistancePathMechanics:
      "Low-to-high diagonal cable path with adjustable line and per-side execution.",
    genericDemands: demandSet("cable-lift", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "moderate",
      coordination: "high",
      range: "high",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("cable-lift", {
      controlledRotationContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact low-to-high path, pelvis policy, range, and controlled return.",
          `Review cable woodchop context at ${PRIMARY_REVIEW_SOURCES.controlledRotation}.`,
        ],
        uncertainty:
          "Direction, shoulder elevation, and pelvis motion may make this materially distinct from the first chop.",
      },
    }),
    painStress: {
      currentTags: ["overhead_pressing"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure: "Loaded trunk rotation plus diagonal shoulder elevation.",
      contractFinding:
        "overhead_pressing is imperfect for a lift path and no current tag represents loaded trunk rotation.",
    },
    progressionAxes: ["load", "reps", "sets", "range", "tempo", "stance_control"],
    possibleTransitions: [
      transition(
        "half-kneeling-high-to-low-cable-chop",
        "Treat as a directional stimulus shift only when the request and reviewed path evidence justify it.",
      ),
    ],
    coachingPurpose:
      "Evaluate a low-to-high controlled-rotation direction after the first chop contract is stable.",
    prescription: {
      requiredUnits: ["sets", "reps_per_side", "load", "range", "tempo", "stance", "rest"],
      currentlyRepresentable: ["sets", "reps", "rangeInstruction", "tempo", "restSeconds"],
      contractGaps: ["structured side", "load", "stance", "rotation range", "low cable setup"],
    },
    phaseContexts: phaseContexts(["activation", "hypertrophy_accessory"]),
    phaseContextNeeds:
      "Review direction-specific activation/accessory evidence; upward path is not a phase progression.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "No protected-legacy relationship can establish Cable Lift as progression from chop or Pallof; it needs a new exact path review.",
      [PRIMARY_REVIEW_SOURCES.controlledRotation],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer directional expansion until one controlled-rotation definition and stress contract are accepted.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "controlled trunk rotation",
      secondaryFunctionExpressions: ["loaded bracing", "diagonal shoulder-control exposure"],
      capacityExpressions: [],
      sharedEvidenceClusters: ["one cable-load, diagonal path, and stance cluster"],
      doubleCreditRisk:
        "One set could become independent rotation, bracing, and shoulder-control units.",
      futureLedgerRule: oneSourceRule([
        "controlled rotation",
        "loaded bracing",
        "shoulder-control exposure",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "controlled_rotation_control",
      secondaryFunctionEvidence: "loaded bracing and shoulder-control path",
      capacityEvidence: "none",
      doseUnit: "sets x reps per side x load at range and tempo",
      fatigueStressEffect: "moderate trunk, shoulder, hip, and knee-contact fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule([
        "controlled rotation",
        "loaded bracing",
        "shoulder exposure",
      ]),
    },
    legacyClassification: "REQUIRES_NEW_STRUCTURED_METADATA",
    legacyEvidence:
      "Directional lift mechanics, shoulder range, and cable setup require new structured evidence.",
  },
  {
    id: "farmer-carry",
    displayName: "Bilateral Farmer Carry",
    exerciseFamily: "carry_load (new family review required)",
    movementRoles: ["carry", "loaded_bracing"],
    trainingRoles: ["secondary_strength", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["upper_back", "glutes"],
    bodyRegions: ["lumbar_spine", "pelvis", "hip", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["dumbbells", "loaded_gait_space"],
      optionalEquipment: [],
      setupCapability: "matched bilateral dumbbell loading with safe pickup, turn, and set-down area",
      spaceRequirement: "loaded_gait_space; ordinary floor_space is not accepted as a safe walkway",
      anchorRequirement: "none",
      loadRangeRequirement: "matched dumbbell pair in a reviewed usable range",
      supportRequirement: "unsupported standing and walking",
      currentDomainSupport: "dumbbell pair/max load exist; safe walkway and minimum usable paired load do not",
      contractGap:
        "Add loaded_gait_space and usable paired-load requirement semantics before implementation.",
    },
    prerequisites: [
      "bilateral grip and shoulder tolerance",
      "walking and turning control under matched load",
      "safe pickup and set-down skill",
    ],
    sectionSuitability:
      "Potential main, accessory, or capacity use; never a mandatory finisher.",
    loadingProfile:
      "Bilateral free load, high loadability, high grip demand, moderate trunk/systemic/gait fatigue.",
    supportMechanics: "Unsupported loaded walking with matched implements at both sides.",
    resistancePathMechanics:
      "Bilateral independent free implements with athlete-controlled gait path, turns, and set-down.",
    genericDemands: demandSet("farmer-carry", {
      trunk_control: "high",
      scapular_control: "low",
      stability: "moderate",
      coordination: "moderate",
      range: "moderate",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("farmer-carry", {
      antiLateralFlexionContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review lateral position control during matched bilateral loaded gait without assigning a direct lateral-control role.",
          `Review loaded carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Bilateral loading differs from unilateral suitcase demand and may be secondary only.",
      },
      loadedBracingContribution: {
        level: "high",
        evidenceBasis: [
          "Review trunk-position maintenance under matched bilateral loads during walking.",
          `Review loaded carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Load, gait duration, and fatigue change the expression level.",
      },
      gaitLoadTransferContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact loaded walking, turn, and set-down definition.",
          `Review loaded carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Distance, turns, surface, and speed are prescription facts outside a global profile.",
      },
    }),
    painStress: {
      currentTags: ["grip_intensive", "heavy_axial_loading"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure:
        "Bilateral loaded locomotion, grip, shoulder traction, axial load, and sustained bracing.",
      contractFinding:
        "Current tags are useful but do not identify loaded-carry locomotor exposure.",
    },
    progressionAxes: ["load", "distance", "time", "trips", "turns", "gait_control"],
    possibleTransitions: [
      transition(
        "front-rack-carry",
        "Only for a reviewed rack-position or stimulus need; not a universal progression.",
      ),
      transition(
        "wall-supported-suitcase-march",
        "Only for explicit space, gait, support, or load tolerance context.",
      ),
    ],
    coachingPurpose:
      "Provide the minimal bilateral loaded-gait and loaded-bracing candidate.",
    prescription: {
      requiredUnits: ["trips", "distance_or_time", "load", "rest", "gait_control_standard"],
      currentlyRepresentable: ["timeSeconds", "effortTarget", "restSeconds"],
      contractGaps: ["trips", "distance", "load", "turns", "gait control standard"],
    },
    phaseContexts: phaseContexts(["main", "hypertrophy_accessory", "capacity"]),
    phaseContextNeeds:
      "Review main, accessory, and capacity uses separately; loaded capacity is not automatically a Phase 3 or finisher rationale.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:2142-2158 preserves Farmer's Carry, but broad anti-rotation strings, timed-only dosage, and free-text pain are not authority.",
      [PRIMARY_REVIEW_SOURCES.carry],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "SELECTED_FOR_FIRST_IMPLEMENTATION",
    dispositionReason:
      "Adds the smallest bilateral carry and intentional loaded-bracing option with a different laterality profile from Suitcase Carry.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "carry or loaded bracing according to the requested role",
      secondaryFunctionExpressions: ["bilateral lateral-position control"],
      capacityExpressions: ["loaded gait", "grip", "trunk endurance"],
      sharedEvidenceClusters: [
        "one matched bilateral load and bracing cluster",
        "one loaded gait and grip cluster",
      ],
      doubleCreditRisk:
        "One trip could be counted as carry, gait, loaded bracing, lateral control, and grip independently.",
      futureLedgerRule: oneSourceRule([
        "carry",
        "loaded bracing",
        "lateral-position control",
        "gait",
        "grip capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "CAPACITY_EXPOSURE",
      directFunctionTarget: "carry or loaded_bracing by actual selected role",
      secondaryFunctionEvidence: "bilateral lateral-position control when reviewed",
      capacityEvidence: "loaded gait, grip, and trunk endurance",
      doseUnit: "trips x distance or time x bilateral load",
      fatigueStressEffect: "high grip and moderate trunk, shoulder traction, gait, and systemic fatigue",
      hypertrophyContribution: "not converted to direct trunk hypertrophy sets by default",
      gaitCarryContribution: "yes, as one bilateral loaded-gait event",
      doubleCreditControl: oneSourceRule([
        "carry",
        "loaded bracing",
        "gait",
        "grip",
      ]),
    },
    legacyClassification: "PRESERVE_AS_REVIEWED_DOMAIN_KNOWLEDGE",
    legacyEvidence:
      "Preserve the bilateral Farmer-versus-unilateral Suitcase distinction after structured review.",
  },
  {
    id: "front-rack-carry",
    displayName: "Bilateral Front-Rack Carry",
    exerciseFamily: "carry_load (new family review required)",
    movementRoles: ["carry", "loaded_bracing"],
    trainingRoles: ["secondary_strength", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["upper_back", "front_delts", "glutes"],
    bodyRegions: ["lumbar_spine", "ribcage", "pelvis", "hip", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["dumbbells", "loaded_gait_space"],
      optionalEquipment: [],
      setupCapability: "safe bilateral rack pickup, hold, turn, and set-down",
      spaceRequirement: "loaded_gait_space",
      anchorRequirement: "none",
      loadRangeRequirement: "matched dumbbell pair compatible with reviewed rack position",
      supportRequirement: "unsupported standing and walking in front-rack position",
      currentDomainSupport: "dumbbells exist; rack-position capability, safe walkway, and usable load thresholds do not",
      contractGap:
        "Add loaded_gait_space and rack-position prerequisite/setup truth before implementation.",
    },
    prerequisites: [
      "front-rack shoulder/wrist tolerance",
      "safe rack pickup and set-down skill",
      "walking/turning control under anterior load",
    ],
    sectionSuitability: "Potential main or capacity use after rack-position review.",
    loadingProfile:
      "Bilateral anterior load, high loadability, high upper-quarter and trunk demand, moderate systemic fatigue.",
    supportMechanics: "Unsupported loaded walking with implements held in front-rack position.",
    resistancePathMechanics:
      "Bilateral independent free implements held anteriorly through athlete-controlled gait.",
    genericDemands: demandSet("front-rack-carry", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "high",
      coordination: "moderate",
      range: "moderate",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("front-rack-carry", {
      antiExtensionContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review position control under an anterior bilateral rack load during walking.",
          `Review general loaded carry context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Rack height, load, and torso strategy can change anti-extension expression.",
      },
      loadedBracingContribution: {
        level: "high",
        evidenceBasis: [
          "Review trunk-position maintenance under bilateral anterior load.",
          `Review general loaded carry context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Upper-quarter rack demand shares the same source load and cannot become duplicate full credit.",
      },
      gaitLoadTransferContribution: {
        level: "high",
        evidenceBasis: [
          "Review the exact loaded gait, turn, and set-down definition.",
          `Review general loaded carry context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty: "Distance, turns, and surface remain prescription context.",
      },
    }),
    painStress: {
      currentTags: ["heavy_axial_loading", "grip_intensive"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure:
        "Anterior rack shoulder/wrist load, loaded locomotion, axial load, and sustained bracing.",
      contractFinding:
        "Loaded-carry locomotion and front-rack upper-quarter stress are not represented precisely.",
    },
    progressionAxes: ["load", "distance", "time", "trips", "turns"],
    possibleTransitions: [
      transition(
        "farmer-carry",
        "Only for an explicit rack-tolerance, equipment, fatigue, or stimulus reason.",
      ),
    ],
    coachingPurpose:
      "Provide a future anterior-load carry and bracing option with a distinct upper-quarter demand.",
    prescription: {
      requiredUnits: ["trips", "distance_or_time", "load", "rest", "gait_control_standard"],
      currentlyRepresentable: ["timeSeconds", "effortTarget", "restSeconds"],
      contractGaps: ["trips", "distance", "load", "rack position", "gait control standard"],
    },
    phaseContexts: phaseContexts(["main", "capacity"]),
    phaseContextNeeds:
      "Review rack-position and capacity contexts independently; anterior load does not imply later phase.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "The protected legacy carry family did not provide a reviewed front-rack contract.",
      [PRIMARY_REVIEW_SOURCES.carry],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer because Farmer Carry supplies bilateral coverage with fewer rack-position prerequisites and less first-tranche redundancy.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "carry or loaded bracing",
      secondaryFunctionExpressions: ["anti-extension position control", "upper-quarter rack control"],
      capacityExpressions: ["loaded gait", "grip", "rack endurance"],
      sharedEvidenceClusters: ["one anterior bilateral load and gait cluster"],
      doubleCreditRisk:
        "One trip could create independent carry, brace, anti-extension, rack, gait, and grip units.",
      futureLedgerRule: oneSourceRule([
        "carry",
        "loaded bracing",
        "anti-extension",
        "rack control",
        "gait/grip capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "CAPACITY_EXPOSURE",
      directFunctionTarget: "carry or loaded_bracing by actual role",
      secondaryFunctionEvidence: "anterior-load anti-extension and rack control",
      capacityEvidence: "loaded gait, grip, and rack endurance",
      doseUnit: "trips x distance or time x bilateral rack load",
      fatigueStressEffect: "high upper-quarter/grip and moderate trunk/systemic fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "yes, one loaded-gait event",
      doubleCreditControl: oneSourceRule([
        "carry",
        "loaded bracing",
        "rack control",
        "gait",
      ]),
    },
    legacyClassification: "REQUIRES_NEW_STRUCTURED_METADATA",
    legacyEvidence:
      "Front-rack position, upper-quarter prerequisites, and path require a new reviewed contract.",
  },
  {
    id: "front-rack-march",
    displayName: "Front-Rack March",
    exerciseFamily: "carry_load (new family review required)",
    movementRoles: ["carry", "loaded_bracing"],
    trainingRoles: ["activation", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["upper_back", "front_delts", "glutes"],
    bodyRegions: ["lumbar_spine", "ribcage", "pelvis", "hip", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["dumbbells", "stable_loaded_standing_space"],
      optionalEquipment: [],
      setupCapability: "safe bilateral rack pickup and stationary marching area",
      spaceRequirement: "stable_loaded_standing_space; no walkway required",
      anchorRequirement: "none",
      loadRangeRequirement: "matched pair compatible with reviewed rack and marching control",
      supportRequirement: "unsupported stationary marching",
      currentDomainSupport: "dumbbells exist; loaded stationary space and rack capability do not",
      contractGap:
        "Add stable_loaded_standing_space, rack-position prerequisites, and structured steps/side prescription.",
    },
    prerequisites: [
      "front-rack shoulder/wrist tolerance",
      "single-leg stance control under bilateral anterior load",
      "safe rack pickup/set-down skill",
    ],
    sectionSuitability: "Potential activation or capacity use.",
    loadingProfile:
      "Bilateral anterior load with stationary gait, moderate-high trunk/upper-quarter and coordination demand.",
    supportMechanics: "Unsupported stationary alternating march in bilateral front-rack position.",
    resistancePathMechanics:
      "Bilateral anterior free implements with alternating foot support and no travel distance.",
    genericDemands: demandSet("front-rack-march", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "high",
      coordination: "high",
      range: "moderate",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("front-rack-march", {
      antiExtensionContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review anterior-load position control during alternating march.",
          `Review loaded carry/march context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty: "Rack height, step height, and load change expression.",
      },
      antiRotationContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review alternating single-leg support under bilateral rack load.",
          `Review loaded carry/march context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Alternating stance does not automatically establish anti-rotation without review.",
      },
      loadedBracingContribution: {
        level: "high",
        evidenceBasis: [
          "Review trunk-position maintenance under bilateral anterior load during marching.",
          `Review loaded carry/march context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty: "Shared evidence with anti-extension, anti-rotation, and rack control.",
      },
      gaitLoadTransferContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review stationary alternating loaded gait without claiming distance carry.",
          `Review loaded carry/march context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Stationary marching provides gait-transfer exposure but no travel distance.",
      },
    }),
    painStress: {
      currentTags: ["heavy_axial_loading", "grip_intensive"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure:
        "Anterior rack load, stationary loaded gait, single-leg support, and upper-quarter demand.",
      contractFinding:
        "Loaded march and rack-position stress lack precise current tags.",
    },
    progressionAxes: ["load", "steps", "time", "sets", "march_height", "tempo"],
    possibleTransitions: [
      transition(
        "front-rack-carry",
        "Add travel only when safe walkway and gait context justify it.",
      ),
    ],
    coachingPurpose:
      "Provide future stationary anterior-load gait and brace capacity without requiring a walkway.",
    prescription: {
      requiredUnits: ["sets", "steps_or_time", "load", "side", "march_height", "tempo", "rest"],
      currentlyRepresentable: ["sets", "timeSeconds", "tempo", "restSeconds"],
      contractGaps: ["steps", "load", "side", "march height", "rack position"],
    },
    phaseContexts: phaseContexts(["activation", "capacity"]),
    phaseContextNeeds:
      "Review light activation separately from loaded capacity; support and capacity rationales cannot leak across uses.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Legacy brace marches preserve a stationary gait idea but not a bilateral front-rack setup or reliable role truth.",
      [PRIMARY_REVIEW_SOURCES.carry],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer because the selected wall-supported suitcase march supplies stationary regression coverage with less rack complexity.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "loaded bracing or loaded-march capacity",
      secondaryFunctionExpressions: ["anti-extension", "anti-rotation", "rack control"],
      capacityExpressions: ["stationary loaded gait", "grip", "single-leg support"],
      sharedEvidenceClusters: ["one bilateral rack load and alternating-step cluster"],
      doubleCreditRisk:
        "One march could become full bracing, anti-extension, anti-rotation, gait, grip, and balance credits.",
      futureLedgerRule: oneSourceRule([
        "loaded bracing",
        "anti-extension",
        "anti-rotation",
        "stationary gait",
        "grip/rack capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "CAPACITY_EXPOSURE",
      directFunctionTarget: "loaded bracing by actual role",
      secondaryFunctionEvidence: "anti-extension, anti-rotation, and rack control",
      capacityEvidence: "stationary loaded gait and grip",
      doseUnit: "sets x steps or time x bilateral rack load",
      fatigueStressEffect: "high upper-quarter and moderate trunk/single-leg fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "stationary gait capacity, not distance carry",
      doubleCreditControl: oneSourceRule([
        "loaded bracing",
        "stationary gait",
        "rack/grip capacity",
      ]),
    },
    legacyClassification: "PRESERVE_AFTER_HUMAN_REVIEW",
    legacyEvidence:
      "Preserve stationary loaded-march capacity only after fixing load position, steps, side, support, and role truth.",
  },
  {
    id: "front-rack-hold",
    displayName: "Bilateral Front-Rack Hold",
    exerciseFamily: "core_control",
    movementRoles: ["loaded_bracing"],
    trainingRoles: ["activation", "hypertrophy_accessory", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["upper_back", "front_delts"],
    bodyRegions: ["lumbar_spine", "ribcage", "pelvis", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["dumbbells", "stable_loaded_standing_space"],
      optionalEquipment: [],
      setupCapability: "safe bilateral rack pickup, static hold, and set-down",
      spaceRequirement: "stationary loaded standing area",
      anchorRequirement: "none",
      loadRangeRequirement: "matched pair compatible with reviewed rack position",
      supportRequirement: "unsupported standing hold",
      currentDomainSupport: "dumbbells exist; rack capability, stationary loaded space, and usable load thresholds do not",
      contractGap:
        "Add rack-position and loaded-standing capability plus structured hold/load prescription.",
    },
    prerequisites: [
      "front-rack shoulder/wrist tolerance",
      "safe pickup and set-down skill",
      "standing brace control under anterior load",
    ],
    sectionSuitability: "Potential activation, accessory, or capacity use.",
    loadingProfile:
      "Bilateral anterior static load, high loadability, moderate-high trunk/upper-quarter local fatigue.",
    supportMechanics: "Unsupported stationary standing in bilateral front-rack position.",
    resistancePathMechanics: "Static bilateral independent anterior free-implement hold.",
    genericDemands: demandSet("front-rack-hold", {
      trunk_control: "high",
      scapular_control: "moderate",
      stability: "moderate",
      coordination: "low",
      range: "low",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("front-rack-hold", {
      antiExtensionContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review static anterior-load position control.",
          "Do not infer anti-extension merely from the front-rack display name.",
        ],
        uncertainty: "Rack height, load, and torso strategy change expression.",
      },
      loadedBracingContribution: {
        level: "high",
        evidenceBasis: [
          "Review trunk-position maintenance under bilateral anterior external load.",
          `Review loaded hold context adjacent to ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty: "Shared evidence with anti-extension and rack control.",
      },
    }),
    painStress: {
      currentTags: ["heavy_axial_loading", "grip_intensive"],
      classification: "CURRENT_TAG_IMPERFECT_BUT_USABLE",
      relevantExposure: "Anterior rack, axial load, grip, and sustained bracing without locomotion.",
      contractFinding:
        "Current load/grip tags are usable; rack-position stress remains imprecise and sustained bracing itself needs no generic tag without a receiver.",
    },
    progressionAxes: ["load", "hold_duration", "sets", "effort"],
    possibleTransitions: [
      transition(
        "front-rack-march",
        "Add alternating gait only for an explicit capacity or control need.",
      ),
    ],
    coachingPurpose:
      "Provide future direct loaded bracing without gait when rack position is appropriate.",
    prescription: {
      requiredUnits: ["sets", "hold_duration", "load", "effort", "rest"],
      currentlyRepresentable: ["sets", "timeSeconds", "effortTarget", "restSeconds"],
      contractGaps: ["typed hold purpose", "load", "rack position"],
    },
    phaseContexts: phaseContexts(["activation", "hypertrophy_accessory", "capacity"]),
    phaseContextNeeds:
      "Review activation, accessory, and capacity holds separately; a static regression rationale cannot leak into heavy accessory use.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "No exact protected-legacy front-rack hold contract was accepted; adjacent carry rows are migration context only.",
      [PRIMARY_REVIEW_SOURCES.carry],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer because Farmer and Suitcase Carry already cover intentional loaded bracing in the minimum and rack demands add complexity.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "loaded bracing",
      secondaryFunctionExpressions: ["anti-extension", "rack control"],
      capacityExpressions: ["static grip and brace endurance"],
      sharedEvidenceClusters: ["one bilateral anterior static-load cluster"],
      doubleCreditRisk:
        "One hold could become bracing, anti-extension, rack, and grip units.",
      futureLedgerRule: oneSourceRule([
        "loaded bracing",
        "anti-extension",
        "rack/grip capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "loaded_bracing_control",
      secondaryFunctionEvidence: "anti-extension and rack control",
      capacityEvidence: "static brace and grip endurance",
      doseUnit: "sets x hold duration x bilateral rack load",
      fatigueStressEffect: "moderate-high upper-quarter and trunk fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule([
        "loaded bracing",
        "anti-extension",
        "rack/grip capacity",
      ]),
    },
    legacyClassification: "REQUIRES_NEW_STRUCTURED_METADATA",
    legacyEvidence:
      "Static rack bracing requires a new exact identity, setup, prescription, and stress contract.",
  },
  {
    id: "goblet-brace-hold",
    displayName: "Goblet Brace Hold",
    exerciseFamily: "core_control",
    movementRoles: ["loaded_bracing"],
    trainingRoles: ["activation", "hypertrophy_accessory", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["front_delts", "upper_back"],
    bodyRegions: ["lumbar_spine", "ribcage", "pelvis", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["dumbbells", "stable_loaded_standing_space"],
      optionalEquipment: [],
      setupCapability: "single dumbbell held at chest with safe pickup and set-down",
      spaceRequirement: "stationary loaded standing area",
      anchorRequirement: "none",
      loadRangeRequirement: "one dumbbell in a usable anterior-hold range",
      supportRequirement: "unsupported standing hold",
      currentDomainSupport: "dumbbells exist; loaded standing space and minimum usable load do not",
      contractGap:
        "Add loaded-standing and usable-load requirements plus structured hold/load prescription.",
    },
    prerequisites: [
      "can safely lift and hold a dumbbell at chest height",
      "shoulder/wrist tolerance for goblet position",
      "standing brace control",
    ],
    sectionSuitability: "Potential activation, accessory, or capacity use.",
    loadingProfile:
      "Single anterior load, moderate loadability, low coordination, moderate trunk/arm local fatigue.",
    supportMechanics: "Unsupported standing with one dumbbell held centrally at chest.",
    resistancePathMechanics: "Static central anterior free-implement hold.",
    genericDemands: demandSet("goblet-brace-hold", {
      trunk_control: "high",
      scapular_control: "low",
      stability: "moderate",
      coordination: "low",
      range: "low",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("goblet-brace-hold", {
      antiExtensionContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review static anterior-load position control.",
          "Do not infer anti-extension from the exercise label or from Goblet Squat metadata.",
        ],
        uncertainty: "Load position and torso strategy change expression.",
      },
      loadedBracingContribution: {
        level: "high",
        evidenceBasis: [
          "Review trunk-position maintenance under a central anterior external load.",
          "Review independently from the unresolved Goblet Squat bracing proposal.",
        ],
        uncertainty: "Shared evidence with anti-extension and arm support.",
      },
    }),
    painStress: {
      currentTags: ["heavy_axial_loading", "grip_intensive"],
      classification: "CURRENT_TAG_IMPERFECT_BUT_USABLE",
      relevantExposure: "Anterior load, arm/grip support, and sustained bracing.",
      contractFinding:
        "Current tags are usable at reviewed loads; sustained bracing needs no standalone stress tag without a receiver.",
    },
    progressionAxes: ["load", "hold_duration", "sets", "effort"],
    possibleTransitions: [
      transition(
        "front-rack-hold",
        "Only for a real load-position, equipment, or progression need.",
      ),
    ],
    coachingPurpose:
      "Offer future central anterior loaded bracing with simpler handling than a front rack.",
    prescription: {
      requiredUnits: ["sets", "hold_duration", "load", "effort", "rest"],
      currentlyRepresentable: ["sets", "timeSeconds", "effortTarget", "restSeconds"],
      contractGaps: ["typed hold purpose", "load", "load position"],
    },
    phaseContexts: phaseContexts(["activation", "hypertrophy_accessory", "capacity"]),
    phaseContextNeeds:
      "Review light activation, loaded accessory, and capacity holds separately.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Current V2 Goblet Squat has unresolved loaded-bracing mechanics and cannot authorize a separate Goblet Hold profile.",
      [],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer because selected carries already cover loaded bracing and this hold would add overlapping exposure before hold prescription is structured.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "loaded bracing",
      secondaryFunctionExpressions: ["anti-extension", "arm-supported load control"],
      capacityExpressions: ["static brace and grip endurance"],
      sharedEvidenceClusters: ["one central anterior static-load cluster"],
      doubleCreditRisk:
        "One hold could become loaded-bracing, anti-extension, arm, and grip units.",
      futureLedgerRule: oneSourceRule([
        "loaded bracing",
        "anti-extension",
        "arm/grip capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "DIRECT_DEVELOPMENTAL",
      directFunctionTarget: "loaded_bracing_control",
      secondaryFunctionEvidence: "anti-extension and load-position control",
      capacityEvidence: "static brace and grip endurance",
      doseUnit: "sets x hold duration x load",
      fatigueStressEffect: "moderate trunk and arm/grip fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "none",
      doubleCreditControl: oneSourceRule([
        "loaded bracing",
        "anti-extension",
        "grip capacity",
      ]),
    },
    legacyClassification: "REQUIRES_NEW_STRUCTURED_METADATA",
    legacyEvidence:
      "The concept cannot inherit unresolved Goblet Squat mechanics and needs its own hold identity.",
  },
  {
    id: "wall-supported-suitcase-march",
    displayName: "Wall-Supported Suitcase March",
    exerciseFamily: "carry_load (new family review required)",
    movementRoles: ["carry", "anti_lateral_flexion_core", "loaded_bracing"],
    trainingRoles: ["activation", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["glutes", "upper_back"],
    bodyRegions: ["lumbar_spine", "pelvis", "hip", "shoulder", "wrist"],
    equipment: {
      requiredEquipment: ["dumbbells", "wall", "stable_loaded_standing_space"],
      optionalEquipment: [],
      setupCapability: "one-hand light wall support, contralateral suitcase load, and stationary marching area",
      spaceRequirement: "stable_loaded_standing_space; no loaded walkway required",
      anchorRequirement: "stable wall support only; no resistance anchor",
      loadRangeRequirement: "one dumbbell in a reviewed regression range",
      supportRequirement: "light wall balance support that does not unload trunk purpose",
      currentDomainSupport: "dumbbells and wall exist; loaded standing space, side assignment, and usable load do not",
      contractGap:
        "Add stable_loaded_standing_space, structured side/support/load, and loaded-march prescription; do not call floor_space a safe carry space.",
    },
    prerequisites: [
      "grip and shoulder tolerance for unilateral load",
      "single-leg march tolerance with light wall support",
      "can use wall support without collapsing into it",
    ],
    sectionSuitability:
      "Potential supported activation or stationary capacity use; not a distance carry.",
    loadingProfile:
      "Unilateral external load with external balance support, moderate trunk/grip/stability demand, low-moderate systemic fatigue.",
    supportMechanics:
      "One hand lightly supported on wall while the opposite hand holds a dumbbell and legs alternate in place.",
    resistancePathMechanics:
      "Unilateral free implement with stationary alternating gait and external balance support.",
    genericDemands: demandSet("wall-supported-suitcase-march", {
      trunk_control: "high",
      scapular_control: "low",
      stability: "moderate",
      coordination: "moderate",
      range: "moderate",
      joint_control: "moderate",
    }),
    trunkMechanicsProfile: trunkProfile("wall-supported-suitcase-march", {
      antiLateralFlexionContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review the exact contralateral wall-support and suitcase-load arrangement.",
          `Review hold/carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Support force and load determine whether lateral control remains meaningful.",
      },
      antiRotationContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review alternating march under unilateral load and wall support.",
          `Review hold/carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Alternating gait and unilateral loading do not independently settle anti-rotation.",
      },
      loadedBracingContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review trunk-position maintenance under unilateral external load with light balance support.",
          `Review hold/carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Support may reduce demand and shares evidence with lateral/rotational control.",
      },
      gaitLoadTransferContribution: {
        level: "moderate",
        evidenceBasis: [
          "Review stationary alternating loaded gait while preserving no-distance semantics.",
          `Review hold/carry comparisons at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Stationary march is gait-transfer exposure but cannot satisfy a distance target.",
      },
    }),
    painStress: {
      currentTags: ["grip_intensive", "heavy_axial_loading"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure:
        "Supported unilateral lateral load, stationary loaded gait, grip, shoulder traction, and bracing.",
      contractFinding:
        "Lateral trunk loading and loaded-march locomotor exposure require reviewed tags; wall support is not a generic pain bonus.",
    },
    progressionAxes: ["load", "steps", "time", "support_reduction", "march_height", "tempo", "side"],
    possibleTransitions: [
      transition(
        "suitcase-carry",
        "Remove support and add travel only when space, gait, grip, load, and tolerance evidence justify it.",
      ),
      transition(
        "suitcase-hold",
        "Remove marching only for an explicit gait or balance reason.",
      ),
    ],
    coachingPurpose:
      "Provide a stationary, supported unilateral loaded-march regression without pretending it is a distance carry.",
    prescription: {
      requiredUnits: ["sets", "steps_or_time", "load", "side", "support", "march_height", "tempo", "rest"],
      currentlyRepresentable: ["sets", "timeSeconds", "supportInstruction", "tempo", "restSeconds"],
      contractGaps: ["steps", "load", "side", "support level", "march height", "stationary gait standard"],
    },
    phaseContexts: phaseContexts(["preparation", "activation", "capacity"]),
    phaseContextNeeds:
      "Review supported preparation/activation separately from loaded capacity; support regression evidence cannot leak into heavier use.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "Golden exercises.ts:273-289 and 4661-4717 preserve wall-supported/brace march ideas but use no external load or exact support-side contract.",
      [PRIMARY_REVIEW_SOURCES.carry],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "SELECTED_FOR_FIRST_IMPLEMENTATION",
    dispositionReason:
      "Supplies the minimal supported stationary carry-family regression and a little-space alternative without duplicating a distance carry.",
    multiFunctionCredit: {
      primaryTrainingPurpose:
        "supported carry regression, anti-lateral-flexion, or loaded bracing according to role",
      secondaryFunctionExpressions: ["anti-rotation", "the non-primary reviewed trunk functions"],
      capacityExpressions: ["stationary loaded gait", "grip", "single-leg support"],
      sharedEvidenceClusters: [
        "one unilateral load and wall-support cluster",
        "one alternating stationary-gait cluster",
      ],
      doubleCreditRisk:
        "One march could be counted as carry, lateral control, anti-rotation, loaded bracing, gait, grip, and balance independently.",
      futureLedgerRule: oneSourceRule([
        "supported carry regression",
        "lateral/rotational control",
        "loaded bracing",
        "stationary gait",
        "grip capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "CAPACITY_EXPOSURE",
      directFunctionTarget: "actual selected role among carry, lateral control, and loaded bracing",
      secondaryFunctionEvidence: "remaining reviewed trunk characteristics",
      capacityEvidence: "stationary loaded gait, grip, and supported single-leg control",
      doseUnit: "sets x steps or time x load per side at support level",
      fatigueStressEffect: "moderate grip/trunk and low-moderate supported gait fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "stationary carry-family capacity, never distance credit",
      doubleCreditControl: oneSourceRule([
        "lateral control",
        "loaded bracing",
        "stationary gait",
        "grip",
      ]),
    },
    legacyClassification: "PRESERVE_AFTER_HUMAN_REVIEW",
    legacyEvidence:
      "Preserve the supported regression idea after adding an exact external load, support side, march, and no-distance contract.",
  },
  {
    id: "overhead-carry",
    displayName: "Bilateral Overhead Carry",
    exerciseFamily: "carry_load (new family review required)",
    movementRoles: ["carry", "loaded_bracing"],
    trainingRoles: ["secondary_strength", "capacity"],
    primaryMuscles: ["trunk"],
    secondaryMuscles: ["serratus", "rotator_cuff", "front_delts"],
    bodyRegions: ["lumbar_spine", "ribcage", "pelvis", "hip", "shoulder", "elbow", "wrist"],
    equipment: {
      requiredEquipment: ["dumbbells", "loaded_gait_space"],
      optionalEquipment: [],
      setupCapability: "safe overhead lockout, pickup/press, walking, turn, and set-down",
      spaceRequirement: "loaded_gait_space plus overhead clearance",
      anchorRequirement: "none",
      loadRangeRequirement: "matched pair compatible with sustained overhead control",
      supportRequirement: "unsupported standing/walking with bilateral overhead load",
      currentDomainSupport: "dumbbells exist; overhead clearance, safe walkway, and lockout prerequisites do not",
      contractGap:
        "Add loaded_gait_space, overhead clearance, lockout capability, and load/side prescription before reconsideration.",
    },
    prerequisites: [
      "reviewed shoulder/scapular overhead control",
      "elbow/wrist lockout tolerance",
      "safe press/pickup and set-down skill",
      "walking/turning control under overhead load",
    ],
    sectionSuitability: "Potential capacity use only after substantial prerequisite review.",
    loadingProfile:
      "Bilateral overhead free load, high shoulder/scapular/stability demand, moderate-high systemic fatigue.",
    supportMechanics: "Unsupported loaded walking with both implements overhead.",
    resistancePathMechanics:
      "Bilateral independent overhead free implements through athlete-controlled gait.",
    genericDemands: demandSet("overhead-carry", {
      trunk_control: "high",
      scapular_control: "high",
      stability: "high",
      coordination: "high",
      range: "high",
      joint_control: "high",
    }),
    trunkMechanicsProfile: trunkProfile("overhead-carry", {
      antiExtensionContribution: {
        level: "high",
        evidenceBasis: [
          "Review trunk position under bilateral overhead load during gait.",
          `Review loaded carry context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Shoulder range, ribcage strategy, load, and fatigue materially change expression.",
      },
      loadedBracingContribution: {
        level: "high",
        evidenceBasis: [
          "Review trunk-position maintenance under bilateral overhead load.",
          `Review loaded carry context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty:
          "Shared evidence with anti-extension and loaded scapular control.",
      },
      gaitLoadTransferContribution: {
        level: "high",
        evidenceBasis: [
          "Review loaded walking, turns, and set-down with overhead clearance.",
          `Review loaded carry context at ${PRIMARY_REVIEW_SOURCES.carry}.`,
        ],
        uncertainty: "Distance and surface remain prescription context.",
      },
    }),
    painStress: {
      currentTags: ["overhead_pressing", "grip_intensive", "heavy_axial_loading"],
      classification: "NEW_TAG_REVIEW_REQUIRED",
      relevantExposure:
        "Sustained overhead shoulder/scapular load, loaded locomotion, grip, and bracing.",
      contractFinding:
        "Current tags are imperfect; sustained overhead carrying and loaded locomotion need review beyond overhead_pressing.",
    },
    progressionAxes: ["load", "distance", "time", "trips", "turns", "overhead_control"],
    possibleTransitions: [
      transition(
        "farmer-carry",
        "Use only when overhead prerequisites or tolerance justify a lower-position carry; not an automatic regression ladder.",
      ),
    ],
    coachingPurpose:
      "Evaluate a later overhead loaded-gait option only after shoulder/scapular and space contracts mature.",
    prescription: {
      requiredUnits: ["trips", "distance_or_time", "load", "rest", "overhead_control_standard"],
      currentlyRepresentable: ["timeSeconds", "effortTarget", "restSeconds"],
      contractGaps: ["trips", "distance", "load", "overhead standard", "turns", "gait standard"],
    },
    phaseContexts: phaseContexts(["capacity"]),
    phaseContextNeeds:
      "Review capacity-only use with explicit prerequisites; overhead and instability are not later-phase proof.",
    reviewStatus: "PROPOSAL_ONLY_OWNER_REVIEW_REQUIRED",
    provenancePlan: provenancePlan(
      "The protected legacy carry concepts do not provide reviewed overhead prerequisites, stress, or space truth.",
      [PRIMARY_REVIEW_SOURCES.carry],
    ),
    selectionBasis: "EXACT_MOVEMENT_DEFINITION_AND_REVIEW",
    disposition: "DEFERRED_FOR_LATER",
    dispositionReason:
      "Defer from the first tranche because shoulder/scapular prerequisites, overhead stress, clearance, and loaded-gait contracts are materially broader.",
    multiFunctionCredit: {
      primaryTrainingPurpose: "overhead carry capacity",
      secondaryFunctionExpressions: [
        "anti-extension",
        "loaded bracing",
        "loaded scapular control",
      ],
      capacityExpressions: ["loaded gait", "grip", "overhead endurance"],
      sharedEvidenceClusters: ["one overhead bilateral load and gait cluster"],
      doubleCreditRisk:
        "One trip could become carry, gait, anti-extension, bracing, scapular, grip, and overhead-capacity units.",
      futureLedgerRule: oneSourceRule([
        "carry",
        "anti-extension",
        "loaded bracing",
        "scapular control",
        "gait/grip/overhead capacity",
      ]),
    },
    ledgerHandoff: {
      possibleLane: "CAPACITY_EXPOSURE",
      directFunctionTarget: "carry and loaded bracing by actual role",
      secondaryFunctionEvidence: "anti-extension and loaded scapular control",
      capacityEvidence: "loaded gait, grip, and overhead endurance",
      doseUnit: "trips x distance or time x bilateral overhead load",
      fatigueStressEffect: "high shoulder/scapular/grip and moderate-high systemic/trunk fatigue",
      hypertrophyContribution: "not direct trunk hypertrophy volume by default",
      gaitCarryContribution: "yes, one overhead loaded-gait event",
      doubleCreditControl: oneSourceRule([
        "carry",
        "loaded bracing",
        "scapular control",
        "gait/grip capacity",
      ]),
    },
    legacyClassification: "REQUIRES_NEW_STRUCTURED_METADATA",
    legacyEvidence:
      "Overhead carry requires new prerequisite, clearance, stress, path, and capacity evidence.",
  },
];

export type SelectedMinimalTrunkCarryCandidateId =
  (typeof SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE)[number];

export interface RequiredGapCoverage {
  readonly gap: string;
  readonly status: "ADDRESSED_BY_SELECTED_TRANCHE" | "EXPLICITLY_UNRESOLVED";
  readonly candidates: readonly string[];
  readonly finding: string;
}

export interface SelectedCandidateRationale {
  readonly candidateId: SelectedMinimalTrunkCarryCandidateId;
  readonly whyIncluded: string;
  readonly gapClosed: string;
  readonly competingOptionDeferred: string;
  readonly equipmentCoverage: string;
  readonly progressionRunway: string;
  readonly painStressReadiness: string;
  readonly catalogAmbiguity: string;
  readonly humanReviewRequired: string;
}

export interface EquipmentAuditFinding {
  readonly capability: string;
  readonly currentSupport: string;
  readonly selectedCandidates: readonly string[];
  readonly finding: string;
  readonly contractAction: string;
}

export interface StressVocabularyFinding {
  readonly exposure: string;
  readonly classification: ContractGapClassification;
  readonly currentTags: string;
  readonly finding: string;
}

export interface CandidatePoolAdequacy {
  readonly movementRole: MovementRole;
  readonly prospectiveCandidates: readonly string[];
  readonly classification:
    | "SINGLE_CANDIDATE_BOOTSTRAP"
    | "MINIMAL_COMPARABLE_POOL"
    | "INSUFFICIENT_POOL"
    | "OVERLAPPING_REDUNDANCY";
  readonly limitation: string;
}

export interface AssessmentHandoff {
  readonly feature: string;
  readonly candidateCoverage: readonly string[];
  readonly mechanicsCoverage: string;
  readonly missingChallengeEvidence: string;
  readonly potentialTargetFitUse: string;
  readonly remainingGap: string;
}

export interface PersonaReviewRow {
  readonly persona: string;
  readonly statuses: Readonly<
    Record<SelectedMinimalTrunkCarryCandidateId, PersonaCandidateStatus>
  >;
  readonly finding: string;
}

export interface MinimalTrunkCarryCatalogProposalData {
  readonly goldenAncestor: string;
  readonly candidates: readonly ProposedExerciseContract[];
  readonly requiredGapCoverage: readonly RequiredGapCoverage[];
  readonly selectedRationales: readonly SelectedCandidateRationale[];
  readonly equipmentAudit: readonly EquipmentAuditFinding[];
  readonly stressVocabularyAudit: readonly StressVocabularyFinding[];
  readonly candidatePoolAdequacy: readonly CandidatePoolAdequacy[];
  readonly assessmentHandoff: readonly AssessmentHandoff[];
  readonly personaReview: readonly PersonaReviewRow[];
  readonly roleMechanicsDoctrine: readonly string[];
  readonly transitionDoctrine: readonly string[];
  readonly rejectedLegacyPolicies: readonly string[];
  readonly implementationDependencies: readonly string[];
  readonly explicitUncertainties: readonly string[];
  readonly behaviorBoundary: {
    readonly referenceCatalogFingerprint: string;
    readonly referenceCatalogMatches: boolean;
    readonly rankingFingerprint: string;
    readonly rankingMatches: boolean;
    readonly comprehensiveBehaviorFingerprint: string;
    readonly comprehensiveBehaviorMatches: boolean;
  };
  readonly classification: "TRUNK_CARRY_CONTRACT_FIXES_REQUIRED";
}

const REQUIRED_GAP_COVERAGE: readonly RequiredGapCoverage[] = [
  {
    gap: "later anti-extension progression beyond Dead Bug",
    status: "ADDRESSED_BY_SELECTED_TRANCHE",
    candidates: ["forearm-plank"],
    finding:
      "Forearm Plank adds a later bodyweight lever/duration option while keeping Long-Lever Plank inside same-exercise progression.",
  },
  {
    gap: "externally loadable dynamic anti-extension",
    status: "EXPLICITLY_UNRESOLVED",
    candidates: ["stability-ball-rollout", "ab-wheel-rollout", "barbell-rollout"],
    finding:
      "All rollout choices remain deferred until equipment, rolling path, shoulder/wrist stress, range, and prerequisite contracts are accepted.",
  },
  {
    gap: "anti-lateral flexion",
    status: "ADDRESSED_BY_SELECTED_TRANCHE",
    candidates: ["forearm-side-plank", "suitcase-carry", "wall-supported-suitcase-march"],
    finding:
      "The tranche provides one no-carry floor option, one unsupported loaded-gait option, and one supported stationary loaded-march option.",
  },
  {
    gap: "controlled trunk flexion / abdominal shortening",
    status: "ADDRESSED_BY_SELECTED_TRANCHE",
    candidates: ["machine-abdominal-crunch"],
    finding:
      "Machine Abdominal Crunch is a deliberately reported single-candidate gym bootstrap pending a bodyweight/home alternative.",
  },
  {
    gap: "controlled trunk rotation",
    status: "ADDRESSED_BY_SELECTED_TRANCHE",
    candidates: ["half-kneeling-high-to-low-cable-chop"],
    finding:
      "Half-Kneeling High-to-Low Cable Chop is a single-candidate bootstrap with a constrained stance; it remains distinct from Pallof anti-rotation.",
  },
  {
    gap: "loaded bracing as intentional selection purpose",
    status: "ADDRESSED_BY_SELECTED_TRANCHE",
    candidates: ["farmer-carry", "suitcase-carry", "wall-supported-suitcase-march"],
    finding:
      "Each candidate has an explicit proposed loaded_bracing role; compound secondary mechanics are not used to manufacture legality.",
  },
  {
    gap: "bilateral carry",
    status: "ADDRESSED_BY_SELECTED_TRANCHE",
    candidates: ["farmer-carry"],
    finding: "Farmer Carry is the minimal bilateral loaded-gait bootstrap.",
  },
  {
    gap: "unilateral carry",
    status: "ADDRESSED_BY_SELECTED_TRANCHE",
    candidates: ["suitcase-carry"],
    finding: "Suitcase Carry is the minimal unilateral loaded-gait bootstrap.",
  },
  {
    gap: "supported/static/march carry-family regression",
    status: "ADDRESSED_BY_SELECTED_TRANCHE",
    candidates: ["wall-supported-suitcase-march"],
    finding:
      "Wall-Supported Suitcase March is stationary and supported, so it provides no distance credit and does not require a walkway.",
  },
  {
    gap: "capacity-role trunk/gait work",
    status: "ADDRESSED_BY_SELECTED_TRANCHE",
    candidates: ["farmer-carry", "suitcase-carry", "wall-supported-suitcase-march"],
    finding:
      "The three carry-family candidates propose capacity roles without making carries mandatory filler.",
  },
];

const SELECTED_RATIONALES: readonly SelectedCandidateRationale[] = [
  {
    candidateId: "forearm-plank",
    whyIncluded: "Adds one familiar equipment-light anti-extension comparison after Dead Bug.",
    gapClosed: "Later bodyweight anti-extension lever and timed-control runway.",
    competingOptionDeferred:
      "Rollouts need new implement/rolling setup and shoulder-wrist stress contracts; Long-Lever Plank is a prescription variant.",
    equipmentCoverage: "bodyweight plus existing floor_space",
    progressionRunway: "duration, lever, support reduction, and effort inside one identity",
    painStressReadiness:
      "long_lever_core exists; sustained upper-limb weight-bearing review remains required",
    catalogAmbiguity: "Forearm support and ordinary full-lever setup must be fixed.",
    humanReviewRequired: "anti-extension profile, shoulder-support stress, prerequisites, and phase contexts",
  },
  {
    candidateId: "forearm-side-plank",
    whyIncluded: "Provides direct lateral trunk control without grip, load, or walking space.",
    gapClosed: "Anti-lateral-flexion role plus a bodyweight alternative to suitcase loading.",
    competingOptionDeferred:
      "Bent-Knee Side Plank is retained as lever/support progression rather than a duplicate row.",
    equipmentCoverage: "bodyweight plus existing floor_space",
    progressionRunway: "duration, lever, support, side, and later optional load",
    painStressReadiness:
      "lateral trunk and upper-limb weight-bearing tags need review",
    catalogAmbiguity: "Side, knee support, and lever belong in prescription rather than separate IDs.",
    humanReviewRequired: "lateral and rotational mechanics, shoulder support, side, and contextual use",
  },
  {
    candidateId: "machine-abdominal-crunch",
    whyIncluded: "Offers the cleanest first direct progressively overloadable shortening/flexion definition.",
    gapClosed: "Controlled trunk flexion and direct gym-loadable accessory work.",
    competingOptionDeferred:
      "Cable crunch has anchor/pelvis ambiguity; Reverse Crunch and Hanging Knee Raise need hip-versus-trunk function review.",
    equipmentCoverage: "selectorized gym machine",
    progressionRunway: "load, reps, sets, range, tempo, and effort",
    painStressReadiness: "loaded_spinal_flexion is sufficient after exercise mapping review",
    catalogAmbiguity: "Generic machine capability cannot prove fit, pivot, pad, or range.",
    humanReviewRequired: "machine identity/fit, controlled-flexion mechanics, load/range, and accessory context",
  },
  {
    candidateId: "half-kneeling-high-to-low-cable-chop",
    whyIncluded: "Creates the clearest first controlled-rotation definition by constraining stance variability.",
    gapClosed: "Intentional controlled trunk rotation, separate from resisting rotation.",
    competingOptionDeferred:
      "Standing Chop has more pelvis/hip ambiguity; Band Chop and Cable Lift add path/tension/direction questions.",
    equipmentCoverage: "commercial-gym cable stack",
    progressionRunway: "load, reps, sets, range, tempo, and stance control",
    painStressReadiness: "new loaded_trunk_rotation tag review is required",
    catalogAmbiguity: "High cable anchor, side, pelvis policy, and kneeling support need structured facts.",
    humanReviewRequired: "rotation range, pelvis/hip policy, stress mapping, and activation versus accessory use",
  },
  {
    candidateId: "farmer-carry",
    whyIncluded: "Provides the simplest bilateral loaded-gait and bracing candidate.",
    gapClosed: "Bilateral carry, loaded bracing, gait, and capacity.",
    competingOptionDeferred:
      "Front-rack and overhead carries add upper-quarter prerequisites without a first-tranche coverage gain.",
    equipmentCoverage: "dumbbell pair plus proposed loaded_gait_space",
    progressionRunway: "load, distance/time, trips, turns, and gait control",
    painStressReadiness:
      "grip/heavy-load tags exist; loaded-carry locomotor tag review remains required",
    catalogAmbiguity: "Safe walkway and usable paired load cannot be inferred from current capabilities.",
    humanReviewRequired: "bracing/gait profile, load handling, walkway, fatigue, and capacity context",
  },
  {
    candidateId: "suitcase-carry",
    whyIncluded: "Provides the minimal unilateral carry and loaded lateral-control comparison.",
    gapClosed: "Unilateral carry, anti-lateral-flexion, loaded bracing, gait, and capacity.",
    competingOptionDeferred:
      "Suitcase Hold remains a static mode pending identity/prescription decisions; front-rack options add complexity.",
    equipmentCoverage: "one dumbbell plus proposed loaded_gait_space",
    progressionRunway: "load, distance/time, trips, turns, side, and gait control",
    painStressReadiness:
      "lateral trunk loading and loaded-carry locomotion need new tag review",
    catalogAmbiguity: "Side, safe walkway, turning, and unilateral usable load are not current capabilities.",
    humanReviewRequired: "multi-function roles, shared evidence, stress, prerequisites, dose, and capacity context",
  },
  {
    candidateId: "wall-supported-suitcase-march",
    whyIncluded: "Adds one supported stationary regression for little-space and lower-balance contexts.",
    gapClosed: "Supported carry-family regression and stationary loaded-gait capacity.",
    competingOptionDeferred:
      "Front-Rack March adds rack prerequisites; unloaded legacy brace marches do not satisfy loaded-bracing truth.",
    equipmentCoverage: "one dumbbell, wall, and proposed stable loaded standing space",
    progressionRunway: "load, steps/time, support reduction, march height, tempo, and side",
    painStressReadiness:
      "lateral loading and loaded-march tags need review; wall support creates no automatic pain bonus",
    catalogAmbiguity: "Support side, load side, support force, steps, and no-distance semantics must be explicit.",
    humanReviewRequired: "support/load arrangement, gait mechanics, stress, prescription, and regression context",
  },
];

const EQUIPMENT_AUDIT: readonly EquipmentAuditFinding[] = [
  {
    capability: "bodyweight / floor",
    currentSupport: "bodyweight and floor_space are explicit",
    selectedCandidates: ["forearm-plank", "forearm-side-plank"],
    finding: "Sufficient for stationary floor legality, not for lever/side/hold prescription.",
    contractAction: "Keep equipment capability; add prescription semantics rather than new near-duplicate exercises.",
  },
  {
    capability: "wall support",
    currentSupport: "wall is explicit",
    selectedCandidates: ["wall-supported-suitcase-march"],
    finding:
      "Wall presence, support side, and support degree are representable by structured prescription semantics.",
    contractAction:
      "Use structured support-side/level prescription during owner curation rather than approving production metadata from equipment truth alone.",
  },
  {
    capability: "dumbbells and load range",
    currentSupport: "availability and maxPairWeightKg exist",
    selectedCandidates: ["farmer-carry", "suitcase-carry", "wall-supported-suitcase-march"],
    finding: "EquipmentRequirement cannot require a usable paired or unilateral load threshold.",
    contractAction: "Add load-range requirement semantics without embedding a universal load target.",
  },
  {
    capability: "cable anchor height",
    currentSupport: "CableCapability.adjustableHeight exists but EquipmentRequirement exposes only cable_stack",
    selectedCandidates: ["half-kneeling-high-to-low-cable-chop"],
    finding: "A high cable position cannot be hard-verified today.",
    contractAction: "Add cable_anchor_high/low requirement semantics or an equivalent setup capability.",
  },
  {
    capability: "selectorized abdominal-crunch machine",
    currentSupport: "selectorized_machine and a closed MachineId union exist",
    selectedCandidates: ["machine-abdominal-crunch"],
    finding: "abdominal_crunch is not a MachineId; generic machine presence is not enough.",
    contractAction: "Add machine:abdominal_crunch with reviewed fit/setup dependency.",
  },
  {
    capability: "loaded gait space",
    currentSupport: "absent",
    selectedCandidates: ["farmer-carry", "suitcase-carry"],
    finding: "floor_space does not prove a safe loaded walkway, turns, or set-down zone.",
    contractAction: "Add loaded_gait_space (or safe_walkway) as a distinct hard equipment/setup capability.",
  },
  {
    capability: "stable loaded standing space",
    currentSupport: "absent",
    selectedCandidates: ["wall-supported-suitcase-march"],
    finding: "A stationary loaded march needs clear stable standing area but not a walkway.",
    contractAction: "Add stable_loaded_standing_space or define an equivalent setup requirement explicitly.",
  },
  {
    capability: "rollout implements and rolling setup",
    currentSupport: "stability_ball, ab_wheel, and rollable_plate_setup are absent",
    selectedCandidates: [],
    finding: "Barbell availability does not prove rollable plates/surface; floor_space does not prove a safe rolling path.",
    contractAction: "Defer all rollout candidates until the chosen implement/setup contract is reviewed.",
  },
];

const STRESS_VOCABULARY_AUDIT: readonly StressVocabularyFinding[] = [
  {
    exposure: "loaded trunk rotation",
    classification: "NEW_TAG_REVIEW_REQUIRED",
    currentTags: "none",
    finding:
      "No current tag distinguishes intentional loaded rotation; loaded_spinal_flexion/extension must not be repurposed.",
  },
  {
    exposure: "lateral trunk loading",
    classification: "NEW_TAG_REVIEW_REQUIRED",
    currentTags: "long_lever_core and heavy_axial_loading are incomplete",
    finding:
      "Side Plank and unilateral carries need a reviewed lateral-loading fact for pain matching without free-text authority.",
  },
  {
    exposure: "loaded carry / locomotor exposure",
    classification: "NEW_TAG_REVIEW_REQUIRED",
    currentTags: "grip_intensive and heavy_axial_loading are partial",
    finding:
      "Neither tag identifies loaded walking, turns, or accumulated gait exposure.",
  },
  {
    exposure: "abdominal shortening under load",
    classification: "CURRENT_TAG_SUFFICIENT",
    currentTags: "loaded_spinal_flexion",
    finding:
      "The existing tag can represent the relevant machine/cable flexion exposure; adding an anatomy-named duplicate lacks a receiver.",
  },
  {
    exposure: "sustained bracing",
    classification: "NO_STRESS_TAG_NEEDED",
    currentTags: "exercise-specific load, lever, grip, and path tags",
    finding:
      "Bracing is a function, not automatically a pain stress. Use the actual load/path exposure unless a future receiver proves a distinct tag is needed.",
  },
  {
    exposure: "sustained upper-limb weight bearing / hanging",
    classification: "NEW_TAG_REVIEW_REQUIRED",
    currentTags: "wrist_extension_loading, overhead_pressing, and grip_intensive are partial",
    finding:
      "Planks, rollouts, Side Plank, and hanging work expose shoulder support/traction not captured by current tags.",
  },
];

const CANDIDATE_POOL_ADEQUACY: readonly CandidatePoolAdequacy[] = [
  {
    movementRole: "anti_lateral_flexion_core",
    prospectiveCandidates: ["forearm-side-plank", "suitcase-carry", "wall-supported-suitcase-march"],
    classification: "MINIMAL_COMPARABLE_POOL",
    limitation:
      "The options differ meaningfully by load, gait, support, grip, and space, but the two suitcase rows share one family.",
  },
  {
    movementRole: "trunk_flexion",
    prospectiveCandidates: ["machine-abdominal-crunch"],
    classification: "SINGLE_CANDIDATE_BOOTSTRAP",
    limitation: "No first-tranche bodyweight/home flexion alternative; machine availability and fit are hard constraints.",
  },
  {
    movementRole: "trunk_rotation",
    prospectiveCandidates: ["half-kneeling-high-to-low-cable-chop"],
    classification: "SINGLE_CANDIDATE_BOOTSTRAP",
    limitation: "No first-tranche band/home alternative; loaded-rotation stress and feature challenge remain unmodeled.",
  },
  {
    movementRole: "loaded_bracing",
    prospectiveCandidates: ["farmer-carry", "suitcase-carry", "wall-supported-suitcase-march"],
    classification: "MINIMAL_COMPARABLE_POOL",
    limitation: "All require dumbbells and grip; a non-carry static brace option remains deferred.",
  },
  {
    movementRole: "carry",
    prospectiveCandidates: ["farmer-carry", "suitcase-carry", "wall-supported-suitcase-march"],
    classification: "MINIMAL_COMPARABLE_POOL",
    limitation:
      "Only Farmer and Suitcase Carry provide distance; the wall-supported march is stationary and must never receive distance credit.",
  },
];

const ASSESSMENT_HANDOFF: readonly AssessmentHandoff[] = [
  {
    feature: "ribcage_pelvis_control",
    candidateCoverage: [
      "forearm-plank",
      "forearm-side-plank",
      "machine-abdominal-crunch",
      "half-kneeling-high-to-low-cable-chop",
    ],
    mechanicsCoverage:
      "Proposed anti-extension, anti-lateral, controlled-flexion, and controlled-rotation expression may contextualize ribcage-pelvis control after review.",
    missingChallengeEvidence:
      "No normalized feature challenge or setup-specific demand evidence exists for these proposed exercises.",
    potentialTargetFitUse:
      "Future target-fit evidence could distinguish position-control, shortening, and rotation contexts without treating them as interchangeable.",
    remainingGap:
      "The feature, challenge evidence, measurement semantics, and receiver policy are all outside this proposal.",
  },
  {
    feature: "anti_extension_control",
    candidateCoverage: ["forearm-plank"],
    mechanicsCoverage:
      "Forearm Plank proposes high anti-extension contribution; Dead Bug remains the accepted early catalog option.",
    missingChallengeEvidence:
      "No reviewed challenge magnitude by lever, support, hold duration, fatigue, or external load exists.",
    potentialTargetFitUse:
      "A future feature could compare athlete capability with a reviewed plank challenge for the requested anti-extension role.",
    remainingGap:
      "Externally loadable dynamic anti-extension remains unresolved because all rollout candidates are deferred.",
  },
  {
    feature: "anti_rotation_control",
    candidateCoverage: ["suitcase-carry", "wall-supported-suitcase-march"],
    mechanicsCoverage:
      "The unilateral loaded candidates propose anti-rotation only as a secondary function expression; Pallof Press remains the direct anti-rotation option.",
    missingChallengeEvidence:
      "No unilateral load, gait, support, side, or fatigue challenge model exists.",
    potentialTargetFitUse:
      "Future target fit may recognize reviewed secondary anti-rotation exposure without granting the candidates an anti-rotation movement role.",
    remainingGap:
      "Feature challenge and secondary-exposure accounting remain unimplemented and must avoid duplicate full credit.",
  },
  {
    feature: "lateral_trunk_control",
    candidateCoverage: [
      "forearm-side-plank",
      "suitcase-carry",
      "wall-supported-suitcase-march",
    ],
    mechanicsCoverage:
      "The three candidates propose high anti-lateral-flexion expression through floor, unsupported gait, and supported stationary contexts.",
    missingChallengeEvidence:
      "No reviewed challenge scale spans lever, support, load, side, distance, time, steps, or gait quality.",
    potentialTargetFitUse:
      "A future feature could choose among floor, carry, and supported contexts only after equipment and purpose legality are established.",
    remainingGap:
      "The feature itself, lateral-loading stress fact, challenge model, and side-aware prescription are absent.",
  },
  {
    feature: "controlled_rotation_control",
    candidateCoverage: ["half-kneeling-high-to-low-cable-chop"],
    mechanicsCoverage:
      "Half-Kneeling High-to-Low Cable Chop proposes high intentional controlled rotation and remains distinct from Pallof anti-rotation.",
    missingChallengeEvidence:
      "No reviewed challenge model covers cable load, anchor height, range, tempo, pelvis allowance, side, or stance support.",
    potentialTargetFitUse:
      "A future feature could support target fit for an explicitly requested controlled-rotation role.",
    remainingGap:
      "This is a single-candidate bootstrap and the loaded-rotation pain/stress fact is not represented.",
  },
  {
    feature: "loaded_bracing_control",
    candidateCoverage: [
      "farmer-carry",
      "suitcase-carry",
      "wall-supported-suitcase-march",
    ],
    mechanicsCoverage:
      "The carry-family candidates propose high loaded-bracing expression under bilateral, unilateral, and supported stationary prescriptions.",
    missingChallengeEvidence:
      "No challenge model combines usable load, grip, side, support, gait distance or steps, turns, fatigue, and ordinary execution.",
    potentialTargetFitUse:
      "Future target fit could compare direct loaded-bracing candidates after separating prior compound exposure from the requested purpose.",
    remainingGap:
      "No normalized feature, challenge evidence, safe-space contract, or one-source ledger receiver exists.",
  },
];

const PERSONA_REVIEW: readonly PersonaReviewRow[] = [
  {
    persona: "novice bodyweight general fitness",
    statuses: {
      "forearm-plank": "CONTEXT_DEPENDENT",
      "forearm-side-plank": "CONTEXT_DEPENDENT",
      "machine-abdominal-crunch": "UNAVAILABLE",
      "half-kneeling-high-to-low-cable-chop": "UNAVAILABLE",
      "farmer-carry": "UNAVAILABLE",
      "suitcase-carry": "UNAVAILABLE",
      "wall-supported-suitcase-march": "UNAVAILABLE",
    },
    finding:
      "Dead Bug remains the early anti-extension option; the two floor candidates require capability and support review, while loaded candidates fail equipment context.",
  },
  {
    persona: "beginner home dumbbells",
    statuses: {
      "forearm-plank": "POTENTIALLY_LEGAL",
      "forearm-side-plank": "CONTEXT_DEPENDENT",
      "machine-abdominal-crunch": "UNAVAILABLE",
      "half-kneeling-high-to-low-cable-chop": "UNAVAILABLE",
      "farmer-carry": "CONTEXT_DEPENDENT",
      "suitcase-carry": "CONTEXT_DEPENDENT",
      "wall-supported-suitcase-march": "POTENTIALLY_LEGAL",
    },
    finding:
      "The wall-supported march provides the little-space loaded option, while carries still require safe walkway and usable-load checks.",
  },
  {
    persona: "intermediate gym hypertrophy",
    statuses: {
      "forearm-plank": "POTENTIALLY_LEGAL",
      "forearm-side-plank": "POTENTIALLY_LEGAL",
      "machine-abdominal-crunch": "POTENTIALLY_LEGAL",
      "half-kneeling-high-to-low-cable-chop": "CONTEXT_DEPENDENT",
      "farmer-carry": "CONTEXT_DEPENDENT",
      "suitcase-carry": "CONTEXT_DEPENDENT",
      "wall-supported-suitcase-march": "CONTEXT_DEPENDENT",
    },
    finding:
      "Machine Crunch is the cleanest direct hypertrophy-accessory proposal; carry capacity cannot become mandatory filler or automatic trunk hypertrophy volume.",
  },
  {
    persona: "strength user with substantial compound bracing",
    statuses: {
      "forearm-plank": "CONTEXT_DEPENDENT",
      "forearm-side-plank": "CONTEXT_DEPENDENT",
      "machine-abdominal-crunch": "POTENTIALLY_LEGAL",
      "half-kneeling-high-to-low-cable-chop": "POTENTIALLY_LEGAL",
      "farmer-carry": "CONTEXT_DEPENDENT",
      "suitcase-carry": "CONTEXT_DEPENDENT",
      "wall-supported-suitcase-march": "INAPPROPRIATE_FOR_PURPOSE",
    },
    finding:
      "Existing incidental compound bracing does not automatically satisfy a direct request, but the ledger must prevent redundant volume and fatigue credit.",
  },
  {
    persona: "posture and movement-quality user",
    statuses: {
      "forearm-plank": "CONTEXT_DEPENDENT",
      "forearm-side-plank": "CONTEXT_DEPENDENT",
      "machine-abdominal-crunch": "INAPPROPRIATE_FOR_PURPOSE",
      "half-kneeling-high-to-low-cable-chop": "CONTEXT_DEPENDENT",
      "farmer-carry": "CONTEXT_DEPENDENT",
      "suitcase-carry": "CONTEXT_DEPENDENT",
      "wall-supported-suitcase-march": "POTENTIALLY_LEGAL",
    },
    finding:
      "Selection must follow an explicit function and context rather than treating every direct abdominal exercise as posture work.",
  },
  {
    persona: "pain-aware return user",
    statuses: {
      "forearm-plank": "REVIEW_REQUIRED",
      "forearm-side-plank": "REVIEW_REQUIRED",
      "machine-abdominal-crunch": "REVIEW_REQUIRED",
      "half-kneeling-high-to-low-cable-chop": "REVIEW_REQUIRED",
      "farmer-carry": "REVIEW_REQUIRED",
      "suitcase-carry": "REVIEW_REQUIRED",
      "wall-supported-suitcase-march": "CONTEXT_DEPENDENT",
    },
    finding:
      "No candidate receives a pain bonus from its name or support; unresolved stress tags and the athlete's structured pain context govern future review.",
  },
  {
    persona: "user with grip limitation",
    statuses: {
      "forearm-plank": "POTENTIALLY_LEGAL",
      "forearm-side-plank": "CONTEXT_DEPENDENT",
      "machine-abdominal-crunch": "POTENTIALLY_LEGAL",
      "half-kneeling-high-to-low-cable-chop": "CONTEXT_DEPENDENT",
      "farmer-carry": "INAPPROPRIATE_FOR_PURPOSE",
      "suitcase-carry": "INAPPROPRIATE_FOR_PURPOSE",
      "wall-supported-suitcase-march": "REVIEW_REQUIRED",
    },
    finding:
      "The tranche preserves non-grip floor and machine options; carry-family rows remain grip-intensive and require actual capability review.",
  },
  {
    persona: "user with shoulder limitation",
    statuses: {
      "forearm-plank": "REVIEW_REQUIRED",
      "forearm-side-plank": "REVIEW_REQUIRED",
      "machine-abdominal-crunch": "POTENTIALLY_LEGAL",
      "half-kneeling-high-to-low-cable-chop": "REVIEW_REQUIRED",
      "farmer-carry": "CONTEXT_DEPENDENT",
      "suitcase-carry": "CONTEXT_DEPENDENT",
      "wall-supported-suitcase-march": "CONTEXT_DEPENDENT",
    },
    finding:
      "Upper-limb support and cable/carry positions require variant-specific review; Machine Crunch offers a possible non-bearing alternative without being automatically safe.",
  },
  {
    persona: "user with low-back concern",
    statuses: {
      "forearm-plank": "REVIEW_REQUIRED",
      "forearm-side-plank": "REVIEW_REQUIRED",
      "machine-abdominal-crunch": "REVIEW_REQUIRED",
      "half-kneeling-high-to-low-cable-chop": "REVIEW_REQUIRED",
      "farmer-carry": "REVIEW_REQUIRED",
      "suitcase-carry": "REVIEW_REQUIRED",
      "wall-supported-suitcase-march": "REVIEW_REQUIRED",
    },
    finding:
      "The proposal makes no diagnosis or safety claim; structured pain matching, exact load/path facts, and human review remain required.",
  },
  {
    persona: "user with little safe walking space",
    statuses: {
      "forearm-plank": "POTENTIALLY_LEGAL",
      "forearm-side-plank": "POTENTIALLY_LEGAL",
      "machine-abdominal-crunch": "POTENTIALLY_LEGAL",
      "half-kneeling-high-to-low-cable-chop": "CONTEXT_DEPENDENT",
      "farmer-carry": "UNAVAILABLE",
      "suitcase-carry": "UNAVAILABLE",
      "wall-supported-suitcase-march": "POTENTIALLY_LEGAL",
    },
    finding:
      "Walking carries fail the proposed loaded-gait-space requirement; the supported stationary march remains distinct and receives no distance credit.",
  },
];

const ROLE_MECHANICS_DOCTRINE = [
  "MovementRole is reviewed selection-purpose truth; a mechanics level cannot grant a role.",
  "TrunkMechanicsProfile records reviewed function expression during execution; it does not make the exercise directly selectable for every expressed function.",
  "Side Plank proposes anti_lateral_flexion_core without carry, loaded_bracing, or gait selection roles.",
  "Farmer Carry proposes carry and loaded_bracing roles; bilateral loading may express anti-lateral control without granting an anti_lateral_flexion_core role.",
  "Suitcase Carry proposes carry, anti_lateral_flexion_core, and loaded_bracing only as explicit owner-review items, not as inferred consequences of its mechanics.",
  "Half-Kneeling High-to-Low Cable Chop proposes trunk_rotation and controlled rotation; Pallof Press remains anti_rotation_core with no controlled-rotation equivalence.",
] as const;

const TRANSITION_DOCTRINE = [
  "Prefer same-exercise progression through duration, lever, support, load, distance, trips, steps, range, tempo, effort, and rest where the identity remains truthful.",
  "Every proposed cross-exercise relationship has automaticSelectionEffect=none.",
  "Dead Bug to Rollout is not a universal ladder; rollout equipment, shoulder/wrist tolerance, range, and purpose must be reviewed.",
  "Pallof Press to Cable Chop is not a universal ladder because anti-rotation and controlled rotation are distinct functions and roles.",
  "Side Plank to Suitcase Carry is not a universal ladder because floor support and loaded gait have different equipment, grip, space, stress, and capacity facts.",
] as const;

const REJECTED_LEGACY_POLICIES = [
  "REJECT name, ID, tag, and coaching-prose sniffing as mechanical or role authority.",
  "REJECT free-text contraindications as pain authority.",
  "REJECT fixed universal core quotas.",
  "REJECT carry-as-mandatory-finisher policy.",
  "REJECT automatic cross-function progression.",
  "REJECT difficulty tier as exercise-science proof.",
] as const;

const IMPLEMENTATION_DEPENDENCIES = [
  "Project-owner approval of each selected exercise identity, role set, mechanics profile, stress mapping, prerequisites, and provenance artifact.",
  "Equipment-contract decisions for loaded_gait_space or safe_walkway, stable loaded standing space, cable anchor height, abdominal-crunch MachineId, support side, and minimum usable load are represented as contracts. Exact exercise identity curation is now documented in `SEVEN_EXERCISE_TRUNK_CARRY_CURATION.md`.",
  "Pain-stress vocabulary and receiver review is documented in `TRUNK_CARRY_PAIN_STRESS_REVIEW.md` and `TRUNK_CARRY_PAIN_STRESS_OWNER_DECISIONS.md` as `TRUNK_CARRY_PAIN_STRESS_CONTRACT_READY`; production stress metadata still requires owner-approved exercise-row implementation tests.",
  "Project-owner decisions for loaded trunk rotation, lateral trunk loading, loaded gait, loaded march, neutral grip loading, and sustained upper-limb support before any stress tags or pain-response requirements are added.",
  "Prescription-contract support for structured load, side, hold purpose, distance, trips, steps, turns, lever, support, gait standard, and per-side semantics is represented by `STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT_READY`; final values remain owner-curated production metadata.",
  "Owner acceptance of single-candidate bootstrap limitations for trunk_flexion and trunk_rotation.",
  "A later production-metadata tranche with isolated validation and behavior-fingerprint review; this proposal does not authorize that implementation.",
  "Future normalized assessment features and challenge evidence must be reviewed separately and cannot be inferred from this catalog proposal.",
  "Future Weekly Development Ledger rules must record one source exposure with multiple reviewed characteristics instead of cloning volume credit.",
] as const;

const EXPLICIT_UNCERTAINTIES = [
  "All non-unknown generic-demand and trunk-mechanics levels are owner-review hypotheses, not accepted production facts.",
  "The preferred externally loadable dynamic anti-extension option remains unresolved among stability-ball, ab-wheel, and barbell rollouts.",
  "The first trunk-flexion pool has no home/bodyweight comparison and depends on a not-yet-modeled abdominal-crunch machine identity.",
  "The first controlled-rotation pool has no band/home comparison and depends on reviewed pelvis, stance, range, and cable-anchor semantics.",
  "The safe geometry, length, turns, traffic clearance, and set-down meaning of loaded_gait_space remain owner decisions.",
  "Support side, load side, support force, and no-distance semantics for Wall-Supported Suitcase March remain unmodeled.",
  "Pain/stress tag additions require canonical matching receivers; this proposal does not assume every mechanical function is itself a pain stress.",
  "Role-and-section-specific phase evidence is not yet curated, and no final phase score is proposed.",
  "Feature challenge, athlete capability matching, weekly dose equivalence, fatigue accounting, and hypertrophy contribution remain future contracts.",
] as const;

export function buildMinimalTrunkCarryCatalogProposalData(): MinimalTrunkCarryCatalogProposalData {
  const candidateIds = CANDIDATES.map((candidate) => candidate.id);
  if (
    candidateIds.length !== PROPOSED_TRUNK_CARRY_CANDIDATE_IDS.length ||
    new Set(candidateIds).size !== PROPOSED_TRUNK_CARRY_CANDIDATE_IDS.length ||
    PROPOSED_TRUNK_CARRY_CANDIDATE_IDS.some(
      (candidateId) => !candidateIds.includes(candidateId),
    )
  ) {
    throw new Error("Each requested trunk/carry candidate must appear exactly once.");
  }

  const selectedIds = CANDIDATES.filter(
    (candidate) => candidate.disposition === "SELECTED_FOR_FIRST_IMPLEMENTATION",
  ).map((candidate) => candidate.id);
  if (
    selectedIds.length !== SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE.length ||
    SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE.some(
      (candidateId) => !selectedIds.includes(candidateId),
    )
  ) {
    throw new Error("Selected candidate dispositions must match the minimal tranche.");
  }

  if (
    SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE.some(
      (candidateId) =>
        !SELECTED_RATIONALES.some(
          (rationale) => rationale.candidateId === candidateId,
        ),
    )
  ) {
    throw new Error("Every selected candidate must have an explicit rationale.");
  }

  const fingerprints = buildCurrentTrunkCurationFingerprints();
  return {
    goldenAncestor: MINIMAL_TRUNK_CARRY_GOLDEN_ANCESTOR,
    candidates: CANDIDATES,
    requiredGapCoverage: REQUIRED_GAP_COVERAGE,
    selectedRationales: SELECTED_RATIONALES,
    equipmentAudit: EQUIPMENT_AUDIT,
    stressVocabularyAudit: STRESS_VOCABULARY_AUDIT,
    candidatePoolAdequacy: CANDIDATE_POOL_ADEQUACY,
    assessmentHandoff: ASSESSMENT_HANDOFF,
    personaReview: PERSONA_REVIEW,
    roleMechanicsDoctrine: ROLE_MECHANICS_DOCTRINE,
    transitionDoctrine: TRANSITION_DOCTRINE,
    rejectedLegacyPolicies: REJECTED_LEGACY_POLICIES,
    implementationDependencies: IMPLEMENTATION_DEPENDENCIES,
    explicitUncertainties: EXPLICIT_UNCERTAINTIES,
    behaviorBoundary: {
      referenceCatalogFingerprint: fingerprints.referenceCatalog,
      referenceCatalogMatches:
        fingerprints.referenceCatalog ===
        FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
      rankingFingerprint: fingerprints.productionRanking,
      rankingMatches:
        fingerprints.productionRanking === CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
      comprehensiveBehaviorFingerprint: fingerprints.comprehensiveBehavior,
      comprehensiveBehaviorMatches:
        fingerprints.comprehensiveBehavior ===
        CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
    },
    classification: "TRUNK_CARRY_CONTRACT_FIXES_REQUIRED",
  };
}

function markdownCell(value: string | number | boolean): string {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function table(
  headers: readonly string[],
  rows: readonly (readonly (string | number | boolean)[])[],
): string {
  return [
    `| ${headers.map(markdownCell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`),
  ].join("\n");
}

function bullets(values: readonly string[]): string {
  return values.length === 0
    ? "- none"
    : values.map((value) => `- ${value}`).join("\n");
}

function inlineList(values: readonly string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function renderMechanics(
  mechanics: Readonly<Record<string, MechanicsProposal>>,
): string {
  return table(
    ["Field", "Level", "Review status", "Source ref", "Evidence basis", "Uncertainty"],
    Object.entries(mechanics).map(([field, proposal]) => [
      field,
      proposal.level,
      proposal.reviewStatus,
      proposal.sourceRef ?? "none",
      inlineList(proposal.evidenceBasis),
      proposal.uncertainty,
    ]),
  );
}

function renderCandidateContract(candidate: ProposedExerciseContract): string {
  const multiFunction = candidate.multiFunctionCredit
    ? [
        "#### Multi-Function Credit Contract",
        "",
        table(
          ["Field", "Proposal"],
          [
            ["Primary training purpose", candidate.multiFunctionCredit.primaryTrainingPurpose],
            [
              "Secondary function expressions",
              inlineList(candidate.multiFunctionCredit.secondaryFunctionExpressions),
            ],
            ["Capacity expressions", inlineList(candidate.multiFunctionCredit.capacityExpressions)],
            [
              "Shared-evidence clusters",
              inlineList(candidate.multiFunctionCredit.sharedEvidenceClusters),
            ],
            ["Double-credit risk", candidate.multiFunctionCredit.doubleCreditRisk],
            ["Future ledger rule", candidate.multiFunctionCredit.futureLedgerRule],
          ],
        ),
        "",
      ]
    : [];

  return [
    `### ${candidate.displayName} (\`${candidate.id}\`)`,
    "",
    table(
      ["Contract field", "Proposal"],
      [
        ["ID proposal", candidate.id],
        ["Display name", candidate.displayName],
        ["Exercise family", candidate.exerciseFamily],
        ["Movement roles", inlineList(candidate.movementRoles)],
        ["Training roles", inlineList(candidate.trainingRoles)],
        ["Primary muscles", inlineList(candidate.primaryMuscles)],
        ["Secondary muscles", inlineList(candidate.secondaryMuscles)],
        ["Body regions", inlineList(candidate.bodyRegions)],
        ["Prerequisites", inlineList(candidate.prerequisites)],
        ["Section suitability", candidate.sectionSuitability],
        ["Loading profile", candidate.loadingProfile],
        ["Support mechanics", candidate.supportMechanics],
        ["Resistance/path mechanics", candidate.resistancePathMechanics],
        ["Coaching purpose", candidate.coachingPurpose],
        ["Progression axes", inlineList(candidate.progressionAxes)],
        ["Phase-context needs", candidate.phaseContextNeeds],
        ["Review status", candidate.reviewStatus],
        ["Selection basis", candidate.selectionBasis],
        ["Disposition", candidate.disposition],
        ["Disposition reason", candidate.dispositionReason],
      ],
    ),
    "",
    "#### Equipment Contract",
    "",
    table(
      ["Field", "Proposal"],
      [
        ["Required equipment", inlineList(candidate.equipment.requiredEquipment)],
        ["Optional equipment", inlineList(candidate.equipment.optionalEquipment)],
        ["Setup capability", candidate.equipment.setupCapability],
        ["Space requirement", candidate.equipment.spaceRequirement],
        ["Anchor requirement", candidate.equipment.anchorRequirement],
        ["Load range requirement", candidate.equipment.loadRangeRequirement],
        ["Support requirement", candidate.equipment.supportRequirement],
        ["Current domain support", candidate.equipment.currentDomainSupport],
        ["Contract gap", candidate.equipment.contractGap],
      ],
    ),
    "",
    "#### Generic Demands",
    "",
    renderMechanics(candidate.genericDemands),
    "",
    "#### Trunk Mechanics Profile",
    "",
    renderMechanics(candidate.trunkMechanicsProfile),
    "",
    "#### Pain / Stress Contract",
    "",
    table(
      ["Current tags", "Classification", "Relevant exposure", "Finding"],
      [
        [
          inlineList(candidate.painStress.currentTags),
          candidate.painStress.classification,
          candidate.painStress.relevantExposure,
          candidate.painStress.contractFinding,
        ],
      ],
    ),
    "",
    "#### Prescription Contract",
    "",
    table(
      ["Required units", "Currently representable", "Contract gaps"],
      [
        [
          inlineList(candidate.prescription.requiredUnits),
          inlineList(candidate.prescription.currentlyRepresentable),
          inlineList(candidate.prescription.contractGaps),
        ],
      ],
    ),
    "",
    "#### Phase Contexts",
    "",
    table(
      ["Context", "Proposal status"],
      PHASE_CONTEXT_USES.map((context) => [context, candidate.phaseContexts[context]]),
    ),
    "",
    "No phase score is proposed. Each potential use requires role-and-section-specific evidence; evidence from one context cannot leak into another.",
    "",
    "#### Contextual Transitions",
    "",
    candidate.possibleTransitions.length === 0
      ? "No cross-exercise transition proposed."
      : table(
          ["Target concept", "Context", "Automatic selection effect"],
          candidate.possibleTransitions.map((candidateTransition) => [
            candidateTransition.targetConcept,
            candidateTransition.context,
            candidateTransition.automaticSelectionEffect,
          ]),
        ),
    "",
    ...multiFunction,
    "#### Weekly Development Ledger Handoff",
    "",
    table(
      ["Field", "Proposal"],
      [
        ["Possible lane", candidate.ledgerHandoff.possibleLane],
        ["Direct function target", candidate.ledgerHandoff.directFunctionTarget],
        ["Possible secondary evidence", candidate.ledgerHandoff.secondaryFunctionEvidence],
        ["Possible capacity evidence", candidate.ledgerHandoff.capacityEvidence],
        ["Dose unit", candidate.ledgerHandoff.doseUnit],
        ["Fatigue/stress effect", candidate.ledgerHandoff.fatigueStressEffect],
        ["Hypertrophy contribution", candidate.ledgerHandoff.hypertrophyContribution],
        ["Gait/carry contribution", candidate.ledgerHandoff.gaitCarryContribution],
        ["Double-credit control", candidate.ledgerHandoff.doubleCreditControl],
      ],
    ),
    "",
    "#### Provenance and Legacy",
    "",
    "Provenance plan:",
    "",
    bullets(candidate.provenancePlan),
    "",
    `Legacy classification: **${candidate.legacyClassification}**`,
    "",
    `Legacy evidence: ${candidate.legacyEvidence}`,
    "",
  ].join("\n");
}

export function renderMinimalTrunkCarryCatalogProposal(
  data: MinimalTrunkCarryCatalogProposalData,
): string {
  const selected = data.candidates.filter(
    (candidate) => candidate.disposition === "SELECTED_FOR_FIRST_IMPLEMENTATION",
  );
  const deferred = data.candidates.filter(
    (candidate) => candidate.disposition === "DEFERRED_FOR_LATER",
  );
  const rejected = data.candidates.filter(
    (candidate) => candidate.disposition === "REJECTED_FOR_CURRENT_V2",
  );
  const multiFunction = data.candidates.filter(
    (candidate) => candidate.multiFunctionCredit !== undefined,
  );

  return [
    "# Minimal Direct Trunk / Core and Carry Catalog Proposal",
    "",
    "## Proposal Boundary",
    "",
    "This is a deterministic proposal for the smallest coherent new direct trunk/core and carry catalog tranche. It changes no production reference exercise, production type, equipment contract, stress tag, prescription behavior, eligibility, scoring, ranking, pain behavior, phase behavior, assessment behavior, transition behavior, application code, or Weekly Development Ledger.",
    "",
    "The accepted first TrunkMechanicsProfile tranche remains exactly 90/90 Breathing, Dead Bug, and Pallof Press. The 17 qualified secondary-mechanics proposals remain unresolved and independent of this catalog review.",
    "",
    `Protected golden ancestor: \`${data.goldenAncestor}\`. Legacy is migration evidence only.`,
    "",
    "## Owner Identity and Equipment Dependency Update",
    "",
    "The owner directionally accepts the seven-concept tranche and settles these future identities: `forearm-plank`, `forearm-side-plank`, `machine-abdominal-crunch`, `half-kneeling-high-to-low-cable-chop`, `farmer-carry`, and `suitcase-carry`.",
    "",
    "`wall-supported-suitcase-march` is curated as a stationary supported loaded march with no loaded-gait or distance truth, but its `carry` movement-role status remains an owner-decision question. Structured support-side, load-side, steps/time, and stationary-march prescription semantics now exist as a contract, but they do not approve this identity as production metadata.",
    "",
    "The training-space/equipment (`TRUNK_CARRY_EQUIPMENT_CONTRACT_READY`), structured prescription/progression (`STRUCTURED_PRESCRIPTION_AND_PROGRESSION_CONTRACT_READY`), pain-stress exposure (`TRUNK_CARRY_PAIN_STRESS_CONTRACT_READY`), exact curation (`SEVEN_EXERCISE_TRUNK_CARRY_CURATION_READY_FOR_OWNER_APPROVAL`), compositional support/stance (`SUPPORT_AND_STANCE_SCHEMA_IMPLEMENTED`), contextual phase-resolution (`PHASE_CONTEXT_SCHEMA_AND_RESOLVER_IMPLEMENTED_POLICY_PENDING`), training-safety, and response-history contracts now exist. These reviews add contracts and synthetic future requirements but no production exercise row or production exercise stress metadata. Production implementation remains blocked by safety adapter wiring, response receiver policy, row-level stress/support curation, phase scoring policy, and longitudinal interpretation ownership.",
    "",
    "## Current Gap Statement",
    "",
    "The current catalog directly represents breathing/position, early anti-extension through Dead Bug, and anti-rotation through Pallof Press. It lacks a truthful direct candidate pool for anti-lateral flexion, controlled trunk flexion, controlled trunk rotation, later anti-extension, intentional loaded bracing, bilateral and unilateral carries, a supported stationary carry regression, and capacity-oriented loaded gait.",
    "",
    table(
      ["Required function", "Status", "Candidate concepts", "Finding"],
      data.requiredGapCoverage.map((coverage) => [
        coverage.gap,
        coverage.status,
        inlineList(coverage.candidates),
        coverage.finding,
      ]),
    ),
    "",
    "## Minimal Tranche Summary",
    "",
    `Candidates considered: ${data.candidates.length}. Selected: ${selected.length}. Deferred: ${deferred.length}. Rejected as standalone current-V2 IDs: ${rejected.length}.`,
    "",
    "### Selected for First Implementation",
    "",
    bullets(selected.map((candidate) => `${candidate.id}: ${candidate.displayName}`)),
    "",
    "### Deferred for Later",
    "",
    bullets(deferred.map((candidate) => `${candidate.id}: ${candidate.dispositionReason}`)),
    "",
    "### Rejected for Current V2",
    "",
    bullets(rejected.map((candidate) => `${candidate.id}: ${candidate.dispositionReason}`)),
    "",
    "Rejection here means no separate first-tranche reference-exercise identity. Long-Lever Plank and Bent-Knee Side Plank remain possible same-exercise lever/support progressions; no movement concept is rejected from human practice by this catalog decision.",
    "",
    "## Candidates Considered",
    "",
    table(
      [
        "ID",
        "Display name",
        "Family",
        "Movement roles",
        "Required equipment",
        "Disposition",
        "Selection basis",
      ],
      data.candidates.map((candidate) => [
        candidate.id,
        candidate.displayName,
        candidate.exerciseFamily,
        inlineList(candidate.movementRoles),
        inlineList(candidate.equipment.requiredEquipment),
        candidate.disposition,
        candidate.selectionBasis,
      ]),
    ),
    "",
    "Every candidate was evaluated from an exact proposed movement definition and explicit review contract. ID, name, tags, coaching prose, legacy presence, and difficulty tier are never selection evidence.",
    "",
    "## Complete Proposed Exercise Contracts",
    "",
    ...data.candidates.map(renderCandidateContract),
    "## Equipment-Mode Audit",
    "",
    table(
      ["Capability", "Current support", "Selected candidates", "Finding", "Contract action"],
      data.equipmentAudit.map((finding) => [
        finding.capability,
        finding.currentSupport,
        inlineList(finding.selectedCandidates),
        finding.finding,
        finding.contractAction,
      ]),
    ),
    "",
    "Ordinary `floor_space` is not treated as verified loaded-carry space. The proposed name `loaded_gait_space` is descriptive pending owner choice; it is not implemented here.",
    "",
    "## Pain / Stress Contract Audit",
    "",
    table(
      ["Exposure", "Classification", "Current tags", "Finding"],
      data.stressVocabularyAudit.map((finding) => [
        finding.exposure,
        finding.classification,
        finding.currentTags,
        finding.finding,
      ]),
    ),
    "",
    "Candidate-level tables above preserve every proposed current tag and exact gap. Free-text contraindications are not authority, and this review creates no new tag.",
    "",
    "## Prescription-Unit Audit",
    "",
    table(
      ["Candidate", "Required units", "Representable now", "Contract gaps"],
      data.candidates.map((candidate) => [
        candidate.id,
        inlineList(candidate.prescription.requiredUnits),
        inlineList(candidate.prescription.currentlyRepresentable),
        inlineList(candidate.prescription.contractGaps),
      ]),
    ),
    "",
    "The present contract can express sets, a rep string, time, effort, tempo, free-form range/support, and rest. It cannot yet provide the structured load, side, distance, trips, steps, turns, lever, hold-purpose, and gait-standard truth required by this tranche.",
    "",
    "## Role and Mechanics Distinctions",
    "",
    bullets(data.roleMechanicsDoctrine),
    "",
    "## Multi-Function Credit Risks",
    "",
    table(
      [
        "Candidate",
        "Primary purpose",
        "Secondary expressions",
        "Capacity expressions",
        "Shared-evidence clusters",
        "Future ledger rule",
      ],
      multiFunction.map((candidate) => {
        const credit = candidate.multiFunctionCredit!;
        return [
          candidate.id,
          credit.primaryTrainingPurpose,
          inlineList(credit.secondaryFunctionExpressions),
          inlineList(credit.capacityExpressions),
          inlineList(credit.sharedEvidenceClusters),
          credit.futureLedgerRule,
        ];
      }),
    ),
    "",
    "Each row represents one source exposure event with multiple reviewed characteristics. None may become several independent full-volume units.",
    "",
    "## Progression and Transition Discipline",
    "",
    bullets(data.transitionDoctrine),
    "",
    "## Phase-Context Requirements",
    "",
    table(
      [
        "Candidate",
        ...PHASE_CONTEXT_USES,
        "Evidence still required",
      ],
      data.candidates.map((candidate) => [
        candidate.id,
        ...PHASE_CONTEXT_USES.map((context) => candidate.phaseContexts[context]),
        candidate.phaseContextNeeds,
      ]),
    ),
    "",
    "Phase 3 never means hardest or most unstable, and Phase 1 never means bodyweight-only. No final phase score is proposed.",
    "",
    "## Assessment Handoff",
    "",
    table(
      [
        "Future normalized feature",
        "Candidate coverage",
        "Mechanics coverage",
        "Missing challenge evidence",
        "Potential target-fit use",
        "Remaining gap",
      ],
      data.assessmentHandoff.map((handoff) => [
        handoff.feature,
        inlineList(handoff.candidateCoverage),
        handoff.mechanicsCoverage,
        handoff.missingChallengeEvidence,
        handoff.potentialTargetFitUse,
        handoff.remainingGap,
      ]),
    ),
    "",
    "These are handoff concepts only. No assessment feature, challenge, image-derived finding, target-fit score, or production receiver is added.",
    "",
    "## Weekly Development Ledger Handoff",
    "",
    table(
      [
        "Candidate",
        "Possible lane",
        "Direct target",
        "Secondary evidence",
        "Capacity evidence",
        "Dose unit",
        "Fatigue/stress",
        "Hypertrophy volume",
        "Gait/carry capacity",
        "Double-credit control",
      ],
      data.candidates.map((candidate) => [
        candidate.id,
        candidate.ledgerHandoff.possibleLane,
        candidate.ledgerHandoff.directFunctionTarget,
        candidate.ledgerHandoff.secondaryFunctionEvidence,
        candidate.ledgerHandoff.capacityEvidence,
        candidate.ledgerHandoff.doseUnit,
        candidate.ledgerHandoff.fatigueStressEffect,
        candidate.ledgerHandoff.hypertrophyContribution,
        candidate.ledgerHandoff.gaitCarryContribution,
        candidate.ledgerHandoff.doubleCreditControl,
      ]),
    ),
    "",
    "Lanes are contextual, not static exercise metadata. There is no fixed universal core or carry quota.",
    "",
    "## Selected-Tranche Rationale",
    "",
    table(
      [
        "Candidate",
        "Why included",
        "Gap closed",
        "Why competitor deferred",
        "Equipment",
        "Progression runway",
        "Pain/stress readiness",
        "Catalog ambiguity",
        "Human review required",
      ],
      data.selectedRationales.map((rationale) => [
        rationale.candidateId,
        rationale.whyIncluded,
        rationale.gapClosed,
        rationale.competingOptionDeferred,
        rationale.equipmentCoverage,
        rationale.progressionRunway,
        rationale.painStressReadiness,
        rationale.catalogAmbiguity,
        rationale.humanReviewRequired,
      ]),
    ),
    "",
    "## Candidate-Pool Adequacy",
    "",
    table(
      ["Movement role", "Prospective candidates", "Classification", "Limitation"],
      data.candidatePoolAdequacy.map((pool) => [
        pool.movementRole,
        inlineList(pool.prospectiveCandidates),
        pool.classification,
        pool.limitation,
      ]),
    ),
    "",
    "Trunk flexion and trunk rotation are transparently single-candidate bootstraps. The proposal does not fabricate diversity with near-duplicate rows.",
    "",
    "## Controlled Persona Review",
    "",
    "This is a conceptual legality/context review, not a production ranking run.",
    "",
    table(
      [
        "Persona",
        ...SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE,
        "Finding",
      ],
      data.personaReview.map((row) => [
        row.persona,
        ...SELECTED_MINIMAL_TRUNK_CARRY_TRANCHE.map(
          (candidateId) => row.statuses[candidateId],
        ),
        row.finding,
      ]),
    ),
    "",
    "## Protected Legacy Migration Review",
    "",
    table(
      ["Candidate concept", "Classification", "Legacy evidence", "Current disposition"],
      data.candidates.map((candidate) => [
        candidate.id,
        candidate.legacyClassification,
        candidate.legacyEvidence,
        candidate.disposition,
      ]),
    ),
    "",
    "Explicitly rejected legacy policies:",
    "",
    bullets(data.rejectedLegacyPolicies),
    "",
    "## Implementation Dependencies",
    "",
    bullets(data.implementationDependencies),
    "",
    "## Explicit Uncertainties",
    "",
    bullets(data.explicitUncertainties),
    "",
    "## Behavioral Boundary Proof",
    "",
    table(
      ["Artifact", "Required fingerprint", "Current fingerprint", "Unchanged"],
      [
        [
          "Full serialized reference catalog after accepted first profiles",
          FIRST_TRANCHE_REFERENCE_CATALOG_FINGERPRINT,
          data.behaviorBoundary.referenceCatalogFingerprint,
          data.behaviorBoundary.referenceCatalogMatches,
        ],
        [
          "22-scenario production ranking",
          CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
          data.behaviorBoundary.rankingFingerprint,
          data.behaviorBoundary.rankingMatches,
        ],
        [
          "Comprehensive behavior",
          CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
          data.behaviorBoundary.comprehensiveBehaviorFingerprint,
          data.behaviorBoundary.comprehensiveBehaviorMatches,
        ],
      ],
    ),
    "",
    `Current production reference-exercise count: ${REFERENCE_EXERCISES.length}. The proposal renderer reads production state only to prove the boundary; it writes documentation only.`,
    "",
    "## Final Classification",
    "",
    `**${data.classification}**`,
    "",
    "The seven-candidate tranche is accepted directionally, and its equipment, structured prescription, pain-stress exposure, exact curation, compositional support/stance, contextual phase-resolution, training-safety, and response-history dependencies now exist. Production implementation remains blocked by safety adapter wiring, response receiver policy, row-level stress/support curation, phase scoring policy, and longitudinal interpretation ownership. No production exercise row or exercise stress metadata is implemented by this classification.",
    "",
  ].join("\n");
}

export function writeMinimalTrunkCarryCatalogProposal(rootDir = process.cwd()): {
  readonly outputPath: string;
  readonly data: MinimalTrunkCarryCatalogProposalData;
} {
  const data = buildMinimalTrunkCarryCatalogProposalData();
  const outputPath = join(
    rootDir,
    "docs/training-engine-v2/MINIMAL_TRUNK_CARRY_CATALOG_PROPOSAL.md",
  );
  writeFileSync(outputPath, renderMinimalTrunkCarryCatalogProposal(data));
  return { outputPath, data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = writeMinimalTrunkCarryCatalogProposal();
  console.log(`Wrote ${result.outputPath}`);
  console.log(
    JSON.stringify(
      {
        candidatesConsidered: result.data.candidates.length,
        selected: result.data.candidates.filter(
          (candidate) =>
            candidate.disposition === "SELECTED_FOR_FIRST_IMPLEMENTATION",
        ).length,
        classification: result.data.classification,
      },
      null,
      2,
    ),
  );
}
