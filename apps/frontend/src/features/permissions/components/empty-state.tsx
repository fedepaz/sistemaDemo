// src/features/permissions/components/empty-state.tsx

import { Shield, Users } from "lucide-react";

export function EmptyState({ hasUser }: { hasUser: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {hasUser ? (
          <Shield className="h-7 w-7 text-muted-foreground" />
        ) : (
          <Users className="h-7 w-7 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-foreground">
          {hasUser ? "Sin permisos configurados" : "Selecciona un usuario"}
        </p>
        <p className="text-center text-xs text-muted-foreground">
          {hasUser
            ? "Este usuario a\u00fan no tiene permisos asignados a ning\u00fan recurso."
            : "Elige un usuario del selector para gestionar sus permisos de acceso."}
        </p>
      </div>
    </div>
  );
}
