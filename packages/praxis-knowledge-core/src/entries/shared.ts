import {
  KNOWLEDGE_ENTRY_CONTRACT,
  KNOWLEDGE_FACT_CONTRACT,
  KNOWLEDGE_PRESENTATION_MAP_CONTRACT,
  KNOWLEDGE_PROVENANCE_CONTRACT,
  REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT,
  type ExerciseKnowledgeEntry,
  type ExerciseKnowledgeFact,
  type ExerciseKnowledgeFactKind,
  type ExerciseKnowledgeProvenance,
  type ExerciseRealizationKnowledgeOverride,
} from "../contracts";

export type KnowledgeCategory = "cues" | "setup" | "during" | "watchFor";

export interface CuratedFactText {
  readonly statement: string;
  readonly compact?: string;
  readonly kind?: ExerciseKnowledgeFactKind;
  readonly source?: "human" | "equipment";
}

export interface CuratedOverrideSpec {
  readonly id: string;
  readonly realizationId: string;
  readonly facts: readonly {
    readonly suffix: string;
    readonly category: Exclude<KnowledgeCategory, "cues">;
    readonly statement: string;
    readonly kind?: ExerciseKnowledgeFactKind;
  }[];
}

export interface CuratedEntrySpec {
  readonly exerciseId: string;
  readonly canonicalName: string;
  readonly legacySummary: string;
  readonly focus: CuratedFactText;
  readonly cues: readonly CuratedFactText[];
  readonly setup: readonly CuratedFactText[];
  readonly during: readonly CuratedFactText[];
  readonly pattern: string;
  readonly mechanicsFacts?: readonly CuratedFactText[];
  readonly watchFor: readonly CuratedFactText[];
  readonly compactCoachingRefs: readonly ("focus" | `cue.${number}`)[];
  readonly overrides?: readonly CuratedOverrideSpec[];
  readonly mechanics: readonly string[];
  readonly roles: readonly string[];
  readonly actions: readonly string[];
  readonly stress: readonly string[];
  readonly painTopics?: readonly string[];
  readonly unresolvedClaims?: readonly string[];
}

const OWNER_REF = "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md";
const FALLBACK_REF = "packages/training-engine-v2/src/data/referenceExercises.ts";
const ENGINE_TRUTH_REF = "packages/training-engine-v2/src/data/referenceExercises.ts";
const HUMAN_REVIEW_REF = "human-review:pre-g2k:2026-08-16";

function provenance(
  sourceType: ExerciseKnowledgeProvenance["sourceType"],
  sourceRef: string,
  evidenceBasis: string,
): ExerciseKnowledgeProvenance {
  return {
    contract: KNOWLEDGE_PROVENANCE_CONTRACT,
    sourceType,
    sourceRef,
    evidenceBasis: [evidenceBasis],
  };
}

const humanReview = (exerciseId: string) => provenance(
  "human_exercise_science_review",
  HUMAN_REVIEW_REF,
  `${exerciseId} language was reviewed for exercise identity, category meaning, plain language, and non-clinical boundaries.`,
);
const ownerBoundary = (exerciseId: string) => provenance(
  "owner_decision",
  OWNER_REF,
  `The owner authorized Knowledge completion while preserving the existing ${exerciseId} identity boundary.`,
);
const fallbackReview = (exerciseId: string) => provenance(
  "human_exercise_science_review",
  FALLBACK_REF,
  `The historical ${exerciseId} compact fallback was reviewed and retained byte-for-byte as presentation output.`,
);
const equipmentTruth = (exerciseId: string) => provenance(
  "equipment_capability_truth",
  ENGINE_TRUTH_REF,
  `${exerciseId} setup remains bounded by the accepted production equipment requirements.`,
);

const defaultKind: Readonly<Record<KnowledgeCategory, ExerciseKnowledgeFactKind>> = {
  cues: "execution_instruction",
  setup: "setup_instruction",
  during: "execution_instruction",
  watchFor: "watch_for",
};

