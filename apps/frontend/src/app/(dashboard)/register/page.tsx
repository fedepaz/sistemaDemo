// src/app/(dashboard)/register/page.tsx

import { AuthSkeleton } from "@/features/auth";
import { RegisterForm } from "@/features/auth/components/register-form";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/users">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        </div>
      </div>

      <div className="flex-1">
        <Suspense fallback={<AuthSkeleton />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
