import PlausibleProvider from "next-plausible";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/**
 * Phase 6.8 — Plausible analytics (Sotirios ratified: Path A).
 *
 * Privacy-respecting, cookieless, EU-hosted, aggregate-only usage stats.
 * No personal tracking, no third-party ad networks (disclosed in /privacy).
 *
 * No script is injected unless NEXT_PUBLIC_PLAUSIBLE_SRC — the site-specific
 * script URL from the Plausible dashboard (e.g. https://plausible.io/js/pa-XXXX.js)
 * — is configured, so local dev, tests, and previews stay analytics-free.
 * next-plausible's `enabled` default further restricts injection to production.
 *
 * Vercel Web Analytics is also included to provide additional insights when
 * deployed on Vercel. It automatically activates only in production environments.
 */
export default function Analytics({
  children,
}: {
  children: React.ReactNode;
}) {
  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC;
  if (!src) {
    return (
      <>
        {children}
        <VercelAnalytics />
      </>
    );
  }
  return (
    <PlausibleProvider src={src} init={{ captureOnLocalhost: false }}>
      {children}
      <VercelAnalytics />
    </PlausibleProvider>
  );
}
