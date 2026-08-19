import type { LoadTarget, NumericLoadMagnitude } from "../prescription/load";
import type {
  EquipmentLoadRealizationProfile,
  EquipmentLoadRealizationResult,
} from "./contracts";
import { EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE } from "./contracts";

function exactNumericLoad(load: LoadTarget | null): number | null {
  if (!load) return null;
  if (load.kind === "external_load" && load.target.kind === "exact") return load.target.value;
  if ((load.kind === "machine_stack" || load.kind === "cable_stack") &&
      load.target.kind === "exact") {
    if ("value" in load.target) return load.target.value;
    if ("setting" in load.target) return load.target.setting;
  }
  return null;
}

function exactLoadTarget(profile: EquipmentLoadRealizationProfile, value: number): LoadTarget | null {
  const unit = profile.loadMagnitude.unit;
  if (unit === "kg" || unit === "lb") {
    const target: NumericLoadMagnitude = { kind: "exact", value, unit };
    if (profile.implementKind === "cable") {
      return { kind: "cable_stack", target, cableStackId: profile.implementId,
        application: "cable_stack" };
    }
    if (["selectorized_machine", "plate_loaded_machine", "smith_machine"]
      .includes(profile.implementKind)) {
      return { kind: "machine_stack", target, machineId: profile.machineId ?? profile.implementId,
        application: "machine_stack" };
    }
    return { kind: "external_load", target,
      application: profile.paired ? "per_hand" : "single_implement" };
  }
  if (unit === "machine_setting") {
    return profile.implementKind === "cable" ?
      { kind: "cable_stack", target: { kind: "exact", setting: value },
        cableStackId: profile.implementId, application: "cable_stack" } :
      { kind: "machine_stack", target: { kind: "exact", setting: value },
        machineId: profile.machineId ?? profile.implementId, application: "machine_stack" };
  }
  return null;
}

export function validateEquipmentLoadRealizationProfile(
  profile: EquipmentLoadRealizationProfile,
): readonly string[] {
  const reasons: string[] = [];
  if (profile.contractReference.contractId !==
      EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE.contractId ||
      profile.contractReference.contractVersion !==
      EQUIPMENT_LOAD_REALIZATION_PROFILE_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("EQUIPMENT_REALIZATION_PROFILE_VERSION_INVALID");
  }
  if (!profile.profileId.trim() || !profile.athleteId.trim() || !profile.implementId.trim()) {
    reasons.push("EQUIPMENT_REALIZATION_IDENTITY_REQUIRED");
  }
  const load = profile.loadMagnitude;
  if (load.minimum !== null && load.maximum !== null && load.minimum > load.maximum) {
    reasons.push("EQUIPMENT_LOAD_RANGE_INVALID");
  }
  if (load.smallestIncrement !== null && load.smallestIncrement <= 0) {
    reasons.push("EQUIPMENT_INCREMENT_INVALID");
  }
  if (load.exactAvailableValues &&
      load.exactAvailableValues.some((value, index, values) => value < 0 ||
        (index > 0 && value <= values[index - 1]!))) {
    reasons.push("EQUIPMENT_AVAILABLE_LOADS_NOT_STRICTLY_ASCENDING");
  }
  if (["selectorized_machine", "plate_loaded_machine", "smith_machine"]
      .includes(profile.implementKind) && !profile.machineId) {
    reasons.push("EXACT_MACHINE_ID_REQUIRED");
  }
  if (profile.implementKind === "band" && profile.loadMagnitude.unit === "kg" &&
      profile.bandResistanceMeasured !== true) {
    reasons.push("BAND_KILOGRAM_REQUIRES_MEASURED_AUTHORITY");
  }
  if (profile.provenance.length === 0) reasons.push("EQUIPMENT_REALIZATION_PROVENANCE_REQUIRED");
  return Object.freeze([...new Set(reasons)].sort());
}

