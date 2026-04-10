import type { V3ExperienceLevel } from "@/lib/engine_v3/types";

export const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const normalizeExperienceLevel = (
  value?: string | null
): V3ExperienceLevel => {
  const normalized = normalizeToken(value ?? "beginner");
  if (normalized === "advanced") return "advanced";
  if (normalized === "intermediate") return "intermediate";
  return "beginner";
};

export const experienceLevelRank = (value: V3ExperienceLevel) => {
  if (value === "advanced") return 3;
  if (value === "intermediate") return 2;
  return 1;
};

export const stableHashUint32 = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const stableHashUnit = (value: string) =>
  stableHashUint32(value) / 4294967295;

export const rotateArray = <T,>(items: readonly T[], offset: number) => {
  if (!items.length) return [];
  const normalized = ((offset % items.length) + items.length) % items.length;
  return items.map((_, index) => items[(index + normalized) % items.length]);
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
