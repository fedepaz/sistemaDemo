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
        "min-h-dvh flex items-center justify-center bg-background p-3 sm:p-4",
      )}
    >
      <div className="max-w-md w-full space-y-4 sm:space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo variant="full" className="h-20 sm:h-24" />
        </div>

        {/* Form Card */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
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
