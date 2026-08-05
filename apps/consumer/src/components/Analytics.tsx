import PlausibleProvider from "next-plausible";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/**
 * Plausible + Vercel Web Analytics wrappers for the consumer app.
 *
 * GA4 is mounted separately in the root layout via `@next/third-parties/google`
 * when NEXT_PUBLIC_GA_MEASUREMENT_ID is set — do not add a second gtag/GA tag here.
 *
 * Plausible: no script unless NEXT_PUBLIC_PLAUSIBLE_SRC is configured.
 * Vercel Web Analytics: activates in Vercel production environments.
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
