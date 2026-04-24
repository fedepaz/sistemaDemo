"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ExtendidosSelectorSkeleton() {
  return (
    <div className="w-full bg-muted/30 border border-border/40 rounded-[1.5rem] lg:rounded-full p-2 lg:p-1.5 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-2">
        {/* BLOQUE 1: TABS (Simulado) */}
        <div className="flex items-center gap-2 px-1 lg:px-0">
          <div className="bg-background/50 border border-border/40 p-1 h-11 lg:h-9 rounded-xl lg:rounded-full flex items-center gap-1">
            <Skeleton className="h-full w-24 lg:w-28 rounded-lg lg:rounded-full" />
            <Skeleton className="h-full w-24 lg:w-28 rounded-lg lg:rounded-full hidden sm:block" />
            <Skeleton className="h-full w-20 lg:w-24 rounded-lg lg:rounded-full hidden md:block" />
          </div>
        </div>

        <div className="hidden lg:block w-px h-6 bg-border/60 mx-1" />

        {/* BLOQUE 2: INPUTS (Simulado) */}
        <div className="flex-1 px-1 lg:px-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-12 lg:h-9 flex-1 rounded-xl lg:rounded-full" />
            <Skeleton className="h-12 lg:h-9 w-24 lg:w-28 rounded-xl lg:rounded-full" />
          </div>
        </div>

        <div className="hidden lg:block w-px h-6 bg-border/60 mx-1" />

        {/* BLOQUE 3: FACET (Simulado) */}
        <div className="flex items-center gap-2 lg:min-w-[180px] xl:min-w-[240px]">
          <Skeleton className="h-12 lg:h-9 flex-1 rounded-xl lg:rounded-full" />
          <Skeleton className="hidden lg:block h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}
