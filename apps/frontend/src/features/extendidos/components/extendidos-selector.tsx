"use client";
import {
  Search,
  Calendar,
  Filter,
  ChevronRight,
  Check,
  Building2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  onSourceChange?: (filters: {
    type: "enCamara" | "historico" | "all";
    value?: string;
  }) => void;
  onCamaraChange?: (camaraId: string) => void;
  onClearFilters?: () => void;
}

const ActionButton = ({
  onClick,
  label,
  disabled,
  isSourceApplied,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  isSourceApplied: boolean;
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isSourceApplied}
      className={cn(
        "h-12 lg:h-10 px-6 rounded-xl lg:rounded-full font-bold uppercase text-[10px] tracking-widest transition-all group shrink-0",
        isSourceApplied 
          ? "bg-primary/10 text-primary shadow-none cursor-default border-primary/20"
          : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
      )}
    >
      {isSourceApplied ? (
        <Check className="h-4 w-4 stroke-[3px]" />
      ) : (
        <>
          <span className="hidden xl:inline mr-2">{label}</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </Button>
  );
};

export function ExtendidosSelector({
  onSourceChange,
  onCamaraChange,
  onClearFilters,
}: ExtendidosSelectorProps) {
  const { data: camaras = [] } = useCamaras();

  const [fecha, setFecha] = useState("");
  const [camaraId, setCamaraId] = useState<string>("all");
  const [isSourceApplied, setIsSourceApplied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("enCamara");

  const handleCamaraChange = (value: string) => {
    setCamaraId(value);
    onCamaraChange?.(value);
  };

  const handleClear = useCallback(() => {
    setFecha("");
    setCamaraId("all");
    setIsSourceApplied(false);
    onClearFilters?.();
  }, [onClearFilters]);

  const handleSearch = (type: "enCamara" | "historico" | "all") => {
    onSourceChange?.({ type, value: fecha || undefined });
    setIsSourceApplied(true);
  };

  // Event handlers to reset applied state when inputs change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsSourceApplied(false);
  };

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFecha(e.target.value);
    setIsSourceApplied(false);
  };

  const hasActiveFilters = isSourceApplied || camaraId !== "all" || fecha;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-full bg-muted/30 border border-border/40 rounded-[1.5rem] lg:rounded-full p-2 lg:p-1.5 shadow-sm transition-all">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-2">
            
            {/* BLOQUE 1: MODOS (TABS) */}
            <div className="flex items-center justify-between lg:justify-start gap-2 px-1 lg:px-0">
              <TabsList className="bg-background/50 border border-border/40 p-1 h-11 lg:h-9 rounded-xl lg:rounded-full shrink-0">
                <TabsTrigger
                  value="enCamara"
                  className="rounded-lg lg:rounded-full px-3 lg:px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <Calendar className="h-3.5 w-3.5 lg:mr-1.5" />
                  <span className="hidden sm:inline">En Cámara</span>
                </TabsTrigger>
                <TabsTrigger
                  value="historico"
                  className="rounded-lg lg:rounded-full px-3 lg:px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <Filter className="h-3.5 w-3.5 lg:mr-1.5" />
                  <span className="hidden sm:inline">Historial</span>
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="rounded-lg lg:rounded-full px-3 lg:px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <Search className="h-3.5 w-3.5 lg:mr-1.5" />
                  <span className="hidden sm:inline">Todos</span>
                </TabsTrigger>
              </TabsList>

              {/* BOTÓN LIMPIAR (MOBILE - TINTED RED) */}
              <div className="lg:hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleClear}
                      className={cn(
                        "h-11 w-11 rounded-xl border-destructive/20 bg-destructive/5 text-destructive transition-all active:scale-95",
                        hasActiveFilters ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                      )}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Limpiar filtros</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="hidden lg:block w-px h-6 bg-border/60 mx-1" />

            {/* BLOQUE 2: INPUTS DE CONSULTA (DATA SOURCE) */}
            <div className="flex-1 px-1 lg:px-0">
              <TabsContent value="enCamara" className="mt-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="date"
                      value={fecha}
                      onChange={handleFechaChange}
                      className="h-12 lg:h-9 pl-9 rounded-xl lg:rounded-full bg-background/50 border-border/40 focus:ring-primary/20 text-xs font-medium"
                    />
                  </div>
                  <ActionButton onClick={() => handleSearch("enCamara")} label="Consultar" isSourceApplied={isSourceApplied} />
                </div>
              </TabsContent>

              <TabsContent value="historico" className="mt-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative group">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="date"
                      value={fecha}
                      onChange={handleFechaChange}
                      className="h-12 lg:h-9 pl-9 rounded-xl lg:rounded-full bg-background/50 border-border/40 focus:ring-primary/20 text-xs font-medium"
                    />
                  </div>
                  <ActionButton onClick={() => handleSearch("historico")} label="Filtrar" isSourceApplied={isSourceApplied} />
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-12 lg:h-9 flex items-center px-4 bg-background/30 rounded-xl lg:rounded-full border border-dashed border-border/40">
                    <span className="text-[10px] text-muted-foreground font-medium truncate">Registros históricos completos</span>
                  </div>
                  <ActionButton onClick={() => handleSearch("all")} label="Cargar" isSourceApplied={isSourceApplied} />
                </div>
              </TabsContent>
            </div>

            <div className="hidden lg:block w-px h-6 bg-border/60 mx-1" />

            {/* BLOQUE 3: FILTRO DE VISTA (FACET) */}
            <div className="flex items-center gap-2 lg:min-w-[180px] xl:min-w-[240px]">
              <div className="relative flex-1 group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <Select value={camaraId} onValueChange={handleCamaraChange}>
                  <SelectTrigger className="h-12 lg:h-9 pl-9 rounded-xl lg:rounded-full bg-background/50 border-border/40 focus:ring-primary/20 text-xs font-bold uppercase tracking-tight">
                    <SelectValue placeholder="Cámara" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/60 shadow-2xl">
                    <SelectItem value="all" className="font-bold text-primary italic">Todas las cámaras</SelectItem>
                    {camaras.map((c) => (
                      <SelectItem key={c.codigo} value={c.codigo.toString()} className="font-medium">
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* BOTÓN LIMPIAR (DESKTOP) */}
              <div className="hidden lg:block">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      className={cn(
                        "h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all",
                        hasActiveFilters ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                      )}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Resetear filtros y vista</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
