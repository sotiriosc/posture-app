import { stdin as nodeInput, stdout as nodeOutput } from "node:process";
import { createInterface } from "node:readline/promises";
import {
  deriveAlignmentPriorities,
  EMPTY_TRAINING_HISTORY,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  GOLDEN_PERSONAS,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  buildHorizontalRowSelectionTrace,
  runCandidateRankingLab,
  type AssessmentFeature,
  type AssessmentRelevanceTrace,
  type AssessmentState,
  type CandidateNeed,
  type CandidateRankingResult,
  type CandidateRequest,
  type ContinuityContext,
  type EquipmentCapabilities,
  type FatigueSignal,
  type GoldenPersona,
  type PainAndInjuryState,
  type PhaseIntent,
  type RankedCandidate,
  type ScoreComponent,
  type TrainingHistory,
} from "../src";
import { POSTURE_PHOTO_ASSESSMENT_STATE } from "../tests/fixtures/posture/realPostureAssessmentFixture";

interface Choice<T> {
  readonly label: string;
  readonly description: string;
  readonly value: T;
}

const EMPTY_ASSESSMENT: AssessmentState = {
  signals: [],
  historicalWeaknesses: [],
};

const EMPTY_CONTINUITY = {
  productiveExerciseIds: [],
  plateauedExerciseIds: [],
  failedProgressionExerciseIds: [],
  painResponseExerciseIds: [],
} as const;

interface ContinuityChoiceValue {
  readonly continuity: ContinuityContext;
  readonly historyOverlay: (baseHistory: TrainingHistory) => TrainingHistory;
}

function requireValue<T>(value: T | undefined, label: string): T {
  if (!value) {
    throw new Error(`Missing ${label}.`);
  }

  return value;
}

function phase(id: PhaseIntent["id"]): PhaseIntent {
  return requireValue(
    THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === id),
    `phase ${id}`,
  );
}

function persona(id: string): GoldenPersona {
  return requireValue(
    GOLDEN_PERSONAS.find((candidate) => candidate.fixtureId === id),
    `persona ${id}`,
  );
}

