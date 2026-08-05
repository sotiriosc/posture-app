/**
 * Release-critical exercise set = union of production-reachable catalog IDs.
 */

import {
  allExercises,
  exerciseById,
  exercises,
} from "@/lib/exercises";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgressionCandidateIdsForValidation,
  PAIN_RULES,
} from "@/lib/program";
import { DUMBBELL_ROLE_CANDIDATE_IDS } from "@/lib/program/dumbbellTemplates";
import { BAND_ROLE_CANDIDATES } from "@/lib/program/bandTemplates";
import { BODYWEIGHT_ROLE_CANDIDATE_IDS } from "@/lib/program/bodyweightTemplates";
import { buildMixedHomeRoleCandidates } from "@/lib/program/mixedHomeTemplates";
import { get3DayBackChestVerticalFallbackIds } from "@/lib/program/dayTemplates";
import { RELEASE_CRITICAL_GYM_SEEDS } from "@/lib/coaching/releaseCriticalGymSeeds";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

export type ReleaseCriticalClassification = {
  releaseCritical: string[];
  catalogOnly: string[];
  deprecated: string[];
  orphanOrUnreachable: string[];
  legacyCompat: string[];
  warmupLibraryOnly: string[];
};

const catalogIdSet = () => new Set(allExercises.map((exercise) => exercise.id));

const addIfCatalog = (target: Set<string>, id: string | undefined | null, catalog: Set<string>) => {
  if (id && catalog.has(id)) target.add(id);
};

const closeLineage = (seeds: Set<string>, catalog: Set<string>) => {
  const closed = new Set(seeds);
  const queue = [...seeds];
  while (queue.length) {
    const id = queue.pop()!;
    const exercise = exerciseById(id);
    if (!exercise) continue;
    for (const next of [
      exercise.progressionOf,
      exercise.regressionOf,
      ...(exercise.swapOptions ?? []),
    ]) {
      if (next && catalog.has(next) && !closed.has(next)) {
        closed.add(next);
        queue.push(next);
      }
    }
  }
  return closed;
};

type PersonaSeed = {
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
  seed: number;
};

const buildPersonaMatrix = (): PersonaSeed[] => {
  const experiences = ["Beginner", "Intermediate", "Advanced"] as const;
  const frequencies = [3, 4, 5] as const;
  const phases = [1, 2, 3] as const;
  const modes: Array<{
    equipment: string[];
    bandSetup?: QuestionnaireData["bandSetup"];
    extras?: Partial<QuestionnaireData>;
  }> = [
    { equipment: ["gym"] },
    { equipment: ["dumbbells"] },
    { equipment: ["bands"], bandSetup: "long_with_anchor" },
    { equipment: ["bands"], bandSetup: "long_no_anchor" },
    { equipment: ["bands"], bandSetup: "loop_only" },
    { equipment: ["bands"], bandSetup: "both_with_anchor" },
    { equipment: ["none"] },
    { equipment: ["dumbbells", "bands"], bandSetup: "long_with_anchor" },
    { equipment: ["dumbbells", "bands"], bandSetup: "long_no_anchor" },
    {
      equipment: ["dumbbells", "bands", "pullup_bar"],
      bandSetup: "long_with_anchor",
    },
  ];

  const painCombos: string[][] = [
    [],
    ["Shoulders"],
    ["Lower back"],
    ["Knees"],
    ["Hips"],
    ["Shoulders", "Lower back"],
  ];

  const out: PersonaSeed[] = [];
  let seed = 1;
  // Representative cross-product: every mode × experience × one frequency × one phase × pain samples.
  for (const mode of modes) {
    for (const experience of experiences) {
      const daysPerWeek = frequencies[(seed + experiences.indexOf(experience)) % frequencies.length];
      const phaseIndex = phases[(seed + 1) % phases.length];
      for (const painAreas of painCombos.slice(0, 3)) {
        out.push({
          phaseIndex,
          seed: seed++,
          questionnaire: {
            goals: "General fitness",
            experience,
            equipment: mode.equipment,
            daysPerWeek,
            painAreas,
            bandSetup: mode.bandSetup,
            ...(mode.extras ?? {}),
          } as QuestionnaireData,
        });
      }
    }
  }
  // Extra frequency/phase coverage for gym + mixed-home flagships.
  for (const daysPerWeek of frequencies) {
    for (const phaseIndex of phases) {
      out.push({
        phaseIndex,
        seed: seed++,
        questionnaire: {
          goals: "Athletic performance",
          experience: "Advanced",
          equipment: ["gym"],
          daysPerWeek,
          painAreas: [],
        } as QuestionnaireData,
      });
      out.push({
        phaseIndex,
        seed: seed++,
        questionnaire: {
          goals: "General fitness",
          experience: "Intermediate",
          equipment: ["dumbbells", "bands"],
          daysPerWeek,
          painAreas: [],
          bandSetup: "long_with_anchor",
        } as QuestionnaireData,
      });
    }
  }
  return out;
};

