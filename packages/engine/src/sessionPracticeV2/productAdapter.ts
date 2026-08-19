import {
  SESSION_PRACTICE_PRODUCT_ADAPTER_CONTRACT_REFERENCE,
  type SessionPracticeModeV2,
  type SessionPracticeOptionAvailability,
} from "@praxis/training-engine-v2";

export const SESSION_PRACTICE_PRODUCT_ADAPTER_STATUS =
  "FUTURE_CONTROLLED_OWNER_DELIVERY_ONLY_NOT_ACTIVATED" as const;

export const DEFAULT_SESSION_PRACTICE_PRODUCT_ADAPTER_ROLLOUT = Object.freeze({
  enabled: false,
  ownerAccountDeliveryAuthorized: false,
  productOutputAuthorized: false,
  persistenceWriteAuthorized: false,
  productShadowAuthorized: false,
} as const);

export const SESSION_PRACTICE_PRODUCT_DISPLAY_COPY = Object.freeze({
  full: Object.freeze({ label: "Full", description: "The whole session as planned." }),
  lighter: Object.freeze({ label: "Lighter", description: "Same movements, less work." }),
  recovery: Object.freeze({ label: "Recovery", description: "Mobility and easy movement only." }),
} as const);

export interface FutureSessionPracticeProductOption {
  readonly mode: SessionPracticeModeV2;
  readonly label: string;
  readonly description: string;
  readonly isSuggested: boolean;
  readonly collapsedControlModel: true;
  readonly availability: SessionPracticeOptionAvailability;
}

export interface FutureSessionPracticeProductAdapter {
  readonly contractReference: typeof SESSION_PRACTICE_PRODUCT_ADAPTER_CONTRACT_REFERENCE;
  readonly status: typeof SESSION_PRACTICE_PRODUCT_ADAPTER_STATUS;
  readonly rollout: typeof DEFAULT_SESSION_PRACTICE_PRODUCT_ADAPTER_ROLLOUT;
  readonly mapDisplayMode: (value: "Full" | "Lighter" | "Recovery") => SessionPracticeModeV2;
  readonly buildOption: (input: {
    readonly mode: SessionPracticeModeV2;
    readonly suggestedMode: SessionPracticeModeV2 | null;
    readonly availability: SessionPracticeOptionAvailability;
  }) => FutureSessionPracticeProductOption;
  readonly attemptProductOutput: () => {
    readonly status: "adapter_disabled";
    readonly productOutput: null;
    readonly persistenceWriteCount: 0;
    readonly productShadowRunCount: 0;
  };
}

export function createDefaultOffSessionPracticeProductAdapter(): FutureSessionPracticeProductAdapter {
  return Object.freeze({
    contractReference: SESSION_PRACTICE_PRODUCT_ADAPTER_CONTRACT_REFERENCE,
    status: SESSION_PRACTICE_PRODUCT_ADAPTER_STATUS,
    rollout: DEFAULT_SESSION_PRACTICE_PRODUCT_ADAPTER_ROLLOUT,
    mapDisplayMode: (value: "Full" | "Lighter" | "Recovery") => value === "Full" ? "full" :
      value === "Lighter" ? "lighter" : "recovery",
    buildOption: ({ mode, suggestedMode, availability }: {
      readonly mode: SessionPracticeModeV2;
      readonly suggestedMode: SessionPracticeModeV2 | null;
      readonly availability: SessionPracticeOptionAvailability;
    }) => Object.freeze({
      mode,
      ...SESSION_PRACTICE_PRODUCT_DISPLAY_COPY[mode],
      isSuggested: suggestedMode === mode,
      collapsedControlModel: true,
      availability,
    }),
    attemptProductOutput: () => Object.freeze({ status: "adapter_disabled", productOutput: null,
      persistenceWriteCount: 0, productShadowRunCount: 0 }),
  });
}
