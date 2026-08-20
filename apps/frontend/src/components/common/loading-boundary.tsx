import { Suspense, type ReactNode } from "react";

interface LoadingBoundaryProps {
  /** Required skeleton fallback. TypeScript enforces this. */
  skeleton: ReactNode;
  /** Optional name for dev-mode console logging */
  name?: string;
  /** Content that suspends */
  children: ReactNode;
}

export function LoadingBoundary({
  skeleton,
  name,
  children,
}: LoadingBoundaryProps) {
  if (process.env.NODE_ENV === "development" && name) {
    console.log(`[LoadingBoundary] "${name}" showing skeleton`);
  }

  return (
    <Suspense
      fallback={
        <div aria-busy="true" aria-live="polite">
          {skeleton}
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
