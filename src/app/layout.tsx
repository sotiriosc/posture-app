import type { Metadata, Viewport } from "next";
import { PhotoProvider } from "@/components/PhotoContext";
import AppMenu from "@/components/AppMenu";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { DEFAULT_SEO_DESCRIPTION, SITE_URL } from "@/lib/seo";
import "./globals.css";

const GLOBAL_CARD_STYLE = "shaded";
const GLOBAL_INPUT_STYLE = "shaded";

const resolveMetadataBase = () => {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    SITE_URL;
  try {
    return new URL(raw);
  } catch {
    return new URL(SITE_URL);
  }
};

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "Praxis Personal Trainer App",
  description: DEFAULT_SEO_DESCRIPTION,
  applicationName: "Praxis Personal Trainer App",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Praxis Personal Trainer App",
    description: DEFAULT_SEO_DESCRIPTION,
    images: [{ url: "/icons/praxis-logo-full.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Praxis Personal Trainer App",
    description: DEFAULT_SEO_DESCRIPTION,
    images: ["/icons/praxis-logo-full.png"],
  },
  icons: {
    icon: [
      { url: "/icons/praxis-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/praxis-mark-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: [{ url: "/icons/praxis-favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/praxis-mark-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f19",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        data-card-style={GLOBAL_CARD_STYLE}
        data-input-style={GLOBAL_INPUT_STYLE}
      >
        <AppMenu />
        <PhotoProvider>{children}</PhotoProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
