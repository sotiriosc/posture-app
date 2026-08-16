import { createHash } from "node:crypto";
import {
  GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_STORE_REFERENCE,
  type GoalSpecificArtifactReference,
  type GoalSpecificStoredArtifact,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/contracts";

function ordered(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, ordered(entry)]));
  }
  return value;
}

export function evidenceDigest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(ordered(value))).digest("hex");
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  return Object.freeze(value);
}

function key(reference: Pick<GoalSpecificArtifactReference,
  "artifactType" | "artifactId" | "artifactRevisionId">): string {
  return `${reference.artifactType}\u0000${reference.artifactId}\u0000${reference.artifactRevisionId}`;
}

function referenceOf(artifact: GoalSpecificStoredArtifact): GoalSpecificArtifactReference {
  return Object.freeze({
    artifactType: artifact.artifactType,
    artifactId: artifact.artifactId,
    artifactRevisionId: artifact.artifactRevisionId,
    contractId: artifact.contractId,
    contractVersion: artifact.contractVersion,
    athleteId: artifact.athleteId,
    scenarioId: artifact.scenarioId,
    stage: artifact.stage,
    sourceLineage: artifact.sourceLineage,
    counterfactualOnly: artifact.counterfactualOnly,
  });
}

export class GoalSpecificProductShadowArtifactStore {
  readonly reference = GOAL_SPECIFIC_PRODUCT_SHADOW_ARTIFACT_STORE_REFERENCE;
  readonly #artifacts = new Map<string, GoalSpecificStoredArtifact>();

  put<T>(input: Omit<GoalSpecificStoredArtifact<T>, "fingerprint">): GoalSpecificStoredArtifact<T> {
    const artifact = deepFreeze({
      ...structuredClone(input),
      fingerprint: evidenceDigest({
        artifactType: input.artifactType,
        artifactId: input.artifactId,
        artifactRevisionId: input.artifactRevisionId,
        contractId: input.contractId,
        contractVersion: input.contractVersion,
        athleteId: input.athleteId,
        scenarioId: input.scenarioId,
        stage: input.stage,
        sourceLineage: input.sourceLineage,
        counterfactualOnly: input.counterfactualOnly,
        payload: input.payload,
      }),
    }) as GoalSpecificStoredArtifact<T>;
    const artifactKey = key(artifact);
    const existing = this.#artifacts.get(artifactKey);
    if (existing && existing.fingerprint !== artifact.fingerprint) {
      throw new Error(`GOAL_SPECIFIC_ARTIFACT_REVISION_CONFLICT:${artifactKey}`);
    }
    this.#artifacts.set(artifactKey, artifact as GoalSpecificStoredArtifact);
    return artifact;
  }

  get<T>(artifactType: string, artifactId: string, artifactRevisionId: string):
  GoalSpecificStoredArtifact<T> {
    const artifact = this.#artifacts.get(key({ artifactType, artifactId, artifactRevisionId }));
    if (!artifact) {
      throw new Error(`GOAL_SPECIFIC_ARTIFACT_EXACT_REVISION_REQUIRED:${artifactType}:${artifactId}:${artifactRevisionId}`);
    }
    return artifact as GoalSpecificStoredArtifact<T>;
  }

  getByReference<T>(reference: Pick<GoalSpecificArtifactReference,
    "artifactType" | "artifactId" | "artifactRevisionId">): GoalSpecificStoredArtifact<T> {
    return this.get(reference.artifactType, reference.artifactId, reference.artifactRevisionId);
  }

  has(reference: Pick<GoalSpecificArtifactReference,
    "artifactType" | "artifactId" | "artifactRevisionId">): boolean {
    return this.#artifacts.has(key(reference));
  }

  list(): readonly GoalSpecificStoredArtifact[] {
    return Object.freeze([...this.#artifacts.values()].sort((left, right) =>
      key(left).localeCompare(key(right))));
  }

  referencesForScenario(scenarioId: string): readonly GoalSpecificArtifactReference[] {
    return Object.freeze(this.list().filter((artifact) => artifact.scenarioId === scenarioId)
      .map(referenceOf));
  }

  index() {
    const entries = this.list().map((artifact) => Object.freeze({
      ...referenceOf(artifact), fingerprint: artifact.fingerprint,
    }));
    return Object.freeze({
      reference: this.reference,
      exactRevisionOnly: true,
      latestFallbackCount: 0,
      artifactCount: entries.length,
      entries: Object.freeze(entries),
      fingerprint: evidenceDigest(entries),
    });
  }
}
