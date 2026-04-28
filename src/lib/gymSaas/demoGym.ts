export type GymEquipmentItem = {
  name: string;
  category: "strength" | "cardio" | "mobility" | "free-weight" | "machine";
  quantity: string;
  tags: string[];
};

export type GymDemoProgramDay = {
  day: string;
  focus: string;
  duration: string;
  equipment: string[];
  blocks: string[];
};

export const demoGym = {
  name: "Fitness Connect Richmond Hill",
  location: "Richmond Hill, Ontario",
  positioning:
    "A branded training system that turns the facility floor into guided, equipment-aware programs for every member.",
  primaryPitch:
    "Give every member a clear plan built around the equipment inside your gym.",
  memberPromise:
    "Less guessing. Better movement. More confidence using the full facility.",
  ownerPromise:
    "Increase member confidence, improve retention, and create a stronger bridge toward honest personal training support.",
  trainerPromise:
    "Keep coaching language consistent, give trainers a shared system, and help members understand why personal guidance matters.",
  equipment: [
    {
      name: "Dumbbells",
      category: "free-weight",
      quantity: "full rack",
      tags: ["press", "row", "lunge", "raise", "curl"],
    },
    {
      name: "Cable stations",
      category: "machine",
      quantity: "multiple stations",
      tags: ["row", "pulldown", "press", "rotation", "anti-rotation"],
    },
    {
      name: "Treadmills and bikes",
      category: "cardio",
      quantity: "cardio zone",
      tags: ["warm-up", "conditioning", "zone-2"],
    },
    {
      name: "Selectorized machines",
      category: "machine",
      quantity: "premium equipment area",
      tags: ["guided strength", "beginner-friendly", "controlled loading"],
    },
    {
      name: "Benches and racks",
      category: "strength",
      quantity: "strength zone",
      tags: ["squat", "hinge", "press", "progression"],
    },
    {
      name: "Bands and mobility tools",
      category: "mobility",
      quantity: "coaching station",
      tags: ["activation", "warm-up", "corrective", "regression"],
    },
  ] satisfies GymEquipmentItem[],
  sampleProgram: [
    {
      day: "Day 1",
      focus: "Upper body foundation",
      duration: "45 min",
      equipment: ["cables", "dumbbells", "bench"],
      blocks: [
        "Rib and shoulder activation primer",
        "Cable row + dumbbell press pairing",
        "Lateral raise and pulldown support work",
        "Short posture reset finisher",
      ],
    },
    {
      day: "Day 2",
      focus: "Lower body alignment",
      duration: "45 min",
      equipment: ["leg press", "dumbbells", "mobility tools"],
      blocks: [
        "Breathing and hip control prep",
        "Leg press or goblet squat main pattern",
        "Supported hinge and split-stance work",
        "Calf, core, and decompression close",
      ],
    },
    {
      day: "Day 3",
      focus: "Full-body confidence",
      duration: "40 min",
      equipment: ["machines", "cables", "cardio zone"],
      blocks: [
        "Machine-based full-body circuit",
        "Cable anti-rotation and row work",
        "Controlled conditioning block",
        "Recovery education and next-session notes",
      ],
    },
  ] satisfies GymDemoProgramDay[],
};

export const gymSaasDemoCopy = {
  headline: "A training app built around this gym’s actual equipment.",
  subheadline:
    "Praxis can become a white-label member experience for local gyms: onboarding, equipment-aware programs, trainer education, and honest paths into personal training.",
  ctaPrimary: "Preview member experience",
  ctaSecondary: "Show gym owner value",
};
