// apps/frontend/src/features/mezclas/components/mezcla-view-form.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MezclaDto } from "@vivero/shared";
import { Blend, Calendar, CheckCircle } from "lucide-react";

interface MezclaViewFormProps {
  selectedMezcla: MezclaDto;
}

const CompositionRow = ({
  label,
  nombre,
  porcentaje,
  isRequired,
}: {
  label: string;
  nombre: string | null;
  porcentaje: number | null;
  isRequired: boolean;
}) => (
  <div className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
    <div className="w-20 shrink-0">
      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
        {label} {isRequired && "*"}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs md:text-sm font-bold truncate text-foreground">
        {nombre ?? <span className="text-muted-foreground/40">-</span>}
      </p>
    </div>
    <div className="w-16 text-right shrink-0">
      <span className="text-xs font-mono font-bold text-muted-foreground">
        {porcentaje != null ? `${porcentaje}%` : <span className="text-muted-foreground/40">-</span>}
      </span>
    </div>
    {porcentaje != null && (
      <div className="w-24 shrink-0">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    )}
  </div>
);

export function MezclaViewForm({ selectedMezcla }: MezclaViewFormProps) {
  const compositionSummary = [
    selectedMezcla.sustrato1Nombre && `${selectedMezcla.sustrato1Nombre} ${selectedMezcla.porcentaje1}%`,
    selectedMezcla.sustrato2Nombre && `${selectedMezcla.sustrato2Nombre} ${selectedMezcla.porcentaje2}%`,
    selectedMezcla.sustrato3Nombre && `${selectedMezcla.sustrato3Nombre} ${selectedMezcla.porcentaje3}%`,
    selectedMezcla.sustrato4Nombre && `${selectedMezcla.sustrato4Nombre} ${selectedMezcla.porcentaje4}%`,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* Header */}
      <div className="space-y-3 md:space-y-4 shrink-0">
        <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Blend className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                Mezcla
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5 truncate max-w-[200px] md:max-w-none">
                {compositionSummary}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-success border-success/20 bg-success/10 font-bold px-2 md:px-3 py-0.5 h-5 md:h-6 text-[9px] md:text-[10px]"
          >
            <CheckCircle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
            Activo
          </Badge>
        </div>
      </div>

      {/* Details Card */}
      <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50 flex-1 min-h-0">
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6 h-full overflow-y-auto no-scrollbar">
          <div className="space-y-0.5">
            <CompositionRow
              label="Sustrato 1"
              nombre={selectedMezcla.sustrato1Nombre}
              porcentaje={selectedMezcla.porcentaje1}
              isRequired
            />
            <CompositionRow
              label="Sustrato 2"
              nombre={selectedMezcla.sustrato2Nombre}
              porcentaje={selectedMezcla.porcentaje2}
              isRequired={false}
            />
            <CompositionRow
              label="Sustrato 3"
              nombre={selectedMezcla.sustrato3Nombre}
              porcentaje={selectedMezcla.porcentaje3}
              isRequired={false}
            />
            <CompositionRow
              label="Sustrato 4"
              nombre={selectedMezcla.sustrato4Nombre}
              porcentaje={selectedMezcla.porcentaje4}
              isRequired={false}
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border/40">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Creado:
            </span>
            <span className="text-xs md:text-sm font-bold text-foreground">
              {new Date(selectedMezcla.createdAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
