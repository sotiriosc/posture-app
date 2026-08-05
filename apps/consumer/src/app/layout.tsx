import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { PhotoProvider } from "@/components/PhotoContext";
import AccountIsolationGate from "@/components/AccountIsolationGate";
import AppMenu from "@/components/AppMenu";
import Analytics from "@/components/Analytics";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallApp from "@/components/InstallApp";
import OfflineBadge from "@/components/OfflineBadge";
import { getGaMeasurementId } from "@/gaMeasurementId";
import { readServerSession } from "@/lib/serverAuth";
import "./globals.css";

const GLOBAL_CARD_STYLE = "shaded";
const GLOBAL_INPUT_STYLE = "shaded";

/**
 * Absolute site origin for Open Graph / X (Twitter) cards.
 * Production must never emit localhost URLs — crawlers cannot fetch them,
 * which makes the share/ad preview show no logo.
 */
const resolveMetadataBase = () => {
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
      return url;
    } catch {
      // try next candidate
    }
  }
  return new URL("http://localhost:3000");
};

const OG_IMAGE = {
  url: "/icons/praxis-og-1200x630.png",
  width: 1200,
  height: 630,
  alt: "Praxis — progressive strength training with posture-aware programming",
} as const;

const APP_TITLE = "Praxis — Personal Trainer";
const APP_DESCRIPTION =
  "Progressive strength training with posture-aware programming and criteria-based advancement.";

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: APP_TITLE,
    template: "%s | Praxis",
  },
  description: APP_DESCRIPTION,
  applicationName: "Praxis",
  keywords: [
    "strength training",
    "posture",
    "progressive overload",
    "personal trainer",
    "movement quality",
  ],
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Praxis",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: "/",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  icons: {
    // Prefer the PNG favicon first so the browser tab always shows the Praxis
    // mark (SVG is listed second for agents that prefer vector).
    icon: [
      { url: "/icons/praxis-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
      { url: "/icons/praxis-mark-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: [{ url: "/icons/praxis-favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/praxis-mark-192.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f19",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Phase 6e, Commit 1 — photos are namespaced per account (SR-6e, ED-6e.1),
  // so PhotoProvider needs to know who's signed in on every render, not just
  // client-side after a fetch resolves. `readServerSession` is cache()'d so
  // this doesn't add a second lookup on top of AppMenu's own session read.
  const session = await readServerSession();
  const gaMeasurementId = getGaMeasurementId();
  return (
    <html lang="en">
      <body
        className="antialiased"
        data-card-style={GLOBAL_CARD_STYLE}
        data-input-style={GLOBAL_INPUT_STYLE}
      >
        <Analytics>
          <AccountIsolationGate userId={session?.id ?? null}>
            <AppMenu />
            <OfflineBadge />
            <PhotoProvider userId={session?.id ?? null}>{children}</PhotoProvider>
            <ServiceWorkerRegister />
            <InstallApp />
          </AccountIsolationGate>
        </Analytics>
      </body>
      {gaMeasurementId ? <GoogleAnalytics gaId={gaMeasurementId} /> : null}
    </html>
  );
}
