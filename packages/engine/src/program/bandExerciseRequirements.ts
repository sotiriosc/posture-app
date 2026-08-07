/**
 * Minimum machine-readable band setup requirements for Phase 4 eligibility.
 * Catalog-wide coaching completion is intentionally deferred.
 */

import type {
  BandAnchorRequirement,
  BandTypeRequirement,
} from "@/lib/program/bandSetup";

export type BandExerciseRequirement = {
  bandType: BandTypeRequirement;
  anchor: BandAnchorRequirement;
  /** Band under feet / around feet is a valid no-door-anchor setup. */
  selfAnchorOk?: boolean;
};

/**
 * Explicit requirements for band (and common band-eligible) exercises.
 * Anything not listed that only has equipment bands defaults to longBand +
 * none unless name heuristics imply an anchor (handled by inferDefault).
 */
export const BAND_EXERCISE_REQUIREMENTS: Record<string, BandExerciseRequirement> = {
  // No-anchor long / either
  "band-rdl": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "band-front-squat": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "band-overhead-press": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "band-biceps-curl": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "single-arm-band-biceps-curl": {
    bandType: "longBand",
    anchor: "none",
    selfAnchorOk: true,
  },
  "band-calf-raise": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "band-suitcase-march": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "band-offset-march-hold": {
    bandType: "longBand",
    anchor: "none",
    selfAnchorOk: true,
  },
  "band-pull-aparts": { bandType: "either", anchor: "none" },
  "band-pull-apart": { bandType: "either", anchor: "none" },
  "band-lateral-raise": { bandType: "either", anchor: "none" },
  "band-external-rotation": { bandType: "either", anchor: "none" },
  "band-rear-delt-fly": { bandType: "either", anchor: "none" },

  // Foot-anchored rows / press (no door)
  "split-stance-row": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "band-row": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "single-arm-band-row": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "band-row-iso-hold": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "band-chest-press": { bandType: "longBand", anchor: "none", selfAnchorOk: true },
  "split-stance-band-chest-press": {
    bandType: "longBand",
    anchor: "none",
    selfAnchorOk: true,
  },
  "tall-kneeling-band-chest-press": {
    bandType: "longBand",
    anchor: "none",
    selfAnchorOk: true,
  },
  "band-chest-press-iso-hold": {
    bandType: "longBand",
    anchor: "none",
    selfAnchorOk: true,
  },
  "band-chest-fly": { bandType: "longBand", anchor: "none", selfAnchorOk: true },

  // High / mid / low door anchors
  "band-lat-pulldown": { bandType: "longBand", anchor: "high" },
  "band-lat-pulldown-kneeling": { bandType: "longBand", anchor: "high" },
  "standing-band-lat-pulldown": { bandType: "longBand", anchor: "high" },
  "band-lat-pulldown-neutral-grip": { bandType: "longBand", anchor: "high" },
  "band-lat-pulldown-wide-grip": { bandType: "longBand", anchor: "high" },
  "band-lat-pulldown-iso-hold": { bandType: "longBand", anchor: "high" },
  "band-straight-arm-pulldown": { bandType: "longBand", anchor: "high" },
  "band-face-pull-high-anchor": { bandType: "longBand", anchor: "high" },
  "band-assisted-pullup": { bandType: "longBand", anchor: "high" },
  "band-triceps-pressdown": { bandType: "longBand", anchor: "high" },
  "band-overhead-triceps-extension": { bandType: "longBand", anchor: "high" },
  "pallof-press": { bandType: "longBand", anchor: "middle" },
  "band-woodchop": { bandType: "longBand", anchor: "middle" },

  // Loop-friendly (mini)
  // Prefer either/none scap + lower; true long-band hinges are excluded for loop-only.
};

export const resolveBandExerciseRequirement = (params: {
  exerciseId: string;
  name?: string;
  equipment?: readonly string[];
  variantKey?: string | null;
  cues?: readonly string[];
}): BandExerciseRequirement | null => {
  const explicit = BAND_EXERCISE_REQUIREMENTS[params.exerciseId];
  if (explicit) return explicit;

  const equipment = new Set((params.equipment ?? []).map((item) => item.toLowerCase()));
  if (!equipment.has("bands")) return null;

  const blob = [
    params.exerciseId,
    params.name ?? "",
    params.variantKey ?? "",
    ...(params.cues ?? []),
  ]
    .join(" ")
    .toLowerCase();

  let anchor: BandAnchorRequirement = "none";
  if (
    blob.includes("high_anchor") ||
    blob.includes("high anchor") ||
    blob.includes("pulldown") ||
    blob.includes("pressdown") ||
    blob.includes("above eye")
  ) {
    anchor = "high";
  } else if (
    blob.includes("pallof") ||
    blob.includes("woodchop") ||
    blob.includes("mid anchor") ||
    blob.includes("middle anchor")
  ) {
    anchor = "middle";
  } else if (blob.includes("low anchor") || blob.includes("low_anchor")) {
    anchor = "low";
  } else if (blob.includes("anchor") || blob.includes("door")) {
    anchor = "repositionable";
  }

  const loopLike =
    blob.includes("loop") || blob.includes("mini") || blob.includes("hip circle");
  return {
    bandType: loopLike ? "miniLoop" : "longBand",
    anchor,
    selfAnchorOk: anchor === "none",
  };
};
