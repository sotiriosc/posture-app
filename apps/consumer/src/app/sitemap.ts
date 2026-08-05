import type { MetadataRoute } from "next";
import { resolvePublicSiteUrl } from "@/siteUrl";

/**
 * Public, unauthenticated routes worth indexing.
 * Authenticated dashboard/account/checkout/API/internal routes are excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolvePublicSiteUrl();
  const now = new Date();

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/app/pricing", changeFrequency: "monthly", priority: 0.9 },
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
