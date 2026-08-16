import {
  COMPACT_FALLBACK_PROJECTION_CONTRACT,
  KNOWLEDGE_CORE_CONTRACT,
  KNOWLEDGE_ENTRY_CONTRACT,
  KNOWLEDGE_FACT_CONTRACT,
  KNOWLEDGE_FACT_KINDS,
  KNOWLEDGE_PRESENTATION_MAP_CONTRACT,
  KNOWLEDGE_PROVENANCE_CONTRACT,
  REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT,
  type ExerciseKnowledgeEntry,
  type ExerciseKnowledgeProvenance,
  type KnowledgeValidationFinding,
  type PraxisExerciseKnowledgeCore,
} from "./contracts";

const PROHIBITED_CLINICAL_CLAIMS = [
  /\bdiagnos(?:e|es|ed|ing|is)\b/i,
  /\btreats? (?:pain|injury|condition|disease)\b/i,
  /\bcures? (?:pain|injury|condition|disease)\b/i,
  /\bprevents? injury\b/i,
  /\bfixes? pain\b/i,
  /\bguarantee(?:s|d)? safe(?:ty)?\b/i,
];

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)]),
  );
}

export function stableKnowledgeJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function finding(
  code: string,
  targetId: string,
  message: string,
  severity: KnowledgeValidationFinding["severity"] = "error",
): KnowledgeValidationFinding {
  return { severity, code, targetId, message };
}

function validProvenance(provenance: ExerciseKnowledgeProvenance): boolean {
  return provenance.contract.contractId === KNOWLEDGE_PROVENANCE_CONTRACT.contractId &&
    provenance.contract.contractVersion === KNOWLEDGE_PROVENANCE_CONTRACT.contractVersion &&
    provenance.sourceRef.trim().length > 0 &&
    provenance.evidenceBasis.length > 0 &&
    provenance.evidenceBasis.every((basis) => basis.trim().length > 0);
}

function referencedFactIds(entry: ExerciseKnowledgeEntry): readonly string[] {
  const presentation = entry.presentation;
  const overrideRefs = entry.realizationOverrides.flatMap((override) => [
    ...(override.addSetupRefs ?? []),
    ...(override.replaceSetupRefs ?? []),
    ...(override.addDuringRefs ?? []),
    ...(override.replaceDuringRefs ?? []),
    ...(override.addWatchForRefs ?? []),
    ...(override.replaceWatchForRefs ?? []),
    ...(override.focusRef ? [override.focusRef] : []),
    ...(override.equipmentBoundaryRefs ?? []),
  ]);
  return [
    presentation.focus,
    ...presentation.cues,
    ...presentation.setup,
    ...presentation.during,
    ...presentation.pattern,
    ...presentation.watchFor,
    ...overrideRefs,
  ];
}

