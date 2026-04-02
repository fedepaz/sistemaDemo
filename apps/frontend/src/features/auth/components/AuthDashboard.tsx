// src/features/auth/components/AuthDashboard.tsx
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ChangePasswordForm } from "@/components/user-profile/user-password";
import { LoginForm } from "./login-form";
import { useCompanyData } from "@/features/dashboard/hooks/useConfig";

export function AuthDashboard() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const router = useRouter();

  const { isLoginComplete } = useAuthContext();
  const { name, initials } = useCompanyData();

  useEffect(() => {
    if (isLoginComplete && !isChangePasswordOpen) {
      router.push("/");
    }
  }, [isLoginComplete, router, isChangePasswordOpen]);

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8",
      )}
    >
      <div className="max-w-md w-full space-y-6 md:space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{initials}</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {name}
              </h1>
              <p className="text-xs text-muted-foreground">
                Sistema de gestión
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          {!isChangePasswordOpen ? (
            <LoginForm
              onDefaultPassword={() => setIsChangePasswordOpen(true)}
            />
          ) : (
            <ChangePasswordForm onClose={() => router.push("/")} />
          )}
        </div>
      </div>
    </div>
  );
}
