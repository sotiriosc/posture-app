/**
 * Build complete written coaching from catalog + band/support metadata.
 * Curated overrides may replace fields via mergeCoachingContent.
 */

import type { Exercise } from "@/lib/exercises";
import { getCentrationCues } from "@/lib/centrationCues";
import {
  resolveBandExerciseRequirement,
  type BandExerciseRequirement,
} from "@/lib/program/bandExerciseRequirements";
import type { ExerciseCoachingContent } from "@/lib/coaching/exerciseCoachingContract";
import { inferDemoRequirement } from "@/lib/coaching/exerciseDemoPolicy";

const PLACEHOLDER_RE = /\b(TODO|TBD|coming soon|lorem ipsum)\b/i;
const INTERNAL_CODE_RE =
  /\b(sacrifice|slotRoleMatch|fuzz|candidateScore|hard_failure|MIXED_HOME_|BAND_|GYM_|DB_)\b/i;

export const containsPlaceholderCopy = (text: string) => PLACEHOLDER_RE.test(text);
export const containsInternalCodeLeak = (text: string) => INTERNAL_CODE_RE.test(text);

const musclePhrase = (exercise: Exercise) => {
  const groups = (exercise.muscleGroups ?? []).slice(0, 3);
  if (!groups.length) return "the muscles this move is meant to train";
  if (groups.length === 1) return `your ${groups[0]}`;
  if (groups.length === 2) return `your ${groups[0]} and ${groups[1]}`;
  return `your ${groups[0]}, ${groups[1]}, and ${groups[2]}`;
};

const purposeFor = (exercise: Exercise) => {
  const pattern = (exercise.pattern ?? exercise.movementPattern?.[0] ?? "strength")
    .replace(/_/g, " ")
    .toLowerCase();
  const category = String(exercise.category);
  if (category === "warmup" || category === "mobility") {
    return `Prepares your body with controlled ${pattern} so the main work feels smoother and safer.`;
  }
  if (category === "cooldown") {
    return `Helps you finish the session with controlled breathing and easy range rather than abrupt stop.`;
  }
  return `Trains a clear ${pattern} pattern so ${musclePhrase(exercise)} get productive work without guessing the setup.`;
};

const equipmentLabel = (equipment: string[]) => {
  const meaningful = equipment.filter((item) => item && item !== "none");
  if (!meaningful.length) return "No equipment — clear floor space.";
  return `Equipment: ${meaningful.join(", ")}.`;
};

const bandSetupSteps = (
  exercise: Exercise,
  req: BandExerciseRequirement | null
): string[] => {
  if (!req) return [];
  const steps: string[] = [];
  if (req.bandType === "miniLoop" || req.bandType === "either") {
    if (req.bandType === "miniLoop") {
      steps.push("Use a mini-loop band sized so tension stays controlled through the full range.");
    } else {
      steps.push("Use a long band or mini-loop that matches this exercise’s listed requirement.");
    }
  } else {
    steps.push("Use a long resistance band with secure handles or ends you can grip.");
  }
  if (req.anchor === "high" || req.anchor === "middle" || req.anchor === "low") {
    const height =
      req.anchor === "high"
        ? "above head height"
        : req.anchor === "middle"
          ? "around chest/shoulder height"
          : "near floor or shin height";
    steps.push(
      `Attach the band to a confirmed fixed anchor at ${height}. Close the door against the pull direction so the anchor cannot slip.`
    );
    steps.push("Step back until the band has light starting tension before the first rep.");
  } else if (req.selfAnchorOk) {
    steps.push(
      "Anchor the band under both feet (or the working foot) on a non-slip surface — do not invent a door anchor."
    );
  }
  return steps;
};

