import type { ProgramRoutineItem } from "@/lib/types";

export type TemplateLane = "push" | "verticalPush" | "pull" | "squat" | "hinge";

export type DaySlotCategory =
  | "RAMP_UP"
  | "HIP_WARMUP"
  | "GLUTE_WARMUP"
  | "UPPER_WARMUP"
  | "CORE_WARMUP"
  | "CORRECTIVE"
  | "SECONDARY_PUSH"
  | "SECONDARY_PULL"
  | "MAIN_SHOULDER_PRESS"
  | "LATERAL"
  | "REAR_DELT"
  | "MAIN_PUSH"
  | "MAIN_VERTICAL_PUSH"
  | "MAIN_PULL"
  | "MAIN_SQUAT"
  | "MAIN_HINGE"
  | "MAIN_EXTRA_PUSH"
  | "MAIN_EXTRA_PULL"
  | "MAIN_EXTRA_1"
  | "MAIN_EXTRA_2"
  | "ARM_1"
  | "ARM_2"
  | "ARM_ROTATION"
  | "CORE"
  | "CALF"
  | "QUAD_ISO"
  | "HAM_ISO"
  | "EXTRA_ISO"
  | "STRUCTURAL_CARRY";

export type DaySlotResolver =
  | "WARMUP_RAMP"
  | "WARMUP_HIP"
  | "WARMUP_GLUTE"
  | "WARMUP_UPPER"
  | "WARMUP_CORE"
  | "SECONDARY_PUSH"
  | "SECONDARY_PULL"
  | "LATERAL"
  | "REAR_DELT"
  | "MAIN_PUSH"
  | "MAIN_VERTICAL_PUSH"
  | "MAIN_PULL"
  | "MAIN_SQUAT"
  | "MAIN_HINGE"
  | "MAIN_EXTRA_PUSH"
  | "MAIN_EXTRA_PULL"
  | "MAIN_EXTRA_SQUAT"
  | "MAIN_EXTRA_HINGE"
  | "MAIN_EXTRA_VERTICAL_PUSH"
  | "ARM_BICEPS"
  | "ARM_TRICEPS"
  | "ARM_ROTATION"
  | "CORE_ACCESSORY"
  | "CALF_ISOLATION"
  | "QUAD_ISOLATION"
  | "HAM_ISOLATION"
  | "EXTRA_ISOLATION"
  | "STRUCTURAL_CARRY";

export type TemplateSlot = {
  id: string;
  section: ProgramRoutineItem["section"];
  category: DaySlotCategory;
  resolver: DaySlotResolver;
  required: boolean;
  minExperience?: "intermediate" | "advanced";
};

export type DayTemplate = {
  title: string;
  focusTags: string[];
  lanes: TemplateLane[];
  warmupProfile: "upper" | "leg" | "core";
  allowCorrective: boolean;
  slots: TemplateSlot[];
};

const makeUpperWarmupSlots = (): TemplateSlot[] => [
  {
    id: "warmup-ramp",
    section: "warmup",
    category: "RAMP_UP",
    resolver: "WARMUP_RAMP",
    required: true,
  },
  {
    id: "warmup-upper",
    section: "warmup",
    category: "UPPER_WARMUP",
    resolver: "WARMUP_UPPER",
    required: true,
  },
  {
    id: "warmup-core",
    section: "warmup",
    category: "CORE_WARMUP",
    resolver: "WARMUP_CORE",
    required: true,
  },
];

const makeLegWarmupSlots = (): TemplateSlot[] => [
  {
    id: "warmup-ramp",
    section: "warmup",
    category: "RAMP_UP",
    resolver: "WARMUP_RAMP",
    required: true,
  },
  {
    id: "warmup-hip",
    section: "warmup",
    category: "HIP_WARMUP",
    resolver: "WARMUP_HIP",
    required: true,
  },
  {
    id: "warmup-glute",
    section: "warmup",
    category: "GLUTE_WARMUP",
    resolver: "WARMUP_GLUTE",
    required: true,
  },
];

