// src/features/auth/components/AuthDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ChangePasswordForm } from "@/components/user-profile/user-password";
import { LoginForm } from "./login-form";

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
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Form Card */}

      {!isChangePasswordOpen ? (
        <LoginForm onDefaultPassword={() => setIsChangePasswordOpen(true)} />
      ) : (
        <ChangePasswordForm onClose={() => router.push("/")} />
      )}
    </div>
  );
}
