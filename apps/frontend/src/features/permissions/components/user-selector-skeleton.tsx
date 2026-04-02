import { Skeleton } from "@/components/ui/skeleton";

export function UserSelectorSkeleton() {
  return (
    <div className="px-4 sm:px-6 py-6 bg-background">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="space-y-1.5 lg:flex-1">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
            <Skeleton className="h-3 w-3 rounded-full" />
            Seleccionar Usuario
          </label>
          <Skeleton className="w-full h-11 rounded-xl lg:max-w-md" />
        </div>
      </div>
    </div>
  );
}