function argumentValue(name: string): string | undefined {
  const prefix = `--${name}=`;

  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function choiceFromArgument<T>(
  argument: string | undefined,
  choices: readonly Choice<T>[],
  prompt: string,
  identifiers: (choice: Choice<T>) => readonly string[] = () => [],
): Choice<T> | undefined {
  if (!argument) {
    return undefined;
  }

  const normalized = slug(argument);
  const selected = choices.find((choice, index) => {
    const keys = [
      String(index + 1),
      slug(choice.label),
      slug(choice.description),
      ...identifiers(choice).map(slug),
    ];

    return keys.includes(normalized);
  });

  if (!selected) {
    throw new Error(`Unknown ${prompt} choice: ${argument}.`);
  }

  return selected;
}

function currentAsOf(): string {
  return new Date().toISOString();
}

function recentIso(asOf: string, daysAgo: number): string {
  return new Date(Date.parse(asOf) - daysAgo * 86_400_000).toISOString();
}

function history(overrides: Partial<TrainingHistory> = {}): TrainingHistory {
  return {
    ...EMPTY_TRAINING_HISTORY,
    ...overrides,
    exerciseHistory: {
      ...EMPTY_TRAINING_HISTORY.exerciseHistory,
      ...overrides.exerciseHistory,
    },
    sessionHistory: {
      ...EMPTY_TRAINING_HISTORY.sessionHistory,
      ...overrides.sessionHistory,
    },
    programHistory: {
      ...EMPTY_TRAINING_HISTORY.programHistory,
      ...overrides.programHistory,
    },
    progressionState: {
      ...EMPTY_TRAINING_HISTORY.progressionState,
      ...overrides.progressionState,
    },
    fatigueState: {
      ...EMPTY_TRAINING_HISTORY.fatigueState,
      ...overrides.fatigueState,
      byMovementRole: {
        ...EMPTY_TRAINING_HISTORY.fatigueState.byMovementRole,
        ...overrides.fatigueState?.byMovementRole,
      },
    },
  };
}

function withoutRowMachine(equipment: EquipmentCapabilities): EquipmentCapabilities {
  return {
    ...equipment,
    machines: {
      availableMachineIds: equipment.machines.availableMachineIds.filter(
        (machineId) => machineId !== "row",
      ),
    },
  };
}

function withoutCable(equipment: EquipmentCapabilities): EquipmentCapabilities {
  return {
    ...equipment,
    cables: {
      available: false,
      adjustableHeight: false,
    },
  };
}

const LAB_NEEDS: readonly Choice<CandidateNeed>[] = [
  {
    label: "Horizontal Pull Main",
    description: "Primary strength row selection.",
    value: {
      id: "lab-horizontal-pull-main",
      whyNeeded: "Manual lab horizontal pull comparison.",
      requestedRole: "primary_strength",
      requestedSection: "main",
      targetMovementRoles: ["horizontal_pull"],
      targetMuscles: ["mid_back", "lats"],
      targetBodyRegions: ["shoulder", "thoracic_spine"],
      goal: "strength",
    },
  },
  {
    label: "Horizontal Push Main",
    description: "Primary strength press selection.",
    value: {
      id: "lab-horizontal-push-main",
      whyNeeded: "Manual lab horizontal push comparison.",
      requestedRole: "primary_strength",
      requestedSection: "main",
      targetMovementRoles: ["horizontal_push"],
      targetMuscles: ["chest", "triceps"],
      targetBodyRegions: ["shoulder", "elbow"],
      goal: "strength",
    },
  },
  {
    label: "Squat Main",
    description: "Primary squat-pattern selection.",
    value: {
      id: "lab-squat-main",
      whyNeeded: "Manual lab squat comparison.",
      requestedRole: "primary_strength",
      requestedSection: "main",
      targetMovementRoles: ["squat"],
      targetMuscles: ["quads", "glutes"],
      targetBodyRegions: ["knee", "hip", "ankle"],
      goal: "strength",
    },
  },
  {
    label: "Hinge Accessory",
    description: "Secondary hinge exposure.",
    value: {
      id: "lab-hinge-accessory",
      whyNeeded: "Manual lab hinge accessory comparison.",
      requestedRole: "secondary_strength",
      requestedSection: "accessory",
      targetMovementRoles: ["hinge"],
      targetMuscles: ["hamstrings", "glutes"],
      targetBodyRegions: ["hip", "lumbar_spine"],
      goal: "strength",
    },
  },
  {
    label: "Trunk Activation",
    description: "Activation drill for trunk control.",
    value: {
      id: "lab-trunk-activation",
      whyNeeded: "Manual lab trunk-control activation comparison.",
      requestedRole: "activation",
      requestedSection: "activation",
      targetMovementRoles: ["anti_extension_core", "anti_rotation_core"],
      targetMuscles: ["trunk"],
      targetBodyRegions: ["lumbar_spine", "pelvis"],
      goal: "posture_and_movement_quality",
    },
  },
  {
    label: "Scapular Activation",
    description: "Activation drill for scapular control.",
    value: {
      id: "lab-scapular-activation",
      whyNeeded: "Manual lab scapular activation comparison.",
      requestedRole: "activation",
      requestedSection: "activation",
      targetMovementRoles: ["scapular_control", "horizontal_pull"],
      targetMuscles: ["serratus", "rear_delts", "upper_back", "rotator_cuff"],
      targetBodyRegions: ["shoulder", "thoracic_spine"],
      goal: "posture_and_movement_quality",
    },
  },
  {
    label: "Single-Leg Accessory",
    description: "Accessory work for hip and knee control.",
    value: {
      id: "lab-single-leg-accessory",
      whyNeeded: "Manual lab single-leg accessory comparison.",
      requestedRole: "hypertrophy_accessory",
      requestedSection: "accessory",
      targetMovementRoles: ["single_leg"],
      targetMuscles: ["glutes", "hip_abductors"],
      targetBodyRegions: ["hip", "knee"],
      goal: "hypertrophy",
    },
  },
];

function trunkAssessment(): AssessmentState {
  return {
    signals: [
      {
        id: "lab-trunk-control",
        type: "control_finding",
        source: "movement_screen",
        confidence: "high",
        priority: "primary",
        region: "lumbar_spine",
        movementRole: "anti_extension_core",
        muscleGroup: "trunk",
        description: "Manual lab trunk-control finding.",
      },
    ],
    historicalWeaknesses: [],
  };
}

function genericScapularAssessment(): AssessmentState {
  return {
    signals: [
      {
        id: "lab-scapular-control",
        type: "control_finding",
        source: "movement_screen",
        confidence: "high",
        priority: "primary",
        region: "shoulder",
        movementRole: "scapular_control",
        description: "Manual lab generic scapular-control finding.",
      },
    ],
    historicalWeaknesses: [],
  };
}

function serratusScapularAssessment(): AssessmentState {
  return {
    signals: [
      {
        id: "lab-serratus-protraction-control",
        type: "control_finding",
        source: "movement_screen",
        confidence: "high",
        priority: "primary",
        region: "shoulder",
        movementRole: "scapular_control",
        muscleGroup: "serratus",
        description: "Manual lab serratus/protraction-control finding.",
      },
    ],
    historicalWeaknesses: [],
  };
}

function explicitScapularFeatureAssessment(input: {
  readonly id: string;
  readonly feature: AssessmentFeature;
  readonly description: string;
}): AssessmentState {
  return {
    signals: [
      {
        id: input.id,
        type: "control_finding",
        source: "movement_screen",
        confidence: "high",
        priority: "primary",
        region: "shoulder",
        movementRole: "scapular_control",
        assessmentFeatures: [input.feature],
        description: input.description,
      },
    ],
    historicalWeaknesses: [],
  };
}

function kneeAssessment(): AssessmentState {
  return {
    signals: [
      {
        id: "lab-knee-control",
        type: "control_finding",
        source: "movement_screen",
        confidence: "high",
        priority: "primary",
        severity: "moderate",
        region: "knee",
        movementRole: "squat",
        muscleGroup: "glutes",
        description: "Manual lab knee-control finding.",
      },
    ],
    historicalWeaknesses: [],
  };
}

function lowBackAssessment(): AssessmentState {
  return {
    signals: [
      {
        id: "lab-low-back-control",
        type: "control_finding",
        source: "movement_screen",
        confidence: "medium",
        priority: "secondary",
        region: "lumbar_spine",
        movementRole: "hinge",
        description: "Manual lab low-back hinge-control finding.",
      },
    ],
    historicalWeaknesses: [],
  };
}

const LOW_BACK_DISCOMFORT: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "lab-low-back-discomfort",
      region: "lumbar_spine",
      severity0To10: 2,
      stressTags: ["loaded_hinge", "loaded_spinal_flexion"],
      effect: "prefer_support",
      description: "Mild low-back discomfort.",
    },
  ],
};

