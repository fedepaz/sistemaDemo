// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: "Sistema de gestión",
  description: "Enterprise Management System",
  generator: "v0.app",
  icons: {
    icon: "/proIcon.png",
    apple: "/proIcon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sistema de gestión",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ServiceWorkerRegistration />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
