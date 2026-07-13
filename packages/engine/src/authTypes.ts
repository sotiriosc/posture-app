export type SubscriptionPlan = "free" | "pro";

export type AuthUser = {
  id: string;
  email: string;
  plan: SubscriptionPlan;
};

export type SessionTokenPayload = {
  sub: string;
  email: string;
  plan: SubscriptionPlan;
  iat: number;
  exp: number;
};

export const AUTH_COOKIE_NAME = "bac_user";
