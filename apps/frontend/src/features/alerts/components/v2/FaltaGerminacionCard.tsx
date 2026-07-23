// src/features/alerts/components/v2/FaltaGerminacionCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FlaskConical, Plus, Minus } from "lucide-react";
import type { FaltaGerminacionDto } from "@vivero/shared";

interface FaltaGerminacionCardProps {
  alerta: FaltaGerminacionDto;
  onDismiss: () => void;
}

interface Subpartida {
  id: number;
  germinadas: number;
}

export function FaltaGerminacionCard({ alerta, onDismiss }: FaltaGerminacionCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [solicitadas, setSolicitadas] = useState(0);
  const [subpartidas, setSubpartidas] = useState<Subpartida[]>([]);

  const totalGerminadas = subpartidas.reduce((sum, s) => sum + s.germinadas, 0);
  const shortage = solicitadas > 0 && totalGerminadas < solicitadas;

  const addSubpartida = () => {
    setSubpartidas((prev) => [...prev, { id: Date.now(), germinadas: 0 }]);
  };

  const removeSubpartida = (id: number) => {
    setSubpartidas((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSubpartida = (id: number, value: number) => {
    setSubpartidas((prev) =>
      prev.map((s) => (s.id === id ? { ...s, germinadas: value } : s)),
    );
  };

  const handleSubmit = () => {
    onDismiss();
  };

  return (
    <Card className="border border-info/20 bg-info/5 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-foreground/80 tracking-tight">
                #{alerta.partidaId}
                {alerta.indice !== 0 && `/ ${alerta.indice}`}
              </span>
              <Badge variant="outline" className="text-[10px] border-info/40 text-info bg-info/10">
                <FlaskConical className="h-3 w-3 mr-1" />
                Esperando recuento
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono font-bold">{alerta.codigoEspecie}</span>
              {" — "}
              {alerta.nombreEspecie}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Contenedor</p>
            <p className="font-semibold">{alerta.contenedor}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Invernadero</p>
            <p className="font-semibold">{alerta.invernadero}</p>
          </div>
        </div>

        {!showForm ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => setShowForm(true)}
                >
                  <FlaskConical className="h-3 w-3 mr-1" />
                  Cargar Recuento de Germinación
                </Button>
              </TooltipTrigger>
              <TooltipContent>Registrar recuento de germinación</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <label htmlFor="solicitadas" className="text-[10px] font-bold text-muted-foreground uppercase shrink-0">
                Solicitadas
              </label>
              <Input
                id="solicitadas"
                type="number"
                value={solicitadas || ""}
                onChange={(e) => setSolicitadas(Number(e.target.value))}
                className="w-20 h-7 text-xs"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Subpartidas
                </p>
                <Button size="sm" variant="ghost" onClick={addSubpartida} className="h-6 px-2 cursor-pointer" aria-label="Agregar subpartida">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {subpartidas.map((sp) => (
                <div key={sp.id} className="flex items-center gap-2">
                  <Input
                    id={`subpartida-${sp.id}`}
                    type="number"
                    value={sp.germinadas || ""}
                    onChange={(e) => updateSubpartida(sp.id, Number(e.target.value))}
                    className="flex-1 h-7 text-xs"
                    placeholder="Germinadas"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSubpartida(sp.id)}
                    className="h-6 px-2 text-destructive"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {shortage && (
              <p className="text-[10px] font-bold text-destructive">
                Total germinadas ({totalGerminadas}) menor a solicitadas ({solicitadas})
              </p>
            )}

            <p className="text-[10px] text-muted-foreground">
              Total germinadas: <span className="font-bold">{totalGerminadas}</span>
            </p>

            <Button size="sm" variant="outline" className="w-full text-xs" onClick={handleSubmit}>
              Registrar Recuento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
