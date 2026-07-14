// src/features/alerts/components/v2/FaltantePlantasCard.tsx
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
import { Sprout, Send, ChevronDown, ChevronUp } from "lucide-react";
import type { FaltantePlantasDto } from "@vivero/shared";

interface FaltantePlantasCardProps {
  alerta: FaltantePlantasDto;
  onDismiss: () => void;
}

export function FaltantePlantasCard({
  alerta,
  onDismiss,
}: FaltantePlantasCardProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [showSubpartidas, setShowSubpartidas] = useState(false);

  const deficit = alerta.solicitadas - alerta.germinadasTotales;
  const percentage =
    alerta.solicitadas > 0
      ? Math.round((alerta.germinadasTotales / alerta.solicitadas) * 100)
      : 0;

  const handleAddComment = () => {
    if (commentText.trim()) {
      setComments((prev) => [...prev, commentText.trim()]);
      setCommentText("");
    }
  };

  return (
    <Card className="border border-warning/20 bg-warning/5 shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-foreground/80 tracking-tight">
                #{alerta.partidaId}
                {alerta.indice !== 0 && `/ ${alerta.indice}`}
              </span>
              <Badge variant="destructive" className="text-[10px]">
                <Sprout className="h-3 w-3 mr-1" />
                Faltante: {deficit}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono font-bold">{alerta.codigoEspecie}</span>
              {" — "}
              {alerta.nombreEspecie}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <p className="text-muted-foreground">Solicitadas</p>
            <p className="text-lg font-black">{alerta.solicitadas}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Germinadas</p>
            <p className="text-lg font-black">{alerta.germinadasTotales}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">% Logrado</p>
            <p className="text-lg font-black">{percentage}%</p>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              percentage >= 80 ? "bg-success" : percentage >= 50 ? "bg-warning" : "bg-destructive"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Invernadero</p>
            <p className="font-semibold">{alerta.invernadero}</p>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowSubpartidas(!showSubpartidas)}
            className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground cursor-pointer"
          >
            {showSubpartidas ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Detalle subpartidas
          </button>
          {showSubpartidas && (
            <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
              <p>Subpartidas disponibles para inspección</p>
            </div>
          )}
        </div>

        {comments.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Comentarios
            </p>
            {comments.map((c, i) => (
              <p key={i} className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                {c}
              </p>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Agregar comentario..."
            aria-label="Agregar comentario a faltante de plantas"
            className="flex-1 h-7 text-xs"
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Enviar comentario</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="destructive" className="w-full text-xs" onClick={onDismiss}>
                Intervenir y Resolver
              </Button>
            </TooltipTrigger>
            <TooltipContent>MARCAR FALTANTE COMO RESUELTO</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
