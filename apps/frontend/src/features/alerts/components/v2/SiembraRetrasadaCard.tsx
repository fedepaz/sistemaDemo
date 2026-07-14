// src/features/alerts/components/v2/SiembraRetrasadaCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, MessageSquare, Send } from "lucide-react";
import type { SiembraRetrasadaDto } from "@vivero/shared";

interface SiembraRetrasadaCardProps {
  alerta: SiembraRetrasadaDto;
}

export function SiembraRetrasadaCard({ alerta }: SiembraRetrasadaCardProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<string[]>([]);

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
              <Badge variant="outline" className="text-[10px] border-warning/40 text-warning bg-warning/10">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Siembra retrasada
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono font-bold">{alerta.codigoEspecie}</span>
              {" — "}
              {alerta.nombreEspecie}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Fecha sugerida</p>
            <p className="font-mono font-bold">{alerta.fechaSugeridaSiembra}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Contenedor</p>
            <p className="font-semibold">{alerta.contenedor}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cantidad</p>
            <p className="font-semibold">{alerta.con}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  Sembrada
                </Button>
              </TooltipTrigger>
              <TooltipContent>Marcar como sembrada</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="destructive" className="flex-1 text-xs">
                  Anular
                </Button>
              </TooltipTrigger>
              <TooltipContent>Anular esta partida</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Agregar comentario..."
            className="flex-1 text-xs border border-border rounded px-2 py-1 bg-background"
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
      </CardContent>
    </Card>
  );
}
