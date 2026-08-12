import type {
  CandidateIntelligenceSnapshot,
  ComposedSessionLabResult,
  NeedsFirstSessionIntent,
  SessionCompositionLabInput,
  SessionCompositionLabResult,
  SessionCompositionMetrics,
  SessionCompositionSelection,
  SessionExerciseOption,
  SessionNeed,
  SessionNeedCandidate,
  SessionSequenceEdge,
  SessionSequenceLabResult,
} from "./contracts";

const MAX_LAB_CANDIDATE_IDENTITIES = 20;
const MAX_LAB_SELECTED_EXERCISES = 8;

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function combinations<T>(values: readonly T[], size: number): readonly (readonly T[])[] {
  const result: T[][] = [];
  const visit = (start: number, current: T[]): void => {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let index = start; index <= values.length - (size - current.length); index += 1) {
      current.push(values[index]);
      visit(index + 1, current);
      current.pop();
    }
  };
  visit(0, []);
  return result;
}

function permutations<T>(values: readonly T[]): readonly (readonly T[])[] {
  const result: T[][] = [];
  const visit = (remaining: readonly T[], current: T[]): void => {
    if (remaining.length === 0) {
      result.push([...current]);
      return;
    }
    remaining.forEach((value, index) => {
      current.push(value);
      visit([...remaining.slice(0, index), ...remaining.slice(index + 1)], current);
      current.pop();
    });
  };
  visit(values, []);
  return result;
}

function compareTuples(left: readonly (number | string)[], right: readonly (number | string)[]): number {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const leftValue = left[index];
    const rightValue = right[index];
    if (leftValue === rightValue) continue;
    if (leftValue === undefined) return -1;
    if (rightValue === undefined) return 1;
    return leftValue < rightValue ? -1 : 1;
  }
  return 0;
}

function candidateFor(
  snapshot: CandidateIntelligenceSnapshot,
  needId: string,
  exerciseId: string,
): SessionNeedCandidate | undefined {
  return snapshot.legalCandidatesByNeed[needId]?.find(
    (candidate) =>
      candidate.exerciseId === exerciseId &&
      candidate.compositionAvailability !== "deferred_for_review",
  );
}

function coveredNeedIds(
  intent: NeedsFirstSessionIntent,
  snapshot: CandidateIntelligenceSnapshot,
  exerciseIds: readonly string[],
): readonly string[] {
  return intent.needs
    .filter((need) => exerciseIds.some((exerciseId) => candidateFor(snapshot, need.id, exerciseId)))
    .map((need) => need.id);
}

