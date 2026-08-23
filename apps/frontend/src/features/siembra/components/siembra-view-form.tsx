// src/features/siembra/components/siembra-view-form.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiembraDto } from "@vivero/shared";
import {
  Package,
  Calendar,
  Info,
  Hash,
  Activity,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/date-utils";

interface SiembraFormProps {
  selectedExtendido: SiembraDto;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value?: string | number | null;
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
      {/* FIXED TOP SECTION: PRODUCTO (Always Visible) */}
      <div className="space-y-3 md:space-y-4 shrink-0">
        <div className="flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                {selectedExtendido.codigoEspecie}
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                {selectedExtendido.nombreEspecie}
              </p>
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
            { label: "CANT", value: selectedExtendido.nrocont, icon: Activity },
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

      {/* TABBED NAVIGATION */}
      <Tabs
        defaultValue="datos"
        className="flex-1 flex flex-col overflow-hidden min-h-0"
      >
        <TabsList className="grid grid-cols-2 bg-muted/80 p-1 rounded-xl md:rounded-2xl shrink-0 h-10 md:h-14 border border-border/40 gap-1 md:gap-2 shadow-inner">
          <TabsTrigger
            value="datos"
            className="rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <ClipboardList className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2 hidden sm:inline-block" />
            Datos
          </TabsTrigger>

          <TabsTrigger
            value="notas"
            className="rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <Activity className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2 hidden sm:inline-block" />
            Notas
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-3 md:pt-6 pb-2">
          <TabsContent
            value="datos"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-0.5 md:gap-1">
                  <InfoRow
                    icon={ClipboardList}
                    label="Semilla"
                    value={selectedExtendido.propiedad}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Solicitadas"
                    value={selectedExtendido.solicito}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Fecha Sugerida"
                    value={formatShortDate(
                      selectedExtendido.fechaSugeridaSiembra,
                    )}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Fecha Siembra"
                    value={formatShortDate(selectedExtendido.fechaSiembraReal)}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Activity}
                    label="Germinación"
                    value={selectedExtendido.germin}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Hash}
                    label="Lote"
                    value={selectedExtendido.lote}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Año Lote"
                    value={selectedExtendido.anoLote}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={Info}
                    label="Ajuste"
                    value={selectedExtendido.ajuste}
                    className="border-primary/5"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="notas"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl md:rounded-[1.5rem] overflow-hidden bg-card/50">
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-8">
                <div className="flex items-center gap-3 md:gap-5 bg-muted/40 p-3 md:p-5 rounded-xl md:rounded-2xl border border-border/40">
                  <div className="p-2 md:p-3 bg-background rounded-lg md:rounded-xl border border-border/60 shadow-sm">
                    <Activity className="h-4 w-4 md:h-6 md:w-6 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-foreground">
                      Nota de Extendido
                    </p>
                    <p className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground">
                      {selectedExtendido.extendido || "Sin observaciones."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
