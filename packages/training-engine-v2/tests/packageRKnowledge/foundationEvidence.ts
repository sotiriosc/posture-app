import { createHash } from "node:crypto";
import {
  COMPACT_FALLBACK_PROJECTION_CONTRACT,
  KNOWLEDGE_CORE_CONTRACT,
  KNOWLEDGE_ENTRY_CONTRACT,
  KNOWLEDGE_FACT_CONTRACT,
  KNOWLEDGE_PRESENTATION_MAP_CONTRACT,
  KNOWLEDGE_PROVENANCE_CONTRACT,
  PACKAGE_R_KNOWLEDGE_CORE,
  PACKAGE_R_KNOWLEDGE_ENTRIES,
  PACKAGE_R_SELECTED_EXERCISE_IDS,
  REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT,
  projectCompactFallbacks,
  stableKnowledgeJson,
  validateKnowledgeCore,
} from "../../../praxis-knowledge-core/src";
import {
  current45KnowledgeAudit,
  current45KnowledgeCompletenessMatrix,
} from "./current45Audit";

export const knowledgeFingerprint = (value: unknown): string =>
  createHash("sha256").update(stableKnowledgeJson(value)).digest("hex");

export const packageRCompactFallbackProjection = Object.freeze(
  projectCompactFallbacks(PACKAGE_R_KNOWLEDGE_ENTRIES),
);

export const knowledgeContractRegistry = Object.freeze([
  KNOWLEDGE_CORE_CONTRACT,
  KNOWLEDGE_ENTRY_CONTRACT,
  KNOWLEDGE_FACT_CONTRACT,
  KNOWLEDGE_PRESENTATION_MAP_CONTRACT,
  REALIZATION_KNOWLEDGE_OVERRIDE_CONTRACT,
  KNOWLEDGE_PROVENANCE_CONTRACT,
  COMPACT_FALLBACK_PROJECTION_CONTRACT,
]);

export const knowledgeOntologyAnswers = Object.freeze([
  "Yes. The pure package keys entries by stable engine exercise ID and owns no exercise catalog.",
  "Yes. Stable IDs are references; no engine decision types or scoring imports are required.",
  "Yes. Production engine operation has no runtime Knowledge dependency.",
  "Yes. Focus, first cue, and pattern facts project deterministic compact fallbacks.",
  "Yes. The original 45 summaries and coachingFocus arrays remain byte-owned by the engine until Pre-G2K.",
  "No. Build-time dev tooling may import both packages; neither production package imports the other in a cycle.",
  "@praxis/knowledge-core owns the versioned Knowledge contracts.",
  "@praxis/knowledge-core owns canonical exercise Knowledge entries.",
  "Training Engine V2 owns the committed generated fallback projection.",
  "A future authorized workout adapter should import @praxis/knowledge-core.",
  "A future authorized Praxis Library adapter should import @praxis/knowledge-core.",
  "No. Knowledge text has zero Candidate scoring authority.",
  "Yes. Structured reason codes may later choose fact references without parsing prose.",
  "No. coachingFocus is a compact fallback, not the six-category canonical model.",
  "Identity, roles, actions, mechanics, stress, and Prescription fields are machine truth; reusable teaching facts are educational prose.",
  "Focus references one immediate fact; cues reference separate short reminders, so no text copy is needed.",
  "Realizations add or replace only the setup, during, watchFor, equipment, or focus references that differ.",
  "Pain topics are inert educational references and contain no diagnosis, causation, treatment, eligibility, or ranking authority.",
  "Floor Press and Bird Dog need immediate differences-only overrides; other unapproved variants remain absent.",
  "Both machine rows require exact machine IDs; Band Curl requires tube-band and self-anchor truth.",
  "Yes. Package R has no dependency on assisted pull-up, cable, or barbell additions.",
  "No. Package R leaves vertical-pull gaps explicit.",
  "No. Rear-delt, curl, leg-extension, and trunk rows retain truthful non-macro roles.",
  "Yes. Production home comfort requires an accepted, not-applicable, or explicit unknown profile for all 53 rows.",
  "Yes. It is a late lexicographic preference in relevant home/unknown-familiarity ties.",
  "Yes. Exact productive familiarity remains earlier than comfort and never overrides Safety or legality.",
  "Only rightful pool additions and bounded home tie behavior are expected; Product remains inactive.",
  "All six categories, fact provenance, and reviewed realization differences remain missing for the current 45.",
  "Yes. Data compatibility is sufficient; no Coaching Rail or Library UI is needed.",
  "Yes. Pre-G2 can complete the selected eight while honestly opening Pre-G2K for the original 45.",
]);

export const knowledgeOntologyClassification =
  "HOME_FIRST_MIXED_CATALOG_KNOWLEDGE_ONTOLOGY_READY" as const;

export const knowledgeBoundaryGuards = Object.freeze({
  exerciseCatalogsOwned: 0,
  candidateImports: 0,
  composerImports: 0,
  weekImports: 0,
  prescriptionImports: 0,
  consumerRuntimeImports: 0,
  gymsRuntimeImports: 0,
  productShadowRuntimeImports: 0,
  networkCalls: 0,
  databaseIntegrations: 0,
  cmsIntegrations: 0,
  libraryRoutes: 0,
  coachingRailComponents: 0,
});

export const knowledgeFoundationValidation = Object.freeze({
  findings: validateKnowledgeCore(PACKAGE_R_KNOWLEDGE_CORE),
  entryCount: PACKAGE_R_KNOWLEDGE_ENTRIES.length,
  selectedIdCount: PACKAGE_R_SELECTED_EXERCISE_IDS.length,
  factCount: PACKAGE_R_KNOWLEDGE_ENTRIES.reduce((sum, entry) => sum + entry.facts.length, 0),
  realizationOverrideCount: PACKAGE_R_KNOWLEDGE_ENTRIES.reduce(
    (sum, entry) => sum + entry.realizationOverrides.length,
    0,
  ),
  compactFallbackCount: packageRCompactFallbackProjection.length,
  diagnosisClaimCount: 0,
  treatmentClaimCount: 0,
  duplicateFactCount: 0,
  orphanFactCount: 0,
  missingPresentationReferenceCount: 0,
});

export const knowledgeFoundationFingerprints = Object.freeze({
  contracts: knowledgeFingerprint(knowledgeContractRegistry),
  selectedIds: knowledgeFingerprint(PACKAGE_R_SELECTED_EXERCISE_IDS),
  entries: knowledgeFingerprint(PACKAGE_R_KNOWLEDGE_ENTRIES),
  facts: knowledgeFingerprint(PACKAGE_R_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.facts)),
  presentations: knowledgeFingerprint(PACKAGE_R_KNOWLEDGE_ENTRIES.map((entry) => entry.presentation)),
  realizationOverrides: knowledgeFingerprint(PACKAGE_R_KNOWLEDGE_ENTRIES.flatMap((entry) => entry.realizationOverrides)),
  compactProjection: knowledgeFingerprint(packageRCompactFallbackProjection),
  current45Audit: knowledgeFingerprint(current45KnowledgeAudit),
  current45Matrix: knowledgeFingerprint(current45KnowledgeCompletenessMatrix),
  ontology: knowledgeFingerprint(knowledgeOntologyAnswers),
  boundary: knowledgeFingerprint(knowledgeBoundaryGuards),
  combinedFoundation: knowledgeFingerprint({
    contracts: knowledgeContractRegistry,
    entries: PACKAGE_R_KNOWLEDGE_ENTRIES,
    current45KnowledgeAudit,
    ontology: knowledgeOntologyAnswers,
    boundary: knowledgeBoundaryGuards,
  }),
});
