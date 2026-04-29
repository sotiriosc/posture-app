import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { PhotoProvider } from "@/components/PhotoContext";
import AppMenu from "@/components/AppMenu";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
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

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "Praxis for Gyms",
  description:
    "Digital coaching infrastructure for gym onboarding, guided training, trainer pathways, and member support.",
  applicationName: "Praxis for Gyms",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Praxis for Gyms",
    description:
      "Digital coaching infrastructure for gym onboarding, guided training, trainer pathways, and member support.",
    images: [{ url: "/icons/praxis-logo-full.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Praxis for Gyms",
    description:
      "Digital coaching infrastructure for gym onboarding, guided training, trainer pathways, and member support.",
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
        className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}
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
