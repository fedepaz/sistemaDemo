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
      "flex items-center gap-4 py-3 border-b border-border/40 last:border-0",
      className,
    )}
  >
    <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1.5">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-sm md:text-base font-bold truncate text-foreground">
          {value ?? "-"}
        </p>
        {badge}
      </div>
    </div>
  </div>
);

export function ExtendidosForm({ selectedExtendido }: ExtendidosFormProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month =
    today.getMonth() > 9 ? today.getMonth() + 1 : `0${today.getMonth() + 1}`;
  const day = today.getDate() > 9 ? today.getDate() : `0${today.getDate()}`;
  const isToday =
    selectedExtendido.fechaEgresoCamara === `${year}-${month}-${day}`;

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
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100vh-140px)] overflow-hidden">
      {/* 🚀 FIXED TOP SECTION: PRODUCTO (Always Visible) */}
      <div className="space-y-4 shrink-0">
        <div className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-tight leading-none text-foreground">
                {selectedExtendido.codigoEspecie}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded border border-border/40">
                  {selectedExtendido.nombreEspecie}
                </span>
                <span className="h-1 w-1 rounded-full bg-border" />
              </div>
            </div>
          </div>
          {selectedExtendido.stockInicial ? (
            <div className="text-right hidden sm:block pr-2">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter leading-none mb-1">
                Stock Inicial
              </p>
              <p className="text-2xl font-black text-primary leading-none">
                {selectedExtendido.stockInicial}
              </p>
            </div>
          ) : null}
        </div>

        {/* BASIC SPECS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              className="bg-background border border-border/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm"
            >
              <div className="p-1.5 bg-muted rounded-md shrink-0">
                <item.icon className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="text-xs truncate uppercase">{item.value}</p>
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
        <TabsList className="grid grid-cols-2 bg-muted/80 p-1.5 rounded-2xl shrink-0 h-14 border border-border/40 gap-2 shadow-inner">
          <TabsTrigger
            value="produccion"
            className="rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]
                       data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-background/50 data-[state=inactive]:hover:text-foreground"
          >
            <History className="h-3.5 w-3.5 mr-2 hidden sm:inline-block" />
            Producción
          </TabsTrigger>

          <TabsTrigger
            value="notas"
            className="rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]
                       data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-background/50 data-[state=inactive]:hover:text-foreground"
          >
            <ClipboardList className="h-3.5 w-3.5 mr-2 hidden sm:inline-block" />
            Notas
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-2">
          {/* TAB CONTENT: Same high-quality cards with refined padding */}
          <TabsContent
            value="produccion"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-[1.5rem] overflow-hidden bg-card/50">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-1">
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
                    value={selectedExtendido.fechaEgresoCamara}
                    badge={
                      isToday ? (
                        <Badge variant="destructive" className="animate-pulse">
                          Hoy
                        </Badge>
                      ) : null
                    }
                    className="border-0"
                  />
                </div>

                <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-[2rem] relative overflow-hidden group shadow-md transition-all hover:shadow-lg">
                  {/* Decorative element */}
                  <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                          <Thermometer className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block leading-none mb-2">
                            Tiempo de Estadía Sugerido
                          </span>
                          <p className="text-sm font-bold text-foreground">
                            {selectedExtendido.diasEnCamara} Días
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 block leading-none mb-1">
                          Cámara Germinación
                        </span>

                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-primary tracking-tighter">
                            # {selectedExtendido.codigoCamaraGerminacion}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 border border-primary/10">
                      <Activity className="h-10 w-10 text-primary/30 animate-pulse" />
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
            <Card className="border-border/60 shadow-sm rounded-[1.5rem] overflow-hidden bg-card/50">
              <CardContent className="p-6 space-y-8">
                <div className="mb-8 flex items-center gap-5 bg-muted/40 p-5 rounded-2xl border border-border/40">
                  <div className="p-3 bg-background rounded-xl border border-border/60 shadow-sm">
                    <Activity className="h-6 w-6 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Nota de Extendido
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                      {selectedExtendido.extendido ||
                        "No existen observaciones registradas."}
                    </p>
                  </div>
                </div>
                {selectedExtendido.detalle ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                      <ClipboardList className="h-4 w-4" /> Detalle Técnico
                      Operativo
                    </div>
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/40 text-sm leading-relaxed text-foreground/70 min-h-[80px]">
                      {selectedExtendido.detalle}
                    </div>
                  </div>
                ) : null}

                {selectedExtendido.baja ? (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-4 animate-in pulse duration-1000 infinite">
                    <AlertCircle className="h-7 w-7 text-destructive" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-destructive leading-none mb-1">
                        Registro de Baja
                      </p>
                      <p className="text-sm font-bold text-destructive/80 leading-tight">
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