let cachedClassification: ReleaseCriticalClassification | null = null;

export const collectReleaseCriticalExerciseIds = (params?: {
  includeGenerated?: boolean;
}): ReleaseCriticalClassification => {
  if (cachedClassification && params?.includeGenerated !== false) {
    return cachedClassification;
  }

  const catalog = catalogIdSet();
  const seeds = new Set<string>();

  for (const ids of Object.values(DUMBBELL_ROLE_CANDIDATE_IDS)) {
    for (const id of ids) addIfCatalog(seeds, id, catalog);
  }
  for (const lane of Object.values(BAND_ROLE_CANDIDATES)) {
    for (const ids of Object.values(lane)) {
      for (const id of ids) addIfCatalog(seeds, id, catalog);
    }
  }
  for (const ids of Object.values(BODYWEIGHT_ROLE_CANDIDATE_IDS)) {
    for (const id of ids) addIfCatalog(seeds, id, catalog);
  }
  const mixedFamilies = [
    ...Object.keys(DUMBBELL_ROLE_CANDIDATE_IDS),
    "true_vertical_pull",
    "horizontal_pull",
    "anti_rotation",
    "scap_rear_delt",
  ];
  for (const capabilityLane of [
    "db_long_with_anchor",
    "db_long_no_anchor",
    "db_loop_only",
    "db_both_with_anchor",
    "db_both_no_anchor",
    "db_legacy_unknown",
  ] as const) {
    for (const family of mixedFamilies) {
      const ranked = buildMixedHomeRoleCandidates({
        family,
        capabilityLane,
        hasPullupBar: true,
        preferBandAdvantage: true,
      });
      for (const entry of ranked) addIfCatalog(seeds, entry.id, catalog);
    }
  }
  for (const id of get3DayBackChestVerticalFallbackIds()) {
    addIfCatalog(seeds, id, catalog);
  }
  for (const id of RELEASE_CRITICAL_GYM_SEEDS) {
    addIfCatalog(seeds, id, catalog);
  }
  for (const id of getProgressionCandidateIdsForValidation()) {
    addIfCatalog(seeds, id, catalog);
  }
  for (const rule of Object.values(PAIN_RULES)) {
    for (const id of rule.substitutionPreferredIds ?? []) {
      addIfCatalog(seeds, id, catalog);
    }
  }

  // Gym pool literals live inside program.ts; representative generation below
  // captures production-reachable IDs without Node filesystem scraping (keeps
  // this module browser-safe if accidentally imported).

  if (params?.includeGenerated !== false) {
    for (const persona of buildPersonaMatrix()) {
      try {
        clearProgramVariationHistory();
        const program = generateWeeklyProgram(
          persona.questionnaire,
          `phase6-reachability-${persona.seed}`,
          {
            phaseIndex: persona.phaseIndex,
            seed: String(persona.seed),
          }
        );
        for (const day of program.week) {
          for (const item of day.routine) {
            addIfCatalog(seeds, item.exerciseId, catalog);
          }
        }
      } catch {
        // Keep derivation resilient; generation failures are reported by mode audits.
      }
    }
  }

  const closed = closeLineage(seeds, catalog);
  const deprecated = allExercises.filter((e) => e.deprecated).map((e) => e.id);
  const deprecatedSet = new Set(deprecated);
  // Release-critical gate excludes deprecated IDs; keep them as legacy-compat only.
  const releaseCritical = [...closed].filter((id) => !deprecatedSet.has(id)).sort();
  const releaseSet = new Set(releaseCritical);
  const catalogOnly = exercises
    .filter((e) => !releaseSet.has(e.id))
    .map((e) => e.id)
    .sort();
  const legacyCompat = deprecated.filter((id) => closed.has(id));
  const orphanOrUnreachable = catalogOnly.slice();

  const result: ReleaseCriticalClassification = {
    releaseCritical,
    catalogOnly,
    deprecated,
    orphanOrUnreachable,
    legacyCompat,
    warmupLibraryOnly: [],
  };
  if (params?.includeGenerated !== false) {
    cachedClassification = result;
  }
  return result;
};

export const isReleaseCriticalExerciseId = (exerciseId: string) =>
  collectReleaseCriticalExerciseIds().releaseCritical.includes(exerciseId);

export const getReleaseCriticalExerciseIdSet = (): ReadonlySet<string> =>
  new Set(collectReleaseCriticalExerciseIds().releaseCritical);
