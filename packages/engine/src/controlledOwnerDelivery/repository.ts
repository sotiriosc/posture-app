import {
  sameSemanticValue,
  validateOwnerEnrollmentRevision,
  validateOwnerProfileRevision,
  type OwnerEnrollmentRevision,
  type OwnerGetStrongerProfileRevision,
} from "@praxis/training-engine-v2";
import type { OwnerEnrollmentProfileRepository } from "./contracts";

const enrollmentKey = (userId: string, enrollmentId: string, revisionId: string) =>
  `${userId}:${enrollmentId}:${revisionId}`;
const profileKey = (userId: string, profileId: string, revisionId: string) =>
  `${userId}:${profileId}:${revisionId}`;

function newest<T extends { readonly createdAt: string; readonly revisionId: string }>(values: readonly T[]): T | null {
  return [...values].sort((left, right) => right.createdAt.localeCompare(left.createdAt) ||
    right.revisionId.localeCompare(left.revisionId))[0] ?? null;
}

export function createInMemoryOwnerEnrollmentProfileRepository(): OwnerEnrollmentProfileRepository {
  const enrollments = new Map<string, OwnerEnrollmentRevision>();
  const profiles = new Map<string, OwnerGetStrongerProfileRevision>();
  const repository: OwnerEnrollmentProfileRepository = {
    appendEnrollment: async (revision) => {
      if (validateOwnerEnrollmentRevision(revision).length) throw new Error("OWNER_ENROLLMENT_INVALID");
      const key = enrollmentKey(revision.userId, revision.enrollmentId, revision.revisionId);
      const prior = enrollments.get(key);
      if (prior) return sameSemanticValue(prior, revision) ? "exact_retry" : "conflict";
      if (revision.basedOnRevisionId && !enrollments.has(enrollmentKey(
        revision.userId, revision.enrollmentId, revision.basedOnRevisionId))) return "conflict";
      enrollments.set(key, revision);
      return "appended";
    },
    readEnrollmentExact: async (userId, enrollmentId, revisionId) =>
      enrollments.get(enrollmentKey(userId, enrollmentId, revisionId)) ?? null,
    readCurrentEnrollment: async (userId) => newest([...enrollments.values()]
      .filter((entry) => entry.userId === userId)),
    appendProfile: async (revision) => {
      if (validateOwnerProfileRevision(revision).length) throw new Error("OWNER_PROFILE_INVALID");
      const key = profileKey(revision.userId, revision.profileId, revision.revisionId);
      const prior = profiles.get(key);
      if (prior) return sameSemanticValue(prior, revision) ? "exact_retry" : "conflict";
      if (revision.basedOnRevisionId && !profiles.has(profileKey(
        revision.userId, revision.profileId, revision.basedOnRevisionId))) return "conflict";
      profiles.set(key, revision);
      return "appended";
    },
    readProfileExact: async (userId, profileId, revisionId) =>
      profiles.get(profileKey(userId, profileId, revisionId)) ?? null,
    readCurrentProfile: async (userId) => newest([...profiles.values()]
      .filter((entry) => entry.userId === userId && entry.reviewState === "confirmed")),
  };
  return Object.freeze(repository);
}
