import type { Metadata, Viewport } from "next";
import { PhotoProvider } from "@/components/PhotoContext";
import AppMenu from "@/components/AppMenu";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ResumeSessionBanner from "@/components/ResumeSessionBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Praxis - Personal Trainer App",
  description: "Personal training for strength, posture, and movement quality.",
  applicationName: "Praxis",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
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
      <body className="antialiased">
        <AppMenu />
        <PhotoProvider>{children}</PhotoProvider>
        <ResumeSessionBanner />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
