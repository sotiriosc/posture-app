import { createHash } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "bac_admin";

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export const getAdminSecret = () => process.env.ADMIN_ACCESS_KEY ?? "";

export const getAdminSecretHash = () => {
  const secret = getAdminSecret();
  return secret ? sha256(secret) : "";
};

export const isAdminCookieValue = (value: string | undefined | null) => {
  if (!value) return false;
  const expected = getAdminSecretHash();
  if (!expected) return false;
  return value === expected;
};

export const isAdminRequest = async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return isAdminCookieValue(cookieValue);
};
