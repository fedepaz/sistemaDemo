// src/components/layout/auth-header.tsx

"use client";

import { ROUTES } from "@/constants/routes";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function AuthHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === ROUTES.LOGIN;
  const targetRoute = isLoginPage ? ROUTES.REGISTER : ROUTES.LOGIN;
  const tooltipLabel = isLoginPage ? "Registrarse" : "Iniciar Sesión";
  const targetLabel = isLoginPage ? "Crear una cuenta" : "Ya tienes cuenta?";
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-md supports-backdrop-filter:bg-background/40 shrink-0">
      <div className="container mx-auto px-2">
        <div className="flex h-12 items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-[10px] font-black uppercase tracking-widest font-oxanium text-muted-foreground/60 hover:text-primary hover:bg-primary/5 rounded-none transition-premium"
                >
                  <Link href={targetRoute}>{targetLabel}</Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="border border-border shadow-md"
              >
                <p>{tooltipLabel}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
