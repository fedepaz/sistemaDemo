// src/components/common/skeleton/auth-layout-skeleton.tsx

import { Logo } from "@/components/common/logo";
import { AuthHeader } from "@/components/layout/auth-header";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthLayoutSkeleton() {
  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* Logo — idéntico al AuthLayout real, sin skeleton (carga instantánea, evita parpadeo) */}
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full" />
              <Logo
                variant="full"
                className="h-16 sm:h-20 md:h-24 w-auto relative opacity-100"
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

          {/* Form Card — misma caja, contenido interno reemplazado por placeholders */}
          <div className="bg-card/80 dark:bg-card/40 backdrop-blur-xl border border-border/40 p-5 sm:p-8 md:p-10 shadow-2xl rounded-xl relative overflow-hidden">
            <div className="space-y-6">
              {/* Título del form */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-2/3 mx-auto" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
              </div>

              {/* Campos */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              {/* Botón submit */}
              <Skeleton className="h-10 w-full rounded-md" />

              {/* Link secundario */}
              <Skeleton className="h-3 w-1/3 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
