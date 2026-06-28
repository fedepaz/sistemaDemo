// src/features/extendidos/components/extendido-form.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtendidoDto } from "@vivero/shared";
import {
  Package,
  Calendar,
  Info,
  AlertCircle,
  Hash,
  Thermometer,
  ChevronRight,
  ClipboardList,
  Activity,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatShortDate, getLocalDateStr } from "@/lib/date-utils";

interface ExtendidosFormProps {
  selectedExtendido: ExtendidoDto;
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

export function ExtendidosViewForm({ selectedExtendido }: ExtendidosFormProps) {
  const today = new Date();
  const todayStr = getLocalDateStr(today);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrow);

  const targetDate = selectedExtendido.fechaEgresoCamara;
  const isToday = targetDate === todayStr;
  const isTomorrow = targetDate === tomorrowStr;

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
          {selectedExtendido.stockInicial ? (
            <div className="text-right pr-1 md:pr-2">
              <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-tighter leading-none mb-0.5 md:mb-1">
                Stock
              </p>
              <p className="text-xl md:text-2xl font-black text-primary leading-none">
                {selectedExtendido.stockInicial}
              </p>
            </div>
          ) : null}
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

      {/* 🧩 ENHANCED TABBED NAVIGATION */}
      <Tabs
        defaultValue="produccion"
        className="flex-1 flex flex-col overflow-hidden min-h-0"
      >
        <TabsList className="grid grid-cols-2 bg-muted/80 p-1 rounded-xl md:rounded-2xl shrink-0 h-10 md:h-14 border border-border/40 gap-1 md:gap-2 shadow-inner">
          <TabsTrigger
            value="produccion"
            className="rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <History className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2 hidden sm:inline-block" />
            Producción
          </TabsTrigger>

          <TabsTrigger
            value="notas"
            className="rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <ClipboardList className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-2 hidden sm:inline-block" />
            Notas
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-3 md:pt-6 pb-2">
          {/* TAB CONTENT: Same high-quality cards with refined padding */}
          <TabsContent
            value="produccion"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
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
                  <InfoRow
                    icon={ChevronRight}
                    label="Egreso de Cámara"
                    value={formatShortDate(selectedExtendido.fechaEgresoCamara)}
                    badge={
                      isToday ? (
                        <Badge
                          variant="outline"
                          className="text-warning border-warning/20 bg-warning/10 font-bold px-1.5 md:px-2 py-0 h-4 md:h-5 text-[9px] md:text-[10px]"
                        >
                          Hoy
                        </Badge>
                      ) : isTomorrow ? (
                        <Badge
                          variant="default"
                          className="bg-primary/10 text-primary border-primary/20 font-bold px-1.5 md:px-2 py-0 h-4 md:h-5 text-[9px] md:text-[10px]"
                        >
                          Mañana
                        </Badge>
                      ) : null
                    }
                    className="border-0"
                  />
                </div>

                <div className="p-4 md:p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl md:rounded-[2rem] relative overflow-hidden group shadow-md">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                          <Thermometer className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div>
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block leading-none mb-1 md:mb-2">
                            Estadía Sugerida
                          </span>
                          <p className="text-xs md:text-sm font-bold text-foreground">
                            {selectedExtendido.diasEnCamara} Días
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary/70 block leading-none mb-1">
                          Cámara Germinación
                        </span>

                        <p className="text-3xl md:text-5xl font-black text-primary tracking-tighter">
                          # {selectedExtendido.codigoCamaraGerminacion}
                        </p>
                      </div>
                    </div>
                  </div>
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
                {selectedExtendido.detalle ? (
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary/70">
                      <ClipboardList className="h-3 w-3 md:h-4 md:w-4" />{" "}
                      Detalle Técnico
                    </div>
                    <div className="p-3 md:p-5 rounded-xl md:rounded-2xl bg-muted/30 border border-border/40 text-xs md:text-sm leading-relaxed text-foreground/70 min-h-[60px] md:min-h-[80px]">
                      {selectedExtendido.detalle}
                    </div>
                  </div>
                ) : null}

                {selectedExtendido.baja ? (
                  <div className="p-3 md:p-4 bg-destructive/10 border border-destructive/20 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4">
                    <AlertCircle className="h-5 w-5 md:h-7 md:w-7 text-destructive" />
                    <div>
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-destructive leading-none mb-1">
                        Baja
                      </p>
                      <p className="text-xs md:text-sm font-bold text-destructive/80 leading-tight">
                        {selectedExtendido.baja}
                      </p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
