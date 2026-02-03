// src/components/common/coming-soon.tsx
"use client";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full text-center space-y-6 md:space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold">DM</span>
            </div>
            <div>
              <h1 className="font-bold">Demo</h1>
              <h2 className=" text-muted-foreground">Sistema de gestión</h2>
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            ¡Próximamente!
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Estamos trabajando arduamente para brindarle una solución de gestión
            innovadora y eficiente.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">En desarrollo</span>
        </div>
      </div>
    </div>
  );
}