export function defineCuratedEntry(spec: CuratedEntrySpec): ExerciseKnowledgeEntry {
  const id = (suffix: string) => `${spec.exerciseId}.${suffix}`;
  const human = humanReview(spec.exerciseId);
  const legacy = fallbackReview(spec.exerciseId);
  const factRows: {
    suffix: string;
    kind: ExerciseKnowledgeFactKind;
    statement: string;
    compact?: string;
    category: "focus" | "pattern" | KnowledgeCategory;
    realizationIds?: readonly string[];
    source?: "human" | "equipment";
  }[] = [
    { suffix: "focus", kind: spec.focus.kind ?? "execution_instruction", statement: spec.focus.statement, compact: spec.focus.compact, category: "focus", source: spec.focus.source },
    ...spec.cues.map((fact, index) => ({ suffix: `cue.${index + 1}`, kind: fact.kind ?? defaultKind.cues, statement: fact.statement, compact: fact.compact, category: "cues" as const, source: fact.source })),
    ...spec.setup.map((fact, index) => ({ suffix: `setup.${index + 1}`, kind: fact.kind ?? defaultKind.setup, statement: fact.statement, compact: fact.compact, category: "setup" as const, source: fact.source })),
    ...spec.during.map((fact, index) => ({ suffix: `during.${index + 1}`, kind: fact.kind ?? defaultKind.during, statement: fact.statement, compact: fact.compact, category: "during" as const, source: fact.source })),
    { suffix: "pattern", kind: "movement_pattern", statement: spec.pattern, compact: spec.legacySummary, category: "pattern" },
    ...(spec.mechanicsFacts ?? []).map((fact, index) => ({ suffix: `mechanics.${index + 1}`, kind: "mechanics_explanation" as const, statement: fact.statement, compact: fact.compact, category: "pattern" as const, source: fact.source })),
    ...spec.watchFor.map((fact, index) => ({ suffix: `watch.${index + 1}`, kind: fact.kind ?? defaultKind.watchFor, statement: fact.statement, compact: fact.compact, category: "watchFor" as const, source: fact.source })),
    ...(spec.overrides ?? []).flatMap((override) => override.facts.map((fact) => ({
      suffix: `realization.${override.id}.${fact.suffix}`,
      kind: fact.kind ?? defaultKind[fact.category],
      statement: fact.statement,
      category: fact.category,
      realizationIds: [override.realizationId],
    }))),
  ];
  const compactFactIds = new Set([
    id("pattern"),
    ...spec.compactCoachingRefs.map((ref) => id(ref)),
  ]);
  const facts: readonly ExerciseKnowledgeFact[] = Object.freeze(factRows.map((fact) => ({
    contract: KNOWLEDGE_FACT_CONTRACT,
    id: id(fact.suffix),
    exerciseId: spec.exerciseId,
    kind: fact.kind,
    canonicalStatement: fact.statement,
    ...(fact.compact ? { compactInstruction: fact.compact } : {}),
    applicability: {
      realizationIds: Object.freeze([...(fact.realizationIds ?? [])]),
      contexts: Object.freeze(["workout", "library", "curation"] as const),
    },
    reviewStatus: "accepted" as const,
    provenance: Object.freeze([
      human,
      ...(compactFactIds.has(id(fact.suffix)) ? [legacy] : []),
      ...(fact.source === "equipment" ? [equipmentTruth(spec.exerciseId)] : []),
    ]),
  })));
  const categoryRefs = (category: "focus" | "pattern" | KnowledgeCategory) => Object.freeze(
    factRows.filter((fact) => fact.category === category && !fact.realizationIds).map((fact) => id(fact.suffix)),
  );
  const realizationOverrides: readonly ExerciseRealizationKnowledgeOverride[] = Object.freeze(
    (spec.overrides ?? []).map((override) => {
      const refs = (category: Exclude<KnowledgeCategory, "cues">) => override.facts
        .filter((fact) => fact.category === category)
        .map((fact) => id(`realization.${override.id}.${fact.suffix}`));
      return {
        contract: REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT,
        id: id(`realization.${override.id}`),
        exerciseId: spec.exerciseId,
        realizationId: override.realizationId,
        ...(refs("setup").length ? { addSetupRefs: refs("setup") } : {}),
        ...(refs("during").length ? { addDuringRefs: refs("during") } : {}),
        ...(refs("watchFor").length ? { addWatchForRefs: refs("watchFor") } : {}),
        reviewStatus: "accepted" as const,
        provenance: Object.freeze([ownerBoundary(spec.exerciseId), human]),
      };
    }),
  );

  return Object.freeze({
    contract: KNOWLEDGE_ENTRY_CONTRACT,
    exerciseId: spec.exerciseId,
    canonicalName: spec.canonicalName,
    facts,
    presentation: Object.freeze({
      contract: KNOWLEDGE_PRESENTATION_MAP_CONTRACT,
      exerciseId: spec.exerciseId,
      focus: categoryRefs("focus")[0]!,
      cues: categoryRefs("cues"),
      setup: categoryRefs("setup"),
      during: categoryRefs("during"),
      pattern: categoryRefs("pattern"),
      watchFor: categoryRefs("watchFor"),
      compactFallbackRefs: Object.freeze({
        summary: id("pattern"),
        coachingFocus: Object.freeze(spec.compactCoachingRefs.map((ref) => id(ref))),
      }),
    }),
    realizationOverrides,
    relatedMechanicsIds: Object.freeze([...spec.mechanics]),
    relatedMovementRoleIds: Object.freeze([...spec.roles]),
    relatedActionFunctionIds: Object.freeze([...spec.actions]),
    relatedStressTags: Object.freeze([...spec.stress]),
    relatedPainTopicIds: Object.freeze([...(spec.painTopics ?? [])]),
    reviewStatus: "accepted",
    provenance: Object.freeze([ownerBoundary(spec.exerciseId), human]),
    unresolvedClaims: Object.freeze([...(spec.unresolvedClaims ?? [])]),
  });
}

export const fact = (
  statement: string,
  input: Omit<CuratedFactText, "statement"> = {},
): CuratedFactText => ({ statement, ...input });
