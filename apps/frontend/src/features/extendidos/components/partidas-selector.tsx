// src/features/extendidos/components/partidas-selector.tsx

import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCallback, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Entity } from "@vivero/shared";

interface PartidasSelectorProps {
  onPartidaSelected?: (partidaId: string) => void;
  onFechaSelected?: (fecha: string) => void;
  onFechaRangeSelected?: (fechaInicio: string, fechaFin: string) => void;
  onAnoSelected?: (ano: string) => void;
  onCamaraSelected?: (camara: string) => void;
}

export function PartidasSelector({
  onPartidaSelected,
  onFechaSelected,
  onFechaRangeSelected,
  onAnoSelected,
  onCamaraSelected,
}: PartidasSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedPartidaId, setSelectedPartidaId] = useState<string | null>(
    null,
  );
  const [selectedFecha, setSelectedFecha] = useState<string | null>(null);
  const [selectedFechaInicio, setSelectedFechaInicio] = useState<string | null>(
    null,
  );
  const [selectedFechaFin, setSelectedFechaFin] = useState<string | null>(null);
  const [selectedAno, setSelectedAno] = useState<string | null>(null);
  const [selectedCamara, setSelectedCamara] = useState<string | null>(null);

  const { data: fechas = [] } = useFechas();

  const handlePartidaChange = useCallback(
    (partidaId: string) => {
      setSelectedPartidaId(partidaId);
      onPartidaSelected && onPartidaSelected(partidaId);
      setOpen(false);
    },
    [onPartidaSelected],
  );

  const handleFechaChange = useCallback(
    (fecha: string) => {
      setSelectedFecha(fecha);
      onFechaSelected && onFechaSelected(fecha);
      setOpen(false);
    },
    [onFechaSelected],
  );

  const handleFechaRangeChange = useCallback(
    (fechaInicio: string, fechaFin: string) => {
      setSelectedFechaInicio(fechaInicio);
      setSelectedFechaFin(fechaFin);
      onFechaRangeSelected && onFechaRangeSelected(fechaInicio, fechaFin);
      setOpen(false);
    },
    [onFechaRangeSelected],
  );

  const handleAnoChange = useCallback(
    (ano: string) => {
      setSelectedAno(ano);
      onAnoSelected && onAnoSelected(ano);
      setOpen(false);
    },
    [onAnoSelected],
  );

  const handleCamaraChange = useCallback(
    (camara: string) => {
      setSelectedCamara(camara);
      onCamaraSelected && onCamaraSelected(camara);
      setOpen(false);
    },
    [onCamaraSelected],
  );

  return (
    <div className="px-6 py-6 bg-background">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="space-y-1.5 lg:flex-1">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
            <Check className="h-3.5 w-3.5" />
            Seleccionar Fecha
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full h-11 rounded-xl bg-muted/30 border-border/60 justify-between font-normal hover:bg-muted/50 focus:ring-primary/20 lg:max-w-md"
              >
                <span className="text-muted-foreground">
                  {selectedFecha ? (
                    <div className="flex items-center gap-2 truncate">
                      <Avatar className="h-6 w-6 border border-border/50">
                        <AvatarFallback className="bg-primary/5 text-[10px] font-bold text-primary">
                          {selectedFecha.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{selectedFecha}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Elige una fecha para empezar
                    </span>
                  )}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl overflow-hidden border-border/60"
              align="start"
            >
              <Command className="w-full">
                <CommandInput
                  placeholder="Buscar fecha..."
                  className="h-11 border-none focus:ring-0"
                />
                <CommandList className="max-h-[320px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                  <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    No se encontraron fechas.
                  </CommandEmpty>
                  <CommandGroup>
                    {fechas.map((fecha) => (
                      <CommandItem
                        key={fecha}
                        value={fecha}
                        onSelect={() => handleFechaChange(fecha)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg my-1 cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"
                      >
                        <span className="text-sm font-semibold truncate">
                          {fecha}
                        </span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 text-primary transition-opacity",
                            selectedFecha === fecha
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