function redundancyPairCount(
  selected: readonly SessionExerciseOption[],
): number {
  const counts = new Map<string, number>();
  for (const exercise of selected) {
    for (const key of unique(exercise.redundancyKeys)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.values()].reduce((total, count) => total + (count * (count - 1)) / 2, 0);
}

function metricsFor(
  intent: NeedsFirstSessionIntent,
  snapshot: CandidateIntelligenceSnapshot,
  selected: readonly SessionExerciseOption[],
): SessionCompositionMetrics {
  const selectedIds = selected.map((exercise) => exercise.exerciseId);
  const coveredIds = new Set(coveredNeedIds(intent, snapshot, selectedIds));
  const requiredNeeds = intent.needs.filter((need) => need.priority === "required");
  const bestRequiredCandidates = requiredNeeds.map((need) => {
    const candidates = selectedIds
      .map((exerciseId) => candidateFor(snapshot, need.id, exerciseId))
      .filter((candidate): candidate is SessionNeedCandidate => candidate !== undefined)
      .sort((left, right) => left.candidateRank - right.candidateRank || right.candidateValue - left.candidateValue);
    return candidates[0];
  });
  return {
    selectedExerciseCount: selected.length,
    optionalNeedsCovered: intent.needs.filter(
      (need) => need.priority === "optional" && coveredIds.has(need.id),
    ).length,
    productiveContinuityCount: selected.filter(
      (exercise) => exercise.continuity === "productive",
    ).length,
    redundancyPairCount: redundancyPairCount(selected),
    totalFatigueCost: selected.reduce((total, exercise) => total + exercise.fatigueCost, 0),
    setupCount: new Set(selected.map((exercise) => exercise.setupKey)).size,
    requiredCandidateRankSum: bestRequiredCandidates.reduce(
      (total, candidate) => total + (candidate?.candidateRank ?? 0),
      0,
    ),
    requiredCandidateValueSum: bestRequiredCandidates.reduce(
      (total, candidate) => total + (candidate?.candidateValue ?? 0),
      0,
    ),
    durationUnits: selected.reduce((total, exercise) => total + exercise.durationUnits, 0),
  };
}

function metricTuple(metrics: SessionCompositionMetrics, ids: readonly string[]): readonly (number | string)[] {
  return [
    metrics.selectedExerciseCount,
    -metrics.optionalNeedsCovered,
    -metrics.productiveContinuityCount,
    metrics.redundancyPairCount,
    metrics.totalFatigueCost,
    metrics.setupCount,
    metrics.requiredCandidateRankSum,
    -metrics.requiredCandidateValueSum,
    ids.join("|"),
  ];
}

function assertValidInput(input: SessionCompositionLabInput): void {
  const { intent, candidateIntelligence: snapshot } = input;
  const errors: string[] = [];
  const needIds = intent.needs.map((need) => need.id);
  const exerciseIds = snapshot.exercises.map((exercise) => exercise.exerciseId);
  if (!intent.needs.some((need) => need.priority === "required")) {
    errors.push("The composition lab requires at least one required session need.");
  }
  if (new Set(needIds).size !== needIds.length) errors.push("Session need IDs must be unique.");
  if (new Set(exerciseIds).size !== exerciseIds.length) errors.push("Exercise option IDs must be unique.");
  if (intent.constraints.maxExercises < 1 || intent.constraints.maxExercises > MAX_LAB_SELECTED_EXERCISES) {
    errors.push(`Lab maxExercises must be between 1 and ${MAX_LAB_SELECTED_EXERCISES}.`);
  }
  if (intent.constraints.maxDurationUnits <= 0) errors.push("Lab maxDurationUnits must be positive.");
  if (exerciseIds.length > MAX_LAB_CANDIDATE_IDENTITIES) {
    errors.push(`Lab candidate snapshots are limited to ${MAX_LAB_CANDIDATE_IDENTITIES} identities.`);
  }
  for (const need of intent.needs) {
    for (const referencedId of [...need.sequenceBeforeNeedIds, ...need.preparesForNeedIds]) {
      if (!needIds.includes(referencedId)) errors.push(`Need ${need.id} references unknown need ${referencedId}.`);
    }
    if (need.preparesForNeedIds.length > 0 && need.kind !== "preparation") {
      errors.push(`Only preparation needs may declare preparesForNeedIds (${need.id}).`);
    }
    if (!snapshot.requestIdsByNeed[need.id]) errors.push(`Need ${need.id} has no Candidate Intelligence request ID.`);
    const candidates = snapshot.legalCandidatesByNeed[need.id] ?? [];
    if (new Set(candidates.map((candidate) => candidate.exerciseId)).size !== candidates.length) {
      errors.push(`Need ${need.id} repeats an exercise candidate.`);
    }
    for (const candidate of candidates) {
      if (!exerciseIds.includes(candidate.exerciseId)) errors.push(`Need ${need.id} references unknown exercise ${candidate.exerciseId}.`);
      if (!Number.isInteger(candidate.candidateRank) || candidate.candidateRank < 1) {
        errors.push(`Candidate ranks must be positive integers (${need.id}/${candidate.exerciseId}).`);
      }
    }
  }
  for (const exercise of snapshot.exercises) {
    if (exercise.durationUnits <= 0) errors.push(`Exercise ${exercise.exerciseId} duration must be positive.`);
    if (exercise.fatigueCost < 0) errors.push(`Exercise ${exercise.exerciseId} fatigue cost cannot be negative.`);
    if (!exercise.setupKey) errors.push(`Exercise ${exercise.exerciseId} requires a setup key.`);
  }
  if (errors.length > 0) throw new Error(errors.join(" "));
}

function indispensableNeeds(
  intent: NeedsFirstSessionIntent,
  snapshot: CandidateIntelligenceSnapshot,
  selectedIds: readonly string[],
  exerciseId: string,
): readonly string[] {
  const without = selectedIds.filter((id) => id !== exerciseId);
  const withoutCoverage = new Set(coveredNeedIds(intent, snapshot, without));
  return intent.needs
    .filter(
      (need) =>
        need.priority === "required" &&
        candidateFor(snapshot, need.id, exerciseId) !== undefined &&
        !withoutCoverage.has(need.id),
    )
    .map((need) => need.id);
}

export function runSessionCompositionLab(
  input: SessionCompositionLabInput,
): SessionCompositionLabResult {
  assertValidInput(input);
  const { intent, candidateIntelligence: snapshot } = input;
  const requiredNeedIds = intent.needs
    .filter((need) => need.priority === "required")
    .map((need) => need.id);
  if (snapshot.trainingAvailability === "deferred_for_review") {
    return {
      status: "infeasible",
      intentId: intent.id,
      uncoveredRequiredNeedIds: requiredNeedIds,
      trace: [{
        code: "session_training_deferred_for_review",
        message: "Candidate Intelligence marked ordinary session composition unavailable pending review.",
        exerciseIds: [],
        needIds: requiredNeedIds,
      }],
    };
  }
  const options = [...snapshot.exercises].sort((left, right) =>
    left.exerciseId.localeCompare(right.exerciseId),
  );
  const feasible: Array<{
    selected: readonly SessionExerciseOption[];
    coveredIds: readonly string[];
    metrics: SessionCompositionMetrics;
  }> = [];
  const maxSize = Math.min(intent.constraints.maxExercises, options.length);

  for (let size = 1; size <= maxSize; size += 1) {
    for (const selected of combinations(options, size)) {
      const selectedIds = selected.map((exercise) => exercise.exerciseId);
      const coveredIds = coveredNeedIds(intent, snapshot, selectedIds);
      if (!requiredNeedIds.every((needId) => coveredIds.includes(needId))) continue;
      const metrics = metricsFor(intent, snapshot, selected);
      if (metrics.durationUnits > intent.constraints.maxDurationUnits) continue;
      feasible.push({ selected, coveredIds, metrics });
    }
    if (feasible.length > 0) break;
  }

  if (feasible.length === 0) {
    const allCoverage = new Set(coveredNeedIds(intent, snapshot, options.map((option) => option.exerciseId)));
    return {
      status: "infeasible",
      intentId: intent.id,
      uncoveredRequiredNeedIds: requiredNeedIds.filter((needId) => !allCoverage.has(needId)),
      trace: [{
        code: "no_feasible_cover_within_constraints",
        message: "No legal candidate subset covers every required need within the lab constraints.",
        exerciseIds: [],
        needIds: requiredNeedIds,
      }],
    };
  }

  feasible.sort((left, right) => compareTuples(
    metricTuple(left.metrics, left.selected.map((exercise) => exercise.exerciseId)),
    metricTuple(right.metrics, right.selected.map((exercise) => exercise.exerciseId)),
  ));
  const winner = feasible[0];
  const selectedIds = winner.selected.map((exercise) => exercise.exerciseId);
  const coveredRequiredNeedIds = requiredNeedIds.filter((needId) => winner.coveredIds.includes(needId));
  const coveredOptionalNeedIds = intent.needs
    .filter((need) => need.priority === "optional" && winner.coveredIds.includes(need.id))
    .map((need) => need.id);
  const prescriptionResolutionExerciseIds = unique(selectedIds.filter((exerciseId) =>
    intent.needs.some(
      (need) =>
        snapshot.legalCandidatesByNeed[need.id]?.some(
          (candidate) =>
            candidate.exerciseId === exerciseId &&
            candidate.compositionAvailability === "prescription_resolution_required",
        ) ?? false,
    ),
  ));
  const selections: readonly SessionCompositionSelection[] = winner.selected.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    coveredNeedIds: intent.needs
      .filter((need) => candidateFor(snapshot, need.id, exercise.exerciseId))
      .map((need) => need.id),
    indispensableForRequiredNeedIds: indispensableNeeds(
      intent,
      snapshot,
      selectedIds,
      exercise.exerciseId,
    ),
  }));

  return {
    status: "composed",
    intentId: intent.id,
    selections,
    coveredRequiredNeedIds,
    coveredOptionalNeedIds,
    prescriptionResolutionExerciseIds,
    metrics: winner.metrics,
    trace: [
      {
        code: "smallest_legal_cover_selected",
        message: "Selected the smallest legal set covering every required need before tie-break policy.",
        exerciseIds: selectedIds,
        needIds: coveredRequiredNeedIds,
      },
      {
        code: "coherence_tiebreak_applied",
        message: "Equal-size covers were ordered by optional coverage, useful continuity, redundancy, fatigue, setup count, Candidate Intelligence rank/value, then canonical ID.",
        exerciseIds: selectedIds,
        needIds: winner.coveredIds,
      },
    ],
  };
}

