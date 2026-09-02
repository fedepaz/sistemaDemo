// src/features/siembra/components/tratamientoSearch.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { TratamientoDto } from "@vivero/shared";
import { siembraQueryKeys } from "@/lib/queryKeys";
import { siembraService } from "../api/siembraService";

interface TratamientoSearchProps {
  value: string;
  onChange: (codigo: string) => void;
}

function matchesSearch(tratamiento: TratamientoDto, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    tratamiento.nombre.toLowerCase().includes(q) ||
    tratamiento.codigo.includes(q)
  );
}

export function TratamientoSearch({
  value,
  onChange,
}: TratamientoSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: allTratamientos = [], isLoading } = useQuery<TratamientoDto[]>({
    queryKey: siembraQueryKeys.tratamientos(),
    queryFn: () => siembraService.fetchTratamientos(),
    enabled: showResults,
  });

  const selectedTratamiento = allTratamientos.find((t) => t.codigo === value);
  const filteredTratamientos = allTratamientos.filter(
    (tratamiento) => matchesSearch(tratamiento, searchQuery) && value !== tratamiento.codigo,
  );

  function handleSearch() {
    setShowResults(true);
  }

  function handleCloseSearch() {
    setShowResults(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tratamiento..."
            className="pl-9 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-9 text-sm"
          onClick={handleSearch}
        >
          Buscar
        </Button>
        {showResults ? (
          <Button
            type="button"
            variant="secondary"
            className="h-9 text-sm"
            onClick={handleCloseSearch}
          >
            <X />
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {showResults && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tratamientos disponibles
            </span>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredTratamientos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {allTratamientos.length === 0
                  ? "No se encontraron tratamientos."
                  : "No hay tratamientos disponibles."}
              </p>
            ) : (
              <ScrollArea className="h-48">
                <div className="flex flex-col gap-1">
                  {filteredTratamientos.map((tratamiento) => (
                    <button
                      key={tratamiento.codigo}
                      type="button"
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-pointer"
                      onClick={() => onChange(tratamiento.codigo)}
                    >
                      <span className="font-medium">{tratamiento.nombre}</span>
                      <span className="text-muted-foreground text-xs">
                        {tratamiento.codigo}
                      </span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {selectedTratamiento && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Seleccionado
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                key={selectedTratamiento.codigo}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {selectedTratamiento.nombre}
                <button
                  type="button"
                  className="ml-1 rounded-full p-0.5 hover:bg-muted cursor-pointer"
                  onClick={() => onChange("")}
                  aria-label={`Eliminar ${selectedTratamiento.nombre}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