const KNEE_DISCOMFORT: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "lab-knee-discomfort",
      region: "knee",
      severity0To10: 2,
      stressTags: ["loaded_knee_flexion"],
      effect: "reduce_range",
      description: "Mild knee discomfort with loaded flexion.",
    },
  ],
};

const WRIST_DISCOMFORT: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "lab-wrist-discomfort",
      region: "wrist",
      severity0To10: 2,
      stressTags: ["wrist_extension_loading"],
      effect: "prefer_support",
      description: "Mild wrist extension discomfort.",
    },
  ],
};

const SHOULDER_DISCOMFORT: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "lab-shoulder-discomfort",
      region: "shoulder",
      severity0To10: 2,
      stressTags: ["horizontal_pressing", "shoulder_abduction_external_rotation"],
      effect: "prefer_support",
      description: "Mild shoulder discomfort.",
    },
  ],
};

function assessmentChoices(selectedPersona: GoldenPersona): readonly Choice<AssessmentState>[] {
  return [
    {
      label: "Real Posture Photo",
      description: "Uses the accepted posture fixture assessment signals.",
      value: POSTURE_PHOTO_ASSESSMENT_STATE,
    },
    {
      label: "Persona Assessment",
      description: `${selectedPersona.fixtureId} fixture assessment.`,
      value: selectedPersona.assessment,
    },
    {
      label: "None",
      description: "Assessment disabled for a single run.",
      value: EMPTY_ASSESSMENT,
    },
    {
      label: "Trunk Control",
      description: "High-confidence anti-extension trunk finding.",
      value: trunkAssessment(),
    },
    {
      label: "Generic Scapular Control",
      description: "High-confidence scapular-control finding with no feature-specific evidence.",
      value: genericScapularAssessment(),
    },
    {
      label: "Serratus / Protraction Control",
      description: "High-confidence serratus/protraction scapular-control finding.",
      value: serratusScapularAssessment(),
    },
    {
      label: "Upward Rotation Control",
      description: "High-confidence explicit upward-rotation scapular-control finding.",
      value: explicitScapularFeatureAssessment({
        id: "lab-upward-rotation-control",
        feature: "upward_rotation_control",
        description: "Manual lab upward-rotation control finding.",
      }),
    },
    {
      label: "Retraction Control",
      description: "High-confidence explicit scapular retraction-control finding.",
      value: explicitScapularFeatureAssessment({
        id: "lab-retraction-control",
        feature: "retraction_control",
        description: "Manual lab retraction-control finding.",
      }),
    },
    {
      label: "External Rotation / Cuff Control",
      description: "High-confidence explicit external-rotation/cuff finding.",
      value: explicitScapularFeatureAssessment({
        id: "lab-external-rotation-cuff-control",
        feature: "external_rotation_or_cuff_control",
        description: "Manual lab external-rotation/cuff-control finding.",
      }),
    },
    {
      label: "Loaded Scapular Stability",
      description: "High-confidence explicit loaded scapular-stability finding.",
      value: explicitScapularFeatureAssessment({
        id: "lab-loaded-scapular-stability",
        feature: "loaded_scapular_stability",
        description: "Manual lab loaded scapular-stability finding.",
      }),
    },
    {
      label: "Knee Control",
      description: "High-confidence knee/squat finding with moderate severity.",
      value: kneeAssessment(),
    },
    {
      label: "Low-Back Hinge",
      description: "Medium-confidence low-back hinge-control finding.",
      value: lowBackAssessment(),
    },
  ];
}

function painChoices(selectedPersona: GoldenPersona): readonly Choice<PainAndInjuryState>[] {
  return [
    {
      label: "None",
      description: "No pain or injury context.",
      value: NO_PAIN_OR_INJURY,
    },
    {
      label: "Persona Pain",
      description: `${selectedPersona.fixtureId} fixture pain state.`,
      value: selectedPersona.painAndInjury,
    },
    {
      label: "Low-Back Discomfort",
      description: "Mild low-back support preference.",
      value: LOW_BACK_DISCOMFORT,
    },
    {
      label: "Knee Discomfort",
      description: "Mild loaded knee-flexion range reduction.",
      value: KNEE_DISCOMFORT,
    },
    {
      label: "Wrist Discomfort",
      description: "Mild wrist extension support preference.",
      value: WRIST_DISCOMFORT,
    },
    {
      label: "Shoulder Discomfort",
      description: "Mild shoulder pressing support preference.",
      value: SHOULDER_DISCOMFORT,
    },
  ];
}

