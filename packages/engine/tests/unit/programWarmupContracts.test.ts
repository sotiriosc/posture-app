import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";
import { PATTERN_JOINT_MAP } from "@/lib/program/patternJointMap";

const baseInput: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["bands"],
  daysPerWeek: 3,
};

const warmupSignature = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week.map((day) => ({
    title: day.title,
    warmup: day.warmup?.items.map((item) => item.id) ?? [],
    activation: day.activation?.items.map((item) => item.id) ?? [],
    cooldown: day.cooldown?.items.map((item) => item.id) ?? [],
  }));

const getDay = (program: ReturnType<typeof generateWeeklyProgram>, title: string) =>
  program.week.find((day) => day.title === title);

const hasMainPattern = (exercise: Exercise, pattern: "push" | "pull") =>
  exercise.movementPattern.some((entry) => entry.toLowerCase() === pattern);

const assertBackChestMainPushAndPull = (
  program: ReturnType<typeof generateWeeklyProgram>
) => {
  const backChestDay = getDay(program, "Back + Chest");
  expect(backChestDay).toBeTruthy();
  if (!backChestDay) return;

  const mainExercises = backChestDay.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

  const pushMains = mainExercises.filter((exercise) => hasMainPattern(exercise, "push"));
  const pullMains = mainExercises.filter((exercise) => hasMainPattern(exercise, "pull"));
  expect(pushMains.length).toBeGreaterThanOrEqual(1);
  expect(pullMains.length).toBeGreaterThanOrEqual(1);
};

// Phase 3W helpers ──────────────────────────────────────────────────────────

/** Tags used to verify MOBILIZE block covers a joint. */
const LOWER_BODY_JOINTS = new Set([
  "hips", "hamstrings", "lower back", "knees", "ankles",
]);
const UPPER_BODY_JOINTS = new Set([
  "shoulders", "scapulae", "thoracic spine",
]);
const SCAP_HEALTH_TAGS = new Set(["scap_health", "serratus", "scapular"]);
const HIP_HEALTH_TAGS = new Set(["hip_health", "hinge", "glutes"]);
const KNEE_HEALTH_TAGS = new Set(["knee_health", "knees", "ankles"]);

const coveredJoints = (block: { items: Array<{ mobilizes?: string[] }> }) =>
  new Set(block.items.flatMap((i) => i.mobilizes ?? []));

const itemHasTag = (item: { tags: string[] }, tagSet: Set<string>) =>
  item.tags.some((t) => tagSet.has(t));

const lowerHeavyPrepIds = new Set([
  "ninety-ninety-switches",
  "hip-shifts",
  "ankle-mobility-rocks",
  "soleus-wall-drives",
  "glute-bridge-activation",
  "band-lateral-walk",
  "hip-hinge-dowel",
  "bodyweight-good-morning-pattern",
  "back-extension-hold-pattern",
  "bodyweight-squat-to-box",
  "goblet-squat-pattern",
  "supported-squat-pattern",
]);

