// src/features/extendidos/components/extendido-form.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExtendidoDto } from "@vivero/shared";
import { Package, Calendar, Warehouse, Tag, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExtendidosFormProps {
  selectedExtendido: ExtendidoDto;
}

export function ExtendidosForm({ selectedExtendido }: ExtendidosFormProps) {
  return (
    <div className="space-y-6 pb-8">
      <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl bg-background/50 backdrop-blur-sm">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <Package className="h-4 w-4 text-primary" />
            Información de la Partida
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* IDENTIFICACIÓN */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  ID & Producto
                </span>
                <p className="text-sm font-bold">#{selectedExtendido.id}</p>
                <Badge
                  variant="secondary"
                  className="bg-primary/5 text-primary border-primary/10 font-bold uppercase text-[10px]"
                >
                  {selectedExtendido.productName}
                </Badge>
                <p className="text-xs text-muted-foreground font-mono">
                  Código: {selectedExtendido.productCode}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Cronología de Siembra
                </span>
                <p className="text-sm font-medium">
                  Real: {selectedExtendido.actualSowingDate}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sugerida: {selectedExtendido.suggestedSowingDate}
                </p>
                {selectedExtendido.daysInChamber !== null && (
                  <Badge
                    variant="outline"
                    className="mt-1 border-primary/20 text-primary bg-primary/5"
                  >
                    {selectedExtendido.daysInChamber} días en cámara
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* ESTADO OPERATIVO */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Warehouse className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Ubicación
                </span>
                <p className="text-sm font-bold">
                  {selectedExtendido.greenhouseCode}
                </p>
                <p className="text-xs text-muted-foreground uppercase font-medium">
                  Invernadero / Contenedor
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Métricas de Bandejas
                </span>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-lg font-black text-primary">
                      {selectedExtendido.traysSown}
                    </p>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">
                      Sembradas
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-primary">
                      {selectedExtendido.traysExtended}
                    </p>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">
                      Extendidas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
