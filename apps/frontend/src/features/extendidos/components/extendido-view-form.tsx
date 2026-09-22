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
import { formatPartidaHeader } from "@/features/shared/utils/header";

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
      "flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0",
      className,
    )}
  >
    <div className="p-1.5 bg-primary/5 rounded-lg border border-primary/10">
      <Icon className="h-3.5 w-3.5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">
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
    <div className="flex flex-col gap-2 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] overflow-hidden">
      {/* 🚀 FIXED TOP SECTION: PRODUCTO (Always Visible) */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center justify-between bg-primary/5 p-2 rounded-xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight leading-none text-foreground uppercase">
                {selectedExtendido.codigoEspecie}
              </h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {formatPartidaHeader(selectedExtendido)}
              </p>
            </div>
          </div>
          {selectedExtendido.stockInicial ? (
            <div className="text-right pr-1">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter leading-none mb-0.5">
                Stock
              </p>
              <p className="text-xl font-black text-primary leading-none">
                {selectedExtendido.stockInicial}
              </p>
            </div>
          ) : null}
        </div>

        {/* BASIC SPECS GRID */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Año", value: selectedExtendido.anio, icon: Calendar },
            { label: "Índice", value: selectedExtendido.indice, icon: Hash },
            {
              label: "HAI",
              value: getHaiLabel(selectedExtendido.hai),
              icon: Info,
            },
            { label: "CANT", value: selectedExtendido.nrocont, icon: Hash },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border/60 p-1.5 rounded-lg flex items-center gap-1.5 shadow-sm overflow-hidden"
            >
              <div className="p-1 bg-muted rounded-md shrink-0">
                <item.icon className="h-2.5 w-2.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[7px] font-bold uppercase leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="text-[10px] truncate uppercase font-bold">
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
        <TabsList className="grid grid-cols-2 bg-muted/80 p-1 rounded-xl shrink-0 h-10 border border-border/40 gap-1 shadow-inner">
          <TabsTrigger
            value="produccion"
            className="rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <History className="h-3 w-3.5.5 mr-1 hidden sm:inline-block" />
            Producción
          </TabsTrigger>

          <TabsTrigger
            value="notas"
            className="rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <ClipboardList className="h-3 w-3.5.5 mr-1 hidden sm:inline-block" />
            Notas
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-3 pb-2">
          {/* TAB CONTENT: Same high-quality cards with refined padding */}
          <TabsContent
            value="produccion"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card/50">
              <CardContent className="p-3 space-y-2">
                <div className="grid grid-cols-1 gap-0.5">
                  <InfoRow
                    icon={Calendar}
                    label="Fecha Sugerida"
                    value={formatShortDate(
                      selectedExtendido.fechaSugeridaSiembra,
                    )}
                    className="border-primary/5"
                  />
                  <InfoRow
                    icon={ClipboardList}
                    label="Fecha Real Siembra"
                    value={formatShortDate(selectedExtendido.fechaSiembraReal)}
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
                          className="text-warning border-warning/20 bg-warning/10 font-bold px-1.5 py-0 h-4 text-[9px]"
                        >
                          Hoy
                        </Badge>
                      ) : isTomorrow ? (
                        <Badge
                          variant="default"
                          className="bg-primary/10 text-primary border-primary/20 font-bold px-1.5 py-0 h-4 text-[9px]"
                        >
                          Mañana
                        </Badge>
                      ) : null
                    }
                    className="border-0"
                  />
                </div>

                <div className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl relative overflow-hidden group shadow-md">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                          <Thermometer className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 block leading-none mb-1">
                            Estadía Sugerida
                          </span>
                          <p className="text-xs font-bold text-foreground">
                            {selectedExtendido.diasEnCamara} Días
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/70 block leading-none mb-1">
                          Cámara Germinación
                        </span>

                        <p className="text-3xl font-black text-primary tracking-tighter">
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
            <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card/50">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 bg-muted/40 p-3 rounded-xl border border-border/40">
                  <div className="p-2 bg-background rounded-lg border border-border/60 shadow-sm">
                    <Activity className="h-4 w-4 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Nota de Extendido
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {selectedExtendido.extendido || "Sin observaciones."}
                    </p>
                  </div>
                </div>
                {selectedExtendido.detalle ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-primary/70">
                      <ClipboardList className="h-3 w-3" />{" "}
                      Detalle Técnico
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs leading-relaxed text-foreground/70 min-h-[60px]">
                      {selectedExtendido.detalle}
                    </div>
                  </div>
                ) : null}

                {selectedExtendido.baja ? (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-destructive leading-none mb-1">
                        Baja
                      </p>
                      <p className="text-xs font-bold text-destructive/80 leading-tight">
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