function historyChoices(
  selectedPersona: GoldenPersona,
  asOf: string,
): readonly Choice<TrainingHistory>[] {
  return [
    {
      label: "None",
      description: "No training history evidence.",
      value: EMPTY_TRAINING_HISTORY,
    },
    {
      label: "Persona History",
      description: `${selectedPersona.fixtureId} fixture history.`,
      value: selectedPersona.history,
    },
    {
      label: "Scapular Successes",
      description: "Two recent matching successes plus progression corroboration.",
      value: history({
        exerciseHistory: {
          events: [
            {
              id: "lab-scapular-appropriate",
              exerciseId: "serratus-wall-slide",
              type: "appropriate_challenge",
              occurredAt: recentIso(asOf, 6),
              movementRole: "scapular_control",
              notes: "Scapular drill was appropriately challenging.",
            },
            {
              id: "lab-scapular-too-easy",
              exerciseId: "serratus-wall-slide",
              type: "too_easy",
              occurredAt: recentIso(asOf, 2),
              movementRole: "scapular_control",
              notes: "Scapular drill was ready to progress.",
            },
          ],
          stableExerciseIds: ["serratus-wall-slide"],
          blockedExerciseIds: [],
        },
        progressionState: {
          ...EMPTY_TRAINING_HISTORY.progressionState,
          successfulMovementRoles: ["scapular_control"],
        },
      }),
    },
    {
      label: "Scapular Contradiction",
      description: "Matching success and failure in the same movement role.",
      value: history({
        exerciseHistory: {
          events: [
            {
              id: "lab-scapular-easy",
              exerciseId: "serratus-wall-slide",
              type: "too_easy",
              occurredAt: recentIso(asOf, 5),
              movementRole: "scapular_control",
              notes: "Scapular work was easy.",
            },
            {
              id: "lab-scapular-difficult",
              exerciseId: "band-face-pull",
              type: "too_difficult",
              occurredAt: recentIso(asOf, 1),
              movementRole: "scapular_control",
              notes: "Loaded scapular work was too difficult.",
            },
          ],
          stableExerciseIds: [],
          blockedExerciseIds: [],
        },
      }),
    },
    {
      label: "Squat Failures",
      description: "Repeated matching lower-body failures.",
      value: history({
        exerciseHistory: {
          events: [
            {
              id: "lab-squat-progression-failure",
              exerciseId: "goblet-squat",
              type: "progression_failure",
              occurredAt: recentIso(asOf, 14),
              movementRole: "squat",
              notes: "Squat load progression failed.",
            },
            {
              id: "lab-squat-failed-target",
              exerciseId: "leg-press",
              type: "failed_target",
              occurredAt: recentIso(asOf, 7),
              movementRole: "squat",
              notes: "Squat-pattern target was missed.",
            },
          ],
          stableExerciseIds: [],
          blockedExerciseIds: [],
        },
      }),
    },
    {
      label: "Unrelated Pull Fatigue",
      description: "High horizontal-pull fatigue for testing unrelated context.",
      value: history({
        fatigueState: {
          overall: "low",
          byMovementRole: {
            horizontal_pull: "high",
          },
        },
      }),
    },
  ];
}

function equipmentChoices(selectedPersona: GoldenPersona): readonly Choice<EquipmentCapabilities>[] {
  return [
    {
      label: "Persona Equipment",
      description: `${selectedPersona.fixtureId} fixture equipment.`,
      value: selectedPersona.equipment,
    },
    {
      label: "Full Gym",
      description: "Full gym fixture equipment.",
      value: FULL_GYM_EQUIPMENT,
    },
    {
      label: "No Row Machine",
      description: "Full gym with the row machine capability removed.",
      value: withoutRowMachine(FULL_GYM_EQUIPMENT),
    },
    {
      label: "No Cable",
      description: "Full gym with cable capability removed.",
      value: withoutCable(FULL_GYM_EQUIPMENT),
    },
    {
      label: "Dumbbells + Bench",
      description: "Dumbbells with a stable bench, no machine or cable.",
      value: DUMBBELLS_AND_BENCH_EQUIPMENT,
    },
    {
      label: "Dumbbells No Bench",
      description: "Dumbbells without a stable bench, no machine or cable.",
      value: DUMBBELLS_NO_BENCH_EQUIPMENT,
    },
  ];
}

function continuityChoices(asOf: string): readonly Choice<ContinuityChoiceValue>[] {
  return [
    {
      label: "None",
      description: "No exercise-specific continuity override.",
      value: {
        continuity: EMPTY_CONTINUITY,
        historyOverlay: (baseHistory) => baseHistory,
      },
    },
    {
      label: "Machine Row Productive",
      description: "Machine row is current, productive, stable, and recently exposed.",
      value: {
        continuity: {
          ...EMPTY_CONTINUITY,
          currentExerciseId: "machine-row",
          productiveExerciseIds: ["machine-row"],
        },
        historyOverlay: (baseHistory) => history({
          ...baseHistory,
          exerciseHistory: {
            ...baseHistory.exerciseHistory,
            events: [
              ...baseHistory.exerciseHistory.events,
              {
                id: "manual-machine-row-productive-history",
                exerciseId: "machine-row",
                type: "appropriate_challenge",
                occurredAt: recentIso(asOf, 3),
                movementRole: "horizontal_pull",
                notes: "Machine row was productively challenging.",
              },
            ],
            stableExerciseIds: [...baseHistory.exerciseHistory.stableExerciseIds, "machine-row"],
          },
          progressionState: {
            ...baseHistory.progressionState,
            readyToProgressExerciseIds: [
              ...baseHistory.progressionState.readyToProgressExerciseIds,
              "machine-row",
            ],
          },
        }),
      },
    },
  ];
}

function personaChoices(): readonly Choice<GoldenPersona>[] {
  const preferredOrder = [
    "intermediate-gym-muscle-gain",
    "mixed-home",
    "beginner-gym-no-pain",
    "beginner-gym-shoulder-concern",
    "advanced-gym-muscle-gain",
  ];
  const preferred = preferredOrder.map(persona);
  const remaining = GOLDEN_PERSONAS.filter(
    (candidate) => !preferredOrder.includes(candidate.fixtureId),
  );

  return [...preferred, ...remaining].map((candidate) => ({
    label: candidate.athlete.label,
    description: candidate.fixtureId,
    value: candidate,
  }));
}