const makeCarrySlot = (): TemplateSlot => ({
  id: "structural-carry",
  section: "accessory",
  category: "STRUCTURAL_CARRY",
  resolver: "STRUCTURAL_CARRY",
  required: false,
});

const makeArmSlots = (): TemplateSlot[] => [
  {
    id: "arm-1",
    section: "accessory",
    category: "ARM_1",
    resolver: "ARM_BICEPS",
    required: true,
  },
  {
    id: "arm-2",
    section: "accessory",
    category: "ARM_2",
    resolver: "ARM_TRICEPS",
    required: true,
  },
  {
    id: "arm-rotation",
    section: "accessory",
    category: "ARM_ROTATION",
    resolver: "ARM_ROTATION",
    required: true,
  },
];

const makeLegIsolationSlots = (): TemplateSlot[] => [
  {
    id: "quad-isolation",
    section: "accessory",
    category: "QUAD_ISO",
    resolver: "QUAD_ISOLATION",
    required: true,
  },
  {
    id: "ham-isolation",
    section: "accessory",
    category: "HAM_ISO",
    resolver: "HAM_ISOLATION",
    required: true,
  },
  {
    id: "core-accessory",
    section: "accessory",
    category: "CORE",
    resolver: "CORE_ACCESSORY",
    required: true,
  },
];

const makeCalfAccessorySlot = (): TemplateSlot => ({
  id: "calf-isolation",
  section: "accessory",
  category: "CALF",
  resolver: "CALF_ISOLATION",
  required: true,
});

const makeCoreAccessorySlot = (): TemplateSlot => ({
  id: "core-accessory",
  section: "accessory",
  category: "CORE",
  resolver: "CORE_ACCESSORY",
  required: true,
});

