import type { Equipment } from "@/lib/equipment";
import type { Exercise } from "@/lib/exercises";

export const V3_MOVEMENT_FAMILIES = [
  "horiz_push",
  "vert_push",
  "horiz_pull",
  "vert_pull",
  "squat",
  "hinge",
  "anti_ext",
  "anti_rot",
  "core",
] as const;

export type V3MovementFamily = (typeof V3_MOVEMENT_FAMILIES)[number];

export const V3_SLOT_ROLES = [
  "main",
  "accessory",
  "core",
  "prep",
  "finisher",
] as const;

export type V3SlotRole = (typeof V3_SLOT_ROLES)[number];

export const V3_EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type V3ExperienceLevel = (typeof V3_EXPERIENCE_LEVELS)[number];

export type V3SupportProfile =
  | "machine"
  | "cable"
  | "supported"
  | "bodyweight"
  | "free";

export type V3PrototypeExercise = {
  id: string;
  name: string;
  sourceExerciseId: string;
  category: Exercise["category"];
  pattern?: string;
  familyKey: string;
  variantKey: string;
  families: V3MovementFamily[];
  primaryFamily: V3MovementFamily;
  roles: V3SlotRole[];
  supportProfile: V3SupportProfile;
  complexity: number;
  experienceMin: V3ExperienceLevel;
  equipment: Equipment[];
  loadType: Exercise["loadType"];
  tags: string[];
  rawExercise: Exercise;
};

export type V3CapabilityProfile = {
  availableEquipment: Equipment[];
  blockedFamilies?: V3MovementFamily[];
  avoidExerciseIds?: string[];
  avoidTags?: string[];
  allowOverheadLoading?: boolean;
  allowUnsupportedHinge?: boolean;
};

export type V3DaySlot = {
  id: string;
  label: string;
  role: V3SlotRole;
  family: V3MovementFamily;
  templateId: string;
  order: number;
  required: boolean;
};

export type V3ScheduleDay = {
  id: string;
  weekIndex: number;
  dayIndex: number;
  sessionIndex: number;
  templateId: string;
  title: string;
  slots: V3DaySlot[];
};

export type V3ScheduleBlock = {
  seed: string;
  daysPerWeek: number;
  weeks: number;
  days: V3ScheduleDay[];
};

export type V3RecentPick = {
  exerciseId: string;
  family: V3MovementFamily;
  slotId?: string;
  weekIndex?: number;
  dayIndex?: number;
  sessionIndex?: number;
};

export type V3CandidateScoreBreakdown = {
  eligibilityScore: number;
  experienceBias: number;
  supportBias: number;
  difficultyBias: number;
  uniquenessScore: number;
  capabilityBias: number;
  tieBreaker: number;
  total: number;
  reasons: string[];
};

export type V3RankedCandidate = {
  exercise: V3PrototypeExercise;
  score: V3CandidateScoreBreakdown;
};

export type V3PickedSlot = {
  slot: V3DaySlot;
  exercise: V3PrototypeExercise | null;
  selectedScore: V3CandidateScoreBreakdown | null;
  rankedCandidates: V3RankedCandidate[];
};

export type V3GeneratedDay = {
  scheduleDay: V3ScheduleDay;
  picks: V3PickedSlot[];
};

export type V3FamilyCoverageEntry = {
  family: V3MovementFamily;
  scheduledSlotCount: number;
  pickedSlotCount: number;
  slotIds: string[];
  weeks: Array<{
    weekIndex: number;
    scheduledSlotCount: number;
    pickedSlotCount: number;
  }>;
};

export type V3FamilyPickHistoryEntry = {
  family: V3MovementFamily;
  exerciseId: string;
  exerciseName: string;
  slotId: string;
  role: V3SlotRole;
  weekIndex: number;
  dayIndex: number;
  sessionIndex: number;
  uniquenessScore: number;
  totalScore: number;
};

export type V3AuditReport = {
  coverageMatrix: Record<V3MovementFamily, V3FamilyCoverageEntry>;
  pickHistoryByFamily: Record<V3MovementFamily, V3FamilyPickHistoryEntry[]>;
  uniquenessBySlot: Record<string, number>;
  volumeSummary: {
    scheduledSlots: number;
    pickedSlots: number;
    uniqueExercises: number;
    byRole: Record<V3SlotRole, number>;
    byFamily: Record<V3MovementFamily, number>;
  };
  missingSlots: Array<{
    slotId: string;
    role: V3SlotRole;
    family: V3MovementFamily;
    weekIndex: number;
    dayIndex: number;
    sessionIndex: number;
  }>;
};

export type V3PrototypeProgram = {
  version: "engine_v3_slot_family_prototype";
  seed: string;
  experienceLevel: V3ExperienceLevel;
  capabilityProfile: V3CapabilityProfile;
  schedule: V3ScheduleBlock;
  catalog: V3PrototypeExercise[];
  days: V3GeneratedDay[];
  audit: V3AuditReport;
};
