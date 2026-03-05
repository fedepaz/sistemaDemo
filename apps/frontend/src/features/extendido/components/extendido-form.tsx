//src/features/plants/components/plants-form.tsx

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { Plant } from "../types";

interface ExtendidosFormProps {
  selectedExtendido: Plant;
}

export function ExtendidosForm({ selectedExtendido }: ExtendidosFormProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Información del Extendido */}
      {selectedExtendido.id ? (
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <User className="h-4 w-4 text-primary" />
              Extendido
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Nombre completo
              </span>
              <p className="text-sm font-medium">{selectedExtendido.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Tipo de recurso
              </span>
              <div className="pt-1">
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]"
                >
                  {selectedExtendido.species}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Ubicación
              </span>
              <p className="text-sm font-medium">
                {selectedExtendido.location}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Estado
              </span>
              <div className="pt-1">
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]"
                >
                  {selectedExtendido.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
