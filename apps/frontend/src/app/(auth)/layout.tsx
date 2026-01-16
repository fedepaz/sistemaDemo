//src/app/(auth)/layout.tsx

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ThemeProvider } from "@/providers/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { Suspense } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <ThemeProvider>
      <NextIntlClientProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </Suspense>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