function needExerciseIds(
  result: ComposedSessionLabResult,
  needId: string,
): readonly string[] {
  return result.selections
    .filter((selection) => selection.coveredNeedIds.includes(needId))
    .map((selection) => selection.exerciseId);
}

function precedenceEdges(
  intent: NeedsFirstSessionIntent,
  result: ComposedSessionLabResult,
): readonly SessionSequenceEdge[] {
  const edges = new Map<string, SessionSequenceEdge>();
  for (const need of intent.needs) {
    const sourceIds = needExerciseIds(result, need.id);
    const targetNeedIds = unique([...need.sequenceBeforeNeedIds, ...need.preparesForNeedIds]);
    for (const targetNeedId of targetNeedIds) {
      for (const beforeExerciseId of sourceIds) {
        for (const afterExerciseId of needExerciseIds(result, targetNeedId)) {
          if (beforeExerciseId === afterExerciseId) continue;
          const key = `${beforeExerciseId}|${afterExerciseId}`;
          const current = edges.get(key);
          edges.set(key, {
            beforeExerciseId,
            afterExerciseId,
            reasonNeedIds: unique([...(current?.reasonNeedIds ?? []), need.id, targetNeedId]),
          });
        }
      }
    }
  }
  return [...edges.values()].sort((left, right) =>
    `${left.beforeExerciseId}|${left.afterExerciseId}`.localeCompare(
      `${right.beforeExerciseId}|${right.afterExerciseId}`,
    ),
  );
}

