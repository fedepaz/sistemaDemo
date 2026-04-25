// src/features/extendidos/components/extendidos-selector.tsx
"use client";

import {
  Building2,
  RotateCcw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCamaras } from "../hooks/useDepositos";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ExtendidosSelectorProps {
  onCamaraChange?: (camaraId: string) => void;
  onClearFilters?: () => void;
}

export function ExtendidosSelector({
  onCamaraChange,
  onClearFilters,
}: ExtendidosSelectorProps) {
  const { data: camaras = [] } = useCamaras();
  const [camaraId, setCamaraId] = useState<string>("all");

  const handleCamaraChange = (value: string) => {
    setCamaraId(value);
    onCamaraChange?.(value);
  };

  const handleClear = useCallback(() => {
    setCamaraId("all");
    onClearFilters?.();
  }, [onClearFilters]);

  const hasActiveFilters = camaraId !== "all";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-full bg-muted/30 border border-border/40 rounded-2xl lg:rounded-full p-2 lg:p-1.5 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 px-2">
          
          {/* Label Section */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Filtrar Vista
            </span>
          </div>

          <div className="hidden lg:block w-px h-6 bg-border/60" />

          {/* Filter Section */}
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 group">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Select value={camaraId} onValueChange={handleCamaraChange}>
                <SelectTrigger className="h-10 lg:h-9 pl-9 rounded-xl lg:rounded-full bg-background/50 border-border/40 focus:ring-primary/20 text-xs font-bold uppercase tracking-tight">
                  <SelectValue placeholder="Seleccionar Cámara" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/60 shadow-2xl">
                  <SelectItem value="all" className="font-bold text-primary italic">
                    Todas las cámaras
                  </SelectItem>
                  {camaras.map((c) => (
                    <SelectItem key={c.codigo} value={c.codigo.toString()} className="font-medium">
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className={cn(
                    "h-9 w-9 rounded-full transition-all active:scale-95",
                    hasActiveFilters 
                      ? "opacity-100 bg-destructive/10 text-destructive hover:bg-destructive/20" 
                      : "opacity-0 pointer-events-none scale-90"
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Limpiar selección</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
