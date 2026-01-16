// src/app/layout.tsx

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { enUS, esES, itIT, ptBR } from "@clerk/localizations";
import "./globals.css";
import { cookies } from "next/headers";
import { shadcn } from "@clerk/themes";

type LocaleKey = "en" | "es" | "it" | "pt";

export const metadata: Metadata = {
  title: "AgriManage - Agricultural Management System",
  description: "Professional agricultural plant management dashboard",
  generator: "v0.app",
};

const localizations = {
  en: enUS,
  es: esES,
  it: itIT,
  pt: ptBR,
} as const;

// Read cookie safely on the server. If cookie is missing or invalid, fall back to `en`.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // read cookies() inside the server component (cookies() can be async in some Next types)
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = (
    cookieLocale &&
    (cookieLocale === "en" ||
      cookieLocale === "es" ||
      cookieLocale === "it" ||
      cookieLocale === "pt")
      ? (cookieLocale as LocaleKey)
      : "en"
  ) as LocaleKey;
  //read the local storage for theme key and set the theme

  const clerkAppearance = {
    baseTheme: shadcn,
  };

  const clerkLocalization = localizations[locale];

  return (
    <ClerkProvider
      localization={clerkLocalization}
      appearance={clerkAppearance}
    >
      <html suppressHydrationWarning>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