function setupTransitions(
  order: readonly string[],
  optionsById: ReadonlyMap<string, SessionExerciseOption>,
): number {
  let count = 0;
  for (let index = 1; index < order.length; index += 1) {
    if (optionsById.get(order[index - 1])?.setupKey !== optionsById.get(order[index])?.setupKey) {
      count += 1;
    }
  }
  return count;
}

export function runSessionSequencingLab(
  input: SessionCompositionLabInput,
  result: ComposedSessionLabResult,
): SessionSequenceLabResult {
  if (result.intentId !== input.intent.id) throw new Error("Composition result does not belong to this intent.");
  const edges = precedenceEdges(input.intent, result);
  const ids = result.selections.map((selection) => selection.exerciseId).sort();
  const optionsById = new Map(
    input.candidateIntelligence.exercises.map((exercise) => [exercise.exerciseId, exercise]),
  );
  const legalOrders = permutations(ids).filter((order) =>
    edges.every(
      (edge) => order.indexOf(edge.beforeExerciseId) < order.indexOf(edge.afterExerciseId),
    ),
  );
  if (legalOrders.length === 0) {
    return { status: "infeasible", reason: "cyclic_precedence", precedenceEdges: edges };
  }
  legalOrders.sort((left, right) => compareTuples(
    [setupTransitions(left, optionsById), left.join("|")],
    [setupTransitions(right, optionsById), right.join("|")],
  ));
  const order = legalOrders[0];
  return {
    status: "sequenced",
    orderedExerciseIds: order,
    setupTransitionCount: setupTransitions(order, optionsById),
    precedenceEdges: edges,
  };
}

export function sessionNeed(
  input: Omit<SessionNeed, "sequenceBeforeNeedIds" | "preparesForNeedIds"> &
    Partial<Pick<SessionNeed, "sequenceBeforeNeedIds" | "preparesForNeedIds">>,
): SessionNeed {
  return {
    ...input,
    sequenceBeforeNeedIds: input.sequenceBeforeNeedIds ?? [],
    preparesForNeedIds: input.preparesForNeedIds ?? [],
  };
}
