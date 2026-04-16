// src/features/extendidos/components/partidas-selector.tsx
"use client";

import { Search, Calendar, X, Filter, Hash, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCamaras } from "../hooks/useDepositos";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PartidasSelectorProps {
  onPartidaSelected?: (partidaId: string) => void;
  onFechaSelected?: (fecha: string, camaraId?: string) => void;
  onFechaRangeSelected?: (fechaInicio: string, fechaFin: string, camaraId?: string) => void;
  onClearFilters?: () => void;
}

// Fixed: Define ActionButton outside of render to comply with React lint rules
const ActionButton = ({ onClick, label, disabled, isFiltered }: { onClick: () => void, label: string, disabled?: boolean, isFiltered: boolean }) => {
  if (isFiltered) {
    return (
      <div className="h-12 md:h-14 flex items-center px-6 md:px-8 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/5 rounded-xl md:rounded-2xl border border-primary/20 animate-in fade-in zoom-in duration-300 shadow-inner">
        <Check className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4 stroke-[3px]" />
        Filtro Aplicado
      </div>
    );
  }

  return (
    <Button 
      onClick={onClick}
      disabled={disabled}
      className="h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl font-bold uppercase text-[10px] md:text-[12px] tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group transition-all"
    >
      {label}
      <ChevronRight className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
};

export function PartidasSelector({
  onPartidaSelected,
  onFechaSelected,
  onFechaRangeSelected,
  onClearFilters,
}: PartidasSelectorProps) {
  const { data: camaras = [] } = useCamaras();
  
  const [partidaId, setPartidaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [camaraId, setCamaraId] = useState<string>("all");
  
  const [isFiltered, setIsFiltered] = useState(false);

  const handleClear = useCallback(() => {
    setPartidaId("");
    setFecha("");
    setFechaInicio("");
    setFechaFin("");
    setCamaraId("all");
    setIsFiltered(false);
    onClearFilters?.();
  }, [onClearFilters]);

  const handlePartidaSearch = () => {
    if (partidaId) {
      onPartidaSelected?.(partidaId);
      setIsFiltered(true);
    }
  };

  const handleFechaSearch = () => {
    if (fecha) {
      onFechaSelected?.(fecha, camaraId === "all" ? undefined : camaraId);
      setIsFiltered(true);
    }
  };

  const handleRangeSearch = () => {
    if (fechaInicio && fechaFin) {
      onFechaRangeSelected?.(fechaInicio, fechaFin, camaraId === "all" ? undefined : camaraId);
      setIsFiltered(true);
    }
  };

  return (
    <div className="w-full p-1 bg-muted/30 border border-border/40 rounded-[1.5rem] md:rounded-[2rem] mb-6 shadow-sm transition-all overflow-hidden">
      <Tabs defaultValue="fecha" className="w-full">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-2 md:p-3 gap-3 md:gap-4">
          <div className="overflow-x-auto no-scrollbar scroll-smooth">
            <TabsList className="bg-background/50 border border-border/40 p-1 h-11 md:h-12 rounded-xl md:rounded-2xl flex-nowrap shrink-0 min-w-max">
              <TabsTrigger 
                value="fecha" 
                className="rounded-lg md:rounded-xl px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2" />
                Fecha
              </TabsTrigger>
              <TabsTrigger 
                value="rango" 
                className="rounded-lg md:rounded-xl px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Filter className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2" />
                Rango
              </TabsTrigger>
              <TabsTrigger 
                value="partida" 
                className="rounded-lg md:rounded-xl px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Hash className="h-3.5 w-3.5 mr-1.5 md:mr-2" />
                Partida
              </TabsTrigger>
            </TabsList>
          </div>

          <div className={cn(
            "transition-all duration-500 transform self-end lg:self-auto",
            isFiltered ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-4 pointer-events-none absolute lg:relative"
          )}>
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="h-10 md:h-11 rounded-lg md:rounded-2xl px-4 md:px-6 border-destructive text-destructive hover:bg-destructive hover:text-white font-bold uppercase text-[9px] md:text-[11px] tracking-widest shadow-md shadow-destructive/10 transition-all group"
            >
              <X className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Limpiar
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-6 pt-1 md:pt-2">
          {/* MODO: FECHA ÚNICA */}
          <TabsContent value="fecha" className="mt-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 md:gap-4">
              <div className="flex-1 space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Fecha</label>
                <Input
                  type="date"
                  value={fecha}
                  disabled={isFiltered}
                  aria-label="Seleccionar fecha única"
                  onChange={(e) => setFecha(e.target.value)}
                  className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-background border-border/60 focus:ring-primary/20 pl-4 disabled:opacity-50 text-sm md:text-base"
                />
              </div>
              <div className="flex-1 space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cámara</label>
                <Select value={camaraId} onValueChange={setCamaraId} disabled={isFiltered}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-background border-border/60 focus:ring-primary/20 text-left disabled:opacity-50 text-sm md:text-base" aria-label="Seleccionar cámara">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl md:rounded-2xl border-border/60">
                    <SelectItem value="all">Todas las cámaras</SelectItem>
                    {camaras.map((c) => (
                      <SelectItem key={c.codigo} value={c.codigo.toString()}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ActionButton onClick={handleFechaSearch} label="Filtrar" disabled={!fecha} isFiltered={isFiltered} />
            </div>
          </TabsContent>

          {/* MODO: RANGO */}
          <TabsContent value="rango" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-end gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2 lg:flex-1">
                <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Desde</label>
                <Input
                  type="date"
                  value={fechaInicio}
                  disabled={isFiltered}
                  aria-label="Fecha inicio rango"
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-background border-border/60 focus:ring-primary/20 disabled:opacity-50 text-sm md:text-base"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2 lg:flex-1">
                <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Hasta</label>
                <Input
                  type="date"
                  value={fechaFin}
                  disabled={isFiltered}
                  aria-label="Fecha fin rango"
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-background border-border/60 focus:ring-primary/20 disabled:opacity-50 text-sm md:text-base"
                />
              </div>
              <div className="sm:col-span-2 lg:flex-1 space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cámara</label>
                <Select value={camaraId} onValueChange={setCamaraId} disabled={isFiltered}>
                  <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-background border-border/60 focus:ring-primary/20 text-left disabled:opacity-50 text-sm md:text-base" aria-label="Seleccionar cámara para rango">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl md:rounded-2xl border-border/60">
                    <SelectItem value="all">Todas las cámaras</SelectItem>
                    {camaras.map((c) => (
                      <SelectItem key={c.codigo} value={c.codigo.toString()}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:flex-none">
                <ActionButton onClick={handleRangeSearch} label="Rango" disabled={!fechaInicio || !fechaFin} isFiltered={isFiltered} />
              </div>
            </div>
          </TabsContent>

          {/* MODO: Nº PARTIDA */}
          <TabsContent value="partida" className="mt-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 md:gap-4 max-w-2xl">
              <div className="flex-1 space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nº de Partida</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground/60" />
                  <Input
                    type="number"
                    value={partidaId}
                    disabled={isFiltered}
                    aria-label="Ingresar número de partida"
                    placeholder="Ej: 45210"
                    onChange={(e) => setPartidaId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isFiltered && handlePartidaSearch()}
                    className="h-12 md:h-14 pl-10 md:pl-12 rounded-xl md:rounded-2xl bg-background border-border/60 focus:ring-primary/20 text-sm md:text-base disabled:opacity-50"
                  />
                </div>
              </div>
              <ActionButton onClick={handlePartidaSearch} label="Buscar" disabled={!partidaId} isFiltered={isFiltered} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