export function validateKnowledgeEntry(
  entry: ExerciseKnowledgeEntry,
): readonly KnowledgeValidationFinding[] {
  const findings: KnowledgeValidationFinding[] = [];
  const add = (code: string, targetId: string, message: string) => {
    findings.push(finding(code, targetId, message));
  };

  if (entry.contract.contractId !== KNOWLEDGE_ENTRY_CONTRACT.contractId ||
      entry.contract.contractVersion !== KNOWLEDGE_ENTRY_CONTRACT.contractVersion) {
    add("unsupported_entry_contract", entry.exerciseId, "Knowledge entry contract version is unsupported.");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.exerciseId)) {
    add("invalid_exercise_id", entry.exerciseId, "Knowledge entries require a stable kebab-case exercise ID.");
  }
  if (entry.presentation.contract.contractId !== KNOWLEDGE_PRESENTATION_MAP_CONTRACT.contractId ||
      entry.presentation.contract.contractVersion !== KNOWLEDGE_PRESENTATION_MAP_CONTRACT.contractVersion) {
    add("unsupported_presentation_contract", entry.exerciseId, "Presentation-map contract version is unsupported.");
  }
  if (entry.presentation.exerciseId !== entry.exerciseId) {
    add("presentation_exercise_mismatch", entry.exerciseId, "Presentation map must use the parent exercise ID.");
  }

  const minimums = {
    cues: 2,
    setup: 2,
    during: 2,
    pattern: 1,
    watchFor: 2,
  } as const;
  for (const [category, minimum] of Object.entries(minimums)) {
    const refs = entry.presentation[category as keyof typeof minimums];
    if (refs.length < minimum) {
      add(`missing_${category}`, entry.exerciseId, `${category} requires at least ${minimum} fact references.`);
    }
  }
  if (!entry.presentation.focus) {
    add("missing_focus", entry.exerciseId, "Focus must resolve to exactly one fact reference.");
  }

  const factIds = new Set<string>();
  const normalizedStatements = new Map<string, string>();
  for (const fact of entry.facts) {
    if (fact.contract.contractId !== KNOWLEDGE_FACT_CONTRACT.contractId ||
        fact.contract.contractVersion !== KNOWLEDGE_FACT_CONTRACT.contractVersion) {
      add("unsupported_fact_contract", fact.id, "Knowledge fact contract version is unsupported.");
    }
    if (!fact.id.startsWith(`${entry.exerciseId}.`) || fact.exerciseId !== entry.exerciseId) {
      add("fact_identity_mismatch", fact.id, "Fact identity must be subordinate to its canonical exercise ID.");
    }
    if (factIds.has(fact.id)) add("duplicate_fact_id", fact.id, "Fact IDs must be unique within an entry.");
    factIds.add(fact.id);
    if (!KNOWLEDGE_FACT_KINDS.includes(fact.kind)) {
      add("invalid_fact_kind", fact.id, "Fact kind is outside the versioned vocabulary.");
    }
    if (fact.canonicalStatement.trim().length === 0) {
      add("empty_fact", fact.id, "Canonical statements may not be empty.");
    }
    const normalized = fact.canonicalStatement.trim().toLocaleLowerCase().replace(/\s+/g, " ");
    const existing = normalizedStatements.get(normalized);
    if (existing && existing !== fact.id) {
      add("duplicate_semantic_fact", fact.id, `Canonical statement duplicates ${existing}.`);
    }
    normalizedStatements.set(normalized, fact.id);
    if (fact.provenance.length === 0 || fact.provenance.some((item) => !validProvenance(item))) {
      add("invalid_fact_provenance", fact.id, "Accepted facts require complete structured provenance.");
    }
    if (fact.reviewStatus === "accepted" && fact.provenance.some((item) => item.sourceType === "unknown")) {
      add("accepted_fact_unknown_provenance", fact.id, "Accepted facts cannot rely on unknown provenance.");
    }
    if (PROHIBITED_CLINICAL_CLAIMS.some((pattern) => pattern.test(fact.canonicalStatement))) {
      add("prohibited_clinical_claim", fact.id, "Canonical fact contains a diagnosis, treatment, or universal safety claim.");
    }
  }

  const referenced = referencedFactIds(entry);
  for (const factId of referenced) {
    if (!factIds.has(factId)) add("missing_fact_reference", factId, "Presentation or override references a missing fact.");
  }
  const referencedSet = new Set(referenced);
  for (const fact of entry.facts) {
    if (!referencedSet.has(fact.id) && !fact.futureDeeperOnly) {
      add("orphan_fact", fact.id, "Accepted fact is not referenced by a presentation or realization override.");
    }
  }

  const overrideIds = new Set<string>();
  for (const override of entry.realizationOverrides) {
    if (override.contract.contractId !== REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT.contractId ||
        override.contract.contractVersion !== REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT.contractVersion) {
      add("unsupported_override_contract", override.id, "Realization override contract version is unsupported.");
    }
    if (override.exerciseId !== entry.exerciseId || !override.id.startsWith(`${entry.exerciseId}.`)) {
      add("override_identity_mismatch", override.id, "Override must remain subordinate to its parent exercise ID.");
    }
    if (overrideIds.has(override.id)) add("duplicate_override_id", override.id, "Override IDs must be unique.");
    overrideIds.add(override.id);
    if (!override.realizationId.trim()) add("missing_realization_id", override.id, "Override requires an exact realization ID.");
    if (override.provenance.length === 0 || override.provenance.some((item) => !validProvenance(item))) {
      add("invalid_override_provenance", override.id, "Realization override requires complete provenance.");
    }
    const copiedCategoryCount = [
      override.replaceSetupRefs,
      override.replaceDuringRefs,
      override.replaceWatchForRefs,
    ].filter((value) => value && value.length > 0).length;
    if (copiedCategoryCount === 3 && override.focusRef) {
      add("whole_entry_override", override.id, "Realization overrides may model differences only, not copy a full entry.");
    }
  }

  if (entry.relatedMechanicsIds.length === 0) add("missing_related_mechanics", entry.exerciseId, "Related mechanics references are required.");
  if (entry.provenance.length === 0 || entry.provenance.some((item) => !validProvenance(item))) {
    add("invalid_entry_provenance", entry.exerciseId, "Knowledge entry requires complete provenance.");
  }
  return findings;
}

export function validateKnowledgeCore(
  core: PraxisExerciseKnowledgeCore,
): readonly KnowledgeValidationFinding[] {
  const findings: KnowledgeValidationFinding[] = [];
  if (core.contract.contractId !== KNOWLEDGE_CORE_CONTRACT.contractId ||
      core.contract.contractVersion !== KNOWLEDGE_CORE_CONTRACT.contractVersion) {
    findings.push(finding("unsupported_core_contract", core.contract.contractId, "Knowledge core contract version is unsupported."));
  }
  const exerciseIds = new Set<string>();
  for (const entry of core.entries) {
    if (exerciseIds.has(entry.exerciseId)) {
      findings.push(finding("duplicate_knowledge_entry", entry.exerciseId, "One canonical exercise may have only one Knowledge entry."));
    }
    exerciseIds.add(entry.exerciseId);
    findings.push(...validateKnowledgeEntry(entry));
  }
  return findings;
}

export function validateCompactFallbackContract(value: {
  readonly contract: { readonly contractId: string; readonly contractVersion: string };
}): readonly KnowledgeValidationFinding[] {
  return value.contract.contractId === COMPACT_FALLBACK_PROJECTION_CONTRACT.contractId &&
    value.contract.contractVersion === COMPACT_FALLBACK_PROJECTION_CONTRACT.contractVersion
    ? []
    : [finding("unsupported_compact_projection_contract", value.contract.contractId, "Compact projection contract version is unsupported.")];
}