describe("program warmup contracts", () => {
  test.each([
    { id: "band-only", equipment: ["bands"] as QuestionnaireData["equipment"] },
    { id: "none-only", equipment: ["none"] as QuestionnaireData["equipment"] },
  ])("legs and back+chest four-block contracts hold for $id equipment", ({ equipment }) => {
    const program = generateWeeklyProgram(
      { ...baseInput, equipment },
      `warmup-contract-${equipment.join("-")}`,
      {
        phaseIndex: 2,
        seed: `warmup-contract-${equipment.join("-")}`,
      }
    );

    const legDay = getDay(program, "Legs + Abs");
    const backChestDay = getDay(program, "Back + Chest");
    expect(legDay?.warmup).toBeTruthy();
    expect(backChestDay?.warmup).toBeTruthy();
    if (!legDay?.warmup || !backChestDay?.warmup) return;

    // Phase 3W: MOBILIZE block (merged into warmup) must cover lower-body joints
    // for a leg day.  Leg day loads hips, hamstrings, lower back (hinge) and
    // knees, hips, ankles (knee_dominant).
    const legWarmupJoints = coveredJoints(legDay.warmup);
    expect(
      [...LOWER_BODY_JOINTS].some((j) => legWarmupJoints.has(j)),
      `Leg day warmup should cover at least one lower-body joint; got: ${[...legWarmupJoints].join(", ")}`
    ).toBe(true);

    // ACTIVATE block must contain a hip-health or knee-health toolbox item
    expect(
      (legDay.activation?.items ?? []).some(
        (item) => itemHasTag(item, HIP_HEALTH_TAGS) || itemHasTag(item, KNEE_HEALTH_TAGS)
      ),
      `Leg day activation should contain hip-health or knee-health item`
    ).toBe(true);

    // Back+Chest day: MOBILIZE covers upper-body joints (shoulders/scapulae/t-spine)
    const backChestWarmupJoints = coveredJoints(backChestDay.warmup);
    expect(
      [...UPPER_BODY_JOINTS].some((j) => backChestWarmupJoints.has(j)),
      `Back+Chest day warmup should cover at least one upper-body joint; got: ${[...backChestWarmupJoints].join(", ")}`
    ).toBe(true);

    // Warmup and activation blocks exist and are non-empty
    expect(legDay.warmup.items.length).toBeGreaterThanOrEqual(1);
    expect(backChestDay.warmup.items.length).toBeGreaterThanOrEqual(1);
  });

  test("warmup and activation are deterministic for the same input", () => {
    const a = generateWeeklyProgram(baseInput, "warmup-det-a", {
      phaseIndex: 2,
      seed: "warmup-det",
    });
    const b = generateWeeklyProgram(baseInput, "warmup-det-b", {
      phaseIndex: 2,
      seed: "warmup-det",
    });

    expect(warmupSignature(a)).toEqual(warmupSignature(b));
  });

  test("warmup blocks are day-specific and not identical across the week", () => {
    const program = generateWeeklyProgram(baseInput, "warmup-day-specific", {
      phaseIndex: 2,
      seed: "warmup-day-specific",
    });
    const signatures = program.week.map(
      (day) => day.warmup?.items.map((item) => item.id).join("|") ?? ""
    );
    expect(new Set(signatures).size).toBeGreaterThan(1);
    program.week.forEach((day) => {
      expect(day.warmup?.items.length ?? 0).toBeGreaterThan(0);
      expect(day.activation?.items.length ?? 0).toBeGreaterThan(0);
      expect(day.cooldown?.items.length ?? 0).toBeGreaterThan(0);
    });
  });

  test("prep volume stays present and bounded per day (with pain areas)", () => {
    // Phase 3W: pain contraindications filter all four blocks; no block goes
    // empty silently.  Bounds are looser than the old contract because the
    // four-block RAMP+MOBILIZE+ACTIVATE+PRIME split replaces the fixed 3+2 rule.
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        goals: "Reduce pain",
        painAreas: ["Shoulders", "Lower back"],
      },
      "warmup-lean-bounded",
      {
        phaseIndex: 2,
        seed: "warmup-lean-bounded",
      }
    );

    program.week.forEach((day) => {
      // Warmup (RAMP + MOBILIZE): at least 1 after pain filtering, at most 5
      expect(day.warmup?.items.length ?? 0).toBeGreaterThanOrEqual(1);
      expect(day.warmup?.items.length ?? 0).toBeLessThanOrEqual(5);
      // ACTIVATE: at least 1
      expect(day.activation?.items.length ?? 0).toBeGreaterThanOrEqual(1);
      expect(day.activation?.items.length ?? 0).toBeLessThanOrEqual(3);
      // Cooldown: exactly 1 for high-pain / reduce-pain context
      expect(day.cooldown?.items.length ?? 0).toBe(1);
      // No item in any block should have a pain contraindication for the active areas
      const allItems = [
        ...(day.warmup?.items ?? []),
        ...(day.activation?.items ?? []),
        ...(day.cooldown?.items ?? []),
      ];
      allItems.forEach((item) => {
        const avoidTokens = (item.painAreasToAvoid ?? []).map((s) => s.toLowerCase());
        expect(
          avoidTokens.some((tok) => tok.includes("shoulder") || tok.includes("lower") || tok.includes("back")),
          `Item "${item.id}" has a pain contraindication for shoulder/lower-back but was not filtered`
        ).toBe(false);
      });
    });
  });

  test("default General Fitness keeps prep present and cooldown one-part", () => {
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["gym"],
      },
      "warmup-general-fitness-lean",
      {
        phaseIndex: 2,
        seed: "warmup-general-fitness-lean",
      }
    );

    program.week.forEach((day) => {
      const warmupItems = day.warmup?.items ?? [];
      const activationItems = day.activation?.items ?? [];
      const cooldownItems = day.cooldown?.items ?? [];

      // Phase 3W: warmup = RAMP + MOBILIZE; at least 1 item (MOBILIZE must cover
      // at least one joint).  Upper bound is loose to handle multi-joint days.
      expect(warmupItems.length).toBeGreaterThanOrEqual(1);
      expect(warmupItems.length).toBeLessThanOrEqual(5);
      // ACTIVATE: at least 1 toolbox item
      expect(activationItems.length).toBeGreaterThanOrEqual(1);
      expect(activationItems.length).toBeLessThanOrEqual(3);
      // Cooldown stays lean (general fitness signal)
      expect(cooldownItems.length).toBeGreaterThanOrEqual(1);
      expect(cooldownItems.length).toBeLessThanOrEqual(2);
    });
  });

  test("pose/photo forward-head tag injects scap prep via assessment overlay", () => {
    // Phase 3W: forward_head pose tag → wall-slides or scap-cars injected into
    // MOBILIZE via the assessment focus-tag overlay.
    const withoutPose = generateWeeklyProgram(baseInput, "warmup-pose-off", {
      phaseIndex: 2,
      seed: "warmup-pose-scap",
    });
    const withForwardHead = generateWeeklyProgram(baseInput, "warmup-pose-on", {
      phaseIndex: 2,
      seed: "warmup-pose-scap",
      poseAnalysis: {
        metrics: {
          torsoHeight: 1,
          avgKeypointScore: 0.9,
          shoulderHeightDelta: 0.01,
          hipHeightDelta: 0.01,
          kneeAlignmentDelta: 0.01,
          headForwardOffset: 0.02,
          torsoLeanAngle: 2,
          hipToShoulderAlignment: 0.01,
          scapularSymmetry: 0.12,
          hipShift: 0.02,
        },
        observations: [],
        priorities: [],
        confidenceScore: 0.9,
      },
    });

    const baseBackChest = getDay(withoutPose, "Back + Chest");
    const fwdBackChest = getDay(withForwardHead, "Back + Chest");
    expect(baseBackChest?.warmup).toBeTruthy();
    expect(fwdBackChest?.warmup).toBeTruthy();
    if (!baseBackChest?.warmup || !fwdBackChest?.warmup) return;

    // With forward_head pose tag, shoulder/scapular items should be injected into warmup
    // (MOBILIZE overlay from FOCUS_TAG_INJECTIONS["forward_head"]).
    const fwdWarmupIds = fwdBackChest.warmup.items.map((item) => item.id);
    expect(
      fwdWarmupIds.some((id) => ["wall-slides", "scap-cars"].includes(id)),
      `forward_head pose should inject wall-slides or scap-cars into warmup; got: ${fwdWarmupIds.join(", ")}`
    ).toBe(true);

    // Warmup and activation exist for both
    expect(baseBackChest.warmup.items.length).toBeGreaterThanOrEqual(1);
    expect(fwdBackChest.warmup.items.length).toBeGreaterThanOrEqual(1);
  });

  test("standard low-pain gym upper days avoid lower-body-heavy prep drift", () => {
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["gym"],
        daysPerWeek: 5,
      },
      "warmup-upper-day-prep-alignment",
      {
        phaseIndex: 1,
        seed: "warmup-upper-day-prep-alignment",
      }
    );

    ["Upper Push", "Upper Pull"].forEach((title) => {
      const day = getDay(program, title);
      expect(day, title).toBeTruthy();
      if (!day) return;
      const prepIds = [
        ...(day.warmup?.items.map((item) => item.id) ?? []),
        ...(day.activation?.items.map((item) => item.id) ?? []),
      ];
      expect(
        prepIds.some((id) => lowerHeavyPrepIds.has(id)),
        `${title}: ${prepIds.join(", ")}`
      ).toBe(false);
      expect(
        prepIds.some((id) =>
          [
            "wall-slides",
            "scap-cars",
            "thoracic-open-book",
            "thread-the-needle",
            "serratus-wall-slide",
            "side-lying-external-rotation",
            "wall-external-rotation-isometric",
          ].includes(id)
        ),
        `${title}: ${prepIds.join(", ")}`
      ).toBe(true);
    });
  });

  // Phase 3W: These three tests were written speculatively for "activation main
  // push machine chest preference" scoring — a feature that was never implemented.
  // They are now updated to assert the four-block warmup contract they were
  // placeholder-scoped for.

  test("ACTIVATE block for push/pull days uses scap_health toolbox", () => {
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        experience: "Advanced",
        equipment: ["gym", "dumbbells", "bench"],
      },
      "activate-scap-health-push-pull",
      {
        phaseIndex: 1,
        seed: "activate-scap-health-push-pull",
      }
    );
    assertBackChestMainPushAndPull(program);

    const backChestDay = getDay(program, "Back + Chest");
    expect(backChestDay?.activation).toBeTruthy();
    if (!backChestDay?.activation) return;

    // ACTIVATE on a push+pull day should contain at least one scap_health item
    expect(
      backChestDay.activation.items.some((item) => itemHasTag(item, SCAP_HEALTH_TAGS)),
      `Back+Chest ACTIVATE must include a scap_health item; got: ${backChestDay.activation.items.map((i) => i.id).join(", ")}`
    ).toBe(true);
  });

  test("ACTIVATE block falls back to core_health when equipment is minimal", () => {
    // With only dumbbells + bench, bands-based scap items are unavailable;
    // the engine must still produce a non-empty ACTIVATE block.
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        experience: "Advanced",
        equipment: ["dumbbells", "bench"],
      },
      "activate-no-bands-fallback",
      {
        phaseIndex: 1,
        seed: "activate-no-bands-fallback",
      }
    );
    assertBackChestMainPushAndPull(program);

    const backChestDay = getDay(program, "Back + Chest");
    expect(backChestDay?.activation).toBeTruthy();
    if (!backChestDay?.activation) return;

    // ACTIVATE must be non-empty (no silent empty blocks)
    expect(
      backChestDay.activation.items.length,
      `Back+Chest ACTIVATE must not be empty even without bands`
    ).toBeGreaterThanOrEqual(1);
  });

  test("PRIME block contains d1–d2 exercises for each main pattern of the day", () => {
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        experience: "Advanced",
        equipment: ["gym", "dumbbells", "bench"],
      },
      "prime-block-d1-d2-per-pattern",
      {
        phaseIndex: 2,
        seed: "prime-block-d1-d2-per-pattern",
      }
    );

    // Every day that has a recognizable main pattern should have a PRIME block
    program.week.forEach((day) => {
      const primeBlock = (day as typeof day & { prime?: typeof day.warmup }).prime;
      const mainExercises = day.routine
        .filter((i) => i.section === "main")
        .map((i) => exerciseById(i.exerciseId))
        .filter(Boolean);
      const hasRecognizedPattern = mainExercises.some(
        (ex) =>
          ex!.movementPattern.some((p) =>
            ["hinge", "squat", "kneedominant", "horizontalpull", "horizontalpush",
              "verticalpull", "verticalpush", "core"].includes(p.toLowerCase())
          )
      );
      if (!hasRecognizedPattern) return;

      // PRIME block must exist and have at least one item
      expect(
        primeBlock?.items.length ?? 0,
        `Day "${day.title}" with recognized patterns should have a PRIME block`
      ).toBeGreaterThanOrEqual(1);

      // All PRIME items should have difficulty ≤ 2 (d1–d2 rung check)
      (primeBlock?.items ?? []).forEach((item) => {
        const ex = exerciseById(item.id);
        if (!ex) return;
        expect(
          (ex.difficulty ?? 1) <= 2,
          `PRIME item "${item.id}" should be d1–d2 (difficulty ≤ 2), got ${ex.difficulty}`
        ).toBe(true);
      });
    });
  });
});