export const DAY_TEMPLATES_BY_SPLIT: Record<3 | 4 | 5, DayTemplate[]> = {
  3: [
    {
      title: "Chest+Back",
      focusTags: ["chest", "back", "push", "pull"],
      lanes: ["push", "pull"],
      warmupProfile: "upper",
      allowCorrective: true,
      slots: [
        ...makeUpperWarmupSlots(),
        {
          id: "main-push",
          section: "main",
          category: "MAIN_PUSH",
          resolver: "MAIN_PUSH",
          required: true,
        },
        {
          id: "main-pull",
          section: "main",
          category: "MAIN_PULL",
          resolver: "MAIN_PULL",
          required: true,
        },
        {
          id: "main-extra-push",
          section: "main",
          category: "MAIN_EXTRA_PUSH",
          resolver: "MAIN_EXTRA_PUSH",
          required: true,
        },
        {
          id: "main-extra-pull",
          section: "main",
          category: "MAIN_EXTRA_PULL",
          resolver: "MAIN_EXTRA_PULL",
          required: true,
        },
        makeCarrySlot(),
      ],
    },
    {
      title: "Shoulders+Arms",
      focusTags: ["shoulders", "arms", "upper"],
      lanes: ["verticalPush", "verticalPush"],
      warmupProfile: "upper",
      allowCorrective: true,
      slots: [
        ...makeUpperWarmupSlots(),
        {
          id: "main-shoulder-press",
          section: "main",
          category: "MAIN_SHOULDER_PRESS",
          resolver: "MAIN_VERTICAL_PUSH",
          required: true,
        },
        {
          id: "lateral",
          section: "accessory",
          category: "LATERAL",
          resolver: "LATERAL",
          required: true,
        },
        {
          id: "rear-delt",
          section: "accessory",
          category: "REAR_DELT",
          resolver: "REAR_DELT",
          required: true,
        },
        ...makeArmSlots(),
      ],
    },
    {
      title: "Legs+Abs",
      focusTags: ["legs", "quads", "hamstrings", "core"],
      lanes: ["squat", "hinge"],
      warmupProfile: "leg",
      allowCorrective: true,
      slots: [
        ...makeLegWarmupSlots(),
        {
          id: "main-squat",
          section: "main",
          category: "MAIN_SQUAT",
          resolver: "MAIN_SQUAT",
          required: true,
        },
        {
          id: "main-hinge",
          section: "main",
          category: "MAIN_HINGE",
          resolver: "MAIN_HINGE",
          required: true,
        },
        {
          id: "quad-isolation",
          section: "accessory",
          category: "QUAD_ISO",
          resolver: "QUAD_ISOLATION",
          required: true,
        },
        {
          id: "ham-isolation",
          section: "accessory",
          category: "HAM_ISO",
          resolver: "HAM_ISOLATION",
          required: true,
        },
        makeCalfAccessorySlot(),
        {
          id: "core-accessory",
          section: "accessory",
          category: "CORE",
          resolver: "CORE_ACCESSORY",
          required: true,
        },
      ],
    },
  ],
  4: [
    {
      title: "Push",
      focusTags: ["push", "chest", "shoulders", "triceps"],
      lanes: ["push", "verticalPush"],
      warmupProfile: "upper",
      allowCorrective: true,
      slots: [
        ...makeUpperWarmupSlots(),
        {
          id: "main-push",
          section: "main",
          category: "MAIN_PUSH",
          resolver: "MAIN_PUSH",
          required: true,
        },
        {
          id: "main-vertical-push",
          section: "main",
          category: "MAIN_VERTICAL_PUSH",
          resolver: "MAIN_VERTICAL_PUSH",
          required: true,
        },
        {
          id: "main-extra-1",
          section: "main",
          category: "MAIN_EXTRA_1",
          resolver: "MAIN_EXTRA_PUSH",
          required: false,
          minExperience: "intermediate",
        },
        {
          id: "main-extra-2",
          section: "main",
          category: "MAIN_EXTRA_2",
          resolver: "MAIN_EXTRA_VERTICAL_PUSH",
          required: false,
          minExperience: "advanced",
        },
        {
          id: "arm-2",
          section: "accessory",
          category: "ARM_2",
          resolver: "ARM_TRICEPS",
          required: true,
        },
        makeCoreAccessorySlot(),
      ],
    },
    {
      title: "Pull",
      focusTags: ["pull", "back", "biceps", "posture"],
      lanes: ["pull", "pull"],
      warmupProfile: "upper",
      allowCorrective: true,
      slots: [
        ...makeUpperWarmupSlots(),
        {
          id: "main-pull-1",
          section: "main",
          category: "MAIN_PULL",
          resolver: "MAIN_PULL",
          required: true,
        },
        {
          id: "main-pull-2",
          section: "main",
          category: "MAIN_PULL",
          resolver: "MAIN_PULL",
          required: true,
        },
        {
          id: "main-extra-1",
          section: "main",
          category: "MAIN_EXTRA_1",
          resolver: "MAIN_EXTRA_PULL",
          required: false,
          minExperience: "intermediate",
        },
        {
          id: "main-extra-2",
          section: "main",
          category: "MAIN_EXTRA_2",
          resolver: "MAIN_EXTRA_PULL",
          required: false,
          minExperience: "advanced",
        },
        {
          id: "arm-1",
          section: "accessory",
          category: "ARM_1",
          resolver: "ARM_BICEPS",
          required: true,
        },
        makeCoreAccessorySlot(),
        makeCarrySlot(),
      ],
    },
    {
      title: "Legs",
      focusTags: ["legs", "quads", "hamstrings", "core"],
      lanes: ["squat", "hinge"],
      warmupProfile: "leg",
      allowCorrective: true,
      slots: [
        ...makeLegWarmupSlots(),
        {
          id: "main-squat",
          section: "main",
          category: "MAIN_SQUAT",
          resolver: "MAIN_SQUAT",
          required: true,
        },
        {
          id: "main-hinge",
          section: "main",
          category: "MAIN_HINGE",
          resolver: "MAIN_HINGE",
          required: true,
        },
        {
          id: "main-extra-1",
          section: "main",
          category: "MAIN_EXTRA_1",
          resolver: "MAIN_EXTRA_SQUAT",
          required: false,
          minExperience: "intermediate",
        },
        {
          id: "main-extra-2",
          section: "main",
          category: "MAIN_EXTRA_2",
          resolver: "MAIN_EXTRA_HINGE",
          required: false,
          minExperience: "advanced",
        },
        ...makeLegIsolationSlots(),
      ],
    },
    {
      title: "Arms+Abs",
      focusTags: ["arms", "core", "abs", "posture"],
      lanes: ["pull", "verticalPush"],
      warmupProfile: "core",
      allowCorrective: true,
      slots: [
        ...makeUpperWarmupSlots(),
        {
          id: "main-pull",
          section: "main",
          category: "MAIN_PULL",
          resolver: "MAIN_PULL",
          required: true,
        },
        {
          id: "main-vertical-push",
          section: "main",
          category: "MAIN_VERTICAL_PUSH",
          resolver: "MAIN_VERTICAL_PUSH",
          required: true,
        },
        {
          id: "main-extra-1",
          section: "main",
          category: "MAIN_EXTRA_1",
          resolver: "MAIN_EXTRA_PULL",
          required: false,
          minExperience: "intermediate",
        },
        {
          id: "main-extra-2",
          section: "main",
          category: "MAIN_EXTRA_2",
          resolver: "MAIN_EXTRA_VERTICAL_PUSH",
          required: false,
          minExperience: "advanced",
        },
        ...makeArmSlots(),
        makeCoreAccessorySlot(),
        makeCarrySlot(),
      ],
    },
  ],
  5: [
    {
      title: "Push",
      focusTags: ["push", "chest", "shoulders", "triceps"],
      lanes: ["push", "verticalPush"],
      warmupProfile: "upper",
      allowCorrective: true,
      slots: [
        ...makeUpperWarmupSlots(),
        {
          id: "main-push",
          section: "main",
          category: "MAIN_PUSH",
          resolver: "MAIN_PUSH",
          required: true,
        },
        {
          id: "main-vertical-push",
          section: "main",
          category: "MAIN_VERTICAL_PUSH",
          resolver: "MAIN_VERTICAL_PUSH",
          required: true,
        },
        {
          id: "main-extra-1",
          section: "main",
          category: "MAIN_EXTRA_1",
          resolver: "MAIN_EXTRA_PUSH",
          required: false,
          minExperience: "intermediate",
        },
        {
          id: "main-extra-2",
          section: "main",
          category: "MAIN_EXTRA_2",
          resolver: "MAIN_EXTRA_VERTICAL_PUSH",
          required: false,
          minExperience: "advanced",
        },
        {
          id: "arm-2",
          section: "accessory",
          category: "ARM_2",
          resolver: "ARM_TRICEPS",
          required: true,
        },
      ],
    },
    {
      title: "Pull",
      focusTags: ["pull", "back", "biceps", "posture"],
      lanes: ["pull", "pull"],
      warmupProfile: "upper",
      allowCorrective: true,
      slots: [
        ...makeUpperWarmupSlots(),
        {
          id: "main-pull-1",
          section: "main",
          category: "MAIN_PULL",
          resolver: "MAIN_PULL",
          required: true,
        },
        {
          id: "main-pull-2",
          section: "main",
          category: "MAIN_PULL",
          resolver: "MAIN_PULL",
          required: true,
        },
        {
          id: "main-extra-1",
          section: "main",
          category: "MAIN_EXTRA_1",
          resolver: "MAIN_EXTRA_PULL",
          required: false,
          minExperience: "intermediate",
        },
        {
          id: "main-extra-2",
          section: "main",
          category: "MAIN_EXTRA_2",
          resolver: "MAIN_EXTRA_PULL",
          required: false,
          minExperience: "advanced",
        },
        {
          id: "arm-1",
          section: "accessory",
          category: "ARM_1",
          resolver: "ARM_BICEPS",
          required: true,
        },
        makeCoreAccessorySlot(),
        makeCarrySlot(),
      ],
    },
    {
      title: "Legs Posterior",
      focusTags: ["legs", "posterior", "hamstrings", "glutes"],
      lanes: ["hinge", "squat"],
      warmupProfile: "leg",
      allowCorrective: true,
      slots: [
        ...makeLegWarmupSlots(),
        {
          id: "main-hinge",
          section: "main",
          category: "MAIN_HINGE",
          resolver: "MAIN_HINGE",
          required: true,
        },
        {
          id: "main-squat",
          section: "main",
          category: "MAIN_SQUAT",
          resolver: "MAIN_SQUAT",
          required: true,
        },
        {
          id: "main-extra-1",
          section: "main",
          category: "MAIN_EXTRA_1",
          resolver: "MAIN_EXTRA_HINGE",
          required: false,
          minExperience: "intermediate",
        },
        {
          id: "main-extra-2",
          section: "main",
          category: "MAIN_EXTRA_2",
          resolver: "MAIN_EXTRA_SQUAT",
          required: false,
          minExperience: "advanced",
        },
        ...makeLegIsolationSlots(),
      ],
    },
    {
      title: "Arms+Abs",
      focusTags: ["arms", "core", "abs", "posture"],
      lanes: ["pull", "verticalPush"],
      warmupProfile: "core",
      allowCorrective: true,
      slots: [
        ...makeUpperWarmupSlots(),
        {
          id: "main-pull",
          section: "main",
          category: "MAIN_PULL",
          resolver: "MAIN_PULL",
          required: true,
        },
        {
          id: "main-vertical-push",
          section: "main",
          category: "MAIN_VERTICAL_PUSH",
          resolver: "MAIN_VERTICAL_PUSH",
          required: true,
        },
        {
          id: "main-extra-1",
          section: "main",
          category: "MAIN_EXTRA_1",
          resolver: "MAIN_EXTRA_PULL",
          required: false,
          minExperience: "intermediate",
        },
        {
          id: "main-extra-2",
          section: "main",
          category: "MAIN_EXTRA_2",
          resolver: "MAIN_EXTRA_VERTICAL_PUSH",
          required: false,
          minExperience: "advanced",
        },
        ...makeArmSlots(),
        makeCoreAccessorySlot(),
        makeCarrySlot(),
      ],
    },
    {
      title: "Legs Quad",
      focusTags: ["legs", "quads", "knee", "core"],
      lanes: ["squat", "hinge"],
      warmupProfile: "leg",
      allowCorrective: true,
      slots: [
        ...makeLegWarmupSlots(),
        {
          id: "main-squat",
          section: "main",
          category: "MAIN_SQUAT",
          resolver: "MAIN_SQUAT",
          required: true,
        },
        {
          id: "main-hinge",
          section: "main",
          category: "MAIN_HINGE",
          resolver: "MAIN_HINGE",
          required: true,
        },
        {
          id: "main-extra-1",
          section: "main",
          category: "MAIN_EXTRA_1",
          resolver: "MAIN_EXTRA_SQUAT",
          required: false,
          minExperience: "intermediate",
        },
        {
          id: "main-extra-2",
          section: "main",
          category: "MAIN_EXTRA_2",
          resolver: "MAIN_EXTRA_HINGE",
          required: false,
          minExperience: "advanced",
        },
        ...makeLegIsolationSlots(),
      ],
    },
  ],
};

export const getDayTemplates = (daysPerWeek: 3 | 4 | 5) => DAY_TEMPLATES_BY_SPLIT[daysPerWeek];
