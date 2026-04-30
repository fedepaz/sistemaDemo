"use client";

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      enableSystem={false}
      defaultTheme="light"
      forcedTheme="light"
    >
      {children}
    </NextThemesProvider>
  );
}
