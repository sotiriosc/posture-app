/**
 * Curated coaching overrides for complex / non-obvious release-critical moves.
 * Unlisted fields fall back to synthesizeExerciseCoaching.
 */

import type { ExerciseCoachingContent } from "@/lib/coaching/exerciseCoachingContract";

export const EXERCISE_COACHING_OVERRIDES: Record<
  string,
  Partial<ExerciseCoachingContent>
> = {
  "band-lat-pulldown": {
    shortPurpose:
      "Gives you a true vertical pull at home when a high band anchor is confirmed.",
    setupSteps: [
      "Attach a long band to a confirmed high fixed anchor above head height.",
      "Close the door against the pull direction so the anchor cannot slip toward you.",
      "Kneel or stand under the anchor and grip the band with arms long overhead.",
      "Brace lightly with ribs stacked before the first pull.",
    ],
    executionSteps: [
      "Drive the elbows down toward your pockets without shrugging.",
      "Pause when the upper back is engaged and the band is near the upper chest/collarbone line.",
      "Return overhead under control without letting the ribs flare.",
    ],
    primaryCue: "Drive the elbows toward your pockets.",
    expectedFeel: [
      "You should mainly feel your lats and upper back working.",
      "The neck should stay quiet — not the primary puller.",
    ],
    commonMistake: "Shrugging and yanking with the arms instead of the back.",
    correction: "Think elbows down first; keep shoulders away from the ears.",
    demoRequirement: "required",
    contentComplexity: "complex",
    anchorSetup: {
      required: true,
      height: "high",
      safetyNote: "Stop if the door/anchor moves. Never pull against an unsecured door.",
    },
  },
  "pallof-press": {
    shortPurpose: "Trains anti-rotation so your trunk stays quiet under side tension.",
    setupSteps: [
      "Attach a long band or cable to a confirmed middle-height fixed anchor.",
      "Stand side-on to the anchor with the handle held at the sternum.",
      "Step out until there is meaningful side tension before you press.",
    ],
    executionSteps: [
      "Press the hands straight forward without rotating the ribs or hips.",
      "Pause briefly at full reach while breathing steadily.",
      "Return the hands to the chest under control and reset.",
    ],
    primaryCue: "Keep the ribs stacked while the arms travel.",
    demoRequirement: "required",
    contentComplexity: "complex",
    anchorSetup: {
      required: true,
      height: "middle",
      safetyNote: "Close the door against the pull; stop if the anchor shifts.",
    },
  },
  "goblet-squat": {
    shortPurpose: "Builds a clear squat pattern with a front-loaded dumbbell for posture support.",
    setupSteps: [
      "Hold one dumbbell vertically at the chest with elbows under the weight.",
      "Stand with feet about shoulder-width and toes slightly out.",
      "Brace lightly with ribs stacked over the pelvis.",
    ],
    executionSteps: [
      "Sit the hips down and back between the feet.",
      "Keep the elbows inside the knees at the bottom you own.",
      "Drive the floor away to stand tall without snapping the knees.",
    ],
    primaryCue: "Sit between your hips.",
    demoRequirement: "recommended",
    contentComplexity: "moderate",
  },
  "db-rdl": {
    shortPurpose: "Trains a hip hinge so the posterior chain loads without rounding the back.",
    setupSteps: [
      "Hold dumbbells in front of the thighs with a soft knee bend.",
      "Set shoulders down and keep a long spine from head to tailbone.",
    ],
    executionSteps: [
      "Push the hips back as the dumbbells travel close to the legs.",
      "Stop when you feel clear hamstring/glute tension without losing the long spine.",
      "Drive the hips forward to stand tall, then repeat with the same control.",
    ],
    primaryCue: "Push the hips back, not the knees forward.",
    demoRequirement: "recommended",
    contentComplexity: "moderate",
  },
  "pushup": {
    shortPurpose: "Trains a horizontal press using bodyweight with a clear plank body line.",
    setupSteps: [
      "Place hands under the shoulders on a clear floor.",
      "Step the feet back into a straight line from head to heels.",
      "Brace lightly so the hips do not sag or pike.",
    ],
    executionSteps: [
      "Lower the chest toward the floor with elbows about 30–45° from the body.",
      "Pause briefly above the floor without collapsing the shoulders.",
      "Press the floor away to full arm length while keeping ribs stacked.",
    ],
    primaryCue: "Push the floor away.",
    demoRequirement: "textSufficient",
    contentComplexity: "simple",
  },
  "split-stance-row": {
    shortPurpose: "Trains a horizontal pull with a long band under the front foot when no door anchor is available.",
    setupSteps: [
      "Anchor a long band under the front foot on a non-slip surface.",
      "Take a split stance and hinge slightly with a long spine.",
      "Grip the band with the working arm long toward the front foot.",
    ],
    executionSteps: [
      "Row the elbow toward the hip pocket without twisting the torso.",
      "Pause when the shoulder blade is set.",
      "Return under control and reset the hinge before the next rep.",
    ],
    primaryCue: "Drive the elbow toward your hip pocket.",
    demoRequirement: "recommended",
    contentComplexity: "moderate",
  },
  "heels-elevated-squat": {
    shortPurpose: "Lets you squat with a more upright torso when ankle mobility is limited.",
    setupSteps: [
      "Place small plates or a stable wedge under the heels.",
      "Stand tall with feet about shoulder-width.",
      "Brace lightly before you descend.",
    ],
    executionSteps: [
      "Sit straight down between the feet while heels stay supported.",
      "Keep knees tracking over mid-foot.",
      "Stand by driving through the whole foot without bouncing out of the bottom.",
    ],
    primaryCue: "Sit straight down between your feet.",
    demoRequirement: "recommended",
    contentComplexity: "moderate",
  },
  "bodyweight-hip-hinge": {
    shortPurpose: "Teaches the hinge pattern before adding load.",
    setupSteps: [
      "Stand with soft knees and hands resting lightly on the thighs or hips.",
      "Stack ribs over pelvis before you move.",
    ],
    executionSteps: [
      "Push the hips back while the torso stays long.",
      "Feel tension in the hamstrings/glutes.",
      "Drive the hips forward to stand tall without hyperextending the low back.",
    ],
    primaryCue: "Hips back, spine long.",
    demoRequirement: "textSufficient",
    contentComplexity: "simple",
  },
};
