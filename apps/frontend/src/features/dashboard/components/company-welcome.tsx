"use client";

import { Logo } from "@/components/common/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf } from "lucide-react";

export default function CompanyWelcome() {
  return (
    <Card className="h-full border-0 shadow-sm bg-card overflow-hidden group cursor-pointer transition-all hover:shadow-md">
      <CardContent className="p-0">
        {/* Main Welcome Section */}
        <div className="relative flex flex-col items-center justify-center py-6 sm:py-10 px-6 min-h-[140px] sm:min-h-[250px]">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 transition-opacity group-hover:opacity-80" />

          <div className="absolute top-2 right-4 opacity-5 group-hover:scale-105 transition-transform duration-500 hidden sm:block">
            <Leaf className="w-24 h-24 text-chart-2 rotate-12" />
          </div>
          <div className="absolute bottom-2 left-4 opacity-5 group-hover:-rotate-12 transition-transform duration-500 hidden sm:block">
            <Leaf className="w-20 h-20 text-chart-2 -rotate-45" />
          </div>

          {/* Logo Container */}
          <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-6">
            {/* Logo with subtle shadow */}
            <div className="relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-chart-2/10 blur-2xl rounded-full scale-125 animate-pulse" />
              <Logo
                variant="full"
                blend
                className="relative h-16 sm:h-28 md:h-32 w-auto"
              />
            </div>

            {/* Tagline or Action Hint */}
            <div className="hidden sm:flex flex-col items-center gap-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                el mejor comienzo para sus cultivos
              </p>
              <div className="h-0.5 w-6 bg-primary/20 group-hover:w-16 transition-all duration-500" />
            </div>
          </div>

          {/* Subtle Bottom Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
  );
}
