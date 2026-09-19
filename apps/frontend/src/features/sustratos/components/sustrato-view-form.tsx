// apps/frontend/src/features/sustratos/components/sustrato-view-form.tsx
import { Card, CardContent } from "@/components/ui/card";
import { SustratoDto } from "@vivero/shared";
import { Package, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SustratoViewFormProps {
  selectedSustrato: SustratoDto;
}

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
      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs md:text-base font-bold truncate text-foreground">
          {value ?? "-"}
        </p>
        {badge}
      </div>
    </div>
  </div>
);

export function SustratoViewForm({ selectedSustrato }: SustratoViewFormProps) {
  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* Header */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-2 rounded-xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                {selectedSustrato.nombre}
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                Sustrato
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-success border-success/20 bg-success/10 font-bold px-2 py-0.5 h-5 md:h-6 text-[9px] md:text-[10px]"
          >
            <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
            Activo
          </Badge>
        </div>
      </div>

      {/* Details Card */}
      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card/50 flex-1 min-h-0">
        <CardContent className="p-3 space-y-2 h-full overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 gap-0.5">
            <InfoRow
              icon={Package}
              label="Nombre"
              value={selectedSustrato.nombre}
            />
            <InfoRow
              icon={Calendar}
              label="Fecha de Creación"
              value={new Date(selectedSustrato.createdAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
