"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { LegacySustratoDto } from "@vivero/shared";
import { programacionSiembraQueryKeys } from "@/lib/queryKeys";
import { programacionSiembraService } from "../api/programacionSiembraService";

interface SustratoSearchProps {
  value: string;
  onChange: (codigo: string) => void;
}

function matchesSearch(sustrato: LegacySustratoDto, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    sustrato.nombre.toLowerCase().includes(q) ||
    sustrato.codigo.includes(q)
  );
}

export function SustratoSearch({
  value,
  onChange,
}: SustratoSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: allSustratos = [], isLoading } = useQuery<LegacySustratoDto[]>({
    queryKey: programacionSiembraQueryKeys.legacySustratos(),
    queryFn: () => programacionSiembraService.fetchLegacySustratos(),
    enabled: showResults,
  });

  const selectedSustrato = allSustratos.find((s) => s.codigo === value);
  const filteredSustratos = allSustratos.filter(
    (sustrato) => matchesSearch(sustrato, searchQuery) && value !== sustrato.codigo,
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
    <div className="flex flex-col gap-2 md:gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sustrato..."
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

      <div className="flex flex-col gap-2">
        {showResults && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sustratos disponibles
            </span>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredSustratos.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {allSustratos.length === 0
                  ? "No se encontraron sustratos."
                  : "No hay sustratos disponibles."}
              </p>
            ) : (
              <ScrollArea className="h-48">
                <div className="flex flex-col gap-1">
                  {filteredSustratos.map((sustrato) => (
                    <button
                      key={sustrato.codigo}
                      type="button"
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-pointer"
                      onClick={() => {
                        onChange(sustrato.codigo);
                        setShowResults(false);
                      }}
                    >
                      <span className="font-medium">{sustrato.nombre}</span>
                      <span className="text-muted-foreground text-xs">
                        {sustrato.codigo}
                      </span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {selectedSustrato && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Seleccionado
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                key={selectedSustrato.codigo}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {selectedSustrato.nombre}
                <button
                  type="button"
                  className="ml-1 rounded-full p-0.5 hover:bg-muted cursor-pointer"
                  onClick={() => onChange("")}
                  aria-label={`Eliminar ${selectedSustrato.nombre}`}
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
