/**
 * Phase 9 — Operator Dashboard access.
 * Distinct from ADMIN_ACCESS_KEY /settings cookie gate.
 * Comma-separated user IDs in ADMIN_USER_IDS (Vercel env).
 */

export const parseAdminUserIds = (raw: string | undefined | null): Set<string> => {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
  );
};

export const isAllowlistedAdminUserId = (
  userId: string | null | undefined,
  allowlistRaw: string | undefined | null = process.env.ADMIN_USER_IDS
): boolean => {
  if (!userId) return false;
  return parseAdminUserIds(allowlistRaw).has(userId);
};
