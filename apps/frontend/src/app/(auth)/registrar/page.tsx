// src/app/(auth)/register/page.tsx

import { Logo } from "@/components/common/logo";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Logo */}
      <div className="flex justify-center">
        <Logo variant="full" className="h-20 sm:h-24" />
      </div>

      {/* Form Card */}
      <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
        <RegisterForm />
      </div>
    </div>
  );
}