const supportSteps = (exercise: Exercise): string[] => {
  const eq = new Set((exercise.equipment ?? []).map((item) => String(item)));
  const steps: string[] = [];
  if (eq.has("bench")) {
    steps.push("Use a confirmed bench or stable flat support at a height that keeps your feet planted.");
  }
  if (eq.has("pullup_bar")) {
    steps.push("Use a confirmed pull-up bar that is fixed and can support your body weight.");
  }
  if (eq.has("cables") || eq.has("machines")) {
    steps.push("Set the cable or machine to the listed attachment and a starting load you can control.");
  }
  if (eq.has("barbell")) {
    steps.push("Load the barbell evenly and confirm collars/clips before cutting tension.");
  }
  if (eq.has("dumbbells")) {
    steps.push("Choose dumbbells you can control for every rep; keep a clear path to set them down.");
  }
  if (eq.has("kettlebell")) {
    steps.push("Place the kettlebell where you can grip the handle without twisting to reach.");
  }
  return steps;
};

const patternSetup = (exercise: Exercise): string[] => {
  const patterns = new Set(
    [...(exercise.movementPattern ?? []), exercise.pattern ?? ""]
      .filter(Boolean)
      .map((p) => p.toLowerCase())
  );
  const name = exercise.name.toLowerCase();
  const steps: string[] = [];

  if (patterns.has("squat") || name.includes("squat")) {
    steps.push("Stand with feet about shoulder-width, toes slightly out, ribs stacked over pelvis.");
  } else if (patterns.has("hinge") || name.includes("rdl") || name.includes("deadlift")) {
    steps.push("Soft knees, hinge from the hips, and keep a long spine from head to tailbone.");
  } else if (patterns.has("horizontal_push") || name.includes("press") || name.includes("push")) {
    steps.push("Set shoulders down and slightly back; brace lightly before the first press.");
  } else if (patterns.has("horizontal_pull") || patterns.has("vertical_pull") || name.includes("row") || name.includes("pulldown") || name.includes("pull-up") || name.includes("pullup")) {
    steps.push("Start tall through the crown of the head with the shoulder blades free to move.");
  } else if (patterns.has("carry") || name.includes("march") || name.includes("carry")) {
    steps.push("Stand tall with even pressure through both feet before you start moving.");
  } else if (patterns.has("core") || patterns.has("anti-rotation") || name.includes("pallof") || name.includes("plank")) {
    steps.push("Stack ribs over pelvis and brace as if someone is about to nudge your midsection.");
  } else if (
    String(exercise.category) === "warmup" ||
    String(exercise.category) === "mobility"
  ) {
    steps.push("Move into a comfortable starting position with space to breathe and change joint angles slowly.");
  } else {
    steps.push("Set a stable base and stack your torso before you add load or tension.");
  }

  if (name.includes("single") || name.includes("split") || name.includes("one-arm") || name.includes("unilateral")) {
    steps.push("Set the working side first and use a light counterbalance with the free side if needed.");
  }
  if (name.includes("floor")) {
    steps.push("Lie or kneel on a clear floor mat with enough room for elbows and knees.");
  }
  return steps;
};

