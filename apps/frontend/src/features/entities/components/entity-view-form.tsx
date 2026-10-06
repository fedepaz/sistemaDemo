// src/features/entities/components/entity-view-form.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Entity } from "@vivero/shared";
import { Table2, Tag, ShieldCheck, CircleGauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EntityViewFormProps {
  selectedEntity: Entity;
}

const PERMISSION_TYPE_LABELS: Record<string, string> = {
  CRUD: "CRUD (Estándar)",
  READ_ONLY: "Solo Lectura",
  PROCESS: "Proceso (Ejecución)",
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
  badge,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | number | null;
  badge?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0",
      className,
    )}
  >
    <div className="p-1.5 bg-primary/5 rounded-lg border border-primary/10">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold truncate text-foreground">
          {value ?? "-"}
        </p>
        {badge}
      </div>
    </div>
  </div>
);

export function EntityViewForm({ selectedEntity }: EntityViewFormProps) {
  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] overflow-hidden">
      {/* Header */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-2 rounded-xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Table2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight leading-none text-foreground uppercase">
                {selectedEntity.label}
              </h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                Entidad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card/50 flex-1 min-h-0">
        <CardContent className="p-3 space-y-2 h-full overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 gap-0.5">
            <InfoRow
              icon={Table2}
              label="Nombre de Tabla"
              value={selectedEntity.name}
            />
            <InfoRow icon={Tag} label="Etiqueta" value={selectedEntity.label} />
            <InfoRow
              icon={ShieldCheck}
              label="Tipo de Permiso"
              value={
                PERMISSION_TYPE_LABELS[selectedEntity.permissionType] ??
                selectedEntity.permissionType
              }
            />
            <InfoRow
              icon={CircleGauge}
              label="Estado"
              value={selectedEntity.isActive ? "—" : undefined}
              badge={
                !selectedEntity.isActive ? (
                  <Badge
                    variant="outline"
                    className="text-destructive border-destructive/20 bg-destructive/10 font-bold px-2 py-0.5 h-5 text-xs"
                  >
                    Inactivo
                  </Badge>
                ) : undefined
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
