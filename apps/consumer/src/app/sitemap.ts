import type { MetadataRoute } from "next";

/**
 * Phase 6f, Commit 9 — "Sitemap entry" SEO essential for the new
 * /tools/macro-calculator public page. No sitemap route existed before this
 * commit, so this covers the full existing set of public, unauthenticated,
 * content-worth-indexing pages rather than only the new one — a sitemap
 * listing a single URL would be an odd first version. Authenticated-only
 * routes (/results, /session, /program, /progress, /account, /settings) and
 * transactional auth routes (/auth/login, /auth/signup) are intentionally
 * excluded: there's nothing for a crawler to index there.
 */
const resolveSiteUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  try {
    return new URL(raw).toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
};

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveSiteUrl();
  const now = new Date();

  const routes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/assessment", changeFrequency: "monthly", priority: 0.9 },
    { path: "/tools/macro-calculator", changeFrequency: "monthly", priority: 0.8 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
    { path: "/refunds", changeFrequency: "yearly", priority: 0.2 },
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
