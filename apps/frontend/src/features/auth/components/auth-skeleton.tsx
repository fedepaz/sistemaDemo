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
      className={cn("space-y-4 sm:space-y-6", className)}
      role="status"
      aria-label="Cargando formulario de autenticación"
      {...props}
    >
      {/* Logo skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-20 sm:h-24 w-48" />
      </div>

      {/* Form Card skeleton */}
      <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-40" />
        {/* Description skeleton */}
        <Skeleton className="h-4 w-56" />

        {/* Name field (register only) */}
        {type === "register" && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="relative h-10 md:h-12 w-full">
              <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-lg" />
            </Skeleton>
          </div>
        )}

        {/* Email field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="relative h-10 md:h-12 w-full">
            <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-lg" />
          </Skeleton>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="relative h-10 md:h-12 w-full">
            <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-lg" />
          </Skeleton>
        </div>

        {/* Confirm password field (register only) */}
        {type === "register" && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="relative h-10 md:h-12 w-full">
              <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 rounded-lg" />
            </Skeleton>
          </div>
        )}

        {/* Submit button skeleton */}
        <Skeleton className="h-10 md:h-12 w-full" />
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
}
