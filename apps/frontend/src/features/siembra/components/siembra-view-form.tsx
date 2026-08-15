// src/features/siembra/components/siembra-view-form.tsx

import { Card, CardContent } from "@/components/ui/card";
import { SiembraDto } from "@vivero/shared";
import {
  Package,
  Calendar,
  Info,
  Hash,
  ClipboardList,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SiembraFormProps {
  selectedExtendido: SiembraDto;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  badge,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value?: string | number | null;
  badge?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 md:gap-4 py-2 md:py-3 border-b border-border/40 last:border-0",
      className,
    )}
  >
    <div className="p-1.5 md:p-2 bg-primary/5 rounded-lg border border-primary/10">
      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1 md:mb-1.5">
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

export function SiembraViewForm({ selectedExtendido }: SiembraFormProps) {
  const getHaiLabel = (hai: string | null | undefined) => {
    if (!hai) return "-";
    const map: Record<string, string> = {
      H: "hortaliza",
      A: "aromática",
      I: "injerto",
    };
    return map[hai.toUpperCase()] || hai;
  };

  return (
    <div className="flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* 🚀 FIXED TOP SECTION: PRODUCTO (Always Visible) */}
      <div className="space-y-3 md:space-y-4 shrink-0">
        <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground">
                {selectedExtendido.codigoEspecie}
              </h2>
              <div className="flex items-center gap-2 mt-1 md:mt-1.5">
                <span className="text-[9px] md:text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1 py-0.5 rounded border border-border/40">
                  {selectedExtendido.nombreEspecie}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BASIC SPECS GRID */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Año", value: selectedExtendido.anio, icon: Calendar },
            { label: "Índice", value: selectedExtendido.indice, icon: Hash },
            {
              label: "HAI",
              value: getHaiLabel(selectedExtendido.hai),
              icon: Info,
            },
            { label: "CON", value: selectedExtendido.con, icon: Activity },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border/60 p-1.5 md:p-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2.5 shadow-sm overflow-hidden"
            >
              <div className="p-1 md:p-1.5 bg-muted rounded-md shrink-0">
                <item.icon className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[7px] md:text-[8px] font-bold uppercase leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="text-[10px] md:text-xs truncate uppercase font-bold">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 gap-0.5 md:gap-1">
            <InfoRow
              icon={Calendar}
              label="Fecha Sugerida"
              value={selectedExtendido.fechaSugeridaSiembra}
              className="border-primary/5"
            />
            <InfoRow
              icon={ClipboardList}
              label="Fecha Real Siembra"
              value={selectedExtendido.fechaSiembraReal}
              className="border-primary/5"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
