// src/features/auth/components/AuthDashboard.tsx
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ChangePasswordForm } from "@/components/user-profile/user-password";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/common/logo";

export function AuthDashboard() {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const router = useRouter();

  const { isLoginComplete } = useAuthContext();

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
          <Logo variant="full" className="h-24 sm:h-32" />
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
