// src/features/extendidos/components/extendido-edit-form.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExtendidoDto } from "@vivero/shared";
import {
  Package,
  Calendar,
  Hash,
  Activity,
  Hammer,
  Clock,
  MapPin,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { format } from "date-fns";
import { useDepositos } from "../hooks/useDepositos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AsignarUbicacionDto } from "@vivero/shared";
import { UseMutateFunction } from "@tanstack/react-query";

interface ExtendidosEditFormProps {
  selectedExtendido: ExtendidoDto;
  mutate: UseMutateFunction<void, Error, AsignarUbicacionDto>;
  onSuccess?: () => void;
}

export function ExtendidosEditForm({
  selectedExtendido,
  mutate,
  onSuccess,
}: ExtendidosEditFormProps) {
  const [fechaExtendido, setFechaExtendido] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [bandejas, setBandejas] = useState(selectedExtendido.con.toString());
  const [ubicacionId, setUbicacionId] = useState<string>("");
  const [nota, setNota] = useState<string>("");

  const { data: depositos } = useDepositos();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ubicacionId) return;

    mutate(
      {
        partida: selectedExtendido.partidaId,
        ano: selectedExtendido.anio,
        indice: selectedExtendido.indice,
        ubicacion: Number(ubicacionId),
        stock_ini: Number(bandejas),
        extendido: "S",
        edita: "S",
        baja: Number(bandejas),
        detalle:
          nota ||
          `Salida de cámara ${selectedExtendido.codigoCamaraGerminacion} - Extendido a ${depositos?.find((d) => d.codigo === Number(ubicacionId))?.nombre || ubicacionId}`,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  return (
    <form
      id="extendido-form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* 🚀 PRODUCT HEADER (Context) */}
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
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                {selectedExtendido.nombreEspecie}
              </p>
            </div>
          </div>
          <div className="text-right pr-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter leading-none mb-1">
              Bandejas Totales
            </p>
            <p className="text-2xl font-black text-primary leading-none">
              {selectedExtendido.con}
            </p>
          </div>
        </div>

        {/* BATCH INFO GRID */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background border border-border/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase leading-none mb-0.5 text-muted-foreground">
                Índice
              </p>
              <p className="text-xs font-bold truncate uppercase">
                {selectedExtendido.indice}
              </p>
            </div>
          </div>
          <div className="bg-background border border-border/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase leading-none mb-0.5 text-muted-foreground">
                Cámara
              </p>
              <p className="text-xs font-bold truncate uppercase">
                #{selectedExtendido.codigoCamaraGerminacion}
              </p>
            </div>
          </div>
          <div className="bg-background border border-border/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase leading-none mb-0.5 text-muted-foreground">
                Días
              </p>
              <p className="text-xs font-bold truncate uppercase">
                {selectedExtendido.diasEnCamara}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🛠️ PROCESS FORM */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4 px-1">
        <Card className="border-primary/20 shadow-md rounded-[1.5rem] overflow-hidden bg-card/50">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
              <Hammer className="h-4 w-4" /> Formulario de Egreso
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="fecha"
                  className="text-xs font-bold text-foreground/70 flex items-center gap-2"
                >
                  <Calendar className="h-3.5 w-3.5" /> Fecha de Extendido
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fechaExtendido}
                  onChange={(e) => setFechaExtendido(e.target.value)}
                  className="rounded-xl border-border/60 focus:ring-primary/20 font-mono"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="ubicacion"
                  className="text-xs font-bold text-foreground/70 flex items-center gap-2"
                >
                  <MapPin className="h-3.5 w-3.5" /> Ubicación de Destino
                </Label>
                <Select
                  value={ubicacionId}
                  onValueChange={setUbicacionId}
                  required
                >
                  <SelectTrigger className="rounded-xl border-border/60 focus:ring-primary/20 h-12">
                    <SelectValue placeholder="Seleccione una ubicación" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={4}
                    className="rounded-xl border-border/60 shadow-xl max-h-[200px]"
                  >
                    {depositos?.map((dep) => (
                      <SelectItem
                        key={dep.codigo}
                        value={dep.codigo.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">{dep.nombre}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {dep.camara === "S" ? "Cámara" : "Invernadero"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="bandejas"
                  className="text-xs font-bold text-foreground/70 flex items-center gap-2"
                >
                  <Activity className="h-3.5 w-3.5" /> Bandejas a Procesar
                </Label>
                <div className="relative">
                  <Input
                    id="bandejas"
                    type="number"
                    value={bandejas}
                    onChange={(e) => setBandejas(e.target.value)}
                    className="rounded-xl border-border/60 focus:ring-primary/20 pl-4 pr-12 font-black text-lg h-12"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">
                    Unid.
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="nota"
                  className="text-xs font-bold text-foreground/70 flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5" /> Nota / Observaciones
                </Label>
                <Textarea
                  id="nota"
                  placeholder="Agregar una nota opcional..."
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  className="rounded-xl border-border/60 focus:ring-primary/20 min-h-[80px] resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/40 rounded-2xl border border-border/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  Egreso Sugerido:
                </span>
                <span className="font-bold">
                  {selectedExtendido.fechaEgresoCamara}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  Estado Post-Egreso:
                </span>
                <Badge
                  variant="secondary"
                  className="text-[8px] h-4 uppercase font-black"
                >
                  Extendido
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
