import { cache } from "react";
import { cookies } from "next/headers";
import type { AuthUser, SessionTokenPayload } from "@/lib/authTypes";
import { AUTH_COOKIE_NAME } from "@/lib/authTypes";
import { createSessionToken, verifySessionToken } from "@/lib/authToken";
import { getUserRepository } from "@/lib/userRepository";
import type { StoredUser } from "@/lib/userStore";
import { shouldUseLocalDbFallback, warnOnce } from "@/lib/runtimeEnv";

export const getAuthSecret = () => process.env.AUTH_SECRET?.trim() ?? "";

const toAuthUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  email: user.email,
  plan: user.plan,
});

export const isAuthConfigured = async () => {
  if (!getAuthSecret()) return false;
  const repo = getUserRepository();
  try {
    await repo.ensureBootstrapUser();
    const users = await repo.listUsers();
    return users.length > 0;
  } catch (error) {
    if (shouldUseLocalDbFallback()) {
      warnOnce(
        "auth-config-local-store-unavailable",
        "[auth] User store is unavailable in local dev; auth is disabled for this request.",
        error
      );
      return false;
    }
    throw error;
  }
};

export const getUserByCredentials = async (email: string, password: string) => {
  const repo = getUserRepository();
  await repo.ensureBootstrapUser();
  const user = await repo.findUserByEmail(email);
  if (!user) return null;
  if (!repo.verifyUserPassword(user, password)) return null;
  return toAuthUser(user);
};

export const buildUserToken = async (
  user: Pick<AuthUser, "id" | "email" | "plan">
) => {
  const secret = getAuthSecret();
  if (!secret) throw new Error("Missing AUTH_SECRET");
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    sub: user.id,
    email: user.email,
    plan: user.plan,
    iat: nowSec,
    exp: nowSec + 60 * 60 * 24 * 30,
  };
  return createSessionToken(payload, secret);
};

/**
 * Wrapped in React's `cache()` (Phase 6e, Commit 1) so the several server
 * components that each independently need "who's signed in" per request
 * (AppMenu, PhotoProvider's owner prop, page-level auth checks, ...) share a
 * single cookie decode + user-store lookup instead of one per caller.
 */
export const readServerSession = cache(async () => {
  const secret = getAuthSecret();
  if (!secret) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token, secret);
  if (!payload) return null;
  let stored: StoredUser | null = null;
  const repo = getUserRepository();
  try {
    // Passive session reads should not force bootstrap writes.
    stored = await repo.findUserById(payload.sub);
  } catch (error) {
    if (shouldUseLocalDbFallback()) {
      warnOnce(
        "auth-session-local-store-unavailable",
        "[auth] Session user lookup failed in local dev; treating request as signed out.",
        error
      );
    } else {
      console.error("[auth] readServerSession failed to load user", error);
    }
    return null;
  }
  if (!stored) return null;
  return {
    id: stored.id,
    email: stored.email,
    plan: stored.plan,
  } as AuthUser;
});

export const serializeSessionCookie = (token: string) => ({
  name: AUTH_COOKIE_NAME,
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
});