function phaseChoices(): readonly Choice<PhaseIntent>[] {
  return [
    { label: "Phase 2", description: "Progressive loading with recoverability.", value: phase("phase_2") },
    { label: "Phase 1", description: "Control and repeatability.", value: phase("phase_1") },
    { label: "Phase 3", description: "Higher stimulus and loadability.", value: phase("phase_3") },
  ];
}

function fatigueSignalsForHistory(selectedHistory: TrainingHistory): readonly FatigueSignal[] {
  const signals = new Set<FatigueSignal>();

  if (
    selectedHistory.fatigueState.overall === "moderate" ||
    selectedHistory.fatigueState.overall === "high"
  ) {
    signals.add("systemic_fatigue");
  }

  if (
    Object.values(selectedHistory.fatigueState.byMovementRole).some(
      (level) => level === "moderate" || level === "high",
    )
  ) {
    signals.add("local_fatigue");
  }

  return signals.size === 0 ? ["fresh"] : [...signals];
}

async function choose<T>(
  rl: ReturnType<typeof createInterface>,
  prompt: string,
  choices: readonly Choice<T>[],
): Promise<Choice<T>> {
  while (true) {
    console.log(`\n${prompt}`);
    choices.forEach((choice, index) => {
      const defaultMarker = index === 0 ? " [default]" : "";
      console.log(`${index + 1}. ${choice.label}${defaultMarker} - ${choice.description}`);
    });

    const answer = (await rl.question("> ")).trim();
    const selectedIndex = answer === "" ? 0 : Number(answer) - 1;

    if (Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < choices.length) {
      return choices[selectedIndex];
    }

    console.log(`Choose a number from 1 to ${choices.length}.`);
  }
}

function buildRequest(input: {
  readonly personaChoice: Choice<GoldenPersona>;
  readonly phaseChoice: Choice<PhaseIntent>;
  readonly needChoice: Choice<CandidateNeed>;
  readonly assessmentChoice: Choice<AssessmentState>;
  readonly painChoice: Choice<PainAndInjuryState>;
  readonly historyChoice: Choice<TrainingHistory>;
  readonly equipmentChoice: Choice<EquipmentCapabilities>;
  readonly continuityChoice: Choice<ContinuityChoiceValue>;
  readonly asOf: string;
}): CandidateRequest {
  const assessment = input.assessmentChoice.value;
  const selectedHistory = input.continuityChoice.value.historyOverlay(input.historyChoice.value);

  return {
    id: [
      "manual-lab",
      input.personaChoice.value.fixtureId,
      input.phaseChoice.value.id,
      input.needChoice.value.id,
    ].join(":"),
    evaluationContext: {
      asOf: input.asOf,
    },
    athlete: input.personaChoice.value.athlete,
    goal: input.needChoice.value.goal,
    phase: input.phaseChoice.value,
    need: input.needChoice.value,
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
    painAndInjury: input.painChoice.value,
    equipment: input.equipmentChoice.value,
    history: selectedHistory,
    continuity: input.continuityChoice.value.continuity,
    candidatePool: REFERENCE_EXERCISES,
    satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control", "overhead-control"],
    fatigueSignals: fatigueSignalsForHistory(selectedHistory),
    notes: [
      `Manual lab persona: ${input.personaChoice.label}`,
      `Manual lab assessment: ${input.assessmentChoice.label}`,
      `Manual lab pain: ${input.painChoice.label}`,
      `Manual lab history: ${input.historyChoice.label}`,
    ],
  };
}

function formatNumber(value: number): string {
  return value.toFixed(3);
}

function formatNullable(value: number | null): string {
  return value === null ? "unknown" : formatNumber(value);
}

function printTable(headers: readonly string[], rows: readonly (readonly string[])[]): void {
  const widths = headers.map((header, column) =>
    Math.max(header.length, ...rows.map((row) => row[column]?.length ?? 0)),
  );
  const renderRow = (row: readonly string[]) =>
    row.map((cell, column) => cell.padEnd(widths[column])).join("  ");

  console.log(renderRow(headers));
  console.log(widths.map((width) => "-".repeat(width)).join("  "));
  rows.forEach((row) => console.log(renderRow(row)));
}

function assessmentComponent(candidate: RankedCandidate): ScoreComponent | undefined {
  return candidate.components.find((component) => component.id === "assessment_fit");
}

function assessmentTraces(candidate: RankedCandidate): readonly AssessmentRelevanceTrace[] {
  return assessmentComponent(candidate)?.assessmentRelevance ?? [];
}

function printRankedTable(result: CandidateRankingResult): void {
  console.log("\nRanked Candidates");
  printTable(
    ["Rank", "Exercise", "Total", "Assessment", "Alignment", "Pain", "Phase"],
    result.rankedCandidates.map((candidate) => {
      const components = new Map(candidate.components.map((component) => [component.id, component.value]));

      return [
        String(candidate.rank),
        `${candidate.exercise.id} / ${candidate.exercise.name}`,
        formatNumber(candidate.total),
        formatNumber(components.get("assessment_fit") ?? 0),
        formatNumber(components.get("alignment_fit") ?? 0),
        formatNumber(components.get("pain_suitability") ?? 0),
        formatNumber(components.get("phase_fit") ?? 0),
      ];
    }),
  );
}

