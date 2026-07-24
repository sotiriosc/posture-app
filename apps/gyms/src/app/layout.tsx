import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { PhotoProvider } from "@/components/PhotoContext";
import AppMenu from "@/components/AppMenu";
import Analytics from "@/components/Analytics";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { readServerSession } from "@/lib/serverAuth";
import "./globals.css";

const GLOBAL_CARD_STYLE = "shaded";
const GLOBAL_INPUT_STYLE = "shaded";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

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

const APP_TITLE = "Praxis for Gyms";
const APP_DESCRIPTION =
  "Posture-aware training infrastructure for gyms: member onboarding, guided programming, and operator projections — criteria-based, not gamified.";

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: APP_TITLE,
    template: "%s | Praxis for Gyms",
  },
  description: APP_DESCRIPTION,
  applicationName: "Praxis for Gyms",
  keywords: [
    "gym software",
    "member onboarding",
    "trainer tools",
    "posture assessment",
    "strength programming",
  ],
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Praxis for Gyms",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/icons/praxis-logo-full.png",
        width: 1536,
        height: 1024,
        alt: "Praxis for Gyms — posture-aware training infrastructure",
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
  // Phase 6f, Commit 1 (SR-6f) — photos are namespaced per account (porting
  // Phase 6e's consumer fix), so PhotoProvider needs to know who's signed in
  // on every render, not just client-side after a fetch resolves.
  // `readServerSession` is cache()'d so this doesn't add a second lookup on
  // top of AppMenu's own session read.
  const session = await readServerSession();
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}
        data-card-style={GLOBAL_CARD_STYLE}
        data-input-style={GLOBAL_INPUT_STYLE}
      >
        <Analytics>
          <AppMenu />
          <PhotoProvider userId={session?.id ?? null}>{children}</PhotoProvider>
          <ServiceWorkerRegister />
        </Analytics>
      </body>
    </html>
  );
}
