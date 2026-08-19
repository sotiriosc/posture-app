import type { EffortTarget } from "./executionStandard";
import type { PrescriptionSide } from "./types";

export type LoadUnit = "kg" | "lb";

export type LoadApplication =
  | "total"
  | "per_hand"
  | "single_implement"
  | "unilateral_side"
  | "machine_stack"
  | "cable_stack";

export type NumericLoadMagnitude =
  | {
      readonly kind: "exact";
      readonly value: number;
      readonly unit: LoadUnit;
    }
  | {
      readonly kind: "range";
      readonly min: number;
      readonly max: number;
      readonly unit: LoadUnit;
    };

export type MachineSettingMagnitude =
  | {
      readonly kind: "exact";
      readonly setting: number;
    }
  | {
      readonly kind: "range";
      readonly minSetting: number;
      readonly maxSetting: number;
    };

export type BandTensionMagnitude =
  | {
      readonly kind: "band_level";
      readonly level: "very_light" | "light" | "moderate" | "heavy" | "unknown";
      readonly description?: string;
    }
  | {
      readonly kind: "reviewed_band_reference";
      readonly referenceId: string;
      readonly description: string;
    };

export type LoadTarget =
  | { readonly kind: "bodyweight" }
  | {
      readonly kind: "external_load";
      readonly target: NumericLoadMagnitude;
      readonly application: Exclude<
        LoadApplication,
        "machine_stack" | "cable_stack"
      >;
      readonly side?: PrescriptionSide;
    }
  | {
      readonly kind: "machine_stack";
      readonly target: MachineSettingMagnitude | NumericLoadMagnitude;
      readonly machineId?: string;
      readonly settingSystemId?: string;
      readonly application: "machine_stack";
    }
  | {
      readonly kind: "cable_stack";
      readonly target: MachineSettingMagnitude | NumericLoadMagnitude;
      readonly cableStackId?: string;
      readonly application: "cable_stack";
    }
  | {
      readonly kind: "band_tension";
      readonly target: BandTensionMagnitude;
    }
  | {
      readonly kind: "user_selected_by_effort";
      readonly effort: EffortTarget;
      readonly application?: LoadApplication;
    }
  | { readonly kind: "unknown"; readonly reason: string }
  | { readonly kind: "not_prescribed"; readonly reason?: string };
