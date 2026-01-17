// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vivero",
  description: "Vivero - Enterprise Agricultural Management System",
  generator: "v0.app",
};

// Read cookie safely on the server. If cookie is missing or invalid, fall back to `en`.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
