"use client";

import { Logo } from "@/components/common/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf } from "lucide-react";

export default function CompanyWelcome() {
  return (
    <Card className="h-full border-0 shadow-sm bg-card overflow-hidden group cursor-pointer transition-all hover:shadow-md">
      <CardContent className="p-0">
        {/* Main Welcome Section */}
        <div className="relative flex flex-col items-center justify-center py-8 sm:py-16 px-8 min-h-[180px] sm:min-h-[400px]">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 transition-opacity group-hover:opacity-80" />

          <div className="absolute top-4 right-8 opacity-10 group-hover:scale-110 transition-transform duration-500 hidden sm:block">
            <Leaf className="w-32 h-32 text-chart-2 rotate-12" />
          </div>
          <div className="absolute bottom-4 left-8 opacity-10 group-hover:-rotate-12 transition-transform duration-500 hidden sm:block">
            <Leaf className="w-24 h-24 text-chart-2 -rotate-45" />
          </div>

          {/* Logo Container */}
          <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-8">
            {/* Logo with subtle shadow */}
            <div className="relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-chart-2/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <Logo
                variant="full"
                blend
                className="relative h-20 sm:h-40 md:h-48 w-auto"
              />
            </div>

            {/* Tagline or Action Hint */}
            <div className="hidden sm:flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                el mejor comienzo para sus cultivos
              </p>
              <div className="h-0.5 w-8 bg-primary/20 group-hover:w-24 transition-all duration-500" />
            </div>
          </div>

          {/* Subtle Bottom Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
  );
}
