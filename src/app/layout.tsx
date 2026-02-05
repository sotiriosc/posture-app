import type { Metadata, Viewport } from "next";
import { PhotoProvider } from "@/components/PhotoContext";
import InstallApp from "@/components/InstallApp";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Body Alignment Coach",
  description: "Health, strength, posture, and recovery guidance.",
  applicationName: "Body Alignment Coach",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PhotoProvider>{children}</PhotoProvider>
        <InstallApp />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