function printComponentScores(result: CandidateRankingResult, candidateCount = 3): void {
  console.log(`\nComponent Scores (top ${Math.min(candidateCount, result.rankedCandidates.length)})`);
  result.rankedCandidates.slice(0, candidateCount).forEach((candidate) => {
    console.log(`\n#${candidate.rank} ${candidate.exercise.id} / ${candidate.exercise.name}`);
    printTable(
      ["Component", "Raw", "Weight", "Contribution"],
      candidate.components.map((component) => [
        component.id,
        formatNumber(component.rawValue),
        formatNumber(component.weight),
        formatNumber(component.weightedContribution),
      ]),
    );
  });
}

function historySummary(trace: AssessmentRelevanceTrace): string {
  const historyEvidence = trace.demandCapability.capabilityEstimate.historyEvidence;

  return [
    `match=${historyEvidence.matchingEventCount}`,
    `+${historyEvidence.positiveEvidenceCount}`,
    `-${historyEvidence.negativeEvidenceCount}`,
    `stale=${historyEvidence.staleEventCount}`,
    `noRecency=${historyEvidence.noRecencyEventCount}`,
    `contradiction=${historyEvidence.contradiction}`,
    `progression=${historyEvidence.progressionStateCorroborates}`,
    `quality=${historyEvidence.evidenceQuality}`,
    `adj=${formatNumber(historyEvidence.adjustment)}`,
  ].join(" ");
}

function demandReductionSummary(trace: AssessmentRelevanceTrace): string {
  const context = trace.demandReductionContext;

  return [
    `relevant=${context.relevant}`,
    `pain=[${context.matchedPainConcernIds.join(",") || "-"}]`,
    `sensitivity=[${context.matchedHistoricalSensitivityIds.join(",") || "-"}]`,
    `fatigue=[${context.matchedFatigueMovementRoles.join(",") || "-"}]`,
    `systemic=${context.systemicFatigueUsed}`,
  ].join(" ");
}

function featureCells(trace: AssessmentRelevanceTrace): readonly string[] {
  if (trace.featureDevelopment.length === 0) {
    return ["generic", "unknown", "not_applicable", "not_applicable", "not_applicable"];
  }

  return [
    trace.featureDevelopment.map((feature) => feature.assessmentFeature).join(", "),
    trace.featureMatches.map((match) => match.assessmentFeatureSource).join(", "),
    trace.featureDevelopment
      .map(
        (feature, index) =>
          `${trace.featureMatches[index]?.candidateFeature ?? "unknown"}:${feature.featureEmphasisLevel}/${feature.featureEmphasisSource}`,
      )
      .join(", "),
    trace.featureDevelopment.map((feature) => feature.featureReviewStatus).join(", "),
    trace.featureDevelopment.map((feature) => feature.featureMatch).join(", "),
  ];
}

function featureDevelopmentCells(trace: AssessmentRelevanceTrace): readonly string[] {
  if (trace.featureDevelopment.length === 0) {
    return ["not_applicable", "not_applicable", "not_applicable", "not_applicable"];
  }

  return [
    trace.featureDevelopment
      .map(
        (feature) =>
          `${formatNullable(feature.featureChallengeDemand)}/${feature.featureChallengeDemandSource}`,
      )
      .join(", "),
    trace.featureDevelopment
      .map(
        (feature) =>
          `${formatNullable(feature.featureCapabilityEstimate)}/${feature.featureCapabilityPriorSource}`,
      )
      .join(", "),
    trace.featureDevelopment
      .map(
        (feature) =>
          `${feature.featureCapabilitySource}/${feature.featureCapabilityEvidenceQuality}/specific=${feature.featureSpecificEvidenceSources.join(",") || "none"}/history=${feature.featureSpecificHistorySupport}`,
      )
      .join(", "),
    trace.featureDevelopment.map((feature) => feature.featureDemandCapabilityMatch).join(", "),
  ];
}

function taskDemandCell(trace: AssessmentRelevanceTrace): string {
  return [
    formatNullable(trace.demandCapability.candidateDemand),
    trace.demandCapability.candidateDemandSource.level,
    trace.demandCapability.candidateDemandSource.source,
    trace.demandCapability.candidateDemandSource.reviewStatus,
  ].join("/");
}

function taskCapabilityCell(trace: AssessmentRelevanceTrace): string {
  return [
    formatNumber(trace.demandCapability.currentCapability),
    trace.demandCapability.capabilityEstimate.estimateSource,
    trace.demandCapability.capabilityEstimate.evidenceQuality,
  ].join("/");
}

function printAssessmentTraces(result: CandidateRankingResult, candidateCount = 3): void {
  console.log(`\nAssessment Traces (top ${Math.min(candidateCount, result.rankedCandidates.length)})`);
  result.rankedCandidates.slice(0, candidateCount).forEach((candidate) => {
    const traces = assessmentTraces(candidate);
    console.log(`\n#${candidate.rank} ${candidate.exercise.id} / ${candidate.exercise.name}`);

    if (traces.length === 0) {
      console.log("No assessment trace.");
      return;
    }

    printTable(
      [
        "Signal",
        "Rel",
        "Feature",
        "Feature Src",
        "Feature Emphasis",
        "Feature Review",
        "Feature Match",
        "Relationship",
        "Task Demand",
        "Task Capability",
        "Task Match",
        "Feature Challenge",
        "Feature Cap Prior",
        "Feature Cap Evidence",
        "Feature Dev Match",
        "Severity",
        "Bounded",
      ],
      traces.map((trace) => [
        trace.signalId,
        trace.relevance,
        ...featureCells(trace),
        trace.relationship,
        taskDemandCell(trace),
        taskCapabilityCell(trace),
        trace.demandCapability.match,
        ...featureDevelopmentCells(trace),
        `${trace.signalInterpretation.severity}/${trace.signalInterpretation.severitySource}`,
        formatNumber(trace.boundedInfluence),
      ]),
    );

    traces.forEach((trace) => {
      console.log(`  ${trace.signalId} history: ${historySummary(trace)}`);
      console.log(`  ${trace.signalId} demand-reduction: ${demandReductionSummary(trace)}`);
    });
  });
}

