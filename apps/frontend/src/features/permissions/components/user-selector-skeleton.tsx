// src/features/permissions/components/user-selector-skeleton.tsx

export function UserSelectorSkeleton() {
  return (
    <div className="px-6 py-6 bg-background">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="space-y-1.5 lg:flex-1">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
            <div className="h-3 w-3 animate-pulse rounded-full bg-muted/30" />
            Seleccionar Usuario
          </label>
          <div className="w-full h-11 rounded-xl bg-muted/20 border border-border/40 animate-pulse lg:max-w-md" />
        </div>
      </div>
    </div>
  );
}
