// src/features/auth/components/auth-skeleton.tsx

import type React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthSkeletonProps extends React.ComponentProps<"div"> {
  /**
   * Type of auth form to render skeleton for
   * @default "login"
   */
  type?: "login" | "register";
}

export function AuthSkeleton({
  className,
  type = "login",
  ...props
}: AuthSkeletonProps) {
  return (
    <div
      className={cn("flex flex-col gap-3 sm:gap-4", className)}
      role="status"
      aria-label="Cargando formulario de autenticación"
      {...props}
    >
      {/* Title + description (register only) */}
      {type === "register" && (
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      )}

      {/* Username field — mirrors FormItem > FormLabel + Input with icon */}
      <div className="space-y-1 sm:space-y-2">
        <Skeleton className="h-3 sm:h-4 w-28" />
        <div className="relative h-11 sm:h-12 w-full">
          <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </div>

      {/* Password field — mirrors FormItem > FormLabel + Input with icon + toggle */}
      <div className="space-y-1 sm:space-y-2">
        <Skeleton className="h-3 sm:h-4 w-16" />
        <div className="relative h-11 sm:h-12 w-full">
          <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
          <Skeleton className="h-full w-full rounded-md" />
          <Skeleton className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-lg" />
        </div>
      </div>

      {/* First name field (register only) */}
      {type === "register" && (
        <div className="space-y-1 sm:space-y-2">
          <Skeleton className="h-3 sm:h-4 w-16" />
          <div className="relative h-11 sm:h-12 w-full">
            <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        </div>
      )}

      {/* Last name field (register only) */}
      {type === "register" && (
        <div className="space-y-1 sm:space-y-2">
          <Skeleton className="h-3 sm:h-4 w-18" />
          <div className="relative h-11 sm:h-12 w-full">
            <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        </div>
      )}

      {/* Submit button */}
      <Skeleton className="h-11 sm:h-12 w-full rounded-lg mt-2" />

      <span className="sr-only">Loading...</span>
    </div>
  );
}