export function resolveEquipmentLoadRealization(input: {
  readonly profile: EquipmentLoadRealizationProfile;
  readonly requestedLoad: LoadTarget | null;
  readonly currentExactLoad: number | null;
  readonly loadCeilingInsufficientForPurpose: boolean;
}): EquipmentLoadRealizationResult {
  const issues = validateEquipmentLoadRealizationProfile(input.profile);
  const reasonCodes: string[] = [...issues];
  const profile = input.profile;
  if (issues.length > 0) return Object.freeze({
    profileId: profile.profileId, status: "equipment_realization_incomplete",
    selectedLoad: null, nextExactLoad: null, loadCeilingVisible: profile.loadMagnitude.maximum !== null,
    exactLoadGuessed: false, bandKilogramInferenceApplied: false,
    smithBarbellEquivalenceApplied: false, candidateRecompositionRequired: false,
    reasonCodes: Object.freeze(reasonCodes),
  });
  if (profile.implementKind === "bodyweight") {
    const status = profile.assistanceAvailable ? "assistance_realization_available" :
      profile.externalLoadingAvailable ? "external_load_realization_available" : "load_not_applicable";
    return Object.freeze({ profileId: profile.profileId, status,
      selectedLoad: { kind: "bodyweight" as const }, nextExactLoad: null, loadCeilingVisible: false,
      exactLoadGuessed: false, bandKilogramInferenceApplied: false,
      smithBarbellEquivalenceApplied: false, candidateRecompositionRequired: false,
      reasonCodes: Object.freeze(["BODYWEIGHT_LEVER_ASSISTANCE_RANGE_TRUTH_PRESERVED"]),
    });
  }
  if (profile.implementKind === "band" && profile.bandResistanceMeasured !== true) {
    return Object.freeze({ profileId: profile.profileId, status: "effort_calibration_available",
      selectedLoad: { kind: "user_selected_by_effort" as const, effort: {
        kind: "self_selected_by_reviewed_standard" as const,
        standardId: "B4:BAND_EFFORT_CALIBRATION",
        description: "Select a stable band realization that meets the prescribed effort and quality.",
      } }, nextExactLoad: null, loadCeilingVisible: false, exactLoadGuessed: false,
      bandKilogramInferenceApplied: false, smithBarbellEquivalenceApplied: false,
      candidateRecompositionRequired: false,
      reasonCodes: Object.freeze(["BAND_RESISTANCE_UNKNOWN_EFFORT_CALIBRATION_ONLY"]),
    });
  }
  if (input.loadCeilingInsufficientForPurpose) {
    return Object.freeze({ profileId: profile.profileId, status: "recomposition_required",
      selectedLoad: null, nextExactLoad: null, loadCeilingVisible: true, exactLoadGuessed: false,
      bandKilogramInferenceApplied: false, smithBarbellEquivalenceApplied: false,
      candidateRecompositionRequired: true,
      reasonCodes: Object.freeze(["LOAD_CEILING_CANNOT_REALIZE_PURPOSE", "CANDIDATE_COMPOSER_OWNER_REQUIRED"]),
    });
  }

  const requested = exactNumericLoad(input.requestedLoad);
  const available = profile.loadMagnitude.exactAvailableValues;
  const max = profile.loadMagnitude.maximum;
  if (requested !== null && max !== null && requested > max) {
    return Object.freeze({ profileId: profile.profileId, status: "load_ceiling_reached",
      selectedLoad: null, nextExactLoad: null, loadCeilingVisible: true, exactLoadGuessed: false,
      bandKilogramInferenceApplied: false, smithBarbellEquivalenceApplied: false,
      candidateRecompositionRequired: true,
      reasonCodes: Object.freeze(["REQUESTED_LOAD_EXCEEDS_EXACT_CEILING"]),
    });
  }
  if (requested !== null && available && !available.includes(requested)) {
    return Object.freeze({ profileId: profile.profileId, status: "load_increment_unavailable",
      selectedLoad: null, nextExactLoad: available.find((value) => value > requested) ?? null,
      loadCeilingVisible: max !== null, exactLoadGuessed: false, bandKilogramInferenceApplied: false,
      smithBarbellEquivalenceApplied: false, candidateRecompositionRequired: false,
      reasonCodes: Object.freeze(["REQUESTED_LOAD_NOT_IN_EXACT_AVAILABLE_SET"]),
    });
  }
  const minimum = profile.loadMagnitude.minimum;
  const increment = profile.loadMagnitude.smallestIncrement;
  if (requested !== null && !available && minimum !== null && increment !== null) {
    const incrementsFromMinimum = (requested - minimum) / increment;
    if (requested < minimum || Math.abs(incrementsFromMinimum - Math.round(incrementsFromMinimum)) > 1e-9) {
      const next = minimum + Math.max(0, Math.ceil(incrementsFromMinimum)) * increment;
      return Object.freeze({ profileId: profile.profileId, status: "load_increment_unavailable",
        selectedLoad: null, nextExactLoad: max !== null && next > max ? null : next,
        loadCeilingVisible: max !== null, exactLoadGuessed: false, bandKilogramInferenceApplied: false,
        smithBarbellEquivalenceApplied: false, candidateRecompositionRequired: false,
        reasonCodes: Object.freeze(["REQUESTED_LOAD_NOT_ALIGNED_TO_EXACT_INCREMENT"]),
      });
    }
  }
  if (requested !== null) {
    return Object.freeze({ profileId: profile.profileId, status: "exact_capability_available",
      selectedLoad: input.requestedLoad, nextExactLoad: available?.find((value) => value > requested) ??
        (profile.loadMagnitude.smallestIncrement !== null ? requested + profile.loadMagnitude.smallestIncrement : null),
      loadCeilingVisible: max !== null, exactLoadGuessed: false, bandKilogramInferenceApplied: false,
      smithBarbellEquivalenceApplied: false, candidateRecompositionRequired: false,
      reasonCodes: Object.freeze(["EXACT_REQUESTED_LOAD_CAPABILITY_CONFIRMED"]),
    });
  }
  if (input.currentExactLoad !== null) {
    const currentExactLoad = input.currentExactLoad;
    const next = available?.find((value) => value > currentExactLoad) ??
      (profile.loadMagnitude.smallestIncrement !== null ?
        currentExactLoad + profile.loadMagnitude.smallestIncrement : null);
    if (next !== null && max !== null && next > max) {
      return Object.freeze({ profileId: profile.profileId, status: "load_ceiling_reached",
        selectedLoad: exactLoadTarget(profile, currentExactLoad), nextExactLoad: null,
        loadCeilingVisible: true, exactLoadGuessed: false, bandKilogramInferenceApplied: false,
        smithBarbellEquivalenceApplied: false, candidateRecompositionRequired: false,
        reasonCodes: Object.freeze(["CURRENT_LOAD_AT_EXACT_CEILING"]),
      });
    }
    return Object.freeze({ profileId: profile.profileId, status: next === null ?
      "load_increment_unavailable" : "exact_capability_available",
    selectedLoad: exactLoadTarget(profile, currentExactLoad), nextExactLoad: next,
    loadCeilingVisible: max !== null, exactLoadGuessed: false, bandKilogramInferenceApplied: false,
    smithBarbellEquivalenceApplied: false, candidateRecompositionRequired: false,
    reasonCodes: Object.freeze([next === null ? "NEXT_LOAD_INCREMENT_UNKNOWN" : "NEXT_LOAD_INCREMENT_EXACT"]),
    });
  }
  return Object.freeze({ profileId: profile.profileId, status: "effort_calibration_available",
    selectedLoad: null, nextExactLoad: null, loadCeilingVisible: max !== null,
    exactLoadGuessed: false, bandKilogramInferenceApplied: false,
    smithBarbellEquivalenceApplied: false, candidateRecompositionRequired: false,
    reasonCodes: Object.freeze(["EXACT_LOAD_UNKNOWN_SELF_SELECTED_CALIBRATION_REQUIRED"]),
  });
}
