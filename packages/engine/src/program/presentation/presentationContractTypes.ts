/**
 * Phase 7B — Program Presentation and Relational Continuity Contract types.
 *
 * Relational vocabulary (reports + inventory):
 *   system input → giver → output → UI receiver → persistence effect
 */

export type PresentationContractStatus =
  | "visible"
  | "visibleOnDemand"
  | "internalOnly"
  | "telemetryOnly"
  | "deferred"
  | "unused";

export type PresentationSurface =
  | "questionnaire"
  | "assessmentResults"
  | "programOverview"
  | "weeklyOverview"
  | "sessionOverview"
  | "activeWorkout"
  | "exerciseCard"
  | "exerciseGuidance"
  | "exerciseDetails"
  | "painFeedback"
  | "substitutionFlow"
  | "preSessionAdaptation"
  | "progressHistory"
  | "phaseTransition"
  | "equipmentSettings"
  | "accountSettings"
  | "internalDiagnostics";

export type PresentationPersistenceKind =
  | "storedProgram"
  | "questionnaire"
  | "assessment"
  | "sessionDraft"
  | "exerciseLog"
  | "feedbackHistory"
  | "progressionState"
  | "temporary"
  | "none";

export type AdaptationReason =
  | "assessmentFocus"
  | "reportedPain"
  | "sessionDiscomfort"
  | "equipmentCapability"
  | "personalPreference"
  | "progression"
  | "phaseChange"
  | "weeklyBalance";

export type PresentationMessage = {
  id: string;
  reason?: AdaptationReason;
  text: string;
  severity?: "info" | "caution" | "safety";
};

export type PresentationRelationship = {
  id: string;
  systemInput: {
    source: string;
    field: string;
    meaning: string;
  };
  giver: {
    module: string;
    functionOrPolicy?: string;
    responsibility: string;
  };
  output: {
    field: string;
    meaning: string;
  };
  uiReceivers: PresentationSurface[];
  persistenceEffect: {
    kind: PresentationPersistenceKind;
    location?: string;
    futureEffect?: string;
  };
  presentationStatus: PresentationContractStatus;
  requiredForRelease: boolean;
  userAction?: string;
  fallbackBehavior?: string;
  notes?: string;
};

export type SessionPresentationModel = {
  dayIndex: number;
  title: string;
  purpose: string;
  expectedDuration: string;
  equipmentNeeded: string[];
  setupRequirements: string[];
  exerciseCount: number;
  painAdaptation?: PresentationMessage;
  completionLabel?: string;
};

export type ProgramPresentationModel = {
  program: {
    equipmentIdentity: string;
    equipmentIdentityMode: string;
    frequencyLabel: string;
    phaseLabel: string;
    phasePurpose: string;
    weekLabel: string;
    weeklyStructure: string[];
    templateVersion: number;
    capabilityNotes: PresentationMessage[];
    adaptationSummary: PresentationMessage[];
  };
  sessions: SessionPresentationModel[];
  relationships: PresentationRelationship[];
};

export type FeedbackContractActionLabel = {
  action: "sacrifice" | "test" | "modify" | "dismiss";
  label: string;
  description: string;
};

export type PresentationValidationFinding = {
  code: string;
  detail: string;
  relationshipId?: string;
};

/** Required concrete presentation fields (not 1:1 with relationships). */
export const REQUIRED_CONCRETE_PRESENTATION_FIELDS = [
  "equipmentMode",
  "confirmedEquipment",
  "support",
  "anchorSetup",
  "goal",
  "intent",
  "experience",
  "frequency",
  "phase",
  "week",
  "capabilityLimitations",
  "sessionTitle",
  "purpose",
  "duration",
  "exerciseCount",
  "prescription",
  "setup",
  "cue",
  "expectedFeel",
  "stopSignal",
  "progression",
  "substitutionState",
  "painAdaptation",
  "blockState",
  "completionState",
  "persistenceDestination",
] as const;

export type RequiredConcretePresentationField =
  (typeof REQUIRED_CONCRETE_PRESENTATION_FIELDS)[number];

export type ProgramPresentationValidation = {
  passed: boolean;
  /** Count of inventory relationship records. */
  totalRelationships: number;
  /**
   * @deprecated Prefer totalConcreteFields — relationship count is not field coverage.
   * Kept for transitional report readers; equals totalRelationships historically.
   */
  totalFields: number;
  /** Distinct concrete presentation fields covered by inventory mappings. */
  totalConcreteFields: number;
  missingConcreteFields: RequiredConcretePresentationField[];
  countsByStatus: Record<PresentationContractStatus, number>;
  relationshipsWithoutGivers: number;
  outputsWithoutReceivers: number;
  visibleWithoutCanonicalSource: number;
  requiredWithoutPersistence: number;
  inputsWithoutOutput: number;
  unresolvedUnused: number;
  rawInternalLanguageLeaks: number;
  declaredOnlyReleaseReceivers: number;
  missingReceiverEvidenceRecords: number;
  findings: PresentationValidationFinding[];
};