function printHardRejections(result: CandidateRankingResult): void {
  console.log(`\nHard Rejections (${result.hardRejectedCandidates.length})`);
  printTable(
    ["Exercise", "Codes"],
    result.hardRejectedCandidates.map((candidate) => [
      `${candidate.exercise.id} / ${candidate.exercise.name}`,
      candidate.eligibility.rejectionReasons.map((reason) => reason.code).join(", "),
    ]),
  );
}

function formatList(values: readonly string[]): string {
  return values.length > 0 ? values.join("; ") : "none";
}

function printHorizontalRowKnowledge(result: CandidateRankingResult): void {
  const trace = buildHorizontalRowSelectionTrace(result);

  console.log("\nHorizontal Row Knowledge");
  printTable(
    [
      "Exercise",
      "Rank",
      "Total",
      "Legal",
      "Support",
      "Resistance Path",
      "Demand",
      "Loading",
      "Contextual Differentiators",
      "Context Required",
    ],
    trace.candidates.map((candidate) => [
      `${candidate.exerciseId} / ${candidate.name}`,
      candidate.rank ? String(candidate.rank) : "rejected",
      candidate.total === null ? "-" : formatNumber(candidate.total),
      candidate.legal ? "yes" : candidate.rejectionCodes.join(", "),
      `${candidate.support.externalSupport}/${candidate.support.bodySupport}/${candidate.support.reviewStatus}`,
      [
        candidate.resistancePath.resistancePath,
        `trajectory=${candidate.resistancePath.trajectoryFreedom}`,
        `line=${candidate.resistancePath.lineOfPullAdjustability}`,
        `laterality=${candidate.resistancePath.laterality}`,
        `fit=${candidate.resistancePath.fitDependency}`,
        `review=${candidate.resistancePath.reviewStatus}`,
      ].join("; "),
      [
        `trunk=${candidate.demand.trunk}`,
        `stability=${candidate.demand.stability}`,
        `coordination=${candidate.demand.coordination}`,
        `joint=${candidate.demand.jointControl}`,
      ].join("; "),
      [
        `load=${candidate.loading.loadability}`,
        `potential=${candidate.loading.loadingPotential}`,
        `localFatigue=${candidate.loading.localFatigue}`,
        `systemicFatigue=${candidate.loading.systemicFatigue}`,
      ].join("; "),
      formatList(candidate.contextualDifferentiators),
      formatList(candidate.contextRequired),
    ]),
  );

  console.log("\nHorizontal Row Tie Status");
  if (trace.tieStatus.length === 0) {
    console.log("No score-equivalent legal row pairs at current component precision.");
    return;
  }

  printTable(
    ["Pair", "Status", "Evidence"],
    trace.tieStatus.map((tie) => [
      tie.exerciseIds.join(" <-> "),
      tie.statusCodes.join(", "),
      tie.evidence.join("; "),
    ]),
  );
}

function printAssessmentComparison(off: CandidateRankingResult, on: CandidateRankingResult): void {
  console.log("\nAssessment OFF/ON Comparison");
  const offById = new Map(off.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate]));
  const onById = new Map(on.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate]));
  const ids = [...new Set([...offById.keys(), ...onById.keys()])];
  const rows = ids
    .map((id) => {
      const offCandidate = offById.get(id);
      const onCandidate = onById.get(id);
      const exerciseName = onCandidate?.exercise.name ?? offCandidate?.exercise.name ?? id;
      const offRank = offCandidate ? String(offCandidate.rank) : "rejected";
      const onRank = onCandidate ? String(onCandidate.rank) : "rejected";
      const offTotal = offCandidate ? formatNumber(offCandidate.total) : "-";
      const onTotal = onCandidate ? formatNumber(onCandidate.total) : "-";
      const totalDelta =
        offCandidate && onCandidate ? formatNumber(onCandidate.total - offCandidate.total) : "-";
      const rankDelta =
        offCandidate && onCandidate ? String(offCandidate.rank - onCandidate.rank) : "-";

      return {
        sortRank: onCandidate?.rank ?? offCandidate?.rank ?? 999,
        row: [`${id} / ${exerciseName}`, offRank, onRank, offTotal, onTotal, totalDelta, rankDelta],
      };
    })
    .sort((left, right) => left.sortRank - right.sortRank)
    .map((entry) => entry.row);

  printTable(["Exercise", "Off Rank", "On Rank", "Off", "On", "Total Delta", "Rank Delta"], rows);
}

