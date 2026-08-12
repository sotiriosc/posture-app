import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  REFERENCE_EXERCISES,
  runSessionCompositionLab,
  runSessionSequencingLab,
  sessionNeed,
  type MovementRole,
  type SessionCompositionLabInput,
  type SessionExerciseOption,
} from "../../src";
import { buildP0WholeBodyProductionData } from "./p0WholeBodyProduction";
import { buildCurrentTrunkCurationFingerprints } from "./trunkMechanicsCurationProposal";

export const SESSION_COMPOSER_DESIGN_CLASSIFICATION =
  "SESSION_COMPOSER_DESIGN_READY_FOR_PRODUCTION_IMPLEMENTATION_AUTHORIZATION" as const;
export const SESSION_COMPOSER_NEXT_DEPENDENCY =
  "SEPARATE_OWNER_AUTHORIZATION_FOR_PRODUCTION_SESSION_COMPOSER_IMPLEMENTATION" as const;

type CandidateMap = Readonly<Record<
  string,
  readonly [string, number, number, ("available" | "prescription_resolution_required")?][]
>>;

export interface WholeSessionLabScenario {
  readonly id: string;
  readonly description: string;
  readonly input: SessionCompositionLabInput;
  readonly expectedMovementRoleByNeed: Readonly<Record<string, MovementRole>>;
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function option(
  exerciseId: string,
  input: Partial<Omit<SessionExerciseOption, "exerciseId">> = {},
): SessionExerciseOption {
  return {
    exerciseId,
    durationUnits: input.durationUnits ?? 1,
    fatigueCost: input.fatigueCost ?? 1,
    setupKey: input.setupKey ?? "floor",
    redundancyKeys: input.redundancyKeys ?? [],
    continuity: input.continuity ?? "neutral",
  };
}

function snapshot(
  scenarioId: string,
  options: readonly SessionExerciseOption[],
  candidates: CandidateMap,
): SessionCompositionLabInput["candidateIntelligence"] {
  return {
    trainingAvailability: "available",
    requestIdsByNeed: Object.fromEntries(
      Object.keys(candidates).map((needId) => [needId, `${scenarioId}-candidate-request-${needId}`]),
    ),
    exercises: options,
    legalCandidatesByNeed: Object.fromEntries(
      Object.entries(candidates).map(([needId, rows]) => [
        needId,
        rows.map(([exerciseId, candidateRank, candidateValue, compositionAvailability]) => ({
          exerciseId,
          candidateRank,
          candidateValue,
          compositionAvailability: compositionAvailability ?? "available",
        })),
      ]),
    ),
  };
}

const STRENGTH_CONTINUITY: WholeSessionLabScenario = {
  id: "strength-continuity",
  description: "A full-gym strength session retaining productive anchors without adding generic section filler.",
  expectedMovementRoleByNeed: {
    squat: "squat",
    push: "horizontal_push",
    pull: "horizontal_pull",
    trunk: "anti_extension_core",
  },
  input: {
    intent: {
      id: "strength-continuity-intent",
      athleteId: "athlete-strength-continuity",
      needs: [
        sessionNeed({ id: "squat", kind: "training_stimulus", priority: "required", rationale: "Primary lower-body strength exposure." }),
        sessionNeed({ id: "push", kind: "training_stimulus", priority: "required", rationale: "Horizontal push strength exposure." }),
        sessionNeed({ id: "pull", kind: "training_stimulus", priority: "required", rationale: "Horizontal pull strength exposure." }),
        sessionNeed({ id: "trunk", kind: "preparation", priority: "required", rationale: "Explicit anti-extension control need.", preparesForNeedIds: ["squat", "push", "pull"] }),
      ],
      constraints: { maxExercises: 6, maxDurationUnits: 8 },
    },
    candidateIntelligence: snapshot(
      "strength-continuity",
      [
        option("goblet-squat", { fatigueCost: 2, setupKey: "dumbbell", continuity: "productive", redundancyKeys: ["knee-dominant"] }),
        option("bodyweight-box-squat", { setupKey: "box", redundancyKeys: ["knee-dominant"] }),
        option("machine-chest-press", { fatigueCost: 2, setupKey: "machine", continuity: "productive", redundancyKeys: ["horizontal-push"] }),
        option("push-up", { setupKey: "floor", redundancyKeys: ["horizontal-push"] }),
        option("machine-row", { setupKey: "machine", continuity: "productive", redundancyKeys: ["horizontal-pull"] }),
        option("dead-bug", { fatigueCost: 0, setupKey: "floor", continuity: "productive", redundancyKeys: ["anti-extension"] }),
      ],
      {
        squat: [["goblet-squat", 1, 9], ["bodyweight-box-squat", 2, 6]],
        push: [["machine-chest-press", 1, 9], ["push-up", 2, 7]],
        pull: [["machine-row", 1, 9]],
        trunk: [["dead-bug", 1, 9]],
      },
    ),
  },
};

const PAIN_AWARE_RETURN: WholeSessionLabScenario = {
  id: "pain-aware-return",
  description: "A preparation-heavy return session with no manufactured loaded main exercise.",
  expectedMovementRoleByNeed: {
    breathing: "breathing_position",
    hinge_rehearsal: "hinge",
    ankle_range: "mobility",
    single_leg_control: "single_leg",
    trunk: "anti_extension_core",
  },
  input: {
    intent: {
      id: "pain-aware-return-intent",
      athleteId: "athlete-pain-aware-return",
      needs: [
        sessionNeed({ id: "breathing", kind: "preparation", priority: "required", rationale: "Low-load position preparation.", sequenceBeforeNeedIds: ["trunk"] }),
        sessionNeed({ id: "hinge_rehearsal", kind: "preparation", priority: "required", rationale: "Rehearse the hinge without a loaded-strength claim." }),
        sessionNeed({ id: "ankle_range", kind: "preparation", priority: "required", rationale: "Explicit ankle-range need.", preparesForNeedIds: ["single_leg_control"] }),
        sessionNeed({ id: "single_leg_control", kind: "preparation", priority: "required", rationale: "Supported single-leg control exposure." }),
        sessionNeed({ id: "trunk", kind: "preparation", priority: "required", rationale: "Anti-extension control exposure." }),
      ],
      constraints: { maxExercises: 6, maxDurationUnits: 6 },
    },
    candidateIntelligence: snapshot(
      "pain-aware-return",
      [
        option("ninety-ninety-breathing", { fatigueCost: 0, setupKey: "floor" }),
        option("bodyweight-hip-hinge-rehearsal", { fatigueCost: 0, setupKey: "standing" }),
        option("wall-ankle-dorsiflexion-rock", { fatigueCost: 0, setupKey: "wall" }),
        option("single-leg-balance-rehearsal", { fatigueCost: 0, setupKey: "wall" }),
        option("dead-bug", { fatigueCost: 0, setupKey: "floor", continuity: "productive" }),
      ],
      {
        breathing: [["ninety-ninety-breathing", 1, 9]],
        hinge_rehearsal: [["bodyweight-hip-hinge-rehearsal", 1, 9]],
        ankle_range: [["wall-ankle-dorsiflexion-rock", 1, 9]],
        single_leg_control: [["single-leg-balance-rehearsal", 1, 9]],
        trunk: [["dead-bug", 1, 9]],
      },
    ),
  },
};

const TIME_CONSTRAINED: WholeSessionLabScenario = {
  id: "time-constrained-general",
  description: "A short session where one truthful multi-role candidate covers push and trunk needs.",
  expectedMovementRoleByNeed: {
    squat: "squat",
    push: "horizontal_push",
    pull: "horizontal_pull",
    trunk: "anti_extension_core",
  },
  input: {
    intent: {
      id: "time-constrained-general-intent",
      athleteId: "athlete-time-constrained",
      needs: [
        sessionNeed({ id: "squat", kind: "training_stimulus", priority: "required", rationale: "Lower-body pattern exposure." }),
        sessionNeed({ id: "push", kind: "training_stimulus", priority: "required", rationale: "Push exposure." }),
        sessionNeed({ id: "pull", kind: "training_stimulus", priority: "required", rationale: "Pull exposure." }),
        sessionNeed({ id: "trunk", kind: "training_stimulus", priority: "required", rationale: "Anti-extension exposure within the short session." }),
        sessionNeed({ id: "breathing", kind: "recovery", priority: "optional", rationale: "Useful only if already covered without another exercise." }),
      ],
      constraints: { maxExercises: 3, maxDurationUnits: 3 },
    },
    candidateIntelligence: snapshot(
      "time-constrained-general",
      [
        option("goblet-squat", { fatigueCost: 2, setupKey: "dumbbell" }),
        option("push-up", { setupKey: "floor" }),
        option("machine-row", { setupKey: "machine" }),
        option("dead-bug", { fatigueCost: 0, setupKey: "floor" }),
        option("ninety-ninety-breathing", { fatigueCost: 0, setupKey: "floor" }),
      ],
      {
        squat: [["goblet-squat", 1, 9]],
        push: [["push-up", 1, 8]],
        pull: [["machine-row", 1, 9]],
        trunk: [["dead-bug", 1, 9], ["push-up", 2, 7]],
        breathing: [["ninety-ninety-breathing", 1, 9]],
      },
    ),
  },
};

export const WHOLE_SESSION_LAB_SCENARIOS = [
  STRENGTH_CONTINUITY,
  PAIN_AWARE_RETURN,
  TIME_CONSTRAINED,
] as const;

export function buildSessionComposerDesignLabData() {
  const production = buildCurrentTrunkCurationFingerprints();
  const p0 = buildP0WholeBodyProductionData();
  const scenarios = WHOLE_SESSION_LAB_SCENARIOS.map((scenario) => {
    const composition = runSessionCompositionLab(scenario.input);
    const sequence = composition.status === "composed"
      ? runSessionSequencingLab(scenario.input, composition)
      : null;
    return {
      id: scenario.id,
      description: scenario.description,
      needKinds: scenario.input.intent.needs.map((need) => need.kind),
      composition,
      sequence,
    };
  });
  const compositionFingerprint = hash(scenarios);
  return {
    classification: SESSION_COMPOSER_DESIGN_CLASSIFICATION,
    nextDependency: SESSION_COMPOSER_NEXT_DEPENDENCY,
    scenarios,
    compositionFingerprint,
    productionFingerprints: {
      ranking: production.productionRanking,
      comprehensiveBehavior: production.comprehensiveBehavior,
      catalog: production.referenceCatalog,
      knowledgeCompatibility: p0.fingerprints.knowledgeCompatibility,
    },
  } as const;
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((value) => String(value).replaceAll("|", "\\|")).join(" | ")} |`),
  ].join("\n");
}

export function renderSessionComposerWholeSessionLab(): string {
  const data = buildSessionComposerDesignLabData();
  return [
    "# Session Composer Whole-Session Lab",
    "",
    `Classification: \`${data.classification}\`. This is a deterministic non-production laboratory, not a workout generator.`,
    "",
    "## Scenario Results",
    "",
    table(
      ["Scenario", "Need structure", "Selected set", "Order", "Exercises", "Duration", "Fatigue", "Setup transitions"],
      data.scenarios.map((scenario) => {
        const composition = scenario.composition;
        const sequence = scenario.sequence;
        return [
          scenario.id,
          scenario.needKinds.join(", "),
          composition.status === "composed" ? composition.selections.map((row) => row.exerciseId).join(", ") : "infeasible",
          sequence?.status === "sequenced" ? sequence.orderedExerciseIds.join(" -> ") : "infeasible",
          composition.status === "composed" ? composition.metrics.selectedExerciseCount : "n/a",
          composition.status === "composed" ? composition.metrics.durationUnits : "n/a",
          composition.status === "composed" ? composition.metrics.totalFatigueCost : "n/a",
          sequence?.status === "sequenced" ? sequence.setupTransitionCount : "n/a",
        ];
      }),
    ),
    "",
    "The strength, pain-aware return, and time-constrained intents produce materially different need structures and selected set sizes. Shared identities remain allowed when the same truthful need recurs; the lab never adds difference for appearance or variety.",
    "",
    "Every selection belongs to a legal per-need Candidate Intelligence snapshot. Cardinality is minimized first. Equal-size covers then prefer optional coverage already obtained, productive continuity, lower redundancy, lower fatigue, fewer setup families, stronger candidate rank/value, and finally canonical-ID order.",
    "",
    "Sequencing is a separate pass over the selected set. It preserves explicit preparation/precedence edges and minimizes setup transitions among legal orders. It assigns no sets, reps, load, range, support, tempo, effort, rest, or side.",
    "",
    `Lab fingerprint: \`${data.compositionFingerprint}\`.`,
    "",
    "## Frozen Production Behavior",
    "",
    table(["Dimension", "Fingerprint"], Object.entries(data.productionFingerprints)),
    "",
    `Exact next dependency: \`${data.nextDependency}\`.`,
    "",
  ].join("\n");
}

export function writeSessionComposerWholeSessionLab(
  rootDir = process.cwd(),
): string {
  const outputPath = join(rootDir, "docs/training-engine-v2/SESSION_COMPOSER_WHOLE_SESSION_LAB.md");
  writeFileSync(outputPath, renderSessionComposerWholeSessionLab());
  return outputPath;
}

export function canonicalExercise(exerciseId: string) {
  return REFERENCE_EXERCISES.find((exercise) => exercise.id === exerciseId);
}
