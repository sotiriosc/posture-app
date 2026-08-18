import {
  HOME_COMFORT_PROFILE_CONTRACT,
  type HomeComfortProductionProfile,
} from "./contracts";

type ProfileInput = Partial<Omit<HomeComfortProductionProfile, "contract" | "exerciseId" | "status" | "provenance">>;

function profile(exerciseId: string, input: ProfileInput = {}): HomeComfortProductionProfile {
  return Object.freeze({
    contract: HOME_COMFORT_PROFILE_CONTRACT,
    exerciseId,
    status: "accepted",
    recognitionFamiliarityExpectation: "moderate",
    setupComplexity: "moderate",
    environmentalAnchorDependence: "low",
    supportConfidence: "high",
    balanceStabilityBurden: "low",
    coordinationBurden: "moderate",
    transitionComplexity: "low",
    stopRestartClarity: "high",
    equipmentAmbiguity: "low",
    firstSessionComfortDisposition: "good",
    provenance: Object.freeze([
      "EXERCISE_CATALOG_COVERAGE_AND_HOME_COMFORT_CURATION_V1",
      "PACKAGE_R_HOME_FIRST_MIXED_RELEASE_V1",
    ]),
    ...input,
  });
}

const simpleFloor = (id: string) => profile(id, {
  setupComplexity: "low", supportConfidence: "high", balanceStabilityBurden: "low",
  transitionComplexity: "moderate", firstSessionComfortDisposition: "excellent",
});
const standingBodyweight = (id: string) => profile(id, {
  setupComplexity: "low", supportConfidence: "moderate", balanceStabilityBurden: "moderate",
  coordinationBurden: "moderate", firstSessionComfortDisposition: "good",
});
const dumbbellHome = (id: string) => profile(id, {
  recognitionFamiliarityExpectation: "high", equipmentAmbiguity: "low",
  supportConfidence: "moderate", firstSessionComfortDisposition: "good",
});
const benchDumbbell = (id: string) => profile(id, {
  setupComplexity: "moderate", equipmentAmbiguity: "moderate",
  transitionComplexity: "moderate", firstSessionComfortDisposition: "possible",
});
const anchored = (id: string) => profile(id, {
  setupComplexity: "high", environmentalAnchorDependence: "high", equipmentAmbiguity: "high",
  supportConfidence: "moderate", stopRestartClarity: "moderate", firstSessionComfortDisposition: "possible",
});
const gymMachine = (id: string) => profile(id, {
  setupComplexity: "moderate", environmentalAnchorDependence: "high", equipmentAmbiguity: "high",
  supportConfidence: "high", firstSessionComfortDisposition: "poor",
});
const cableStation = (id: string) => profile(id, {
  setupComplexity: "high", environmentalAnchorDependence: "high", equipmentAmbiguity: "high",
  supportConfidence: "moderate", firstSessionComfortDisposition: "poor",
});
const preparationProfile = (id: string, input: ProfileInput = {}) => Object.freeze({
  ...profile(id, input),
  provenance: Object.freeze([
    "EXERCISE_CATALOG_COVERAGE_AND_HOME_COMFORT_CURATION_V1",
    "PREPARATION_INTELLIGENCE_FOUNDATION_V1",
  ]),
});

