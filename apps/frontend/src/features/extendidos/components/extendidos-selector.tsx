// src/features/extendidos/components/extendidos-selector.tsx
"use client";

import { Calendar, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ExtendidosSelectorProps {
  onFechaSelected: (fecha: string) => void;
  onClearFilters?: () => void;
}

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

export function ExtendidosSelector({
  onFechaSelected,
  onClearFilters,
}: ExtendidosSelectorProps) {
  const [fecha, setFecha] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  const handleClear = useCallback(() => {
    setFecha("");
    setIsFiltered(false);
    onClearFilters?.();
  }, [onClearFilters]);

  const handleSearch = () => {
    if (fecha) {
      onFechaSelected(fecha);
      setIsFiltered(true);
    }
  };

  return (
    <div className="w-full p-1 bg-muted/30 border border-border/40 rounded-[1.5rem] md:rounded-[2rem] mb-6 shadow-sm transition-all overflow-hidden">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-2 md:p-3 gap-3 md:gap-4">
        <div className="flex items-center px-4 py-2 bg-background/50 border border-border/40 h-11 md:h-12 rounded-xl md:rounded-2xl shrink-0">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-foreground">
            Consulta de Extendidos
          </span>
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 md:gap-4 max-w-2xl">
          <div className="flex-1 space-y-1.5 md:space-y-2">
            <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Seleccionar Fecha</label>
            <Input
              type="date"
              value={fecha}
              disabled={isFiltered}
              onChange={(e) => setFecha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isFiltered && handleSearch()}
              className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-background border-border/60 focus:ring-primary/20 pl-4 disabled:opacity-50 text-sm md:text-base"
            />
          </div>
          <ActionButton 
            onClick={handleSearch} 
            label="Consultar" 
            disabled={!fecha} 
            isFiltered={isFiltered} 
          />
        </div>
      </div>
    </div>
  );
}
