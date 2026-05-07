// src/features/extendidos/components/extendido-edit-form.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExtendidoDto } from "@vivero/shared";
import {
  Package,
  Calendar,
  AlertCircle,
  Hash,
  Activity,
  CheckCircle2,
  Hammer,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";

interface ExtendidosEditFormProps {
  selectedExtendido: ExtendidoDto;
}

export function ExtendidosEditForm({ selectedExtendido }: ExtendidosEditFormProps) {
  const [fechaExtendido, setFechaExtendido] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [bandejas, setBandejas] = useState(selectedExtendido.con.toString());

  const handleProcess = () => {
    console.log("Procesando extendido...", {
      partidaId: selectedExtendido.partidaId,
      fecha: fechaExtendido,
      bandejas: Number(bandejas),
    });
    alert("Funcionalidad en desarrollo: El proceso de extendido se integrará con el backend próximamente.");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-140px)] overflow-hidden">
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
              <p className="text-[8px] font-bold uppercase leading-none mb-0.5 text-muted-foreground">Índice</p>
              <p className="text-xs font-bold truncate uppercase">{selectedExtendido.indice}</p>
            </div>
          </div>
          <div className="bg-background border border-border/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase leading-none mb-0.5 text-muted-foreground">Cámara</p>
              <p className="text-xs font-bold truncate uppercase">#{selectedExtendido.codigoCamaraGerminacion}</p>
            </div>
          </div>
          <div className="bg-background border border-border/60 p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase leading-none mb-0.5 text-muted-foreground">Días</p>
              <p className="text-xs font-bold truncate uppercase">{selectedExtendido.diasEnCamara}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🛠️ PROCESS FORM */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
        <Card className="border-primary/20 shadow-md rounded-[1.5rem] overflow-hidden bg-card/50">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-2">
              <Hammer className="h-4 w-4" /> Formulario de Egreso
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fecha" className="text-xs font-bold text-foreground/70 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Fecha de Extendido
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fechaExtendido}
                  onChange={(e) => setFechaExtendido(e.target.value)}
                  className="rounded-xl border-border/60 focus:ring-primary/20 font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Fecha en la que las bandejas saldrán de la cámara.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bandejas" className="text-xs font-bold text-foreground/70 flex items-center gap-2">
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
            </div>

            <div className="p-4 bg-muted/40 rounded-2xl border border-border/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Egreso Sugerido:</span>
                <span className="font-bold">{selectedExtendido.fechaEgresoCamara}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Estado Post-Egreso:</span>
                <Badge variant="secondary" className="text-[8px] h-4 uppercase font-black">Extendido</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ⚠️ IN DEVELOPMENT ALERT */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 leading-none">
              Modo Desarrollo
            </p>
            <p className="text-[11px] font-medium text-amber-700/80 leading-snug">
              El guardado de esta operación estará disponible cuando se finalice el endpoint de la API. Por ahora, solo puedes simular el proceso.
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 gap-3 pt-2">
          <Button 
            onClick={handleProcess}
            className="h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Confirmar Extendido
          </Button>
          <p className="text-[9px] text-center text-muted-foreground font-medium flex items-center justify-center gap-1.5">
            Esta acción marcará la partida como completada en cámara <ChevronRight className="h-3 w-3" />
          </p>
        </div>
      </div>
    </div>
  );
}
