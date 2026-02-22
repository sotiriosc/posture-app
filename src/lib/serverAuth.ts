import { cookies } from "next/headers";
import type { AuthUser, SessionTokenPayload } from "@/lib/authTypes";
import { AUTH_COOKIE_NAME } from "@/lib/authTypes";
import { createSessionToken, verifySessionToken } from "@/lib/authToken";
import { getUserRepository } from "@/lib/userRepository";
import type { StoredUser } from "@/lib/userStore";

const repo = getUserRepository();

export const getAuthSecret = () => process.env.AUTH_SECRET?.trim() ?? "";

const toAuthUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  email: user.email,
  plan: user.plan,
});

export const isAuthConfigured = async () => {
  if (!getAuthSecret()) return false;
  await repo.ensureBootstrapUser();
  const users = await repo.listUsers();
  return users.length > 0;
};

export const getUserByCredentials = async (email: string, password: string) => {
  await repo.ensureBootstrapUser();
  const user = await repo.findUserByEmail(email);
  if (!user) return null;
  if (!repo.verifyUserPassword(user, password)) return null;
  return toAuthUser(user);
};

export const buildUserToken = async (user: Pick<AuthUser, "id" | "email" | "plan">) => {
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

export const readServerSession = async () => {
  const secret = getAuthSecret();
  if (!secret) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token, secret);
  if (!payload) return null;
  let stored: StoredUser | null = null;
  try {
    // Passive session reads should not force bootstrap writes.
    stored = await repo.findUserById(payload.sub);
  } catch (error) {
    console.error("[auth] readServerSession failed to load user", error);
    return null;
  }
  if (!stored) return null;
  return {
    id: stored.id,
    email: stored.email,
    plan: stored.plan,
  } as AuthUser;
};

export const serializeSessionCookie = (token: string) => ({
  name: AUTH_COOKIE_NAME,
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
});
