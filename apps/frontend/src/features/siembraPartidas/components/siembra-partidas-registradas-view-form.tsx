import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiembraPartidaDto } from "@vivero/shared";
import {
  Package,
  Hash,
  Activity,
  FlaskConical,
  Calendar,
  Layers,
  Clock,
  ClipboardList,
  Sprout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate, utcToLocalTime } from "@/lib/date-utils";

interface SiembraPartidasRegistradasViewFormProps {
  selectedPartida: SiembraPartidaDto;
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
      </div>
    </div>
  </div>
);

export function SiembraPartidasRegistradasViewForm({
  selectedPartida,
}: SiembraPartidasRegistradasViewFormProps) {
  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* HEADER */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center justify-between bg-primary/5 p-2 rounded-xl border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Package className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                Partida #{selectedPartida.partidaId}
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {selectedPartida.mezclaNombre}
              </p>
            </div>
          </div>
        </div>

        {/* SPECS GRID */}
        <div className="grid grid-cols-2  gap-2">
          {[
            { label: "Año", value: selectedPartida.anio, icon: Hash },
            { label: "Índice", value: selectedPartida.indice, icon: Hash },
            {
              label: "Especie",
              value: selectedPartida.nombreEspecie,
              icon: Sprout,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border/60 p-1.5 rounded-lg flex items-center gap-1.5 shadow-sm overflow-hidden"
            >
                <div className="p-1 bg-muted rounded-md shrink-0">
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
        defaultValue="siembra"
        className="flex-1 flex flex-col overflow-hidden min-h-0"
      >
        <TabsList className="grid grid-cols-3 bg-muted/80 p-1 rounded-xl shrink-0 h-10 border border-border/40 gap-1 shadow-inner">
          <TabsTrigger
            value="siembra"
            className="rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <FlaskConical className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 hidden sm:inline-block" />
            Siembra
          </TabsTrigger>

          <TabsTrigger
            value="lote"
            className="rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <Layers className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 hidden sm:inline-block" />
            Lote
          </TabsTrigger>

          <TabsTrigger
            value="turno"
            className="rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg
                       data-[state=inactive]:text-muted-foreground"
          >
            <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 hidden sm:inline-block" />
            Turno
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-3 pb-2">
          {/* TAB: SIEMBRA */}
          <TabsContent
            value="siembra"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card/50">
              <CardContent className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-0.5">
                  {/* until we implement mezcla
                  <InfoRow
                    icon={FlaskConical}
                    label="Mezcla"
                    value={selectedPartida.mezclaNombre}
                    className="border-primary/5"
                  />
                  */}
                  <InfoRow
                    icon={Activity}
                    label="Método"
                    value={`${selectedPartida.metodoMaquina ? "MÁQUINA" : "MANUAL"}`}
                  />
                  <InfoRow
                    icon={Activity}
                    label="Prensado"
                    value={`${selectedPartida.prensadoSustrato}`}
                  />
                  <InfoRow
                    icon={Activity}
                    label="Profundidad"
                    value={`${selectedPartida.profundidadSemilla} cm`}
                  />
                  <InfoRow
                    icon={Package}
                    label="Tratamiento"
                    value={
                      selectedPartida.tratamientoNombre ||
                      selectedPartida.tratamientoSemilla ||
                      "-"
                    }
                  />
                  <InfoRow
                    icon={FlaskConical}
                    label="Sustrato"
                    value={
                      selectedPartida.sustratoNombre ||
                      selectedPartida.sustrato ||
                      "-"
                    }
                  />
                  <InfoRow
                    icon={Hash}
                    label="Cámara Germinación"
                    value={selectedPartida.cg}
                  />
                  <InfoRow
                    icon={Hash}
                    label="Cantidad Contenedor"
                    value={selectedPartida.cantidaNroCont}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Fecha Siembra"
                    value={formatShortDate(selectedPartida.fSiembra)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                  <InfoRow
                    icon={ClipboardList}
                    label="Detalle Extendido"
                    value={selectedPartida.detalleExtendido}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: LOTE */}
          <TabsContent
            value="lote"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card/50">
              <CardContent className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-0.5">
                  <InfoRow
                    icon={Layers}
                    label="Lote"
                    value={selectedPartida.lote}
                  />
                  <InfoRow
                    icon={Hash}
                    label="Año Lote"
                    value={selectedPartida.anoLote}
                  />
                  <InfoRow
                    icon={Hash}
                    label="Item"
                    value={selectedPartida.item}
                  />
                  <InfoRow
                    icon={Activity}
                    label="Semillas/gr"
                    value={selectedPartida.semxgr}
                  />
                  <InfoRow
                    icon={ClipboardList}
                    label="Ajuste"
                    value={selectedPartida.ajuste}
                  />
                  <InfoRow
                    icon={Package}
                    label="Cantidad (gr)"
                    value={selectedPartida.cantidadGrs}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: TURNO */}
          <TabsContent
            value="turno"
            className="mt-0 outline-none animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card/50">
              <CardContent className="p-3 space-y-2">
                <div className="grid grid-cols-1 gap-0.5">
                  <InfoRow
                    icon={ClipboardList}
                    label="Entidad"
                    value={selectedPartida.entityNombre}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Hora Inicio"
                    value={utcToLocalTime(selectedPartida.startTime)}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Hora Fin"
                    value={utcToLocalTime(selectedPartida.endTime)}
                  />
                  <InfoRow
                    icon={ClipboardList}
                    label="Encargado"
                    value={selectedPartida.createdByNombre}
                  />
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 py-1.5 border-b border-border/40">
    <div className="p-1.5 bg-primary/5 rounded-lg border border-primary/10">
                        <Package className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
      <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">
                          Empleados
                        </p>
                      </div>
                    </div>
                    {selectedPartida.empleados?.length ? (
                      <div className="ml-7">
                        <table className="w-full text-xs md:text-sm">
                          <thead>
                            <tr className="border-b border-border/40">
                              <th className="text-left py-1 font-bold text-[8px] md:text-[9px] uppercase tracking-widest text-muted-foreground/60">
                                Usuario
                              </th>
                              <th className="text-left py-1 font-bold text-[8px] md:text-[9px] uppercase tracking-widest text-muted-foreground/60">
                                Nombre
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPartida.empleados.map((e) => (
                              <tr
                                key={e.userId}
                                className="border-b border-border/20 last:border-0"
                              >
                                <td className="py-1.5 font-bold text-foreground">
                                  {e.username}
                                </td>
                                <td className="py-1.5 text-foreground">
                                  {[e.firstName, e.lastName]
                                    .filter(Boolean)
                                    .join(" ") || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="ml-7 py-2">
                        <p className="text-xs md:text-base font-bold text-foreground">
                          -
                        </p>
                      </div>
                    )}
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