function renderResult(result: CandidateRankingResult): void {
  console.log("\nRequest");
  printTable(
    ["Field", "Value"],
    [
      ["id", result.request.id],
      ["asOf", result.request.evaluationContext?.asOf ?? "not supplied"],
      ["athlete", result.request.athlete.label],
      ["phase", result.request.phase.id],
      ["need", `${result.request.need.id} / ${result.request.need.requestedRole}`],
      ["assessmentSignals", String(result.request.assessment.signals.length)],
      ["painConcerns", String(result.interpretedContext.relevantPainIds.length)],
      ["fatigueSignals", result.request.fatigueSignals.join(", ")],
      ["legalCandidates", String(result.legalCandidateCount)],
    ],
  );
  printRankedTable(result);
  printComponentScores(result);
  printAssessmentTraces(result);
  printHardRejections(result);
}

async function main(): Promise<void> {
  const rl = createInterface({ input: nodeInput, output: nodeOutput });

  try {
    console.log("Training Engine V2 Manual Candidate Lab");
    console.log("Developer-only diagnostic wrapper around runCandidateRankingLab.");

    const outputModeChoices = [
      {
        label: "Assessment OFF/ON Comparison",
        description: "Run assessment-disabled and selected-assessment requests.",
        value: "compare" as const,
      },
      {
        label: "Single Run",
        description: "Run only the selected request.",
        value: "single" as const,
      },
    ] as const;
    const useDefaults = process.argv.includes("--defaults");
    const showRowKnowledge = process.argv.includes("--row-knowledge");
    const asOf = argumentValue("as-of") ?? currentAsOf();
    const personaOptions = personaChoices();
    const phaseOptions = phaseChoices();
    const selectedPersona = useDefaults
      ? personaOptions[0]
      : choiceFromArgument(
          argumentValue("persona"),
          personaOptions,
          "Persona",
          (choice) => [choice.value.fixtureId],
        ) ?? await choose(rl, "Persona", personaOptions);
    const selectedPhase = useDefaults
      ? phaseOptions[0]
      : choiceFromArgument(
          argumentValue("phase"),
          phaseOptions,
          "Phase",
          (choice) => [choice.value.id],
        ) ?? await choose(rl, "Phase", phaseOptions);
    const assessmentOptions = assessmentChoices(selectedPersona.value);
    const painOptions = painChoices(selectedPersona.value);
    const historyOptions = historyChoices(selectedPersona.value, asOf);
    const equipmentOptions = equipmentChoices(selectedPersona.value);
    const continuityOptions = continuityChoices(asOf);
    const selectedNeed = useDefaults
      ? LAB_NEEDS[0]
      : choiceFromArgument(
          argumentValue("need"),
          LAB_NEEDS,
          "Training Need",
          (choice) => [choice.value.id],
        ) ?? await choose(rl, "Training Need", LAB_NEEDS);
    const selectedAssessment = useDefaults
      ? assessmentOptions[0]
      : choiceFromArgument(
          argumentValue("assessment"),
          assessmentOptions,
          "Assessment",
          (choice) => choice.value.signals.map((signal) => signal.id),
        ) ?? await choose(rl, "Assessment", assessmentOptions);
    const selectedPain = useDefaults
      ? painOptions[0]
      : choiceFromArgument(argumentValue("pain"), painOptions, "Pain / Concern") ??
        await choose(rl, "Pain / Concern", painOptions);
    const selectedHistory = useDefaults
      ? historyOptions[0]
      : choiceFromArgument(argumentValue("history"), historyOptions, "History") ??
        await choose(rl, "History", historyOptions);
    const selectedEquipment = useDefaults
      ? equipmentOptions[0]
      : choiceFromArgument(argumentValue("equipment"), equipmentOptions, "Equipment") ??
        await choose(rl, "Equipment", equipmentOptions);
    const selectedContinuity = useDefaults
      ? continuityOptions[0]
      : choiceFromArgument(argumentValue("continuity"), continuityOptions, "Continuity") ??
        await choose(rl, "Continuity", continuityOptions);
    const selectedMode = useDefaults
      ? outputModeChoices[0]
      : choiceFromArgument(
          argumentValue("mode"),
          outputModeChoices,
          "Output Mode",
          (choice) => [choice.value],
        ) ?? await choose(rl, "Output Mode", outputModeChoices);

    if (useDefaults) {
      console.log("\nUsing --defaults Quick Start scenario.");
      printTable(
        ["Choice", "Selection"],
        [
          ["Persona", selectedPersona.label],
          ["As Of", asOf],
          ["Phase", selectedPhase.label],
          ["Training Need", selectedNeed.label],
          ["Assessment", selectedAssessment.label],
          ["Pain / Concern", selectedPain.label],
          ["History", selectedHistory.label],
          ["Equipment", selectedEquipment.label],
          ["Continuity", selectedContinuity.label],
          ["Output Mode", selectedMode.label],
        ],
      );
    }

    const request = buildRequest({
      personaChoice: selectedPersona,
      phaseChoice: selectedPhase,
      needChoice: selectedNeed,
      assessmentChoice: selectedAssessment,
      painChoice: selectedPain,
      historyChoice: selectedHistory,
      equipmentChoice: selectedEquipment,
      continuityChoice: selectedContinuity,
      asOf,
    });
    const result = runCandidateRankingLab(request);

    if (selectedMode.value === "compare") {
      const offAssessmentRequest: CandidateRequest = {
        ...request,
        id: `${request.id}:assessment-off`,
        assessment: EMPTY_ASSESSMENT,
        alignmentPriorities: [],
      };
      const offResult = runCandidateRankingLab(offAssessmentRequest);
      printAssessmentComparison(offResult, result);
    }

    renderResult(result);
    if (showRowKnowledge) {
      printHorizontalRowKnowledge(result);
    }
  } finally {
    rl.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
