// src/components/error/error-boundary.tsx
"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child components and displays a fallback UI
 * Prevents entire app crash from isolated component errors
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log to error tracking service in production
    if (process.env.NODE_ENV === "production") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
      // TODO: Send to error tracking service (Sentry, etc.)
    } else {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call custom onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default agricultural-themed error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.98_0_0)] to-[oklch(0.95_0.02_147)] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[oklch(0.92_0.05_146)] flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-[oklch(0.52_0.13_144)]" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-[oklch(0.25_0.03_147)]">
                Algo salió mal
              </CardTitle>
              <CardDescription className="text-[oklch(0.45_0.02_147)]">
                No te preocupes, los cultivos siguen creciendo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[oklch(0.98_0.01_147)] border-l-4 border-[oklch(0.89_0.05_146)] p-4 rounded">
                <p className="text-sm text-[oklch(0.4_0.02_147)]">
                  {this.state.error?.message ||
                    "Ha ocurrido un error inesperado"}
                </p>
              </div>

              {process.env.NODE_ENV === "development" &&
                this.state.errorInfo?.componentStack && (
                  <details className="text-xs text-[oklch(0.5_0.02_147)]">
                    <summary className="cursor-pointer font-medium mb-2">
                      Detalles técnicos
                    </summary>
                    <pre className="bg-[oklch(0.99_0_0)] p-3 rounded overflow-auto max-h-48">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-[oklch(0.52_0.13_144)] hover:bg-[oklch(0.48_0.12_144)]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Recargar página
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
