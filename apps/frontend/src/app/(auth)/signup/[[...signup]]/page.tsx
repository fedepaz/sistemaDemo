//src/app/(auth)/signup/[[...signup]]/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/common/theme-toggle";

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <SignUp path="/signup" signInUrl="/login" />
    </div>
  );
}
