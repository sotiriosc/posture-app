import type { EquipmentCapabilities } from "./equipment";

export const PULL_UP_ASSISTANCE_REALIZATION_CONTRACT = Object.freeze({
  contractId: "PULL_UP_ASSISTANCE_REALIZATION",
  contractVersion: "1.0.0",
} as const);

export type PullUpAssistanceMagnitude =
  | Readonly<{ kind: "not_applicable" }>
  | Readonly<{ kind: "machine_setting"; setting: number | null }>;

export interface PullUpAssistanceRealization {
  readonly contract: typeof PULL_UP_ASSISTANCE_REALIZATION_CONTRACT;
  readonly exerciseId: "pull-up";
  readonly realizationId: "bodyweight-unassisted" | "machine-assisted";
  readonly assistanceKind: "unassisted" | "machine_assisted";
  readonly apparatus: "pull_up_bar" | "assisted_pull_up_machine";
  readonly supportContact: "hands_on_bar" | "hands_on_bar_and_machine_support";
  readonly startFinishTruth: string;
  readonly progressionAxisAvailability: readonly string[];
  readonly automaticTransitionAllowed: false;
  readonly bandAssistanceAllowed: false;
  readonly externalLoad: null;
  readonly provenance: readonly {
    readonly sourceRef: string;
    readonly evidenceBasis: readonly string[];
  }[];
}

const OWNER_REF =
  "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md";

export const PULL_UP_ASSISTANCE_REALIZATIONS: readonly PullUpAssistanceRealization[] =
  Object.freeze([
    Object.freeze({
      contract: PULL_UP_ASSISTANCE_REALIZATION_CONTRACT,
      exerciseId: "pull-up",
      realizationId: "bodyweight-unassisted",
      assistanceKind: "unassisted",
      apparatus: "pull_up_bar",
      supportContact: "hands_on_bar",
      startFinishTruth: "Begin and finish from the prescribed controlled hanging range on the exact bar.",
      progressionAxisAvailability: Object.freeze(["reps", "sets", "range", "tempo"]),
      automaticTransitionAllowed: false,
      bandAssistanceAllowed: false,
      externalLoad: null,
      provenance: Object.freeze([{
        sourceRef: OWNER_REF,
        evidenceBasis: Object.freeze([
          "The owner selected one Pull-Up identity with an exact unassisted bodyweight realization.",
        ]),
      }]),
    }),
    Object.freeze({
      contract: PULL_UP_ASSISTANCE_REALIZATION_CONTRACT,
      exerciseId: "pull-up",
      realizationId: "machine-assisted",
      assistanceKind: "machine_assisted",
      apparatus: "assisted_pull_up_machine",
      supportContact: "hands_on_bar_and_machine_support",
      startFinishTruth: "Use the exact machine support and prescribed controlled vertical pulling range.",
      progressionAxisAvailability: Object.freeze([
        "reps",
        "sets",
        "range",
        "tempo",
        "assistance_reduction_future_authority_required",
      ]),
      automaticTransitionAllowed: false,
      bandAssistanceAllowed: false,
      externalLoad: null,
      provenance: Object.freeze([{
        sourceRef: OWNER_REF,
        evidenceBasis: Object.freeze([
          "Machine assistance is realization and prescription truth, not external load or a second exercise identity.",
        ]),
      }]),
    }),
  ]);

export interface PullUpAssistanceResolution {
  readonly exerciseId: "pull-up";
  readonly realization: PullUpAssistanceRealization | null;
  readonly assistanceMagnitude: PullUpAssistanceMagnitude | null;
  readonly sourceEventCount: 0 | 1;
  readonly assistanceTreatedAsExternalLoad: false;
  readonly automaticProgressionApplied: false;
  readonly reasonCodes: readonly string[];
}

export function resolvePullUpAssistanceRealization(input: {
  readonly requestedRealizationId: PullUpAssistanceRealization["realizationId"];
  readonly exactMachineAssistanceSetting: number | null;
  readonly equipment: EquipmentCapabilities;
}): PullUpAssistanceResolution {
  const realization = PULL_UP_ASSISTANCE_REALIZATIONS.find(
    (value) => value.realizationId === input.requestedRealizationId,
  )!;
  const apparatusAvailable = realization.apparatus === "pull_up_bar"
    ? input.equipment.bodyweight.pullUpBar
    : input.equipment.machines.availableMachineIds.includes("assisted_pull_up");
  const settingValid = input.exactMachineAssistanceSetting === null ||
    (Number.isFinite(input.exactMachineAssistanceSetting) &&
      input.exactMachineAssistanceSetting >= 0);
  if (!apparatusAvailable || !settingValid) {
    return Object.freeze({
      exerciseId: "pull-up",
      realization: null,
      assistanceMagnitude: null,
      sourceEventCount: 0,
      assistanceTreatedAsExternalLoad: false,
      automaticProgressionApplied: false,
      reasonCodes: Object.freeze([
        !apparatusAvailable
          ? "EXACT_PULL_UP_APPARATUS_UNAVAILABLE"
          : "ASSISTANCE_SETTING_INVALID",
      ]),
    });
  }
  return Object.freeze({
    exerciseId: "pull-up",
    realization,
    assistanceMagnitude: realization.assistanceKind === "unassisted"
      ? Object.freeze({ kind: "not_applicable" })
      : Object.freeze({
          kind: "machine_setting",
          setting: input.exactMachineAssistanceSetting,
        }),
    sourceEventCount: 1,
    assistanceTreatedAsExternalLoad: false,
    automaticProgressionApplied: false,
    reasonCodes: Object.freeze([
      realization.assistanceKind === "unassisted"
        ? "BODYWEIGHT_UNASSISTED_REALIZATION_AVAILABLE"
        : input.exactMachineAssistanceSetting === null
          ? "MACHINE_ASSISTANCE_AVAILABLE_SETTING_UNKNOWN"
          : "MACHINE_ASSISTANCE_EXACT_SETTING_AVAILABLE",
    ]),
  });
}

export function validatePullUpAssistanceRealizations(): readonly string[] {
  const findings: string[] = [];
  if (new Set(PULL_UP_ASSISTANCE_REALIZATIONS.map((value) => value.exerciseId)).size !== 1) {
    findings.push("PULL_UP_IDENTITY_DUPLICATED");
  }
  if (new Set(PULL_UP_ASSISTANCE_REALIZATIONS.map((value) => value.realizationId)).size !== 2) {
    findings.push("PULL_UP_REALIZATION_IDS_INVALID");
  }
  if (PULL_UP_ASSISTANCE_REALIZATIONS.some((value) =>
    value.externalLoad !== null || value.automaticTransitionAllowed || value.bandAssistanceAllowed)) {
    findings.push("PULL_UP_ASSISTANCE_BOUNDARY_VIOLATED");
  }
  return Object.freeze(findings);
}
