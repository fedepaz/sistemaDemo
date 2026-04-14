// src/features/extendidos/components/extendido-form.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PartidaDto } from "@vivero/shared";
import { Package } from "lucide-react";

interface ExtendidosFormProps {
  selectedExtendido: PartidaDto;
}

export function ExtendidosForm({ selectedExtendido }: ExtendidosFormProps) {
  return (
    <div className="space-y-6 pb-8">
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Package className="h-4 w-4 text-primary" />
            Detalle de Partida
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Partida / Año / Índice
            </span>
            <p className="text-sm font-medium">
              {selectedExtendido.partida} / {selectedExtendido.ano} /{" "}
              {selectedExtendido.indice}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Fecha
            </span>
            <p className="text-sm font-medium">{selectedExtendido.fecha}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Especie/Variedad
            </span>
            <p className="text-sm font-medium">{selectedExtendido.espvar}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Contenedor
            </span>
            <p className="text-sm font-medium">
              {selectedExtendido.contenedor}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              H.A.I.
            </span>
            <p className="text-sm font-medium">{selectedExtendido.hai}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Injerto
            </span>
            <p className="text-sm font-medium">{selectedExtendido.injerto}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Stock Actual
            </span>
            <p className="text-sm font-bold text-primary">
              {selectedExtendido.stock}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Estado
            </span>
            <p className="text-sm font-medium">{selectedExtendido.estado}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
