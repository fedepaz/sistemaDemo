"use client";

import { Logo } from "@/components/common/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Sun, Droplets } from "lucide-react";

export default function CompanyWelcome() {
  return (
    <Card className="h-full border-0 shadow-sm bg-card overflow-hidden group cursor-pointer transition-all hover:shadow-md">
      <CardContent className="p-0">
        {/* Main Welcome Section */}
        <div className="relative flex flex-col items-center justify-center py-16 px-8 min-h-[400px]">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 transition-opacity group-hover:opacity-80" />

          <div className="absolute top-4 right-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Leaf className="w-32 h-32 text-chart-2 rotate-12" />
          </div>
          <div className="absolute bottom-4 left-8 opacity-10 group-hover:-rotate-12 transition-transform duration-500">
            <Leaf className="w-24 h-24 text-chart-2 -rotate-45" />
          </div>

          {/* Logo Container */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo with subtle shadow */}
            <div className="relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-chart-2/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <Logo
                variant="full"
                blend
                className="relative h-32 sm:h-40 md:h-48 w-auto"
              />
            </div>

            {/* Tagline or Action Hint */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                Gestionar Operaciones
              </p>
              <div className="h-0.5 w-8 bg-primary/20 group-hover:w-24 transition-all duration-500" />
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3">
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-bold bg-chart-2/10 text-chart-3 border border-chart-2/20 hover:bg-chart-2/15 transition-all"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Sustentable
              </Badge>
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-all"
              >
                <Sun className="w-4 h-4 mr-2" />
                Innovación
              </Badge>
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/15 transition-all"
              >
                <Droplets className="w-4 h-4 mr-2" />
                Eficiencia
              </Badge>
            </div>
          </div>

          {/* Subtle Bottom Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
  );
}