export const HOME_COMFORT_PROFILES: Readonly<Record<string, HomeComfortProductionProfile>> = Object.freeze({
  "ninety-ninety-breathing": simpleFloor("ninety-ninety-breathing"),
  "serratus-wall-slide": standingBodyweight("serratus-wall-slide"),
  "dead-bug": simpleFloor("dead-bug"),
  "push-up": simpleFloor("push-up"),
  "dumbbell-bench-press": benchDumbbell("dumbbell-bench-press"),
  "machine-chest-press": gymMachine("machine-chest-press"),
  "cable-chest-fly": cableStation("cable-chest-fly"),
  "chest-supported-dumbbell-row": benchDumbbell("chest-supported-dumbbell-row"),
  "one-arm-dumbbell-row": dumbbellHome("one-arm-dumbbell-row"),
  "machine-row": gymMachine("machine-row"),
  "seated-cable-row": cableStation("seated-cable-row"),
  "band-row": anchored("band-row"),
  "dumbbell-shoulder-press": dumbbellHome("dumbbell-shoulder-press"),
  "lat-pulldown": gymMachine("lat-pulldown"),
  "band-lat-pulldown": anchored("band-lat-pulldown"),
  "goblet-squat": dumbbellHome("goblet-squat"),
  "leg-press": gymMachine("leg-press"),
  "bodyweight-box-squat": standingBodyweight("bodyweight-box-squat"),
  "dumbbell-romanian-deadlift": dumbbellHome("dumbbell-romanian-deadlift"),
  "cable-pull-through": cableStation("cable-pull-through"),
  "split-squat": profile("split-squat", { balanceStabilityBurden: "high", coordinationBurden: "moderate", supportConfidence: "moderate", firstSessionComfortDisposition: "possible" }),
  "step-up": profile("step-up", { setupComplexity: "moderate", balanceStabilityBurden: "high", transitionComplexity: "moderate", firstSessionComfortDisposition: "possible" }),
  "lying-leg-curl": gymMachine("lying-leg-curl"),
  "glute-bridge": simpleFloor("glute-bridge"),
  "dumbbell-lateral-raise": dumbbellHome("dumbbell-lateral-raise"),
  "reverse-pec-deck": gymMachine("reverse-pec-deck"),
  "band-face-pull": anchored("band-face-pull"),
  "dumbbell-curl": dumbbellHome("dumbbell-curl"),
  "cable-triceps-pressdown": cableStation("cable-triceps-pressdown"),
  "pallof-press": anchored("pallof-press"),
  "forearm-plank": simpleFloor("forearm-plank"),
  "forearm-side-plank": profile("forearm-side-plank", { setupComplexity: "moderate", supportConfidence: "moderate", balanceStabilityBurden: "high", coordinationBurden: "moderate", firstSessionComfortDisposition: "possible" }),
  "machine-abdominal-crunch": gymMachine("machine-abdominal-crunch"),
  "half-kneeling-high-to-low-cable-chop": cableStation("half-kneeling-high-to-low-cable-chop"),
  "farmer-carry": dumbbellHome("farmer-carry"),
  "suitcase-carry": profile("suitcase-carry", { recognitionFamiliarityExpectation: "moderate", balanceStabilityBurden: "moderate", supportConfidence: "moderate", transitionComplexity: "moderate", firstSessionComfortDisposition: "good" }),
  "wall-supported-suitcase-march": profile("wall-supported-suitcase-march", { setupComplexity: "moderate", supportConfidence: "high", coordinationBurden: "moderate", transitionComplexity: "moderate", firstSessionComfortDisposition: "good" }),
  "standing-calf-raise": standingBodyweight("standing-calf-raise"),
  "side-lying-hip-adduction": simpleFloor("side-lying-hip-adduction"),
  "loop-band-lateral-walk": profile("loop-band-lateral-walk", { setupComplexity: "moderate", supportConfidence: "moderate", balanceStabilityBurden: "moderate", coordinationBurden: "moderate", transitionComplexity: "moderate", firstSessionComfortDisposition: "good" }),
  "side-lying-dumbbell-external-rotation": profile("side-lying-dumbbell-external-rotation", { setupComplexity: "moderate", supportConfidence: "high", transitionComplexity: "moderate", firstSessionComfortDisposition: "good" }),
  "supine-hamstring-walkout": profile("supine-hamstring-walkout", { setupComplexity: "low", supportConfidence: "moderate", coordinationBurden: "high", transitionComplexity: "moderate", firstSessionComfortDisposition: "possible" }),
  "wall-ankle-dorsiflexion-rock": standingBodyweight("wall-ankle-dorsiflexion-rock"),
  "bodyweight-hip-hinge-rehearsal": standingBodyweight("bodyweight-hip-hinge-rehearsal"),
  "single-leg-balance-rehearsal": profile("single-leg-balance-rehearsal", { setupComplexity: "low", supportConfidence: "moderate", balanceStabilityBurden: "high", coordinationBurden: "moderate", firstSessionComfortDisposition: "possible" }),
  "dumbbell-floor-press": profile("dumbbell-floor-press", { recognitionFamiliarityExpectation: "high", setupComplexity: "moderate", supportConfidence: "high", transitionComplexity: "moderate", firstSessionComfortDisposition: "excellent" }),
  "dumbbell-triceps-extension": profile("dumbbell-triceps-extension", { recognitionFamiliarityExpectation: "high", setupComplexity: "moderate", supportConfidence: "moderate", stopRestartClarity: "moderate", firstSessionComfortDisposition: "good" }),
  "bent-over-dumbbell-reverse-fly": profile("bent-over-dumbbell-reverse-fly", { setupComplexity: "moderate", supportConfidence: "low", balanceStabilityBurden: "moderate", coordinationBurden: "moderate", stopRestartClarity: "high", firstSessionComfortDisposition: "possible" }),
  "side-lying-hip-abduction": simpleFloor("side-lying-hip-abduction"),
  "bird-dog": profile("bird-dog", { recognitionFamiliarityExpectation: "high", setupComplexity: "low", supportConfidence: "high", coordinationBurden: "high", transitionComplexity: "moderate", firstSessionComfortDisposition: "good" }),
  "band-biceps-curl": profile("band-biceps-curl", { recognitionFamiliarityExpectation: "high", setupComplexity: "moderate", environmentalAnchorDependence: "low", supportConfidence: "high", equipmentAmbiguity: "moderate", firstSessionComfortDisposition: "good" }),
  "machine-shoulder-press": gymMachine("machine-shoulder-press"),
  "machine-leg-extension": gymMachine("machine-leg-extension"),
  "pull-up": profile("pull-up", { setupComplexity: "moderate", environmentalAnchorDependence: "high", supportConfidence: "moderate", balanceStabilityBurden: "moderate", coordinationBurden: "high", equipmentAmbiguity: "high", firstSessionComfortDisposition: "possible" }),
  "hack-squat": gymMachine("hack-squat"),
  "seated-leg-curl": gymMachine("seated-leg-curl"),
  "machine-chest-fly": gymMachine("machine-chest-fly"),
  "machine-hip-adduction": gymMachine("machine-hip-adduction"),
  "machine-hip-abduction": gymMachine("machine-hip-abduction"),
  "seated-calf-raise": gymMachine("seated-calf-raise"),
  "machine-hip-thrust": gymMachine("machine-hip-thrust"),
  "cable-lateral-raise": cableStation("cable-lateral-raise"),
  "overhead-cable-triceps-extension": cableStation("overhead-cable-triceps-extension"),
  "straight-arm-cable-pulldown": cableStation("straight-arm-cable-pulldown"),
  "moving-ninety-ninety-hip-switch": preparationProfile("moving-ninety-ninety-hip-switch", { setupComplexity: "low", supportConfidence: "high", balanceStabilityBurden: "low", transitionComplexity: "moderate", firstSessionComfortDisposition: "excellent" }),
  "quadruped-hip-rock-back": preparationProfile("quadruped-hip-rock-back", { setupComplexity: "low", supportConfidence: "high", balanceStabilityBurden: "low", transitionComplexity: "moderate", firstSessionComfortDisposition: "good" }),
  "scapular-push-up": preparationProfile("scapular-push-up", { setupComplexity: "moderate", supportConfidence: "moderate", balanceStabilityBurden: "moderate", coordinationBurden: "moderate", transitionComplexity: "moderate", firstSessionComfortDisposition: "good" }),
  "bodyweight-squat-rehearsal": preparationProfile("bodyweight-squat-rehearsal", { setupComplexity: "low", supportConfidence: "moderate", balanceStabilityBurden: "moderate", coordinationBurden: "moderate", firstSessionComfortDisposition: "good" }),
  "half-kneeling-hip-flexor-stretch": preparationProfile("half-kneeling-hip-flexor-stretch", { setupComplexity: "moderate", supportConfidence: "high", balanceStabilityBurden: "low", coordinationBurden: "low", transitionComplexity: "moderate", firstSessionComfortDisposition: "good" }),
});

export const PRE_PACKAGE_S_HOME_COMFORT_PROFILES: Readonly<Record<string, HomeComfortProductionProfile>> =
  Object.freeze(Object.fromEntries(Object.entries(HOME_COMFORT_PROFILES).slice(0, 53)));

export function validateHomeComfortProfileCoverage(
  catalogIds: readonly string[],
  profiles: Readonly<Record<string, HomeComfortProductionProfile>> = HOME_COMFORT_PROFILES,
): readonly string[] {
  const profileIds = Object.keys(profiles);
  const catalogSet = new Set(catalogIds);
  return [
    ...catalogIds.filter((id) => !profiles[id]).map((id) => `missing_profile:${id}`),
    ...profileIds.filter((id) => !catalogSet.has(id)).map((id) => `orphan_profile:${id}`),
    ...profileIds.filter((id) => profiles[id]?.status !== "accepted").map((id) => `unaccepted_profile:${id}`),
  ].sort();
}
