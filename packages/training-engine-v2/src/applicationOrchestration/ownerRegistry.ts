import { sameSemanticValue, uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionLongitudinalAction } from "../longitudinalAdaptation/policies/policyContracts";
import type { ProductionAdaptationApplicationOwnerRegistry,
  ProductionAdaptationApplicationOwnerRegistryEntry, VersionedOrchestrationContractReference } from "./contracts";

export const PRODUCTION_ADAPTATION_APPLICATION_OWNER_REGISTRY_REFERENCE = Object.freeze({
  contractId: "PRODUCTION_ADAPTATION_APPLICATION_OWNER_REGISTRY",
  contractVersion: "1.0.0",
});

export function createProductionAdaptationApplicationOwnerRegistry(input: {
  readonly registryReference: VersionedOrchestrationContractReference;
  readonly entries: readonly ProductionAdaptationApplicationOwnerRegistryEntry[];
  readonly provenance: readonly string[];
}): ProductionAdaptationApplicationOwnerRegistry {
  return Object.freeze({ registryReference: Object.freeze({ ...input.registryReference }),
    entries: Object.freeze([...input.entries]), provenance: Object.freeze([...input.provenance]) });
}

export function validateProductionAdaptationApplicationOwnerRegistry(
  registry: ProductionAdaptationApplicationOwnerRegistry | null | undefined,
): readonly string[] {
  if (!registry) return Object.freeze(["ADAPTATION_APPLICATION_OWNER_REGISTRY_REQUIRED"]);
  const reasons: string[] = [];
  if (!sameSemanticValue(registry.registryReference, PRODUCTION_ADAPTATION_APPLICATION_OWNER_REGISTRY_REFERENCE)) {
    reasons.push("ADAPTATION_APPLICATION_OWNER_REGISTRY_VERSION_UNAVAILABLE");
  }
  const owners = registry.entries.map((entry) => entry.owner);
  if (new Set(owners).size !== owners.length) reasons.push("ADAPTATION_APPLICATION_OWNER_CONFLICT");
  if (registry.entries.some((entry) => entry.canApplyLiveMutation !== false)) {
    reasons.push("ADAPTATION_APPLICATION_LIVE_MUTATION_OWNER_FORBIDDEN");
  }
  const routed = new Map<ProductionLongitudinalAction, string>();
  for (const entry of registry.entries) {
    for (const action of entry.supportedActions) {
      if (routed.has(action)) reasons.push(`ADAPTATION_APPLICATION_OWNER_CONFLICT:${action}`);
      routed.set(action, entry.owner);
    }
  }
  return Object.freeze(uniqueSorted(reasons));
}

export function resolveProductionAdaptationApplicationOwner(
  registry: ProductionAdaptationApplicationOwnerRegistry,
  action: ProductionLongitudinalAction,
): { readonly entry: ProductionAdaptationApplicationOwnerRegistryEntry | null;
  readonly reasonCodes: readonly string[] } {
  const matches = registry.entries.filter((entry) => entry.supportedActions.includes(action));
  if (matches.length > 1) return Object.freeze({ entry: null,
    reasonCodes: Object.freeze(["ADAPTATION_APPLICATION_OWNER_CONFLICT"]) });
  if (!matches.length) return Object.freeze({ entry: null,
    reasonCodes: Object.freeze(["ADAPTATION_APPLICATION_OWNER_UNAVAILABLE"]) });
  const entry = matches[0]!;
  if (entry.availability === "unavailable") return Object.freeze({ entry: null,
    reasonCodes: Object.freeze(["ADAPTATION_APPLICATION_OWNER_UNAVAILABLE"]) });
  if (entry.availability === "pending_policy") return Object.freeze({ entry,
    reasonCodes: Object.freeze(["ADAPTATION_APPLICATION_OWNER_POLICY_REQUIRED"]) });
  return Object.freeze({ entry, reasonCodes: Object.freeze([]) });
}
