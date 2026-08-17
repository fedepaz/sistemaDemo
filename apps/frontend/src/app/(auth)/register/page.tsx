// src/app/(auth)/register/page.tsx

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <RegisterForm />
    </div>
  );
}
