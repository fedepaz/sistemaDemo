// src/components/common/pending-permissions.tsx
"use client";

import { UserX, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PendingPermissionsPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8 bg-background">
      <div className="text-center max-w-2xl">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <UserX className="w-20 h-20 text-muted-foreground/40" />
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-6xl">
          Awaiting Permissions
        </h1>

        <p className="mt-6 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
          Your account has been successfully created, but you dont have any
          assigned roles or permissions yet.
        </p>

        <div className="mt-8 p-6 rounded-lg bg-muted/50 border border-border">
          <p className="text-base text-foreground font-medium mb-2">
            What happens next?
          </p>
          <p className="text-sm text-muted-foreground text-balance">
            A system administrator needs to assign you a role before you can
            access the application. This typically happens within 24 hours of
            account creation.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() =>
              (window.location.href = "mailto:support@yourcompany.com")
            }
          >
            <Mail className="w-4 h-4" />
            Contact Administration
          </Button>
          <Button onClick={() => window.location.reload()}>
            Refresh Status
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
