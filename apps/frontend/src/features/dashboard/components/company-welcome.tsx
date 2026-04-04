"use client";

import { Logo } from "@/components/common/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Sun, Droplets } from "lucide-react";

export default function CompanyWelcome() {
  return (
    <Card className="h-full border-0 shadow-sm bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Main Welcome Section */}
        <div className="relative flex flex-col items-center justify-center py-12 px-8">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
          <div className="absolute top-4 right-8 opacity-10">
            <Leaf className="w-32 h-32 text-chart-2 rotate-12" />
          </div>
          <div className="absolute bottom-4 left-8 opacity-10">
            <Leaf className="w-24 h-24 text-chart-2 -rotate-45" />
          </div>

          {/* Logo Container */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo with subtle shadow */}
            <div className="relative">
              <div className="absolute inset-0 bg-chart-2/20 blur-3xl rounded-full scale-150" />
              <Logo
                variant="full"
                blend
                className="relative h-32 sm:h-40 md:h-48 w-auto"
              />
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium bg-chart-2/10 text-chart-3 border border-chart-2/20 hover:bg-chart-2/15 transition-colors"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Cultivos Sustentables
              </Badge>
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
              >
                <Sun className="w-4 h-4 mr-2" />
                Innovación Agrícola
              </Badge>
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/15 transition-colors"
              >
                <Droplets className="w-4 h-4 mr-2" />
                Riego Eficiente
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
