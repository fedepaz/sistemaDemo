//src/app/(auth)/layout.tsx

import { Logo } from "@/components/common/logo";
import { AuthHeader } from "@/components/layout/auth-header";
import { AuthSkeleton } from "@/features/auth";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthHeader />
      <div
        className={cn(
          "min-h-dvh flex items-center justify-center bg-background p-4 sm:p-6 overflow-hidden transition-premium ",
        )}
      >
        <div className="max-w-md w-full space-y-8 animate-premium-in">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-premium rounded-full" />
              <Logo
                variant="full"
                className="h-20 sm:h-24 w-auto relative transition-premium opacity-100 hover:opacity-80 "
              />
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Sistema de Gestión Web
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                El mejor comienzo para sus cultivos
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-card/40 backdrop-blur-xl border border-border/40 p-6 sm:p-10 shadow-2xl rounded-none relative overflow-hidden group">
            {children}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
