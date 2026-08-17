import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type OwnerCsrfActionFamily = "enrollment" | "profile" | "preview" | "approval" | "application" |
  "session" | "rollback";

interface OwnerCsrfClaims {
  readonly contract: "CONTROLLED_OWNER_CSRF_TOKEN@1.0.0";
  readonly userId: string;
  readonly sessionBinding: string;
  readonly actionFamily: OwnerCsrfActionFamily;
  readonly expiresAt: string;
  readonly revision: number;
}

const encode = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const sign = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("base64url");

export function controlledOwnerSessionBinding(cookieHeader: string): string {
  const sessionCookie = cookieHeader.split(";").map((entry) => entry.trim())
    .find((entry) => entry.startsWith("bac_user="))?.slice("bac_user=".length) ?? "";
  return createHash("sha256").update(sessionCookie).digest("hex");
}

export function issueControlledOwnerCsrfToken(input: Omit<OwnerCsrfClaims, "contract"> & {
  readonly secret: string;
}): string {
  if (!input.secret || !input.userId || !input.sessionBinding || !Number.isInteger(input.revision) ||
      !Number.isFinite(Date.parse(input.expiresAt))) throw new Error("OWNER_CSRF_TOKEN_INPUT_INVALID");
  const claims: OwnerCsrfClaims = Object.freeze({ contract: "CONTROLLED_OWNER_CSRF_TOKEN@1.0.0",
    userId: input.userId, sessionBinding: input.sessionBinding, actionFamily: input.actionFamily,
    expiresAt: input.expiresAt, revision: input.revision });
  const payload = encode(JSON.stringify(claims));
  return `${payload}.${sign(payload, input.secret)}`;
}

export function verifyControlledOwnerCsrfToken(input: {
  readonly token: string;
  readonly secret: string;
  readonly userId: string;
  readonly sessionBinding: string;
  readonly actionFamily: OwnerCsrfActionFamily;
  readonly evaluatedAt: string;
}): boolean {
  const [payload, signature, extra] = input.token.split(".");
  if (!payload || !signature || extra || !input.secret) return false;
  const expected = sign(payload, input.secret);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OwnerCsrfClaims;
    return claims.contract === "CONTROLLED_OWNER_CSRF_TOKEN@1.0.0" && claims.userId === input.userId &&
      claims.sessionBinding === input.sessionBinding && claims.actionFamily === input.actionFamily &&
      Number.isInteger(claims.revision) && Date.parse(claims.expiresAt) > Date.parse(input.evaluatedAt);
  } catch {
    return false;
  }
}

export function validateControlledOwnerMutationRequest(input: {
  readonly request: Request;
  readonly allowedMethod: "POST";
}): readonly string[] {
  const reasons: string[] = [];
  if (input.request.method !== input.allowedMethod) reasons.push("OWNER_METHOD_NOT_ALLOWED");
  const contentType = input.request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") reasons.push("OWNER_JSON_CONTENT_TYPE_REQUIRED");
  const origin = input.request.headers.get("origin");
  const forwardedHost = input.request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const host = forwardedHost || input.request.headers.get("host");
  if (!origin || !host) reasons.push("OWNER_SAME_ORIGIN_HEADERS_REQUIRED");
  else {
    try {
      if (new URL(origin).host !== host) reasons.push("OWNER_ORIGIN_HOST_MISMATCH");
    } catch {
      reasons.push("OWNER_ORIGIN_INVALID");
    }
  }
  if (!input.request.headers.get("cookie")) reasons.push("OWNER_SESSION_COOKIE_REQUIRED");
  return Object.freeze([...new Set(reasons)].sort());
}

interface RateBucket { count: number; resetAt: number }
const ownerRateBuckets = new Map<string, RateBucket>();

export function takeControlledOwnerRateLimit(input: { readonly userId: string; readonly action: string;
  readonly evaluatedAtMs: number; readonly limit: number; readonly windowMs: number }) {
  const key = `${input.userId}:${input.action}`;
  const current = ownerRateBuckets.get(key);
  if (!current || input.evaluatedAtMs >= current.resetAt) {
    ownerRateBuckets.set(key, { count: 1, resetAt: input.evaluatedAtMs + input.windowMs });
    return Object.freeze({ allowed: true, remaining: input.limit - 1 });
  }
  if (current.count >= input.limit) return Object.freeze({ allowed: false, remaining: 0 });
  current.count += 1;
  return Object.freeze({ allowed: true, remaining: input.limit - current.count });
}
