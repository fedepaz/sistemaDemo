// src/components/common/coming-soon.tsx
"use client";

import { Sprout, BarChart, Smartphone, Cloud } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full text-center space-y-6 md:space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sprout className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              AgriFlow
            </h1>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            ¡Próximamente!
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Estamos trabajando arduamente para brindarle una solución de gestión agrícola innovadora y eficiente.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">En desarrollo</span>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 md:pt-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <BarChart className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Análisis de Datos Avanzado
            </h3>
            <p className="text-sm text-muted-foreground px-2">
              Obtenga información valiosa sobre sus cultivos y operaciones.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Gestión Móvil
            </h3>
            <p className="text-sm text-muted-foreground px-2">
              Administre su granja desde cualquier lugar con nuestra aplicación móvil.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Cloud className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Integración en la Nube
            </h3>
            <p className="text-sm text-muted-foreground px-2">
              Acceda a sus datos de forma segura y en tiempo real.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 md:pt-8 text-sm text-muted-foreground">
          <p>
            Para consultas, contáctenos en{" "}
            <a
              href="mailto:info@agriflow.com"
              className="text-primary hover:underline"
            >
              info@agriflow.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
