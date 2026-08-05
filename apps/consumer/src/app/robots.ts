import type { MetadataRoute } from "next";
import { PRODUCTION_SITE_URL, resolvePublicSiteUrl } from "@/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolvePublicSiteUrl();
  // Prefer the canonical production sitemap reference in production builds.
  const sitemapUrl =
    process.env.NODE_ENV === "production"
      ? `${PRODUCTION_SITE_URL}/sitemap.xml`
      : `${siteUrl}/sitemap.xml`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/account/",
        "/auth/",
        "/admin/",
        "/session",
        "/program/",
        "/progress",
        "/results",
        "/settings",
        "/dev-qa",
        "/dev-seed",
      ],
    },
    sitemap: sitemapUrl,
  };
}
