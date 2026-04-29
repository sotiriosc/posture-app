export const BUYER_DEMO_COOKIE = "praxis_gym_buyer_demo";
export const BUYER_DEMO_QUERY_PARAM = "demo";
export const BUYER_DEMO_QUERY_VALUE = "buyer";
export const BUYER_DEMO_AUTOSTART_QUERY_PARAM = "autostart";
export const BUYER_DEMO_AUTOSTART_QUERY_VALUE = "1";
export const BUYER_DEMO_RUN_QUERY_PARAM = "demoRun";
export const BUYER_DEMO_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export const BUYER_DEMO_LOCAL_STORAGE_KEYS = [
  "posture_questionnaire",
  "posture_photo_meta",
  "app_state_v1",
] as const;

export const BUYER_DEMO_INDEXED_DB_NAMES = [
  "bodycoach-logs",
  "bodycoach-drafts",
  "bodycoach-photos",
] as const;

export const isBuyerDemoCookieValue = (value?: string | null) =>
  value === BUYER_DEMO_QUERY_VALUE;

export const isBuyerDemoSearchParamValue = (value?: string | null) =>
  value === BUYER_DEMO_QUERY_VALUE;

export const hasBuyerDemoSearchParam = (
  searchParams: Pick<URLSearchParams, "get">
) =>
  isBuyerDemoSearchParamValue(searchParams.get(BUYER_DEMO_QUERY_PARAM));
