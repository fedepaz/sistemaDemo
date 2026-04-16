// src/features/extendidos/components/empty-state.tsx

import { Shield } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Shield className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-foreground">
          Sin datos disponibles
        </p>
        <p className="text-center text-xs text-muted-foreground">
          No hay partidas disponibles para mostrar
        </p>
      </div>
    </div>
  );
}
