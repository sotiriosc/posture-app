/**
 * Absolute public origin for sitemap / robots.
 * Production must never emit localhost — crawlers cannot use those URLs.
 */
export const PRODUCTION_SITE_URL = "https://praxisapp.ca";

export const resolvePublicSiteUrl = () => {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];
  const allowLocalhost = process.env.NODE_ENV !== "production";

  for (const raw of candidates) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      const url = new URL(value.includes("://") ? value : `https://${value}`);
      if (
        !allowLocalhost &&
        (url.hostname === "localhost" || url.hostname === "127.0.0.1")
      ) {
        continue;
      }
      return url.toString().replace(/\/$/, "");
    } catch {
      // try next candidate
    }
  }

  if (!allowLocalhost) {
    return PRODUCTION_SITE_URL;
  }
  return "http://localhost:3000";
};