const executionFor = (exercise: Exercise, centrationDuring?: string[]): string[] => {
  if (centrationDuring?.length) {
    return centrationDuring.slice(0, 5).map((step) => step.replace(/\.$/, "") + ".");
  }
  const patterns = new Set(
    [...(exercise.movementPattern ?? []), exercise.pattern ?? ""]
      .filter(Boolean)
      .map((p) => p.toLowerCase())
  );
  const steps: string[] = [];
  if (exercise.loadType === "timed") {
    steps.push("Move into the working position with control.");
    steps.push("Hold steady breathing — do not hold your breath for the whole set.");
    steps.push("Keep the target muscles working without drifting into the joints.");
    steps.push("Exit the position slowly when the timer ends.");
    return steps;
  }
  if (patterns.has("squat") || exercise.name.toLowerCase().includes("squat")) {
    steps.push("Brace lightly, then sit the hips down and back between the feet.");
    steps.push("Keep knees tracking over mid-foot through a controlled depth you own.");
    steps.push("Drive the floor away to stand without snapping the knees back.");
  } else if (patterns.has("hinge") || /rdl|deadlift|hip thrust|bridge/i.test(exercise.name)) {
    steps.push("Push the hips back while the torso stays long.");
    steps.push("Feel tension build in the posterior chain without rounding the low back.");
    steps.push("Drive the hips forward to finish tall, then return with the same control.");
  } else if (/row|pulldown|pull-up|pullup|face.?pull/i.test(exercise.name)) {
    steps.push("Initiate the pull by driving the elbows, not by shrugging the neck.");
    steps.push("Pause briefly when the upper back is engaged.");
    steps.push("Return to the start without losing rib-stack or letting the shoulders dump forward.");
  } else if (/press|pushup|push-up|fly/i.test(exercise.name)) {
    steps.push("Press or push through a path you can control without flaring the ribs.");
    steps.push("Stop short of painy end-range; own the lockout or top position.");
    steps.push("Lower under control to the start and reset posture before the next rep.");
  } else if (/pallof|anti.?rotat|dead.?bug|bird.?dog|plank/i.test(exercise.name)) {
    steps.push("Create tension against the challenge without twisting or sagging.");
    steps.push("Breathe steadily while keeping the pelvis and ribs quiet.");
    steps.push("Reset if the low back or neck takes over the work.");
  } else {
    steps.push("Begin the movement with the intended working muscles, not momentum.");
    steps.push("Move through a controlled range and pause briefly where the work is clearest.");
    steps.push("Return to the start under control and reset posture before the next rep.");
  }
  return steps;
};

const expectedFeelFor = (exercise: Exercise): string[] => {
  const muscles = musclePhrase(exercise);
  return [
    `You should mainly feel ${muscles} doing the work.`,
    "Effort should feel muscular and controlled, not sharp in a joint.",
  ];
};

const complexityFor = (
  exercise: Exercise,
  req: BandExerciseRequirement | null
): ExerciseCoachingContent["contentComplexity"] => {
  const name = exercise.name.toLowerCase();
  const unusual =
    Boolean(req && req.anchor !== "none") ||
    /pallof|turkish|muscle.?up|handstand|olympic|snatch|clean/i.test(name) ||
    (exercise.difficulty ?? 1) >= 4;
  if (unusual) return "complex";
  if (
    (exercise.difficulty ?? 1) >= 3 ||
    (exercise.equipment ?? []).some(
      (e) => e === "bands" || e === "cables" || e === "machines"
    )
  ) {
    return "moderate";
  }
  return "simple";
};

const defaultStopSignals = (exercise: Exercise): string[] => {
  const stops = [
    "Sharp or increasing joint pain",
    "Numbness, tingling, or sudden loss of control",
    "Dizziness or feeling unsafe to continue",
  ];
  const eq = new Set(exercise.equipment ?? []);
  if (eq.has("bands")) {
    stops.push("Anchor movement, door opening, or band slipping toward you");
  }
  if (exercise.contraindications?.length) {
    // Keep stop signals execution-focused; do not dump clinical contraindications wholesale.
    stops.push("Pain that makes you change form just to finish the set");
  }
  return stops.slice(0, 5);
};

const correctionFor = (mistake: string): string => {
  const m = mistake.toLowerCase();
  if (m.includes("round") || m.includes("flexion")) {
    return "Shorten the range, brace lightly, and keep the spine long before adding load.";
  }
  if (m.includes("shrug") || m.includes("neck")) {
    return "Drop the shoulders away from the ears and lead with the elbows or hips instead.";
  }
  if (m.includes("knee") || m.includes("cave")) {
    return "Push the floor apart and keep the knee tracking over the mid-foot.";
  }
  if (m.includes("rush") || m.includes("momentum") || m.includes("bounce")) {
    return "Slow the lowering phase and pause briefly when the working muscles are loaded.";
  }
  if (m.includes("rib") || m.includes("arch") || m.includes("flare")) {
    return "Exhale gently to stack ribs over pelvis, then move from that braced position.";
  }
  return "Reduce the demand one notch, reset your setup, and own a smaller clean range.";
};

