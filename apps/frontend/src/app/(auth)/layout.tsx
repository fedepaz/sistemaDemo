//src/app/(auth)/layout.tsx

import { Logo } from "@/components/common/logo";
import { AuthHeader } from "@/components/layout/auth-header";
import { AuthSkeleton } from "@/features/auth";
import { Suspense } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors duration-300 rounded-full" />
              <Logo
                variant="full"
                className="h-16 sm:h-20 md:h-24 w-auto relative opacity-100 hover:opacity-80 transition-opacity duration-200"
              />
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.3em] text-primary">
                El mejor comienzo para sus cultivos
              </h1>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Sistema de Gestión Web
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border/40 p-5 sm:p-8 md:p-10 shadow-2xl rounded-xl relative overflow-hidden group">
            <Suspense fallback={<AuthSkeleton />}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
