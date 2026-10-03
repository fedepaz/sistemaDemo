// apps/frontend/src/features/formulas/components/formula-view-form.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormulaDto } from "@vivero/shared";
import { Blend, Calendar, AlertTriangle } from "lucide-react";

interface FormulaViewFormProps {
  selectedFormula: FormulaDto;
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
  <div className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
    <div className="w-20 shrink-0">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
        {label} {isRequired && "*"}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold truncate text-foreground">
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

export function FormulaViewForm({ selectedFormula }: FormulaViewFormProps) {
  const compositionSummary = [
    selectedFormula.producto1Nombre && `${selectedFormula.producto1Nombre} ${selectedFormula.porcentaje1}%`,
    selectedFormula.producto2Nombre && `${selectedFormula.producto2Nombre} ${selectedFormula.porcentaje2}%`,
    selectedFormula.producto3Nombre && `${selectedFormula.producto3Nombre} ${selectedFormula.porcentaje3}%`,
    selectedFormula.producto4Nombre && `${selectedFormula.producto4Nombre} ${selectedFormula.porcentaje4}%`,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] overflow-hidden">
      {/* Header */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-2 rounded-xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Blend className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight leading-none text-foreground uppercase">
                Fórmula
              </h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate max-w-[200px]">
                {compositionSummary}
              </p>
            </div>
          </div>
          {!selectedFormula.isActive && (
            <Badge
              variant="outline"
              className="text-destructive border-destructive/20 bg-destructive/10 font-bold px-2 py-0.5 h-5 text-xs"
            >
              <AlertTriangle className="h-2.5 w-2.5 mr-1" />
              Inactivo
            </Badge>
          )}
        </div>
      </div>

      {/* Details Card */}
      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card/50 flex-1 min-h-0">
        <CardContent className="p-3 space-y-2 h-full overflow-y-auto no-scrollbar">
          <div className="space-y-0.5">
            <CompositionRow
              label="Producto 1"
              nombre={selectedFormula.producto1Nombre}
              porcentaje={selectedFormula.porcentaje1}
              isRequired
            />
            <CompositionRow
              label="Producto 2"
              nombre={selectedFormula.producto2Nombre}
              porcentaje={selectedFormula.porcentaje2}
              isRequired={false}
            />
            <CompositionRow
              label="Producto 3"
              nombre={selectedFormula.producto3Nombre}
              porcentaje={selectedFormula.porcentaje3}
              isRequired={false}
            />
            <CompositionRow
              label="Producto 4"
              nombre={selectedFormula.producto4Nombre}
              porcentaje={selectedFormula.porcentaje4}
              isRequired={false}
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border/40">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Creado:
            </span>
            <span className="text-xs font-bold text-foreground">
              {new Date(selectedFormula.createdAt).toLocaleDateString("es-AR", {
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
