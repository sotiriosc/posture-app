import type { Metadata, Viewport } from "next";
import { PhotoProvider } from "@/components/PhotoContext";
import AppMenu from "@/components/AppMenu";
import Analytics from "@/components/Analytics";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallApp from "@/components/InstallApp";
import { readServerSession } from "@/lib/serverAuth";
import "./globals.css";

const GLOBAL_CARD_STYLE = "shaded";
const GLOBAL_INPUT_STYLE = "shaded";

const resolveMetadataBase = () => {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  try {
    return new URL(raw);
  } catch {
    return new URL("http://localhost:3000");
  }
};

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
    images: [
      {
        url: "/icons/praxis-logo-full.png",
        width: 1536,
        height: 1024,
        alt: "Praxis — progressive strength training with posture-aware programming",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: ["/icons/praxis-logo-full.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
      { url: "/icons/praxis-favicon-32.png", sizes: "32x32", type: "image/png" },
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
  return (
    <html lang="en">
      <body
        className="antialiased"
        data-card-style={GLOBAL_CARD_STYLE}
        data-input-style={GLOBAL_INPUT_STYLE}
      >
        <Analytics>
          <AppMenu />
          <PhotoProvider userId={session?.id ?? null}>{children}</PhotoProvider>
          <ServiceWorkerRegister />
          <InstallApp />
        </Analytics>
      </body>
    </html>
  );
}