export const synthesizeExerciseCoaching = (
  exercise: Exercise
): ExerciseCoachingContent => {
  const centration = getCentrationCues(exercise.id);
  const bandReq = resolveBandExerciseRequirement({
    exerciseId: exercise.id,
    name: exercise.name,
    equipment: exercise.equipment,
    variantKey: exercise.variantKey,
    cues: exercise.cues,
  });
  const hasBand = (exercise.equipment ?? []).includes("bands") || Boolean(bandReq);
  const equipmentSetup = [equipmentLabel(exercise.equipment ?? []), ...supportSteps(exercise)];
  const setupSteps = [
    ...bandSetupSteps(exercise, hasBand ? bandReq : null),
    ...supportSteps(exercise),
    ...(centration?.setup?.length
      ? centration.setup.slice(0, 3)
      : patternSetup(exercise)),
  ]
    .map((step) => step.trim())
    .filter(Boolean)
    .slice(0, 4);

  const primaryCue =
    (centration?.during?.[0] ?? exercise.cues?.[0] ?? "Move with control and keep posture stacked.")
      .trim()
      .replace(/\.$/, "");
  const commonMistake = (
    exercise.mistakes?.[0] ??
    centration?.watchFor?.[0] ??
    "Rushing the reps after control drops."
  ).trim();
  const contentComplexity = complexityFor(exercise, hasBand ? bandReq : null);
  const unusualSetup =
    Boolean(bandReq && bandReq.anchor !== "none") ||
    /pallof|assisted|iso.?hold|single-leg|turkish/i.test(exercise.name);

  const anchorSetup =
    bandReq && bandReq.anchor !== "none"
      ? {
          required: true as const,
          height: bandReq.anchor as "high" | "middle" | "low",
          safetyNote:
            "Keep the door closed against the pull direction; stop if the anchor moves.",
        }
      : bandReq
        ? { required: false as const }
        : undefined;

  // progressionOf = easier predecessor; regressionOf = harder successor (catalog ladder).
  const regressionId = exercise.progressionOf;
  const progressionId = exercise.regressionOf;

  return {
    exerciseId: exercise.id,
    shortPurpose: purposeFor(exercise),
    setupSteps: setupSteps.length
      ? setupSteps
      : ["Set a stable base with clear space around you before you start."],
    executionSteps: executionFor(exercise, centration?.during),
    primaryCue: primaryCue.length > 90 ? `${primaryCue.slice(0, 87)}…` : primaryCue,
    secondaryCues: (exercise.cues ?? []).slice(1, 3),
    expectedFeel: expectedFeelFor(exercise),
    avoidFeeling: [
      "Sharp joint pain",
      "Pinching that worsens as you continue",
      "Neck or low-back takeover when the target muscles should be working",
    ],
    commonMistake,
    correction: correctionFor(commonMistake),
    stopSignals: defaultStopSignals(exercise),
    regressionId,
    progressionId,
    equipmentSetup,
    anchorSetup,
    supportSetup: supportSteps(exercise),
    demoRequirement: inferDemoRequirement({
      contentComplexity,
      hasAnchor: Boolean(bandReq && bandReq.anchor !== "none"),
      unusualSetup,
    }),
    contentComplexity,
  };
};

export const mergeCoachingContent = (
  base: ExerciseCoachingContent,
  override: Partial<ExerciseCoachingContent>
): ExerciseCoachingContent => ({
  ...base,
  ...override,
  exerciseId: base.exerciseId,
  setupSteps: override.setupSteps ?? base.setupSteps,
  executionSteps: override.executionSteps ?? base.executionSteps,
  expectedFeel: override.expectedFeel ?? base.expectedFeel,
  avoidFeeling: override.avoidFeeling ?? base.avoidFeeling,
  stopSignals: override.stopSignals ?? base.stopSignals,
  secondaryCues: override.secondaryCues ?? base.secondaryCues,
  equipmentSetup: override.equipmentSetup ?? base.equipmentSetup,
  supportSetup: override.supportSetup ?? base.supportSetup,
  anchorSetup: override.anchorSetup ?? base.anchorSetup,
});
